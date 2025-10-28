from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from app import models, schemas
from app.database import get_db
from app.security import require_role
from app.models import AccessRole

router = APIRouter(
    prefix="/calendar",
    tags=["calendar"],
    dependencies=[Depends(require_role(AccessRole.MEMBER))],
)


@router.get("/", response_model=List[schemas.CalendarEvent])
def get_events(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all calendar events"""
    events = db.query(models.CalendarEvent).offset(skip).limit(limit).all()
    return events


@router.get("/range", response_model=List[schemas.CalendarEvent])
def get_events_in_range(
    start: datetime,
    end: datetime,
    db: Session = Depends(get_db)
):
    """Get calendar events within a specific date range"""
    events = db.query(models.CalendarEvent).filter(
        models.CalendarEvent.start_time >= start,
        models.CalendarEvent.end_time <= end
    ).all()
    return events


@router.get("/{event_id}", response_model=schemas.CalendarEvent)
def get_event(event_id: int, db: Session = Depends(get_db)):
    """Get a specific calendar event by ID"""
    event = db.query(models.CalendarEvent).filter(models.CalendarEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.post("/", response_model=schemas.CalendarEvent, status_code=201)
def create_event(event: schemas.CalendarEventCreate, db: Session = Depends(get_db)):
    """Create a new calendar event"""
    db_event = models.CalendarEvent(**event.model_dump())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event


@router.put("/{event_id}", response_model=schemas.CalendarEvent)
def update_event(
    event_id: int,
    event: schemas.CalendarEventUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing calendar event"""
    db_event = db.query(models.CalendarEvent).filter(models.CalendarEvent.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")

    update_data = event.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_event, key, value)

    db.commit()
    db.refresh(db_event)
    return db_event


@router.delete("/{event_id}", status_code=204)
def delete_event(event_id: int, db: Session = Depends(get_db)):
    """Delete a calendar event"""
    db_event = db.query(models.CalendarEvent).filter(models.CalendarEvent.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")

    db.delete(db_event)
    db.commit()
    return None
