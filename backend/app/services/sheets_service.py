"""
Google Sheets Service for Fox Run Task Tracker
Handles reading and writing tasks to/from Google Sheets
"""

import gspread
import json
import os
from google.oauth2.service_account import Credentials
from typing import List, Dict, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

# User mapping: Google Sheet names → Access code labels
USER_MAPPING = {
    'Aaron': 'AJB - Admin (9553AJB)',
    'Rai': 'RFB - Admin (9566RFB)',
    'Sam': 'SAM - Member (9127SAM)',
    'Samuel': 'SAM - Member (9127SAM)',  # Alias
    'ZB': 'ZBB - Member (1112ZBB)',
    'Zach': 'ZBB - Member (1112ZBB)',  # Alias
    'TB': 'TBB - Member (7226TBB)',
    'Tyler': 'TBB - Member (7226TBB)',  # Alias
    'Aur': 'AUR - Member (9807AUR)',
    'Aurora': 'AUR - Member (9807AUR)',  # Alias
}

# Reverse mapping: Access code labels → Short names for Sheet
REVERSE_USER_MAPPING = {v: k for k, v in USER_MAPPING.items() if k in ['Aaron', 'Rai', 'Sam', 'ZB', 'TB', 'Aur']}


class SheetsService:
    """Service for interacting with Google Sheets"""

    def __init__(self):
        """Initialize Google Sheets client with service account credentials"""
        try:
            # Load credentials from environment variable
            creds_json_str = os.getenv('GOOGLE_SERVICE_ACCOUNT_JSON')
            if not creds_json_str:
                raise ValueError("GOOGLE_SERVICE_ACCOUNT_JSON environment variable not set")

            creds_json = json.loads(creds_json_str)

            # Create credentials
            self.creds = Credentials.from_service_account_info(
                creds_json,
                scopes=[
                    'https://www.googleapis.com/auth/spreadsheets',
                    'https://www.googleapis.com/auth/drive.file'
                ]
            )

            # Authorize client
            self.client = gspread.authorize(self.creds)

            # Get sheet ID from environment
            self.sheet_id = os.getenv('GOOGLE_SHEET_ID')
            if not self.sheet_id:
                raise ValueError("GOOGLE_SHEET_ID environment variable not set")

            # Open the worksheet
            self.spreadsheet = self.client.open_by_key(self.sheet_id)
            self.worksheet = self.spreadsheet.sheet1

            logger.info("Google Sheets service initialized successfully")

        except Exception as e:
            logger.error(f"Failed to initialize Google Sheets service: {e}")
            raise

    def _map_user_to_label(self, sheet_name: str) -> Optional[str]:
        """Convert Google Sheet assignee name to access code label"""
        return USER_MAPPING.get(sheet_name)

    def _map_label_to_user(self, label: str) -> Optional[str]:
        """Convert access code label to Google Sheet name"""
        return REVERSE_USER_MAPPING.get(label)

    def _parse_due_date(self, date_str: str) -> Optional[str]:
        """Parse date from Google Sheet and convert to ISO format"""
        if not date_str or date_str.strip() == '':
            return None

        try:
            # Try MM/DD/YYYY format
            dt = datetime.strptime(date_str, '%m/%d/%Y')
            return dt.isoformat()
        except ValueError:
            try:
                # Try YYYY-MM-DD format
                dt = datetime.strptime(date_str, '%Y-%m-%d')
                return dt.isoformat()
            except ValueError:
                # Return as-is if parsing fails
                return date_str

    def get_assigned_tasks(self, assignee_label: str = None) -> List[Dict]:
        """
        Read tasks from Google Sheet

        Args:
            assignee_label: Access code label (e.g., 'AJB - Admin (9553AJB)')
                          If None, returns all tasks

        Returns:
            List of task dictionaries
        """
        try:
            # Get all records (skips header row automatically)
            rows = self.worksheet.get_all_records()

            tasks = []
            for row in rows:
                # Skip rows without a title
                if not row.get('Title') or str(row.get('Title')).strip() == '':
                    continue

                # Skip completed tasks (optional - you can remove this to show all)
                # if str(row.get('Status', '')).lower() == 'completed':
                #     continue

                # Get assignee from sheet
                sheet_assignee = str(row.get('Assignee', '')).strip()

                # Map to access code label
                task_assignee_label = self._map_user_to_label(sheet_assignee)

                # Filter by assignee if specified
                if assignee_label and task_assignee_label != assignee_label:
                    continue

                # Build task object
                task = {
                    'id': row.get('Task ID', ''),  # Use Task ID as primary identifier
                    'title': str(row.get('Title', '')).strip(),
                    'description': str(row.get('Description', '')).strip(),
                    'assignee': sheet_assignee,  # Original name from sheet
                    'priority': str(row.get('Priority', 'medium')).lower(),
                    'due_date': self._parse_due_date(str(row.get('Due Date', ''))),
                    'status': str(row.get('Status', 'todo')).lower(),
                    'time_to_complete_minutes': int(row.get('Time (minutes)', 60)) if row.get('Time (minutes)') else 60,
                    'completed_at': self._parse_due_date(str(row.get('Completed Date', ''))),
                    'is_archived': False,  # Google Sheet tasks are never archived
                    'created_at': self._parse_due_date(str(row.get('Created Date', ''))),
                    'updated_at': datetime.utcnow().isoformat(),
                }

                tasks.append(task)

            logger.info(f"Retrieved {len(tasks)} tasks from Google Sheet" +
                       (f" for {assignee_label}" if assignee_label else ""))

            return tasks

        except Exception as e:
            logger.error(f"Error reading tasks from Google Sheet: {e}")
            raise

    def mark_completed(self, task_id: str, completed_by_label: str) -> bool:
        """
        Mark a task as completed in Google Sheet

        Args:
            task_id: Task ID (e.g., 'FR-001')
            completed_by_label: Access code label of user completing task

        Returns:
            True if successful, False otherwise
        """
        try:
            # Find the cell with the Task ID
            cell = self.worksheet.find(task_id, in_column=1)  # Column A = Task ID

            if not cell:
                logger.warning(f"Task {task_id} not found in Google Sheet")
                return False

            row_num = cell.row

            # Get current date
            now = datetime.now().strftime('%m/%d/%Y')

            # Map label to short name
            completed_by_name = self._map_label_to_user(completed_by_label)
            if not completed_by_name:
                # Use the label as-is if mapping fails
                completed_by_name = completed_by_label

            # Update columns in batch for efficiency
            # G = Status, H = Completed Date, I = Completed By
            updates = [
                {
                    'range': f'G{row_num}',
                    'values': [['completed']]
                },
                {
                    'range': f'H{row_num}',
                    'values': [[now]]
                },
                {
                    'range': f'I{row_num}',
                    'values': [[completed_by_name]]
                }
            ]

            self.worksheet.batch_update(updates)

            logger.info(f"Task {task_id} marked complete by {completed_by_name}")
            return True

        except Exception as e:
            logger.error(f"Error marking task {task_id} complete: {e}")
            raise

    def get_task_by_id(self, task_id: str) -> Optional[Dict]:
        """
        Get a specific task by Task ID

        Args:
            task_id: Task ID (e.g., 'FR-001')

        Returns:
            Task dictionary or None if not found
        """
        try:
            # Find the task
            cell = self.worksheet.find(task_id, in_column=1)

            if not cell:
                return None

            # Get the entire row
            row_values = self.worksheet.row_values(cell.row)

            # Map to task structure (assuming column order from GOOGLE-SHEET-ZAPIER-INTEGRATION.md)
            if len(row_values) < 10:
                return None

            task = {
                'id': row_values[0],  # Task ID
                'title': row_values[1],  # Title
                'description': row_values[2],  # Description
                'assignee': row_values[3],  # Assignee
                'priority': row_values[4].lower() if len(row_values) > 4 else 'medium',
                'due_date': self._parse_due_date(row_values[5]) if len(row_values) > 5 else None,
                'status': row_values[6].lower() if len(row_values) > 6 else 'todo',
                'completed_at': self._parse_due_date(row_values[7]) if len(row_values) > 7 else None,
                'time_to_complete_minutes': int(row_values[9]) if len(row_values) > 9 and row_values[9] else 60,
                'is_archived': False,
                'created_at': self._parse_due_date(row_values[10]) if len(row_values) > 10 else None,
                'updated_at': datetime.utcnow().isoformat(),
            }

            return task

        except Exception as e:
            logger.error(f"Error getting task {task_id}: {e}")
            return None

    def refresh_connection(self):
        """Refresh the Google Sheets connection (useful for long-running servers)"""
        try:
            self.client = gspread.authorize(self.creds)
            self.spreadsheet = self.client.open_by_key(self.sheet_id)
            self.worksheet = self.spreadsheet.sheet1
            logger.info("Google Sheets connection refreshed")
        except Exception as e:
            logger.error(f"Error refreshing connection: {e}")
            raise


# Create singleton instance (will be initialized when module is imported)
try:
    sheets_service = SheetsService()
except Exception as e:
    logger.warning(f"Could not initialize Google Sheets service: {e}")
    logger.warning("Tasks will fall back to JSON storage if available")
    sheets_service = None
