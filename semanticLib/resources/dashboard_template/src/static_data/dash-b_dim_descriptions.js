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

const readability_desc =
    <>
        <p><b>Readability</b> measures how easily users can interpret and navigate the textual elements—such as identifiers (labels and titles) and descriptions—within a knowledge graph (KG).
            It focuses on the clarity, comprehensibility, and accessibility of these annotations, ensuring users can effectively understand the presented information.
            Key Components of Readability:</p>

        <ul>
            <li><p><b>Word Existence</b>: Examines the presence of words in established lexicons, distinguishing between recognized and unrecognized words to assess the validity of the identifiers and descriptions.</p></li>
            <li><p><b>Style Consistency</b>: Evaluates adherence to defined naming conventions and structures, ensuring that text elements in the KG maintain uniformity, which enhances overall readability.</p></li>
            <li><p><b>Language Confidence</b>: Measures the reliability of language detection within <b>descriptions</b> to confirm that content is communicated in the intended language, with penalties for non-English content when English is expected.</p></li>
            <li><p><b>Cognates Absence</b>: Assesses the uniqueness of <b>identifiers</b> by checking for synonyms and hypernyms, ensuring that each identifier aligns precisely with expected terminologies.</p></li>
            <li><p><b>Encoding Information Penalty</b>: Applies when language encoding information (e.g., @en) is missing, which impacts the data's quality score.</p></li>
        </ul>

        <p>Readability is essential for enhancing user experience, ensuring that the knowledge graph’s annotations are straightforward to interpret and apply in various contexts.
            A high readability score indicates that the KG’s textual elements are user-friendly, reducing ambiguity and promoting efficient use of the data.</p>
        <ExpandComponent/>
    </>


export const dashboard_metricDescriptions = {
        0: completeness_desc,
        1: consistency_desc,
        2: readability_desc,
}