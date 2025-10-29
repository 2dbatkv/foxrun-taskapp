from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException, Request, status

from app import schemas
from app.models import AccessRole
from app.security import create_access_token, verify_code, hash_code, get_current_user
from app.services.json_storage import json_storage
from fastapi import Depends

router = APIRouter(prefix="/auth", tags=["auth"])

# Default access codes to initialize on first run
DEFAULT_CODES = [
    {"label": "SAM (9127SAM)", "code": "9127SAM", "role": "member"},
    {"label": "RFB - Admin (9566RFB)", "code": "9566RFB", "role": "admin"},
    {"label": "AJB - Admin (9553AJB)", "code": "9553AJB", "role": "admin"},
    {"label": "ZBB (1112ZBB)", "code": "1112ZBB", "role": "member"},
    {"label": "TBB (7226TBB)", "code": "7226TBB", "role": "member"},
    {"label": "AUR (9807AUR)", "code": "9807AUR", "role": "member"},
]


def ensure_default_access_codes():
    """Initialize access codes in JSON storage if not present"""
    access_codes = json_storage.get_all("access_codes")

    if not access_codes:
        # Initialize with default codes
        for code_data in DEFAULT_CODES:
            code_hash = hash_code(code_data["code"])
            new_code = {
                "label": code_data["label"],
                "code_hash": code_hash,
                "role": code_data["role"],
                "is_active": True,
            }
            json_storage.create("access_codes", new_code)


# Ensure codes exist on module load
try:
    ensure_default_access_codes()
except Exception as e:
    print(f"Warning: Could not initialize access codes: {e}")


@router.post("/login", response_model=schemas.TokenResponse)
def login(
    credentials: schemas.LoginRequest,
    request: Request,
):
    submitted_code = credentials.password.strip()
    client_ip: Optional[str] = request.client.host if request.client else None

    # Get all active access codes from JSON storage
    access_codes = json_storage.get_all("access_codes")
    active_codes = [code for code in access_codes if code.get("is_active", True)]

    matching_code = None
    for access_code in active_codes:
        if verify_code(submitted_code, access_code["code_hash"]):
            matching_code = access_code
            break

    # Log the login attempt
    attempt = {
        "submitted_code": submitted_code[:4] + "***",  # Partial masking for security
        "code_label": matching_code["label"] if matching_code else None,
        "code_role": matching_code["role"] if matching_code else None,
        "success": matching_code is not None,
        "failure_reason": None if matching_code else "invalid_code",
        "client_ip": client_ip,
        "created_at": datetime.utcnow().isoformat(),
    }
    json_storage.create("login_attempts", attempt)

    if not matching_code:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password",
        )

    # Convert role string to AccessRole enum
    role_str = matching_code["role"]
    role = AccessRole.ADMIN if role_str == "admin" else AccessRole.MEMBER

    token_payload = {
        "label": matching_code["label"],
        "role": role.value,
    }
    access_token, expires_at = create_access_token(token_payload)

    return schemas.TokenResponse(
        access_token=access_token,
        label=matching_code["label"],
        role=role,
        expires_at=expires_at,
    )


@router.get("/session", response_model=schemas.SessionInfo)
async def read_session(user=Depends(get_current_user)):
    return schemas.SessionInfo(
        label=user["label"],
        role=user["role"],
        expires_at=user["expires_at"],
        authenticated=True,
    )


@router.post("/logout")
async def logout():
    # Stateless JWT logout handled client-side
    return {"message": "Logged out"}
