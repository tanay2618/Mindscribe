# backend/nlp_pipeline.py
import re
import joblib
import pandas as pd
import numpy as np
import nltk
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.corpus import stopwords, wordnet
from nltk.stem import WordNetLemmatizer
from nltk import pos_tag, ne_chunk, ngrams
from nltk.wsd import lesk
from sklearn.metrics.pairwise import cosine_similarity

# Ensure required NLTK resources are available
NLTK_RESOURCES = [
    "punkt", "punkt_tab", "stopwords", "wordnet",
    "averaged_perceptron_tagger", "averaged_perceptron_tagger_eng",
    "maxent_ne_chunker", "maxent_ne_chunker_tab", "words", "omw-1.4"
]
for res in NLTK_RESOURCES:
    try:
        nltk.download(res, quiet=True)
    except Exception:
        pass


class MindScribePipeline:
    def __init__(self, model_path="mindscribe_model.pkl", 
                 vec_path="mindscribe_vectorizer.pkl", 
                 corpus_path="mindscribe_curated_5k.csv"):
        
        self.model = joblib.load(model_path)
        self.vectorizer = joblib.load(vec_path)
        
        self.corpus_df = pd.read_csv(corpus_path)
        self.corpus_vectors = self.vectorizer.transform(self.corpus_df["text"].fillna(""))
        
        self.lemmatizer = WordNetLemmatizer()
        self.stop_words = set(stopwords.words("english"))
        
        self.aux_filter = {
            "could", "would", "should", "was", "were", "been", "have", "had", 
            "has", "being", "today", "yesterday", "tomorrow", "felt", "feel", 
            "really", "very", "much", "also", "still", "like", "get", "got", "just",
            "going", "went", "come", "came"
        }

        self.tag_dict = {
            "JJ": "Adjective", "JJR": "Adjective (Comparative)", "JJS": "Adjective (Superlative)",
            "NN": "Noun", "NNS": "Noun (Plural)", "NNP": "Proper Noun", "NNPS": "Proper Noun (Plural)",
            "VB": "Verb", "VBD": "Verb (Past)", "VBG": "Verb (Gerund)", "VBN": "Verb (Past Participle)",
            "VBP": "Verb (Present)", "VBZ": "Verb (3rd Person Singular)",
            "RB": "Adverb", "RBR": "Adverb (Comparative)", "RBS": "Adverb (Superlative)",
            "PRP": "Personal Pronoun", "PRP$": "Possessive Pronoun",
            "IN": "Preposition / Conjunction", "CC": "Coordinating Conjunction",
            "MD": "Modal Verb", "CD": "Cardinal Number", "UH": "Interjection"
        }

        self.tone_map = {
            "joy": "Uplifted & Expressive",
            "sadness": "Introspective & Vulnerable",
            "fear": "Apprehensive & Guarded",
            "anger": "Frustrated & Emphatic",
            "surprise": "Perceptive & Astonished",
            "anxious": "Overwhelmed & Reflective",
            "neutral": "Calm & Objective"
        }

        # Maps individual emotion-bearing words to the specific class(es) they
        # plausibly indicate. Where a word is genuinely ambiguous between two
        # adjacent classes in this corpus (e.g. "afraid" is labeled anxious
        # almost as often as fear), it maps to both — the classifier's own
        # probabilities then break the tie between just those candidates,
        # instead of an unconstrained 7-way argmax that noise can swing.
        self.emotion_keyword_map = {
            "happy": {"joy"}, "joyful": {"joy"}, "glad": {"joy"}, "delighted": {"joy"},
            "cheerful": {"joy"}, "grateful": {"joy"}, "thrilled": {"joy"}, "content": {"joy"},
            "proud": {"joy"}, "excited": {"joy"}, "wonderful": {"joy"},

            "sad": {"sadness"}, "depressed": {"sadness"}, "down": {"sadness"},
            "lonely": {"sadness"}, "heartbroken": {"sadness"}, "miserable": {"sadness"},
            "hopeless": {"sadness"}, "upset": {"sadness"}, "hurt": {"sadness"},
            "empty": {"sadness"}, "crying": {"sadness"},

            "afraid": {"fear", "anxious"}, "scared": {"fear", "anxious"},
            "terrified": {"fear", "anxious"}, "frightened": {"fear", "anxious"},
            "fear": {"fear", "anxious"}, "dread": {"fear", "anxious"},
            "nervous": {"fear", "anxious"}, "worried": {"anxious", "fear"},
            "overwhelmed": {"anxious"}, "stressed": {"anxious"},
            "tense": {"anxious", "fear"}, "uneasy": {"anxious", "fear"},
            "panicking": {"anxious", "fear"}, "overthinking": {"anxious"},

            "angry": {"anger"}, "furious": {"anger"}, "frustrated": {"anger"},
            "irritated": {"anger"}, "annoyed": {"anger"}, "mad": {"anger"},
            "resentful": {"anger"}, "hate": {"anger"}, "terrible": {"anger"},

            "shocked": {"surprise"}, "surprised": {"surprise"}, "stunned": {"surprise"},
            "astonished": {"surprise"},
        }

        self.theme_lexicon = {
            "Academics & Career": ["exam", "study", "lecture", "placement", "college", "job", "career", "work", "boss", "grade", "interview", "office", "test", "school", "project", "presentation"],
            "Interpersonal Relationships": ["friend", "friends", "partner", "relationship", "family", "mom", "dad", "brother", "sister", "talked", "told", "people", "someone", "roommate"],
            "Self & Mental Well-being": ["mind", "sleep", "tired", "exhausted", "overthinking", "concentrate", "peace", "head", "energy", "lonely", "stress", "anxiety", "panic", "dread", "down"],
            "Daily Routine & Lifestyle": ["morning", "night", "day", "routine", "walk", "food", "eat", "home", "went", "time", "hours", "dinner", "lunch", "gym", "store", "buy", "fruits", "shopping"],
            "Future & Uncertainty": ["future", "next", "what if", "happen", "planning", "hope", "wondering", "waiting", "upcoming"]
        }

    def _get_wordnet_pos(self, tag):
        if tag.startswith("J"): return wordnet.ADJ
        elif tag.startswith("V"): return wordnet.VERB
        elif tag.startswith("N"): return wordnet.NOUN
        elif tag.startswith("R"): return wordnet.ADV
        return wordnet.NOUN

    def stage_1_tokenization(self, text):
        sentences = sent_tokenize(text)
        tokens = word_tokenize(text)
        clean_tokens = [t for t in tokens if re.search(r"\w", t)]
        return {"sentences": sentences, "tokens": clean_tokens, "token_count": len(clean_tokens)}

    def stage_2_stopword_removal(self, tokens):
        removed, preserved = [], []
        for token in tokens:
            lower = token.lower()
            if lower in self.stop_words:
                removed.append(token)
            elif not re.match(r"^[^\w\s]+$", token):
                preserved.append(token)
        return {
            "preserved_content_words": preserved,
            "removed_stopwords": sorted(list(set(removed))),
            "content_word_count": len(preserved)
        }

    def stage_3_lemmatization(self, tokens):
        tagged = pos_tag(tokens)
        lemmatized_pairs = []
        for word, tag in tagged:
            if not re.search(r"\w", word): continue
            wn_pos = self._get_wordnet_pos(tag)
            lemma = self.lemmatizer.lemmatize(word.lower(), pos=wn_pos)
            lemmatized_pairs.append({"original": word, "lemma": lemma, "pos_category": wn_pos})
        return lemmatized_pairs

    def stage_4_pos_tagging(self, tokens):
        tagged = pos_tag(tokens)
        structured_tags = []
        for word, tag in tagged:
            if not re.search(r"\w", word): continue
            readable_tag = self.tag_dict.get(tag, tag)
            structured_tags.append({"token": word, "pos_code": tag, "description": readable_tag})
        return structured_tags

    def stage_5_ner(self, tokens):
        tagged = pos_tag(tokens)
        tree = ne_chunk(tagged)
        entities = []
        for subtree in tree:
            if hasattr(subtree, "label"):
                entity_name = " ".join(c[0] for c in subtree.leaves())
                entity_type = subtree.label()
                entities.append({"entity": entity_name, "type": entity_type})
        return entities

    def stage_6_ngrams(self, content_words):
        bigrams_list = [" ".join(bg) for bg in ngrams(content_words, 2)]
        trigrams_list = [" ".join(tg) for tg in ngrams(content_words, 3)]
        return {"bigrams": bigrams_list[:10], "trigrams": trigrams_list[:10]}

    def stage_7_corpus_similarity(self, text, top_k=3):
        query_vec = self.vectorizer.transform([text])
        similarities = cosine_similarity(query_vec, self.corpus_vectors).flatten()
        top_indices = similarities.argsort()[-top_k:][::-1]
        matches = []
        for idx in top_indices:
            matches.append({
                "corpus_text": self.corpus_df.iloc[idx]["text"],
                "corpus_emotion": self.corpus_df.iloc[idx]["emotion"],
                "similarity_score": round(float(similarities[idx]), 4)
            })
        return matches

    def stage_8_wsd(self, text, tokens):
        ambiguous_candidates = ["down", "blue", "crushed", "heavy", "dark", "flat", "broke", "sharp", "numb"]
        wsd_results = []
        for word in tokens:
            lower = word.lower()
            if lower in ambiguous_candidates:
                synset = lesk(tokens, lower)
                if synset:
                    wsd_results.append({
                        "target_word": word,
                        "selected_synset": synset.name(),
                        "contextual_definition": synset.definition(),
                        "example_usage": synset.examples()[0] if synset.examples() else "N/A"
                    })
        if not wsd_results:
            for word in tokens:
                lower = word.lower()
                if lower not in self.stop_words and lower not in self.aux_filter and len(word) > 3:
                    synset = lesk(tokens, lower)
                    if synset:
                        wsd_results.append({
                            "target_word": word,
                            "selected_synset": synset.name(),
                            "contextual_definition": synset.definition(),
                            "example_usage": synset.examples()[0] if synset.examples() else "N/A"
                        })
                        break
        return wsd_results

    def _extract_themes(self, text):
        text_lower = text.lower()
        matched = []
        for theme, keywords in self.theme_lexicon.items():
            if any(re.search(r"\b" + kw + r"\b", text_lower) for kw in keywords):
                matched.append(theme)
        return matched if matched else ["Daily Routine & Lifestyle"]

    def _extract_key_words(self, lemmatized):
        key_words, seen = [], set()
        for item in lemmatized:
            orig = item["original"].lower()
            if (orig not in self.stop_words and 
                orig not in seen and 
                re.match(r"^[a-zA-Z]{3,}$", orig)):
                key_words.append(orig)
                seen.add(orig)
        return key_words[:6]

    def analyze(self, text: str) -> dict:
        vec = self.vectorizer.transform([text])
        probs = self.model.predict_proba(vec)[0]
        max_prob = np.max(probs)
        pred_class = self.model.classes_[np.argmax(probs)]

        # ── NEUTRAL INFERENCE OVERRIDE ──────────────────────────────
        # If TF-IDF feature magnitude is low, default to 'neutral' unless a
        # recognizable emotion word is present. When one or more emotion
        # words ARE present, don't hand the decision to an unconstrained
        # 7-way argmax (which sparse short entries can push toward an
        # unrelated class by noise) — restrict the choice to the class(es)
        # those specific words indicate, and let the classifier's own
        # probabilities resolve ties within that smaller candidate set.
        non_zero_count = vec.nnz
        class_probs = dict(zip(self.model.classes_, probs))

        matched_candidates = set()
        for word, classes in self.emotion_keyword_map.items():
            if re.search(rf"\b{re.escape(word)}\b", text.lower()):
                matched_candidates |= classes

        if non_zero_count <= 2 and not matched_candidates:
            dominant_emotion = "neutral"
        elif matched_candidates:
            dominant_emotion = max(matched_candidates, key=lambda c: class_probs.get(c, 0))
        elif max_prob < 0.28:
            dominant_emotion = "neutral"
        else:
            dominant_emotion = str(pred_class)
        # ────────────────────────────────────────────────────────────

        s1 = self.stage_1_tokenization(text)
        s2 = self.stage_2_stopword_removal(s1["tokens"])
        s3 = self.stage_3_lemmatization(s1["tokens"])
        s4 = self.stage_4_pos_tagging(s1["tokens"])
        s5 = self.stage_5_ner(s1["tokens"])
        s6 = self.stage_6_ngrams(s2["preserved_content_words"])
        s7 = self.stage_7_corpus_similarity(text, top_k=3)
        s8 = self.stage_8_wsd(text, s1["tokens"])

        writing_tone = self.tone_map.get(dominant_emotion, "Calm & Objective")
        key_emotional_words = self._extract_key_words(s3)
        possible_themes = self._extract_themes(text)

        return {
            "report": {
                "dominant_emotion": dominant_emotion,
                "writing_tone": writing_tone,
                "key_emotional_words": key_emotional_words,
                "possible_themes": possible_themes
            },
            "pipeline": {
                "stage_1_tokenization": s1,
                "stage_2_stopword_removal": s2,
                "stage_3_lemmatization": s3,
                "stage_4_pos_tagging": s4,
                "stage_5_ner": s5,
                "stage_6_ngrams": s6,
                "stage_7_corpus_similarity": s7,
                "stage_8_wsd": s8
            }
        }