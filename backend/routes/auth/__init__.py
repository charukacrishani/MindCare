from .login import router as login_router
from .register import router as register_router
from .forgot_password import router as forgot_password_router

__all__ = ["login_router", "register_router", "forgot_password_router"]
