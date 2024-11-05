import React, {useRef, useState} from 'react';
import './styles/ChartGallery.css';
import {clear} from "./utils";
import PieChartComp from "./PieChartComp";
import StackedBarChart from "./StackedBarChart";

const ChartGallery = ({ mainChart, secondaryCharts }) => {
    const mainChartRef = useRef(null);
    const mainChartRootRef = useRef(null);
    const [clicked, setClicked] = useState(false)

    const handleOnClick = () => {
        setClicked(true)
    };

    const handleOnMouseEnter = (index) => {
        setClicked(false)
        mainChartRef.current.style.opacity = 0
        setTimeout(() => {
            clear(mainChartRef, mainChartRootRef)
            if (secondaryCharts[index].type === PieChartComp) {
                mainChartRootRef.current.render(React.cloneElement(secondaryCharts[index], {tooltipEnabled: true}))
            } else if (secondaryCharts[index].type === StackedBarChart){
                mainChartRootRef.current.render(React.cloneElement(secondaryCharts[index], {tooltipEnabled: true, xAxisDisplay: true}))
            } else {
                mainChartRootRef.current.render(secondaryCharts[index])
            }

            setTimeout(() => {
                mainChartRef.current.style.opacity = 1
            }, 200);
        }, 200);
    };

    const handleOnMouseLeave = () => {
        if (!clicked) {
            mainChartRef.current.style.opacity = 0
            setTimeout(() => {
                clear(mainChartRef, mainChartRootRef)
                mainChartRootRef.current.render(mainChart)
                setTimeout(() => {
                    mainChartRef.current.style.opacity = 1
                }, 200);
            }, 200);
        }
    };

    return (
        <div className="chartGallery">
            <div ref={mainChartRef} className="mainChart">
                {mainChart}
            </div>
            <div className="secondaryCharts">
                {secondaryCharts.map((chart, index) => (
                    <div
                        key={index}
                        className="secondaryChart"
                        style={{height: (100/secondaryCharts.length)+"%"}}
                        onMouseEnter={() => handleOnMouseEnter(index)}
                        onMouseLeave={handleOnMouseLeave}
                        onClick={handleOnClick}
                    >
                        {chart}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChartGallery;
