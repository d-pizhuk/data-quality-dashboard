import React, { useRef, useEffect, useState } from 'react';
import Chart from 'chart.js/auto';
import {renderColor} from "./utils";

const PieChartComp = React.memo(({ data, labels, title, tooltipEnabled= true, onClick}) => {
    const canvasRef = useRef();
    const containerRef = useRef();
    const chartRef = useRef(null);
    const [displayLegend, setDisplayLegend] = useState(null);

    const measureHeight = () => {
        if (containerRef.current) {
            if (containerRef.current.offsetHeight > 190) {
                setDisplayLegend(true);
            } else {
                setDisplayLegend(false);
            }
        }
    };

    useEffect(() => {
        measureHeight();
        window.addEventListener('resize', measureHeight);

        return () => {
            window.removeEventListener('resize', measureHeight);
        };
    }, []);

    useEffect(() => {
        if (displayLegend === null) return;

        const ctx = canvasRef.current.getContext('2d');
        const colorPalette = renderColor(labels.length)
        const chartConfig = {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colorPalette,
                    hoverBackgroundColor: colorPalette,
                    borderWidth: 0,
                }]
            },
            options: {
                plugins: {
                    legend: {
                        display: displayLegend
                    },
                    tooltip: {
                        enabled: tooltipEnabled
                    },
                },
                title: {
                    display: false
                },
                layout: {
                    padding: {
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 10
                    },
                },
                animation: {
                    animateScale: false,
                    animateRotate: false
                },
            },
        };

        if (chartRef.current) {
            chartRef.current.destroy();
        }

        chartRef.current = new Chart(ctx, chartConfig);

        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };
    }, [data, labels, displayLegend]);


    return (
        <div className="doughnut-diagram" {...(onClick ? { onClick: onClick, style: { cursor: 'pointer' } } : {})}>
            <div className="canvas-container" ref={containerRef} >
                <canvas ref={canvasRef} style={{ width: '80%', height: '80%' }}/>
            </div>

            <div className="diagram-title">
                <h1>{title}</h1>
            </div>
        </div>
    );
});

export default PieChartComp;
