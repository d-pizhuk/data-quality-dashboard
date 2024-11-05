import React, {useCallback, useEffect, useRef, useState} from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import './styles/ExpandComponent.css'

const ExpandComponent = () => {
    const expandRef = useRef(null);
    const previousHeight = useRef(null)
    const [clicked, setClicked] = useState(false);

    const handleClick = () => {
        if (!clicked) {
            expandClick();
        } else {
            shrinkClick();
        }
    };

    const expandClick = () => {
        const parentEl = expandRef.current?.parentElement;
        previousHeight.current = parentEl.offsetHeight
        const svgEl = expandRef.current?.firstChild;

        if (parentEl) {
            parentEl.style.transition = "height 0.5s ease, background-color 0.5s ease";
            parentEl.style.height = `${100 * (parentEl.scrollHeight) / window.innerWidth}vw`;
            parentEl.style.backgroundColor = "rgba(206, 208, 209, 1)";

            parentEl.style.borderWidth = '1px';
            parentEl.style.borderColor = 'rgb(159,159,159)';
            parentEl.style.borderStyle = 'solid';
        }

        if (svgEl) {
            svgEl.style.transition = "transform 0.5s ease";
            svgEl.style.transform = "scaleY(-1)";
        }

        setClicked(true)
    }

    const shrinkClick = () => {
        const parentEl = expandRef.current?.parentElement;
        const svgEl = expandRef.current?.firstChild;

        const parentElStyles = window.getComputedStyle(parentEl);
        const paddingTop = parseFloat(parentElStyles.paddingTop);
        const paddingBottom = parseFloat(parentElStyles.paddingBottom);


        if (parentEl) {
            parentEl.style.transition = "height 0.5s ease, background-color 0.5s ease";
            parentEl.style.height = 100 * (previousHeight.current - paddingTop - paddingBottom) / window.innerWidth + "vw"
            parentEl.style.backgroundColor = "rgba(255, 255, 255, 0.69)";

            parentEl.style.borderWidth = '0px';
        }

        if (svgEl) {
            svgEl.style.transition = "transform 0.5s ease";
            svgEl.style.transform = "scaleY(1)";
        }

        setClicked(false)
    }

    const shrinkOnResize = useCallback(() => {
        if (clicked){
            const parentEl = expandRef.current?.parentElement;
            const svgEl = expandRef.current?.firstChild;

            if (parentEl) {
                parentEl.style.backgroundColor = "rgba(255, 255, 255, 0.69)";
                parentEl.style.borderWidth = '0px';
            }

            if (svgEl) {
                svgEl.style.transition = "transform 0.5s ease";
                svgEl.style.transform = "scaleY(1)";
            }

            setClicked(false)
        }
    }, [clicked])

    const handleOutsideClick = useCallback((event) => {
        const parentEl = expandRef.current?.parentElement;
        const logoBtn = document.querySelector(".logo-container")
        if (clicked && parentEl && !parentEl.contains(event.target) && !logoBtn.contains(event.target)) {
            shrinkClick();
        }

        if (logoBtn.contains(event.target)){
            shrinkOnResize()
        }
    }, [clicked, shrinkOnResize]);

    const updateSVGPosition = useCallback(() => {
        const parentEl = expandRef.current?.parentElement;
        const svgEl = expandRef.current?.firstChild;
        const scrollbarWidth = parentEl.offsetWidth - parentEl.clientWidth;
        svgEl.style.left = parentEl.offsetWidth - svgEl.getBoundingClientRect().width - scrollbarWidth - 15
    }, []);

    useEffect(() => {
        window.addEventListener('resize', shrinkOnResize);
        return () => {
            window.removeEventListener('resize', shrinkOnResize);
        };
    }, [shrinkOnResize]);

    useEffect(() => {
        document.addEventListener('click', handleOutsideClick);
        return () => {
            document.removeEventListener('click', handleOutsideClick);
        };
    }, [handleOutsideClick]);

    useEffect(() => {
        const parentEl = expandRef.current?.parentElement;
        const svgEl = expandRef.current?.firstChild;

        const handleScroll = () => {
            if (expandRef.current) {
                const currentScroll = parentEl.scrollTop;
                svgEl.style.top = currentScroll + "px"
            }
        };

        parentEl.addEventListener('scroll', handleScroll);
        return () => {
            parentEl.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => {
        updateSVGPosition()
        window.addEventListener('resize', updateSVGPosition);
        return () => {
            window.removeEventListener('resize', updateSVGPosition);
        };
    }, [updateSVGPosition]);


    return (
        <div className={"expand"} ref={expandRef} onClick={handleClick}>
            <KeyboardArrowDownIcon/>
        </div>
    );
};

export default ExpandComponent;
