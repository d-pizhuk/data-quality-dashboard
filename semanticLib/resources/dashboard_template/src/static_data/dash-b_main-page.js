import DoughnutChartComp from "../components/DoughnutChartComp";
import React from "react";
import {getRandomBigChart} from "./dash-b_metric-plots";
import {getRandom2SmallCharts} from "./dash-b_metric-plots";
import kg_overall_statistics from './data/kg_overall_statistics.json';


export const numeric_info =
    <div className="numeric_info">
        <div className="section">
            <p>Knowledge Graph Statistics</p>
        </div>

        <div className="line"></div>

        <div className="subsection">
            <p><b>#</b> of Ontologies</p><p>{kg_overall_statistics.all_ontologies}</p>
        </div>
        <div className="subsection">
            <p><b>#</b> of Classes</p><p>{kg_overall_statistics.all_classes}</p>
        </div>
        <div className="subsection">
            <p><b>#</b> of Instances</p><p>{kg_overall_statistics.all_instances}</p>
        </div>
        <div className="subsection">
            <p><b>#</b> of Properties</p><p>{kg_overall_statistics.all_properties}</p>
        </div>
        <div className="subsection">
            <p><b>#</b> of String Types</p><p>{kg_overall_statistics.all_strings}</p>
        </div>
        <div className="subsection">
            <p><b>#</b> of Number Types</p><p>{kg_overall_statistics.all_numbers}</p>
        </div>
        <div className="subsection">
            <p><b>#</b> of Boolean Types</p><p>{kg_overall_statistics.all_booleans}</p>
        </div>

        <div className="section">
            <p>Knowledge Graph Statistics excluding External Data</p>
        </div>

        <div className="line"></div>

        <div className="subsection">
            <p><b>#</b> of Classes</p><p>{kg_overall_statistics.custom_classes}</p>
        </div>
        <div className="subsection">
            <p><b>#</b> of Instances</p><p>{kg_overall_statistics.custom_instances}</p>
        </div>
        <div className="subsection">
            <p><b>#</b> of Properties</p><p>{kg_overall_statistics.custom_properties}</p>
        </div>
        <div className="subsection">
            <p><b>#</b> of String Types</p><p>{kg_overall_statistics.custom_strings}</p>
        </div>
        <div className="subsection">
            <p><b>#</b> of Number Types</p><p>{kg_overall_statistics.custom_numbers}</p>
        </div>
        <div className="subsection">
            <p><b>#</b> of Boolean Types</p><p>{kg_overall_statistics.custom_booleans}</p>
        </div>
    </div>


export const createMainDimensions = (completenessVal, consistencyVal, schemaReadability) => [
    <DoughnutChartComp
        className={"doughnut-diagram hovered_action"}
        value={completenessVal}
        title={"completeness"}/>,
    <DoughnutChartComp
        className={"doughnut-diagram hovered_action"}
        value={consistencyVal}
        title={"consistency"}/>,
    <DoughnutChartComp
        className={"doughnut-diagram hovered_action"}
        value={schemaReadability}
        title={"schema readability"}/>,
];

export const renderExtraPlots = () => {
    return (
        <div className="extra_plots">
            {getRandomBigChart()}
            <div className="pie_charts">
                {getRandom2SmallCharts()}
            </div>
        </div>
    )
}
