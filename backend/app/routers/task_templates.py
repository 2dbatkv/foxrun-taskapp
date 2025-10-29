from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.json_storage import json_storage


router = APIRouter(
    prefix="/task-templates",
    tags=["task-templates"],
)


class TaskTemplate(BaseModel):
    id: int | None = None
    title: str
    description: str | None = None
    priority: str
    time_to_complete_minutes: int
    category: str


@router.get("/", response_model=Dict[str, List[Dict[str, Any]]])
def get_all_templates():
    """Get all task templates"""
    templates = json_storage.get_all("task_templates")
    return {"templates": templates}


@router.get("/{template_id}", response_model=TaskTemplate)
def get_template(template_id: int):
    """Get a specific task template by ID"""
    template = json_storage.get_by_id("task_templates", template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template


@router.post("/", response_model=TaskTemplate)
def create_template(template: TaskTemplate):
    """Create a new task template"""
    template_dict = template.model_dump(exclude_unset=True)
    created = json_storage.create("task_templates", template_dict)
    return created


@router.put("/{template_id}", response_model=TaskTemplate)
def update_template(template_id: int, template: TaskTemplate):
    """Update a task template"""
    template_dict = template.model_dump(exclude_unset=True)
    updated = json_storage.update("task_templates", template_id, template_dict)
    if not updated:
        raise HTTPException(status_code=404, detail="Template not found")
    return updated


@router.delete("/{template_id}")
def delete_template(template_id: int):
    """Delete a task template"""
    success = json_storage.delete("task_templates", template_id)
    if not success:
        raise HTTPException(status_code=404, detail="Template not found")
    return {"message": "Template deleted successfully"}


@router.post("/bulk-import", response_model=Dict[str, Any])
def bulk_import_templates(data: Dict[str, List[Dict[str, Any]]]):
    """Bulk import task templates"""
    if "templates" not in data:
        raise HTTPException(status_code=400, detail="Invalid data format. Expected 'templates' key.")

    templates = data["templates"]
    imported_count = 0

    for template_data in templates:
        try:
            json_storage.create("task_templates", template_data)
            imported_count += 1
        except Exception as e:
            print(f"Error importing template: {e}")
            continue

    return {
        "message": f"Successfully imported {imported_count} templates",
        "count": imported_count
    }
