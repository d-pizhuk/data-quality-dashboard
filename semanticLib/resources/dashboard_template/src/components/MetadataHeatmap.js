import React, { useCallback, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import {colorsPalette, createTooltip, hasParentWithClass} from "./utils";
import "./styles/MetadataHeatmap.css"

const MetadataHeatmap = ({ onto_data, hm_name }) => {
    const heatmapRef = useRef();

    const createHeatmap = useCallback(() => {
        const getTextWidth = (text, font) => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            context.font = font;

            const metrics = context.measureText(text);
            return metrics.width;
        }

        const processOntoName = (ontoName, threshold = 80) => {
            const withoutProtocol = ontoName.replace(/^https?:\/\//, '');
            const parts = withoutProtocol.split('/');

            let processedOntoName = ""
            for (let i = parts.length - 1; i >= 0; i--){
                if (i === parts.length - 1) {
                    processedOntoName = parts[i]+processedOntoName
                    if (getTextWidth(processedOntoName+parts[i]) > threshold) {
                        break
                    }
                } else {
                    processedOntoName = parts[i]+"/"+processedOntoName
                    if (getTextWidth(processedOntoName+parts[i]) > threshold) {
                        break
                    }
                }
            }

            let ellipsis = false

            while (getTextWidth(processedOntoName+"...") > threshold) {
                ellipsis = true
                processedOntoName = processedOntoName.slice(0, -1);
            }

            if (ellipsis) {
                processedOntoName = processedOntoName+"..."
            }
            return processedOntoName
        }

        let ontologies = Object.keys(onto_data);
        const data = Object.values(onto_data);

        const processedOntologies = []
        for (let i = 0; i < ontologies.length; i++) {
            processedOntologies.push(processOntoName(ontologies[i]))
        }

        const essentialMetadata = ["dc:title", "dc:creator", "dcterms:created", "dc:identifier", "dc:description", "dcterms:license", "owl:versionInfo", "dcterms:modified"];
        const optionalMetadata = ["dc:contributor", "dc:date", "dc:coverage", "dc:source", "dc:subject", "dc:format", "dc:language", "dc:publisher", "dc:relation", "dc:rights", "dc:type"];
        const allMetadata = essentialMetadata.concat(optionalMetadata);

        const margin = { top: 100, right: 30, bottom: 30, left: 100 };
        const width = heatmapRef.current.offsetWidth - margin.left - margin.right;
        const height = heatmapRef.current.offsetHeight - margin.top - margin.bottom;

        // Clear previous contents
        d3.select(heatmapRef.current).selectAll('*').remove();

        const svg = d3.select(heatmapRef.current)
            .append('svg')
            .attr('class', 'onto_md-heatmap-svg')
            .append('g')
            .attr('class', 'hm-g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const x = d3.scaleBand()
            .range([0, width])
            .domain(allMetadata)
            .padding(0.05);

        const y = d3.scaleBand()
            .range([height, 0])
            .domain(data.map((d, i) => `${processedOntologies[i]}`))
            .padding(0.05);

        svg.append('g')
            .attr('transform', `translate(0, ${-margin.top + 95})`)
            .style('font-size', "0.55vw")
            .call(d3.axisTop(x).tickSize(0))
            .selectAll('text')
            .attr('transform', 'rotate(45)')
            .style('text-anchor', 'end')
            .style('fill', "#414040" )
            .each(function(d, i) {
                const textElement = d3.select(this);
                const textValue = textElement.text();

                if (essentialMetadata.includes(textValue)) {
                    textElement.style('font-weight', 'bold');
                }
            });

        const yAxisGroup = svg.append('g')
            .style('font-size', 12)
            .call(d3.axisLeft(y).tickSize(0));

        yAxisGroup.selectAll('text')
            .style('fill', '#414040');

        const color = d3.scaleOrdinal()
            .domain([0, 1])
            .range([colorsPalette[colorsPalette.length-1], colorsPalette[0]]);

        // Ensure tooltip is created only once
        let tooltip = createTooltip()

        svg.selectAll()
            .data(data.flatMap((row, i) => row.map((value, j) => ({ value, i, j }))))
            .enter()
            .append('rect')
            .attr('x', d => x(allMetadata[d.j]))
            .attr('y', d => y(`${processedOntologies[d.i]}`))
            .attr('width', x.bandwidth())
            .attr('height', y.bandwidth())
            .style('fill', d => color(d.value))
            .on("mouseover", function(event, d) {
                tooltip.style("display", "block");

                const tooltipHTML = tooltip.html(`Ontology: <b>${ontologies[d.i]}</b><br>Metadata: <b>${allMetadata[d.j]}</b><br>The metadata item of hovered cell is ${d.value === "1" ? "" : "<b>not</b> "}used by the ontology of hovered cell`);

                const tooltipWidth = tooltip.node().offsetWidth;
                const tooltipHeight = tooltip.node().offsetHeight;

                const pageWidth = window.innerWidth;

                const firstCell = d3.select(svg.selectAll('rect').node());
                const cellHeight = firstCell.node().getBBox().height;

                let x = event.pageX;
                let y = event.pageY - tooltipHeight - cellHeight;

                if (x + tooltipWidth > pageWidth) x = pageWidth - tooltipWidth - 10; // Ensure it fits on the right

                tooltipHTML.style("left", `${x}px`)
                    .style("top", `${y}px`)

                tooltip.transition()
                    .duration(200)
                    .style("opacity", .97);
            })
            .on("mouseout", function() {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0)
                    .on("end", function() {
                        if (parseFloat(d3.select(this).style("opacity")) === 0) {
                            d3.select(this).style("display", "none");
                        }
                    });
            });

        // Add tooltip functionality for y-axis labels
        yAxisGroup.selectAll('text')
            .on("mouseover", function(event, d) {
                const index = processedOntologies.indexOf(d);

                tooltip.style("display", "block");

                tooltip.transition()
                    .duration(200)
                    .style("opacity", .95);
                tooltip.html(`${ontologies[index]}`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0)
                    .on("end", function() {
                        if (parseFloat(d3.select(this).style("opacity")) === 0) {
                            d3.select(this).style("display", "none");
                        }
                    });
            });

        svg.selectAll('.domain')
            .remove();
    }, [onto_data]);

    useEffect(() => {
        createHeatmap();
        let timeoutId;
        const handleResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(createHeatmap, 100);
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(timeoutId);
        };
    }, [createHeatmap]);

    return <div className="heatmap-wrapper">
        <div className="heatmap-header">
            <p>{hm_name}</p>
        </div>
        <div className={"onto-md_heatmap"} ref={heatmapRef}></div>
    </div>
};

export default MetadataHeatmap;
