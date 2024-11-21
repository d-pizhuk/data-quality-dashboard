from enum import Enum
import re
import statistics
import SPARQLWrapper
from semanticLib.base.data_quality.ADimension import ADimension
from nostril import nonsense_detector as nd
from lingua import Language, LanguageDetectorBuilder
from nltk.corpus import wordnet
import nltk

from semanticLib.base.data_quality.KGOverallStatistics import KGOverallStatistics
from semanticLib.base.data_quality.utils import read_file


class Style(Enum):
    IDENTIFIER_FOR_CLASS_INSTANCE_ONTOLOGY = 0
    IDENTIFIER_FOR_PROPERTY = 1
    DESCRIPTION = 2


class Readability(ADimension):
    SPLITTER = "rsp/&"
    EMPTY_TAG = "<empty>"

    def __init__(self, sparql: SPARQLWrapper, kg_overall_statistics: KGOverallStatistics):
        super().__init__(kg_overall_statistics)

        # params for JSON data file generation
        self._readability: float | None = None

        self._identifier_readability: dict = {
            "value": None,
            "with_enc_info": None,
            "without_enc_info": None,
            "existing_words": None,
            "non_existing_words": None,
            "style_consistency_mean": None,
            "identifiers_with_synonym": None,
            "identifiers_without_synonym": None,
            "identifiers_with_hypernym": None,
            "identifiers_without_hypernym": None
        }
        self._identifier_readability_scores: list | None = None

        self._desc_readability: dict = {
            "value": None,
            "with_enc_info": None,
            "without_enc_info": None,
            "existing_words": None,
            "non_existing_words": None,
            "style_consistency_mean": None,
            "lang_confidence_mean": None
        }
        self._desc_readability_scores: list | None = None

        # side params
        self.sparql: SPARQLWrapper = sparql
        self.lang_detector = LanguageDetectorBuilder.from_all_languages().with_preloaded_language_models().build()
        self.download_wordnet()
        self.synonym_cache: dict = {}
        self.hypernym_cache: dict = {}
        self.wordnet_cache: dict = {}

    def to_dict(self):
        return {
            "readability": self._readability,
            "identifier_readability": self._identifier_readability,
            "identifier_readability_scores": self._identifier_readability_scores,
            "desc_readability": self._desc_readability,
            "desc_readability_scores": self._desc_readability_scores,
        }

    # readability in Knowledge Graph
    def calculate(self):
        self._identifier_readability["value"] = self.calculate_identifier_component()
        self._desc_readability["value"] = self.calculate_description_component()

        self._readability = statistics.mean([self._identifier_readability["value"], self._desc_readability["value"]])

    # labels and titles
    def calculate_identifier_component(self):
        query = read_file(file_name="custom_labels")
        self.sparql.setQuery(query)
        results = self.sparql.query().convert()

        labels = [(el["label"]["value"], el["label"]["xml:lang"], el["classification"]["value"],
                   el["subject"]["value"], "label") if "xml:lang" in el["label"] else (
            el["label"]["value"], None, el["classification"]["value"], el["subject"]["value"], "label") for el in
                  results["results"]["bindings"]]
        labels_preprocessed = [(self.preprocess(label[0]), label[1], label[2], label[3]) for label in labels]

        query = read_file(file_name="custom_titles")
        self.sparql.setQuery(query)
        results = self.sparql.query().convert()

        titles = [(el["title"]["value"], el["title"]["xml:lang"], el["classification"]["value"],
                   el["subject"]["value"], "title") if "xml:lang" in el["title"] else (
            el["title"]["value"], None, el["classification"]["value"], el["subject"]["value"], "title") for el in
                  results["results"]["bindings"]]
        titles_preprocessed = [(self.preprocess(title[0]), title[1], title[2], title[3]) for title in titles]

        # added titles to labels too, as they have similar role
        identifiers = labels + titles
        identifiers_preprocessed = labels_preprocessed + titles_preprocessed

        identifier_readability_scores = {}

        encoding_penalty_weight = 0.1

        identifiers_with_enc_info = 0
        identifiers_without_enc_info = 0
        existing_words = 0
        non_existing_words = 0
        style_consistencies = []
        identifiers_with_synonym = 0
        identifiers_without_synonym = 0
        identifiers_with_hypernym = 0
        identifiers_without_hypernym = 0

        empty_counter = 0

        for i, (identifier, identifier_preprocessed) in enumerate(zip(identifiers, identifiers_preprocessed)):
            if identifier[
                0] and f'{identifier[3]}{Readability.SPLITTER}{identifier[0]}' in identifier_readability_scores:
                continue

            if not identifier[0] or len(identifier[0]) == 0:
                empty_counter = empty_counter + 1
                style_consistencies.append(0)
                if identifier_preprocessed[1] is None:
                    identifiers_without_enc_info += 1
                else:
                    identifiers_with_enc_info += 1
                identifiers_without_synonym += 1
                identifiers_without_hypernym += 1
                identifier_readability_scores[
                    f'{identifier[3]}{Readability.SPLITTER}{identifier[4]}{Readability.SPLITTER}{Readability.EMPTY_TAG}{empty_counter}'] = 0
                continue

            identifier_words = identifier_preprocessed[0]
            unique_words = set(
                word for index, identifier_info in enumerate(identifiers_preprocessed) if index != i for word in
                identifier_info[0])

            # calculating the score for words' existance in identifier
            word_existance_values = [
                1 if self.is_in_wordnet(word)
                else (0.5 if not self.is_nonsense(word) else 0)
                for word in identifier_words]

            existing_words += word_existance_values.count(1)
            non_existing_words += (word_existance_values.count(0) + word_existance_values.count(0.5))

            identifier_existance_score = sum(word_existance_values) / len(identifier_words)

            # calculating style consistency
            identifier_info = (
            identifier[0], {word: bool(value) for word, value in zip(identifier_words, word_existance_values)})
            style_consistency = self.calculate_style_consistency(identifier_info,
                                                                 Style.IDENTIFIER_FOR_PROPERTY if
                                                                 identifier_preprocessed[
                                                                     2] == "Property" else Style.IDENTIFIER_FOR_CLASS_INSTANCE_ONTOLOGY)
            style_consistencies.append(style_consistency)

            # calculating synonym absense score
            synonym_absence_values = [1 if not self.has_synonym(word, unique_words) else 0 for word in identifier_words]
            if 0 in synonym_absence_values:
                identifiers_with_synonym += 1
            else:
                identifiers_without_synonym += 1
            synonym_absence_score = sum(synonym_absence_values) / len(identifier_words)

            # calculating hypernym absense score
            hypernym_absense_values = [1 if not self.has_hypernym(word, unique_words) else 0 for word in
                                       identifier_words]
            if 0 in hypernym_absense_values:
                identifiers_with_hypernym += 1
            else:
                identifiers_without_hypernym += 1
            hypernym_absense_score = sum(hypernym_absense_values) / len(identifier_words)

            identifier_base_score = statistics.mean(
                [identifier_existance_score, style_consistency, synonym_absence_score, hypernym_absense_score])

            # applying penalty score
            encoding_info = 1 if identifier_preprocessed[1] is not None else 0
            if encoding_info == 1:
                identifiers_with_enc_info += 1
            else:
                identifiers_without_enc_info += 1
            penalty = encoding_info * encoding_penalty_weight

            identifier_final_score = identifier_base_score - (penalty * identifier_base_score)

            identifier_readability_scores[
                f'{identifier[3]}{Readability.SPLITTER}{identifier[4]}{Readability.SPLITTER}{identifier[0]}'] = identifier_final_score

        self._identifier_readability_scores = identifier_readability_scores
        self._identifier_readability["with_enc_info"] = identifiers_with_enc_info
        self._identifier_readability["without_enc_info"] = identifiers_without_enc_info
        self._identifier_readability["existing_words"] = existing_words
        self._identifier_readability["non_existing_words"] = non_existing_words
        self._identifier_readability["style_consistency_mean"] = statistics.mean(style_consistencies)
        self._identifier_readability["identifiers_with_synonym"] = identifiers_with_synonym
        self._identifier_readability["identifiers_without_synonym"] = identifiers_without_synonym
        self._identifier_readability["identifiers_with_hypernym"] = identifiers_with_hypernym
        self._identifier_readability["identifiers_without_hypernym"] = identifiers_without_hypernym

        return statistics.mean(identifier_readability_scores.values())

    # descriptions and comments
    def calculate_description_component(self):
        query = read_file(file_name="custom_descriptions")
        self.sparql.setQuery(query)
        results = self.sparql.query().convert()
        descriptions = [
            (el["description"]["value"], el["description"]["xml:lang"], el["subject"]["value"], "description") if "xml:lang" in el[
                "description"] else (
                el["description"]["value"], None, el["subject"]["value"], "description") for el in results["results"]["bindings"]]
        descriptions_preprocessed = [(self.preprocess(description[0]), description[1], description[2]) for description
                                     in descriptions]

        query = read_file(file_name="custom_comments")
        self.sparql.setQuery(query)
        results = self.sparql.query().convert()
        comments = [(el["comment"]["value"], el["comment"]["xml:lang"], el["subject"]["value"], "comment") if "xml:lang" in el[
            "comment"] else (
            el["comment"]["value"], None, el["subject"]["value"], "comment") for el in results["results"]["bindings"]]
        comments_preprocessed = [(self.preprocess(comment[0]), comment[1], comment[2]) for comment in comments]

        # added comments to descriptions too, as they have similar role
        descriptions = descriptions + comments
        descriptions_preprocessed = descriptions_preprocessed + comments_preprocessed

        # description_readability_scores = []
        description_readability_scores = {}

        encoding_penalty_weight = 0.1

        descriptions_with_enc_info = 0
        descriptions_without_enc_info = 0
        existing_words = 0
        non_existing_words = 0
        style_consistencies = []
        lang_confidences = []

        empty_counter = 0

        for description, description_preprocessed in zip(descriptions, descriptions_preprocessed):
            if description[
                0] and f'{description[2]}{Readability.SPLITTER}{description[3]}{Readability.SPLITTER}{description[0]}' in description_readability_scores:
                continue

            if not description[0] or len(description[0]) == 0:
                if description_preprocessed[1] is None:
                    descriptions_without_enc_info += 1
                else:
                    descriptions_with_enc_info += 1
                empty_counter = empty_counter + 1
                style_consistencies.append(0)
                lang_confidences.append(0)
                description_readability_scores[
                    f'{description[2]}{Readability.SPLITTER}{description[3]}{Readability.SPLITTER}{Readability.EMPTY_TAG}{empty_counter}'] = 0
                continue

            description_words = description_preprocessed[0]

            # calculating the score for words' existance in description
            word_existance_values = [
                1 if self.is_in_wordnet(word)
                else (0.5 if not self.is_nonsense(word) else 0)
                for word in description_words]

            existing_words += word_existance_values.count(1)
            non_existing_words += (word_existance_values.count(0) + word_existance_values.count(0.5))

            description_existance_score = sum(word_existance_values) / len(description_words)

            # calculating style consistency
            description_info = (
                description[0], {word: bool(value) for word, value in zip(description_words, word_existance_values)})
            style_consistency = self.calculate_style_consistency(description_info, Style.DESCRIPTION)
            style_consistencies.append(style_consistency)

            # calculating language confidence
            lang_confidence = self.calculate_lang_confidence(description[0])
            lang_confidences.append(lang_confidence)

            description_base_score = statistics.mean([description_existance_score, style_consistency, lang_confidence])

            # applying penalty score
            encoding_info = 1 if description_preprocessed[1] is not None else 0
            if encoding_info == 1:
                descriptions_with_enc_info += 1
            else:
                descriptions_without_enc_info += 1
            penalty = encoding_info * encoding_penalty_weight

            description_final_score = description_base_score - (penalty * description_base_score)

            description_readability_scores[
                f'{description[2]}{Readability.SPLITTER}{description[3]}{Readability.SPLITTER}{description[0]}'] = description_final_score

        self._desc_readability_scores = description_readability_scores
        self._desc_readability["with_enc_info"] = descriptions_with_enc_info
        self._desc_readability["without_enc_info"] = descriptions_without_enc_info
        self._desc_readability["existing_words"] = existing_words
        self._desc_readability["non_existing_words"] = non_existing_words
        self._desc_readability["style_consistency_mean"] = statistics.mean(style_consistencies)
        self._desc_readability["lang_confidence_mean"] = statistics.mean(lang_confidences)

        return statistics.mean(description_readability_scores.values())

    def calculate_style_consistency(self, annotation_info, style: Style):
        annotation = annotation_info[0]
        annotation_words_existance = annotation_info[1]
        # Check for valid characters
        valid_characters_score = 1 if not re.search(r'[^\w.:, ]', annotation) else 0

        # Check if PascalCase or camelCase is used (both should NOT be used)
        case_style_score = 1
        if re.search(r'[A-Z][a-z]+[A-Z]', annotation) or re.search(r'[a-z][A-Z]', annotation):
            case_style_score = 0  # 0 if PascalCase or camelCase is detected

        # Check custom style convention
        words = re.split(r'[_\-\s]+', annotation)
        if style == Style.IDENTIFIER_FOR_CLASS_INSTANCE_ONTOLOGY:
            custom_style_score = statistics.mean([1 if word.istitle() or (
                    word.isupper() and word in annotation_words_existance and not annotation_words_existance[
                word]) else 0 for
                                                  word in words if words])
        elif style == Style.IDENTIFIER_FOR_PROPERTY:
            first_word_style_score = 1 if words and words[0].islower() else 0
            custom_style_score = statistics.mean([1 if word.istitle() or (
                    word.isupper() and word in annotation_words_existance and not annotation_words_existance[
                word]) else 0 for
                                                  word in words[1:] if words] + [first_word_style_score])
        elif style == Style.DESCRIPTION:
            sentences = re.split(r'[.!?]', annotation.strip())
            sentences = [s.strip() for s in sentences if s]

            word_scores = []
            for sentence in sentences:
                words_in_sentence = re.split(r'[_\-\s]+', sentence)

                first_word_score = 1 if words_in_sentence and words_in_sentence[0][0].isupper() else 0
                word_scores.append(first_word_score)
                word_scores.extend([1 if (word[0].isupper() or word[0].islower()) and (word[1:].islower() or (
                        word[1:].isupper() and word in annotation_words_existance and not annotation_words_existance[
                    word])) else 0
                                    for word in words_in_sentence[1:] if len(word) > 1])

            custom_style_score = statistics.mean(word_scores)
        else:
            raise ValueError("No such style configuration")

        return statistics.mean([valid_characters_score, case_style_score, custom_style_score])

    def has_synonym(self, word, all_unique_words):
        for unique_word in all_unique_words:
            if self.are_synonyms(word, unique_word):
                return True

        return False

    def has_hypernym(self, word, all_unique_words):
        for unique_word in all_unique_words:
            if self.are_related_hypernyms(word, unique_word):
                return True

        return False

    def is_in_wordnet(self, word):
        word = word.lower()
        if word in self.synonym_cache:
            return self.synonym_cache[word]

        is_in_wordnet_val = bool(wordnet.synsets(word))
        self.synonym_cache[word] = is_in_wordnet_val
        return is_in_wordnet_val

    def are_synonyms(self, word1: str, word2: str):
        word1 = self.normalize_word(word1).lower()
        word2 = self.normalize_word(word2).lower()

        if word1 == word2:
            return False

        if (word1, word2) in self.synonym_cache:
            return self.synonym_cache[(word1, word2)]
        if (word2, word1) in self.synonym_cache:
            return self.synonym_cache[(word2, word1)]

        synsets1 = wordnet.synsets(word1)
        synsets2 = wordnet.synsets(word2)

        for synset1 in synsets1:
            for synset2 in synsets2:
                if synset1 == synset2:
                    self.synonym_cache[(word1, word2)] = True
                    return True

        self.synonym_cache[(word1, word2)] = False
        return False

    def are_related_hypernyms(self, word1, word2):
        return self.are_hypernyms(word1, word2) or self.are_hypernyms(word2, word1)

    def are_hypernyms(self, word1, word2):
        word1 = word1.lower()
        word2 = word2.lower()

        if word1 == word2:
            return False

        if (word1, word2) in self.hypernym_cache:
            return self.hypernym_cache[(word1, word2)]
        if (word2, word1) in self.hypernym_cache:
            return self.hypernym_cache[(word2, word1)]

        synsets1 = wordnet.synsets(word1)
        synsets2 = wordnet.synsets(word2)

        for synset1 in synsets1:
            for hypernym in synset1.hypernyms():
                if hypernym in synsets2:
                    self.hypernym_cache[(word1, word2)] = True
                    return True

        self.hypernym_cache[(word1, word2)] = False
        return False

    def calculate_lang_confidence(self, description, non_english_penalty=0.65):
        language_confidence = self.lang_detector.compute_language_confidence_values(description)
        if language_confidence:
            detected_language = language_confidence[0].language
            lang_confidence = language_confidence[0].value

            if detected_language == Language.ENGLISH:
                return lang_confidence
            else:
                return non_english_penalty * lang_confidence
        else:
            return 0

    @staticmethod
    def preprocess(annotation):
        words = re.split(r'[_\-\s]+', annotation)

        camel_case_split = []
        for word in words:
            camel_case_split.extend(re.findall(r'[A-Z]?[a-z]+|[A-Z]+(?=[A-Z]|$)', word))

        unique_words = list(set(camel_case_split))

        return unique_words

    @staticmethod
    def download_wordnet():
        try:
            wordnet.ensure_loaded()
        except LookupError:
            nltk.download('wordnet')

    @staticmethod
    def is_nonsense(word):
        try:
            return nd.nonsense(word)
        except ValueError:
            return False

    @staticmethod
    def normalize_word(word) -> str:
        return wordnet.morphy(word) or word
