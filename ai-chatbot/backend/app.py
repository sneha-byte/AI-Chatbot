from flask import Flask, request, jsonify  
from openai import OpenAI
import os
import dotenv
from flask_cors import CORS
import re

#Load api key from .env file
dotenv.load_dotenv()  
api_key = os.getenv("OPEN_AI_API")
client = OpenAI(api_key=api_key)

# Create the Flask app
app = Flask(__name__) 

# Enable CORS for all routes so any frontend can access the backend API
CORS(app)

def convert_latex_math_to_markdown(text: str) -> str:
    # Convert inline math: \( ... \) → $...$
    text = re.sub(r'\\\((.+?)\\\)', r'$\1$', text)

    # Convert block math: \[ ... \] → $$...$$
    text = re.sub(r'\\\[(.+?)\\\]', r'$$\1$$', text, flags=re.DOTALL)

    return text

def fix_markdown_tables(text: str) -> str:
    # Remove empty lines between rows
    lines = text.split("\n")
    new_lines = []
    inside_table = False

    for line in lines:
        if "|" in line:
            if not inside_table:
                inside_table = True
            new_lines.append(line.strip())
        else:
            if inside_table and line.strip() == "":
                continue  
            new_lines.append(line)

    return "\n".join(new_lines)

@app.route("/chat", methods=["POST"])  
def chat():
    # Get the json data from the incoming http request from the frontend
    data = request.get_json()  
    
    # Get the message value from the data dictionary 
    conversation = data.get("conversation")

    #If the message is not there then return json error message 
    if not conversation:
        return jsonify({"error": "No message provided"}), 400
    
    try:
        # Send message to OpenAI
        response = client.chat.completions.create(
            model="gpt-4.1-mini-2025-04-14",
            messages=conversation,
            max_tokens=1000,
            temperature=1
        )
        
        # Take the response key from assistant reply and return to the frontend
        raw_reply = response.choices[0].message.content
        assistant_reply = convert_latex_math_to_markdown(raw_reply)
        assistant_reply = fix_markdown_tables(assistant_reply)

        return jsonify({"response": assistant_reply})  

    # If there is an error then return json error message
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Run the server on http://localhost:5000
if __name__ == "__main__":
    app.run(port=5000, debug=True)
