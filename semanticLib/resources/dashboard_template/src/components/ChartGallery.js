import React, {useRef, useState} from 'react';
import './styles/ChartGallery.css';
import {clear} from "./utils";
import PieChartComp from "./PieChartComp";
import StackedBarChart from "./StackedBarChart";
import { VscPinned } from "react-icons/vsc";

const ChartGallery = ({ mainChart, secondaryCharts }) => {
    const mainChartRef = useRef(null);
    const mainChartRootRef = useRef(null);
    const secondaryChartsRef = useRef(null);
    const pinnedRef = useRef(null);
    const [clicked, setClicked] = useState(false)

    const handleOnClick = (index) => {
        setClicked(true)
        if (secondaryChartsRef.current && pinnedRef.current) {
            const numberOfChildren = secondaryChartsRef.current.childElementCount;
            const pinnedHeight = 100 / (numberOfChildren - 1)
            const top = pinnedHeight * index
            pinnedRef.current.style.top = `${top}%`
            pinnedRef.current.style.height = `${pinnedHeight}%`
            pinnedRef.current.style.opacity = 1
        }
    };

    const handleOnMouseEnter = (index) => {
        setClicked(false)
        pinnedRef.current.style.height = 0
        pinnedRef.current.style.opacity = 0
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
            <div ref={secondaryChartsRef} className="secondaryCharts">
                <div ref={pinnedRef} className="pinned_icon">
                    <VscPinned/>
                </div>

                {secondaryCharts.map((chart, index) => (
                    <div
                        key={index}
                        className="secondaryChart"
                        style={{height: (100/secondaryCharts.length)+"%"}}
                        onMouseEnter={() => handleOnMouseEnter(index)}
                        onMouseLeave={handleOnMouseLeave}
                        onClick={() => handleOnClick(index)}
                    >
                        {chart}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChartGallery;
