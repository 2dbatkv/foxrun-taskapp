# JSON Data Files - Quick Reference Guide

All data files are located in: `/home/ajbir/task-planner-app/data/`

## 📋 tasks.json

**Contains:** 10 sample tasks with various statuses and priorities

**Structure:**
```json
{
  "id": 1,
  "title": "Task title",
  "description": "Detailed description",
  "status": "todo|in_progress|completed|cancelled",
  "priority": "low|medium|high|urgent",
  "due_date": "2025-11-01T17:00:00",
  "created_at": "2025-10-28T08:00:00",
  "updated_at": "2025-10-28T10:30:00",
  "completed_at": null
}
```

**Statuses:** todo, in_progress, completed, cancelled
**Priorities:** low, medium, high, urgent

---

## 📅 calendar.json

**Contains:** 12 sample events including meetings, appointments, and all-day events

**Structure:**
```json
{
  "id": 1,
  "title": "Event title",
  "description": "Event details",
  "start_time": "2025-10-29T09:00:00",
  "end_time": "2025-10-29T09:30:00",
  "location": "Conference Room A",
  "all_day": false,
  "created_at": "2025-10-27T14:00:00",
  "updated_at": "2025-10-27T14:00:00"
}
```

**Features:**
- Regular timed events
- All-day events (set `all_day: true` and use full day timestamps)
- Location field for venue/meeting room

---

## ⏰ reminders.json

**Contains:** 14 sample reminders with various states

**Structure:**
```json
{
  "id": 1,
  "title": "Reminder title",
  "description": "Reminder details",
  "remind_at": "2025-10-29T15:00:00",
  "is_active": true,
  "is_completed": false,
  "created_at": "2025-10-28T09:00:00",
  "updated_at": "2025-10-28T09:00:00"
}
```

**States:**
- `is_active: true` - Reminder is active
- `is_active: false` - Reminder is disabled
- `is_completed: true` - Reminder was completed

---

## 📚 knowledge.json

**Contains:** 10 sample knowledge base entries covering various topics

**Structure:**
```json
{
  "id": 1,
  "title": "Entry title",
  "content": "Full content with details, can be multiline",
  "category": "Development",
  "tags": "git,workflow,version-control",
  "created_at": "2025-10-15T10:00:00",
  "updated_at": "2025-10-15T10:00:00"
}
```

**Categories in samples:**
- Development
- DevOps
- API
- Database
- Security
- Infrastructure
- Office
- Support

**Tips:**
- Use `\n` for line breaks in content
- Tags are comma-separated (no spaces after commas)

---

## 📄 documents.json

**Contains:** 15 sample document references with various file types

**Structure:**
```json
{
  "id": 1,
  "title": "Document title",
  "file_path": "C:\\Users\\ajbir\\Documents\\file.pdf",
  "file_type": "pdf",
  "description": "Document description",
  "url": "https://example.com/document",
  "tags": "business,planning,strategy",
  "created_at": "2025-10-01T10:00:00",
  "updated_at": "2025-10-01T10:00:00"
}
```

**File Types:**
- pdf, docx, xlsx, pptx
- txt, md, html
- png, jpg
- video

**File Path vs URL:**
- Use `file_path` for local files (Windows: `C:\\Users\\...` or Linux: `/home/...`)
- Use `url` for web links
- Can have both or either one
- Click on file paths in the UI to open files

---

## 📝 Date Format

All dates use **ISO 8601 format**: `YYYY-MM-DDTHH:MM:SS`

**Examples:**
- `2025-10-29T09:00:00` = October 29, 2025 at 9:00 AM
- `2025-11-01T17:30:00` = November 1, 2025 at 5:30 PM
- `2025-12-25T00:00:00` = December 25, 2025 at midnight

**Note:** Times are in 24-hour format (00:00 to 23:59)

---

## ✏️ Editing JSON Files

You can edit these files with any text editor:

**Linux/WSL:**
```bash
nano /home/ajbir/task-planner-app/data/tasks.json
```

**VS Code:**
```bash
code /home/ajbir/task-planner-app/data/
```

**Important:**
- Maintain valid JSON syntax
- Keep the top-level key (e.g., "tasks", "events")
- IDs should be unique integers
- Use double quotes for strings
- Boolean values: `true` or `false` (lowercase, no quotes)
- Null values: `null` (no quotes)

---

## 🔄 Changes Take Effect Immediately

After editing a JSON file:
1. Save the file
2. Refresh your browser (F5)
3. Changes will appear instantly (no server restart needed!)

---

## 📊 Sample Data Summary

| File | Entries | Description |
|------|---------|-------------|
| tasks.json | 10 | Mix of todo, in_progress, completed, cancelled |
| calendar.json | 12 | Meetings, events, appointments |
| reminders.json | 14 | Active and completed reminders |
| knowledge.json | 10 | Technical docs, procedures, guides |
| documents.json | 15 | Various file types and references |

---

## 🎯 Tips

1. **Keep IDs unique** - Always use the next available number
2. **Date format** - Use ISO 8601 format for all dates
3. **Tags** - Comma-separated, no spaces: `"tag1,tag2,tag3"`
4. **Timestamps** - `created_at` and `updated_at` are auto-managed when using the app, but you can set them manually when editing JSON
5. **Windows paths** - Use double backslash: `C:\\Users\\ajbir\\...`
6. **Validation** - Use a JSON validator (jsonlint.com) if you get errors

---

## 🚀 Next Steps

1. Edit the sample data to match your needs
2. Add your own tasks, events, reminders, etc.
3. Experiment with the UI to see how changes appear
4. Create your own categories and tags
5. Add real document paths from your system

Enjoy your Task Planner app! 🎉
