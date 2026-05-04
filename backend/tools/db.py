import os
import psycopg2
from psycopg2 import sql
from dotenv import load_dotenv

env_path = os.path.join(os.getcwd(), ".env")
load_dotenv(env_path)

# Ensure the correct DB password is used:
os.environ["DB_PASSWORD"] = "Dhruvinshah@03"

def get_connection(dbname=None):
    try:
        # Default to the target DB, or override with dbname parameter (like 'postgres' for setup)
        target_db = dbname or os.getenv("DB_NAME", "careernode")
        conn = psycopg2.connect(
            dbname=target_db,
            user=os.getenv("DB_USER", "postgres"),
            password=os.getenv("DB_PASSWORD", "Dhruvinshah@03"),
            host=os.getenv("DB_HOST", "localhost"),
            port=os.getenv("DB_PORT", "5432")
        )
        return conn
    except Exception as e:
        print(f"Database connection error: {e}")
        return None

def setup_database():
    target_db = os.getenv("DB_NAME", "careernode")
    
    # First, connect to the default 'postgres' database to create 'careernode' if it doesn't exist
    conn = get_connection(dbname="postgres")
    if conn is not None:
        try:
            conn.autocommit = True
            with conn.cursor() as cur:
                cur.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{target_db}'")
                exists = cur.fetchone()
                if not exists:
                    print(f"Database '{target_db}' does not exist. Creating it now...")
                    cur.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(target_db)))
        except Exception as e:
            print(f"Error checking/creating database: {e}")
        finally:
            conn.close()

    # Now that it exists, connect to 'careernode' and create the tables
    conn = get_connection(dbname=target_db)
    if conn is None:
        return
    try:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS interview_sessions (
                    id SERIAL PRIMARY KEY,
                    user_id INT,
                    question TEXT,
                    answer TEXT,
                    score FLOAT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            cur.execute("""
                CREATE TABLE IF NOT EXISTS resume_evaluations (
                    id SERIAL PRIMARY KEY,
                    user_id INT,
                    role VARCHAR(255),
                    ats_score INT,
                    keyword_score INT,
                    feedback_json JSONB,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            conn.commit()
    except Exception as e:
        print(f"Error setting up table: {e}")
    finally:
        conn.close()

def save_interview(state: dict):
    setup_database()  # Ensure DB and table exist before inserting
    
    conn = get_connection()
    if conn is None:
        print("Skipping DB save due to connection error.")
        return

    user_id = state.get("user_id", 0)
    questions = state.get("questions", [])
    answers = state.get("answers", [])
    scores = state.get("scores", [])

    try:
        with conn.cursor() as cur:
            for i in range(len(answers)):
                q = questions[i] if i < len(questions) else ""
                a = answers[i]
                s = scores[i] if i < len(scores) else 0.0
                
                cur.execute(
                    "INSERT INTO interview_sessions (user_id, question, answer, score) VALUES (%s, %s, %s, %s)",
                    (user_id, q, a, s)
                )
            conn.commit()
            print("Interview data successfully saved to PostgreSQL.")
    except Exception as e:
        print(f"Error saving interview data: {e}")
    finally:
        conn.close()

import json

def save_resume_evaluation(user_id: int, role: str, ats_data: dict):
    setup_database()
    conn = get_connection()
    if conn is None:
        print("Skipping DB save due to connection error.")
        return

    try:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO resume_evaluations (user_id, role, ats_score, keyword_score, feedback_json) VALUES (%s, %s, %s, %s, %s)",
                (
                    user_id, 
                    role, 
                    ats_data.get("ats_score", 0), 
                    ats_data.get("keyword_match_score", 0),
                    json.dumps(ats_data)
                )
            )
            conn.commit()
            print("ATS Resume evaluation successfully saved to PostgreSQL.")
    except Exception as e:
        print(f"Error saving ATS resume evaluation: {e}")
    finally:
        conn.close()
