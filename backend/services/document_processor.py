from langchain_text_splitters import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
from backend.database import get_chroma_collection, docs_collection
import uuid
import datetime
import traceback

# Lazy load embeddings model
embedder = None

def get_embedder():
    global embedder
    if embedder is None:
        embedder = SentenceTransformer("all-MiniLM-L6-v2")
    return embedder

async def process_document(doc_id: str, file_name: str, text: str, file_size: int):
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
        chunks = text_splitter.split_text(text)

        if not chunks:
            raise ValueError("No extractable text found in the document. It might be a scanned image or empty.")

        # Generate embeddings
        embeddings = get_embedder().encode(chunks).tolist()

        # Store in ChromaDB
        collection = get_chroma_collection()
        ids = [f"{doc_id}_{i}" for i in range(len(chunks))]
        metadatas = [{"doc_id": doc_id, "chunk_index": i, "filename": file_name, "text": chunk} for i, chunk in enumerate(chunks)]

        collection.add(
            embeddings=embeddings,
            documents=chunks,
            metadatas=metadatas,
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
