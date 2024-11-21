import React, {useCallback, useEffect, useRef} from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import {colorsPalette, renderColor, hasParentWithClass, createTooltip} from "./utils";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ReadabilityHistogram = (data) => {
    const canvasRef = useRef(null);
    const chartInstanceRef = useRef(null);
    const tooltipOnHoverStatus = useRef(false); // Declare the ref inside the component

    // should be generated before rendering tooltip
    // const valuesArray = Object.values(data.data);
    const topWorstKeys = ['0-10', '10-20', '20-30']
    const topWorstAndBestKeys = ['30-40', '40-50', '50-60', '60-70']
    const topBestKeys = ['70-80', '80-90', '90-100']
    const readabilitySplitter = "rsp/&"
    const filteredValuesDict = {
        '0-10': Object.entries(data.data).filter(([_, value]) => value >= 0 && value < 0.1),
        '10-20': Object.entries(data.data).filter(([_, value]) => value >= 0.1 && value < 0.2),
        '20-30': Object.entries(data.data).filter(([_, value]) => value >= 0.2 && value < 0.3),
        '30-40': Object.entries(data.data).filter(([_, value]) => value >= 0.3 && value < 0.4),
        '40-50': Object.entries(data.data).filter(([_, value]) => value >= 0.4 && value < 0.5),
        '50-60': Object.entries(data.data).filter(([_, value]) => value >= 0.5 && value < 0.6),
        '60-70': Object.entries(data.data).filter(([_, value]) => value >= 0.6 && value < 0.7),
        '70-80': Object.entries(data.data).filter(([_, value]) => value >= 0.7 && value < 0.8),
        '80-90': Object.entries(data.data).filter(([_, value]) => value >= 0.8 && value < 0.9),
        '90-100': Object.entries(data.data).filter(([_, value]) => value >= 0.9 && value <= 1),
    };

    // checking range specifically for our case; if any error occurs, input data are not correct
    const isInRange = (rangeInStr, number) => {
        try {
            const splitRange = rangeInStr.split("-")
            if (parseFloat(splitRange[0]) <= number < parseFloat(splitRange[1])) {
                return true
            }

            return parseFloat(splitRange[1]) === 1 && parseFloat(splitRange[0]) <= number <= parseFloat(splitRange[1]);
        } catch (error) {
            throw new Error(`Input data is not correct: ${error.message}`);
        }
    }

    const createTooltipExtended = () => {
        let tooltip = createTooltip()

        tooltip.on("mouseenter", () => {
            tooltipOnHoverStatus.current = true;
        }).on("mouseleave", () => {
            tooltipOnHoverStatus.current = false;
            tooltip.transition().duration(500).style("opacity", 0);
        });

        return tooltip;
    };

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
                labels: Object.keys(filteredValuesDict),
                datasets: [
                    {
                        label: 'Frequency',
                        data: Object.values(filteredValuesDict).map(arr => arr.length),
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
                        enabled: false,
                        external: function(context) {
                            const tooltipModel = context.tooltip;
                            if (!tooltipModel.dataPoints) {
                                return
                            }

                            const dataIndex = tooltipModel.dataPoints[0].dataIndex;

                            let tooltip = createTooltipExtended();

                            if (tooltipModel.opacity === 0 && ! tooltipOnHoverStatus.current) {
                                tooltip.transition().duration(500).style("opacity", 0);
                                return;
                            }

                            if (tooltipModel.opacity !== 0) {
                                const x_pos = tooltipModel.caretX;
                                const y_pos = tooltipModel.caretY;
                                const { left, top } = canvasRef.current.getBoundingClientRect();

                                tooltip.transition().duration(200).style("opacity", 0.97);

                                const topStatement = []
                                const binLabel = histogram_data.labels[dataIndex]
                                const sortedEntries = filteredValuesDict[binLabel].sort(([, valueA], [, valueB]) => valueA - valueB);
                                if (topWorstKeys.includes(histogram_data.labels[dataIndex]) || topWorstAndBestKeys.includes(histogram_data.labels[dataIndex])) {
                                    const top3WorstEntries = sortedEntries.slice(0, 3);
                                    topStatement.push(
                                        "Top 3 Worst Scores in Range: "
                                    )

                                    for (const [index, [key, value]] of top3WorstEntries.entries()) {
                                        const splitKey = key.split(readabilitySplitter)
                                        const linkToIssue = `http://localhost:7200/resource?uri=${splitKey[0]}`;
                                        topStatement.push(
                                            `<a href="${linkToIssue}" target="_blank" style="color: rgba(5,22,108,0.35); text-decoration: none; font-weight: bold;">${splitKey[1]}</a>`
                                        );

                                        topStatement.push(
                                            `(${Math.round(value*100*100)/100}%)`
                                        );

                                        if (index !== top3WorstEntries.length - 1) {
                                            topStatement.push(
                                                `, `
                                            );
                                        } else {
                                            topStatement.push(
                                                `<br>`
                                            );
                                        }
                                    }
                                }

                                if (topBestKeys.includes(histogram_data.labels[dataIndex]) || topWorstAndBestKeys.includes(histogram_data.labels[dataIndex])) {
                                    const top3BestEntries = sortedEntries.slice(sortedEntries.length-3, sortedEntries.length);
                                    topStatement.push(
                                        "Top 3 Best Scores in the Range: "
                                    )

                                    for (const [index, [key, value]] of top3BestEntries.entries()) {
                                        const splitKey = key.split(readabilitySplitter)
                                        const linkToIssue = `http://localhost:7200/resource?uri=${splitKey[0]}`;
                                        topStatement.push(
                                            `<a href="${linkToIssue}" target="_blank" style="color: rgba(5,22,108,0.35); text-decoration: none; font-weight: bold;">${splitKey[1]}</a>`
                                        );

                                        topStatement.push(
                                            `(${Math.round(value*100*100)/100}%)`
                                        );

                                        if (index !== top3BestEntries.length - 1) {
                                            topStatement.push(
                                                `, `
                                            );
                                        } else {
                                            topStatement.push(
                                                `<br>`
                                            );
                                        }
                                    }
                                }
                                
                                tooltip.html(`# of annotations${xValuesDisplay ? '' : 
                                    ` in '${histogram_data.labels[dataIndex]}'`}: ${histogram_data.datasets[0].data[dataIndex]}<br>`+
                                    `Average: ${Math.round(sortedEntries.reduce((accumulator, current) => accumulator + current[1], 0)/
                                        sortedEntries.length * 100)/100}<br>`+
                                    topStatement.join(""))
                                    .style("left", `${x_pos + left}px`)
                                    .style("top", `${y_pos + top}px`);
                            }
                        }
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

export default ReadabilityHistogram;