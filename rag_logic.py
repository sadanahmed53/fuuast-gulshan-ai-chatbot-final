
import json
import re
import numpy as np
from typing import List, Dict
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class RAGPipeline:
    """
    Handles the institutional knowledge processing and retrieval.
    This class simulates the 'reasoning' layer of the FYP.
    """
    
    def __init__(self, data_source: str):
        self.data_source = data_source
        self.vectorizer = TfidfVectorizer(stop_words='english')
        self.knowledge_base = self._load_data()
        self._fit_vectorizer()

    def _load_data(self) -> List[Dict]:
        """
        Loads the institutional records.
        In a production scenario, this would connect to a database.
        """
        try:
            # For this prototype, we use the structured JSON knowledge base
            with open(self.data_source, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            # Fallback for demonstration if file doesn't exist locally
            return []

    def _preprocess_text(self, text: str) -> str:
        """
        Performs text cleaning:
        1. Case folding
        2. Removal of special characters
        3. Whitespace normalization
        """
        text = text.lower()
        text = re.sub(r'[^\w\s]', '', text)
        return text.strip()

    def _fit_vectorizer(self):
        """
        Pre-calculates TF-IDF vectors for all knowledge base entries
        to enable fast cosine similarity lookups.
        """
        if not self.knowledge_base:
            return
        
        corpus = [self._preprocess_text(entry['content']) for entry in self.knowledge_base]
        self.doc_vectors = self.vectorizer.fit_transform(corpus)

    def search(self, query: str, top_k: int = 3) -> List[Dict]:
        """
        The core semantic search algorithm.
        Calculates the similarity between user query and university documents.
        """
        if not self.knowledge_base:
            return []

        # 1. Preprocess query
        clean_query = self._preprocess_text(query)
        
        # 2. Vectorize query
        query_vector = self.vectorizer.transform([clean_query])
        
        # 3. Calculate Cosine Similarity
        similarities = cosine_similarity(query_vector, self.doc_vectors).flatten()
        
        # 4. Filter by threshold and sort
        threshold = 0.1  # Minimum similarity score
        results = []
        
        # Get indices of top matches
        top_indices = similarities.argsort()[-top_k:][::-1]
        
        for idx in top_indices:
            if similarities[idx] >= threshold:
                doc = self.knowledge_base[idx].copy()
                doc['confidence_score'] = float(similarities[idx])
                results.append(doc)
        
        return results

# Module Evaluation / Testing
if __name__ == "__main__":
    pipeline = RAGPipeline("knowledge_base.json")
    print("Testing Search for 'admission fees':")
    print(pipeline.search("admission fees"))
