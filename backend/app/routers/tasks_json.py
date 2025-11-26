from fastapi import APIRouter, Depends, HTTPException
from typing import List
from datetime import datetime
from app import schemas
from app.services.json_storage import json_storage
from app.services.sheets_service import sheets_service
from app.security import require_role, get_current_user
from app.models import AccessRole
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/tasks",
    tags=["tasks"],
    dependencies=[Depends(require_role(AccessRole.MEMBER))],
)


@router.get("/", response_model=List[dict])
def get_tasks(
    skip: int = 0,
    limit: int = 100,
    include_archived: bool = False,
    current_user: dict = Depends(get_current_user)
):
    """
    Get tasks assigned to current user from Google Sheet
    Admins can see all tasks or toggle to see only their tasks
    Members see only their assigned tasks
    """
    try:
        # Check if Google Sheets service is available
        if sheets_service is None:
            logger.warning("Google Sheets service not available, falling back to JSON storage")
            tasks = json_storage.get_all("tasks")
            if not include_archived:
                tasks = [t for t in tasks if not t.get('is_archived', False)]
            return tasks[skip:skip + limit]

        # Get user info
        user_label = current_user.get('label')  # e.g., 'AJB - Admin (9553AJB)'
        user_role = current_user.get('role')    # 'admin' or 'member'

        # Admins see all tasks by default (can be filtered in frontend)
        # Members see only their assigned tasks
        if user_role == 'admin':
            tasks = sheets_service.get_assigned_tasks()  # All tasks
            logger.info(f"Admin {user_label} retrieved all tasks from Google Sheet")
        else:
            tasks = sheets_service.get_assigned_tasks(assignee_label=user_label)
            logger.info(f"Member {user_label} retrieved their assigned tasks from Google Sheet")

        # Apply pagination
        return tasks[skip:skip + limit]

    except Exception as e:
        logger.error(f"Error getting tasks from Google Sheet: {e}")
        # Fallback to JSON storage
        logger.info("Falling back to JSON storage due to error")
        tasks = json_storage.get_all("tasks")
        if not include_archived:
            tasks = [t for t in tasks if not t.get('is_archived', False)]
        return tasks[skip:skip + limit]


@router.get("/archived", response_model=List[dict])
def get_archived_tasks(skip: int = 0, limit: int = 100):
    """
    Get only archived tasks
    Note: Google Sheet doesn't have archived tasks, so this always uses JSON storage
    """
    tasks = json_storage.get_all("tasks")
    archived_tasks = [t for t in tasks if t.get('is_archived', False)]
    return archived_tasks[skip:skip + limit]


@router.get("/{task_id}")
def get_task(task_id: str, current_user: dict = Depends(get_current_user)):
    """
    Get a specific task by ID
    Supports both numeric IDs (JSON) and string IDs (Google Sheets like 'FR-001')
    """
    try:
        # Try Google Sheets first (if task_id looks like 'FR-XXX')
        if isinstance(task_id, str) and task_id.startswith('FR-'):
            if sheets_service:
                task = sheets_service.get_task_by_id(task_id)
                if task:
                    return task

        # Try JSON storage (numeric ID)
        try:
            numeric_id = int(task_id)
            task = json_storage.get_by_id("tasks", numeric_id)
            if task:
                return task
        except ValueError:
            pass  # Not a numeric ID

        raise HTTPException(status_code=404, detail="Task not found")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting task {task_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Error retrieving task: {str(e)}")


@router.post("/", response_model=schemas.Task, status_code=201)
def create_task(task: schemas.TaskCreate):
    """
    Create a new task in JSON storage
    Note: New tasks should be added to Google Sheet by admins
    This endpoint is kept for backward compatibility
    """
    logger.warning("Task created via API - should be added to Google Sheet instead")
    task_data = task.model_dump()
    new_task = json_storage.create("tasks", task_data)
    return new_task


@router.put("/{task_id}/complete")
def complete_task(task_id: str, current_user: dict = Depends(get_current_user)):
    """
    Mark a task as complete in Google Sheet
    This is the primary endpoint for task completion
    """
    try:
        if not sheets_service:
            raise HTTPException(
                status_code=503,
                detail="Google Sheets service not available"
            )

        # Get user info
        completed_by_label = current_user.get('label')

        # Mark task complete in Google Sheet
        success = sheets_service.mark_completed(task_id, completed_by_label)

        if not success:
            raise HTTPException(status_code=404, detail=f"Task {task_id} not found in Google Sheet")

        return {
            "status": "success",
            "message": f"Task {task_id} marked complete",
            "task_id": task_id,
            "completed_by": completed_by_label
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error marking task {task_id} complete: {e}")
        raise HTTPException(status_code=500, detail=f"Error completing task: {str(e)}")


@router.put("/{task_id}", response_model=schemas.Task)
def update_task(task_id: int, task: schemas.TaskUpdate):
    """
    Update an existing task in JSON storage
    Note: Tasks in Google Sheet should be updated there
    This is for backward compatibility with JSON tasks
    """
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
    """
    Archive a task in JSON storage
    Note: Google Sheet tasks are not archived
    """
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
    """
    Delete a task from JSON storage
    Note: Google Sheet tasks should be deleted in the Sheet
    """
    success = json_storage.delete("tasks", task_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    return None
