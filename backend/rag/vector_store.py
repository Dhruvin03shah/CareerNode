import os
import faiss
import numpy as np
from backend.rag.embeddings import get_embedding

DATA_FILE = os.path.join(os.path.dirname(__file__), "data", "sample_data.txt")
INDEX_FILE = os.path.join(os.path.dirname(__file__), "faiss_index.bin")

_chunks = None

def get_chunks():
    global _chunks
    if _chunks is not None:
        return _chunks
    
    if not os.path.exists(DATA_FILE):
        return []
        
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        lines = [line.strip() for line in f.readlines() if line.strip()]
        
    # Skip very short lines or headers
    _chunks = [line for line in lines if len(line) > 10]
    return _chunks

def build_index():
    chunks = get_chunks()
    if not chunks:
        print("No data available to build FAISS index.")
        return None

    embeddings = []
    for chunk in chunks:
        emb = get_embedding(chunk)
        if emb is not None:
            embeddings.append(emb)

    if not embeddings:
        return None

    embeddings_np = np.array(embeddings).astype('float32')

    # Create FAISS index
    d = embeddings_np.shape[1]
    index = faiss.IndexFlatL2(d)
    index.add(embeddings_np)

    faiss.write_index(index, INDEX_FILE)
    print("FAISS index built successfully.")
    return index

def load_index():
    if not os.path.exists(INDEX_FILE):
        return build_index()
    return faiss.read_index(INDEX_FILE)
