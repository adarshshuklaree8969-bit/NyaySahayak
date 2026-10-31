import uuid
import time
import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database.connection import get_db
from app.database.models import ChatSession, ChatMessage, AnalyticsLog
from app.schemas.chat_schema import ChatRequest, ChatResponse, SourceCitation, ChatSessionItem
from app.services.rag_service import rag_service
from app.services.llm_service import llm_service, DISCLAIMER_TEXTS

router = APIRouter(prefix="/chat", tags=["Chat"])

@router.post("/message", response_model=ChatResponse)
async def send_chat_message(req: ChatRequest, db: Session = Depends(get_db)):
    start_time = time.time()
    
    # Ensure session exists or create new
    session_id = req.session_id
    if not session_id or session_id == "new":
        session_id = f"session_{uuid.uuid4().hex[:12]}"
        
    session = db.query(ChatSession).filter(ChatSession.session_id == session_id).first()
    if not session:
        # Title is clean snippet of first message
        title_snippet = req.message[:45] + ("..." if len(req.message) > 45 else "")
        session = ChatSession(
            session_id=session_id,
            user_identifier=req.user_identifier or "anonymous",
            title=title_snippet,
            language=req.language or "en"
        )
        db.add(session)
        db.commit()
    else:
        session.language = req.language or session.language
        
    # Store user message
    user_msg = ChatMessage(
        session_id=session_id,
        role="user",
        content=req.message,
        language=req.language or "en"
    )
    db.add(user_msg)
    db.commit()
    
    # 1. Intent Detection
    intent = rag_service.detect_intent(req.message)
    
    # 2. RAG Retrieval
    retrieved_chunks = rag_service.retrieve(req.message, top_k=3)
    
    # 3. Conversation Context
    history_records = db.query(ChatMessage).filter(
        ChatMessage.session_id == session_id
    ).order_by(ChatMessage.created_at.asc()).all()
    
    history_dicts = [{"role": m.role, "content": m.content} for m in history_records[-6:]]
    
    # 4. Generate AI Response
    answer, provider_name, is_mock, followups = await llm_service.generate_response(
        query=req.message,
        retrieved_chunks=retrieved_chunks,
        conversation_history=history_dicts,
        intent=intent,
        language=req.language or "en"
    )
    
    # Format Source Citations
    citations: List[SourceCitation] = []
    for c in retrieved_chunks:
        snippet = c.get("content", "")
        # Truncate snippet neatly
        clean_snippet = snippet[:180] + "..." if len(snippet) > 180 else snippet
        citations.append(SourceCitation(
            title=c.get("title", "Department of Justice Document"),
            category=c.get("category", "Government Initiative"),
            source_name=c.get("source_name", "DoJ Official Portal"),
            source_url=c.get("source_url", "https://doj.gov.in/"),
            secondary_url=c.get("secondary_url"),
            relevant_snippet=clean_snippet,
            confidence_score=c.get("similarity_score", 0.85)
        ))
        
    disclaimer = DISCLAIMER_TEXTS.get(req.language or "en", DISCLAIMER_TEXTS["en"])
    
    # Store assistant message
    asst_msg = ChatMessage(
        session_id=session_id,
        role="assistant",
        content=answer,
        intent=intent,
        language=req.language or "en",
        sources_json=json.dumps([cit.dict() for cit in citations]),
        suggested_followups_json=json.dumps(followups)
    )
    db.add(asst_msg)
    
    # Analytics logging
    elapsed_ms = int((time.time() - start_time) * 1000)
    was_answered = len(retrieved_chunks) > 0
    log = AnalyticsLog(
        query_text=req.message,
        intent=intent,
        language=req.language or "en",
        response_time_ms=elapsed_ms,
        was_answered=was_answered
    )
    db.add(log)
    db.commit()
    
    return ChatResponse(
        session_id=session_id,
        message=answer,
        role="assistant",
        intent=intent,
        language=req.language or "en",
        sources=citations,
        suggested_followups=followups,
        disclaimer=disclaimer,
        is_mock_or_offline=is_mock,
        provider=provider_name
    )

@router.get("/history", response_model=List[ChatSessionItem])
def get_chat_history(user_identifier: Optional[str] = None, limit: int = 20, db: Session = Depends(get_db)):
    query = db.query(ChatSession)
    if user_identifier and user_identifier != "all":
        query = query.filter(ChatSession.user_identifier == user_identifier)
        
    sessions = query.order_by(desc(ChatSession.updated_at)).limit(limit).all()
    results = []
    for s in sessions:
        count = db.query(ChatMessage).filter(ChatMessage.session_id == s.session_id).count()
        results.append(ChatSessionItem(
            session_id=s.session_id,
            title=s.title or "Legal Inquiry",
            language=s.language or "en",
            created_at=s.created_at,
            updated_at=s.updated_at,
            message_count=count
        ))
    return results

@router.get("/history/{session_id}")
def get_session_messages(session_id: str, db: Session = Depends(get_db)):
    session = db.query(ChatSession).filter(ChatSession.session_id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
        
    messages = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at.asc()).all()
    out = []
    for m in messages:
        sources = json.loads(m.sources_json) if m.sources_json else []
        followups = json.loads(m.suggested_followups_json) if m.suggested_followups_json else []
        out.append({
            "id": m.id,
            "role": m.role,
            "content": m.content,
            "intent": m.intent,
            "language": m.language,
            "sources": sources,
            "suggested_followups": followups,
            "feedback_rating": m.feedback_rating,
            "feedback_comment": m.feedback_comment,
            "created_at": m.created_at
        })
    return {
        "session_id": session.session_id,
        "title": session.title,
        "language": session.language,
        "created_at": session.created_at,
        "messages": out
    }

@router.delete("/history/{session_id}")
def delete_chat_session(session_id: str, db: Session = Depends(get_db)):
    session = db.query(ChatSession).filter(ChatSession.session_id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    db.delete(session)
    db.commit()
    return {"status": "success", "message": f"Session {session_id} successfully deleted"}
