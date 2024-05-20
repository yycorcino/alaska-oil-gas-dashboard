import { ListNglAPIResults } from "./ngl";
import { ListProductionAPIResults } from "./production";

type ResourceCountProps = {
  oilTotal: string;
  gasTotal: string;
  waterTotal: string;
  nglTotal: string;
};

type ResourceDataType = {
  count: string;
  units: string;
};

interface ResourceCount {
  oilTotal: ResourceDataType;
  gasTotal: ResourceDataType;
  waterTotal: ResourceDataType;
  nglTotal: ResourceDataType;
}

type ProductionDetailsProps = {
  prodData: ListProductionAPIResults;
  nglData: ListNglAPIResults;
};

type CountUnitType = {
  count: string;
  units: string;
};

type TotalOfOperators = {
  [OperatorName: string]: {
    Oil: CountUnitType;
    Gas: CountUnitType;
    Water: CountUnitType;
    NGL?: CountUnitType;
  };
};

type TotalsByWell = {
  [WellName: string]: {
    OperatorName: string;
    Gas: CountUnitType;
    Water: CountUnitType;
  };
};

type TotalsByFacility = {
  [operatorName: string]: {
    OperatorName: string;
    NGL?: CountUnitType;
  };
};

interface ProductionDetails {
  totalOfOperators: TotalOfOperators;
  totalsByWell: TotalsByWell;
  totalsByFacility: TotalsByFacility;
}

export {
  ResourceCountProps,
  ResourceCount,
  ProductionDetailsProps,
  ProductionDetails,
};
