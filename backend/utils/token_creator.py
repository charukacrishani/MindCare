import os
from dotenv import load_dotenv
from google_auth_oauthlib.flow import InstalledAppFlow

load_dotenv()

SCOPES = ["https://www.googleapis.com/auth/calendar"]

flow = InstalledAppFlow.from_client_config(
    {
        "installed": {
            "client_id": os.environ.get("GOOGLE_CLIENT_ID"),
            "project_id": os.environ.get("GOOGLE_PROJECT_ID"),
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_secret": os.environ.get("GOOGLE_CLIENT_SECRET"),
            "redirect_uris": ["http://localhost"],
        }
    },
    scopes=SCOPES,
)

creds = flow.run_local_server(
    port=0,
    access_type="offline",
    prompt="consent"
)

with open("../token.json", "w") as token:
    token.write(creds.to_json())

print("token.json generated")
