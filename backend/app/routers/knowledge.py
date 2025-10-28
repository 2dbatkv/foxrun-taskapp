from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app import models, schemas
from app.database import get_db
from app.security import require_role
from app.models import AccessRole

router = APIRouter(
    prefix="/knowledge",
    tags=["knowledge"],
    dependencies=[Depends(require_role(AccessRole.MEMBER))],
)


@router.get("/", response_model=List[schemas.KnowledgeBase])
def get_knowledge_entries(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all knowledge base entries"""
    query = db.query(models.KnowledgeBase)

    if category:
        query = query.filter(models.KnowledgeBase.category == category)

    entries = query.offset(skip).limit(limit).all()
    return entries


@router.get("/search/{search_term}", response_model=List[schemas.KnowledgeBase])
def search_knowledge(search_term: str, db: Session = Depends(get_db)):
    """Search knowledge base entries by title or content"""
    entries = db.query(models.KnowledgeBase).filter(
        (models.KnowledgeBase.title.ilike(f"%{search_term}%")) |
        (models.KnowledgeBase.content.ilike(f"%{search_term}%"))
    ).all()
    return entries


@router.get("/{entry_id}", response_model=schemas.KnowledgeBase)
def get_knowledge_entry(entry_id: int, db: Session = Depends(get_db)):
    """Get a specific knowledge base entry by ID"""
    entry = db.query(models.KnowledgeBase).filter(models.KnowledgeBase.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Knowledge entry not found")
    return entry


@router.post("/", response_model=schemas.KnowledgeBase, status_code=201)
def create_knowledge_entry(entry: schemas.KnowledgeBaseCreate, db: Session = Depends(get_db)):
    """Create a new knowledge base entry"""
    db_entry = models.KnowledgeBase(**entry.model_dump())
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry


@router.put("/{entry_id}", response_model=schemas.KnowledgeBase)
def update_knowledge_entry(
    entry_id: int,
    entry: schemas.KnowledgeBaseUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing knowledge base entry"""
    db_entry = db.query(models.KnowledgeBase).filter(models.KnowledgeBase.id == entry_id).first()
    if not db_entry:
        raise HTTPException(status_code=404, detail="Knowledge entry not found")

    update_data = entry.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_entry, key, value)

    db.commit()
    db.refresh(db_entry)
    return db_entry


@router.delete("/{entry_id}", status_code=204)
def delete_knowledge_entry(entry_id: int, db: Session = Depends(get_db)):
    """Delete a knowledge base entry"""
    db_entry = db.query(models.KnowledgeBase).filter(models.KnowledgeBase.id == entry_id).first()
    if not db_entry:
        raise HTTPException(status_code=404, detail="Knowledge entry not found")

    db.delete(db_entry)
    db.commit()
    return None
