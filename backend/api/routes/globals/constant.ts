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

export { deleteTypesForProduction, deleteTypesForNgl, baseProdUrl, baseNGLUrl };
