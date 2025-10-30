from typing import List, Dict, Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.models import AccessRole
from app.security import require_role, hash_code
from app.services.json_storage import json_storage


router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(require_role(AccessRole.ADMIN))],
)


@router.get("/login-attempts")
def get_login_attempts(
    limit: int = 100,
):
    # Read from JSON storage
    attempts = json_storage.get_all("login_attempts")

    # Sort by created_at descending (most recent first)
    attempts.sort(key=lambda x: x.get("created_at", ""), reverse=True)

    # Apply limit
    return attempts[:limit]


@router.get("/access-codes")
def get_access_codes():
    # Read from JSON storage
    codes = json_storage.get_all("access_codes")

    # Sort by label ascending
    codes.sort(key=lambda x: x.get("label", ""))

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


@router.post("/access-codes")
def create_access_code(code_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new access code (admin only)"""
    # Validate required fields
    if "code" not in code_data or "label" not in code_data or "role" not in code_data:
        raise HTTPException(status_code=400, detail="Missing required fields: code, label, role")

    # Validate role
    if code_data["role"] not in ["admin", "member"]:
        raise HTTPException(status_code=400, detail="Role must be 'admin' or 'member'")

    # Check if code already exists
    existing_codes = json_storage.get_all("access_codes")
    for existing in existing_codes:
        if existing.get("code_hash") == hash_code(code_data["code"]):
            raise HTTPException(status_code=400, detail="Access code already exists")

    # Create new access code entry
    new_code = {
        "id": max([c.get("id", 0) for c in existing_codes], default=0) + 1,
        "code_hash": hash_code(code_data["code"]),
        "label": code_data["label"],
        "role": code_data["role"],
        "is_active": code_data.get("is_active", True),
        "created_at": None  # Will be set by json_storage
    }

    # Add to storage
    created = json_storage.create("access_codes", new_code)

    return {
        "message": "Access code created successfully",
        "access_code": {
            "id": created["id"],
            "label": created["label"],
            "role": created["role"],
            "is_active": created.get("is_active", True)
        }
    }


@router.put("/access-codes/{code_id}")
def update_access_code(code_id: int, code_data: Dict[str, Any]) -> Dict[str, Any]:
    """Update an access code (admin only)"""
    # Get existing code
    existing_codes = json_storage.get_all("access_codes")
    code_to_update = None
    for code in existing_codes:
        if code.get("id") == code_id:
            code_to_update = code
            break

    if not code_to_update:
        raise HTTPException(status_code=404, detail="Access code not found")

    # Prepare update data (only allow certain fields to be updated)
    update_data = {}
    if "label" in code_data:
        update_data["label"] = code_data["label"]
    if "role" in code_data:
        if code_data["role"] not in ["admin", "member"]:
            raise HTTPException(status_code=400, detail="Role must be 'admin' or 'member'")
        update_data["role"] = code_data["role"]
    if "is_active" in code_data:
        update_data["is_active"] = code_data["is_active"]

    # Update in storage
    updated = json_storage.update("access_codes", code_id, update_data)

    if not updated:
        raise HTTPException(status_code=404, detail="Failed to update access code")

    return {
        "message": "Access code updated successfully",
        "access_code": {
            "id": updated["id"],
            "label": updated["label"],
            "role": updated["role"],
            "is_active": updated.get("is_active", True)
        }
    }


@router.delete("/access-codes/{code_id}")
def delete_access_code(code_id: int) -> Dict[str, str]:
    """Delete an access code (admin only)"""
    # Check if code exists
    existing_codes = json_storage.get_all("access_codes")
    code_exists = any(code.get("id") == code_id for code in existing_codes)

    if not code_exists:
        raise HTTPException(status_code=404, detail="Access code not found")

    # Delete from storage
    success = json_storage.delete("access_codes", code_id)

    if not success:
        raise HTTPException(status_code=404, detail="Failed to delete access code")

    return {"message": "Access code deleted successfully"}
