import os
import requests

def send_email(to_email: str, subject: str, html_body: str) -> str | Exception:
    api_key = os.getenv('BREVO_API_KEY')
    sender_email = os.getenv('BREVO_FROM_EMAIL')
    
    if not api_key or not sender_email:
        return "Error: BREVO_API_KEY or BREVO_FROM_EMAIL not configured"
    
    try:
        url = "https://api.brevo.com/v3/smtp/email"
        
        headers = {
            "accept": "application/json",
            "api-key": api_key,
            "content-type": "application/json"
        }
        
        payload = {
            "to": [{"email": to_email, "name": to_email.split('@')[0]}],
            "sender": {"email": sender_email, "name": "MindCare Support"},
            "subject": subject,
            "htmlContent": html_body
        }
        
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        
        if response.status_code in [200, 201]:
            return 'success'
        else:
            return f"Brevo error: {response.status_code} - {response.text}"
    
    except Exception as e:
        return f"Error sending email: {str(e)}"