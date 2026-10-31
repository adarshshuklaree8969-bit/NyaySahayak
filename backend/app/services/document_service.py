import os
import re
from pathlib import Path
from typing import List, Dict
import pypdf
import docx

class DocumentService:
    @staticmethod
    def extract_text_from_file(file_path: str) -> str:
        ext = os.path.splitext(file_path)[1].lower()
        text = ""
        
        if ext == ".pdf":
            try:
                reader = pypdf.PdfReader(file_path)
                for page in reader.pages:
                    extracted = page.extract_text()
                    if extracted:
                        text += extracted + "\n\n"
            except Exception as e:
                raise ValueError(f"Failed to extract text from PDF: {str(e)}")
                
        elif ext in [".docx", ".doc"]:
            try:
                doc = docx.Document(file_path)
                for para in doc.paragraphs:
                    if para.text.strip():
                        text += para.text + "\n"
            except Exception as e:
                raise ValueError(f"Failed to extract text from DOCX: {str(e)}")
                
        elif ext in [".txt", ".md", ".json"]:
            try:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    text = f.read()
            except Exception as e:
                raise ValueError(f"Failed to read text file: {str(e)}")
        else:
            raise ValueError(f"Unsupported file format: {ext}")
            
        return text.strip()

    @staticmethod
    def chunk_text(text: str, chunk_size: int = 400, overlap: int = 50) -> List[str]:
        # Split text by paragraphs first
        paragraphs = [p.strip() for p in text.split("\n") if p.strip()]
        chunks: List[str] = []
        current_chunk = []
        current_word_count = 0
        
        for para in paragraphs:
            words = para.split()
            if not words:
                continue
                
            if current_word_count + len(words) <= chunk_size:
                current_chunk.append(para)
                current_word_count += len(words)
            else:
                if current_chunk:
                    chunks.append("\n".join(current_chunk))
                # Add overlap from previous
                overlap_words = " ".join(current_chunk).split()[-overlap:] if current_chunk else []
                current_chunk = [" ".join(overlap_words), para] if overlap_words else [para]
                current_word_count = len(overlap_words) + len(words)
                
        if current_chunk:
            chunks.append("\n".join(current_chunk))
            
        return chunks if chunks else [text]
