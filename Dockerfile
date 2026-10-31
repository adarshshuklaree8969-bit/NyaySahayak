# ==============================================================
# Multi-Stage Dockerfile for NyaySahayak (Full-Stack Deployment)
# Stage 1: Build Frontend (React + Vite + TypeScript)
# Stage 2: Python Backend with FastAPI & RAG Knowledge Engine
# ==============================================================

# ----------------- Stage 1: Frontend Build -----------------
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# Copy only package manifests first (package-lock.json if it exists)
COPY frontend/package.json frontend/package-lock.json* ./

# Clean installation of dependencies: use npm ci if package-lock.json exists, otherwise npm install
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy frontend source code (node_modules is excluded via .dockerignore)
COPY frontend/ ./

# Build production bundle to /app/frontend/dist
RUN npm run build

# ----------------- Stage 2: Backend & Final Image ----------
FROM python:3.11-slim
WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000

# Install build dependencies for C-extensions (bcrypt, etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Copy backend application
COPY backend/ ./backend/

# Copy compiled React frontend from Stage 1 into frontend/dist
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

WORKDIR /app/backend

EXPOSE 8000

# Ensure FastAPI binds to 0.0.0.0 and uses PORT provided by Render
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
