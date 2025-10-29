from typing import List, Dict, Any

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.models import AccessRole
from app.security import require_role
from app.services.json_storage import json_storage


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


@router.get("/team")
def get_team_members() -> Dict[str, List[Any]]:
    """Get all team members (admin only)"""
    team_members = json_storage.get_all("team")
    return {"team": team_members}


@router.put("/team")
def update_team_members(team_data: Dict[str, List[Dict[str, Any]]]) -> Dict[str, str]:
    """Update team members (admin only)"""
    # Validate team data structure
    if "team" not in team_data:
        return {"error": "Invalid team data format"}

    # Write directly to the team.json file
    json_storage._write_json("team", team_data)

    return {"message": "Team members updated successfully"}


@router.get("/database")
def get_database_viewer() -> Dict[str, Any]:
    """Get all available data types for database viewer (admin only)"""
    data_types = [
        "tasks",
        "calendar",
        "reminders",
        "knowledge",
        "documents",
        "feedback",
        "team",
        "task_templates",
        "login_attempts"
    ]
    return {"data_types": data_types}


@router.get("/database/{data_type}")
def get_database_data(data_type: str) -> Dict[str, Any]:
    """Get all data for a specific data type (admin only)"""
    valid_types = [
        "tasks", "calendar", "reminders", "knowledge", "documents",
        "feedback", "team", "task_templates", "login_attempts"
    ]

    if data_type not in valid_types:
        return {"error": f"Invalid data type. Must be one of: {', '.join(valid_types)}"}

    try:
        data = json_storage.get_all(data_type)
        return {
            "data_type": data_type,
            "count": len(data),
            "data": data
        }
    except Exception as e:
        return {"error": f"Failed to load data: {str(e)}"}
