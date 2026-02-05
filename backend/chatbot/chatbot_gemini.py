from typing import List, Dict, Any
import json
import os

from google import genai
from google.genai import types


# Simple replacement for MessageParsed
class MessageParsed:
    def __init__(self, role: str, content: str):
        self.role = role
        self.content = content


class MentalHealthChatbot_GEMINI:
    def __init__(self):
        self.system_prompt = """You are a mental health support chatbot. Your goal is to:
1. Ask ONE question at a time
2. Use previous answers to ask relevant follow-up questions
3. Focus on understanding: mood, sleep patterns, energy levels, daily activities, and stress
4. Be empathetic and supportive
5. Do NOT diagnose - just gather information
6. After enough information, provide insights about possible issues

Ask about 12-15 questions total. Start with general daily life questions, then move to emotional wellbeing.
"""

        self.initial_question = (
            "Hello! I'm here to understand how you've been feeling lately. "
            "To start, what did you do most during your day today?"
        )
        self.final_response = (
            "Thank you for your responses, I will now analyze your status."
        )

        self.max_questions = 12

        # NEW Gemini client
        self.client = genai.Client(
            api_key="AIzaSyByTW3s99WnskFFr_-Lkg9jUXiDSeOGj7c"
        )   

        self.model = "gemini-2.5-flash"

    def prepare_conversation_history(self, messages: List[MessageParsed]) -> str:
        prompt = f"SYSTEM:\n{self.system_prompt}\n\n"

        for msg in messages:
            role = "ASSISTANT" if msg.role == "assistant" else "USER"
            prompt += f"{role}: {msg.content}\n"

        return prompt

    def generate_next_question(self, conversation_history: List[MessageParsed]) -> str:
        try:
            prompt_text = self.prepare_conversation_history(conversation_history)
            prompt_text += "\nASSISTANT: Ask the next ONE question only."

            contents = [
                types.Content(
                role="user",
                parts=[types.Part.from_text(text=prompt_text)],
                )
            ]


            response = self.client.models.generate_content(
                model=self.model,
                contents=contents,
                config=types.GenerateContentConfig(
                    temperature=0.7
                ),
            )

            return response.text.strip()
        except Exception as e:
            return "Im here to listen"
    

    def analyze_conversation(self, conversation_history: List[MessageParsed]) -> str:
        try:
            analysis_prompt = """Based on the conversation, identify:
    1. The main issue (choose ONE: Stress, Anxiety, Depression, or "None evident")
    2. The severity level (Low, Moderate, or High)
    3. A brief reason for your assessment

    Return your response in this EXACT JSON format:
    {
    "issue": "Stress/Anxiety/Depression/None evident",
    "level": "Low/Moderate/High",
    "reason": "Brief explanation here"
    }

    Return ONLY valid JSON.
    """

            prompt_text = self.prepare_conversation_history(conversation_history)
            prompt_text += f"\nSYSTEM_ANALYSIS:\n{analysis_prompt}\n"

            contents = [
                types.Content(
                    role="user",
                    parts=[types.Part.from_text(text=prompt_text)],
                )
            ]


            response = self.client.models.generate_content(
                model=self.model,
                contents=contents,
                config=types.GenerateContentConfig(
                    temperature=0.3            ),
            )

            return response.text.strip()
        except Exception as e:
            return "Chat not ended analyzing failed"

    def get_recommendation(self, level: str) -> str:
        if level in ["High", "Moderate"]:
            return "Please consider speaking with a professional counsellor."
        return "Continue with self-care practices like mindfulness and rest."
