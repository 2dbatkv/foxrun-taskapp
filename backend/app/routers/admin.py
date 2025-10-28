from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.models import AccessRole
from app.security import require_role


router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(require_role(AccessRole.ADMIN))],
)


@router.get("/login-attempts", response_model=List[schemas.LoginAttempt])
def get_login_attempts(
    limit: int = 100,
    db: Session = Depends(get_db),
):
    attempts = (
        db.query(models.LoginAttempt)
        .order_by(models.LoginAttempt.created_at.desc())
        .limit(limit)
        .all()
    )
    return attempts


@router.get("/access-codes", response_model=List[schemas.AccessCodeInfo])
def get_access_codes(db: Session = Depends(get_db)):
    codes = db.query(models.AccessCode).order_by(models.AccessCode.label.asc()).all()
    return codes
