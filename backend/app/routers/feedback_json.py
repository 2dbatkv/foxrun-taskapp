from typing import List

from fastapi import APIRouter, Depends, HTTPException

from app import schemas
from app.models import AccessRole
from app.security import require_role
from app.services.json_storage import json_storage

router = APIRouter(prefix="/feedback", tags=["feedback"])


@router.post("/", response_model=schemas.Feedback, status_code=201)
def submit_feedback(
    feedback: schemas.FeedbackCreate,
    user=Depends(require_role(AccessRole.MEMBER)),
):
    feedback_data = feedback.model_dump()
    created = json_storage.create("feedback", feedback_data)
    return created


@router.get("/", response_model=List[schemas.Feedback])
def list_feedback(
    user=Depends(require_role(AccessRole.ADMIN)),
):
    entries = json_storage.get_all("feedback")
    # Newest first
    sorted_entries = sorted(entries, key=lambda item: item.get("created_at", ""), reverse=True)
    return sorted_entries


@router.delete("/{feedback_id}")
def delete_feedback(
    feedback_id: int,
    user=Depends(require_role(AccessRole.ADMIN)),
):
    """Delete a feedback entry (admin only)"""
    success = json_storage.delete("feedback", feedback_id)
    if not success:
        raise HTTPException(status_code=404, detail="Feedback not found")
    return {"message": "Feedback deleted successfully"}
