import json
import re
import os
import tensorflow as tf
from tensorflow.keras.preprocessing.text import tokenizer_from_json
from tensorflow.keras.preprocessing.sequence import pad_sequences

class SentimentPipeline:
    def __init__(self, model_path, tokenizer_path, model_config_path, clean_text_config_path):
        print(f"Loading Model from {model_path}...")
        self.model = tf.keras.models.load_model(model_path)
        
        print(f"Loading Configs...")
        with open(model_config_path, 'r') as f:
            self.model_config = json.load(f)
            
        with open(clean_text_config_path, 'r') as f:
            self.clean_text_config = json.load(f)
            self.contractions = self.clean_text_config.get("contractions", {})
            
        print(f"Loading Tokenizer from {tokenizer_path}...")
        with open(tokenizer_path, 'r', encoding='utf-8') as f:
            self.tokenizer = tokenizer_from_json(f.read())
        print("Pipeline initialization complete.")
            
    def expand_contractions(self, text):
        for contraction, expansion in self.contractions.items():
            text = text.replace(contraction, expansion)
        return text

    def clean_text(self, text: str) -> str:
        # Remove HTML tags
        text = re.sub(r'<[^>]+>', ' ', text)
        # Expand HTML entities
        text = text.replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>')
        # Lowercase
        text = text.lower()
        # Expand contractions
        text = self.expand_contractions(text)
        # Remove non-alphabetic characters
        text = re.sub(r'[^a-zA-Z\s]', ' ', text)
        # Collapse whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        return text

    def preprocess(self, texts: list[str]):
        cleaned = [self.clean_text(t) for t in texts]
        seqs = self.tokenizer.texts_to_sequences(cleaned)
        padded = pad_sequences(
            seqs, 
            maxlen=self.model_config['max_length'], 
            padding=self.model_config['padding'], 
            truncating=self.model_config['truncating']
        )
        return padded

    def predict(self, texts: list[str]):
        padded = self.preprocess(texts)
        scores = self.model.predict(padded, verbose=0).flatten()
        return scores.tolist()
        
    def get_keyword_highlights(self, text: str, base_score: float):
        """
        Uses a Leave-One-Out (LOO) strategy for keyword highlighting.
        For performance, we limit this to short reviews (< 50 words).
        """
        words = self.clean_text(text).split()
        if len(words) > 50: 
            # Too long for fast real-time LOO without a batch
            return []
            
        if not words:
            return []

        highlights = []
        
        # Batch all "text without word" variations to process in one GPU call
        variations = []
        for i in range(len(words)):
            text_without_word = " ".join(words[:i] + words[i+1:])
            variations.append(text_without_word)
            
        scores_without = self.predict(variations)
        
        for i, word in enumerate(words):
            score_without = scores_without[i]
            # Impact: If removing the word drops the score significantly, it's a positive keyword.
            # If removing it increases the score significantly, it's a negative keyword.
            impact = base_score - score_without 
            
            if impact > 0.05: # Threshold for positive impact
                highlights.append({"word": word, "sentiment": "positive", "impact": impact})
            elif impact < -0.05: # Threshold for negative impact
                highlights.append({"word": word, "sentiment": "negative", "impact": abs(impact)})
                
        # Sort by impact
        return sorted(highlights, key=lambda x: x['impact'], reverse=True)
