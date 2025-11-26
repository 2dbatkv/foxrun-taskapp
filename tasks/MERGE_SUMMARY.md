# Task Merge Summary

**Date:** November 26, 2025
**Action:** Merged HouseholdTasks.txt and DailyTasks.csv with existing task list
**Result:** Consolidated task list with duplicates removed

---

## Summary Statistics

| Source | Tasks Added | Notes |
|--------|-------------|-------|
| Original (FoxRunComprehensiveTaskList.md) | 101 | Base task list |
| HouseholdTasks.txt | **22 new** | Removed duplicates |
| DailyTasks.csv | **68 new** | Filtered out one-time/specific tasks |
| **TOTAL** | **191 tasks** | Ready for Google Sheet import |

---

## What Was Added

### From HouseholdTasks.txt (22 unique tasks)

Notable additions:
- **Home Projects:**
  - Work on the attic (120 min)
  - Fix drywall (120 min)

- **Detailed Cleaning Tasks:**
  - Wipe down kitchen counters, sink, and stovetop
  - Clean bathroom sinks, mirrors, and counters
  - Clean behind refrigerator
  - Wipe down doors, doorknobs, and light switches

- **Organization & Planning:**
  - Do the menu planning for the week and communicate to others
  - Take inventory of groceries and household supplies and make a shopping list
  - Plan and prepare for upcoming family events

- **Specialized Tasks:**
  - Descale kettle
  - Check expiration dates on stored food/emergency supplies
  - Disinfect remote controls and electronics

---

### From DailyTasks.csv (68 unique tasks)

**Note:** This file contained specific daily assignments. I filtered out:
- ❌ One-time project tasks ("Ferguson profile", "sinkhole plains")
- ❌ Event-specific tasks ("Watch Wallace and Gromit movie")
- ❌ Tasks with specific dates/times (2025-03-24, 17:00, etc.)

**What was kept:**
- ✅ General recurring tasks
- ✅ Room-specific cleaning tasks
- ✅ Family coordination tasks
- ✅ Maintenance tasks

Notable additions:
- **Work Tasks:**
  - Work a full day for AECOM (480 min)
  - Work a full day for Siemens (480 min)

- **Room-Specific Cleaning:**
  - Thoroughly clean the kitchen
  - Clean Great Room bathroom
  - Clean downstairs bathroom
  - clean office and bedroom
  - Vacuum upstairs hallway rug
  - Sweep and mop Great Room floor

- **Specific Projects:**
  - Continuing working on attic
  - Install supports in attic
  - Box up and clean items in library
  - Repair rappelling station and creek deck
  - Remove painters tape from trim

- **Outdoor Maintenance:**
  - Blow off ALL DRIVEWAYS
  - Pick up sticks all over property and neatly pile up
  - Blow off and sweep decks and porches
  - Coil and neatly stack hoses
  - Remove tarps, move firewood, neatly stack in new location

- **Personal Care:**
  - trim Max's nails (pet care)

- **Administrative:**
  - taxes
  - Vehicle insurances

- **Family Coordination:**
  - Coordinate with [family member] to prepare dinner
  - Take [family member] to doctor's appointment
  - Communicate with [family members] and make a dinner plan

- **Specific Cleaning:**
  - Clean Grandmom's space
  - Deep clean grandmom's space
  - Clean and straighten up Grandmom's porch
  - Clean plant area
  - Repot plants
  - Clean half wall
  - Clean and dust fake plant area above staircase

---

## Duplicate Detection

The merge script used intelligent duplicate detection:

### How Duplicates Were Identified
1. **Normalized titles:** Converted to lowercase, removed punctuation
2. **Compared semantically:** "Wash dishes" = "Dishes" = "Load and run dishwasher"
3. **Kept most descriptive version**

### Examples of Duplicates Removed

| Original Task | Duplicate Found In | Action |
|---------------|-------------------|--------|
| Wash dishes and put them away | HouseholdTasks.txt, DailyTasks.csv | Kept original |
| Do laundry | Multiple files | Kept original |
| Clean fridge | DailyTasks.csv | Already have "Deep clean the refrigerator" |
| Exercise | Multiple files | Kept original |
| Eat healthy | Multiple files | Kept original |
| Balance the budget | HouseholdTasks.txt | Kept original |
| Pay bills | Multiple files | Kept original |

---

## Task Categorization Applied

The merge script automatically assigned:

### Priority Levels
- **High (480 min):** Full workday tasks, appointments, urgent admin
- **Medium (45-120 min):** Most cleaning, cooking, organization tasks
- **Low (90 min):** Long-term organization, sorting, decluttering

### Time Estimates
- **480 min (8 hrs):** Full workday
- **120 min (2 hrs):** Major projects (attic work, drywall)
- **90 min (1.5 hrs):** Organization/sorting tasks
- **60 min (1 hr):** Standard household tasks
- **45 min:** Quick cleaning tasks

---

## Files Updated

| File | Rows | Status |
|------|------|--------|
| `FoxRunTasks_Import.csv` | 192 (191 + header) | ✅ Updated |
| `FoxRunTasks_Import.tsv` | 192 (191 + header) | ✅ Updated |

---

## What to Review

### Tasks That May Need Adjustment

Some tasks from DailyTasks.csv are very specific to your family members. You may want to:

1. **Generalize some tasks:**
   - "Work a full day for AECOM" → "Work a full day" (unless you want it specific)
   - "Work a full day for Siemens" → "Work a full day"
   - "Thoroughly clean the kitchen" vs "Clean kitchen" (slight duplicate)

2. **Review family-specific tasks:**
   - "Clean Grandmom's space" - Keep as-is or generalize?
   - "trim Max's nails" - Specific pet care
   - "Take [family member] to appointments" - Generic enough?

3. **Review project-specific tasks:**
   - "Repair rappelling station and creek deck" - Specific to your property
   - "Remove painters tape from trim" - Might be one-time task
   - "Install supports in attic" - Specific project

### Recommendation

If you want to use these as **templates** for recurring tasks, keep them generic.
If you want to use them for **specific assignments**, they're good as-is.

---

## Next Steps

1. ✅ **Task files merged** - All unique tasks consolidated
2. ⏳ **Review the list** - Check `FoxRunTasks_Import.tsv` for any unwanted tasks
3. ⏳ **Import to Google Sheet** - Use the updated TSV file
4. ⏳ **Assign tasks** - Fill in Assignee, Due Date, Created By columns
5. ⏳ **Clean up if needed** - Remove or generalize overly specific tasks

---

## Command to View Full List

```bash
# View the consolidated TSV file
cat /home/ajbir/task-planner-app/tasks/FoxRunTasks_Import.tsv | head -50

# Count total tasks
wc -l /home/ajbir/task-planner-app/tasks/FoxRunTasks_Import.tsv
```

---

## Revert If Needed

If you want to start over with just the original 101 tasks:

```bash
# Re-run the original conversion
python3 /home/ajbir/task-planner-app/tasks/convert_to_sheet.py
```

This will overwrite the merged version with just the original FoxRunComprehensiveTaskList.md tasks.

---

**Merge completed successfully! 191 total tasks ready for Google Sheet import.**
