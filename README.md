# NyaySahayak (न्याय सहायक) 🇮🇳
### AI-Based Interactive Chatbot / Virtual Assistant for Department of Justice
**Ministry of Law & Justice, Government of India**

---

## 🏛️ 1. Project Overview

**NyaySahayak** is a production-oriented, AI-powered interactive virtual assistant designed for the **Department of Justice (Ministry of Law & Justice, Government of India)**. Its mission is to bridge the digital and linguistic divide in India's legal justice ecosystem by providing citizens, litigants, lawyers, students, and rural communities with instant, context-aware, and authoritative judicial information.

### Core Objectives:
- **Democratize Legal Information:** Provide easy-to-understand explanations of complex legal schemes and statutory rights under Article 39A of the Constitution of India.
- **Authoritative & Hallucination-Free:** Ground every response strictly in verified Government of India portals and gazettes (`doj.gov.in`, `ecourts.gov.in`, `nalsa.gov.in`, `tele-law.in`, `nyayvikas.gov.in`).
- **Multilingual Inclusivity:** Full support for **English**, **Hindi (हिन्दी)**, and **Punjabi (ਪੰਜਾਬੀ)** with native Devanagari and Gurmukhi script processing.
- **Hands-Free Voice Interaction:** Integrated Speech-to-Text (STT) and Text-to-Speech (TTS) voice assistants for illiterate, rural, or visually impaired citizens.
- **Source Transparency:** Every response includes verbatim citation snippets, confidence scores, and direct links to official government portals.
- **Administrative Empowerment:** Secure admin dashboard for uploading PDFs, DOCX, and TXT documents, managing the vector knowledge base, auditing unanswered queries, and monitoring satisfaction analytics.

---

## 🛠️ 2. Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide React Icons |
| **Backend** | Python 3.13, FastAPI, RESTful Architecture, Uvicorn |
| **Database** | SQLite / PostgreSQL with SQLAlchemy ORM |
| **AI / RAG Pipeline** | Hybrid Vector Search (Sublinear TF-IDF + Cosine Similarity), Semantic Chunking, Cross-Lingual Concept Mapper |
| **Configurable LLM** | Google Gemini API, OpenAI GPT, or Built-in Zero-Cloud RAG Domain Synthesizer (runs 100% offline without API keys) |
| **Voice & Speech** | Native Web Speech API (`SpeechRecognition` & `SpeechSynthesis`) |
| **Document Processing** | `pypdf`, `python-docx`, `reportlab` |
| **Security & Auth** | JWT (JSON Web Tokens), Bcrypt password hashing, Role-Based Access Control |

---

## 🎨 3. Government UI/UX Design System

- **Color Palette:**
  - **Deep Navy Blue** (`#0B2545`) - Authority and judicial integrity
  - **Saffron Orange** (`#FF9933`) - Indian National Identity & vibrant highlights
  - **India Green** (`#138808`) - Accessibility & growth accents
  - **Slate & Pure White** (`#F8FAFC`, `#FFFFFF`) - Clean, readable contrast
- **Accessibility & Compliance:**
  - Light & Dark mode toggle
  - High-contrast typography with system font fallbacks
  - Fully responsive mobile-first layout
  - Screen-reader aria attributes and clean semantic HTML

---

## 🚀 4. Quick Start & Execution

### Option A: One-Click Launch (Windows)
Double-click `start_nyaysahayak.bat` in the project root folder. It will automatically launch:
1. **Backend Server:** `http://127.0.0.1:8000` (API Docs at `/docs`)
2. **Citizen Frontend:** `http://localhost:5173`

---

### Option B: Manual Setup

#### 1. Backend Setup
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run automated test suite
python test_suite.py

# Start the FastAPI server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### 2. Frontend Setup
```bash
cd frontend

# Run Vite development server
node ./node_modules/vite/bin/vite.js --host
```
Open **`http://localhost:5173`** in your browser.

---

## 🔐 5. Administrative Credentials

For administrative access and knowledge management:
- **Admin Portal URL:** `http://localhost:5173` -> Click **"Admin"** in header navigation
- **Admin Identifier:** `admin@doj.gov.in` (Supports 2-Step Official OTP Authentication)
- **Default Password:** `NyayAdmin@2026`
*(A convenient "Auto-Fill" button and OTP generator is provided on the login page for instant authentication).*

---

## 📂 6. Project Architecture

```
NyaySahayak/
├── backend/
│   ├── app/
│   │   ├── main.py                    # FastAPI application & router mounting
│   │   ├── config.py                  # Environment settings & JWT configuration
│   │   ├── api/
│   │   │   ├── auth.py                # Admin JWT login & profile endpoints
│   │   │   ├── chat.py                # Chat conversational inference & history
│   │   │   ├── documents.py           # Ingestion, listing, delete & re-indexing
│   │   │   ├── feedback.py            # User rating (thumbs) & issue reporting
│   │   │   └── analytics.py           # Real-time usage statistics & unresolved queries
│   │   ├── core/
│   │   │   └── security.py            # Password hashing & JWT dependencies
│   │   ├── database/
│   │   │   ├── connection.py          # SQLAlchemy SQLite connection & seeding
│   │   │   └── models.py              # Sessions, Messages, Docs, Admin models
│   │   ├── schemas/
│   │   │   ├── chat_schema.py         # Pydantic schemas for requests/responses
│   │   │   └── document_schema.py     # Document & Analytics schemas
│   │   ├── services/
│   │   │   ├── rag_service.py         # Core RAG retrieval & intent detection
│   │   │   ├── embedding_service.py   # Hybrid vector search with multilingual tokens
│   │   │   ├── llm_service.py         # Gemini, OpenAI, & Offline RAG synthesizer
│   │   │   └── document_service.py    # PDF, DOCX, & TXT text extraction & chunking
│   │   └── data/
│   │       ├── doj_knowledge_base.json # Official pre-indexed schemes & acts
│   │       └── sample_documents/      # Test PDF and DOCX government documents
│   ├── test_suite.py                  # Comprehensive automated test suite (11 modules)
│   ├── requirements.txt               # Backend Python dependencies
│   ├── .env.example                   # Sample environment configuration
│   └── .env                           # Active environment variables
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx             # Government header with Tiranga accent & language toggle
│   │   │   └── Footer.tsx             # Citizen footer with official links & helpline 15100
│   │   ├── pages/
│   │   │   ├── HomePage.tsx           # Citizen landing page with cards & live statistics
│   │   │   ├── ChatPage.tsx           # AI chat with citations, STT/TTS voice & feedback
│   │   │   ├── AboutPage.tsx          # SIH1700 mission, DoJ constitutional mandate
│   │   │   ├── FeaturesPage.tsx       # System feature showcase & AI architecture
│   │   │   ├── KnowledgeSourcesPage.tsx # Verified portals catalog & document explorer
│   │   │   ├── AdminLoginPage.tsx     # Admin authentication portal
│   │   │   ├── AdminDashboardPage.tsx # Document upload (PDF/DOCX), analytics & audit
│   │   │   ├── PrivacyPage.tsx        # DPDP compliance & citizen privacy policy
│   │   │   └── ContactPage.tsx        # DoJ HQ address, helpline & feedback form
│   │   ├── context/
│   │   │   ├── ThemeContext.tsx       # Light / Dark mode context
│   │   │   └── LanguageContext.tsx    # English, Hindi, Punjabi dictionaries
│   │   ├── services/
│   │   │   └── api.ts                 # Type-safe API client for backend
│   │   ├── types/
│   │   │   └── index.ts               # Core TypeScript interface definitions
│   │   ├── App.tsx                    # Main navigation controller
│   │   ├── main.tsx                   # React root entry point
│   │   └── index.css                  # Tailwind styles & smooth scrollbars
│   ├── package.json                   # Frontend dependencies
│   ├── vite.config.ts                 # Vite bundler configuration
│   └── tailwind.config.js             # Theme color palette definition
│
├── run_backend.bat                    # Script to start FastAPI server
├── run_frontend.bat                   # Script to start Vite client
└── start_nyaysahayak.bat              # One-click dual server launcher
```

---

## 🌐 7. Verified Department of Justice Knowledge Base

NyaySahayak comes pre-loaded with verified official documentation on:
1. **Tele-Law: Reaching the Unreached:** Legal advice via 2.5+ Lakh CSCs, Tele-Law Mobile App, and free consultations under Section 12.
2. **eCourts Mission Mode Project (Phases I, II, & III):** CNR number case tracking, National Judicial Data Grid (NJDG), Virtual Courts, and e-Filing 3.0.
3. **NALSA & Free Legal Aid Services:** Legal Services Authorities Act, 1987, eligibility criteria, Lok Adalats, and 24x7 helpline `15100`.
4. **Nyaya Bandhu (Pro Bono Legal Services):** Mobilizing practicing advocates and university Pro Bono Clubs under Article 39A.
5. **Fast Track Special Courts (FTSCs):** Expeditious disposal of POCSO and rape cases under the Nirbhaya Fund.
6. **Gram Nyayalayas Act, 2008:** Doorstep justice at the village/panchayat level headed by a First Class Judicial Magistrate (Nyayadhikari).
7. **DISHA Scheme (Designing Innovative Solutions for Holistic Access to Justice):** Umbrella consolidation of Tele-Law, Nyaya Bandhu, and Nyaya Mitra.
8. **Centrally Sponsored Scheme for Judicial Infrastructure:** Court halls, residential complexes, and Nyaya Vikas ISRO Bhuvan satellite monitoring.
9. **Department of Justice Overview:** Constitutional appointment of judges under Articles 124, 217, and National Mission for Justice Delivery.

---

## 🧪 8. Automated Test Suite Verification

Run the test suite at any time:
```bash
python backend/test_suite.py
```
**Results:** All 11 automated test modules pass with 100% success rate:
- `[PASS]` Health check & active engine verification
- `[PASS]` English inquiry with intent detection & citation extraction
- `[PASS]` Hindi inquiry & cross-lingual semantic matching
- `[PASS]` Punjabi inquiry with native Gurmukhi response synthesis
- `[PASS]` Session persistence & multi-turn history tracking
- `[PASS]` Citizen feedback logging (rating, comments, flags)
- `[PASS]` JWT authentication & Role-Based Access Control
- `[PASS]` Dynamic document upload (PDF/DOCX extraction & vector indexing)
- `[PASS]` Automated analytics reporting (satisfaction, top intents, active users)

---

## 🏆 9. Production Feature Checklist

- [x] **Fully functional end-to-end application** (not a static mock UI)
- [x] **FastAPI backend with SQLite database and persistent chat sessions**
- [x] **Retrieval-Augmented Generation (RAG)** pipeline with PDF, DOCX, and TXT parsing
- [x] **Multilingual interaction** in English, Hindi, and Punjabi
- [x] **Web Speech API Voice Assistant** (Speech-to-Text & Text-to-Speech)
- [x] **Transparent source citations** linking directly to official government portals
- [x] **Statutory disclaimer** displayed on all informational guidance
- [x] **Admin dashboard** with live analytics, document ingestion, and unanswered query tracking
- [x] **OTP Authentication** for administrative login security
- [x] **Configurable LLM provider** supporting Gemini, OpenAI, and Built-in Zero-Cloud RAG fallback
- [x] **Automated test suite & One-click startup scripts**

---
*Department of Justice, Ministry of Law & Justice, Government of India.*
