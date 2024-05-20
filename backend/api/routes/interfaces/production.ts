type ProductionAPIResults = {
  WellName: string;
  OperatorName: string;
  reportDate: string;
  ProductionType: string;
  Oil: string;
  Gas: string;
  Water: string;
};

type ProductionAPITotals = {
  oilTotal: string;
  gasTotal: string;
  waterTotal: string;
};

interface ListProductionAPIResults extends Array<ProductionAPIResults> {}

interface CompleteProductionAPIData {
  results: ListProductionAPIResults;
  totals: ProductionAPITotals;
}

export {ListProductionAPIResults, CompleteProductionAPIData}