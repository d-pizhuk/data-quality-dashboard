import {createRoot} from "react-dom/client";
import * as d3 from "d3";
import {useRef} from "react";

export const clear= (componentRef, componentRootRef) => {
    if (componentRootRef.current) {
        componentRootRef.current.unmount();
        componentRootRef.current = null;
    }

    componentRef.current.innerHTML = '';
    componentRootRef.current = createRoot(componentRef.current);
}


export const colorsPalette = ['#688cb0', '#b6cede', '#93bbce', '#fffdf8']

export const renderColor = (amount) => {
    if (amount > 4) {
        throw new Error("Amount of colors should be not higher than 4");
    }

    return amount === 1
        ? colorsPalette[0]
        : colorsPalette.slice(0, amount);
}

export const hasParentWithClass = (node, class_name) => {
    if (!node) return false;
    if (node.classList && node.classList.contains(class_name)) return true;
    return hasParentWithClass(node.parentNode, class_name);
};

export const createTooltip = () => {
    let tooltip = d3.select(".tooltip");
    if (tooltip.empty()) {
        tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("background", "rgba(255, 255, 255, 0.97)")
            .style("border", "1px solid #ccc")
            .style("padding", "10px")
            .style("border-radius", "4px")
            // .style("pointer-events", "none")
            .style("opacity", 0)
            .style("z-index", 10);
    }
    return tooltip
}