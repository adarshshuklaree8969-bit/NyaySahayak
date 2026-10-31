from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config import settings
from app.database.models import Base, AdminUser
import bcrypt

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_password_hash(password: str) -> str:
    # Use bcrypt directly to avoid passlib deprecation issues with python 3.13
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

def init_db():
    Base.metadata.create_all(bind=engine)
    
    # Seed default super admin user if not present
    db = SessionLocal()
    try:
        admin = db.query(AdminUser).filter(AdminUser.username == settings.DEFAULT_ADMIN_USER).first()
        if not admin:
            hashed = get_password_hash(settings.DEFAULT_ADMIN_PASS)
            new_admin = AdminUser(
                username=settings.DEFAULT_ADMIN_USER,
                hashed_password=hashed,
                full_name="Department of Justice Admin",
                role="SUPER_ADMIN",
                is_active=True
            )
            db.add(new_admin)
            db.commit()
    finally:
        db.close()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
