from typing import Iterable

from sqlalchemy.orm import Session

from app import models
from app.security import hash_code


DEFAULT_CODES: Iterable[dict] = [
    {"label": "SAM (9127SAM)", "code": "9127SAM", "role": models.AccessRole.MEMBER},
    {"label": "RFB - Admin (9566RFB)", "code": "9566RFB", "role": models.AccessRole.ADMIN},
    {"label": "AJB - Admin (9553AJB)", "code": "9553AJB", "role": models.AccessRole.ADMIN},
    {"label": "ZBB (1112ZBB)", "code": "1112ZBB", "role": models.AccessRole.MEMBER},
    {"label": "TBB (7226TBB)", "code": "7226TBB", "role": models.AccessRole.MEMBER},
    {"label": "AUR (9807AUR)", "code": "9807AUR", "role": models.AccessRole.MEMBER},
]


def ensure_default_access_codes(db: Session) -> None:
    for code in DEFAULT_CODES:
        code_hash_value = hash_code(code["code"])

        # Check if code already exists by hash (the actual password)
        existing = (
            db.query(models.AccessCode)
            .filter(models.AccessCode.code_hash == code_hash_value)
            .one_or_none()
        )

        if existing:
            # Update label and role if they changed
            existing.label = code["label"]
            existing.role = code["role"]
            if not existing.is_active:
                existing.is_active = True
        else:
            # Create new access code
            db_code = models.AccessCode(
                label=code["label"],
                code_hash=code_hash_value,
                role=code["role"],
                is_active=True,
            )
            db.add(db_code)

    db.commit()
