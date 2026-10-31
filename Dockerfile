# ==============================================================
# Multi-Stage Dockerfile for NyaySahayak (Full-Stack Deployment)
# Stage 1: Build Frontend (React + Vite + TypeScript)
# Stage 2: Python Backend with FastAPI & RAG Knowledge Engine
# ==============================================================

# ----------------- Stage 1: Frontend Build -----------------
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# ----------------- Stage 2: Backend & Final Image ----------
FROM python:3.11-slim
WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000

# Install system dependencies if required
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Copy backend application
COPY backend/ ./backend/

# Copy compiled frontend from Stage 1 into frontend/dist
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

WORKDIR /app/backend

EXPOSE 8000

# Run FastAPI server binding to $PORT (compatible with Render, Railway, Cloud Run, Heroku, etc.)
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
