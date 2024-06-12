import { getDashboardDetails } from "@/app/actions/records";
import EPieChart from "@/componets/echarts/EPieChart";

export default async function Dashboard({
  params,
}: {
  params: { id: string };
}) {
  const details: DashboardDetails = await getDashboardDetails(
    params.id.replace("-", "/")
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="flex h-full w-full max-w-sm mx-auto bg-white shadow-md rounded-lg flex-col items-center pt-4">
        <h1>
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
    </main>
  );
}
