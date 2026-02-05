import os
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_email(to_email: str, subject: str, html_body: str) -> str | Exception:
    sender_email = os.getenv('GOOGLE_EMAIL')
    app_password = os.getenv('GOOGLE_PASSWORD')

    msg = MIMEMultipart()
    msg["From"] = sender_email
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(html_body, "html"))

    context = ssl.create_default_context()

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context, timeout=30) as server:
            server.login(sender_email, app_password)
            server.send_message(msg)
            return 'success'
        
    except Exception as e:
        return e