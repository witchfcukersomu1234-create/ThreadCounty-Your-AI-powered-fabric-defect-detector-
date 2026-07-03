import os
import google.generativeai as genai
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(BASE_DIR / ".env")

class GeminiService:
    _instance = None
    _model = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(GeminiService, cls).__new__(cls)
        return cls._instance

    def __init__(self):

        if self._model is not None:
            return

        api_key = os.getenv("GEMINI_API_KEY")

        if not api_key:
            raise Exception("GEMINI_API_KEY not found in .env")

        genai.configure(api_key=api_key)

        self._model = genai.GenerativeModel(
            "gemini-2.5-flash"
        )

        print("=" * 60)
        print("Gemini AI Initialized Successfully")
        print("=" * 60)

    async def generate_summary(
        self,
        detections,
        total_defects,
        processing_time
    ):

        if total_defects == 0:

            prompt = f"""
You are a senior textile quality inspector.

YOLO detected NO fabric defects.

Processing time:
{processing_time} seconds.

Write a professional inspection report.

Return only plain text.

Include:

• Overall quality
• Risk level
• Manufacturing recommendation

Maximum 80 words.
"""

        else:

            defect_list = "\n".join(
                [
                    f"- {d['class']} ({round(d['confidence']*100)}%)"
                    for d in detections
                ]
            )

            prompt = f"""
You are an expert textile quality engineer.

YOLO detected the following defects:

{defect_list}

Total defects:
{total_defects}

Processing time:
{processing_time} seconds.

Generate a professional textile inspection report.

Include:

1. Overall quality

2. Risk Level

3. Manufacturing Recommendation

4. Short Conclusion

Return ONLY plain text.

Maximum 120 words.
"""

        try:

            response = self._model.generate_content(prompt)

            return response.text.strip()

        except Exception as e:

            print("Gemini Error:", e)

            return "AI summary could not be generated."


gemini_service = GeminiService()