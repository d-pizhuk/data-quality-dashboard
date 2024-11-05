import React, {useEffect, useRef} from 'react';
import Chart from 'chart.js/auto';
import {renderColor} from "./utils";

const StackedBarChart = ({data, labels, pointLabels, title, tooltipEnabled= true, xAxisDisplay = true}) => {
    const chartRef = useRef(null);
    const myChartRef = useRef(null);
    const containerRef = useRef();

    useEffect(() => {
        const ctx = chartRef.current.getContext('2d');

        const colors = renderColor(data.length)

        const datasets = data.map((data_el, index) => ({
            data: data_el,
            backgroundColor: colors[index],
        }));

        myChartRef.current = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: tooltipEnabled,
                        callbacks: {
                            label: function(tooltipItem) {
                                const datasetIndex = tooltipItem.datasetIndex;
                                const dataIndex = tooltipItem.dataIndex;

                                const pointLabel = pointLabels[dataIndex][datasetIndex];
                                const value = tooltipItem.raw;

                                return `${pointLabel}: ${value}`;
                            },
                        },
                    },
                },
                scales: {
                    x: {
                        stacked: true,
                        display: xAxisDisplay,
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                    },
                },
                responsive: true,
                maintainAspectRatio: false,
            },
        });

        // Cleanup chart instance on unmount
        return () => {
            if (myChartRef.current) {
                myChartRef.current.destroy();
            }
        };
    }, []);

    return (
        <div className="doughnut-diagram">
            <div className="canvas-container" ref={containerRef} >
                <canvas ref={chartRef} style={{ width: '80%', height: '80%' }}/>
            </div>

            <div className="diagram-title">
                <h1>{title}</h1>
            </div>
        </div>
    );
};

export default StackedBarChart;
