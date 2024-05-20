import { ListNglAPIResults } from "./ngl";
import { ListProductionAPIResults } from "./production";

type ResourceCountProps = {
    oilTotal: string,
    gasTotal: string,
    waterTotal: string,
    nglTotal: string  
}

type ResourceDataType = {
    count: string;
    units: string;
}

interface ResourceCountInterface {
    oilTotal: ResourceDataType;
    gasTotal: ResourceDataType;
    waterTotal: ResourceDataType;
    nglTotal: ResourceDataType;
}

type CountTopOperatorsProps = {
    prodData: ListProductionAPIResults;
    nglData: ListNglAPIResults;
};

interface ListOfCountTopOperatorsInterface {
    [operatorName: string]: {
        Oil: number;
        Gas: number;
        Water: number;
        NGL?: number;
    };
}

export {ResourceCountProps, ResourceCountInterface, CountTopOperatorsProps, ListOfCountTopOperatorsInterface };