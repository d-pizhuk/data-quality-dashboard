import React from 'react';
import './styles/Logo.css';
import logoImg from '../static_data/img/logo.png'
import {renderExtraPlots, numeric_info} from "../static_data/dash-b_main-page";
import {clear} from "./utils";

const Logo = (refs) => {
    const {
        logoContainerRef,
        previousBtnRef,
        nextBtnRef,
        previousClickedRef,
        extraInfoRef,
        extraInfoRootRef,
        dimInfoRef,
        onClickDisabledRef,
        mainDimDoughnutsRefs,
        mainDimRef,
        handleClick
    } = refs;

    const renderContentWithBaseInfo = () => {
        extraInfoRef.current.style.flexDirection = "row";
        clear(extraInfoRef, extraInfoRootRef)

        const baseInfo =
            <>
                {renderExtraPlots(handleClick)}
                {numeric_info}
            </>

        extraInfoRootRef.current.render(baseInfo);
    }

    const deactivateButton = (btnRef) => {
        btnRef.current.style.opacity = 0
        btnRef.current.style.cursor = "default"
        btnRef.current.firstChild.style.cursor = "default"
        btnRef.current.firstChild.disabled = true
    }
    const landingPageClick = () => {
        if (previousClickedRef.current === null){
            return
        }

        onClickDisabledRef.current = !onClickDisabledRef.current
        deactivateButton(previousBtnRef)
        deactivateButton(nextBtnRef)

        dimInfoRef.current.style.transition = "opacity 0.5s ease, transform 1.5s ease";
        dimInfoRef.current.style.opacity = 0;
        dimInfoRef.current.style.transform = `translate(0vw, 0vh)`;

        mainDimDoughnutsRefs.current[previousClickedRef.current].current.style.transition = "opacity 0.5s ease, transform 1.5s ease";
        mainDimDoughnutsRefs.current[previousClickedRef.current].current.style.transform = `translate(0vw, 0vh)`;

        extraInfoRef.current.style.opacity = 0;

        setTimeout(() => {
            renderContentWithBaseInfo()
        }, 500)

        setTimeout(() => {
            dimInfoRef.current.style.display = "none";
            for (let i = 0; i < mainDimDoughnutsRefs.current.length; i++){
                mainDimDoughnutsRefs.current[i].current.style.transition = "opacity 0.7s ease, transform 1.5s ease, background-color 0.5s ease";
                mainDimDoughnutsRefs.current[i].current.style.opacity = 1
                extraInfoRef.current.style.opacity = 1;
            }
        }, 700)

        mainDimRef.current.style.height = "27%";
        extraInfoRef.current.style.height = "calc(73% - 0.5vw)";
        for (let i = 0; i < mainDimDoughnutsRefs.current.length; i++){
            mainDimDoughnutsRefs.current[i].current.classList.add("hovered_action");
        }
        logoContainerRef.current.classList.remove("activated");
        previousClickedRef.current = null
    }

    return (
        <div ref={logoContainerRef} className="logo-container" onClick={() => landingPageClick()}>
            <img src={logoImg} alt={""}/>
            <div className={"logo-text"}>
                <p>GRAPH</p>
            </div>

        </div>
    );
};

export default Logo;
