from .auth import register_router, login_router, forgot_password_router
from .chat import chat_router
from .user import user_router, user_info_router, profile_router
from .doctor import doctor_router, doctor_info_router
from .patient import patient_router
from .questionnaire import questionnaire_router
from .dashboard.user_routes import router as dashboard_user_router
from .dashboard.doctor_routes import router as dashboard_doctor_router
from .appointments import router as appointments_router
from .appointment_details import router as appointment_details_router
from .data_consent import router as data_consent_router

__all__ = [
    "register_router",
    "login_router",
    "forgot_password_router",
    "chat_router",
    "user_router",
    "user_info_router",
    "profile_router",
    "doctor_router",
    "doctor_info_router",
    "patient_router",
    "questionnaire_router",
    "dashboard_user_router",
    "dashboard_doctor_router",
    "appointments_router",
    "appointment_details_router",
    "data_consent_router"
]