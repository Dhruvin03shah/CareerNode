import os
import logging
import warnings
from sentence_transformers import SentenceTransformer

# Suppress HuggingFace and transformers warnings/logs
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"
os.environ["TOKENIZERS_PARALLELISM"] = "false"
warnings.filterwarnings("ignore")
logging.getLogger("transformers").setLevel(logging.ERROR)
logging.getLogger("sentence_transformers").setLevel(logging.ERROR)

# Load model once globally to avoid reloading overhead
try:
    model = SentenceTransformer('all-MiniLM-L6-v2')
except Exception as e:
    print(f"Error loading SentenceTransformer: {e}")
    model = None

def get_embedding(text: str):
    """Returns the embedding vector for a given text."""
    if model is None:
        return None
    return model.encode(text)
