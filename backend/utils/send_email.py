import os
import requests
import base64

def send_email(to_email: str, subject: str, html_body: str) -> str | Exception:
    api_key = os.getenv("MAILJET_API_KEY")
    api_secret = os.getenv("MAILJET_SECRET_KEY")
    sender_email = os.getenv("MAILJET_FROM_EMAIL")

    if not api_key or not api_secret or not sender_email:
        return "Error: MAILJET credentials not configured"

    try:
        url = "https://api.mailjet.com/v3.1/send"

        auth = base64.b64encode(f"{api_key}:{api_secret}".encode()).decode()

        headers = {
            "Authorization": f"Basic {auth}",
            "Content-Type": "application/json"
        }

        payload = {
            "Messages": [
                {
                    "From": {
                        "Email": sender_email,
                        "Name": "My App"
                    },
                    "To": [
                        {
                            "Email": to_email
                        }
                    ],
                    "Subject": subject,
                    "HTMLPart": html_body
                }
            ]
        }

        response = requests.post(url, json=payload, headers=headers, timeout=30)

        if response.status_code in [200, 201]:
            return "success"
        else:
            return f"Mailjet error: {response.status_code} - {response.text}"

    except Exception as e:
        return f"Error sending email: {str(e)}"