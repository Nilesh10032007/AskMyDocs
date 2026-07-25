from fastapi import APIRouter, HTTPException
from backend.database import docs_collection, get_chroma_collection

router = APIRouter()

@router.get("/documents")
async def list_documents():
    docs = await docs_collection.find().sort("uploaded_at", -1).to_list(100)
    return [{"id": d["_id"], "filename": d["filename"], "status": d.get("status"), "size": d.get("size"), "uploaded_at": d.get("uploaded_at")} for d in docs]

@router.delete("/documents/{doc_id}")
async def delete_document(doc_id: str):
    # Delete from MongoDB
    result = await docs_collection.delete_one({"_id": doc_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Document not found")
        
    # Delete from ChromaDB
    try:
        collection = get_chroma_collection()
        collection.delete(where={"doc_id": doc_id})
    except Exception as e:
        print(f"Error deleting from ChromaDB: {e}")
        
    return {"status": "DELETED", "doc_id": doc_id}
