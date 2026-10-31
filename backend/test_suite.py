import os
import sys
import json
from pathlib import Path
from fastapi.testclient import TestClient

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.main import app
from app.config import settings

# Ensure utf-8 output encoding for Windows command line
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

client = TestClient(app)

def run_tests():
    print("=" * 70)
    print("   NYAYSAHAYAK COMPREHENSIVE AUTOMATED TEST SUITE")
    print("=" * 70)

    # 0. Frontend SPA Serving & Fallback Checks
    print("\n[TEST 0] Testing Frontend Root & SPA Fallback serving...")
    res_root = client.get("/")
    assert res_root.status_code == 200, f"Expected 200, got {res_root.status_code}"
    assert "text/html" in res_root.headers.get("content-type", "")
    assert '<div id="root">' in res_root.text
    print("✓ Root [/] successfully serves React SPA HTML index")

    res_spa = client.get("/chat")
    assert res_spa.status_code == 200
    assert "text/html" in res_spa.headers.get("content-type", "")
    print("✓ Deep route [/chat] successfully falls back to SPA index.html")

    # Dynamically find an asset file in frontend/dist/assets
    assets_dir = Path(__file__).resolve().parent.parent / "frontend" / "dist" / "assets"
    js_files = list(assets_dir.glob("*.js")) if assets_dir.exists() else []
    asset_name = js_files[0].name if js_files else "index.js"
    res_asset = client.get(f"/assets/{asset_name}")
    assert res_asset.status_code == 200
    print(f"✓ Static frontend asset [/assets/{asset_name}] served successfully")

    res_api_info = client.get("/api")
    assert res_api_info.status_code == 200
    assert "application/json" in res_api_info.headers.get("content-type", "")
    print("✓ API Info [/api] returns valid JSON metadata")

    res_404 = client.get("/api/unknown_endpoint")
    assert res_404.status_code == 404
    print("✓ Unhandled API endpoint correctly returns 404 without catching SPA")

    # 1. Health Check
    print("\n[TEST 1] Testing /api/health endpoint...")
    res = client.get("/api/health")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    health = res.json()
    print("✓ Health status:", health["status"])
    print("✓ Active LLM Provider:", health["active_llm_provider"])
    print("✓ Indexed Chunks:", health["indexed_chunks"])
    print("✓ Supported Languages:", health["supported_languages"])
    assert "bho" in health["supported_languages"], "Bhojpuri not reported in supported_languages"

    # 2. English Chat Query
    print("\n[TEST 2] Testing English Chat Query (Tele-Law)...")
    res = client.post("/api/chat/message", json={
        "message": "What is the Tele-Law scheme and who is eligible for free legal advice?",
        "language": "en"
    })
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    chat_res = res.json()
    session_id = chat_res["session_id"]
    print("✓ Session ID:", session_id)
    print("✓ Intent Detected:", chat_res["intent"])
    print("✓ Source Citations Count:", len(chat_res["sources"]))
    print("✓ Top Citation:", chat_res["sources"][0]["title"] if chat_res["sources"] else "None")
    print("✓ Suggested Follow-ups:", len(chat_res["suggested_followups"]))
    assert "Tele-Law" in chat_res["message"] or "tele" in chat_res["message"].lower()

    # 3. Hindi Chat Query
    print("\n[TEST 3] Testing Hindi Chat Query (eCourts CNR)...")
    res_hi = client.post("/api/chat/message", json={
        "session_id": session_id,
        "message": "16 अंकों का सीएनआर (CNR) नंबर क्या होता है और केस स्टेटस कैसे देखें?",
        "language": "hi"
    })
    assert res_hi.status_code == 200
    data_hi = res_hi.json()
    print("✓ Hindi Intent Detected:", data_hi["intent"])
    print("✓ Hindi Top Citation:", data_hi["sources"][0]["title"] if data_hi["sources"] else "None")

    # 4. Punjabi Chat Query
    print("\n[TEST 4] Testing Punjabi Chat Query (NALSA Legal Aid)...")
    res_pa = client.post("/api/chat/message", json={
        "message": "ਮੁਫ਼ਤ ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ ਲਈ ਕੌਣ ਯੋਗ ਹੈ?",
        "language": "pa"
    })
    assert res_pa.status_code == 200
    data_pa = res_pa.json()
    print("✓ Punjabi Intent Detected:", data_pa["intent"])
    print("✓ Punjabi Response Preview:", data_pa["message"][:80], "...")

    # 4A. Bhojpuri Chat Query (Strict Independent Detection & Authentic Response)
    print("\n[TEST 4A] Testing Bhojpuri Legal Query (Tele-Law & Free Lawyer)...")
    bho_query = "टेली-लॉ योजना का हवे आ एकरा से मुफ्त में वकील कइसे मिली?"
    res_bho = client.post("/api/chat/message", json={
        "message": bho_query
    })
    assert res_bho.status_code == 200, f"Expected 200, got {res_bho.status_code}"
    data_bho = res_bho.json()
    bho_session_id = data_bho["session_id"]
    assert data_bho["language"] == "bho", f"Expected language 'bho', got {data_bho['language']}"
    assert data_bho["intent"] == "Tele-Law & Citizen Advice", f"Unexpected intent {data_bho['intent']}"
    
    # Verify authentic Bhojpuri grammar and markers
    bho_text = data_bho["message"]
    has_bho_markers = any(m in bho_text for m in ["बा", "बाटे", "बानी", "रउवा", "कइल जाई", "मिली", "हवे"])
    assert has_bho_markers, "Response missing authentic Bhojpuri markers!"
    print("✓ Bhojpuri Detected Independently from Hindi:", data_bho["language"])
    print("✓ Bhojpuri Intent:", data_bho["intent"])
    print("✓ Bhojpuri Response Preview:", bho_text[:110], "...")
    print("✓ Bhojpuri Disclaimer:", data_bho["disclaimer"])
    assert "ई एआई सहायक" in data_bho["disclaimer"]
    print("✓ Bhojpuri Suggested Follow-ups Count:", len(data_bho["suggested_followups"]))
    assert any("कइसे" in f or "मिलेला" in f for f in data_bho["suggested_followups"])

    # 4B. Bhojpuri Follow-up & Language Consistency
    print("\n[TEST 4B] Testing Bhojpuri Follow-up & Language Continuity...")
    bho_followup = "का एकरा खातिर कवनो फीस लागेला?"
    res_follow = client.post("/api/chat/message", json={
        "session_id": bho_session_id,
        "message": bho_followup
    })
    assert res_follow.status_code == 200
    data_follow = res_follow.json()
    assert data_follow["language"] == "bho", f"Expected 'bho', got {data_follow['language']}"
    assert any(m in data_follow["message"] for m in ["बा", "फीस", "मुफ्त", "रउवा", "ना"]), "Follow-up response not in Bhojpuri!"
    print("✓ Bhojpuri Follow-up maintained conversation language:", data_follow["language"])
    print("✓ Bhojpuri Follow-up Response Preview:", data_follow["message"][:100], "...")

    # 4C. Strict Independent Language Matching Across 4 Languages
    print("\n[TEST 4C] Testing Strict Independent Language Detection across all 4 Languages...")
    from app.api.chat import detect_language
    assert detect_language("What is the procedure for eCourts case status?") == "en"
    assert detect_language("ई-कोर्ट पर केस स्टेटस की प्रक्रिया क्या है?") == "hi"
    assert detect_language("ਈ-ਕੋਰਟ 'ਤੇ ਕੇਸ ਦੀ ਸਥਿਤੀ ਕਿਵੇਂ ਦੇਖੀਏ?") == "pa"
    assert detect_language("ई-कोर्ट में केस के स्थिति कइसे देखल जाई?") == "bho"
    assert detect_language("हमके मुफ्त वकील चाहीं, तनी समझाईं") == "bho"
    print("✓ English independently detected as: en")
    print("✓ Hindi independently detected as: hi")
    print("✓ Punjabi independently detected as: pa")
    print("✓ Bhojpuri independently detected as: bho")

    # 5. Chat History
    print("\n[TEST 5] Testing Chat History retrieval...")
    res_hist = client.get("/api/chat/history?limit=10")
    assert res_hist.status_code == 200
    history = res_hist.json()
    print(f"✓ Found {len(history)} recorded sessions in database")

    # 6. Session Messages Detail
    print("\n[TEST 6] Testing Session Messages retrieval...")
    res_msgs = client.get(f"/api/chat/history/{session_id}")
    assert res_msgs.status_code == 200
    session_msgs = res_msgs.json()["messages"]
    print(f"✓ Session {session_id} has {len(session_msgs)} persistent messages")
    assert len(session_msgs) >= 2
    last_bot_msg_id = session_msgs[-1]["id"]

    # 7. Feedback Submission
    print(f"\n[TEST 7] Testing Feedback Submission on message ID {last_bot_msg_id}...")
    res_fb = client.post("/api/feedback", json={
        "message_id": last_bot_msg_id,
        "rating": 1,
        "comment": "Accurate and verified information matching doj.gov.in."
    })
    assert res_fb.status_code == 200
    print("✓ Feedback recorded successfully:", res_fb.json()["message"])

    # 8. Admin Authentication & 2-Factor OTP
    print("\n[TEST 8] Testing Admin 2-Factor OTP Generation & Verification...")
    res_otp = client.post("/api/auth/send-otp", json={"identifier": settings.DEFAULT_ADMIN_USER})
    assert res_otp.status_code == 200
    otp_data = res_otp.json()
    print("✓ OTP dispatch status:", otp_data["message"])

    # Retrieve generated OTP from database record (mimicking user checking their inbox)
    from app.database.connection import SessionLocal
    from app.database.models import AdminOTP
    db_session = SessionLocal()
    otp_entry = db_session.query(AdminOTP).filter(
        AdminOTP.identifier == settings.DEFAULT_ADMIN_USER,
        AdminOTP.is_used == False
    ).order_by(AdminOTP.created_at.desc()).first()
    assert otp_entry is not None
    generated_code = otp_entry.otp_code
    db_session.close()

    print("✓ OTP verified from email dispatch record:", generated_code)

    res_verify = client.post("/api/auth/verify-otp", json={
        "identifier": settings.DEFAULT_ADMIN_USER,
        "otp_code": generated_code
    })
    assert res_verify.status_code == 200
    token_data = res_verify.json()
    admin_token = token_data["access_token"]
    print("✓ OTP verified & Admin authenticated, token type:", token_data["token_type"])

    # 9. Admin Profile
    res_me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {admin_token}"})
    assert res_me.status_code == 200
    print("✓ Admin Profile retrieved:", res_me.json()["full_name"], f"({res_me.json()['role']})")

    # 10. Document Management & Ingestion
    print("\n[TEST 10] Testing Document Listing & Dynamic Upload Ingestion...")
    docs_before = client.get("/api/documents").json()
    print(f"✓ Knowledge Base currently holds {len(docs_before)} documents")

    sample_doc_path = settings.DATA_DIR / "sample_documents" / "eCourts_Phase_III_Citizen_Charter.docx"
    if sample_doc_path.exists():
        with open(sample_doc_path, "rb") as f:
            upload_res = client.post(
                "/api/documents/upload",
                headers={"Authorization": f"Bearer {admin_token}"},
                files={"file": ("eCourts_Phase_III_Citizen_Charter.docx", f, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")},
                data={
                    "title": "eCourts Phase III Citizen Charter",
                    "category": "Judicial Services",
                    "source_url": "https://ecourts.gov.in/"
                }
            )
        assert upload_res.status_code == 200, f"Upload failed: {upload_res.text}"
        uploaded_doc = upload_res.json()
        print(f"✓ Successfully ingested '{uploaded_doc['title']}'! Vector chunks created: {uploaded_doc['chunks_created']}")
        new_doc_id = uploaded_doc["doc_id"]

        # Verify deletion of uploaded document
        del_res = client.delete(f"/api/documents/{new_doc_id}", headers={"Authorization": f"Bearer {admin_token}"})
        assert del_res.status_code == 200
        print(f"✓ Successfully cleaned up uploaded document {new_doc_id}")

    # 11. Analytics Summary
    print("\n[TEST 11] Testing Analytics & Usage Statistics...")
    res_ana = client.get("/api/analytics/summary")
    assert res_ana.status_code == 200
    ana = res_ana.json()
    print("✓ Total Queries:", ana["total_queries"])
    print("✓ Daily Active Users:", ana["daily_active_users"])
    print("✓ Satisfaction Score:", ana["user_satisfaction_percentage"], "%")
    print("✓ Top Intent:", ana["top_intents"][0]["name"])

    print("\n" + "=" * 70)
    print("   ALL 11 TEST MODULES PASSED WITH 100% SUCCESS!")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()
