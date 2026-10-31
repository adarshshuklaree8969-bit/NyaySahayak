import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class AdminUser(Base):
    __tablename__ = "admin_users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(150), default="DoJ Administrator")
    role = Column(String(50), default="SUPER_ADMIN")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AdminOTP(Base):
    __tablename__ = "admin_otps"
    
    id = Column(Integer, primary_key=True, index=True)
    identifier = Column(String(100), index=True, nullable=False)
    otp_code = Column(String(10), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    is_used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ChatSession(Base):
    __tablename__ = "chat_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100), unique=True, index=True, nullable=False)
    user_identifier = Column(String(100), index=True, default="anonymous")
    title = Column(String(255), default="New Legal Inquiry")
    language = Column(String(10), default="en")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100), ForeignKey("chat_sessions.session_id"), nullable=False)
    role = Column(String(20), nullable=False)  # user, assistant, system
    content = Column(Text, nullable=False)
    intent = Column(String(50), nullable=True)
    language = Column(String(10), default="en")
    sources_json = Column(Text, nullable=True)  # JSON string of sources
    suggested_followups_json = Column(Text, nullable=True) # JSON list
    feedback_rating = Column(Integer, default=0) # 1 = thumbs up, -1 = thumbs down
    feedback_comment = Column(Text, nullable=True)
    feedback_flagged = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    session = relationship("ChatSession", back_populates="messages")

class DocumentRecord(Base):
    __tablename__ = "document_records"
    
    id = Column(Integer, primary_key=True, index=True)
    doc_id = Column(String(100), unique=True, index=True, nullable=False)
    filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False) # PDF, DOCX, TXT, JSON
    title = Column(String(255), nullable=False)
    category = Column(String(100), default="Government Scheme")
    source_url = Column(String(500), nullable=True)
    chunk_count = Column(Integer, default=0)
    file_size_kb = Column(Integer, default=0)
    status = Column(String(50), default="INDEXED") # INDEXED, PROCESSING, ERROR
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)

class AnalyticsLog(Base):
    __tablename__ = "analytics_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    query_text = Column(Text, nullable=False)
    intent = Column(String(50), default="General Inquiry")
    language = Column(String(10), default="en")
    response_time_ms = Column(Integer, default=0)
    was_answered = Column(Boolean, default=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
