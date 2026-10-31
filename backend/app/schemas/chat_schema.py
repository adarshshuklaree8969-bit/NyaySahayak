from typing import List, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime

class SourceCitation(BaseModel):
    title: str
    category: str
    source_name: str
    source_url: str
    secondary_url: Optional[str] = None
    relevant_snippet: str
    confidence_score: Optional[float] = 0.0

class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    message: str = Field(..., min_length=1)
    language: Optional[str] = "en"  # "en", "hi", "pa"
    user_identifier: Optional[str] = "anonymous"

class ChatResponse(BaseModel):
    session_id: str
    message: str
    role: str = "assistant"
    intent: str
    language: str
    sources: List[SourceCitation]
    suggested_followups: List[str]
    disclaimer: str
    is_mock_or_offline: bool = False
    provider: str

class FeedbackRequest(BaseModel):
    message_id: int
    rating: int = Field(..., ge=-1, le=1)  # 1 for positive, -1 for negative
    comment: Optional[str] = None
    flagged: Optional[bool] = False

class FeedbackResponse(BaseModel):
    status: str
    message: str

class ChatSessionItem(BaseModel):
    session_id: str
    title: str
    language: str
    created_at: datetime
    updated_at: datetime
    message_count: int = 0
