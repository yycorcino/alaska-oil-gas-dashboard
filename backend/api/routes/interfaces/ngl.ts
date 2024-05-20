type NglAPIResults = {
  Operator: string;
  ReportData: string;
  NglProduction: string;
};

type NglAPITotals = {
  nglTotal: string;
};

interface ListNglAPIResults extends Array<NglAPIResults> {}

interface CompleteNglAPIData {
  results: ListNglAPIResults;
  totals: NglAPITotals;
}

export { ListNglAPIResults, CompleteNglAPIData };
