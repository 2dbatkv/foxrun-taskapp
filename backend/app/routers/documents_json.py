from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app import schemas
from app.services.json_storage import json_storage
from app.security import require_role
from app.models import AccessRole

router = APIRouter(
    prefix="/documents",
    tags=["documents"],
    dependencies=[Depends(require_role(AccessRole.MEMBER))],
)


@router.get("/", response_model=List[schemas.Document])
def get_documents(skip: int = 0, limit: int = 100, file_type: str = None):
    documents = json_storage.get_all("documents")
    if file_type:
        documents = [d for d in documents if d.get('file_type') == file_type]
    return documents[skip:skip + limit]


@router.get("/search/{search_term}", response_model=List[schemas.Document])
def search_documents(search_term: str):
    documents = json_storage.get_all("documents")
    search_term_lower = search_term.lower()
    results = [d for d in documents if
               search_term_lower in d.get('title', '').lower() or
               search_term_lower in d.get('description', '').lower()]
    return results


@router.get("/{document_id}", response_model=schemas.Document)
def get_document(document_id: int):
    document = json_storage.get_by_id("documents", document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return document


@router.post("/", response_model=schemas.Document, status_code=201)
def create_document(document: schemas.DocumentCreate):
    document_data = document.model_dump()
    new_document = json_storage.create("documents", document_data)
    return new_document


@router.put("/{document_id}", response_model=schemas.Document)
def update_document(document_id: int, document: schemas.DocumentUpdate):
    update_data = document.model_dump(exclude_unset=True)
    updated_document = json_storage.update("documents", document_id, update_data)
    if not updated_document:
        raise HTTPException(status_code=404, detail="Document not found")
    return updated_document


@router.delete("/{document_id}", status_code=204)
def delete_document(document_id: int):
    success = json_storage.delete("documents", document_id)
    if not success:
        raise HTTPException(status_code=404, detail="Document not found")
    return None
