import json
import os
from SPARQLWrapper import SPARQLWrapper

from server.utils import hide_for_windows

def get_count_res_from(query: str, sparql:SPARQLWrapper):
    sparql.setQuery(query)
    results = sparql.query().convert()
    result = results["results"]["bindings"][0]
    return int(result["count"]["value"])

def read_file(file_name: str, directory_path=r"semanticLib/resources/data_quality/sparql"):
    file_path = os.path.join(directory_path, file_name)
    content = ""
    if os.path.isfile(file_path):
        with open(file_path, "r") as file:
            content = file.read()
    else:
        raise FileNotFoundError(f"File '{file_name}' not found in directory '{directory_path}'")

    return content

def create_json(data_dict: dict, path: str, file_name: str, hide_path_dir = True):
        if not isinstance(data_dict, dict):
            raise ValueError(f"The data_dict parameter must be dictionary. Obtained: {type(data_dict)}")
        
        def validate_data(d, parent_key=""):
            for key, value in d.items():
                full_key = f"{parent_key}.{key}" if parent_key else key
                if isinstance(value, dict):
                    validate_data(value, full_key) 
                elif value is None:
                    raise ValueError(f"The value for '{full_key}' cannot be None.")

        validate_data(data_dict)

        if not os.path.exists(path):
            os.makedirs(path)
            if hide_path_dir:
                hide_for_windows(path)

        full_file_path = os.path.join(path, file_name)
        with open(full_file_path, 'w') as file:
            json.dump(data_dict, file, indent=4)
