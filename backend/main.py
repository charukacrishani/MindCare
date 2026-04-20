import os
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.responses import FileResponse, HTMLResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import select
from pathlib import Path
from context import get_context_html
from db import get_session, init_db
from models.user import Users
from routes import register_router, chat_router, login_router, user_router, doctor_router, user_info_router, doctor_info_router, questionnaire_router, profile_router, dashboard_user_router, forgot_password_router, dashboard_doctor_router
from routes.avatar import avatar_router
from utils.hash import hash_password
from models.password_reset import PasswordReset

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

# Include API routers
app.include_router(login_router)
app.include_router(register_router)
app.include_router(user_router)
app.include_router(doctor_router)
app.include_router(chat_router)
app.include_router(user_info_router)
app.include_router(doctor_info_router)
app.include_router(questionnaire_router)
app.include_router(profile_router)
app.include_router(forgot_password_router)  # ← moved here
app.include_router(dashboard_user_router)  # ← moved here
app.include_router(avatar_router)  # ← avatar routes
app.include_router(dashboard_doctor_router)  # ← added doctor dashboard routes