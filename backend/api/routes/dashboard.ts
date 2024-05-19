// router: defining "/dashboard" route handling

const express = require("express");
const request = require("request");
import { deleteTypesForProduction, deleteTypesForNgl, baseProdUrl, baseNGLUrl } from "./globals/constant";
import { CompleteProductionAPIData } from "./interfaces/production";
import { CompleteNglAPIData } from "./interfaces/ngl";

const router = express.Router();

/* ---------- Production/ NGL ---------- */

/**
 * Function handles intial response from Alaska Production or NGL API:
 * cleans data and formatting into a managable data structure.
 *
 * @param {string} str - API response.
 * @param {string} deleteTypes - Keys to be deleted.
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
const getDataByMonth = async <T>(targetMonth: string, dateStartName: string, dateEndName: string, colNum: number, url: string, deleteTypes: string[] ): Promise<T> => {
  let payload = {
    draw: 1,
    start: 0,
    length: 1,
    sortColumn: colNum,
    sortDirection: "desc",
  };
  payload[dateStartName] = targetMonth
  payload[dateEndName] = targetMonth
  
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
  const prodData: CompleteProductionAPIData = await getDataByMonth<CompleteProductionAPIData>(req.date, "productionStartDate", "productionEndDate", 9, baseProdUrl, deleteTypesForProduction);
  const nglData: CompleteNglAPIData = await getDataByMonth<CompleteNglAPIData>(req.date, "startDate", "endDate", 6, baseNGLUrl, deleteTypesForNgl);
  const allData = {"prodData": prodData, "nglData": nglData}

  res.status(200).send(allData);
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
