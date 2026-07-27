from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.database import get_chroma_collection, chat_history_collection
from backend.services.document_processor import get_embedder
from backend.config import settings
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
import datetime
import uuid

router = APIRouter()

class QueryRequest(BaseModel):
    doc_ids: list[str]
    question: str

@router.post("/query")
async def query_document(request: QueryRequest):
    # 1. Embed the question
    try:
        question_embedding = get_embedder().encode([request.question]).tolist()[0]
        
        # 2. Similarity search in Chroma
        collection = get_chroma_collection()
        
        if len(request.doc_ids) == 1:
            where_clause = {"doc_id": request.doc_ids[0]}
        else:
            where_clause = {"doc_id": {"$in": request.doc_ids}}
            
        results = collection.query(
            query_embeddings=[question_embedding],
            where=where_clause,
            n_results=4 * max(1, len(request.doc_ids))
        )
        
        # Extract context and sources
        if not results['documents'] or not results['documents'][0]:
            return {"answer": "No relevant context found in the selected documents.", "sources": []}
            
        context_chunks = results['documents'][0]
        metadatas = results['metadatas'][0]
        
        context_text = "\n\n".join(context_chunks)
        
        sources = list(set([f"{m.get('filename', 'Unknown')} (Chunk {m.get('chunk_index', '?')})" for m in metadatas]))
        
        # 3. Call Groq
        llm = ChatGroq(
            temperature=0, 
            groq_api_key=settings.GROQ_API_KEY, 
            model_name="llama-3.3-70b-versatile"
        )
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are DocuMind AI, a helpful assistant. Use the following context to answer the user's question. If you don't know the answer based on the context, just say so.\n\nContext:\n{context}"),
            ("human", "{question}")
        ])
        
        chain = prompt | llm
        response = chain.invoke({
            "context": context_text,
            "question": request.question
        })
        
        answer = response.content
        
        # 4. Save to chat history
        session_id = ",".join(sorted(request.doc_ids))
        chat_msg = {
            "_id": str(uuid.uuid4()),
            "session_id": session_id,
            "question": request.question,
            "answer": answer,
            "sources": sources,
            "timestamp": datetime.datetime.utcnow()
        }
        await chat_history_collection.insert_one(chat_msg)
        
        return {"answer": answer, "sources": sources}
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/chat-history/{doc_ids}")
async def get_chat_history(doc_ids: str):
    session_id = ",".join(sorted(doc_ids.split(",")))
    history = await chat_history_collection.find({"session_id": session_id}).sort("timestamp", 1).to_list(100)
    for h in history:
        h["id"] = h.pop("_id")
    return history
