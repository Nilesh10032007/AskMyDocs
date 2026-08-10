from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from backend.database import get_chroma_collection, chat_history_collection
from backend.services.document_processor import get_embedder
from backend.config import settings
from backend.auth import get_current_user
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
import datetime
import uuid

router = APIRouter()

class QueryRequest(BaseModel):
    doc_ids: list[str]
    question: str

@router.post("/query")
async def query_document(request: QueryRequest, user_id: str = Depends(get_current_user)):
    # 1. Embed the question
    try:
        question_embedding = get_embedder().embed_query(request.question)
        
        # 2. Similarity search in Chroma
        collection = get_chroma_collection()
        
        where_clause = {"$and": [{"user_id": user_id}]}
        if len(request.doc_ids) == 1:
            where_clause["$and"].append({"doc_id": request.doc_ids[0]})
        else:
            where_clause["$and"].append({"doc_id": {"$in": request.doc_ids}})
            
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
        
        unique_sources = {}
        for m in metadatas:
            key = (m.get('filename', 'Unknown'), m.get('page_number', 1), m.get('doc_id'))
            unique_sources[key] = {
                "filename": key[0],
                "page": key[1],
                "doc_id": key[2]
            }
        
        sources = list(unique_sources.values())
        sources = sorted(sources, key=lambda x: (x['filename'], x['page']))
        
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
            "user_id": user_id,
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
async def get_chat_history(doc_ids: str, user_id: str = Depends(get_current_user)):
    session_id = ",".join(sorted(doc_ids.split(",")))
    history = await chat_history_collection.find({"session_id": session_id, "user_id": user_id}).sort("timestamp", 1).to_list(100)
    for h in history:
        h["id"] = h.pop("_id")
    return history
