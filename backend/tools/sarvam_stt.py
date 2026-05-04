import os
import requests
from backend.tools.logger import log_api, log_error

SARVAM_API_KEY = os.getenv("SARVAM_API_KEY", "")

MIME_MAP = {
    ".wav":  "audio/wav",
    ".webm": "audio/webm",
    ".ogg":  "audio/ogg",
    ".mp3":  "audio/mpeg",
    ".mp4":  "audio/mp4",
    ".m4a":  "audio/mp4",
}

def audio_to_text(audio_bytes: bytes, filename: str = "audio.webm") -> str:
    """
    Sends audio to Sarvam AI STT API and returns the transcript.
    Supports wav, webm, ogg, mp3 formats.
    """
    if not SARVAM_API_KEY:
        log_error("SarvamSTT", "SARVAM_API_KEY is not set in environment.")
        return "[STT Error: Missing API Key]"

    # Detect MIME from filename extension
    ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ".webm"
    mime_type = MIME_MAP.get(ext, "audio/webm")

    url = "https://api.sarvam.ai/speech-to-text-translate"
    headers = {"api-subscription-key": SARVAM_API_KEY}

    files = {"file": (filename, audio_bytes, mime_type)}
    data  = {"model": "saaras:v1"}

    try:
        log_api("SarvamSTT", f"Sending audio ({mime_type}, {len(audio_bytes)//1024}KB) to Sarvam AI...")
        response = requests.post(url, headers=headers, files=files, data=data, timeout=30)
        response.raise_for_status()

        result     = response.json()
        transcript = result.get("transcript", "")
        log_api("SarvamSTT", f"Transcript received: {transcript[:80]}...")
        return transcript
    except requests.exceptions.Timeout:
        log_error("SarvamSTT", "Request timed out after 30s")
        return "[STT Error: Timeout]"
    except Exception as e:
        log_error("SarvamSTT", f"Failed to transcribe audio: {e}")
        return f"[STT Error: {str(e)}]"
