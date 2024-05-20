// router: defining "/dashboard" route handling

const express = require("express");
const request = require("request");
import {
  deleteTypesForProduction,
  deleteTypesForNgl,
  baseProdUrl,
  baseNGLUrl,
} from "./globals/constant";
import {
  ResourceCountProps,
  ResourceCount,
  ProductionDetailsProps,
  ProductionDetails,
} from "./interfaces/global";
import { CompleteProductionAPIData } from "./interfaces/production";
import { CompleteNglAPIData } from "./interfaces/ngl";

const router = express.Router();

/* ---------- Production/ NGL ---------- */

/**
 * Function handles intial response from Alaska Production or NGL API:
 * cleans data and formatting into a managable data structure.
 *
 * @param {string} str - API response.
 * @param {string[]} deleteTypes - Keys to be deleted.
 *
 * @returns {T} - Formatted data.
 */
const cleanResponse = <T>(str: string, deleteTypes: string[]): T => {
  // turn string into json
  let jsonResponse = JSON.parse(str);
  let data = JSON.parse(jsonResponse["d"]);

  // remove unnecessary data
  for (let i = 0; i < data["data"].length; i++) {
    for (let type of deleteTypes) {
      delete data["data"][i][type];
    }
  }

  // get totals
  let totals = data["totals"];
  delete totals["daysTotal"];

  return { results: data["data"], totals: totals } as T;
};

/**
 * Function controls the gathering of data from Alaska Production or NGL API.
 * First, get request to get total entires. Second, get request to get
 * all total entries with 1 request.
 *
 * @param {string} targetMonth - The date range of data.
 * @param {string} dateStartName - The key name for start date.
 * @param {string} dateEndName - The key name for end date.
 * @param {number} colNum - The number of total columns.
 * @param {string} url - The API Endpoint.
 * @param {string[]} deleteTypes - Keys to be deleted passed to cleanResposne Function.
 *
 * @returns {T} - Formatted data.
 */
const getDataByMonth = async <T>(
  targetMonth: string,
  dateStartName: string,
  dateEndName: string,
  colNum: number,
  url: string,
  deleteTypes: string[]
): Promise<T> => {
  let payload = {
    draw: 1,
    start: 0,
    length: 1,
    sortColumn: colNum,
    sortDirection: "desc",
  };
  payload[dateStartName] = targetMonth;
  payload[dateEndName] = targetMonth;

  // first request to get the total entries of month and total amount of oil, gas, water, and ngl
  const resp1 = await new Promise((resolve, reject) => {
    request(
      {
        method: "GET",
        uri:
          url +
          "?requestParameters=" +
          encodeURIComponent(JSON.stringify(payload)),
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      },
      function (err, res, body) {
        if (res.statusCode == 200) {
          // update payload length
          let jsonResponse = JSON.parse(body);
          let data = JSON.parse(jsonResponse["d"]);
          payload["length"] = data["recordsFiltered"];
          resolve("dummy"); // dummy return
        } else {
          reject({ message: err });
        }
      }
    );
  });

  // second request to get all entries
  const resp2 = await new Promise((resolve, reject) => {
    request(
      {
        method: "GET",
        uri:
          url +
          "?requestParameters=" +
          encodeURIComponent(JSON.stringify(payload)),
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      },
      function (err, res, body) {
        if (res.statusCode == 200) {
          resolve(cleanResponse<T>(body, deleteTypes));
        } else {
          reject({ message: err });
        }
      }
    );
  });

  return resp2 as T;
};

/* ---------- Parse Data to Create Meaning ---------- */

/**
 * Function sets total of all resources count and units.
 *
 * @param {ResourceCountProps} data - Data of total Oil, Gas, Water, and Natural Gas Liquid.
 *
 * @returns {ResourceCount} - Formatted data.
 */
const resourceCount = (data: ResourceCountProps) => {
  const resources: ResourceCount = {
    oilTotal: {
      count: Number(data["oilTotal"]).toLocaleString(),
      units: "BBL",
    },
    gasTotal: {
      count: Number(data["gasTotal"]).toLocaleString(),
      units: "MCF",
    },
    waterTotal: {
      count: Number(data["waterTotal"]).toLocaleString(),
      units: "BBL",
    },
    nglTotal: {
      count: Number(data["nglTotal"]).toLocaleString(),
      units: "BBL",
    },
  };
  return resources;
};

/**
 * Function counts each Operator production details, each Well
 * production(oil, gas, water) details, and each Facility(ngl) product details.
 *
 * @param {ProductionDetailsProps} data - Data of total Oil, Gas, Water, and Natural Gas Liquid.
 *
 * @returns {ProductionDetails} - Formatted data.
 */
const productionDetails = (data: ProductionDetailsProps) => {
  let totalOfOperators = {};
  let totalsByWell = {};
  let totalsByFacility = {};

  // original data is stored as string, add as a number
  data["prodData"].forEach((elem, index, arr) => {
    if (totalOfOperators.hasOwnProperty(elem["OperatorName"])) {
      totalOfOperators[elem["OperatorName"]]["Oil"] += Number(
        elem["Oil"].replace(/,/g, "")
      );
      totalOfOperators[elem["OperatorName"]]["Gas"] += Number(
        elem["Gas"].replace(/,/g, "")
      );
      totalOfOperators[elem["OperatorName"]]["Water"] += Number(
        elem["Water"].replace(/,/g, "")
      );
    } else {
      totalOfOperators[elem["OperatorName"]] = {};
      totalOfOperators[elem["OperatorName"]]["Oil"] = Number(
        elem["Oil"].replace(/,/g, "")
      );
      totalOfOperators[elem["OperatorName"]]["Gas"] = Number(
        elem["Gas"].replace(/,/g, "")
      );
      totalOfOperators[elem["OperatorName"]]["Water"] = Number(
        elem["Water"].replace(/,/g, "")
      );
    }

    if (totalsByWell.hasOwnProperty(elem["WellName"])) {
      totalsByWell[elem["WellName"]]["Oil"]["count"] += Number(
        elem["Oil"].replace(/,/g, "")
      );
      totalsByWell[elem["WellName"]]["Gas"]["count"] += Number(
        elem["Gas"].replace(/,/g, "")
      );
      totalsByWell[elem["WellName"]]["Water"]["count"] += Number(
        elem["Water"].replace(/,/g, "")
      );
    } else {
      totalsByWell[elem["WellName"]] = {};
      totalsByWell[elem["WellName"]]["OperatorName"] = elem["OperatorName"];
      totalsByWell[elem["WellName"]]["Oil"] = {};
      totalsByWell[elem["WellName"]]["Oil"]["count"] = Number(
        elem["Oil"].replace(/,/g, "")
      );
      totalsByWell[elem["WellName"]]["Oil"]["units"] = "BBL";
      totalsByWell[elem["WellName"]]["Gas"] = {};
      totalsByWell[elem["WellName"]]["Gas"]["count"] = Number(
        elem["Gas"].replace(/,/g, "")
      );
      totalsByWell[elem["WellName"]]["Gas"]["units"] = "BBL";
      totalsByWell[elem["WellName"]]["Water"] = {};
      totalsByWell[elem["WellName"]]["Water"]["count"] = Number(
        elem["Water"].replace(/,/g, "")
      );
      totalsByWell[elem["WellName"]]["Water"]["units"] = "BBL";
    }
  });

  data["nglData"].forEach((elem, index, arr) => {
    if (
      totalOfOperators.hasOwnProperty(elem["Operator"]) &&
      totalOfOperators[elem["Operator"]].hasOwnProperty("NGL")
    ) {
      totalOfOperators[elem["Operator"]]["NGL"] =
        totalOfOperators[elem["Operator"]]["NGL"] +
        Number(elem["NglProduction"].replace(/,/g, ""));
    } else if (
      totalOfOperators.hasOwnProperty(elem["Operator"]) &&
      !totalOfOperators[elem["Operator"]].hasOwnProperty("NGL")
    ) {
      totalOfOperators[elem["Operator"]]["NGL"] = Number(
        elem["NglProduction"].replace(/,/g, "")
      );
    } else {
      totalOfOperators[elem["Operator"]] = {};
      totalOfOperators[elem["Operator"]]["Oil"] = 0;
      totalOfOperators[elem["Operator"]]["Gas"] = 0;
      totalOfOperators[elem["Operator"]]["Water"] = 0;
      totalOfOperators[elem["Operator"]]["NGL"] = Number(
        elem["NglProduction"].replace(/,/g, "")
      );
    }

    if (totalsByFacility.hasOwnProperty(elem["FacilityName"])) {
      totalsByFacility[elem["FacilityName"]]["NGL"]["count"] += Number(
        elem["NglProduction"].replace(/,/g, "")
      );
    } else {
      totalsByFacility[elem["FacilityName"]] = {};
      totalsByFacility[elem["FacilityName"]]["OperatorName"] = elem["Operator"];
      totalsByFacility[elem["FacilityName"]]["NGL"] = {};
      totalsByFacility[elem["FacilityName"]]["NGL"]["count"] = Number(
        elem["NglProduction"].replace(/,/g, "")
      );
      totalsByFacility[elem["FacilityName"]]["NGL"]["units"] = "BBL";
    }
  });

  // convert numbers to strings
  for (var name in totalOfOperators) {
    for (var key in totalOfOperators[name]) {
      totalOfOperators[name][key] =
        totalOfOperators[name][key].toLocaleString();
    }
  }

  for (var name in totalsByWell) {
    totalsByWell[name]["Oil"]["count"] =
      totalsByWell[name]["Oil"]["count"].toLocaleString();
    totalsByWell[name]["Gas"]["count"] =
      totalsByWell[name]["Gas"]["count"].toLocaleString();
    totalsByWell[name]["Water"]["count"] =
      totalsByWell[name]["Water"]["count"].toLocaleString();
  }

  for (var name in totalsByFacility) {
    totalsByFacility[name]["NGL"]["count"] =
      totalsByFacility[name]["NGL"]["count"].toLocaleString();
  }

  return {
    totalOfOperators: totalOfOperators,
    totalsByWell: totalsByWell,
    totalsByFacility: totalsByFacility,
  } as ProductionDetails;
};

/* ---------- Routing ---------- */

// redirect to most available data dashboard date
router.get("/", async (req, res) => {
  // find the newest date of available data
  const newestDate = await new Promise((resolve, reject) => {
    request(
      {
        method: "GET",
        uri:
          baseProdUrl +
          "?requestParameters=" +
          encodeURIComponent(
            JSON.stringify({
              draw: 1,
              start: 0,
              length: 1,
              sortColumn: 9,
              sortDirection: "desc",
            })
          ),
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      },
      function (err, res, body) {
        if (res.statusCode == 200) {
          // parse through API response to get newest report date
          let jsonResponse = JSON.parse(body);
          let data = JSON.parse(jsonResponse["d"]);
          resolve(data["data"][0]["ReportDate"].replace("/", "-"));
        } else {
          reject({ message: err });
        }
      }
    );
  });
  res.redirect(`/dashboard/${newestDate}`);
});

// controller to get all data
router.get("/:date", async (req, res) => {
  const prodData: CompleteProductionAPIData =
    await getDataByMonth<CompleteProductionAPIData>(
      req.date,
      "productionStartDate",
      "productionEndDate",
      9,
      baseProdUrl,
      deleteTypesForProduction
    );
  const nglData: CompleteNglAPIData = await getDataByMonth<CompleteNglAPIData>(
    req.date,
    "startDate",
    "endDate",
    6,
    baseNGLUrl,
    deleteTypesForNgl
  );
  const allData = { prodData: prodData, nglData: nglData };

  // data to be sent back
  let sendData = {};
  const resourceCountParams: ResourceCountProps = Object.assign(
    allData["prodData"]["totals"],
    allData["nglData"]["totals"]
  );
  sendData["resourceCount"] = resourceCount(resourceCountParams);

  const productionDetailsParams: ProductionDetailsProps = {
    prodData: allData["prodData"]["results"],
    nglData: allData["nglData"]["results"],
  };
  sendData["productionDetails"] = productionDetails(productionDetailsParams);

  res.status(200).send(sendData);
});

// captures values and verify format
router.param("date", (req, res, next, date: string) => {
  const regex = /^(0?\d|[12]\d|3[01])-\d{4}$/;
  if (regex.test(date)) {
    req.date = date.replace("-", "/");
    next();
  } else {
    res.status(400).send({ message: "Invalid date format. Expected DD-YYYY." });
  }
});

module.exports = router;
