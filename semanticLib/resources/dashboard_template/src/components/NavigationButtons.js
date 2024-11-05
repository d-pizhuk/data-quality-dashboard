import React from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';


const NavigationButtons = (refs) => {

    const {
        previousBtnRef,
        nextBtnRef,
        previousClickedRef,
        navBtnFunc
    } = refs;

    const previousClick = () => {
        navBtnFunc(previousClickedRef.current-1)
    }
    const nextClick = () => {
        navBtnFunc(previousClickedRef.current+1)
    }

    return (
        <>
            <div ref={previousBtnRef} className="previous-action">
                <button className={"back_btn"} onClick={() => previousClick()}><ArrowBackIcon/></button>
                <p className={"previous-name"}></p>
            </div>

            <div ref={nextBtnRef}  className="next-action">
                <button className={"forward_btn"} onClick={() => nextClick()}><ArrowBackIcon/></button>
                <p className={"next-name"}></p>
            </div>
        </>
        );

};

export default NavigationButtons;
