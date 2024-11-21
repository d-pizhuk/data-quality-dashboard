import React, {createRef, useCallback, useEffect, useRef, useState} from 'react';
import Logo from "./components/Logo";
import KGBackground from "./components/KGBackground";
import {renderExtraPlots, createMainDimensions, numeric_info} from "./static_data/dash-b_main-page";
import {dashboard_metricDescriptions} from "./static_data/dash-b_dim_descriptions";
import {createRoot} from 'react-dom/client';
import {detailed_info} from "./static_data/dash-b_metric-plots";
import NavigationButtons from "./components/NavigationButtons";
import CustomSwiper from "./components/CustomSwiper";
import completeness_data from "./static_data/data/completeness.json";
import consistency_data from "./static_data/data/consistency.json";
import readability_data from './static_data/data/readability.json';
import {clear} from "./components/utils";
import 'katex/dist/katex.min.css';


function App() {
    const dashboardRef = useRef(null);

    const mainDimRef = useRef(null);
    const mainDimDoughnutsRefs = useRef([]);

    const logoContainerRef = useRef(null)

    const extraInfoRef = useRef(null);
    const extraInfoRootRef = useRef(null);

    const dimInfoRef = useRef(null);
    const dimInfoRootRef = useRef(null);

    const previousBtnRef = useRef(null)
    const nextBtnRef = useRef(null)

    const mainElIdxRef = useRef(null);
    const previousClickedRef = useRef(null);
    const onClickDisabledRef = useRef(false);

    const defineConsistency = () => {
        const retrievedValue = localStorage.getItem('consistency_score_updated');
        if (retrievedValue) {
            return retrievedValue
        } else {
            const consistencyScore_withoutConflictReduction = ((consistency_data.consistency_score*consistency_data.consistency_components_amount + 1) / (consistency_data.consistency_components_amount + 1))*100
            localStorage.setItem('consistency_score_updated', consistencyScore_withoutConflictReduction+"");
            return consistencyScore_withoutConflictReduction
        }
    }
    const [consistencyScore, setConsistencyScore] = useState(defineConsistency());
    const main_dimensions = createMainDimensions(completeness_data.completeness*100,
        consistencyScore, readability_data.readability*100, 97.5)

    mainDimDoughnutsRefs.current = main_dimensions.map(() => createRef());

    const updateDimInfoWidthAndHeight = useCallback(() => {
        if (dimInfoRef.current && mainDimDoughnutsRefs.current[mainElIdxRef.current]?.current) {
            dimInfoRef.current.style.transition = null
            //width
            const main_el_width = mainDimDoughnutsRefs.current[mainElIdxRef.current].current.offsetWidth;
            const gapsSize = (extraInfoRef.current.offsetWidth - main_dimensions.length * main_el_width) / (main_dimensions.length - 1);
            const dimInfoWidth = extraInfoRef.current.offsetWidth - mainDimDoughnutsRefs.current[mainElIdxRef.current].current.offsetWidth - gapsSize - 20;
            dimInfoRef.current.style.width = `${(100 * (dimInfoWidth) / window.innerWidth)}vw`;

            //height
            const dimInfoStyles = window.getComputedStyle(dimInfoRef.current);
            const paddingTop = parseFloat(dimInfoStyles.paddingTop);
            const paddingBottom = parseFloat(dimInfoStyles.paddingBottom);

            const parentHeight = mainDimRef.current.parentElement.getBoundingClientRect().height;
            const newHeightInPixels = (parentHeight * 0.25);
            const newHeightInVW = 100 * (newHeightInPixels - (paddingTop + paddingBottom)) / window.innerWidth

            dimInfoRef.current.style.height = (newHeightInVW) + "vw"
        }
    }, [mainElIdxRef]);

    const dimInfoSetup = (index) => {
        dimInfoRef.current.style.display = "flex";
        updateDimInfoWidthAndHeight();

        if (dimInfoRef.current && dimInfoRootRef.current == null) {
            dimInfoRootRef.current = createRoot(dimInfoRef.current);
        }
        dimInfoRootRef.current.render(dashboard_metricDescriptions[index]);

        if (mainElIdxRef.current === 0) {
            moveTo(dimInfoRef, mainDimDoughnutsRefs.current[1]);
        }
    };

    const renderContentWithDetailedInfo = (index) => {
        clear(extraInfoRef, extraInfoRootRef)

        const swiperKey = `swiper-${index}-${new Date().getTime()}`
        const data = <CustomSwiper data={detailed_info[index]["detailed_data"]} swiperKey={swiperKey}/>

        extraInfoRootRef.current.render(data)
    }

    const defineMainElInx = (index) => {
        mainElIdxRef.current = index < 2 ? 0 : 2;
    }


    const handleClick = (index) => {
        if (onClickDisabledRef.current) {
            return;
        }

        setupNavButtons(index, 900)

        defineMainElInx(index)
        previousClickedRef.current = index
        dimInfoSetup(index)

        for (let i = 0; i < mainDimDoughnutsRefs.current.length; i++){
            if (i !== index) {
                mainDimDoughnutsRefs.current[i].current.style.opacity = 0
            }
        }
        extraInfoRef.current.style.opacity = 0
        setTimeout(() => {
            renderContentWithDetailedInfo(index)
        }, 500);


        dimInfoRef.current.style.transition = "opacity 0.5s ease, transform 1.5s ease";
        mainDimDoughnutsRefs.current[index].current.style.transition = "opacity 0.5s ease, transform 1.5s ease";
        previousBtnRef.current.style.transition = "opacity 0.3s ease";
        nextBtnRef.current.style.transition = "opacity 0.3s ease";

        setTimeout(() => {
            moveTo(mainDimDoughnutsRefs.current[index], mainDimDoughnutsRefs.current[mainElIdxRef.current])
            mainDimRef.current.style.height = "25%";
            extraInfoRef.current.style.height = "calc(75% - 0.5vw)";
        }, 100);

        setTimeout(() => {
            dimInfoRef.current.style.opacity = 1;
            extraInfoRef.current.style.opacity = 1;
        }, 900)

        setTimeout(() => {
            dimInfoRef.current.style.transition = null;
            previousBtnRef.current.style.transition = null;
            nextBtnRef.current.style.transition = null;
            for (let i = 0; i < mainDimDoughnutsRefs.current.length; i++){
                mainDimDoughnutsRefs.current[i].current.style.transition = null;
            }
        }, 1500);
        onClickDisabledRef.current = !onClickDisabledRef.current
        for (let i = 0; i < mainDimDoughnutsRefs.current.length; i++){
            mainDimDoughnutsRefs.current[i].current.classList.remove("hovered_action");
        }
        logoContainerRef.current.classList.add("activated");

    };

    const handleClickFast = (index) => {
        dashboardRef.current.style.transition = "opacity 0.3s ease";
        dashboardRef.current.style.opacity = 0;

        setTimeout(() => {
            mainDimDoughnutsRefs.current[previousClickedRef.current].current.style.transform = `translate(0vw, 0vh)`;
            mainDimDoughnutsRefs.current[previousClickedRef.current].current.style.opacity = 0;
            dimInfoRef.current.style.transform = `translate(0vw, 0vh)`;
            renderContentWithDetailedInfo(index)

            defineMainElInx(index)
            previousClickedRef.current = index
            dimInfoSetup(index)
            moveTo(mainDimDoughnutsRefs.current[index], mainDimDoughnutsRefs.current[mainElIdxRef.current])
            setupNavButtons(index, 0)
        }, 300);


        setTimeout(() => {
            dashboardRef.current.style.opacity = 1;
            mainDimDoughnutsRefs.current[index].current.style.opacity = 1;
        }, 600)


        setTimeout(() => {
            dimInfoRef.current.style.transition = null;
            mainDimDoughnutsRefs.current[index].current.style.transition = null;
        }, 1000);
    };


    const setupNavButtons = (index, activationTimeout) => {
        setNavBtnNames(index)
        setBackBtnPosition(false)
        setTimeout(() => {
            if (index-1 >= 0) {
                activateButton(previousBtnRef)
            } else {
                deactivateButton(previousBtnRef)
            }

            if (index+1 < Object.keys(detailed_info).length){
                activateButton(nextBtnRef)
            } else {
                deactivateButton(nextBtnRef)
            }
        }, activationTimeout)
    }

    const setNavBtnNames = (index) => {
        if (index-1 >= 0) {
            previousBtnRef.current.querySelector(".previous-name").innerText = detailed_info[index-1]["name"]
        }

        if (index+1 < Object.keys(detailed_info).length){
            nextBtnRef.current.querySelector(".next-name").innerText = detailed_info[index+1]["name"]
        }
    }

    const setBackBtnPosition = useCallback((isOnResize) => {
        const halfOfMainDimH = isOnResize ? mainDimRef.current.getBoundingClientRect().height/2 : ((mainDimRef.current.getBoundingClientRect().height * 0.25) / 0.27)/2
        const halfOfBackBtnH = previousBtnRef.current.getBoundingClientRect().height/2

        previousBtnRef.current.style.top = `${mainDimRef.current.getBoundingClientRect().top + halfOfMainDimH - halfOfBackBtnH}px`
        previousBtnRef.current.style.left = `${mainDimRef.current.getBoundingClientRect().left - previousBtnRef.current.getBoundingClientRect().width - 0.0035*window.innerWidth}px`

        nextBtnRef.current.style.top = `${mainDimRef.current.getBoundingClientRect().top + halfOfMainDimH - halfOfBackBtnH}px`
        nextBtnRef.current.style.right = `${mainDimRef.current.getBoundingClientRect().left - nextBtnRef.current.getBoundingClientRect().width - 0.0035*window.innerWidth}px`
    }, [])

    const activateButton = (btnRef) => {
        btnRef.current.style.opacity = 1
        btnRef.current.style.cursor = "pointer"
        btnRef.current.firstChild.style.cursor = "pointer"
        btnRef.current.firstChild.disabled = false
    }

    const deactivateButton = (btnRef) => {
        btnRef.current.style.opacity = 0
        btnRef.current.style.cursor = "default"
        btnRef.current.firstChild.style.cursor = "default"
        btnRef.current.firstChild.disabled = true
    }

    const moveTo = (component, toComponent) => {
        if (!component.current || !toComponent.current) return;

        const rect_main = toComponent.current.getBoundingClientRect();
        const x_main = rect_main.left;
        const y_main = rect_main.top;

        const rect_clicked = component.current.getBoundingClientRect();
        const x_clicked = rect_clicked.left;
        const y_clicked = rect_clicked.top;

        const x_difference = 100 * (x_main - x_clicked) / window.innerWidth
        const y_difference = 100 * (y_main - y_clicked) / window.innerHeight

        component.current.style.transform = `translate(${x_difference}vw, ${y_difference}vh)`;
    }

    const renderComponent = (Component, index) => {
        const ComponentType = Component.type;
        return (
            <ComponentType
                key={index}
                reference={mainDimDoughnutsRefs.current[index]}
                {...Component.props}
                onClick={() => handleClick(index)}
            />
        );
    };

    useEffect(() => {
        const func = () => setBackBtnPosition(true)
        window.addEventListener('resize', func);
        return () => {
            window.removeEventListener('resize', func);
        };
    }, [setBackBtnPosition]);

    useEffect(() => {
        window.addEventListener('resize', updateDimInfoWidthAndHeight);
        return () => {
            window.removeEventListener('resize', updateDimInfoWidthAndHeight);
        };
    }, [updateDimInfoWidthAndHeight]);

    useEffect(() => {
        setTimeout(() => {
            dashboardRef.current.style.opacity = 1
        }, 300)
    }, []);

    useEffect(() => {
        const handleConsistencyScoreUpdate = (event) => {
            setConsistencyScore(event.detail.consistencyScoreUpdated);
        };

        window.addEventListener('consistency_score_updated', handleConsistencyScoreUpdate);
        return () => {
            window.removeEventListener('consistency_score_updated', handleConsistencyScoreUpdate);
        };
    }, []);

    useEffect(()=>{
        if( typeof window?.MathJax !== "undefined"){
            window.MathJax.typesetClear()
            window.MathJax.typeset()
        }
    },[])

    const mainDimensionsWithOnClick = main_dimensions.map((Component, index) => renderComponent(Component, index));


    return (
        <div className="background">
            <KGBackground />
            <div ref={dashboardRef} className="dashboard">
                <div className="navbar">
                    <Logo
                        previousClickedRef = {previousClickedRef}
                        previousBtnRef = {previousBtnRef}
                        nextBtnRef = {nextBtnRef}
                        extraInfoRef = {extraInfoRef}
                        extraInfoRootRef = {extraInfoRootRef}
                        dimInfoRef = {dimInfoRef}
                        onClickDisabledRef={onClickDisabledRef}
                        mainDimDoughnutsRefs={mainDimDoughnutsRefs}
                        mainDimRef={mainDimRef}
                        logoContainerRef={logoContainerRef}
                    />
                </div>
                <div className="info">
                    <div className="main_dimensions" ref={mainDimRef}>
                        <NavigationButtons
                            previousClickedRef = {previousClickedRef}
                            previousBtnRef = {previousBtnRef}
                            nextBtnRef = {nextBtnRef}
                            navBtnFunc= {handleClickFast}
                        />
                        {mainDimensionsWithOnClick}
                        <div className="dim_info" ref={dimInfoRef}>
                            {/* rendered when dimension chosen */}
                        </div>
                    </div>
                    <div className="extra_info" ref={extraInfoRef}>
                        {renderExtraPlots()}
                        {numeric_info}
                    </div>
                </div>
            </div>
        </div>

    );
}

export default App;
