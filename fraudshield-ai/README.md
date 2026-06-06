# FraudShield AI

**AI Powered Mule Account Detection and Fraud Intelligence Platform**

Built for the Bank of India Cyber Security Hackathon.

---

## Architecture

```
fraudshield-ai/
├── ml-service/          # FastAPI Python ML service
│   ├── main.py          # Prediction API
│   └── requirements.txt
├── backend/             # Node.js Express backend
│   ├── server.js        # Express + Socket.IO server
│   ├── models/          # MongoDB schemas
│   └── routes/          # API routes
├── frontend/            # React Vite frontend
│   └── src/
│       ├── pages/       # All page components
│       ├── components/  # Reusable components
│       ├── context/     # App state management
│       └── utils/       # API & Socket utilities
└── model-files/         # Pre-trained model files
    ├── fraud_model.pkl
    ├── scaler.pkl
    └── feature_columns.pkl
```

## Prerequisites

- Python 3.10+
- Node.js 18+
- MongoDB (running on localhost:27017)

## Quick Start

### 1. Start ML Service (Port 8000)

```bash
cd ml-service
python main.py
```

### 2. Start Backend (Port 5000)

```bash
cd backend
node server.js
```

### 3. Start Frontend (Port 3000)

```bash
cd frontend
npm run dev
```

### 4. Open Browser

Navigate to `http://localhost:3000`

## Login

Enter any username and password to access the platform.

## Features

- **Dashboard** - Real-time fraud monitoring with dynamic charts
- **Upload Transactions** - Drag & drop CSV/Excel for AI analysis
- **Mule Accounts** - Detected suspicious accounts with network graph
- **India Fraud Map** - Interactive map of transaction routes
- **Alerts** - Dynamic alert generation based on risk patterns
- **Reports** - Comprehensive analysis with export capability
- **Model Insights** - Explainable AI feature importance
- **Settings** - Model file management

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, Tailwind CSS, Recharts, React Flow, Leaflet |
| Backend | Node.js, Express, MongoDB, Socket.IO |
| ML | FastAPI, XGBoost, Pandas, NumPy, Joblib |

## Important Notes

- The model files (`.pkl`) are pre-trained and never retrained
- The model is loaded once at startup and used for real-time predictions
- Empty state is shown until a real transaction file is uploaded
- All data is generated dynamically from uploaded files and model predictions
