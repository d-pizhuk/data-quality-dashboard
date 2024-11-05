import ExpandComponent from "../components/ExpandComponent";


const completeness_desc =
    <>
        <p><b>Completeness</b> measures the extent to which the data in a knowledge graph is fully populated and covers the required aspects.
            It evaluates various components to ensure that the dataset is comprehensive and includes all necessary information for its intended use.
            Key Components of Completeness:</p>

        <ul>
            <li><p><b>Class Completeness</b>: Evaluates the presence of instances for each class within the ontology.</p></li>
            <li><p><b>Property Completeness</b>: Assesses the usage of properties within the dataset.</p></li>
            <li><p><b>Relationship Completeness</b>: Ensures that essential relationships and properties are present in the dataset.</p></li>
            <li><p><b>Metadata Completeness</b>: Ensures that key metadata elements are present and appropriately populated in the ontology, classes, and instances.</p></li>
            <li><p><b>Interlinking Completeness</b>: Assesses the degree of linkage between entities within the dataset.</p></li>
        </ul>

        <p>Completeness is crucial for ensuring that a knowledge graph provides a full and accurate representation of the domain it models.
            A high completeness score indicates that the dataset is well-populated, connected, and rich in necessary information, making it reliable and useful for various applications.</p>
        <ExpandComponent/>
    </>

const consistency_desc =
    <>
        <p><b>The dimension of consistency</b> in data quality measures how well data adheres to its expected definitions and formats. It assesses multiple components to verify that properties,
            data types, and formats are accurately defined and used. Key Components of Consistency:</p>
        <ul>
            <li><p><b>Property Definition Consistency</b>: Ensures that the domains and ranges of properties are properly defined and that properties are not ambiguous.</p></li>
            <li><p><b>Format Consistency</b>: Evaluates the uniformity of data formats, such as dates, strings, numbers, and booleans, ensuring they conform to the expected standards.</p></li>
            <li><p><b>Scope Conformity</b>: Measures how well the values assigned to properties conform to their defined domains and ranges.</p></li>
            <li><p><b>Scope Specificity</b>: Ensures that domains and ranges are specific enough to reduce ambiguity, avoiding the use of overly broad concepts such as <code className="custom-code">rdf:Resource</code> or <code className="custom-code">owl:Thing</code></p></li>
            <li><p><b>Conflict Detection</b>: Detects potentially dangerous or conflicting triples, such as contradictory statements or property misuse.</p></li>
        </ul>

        <p>Consistency is essential for maintaining the integrity and reliability of a knowledge graph, ensuring that it follows established rules and conventions. A high consistency score
            indicates that the dataset is well-structured, precise, and free from logical contradictions, making it more trustworthy for analysis and use.</p>
        <ExpandComponent/>
    </>

const schema_readability_desc =
    <>
        <p><b>Schema Readability</b> measures how easily the textual elements of a knowledge graph can be understood by human users.
            It focuses on the clarity, comprehensibility, and accessibility of the schema, ensuring that users can interpret and navigate the information effectively.
            Key Components of Schema Readability:</p>

        <ul>
            <li><p><b>Word Existence</b>: Examines the presence of words in established lexicons, differentiating between existing and non-existing words to assess the validity of the labels and descriptions.</p></li>
            <li><p><b>Style Consistency</b>: Checks for adherence to defined naming styles and conventions, ensuring that schema elements maintain a uniform structure and style, which enhances overall readability.</p></li>
            <li><p><b>Language Confidence</b>: Measures the reliability of language detection in <b>descriptions</b> to ensure that the schema communicates effectively in the intended language, accounting for any penalties associated with non-English content.</p></li>
            <li><p><b>Cognates Evaluation</b>: Assesses the lack of synonyms and hypernyms, ensuring the data is precise and aligned with expected terminologies.</p></li>
            <li><p><b>Encoding Information Penalty</b>: Applies when encoding information is not present, impacting overall data quality assessment.</p></li>
        </ul>

        <p>Schema readability is essential for enhancing user experience, ensuring that the knowledge graph can be easily interpreted and leveraged for decision-making.
            A high readability score indicates that the schema is user-friendly, minimizing confusion and promoting efficient use of the dataset.</p>
        <ExpandComponent/>
    </>


export const dashboard_metricDescriptions = {
        0: completeness_desc,
        1: consistency_desc,
        2: schema_readability_desc,
}