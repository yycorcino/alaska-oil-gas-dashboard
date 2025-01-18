// find a better location to store base urls
export const baseProdUrl: string =
  "http://aogweb.state.ak.us/DataMiner4/WebServices/Production.asmx/GetDataTablesResponse";
export const baseNGLUrl: string =
  "http://aogweb.state.ak.us/DataMiner4/WebServices/NaturalGasLiquid.asmx/GetDataTablesResponse";

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

export interface CompleteNglAPIData {
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

export interface CompleteProductionAPIData {
  results: ListProductionAPIResults;
  totals: ProductionAPITotals;
}

type ResourceDataType = {
  count: number;
  units: string;
};

export interface ResourceCount {
  oilTotal: ResourceDataType;
  gasTotal: ResourceDataType;
  waterTotal: ResourceDataType;
  nglTotal: ResourceDataType;
}

export type RefineProductionDataProps = {
  prodData: ListProductionAPIResults;
  nglData: ListNglAPIResults;
};

type CountUnitType = {
  count: number;
  units: string;
};

export type TotalOfOperators = {
  [OperatorName: string]: {
    Oil: CountUnitType;
    Gas: CountUnitType;
    Water: CountUnitType;
    NGL: CountUnitType;
  };
};

export type TotalsByWell = {
  [WellName: string]: {
    OperatorName: string;
    Oil: CountUnitType;
    Gas: CountUnitType;
    Water: CountUnitType;
  };
};

export type TotalsByFacility = {
  [operatorName: string]: {
    OperatorName: string;
    NGL: CountUnitType;
  };
};

export interface RefineProductionData {
  totalOfOperators: TotalOfOperators;
  totalsByWell: TotalsByWell;
  totalsByFacility: TotalsByFacility;
}

export interface DashboardDetails {
  resourceCount: ResourceCount;
  productionData: RefineProductionData;
  topOilWellName: string;
  topGasWellName: string;
  topGasFacilityName: string;
}