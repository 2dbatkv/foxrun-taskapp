# Google Sheet + Zapier Integration - Implementation Log

## Project: Fox Run Task Tracker - Google Sheets Integration

**Date Started:** November 25, 2025
**Goal:** Allow admins to assign tasks via Google Sheet, sync to app, and sync completions back

---

## Design Decisions

### User Answers (A C B A)
1. **Assignee Mapping:** Short names in Sheet (Aaron, Rai, Sam, ZB, TB, Aur)
2. **Admin View:** Toggle between "My Tasks" and "All Tasks"
3. **Existing Tasks:** Archive existing, start fresh from Sheet
4. **Task Creation:** Google Sheet only (single source of truth)

### User Name Mapping
```
Aaron → 9553AJB (Admin)
Rai   → 9566RFB (Admin)
Sam   → 9127SAM (Member)
ZB    → 1112ZBB (Member)
TB    → 7226TBB (Member)
Aur   → 9807AUR (Member)
```

---

## Google Sheet Structure

**Sheet Name:** Fox Run Tasks
**Worksheet:** Sheet1

### Columns

| Col | Name | Type | Example | Auto-filled? | Notes |
|-----|------|------|---------|--------------|-------|
| A | Task ID | Text (Formula) | FR-001 | Yes | `="FR-" & TEXT(ROW()-1, "000")` |
| B | Title | Text | Clean kitchen | No | Required |
| C | Description | Text | Wipe counters... | No | Optional |
| D | Assignee | Dropdown | Sam | No | Values: Aaron, Rai, Sam, ZB, TB, Aur |
| E | Priority | Dropdown | high | No | Values: low, medium, high, urgent |
| F | Due Date | Date | 12/15/2025 | No | Format: MM/DD/YYYY |
| G | Status | Dropdown | todo | No | Values: todo, in_progress, completed |
| H | Completed Date | Date | 11/25/2025 | By Zapier | When task marked complete |
| I | Completed By | Text | Sam | By Zapier | Who completed it |
| J | Time (minutes) | Number | 60 | No | Estimated completion time |
| K | Created Date | Date (Formula) | 11/25/2025 | Yes | `=IF(B2<>"", TODAY(), "")` |
| L | Created By | Dropdown | Aaron | No | Values: Aaron, Rai |

### Sample Data
```
FR-001 | Clean kitchen | Wipe counters, sweep floor | Sam | high | 12/15/2025 | todo | | | 60 | 11/25/2025 | Aaron
FR-002 | Take out trash | All bins to curb | ZB | medium | 12/14/2025 | todo | | | 15 | 11/25/2025 | Aaron
FR-003 | Organize garage | Sort tools, sweep | TB | low | 12/20/2025 | todo | | | 120 | 11/25/2025 | Rai
```

---

## Zapier Configuration

### Zap 1: Google Sheet → Render (Task Sync)

**Status:** Testing with webhook.site
**Webhook Test URL:** [Add your webhook.site URL here]

#### Trigger Setup
- **App:** Google Sheets
- **Event:** New or Updated Spreadsheet Row
- **Spreadsheet:** Fox Run Tasks
- **Worksheet:** Sheet1
- **Trigger Column:** (Any column)

#### Action Setup
- **App:** Webhooks by Zapier
- **Event:** POST
- **URL:** [webhook.site URL for now, will be Render endpoint]
- **Payload Type:** JSON
- **Data Mapping:**
  ```
  task_id → Task ID (Column A)
  title → Title (Column B)
  description → Description (Column C)
  assignee → Assignee (Column D)
  priority → Priority (Column E)
  due_date → Due Date (Column F)
  status → Status (Column G)
  time_to_complete → Time (minutes) (Column J)
  created_by → Created By (Column L)
  created_date → Created Date (Column K)
  ```

#### Test Results

**Date Tested:** [To be filled]
**Test Row Used:** FR-001

**Actual JSON Payload Received:**
```json
[Paste the actual JSON from webhook.site here]
```

**Observations:**
- [Note any formatting issues, date formats, etc.]
- [What works well]
- [What needs adjustment]

---

### Zap 2: Render → Google Sheet (Completion Sync)

**Status:** Not yet implemented
**Zapier Catch Hook URL:** [To be filled when created]

#### Trigger Setup
- **App:** Webhooks by Zapier
- **Event:** Catch Hook
- **URL:** [Zapier will provide this]

#### Action Setup
- **App:** Google Sheets
- **Event:** Update Spreadsheet Row
- **Spreadsheet:** Fox Run Tasks
- **Worksheet:** Sheet1
- **Lookup Column:** Task ID (Column A)
- **Lookup Value:** {{task_id}} from webhook
- **Update Fields:**
  - Status → completed
  - Completed Date → {{completed_date}}
  - Completed By → {{completed_by}}

---

## Backend Requirements (Discovered)

### Endpoint 1: Receive Tasks from Zapier

**URL:** `POST /webhooks/zapier/tasks`

**Expected Request:**
```json
[Will fill this in after webhook.site test]
```

**Required Response:**
```json
{
  "status": "success",
  "message": "Task synced",
  "task_id": "task-123"
}
```

**Implementation Notes:**
- [To be filled based on testing]

---

### Endpoint 2: Send Completions to Zapier

**Triggered By:** User marks task complete in app

**Webhook URL:** [From Zap 2 catch hook]

**Payload to Send:**
```json
{
  "task_id": "FR-001",
  "status": "completed",
  "completed_date": "2025-11-25T14:30:00Z",
  "completed_by": "Sam"
}
```

**Implementation Notes:**
- [To be filled]

---

## Testing Log

### Test 1: Google Sheet → Webhook.site
**Date:** [Fill in]
**Action:** Added new row to Google Sheet
**Result:** [Pass/Fail]
**JSON Received:** [Paste here]
**Issues Found:** [List any issues]
**Resolution:** [How fixed]

---

### Test 2: Update existing row
**Date:** [Fill in]
**Action:** Changed status from todo to in_progress
**Result:** [Pass/Fail]
**Notes:** [Observations]

---

## Next Steps

- [ ] Create Google Sheet with template structure
- [ ] Add sample data (3-5 tasks)
- [ ] Set up webhook.site test endpoint
- [ ] Configure Zap 1 to send to webhook.site
- [ ] Test and document JSON payload received
- [ ] Design backend endpoint based on actual data structure
- [ ] Implement backend endpoints
- [ ] Update Zapier to point to Render
- [ ] Test end-to-end flow
- [ ] Set up Zap 2 for completion sync
- [ ] Test completion flow
- [ ] Deploy and validate

---

## Resources

- **Google Sheet:** [Add link when created]
- **Webhook.site Test URL:** [Add link]
- **Zapier Dashboard:** https://zapier.com/app/zaps
- **Render Backend:** https://foxrun-taskapp-backend.onrender.com
- **Frontend App:** https://foxruntasks.netlify.app

---

## Questions & Issues

### Open Questions
1. [Add questions as they arise]

### Known Issues
1. [Add issues as discovered]

---

*Last Updated: November 25, 2025*
