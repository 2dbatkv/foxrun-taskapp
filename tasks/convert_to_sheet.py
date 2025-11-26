#!/usr/bin/env python3
"""
Convert FoxRunComprehensiveTaskList.md to Google Sheet CSV format
Output matches structure in GOOGLE-SHEET-ZAPIER-INTEGRATION.md
"""

import re
import csv
from datetime import datetime, timedelta

# Read the markdown file
with open('/home/ajbir/task-planner-app/tasks/FoxRunComprehensiveTaskList.md', 'r') as f:
    content = f.read()

# Parse tasks
tasks = []
current_category = None
task_blocks = content.split('+-----------------------------------------------+')

for block in task_blocks:
    block = block.strip()
    if not block:
        continue

    # Check if this is a category header
    if block.startswith('##'):
        current_category = block.replace('##', '').strip()
        continue

    # Parse task information
    if '| Task:' in block:
        lines = [line.strip() for line in block.split('\n') if line.strip() and line.strip() != '|']

        task_title = None
        location = None
        category = None
        instructions = None

        for line in lines:
            if line.startswith('| Task:'):
                task_title = line.replace('| Task:', '').strip().rstrip('|').strip()
            elif line.startswith('| Location:'):
                location = line.replace('| Location:', '').strip().rstrip('|').strip()
            elif line.startswith('| Category:'):
                category = line.replace('| Category:', '').strip().rstrip('|').strip()
            elif line.startswith('| Instructions:'):
                instructions = line.replace('| Instructions:', '').strip().rstrip('|').strip()

        if task_title:
            # Build description from location and instructions
            description_parts = []
            if location:
                description_parts.append(f"Location: {location}")
            if instructions and instructions != "If you don't know how, ask.":
                description_parts.append(instructions)
            description = "; ".join(description_parts) if description_parts else ""

            # Determine priority based on category
            if category == 'Daily':
                priority = 'high'
                time_estimate = 30  # 30 minutes for daily tasks
            elif category == 'Weekly':
                priority = 'medium'
                time_estimate = 60  # 1 hour for weekly tasks
            elif category == 'Monthly':
                priority = 'low'
                time_estimate = 90  # 1.5 hours for monthly tasks
            elif category == 'Seasonal':
                priority = 'low'
                time_estimate = 120  # 2 hours for seasonal tasks
            else:
                priority = 'medium'
                time_estimate = 60

            # Special cases for longer tasks
            if 'deep clean' in task_title.lower() or 'organize' in task_title.lower():
                time_estimate = time_estimate * 1.5
            if 'work a full workday' in task_title.lower():
                time_estimate = 480  # 8 hours
            if 'work a partial workday' in task_title.lower():
                time_estimate = 240  # 4 hours

            # Leave assignee blank - will be filled in Google Sheet
            # Leave due date blank - will be assigned by admins

            tasks.append({
                'title': task_title,
                'description': description,
                'assignee': '',  # Empty - to be assigned
                'priority': priority,
                'due_date': '',  # Empty - to be assigned
                'status': 'todo',
                'completed_date': '',
                'completed_by': '',
                'time_minutes': int(time_estimate),
                'created_date': '',  # Will use formula in Sheet
                'created_by': ''  # Empty - to be assigned
            })

# Write to CSV matching Google Sheet columns
# Column order: Task ID (skip - formula in sheet), Title, Description, Assignee,
#               Priority, Due Date, Status, Completed Date, Completed By,
#               Time (minutes), Created Date (skip - formula), Created By

output_file = '/home/ajbir/task-planner-app/tasks/FoxRunTasks_Import.csv'

with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
    # Column headers (excluding Task ID and Created Date which use formulas)
    fieldnames = [
        'Title',
        'Description',
        'Assignee',
        'Priority',
        'Due Date',
        'Status',
        'Completed Date',
        'Completed By',
        'Time (minutes)',
        'Created By'
    ]

    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    writer.writeheader()

    for task in tasks:
        writer.writerow({
            'Title': task['title'],
            'Description': task['description'],
            'Assignee': task['assignee'],
            'Priority': task['priority'],
            'Due Date': task['due_date'],
            'Status': task['status'],
            'Completed Date': task['completed_date'],
            'Completed By': task['completed_by'],
            'Time (minutes)': task['time_minutes'],
            'Created By': task['created_by']
        })

print(f"✅ Converted {len(tasks)} tasks")
print(f"📄 Output file: {output_file}")
print(f"\nNext steps:")
print(f"1. Open your Google Sheet")
print(f"2. In Column B (Title), paste the Title column from the CSV")
print(f"3. Continue pasting columns C through L")
print(f"4. Column A (Task ID) will auto-fill with formula: =\\\"FR-\\\" & TEXT(ROW()-1, \\\"000\\\")")
print(f"5. Column K (Created Date) will auto-fill with formula: =IF(B2<>\\\"\\\", TODAY(), \\\"\\\")")
