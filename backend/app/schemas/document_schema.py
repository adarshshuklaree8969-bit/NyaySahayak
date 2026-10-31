from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

class DocumentSchema(BaseModel):
    id: int
    doc_id: str
    filename: str
    file_type: str
    title: str
    category: str
    source_url: Optional[str] = None
    chunk_count: int
    file_size_kb: int
    status: str
    uploaded_at: datetime

    class Config:
        from_attributes = True

class DocumentUploadResponse(BaseModel):
    doc_id: str
    filename: str
    title: str
    chunks_created: int
    message: str

class AnalyticsSummary(BaseModel):
    total_queries: int
    daily_active_users: int
    answered_queries: int
    unanswered_queries: int
    user_satisfaction_percentage: float
    total_indexed_documents: int
    top_intents: List[dict]
    recent_unanswered: List[dict]
    language_distribution: List[dict]

class AdminLoginRequest(BaseModel):
    username: str
    password: str

class SendOTPRequest(BaseModel):
    identifier: str

class SendOTPResponse(BaseModel):
    status: str
    message: str
    email_sent: bool = False
    smtp_configured: bool = False
    expires_in_seconds: int = 600

class VerifyOTPRequest(BaseModel):
    identifier: str
    otp_code: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict
