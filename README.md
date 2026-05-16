# 🛡️ Intelligent DevSecOps Platform

### Automated Deployment, Monitoring, and AI-Powered Threat Detection

[![CI/CD Pipeline](https://github.com/your-repo/devsecops-platform/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/your-repo/devsecops-platform/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](docker-compose.yml)

A full-stack, industry-level DevSecOps platform that combines **automated CI/CD pipelines**, **real-time infrastructure monitoring**, **vulnerability scanning**, and **AI-powered anomaly detection** into a single, unified dashboard.

---

## 📋 Table of Contents

- [Architecture Overview](#-architecture-overview)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Docker Deployment](#-docker-deployment)
- [Kubernetes Deployment](#-kubernetes-deployment)
- [API Documentation](#-api-documentation)
- [Environment Variables](#-environment-variables)
- [Future Enhancements](#-future-enhancements)
- [Resume Description](#-resume-description)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     NGINX Reverse Proxy                     │
│                    (Load Balancer / SSL)                     │
└─────────┬──────────────┬──────────────────┬─────────────────┘
          │              │                  │
 ┌────────▼────────┐ ┌──▼──────────┐ ┌─────▼──────────┐
 │  React Frontend │ │  Express    │ │  Python AI     │
 │  (Vite + TW)    │ │  Backend    │ │  Service       │
 │  Port: 3000     │ │  Port: 5000 │ │  Port: 8000    │
 └────────┬────────┘ └──┬──────────┘ └────────────────┘
          │              │
          │       ┌──────▼──────┐
          │       │   MongoDB   │
          │       │  Port: 27017│
          │       └─────────────┘
          │
 ┌────────▼────────────────────────────────┐
 │         Monitoring Stack                │
 │  Prometheus (9090) ──► Grafana (3001)   │
 └─────────────────────────────────────────┘
```

---

## 🔧 Tech Stack

| Layer         | Technology                                        |
|---------------|---------------------------------------------------|
| **Frontend**  | React 19, Vite, Tailwind CSS, Framer Motion, Recharts |
| **Backend**   | Node.js, Express.js, MongoDB, Mongoose, JWT       |
| **AI/ML**     | Python, Flask, NumPy, Z-Score Anomaly Detection   |
| **DevOps**    | Docker, Docker Compose, Kubernetes, NGINX         |
| **CI/CD**     | GitHub Actions, Trivy, SonarQube                  |
| **Monitoring**| Prometheus, Grafana                               |
| **Security**  | Helmet.js, Rate Limiting, bcrypt, JWT Auth        |

---

## ✨ Features

### 1. 🔐 Authentication System
- JWT-based secure authentication
- Login / Register with validation
- Role-based access control (Admin, Developer, Viewer)
- Protected API routes

### 2. 📊 DevOps Dashboard
- Real-time server health monitoring (CPU, RAM, Disk, Network)
- Multi-server overview with status indicators
- Animated progress bars and metric cards
- 24-hour performance trending charts

### 3. 🔄 CI/CD Pipeline Monitoring
- Visual pipeline stage representation
- Build success/failure tracking
- Deployment history and statistics
- Expandable pipeline details with logs

### 4. 🛡️ Security Dashboard
- Vulnerability reports with CVE details
- Severity-based risk analysis (Critical/High/Medium/Low)
- Scan trend visualization
- Actionable security recommendations

### 5. 🤖 AI-Powered Threat Detection
- Z-score based anomaly detection
- CPU spike detection with threshold alerts
- Failed login pattern analysis (brute force detection)
- Traffic anomaly detection (DDoS detection)
- Real-time AI threat feed

### 6. 🔔 Notification System
- Multi-channel alert simulation (Slack, Email, Telegram)
- Alert severity classification
- Acknowledge and resolve workflows
- Filterable notification center

### 7. 🎨 Modern UI/UX
- Dark futuristic theme with glassmorphism
- Animated cards and transitions (Framer Motion)
- Responsive sidebar navigation
- Professional Recharts visualizations
- AWS/Grafana/Datadog-inspired design

---

## 📁 Project Structure

```
devsecops-platform/
├── frontend/                  # React + Vite Frontend
│   ├── src/
│   │   ├── components/        # Sidebar, Layout, StatCard
│   │   ├── pages/             # Dashboard, Security, AI, etc.
│   │   ├── services/          # Axios API service
│   │   └── context/           # Auth context provider
│   ├── Dockerfile
│   └── nginx.conf
├── backend/                   # Node.js + Express Backend
│   ├── src/
│   │   ├── controllers/       # Route handlers
│   │   ├── models/            # MongoDB schemas
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # JWT auth middleware
│   │   ├── config/            # Database config
│   │   └── seed/              # Demo data seeder
│   └── Dockerfile
├── ai-service/                # Python AI Service
│   ├── app.py                 # Flask server
│   ├── detector.py            # Anomaly detection engine
│   └── Dockerfile
├── docker/                    # NGINX reverse proxy config
├── kubernetes/                # K8s manifests
│   ├── namespace.yml
│   ├── backend-deployment.yml
│   ├── frontend-deployment.yml
│   ├── mongodb-statefulset.yml
│   ├── secrets.yml
│   └── ingress.yml
├── monitoring/                # Prometheus + Grafana configs
├── .github/workflows/         # CI/CD pipeline
├── docker-compose.yml         # Full stack orchestration
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- MongoDB (local or Docker)
- Python 3.11+ (for AI service)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/devsecops-platform.git
cd devsecops-platform
```

### 2. Backend Setup
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. AI Service Setup
```bash
cd ai-service
pip install -r requirements.txt
python app.py
```

### 5. Seed Database (Optional)
```bash
cd backend
node src/seed/seeder.js
```

**Demo Credentials:** `admin@devsecops.io` / `admin123`

---

## 🐳 Docker Deployment

### Start all services with Docker Compose:
```bash
docker-compose up -d --build
```

### Access the platform:
| Service    | URL                    |
|------------|------------------------|
| Frontend   | http://localhost:3000   |
| Backend    | http://localhost:5000   |
| AI Service | http://localhost:8000   |
| Prometheus | http://localhost:9090   |
| Grafana    | http://localhost:3001   |
| NGINX      | http://localhost:80     |

### Stop all services:
```bash
docker-compose down
```

---

## ☸️ Kubernetes Deployment

```bash
# Create namespace
kubectl apply -f kubernetes/namespace.yml

# Create secrets
kubectl apply -f kubernetes/secrets.yml

# Deploy MongoDB
kubectl apply -f kubernetes/mongodb-statefulset.yml

# Deploy Backend
kubectl apply -f kubernetes/backend-deployment.yml

# Deploy Frontend
kubectl apply -f kubernetes/frontend-deployment.yml

# Setup Ingress
kubectl apply -f kubernetes/ingress.yml
```

---

## 📡 API Documentation

### Auth Routes
| Method | Route              | Description          | Auth |
|--------|--------------------|----------------------|------|
| POST   | /api/auth/register | Register new user    | No   |
| POST   | /api/auth/login    | Login & get token    | No   |
| GET    | /api/auth/me       | Get current profile  | Yes  |

### Deployment Routes
| Method | Route                       | Description           | Auth |
|--------|-----------------------------|-----------------------|------|
| GET    | /api/deployments            | List deployments      | Yes  |
| POST   | /api/deployments            | Create deployment     | Yes  |
| GET    | /api/deployments/stats      | Deployment statistics | Yes  |

### Pipeline Routes
| Method | Route                  | Description          | Auth |
|--------|------------------------|----------------------|------|
| GET    | /api/pipelines         | List pipelines       | Yes  |
| POST   | /api/pipelines         | Create pipeline      | Yes  |
| GET    | /api/pipelines/stats   | Pipeline statistics  | Yes  |

### Security Routes
| Method | Route                | Description         | Auth |
|--------|----------------------|---------------------|------|
| GET    | /api/security/scans  | List security scans | Yes  |
| POST   | /api/security/scans  | Create scan         | Yes  |
| GET    | /api/security/stats  | Security statistics | Yes  |

### Alert Routes
| Method | Route                      | Description       | Auth |
|--------|----------------------------|-------------------|------|
| GET    | /api/alerts                | List alerts       | Yes  |
| POST   | /api/alerts                | Create alert      | Yes  |
| PUT    | /api/alerts/:id/acknowledge| Acknowledge alert | Yes  |
| PUT    | /api/alerts/:id/resolve    | Resolve alert     | Yes  |

### Metrics Routes
| Method | Route                | Description         | Auth |
|--------|----------------------|---------------------|------|
| GET    | /api/metrics/server  | Server metrics      | Yes  |
| GET    | /api/metrics/history | Historical metrics  | Yes  |
| GET    | /api/metrics/containers | Container status | Yes  |

---

## 🔑 Environment Variables

| Variable        | Description                  | Default                    |
|-----------------|------------------------------|----------------------------|
| PORT            | Backend server port          | 5000                       |
| MONGODB_URI     | MongoDB connection string    | mongodb://localhost:27017  |
| JWT_SECRET      | JWT signing secret           | (required)                 |
| JWT_EXPIRES_IN  | Token expiration             | 7d                         |
| AI_SERVICE_URL  | AI service endpoint          | http://localhost:8000      |
| FRONTEND_URL    | Frontend URL for CORS        | http://localhost:5173      |

---

## 🔮 Future Enhancements

- [ ] WebSocket real-time updates
- [ ] Kubernetes auto-scaling integration
- [ ] Slack/Teams webhook integration
- [ ] RBAC with granular permissions
- [ ] Log aggregation with ELK Stack
- [ ] Terraform infrastructure as code
- [ ] Multi-cloud deployment support
- [ ] Custom alerting rules engine
- [ ] Audit trail and compliance reports
- [ ] Mobile responsive PWA

---

## 📝 Resume Description

> **Intelligent DevSecOps Platform for Automated Deployment, Monitoring, and Threat Detection**
>
> Designed and developed a full-stack DevSecOps platform integrating CI/CD pipeline monitoring, real-time infrastructure health tracking, vulnerability scanning, and AI-powered anomaly detection. Built with **React**, **Node.js/Express**, **MongoDB**, and **Python (Flask + NumPy)**, featuring a modern dark-themed dashboard with interactive Recharts visualizations. Implemented JWT authentication, role-based access control, and containerized the entire stack with **Docker Compose**. Configured **Kubernetes** manifests for orchestration, **Prometheus/Grafana** for monitoring, **Trivy/SonarQube** for security scanning, and **GitHub Actions** for CI/CD automation. The AI module uses Z-score statistical analysis for detecting CPU spikes, brute-force login attempts, and traffic anomalies.
>
> **Key Skills:** React, Node.js, Express, MongoDB, Python, Docker, Kubernetes, CI/CD, Prometheus, Grafana, Trivy, SonarQube, JWT Auth, REST APIs, Anomaly Detection

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

Built with ❤️ for DevSecOps Engineers
