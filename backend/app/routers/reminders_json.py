from fastapi import APIRouter, Depends, HTTPException
from typing import List
from datetime import datetime
from app import schemas
from app.services.json_storage import json_storage
from app.security import require_role
from app.models import AccessRole

router = APIRouter(
    prefix="/reminders",
    tags=["reminders"],
    dependencies=[Depends(require_role(AccessRole.MEMBER))],
)


def _parse_reminder_dates(reminder: dict) -> dict:
    """Parse ISO string dates back to datetime objects for Pydantic validation"""
    if reminder.get('remind_at') and isinstance(reminder['remind_at'], str):
        reminder['remind_at'] = datetime.fromisoformat(reminder['remind_at'])
    if reminder.get('created_at') and isinstance(reminder['created_at'], str):
        reminder['created_at'] = datetime.fromisoformat(reminder['created_at'])
    if reminder.get('updated_at') and isinstance(reminder['updated_at'], str):
        reminder['updated_at'] = datetime.fromisoformat(reminder['updated_at'])
    return reminder


@router.get("/", response_model=List[schemas.Reminder])
def get_reminders(skip: int = 0, limit: int = 100, active_only: bool = False):
    reminders = json_storage.get_all("reminders")
    if active_only:
        reminders = [r for r in reminders if r.get('is_active') and not r.get('is_completed')]
    # Parse datetime strings back to datetime objects
    reminders = [_parse_reminder_dates(r) for r in reminders]
    return reminders[skip:skip + limit]


@router.get("/upcoming", response_model=List[schemas.Reminder])
def get_upcoming_reminders():
    reminders = json_storage.get_all("reminders")
    now = datetime.utcnow().isoformat()
    upcoming = [r for r in reminders if r.get('is_active') and not r.get('is_completed') and r.get('remind_at', '') >= now]
    # Parse datetime strings back to datetime objects
    upcoming = [_parse_reminder_dates(r) for r in upcoming]
    return sorted(upcoming, key=lambda x: x.get('remind_at', ''))


@router.get("/{reminder_id}", response_model=schemas.Reminder)
def get_reminder(reminder_id: int):
    reminder = json_storage.get_by_id("reminders", reminder_id)
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    # Parse datetime strings back to datetime objects
    return _parse_reminder_dates(reminder)


@router.post("/", response_model=schemas.Reminder, status_code=201)
def create_reminder(reminder: schemas.ReminderCreate):
    reminder_data = reminder.model_dump()
    # Set is_completed to false for new reminders
    reminder_data['is_completed'] = False
    new_reminder = json_storage.create("reminders", reminder_data)
    # Parse datetime strings back to datetime objects
    return _parse_reminder_dates(new_reminder)


@router.put("/{reminder_id}", response_model=schemas.Reminder)
def update_reminder(reminder_id: int, reminder: schemas.ReminderUpdate):
    update_data = reminder.model_dump(exclude_unset=True)
    updated_reminder = json_storage.update("reminders", reminder_id, update_data)
    if not updated_reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    # Parse datetime strings back to datetime objects
    return _parse_reminder_dates(updated_reminder)


@router.delete("/{reminder_id}", status_code=204)
def delete_reminder(reminder_id: int):
    success = json_storage.delete("reminders", reminder_id)
    if not success:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return None
