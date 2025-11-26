#!/usr/bin/env python3
"""
Merge tasks from HouseholdTasks.txt and DailyTasks.csv with existing FoxRunTasks_Import.csv
Remove duplicates and create consolidated task list
"""

import csv
import re
from typing import List, Dict, Set

def normalize_task_title(title: str) -> str:
    """Normalize task title for comparison (lowercase, remove punctuation, extra spaces)"""
    normalized = title.lower()
    normalized = re.sub(r'[^\w\s]', '', normalized)  # Remove punctuation
    normalized = re.sub(r'\s+', ' ', normalized)  # Normalize spaces
    return normalized.strip()

def extract_location(text: str) -> str:
    """Extract location from parentheses in task description"""
    match = re.search(r'\(([^)]+)\)', text)
    return match.group(1) if match else ""

# Read existing tasks
existing_tasks = []
existing_titles = set()

with open('FoxRunTasks_Import.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        existing_tasks.append(row)
        existing_titles.add(normalize_task_title(row['Title']))

print(f"📋 Loaded {len(existing_tasks)} existing tasks")

# Parse HouseholdTasks.txt
new_tasks = []
household_count = 0

with open('HouseholdTasks.txt', 'r', encoding='utf-8') as f:
    content = f.read()
    lines = content.split('\n')

    for line in lines:
        line = line.strip()
        if not line or 'Completed by:' not in line:
            continue

        # Extract task and location
        parts = line.split('Completed by:')[0].strip()
        if not parts:
            continue

        # Check if it has location in parentheses
        location = extract_location(parts)
        title = re.sub(r'\([^)]+\)', '', parts).strip()

        if not title or len(title) < 3:
            continue

        # Check for duplicates
        normalized = normalize_task_title(title)
        if normalized in existing_titles:
            continue

        # Categorize and assign priority based on keywords
        priority = 'medium'
        time_estimate = 60

        # Specific task classifications
        if any(word in title.lower() for word in ['attic', 'drywall', 'fix', 'repair', 'maintenance']):
            priority = 'medium'
            time_estimate = 120
        elif 'vehicle insurance' in title.lower() or 'taxes' in title.lower():
            priority = 'high'
            time_estimate = 90
        elif 'clean' in title.lower():
            priority = 'medium'
            time_estimate = 45

        new_tasks.append({
            'Title': title,
            'Description': f"Location: {location}" if location else "",
            'Assignee': '',
            'Priority': priority,
            'Due Date': '',
            'Status': 'todo',
            'Completed Date': '',
            'Completed By': '',
            'Time (minutes)': time_estimate,
            'Created By': ''
        })
        existing_titles.add(normalized)
        household_count += 1

print(f"✅ Added {household_count} unique tasks from HouseholdTasks.txt")

# Parse DailyTasks.csv
daily_count = 0

with open('DailyTasks.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)

    for row in reader:
        task = row.get('Task', '').strip()
        if not task or len(task) < 3:
            continue

        # Skip very specific one-time tasks
        skip_keywords = [
            'ferguson', 'sinkhole', 'wallace', 'gromit',
            '17:00', '18:00', '2025-', 'draft', 'springs',
            'ball room'
        ]
        if any(keyword in task.lower() for keyword in skip_keywords):
            continue

        # Normalize and check for duplicates
        normalized = normalize_task_title(task)
        if normalized in existing_titles:
            continue

        # Extract location if mentioned
        location = extract_location(task)
        clean_title = re.sub(r'\([^)]+\)', '', task).strip()

        # Categorize priority
        priority = 'medium'
        time_estimate = 60

        if 'work a full day' in clean_title.lower():
            priority = 'high'
            time_estimate = 480
        elif any(word in clean_title.lower() for word in ['appointment', 'doctor', 'health']):
            priority = 'high'
            time_estimate = 120
        elif 'clean' in clean_title.lower() or 'wash' in clean_title.lower():
            priority = 'medium'
            time_estimate = 45
        elif 'organize' in clean_title.lower() or 'sort' in clean_title.lower():
            priority = 'low'
            time_estimate = 90

        new_tasks.append({
            'Title': clean_title,
            'Description': f"Location: {location}" if location else "",
            'Assignee': '',
            'Priority': priority,
            'Due Date': '',
            'Status': 'todo',
            'Completed Date': '',
            'Completed By': '',
            'Time (minutes)': time_estimate,
            'Created By': ''
        })
        existing_titles.add(normalized)
        daily_count += 1

print(f"✅ Added {daily_count} unique tasks from DailyTasks.csv")

# Combine all tasks
all_tasks = existing_tasks + new_tasks

# Write consolidated CSV
output_file = 'FoxRunTasks_Import.csv'
with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
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
    writer.writerows(all_tasks)

print(f"\n📊 Total tasks in consolidated file: {len(all_tasks)}")
print(f"   - Original: {len(existing_tasks)}")
print(f"   - From HouseholdTasks.txt: {household_count}")
print(f"   - From DailyTasks.csv: {daily_count}")
print(f"\n✅ Updated: {output_file}")

# Create TSV version
with open('FoxRunTasks_Import.tsv', 'w', encoding='utf-8') as tsvfile:
    with open(output_file, 'r', encoding='utf-8') as csvfile:
        reader = csv.reader(csvfile)
        for row in reader:
            tsvfile.write('\t'.join(row) + '\n')

print(f"✅ Updated: FoxRunTasks_Import.tsv")
