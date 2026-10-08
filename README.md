# AI Operations Optimization Command Center

> **Tagline:** *"Predict problems. Understand impact. Prioritize actions."*  
> **Category:** Enterprise B2B AI-Powered Business Operations Intelligence & Optimization Platform

---

## 1. Product Overview

The **AI Operations Optimization Command Center** is a data-first enterprise platform designed for modern business operations, manufacturing, logistics, supply chain, and process optimization.

Instead of merely displaying static charts, the platform processes real company-uploaded operational datasets through an automated end-to-end intelligence pipeline:

```
DATA → VALIDATE → UNDERSTAND → ANALYZE → DETECT → PREDICT → CALCULATE BUSINESS IMPACT → PRIORITIZE → RECOMMEND → DECIDE → ACT → MEASURE
```

### Core Differentiator
Unified operational intelligence across multiple business functions (Inventory, Predictive Maintenance, Logistics, Production Material Consumption, and Process ReFlow), backed by an evidence-based recommendation engine, risk center, and what-if scenario simulator.

---

## 2. Platform Architecture

The platform uses a hybrid multi-service architecture:

```
React Frontend (Vite + Tailwind + Recharts)
            ↓ [HTTP / REST]
Node.js / Express API Gateway (Port 5000)
            ↓                         ↓
MongoDB (Atlas/Local)    Python FastAPI AI Engine (Port 8000)
```

> **Security Rule:** The React frontend NEVER communicates directly with the Python AI Service. All AI analytical requests are proxied and authorized through the Node.js API Gateway using secure `x-ai-service-secret` headers.

---

## 3. Product Modules

### OPERATIONS
1. **Inventory & Demand Intelligence:** Demand forecasting, stockout risk days-of-supply analysis, excess stock holding cost calculation, supplier concentration risk.
2. **Predictive Maintenance & Asset Digital Twin:** Machine sensor telemetry analysis, Isolation Forest anomaly detection, Random Forest failure prediction, Remaining Useful Life (RUL) estimation, Explainable AI (XAI) feature importances, work order task scheduler, and spare part shortage matching.
3. **Logistics Optimization:** Shipment route cost/km metrics, late delivery SLA breach risk, vehicle payload capacity fill-rate optimization.
4. **Production Intelligence:** Material Consumption Variance Monitor (formularized expected vs actual variance), shift & department variance breakdown, excess material cost leakage.
5. **ReFlow AI:** Business rework & process error leakage optimizer, department concentration tracking, customer-impact link with neutral non-judgmental process language.

### INTELLIGENCE
6. **Cross-Functional Risk Center:** Filterable operational risk matrix across all 5 business modules.
7. **Evidence-Based Recommendations Engine:** 12-point structured recommendation matrix (Problem → Evidence → Observed Pattern → Prediction → Action → Business Impact).
8. **Unified Business Impact Engine:** Consolidated enterprise financial exposure and downtime risk index.
9. **What-If Scenario Simulator:** Mathematical simulation engine (Maintenance delay, inventory procurement increase, material variance reduction, reflow rework reduction).
10. **Decision & Outcome Tracking:** Full recommendation lifecycle tracking (Generated → Reviewed → Accepted → Rejected → Action Taken → Outcome Recorded).
11. **AI Operations Copilot:** Natural-language assistant grounded strictly in company dataset analysis.

### DATA & ADMINISTRATION
12. **Datasets Management:** Upload CSV/XLSX, auto-detect columns & modules, inspect preview.
13. **Data Quality Engine:** Pre-analysis data validation, missing cell penalty, duplicate row check, quality score (0–100).
14. **Company Profile & Tenant Isolation:** Strict `companyId` scoping on all database records.
15. **User & Role Management:** Role-Based Access Control (`company_admin`, `manager`, `analyst`, `operator`, `viewer`).
16. **Settings:** Hybrid service connection & security monitor.

---

## 4. Technology Stack

- **Frontend:** React, Vite, JavaScript, React Router v6, Axios, Tailwind CSS, Recharts, Lucide React
- **Backend:** Node.js, Express.js, MongoDB / Mongoose, JWT, bcryptjs, Multer, XLSX, csv-parse
- **AI/ML Service:** Python 3.14, FastAPI, uvicorn, pandas, NumPy, scikit-learn (IsolationForest, RandomForestClassifier), scipy, statsmodels, openpyxl

---

## 5. Project Structure

```
Innovex/
├── client/                     # React Vite Frontend Application
│   ├── src/
│   │   ├── components/         # Reusable UI (Sidebar, Topbar, KpiCard, DataTable, Badge, Modal, EmptyState)
│   │   ├── context/            # AuthContext, ThemeContext
│   │   ├── layouts/            # DashboardLayout, AuthLayout
│   │   ├── pages/              # 16 Enterprise Views
│   │   ├── services/           # Axios API Client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Node.js Express API Gateway & Multi-Tenant Backend
│   ├── src/
│   │   ├── config/             # MongoDB connection with fallback
│   │   ├── controllers/        # 12 REST Controllers
│   │   ├── middleware/         # Auth JWT, Role RBAC, ErrorHandler
│   │   ├── models/             # 12 Mongoose Models (User, Company, Dataset, Analysis, etc.)
│   │   ├── routes/             # REST Route Definitions
│   │   ├── services/           # aiService proxy, dataQualityEngine, auditLogService
│   │   ├── app.js
│   │   └── server.js
│   └── package.json
│
├── ai-service/                 # Python FastAPI AI/ML Service Engine
│   ├── app/
│   │   ├── engines/            # Inventory, Maintenance, Logistics, Production, ReFlow, Impact, Scenario, Copilot
│   │   ├── middleware/         # Service secret authorization
│   │   ├── config.py
│   │   └── main.py
│   └── requirements.txt
│
├── sample-data/                # Realistic Synthetic Datasets
│   ├── inventory_demand.csv
│   ├── machine_maintenance.csv
│   ├── logistics.csv
│   ├── reflow_errors.csv
│   └── production_material_consumption.csv
│
├── README.md
└── .gitignore
```

---

## 6. Environment Variables

### Server (`server/.env.example`)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ai_ops_command_center
JWT_SECRET=enterprise-jwt-secret-key-2026-antigravity
PYTHON_AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_SECRET=dev-secret-key-change-in-prod-ai-ops-2026
CLIENT_URL=http://localhost:5173
```

### AI Service (`ai-service/.env.example`)
```env
PORT=8000
AI_SERVICE_SECRET=dev-secret-key-change-in-prod-ai-ops-2026
```

### Client (`client/.env.example`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 7. Installation & Setup Commands

### Step 1: Python AI Service Setup
```bash
cd ai-service
py -m venv .venv

# On Windows PowerShell:
.venv\Scripts\Activate.ps1

# Install requirements:
pip install -r requirements.txt

# Start FastAPI server:
python -m uvicorn app.main:app --reload --port 8000
```

### Step 2: Node.js Backend Server Setup
```bash
cd server
npm install
npm run dev
```

### Step 3: React Frontend Setup
```bash
cd client
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## 8. Operations Platform Quickstart Workflow

1. **Register / Login:** Register a company account or authenticate with user credentials.
2. **Command Center:** View overall Operational Health, Critical Risks, Active Alerts, Estimated Financial Impact, and Module Health.
3. **Load Sample Datasets:** Click **"Load Sample Datasets"** on the Dashboard or Datasets page to seed 5 realistic operational CSV datasets.
4. **Predictive Maintenance Twin:** Navigate to `Predictive Maintenance` → Select machine **M-104** → Inspect sensor telemetry trends, Isolation Forest anomaly alerts, Random Forest failure probability, RUL, XAI Explanation ("Why is this machine at risk?"), and Spare Part shortages (Bearing BRG-6205-2RS).
5. **Schedule Work Order:** Create a preventive maintenance task directly from the Maintenance view.
6. **Review Recommendations:** Go to `Recommendations` → Inspect 12-point decision matrix → Click **"Record Decision"** to accept an action.
7. **What-If Scenario Simulation:** Go to `Scenarios` → Adjust maintenance delay slider to 36 hours → Run simulation to observe failure probability escalation and financial downtime projections.
8. **Ask AI Copilot:** Open `AI Copilot` → Click suggested query *"Which machine should we inspect first?"* or *"Where are we seeing material over-consumption?"* to view grounded responses derived strictly from company data analysis.

---

## 9. Key AI & Machine Learning Methods

- **Isolation Forest:** Unsupervised anomaly detection on multi-sensor time series telemetry (vibration, temperature, pressure, current).
- **Random Forest Classifier:** Failure probability classification when historical failure labels exist.
- **RUL Degradation Estimator:** Degradation slope estimation based on operating hours & sensor z-score drift.
- **Formularized Material Consumption Variance:** Actual vs standard material consumption tracking with company-configurable alert thresholds (0–5%, 5–10%, 10–20%, >20%).
- **Heuristic Risk Priority Engine:** Composite score combining failure probability, asset criticality, business impact, and urgency.
