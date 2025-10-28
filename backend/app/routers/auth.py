from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.security import create_access_token, get_current_user, verify_code


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=schemas.TokenResponse)
def login(
    credentials: schemas.LoginRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    submitted_code = credentials.password.strip()
    client_ip: Optional[str] = request.client.host if request.client else None

    matching_code: Optional[models.AccessCode] = None
    active_codes = (
        db.query(models.AccessCode)
        .filter(models.AccessCode.is_active == True)  # noqa: E712
        .all()
    )

    for access_code in active_codes:
        if verify_code(submitted_code, access_code.code_hash):
            matching_code = access_code
            break

    attempt = models.LoginAttempt(
        submitted_code=submitted_code,
        code_label=matching_code.label if matching_code else None,
        code_role=matching_code.role if matching_code else None,
        success=matching_code is not None,
        failure_reason=None if matching_code else "invalid_code",
        client_ip=client_ip,
        created_at=datetime.utcnow(),
    )
    db.add(attempt)
    db.commit()

    if not matching_code:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password",
        )

    token_payload = {
        "label": matching_code.label,
        "role": matching_code.role.value,
    }
    access_token, expires_at = create_access_token(token_payload)

    return schemas.TokenResponse(
        access_token=access_token,
        label=matching_code.label,
        role=matching_code.role,
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
