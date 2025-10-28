from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app import models, schemas
from app.database import get_db
from app.security import require_role
from app.models import AccessRole

router = APIRouter(
    prefix="/documents",
    tags=["documents"],
    dependencies=[Depends(require_role(AccessRole.MEMBER))],
)


@router.get("/", response_model=List[schemas.Document])
def get_documents(
    skip: int = 0,
    limit: int = 100,
    file_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all documents"""
    query = db.query(models.Document)

    if file_type:
        query = query.filter(models.Document.file_type == file_type)

    documents = query.offset(skip).limit(limit).all()
    return documents


@router.get("/search/{search_term}", response_model=List[schemas.Document])
def search_documents(search_term: str, db: Session = Depends(get_db)):
    """Search documents by title or description"""
    documents = db.query(models.Document).filter(
        (models.Document.title.ilike(f"%{search_term}%")) |
        (models.Document.description.ilike(f"%{search_term}%"))
    ).all()
    return documents


@router.get("/{document_id}", response_model=schemas.Document)
def get_document(document_id: int, db: Session = Depends(get_db)):
    """Get a specific document by ID"""
    document = db.query(models.Document).filter(models.Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return document


@router.post("/", response_model=schemas.Document, status_code=201)
def create_document(document: schemas.DocumentCreate, db: Session = Depends(get_db)):
    """Create a new document reference"""
    db_document = models.Document(**document.model_dump())
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    return db_document


@router.put("/{document_id}", response_model=schemas.Document)
def update_document(
    document_id: int,
    document: schemas.DocumentUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing document"""
    db_document = db.query(models.Document).filter(models.Document.id == document_id).first()
    if not db_document:
        raise HTTPException(status_code=404, detail="Document not found")

    update_data = document.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_document, key, value)

    db.commit()
    db.refresh(db_document)
    return db_document


@router.delete("/{document_id}", status_code=204)
def delete_document(document_id: int, db: Session = Depends(get_db)):
    """Delete a document"""
    db_document = db.query(models.Document).filter(models.Document.id == document_id).first()
    if not db_document:
        raise HTTPException(status_code=404, detail="Document not found")

    db.delete(db_document)
    db.commit()
    return None
