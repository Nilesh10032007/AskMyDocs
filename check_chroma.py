import asyncio
from backend.database import get_chroma_collection, docs_collection
import pprint

async def main():
    doc = await docs_collection.find_one({'filename': 'resume.pdf'})
    if not doc:
        print('Document not found in Mongo')
        return
    
    print('Mongo Doc:', doc)
    
    collection = get_chroma_collection()
    doc_id_val = doc['_id']
    results = collection.get(where={'doc_id': doc_id_val})
    
    id_count = len(results.get('ids', []))
    print(f'Found {id_count} chunks in ChromaDB for doc_id {doc_id_val}')
    
    if id_count > 0:
        print('First chunk preview:', results['documents'][0][:100])

asyncio.run(main())
