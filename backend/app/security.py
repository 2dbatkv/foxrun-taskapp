from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Optional, TypedDict
from uuid import uuid4
import hashlib
import hmac

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from app.config import get_settings
from app.models import AccessRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours for small team usage


class AuthenticatedUser(TypedDict):
    label: str
    role: AccessRole
    expires_at: Optional[datetime]


def _salt() -> str:
    settings = get_settings()
    return settings.secret_key[:16]


def hash_code(code: str) -> str:
    salted = (code + _salt()).encode("utf-8")
    return hashlib.sha256(salted).hexdigest()


def verify_code(plain_code: str, hashed_code: str) -> bool:
    expected = hash_code(plain_code)
    return hmac.compare_digest(expected, hashed_code)


def create_access_token(
    payload: Dict[str, Any], expires_delta: Optional[timedelta] = None
) -> tuple[str, datetime]:
    settings = get_settings()
    to_encode = payload.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire, "jti": payload.get("jti") or uuid4().hex})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=ALGORITHM)
    return encoded_jwt, expire


async def get_current_user(token: str = Depends(oauth2_scheme)) -> AuthenticatedUser:
    settings = get_settings()
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
        label: Optional[str] = payload.get("label")
        role_value: Optional[str] = payload.get("role")
        if label is None or role_value is None:
            raise credentials_exception
        try:
            role = AccessRole(role_value)
        except ValueError:
            raise credentials_exception

        expires_at = (
            datetime.fromtimestamp(payload["exp"], tz=timezone.utc)
            if "exp" in payload
            else None
        )
        return {"label": label, "role": role, "expires_at": expires_at}
    except JWTError:
        raise credentials_exception


def require_role(min_role: AccessRole):
    role_priority = {AccessRole.MEMBER: 1, AccessRole.ADMIN: 2}

    async def check_role(user: AuthenticatedUser = Depends(get_current_user)) -> AuthenticatedUser:
        user_role: AccessRole = user["role"]
        if role_priority[user_role] < role_priority[min_role]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return user

    return check_role
