from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.config import settings
from app.database.connection import init_db
from app.api import auth, chat, feedback, documents, analytics
from app.services.rag_service import rag_service
from app.services.llm_service import llm_service

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Official AI-Powered Interactive Chatbot / Virtual Assistant for Department of Justice, Ministry of Law & Justice, Govt of India",
    version="2.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local hackathon demo and testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    init_db()

# Mount API routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(chat.router, prefix=settings.API_V1_STR)
app.include_router(feedback.router, prefix=settings.API_V1_STR)
app.include_router(documents.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "project": "NyaySahayak (न्याय सहायक)",
        "ministry": "Ministry of Law & Justice, Government of India",
        "department": "Department of Justice",
        "status": "Operational",
        "docs_url": "/docs",
        "api_prefix": settings.API_V1_STR
    }

@app.get("/api/health")
def health_check():
    provider_name = llm_service._determine_active_provider()
    return {
        "status": "healthy",
        "database": "connected",
        "active_llm_provider": provider_name,
        "indexed_chunks": len(rag_service.chunks),
        "total_documents": len(rag_service.raw_documents),
        "supported_languages": ["en", "hi", "pa"]
    }

# Serve compiled Frontend SPA if dist exists (All-in-One Cloud Deployment)
frontend_dist = settings.BASE_DIR.parent / "frontend" / "dist"
if frontend_dist.exists() and (frontend_dist / "index.html").exists():
    if (frontend_dist / "assets").exists():
        app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_frontend_spa(full_path: str):
        if full_path.startswith("api") or full_path in ["docs", "redoc", "openapi.json"]:
            return {"detail": "Not Found"}
        target_file = frontend_dist / full_path
        if target_file.exists() and target_file.is_file():
            return FileResponse(target_file)
        return FileResponse(frontend_dist / "index.html")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
