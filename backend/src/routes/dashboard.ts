const express = require("express");
const request = require("request");

const router = express.Router();

const baseUrl: string =
  "http://aogweb.state.ak.us/DataMiner4/WebServices/Production.asmx/GetDataTablesResponse?requestParameters=%7B%22draw%22%3A2%2C%22start%22%3A0%2C%22length%22%3A100%2C%22sortColumn%22%3A9%2C%22sortDirection%22%3A%22desc%22%7D";

interface ProducitonAPIData {
  WellName: string;
  OperatorName: string;
  reportDate: string;
  ProductionType: string;
  Oil: string;
  Gas: string;
  Water: string;
}

interface ListProductionAPIData extends Array<ProducitonAPIData> {}

/**
 * Function handles intial response from Alaska Production API:
 * cleans data and formatting into a managable data structure.
 *
 * @param {string} str - API response.
 *
 * @returns {ListProductionAPIData} - Formatted data.
 */
const cleanResponse = (str: string) => {
  // turn string into json
  let jsonResponse = JSON.parse(str);
  let data = JSON.parse(jsonResponse["d"]);

  // remove unnecessary data
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

  return data["data"];
};

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

// redirect to most update dashboard date
router.get("/", (req, res) => {
  res.redirect("/dashboard/1");
});

router.get("/:date", async (req, res) => {
  await request(
    {
      method: "GET",
      uri: baseUrl,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    },
    function (error, response, body) {
      if (response.statusCode == 200) {
        response = cleanResponse(body);
        res.status(200).send(response);
      } else {
        res.status(response.statusCode).send({ message: "Error" });
      }
    }
  );
});

const users = [{ name: "kyle" }, { name: "sally" }];
router.param("date", (req, res, next, id) => {
  req.user = users[id];
  next();
});

module.exports = router;
