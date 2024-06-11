import React, { useState, useEffect } from "react";
import MonthSelector from "../../componets/MonthSelector";
import EPieChart from "../../componets/echarts/EPieChart";
import EBarStackChart from "../../componets/echarts/EBarStackChart";

const url: string = "https://alaska-oil-gas-dashboard.vercel.app/dashboard";

const Dashboard = (): JSX.Element => {
    const [data, setData] = useState({});

    useEffect(() => {
        fetch(url, {
          method: "GET",

        })
          .then((response) => response.json())
          .then((data) => {
            setData(data);
            console.log(data);
          })
          .catch((error) => console.log(error));
      }, []);

    return <>
        <MonthSelector />
        <EPieChart />
        <EBarStackChart />
        </>
}

export default Dashboard;