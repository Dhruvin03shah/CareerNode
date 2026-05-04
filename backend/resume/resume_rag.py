"""
Resume RAG — Phase 16
======================
Builds a per-session, in-memory FAISS index from the candidate's resume text.
This lets the interview agent do semantic retrieval against the resume itself
(not just the generic industry knowledge base) before generating each question.

IMPORTANT: The index is in-memory only. It is built during /run and cannot be
JSON-serialised, so it will not survive the state round-trip to the frontend.
The interview agent handles this gracefully — it falls back to structured_resume
when the index is not available (i.e. on /answer calls).
"""

import re
import numpy as np
from backend.rag.embeddings import get_embedding
from backend.tools.logger import log_agent, log_error, log_info


# ── Chunking ───────────────────────────────────────────────────────────────────

def _chunk_resume(text: str, chunk_size: int = 200, overlap: int = 40) -> list[str]:
    """
    Split resume text into overlapping sentence-aware chunks.
    Prioritises splitting on sentence boundaries; falls back to word count.
    """
    # Split on sentence boundaries first
    sentences = re.split(r'(?<=[.!?])\s+|\n{2,}', text)
    sentences = [s.strip() for s in sentences if s.strip()]

    chunks = []
    current = ""

    for sent in sentences:
        if len(current) + len(sent) <= chunk_size:
            current += (" " if current else "") + sent
        else:
            if current:
                chunks.append(current)
            # Start new chunk with overlap from the end of the previous one
            words = current.split()
            overlap_text = " ".join(words[-overlap // 6:]) if words else ""
            current = (overlap_text + " " + sent).strip()

    if current:
        chunks.append(current)

    # Remove chunks that are too short to be informative
    return [c for c in chunks if len(c.split()) >= 5]


# ── Index builder ──────────────────────────────────────────────────────────────

def build_resume_index(resume_text: str):
    """
    Chunk the resume text, embed each chunk with MiniLM, and store in an
    in-memory FAISS IndexFlatL2.

    Returns:
        (index, chunks) — both None/[] on failure.
    """
    try:
        import faiss

        log_agent("ResumeRAG", "Building in-memory FAISS index from resume")
        chunks = _chunk_resume(resume_text)

        if not chunks:
            log_error("ResumeRAG", "No chunks produced from resume text")
            return None, []

        embeddings = []
        valid_chunks = []
        for chunk in chunks:
            emb = get_embedding(chunk)
            if emb is not None:
                embeddings.append(emb)
                valid_chunks.append(chunk)

        if not embeddings:
            log_error("ResumeRAG", "No embeddings generated")
            return None, []

        embeddings_np = np.array(embeddings, dtype="float32")
        dim = embeddings_np.shape[1]

        index = faiss.IndexFlatL2(dim)
        index.add(embeddings_np)

        log_info("ResumeRAG", f"Index built: {len(valid_chunks)} chunks, dim={dim}")
        return index, valid_chunks

    except Exception as e:
        log_error("ResumeRAG", f"Failed to build resume index: {e}")
        return None, []


# ── Retrieval ──────────────────────────────────────────────────────────────────

def retrieve_resume_context(query: str, index, chunks: list, top_k: int = 3) -> str:
    """
    Semantic search over the resume index.
    Returns the top_k most relevant resume chunks joined as a string.
    Returns "" on any failure.
    """
    if index is None or not chunks:
        return ""

    try:
        query_emb = get_embedding(query)
        if query_emb is None:
            return ""

        query_np = np.array([query_emb], dtype="float32")
        distances, indices = index.search(query_np, min(top_k, len(chunks)))

        results = []
        for i in indices[0]:
            if 0 <= i < len(chunks):
                results.append(chunks[i])

        return "\n".join(results)

    except Exception as e:
        log_error("ResumeRAG", f"Retrieval error: {e}")
        return ""
