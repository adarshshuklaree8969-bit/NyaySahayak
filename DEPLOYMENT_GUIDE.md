# NyaySahayak (न्याय सहायक) - Complete Deployment Guide 🚀
### Department of Justice AI Assistant • Cloud & Server Deployment

This guide explains how to deploy the entire **NyaySahayak** application (Frontend + Backend + RAG Engine + Database + Email OTP) to the cloud for free or on your own server.

---

## 📋 Table of Contents
1. [Prerequisite: Push Code to GitHub](#1-prerequisite-push-code-to-github)
2. [Method 1: 1-Click All-in-One Deployment on Render.com (Recommended & Free)](#2-method-1-all-in-one-deployment-on-rendercom-free--recommended)
3. [Method 2: Separate Deployment (Vercel Frontend + Render Backend)](#3-method-2-separate-deployment-vercel--render)
4. [Method 3: Docker Container Deployment (AWS / GCP / VPS / DigitalOcean)](#4-method-3-docker-container-deployment)
5. [Environment Variables Reference](#5-environment-variables-reference)

---

## 1. Prerequisite: Push Code to GitHub

First, upload your project to a GitHub repository:

1. Open your terminal in `NyaySahayak` folder:
   ```bash
   cd "c:\Users\Adarsh Kumar Shukla\Desktop\NyaySahayak"
   ```
2. Initialize git and commit:
   ```bash
   git init
   git add .
   git commit -m "NyaySahayak Production Release"
   ```
3. Create a new repository on [GitHub](https://github.com/new) (e.g. `NyaySahayak`).
4. Push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/NyaySahayak.git
   git branch -M main
   git push -u origin main
   ```

---

## 2. Method 1: All-in-One Deployment on Render.com (Free & Recommended) ⭐

Because FastAPI is configured to automatically serve the compiled React SPA from `frontend/dist/`, **the entire application runs as a single web service!** This avoids all CORS issues and requires only 1 free hosting service.

### Step-by-Step Instructions:

1. Go to **[Render.com](https://render.com)** and Sign Up / Log in with your GitHub account.
2. Click **"New +"** in the top right, then select **"Web Service"**.
3. Choose **"Build and deploy from a Git repository"** and select your `NyaySahayak` repository.
4. Fill in the following settings:
   - **Name:** `nyaysahayak` (or any name you like)
   - **Region:** Singapore / Frankfurt (or closest to India)
   - **Branch:** `main`
   - **Language / Runtime:** `Python`
   - **Build Command:**
     ```bash
     pip install -r backend/requirements.txt && cd frontend && npm install && npm run build && cd ..
     ```
   - **Start Command:**
     ```bash
     cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```
   - **Instance Type:** `Free`
5. Click **"Advanced"** -> **"Add Environment Variable"**:
   - `PROJECT_NAME`: `NyaySahayak - Department of Justice Virtual Assistant`
   - `SECRET_KEY`: (Click 'Generate' or enter any long random secret)
   - `LLM_PROVIDER`: `AUTO`
   - `GEMINI_API_KEY`: *(Optional: paste your Google Gemini API key if available)*
   - `SMTP_USER`: *(Optional: your Gmail address for live OTP delivery)*
   - `SMTP_PASSWORD`: *(Optional: your 16-character Gmail App Password)*
6. Click **"Deploy Web Service"**!
7. Render will build both the frontend and backend in 3–4 minutes. Once finished, you will receive a free public live URL:
   👉 **`https://nyaysahayak.onrender.com`**
   - The Citizen Portal will open directly at root (`/`)
   - The AI assistant, voice features, and admin portal will work immediately!
   - API Docs available at `https://nyaysahayak.onrender.com/docs`

---

## 3. Method 2: Separate Deployment (Vercel + Render)

If you prefer hosting the frontend on Vercel CDN and the backend on Render:

### A. Deploy Backend on Render:
1. Follow Step 1–4 of Method 1, but set:
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
2. Copy your live backend URL (e.g. `https://nyaysahayak-backend.onrender.com`).

### B. Deploy Frontend on Vercel:
1. Go to **[Vercel.com](https://vercel.com)** and log in with GitHub.
2. Click **"Add New"** -> **"Project"** -> Import your `NyaySahayak` repository.
3. In **Root Directory**, click "Edit" and choose `frontend`.
4. Update `frontend/vercel.json` with your live Render backend URL:
   ```json
   {
     "rewrites": [
       {
         "source": "/api/:path*",
         "destination": "https://nyaysahayak-backend.onrender.com/api/:path*"
       },
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```
5. Click **"Deploy"**! Your frontend will be live on `https://nyaysahayak.vercel.app`.

---

## 4. Method 3: Docker Container Deployment

If deploying to a Virtual Private Server (VPS), AWS EC2, DigitalOcean Droplet, or Google Cloud Run:

A production-ready **multi-stage `Dockerfile`** and **`docker-compose.yml`** are already provided in the repository!

### Run with Docker Compose:
```bash
docker compose up -d --build
```
Your containerized app will run on port `8000`:
- Portal: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`

### Deploy on Google Cloud Run / AWS ECS:
```bash
# Build docker image
docker build -t nyaysahayak:latest .

# Run container
docker run -p 8000:8000 nyaysahayak:latest
```

---

## 5. Environment Variables Reference

| Variable | Default Value | Description |
|---|---|---|
| `PORT` | `8000` | Port assigned by the hosting environment |
| `SECRET_KEY` | *(Required)* | Secret key used to sign Admin JWT tokens |
| `LLM_PROVIDER` | `AUTO` | `AUTO`, `GEMINI`, `OPENAI`, or `OFFLINE` |
| `GEMINI_API_KEY` | *(Optional)* | Google Gemini API key (runs offline RAG if blank) |
| `OPENAI_API_KEY` | *(Optional)* | OpenAI API key |
| `SMTP_HOST` | `smtp.gmail.com` | SMTP host for email delivery |
| `SMTP_PORT` | `587` | SMTP port (TLS) |
| `SMTP_USER` | *(Optional)* | Sender Gmail address |
| `SMTP_PASSWORD` | *(Optional)* | Google 16-character App Password |
| `ADMIN_USERNAME` | `admin@doj.gov.in` | Default administrative login identifier |
| `ADMIN_PASSWORD` | `NyayAdmin@2026` | Default administrative fallback password |

---
*Department of Justice, Ministry of Law & Justice, Government of India.*
