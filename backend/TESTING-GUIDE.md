# Backend Testing Guide

**Date:** November 26, 2025
**Purpose:** Test Google Sheets integration before production deployment

---

## 🎯 Testing Overview

We'll test the backend in three stages:

1. **Stage 1:** Code validation (syntax, imports) - ✅ **CAN DO NOW**
2. **Stage 2:** Mock testing (without Google Sheets) - ✅ **CAN DO NOW**
3. **Stage 3:** Integration testing (with Google Sheets) - ⏳ **After Google Cloud setup**

---

## ✅ Stage 1: Code Validation (Complete)

### What We Tested

```bash
cd /home/ajbir/task-planner-app/backend
source venv/bin/activate
python3 test_sheets_connection.py
```

### Results

| Test | Status | Notes |
|------|--------|-------|
| **Dependencies** | ✅ PASS | gspread, google-auth installed |
| **Code Syntax** | ✅ PASS | No syntax errors |
| **Import Test** | ✅ PASS | sheets_service.py imports successfully |
| **User Mapping** | ✅ PASS | 10 names map to 6 access codes |
| **Graceful Fallback** | ✅ PASS | Falls back to JSON when credentials missing |

**Conclusion:** Code is syntactically correct and ready for testing with credentials!

---

## 🧪 Stage 2: Mock Testing (Without Google Sheets)

### Test 1: Verify Backend Starts

Test that the FastAPI backend can start without Google Sheets credentials:

```bash
cd /home/ajbir/task-planner-app/backend
source venv/bin/activate

# Start backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Expected output:**
```
INFO: Google Sheets service not available, falling back to JSON storage
INFO: Application startup complete
INFO: Uvicorn running on http://0.0.0.0:8000
```

**What this tests:**
- ✅ Backend starts without crashing
- ✅ Falls back to JSON storage gracefully
- ✅ API endpoints are accessible

### Test 2: API Documentation Access

With backend running, visit:
```
http://localhost:8000/docs
```

**Expected:**
- ✅ FastAPI documentation loads
- ✅ See all endpoints including new `/tasks/{task_id}/complete`
- ✅ Can expand and test endpoints

### Test 3: Test JSON Fallback

With backend running, test that old endpoints still work:

**Test GET /tasks/**
```bash
curl http://localhost:8000/tasks/
```

**Expected:**
- Returns tasks from JSON storage
- Status 200 OK

**Test POST /tasks/**
```bash
curl -X POST http://localhost:8000/tasks/ \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Task",
    "description": "Testing JSON fallback",
    "priority": "medium",
    "status": "todo",
    "time_to_complete_minutes": 30
  }'
```

**Expected:**
- Creates task in JSON storage
- Status 201 Created
- Returns task with ID

### Test 4: Test New Completion Endpoint

**Try to complete a task (will fail gracefully):**
```bash
curl -X PUT http://localhost:8000/tasks/FR-001/complete
```

**Expected:**
- Status 503 Service Unavailable
- Message: "Google Sheets service not available"

**This is correct behavior!** The endpoint exists but requires Google Sheets credentials.

---

## 🔗 Stage 3: Integration Testing (With Google Sheets)

### Prerequisites

Before running these tests:
- [x] Complete Google Cloud setup (Part 1 of deployment guide)
- [x] Set environment variables locally
- [x] Verify Google Sheet access

### Setup Environment Variables Locally

Create a `.env` file in the backend directory:

```bash
cd /home/ajbir/task-planner-app/backend

# Create .env file
cat > .env << 'EOF'
USE_JSON_STORAGE=true
SECRET_KEY=your_secret_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here

# Google Sheets Configuration
GOOGLE_SHEET_ID=1A1iVuKDpyBSp-zAZ3GHT0-8v44hreM_otj-lJvatsPk
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"..."}

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:8000
EOF
```

**Replace with your actual values!**

### Test 1: Connection Test

```bash
source venv/bin/activate
python3 test_sheets_connection.py
```

**Expected output:**
```
============================================================
STEP 1: Testing Environment Variables
============================================================
✅ GOOGLE_SHEET_ID is set: 1A1iVuKDpyBSp-zAZ3GHT0...
✅ GOOGLE_SERVICE_ACCOUNT_JSON is valid JSON
   Project: fox-run-tasks
   Client Email: fox-run-backend@...

============================================================
STEP 2: Testing Sheets Service Import
============================================================
✅ Sheets service imported successfully
✅ User mapping loaded: 10 entries

============================================================
STEP 3: Testing Google Sheets Connection
============================================================
📊 Spreadsheet ID: 1A1iVuKDpyBSp-zAZ3GHT0-8v44hreM_otj-lJvatsPk
📄 Worksheet: Sheet1
🔢 Row count: 200
🔢 Column count: 12

✅ Successfully connected to Google Sheet!

============================================================
STEP 4: Testing Task Reading
============================================================
📖 Reading all tasks...
✅ Retrieved 191 tasks from Google Sheet

📋 Sample task (first one):
   id: FR-001
   title: Wash dishes and put them away
   description: Location: Kitchen
   assignee: Aaron
   priority: high
   ...

✅ Task reading successful!

============================================================
TEST SUMMARY
============================================================
Environment Variables          ✅ PASSED
Service Import                 ✅ PASSED
User Mapping                   ✅ PASSED
Google Sheets Connection       ✅ PASSED
Task Reading                   ✅ PASSED
------------------------------------------------------------
Total: 5/5 tests passed

🎉 All tests passed! Google Sheets integration is working!
```

### Test 2: Start Backend with Sheets

```bash
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Expected output:**
```
INFO: Google Sheets service initialized successfully
INFO: Application startup complete
```

### Test 3: API Integration Tests

#### Test 3.1: Get All Tasks (Admin View)

```bash
# First, get a valid JWT token by logging in
# Then use it in requests (replace YOUR_TOKEN)

curl http://localhost:8000/tasks/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected:**
- Returns 191 tasks from Google Sheet
- Each task has fields: id, title, description, assignee, etc.

#### Test 3.2: Get Filtered Tasks

The backend automatically filters based on the logged-in user.

**Log in as member, then:**
```bash
curl http://localhost:8000/tasks/ \
  -H "Authorization: Bearer MEMBER_TOKEN"
```

**Expected:**
- Returns only tasks assigned to that member
- Fewer than 191 tasks

**Log in as admin, then:**
```bash
curl http://localhost:8000/tasks/ \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Expected:**
- Returns all 191 tasks

#### Test 3.3: Complete a Task

```bash
curl -X PUT http://localhost:8000/tasks/FR-001/complete \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected:**
- Status 200 OK
- Response:
  ```json
  {
    "status": "success",
    "message": "Task FR-001 marked complete",
    "task_id": "FR-001",
    "completed_by": "AJB - Admin (9553AJB)"
  }
  ```

**Verify in Google Sheet:**
- Row with Task ID "FR-001" should have:
  - Column G (Status): "completed"
  - Column H (Completed Date): Today's date
  - Column I (Completed By): Your short name (e.g., "Aaron")

#### Test 3.4: Get Specific Task

```bash
curl http://localhost:8000/tasks/FR-001 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected:**
- Returns task details for FR-001
- Shows updated status if you completed it

---

## 🐛 Troubleshooting

### Issue: "ModuleNotFoundError: No module named 'gspread'"

**Fix:**
```bash
source venv/bin/activate
pip install gspread google-auth
```

### Issue: "GOOGLE_SERVICE_ACCOUNT_JSON environment variable not set"

**Check:**
```bash
echo $GOOGLE_SERVICE_ACCOUNT_JSON
```

**Fix:**
- Create `.env` file with correct values
- Or export variables:
  ```bash
  export GOOGLE_SHEET_ID="your_sheet_id"
  export GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
  ```

### Issue: "Permission denied" when accessing Sheet

**Fixes:**
1. Verify Sheet is shared with service account email
2. Check service account has "Editor" permission
3. Try resharing the Sheet

### Issue: Backend returns "Task not found"

**Possible causes:**
1. Task ID format wrong (should be "FR-001" not "1")
2. Task not in Google Sheet
3. Sheet structure doesn't match expected columns

**Check:**
- Task IDs in Column A start with "FR-"
- Formula in Column A: `="FR-" & TEXT(ROW()-1, "000")`

### Issue: Tasks not filtering correctly

**Check:**
1. Assignee names in Sheet match USER_MAPPING
2. Valid assignee names: Aaron, Rai, Sam, ZB, TB, Aur
3. No typos or extra spaces in assignee column

---

## ✅ Testing Checklist

### Code Validation (No Credentials Needed)
- [x] Dependencies installed
- [x] Code imports successfully
- [x] User mapping works
- [x] Graceful fallback to JSON

### Mock Testing (No Credentials Needed)
- [ ] Backend starts without errors
- [ ] API docs accessible
- [ ] JSON endpoints still work
- [ ] New completion endpoint returns 503 (expected)

### Integration Testing (After Google Cloud Setup)
- [ ] Connection test passes all 5 tests
- [ ] Backend starts with "Google Sheets service initialized"
- [ ] Can read all 191 tasks
- [ ] Tasks filter by user correctly
- [ ] Can complete a task
- [ ] Google Sheet updates with completion data
- [ ] Admins see all tasks
- [ ] Members see only their tasks

---

## 📊 Test Results Summary

Run tests and record results here:

| Test Stage | Date | Pass/Fail | Notes |
|------------|------|-----------|-------|
| Code Validation | 2025-11-26 | ✅ PASS | All imports work |
| Mock Testing | | | |
| Integration Testing | | | |

---

## 🚀 Next Steps After Testing

Once all tests pass:

1. **Deploy to Render:**
   - Push code to GitHub (✅ done)
   - Add environment variables to Render
   - Verify deployment logs

2. **Test on Render:**
   - Check backend logs for "Google Sheets service initialized"
   - Test API endpoint: `https://foxrun-taskapp-backend.onrender.com/tasks/`

3. **Deploy Frontend:**
   - Replace TaskPlanner.jsx with updated version
   - Push to GitHub
   - Test on production

---

**Current Status:** Code validation complete ✅
**Next:** Complete Google Cloud setup, then run integration tests
