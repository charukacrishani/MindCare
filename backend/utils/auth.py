from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Cookie
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel

class UserInfo(BaseModel):
    userid: str

SECRET_KEY = "CHANGE_THIS_TO_A_LONG_RANDOM_SECRET"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

class UserInfo(BaseModel):
    user_id: str | None = None

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()

    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str) -> UserInfo:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        user_id: str = payload.get("user_id")
        if user_id is None:
            return None

        return UserInfo(user_id=user_id)

    except JWTError:
        return None

def get_current_user(token: str | None = Cookie(None, alias="mindcare")) -> UserInfo:
    if not token:
        return None

    return verify_token(token)