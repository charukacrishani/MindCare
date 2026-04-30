import os
from dotenv import load_dotenv
from google_auth_oauthlib.flow import Flow

load_dotenv()

SCOPES = ["https://www.googleapis.com/auth/calendar"]

flow = Flow.from_client_config(
    {
        "installed": {
            "client_id": os.getenv("GOOGLE_CLIENT_ID"),
            "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": [os.getenv("GOOGLE_REDIRECT_URI")],
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

print("✅ token.json generated")