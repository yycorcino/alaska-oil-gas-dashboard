import React from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import {
    GridComponent,
    LegendComponent,
    TooltipComponent,
    TitleComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
    TitleComponent,
    TooltipComponent,
    GridComponent,
    LegendComponent,
    PieChart,
    CanvasRenderer,
]);

var data = [
    { name: 'Limite 150', value: 5.6 },
    { name: 'Limite 130', value: 1 },
    { name: 'Limite 100', value: 1 },
    { name: 'Limite 70', value: 0.8 },
    { name: 'Limte 40', value: 0.5 },
    { name: 'Sin validar', value: 0.5 },
    { name: 'Suspendido', value: 3.8 },
    { name: 'Bloqueado', value: 3.8 },
];

const option = {
    title: {
        text: 'Status Clientes',
        left: 'center',
        textStyle: {
            color: '#999',
            fontWeight: 'normal',
            fontSize: 14,
        },
    },
    series: [
        {
            type: 'pie',
            radius: [30, 100], // Adjust these values as needed
            left: 'center',
            width: 400,
            itemStyle: {
                borderColor: '#fff',
                borderWidth: 0, // Set borderWidth to 0 to remove the lines
            },
            label: {
                show: false, // Hide labels by default
                formatter: '{b}: {c} units', // Format label to include units
                overflow: 'break', // Allow label to break into multiple lines if necessary
            },
            emphasis: {
                label: {
                    show: true, // Show labels on hover
                    formatter: '{b}: {c} units', // Format label to include units
                    overflow: 'break', // Allow label to break into multiple lines if necessary
                    textStyle: {
                        fontSize: 12, // Adjust the font size if necessary
                    }
                },
            },
            data: data,
        },
    ],
};


const EPieChart = () => {
    return <ReactEChartsCore
        echarts={echarts}
        option={option}
        notMerge={true}
        lazyUpdate={true}
        theme={'theme_name'}
        opts={{}}
    />
}

export default EPieChart;