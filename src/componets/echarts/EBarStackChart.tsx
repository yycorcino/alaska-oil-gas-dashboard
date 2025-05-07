"use client";

import ReactECharts from "echarts-for-react";
import { TotalOfOperators } from "@/app/actions/interface";

interface SeriesDataInterface {
  name: string;
  type: string;
  stack: string;
  barWidth: string;
  label: { show: boolean };
  data: number[];
}

type OptionProps = {
  seriesData: SeriesDataInterface[];
  units: string;
  seriesNames: string[];
  xAxisLabels: string[];
};

const createOptions = ({
  seriesData,
  units,
  seriesNames,
  xAxisLabels,
}: OptionProps) => {
  return {
    textStyle: {
      fontFamily: "Open Sans",
    },
    legend: {
      selectedMode: true,
      data: seriesNames,
      selected: {
        Water: false,
      },
    },
    grid: {
      left: 100,
      right: 100,
      top: 50,
      bottom: 100,
    },
    yAxis: {
      type: "value",
      min: 0,
      max: null,
      splitLine: {
        show: true,
        lineStyle: {
          type: "dashed",
        },
      },
    },
    xAxis: {
      type: "category",
      data: xAxisLabels,
      axisLabel: {
        interval: 0,
        width: 50,
        overflow: "truncate",
      },
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      formatter: (params: any) => {
        let tooltipText = `${params[0].axisValue}<br/>`;
        params.forEach((item: any) => {
          tooltipText += `${item.marker} ${
            item.seriesName
          }: ${item.value.toLocaleString()} ${units}<br/>`;
        });
        return tooltipText;
      },
    },
    series: seriesData,
  };
};

const EBarStackChart = ({ data }: { data: TotalOfOperators }) => {
  // format to be accepted by ECharts

  // transform data in array format
  const operatorsWithTotal = Object.entries(data).map(([key, value]) => {
    const count =
      value.Oil.count + value.Gas.count + value.Water.count + value.NGL.count;
    return { key, total: { count: count, units: value.Gas.units }, ...value };
  });

  const units = operatorsWithTotal[0].Gas.units;
  const xAxisLabels = operatorsWithTotal.map((op) => op.key);
  const seriesNames = Object.keys(operatorsWithTotal[0]);
  seriesNames.splice(0, 2);

  // initialize series of each operator
  const seriesData: SeriesDataInterface[] = seriesNames.map((name) => ({
    name,
    type: "bar",
    stack: "total",
    barWidth: "50%",
    label: {
      show: false,
    },
    data: [],
  }));

  // populate the series with raw count values
  operatorsWithTotal.forEach((operator) => {
    seriesData[0].data.push(operator.Oil.count);
    seriesData[1].data.push(operator.Gas.count);
    seriesData[2].data.push(operator.Water.count);
    seriesData[3].data.push(operator.NGL.count);
  });

  return (
    <ReactECharts
      option={createOptions({ seriesData, units, seriesNames, xAxisLabels })}
    />
  );
};

export default EBarStackChart;
