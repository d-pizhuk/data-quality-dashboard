import asyncio

from SPARQLWrapper import JSON, SPARQLWrapper
from semanticLib.base.data_quality.Completeness import Completeness
from pygls.server import LanguageServer

from semanticLib.base.data_quality.Consistency import Consistency
from semanticLib.base.data_quality.KGOverallStatistics import KGOverallStatistics
from semanticLib.base.data_quality.Readability import Readability
from semanticLib.base.data_quality.utils import create_json

class DataQualityModule:
    def __init__(self, endpoint_url: str, installation_dir: str, ls:LanguageServer):
        self.sparql = SPARQLWrapper(endpoint_url)
        self.sparql.setReturnFormat(JSON)
        self.installation_dir = installation_dir
        self.ls = ls

        self.kg_overall_statistics = KGOverallStatistics(self.sparql)

    async def generate_dashboard(self):
        """Generate the dashboard, with proper async notifications."""
        
        await self.ls.statusBarNotification('DQ Dashboard: Calculating overall statistics...', True)
        
        await asyncio.to_thread(self.kg_overall_statistics.calculate)
        await asyncio.to_thread(create_json, self.kg_overall_statistics(), self.installation_dir, "kg_overall_statistics.json")

        self.completeness = Completeness(self.sparql, self.kg_overall_statistics)
        await self.ls.statusBarNotification('DQ Dashboard: Calculating completeness dimension and its metrics...', True)
        await asyncio.to_thread(self.completeness.calculate)
        await asyncio.to_thread(create_json, self.completeness.to_dict(), self.installation_dir, "completeness.json")

        self.consistency = Consistency(self.sparql, self.kg_overall_statistics)
        await self.ls.statusBarNotification('DQ Dashboard: Calculating consistency dimension and its metrics...', True)
        await asyncio.to_thread(self.consistency.calculate)
        await asyncio.to_thread(create_json, self.consistency.to_dict(), self.installation_dir, "consistency.json")

        self.readability = Readability(self.sparql, self.kg_overall_statistics)
        await self.ls.statusBarNotification('DQ Dashboard: Calculating readability dimension and its metrics...', True)
        await asyncio.to_thread(self.readability.calculate)
        await asyncio.to_thread(create_json, self.readability.to_dict(), self.installation_dir, "readability.json")
