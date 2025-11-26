# Task File Conversion Summary

**Date:** November 26, 2025
**Converted By:** Claude Code
**Purpose:** Convert existing task lists to Google Sheet format for Fox Run Task Tracker

---

## Files Reviewed

### ✅ Successfully Converted

| File | Type | Tasks | Status |
|------|------|-------|--------|
| `FoxRunComprehensiveTaskList.md` | Markdown | 101 tasks | ✅ Converted |

### ⚠️ Could Not Convert (Binary Files)

| File | Type | Status | Recommendation |
|------|------|--------|----------------|
| `cleanlist.xlsx` | Excel | ❌ Not converted | Manually export as CSV or open to review |
| `DailyTasks.xlsx` | Excel | ❌ Not converted | Manually export as CSV or open to review |
| `HouseholdTasks.docx` | Word | ❌ Not converted | Manually export or copy content |

**Why couldn't they be converted?**
- Python libraries (`pandas`, `python-docx`) not available in this environment
- No command-line tools (`unzip`, `libreoffice`) available
- These are binary Office formats requiring specialized tools

**How to handle them:**
1. Open each file in Excel/Word
2. If they contain useful tasks not in the markdown file, manually copy them into the Google Sheet
3. Or export them as CSV and we can re-run the conversion

---

## Converted Files

### Output Files Created

| File | Format | Purpose | Size |
|------|--------|---------|------|
| `FoxRunTasks_Import.csv` | CSV | Standard comma-separated | 101 tasks + header |
| `FoxRunTasks_Import.tsv` | TSV | Tab-separated (easier paste) | 101 tasks + header |
| `convert_to_sheet.py` | Python | Conversion script (reusable) | - |

---

## Task Breakdown

### By Category

| Category | Count | Priority | Avg Time (min) |
|----------|-------|----------|----------------|
| Daily Tasks | 15 | High | 30-480 |
| Weekly Tasks | 25 | Medium | 60 |
| Monthly Tasks | 23 | Low | 90 |
| Seasonal Tasks | 30 | Low | 120 |
| Personal/Professional | 8 | Medium | 60 |
| **Total** | **101** | - | - |

### Sample Tasks by Category

**Daily (High Priority, 30 min):**
- Wash dishes and put them away
- Wipe down kitchen counters, sink, and stovetop
- Take out trash and recycling if full
- Cook meals / Clean up after cooking

**Weekly (Medium Priority, 60 min):**
- Do laundry
- Vacuum carpets and rugs
- Mop hard floors
- Scrub toilets, tubs, and showers

**Monthly (Low Priority, 90 min):**
- Deep clean the refrigerator
- Clean inside microwave and oven
- Wash trash cans
- Check HVAC filters and replace if needed

**Seasonal (Low Priority, 120 min):**
- Rotate seasonal clothes
- Check gutters and downspouts
- Rake leaves or shovel snow
- Deep clean carpets or shampoo rugs

---

## Google Sheet Structure (Per GOOGLE-SHEET-ZAPIER-INTEGRATION.md)

### Columns Overview

| Col | Name | Filled By | Example |
|-----|------|-----------|---------|
| A | Task ID | Formula | `="FR-" & TEXT(ROW()-1, "000")` |
| B | Title | Import | "Wash dishes and put them away" |
| C | Description | Import | "Location: Kitchen" |
| D | Assignee | **Manual** | Aaron, Rai, Sam, ZB, TB, Aur |
| E | Priority | Import | high, medium, low, urgent |
| F | Due Date | **Manual** | 12/15/2025 |
| G | Status | Import | todo, in_progress, completed |
| H | Completed Date | Zapier | (Auto-filled on completion) |
| I | Completed By | Zapier | (Auto-filled on completion) |
| J | Time (minutes) | Import | 30, 60, 90, 120, etc. |
| K | Created Date | Formula | `=IF(B2<>"", TODAY(), "")` |
| L | Created By | **Manual** | Aaron, Rai |

### Columns You Need to Fill Manually

After importing, you'll need to assign:
1. **Column D (Assignee):** Choose from dropdown: Aaron, Rai, Sam, ZB, TB, Aur
2. **Column F (Due Date):** Set deadline for each task
3. **Column L (Created By):** Choose Aaron or Rai (who assigned it)

---

## How to Import into Google Sheet

### Option 1: Copy-Paste TSV (Recommended)

1. **Open the TSV file:**
   ```bash
   cat /home/ajbir/task-planner-app/tasks/FoxRunTasks_Import.tsv
   ```

2. **Select all and copy** (Ctrl+A, Ctrl+C in terminal or text editor)

3. **In your Google Sheet:**
   - Click cell **B1** (Title column)
   - Paste (Ctrl+V)
   - Google Sheets will automatically recognize tabs and fill columns B through L

4. **Add formulas:**
   - **Column A (Task ID):** In cell A2, enter: `="FR-" & TEXT(ROW()-1, "000")`
   - Drag down to apply to all rows
   - **Column K (Created Date):** In cell K2, enter: `=IF(B2<>"", TODAY(), "")`
   - Drag down to apply to all rows

5. **Set up data validation:**
   - **Column D (Assignee):** Dropdown with: Aaron, Rai, Sam, ZB, TB, Aur
   - **Column E (Priority):** Dropdown with: low, medium, high, urgent
   - **Column G (Status):** Dropdown with: todo, in_progress, completed
   - **Column L (Created By):** Dropdown with: Aaron, Rai

### Option 2: Import CSV

1. **In Google Sheets:**
   - File → Import
   - Upload → Select `FoxRunTasks_Import.csv`
   - Import location: Replace current sheet
   - Separator type: Comma
   - Click "Import data"

2. **Follow steps 4-5 from Option 1** to add formulas and data validation

---

## Data Quality Notes

### What's Included
- ✅ All 101 task titles
- ✅ Location information in Description field
- ✅ Priority assigned based on category (Daily=high, Weekly=medium, etc.)
- ✅ Status set to "todo" for all tasks
- ✅ Time estimates (30-120 min based on complexity)

### What's Missing (You Need to Add)
- ⏳ Assignee (Column D) - Empty, needs manual assignment
- ⏳ Due Date (Column F) - Empty, needs manual scheduling
- ⏳ Created By (Column L) - Empty, should be Aaron or Rai

### Priority Logic Applied
```
Daily Tasks → High priority (30 min)
Weekly Tasks → Medium priority (60 min)
Monthly Tasks → Low priority (90 min)
Seasonal Tasks → Low priority (120 min)
Personal/Professional → Medium priority (60 min)

Special cases:
- "deep clean" or "organize" tasks: +50% time
- "full workday" tasks: 480 min (8 hours)
- "partial workday" tasks: 240 min (4 hours)
```

---

## Next Steps

### Immediate Actions

1. ✅ **Review converted data** - Check `FoxRunTasks_Import.tsv`
2. ⏳ **Import into Google Sheet** - Use Option 1 (copy-paste TSV)
3. ⏳ **Add formulas** - Task ID (Column A) and Created Date (Column K)
4. ⏳ **Set up data validation** - Dropdowns for Assignee, Priority, Status, Created By
5. ⏳ **Manually assign** - Fill in Assignee, Due Date, and Created By columns

### Optional Actions

1. ⏳ **Review Excel/Word files** - Check if they contain additional tasks
2. ⏳ **Merge duplicates** - Remove any duplicate tasks from different sources
3. ⏳ **Customize priorities** - Adjust priorities based on actual urgency
4. ⏳ **Customize time estimates** - Adjust based on real experience

---

## Files Location

All files are in: `/home/ajbir/task-planner-app/tasks/`

```
tasks/
├── FoxRunComprehensiveTaskList.md     (Source - 101 tasks)
├── FoxRunTasks_Import.csv              (Converted - CSV format)
├── FoxRunTasks_Import.tsv              (Converted - TSV format) ⭐ USE THIS
├── convert_to_sheet.py                 (Conversion script)
├── CONVERSION_SUMMARY.md               (This file)
├── cleanlist.xlsx                      (Not converted - manual review needed)
├── DailyTasks.xlsx                     (Not converted - manual review needed)
└── HouseholdTasks.docx                 (Not converted - manual review needed)
```

---

## Questions or Issues?

If you need to:
- **Re-run conversion:** `python3 convert_to_sheet.py`
- **Adjust priorities:** Edit the script and re-run
- **Convert Excel/Word files:** Export them as CSV first, then we can convert
- **Modify task descriptions:** Edit the CSV/TSV before importing

---

**Ready to import?** Use the TSV file (`FoxRunTasks_Import.tsv`) for the easiest copy-paste experience into Google Sheets!
