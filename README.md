# DocuMind AI

DocuMind AI is a full-stack, RAG-based Document Intelligence platform. It allows users to upload their local documents (PDF, DOCX, TXT), index them using local embeddings, and intelligently query them using the Groq API. 

## 🚀 Features

- **Multi-Format Support:** Easily ingest PDF, DOCX, and TXT files.
- **RAG Architecture:** Utilizes Retrieval-Augmented Generation to ground AI responses directly in your uploaded knowledge base.
- **Fast Local Embeddings:** Uses `sentence-transformers/all-MiniLM-L6-v2` to locally encode your documents for vector search without relying on paid embedding APIs.
- **Vector Search:** Persists embeddings via ChromaDB Cloud for highly relevant semantic search.
- **Modern UI:** A stunning, responsive frontend built with React (Vite) and styled with Tailwind CSS, offering document insights, complexity scoring, and source verification.

## 🛠️ Technology Stack

- **Frontend:** React, Vite, Tailwind CSS, Lucide React
- **Backend:** FastAPI, Python, LangChain, PyMuPDF
- **Database:** MongoDB (Metadata & Chat History)
- **Vector Store:** ChromaDB
- **LLM:** Groq API (`llama-3.3-70b-versatile`)
- **Embeddings:** `sentence-transformers`

## ⚙️ Setup Instructions

### 1. Prerequisites
- Python 3.9+
- Node.js 18+
- MongoDB instance (Atlas or local)
- ChromaDB Cloud credentials
- Groq API Key

### 2. Environment Variables
Create a `.env` file in the root directory and add your credentials:
```env
MONGODB_URI=your_mongodb_connection_string
CHROMA_HOST=api.trychroma.com
CHROMA_API_KEY=your_chroma_api_key
CHROMA_TENANT=your_chroma_tenant
CHROMA_DATABASE=your_chroma_database
GROQ_API_KEY=your_groq_api_key
```

### 3. Backend Setup
```bash
# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt

# Run the backend server
python -m uvicorn backend.main:app --reload --port 8000
```

### 4. Frontend Setup
```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

The application will be available at `http://localhost:5173`.
