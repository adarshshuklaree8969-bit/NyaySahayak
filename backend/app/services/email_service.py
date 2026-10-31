import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Tuple

from app.config import settings

logger = logging.getLogger("email_service")

class EmailService:
    @staticmethod
    def send_otp_email(to_email: str, otp_code: str) -> Tuple[bool, str]:
        """
        Sends an official 6-digit OTP email to the recipient's Gmail / email address.
        Returns: (is_sent_via_smtp: bool, status_message: str)
        """
        sender_email = settings.SMTP_FROM_EMAIL or settings.SMTP_USER
        smtp_password = settings.SMTP_PASSWORD

        # Prepare Email Content
        subject = f"{otp_code} is your NyaySahayak Admin Verification Code"
        
        # HTML Template
        html_content = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Department of Justice - OTP Verification</title>
</head>
<body style="font-family: Arial, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F8FAFC; margin: 0; padding: 20px;">
  <div style="max-width: 580px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #E2E8F0;">
    
    <!-- Top Tiranga Accent -->
    <div style="height: 6px; width: 100%; display: flex;">
      <div style="width: 33.33%; background-color: #FF9933; height: 6px;"></div>
      <div style="width: 33.33%; background-color: #FFFFFF; height: 6px;"></div>
      <div style="width: 33.34%; background-color: #138808; height: 6px;"></div>
    </div>

    <!-- Header -->
    <div style="background-color: #0B2545; padding: 28px 24px; text-align: center;">
      <h1 style="color: #FFFFFF; margin: 0; font-size: 22px; letter-spacing: 0.5px;">NyaySahayak • न्याय सहायक</h1>
      <p style="color: #FF9933; margin: 6px 0 0 0; font-size: 13px; font-weight: bold;">Department of Justice • Ministry of Law & Justice, Govt. of India</p>
    </div>

    <!-- Body -->
    <div style="padding: 32px 28px; color: #1E293B;">
      <h2 style="font-size: 18px; color: #0B2545; margin-top: 0;">2-Factor Security Authentication</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #475569;">
        You have requested administrative access to the <strong>Department of Justice Knowledge Portal</strong>. Use the official One-Time Password (OTP) below to authenticate your session:
      </p>

      <!-- OTP Box -->
      <div style="background-color: #F1F5F9; border: 2px dashed #0B2545; border-radius: 12px; padding: 22px; text-align: center; margin: 28px 0;">
        <span style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; letter-spacing: 12px; color: #0B2545; display: inline-block;">{otp_code}</span>
        <p style="margin: 8px 0 0 0; font-size: 12px; color: #64748B; font-weight: 600;">Valid for 10 minutes only</p>
      </div>

      <p style="font-size: 13px; line-height: 1.5; color: #64748B;">
        ⚠️ <strong>Security Advisory:</strong> Do not share this OTP with anyone. Department of Justice officials will never ask for your verification code or credentials.
      </p>
      
      <p style="font-size: 12px; line-height: 1.5; color: #94A3B8; margin-top: 24px; border-top: 1px solid #E2E8F0; padding-top: 16px;">
        If you did not initiate this login request, please discard this message.
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #F8FAFC; padding: 18px 24px; text-align: center; border-top: 1px solid #E2E8F0; font-size: 11px; color: #64748B;">
      © 2026 Department of Justice, Ministry of Law & Justice, Government of India.<br>
      Jaisalmer House, 26, Man Singh Road, New Delhi - 110011
    </div>
  </div>
</body>
</html>
"""

        plain_text = f"""NyaySahayak - Department of Justice, Govt. of India
2-Factor Security Authentication

Your verification code is: {otp_code}

This OTP is valid for 10 minutes.
Do not share this code with anyone.

© 2026 Department of Justice, Ministry of Law & Justice, Govt. of India.
"""

        # Check if SMTP credentials are provided
        if not settings.SMTP_USER or not smtp_password:
            # Log clearly for the user on backend terminal
            print("\n" + "="*70)
            print("🏛️  [NYAYSAHAYAK OFFICIAL OTP EMAIL DISPATCH]")
            print(f"📧  Recipient: {to_email}")
            print(f"🔑  Generated Security OTP: {otp_code}")
            print("ℹ️   (To send directly to Gmail inbox, enter your SMTP_USER & SMTP_PASSWORD in backend/.env)")
            print("="*70 + "\n")
            return False, "SMTP credentials not configured in backend/.env. OTP recorded in secure server terminal."

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{settings.SMTP_FROM_NAME} <{sender_email}>"
            msg["To"] = to_email

            part1 = MIMEText(plain_text, "plain", "utf-8")
            part2 = MIMEText(html_content, "html", "utf-8")
            msg.attach(part1)
            msg.attach(part2)

            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=12) as server:
                server.starttls()
                server.login(settings.SMTP_USER, smtp_password)
                server.sendmail(sender_email, [to_email], msg.as_string())

            logger.info(f"Live OTP email successfully delivered to {to_email} via Gmail SMTP.")
            return True, f"Official OTP has been delivered directly to your Gmail inbox ({to_email})."

        except Exception as e:
            logger.error(f"Failed to send email via SMTP to {to_email}: {str(e)}")
            # Fallback to terminal log so login is never blocked
            print("\n" + "="*70)
            print("🏛️  [NYAYSAHAYAK OFFICIAL OTP EMAIL DISPATCH (FALLBACK)]")
            print(f"📧  Recipient: {to_email}")
            print(f"🔑  Generated Security OTP: {otp_code}")
            print(f"⚠️  SMTP Error: {str(e)}")
            print("="*70 + "\n")
            return False, f"Could not reach SMTP gateway ({str(e)}). OTP printed to server log."

email_service = EmailService()
