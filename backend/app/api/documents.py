import os
import uuid
import shutil
from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.config import settings
from app.database.connection import get_db
from app.database.models import DocumentRecord, AdminUser
from app.schemas.document_schema import DocumentSchema, DocumentUploadResponse
from app.services.document_service import DocumentService
from app.services.rag_service import rag_service
from app.core.security import get_current_admin

router = APIRouter(prefix="/documents", tags=["Knowledge Base & Documents"])

@router.get("", response_model=List[DocumentSchema])
def list_documents(db: Session = Depends(get_db)):
    docs = db.query(DocumentRecord).order_by(desc(DocumentRecord.uploaded_at)).all()
    # If database has no documents yet, populate from rag_service initial documents
    if not docs and rag_service.raw_documents:
        for d in rag_service.raw_documents:
            count = len(DocumentService.chunk_text(d.get("content", ""), 300, 40))
            record = DocumentRecord(
                doc_id=d.get("id"),
                filename=f"{d.get('id')}.json",
                file_type="JSON/Official",
                title=d.get("title", "Official Scheme"),
                category=d.get("category", "Government Initiative"),
                source_url=d.get("source_url"),
                chunk_count=count,
                file_size_kb=max(1, len(d.get("content", "")) // 1024),
                status="INDEXED"
            )
            db.add(record)
        db.commit()
        docs = db.query(DocumentRecord).order_by(desc(DocumentRecord.uploaded_at)).all()
    return docs

@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    category: str = Form("Government Scheme"),
    source_url: str = Form("https://doj.gov.in/"),
    current_admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    # Validate extension
    filename = file.filename or "uploaded_document"
    ext = os.path.splitext(filename)[1].lower()
    if ext not in [".pdf", ".docx", ".doc", ".txt", ".md", ".json"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Allowed: .pdf, .docx, .txt, .json"
        )
        
    doc_id = f"doc_{uuid.uuid4().hex[:8]}"
    save_path = settings.UPLOADS_DIR / f"{doc_id}_{filename}"
    
    # Save file
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    file_size_kb = max(1, os.path.getsize(save_path) // 1024)
    
    # Extract text
    try:
        extracted_text = DocumentService.extract_text_from_file(str(save_path))
    except Exception as e:
        if save_path.exists():
            os.remove(save_path)
        raise HTTPException(status_code=400, detail=f"Failed to parse document text: {str(e)}")
        
    if not extracted_text.strip():
        if save_path.exists():
            os.remove(save_path)
        raise HTTPException(status_code=400, detail="The uploaded document contains no readable text.")
        
    # Index in RAG service
    chunk_count = rag_service.add_document(
        doc_id=doc_id,
        title=title,
        category=category,
        content=extracted_text,
        source_url=source_url
    )
    
    # Save to database
    record = DocumentRecord(
        doc_id=doc_id,
        filename=filename,
        file_type=ext.upper().replace(".", ""),
        title=title,
        category=category,
        source_url=source_url,
        chunk_count=chunk_count,
        file_size_kb=file_size_kb,
        status="INDEXED"
    )
    db.add(record)
    db.commit()
    
    return DocumentUploadResponse(
        doc_id=doc_id,
        filename=filename,
        title=title,
        chunks_created=chunk_count,
        message=f"Document '{title}' processed and indexed into {chunk_count} vector chunks."
    )

@router.delete("/{doc_id}")
def delete_document(
    doc_id: str,
    current_admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    record = db.query(DocumentRecord).filter(DocumentRecord.doc_id == doc_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Document record not found")
        
    rag_service.delete_document(doc_id)
    db.delete(record)
    db.commit()
    
    return {"status": "success", "message": f"Document '{record.title}' deleted from knowledge base."}

@router.post("/reindex")
def reindex_knowledge_base(
    current_admin: AdminUser = Depends(get_current_admin)
):
    rag_service.reindex_all()
    return {
        "status": "success",
        "message": f"Successfully re-indexed {len(rag_service.chunks)} total chunks across {len(rag_service.raw_documents)} documents."
    }
