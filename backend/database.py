import motor.motor_asyncio
import chromadb
from backend.config import settings

# MongoDB Setup
client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGODB_URI)
db = client["askmydocs"]
docs_collection = db["documents"]
chat_history_collection = db["chat_history"]

# ChromaDB Cloud Setup
chroma_client = chromadb.HttpClient(
    host=settings.CHROMA_HOST,
    ssl=True,
    tenant=settings.CHROMA_TENANT,
    database=settings.CHROMA_DATABASE,
    headers={"x-chroma-token": settings.CHROMA_API_KEY}
)

def get_chroma_collection():
    return chroma_client.get_or_create_collection(name="documents")
