import { getDashboardDetails } from "@/app/actions/dashboard";
import { DashboardDetails } from "@/app/actions/interface";
import MonthSelector from "@/componets/MonthSelector";
import EBarStackChart from "@/componets/echarts/EBarStackChart";
import EPieChart from "@/componets/echarts/EPieChart";
import StatDisplay from "@/componets/StatDisplay";
import Header from "@/componets/Header";

export default async function Dashboard({
  params,
}: {
  params: { id: string };
}) {
  const details: DashboardDetails = await getDashboardDetails(
    params.id.replace("-", "/")
  );

  const isDetailsEmpty =
    Object.keys(details.productionData.totalOfOperators).length === 0 &&
    Object.keys(details.productionData.totalsByWell).length === 0 &&
    Object.keys(details.productionData.totalsByFacility).length === 0;

  return (
    <main className="min-h-screen flex-col items-center justify-between p-10">
      <Header />
      <MonthSelector />

      {isDetailsEmpty ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-600">No data available for this dashboard.</p>
        </div>
      ) : (
        <div>
          <div className="flex bg-white shadow-md rounded-lg flex-col pt-4 mt-3 mb-3">
            <h1 className="text-base pl-4">Operators</h1>
            <EBarStackChart data={details.productionData.totalOfOperators} />
          </div>
          <div className="flex flex-row items">
            <div className="flex h-full w-full max-w-sm mx-auto bg-white shadow-md rounded-lg flex-col items-center pt-4">
              <h1 className="text-base">
                Total Production:{" "}
                {(
                  details.resourceCount.gasTotal.count +
                  details.resourceCount.nglTotal.count +
                  details.resourceCount.oilTotal.count +
                  details.resourceCount.waterTotal.count
                ).toLocaleString()}{" "}
                {details.resourceCount.gasTotal.units}
              </h1>
              <EPieChart data={details.resourceCount} />
            </div>
            <div className="grid grid-cols-2 grid-rows-2 gap-4 w-full max-w-md mx-auto p-4">
              <StatDisplay
                heading="Total Wells"
                description="This month"
                value={Object.keys(
                  details.productionData.totalsByWell
                ).length.toLocaleString()}
              />
              <StatDisplay
                heading="Top Performing"
                description="Gas Well"
                value={details.topGasWellName}
              />
              <StatDisplay
                heading="Top Performing"
                description="Oil Well"
                value={details.topOilWellName}
              />
              <StatDisplay
                heading="Top Performing"
                description="Natural Gas Facility"
                value={details.topGasFacilityName}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
