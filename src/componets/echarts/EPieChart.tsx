"use client";

import React from "react";
import ReactECharts from "echarts-for-react";

type optionProps = {
  name: string;
  value: number;
  units: string;
};

const createOptions = (dataset: optionProps[]) => {
  return {
    tooltip: {
      trigger: "item",
      formatter: function (params: {
        name: string;
        value: number;
        data: ResourceDataType;
        percent: string;
      }) {
        return (
          `<div>${params.name}</div>` +
          `<div><span style="font-weight: bold">${params.value.toLocaleString()}</span> ${
            params.data.units
          } (${params.percent}%)</div>`
        );
      },
    },
    legend: {
      bottom: "10%",
      left: "center",
      orient: "horizontal",
    },
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"],
        center: ["50%", "40%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: false,
          },
        },
        labelLine: {
          show: false,
        },
        data: dataset,
      },
    ],
  };
};

const EPieChart = ({ data }: { data: ResourceCount }) => {
  // format to be accepted by ECharts
  const chartData = Object.entries(data).map(([key, value]) => {
    return {
      name: key.replace("Total", ""),
      value: value.count,
      units: value.units,
    };
  });

  return (
    <ReactECharts
      option={createOptions(chartData)}
      style={{ minWidth: 300, minHeight: 384 }}
    />
  );
};

export default EPieChart;
