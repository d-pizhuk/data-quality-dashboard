import DoughnutChartComp from "../components/DoughnutChartComp";
import ReadabilityHistogram from "../components/ReadabilityHistogram";
import PieChartComp from "../components/PieChartComp";
import React from "react";
import MetadataHeatmap from "../components/MetadataHeatmap";
import completeness_data from './data/completeness.json';
import consistency_data from './data/consistency.json';
import readability_data from './data/readability.json';
import Carousel from "../components/Carousel";
import CollapsibleCheckboxList from "../components/CollapsibleCheckboxList";
import Latex from 'react-latex-next';
import DropdownBtn from "../components/DropdownBtn";
import ChartGallery from "../components/ChartGallery";
import StackedBarChart from "../components/StackedBarChart";


const class_completeness =
    <DoughnutChartComp
        className={"doughnut-diagram"}
        value={completeness_data.class_completeness.value*100}
        title={"class completeness"}/>

const class_ratio =
    <PieChartComp
        data={[completeness_data.class_completeness.classes_with_instances, completeness_data.class_completeness.classes_without_instances]}
        labels={["Classes with Instances", "Classes without Instances"]}
        title={"class ratio"}/>

const prop_completeness =
    <DoughnutChartComp
        className={"doughnut-diagram"}
        value={completeness_data.property_completeness.value*100}
        title={"property completeness"}/>

const prop_ratio =
    <PieChartComp
        data={[completeness_data.property_completeness.populated_props, completeness_data.property_completeness.unpopulated_props]}
        labels={["Populated Properties", "Unpopulated Properties"]}
        title={"property ratio"}/>

const relationship_completeness =
    <DoughnutChartComp
        className={"doughnut-diagram"}
        value={completeness_data.relationship_completeness*100}
        title={"relationship completeness"}/>


const onto_md_heatmap = <MetadataHeatmap onto_data={completeness_data.onto_md_heatmap_data} hm_name={"Ontology Metadata MetadataHeatmap"}/>

//for ontology, class and instance metadata
const metadata_completeness_doughnut =
    <DoughnutChartComp
        className={"doughnut-diagram"}
        value={completeness_data.metadata_completeness*100}
        title={"metadata completeness"}/>

const ontology_md_doughnut =
    <DoughnutChartComp
        className={"doughnut-diagram"}
        value={completeness_data.ontology_md_completeness*100}
        title={"ontology metadata completeness"}/>

const class_md_doughnut =
    <DoughnutChartComp
        className={"doughnut-diagram"}
        value={completeness_data.class_md_completeness*100}
        title={"class metadata completeness"}/>

const instance_md_doughnut =
    <DoughnutChartComp
        className={"doughnut-diagram"}
        value={completeness_data.instance_md_completeness*100}
        title={"instance metadata completeness"}/>

const md_data_carousel = <Carousel data={[ontology_md_doughnut, class_md_doughnut, instance_md_doughnut]}/>

const interlinking_score_doughnut =
    <DoughnutChartComp
        className={"doughnut-diagram"}
        value={completeness_data.interlinking_completeness*100}
        title={"interlinking completeness"}/>


const class_completeness_desc =
    <div className={"desc_container"}>
        <p>
            <b>Class Completeness</b> is calculated by dividing the number of classes with instances by the total number of classes.<br/><br/>
            The <b>Class Ratio</b> pie chart shows the distribution of classes with and without instances. One section represents the
            proportion of classes that have instances, while the other section shows the proportion of classes without instances.
        </p>
    </div>

const property_completeness_desc =
    <div className={"desc_container"}>
        <p>
            <b>Property Completeness</b> is calculated by dividing the number of populated properties to the total number of properties.<br/><br/>
            The <b>Property Ratio</b> pie chart illustrates the distribution between populated and non-populated properties. One section represents
            the share of populated properties, while the other highlights the proportion of non-populated properties.
        </p>
    </div>

const relationship_completeness_desc =
    <div className={"desc_container wide"}>
        <p><b>Relationship Completeness</b> measures how many instances of a subject conform to a specific relationship pattern (subject-predicate-object)
            within a dataset. For each statement, the process checks if an instance of the subject has a valid relationship with an object through a specific predicate.</p><br/>

            <p>For better understanding of this metric, the formula of its calculation is introduced:</p>
        <p><Latex>{`$RC = \\frac{1}{n} \\sum_{i=1}^n \\frac{S_i}{T_i}$`}</Latex></p>
        <p>Where:</p>
            <ul>
                <li><p><Latex>{`$RC$`}</Latex> is the overall relationship completeness.</p></li>
                <li><p><Latex>{`$n$`}</Latex> is the number of statements.</p></li>
                <li><p><Latex>{`$S_i$`}</Latex> is the number of subject instances that conform to the relationship in the <Latex>{`$i$`}</Latex>-th statement.</p></li>
                <li><p><Latex>{`$T_i$`}</Latex> is the total number of subject instances in the <Latex>{`$i$`}</Latex>-th statement.</p></li>
            </ul>
    </div>

const md_desc =
    <div className={"desc_container wide"}>
        <p>
            <b>Metadata Completeness</b> evaluates how well key metadata properties (both essential and optional) are populated across different levels: ontology, class, and instance.
            The process assigns weights(0.5, 0.3 and 0.2 respectively) to each component (ontology, class, and instance metadata) to calculate an overall score. In the next slide the more detailed information
            on each component can be found.
        </p>
    </div>

const md_components_desc =
    <div className={"desc_container"}>
        <ol>
            <li><p><b>Ontology MD Completeness</b>: This component is determined by assessing the presence of essential and optional metadata elements across all ontologies.
                Essential metadata elements are given more weight, and the score primarily depends on how many of these essential elements are present.
                If the essential metadata score falls below a certain threshold, the presence of optional metadata slightly influences the final score.</p></li>
            <li><p><b>Class MD Completeness</b>: This component is calculated based on the presence of key metadata elements for all classes, showing how well these elements are documented across all classes.</p></li>
            <li><p><b>Instance MD Completeness</b>: Similar to the class MD completeness, this component is calculated by evaluating the presence of key metadata elements for all instances.</p></li>
        </ol>
    </div>

const onto_md_heatmap_desc =
    <div className={"desc_container"}>
        <p>This heatmap visualizes the presence of various metadata properties across different ontologies and is designed to help you understand which metadata are missing.</p>

        <ol>
            <li><p><b>X-Axis</b>: Lists metadata properties, including both essential and optional ones.</p></li>
            <li><p><b>Y-Axis</b>: Lists ontologies.</p></li>
            <li><p><b>Cells</b>: Colored to show whether a metadata property is present in an ontology. Darker colors indicate presence, while lighter colors indicate absence.</p></li>
            <li><p><b>Tooltip</b>: Provides details about the ontology and metadata property when hovering over a cell or y-axis label.</p></li>
        </ol>
    </div>


const interlinkingCompleteness_desc =
    <div className={"desc_container wide"}>
        <p>To assess the interlinking of entities, we evaluate three key components:</p>

        <ol>
            <li><p><b>Class Interlinking</b>: We measure how well different classes are interconnected. This involves looking at how many classes are linked to others compared to the total number of classes available.</p></li>
            <li><p><b>Property Interlinking</b>: We assess the interconnections between properties. This is done by comparing the number of properties that are linked to others with the total number of properties.</p></li>
            <li><p><b>Instance Interlinking</b>: We evaluate the interlinking of instances, which includes the count of linked instances versus the total number of instances.</p></li>
        </ol>

        <p>Each of these components is analyzed to produce a score, which reflects the overall completeness of interlinking across classes, properties, and instances. The final interlinking completeness score is the average of these individual
            scores, giving you a comprehensive view of how well different parts of your data are connected.</p>
    </div>

// consistency

const prop_def_consistency =
    <DoughnutChartComp
        className={"doughnut-diagram"}
        value={consistency_data.prop_def_consistency*100}
        title={"property definition consistency"}/>

const prop_scope_ratio =
    <PieChartComp
        data={[consistency_data.props_with_both_am, consistency_data.props_with_domain_only_am,
            consistency_data.props_with_range_only_am, consistency_data.props_with_both_none_or_blank_nodes_am]}
        labels={["Properties with Both Domain and Range", "Properties with Domain Only", "Properties with Range Only", "Properties without Domain and Range(none or blank node)"]}
        title={"property scope ratio"}/>

const format_consistency =
    <DoughnutChartComp
        className={"doughnut-diagram"}
        value={consistency_data.format_consistency*100}
        title={"format consistency"}/>

const date_format_consistency =
    <DoughnutChartComp
        className={"doughnut-diagram"}
        value={consistency_data.date_format_consistency*100}
        title={"Date Format Consistency"}/>

const string_format_consistency =
    <DoughnutChartComp
        className={"doughnut-diagram"}
        value={consistency_data.str_format_consistency*100}
        title={"String Format Consistency"}/>

const number_format_consistency =
    <DoughnutChartComp
        className={"doughnut-diagram"}
        value={consistency_data.num_format_consistency*100}
        title={"Number Format Consistency"}/>

const bool_format_consistency =
    <DoughnutChartComp
        className={"doughnut-diagram"}
        value={consistency_data.bool_format_consistency*100}
        title={"Boolean Format Consistency"}/>

const format_carousel = <Carousel data={[date_format_consistency, string_format_consistency, number_format_consistency, bool_format_consistency]}/>

const scope_conformity_score =
    <DoughnutChartComp
        className={"doughnut-diagram"}
        value={consistency_data.scope_conformity_score*100}
        title={"scope conformity score"}/>

const scope_specificity_score =
    <DoughnutChartComp
        className={"doughnut-diagram"}
        value={consistency_data.scope_specificity_score*100}
        title={"scope specificity score"}/>

const prop_def_desc =
    <div className={"desc_container"}>
        <p><b>Property Definition Consistency</b> assesses how well the domains and ranges of properties are defined within a knowledge graph. <br/><br/>
            To calculate it, properties with only a domain, only a range, and both domain and range are identified. It is important to note that any domains and ranges defined
            as blank nodes are considered absent for the property. Properties with only a domain or only a range are counted as half-defined each, while
            properties with both domain and range definitions are counted as fully defined. The final consistency score is computed by summing the
            contributions of properties with both domains and ranges and those with only one, then dividing by the total number of properties to obtain a normalized score.<br/><br/></p>

        <p>For better understanding of this metric, the formula of its calculation is introduced:</p>
        <p><Latex>{`$PDC = \\frac{\\frac{P_d+P_r}{2}+P_b}{A}$`}</Latex></p>

        <p>Where:</p>
        <ul>
            <li><p><Latex>{`$PDC$`}</Latex> is the overall property definition consistency.</p></li>
            <li><p><Latex>{`$P_d$`}</Latex> is the number of properties with domain only.</p></li>
            <li><p><Latex>{`$P_r$`}</Latex> is the number of properties with range only.</p></li>
            <li><p><Latex>{`$P_b$`}</Latex> is number of properties with both domain and range defined.</p></li>
            <li><p><Latex>{`$A$`}</Latex> is number of all properties.</p></li>
        </ul>
    </div>

const format_consistency_desc =
    <div className={"desc_container wide"}>
        <p>
            <b>Format Consistency</b> refers to the uniformity in the representation of various types of data within a dataset or system. It ensures that dates,
            strings, numbers, and boolean values adhere to a consistent format, facilitating better data integrity, accuracy, and usability. <br/><br/>

            The process of calculating format consistency involves assessing several key components: <b>date format consistency</b>, <b>string format consistency</b>,
            <b> number format consistency</b> and <b>boolean format consistency</b>, which are described in more detail in the next slide. <br/><br/>

            Each of these components is calculated independently and then combined to provide an overall measure of format consistency.
            The final score is determined by averaging the consistency scores across these categories, resulting in a unified metric that reflects the overall data format quality.
        </p>
    </div>

const format_consistency_components_desc_dict = {
    "date_format_consistency":
        {
            "name": "Date Format Consistency",
            "desc": "<b>Date Format Consistency</b> ensures that all date values in a dataset are not only correctly typed but also conform to ISO 8601 format, " +
                "such as <code class=\"custom-code\">YYYY-MM-DD</code>. The dataset is examined for entries where the date properties (e.g., <code class=\"custom-code\">dcterms:created</code>, " +
                "<code class=\"custom-code\">dc:date</code>, <code class=\"custom-code\">dcterms:issued</code>) are represented using the <code class=\"custom-code\">xsd:date</code> datatype," +
                " and the values strictly follow the <code class=\"custom-code\">YYYY-MM-DD</code> pattern. \n" +
                "<ul>\n" +
                "<li><p><b>Key Calculation</b>: It is computed as the ratio of correctly formatted and typed dates (following the <code class=\"custom-code\">YYYY-MM-DD</code> format) to the total number " +
                "of date entries in the dataset.</p></li>\n" +
                "<li><p><b>Example</b>: If some date entries are typed as strings or follow other formats like <code class=\"custom-code\">MM/DD/YYYY</code>, they reduce the overall consistency score. " +
                "Properly formatted dates like <code class=\"custom-code\">2023-09-15</code> increase it.</p></li>\n" +
                "</ul>"
        },
    "str_format_consistency":
        {
            "name": "String Format Consistency",
            "desc": "<b>String Format Consistency</b> ensures that text data is properly formatted and conforms to expected rules regarding language encoding, valid characters, and non-emptiness." +
                "<ul>\n" +
                "<li><p><b>Key Components</b>:</p></li>" +
                "<ul>\n" +
                "<li><p><b>Language Encoding</b>: Verifies that string entries include proper language tags or encodings (e.g., distinguishing between English and French).</p></li>" +
                "<li><p><b>Valid Characters</b>: Ensures that strings contain only permitted characters, avoiding corrupt or unsupported symbols.</p></li>" +
                "<li><p><b>Non-emptiness</b>: Checks that string values are not empty.</p></li>" +
                "</ul>" +
                "</p></li>\n" +
                "<li><p><b>Key Calculation</b>: This metric of consistency is evaluated by calculating the average of the language encoding, valid character usage, and non-emptiness scores.</p></li>\n" +
                "</ul>"
        },
    "num_format_consistency":
        {
            "name": "Number Format Consistency",
            "desc": "<b>Number Format Consistency</b> ensures that numerical values are correctly typed and not mistakenly stored as strings." +
                "<ul>\n" +
                "<li><p><b>Key Components</b>:</p></li>" +
                "<ul>\n" +
                "<li><p><b>Correctly Typed Numbers</b>: Numbers should be stored in their correct type (e.g., integers or floating points) rather than being stored as strings.</p></li>" +
                "<li><p><b>Numbers in Strings</b>: Identifies numeric values stored as strings, which can cause issues when processing data.</p></li>" +
                "</ul>" +
                "</p></li>\n" +
                "<li><p><b>Key Calculation</b>: The ratio of correctly typed numbers to the total number of numeric values (including those mistakenly stored as strings) " +
                "determines the number format consistency.</p></li>\n" +
                "</ul>"
        },
    "bool_format_consistency":
        {
            "name": "Boolean Format Consistency",
            "desc": "<b>Boolean Format Consistency</b> ensures that boolean values are correctly typed and not mixed with string representations of boolean values (e.g., \"true\" or \"false\")." +
                "<ul>\n" +
                "<li><p><b>Key Components</b>:</p></li>" +
                "<ul>\n" +
                "<li><p><b>Correctly Typed Booleans</b>: Ensures that boolean values are stored using the correct data type rather than as strings.</p></li>" +
                "<li><p><b>Booleans in Strings</b>: Detects boolean values that are represented as strings rather than their intended boolean type.</p></li>" +
                "</ul>" +
                "</p></li>\n" +
                "<li><p><b>Key Calculation</b>: The ratio of correctly typed booleans to the total number of boolean values (including those stored as strings) reflects the boolean format consistency.</p></li>\n" +
                "</ul>"
        }
}

const format_consistency_components_desc =
    <div className={"desc_container"}>
        <DropdownBtn data={format_consistency_components_desc_dict}/>
    </div>

const scope_conf_and_specificity_desc_dict = {
    "scope_conformity":
        {
            "name": "Scope Conformity",
            "desc": "<b>Scope Conformity</b> measures how well the actual data in a dataset adheres to the predefined domains and ranges of properties. In RDF or ontology-based systems, " +
                "each property typically has an associated <b>domain</b> (the class of the subject) and <b>range</b> (the class of the object) that specifies where and how it should be used. Scope " +
                "conformity evaluates the percentage of property triples that align with these definitions.<br/><br/>" +
                "<b>Calculation:</b>" +
                "<ul>\n" +
                "<li><p>For each property, the system computes the ratio of property triples where the subject (for domain conformity) or object (for range conformity) conforms to the " +
                "explicitly defined domain or range. This is done by comparing the number of triples that match the domain or range to the total number of triples for that property.</li>" +
                "<li><p>The final conformity score is the mean of domain and range conformity values across all properties in the dataset.</p></li>" +
                "</ul>" +
                "<b>Example:<br/><br/></b>" +
                "If a property <code class=\"custom-code\">dcterms:created</code> has a domain of <code class=\"custom-code\">Person</code> and a range of <code class=\"custom-code\">Date</code>," +
                " but some triples use <code class=\"custom-code\">Document</code> as the subject or a string as the object, the scope conformity for that property would be reduced."
        },
    "scope_specificity":
        {
            "name": "Scope Specificity",
            "desc": "<b>Scope Specificity</b> evaluates how specific or broad the defined domains and ranges of properties are. It identifies whether the domains and ranges are too generic (overly broad) " +
                "or sufficiently detailed, thus helping to improve data quality by avoiding vague classifications." +
                "<ul>\n" +
                "<li><p><b>Overly Broad URIs</b>: Certain URIs represent overly broad categories (e.g., <code class=\"custom-code\">Thing</code> or <code class=\"custom-code\">Resource</code>) that " +
                "are not specific enough to provide meaningful context. The system evaluates how many of the defined domains and ranges use overly broad URIs compared to more specific ones.</p></li>" +
                "<li><p><b>Non-broad Items</b>: The number of non-broad domain and range definitions (i.e., those that are not overly broad) is counted to determine the specificity.</p></li>" +
                "</ul>" +
                "<b>Calculation</b>: <br/>" +
                "<ul>\n" +
                "<li><p>The system calculates the ratio of non-broad domains to the total number of defined domains and the ratio of non-broad ranges to the total number of defined ranges.</p></li>" +
                "<li><p>The final specificity score is the mean of these two proportions.</p></li>" +
                "</ul>" +
                "<b>Example</b>: <br/><br/>" +
                "If a property has a domain defined as <code class=\"custom-code\">Thing</code> and a range as <code class=\"custom-code\">Literal</code>, it is considered overly broad, and the scope " +
                "specificity will be low. If the domain is defined as <code class=\"custom-code\">Person</code> and the range as <code class=\"custom-code\">Date</code>, the specificity score will " +
                "increase because these are more precise definitions."
        }
}

const scope_conf_and_specificity_descs =
    <div className={"desc_container"}>
        <DropdownBtn data={scope_conf_and_specificity_desc_dict}/>
    </div>

// readability
const identifier_readability =
    <DoughnutChartComp
        className={"doughnut-diagram"}
        value={readability_data.identifier_readability.value*100}
        title={"identifier readability"}/>

const identifier_enc_info = <PieChartComp
    data={[readability_data.identifier_readability.with_enc_info, readability_data.identifier_readability.without_enc_info]}
    labels={["Identifiers With Encoding Information", "Identifiers Without Encoding Information"]}
    title={"encoding information ratio"}
    tooltipEnabled={false}/>

const identifier_nonsense_info = <PieChartComp
    data={[readability_data.identifier_readability.existing_words, readability_data.identifier_readability.non_existing_words]}
    labels={["Existing Words", "Non-existing words"]}
    title={"word existence ratio"}
    tooltipEnabled={false}/>

const identifier_style_consistency_mean =
    <DoughnutChartComp
        className={"doughnut-diagram"}
        value={readability_data.identifier_readability.style_consistency_mean*100}
        title={"style consistency mean"}/>

const cognates_ratio_barChart =
    <StackedBarChart
        data={[[readability_data.identifier_readability.identifiers_with_synonym, readability_data.identifier_readability.identifiers_with_hypernym],
            [readability_data.identifier_readability.identifiers_without_synonym, readability_data.identifier_readability.identifiers_without_hypernym]]}
        labels={["Synonyms", "Hypernyms"]}
        pointLabels={[["Identifiers which have Synonym in other Identifiers", "Identifiers which doesn't have Synonym in other Identifiers"],
            ["Identifiers which have Hypernym in other Identifiers", "Identifiers which have doesn't Hypernym in other Identifiers"]]}
        title={"Cognates Ratio"}
        tooltipEnabled={false}
        xAxisDisplay={false}/>

const identifier_chartGallery = <ChartGallery mainChart={identifier_readability} secondaryCharts={[identifier_enc_info, identifier_nonsense_info, identifier_style_consistency_mean, cognates_ratio_barChart]}/>

const identifier_readability_scores_histogram = <ReadabilityHistogram data={readability_data.identifier_readability_scores} name={"Distribution of readability scores for identifiers"}/>

const desc_readability =
    <DoughnutChartComp
        className={"doughnut-diagram"}
        value={readability_data.desc_readability.value*100}
        title={"description readability"}/>

const desc_enc_info = <PieChartComp
    data={[readability_data.desc_readability.with_enc_info, readability_data.desc_readability.without_enc_info]}
    labels={["Descriptions With Encoding Information", "Descriptions Without Encoding Information"]}
    title={"encoding information ratio"}
    tooltipEnabled={false}/>

const desc_nonsense_info = <PieChartComp
    data={[readability_data.desc_readability.existing_words, readability_data.desc_readability.non_existing_words]}
    labels={["Existing Words", "Non-existing words"]}
    title={"word existence ratio"}
    tooltipEnabled={false}/>

const desc_common_words_proportion_mean =
    <DoughnutChartComp
        className={"doughnut-diagram"}
        value={readability_data.desc_readability.style_consistency_mean*100}
        title={"style consistency mean"}/>

const desc_lang_confidence_mean =
    <DoughnutChartComp
        className={"doughnut-diagram"}
        value={readability_data.desc_readability.lang_confidence_mean*100}
        title={"language confidence mean"}/>

const desc_chartGallery = <ChartGallery mainChart={desc_readability} secondaryCharts={[desc_enc_info, desc_nonsense_info, desc_common_words_proportion_mean, desc_lang_confidence_mean]}/>

const desc_hr_scores_histogram = <ReadabilityHistogram data={readability_data.desc_readability_scores} name={"Distribution of readability scores for descriptions"}/>

const identifier_readability_desc =
    <div className={"desc_container half"}>
        <p><b>Identifier Readability</b> calculation process involves several key steps and metrics designed to evaluate the quality and clarity of <b>identifiers</b> (identifiers =
            titles + labels in KG):</p><br/>

        <ol>
            <li><p><b>Word Existence Evaluation</b>: For each identifier, the individual words are checked for their existence in a lexical database (WordNet).
                This evaluation categorizes words into three types: <b>existing words</b>(words that are found in WordNet), <b>non-existing words</b>(words that are both nonsense and have no recognized meaning)
                and <b>partial matches</b>(words that are not nonsense but do not have full recognition in WordNet).<br/>
                A score is then calculated for each identifier based on the proportion of existing words to the total number of words.</p></li><br/>
            <li><p><b>Style Consistency</b>: it is evaluated based on predefined conventions that may vary depending on whether the identifier represents a class, instance or property. Specific criteria include:</p>
                <ul>
                    <li><p><b>Character Validity</b>: Ensures that identifiers contain only valid characters and do not use improper casing conventions like PascalCase or camelCase.</p></li>
                    <li><p><b>Custom Style Evaluation</b>: Analyzes how the words are formatted and capitalized according to the expected style. This includes checking if the
                        first word is in lowercase for properties or capitalized for class instances.</p></li>
                </ul>
                <p>The style consistency score is derived from the adherence of the identifier to these conventions.</p><br/>
            </li>
            <li><p><b>Cognates Absence Calculation</b>: The evaluation continues by assessing the presence or absence of synonyms and hypernyms for the words within each identifier. The calculations involve
                identifying whether any synonym or hypernym exists in the unique set of words derived from other identifiers. A score is computed based on how many words lack synonyms and hypernyms.</p></li>
        </ol>

        <p>The final readability score for each identifier is calculated by taking the average of the following metrics: <b>word existence score</b>, <b>style consistency score</b>,
            <b> synonym absence score</b>, and <b>hypernym absence score</b>. Additionally, an <b>encoding penalty</b> is applied based on whether the identifier includes encoding information.
            Identifiers without such information incur a penalty, which adjusts the final readability score downwards.</p>
    </div>

const identifier_hr_scores_hist_desc =
    <div className={"desc_container"}>
        <p>
            This histogram is designed to help you better understand the calculations and the quality of text data in the Knowledge Graph. It displays the distribution of readability scores for <b>identifiers</b>.
            The readability scores are quantified in the range from 0% to 100%, which is divided into 10 intervals, each spanning a width of 10. The x-axis of the histogram is divided into 10 bins, each representing a range of readability scores. The y-axis represents
            the frequency of readability scores that fall within each of these bins. For each bin, the histogram shows how many scores fall into that particular range. Overall, the histogram visually represents how readability scores are distributed across the predefined
            score ranges.
        </p>
    </div>

const desc_readability_desc =
    <div className={"desc_container half"}>
        <p><b>Description Readability</b> calculation process involves several key steps and metrics designed to evaluate the quality and clarity of <b>description</b> (important to mention,
            that <b>comments</b> in Knowledge Graph are treated as descriptions):</p><br/>

        <ol>
            <li><p><b>Word Existence Evaluation</b>: For each description, the individual words are checked for their existence in a lexical database (WordNet).
                This evaluation categorizes words into three types: <b>existing words</b>(words that are found in WordNet), <b>non-existing words</b>(words that are both nonsense and have no recognized meaning)
                and <b>partial matches</b>(words that are not nonsense but do not have full recognition in WordNet).<br/>
                A score is then calculated for each description based on the proportion of existing words to the total number of words.</p></li><br/>
            <li><p><b>Style Consistency</b>: it is evaluated based on predefined conventions. Specific criteria include:</p>
                <ul>
                    <li><p><b>Character Validity</b>: Ensures that descriptions contain only valid characters and do not use improper casing conventions like PascalCase or camelCase.</p></li>
                    <li><p><b>Custom Style Evaluation</b>: Analyzes how the words are formatted and capitalized according to the expected style.</p></li>
                </ul>
                <p>The style consistency score is derived from the adherence of the description to these conventions.</p><br/>
            </li>
            <li><p><b>Language Confidence</b>: We measure how confident we are in the detected language of the description. Descriptions with high language confidence receive a better score.</p></li>
        </ol>

        <p>The final readability score for each description is calculated by taking the average of the following metrics: <b>word existence score</b>, <b>style consistency score</b>, and
            <b> language confidence</b>. Additionally, an <b>encoding penalty</b> is applied based on whether the description includes encoding information.
            Descriptions without such information incur a penalty, which adjusts the final readability score downwards.</p>
    </div>

const desc_hr_scores_hist_desc =
    <div className={"desc_container"}>
        <p>
            This histogram is designed to help you better understand the calculations and the quality of text data in the Knowledge Graph. It displays the distribution of readability scores for <b>descriptions</b>.
            The readability scores are quantified in the range from 0% to 100%, which is divided into 10 intervals, each spanning a width of 10. The x-axis of the histogram is divided into 10 bins, each representing a range of readability scores. The y-axis represents
            the frequency of readability scores that fall within each of these bins. For each bin, the histogram shows how many scores fall into that particular range. Overall, the histogram visually represents how readability scores are distributed across the predefined
            score ranges.
        </p>
    </div>

const completeness_detailed_info = [
    [class_completeness, class_ratio, class_completeness_desc],
    [property_completeness_desc, prop_completeness, prop_ratio],
    [relationship_completeness, relationship_completeness_desc],
    [md_desc, metadata_completeness_doughnut],
    [md_data_carousel, md_components_desc],
    [onto_md_heatmap_desc, onto_md_heatmap],
    [interlinking_score_doughnut, interlinkingCompleteness_desc],
]

const consistency_detailed_info = [
    [prop_def_consistency, prop_scope_ratio, prop_def_desc],
    [format_consistency_desc, format_consistency],
    [format_carousel, format_consistency_components_desc],
    [scope_conf_and_specificity_descs, scope_conformity_score, scope_specificity_score],
    [prop_completeness, prop_ratio, property_completeness_desc],
    [<CollapsibleCheckboxList
        data={consistency_data.conflicting_relations.data}
        metadata={consistency_data.conflicting_relations.metadata}
        listTitle={"Potentially Conflicting Triples"}
        listSubtitle={"tick the checkbox to select the conflicting triple(-s)"}
        doughnutChartTitle={"Non-Conflicting Triples Percentage"}
        depthLabels={{0: "Property", 1: "Subject", 2: "Object"}}
        extraInfo={<><p>You can see triples (subject, property, object) where multiple objects are assigned to the same subject-property pair, indicating a potential conflict.<br/>
            They are visualized in a view of tree to provide a better interaction(property -> subject -> object). <br/><br/>

            Steps:</p>
            <ul>
                <li><p>Review the triples and identify inconsistencies.</p></li>
                <li><p>Select the conflicting triples you believe are incorrect.</p></li>
                <li><p>Check how your selection affects the consistency score.</p></li>
            </ul>
            <p>Your input helps improve data accuracy.</p></>}/>],
]

const readability_detailed_info = [
    [identifier_readability_desc, identifier_chartGallery],
    [identifier_readability_scores_histogram, identifier_hr_scores_hist_desc],
    [desc_readability_desc, desc_chartGallery],
    [desc_hr_scores_histogram, desc_hr_scores_hist_desc],
]

export const detailed_info = {
    0: {
        "name" : "completeness",
        "detailed_data": completeness_detailed_info
    },
    1: {
        "name" : "consistency",
        "detailed_data": consistency_detailed_info
    },
    2: {
        "name" : "readability",
        "detailed_data": readability_detailed_info
    },
}

export const getRandomBigChart = () => {
    let bigCharts = [];

    Object.values(detailed_info).forEach((category) => {
        category.detailed_data.forEach((dataArray) => {
            dataArray.forEach((element) => {
                if (React.isValidElement(element) && (element.type === ReadabilityHistogram)) {
                    bigCharts.push(element);
                }
            });
        });
    });

    const randomIndex = Math.floor(Math.random() * bigCharts.length);
    return bigCharts[randomIndex];
};

export const getRandom2SmallCharts = () => {
    let smallCharts = [];

    Object.values(detailed_info).forEach((category) => {
        category.detailed_data.forEach((dataArray) => {
            dataArray.forEach((element) => {
                if (React.isValidElement(element) && ( element.type === PieChartComp)) {
                    smallCharts.push(element);
                }
            });
        });
    });

    if (smallCharts.length < 2) {
        return smallCharts; // Return all available charts if less than 2
    }

    const selectedCharts = [];
    while (selectedCharts.length < 2) {
        const randomIndex = Math.floor(Math.random() * smallCharts.length);
        if (!selectedCharts.includes(smallCharts[randomIndex])) {
            selectedCharts.push(smallCharts[randomIndex]);
        }
    }

    return selectedCharts;
};
