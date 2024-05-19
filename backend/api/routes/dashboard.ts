// router: defining "/dashboard" route handling

const express = require("express");
const request = require("request");
import { CompleteProductionAPIData } from "./interfaces/production";
import { CompleteNglAPIData } from "./interfaces/ngl";

const router = express.Router();

/* ---------- Production ---------- */

const baseProdUrl: string =
  "http://aogweb.state.ak.us/DataMiner4/WebServices/Production.asmx/GetDataTablesResponse";

/**
 * Function handles intial response from Alaska Production API:
 * cleans data and formatting into a managable data structure.
 *
 * @param {string} str - API response.
 *
 * @returns {CompleteProductionAPIData} - Formatted data.
 */
const cleanProductionResponse = (str: string) => {
  // turn string into json
  let jsonResponse = JSON.parse(str);
  let data = JSON.parse(jsonResponse["d"]);

  // get result data; remove unnecessary data
  const deleteTypes = [
    "Permit",
    "API",
    "Permit",
    "WellStatus",
    "Area",
    "Field",
    "Pool",
    "Pad",
    "ProductionMethod",
    "Days",
  ];
  for (let i = 0; i < data["data"].length; i++) {
    for (let type of deleteTypes) {
      delete data["data"][i][type];
    }
  }

  // get total oil, gas, water
  let totals = data["totals"];
  delete totals["daysTotal"];

  return { results: data["data"], totals: totals } as CompleteProductionAPIData;
};

/**
 * Function controls the gathering of data from Alaska Production API.
 * First, get request to get total entires. Second, get request to get
 * all total entries with 1 request.
 *
 * @param {string} targetMonth: The date range of data.
 *
 * @returns {CompleteProductionAPIData} - Formatted data.
 */
const getMonthOfProductionData = async (targetMonth: string) => {
  let payload = {
    draw: 1,
    start: 0,
    length: 1,
    sortColumn: 9,
    sortDirection: "desc",
    productionStartDate: targetMonth,
    productionEndDate: targetMonth,
  };

  // first request to get the total entries of month and total amount of oil, gas, water
  const resp1 = await new Promise((resolve, reject) => {
    request(
      {
        method: "GET",
        uri:
          baseProdUrl +
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
          baseProdUrl +
          "?requestParameters=" +
          encodeURIComponent(JSON.stringify(payload)),
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      },
      function (err, res, body) {
        if (res.statusCode == 200) {
          res = cleanProductionResponse(body);
          resolve(res);
        } else {
          reject({ message: err });
        }
      }
    );
  });

  return resp2;
};

/* ---------- Natural Gas Liquid ---------- */

const baseNGLUrl: string = "http://aogweb.state.ak.us/DataMiner4/WebServices/NaturalGasLiquid.asmx/GetDataTablesResponse";

/**
 * Function handles intial response from Alaska NGL API:
 * cleans data and formatting into a managable data structure.
 *
 * @param {string} str - API response.
 *
 * @returns {CompleteNglAPIData} - Formatted data.
 */
const cleanNglResponse = (str: string) => {
  // turn string into json
  let jsonResponse = JSON.parse(str);
  let data = JSON.parse(jsonResponse["d"]);

  // get result data; remove unnecessary data
  const deleteTypes = [
    "FacilityNumber",
    "FacilityName",
    "Area",
    "Field",
    "Pool",
    "Days",
  ];
  for (let i = 0; i < data["data"].length; i++) {
    for (let type of deleteTypes) {
      delete data["data"][i][type];
    }
  }

  // get total of ngl
  let totals = data["totals"]["nglTotal"];

  return { results: data["data"], totals: totals } as CompleteNglAPIData;
};

/**
 * Function controls the gathering of data from Alaska NGL API.
 * First, get request to get total entires. Second, get request to get
 * all total entries with 1 request.
 *
 * @param {string} targetMonth: The date range of data.
 *
 * @returns {CompleteNglAPIData} - Formatted data.
 */
const getMonthOfNglData = async (targetMonth: string) => {
  let payload = {
    draw: 1,
    start: 0,
    length: 1,
    sortColumn: 6,
    sortDirection: "desc",
    startDate: targetMonth,
    endDate: targetMonth,
  };
  
  // first request to get the total entries of month and total amount of NGL
  const resp1 = await new Promise((resolve, reject) => {
    request(
      {
        method: "GET",
        uri:
          baseNGLUrl +
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
          baseNGLUrl +
          "?requestParameters=" +
          encodeURIComponent(JSON.stringify(payload)),
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      },
      function (err, res, body) {
        if (res.statusCode == 200) {
          res = cleanNglResponse(body);
          resolve(res);
        } else {
          reject({ message: err });
        }
      }
    );
  });

  return resp2;
};

/* ---------- Parse Data to Create Meaning ---------- */

/**
 * Function handles parsing through data and determines percentages.
 *
 * @param {ListProductionAPIData} data - Data for Oil, Gas, Water, and Natural Gas.
 *
 * @returns {} -
 */
const resourcePercentage = (data) => {
  let resources = {
    data: { oil: 0, gas: 0, water: 0, naturalGas: 0 },
    units: "%",
  };

  return resources;
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
          // parse through API response
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
  const prodParse = await getMonthOfProductionData(req.date);
  const nglParse = await getMonthOfNglData(req.date);

  res.status(200).send({"prod": prodParse, "ngl": nglParse});
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
