from collections import Counter
from enum import Enum
import statistics
from SPARQLWrapper import SPARQLWrapper
from semanticLib.base.data_quality.ADimension import ADimension
from semanticLib.base.data_quality.KGOverallStatistics import KGOverallStatistics
from semanticLib.base.data_quality.utils import get_count_res_from, read_file


class Scope(Enum):
    DOMAIN = "domain"
    RANGE = "range"


def is_blank_node_scope(scope_set: set):
    def contains_blank_node(scope_set: set):
        for scope in scope_set:
            if scope.startswith("node"):
                return True
        return False

    if len(scope_set) == 2 and contains_blank_node(scope_set) and Consistency.OWL_THING_URI in scope_set:
        return True
    return False


class Consistency(ADimension):
    # constants
    XSD_LITERAL_URI = "http://www.w3.org/2001/XMLSchema#"
    OWL_THING_URI = "http://www.w3.org/2002/07/owl#Thing"
    OVERLY_BROAD_URIs = ["http://www.w3.org/2000/01/rdf-schema#Resource", "http://www.w3.org/2000/01/rdf-schema#Class",
                         "http://www.w3.org/2000/01/rdf-schema#Literal",
                         "http://www.w3.org/2000/01/rdf-schema#Datatype",
                         "http://www.w3.org/1999/02/22-rdf-syntax-ns#Property",
                         "http://www.w3.org/1999/02/22-rdf-syntax-ns#Statement",
                         OWL_THING_URI, "http://www.w3.org/2002/07/owl#Class"]

    def __init__(self, sparql: SPARQLWrapper, kg_overall_statistics: KGOverallStatistics):
        super().__init__(kg_overall_statistics)
        self.kg_overall_statistics = kg_overall_statistics
        
        # params for JSON data file generation
        self._consistency_score: float | None = None

        self._prop_def_consistency: float | None = None
        self._props_with_domain_only_am: int | None = None
        self._props_with_range_only_am: int | None = None
        self._props_with_both_am: int | None = None
        self._props_with_both_none_or_blank_nodes_am: int = 0

        self._format_consistency: float | None = None
        self._date_format_consistency: float | None = None
        self._str_format_consistency: float | None = None
        self._num_format_consistency: float | None = None
        self._bool_format_consistency: float | None = None

        self._scope_conformity_score: float | None = None
        self._scope_specificity_score: float | None = None

        self._consistency_components_amount: int | None = None

        self._conflicting_relations: dict = {
            "data": None,
            "metadata": None
        }

        # side params
        self.sparql: SPARQLWrapper = sparql
        self.explicit_prop_domain_pairs = self.get_explicit_prop_scope_pairs(Scope.DOMAIN)
        self.explicit_prop_range_pairs = self.get_explicit_prop_scope_pairs(Scope.RANGE)

    def to_dict(self):
        # extra check
        all_props_amount = self.kg_overall_statistics._custom_properties_am
        check_val = all_props_amount - self._props_with_domain_only_am - self._props_with_range_only_am - self._props_with_both_am - self._props_with_both_none_or_blank_nodes_am
        if check_val != 0:
            raise ValueError("Wrong calculations!")
        
        return {
            "consistency_score": self._consistency_score,
            "prop_def_consistency": self._prop_def_consistency,
            "props_with_domain_only_am": self._props_with_domain_only_am,
            "props_with_range_only_am": self._props_with_range_only_am,
            "props_with_both_am": self._props_with_both_am,
            "props_with_both_none_or_blank_nodes_am": self._props_with_both_none_or_blank_nodes_am,
            "format_consistency": self._format_consistency,
            "date_format_consistency": self._date_format_consistency,
            "str_format_consistency": self._str_format_consistency,
            "num_format_consistency": self._num_format_consistency,
            "bool_format_consistency": self._bool_format_consistency,
            "scope_conformity_score": self._scope_conformity_score,
            "scope_specificity_score": self._scope_specificity_score,
            "conflicting_relations": self._conflicting_relations,
            "all_triples_amount": self.get_all_triples_amount(),
            "consistency_components_amount": self._consistency_components_amount
        }

    # main calculation
    def calculate(self):
        self._prop_def_consistency = self.calculate_prop_def_consistency()
        self._format_consistency = self.calculate_format_consistency()
        self._scope_conformity_score, self._scope_specificity_score = self.calculate_scope_conformity_and_specificity()
        self._property_completeness["value"] = self.calculate_property_completeness()

        consistency_components = [
            self._prop_def_consistency,
            self._format_consistency,
            self._scope_conformity_score,
            self._scope_specificity_score,
            self._property_completeness["value"]
        ]

        self._consistency_components_amount = len(consistency_components)
        self._consistency_score = statistics.mean(consistency_components)

        self._conflicting_relations["data"], self._conflicting_relations["metadata"] = self.collect_potentially_conflicting_triples()

    # property definition consistency(how well ranges and domains are defined)
    def calculate_prop_def_consistency(self):
        self._props_with_both_none_or_blank_nodes_am = self.get_props_without_both_scopes_am()
        self._props_with_domain_only_am = self.get_props_with_scope_only_am(Scope.DOMAIN)
        self._props_with_range_only_am = self.get_props_with_scope_only_am(Scope.RANGE)
        self._props_with_both_am = self.get_props_with_both_scopes_am()

        custom_props_am = self.kg_overall_statistics._custom_properties_am
        if custom_props_am == 0:
            return 1.0

        return (
            self._props_with_domain_only_am / 2 +
            self._props_with_range_only_am / 2 +
            self._props_with_both_am
        ) / custom_props_am

    def get_props_without_both_scopes_am(self):
        query = read_file(file_name="props_without_both_scopes_am")
        return get_count_res_from(query, self.sparql)

    def get_props_with_scope_only_am(self, scope):
        if scope is Scope.DOMAIN:
            query = read_file(file_name="props_with_domain_only")
        elif scope is Scope.RANGE:
            query = read_file(file_name="props_with_range_only")
        else:
            raise ValueError("Scope is defined incorrectly")

        self.sparql.setQuery(query)
        results = self.sparql.query().convert()
        result = results["results"]["bindings"]
        prop_scope_dict = {}

        for binding in result:
            property_uri = binding["property"]["value"]
            scope_uri = binding[scope.value]["value"]

            if property_uri not in prop_scope_dict:
                prop_scope_dict[property_uri] = []

            prop_scope_dict[property_uri].append(scope_uri)

        props_with_scope_only = 0

        for key in prop_scope_dict.keys():
            if not is_blank_node_scope(prop_scope_dict[key]):
                props_with_scope_only += 1
            else:
                self._props_with_both_none_or_blank_nodes_am += 1

        return props_with_scope_only

    def get_props_with_both_scopes_am(self):
        query = read_file(file_name="props_with_both_scopes")

        self.sparql.setQuery(query)
        results = self.sparql.query().convert()
        result = results["results"]["bindings"]
        prop_both_scopes_dict = {}

        for binding in result:
            property_uri = binding["property"]["value"]
            domain_uri = binding[Scope.DOMAIN.value]["value"]
            range_uri = binding[Scope.RANGE.value]["value"]

            if property_uri not in prop_both_scopes_dict:
                prop_both_scopes_dict[property_uri] = {
                    Scope.DOMAIN.value: set(),
                    Scope.RANGE.value: set()
                }

            prop_both_scopes_dict[property_uri][Scope.DOMAIN.value].add(domain_uri)
            prop_both_scopes_dict[property_uri][Scope.RANGE.value].add(range_uri)

        domain_range_both_not_none = 0
        domain_not_none_range_none = 0
        domain_none_range_not_none = 0
        domain_range_both_none = 0

        for key in prop_both_scopes_dict.keys():
            domain_is_blank_node = is_blank_node_scope(prop_both_scopes_dict[key][Scope.DOMAIN.value])
            range_is_blank_node = is_blank_node_scope(prop_both_scopes_dict[key][Scope.RANGE.value])

            if domain_is_blank_node:
                prop_both_scopes_dict[key][Scope.DOMAIN.value] = None

            if range_is_blank_node:
                prop_both_scopes_dict[key][Scope.RANGE.value] = None

            domain = prop_both_scopes_dict[key][Scope.DOMAIN.value]
            range_ = prop_both_scopes_dict[key][Scope.RANGE.value]
            if domain is None and range_ is None:
                domain_range_both_none += 1
            elif domain is None and range_ is not None:
                domain_none_range_not_none += 1
            elif domain is not None and range_ is None:
                domain_not_none_range_none += 1
            elif domain is not None and range_ is not None:
                domain_range_both_not_none += 1

        self._props_with_both_none_or_blank_nodes_am += domain_range_both_none
        self._props_with_domain_only_am += domain_not_none_range_none
        self._props_with_range_only_am += domain_none_range_not_none

        return domain_range_both_not_none

    # format consistency
    def calculate_format_consistency(self):
        self._date_format_consistency = self.calculate_date_format_consistency()
        self._str_format_consistency = self.calculate_str_format_consistency()
        self._num_format_consistency = self.calculate_num_format_consistency()
        self._bool_format_consistency = self.calculate_bool_format_consistency()
        return statistics.mean([
            self._date_format_consistency,
            self._str_format_consistency,
            self._num_format_consistency,
            self._bool_format_consistency
        ])

    # date format consistency
    def calculate_date_format_consistency(self):
        all_date_md_amount = self.get_all_date_md_amount()
        if all_date_md_amount == 0:
            return 1.0  # No date values → assume perfect consistency
        correct_format_date_amount = self.get_correct_format_date_amount()
        return correct_format_date_amount / all_date_md_amount

    def get_all_date_md_amount(self):
        query = read_file(file_name="all_date_md_amount")
        return get_count_res_from(query, self.sparql)

    def get_correct_format_date_amount(self):
        query = read_file(file_name="correct_format_date_amount")
        return get_count_res_from(query, self.sparql)

    # string format consistency
    def calculate_str_format_consistency(self):
        lang_encoding_comp = self.get_lang_encoding_comp()
        valid_chars_comp = self.get_valid_chars_comp()
        emptiness_comp = self.get_emptiness_comp()
        return statistics.mean([lang_encoding_comp, valid_chars_comp, emptiness_comp])

    def get_lang_encoding_comp(self):
        self.str_with_lang_enc_amount = self.get_str_with_lang_amount()
        self.strings_of_custom_data_amount = self.get_all_strings_amount()
        if self.strings_of_custom_data_amount == 0:
            return 1.0
        return self.str_with_lang_enc_amount / self.strings_of_custom_data_amount

    def get_str_with_lang_amount(self):
        query = read_file(file_name="str_with_lang_enc_amount")
        return get_count_res_from(query, self.sparql)

    def get_all_strings_amount(self):
        query = read_file(file_name="strings_of_custom_data_amount")
        return get_count_res_from(query, self.sparql)

    def get_valid_chars_comp(self):
        if self.strings_of_custom_data_amount == 0:
            return 1.0
        return self.get_str_with_valid_chars_amount() / self.strings_of_custom_data_amount

    def get_str_with_valid_chars_amount(self):
        query = read_file(file_name="str_with_valid_chars_amount")
        return get_count_res_from(query, self.sparql)

    def get_emptiness_comp(self):
        if self.strings_of_custom_data_amount == 0:
            return 1.0
        return self.get_non_empty_str_amount() / self.strings_of_custom_data_amount

    def get_non_empty_str_amount(self):
        query = read_file(file_name="non_empty_str_amount")
        return get_count_res_from(query, self.sparql)

    # number format consistency
    def calculate_num_format_consistency(self):
        correctly_typed_num_vals_am = self.get_correctly_typed_num_vals_am()
        all_num_vals_amount = self.get_all_num_vals_amount()
        num_val_in_str_amount = self.get_num_vals_in_str_amount()

        denominator = all_num_vals_amount + num_val_in_str_amount
        if denominator == 0:
            return 1.0
        return correctly_typed_num_vals_am / denominator

    def get_correctly_typed_num_vals_am(self):
        query = read_file(file_name="correctly_typed_num_lit_amount")
        return get_count_res_from(query, self.sparql)

    def get_all_num_vals_amount(self):
        query = read_file(file_name="all_num_vals_amount")
        return get_count_res_from(query, self.sparql)

    def get_num_vals_in_str_amount(self):
        query = read_file(file_name="num_vals_in_str_amount")
        return get_count_res_from(query, self.sparql)

    # bool format consistency
    def calculate_bool_format_consistency(self):
        correctly_typed_bool_vals_amount = self.get_correctly_typed_bool_vals_am()
        all_bool_vals_amount = self.get_all_bool_vals_amount()
        bool_vals_in_str_amount = self.get_bool_vals_in_str_amount()

        denominator = all_bool_vals_amount + bool_vals_in_str_amount
        if denominator == 0:
            return 1.0
        return correctly_typed_bool_vals_amount / denominator

    def get_correctly_typed_bool_vals_am(self):
        query = read_file(file_name="correctly_typed_bool_vals_amount")
        return get_count_res_from(query, self.sparql)

    def get_all_bool_vals_amount(self):
        query = read_file(file_name="all_bool_vals_amount")
        return get_count_res_from(query, self.sparql)

    def get_bool_vals_in_str_amount(self):
        query = read_file(file_name="bool_vals_in_str_amount")
        return get_count_res_from(query, self.sparql)

    # checking that all values in real data are conforming to domains and ranges of properties,
    # calculating specificity of scope items (range and domain)
    def calculate_scope_conformity_and_specificity(self):
        domain_scope_vals = []
        range_scope_vals = []
        non_broad_items_in_domain = 0
        non_broad_items_in_range = 0

        for dom_pair in self.explicit_prop_domain_pairs:
            # calculating amount of non-broad items
            if dom_pair[1] not in Consistency.OVERLY_BROAD_URIs:
                non_broad_items_in_domain += 1

            # calculating domain conformity
            query = read_file(file_name="prop_triple_amount_template").replace("?property", dom_pair[0])
            prop_triples_amount = get_count_res_from(query, self.sparql)

            if prop_triples_amount == 0:
                continue

            query = read_file(file_name="prop_triple_with_domain_amount_template").replace("?property",
                                                                                           dom_pair[0]).replace(
                "?explicitDomain", dom_pair[1])
            prop_triples_with_domain_amount = get_count_res_from(query, self.sparql)

            domain_scope_vals.append(prop_triples_with_domain_amount / prop_triples_amount)

        for range_pair in self.explicit_prop_range_pairs:
            # calculating amount of non-broad items
            if range_pair[1] not in Consistency.OVERLY_BROAD_URIs:
                non_broad_items_in_range += 1

            # calculating range conformity
            query = read_file(file_name="prop_triple_amount_template").replace("?property", range_pair[0])
            prop_triples_amount = get_count_res_from(query, self.sparql)

            if prop_triples_amount == 0:
                continue

            if range_pair[1].startswith(Consistency.XSD_LITERAL_URI):
                query = read_file(file_name="prop_triple_with_xsd_range_amount_template").replace(
                    "?property", range_pair[0]).replace("?explicitDomain", range_pair[1])
            else:
                query = read_file(file_name="prop_triple_with_range_amount_template").replace(
                    "?property", range_pair[0]).replace("?explicitDomain", range_pair[1])

            prop_triples_with_range_amount = get_count_res_from(query, self.sparql)

            range_scope_vals.append(prop_triples_with_range_amount / prop_triples_amount)

        all_scope_vals = domain_scope_vals + range_scope_vals
        scope_conformity_score = statistics.mean(all_scope_vals) if all_scope_vals else 1.0

        domain_spec = (non_broad_items_in_domain / len(self.explicit_prop_domain_pairs)
                       if len(self.explicit_prop_domain_pairs) > 0 else 1.0)
        range_spec = (non_broad_items_in_range / len(self.explicit_prop_range_pairs)
                      if len(self.explicit_prop_range_pairs) > 0 else 1.0)
        scope_specificity_score = statistics.mean([domain_spec, range_spec])

        return scope_conformity_score, scope_specificity_score

    def get_explicit_prop_scope_pairs(self, scope: Scope, delimeter=", "):
        prop_scope_dict = self.get_prop_scope_dict(scope)
        prop_scope_pairs = []

        for key in prop_scope_dict.keys():
            values = prop_scope_dict[key]
            if len(values) == 1:
                prop_scope_pairs.append((key, values[0]))
                continue

            values = [f"<{value}>" for value in values]
            values_str = delimeter.join(values)

            query = read_file(file_name="class_hierarchy_template").replace(
                "?valuesWithoutDelimeter", values_str.replace(delimeter, " ")
            ).replace(
                "?valuesWithDelimeter", values_str
            )
            self.sparql.setQuery(query)
            results = self.sparql.query().convert()
            result = results["results"]["bindings"]

            subclasses = [binding["subclass"]["value"] for binding in result]
            # here we can have 2 most commons subclasses which will be only 
            # in case if these 2 classes are equivalent, but it does not matter 
            # for calculations which one to choose
            counter = Counter(subclasses)
            most_common_subclass, _ = counter.most_common(1)[0]
            prop_scope_pairs.append((key, most_common_subclass))

        return prop_scope_pairs

    def get_prop_scope_dict(self, scope):
        if scope is Scope.DOMAIN:
            query = read_file(file_name="prop_domains")
        elif scope is Scope.RANGE:
            query = read_file(file_name="prop_ranges")
        else:
            raise ValueError("Scope is defined incorrectly")
        self.sparql.setQuery(query)
        results = self.sparql.query().convert()
        result = results["results"]["bindings"]

        prop_scope_dict: dict[str, list[str]] = {}

        for binding in result:
            property_uri = binding["property"]["value"]
            scope_uri = binding[scope.value]["value"]

            if property_uri not in prop_scope_dict:
                prop_scope_dict[property_uri] = []

            prop_scope_dict[property_uri].append(scope_uri)

        return prop_scope_dict

    # collecting potentially conflicting triples
    def collect_potentially_conflicting_triples(self):
        query = read_file(file_name="potentially_conflicting_relations")
        self.sparql.setQuery(query)
        results = self.sparql.query().convert()
        result = results["results"]["bindings"]

        conflicting_relations_data: dict[str, dict[str, list[str]]] = {}
        conflicting_relations_metadata: dict[str, dict[str, str]] = {}

        for binding in result:
            property_uri = binding["property"]["value"]
            if property_uri not in conflicting_relations_data:
                conflicting_relations_data[property_uri] = {}
            if property_uri not in conflicting_relations_metadata:
                label, description, comment = self.get_label_desc_comment_of(property_uri)
                if label is not None or description is not None or comment is not None:
                    conflicting_relations_metadata[property_uri] = {}
                    if label is not None:
                        conflicting_relations_metadata[property_uri]["label"] = label
                    if description is not None:
                        conflicting_relations_metadata[property_uri]["description"] = description
                    if comment is not None:
                        conflicting_relations_metadata[property_uri]["comment"] = comment
                        
            subject_uri = binding["subject"]["value"]
            if subject_uri not in conflicting_relations_data[property_uri]:
                conflicting_relations_data[property_uri][subject_uri] = []
            if subject_uri not in conflicting_relations_metadata:
                label, description, comment = self.get_label_desc_comment_of(subject_uri)
                if label is not None or description is not None or comment is not None:
                    conflicting_relations_metadata[subject_uri] = {}
                    if label is not None:
                        conflicting_relations_metadata[subject_uri]["label"] = label
                    if description is not None:
                        conflicting_relations_metadata[subject_uri]["description"] = description
                    if comment is not None:
                        conflicting_relations_metadata[subject_uri]["comment"] = comment

            object_uri = binding["object"]["value"]
            if object_uri not in conflicting_relations_data[property_uri][subject_uri]:
                conflicting_relations_data[property_uri][subject_uri].append(object_uri)
            if object_uri not in conflicting_relations_metadata:
                label, description, comment = self.get_label_desc_comment_of(object_uri)
                if label is not None or description is not None or comment is not None:
                    conflicting_relations_metadata[object_uri] = {}
                    if label is not None:
                        conflicting_relations_metadata[object_uri]["label"] = label
                    if description is not None:
                        conflicting_relations_metadata[object_uri]["description"] = description
                    if comment is not None:
                        conflicting_relations_metadata[object_uri]["comment"] = comment

        return conflicting_relations_data, conflicting_relations_metadata
    
    def get_label_desc_comment_of(self, uri: str):
        label = None
        description = None
        comment = None
        
        query = read_file(file_name="label_of_uri_template").replace("?uri", uri)
        self.sparql.setQuery(query)
        results = self.sparql.query().convert()
        if results["results"]["bindings"]:
            label = results["results"]["bindings"][0].get("label", {}).get("value")
        
        query = read_file(file_name="comment_of_uri_template").replace("?uri", uri)
        self.sparql.setQuery(query)
        results = self.sparql.query().convert()
        if results["results"]["bindings"]:
            comment = results["results"]["bindings"][0].get("comment", {}).get("value")

        query = read_file(file_name="description_of_uri_template").replace("?uri", uri)
        self.sparql.setQuery(query)
        results = self.sparql.query().convert()
        if results["results"]["bindings"]:
            description = results["results"]["bindings"][0].get("description", {}).get("value")

        return label, description, comment

    # counting all the triples for calculation of conflicting triples metric
    def get_all_triples_amount(self):
        query = read_file(file_name="all_triples_amount")
        return get_count_res_from(query, self.sparql)
