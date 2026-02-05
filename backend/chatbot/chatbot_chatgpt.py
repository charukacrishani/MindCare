import openai
from typing import List, Dict, Any
 
# Initialize OpenAI
openai.api_key = "--"
 
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
        self.final_response = "Thank you for your responses, I will now analyze your status."
 
        # Question counter
        self.max_questions = 12
 
    def prepare_conversation_history(self, messages: List[Dict]) -> List[Dict]:
        """Format conversation history for OpenAI API"""
        history = [{"role": "system", "content": self.system_prompt}]
        for msg in messages:
            history.append({
                "role": "assistant" if msg.role == "assistant" else "user",
                "content": msg.content
            })
        return history
 
    def generate_next_question(self, conversation_history: List[Dict]) -> str:
        """Generate next question using OpenAI"""
        try:
            response = openai.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=conversation_history,
                temperature=0.7,
                max_tokens=150
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(e)
            return "I'm here to listen. Could you tell me more about how you've been feeling?"
 
    def analyze_conversation(self, conversation_history: List[Dict]) -> Dict[str, Any]:
        """Analyze conversation to identify issue and level"""
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
 
Be objective and conservative in your assessment."""
 
        # Add analysis prompt to history
        analysis_history = conversation_history + [
            {"role": "user", "content": "Please analyze this conversation."},
            {"role": "system", "content": analysis_prompt}
        ]
 
        try:
            response = openai.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=analysis_history,
                temperature=0.3,
                max_tokens=200
            )
            # Parse the response (it should be JSON)
            import json
            result = json.loads(response.choices[0].message.content.strip())
            return result
        except Exception as e:
            return {"issue": "Unable to assess", "level": "Low", "reason": "Analysis error"}
 
    def get_recommendation(self, level: str) -> str:
        """Get recommendation based on level"""
        if level in ["High", "Moderate"]:
            return "Please consider speaking with a professional counsellor. They can provide personalized support."
        else:
            return "Continue with self-care practices. Consider mindfulness or relaxation techniques."