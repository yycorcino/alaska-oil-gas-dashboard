"use server"
import { baseProdUrl, baseNGLUrl } from "./interface";

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
export const cleanResponse = <T>(str: string, deleteTypes: string[]): T => {
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
export const getDataByMonth = async <T>(
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