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

# Distinctive Bhojpuri markers (lexical, grammatical, pronouns, auxiliaries, inflectional suffixes)
BHOJPURI_WORDS = {
    "बा", "बाटे", "बानी", "बाड़न", "बाड़ू", "बाड़ऽ", "बाड़ा", "रहुवे", "रहलन",
    "रउवा", "रउरा", "तोहार", "हमार", "हमारन", "ओकरा", "केकरा", "एह", "ओह", "कवनो", "केहू",
    "कइसे", "काहें", "काहे", "होई", "होखी", "कइल", "कइले", "लिहल", "देखल", "करल",
    "जाई", "जाइब", "आई", "मिली", "मिलत", "करेला", "होखेला", "भइल", "गइल", "आइल", "चाहत",
    "हवे", "हटे", "सभे", "लोगन", "तनी", "संगे", "बुझात", "बताईं", "दीं", "खातिर", "खाती",
    "हमनी", "अपने", "काहेंला", "लागेला", "पूछत", "बतावल", "देखाई", "बोलत"
}

BHOJPURI_PHRASES = [
    "का हवे", "का हटे", "का बा", "कइल जाई", "कइसे होई", "केकरा के", "चाहत बानी",
    "बता दीं", "मदद मिली", "सलाह मिली", "कइसे मिली", "केस के", "अरजी देब",
    "देखल जाव", "कइसे देखल", "काहे ना", "फीस लागेला", "फीस बा", "कइसे लिहल",
    "जोड़ल जाव", "जुड़ल जाव", "कइसे काम", "का बाटे", "तनी समझाईं", "बतावल जाव"
]

ROMAN_BHOJPURI_MARKERS = [
    "kaise", "baate", "raua", "kekra", "khati", "khatir", "kail jaai", "baani",
    "bhojpuri", "ka hawe", "ka bate", "lagela", "dekhai", "tohake", "hamar"
]

def detect_language(text: str, explicit_lang: Optional[str] = None, session_lang: Optional[str] = None) -> str:
    raw = (text or "").strip()
    if not raw:
        return explicit_lang or session_lang or "en"

    # 1. Punjabi Detection via Gurmukhi Script range
    if any("\u0A00" <= ch <= "\u0A7F" for ch in raw):
        return "pa"

    # 2. Independent Bhojpuri Detection
    cleaned = raw.lower().replace("?", " ").replace("!", " ").replace(".", " ").replace(",", " ")
    tokens = set(cleaned.split())

    has_bho_phrase = any(phrase in cleaned for phrase in BHOJPURI_PHRASES)
    has_bho_word = bool(tokens.intersection(BHOJPURI_WORDS))
    has_roman_bho = any(rm in cleaned for rm in ROMAN_BHOJPURI_MARKERS)

    if has_bho_phrase or has_bho_word or has_roman_bho:
        return "bho"

    # Explicit client selection takes priority if set to a valid non-English code
    if explicit_lang == "bho":
        return "bho"

    # 3. Hindi Detection (Devanagari script without Bhojpuri markers)
    if any("\u0900" <= ch <= "\u097F" for ch in raw):
        return "hi"

    if explicit_lang in ["hi", "pa", "bho", "en"]:
        return explicit_lang

    # 4. Follow-up language retention in existing conversation
    if session_lang in ["bho", "hi", "pa"]:
        # If short follow-up without strong English indicators
        if len(tokens) <= 6:
            return session_lang

    return "en"

@router.post("/message", response_model=ChatResponse)
async def send_chat_message(req: ChatRequest, db: Session = Depends(get_db)):
    start_time = time.time()
    
    # Ensure session exists or create new
    session_id = req.session_id
    if not session_id or session_id == "new":
        session_id = f"session_{uuid.uuid4().hex[:12]}"
        
    session = db.query(ChatSession).filter(ChatSession.session_id == session_id).first()
    
    # Detect language strictly and independently
    detected_lang = detect_language(
        text=req.message,
        explicit_lang=req.language,
        session_lang=session.language if session else None
    )

    if not session:
        # Title is clean snippet of first message
        title_snippet = req.message[:45] + ("..." if len(req.message) > 45 else "")
        session = ChatSession(
            session_id=session_id,
            user_identifier=req.user_identifier or "anonymous",
            title=title_snippet,
            language=detected_lang
        )
        db.add(session)
        db.commit()
    else:
        session.language = detected_lang
        db.commit()
        
    # Store user message
    user_msg = ChatMessage(
        session_id=session_id,
        role="user",
        content=req.message,
        language=detected_lang
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
        language=detected_lang
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
        
    disclaimer = DISCLAIMER_TEXTS.get(detected_lang, DISCLAIMER_TEXTS["en"])
    
    # Store assistant message
    asst_msg = ChatMessage(
        session_id=session_id,
        role="assistant",
        content=answer,
        intent=intent,
        language=detected_lang,
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
        language=detected_lang,
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
        language=detected_lang,
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
