from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app import schemas
from app.services.json_storage import json_storage
from app.security import require_role
from app.models import AccessRole

router = APIRouter(
    prefix="/calendar",
    tags=["calendar"],
    dependencies=[Depends(require_role(AccessRole.MEMBER))],
)


@router.get("/", response_model=List[schemas.CalendarEvent])
def get_events(skip: int = 0, limit: int = 100):
    events = json_storage.get_all("calendar")
    return events[skip:skip + limit]


@router.get("/{event_id}", response_model=schemas.CalendarEvent)
def get_event(event_id: int):
    event = json_storage.get_by_id("calendar", event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.post("/", response_model=schemas.CalendarEvent, status_code=201)
def create_event(event: schemas.CalendarEventCreate):
    event_data = event.model_dump()
    new_event = json_storage.create("calendar", event_data)
    return new_event


@router.put("/{event_id}", response_model=schemas.CalendarEvent)
def update_event(event_id: int, event: schemas.CalendarEventUpdate):
    update_data = event.model_dump(exclude_unset=True)
    updated_event = json_storage.update("calendar", event_id, update_data)
    if not updated_event:
        raise HTTPException(status_code=404, detail="Event not found")
    return updated_event


@router.delete("/{event_id}", status_code=204)
def delete_event(event_id: int):
    success = json_storage.delete("calendar", event_id)
    if not success:
        raise HTTPException(status_code=404, detail="Event not found")
    return None
