from fastapi import APIRouter, Depends, HTTPException
from typing import List
from datetime import datetime
from app import schemas
from app.services.json_storage import json_storage
from app.security import require_role
from app.models import AccessRole

router = APIRouter(
    prefix="/tasks",
    tags=["tasks"],
    dependencies=[Depends(require_role(AccessRole.MEMBER))],
)


@router.get("/", response_model=List[schemas.Task])
def get_tasks(skip: int = 0, limit: int = 100, include_archived: bool = False):
    """Get all tasks from JSON (excluding archived by default)"""
    tasks = json_storage.get_all("tasks")

    # Filter out archived tasks unless specifically requested
    if not include_archived:
        tasks = [t for t in tasks if not t.get('is_archived', False)]

    return tasks[skip:skip + limit]


@router.get("/archived", response_model=List[schemas.Task])
def get_archived_tasks(skip: int = 0, limit: int = 100):
    """Get only archived tasks"""
    tasks = json_storage.get_all("tasks")
    archived_tasks = [t for t in tasks if t.get('is_archived', False)]
    return archived_tasks[skip:skip + limit]


@router.get("/{task_id}", response_model=schemas.Task)
def get_task(task_id: int):
    """Get a specific task by ID"""
    task = json_storage.get_by_id("tasks", task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.post("/", response_model=schemas.Task, status_code=201)
def create_task(task: schemas.TaskCreate):
    """Create a new task"""
    task_data = task.model_dump()
    new_task = json_storage.create("tasks", task_data)
    return new_task


@router.put("/{task_id}", response_model=schemas.Task)
def update_task(task_id: int, task: schemas.TaskUpdate):
    """Update an existing task"""
    update_data = task.model_dump(exclude_unset=True)

    # If status is being changed to completed, set completed_at
    if "status" in update_data and update_data["status"] == "completed":
        update_data["completed_at"] = datetime.utcnow().isoformat()

    updated_task = json_storage.update("tasks", task_id, update_data)
    if not updated_task:
        raise HTTPException(status_code=404, detail="Task not found")

    return updated_task


@router.patch("/{task_id}/archive", response_model=schemas.Task)
def archive_task(task_id: int):
    """Archive a task"""
    updated_task = json_storage.update("tasks", task_id, {"is_archived": True})
    if not updated_task:
        raise HTTPException(status_code=404, detail="Task not found")
    return updated_task


@router.patch("/{task_id}/unarchive", response_model=schemas.Task)
def unarchive_task(task_id: int):
    """Unarchive a task"""
    updated_task = json_storage.update("tasks", task_id, {"is_archived": False})
    if not updated_task:
        raise HTTPException(status_code=404, detail="Task not found")
    return updated_task


@router.delete("/{task_id}", status_code=204)
def delete_task(task_id: int):
    """Delete a task"""
    success = json_storage.delete("tasks", task_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    return None
