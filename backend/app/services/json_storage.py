import json
import os
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime

# JSON file paths - can be configured via environment variable
JSON_DATA_DIR = os.getenv('JSON_DATA_DIR', '/home/ajbir/task-planner-app/data')

class JSONStorage:
    """Service for reading and writing to JSON files"""

    def __init__(self, data_dir: str = JSON_DATA_DIR):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)

    def _get_file_path(self, entity: str) -> Path:
        """Get the file path for a given entity"""
        return self.data_dir / f"{entity}.json"

    def _read_json(self, entity: str) -> Dict[str, List[Dict[str, Any]]]:
        """Read JSON file"""
        file_path = self._get_file_path(entity)
        if not file_path.exists():
            return {entity: []}

        try:
            with open(file_path, 'r') as f:
                return json.load(f)
        except json.JSONDecodeError:
            return {entity: []}

    def _write_json(self, entity: str, data: Dict[str, List[Dict[str, Any]]]):
        """Write JSON file"""
        file_path = self._get_file_path(entity)
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=2, default=str)

    def get_all(self, entity: str) -> List[Dict[str, Any]]:
        """Get all items for an entity"""
        data = self._read_json(entity)
        return data.get(entity, [])

    def get_by_id(self, entity: str, item_id: int) -> Optional[Dict[str, Any]]:
        """Get a specific item by ID"""
        items = self.get_all(entity)
        for item in items:
            if item.get('id') == item_id:
                return item
        return None

    def create(self, entity: str, item: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new item"""
        data = self._read_json(entity)
        items = data.get(entity, [])

        # Generate new ID
        max_id = max([i.get('id', 0) for i in items]) if items else 0
        item['id'] = max_id + 1

        # Add timestamps
        now = datetime.utcnow().isoformat()
        item['created_at'] = now
        item['updated_at'] = now

        items.append(item)
        data[entity] = items
        self._write_json(entity, data)

        return item

    def update(self, entity: str, item_id: int, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update an existing item"""
        data = self._read_json(entity)
        items = data.get(entity, [])

        for i, item in enumerate(items):
            if item.get('id') == item_id:
                # Update fields
                items[i].update(updates)
                items[i]['updated_at'] = datetime.utcnow().isoformat()

                data[entity] = items
                self._write_json(entity, data)

                return items[i]

        return None

    def delete(self, entity: str, item_id: int) -> bool:
        """Delete an item"""
        data = self._read_json(entity)
        items = data.get(entity, [])

        original_length = len(items)
        items = [item for item in items if item.get('id') != item_id]

        if len(items) < original_length:
            data[entity] = items
            self._write_json(entity, data)
            return True

        return False


# Create a singleton instance
json_storage = JSONStorage()
