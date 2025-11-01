from google import genai
import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# Initialize client
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("❌ Missing GEMINI_API_KEY in .env file.")
    exit(1)

print("🔑 Using Gemini API key: ✅ Loaded")

client = genai.Client(api_key=api_key)

# Example movie watchlist
watchlist = ["Inception", "The Dark Knight", "Interstellar"]

# Create a text prompt like your app will send
prompt = f"""
Given the following watchlist: {', '.join(watchlist)},
recommend 5 other movies that the user might enjoy.
For each movie, include a short description and genre.
"""

try:
    response = client.models.generate_content(
        model="models/gemini-2.0-flash",  # or "models/gemini-2.0-pro" if flash unavailable
        contents=prompt
    )

    print("\n🎬 AI Movie Recommendations:\n")
    print(response.text)

except Exception as e:
    print("\n❌ Error while testing Gemini API:")
    print(e)
