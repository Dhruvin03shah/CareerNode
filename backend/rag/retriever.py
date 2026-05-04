import numpy as np
from backend.rag.embeddings import get_embedding
from backend.rag.vector_store import load_index, get_chunks

def retrieve_context(query: str, top_k: int = 3) -> str:
    """Retrieves top_k most relevant chunks from the vector store."""
    try:
        index = load_index()
        chunks = get_chunks()
        
        if index is None or not chunks:
            return ""

        query_embedding = get_embedding(query)
        if query_embedding is None:
            return ""
            
        query_np = np.array([query_embedding]).astype('float32')

        distances, indices = index.search(query_np, min(top_k, len(chunks)))

        retrieved_texts = []
        for i in indices[0]:
            if i >= 0 and i < len(chunks):
                retrieved_texts.append(chunks[i])

        return "\n".join(retrieved_texts)
    except Exception as e:
        print(f"RAG Retrieval Error: {e}")
        return ""
