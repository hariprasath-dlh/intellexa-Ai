# 🚀 Intellexa AI — Multi-Agent Research Intelligence System

Intellexa AI is a full-stack, multi-agent research system that transforms user queries into structured, evidence-based insights using real-time data, AI reasoning, and analytical pipelines.

Unlike traditional chatbots, Intellexa AI focuses on deep research, credibility evaluation, contradiction detection, and domain-specific insights.

---

## 🧠 Core Idea

Modern AI tools generate answers.

Intellexa AI generates structured intelligence.

It simulates how a human analyst works:
- Understand the query
- Break it down
- Gather data
- Validate credibility
- Detect contradictions
- Generate insights

---

## ⚙️ System Architecture

User Input (Frontend)
        ↓
API Layer (Node.js / Express)
        ↓
Agent Pipeline

1. Query Understanding Agent  
2. Research Agent (Serper API)  
3. Filtering Agent  
4. Credibility & Bias Agent  
5. Contradiction Detection Agent  
6. Insight Generation Agent  
7. Report Structuring  

        ↓
Structured JSON Output  
        ↓
Frontend Dashboard (React)

---

## 🤖 Key Features

### 🔍 Multi-Agent Research Pipeline
- Modular AI agents simulate real analytical workflows
- Each agent performs a specific task

### 🌐 Real-Time Web Data
- Integrated with Serper API
- Fetches live information from the internet

### 🛡️ Credibility & Bias Analysis
- Assigns confidence score
- Detects biased or weak sources

### ⚠️ Contradiction Detection
- Identifies conflicting viewpoints in data
- Ensures balanced analysis

### 📊 Structured Insights Output
- Direct Answer  
- Key Insights  
- Critical Factors  

### 🎯 Domain-Aware Intelligence
- Generates context-specific insights
- Avoids generic AI responses

### 🎨 Interactive Research UI
- Clean dashboard interface
- Step-by-step “thinking” visualization
- Smooth loading and micro-animations

---

## 🖥️ Tech Stack

### Frontend
- React (Lovable AI generated + customized)
- Modern UI with dark theme
- Component-based architecture

### Backend
- Node.js  
- Express.js  

### AI & APIs
- OpenRouter API (LLM access)  
- Serper.dev (Web search)  

### Tools
- Thunder Client (API testing)  
- GitHub (version control)  

---

## 📂 Project Structure
```
Intellexa-AI/
├── backend/
│   ├── controllers/
│   ├── services/
│   ├── routes/
│   ├── utils/
│   └── server.js
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── App.jsx
│
├── .gitignore  
└── README.md  
```
---

## 🚀 How It Works

1. User enters a query  
2. Query is analyzed and classified  
3. Web data is fetched using Serper API  
4. AI processes and synthesizes information  
5. System:
   - Evaluates credibility  
   - Detects contradictions  
   - Extracts insights  
6. Frontend displays structured results  

---

## 🧪 Example Queries

- Analyze EV market growth in India  
- Python vs Java for beginners  
- AI impact on healthcare  
- Used car market trends in Delhi  

---

## 🔐 Environment Setup

Create a `.env` file inside `/backend`:

OPENROUTER_API_KEY=your_api_key_here  
SERPER_API_KEY=your_api_key_here  
PORT=5000  

---

## ▶️ Run Locally

### Backend

cd backend  
npm install  
npm run dev  

### Frontend

cd frontend  
npm install  
npm run dev  

---

## 🌟 What Makes This Project Unique

- Not a chatbot — a research system  
- Multi-agent architecture (industry-level concept)  
- Real-time data + AI reasoning combined  
- Structured output (not plain text)  
- Domain-aware intelligence (non-generic responses)  

---

## 📈 Future Improvements

- User authentication (Google login)  
- Query history storage  
- Report export (PDF)  
- Advanced analytics dashboard  
- Streaming responses  

---

## 👨‍💻 Author

Hariprasath  

---

## ⭐ Final Note

This project demonstrates:
- AI system design  
- Full-stack development  
- Agent-based architecture  
- Real-world problem solving  
