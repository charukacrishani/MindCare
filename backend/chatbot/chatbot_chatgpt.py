from typing import List, Dict, Any
import re
 
from openai import OpenAI
import os

from utils.c_types import MessageParsed

client = OpenAI(api_key=os.getenv("GPT_API_KEY"))
 
class MentalHealthChatbot_GPT:
    def __init__(self):
        # System prompt - never changes
        self.system_prompt = """You are a mental health support chatbot. Your goal is to:
1. Ask ONE question at a time
2. Use previous answers to ask relevant follow-up questions
3. Focus on understanding: mood, sleep patterns, energy levels, daily activities, and stress
4. Be empathetic and supportive
5. Do NOT diagnose - just gather information
6. After enough information, provide insights about possible issues
 
Ask about 12-15 questions total. Start with general daily life questions, then move to emotional wellbeing."""
 
        # Initial question
        self.initial_question = "Hello! I'm here to understand how you've been feeling lately. To start, what did you do most during your day today?"
        self.final_response = "Thank "
 
        # Question counter
        self.max_questions = 20
        self.model="gpt-5.4-mini"

        self.mental_health_keywords = {
            "feel", "feeling", "mood", "sleep", "stress", "anxiety", "depression", "sad", "happy",
            "energy", "tired", "fatigue", "panic", "worry", "overwhelmed", "therapy", "counsellor",
            "counselor", "mind", "body", "emotion", "emotional", "mental", "thought", "thoughts"
        }
        self.off_topic_markers = {
            "buy", "purchase", "price", "cost", "model", "spec", "specs", "brand", "bmw", "car",
            "iphone", "samsung", "laptop", "gpu", "ps5", "xbox", "camera", "comfort", "performance"
        }
 
    def prepare_conversation_history(self, messages: List[MessageParsed], noPrompt: bool = False) -> List[Dict[str, str]]:
        """Format conversation history for OpenAI API"""
        history: List[Dict[str, str]] = [{"role": "system", "content": self.system_prompt}]

        for msg in messages:
            role = msg.role if msg.role in ["assistant", "user"] else "user"
            history.append({
                "role": role,
                "content": msg.content
            })
        return history

    def _extract_single_question(self, text: str) -> str:
        """Ensure we always return one short question even if the model adds extra text."""
        cleaned = (text or "").strip()
        if not cleaned:
            return "I'm here to listen. Could you tell me more about how you've been feeling today?"

        lines = [line.strip() for line in cleaned.splitlines() if line.strip()]
        for line in lines:
            if "?" in line:
                return line.split("?", 1)[0].strip() + "?"

        return cleaned + "?"
 
    def generate_next_question(self, conversation_history: List[MessageParsed]) -> str:
        """Generate next question using OpenAI"""
        try:

            prepared_history = self.prepare_conversation_history(conversation_history)
            response = client.chat.completions.create(
                model=self.model,
                messages=prepared_history + [
                    {
                        "role": "system",
                        "content": (
                            "Use the full conversation above as context. "
                            "Ask exactly ONE brief empathetic follow-up question that directly builds on the user's latest answer. "
                            "Do not restart the conversation, do not summarize, and do not provide advice yet. "
                            "If the user goes off-topic (shopping, product choices, finance, tech, entertainment), "
                            "briefly acknowledge and redirect to one mental-health question. "
                            "Never provide non-mental-health recommendations."
                        ),
                    }
                ],
                temperature=0.4,
                max_completion_tokens=150
            )
            content = response.choices[0].message.content or ""
            return self._extract_single_question(content)
        except Exception as e:
            print(e)
            return "I'm here to listen. Could you tell me more about how you've been feeling?"
    
    def analyze_conversation(self, conversation_history: List[MessageParsed]) -> Dict[str, Any]:
        try:
            prompt = """Based on the conversation, give a summary of the user's mental state focusing on mood, sleep, energy, and stress. Identify any potential issues (stress, anxiety, depression) and their severity (low, moderate, high). Be conservative in your assessment."""
            prepared_history = self.prepare_conversation_history(conversation_history, noPrompt=True)
            response = client.chat.completions.create(
                model=self.model,
                messages=[{"role": "system", "content": prompt}] + prepared_history + [
                    {
                        "role": "system",
                        "content": (
                            "Provide a concise analysis only"
                            "Must include details for usage for a counselor only. Do not provide any non-mental-health advice or recommendations."
                            "Must not make the user more anxious or stressed. Be empathetic and supportive in your tone."
                            "Response in this format - 'Summary:\n[response]\nThis is for informational purposes only and does not constitute professional advice.'"
                            "Do not include any formattings"
                        ),
                    }
                ],
                temperature=0.4,
                max_completion_tokens=150
            )
            content = response.choices[0].message.content or ""
            return content.strip()
        except Exception as e:
            print(e)
            return "I'm here to listen. Could you tell me more about how you've been feeling?"
        
#     def analyze_conversation(self, conversation_history: List[MessageParsed]) -> Dict[str, Any]:
#         """Analyze conversation to identify issue and level"""
#         analysis_prompt = """Based on the conversation, identify:
# 1. The main issue (choose ONE: Stress, Anxiety, Depression, or "None evident")
# 2. The severity level (Low, Moderate, or High)
# 3. A brief reason for your assessment
 
# Return your response in this EXACT JSON format:
# {
#     "issue": "Stress/Anxiety/Depression/None evident",
#     "level": "Low/Moderate/High",
#     "reason": "Brief explanation here"
# }
 
# Be objective and conservative in your assessment."""
 
#         prepared_history = self.prepare_conversation_history(conversation_history)
#         # Replace the chatbot system prompt with analysis-focused instructions.
#         analysis_history = [{"role": "system", "content": analysis_prompt}] + prepared_history[1:] + [
#             {"role": "user", "content": "Please analyze this conversation."}
#         ]
 
#         try:
#             response = client.chat.completions.create(
#                 model=self.model,
#                 messages=analysis_history,
#                 temperature=0.3,
#                 max_completion_tokens=200
#             )
#             # Parse the response (it should be JSON)
#             import json
#             raw = response.choices[0].message.content or "{}"
#             result = json.loads(raw.strip())
#             return result
#         except Exception as e:
#             return {"issue": "Unable to assess", "level": "Low", "reason": "Analysis error"}
 
    # def get_recommendation(self, level: str) -> str:
    #     """Get recommendation based on level"""
    #     if level in ["High", "Moderate"]:
    #         return "Please consider speaking with a professional counsellor. They can provide personalized support."
    #     else:
    #         return "Continue with self-care practices. Consider mindfulness or relaxation techniques."
        
    def get_tips(self, levels: List[str]):
        tips_prompt = f"""
        Based on the following DASS-21 levels of stress, anxiety, and depression: {', '.join(map(str, levels))},
        provide exactly 5 practical self-care tips.

        Return ONLY a JSON array in this format:
        [
        {{"bold": "short title", "light": "detailed explanation"}},
        {{"bold": "short title", "light": "detailed explanation"}}
        ]
        """
        try:
            response = client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": tips_prompt}],
                temperature=0.3,
                max_completion_tokens=500
            )
            # Parse the response (it should be JSON)
            import json
            result = json.loads(response.choices[0].message.content.strip())
            return result
        except Exception as e:
            print(f"Error generating tips: {e}")
            return [
                {"bold": "Stay active", "light": "Engage in light exercise daily"},
                {"bold": "Talk to someone", "light": "Share your feelings with a trusted person"},
                {"bold": "Sleep well", "light": "Maintain a consistent sleep schedule"},
                {"bold": "Eat balanced meals", "light": "Support your mental health with proper nutrition"},
                {"bold": "Take breaks", "light": "Avoid burnout by resting regularly"},
            ]