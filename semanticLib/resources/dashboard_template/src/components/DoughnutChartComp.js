import React, { useRef, useEffect} from 'react';
import Chart from 'chart.js/auto';

const DoughnutChartComp = (data) => {
    const canvasRef = useRef();
    const chartRef = useRef(null);


    const calculateColor = (percentage) => {
        const green =  [33, 63, 140];
        const darkYellow = [84, 113, 188];
        const red = [174, 195, 249];

        let color;

        if (percentage >= 50) {
            color = green.map((channel, index) => {
                const targetChannel = darkYellow[index];
                return Math.round(channel + (targetChannel - channel) * ((100 - percentage) / 50));
            });
        } else {
            color = darkYellow.map((channel, index) => {
                const targetChannel = red[index];
                return Math.round(channel + (targetChannel - channel) * ((50 - percentage) / 50));
            });
        }

        return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
    };

    const percentageRounded = Math.round(data.value * 10) / 10;
    const gradientColor = calculateColor(percentageRounded);

    useEffect(() => {
        const ctx = canvasRef.current.getContext('2d');
        const chartConfig = {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [percentageRounded, 100-percentageRounded],
                    backgroundColor: [gradientColor, 'rgba(220,220,220,0.5)'],
                    hoverBackgroundColor: [gradientColor, 'rgba(220,220,220,0.5)'],
                    borderColor: [gradientColor, 'rgb(0, 0, 0, 0)'],
                    borderWidth: 0.5
                }]
            },
            options: {
                cutout: '80%',
                legend: {
                    display: false
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
                    animateScale: true,
                    animateRotate: false
                },
                plugins: {
                    tooltip: {
                        enabled: false
                    },
                    doughnutTitle: {
                        mainValue: {
                            text: percentageRounded+"%",
                            font: {
                                size: 40,
                                family: 'Arial',
                                style: 'normal',
                                weight: 'normal'
                            },
                            color: "rgb(65, 64, 64, 1)"
                        },
                    }
                },
            },
            plugins: [{
                id: 'doughnutTitle',
                beforeDraw: function(chart, args, options) {
                    if (options.mainValue && options.mainValue.text) {
                        const width = chart.chartArea.right - chart.chartArea.left;
                        const height = chart.chartArea.bottom - chart.chartArea.top;
                        ctx.font = (ctx.canvas.clientHeight/window.innerWidth * 20) + 'vw ' + options.mainValue.font.family;
                        ctx.fillStyle = options.mainValue.color;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        const titleX = chart.chartArea.left + (width / 1.95);
                        const titleY = chart.chartArea.top + (height / 1.95);
                        ctx.fillText(options.mainValue.text, titleX, titleY);
                    }
                }
            }]
        };


        if (chartRef.current) {
            chartRef.current.destroy();
        }

        // Create new chart instance
        chartRef.current = new Chart(ctx, chartConfig);


        // Cleanup function to destroy chart instance
        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };
    }, [data, gradientColor, percentageRounded]);


    return (
        <div className={data.className} ref={data.reference} onClick={data.onClick} style={data.style}>
            <div className="canvas-container">
                <canvas ref={canvasRef}/>
            </div>
            <div className="diagram-title">
                <h1>{data.title}</h1>
            </div>
        </div>
    );
};

export default DoughnutChartComp;