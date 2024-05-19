type NglAPIResults = {
    Operator: string;
    ReportData: string;
    NglProduction: string;
  };
  
type NglAPITotals = {
  nglTotal: string;
};

interface ListNglAPIResults extends Array<NglAPIResults> {}

export interface CompleteNglAPIData {
  results: ListNglAPIResults;
  totals: NglAPITotals;
}
