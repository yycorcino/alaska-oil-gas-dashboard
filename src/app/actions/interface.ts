type NglAPIResults = {
  FacilityName: string;
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

type ResourceDataType = {
  count: number;
  units: string;
};

interface ResourceCount {
  oilTotal: ResourceDataType;
  gasTotal: ResourceDataType;
  waterTotal: ResourceDataType;
  nglTotal: ResourceDataType;
}

type RefineProductionDataProps = {
  prodData: ListProductionAPIResults;
  nglData: ListNglAPIResults;
};

type CountUnitType = {
  count: number;
  units: string;
};

type TotalOfOperators = {
  [OperatorName: string]: {
    Oil: CountUnitType;
    Gas: CountUnitType;
    Water: CountUnitType;
    NGL: CountUnitType;
  };
};

type TotalsByWell = {
  [WellName: string]: {
    OperatorName: string;
    Oil: CountUnitType;
    Gas: CountUnitType;
    Water: CountUnitType;
  };
};

type TotalsByFacility = {
  [operatorName: string]: {
    OperatorName: string;
    NGL: CountUnitType;
  };
};

interface RefineProductionData {
  totalOfOperators: TotalOfOperators;
  totalsByWell: TotalsByWell;
  totalsByFacility: TotalsByFacility;
}

interface DashboardDetails {
  resourceCount: ResourceCount;
  productionData: RefineProductionData;
}
