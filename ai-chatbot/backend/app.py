from flask import Flask, request, jsonify  
from openai import OpenAI
import os
import dotenv
from flask_cors import CORS

#Load api key from .env file
dotenv.load_dotenv()  
api_key = os.getenv("OPEN_AI_API")
client = OpenAI(api_key=api_key)

# Create the Flask app
app = Flask(__name__) 

# Enable CORS for all routes so any frontend can access the backend API
CORS(app)

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
            model="gpt-4.1-2025-04-14",
            messages=conversation,
            max_tokens=1000,
            temperature=1
        )
        
        # Take the response key from assistant reply and return to the frontend
        assistant_reply = response.choices[0].message.content
        return jsonify({"response": assistant_reply})  

    # If there is an error then return json error message
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Run the server on http://localhost:5000
if __name__ == "__main__":
    app.run(port=5000, debug=True)
