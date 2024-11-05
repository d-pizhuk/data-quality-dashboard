from abc import ABC, abstractmethod
from semanticLib.base.data_quality.KGOverallStatistics import KGOverallStatistics
from semanticLib.base.data_quality.utils import get_count_res_from, read_file


class ADimension(ABC):
    def __init__(self, kg_overall_statistics: KGOverallStatistics) -> None:
        super().__init__()
        self.kg_overall_statistics = kg_overall_statistics
        self._property_completeness: dict = {
            "value": None,
            "populated_props": None,
            "unpopulated_props": None,
        }

    @abstractmethod
    def calculate(self):
        """Calculates the whole dimension score."""
        pass

    @abstractmethod
    def to_dict(self):
        """Creates dictionary to pass the data to JSON."""
        pass

    # property completeness
    def calculate_property_completeness(self):
        all_props = self.kg_overall_statistics._custom_properties_am
        populated_props = self.get_populated_properties_amount()
        unpopulated_props = all_props - populated_props

        self._property_completeness["populated_props"] = populated_props
        self._property_completeness["unpopulated_props"] = unpopulated_props
        return populated_props / all_props

    def get_populated_properties_amount(self):
        query = read_file(file_name="populated_props_amount")
        return get_count_res_from(query, self.sparql)
