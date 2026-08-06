from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from backend.config import settings
from backend.database import get_chroma_collection, docs_collection
import uuid
import datetime
import traceback
from backend.config import settings

# Lazy load embeddings model
embedder = None

def get_embedder():
    global embedder
    if embedder is None:
        embedder = GoogleGenerativeAIEmbeddings(model="models/text-embedding-004", google_api_key=settings.GOOGLE_API_KEY)
    return embedder

async def process_document(doc_id: str, file_name: str, pages: list, file_size: int):
    try:
        # Update status to processing
        await docs_collection.update_one(
            {"_id": doc_id},
            {"$set": {"status": "PROCESSING", "filename": file_name, "size": file_size, "uploaded_at": datetime.datetime.utcnow()}},
            upsert=True
        )

        # Chunk text
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            separators=["\n\n", "\n", " ", ""]
        )
        
        all_chunks = []
        all_metadatas = []
        
        for p in pages:
            page_num = p["page"]
            page_text = p["text"].strip()
            if not page_text:
                continue
                
            chunks = text_splitter.split_text(page_text)
            for i, chunk in enumerate(chunks):
                all_chunks.append(chunk)
                all_metadatas.append({
                    "doc_id": doc_id, 
                    "chunk_index": i, 
                    "page_number": page_num,
                    "filename": file_name, 
                    "text": chunk
                })

        if not all_chunks:
            raise ValueError("No extractable text found in the document. It might be a scanned image or empty.")

        # Generate embeddings
        embeddings = get_embedder().embed_documents(all_chunks)

        # Store in ChromaDB
        collection = get_chroma_collection()
        ids = [f"{doc_id}_{i}" for i in range(len(all_chunks))]

        collection.add(
            embeddings=embeddings,
            documents=all_chunks,
            metadatas=all_metadatas,
            ids=ids
        )

        # Update status to indexed
        await docs_collection.update_one(
            {"_id": doc_id},
            {"$set": {"status": "INDEXED"}}
        )

    except Exception as e:
        print(f"Error processing document {doc_id}: {e}")
        traceback.print_exc()
        await docs_collection.update_one(
            {"_id": doc_id},
            {"$set": {"status": "FAILED", "error": str(e)}}
        )
        # Note: Do not raise here so background task doesn't crash FastAPI silently
