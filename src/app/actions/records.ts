"use server";

const deleteTypesForProduction: string[] = [
  "Permit",
  "API",
  "Permit",
  "WellStatus",
  "Area",
  "Field",
  "Pool",
  "Pad",
  "ProductionMethod",
  "ProductionType",
  "Days",
];

const deleteTypesForNgl: string[] = [
  "FacilityNumber",
  "Area",
  "Field",
  "Pool",
  "Days",
];

const baseProdUrl: string =
  "http://aogweb.state.ak.us/DataMiner4/WebServices/Production.asmx/GetDataTablesResponse";
const baseNGLUrl: string =
  "http://aogweb.state.ak.us/DataMiner4/WebServices/NaturalGasLiquid.asmx/GetDataTablesResponse";

/* ---------- Production/ NGL ---------- */

/**
 * Function handles initial response from Alaska Production or NGL API:
 * cleans data and formatting into a manageable data structure.
 *
 * @param {string} str - API response.
 * @param {string[]} deleteTypes - Keys to be deleted.
 *
 * @returns {T} - Formatted data.
 */
const cleanResponse = <T>(str: string, deleteTypes: string[]): T => {
  // turn string into json
  let data = JSON.parse(str);

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
 * @param {string[]} deleteTypes - Keys to be deleted passed to cleanResponse Function.
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
): Promise<T | { message: string }> => {
  let payload = {
    draw: 1,
    start: 0,
    length: 5,
    sortColumn: colNum,
    sortDirection: "desc",
    [dateStartName]: targetMonth,
    [dateEndName]: targetMonth,
  };

  // first request to get the total entries of month and total amount of oil, gas, water, and ngl
  let resp1 = await fetch(
    `${url}?requestParameters=${encodeURIComponent(JSON.stringify(payload))}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    }
  );

  if (!resp1.ok) {
    return { message: resp1.statusText };
  }

  const resp1Json = await resp1.json();
  let data = JSON.parse(resp1Json["d"]);
  payload["length"] = data["recordsFiltered"];

  // second request to get all entries
  let resp2 = await fetch(
    `${url}?requestParameters=${encodeURIComponent(JSON.stringify(payload))}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    }
  );

  if (!resp2.ok) {
    return { message: resp2.statusText };
  }

  const resp2Json = await resp2.json();
  const dataStr = resp2Json["d"];
  let returnData = cleanResponse<T>(dataStr, deleteTypes);

  return returnData as T;
};

/* ---------- Parse Data to Create Meaning ---------- */

/**
 * Function gets the most recent report date.
 *
 * @returns {string} - The recent report date available in AOGCC database.
 */
export const getRecentAvailableDate = async (): Promise<string> => {
  const payload = {
    draw: 1,
    start: 0,
    length: 2,
    sortColumn: 9,
    sortDirection: "desc",
  };

  let resp1 = await fetch(
    `${baseProdUrl}?requestParameters=${encodeURIComponent(
      JSON.stringify(payload)
    )}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    }
  );

  let dataJSON = await resp1.json();
  let data = dataJSON["d"];
  data = JSON.parse(data);
  return data["data"][0]["ReportDate"];
};

/**
 * Function sets total of all resources count and units.
 *
 * @param {Object} data - Data containing total counts of Oil, Gas, Water, and Natural Gas Liquid.
 * @param {string} data.oilTotal - Total count of oil.
 * @param {string} data.gasTotal - Total count of gas.
 * @param {string} data.waterTotal - Total count of water.
 * @param {string} data.nglTotal - Total count of natural gas liquid.
 *
 * @returns {ResourceCount} - Formatted data.
 */
const refineResourceCount = (data: {
  oilTotal: string;
  gasTotal: string;
  waterTotal: string;
  nglTotal: string;
}) => {
  const resources: ResourceCount = {
    oilTotal: {
      count: Number(data["oilTotal"]),
      units: "BBL",
    },
    gasTotal: {
      count: Math.round(Number(data["gasTotal"]) / 6000),
      units: "BBL",
    },
    waterTotal: {
      count: Number(data["waterTotal"]),
      units: "BBL",
    },
    nglTotal: {
      count: Number(data["nglTotal"]),
      units: "BBL",
    },
  };
  return resources;
};

/**
 * Function counts each Operator production details, each Well
 * production(oil, gas, water) details, and each Facility(ngl) product details.
 *
 * @param {RefineProductionDataProps} data - Data of total Oil, Gas, Water, and Natural Gas Liquid.
 *
 * @returns {RefineProductionData} - Formatted data.
 */
const refineProductionData = (data: RefineProductionDataProps) => {
  let totalOfOperators: TotalOfOperators = {};
  let totalsByWell: TotalsByWell = {};
  let totalsByFacility: TotalsByFacility = {};

  data["prodData"].forEach((elem, index, arr) => {
    // update totalOfOperators with oil, gas, water
    if (totalOfOperators.hasOwnProperty(elem["OperatorName"])) {
      // operator exist; add to existing operator
      totalOfOperators[elem["OperatorName"]]["Oil"]["count"] += Number(
        elem["Oil"].replace(/,/g, "")
      );
      totalOfOperators[elem["OperatorName"]]["Gas"]["count"] += Number(
        elem["Gas"].replace(/,/g, "")
      );
      totalOfOperators[elem["OperatorName"]]["Water"]["count"] += Number(
        elem["Water"].replace(/,/g, "")
      );
    } else {
      // operator doesn't exist; create operator
      totalOfOperators[elem["OperatorName"]] = {
        Oil: {
          count: Number(elem["Oil"].replace(/,/g, "")),
          units: "BBL",
        },
        Gas: {
          count: Number(elem["Gas"].replace(/,/g, "")),
          units: "MCF",
        },
        Water: {
          count: Number(elem["Water"].replace(/,/g, "")),
          units: "BBL",
        },
        NGL: {
          count: 0,
          units: "BBL",
        },
      };
    }

    if (totalsByWell.hasOwnProperty(elem["WellName"])) {
      // well exist; add to existing well
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
      // well doesn't exist; create well
      totalsByWell[elem["WellName"]] = {
        OperatorName: elem["OperatorName"],
        Oil: {
          count: Number(elem["Oil"].replace(/,/g, "")),
          units: "BBL",
        },
        Gas: {
          count: Number(elem["Gas"].replace(/,/g, "")),
          units: "MCF",
        },
        Water: {
          count: Number(elem["Water"].replace(/,/g, "")),
          units: "BBL",
        },
      };
    }
  });

  data["nglData"].forEach((elem, index, arr) => {
    // update totalOfOperators with ngl
    if (
      totalOfOperators.hasOwnProperty(elem["Operator"]) &&
      totalOfOperators[elem["Operator"]].hasOwnProperty("NGL")
    ) {
      // operator exist and NGL property exist; add to existing operator
      totalOfOperators[elem["Operator"]]["NGL"]["count"] += Number(
        elem["NglProduction"].replace(/,/g, "")
      );
    } else {
      // operator doesn't exist; create operator
      totalOfOperators[elem["Operator"]] = {
        Oil: {
          count: 0,
          units: "BBL",
        },
        Gas: {
          count: 0,
          units: "MCF",
        },
        Water: {
          count: 0,
          units: "BBL",
        },
        NGL: {
          count: Number(elem["NglProduction"].replace(/,/g, "")),
          units: "BBL",
        },
      };
    }

    if (totalsByFacility.hasOwnProperty(elem["FacilityName"])) {
      // facility exist; add to existing facility
      totalsByFacility[elem["FacilityName"]]["NGL"]["count"] += Number(
        elem["NglProduction"].replace(/,/g, "")
      );
    } else {
      // facility doesn't exist; create facility
      totalsByFacility[elem["FacilityName"]] = {
        OperatorName: elem["Operator"],
        NGL: {
          count: Number(elem["NglProduction"].replace(/,/g, "")),
          units: "BBL",
        },
      };
    }
  });

  // update MCF units to BBL
  for (const operator in totalOfOperators) {
    if (totalOfOperators[operator].Gas.count != 0) {
      totalOfOperators[operator].Gas.count = Math.round(
        totalOfOperators[operator].Gas.count / 6000
      );
      totalOfOperators[operator].Gas.units = "BBL";
    } else {
      totalOfOperators[operator].Gas.units = "BBL";
    }
  }

  return {
    totalOfOperators,
    totalsByWell,
    totalsByFacility,
  } as RefineProductionData;
};

const topPerformerFilter = ({
  target,
  data,
}: {
  target: string;
  data: any;
}) => {
  let largestValue: number = 0;
  let name: string = "NULL";

  for (const key in data) {
    if (data[key][target] && data[key][target].count > largestValue) {
      largestValue = data[key][target].count;
      name = key;
    }
  }

  return name as string;
};

/**
 * Controller function to get all required data for dashboard.
 *
 * @param {string} date - The target date for data.
 *
 * @returns {DashboardDetails} - Formatted data.
 */
export async function getDashboardDetails(date: string) {
  const prodData: CompleteProductionAPIData | { message: string } =
    await getDataByMonth<CompleteProductionAPIData>(
      date,
      "productionStartDate",
      "productionEndDate",
      9,
      baseProdUrl,
      deleteTypesForProduction
    );

  const nglData: CompleteNglAPIData | { message: string } =
    await getDataByMonth<CompleteNglAPIData>(
      date,
      "startDate",
      "endDate",
      6,
      baseNGLUrl,
      deleteTypesForNgl
    );

  let clientData: DashboardDetails = {
    resourceCount: {} as ResourceCount,
    productionData: {} as RefineProductionData,
    topOilWellName: "",
    topGasWellName: "",
    topGasFacilityName: "",
  };
  if ("totals" in prodData && "totals" in nglData) {
    const rawResourceCount = Object.assign(
      prodData["totals"],
      nglData["totals"]
    );
    clientData["resourceCount"] = refineResourceCount(rawResourceCount);

    const rawProductionData: RefineProductionDataProps = {
      prodData: prodData["results"],
      nglData: nglData["results"],
    };
    clientData["productionData"] = refineProductionData(rawProductionData);
  }

  clientData.topOilWellName = topPerformerFilter({
    target: "Oil",
    data: clientData.productionData.totalsByWell,
  });
  clientData.topGasWellName = topPerformerFilter({
    target: "Gas",
    data: clientData.productionData.totalsByWell,
  });
  clientData.topGasFacilityName = topPerformerFilter({
    target: "NGL",
    data: clientData.productionData.totalsByFacility,
  });

  return clientData as DashboardDetails;
}
