
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import re
import os
import dotenv
from openai import OpenAI
from PyPDF2 import PdfReader

# Load API Key from .env file
dotenv.load_dotenv()
api_key = os.getenv("OPEN_AI_API")    
client = OpenAI(api_key=api_key)

app = Flask(__name__)
# Allow browser frontend at http://localhost:5173
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

# (text, embedding) pairs from uploaded file
stored_vectors = []  

# Utils
def convert_latex_math_to_markdown(text: str) -> str:
    r"""
    Convert LaTeX math environments to Markdown math syntax.
    \( ... \) → $...$    \[ ... \] → $$...$$
    """
    text = re.sub(r'\\\((.+?)\\\)', r'$\1$', text)
    text = re.sub(r'\\\[(.+?)\\\]', r'$$\1$$', text, flags=re.DOTALL)
    return text

def fix_markdown_tables(text: str) -> str:
    """Clean up markdown table spacing."""
    lines = text.split("\n")
    new_lines = []
    inside_table = False
    for line in lines:
        if "|" in line:
            inside_table = True
            new_lines.append(line.strip())
        else:
            if inside_table and line.strip() == "":
                continue
            new_lines.append(line)
    return "\n".join(new_lines)

def cosine(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

# File upload endpoint (PDF or .txt)
@app.route("/upload", methods=["POST"])
def upload():
    """
    Upload a file. If PDF → extract text with PyPDF2.
    If TXT → decode as UTF-8 (or latin-1 fallback).
    Then chunk & embed for retrieval later.
    """
    file = request.files.get("file")
    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    filename = file.filename.lower()
    try:
        if filename.endswith(".pdf"):
            file.seek(0)
            reader = PdfReader(file)
            text = ""
            for page in reader.pages:
                t = page.extract_text()
                if t:
                    text += t
        else:
            raw = file.read()
            try:
                text = raw.decode("utf-8")
            except:
                text = raw.decode("latin-1")

        # Chunk & embed
        chunk_size = 500
        words = text.split()
        chunks = [" ".join(words[i:i+chunk_size]) for i in range(0, len(words), chunk_size)]

        global stored_vectors
        stored_vectors = []  # clear previous file
        for c in chunks:
            emb = client.embeddings.create(model="text-embedding-3-large", input=c).data[0].embedding
            stored_vectors.append({"text": c, "embedding": emb})

        print(f"Uploaded & indexed {len(stored_vectors)} chunks.")
        return jsonify({"status": "success", "chunks": len(stored_vectors)})

    except Exception as e:
        print("Upload error:", e)
        return jsonify({"error": str(e)}), 500

# Chat endpoint 
@app.route("/chat", methods=["POST", "OPTIONS"])
def chat():
    if request.method == "OPTIONS":
        return '', 200  # Respond to CORS preflight

    data = request.get_json()
    conversation = data.get("conversation", [])

    if not conversation:
        return jsonify({"error": "No conversation"}), 400

    try:
        user_query = conversation[-1]["content"]

        # Embed the question
        query_emb = client.embeddings.create(
            model="text-embedding-3-large",
            input=user_query
        ).data[0].embedding

        # Retrieve top 3
        ranked = sorted(stored_vectors, key=lambda x: cosine(query_emb, x["embedding"]), reverse=True)
        top_context = "\n".join([x["text"] for x in ranked[:3]]) if ranked else ""

        # System context prompt
        sys = {
            "role": "system",
            "content": f"You are a helpful assistant. Use the following context to answer the user:\n\n{top_context}"
        }
        conversation = [sys] + conversation

        # Chat completion call
        response = client.chat.completions.create(
            model="gpt-4.1-mini-2025-04-14",
            messages=conversation,
            max_tokens=1000,
            temperature=1
        )
        raw = response.choices[0].message.content
        cleaned = fix_markdown_tables(convert_latex_math_to_markdown(raw))
        return jsonify({"response": cleaned})

    except Exception as e:
        print("Chat error:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5000, debug=True)
