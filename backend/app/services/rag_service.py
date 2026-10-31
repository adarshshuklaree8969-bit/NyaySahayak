import os
import json
import logging
from typing import List, Dict, Tuple, Optional
from pathlib import Path

from app.config import settings
from app.services.embedding_service import SimpleVectorSearch
from app.services.document_service import DocumentService

logger = logging.getLogger("rag_service")

# Common multilingual synonym mapping for Indian legal terms
MULTILINGUAL_CONCEPT_MAP = {
    # Hindi
    "टेली": "tele-law telelaw tele law csc video legal advice",
    "कानूनी सहायता": "free legal aid nalsa legal services section 12",
    "मुफ्त": "free legal aid nalsa pro bono nyaya bandhu",
    "न्याय बंधु": "nyaya bandhu pro bono advocate volunteer",
    "ई-कोर्ट": "ecourts ecourt cnr number case status virtual court njdg",
    "केस": "case status cnr number court filing e-filing",
    "अदालत": "court lok adalat ecourts gram nyayalaya",
    "ग्राम न्यायालय": "gram nyayalaya village court panchayat nyayadhikari",
    "फास्ट ट्रैक": "fast track special court ftsc pocso rape trial",
    "दिशा": "disha scheme nyaya mitra access to justice",
    "न्याय विभाग": "department of justice judges appointment law ministry",
    
    # Punjabi
    "ਟੈਲੀ": "tele-law telelaw tele law csc video legal advice",
    "ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ": "free legal aid nalsa legal services section 12",
    "ਮੁਫ਼ਤ": "free legal aid nalsa pro bono nyaya bandhu",
    "ਨਿਆਂ ਬੰਧੂ": "nyaya bandhu pro bono advocate volunteer",
    "ਈ-ਕੋਰਟ": "ecourts ecourt cnr number case status virtual court njdg",
    "ਕੇਸ ਸਥਿਤੀ": "case status cnr number court filing e-filing",
    "ਲੋਕ ਅਦਾਲਤ": "lok adalat nalsa settlement adr",
    "ਗ੍ਰਾਮ ਨਿਆਂਲਿਆ": "gram nyayalaya village court panchayat",
    "ਫਾਸਟ ਟਰੈਕ": "fast track special court ftsc pocso",
    "ਨਿਆਂ ਵਿਭਾਗ": "department of justice judges appointment",

    # Bhojpuri
    "टेली-लॉ": "tele-law telelaw tele law csc video legal advice",
    "मुफ्त वकील": "free legal aid nalsa legal services section 12 pro bono",
    "कानूनी मदद": "free legal aid nalsa legal services section 12 advice",
    "केस के स्टेटस": "case status cnr number court filing e-filing",
    "केस के स्थिति": "case status cnr number court filing e-filing",
    "सीएनआर": "cnr number ecourts case status",
    "ग्राम कचहरी": "gram nyayalaya village court panchayat",
    "कचहरी": "court judicial complex district court",
    "अरजी": "application filing petition court",
    "अपील": "appeal lok adalat court",
    "पॉक्सो": "pocso fast track special court ftsc child abuse",
    "दुष्कर्म": "rape fast track special court ftsc speedy trial",
}

class RAGService:
    def __init__(self):
        self.vector_search = SimpleVectorSearch()
        self.chunks: List[Dict] = []
        self.raw_documents: List[Dict] = []
        self._initialize_knowledge_base()
        
    def _initialize_knowledge_base(self):
        kb_path = settings.DATA_DIR / "doj_knowledge_base.json"
        if kb_path.exists():
            try:
                with open(kb_path, "r", encoding="utf-8") as f:
                    self.raw_documents = json.load(f)
                self.reindex_all()
                logger.info(f"Initialized RAG with {len(self.raw_documents)} official DoJ documents, total {len(self.chunks)} chunks.")
            except Exception as e:
                logger.error(f"Error loading base knowledge: {str(e)}")
                
    def reindex_all(self):
        self.chunks = []
        for doc in self.raw_documents:
            text = doc.get("content", "")
            raw_chunks = DocumentService.chunk_text(text, chunk_size=300, overlap=40)
            for idx, chunk_str in enumerate(raw_chunks):
                self.chunks.append({
                    "chunk_id": f"{doc.get('id', 'doc')}_{idx}",
                    "doc_id": doc.get("id"),
                    "title": doc.get("title"),
                    "category": doc.get("category", "General"),
                    "source_name": doc.get("source_name", "Department of Justice"),
                    "source_url": doc.get("source_url", "https://doj.gov.in/"),
                    "secondary_url": doc.get("secondary_url"),
                    "last_updated": doc.get("last_updated", "2024"),
                    "content": chunk_str
                })
        self.vector_search.index_documents(self.chunks)

    def add_document(self, doc_id: str, title: str, category: str, content: str, source_url: str = "https://doj.gov.in/"):
        doc = {
            "id": doc_id,
            "title": title,
            "category": category,
            "source_name": "DoJ Knowledge Repository",
            "source_url": source_url,
            "content": content,
            "last_updated": "2026-10"
        }
        self.raw_documents.append(doc)
        self.reindex_all()
        return len(DocumentService.chunk_text(content, chunk_size=300, overlap=40))

    def delete_document(self, doc_id: str) -> bool:
        initial_len = len(self.raw_documents)
        self.raw_documents = [d for d in self.raw_documents if d.get("id") != doc_id]
        if len(self.raw_documents) < initial_len:
            self.reindex_all()
            return True
        return False

    def detect_intent(self, query: str) -> str:
        q = query.lower()
        if any(w in q for w in ["cnr", "case status", "ecourt", "e-court", "court order", "judgment", "status of my case", "केस", "ਕੇਸ", "सीएनआर", "स्थिति", "कचहरी"]):
            return "Judicial Services & Case Tracking"
        elif any(w in q for w in ["tele-law", "tele law", "telelaw", "csc", "वकील", "सलाह", "ਟੈਲੀ-ਲਾਅ", "टेली-लॉ"]):
            return "Tele-Law & Citizen Advice"
        elif any(w in q for w in ["legal aid", "free legal", "nalsa", "slsa", "dlsa", "15100", "lok adalat", "मुफ्त कानूनी", "ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ", "मुफ्त वकील", "कानूनी मदद"]):
            return "Free Legal Aid & Lok Adalat"
        elif any(w in q for w in ["nyaya bandhu", "pro bono", "volunteer advocate", "न्याय बंधु"]):
            return "Nyaya Bandhu (Pro Bono)"
        elif any(w in q for w in ["fast track", "ftsc", "pocso", "rape", "फास्ट ट्रैक"]):
            return "Fast Track Special Courts"
        elif any(w in q for w in ["gram nyayalaya", "panchayat", "village court", "nyayadhikari", "ग्राम न्यायालय"]):
            return "Gram Nyayalayas"
        elif any(w in q for w in ["infrastructure", "court hall", "nyay vikas", "residential unit", "इन्फ्रास्ट्रक्चर"]):
            return "Judicial Infrastructure"
        elif any(w in q for w in ["judge", "appointment", "collegium", "high court", "supreme court", "article 124", "न्यायाधीश"]):
            return "Department Policies & Judicial Appointments"
        else:
            return "General Legal Awareness"

    def retrieve(self, query: str, top_k: int = 3) -> List[Dict]:
        expanded_query = query.lower()
        # Expand query tokens with multilingual mapping
        for keyword, mapped_terms in MULTILINGUAL_CONCEPT_MAP.items():
            if keyword in expanded_query:
                expanded_query += " " + mapped_terms
                
        search_results = self.vector_search.search(expanded_query, top_k=top_k)
        retrieved_chunks = []
        for chunk, score in search_results:
            chunk_copy = dict(chunk)
            chunk_copy["similarity_score"] = round(score, 3)
            retrieved_chunks.append(chunk_copy)
            
        return retrieved_chunks

rag_service = RAGService()
