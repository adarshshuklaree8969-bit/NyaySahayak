import os
from pathlib import Path
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "NyaySahayak - Department of Justice Virtual Assistant"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "doj-nyaysahayak-super-secret-jwt-key-2026")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # AI / LLM Configuration
    # Supported: "AUTO", "GEMINI", "OPENAI", "OFFLINE"
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "AUTO")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    
    # Paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    DATA_DIR: Path = BASE_DIR / "app" / "data"
    UPLOADS_DIR: Path = BASE_DIR / "uploads"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/nyaysahayak.db")
    
    # Default Admin
    DEFAULT_ADMIN_USER: str = os.getenv("ADMIN_USERNAME", "admin@doj.gov.in")
    DEFAULT_ADMIN_PASS: str = os.getenv("ADMIN_PASSWORD", "NyayAdmin@2026")
    
    # SMTP / Gmail Configuration for Live OTP Email
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    SMTP_FROM_NAME: str = os.getenv("SMTP_FROM_NAME", "Department of Justice (NyaySahayak)")
    SMTP_FROM_EMAIL: str = os.getenv("SMTP_FROM_EMAIL", "")
    
    class Config:
        case_sensitive = True

settings = Settings()
settings.UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
