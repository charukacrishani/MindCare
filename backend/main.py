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
from routes import register_router, chat_router, login_router, user_router, doctor_router, user_info_router, doctor_info_router, questionnaire_router
from utils.hash import hash_password

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

    # session_gen = get_session()
    # session = next(session_gen)

    # try:
    #     existing = session.exec(select(Users).where(Users.userid == "charuka")).first()
    #     if existing:
    #         return

    #     password = hash_password("charuka")
    #     user = Users(userid="charuka", name="Charuka Crishani", email="fcharuka18@gmail.com", password=password, role='user')

    #     session.add(user)
    #     session.commit()

    # finally:
    #     session.close()

# Include API routers BEFORE catch-all routes
app.include_router(login_router)
app.include_router(register_router)
app.include_router(user_router)
app.include_router(doctor_router)
app.include_router(chat_router)
app.include_router(user_info_router)
app.include_router(doctor_info_router)
app.include_router(questionnaire_router)

# root = Path(os.getenv("root"))

# @app.get("/{full_path:path}", response_class=HTMLResponse)
# def serve_react_app(full_path: str, auth = Depends(get_context_html)):
#     if isinstance(auth, RedirectResponse):
#         return auth
#     index_file = root / "frontend/index.html"

#     if index_file.exists():
#         return FileResponse(index_file)

#     return HTMLResponse("<h1>MindCare is offline</h1>", status_code=404)
