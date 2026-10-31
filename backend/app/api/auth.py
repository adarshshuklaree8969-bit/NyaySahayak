import random
import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db, verify_password, get_password_hash
from app.database.models import AdminUser, AdminOTP
from app.schemas.document_schema import (
    AdminLoginRequest, 
    TokenResponse, 
    SendOTPRequest, 
    SendOTPResponse, 
    VerifyOTPRequest
)
from app.core.security import create_access_token, get_current_admin
from app.config import settings
from app.services.email_service import email_service

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/send-otp", response_model=SendOTPResponse)
def send_otp(req: SendOTPRequest, db: Session = Depends(get_db)):
    identifier = req.identifier.strip().lower()
    if not identifier:
        raise HTTPException(status_code=400, detail="Identifier (Email or Phone) is required")
        
    # Check if admin user exists, or if standard official format
    admin = db.query(AdminUser).filter(
        (AdminUser.username == identifier) | (AdminUser.username == settings.DEFAULT_ADMIN_USER)
    ).first()
    
    # Generate 6-digit OTP
    otp_code = f"{random.randint(100000, 999999)}"
    expires_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
    
    # Mark old unused OTPs for this identifier as used
    db.query(AdminOTP).filter(
        AdminOTP.identifier == identifier,
        AdminOTP.is_used == False
    ).update({"is_used": True})
    
    # Record new OTP
    new_otp = AdminOTP(
        identifier=identifier,
        otp_code=otp_code,
        expires_at=expires_at,
        is_used=False
    )
    db.add(new_otp)
    db.commit()
    
    # Send official email via Gmail SMTP (or log securely to terminal if SMTP not yet configured)
    email_sent, email_msg = email_service.send_otp_email(identifier, otp_code)
    smtp_ready = bool(settings.SMTP_USER and settings.SMTP_PASSWORD)
    
    user_message = f"One-Time Password (OTP) has been dispatched to {identifier}. Please check your Gmail Inbox and Spam folder." if email_sent else f"Security OTP generated for {identifier}. Check your Gmail Inbox (or server terminal logs)."
    
    return SendOTPResponse(
        status="success",
        message=user_message,
        email_sent=email_sent,
        smtp_configured=smtp_ready,
        expires_in_seconds=600
    )

@router.post("/verify-otp", response_model=TokenResponse)
def verify_otp(req: VerifyOTPRequest, db: Session = Depends(get_db)):
    identifier = req.identifier.strip().lower()
    otp_code = req.otp_code.strip()
    
    now = datetime.datetime.utcnow()
    otp_record = db.query(AdminOTP).filter(
        AdminOTP.identifier == identifier,
        AdminOTP.otp_code == otp_code,
        AdminOTP.is_used == False,
        AdminOTP.expires_at > now
    ).order_by(AdminOTP.created_at.desc()).first()
    
    if not otp_record:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired OTP. Please verify the code or request a fresh OTP."
        )
        
    # Mark OTP as used
    otp_record.is_used = True
    db.commit()
    
    # Fetch or provision the admin user record
    admin = db.query(AdminUser).filter(AdminUser.username == identifier).first()
    if not admin:
        # Check default admin or provision official admin
        admin = db.query(AdminUser).filter(AdminUser.username == settings.DEFAULT_ADMIN_USER).first()
        if not admin:
            admin = AdminUser(
                username=identifier,
                hashed_password=get_password_hash("AdminPass@2026"),
                full_name="Department of Justice Officer",
                role="SUPER_ADMIN",
                is_active=True
            )
            db.add(admin)
            db.commit()
            
    access_token = create_access_token(data={"sub": admin.username, "role": admin.role})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "username": admin.username,
            "full_name": admin.full_name,
            "role": admin.role
        }
    }

@router.post("/login", response_model=TokenResponse)
def login_for_access_token(login_data: AdminLoginRequest, db: Session = Depends(get_db)):
    admin = db.query(AdminUser).filter(AdminUser.username == login_data.username).first()
    if not admin or not verify_password(login_data.password, admin.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password. Please verify your administrative credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not admin.is_active:
        raise HTTPException(status_code=400, detail="Administrative account is disabled")

    access_token = create_access_token(data={"sub": admin.username, "role": admin.role})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "username": admin.username,
            "full_name": admin.full_name,
            "role": admin.role
        }
    }

@router.get("/me")
def get_admin_profile(current_admin: AdminUser = Depends(get_current_admin)):
    return {
        "username": current_admin.username,
        "full_name": current_admin.full_name,
        "role": current_admin.role,
        "created_at": current_admin.created_at
    }
