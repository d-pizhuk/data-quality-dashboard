from SPARQLWrapper import SPARQLWrapper

from semanticLib.base.data_quality.utils import get_count_res_from, read_file

class KGOverallStatistics():
    KG_STATISTICS_DIR = "semanticLib/resources/data_quality/sparql/kg_statistics"

    def __init__(self, sparql: SPARQLWrapper):
        # all data statistics
        self._all_ontologies_am: int | None = None
        self._all_classes_am: int | None = None
        self._all_instances_am: int | None = None
        self._all_properties_am: int | None = None
        self._all_strings_am: int | None = None
        self._all_numbers_am: int | None = None
        self._all_booleans_am: int | None = None

        # custom data statistics
        self._custom_classes_am: int | None = None
        self._custom_instances_am: int | None = None
        self._custom_properties_am: int | None = None
        self._custom_strings_am: int | None = None
        self._custom_numbers_am: int | None = None
        self._custom_booleans_am: int | None = None

        # side params
        self.sparql: SPARQLWrapper = sparql

    def __call__(self):
        return {
            "all_ontologies": self._all_ontologies_am,
            "custom_classes": self._custom_classes_am,
            "custom_instances": self._custom_instances_am,
            "custom_properties": self._custom_properties_am,
            "custom_strings": self._custom_strings_am,
            "custom_numbers": self._custom_numbers_am,
            "custom_booleans": self._custom_booleans_am,
            "all_classes": self._all_classes_am,
            "all_instances": self._all_instances_am,
            "all_properties": self._all_properties_am,
            "all_strings": self._all_strings_am,
            "all_numbers": self._all_numbers_am,
            "all_booleans": self._all_booleans_am,
        }        

    def calculate(self):
        self.calculate_custom_data_statistics()
        self.calculate_all_data_statistics()

    def calculate_custom_data_statistics(self):
        self._custom_classes_am = self.get_custom_classes_amount()
        self._custom_instances_am = self.get_custom_instances_amount()
        self._custom_properties_am = self.get_custom_properties_amount()

        self._custom_strings_am = self.get_custom_strings_amount()
        self._custom_numbers_am = self.get_custom_numbers_amount()
        self._custom_booleans_am = self.get_custom_booleans_amount()

    def get_custom_classes_amount(self):
        query = read_file(file_name="custom_classes_amount", directory_path=KGOverallStatistics.KG_STATISTICS_DIR)
        return get_count_res_from(query, self.sparql)

    def get_custom_instances_amount(self):
        query = read_file(file_name="custom_instances_amount", directory_path=KGOverallStatistics.KG_STATISTICS_DIR)
        return get_count_res_from(query, self.sparql)
    
    def get_custom_properties_amount(self):
        query = read_file(file_name="custom_props_amount", directory_path=KGOverallStatistics.KG_STATISTICS_DIR)
        return get_count_res_from(query, self.sparql)
    
    def get_custom_strings_amount(self):
        query = read_file(file_name="custom_strings_amount", directory_path=KGOverallStatistics.KG_STATISTICS_DIR)
        return get_count_res_from(query, self.sparql)
    
    def get_custom_numbers_amount(self):
        query = read_file(file_name="custom_numbers_amount", directory_path=KGOverallStatistics.KG_STATISTICS_DIR)
        return get_count_res_from(query, self.sparql)
    
    def get_custom_booleans_amount(self):
        query = read_file(file_name="custom_booleans_amount", directory_path=KGOverallStatistics.KG_STATISTICS_DIR)
        return get_count_res_from(query, self.sparql)

    def calculate_all_data_statistics(self):
        self._all_ontologies_am = self.get_all_ontologies_amount()
        self._all_classes_am = self.get_all_classes_amount()
        self._all_instances_am = self.get_all_instances_amount()
        self._all_properties_am = self.get_all_properties_amount()

        self._all_strings_am = self.get_all_strings_amount()
        self._all_numbers_am = self.get_all_numbers_amount()
        self._all_booleans_am = self.get_all_booleans_amount()

    def get_all_ontologies_amount(self):
        query = read_file(file_name="all_ontologies_amount", directory_path=KGOverallStatistics.KG_STATISTICS_DIR)
        return get_count_res_from(query, self.sparql)
    
    def get_all_classes_amount(self):
        query = read_file(file_name="all_classes_amount", directory_path=KGOverallStatistics.KG_STATISTICS_DIR)
        return get_count_res_from(query, self.sparql)
    
    def get_all_instances_amount(self):
        query = read_file(file_name="all_instances_amount", directory_path=KGOverallStatistics.KG_STATISTICS_DIR)
        return get_count_res_from(query, self.sparql)
    
    def get_all_properties_amount(self):
        query = read_file(file_name="all_props_amount", directory_path=KGOverallStatistics.KG_STATISTICS_DIR)
        return get_count_res_from(query, self.sparql)
    
    def get_all_strings_amount(self):
        query = read_file(file_name="all_strings_amount", directory_path=KGOverallStatistics.KG_STATISTICS_DIR)
        return get_count_res_from(query, self.sparql)
    
    def get_all_numbers_amount(self):
        query = read_file(file_name="all_numbers_amount", directory_path=KGOverallStatistics.KG_STATISTICS_DIR)
        return get_count_res_from(query, self.sparql)
    
    def get_all_booleans_amount(self):
        query = read_file(file_name="all_booleans_amount", directory_path=KGOverallStatistics.KG_STATISTICS_DIR)
        return get_count_res_from(query, self.sparql)