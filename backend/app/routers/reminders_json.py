from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app import schemas
from app.services.json_storage import json_storage
from app.security import require_role
from app.models import AccessRole

router = APIRouter(
    prefix="/reminders",
    tags=["reminders"],
    dependencies=[Depends(require_role(AccessRole.MEMBER))],
)


@router.get("/", response_model=List[schemas.Reminder])
def get_reminders(skip: int = 0, limit: int = 100, active_only: bool = False):
    reminders = json_storage.get_all("reminders")
    if active_only:
        reminders = [r for r in reminders if r.get('is_active') and not r.get('is_completed')]
    return reminders[skip:skip + limit]


@router.get("/upcoming", response_model=List[schemas.Reminder])
def get_upcoming_reminders():
    from datetime import datetime
    reminders = json_storage.get_all("reminders")
    now = datetime.utcnow().isoformat()
    upcoming = [r for r in reminders if r.get('is_active') and not r.get('is_completed') and r.get('remind_at', '') >= now]
    return sorted(upcoming, key=lambda x: x.get('remind_at', ''))


@router.get("/{reminder_id}", response_model=schemas.Reminder)
def get_reminder(reminder_id: int):
    reminder = json_storage.get_by_id("reminders", reminder_id)
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return reminder


@router.post("/", response_model=schemas.Reminder, status_code=201)
def create_reminder(reminder: schemas.ReminderCreate):
    reminder_data = reminder.model_dump()
    new_reminder = json_storage.create("reminders", reminder_data)
    return new_reminder


@router.put("/{reminder_id}", response_model=schemas.Reminder)
def update_reminder(reminder_id: int, reminder: schemas.ReminderUpdate):
    update_data = reminder.model_dump(exclude_unset=True)
    updated_reminder = json_storage.update("reminders", reminder_id, update_data)
    if not updated_reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return updated_reminder


@router.delete("/{reminder_id}", status_code=204)
def delete_reminder(reminder_id: int):
    success = json_storage.delete("reminders", reminder_id)
    if not success:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return None
