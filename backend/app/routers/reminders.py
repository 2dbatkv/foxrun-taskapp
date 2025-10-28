from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app import models, schemas
from app.database import get_db
from app.security import require_role
from app.models import AccessRole

router = APIRouter(
    prefix="/reminders",
    tags=["reminders"],
    dependencies=[Depends(require_role(AccessRole.MEMBER))],
)


@router.get("/", response_model=List[schemas.Reminder])
def get_reminders(
    skip: int = 0,
    limit: int = 100,
    active_only: bool = False,
    db: Session = Depends(get_db)
):
    """Get all reminders"""
    query = db.query(models.Reminder)

    if active_only:
        query = query.filter(
            models.Reminder.is_active == True,
            models.Reminder.is_completed == False
        )

    reminders = query.offset(skip).limit(limit).all()
    return reminders


@router.get("/upcoming", response_model=List[schemas.Reminder])
def get_upcoming_reminders(db: Session = Depends(get_db)):
    """Get upcoming active reminders"""
    now = datetime.utcnow()
    reminders = db.query(models.Reminder).filter(
        models.Reminder.is_active == True,
        models.Reminder.is_completed == False,
        models.Reminder.remind_at >= now
    ).order_by(models.Reminder.remind_at).all()
    return reminders


@router.get("/{reminder_id}", response_model=schemas.Reminder)
def get_reminder(reminder_id: int, db: Session = Depends(get_db)):
    """Get a specific reminder by ID"""
    reminder = db.query(models.Reminder).filter(models.Reminder.id == reminder_id).first()
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return reminder


@router.post("/", response_model=schemas.Reminder, status_code=201)
def create_reminder(reminder: schemas.ReminderCreate, db: Session = Depends(get_db)):
    """Create a new reminder"""
    db_reminder = models.Reminder(**reminder.model_dump())
    db.add(db_reminder)
    db.commit()
    db.refresh(db_reminder)
    return db_reminder


@router.put("/{reminder_id}", response_model=schemas.Reminder)
def update_reminder(
    reminder_id: int,
    reminder: schemas.ReminderUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing reminder"""
    db_reminder = db.query(models.Reminder).filter(models.Reminder.id == reminder_id).first()
    if not db_reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")

    update_data = reminder.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_reminder, key, value)

    db.commit()
    db.refresh(db_reminder)
    return db_reminder


@router.delete("/{reminder_id}", status_code=204)
def delete_reminder(reminder_id: int, db: Session = Depends(get_db)):
    """Delete a reminder"""
    db_reminder = db.query(models.Reminder).filter(models.Reminder.id == reminder_id).first()
    if not db_reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")

    db.delete(db_reminder)
    db.commit()
    return None
