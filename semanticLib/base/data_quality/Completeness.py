from SPARQLWrapper import SPARQLWrapper
import statistics
from semanticLib.base.data_quality.ADimension import ADimension
from semanticLib.base.data_quality.KGOverallStatistics import KGOverallStatistics
from semanticLib.base.data_quality.utils import get_count_res_from, read_file
from semanticLib.base.data_quality.rel_completeness_statements import ComplexStatementOperator, relationship_completeness_statements


class Completeness(ADimension):
    ONTO_ESSENTIAL_MD = ["dc:title", "dc:creator", "dcterms:created", "dc:identifier", "dc:description",
                              "dcterms:license", "owl:versionInfo", "dcterms:modified"]
    ONTO_OPTIONAL_MD = ["dc:contributor", "dc:date", "dc:coverage", "dc:source", "dc:subject",
                             "dc:format", "dc:language", "dc:publisher", "dc:relation", "dc:rights", "dc:type"]
    CLASS_AND_INSTANCE_ESSENTIAL_MD = ["rdfs:label", "rdfs:comment", "dc:creator", "dcterms:created", "dcterms:modified",
                        "dc:description"]
    
    def __init__(self, sparql: SPARQLWrapper, kg_overall_statistics: KGOverallStatistics):
        super().__init__(kg_overall_statistics)
        self.kg_overall_statistics = kg_overall_statistics
        
        # params for JSON data file generation
        self._completeness: float | None = None
        self._class_completeness: dict = {
            "value": None,
            "classes_with_instances": None,
            "classes_without_instances": None,
        }

        self._relationship_completeness: float | None = None

        self._ontology_md_completeness: float | None = None
        self._class_md_completeness: float | None = None
        self._instance_md_completeness: float | None = None
        self._onto_md_heatmap_data: dict | None = None

        self._metadata_completeness: float | None = None

        self._interlinking_completeness: float | None = None

        # side params
        self.sparql: SPARQLWrapper = sparql

    def to_dict(self):
        return {
            "completeness": self._completeness,
            "class_completeness": self._class_completeness,
            "property_completeness": self._property_completeness,
            "relationship_completeness": self._relationship_completeness,
            "metadata_completeness": self._metadata_completeness,
            "ontology_md_completeness": self._ontology_md_completeness,
            "class_md_completeness": self._class_md_completeness,
            "instance_md_completeness": self._instance_md_completeness,
            "onto_md_heatmap_data": self._onto_md_heatmap_data,
            "interlinking_completeness": self._interlinking_completeness,
        }

    # main calculation
    def calculate(self):
        self._class_completeness["value"] = self.calculate_class_completeness()
        self._property_completeness["value"] = self.calculate_property_completeness()
        self._relationship_completeness = self.calculate_relationship_completeness()
        self._metadata_completeness = self.calculate_metadata_completeness()
        self._interlinking_completeness = self.calculate_interlinking_completeness()

        self._completeness = statistics.mean([
            self._class_completeness["value"],
            self._property_completeness["value"],
            self._relationship_completeness,
            self._metadata_completeness,
            self._interlinking_completeness
        ])

    # class completeness
    def calculate_class_completeness(self):
        all_classes_am = self.kg_overall_statistics._custom_classes_am
        if all_classes_am == 0:
            self._class_completeness["classes_with_instances"] = 0
            self._class_completeness["classes_without_instances"] = 0
            return 0

        classes_with_instances_am = self.get_classes_with_instances_amount()
        classes_without_instances_am = all_classes_am - classes_with_instances_am

        self._class_completeness["classes_with_instances"] = classes_with_instances_am
        self._class_completeness["classes_without_instances"] = classes_without_instances_am
        return classes_with_instances_am / all_classes_am

    # relationship completeness
    def calculate_relationship_completeness(self):
        rel_values_simple = self.gather_rel_completeness_data_for(
            relationship_completeness_statements["simple"], "check_instance_statement")
        rel_values_xsd = self.gather_rel_completeness_data_for(
            relationship_completeness_statements["with_xsd_values"], "check_xsd_instance_statement")
        rel_values_reversed = self.gather_rel_completeness_reversed_data_for(
            relationship_completeness_statements["with_reversed_importance"], "check_reversed_instance_statement")
        rel_values_complex = self.gather_rel_completeness_complex_data_for(
            relationship_completeness_statements["complex"], "check_reversed_instance_statement")

        rel_completeness_values = rel_values_simple + rel_values_xsd + rel_values_reversed + rel_values_complex
        if not rel_completeness_values:
            return 0
        return statistics.mean(rel_completeness_values)
    
    def gather_rel_completeness_data_for(self, statements, file_name):
        rel_completeness_values = []
        max_instances_per_batch = 50
        for statement in statements:
            subject, predicate, obj = statement

            subject_instances = self.get_instances_of(subject)
            if len(subject_instances) == 0:
                continue

            conforming_subject_instances = 0
            for i in range(0, len(subject_instances), max_instances_per_batch):
                batch_instances = subject_instances[i:i + max_instances_per_batch]
                subject_instances_str = ' '.join([f'<{value}>' for value in batch_instances])

                query_template = read_file(file_name=file_name)
                query_formatted = query_template.replace('?instances', subject_instances_str) \
                    .replace('?property', predicate) \
                    .replace('?related_type', obj)

                conforming_subject_instances += get_count_res_from(query_formatted, self.sparql)

            if len(subject_instances) > 0:
                rel_completeness_values.append(conforming_subject_instances / len(subject_instances))
        return rel_completeness_values
    
    def gather_rel_completeness_reversed_data_for(self, statements, file_name):
        rel_completeness_values = []
        max_instances_per_batch = 50
        for statement in statements:
            subject, predicate, obj = statement

            object_instances = self.get_instances_of(obj)
            if len(object_instances) == 0:
                continue

            conforming_object_instances = 0
            for i in range(0, len(object_instances), max_instances_per_batch):
                batch_instances = object_instances[i:i + max_instances_per_batch]
                object_instances_str = ' '.join([f'<{value}>' for value in batch_instances])

                query_template = read_file(file_name=file_name)
                query_formatted = query_template.replace('?objects', object_instances_str) \
                    .replace('?property', predicate) \
                    .replace('?related_type', subject)

                conforming_object_instances += get_count_res_from(query_formatted, self.sparql)

            if len(object_instances) > 0:
                rel_completeness_values.append(conforming_object_instances / len(object_instances))
        return rel_completeness_values
    
    def gather_rel_completeness_complex_data_for(self, statements, file_name):
        rel_completeness_values = []

        for statement in statements:
            common_subject = self.define_common_subject(statement, [])
            if common_subject is None:
                raise ValueError("All subjects in a complex statement must be identical.")
            common_subject_instances = self.get_instances_of(common_subject)
            if len(common_subject_instances) == 0:
                continue

            bool_structure = self.structure_in_boolean_form(statement, common_subject_instances, [])
            common_keys = self.check_and_get_dict_keys(bool_structure)  # all instances
            if common_keys is None or len(common_keys) == 0:
                continue

            conforming_subject_instances = 0
            for key in common_keys:
                bool_structure_for_instance = self.bool_structure_for(key, bool_structure)
                if self.evaluate_bool_structure(bool_structure_for_instance):
                    conforming_subject_instances += 1

            rel_completeness_values.append(conforming_subject_instances / len(common_keys))
        return rel_completeness_values

    def structure_in_boolean_form(self, statements, common_subject_instances, bool_structure):
        max_instances_per_batch = 50

        if isinstance(statements, list):
            if len(statements) < 3:
                raise ValueError("The length of list in complex data should be at least 3, where there are at least 2 statement and the last item is logical operator.")
            
            bool_structured_list = []
            for statement in statements:
                bool_structured_list.append(self.structure_in_boolean_form(statement, common_subject_instances, bool_structure))
            return bool_structured_list
        elif isinstance(statements, tuple):
            _, predicate, obj = statements
            full_bool_structured_dict = {}
            for i in range(0, len(common_subject_instances), max_instances_per_batch):
                batch_instances = common_subject_instances[i:i + max_instances_per_batch]
                subject_instances_str = ' '.join([f'<{value}>' for value in batch_instances])

                query_template = read_file(file_name="get_instance_statements_bool_vals")
                query_formatted = query_template.replace('?instances', subject_instances_str) \
                    .replace('?property', predicate)
                if obj != "_":
                    query_formatted = query_formatted.replace('?related_type', obj)
                
                self.sparql.setQuery(query_formatted)
                results = self.sparql.query().convert()
                bool_structured_dict = {
                    binding["instance"]["value"]: True if binding["exists"]["value"] == "true" else False for binding in results["results"]["bindings"]
                }
                
                full_bool_structured_dict.update(bool_structured_dict)

            return full_bool_structured_dict
        elif isinstance(statements, ComplexStatementOperator):
            return statements
        else:
            raise TypeError("Not supported type in structure.")
        
    def bool_structure_for(self, instance, structure_el):
        if isinstance(structure_el, list):
            bool_structured_list_for_instance = []
            for el in structure_el:
                bool_structured_list_for_instance.append(self.bool_structure_for(instance, el))
            return bool_structured_list_for_instance
        elif isinstance(structure_el, dict):
            return structure_el[instance]
        elif isinstance(structure_el, ComplexStatementOperator):
            return structure_el
    
    def evaluate_bool_structure(self, structure):
        if isinstance(structure, bool): 
            return structure
        elif isinstance(structure, list):  
            operator = None
            values = []
            
            for item in structure:
                if isinstance(item, ComplexStatementOperator):
                    operator = item 
                else:
                    values.append(self.evaluate_bool_structure(item))  

            if operator == ComplexStatementOperator.AND:
                return all(values)
            elif operator == ComplexStatementOperator.OR:
                return any(values)
        return False  

    def check_and_get_dict_keys(self, structure):
        reference_keys = None
        
        def traverse(lst):
            nonlocal reference_keys
            for item in lst:
                if isinstance(item, dict):
                    if reference_keys is None:
                        reference_keys = set(item.keys())
                    elif set(item.keys()) != reference_keys:
                        return False
                elif isinstance(item, list):
                    if not traverse(item):
                        return False
            return True
    
        is_valid = traverse(structure)
        return list(reference_keys) if is_valid else None
    
    def define_common_subject(self, statements, subjects:list[str]):
        for statement in statements:
            if isinstance(statement, list):
                if len(statement) < 3:
                    raise ValueError("The length of list in complex data should be at least 3, where there are at least 2 statement and the last item is logical operator.")
                
                last_item = statement[-1]
                if(not isinstance(last_item, ComplexStatementOperator)):
                    raise ValueError(f"The last item of list in complex data should be of {ComplexStatementOperator.__name__} type.")
                
                split_statement = statement[:-1]
                local_common_subject = self.define_common_subject(split_statement, subjects)
                if local_common_subject is None:
                    return None
            elif isinstance(statement, tuple):
                if len(statement) != 3:
                    raise ValueError("The length of triple tuple must be 3.")
                subjects.append(statement[0])
            elif isinstance(statement, ComplexStatementOperator):
                continue
            else:
                raise TypeError("Not supported type in structure.")

        if len(set(subjects)) == 1:
            return set(subjects).pop()
        else:
            return None

    def get_instances_of(self, subject: str):
        query_template = read_file(file_name="instances_of_class_template")
        query_formatted = query_template.replace('?type', subject)
        self.sparql.setQuery(query_formatted)
        results = self.sparql.query().convert()
        return [el["instance"]["value"] for el in results["results"]["bindings"]]

    # metadata completeness
    def calculate_metadata_completeness(self):
        self._ontology_md_completeness = self.calculate_onto_md_component()
        self._class_md_completeness = self.calculate_class_md_component()
        self._instance_md_completeness = self.calculate_instance_md_component()

        ontology_weight = 0.5
        class_weight = 0.3
        instance_weight = 0.2

        overall_score = (self._ontology_md_completeness * ontology_weight) + (
                self._class_md_completeness * class_weight) \
                        + (self._instance_md_completeness * instance_weight)
        return overall_score

    def calculate_onto_md_component(self, threshold=0.8):
        concatenated_md = Completeness.ONTO_ESSENTIAL_MD + Completeness.ONTO_OPTIONAL_MD
        heatmap_data = self.build_onto_md_heatmap_data(concatenated_md)
        self._onto_md_heatmap_data = heatmap_data

        all_ontologies_amount = self.kg_overall_statistics._all_ontologies_am
        if all_ontologies_amount == 0:
            return 0

        essential_metadata_values = [
            self.get_ontologies_amount_with_md(md_term) / all_ontologies_amount
            for md_term in Completeness.ONTO_ESSENTIAL_MD
        ]
        essential_score = sum(essential_metadata_values) / len(Completeness.ONTO_ESSENTIAL_MD)

        optional_metadata_values = [
            self.get_ontologies_amount_with_md(md_term) / all_ontologies_amount
            for md_term in Completeness.ONTO_OPTIONAL_MD
        ]
        optional_score = sum(optional_metadata_values) / len(Completeness.ONTO_OPTIONAL_MD)

        if essential_score <= threshold:
            final_score = essential_score + (optional_score * 0.2)
        else:
            final_score = essential_score

        return final_score

    def build_onto_md_heatmap_data(self, metadata):
        heatmap_data = {}
        for md_property in metadata:
            table = self.get_md_existance_table(md_property)
            for row in table:
                if row["ontology"]["value"] not in heatmap_data:
                    heatmap_data[row["ontology"]["value"]] = []
                heatmap_data[row["ontology"]["value"]].append(row["has_md_property"]["value"])

        return heatmap_data

    def get_md_existance_table(self, md_property):
        query = read_file(file_name="md_existance_table_template").replace('?md_property', md_property)
        self.sparql.setQuery(query)
        results = self.sparql.query().convert()
        return results["results"]["bindings"]

    def calculate_class_md_component(self):
        all_classes_amount = self.kg_overall_statistics._custom_classes_am
        if all_classes_amount == 0:
            return 0

        key_metadata_values = [
            self.get_classes_amount_with_md(md_term) / all_classes_amount
            for md_term in Completeness.CLASS_AND_INSTANCE_ESSENTIAL_MD
        ]
        key_metadata_score = sum(key_metadata_values) / len(Completeness.CLASS_AND_INSTANCE_ESSENTIAL_MD)
        return key_metadata_score

    def calculate_instance_md_component(self):
        all_instances_amount = self.kg_overall_statistics._custom_instances_am
        if all_instances_amount == 0:
            return 0

        key_metadata_values = [
            self.get_instances_amount_with_md(md_term) / all_instances_amount
            for md_term in Completeness.CLASS_AND_INSTANCE_ESSENTIAL_MD
        ]
        key_metadata_score = sum(key_metadata_values) / len(Completeness.CLASS_AND_INSTANCE_ESSENTIAL_MD)
        return key_metadata_score

    # interlinking score
    def calculate_interlinking_completeness(self):
        class_interlinking_score = self.get_interlinking_score('class')
        property_interlinking_score = self.get_interlinking_score('property')
        instance_interlinking_score = self.get_interlinking_score('instance')

        return statistics.mean([class_interlinking_score,
                                property_interlinking_score,
                                instance_interlinking_score])

    def get_interlinking_score(self, entity_type):
        if entity_type == 'class':
            query = read_file(file_name="interlinking_classes_amount")
        elif entity_type == 'property':
            query = read_file(file_name="interlinking_properties_amount")
        elif entity_type == 'instance':
            query = read_file(file_name="interlinking_instances_amount")
        else:
            raise ValueError(f'Entity type "{entity_type}" is not supported')

        total_count = self.get_all_entities_count(entity_type)
        if total_count == 0:
            return 0
        linked_count = get_count_res_from(query, self.sparql)

        return linked_count / total_count

    def get_all_entities_count(self, entity_type):
        if entity_type == 'class':
            value = self.kg_overall_statistics._custom_classes_am
        elif entity_type == 'property':
            value = self.kg_overall_statistics._custom_properties_am
        elif entity_type == 'instance':
            value = self.kg_overall_statistics._custom_instances_am
        else:
            raise ValueError(f'Entity type "{entity_type}" is not implemented')
        return value

    # query function and extra help functions

    def get_ontologies_amount_with_md(self, md_property):
        query = read_file(file_name="md_ontologies_amount_template").replace('?md_property', md_property)
        return get_count_res_from(query, self.sparql)

    def get_classes_amount_with_md(self, md_property):
        query = read_file(file_name="md_classes_amount_template").replace('?md_property', md_property)
        return get_count_res_from(query, self.sparql)

    def get_instances_amount_with_md(self, md_property):
        query = read_file(file_name="md_instances_amount_template").replace('?md_property', md_property)
        return get_count_res_from(query, self.sparql)

    def get_classes_with_instances_amount(self):
        query = read_file(file_name="custom_classes_with_instances_amount")
        return get_count_res_from(query, self.sparql)
