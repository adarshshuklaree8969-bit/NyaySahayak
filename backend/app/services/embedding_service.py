import re
import math
from typing import List, Dict, Tuple

class SimpleVectorSearch:
    """
    High-performance, zero-external-dependency Hybrid Vector & TF-IDF Search Engine
    Supports multi-lingual tokens (English, Devanagari/Hindi, Gurmukhi/Punjabi).
    Computes TF-IDF vector embeddings with sublinear term frequency scaling and cosine similarity.
    """
    def __init__(self):
        self.documents: List[Dict] = []
        self.vocabulary: Dict[str, int] = {}
        self.doc_vectors: List[Dict[int, float]] = []
        self.doc_lengths: List[float] = []
        self.idf: Dict[int, float] = {}
        
    def _tokenize(self, text: str) -> List[str]:
        # Clean text, preserve English, Hindi (Devanagari \u0900-\u097F), and Punjabi (Gurmukhi \u0A00-\u0A7F)
        text = text.lower()
        tokens = re.findall(r'[\w\u0900-\u097F\u0A00-\u0A7F]+', text)
        # Filter very short meaningless punctuation tokens
        return [t for t in tokens if len(t) > 1 or re.match(r'[\u0900-\u097F\u0A00-\u0A7F]', t)]
        
    def index_documents(self, docs: List[Dict]):
        """
        docs: List of dicts, each must have 'content' and metadata fields.
        """
        self.documents = docs
        self.vocabulary = {}
        self.doc_vectors = []
        self.doc_lengths = []
        self.idf = {}
        
        # 1. Build vocabulary and Document Frequencies
        df: Dict[int, int] = {}
        all_doc_tokens: List[List[str]] = []
        
        for doc in docs:
            full_text = f"{doc.get('title', '')} {doc.get('category', '')} {doc.get('content', '')}"
            tokens = self._tokenize(full_text)
            all_doc_tokens.append(tokens)
            
            seen_terms = set()
            for token in tokens:
                if token not in self.vocabulary:
                    self.vocabulary[token] = len(self.vocabulary)
                term_id = self.vocabulary[token]
                if term_id not in seen_terms:
                    seen_terms.add(term_id)
                    df[term_id] = df.get(term_id, 0) + 1
                    
        num_docs = len(docs)
        if num_docs == 0:
            return
            
        # 2. Compute IDF
        for term_id, count in df.items():
            self.idf[term_id] = math.log((1 + num_docs) / (1 + count)) + 1.0
            
        # 3. Compute TF-IDF Vectors for each document
        for tokens in all_doc_tokens:
            tf: Dict[int, int] = {}
            for token in tokens:
                term_id = self.vocabulary.get(token)
                if term_id is not None:
                    tf[term_id] = tf.get(term_id, 0) + 1
                    
            vec: Dict[int, float] = {}
            norm_sq = 0.0
            for term_id, count in tf.items():
                val = (1.0 + math.log(count)) * self.idf.get(term_id, 1.0)
                vec[term_id] = val
                norm_sq += val * val
                
            norm = math.sqrt(norm_sq) if norm_sq > 0 else 1.0
            self.doc_vectors.append(vec)
            self.doc_lengths.append(norm)

    def search(self, query: str, top_k: int = 4) -> List[Tuple[Dict, float]]:
        if not self.documents:
            return []
            
        query_tokens = self._tokenize(query)
        if not query_tokens:
            return []
            
        # Compute query vector
        q_tf: Dict[int, int] = {}
        for token in query_tokens:
            term_id = self.vocabulary.get(token)
            if term_id is not None:
                q_tf[term_id] = q_tf.get(term_id, 0) + 1
                
        if not q_tf:
            # Try fuzzy partial token search
            for token in query_tokens:
                for vocab_word, term_id in self.vocabulary.items():
                    if token in vocab_word or vocab_word in token:
                        q_tf[term_id] = q_tf.get(term_id, 0) + 1
                        
        if not q_tf:
            return []
            
        q_vec: Dict[int, float] = {}
        q_norm_sq = 0.0
        for term_id, count in q_tf.items():
            val = (1.0 + math.log(count)) * self.idf.get(term_id, 1.0)
            q_vec[term_id] = val
            q_norm_sq += val * val
            
        q_norm = math.sqrt(q_norm_sq) if q_norm_sq > 0 else 1.0
        
        # Calculate Cosine Similarities
        scores: List[Tuple[int, float]] = []
        for idx, d_vec in enumerate(self.doc_vectors):
            dot_product = 0.0
            for term_id, q_val in q_vec.items():
                if term_id in d_vec:
                    dot_product += q_val * d_vec[term_id]
                    
            denom = q_norm * self.doc_lengths[idx]
            sim = dot_product / denom if denom > 0 else 0.0
            
            # Additional title boost if query words match title
            doc_title = self.documents[idx].get("title", "").lower()
            for qt in query_tokens:
                if qt in doc_title:
                    sim += 0.25
                    
            if sim > 0.05:
                scores.append((idx, sim))
                
        # Sort descending by score
        scores.sort(key=lambda x: x[1], reverse=True)
        results = []
        for idx, score in scores[:top_k]:
            results.append((self.documents[idx], score))
            
        return results
