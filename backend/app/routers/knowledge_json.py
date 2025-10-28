from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app import schemas
from app.services.json_storage import json_storage
from app.security import require_role
from app.models import AccessRole

router = APIRouter(
    prefix="/knowledge",
    tags=["knowledge"],
    dependencies=[Depends(require_role(AccessRole.MEMBER))],
)


@router.get("/", response_model=List[schemas.KnowledgeBase])
def get_knowledge_entries(skip: int = 0, limit: int = 100, category: str = None):
    entries = json_storage.get_all("knowledge")
    if category:
        entries = [e for e in entries if e.get('category') == category]
    return entries[skip:skip + limit]


@router.get("/search/{search_term}", response_model=List[schemas.KnowledgeBase])
def search_knowledge(search_term: str):
    entries = json_storage.get_all("knowledge")
    search_term_lower = search_term.lower()
    results = [e for e in entries if
               search_term_lower in e.get('title', '').lower() or
               search_term_lower in e.get('content', '').lower()]
    return results


@router.get("/{entry_id}", response_model=schemas.KnowledgeBase)
def get_knowledge_entry(entry_id: int):
    entry = json_storage.get_by_id("knowledge", entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Knowledge entry not found")
    return entry


@router.post("/", response_model=schemas.KnowledgeBase, status_code=201)
def create_knowledge_entry(entry: schemas.KnowledgeBaseCreate):
    entry_data = entry.model_dump()
    new_entry = json_storage.create("knowledge", entry_data)
    return new_entry


@router.put("/{entry_id}", response_model=schemas.KnowledgeBase)
def update_knowledge_entry(entry_id: int, entry: schemas.KnowledgeBaseUpdate):
    update_data = entry.model_dump(exclude_unset=True)
    updated_entry = json_storage.update("knowledge", entry_id, update_data)
    if not updated_entry:
        raise HTTPException(status_code=404, detail="Knowledge entry not found")
    return updated_entry


@router.delete("/{entry_id}", status_code=204)
def delete_knowledge_entry(entry_id: int):
    success = json_storage.delete("knowledge", entry_id)
    if not success:
        raise HTTPException(status_code=404, detail="Knowledge entry not found")
    return None
