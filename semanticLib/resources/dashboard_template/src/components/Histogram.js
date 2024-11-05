import React, {useCallback, useEffect, useRef} from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import {colorsPalette, renderColor, hasParentWithClass} from "./utils";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Histogram = (data) => {
    const canvasRef = useRef(null);
    const chartInstanceRef = useRef(null);

    const renderHistogram  = useCallback(() => {
        canvasRef.current.style.opacity = 0
        setTimeout(() => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }

            const barColor = renderColor(1);
            const titleSizeInPX = window.innerWidth / 100     // 1vw in px
            const titleFamily = "Open Sans, sans-serif"
            const xValuesDisplay = canvasRef.current.parentElement.getBoundingClientRect().width > 650

            const histogram_data = {
                labels: ['0-10', '10-20', '20-30', '30-40', '40-50', '50-60', '60-70', '70-80', '80-90', '90-100'],
                datasets: [
                    {
                        label: 'Frequency',
                        data: [
                            data.data.filter(x => x >= 0 && x < 0.1).length,
                            data.data.filter(x => x >= 0.1 && x < 0.2).length,
                            data.data.filter(x => x >= 0.2 && x < 0.3).length,
                            data.data.filter(x => x >= 0.3 && x < 0.4).length,
                            data.data.filter(x => x >= 0.4 && x < 0.5).length,
                            data.data.filter(x => x >= 0.5 && x < 0.6).length,
                            data.data.filter(x => x >= 0.6 && x < 0.7).length,
                            data.data.filter(x => x >= 0.7 && x < 0.8).length,
                            data.data.filter(x => x >= 0.8 && x < 0.9).length,
                            data.data.filter(x => x >= 0.9 && x <= 1).length,
                        ],
                        backgroundColor: `${barColor}`,
                        hoverBackgroundColor: colorsPalette[1],
                        borderWidth: 0,
                    },
                ],
            };

            const color = hasParentWithClass(canvasRef.current, 'detailed_info-block') ? "#414040" : '#FFFFFF';

            const ctx = canvasRef.current.getContext('2d');

            const options = {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                        display: false,
                        labels: {
                            color: color,
                        }
                    },
                    title: {
                        display: true,
                        text: data.name,
                        padding: {
                            top: 10,
                            bottom: 10,
                        },
                        font: {
                            size: titleSizeInPX,
                            family: titleFamily,
                            weight: 'normal',
                        },
                        color: color,
                    },
                    tooltip: {
                        titleFont: {
                            size: 14,
                            family: titleFamily,
                        },
                        bodyFont: {
                            size: 12,
                            family: titleFamily,
                        },
                        cornerRadius: 4,
                        caretSize: 6,
                        displayColors: false,
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'HR Score Bins',
                            padding: {
                                top: 10,
                                bottom: 10,
                            },
                            font: {
                                size: titleSizeInPX,
                                family: titleFamily,
                            },
                            color: color,
                        },
                        ticks: {
                            display: xValuesDisplay,
                            color: color,
                        },
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: false,
                        },
                        ticks: {
                            color: color,
                        },
                    },
                },
            };

            chartInstanceRef.current = new ChartJS(ctx, {
                type: 'bar',
                data: histogram_data,
                options: options,
            });
            setTimeout(() => {
                canvasRef.current.style.opacity = 1
            }, 100)
        }, 100);

    }, [data.data, data.name]);

    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            if (timeoutId) {
                clearTimeout(timeoutId); // Clear the previous timeout
            }
            timeoutId = setTimeout(() => {
                func(...args);
            }, delay);
        };
    };

    const handleResize = debounce(() => {
        renderHistogram();
    }, 100);

    useEffect(() => {
        renderHistogram();
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy(); // Clean up chart instance
            }
        };
    }, [renderHistogram, handleResize]);

    return (
        <div className={"histogram"}>
            <canvas ref={canvasRef} />
        </div>
    );
};

export default Histogram;
