from datetime import datetime, timedelta
import uuid

from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

SCOPES = ["https://www.googleapis.com/auth/calendar"]

def create_meet_link(title, start_time, duration_minutes=30, attendees=None):
    creds = Credentials.from_authorized_user_file("token.json", SCOPES)

    if creds.expired and creds.refresh_token:
        creds.refresh(Request())
        with open("token.json", "w") as f:
            f.write(creds.to_json())

    service = build("calendar", "v3", credentials=creds)

    end_time = start_time + timedelta(minutes=duration_minutes)

    event = {
        "summary": title,
        "start": {
            "dateTime": start_time.isoformat(),
            "timeZone": "Asia/Colombo",
        },
        "end": {
            "dateTime": end_time.isoformat(),
            "timeZone": "Asia/Colombo",
        },
        "attendees": [{"email": email} for email in attendees] if attendees else [],
        "conferenceData": {
            "createRequest": {
                "requestId": str(uuid.uuid4()),
                "conferenceSolutionKey": {"type": "hangoutsMeet"},
            }
        },
    }

    created_event = service.events().insert(
        calendarId="primary",
        body=event,
        conferenceDataVersion=1
    ).execute()

    meet_link = (
        created_event
        .get("conferenceData", {})
        .get("entryPoints", [{}])[0]
        .get("uri")
    )

    return meet_link