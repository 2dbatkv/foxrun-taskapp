# Google Sheets Integration Deployment Guide

**Date:** November 26, 2025
**Purpose:** Deploy Fox Run Task Tracker with Google Sheets API integration
**Estimated Time:** 1-2 hours

---

## 📋 Overview

This guide walks you through deploying the Google Sheets integration for Fox Run Task Tracker. After completion:
- ✅ Tasks assigned in Google Sheet will appear in users' views automatically
- ✅ Users can mark tasks complete with one click
- ✅ Completions sync back to Google Sheet in real-time
- ✅ No Zapier needed ($0 ongoing cost)

---

## ⚙️ Prerequisites

- [ ] Google Account with access to Google Cloud Console
- [ ] Your Fox Run Tasks Google Sheet set up with 191 tasks
- [ ] GitHub repository access
- [ ] Render dashboard access (backend)
- [ ] Netlify dashboard access (frontend)

---

## 🔧 Part 1: Google Cloud Setup (30 minutes)

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click "Select a project" → "New Project"
3. **Project Name:** `fox-run-tasks`
4. Click "Create"
5. Wait for project creation (30 seconds)
6. Select your new project from the dropdown

### Step 2: Enable Google Sheets API

1. In the left sidebar, go to **APIs & Services** → **Library**
2. Search for "Google Sheets API"
3. Click on "Google Sheets API"
4. Click "Enable"
5. Wait for API to be enabled

### Step 3: Create Service Account

1. Go to **APIs & Services** → **Credentials**
2. Click "Create Credentials" → "Service Account"
3. **Service account details:**
   - Name: `fox-run-backend`
   - ID: `fox-run-backend` (auto-filled)
   - Description: `Service account for Fox Run Task Tracker backend`
4. Click "Create and Continue"
5. **Grant this service account access to project:**
   - Skip this step (no role needed)
   - Click "Continue"
6. **Grant users access to this service account:**
   - Skip this step
   - Click "Done"

### Step 4: Create Service Account Key

1. On the Credentials page, find your new service account
2. Click on the service account email (e.g., `fox-run-backend@...`)
3. Go to the "Keys" tab
4. Click "Add Key" → "Create new key"
5. Choose **JSON** format
6. Click "Create"
7. **Save the downloaded JSON file** - you'll need it later
   - Filename: `fox-run-service-account.json`
   - Keep this file secure!

### Step 5: Share Google Sheet with Service Account

1. Open your Google Sheet: "Fox Run Tasks"
2. Click "Share" button (top right)
3. Copy the service account email from the JSON file:
   - Open `fox-run-service-account.json`
   - Find the `client_email` field
   - Copy the email (e.g., `fox-run-backend@fox-run-tasks.iam.gserviceaccount.com`)
4. Paste the email in the Share dialog
5. **Permission:** Editor
6. **Uncheck** "Notify people"
7. Click "Share"

✅ **Google Cloud setup complete!**

---

## 🔑 Part 2: Gather Configuration Values (5 minutes)

You'll need two values for deployment:

### 1. Google Sheet ID

From your Google Sheet URL:
```
https://docs.google.com/spreadsheets/d/1a2B3c4D5e6F7g8H9i0J-kL1m2N3o4P5q6R/edit
                                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                      This is your SHEET_ID
```

**Copy your Sheet ID** and save it.

### 2. Service Account JSON

1. Open `fox-run-service-account.json`
2. **Copy the ENTIRE JSON content** (all lines)
3. You'll paste this into Render environment variables

**Example:**
```json
{
  "type": "service_account",
  "project_id": "fox-run-tasks",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",
  "client_email": "fox-run-backend@...",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  ...
}
```

---

## 🚀 Part 3: Deploy Backend to Render (20 minutes)

### Step 1: Update Local Code

1. **Pull latest code from GitHub:**
   ```bash
   cd /home/ajbir/task-planner-app
   git pull origin main
   ```

2. **Verify new files exist:**
   ```bash
   ls backend/app/services/sheets_service.py
   cat backend/requirements.txt | grep gspread
   ```

   You should see:
   - `sheets_service.py` exists
   - `gspread==6.1.2` and `google-auth==2.35.0` in requirements.txt

### Step 2: Commit and Push Changes

```bash
cd /home/ajbir/task-planner-app

# Check what changed
git status

# Add all changes
git add .

# Commit
git commit -m "Add Google Sheets API integration

- Add sheets_service.py for Google Sheets operations
- Modify tasks_json.py to read from Google Sheet
- Add complete endpoint for marking tasks done
- Update requirements.txt with gspread and google-auth

🤖 Generated with Claude Code"

# Push to GitHub
git push origin main
```

### Step 3: Configure Render Environment Variables

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Find your **foxrun-taskapp-backend** service
3. Click on the service name
4. Go to **Environment** tab
5. Click "Add Environment Variable"

**Add these two new variables:**

#### Variable 1: GOOGLE_SHEET_ID
- **Key:** `GOOGLE_SHEET_ID`
- **Value:** `[Paste your Sheet ID from Part 2]`
- Click "Add"

#### Variable 2: GOOGLE_SERVICE_ACCOUNT_JSON
- **Key:** `GOOGLE_SERVICE_ACCOUNT_JSON`
- **Value:** `[Paste the ENTIRE JSON content from Part 2]`
- **Important:** Paste as a single line with no extra spaces
- Click "Add"

### Step 4: Deploy Backend

Render will automatically deploy when you pushed to GitHub:

1. Go to **Events** tab in Render
2. You should see "Deploy started"
3. Click on the deployment to see logs
4. Wait for "Your service is live 🎉" (2-5 minutes)

**Check logs for:**
```
INFO: Google Sheets service initialized successfully
INFO: Application startup complete
```

### Step 5: Test Backend

1. Go to your API docs: `https://foxrun-taskapp-backend.onrender.com/docs`
2. Click on `GET /tasks/` endpoint
3. Click "Try it out" → "Execute"
4. You should see tasks from your Google Sheet!

✅ **Backend deployed successfully!**

---

## 🎨 Part 4: Deploy Frontend to Netlify (15 minutes)

### Step 1: Update Frontend Code

The updated `TaskPlannerUpdated.jsx` needs to replace the current `TaskPlanner.jsx`:

```bash
cd /home/ajbir/task-planner-app/frontend/src/components

# Backup original
cp TaskPlanner.jsx TaskPlanner.jsx.backup

# Replace with updated version
cp TaskPlannerUpdated.jsx TaskPlanner.jsx
```

### Step 2: Test Frontend Locally (Optional)

```bash
cd /home/ajbir/task-planner-app/frontend

# Install dependencies (if needed)
npm install

# Start dev server
npm run dev
```

Visit `http://localhost:5173` and test:
- [ ] Tasks from Google Sheet appear
- [ ] Click checkbox to complete task
- [ ] Success message appears
- [ ] Task status updates in Google Sheet

### Step 3: Commit and Push Frontend

```bash
cd /home/ajbir/task-planner-app

git add .

git commit -m "Update TaskPlanner with Google Sheets integration

- Add checkbox for quick task completion
- Call new /tasks/{id}/complete endpoint
- Show sync confirmation messages
- Hide task creation for non-admins (use Google Sheet)
- Update API service with complete() method

🤖 Generated with Claude Code"

git push origin main
```

### Step 4: Deploy to Netlify

Netlify will automatically deploy:

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Find your **foxruntasks** site
3. Go to **Deploys** tab
4. You should see "Building" status
5. Wait for "Published" (1-3 minutes)

### Step 5: Test Production

1. Go to `https://foxruntasks.netlify.app`
2. Log in with an access code
3. **Test as Member:**
   - You should see only tasks assigned to you
   - Click checkbox to complete a task
   - Check Google Sheet - should show completed!
4. **Test as Admin:**
   - You should see all tasks
   - Can filter by assignee
   - Can complete tasks
   - See note about using Google Sheet

✅ **Frontend deployed successfully!**

---

## ✅ Part 5: Verification Checklist

### Backend Verification

- [ ] Render deployment successful (green checkmark)
- [ ] Render logs show: "Google Sheets service initialized successfully"
- [ ] API docs accessible at `/docs`
- [ ] `GET /tasks/` returns tasks from Google Sheet
- [ ] `PUT /tasks/{id}/complete` endpoint exists

### Frontend Verification

- [ ] Netlify deployment successful
- [ ] Site loads at https://foxruntasks.netlify.app
- [ ] Login works
- [ ] Tasks appear for logged-in user
- [ ] Checkbox appears next to incomplete tasks
- [ ] Clicking checkbox marks task complete
- [ ] Success message appears after completion
- [ ] Google Sheet updates with completion data

### Google Sheet Verification

- [ ] Sheet shared with service account email
- [ ] Tasks have Task IDs (FR-001, FR-002, etc.)
- [ ] Columns match expected structure (Task ID, Title, Description, etc.)
- [ ] When task completed in app, Sheet shows:
  - Status = "completed"
  - Completed Date = today's date
  - Completed By = user's name

---

## 🔧 Troubleshooting

### Issue: "Google Sheets service not available"

**Cause:** Service account credentials not configured correctly

**Fix:**
1. Check Render environment variables
2. Verify `GOOGLE_SERVICE_ACCOUNT_JSON` is valid JSON (no extra spaces)
3. Check Render logs for initialization errors

### Issue: "Task not found in Google Sheet"

**Cause:** Task ID mismatch

**Fix:**
1. Verify Task IDs in Sheet follow format: FR-001, FR-002, etc.
2. Check Column A has the formula: `="FR-" & TEXT(ROW()-1, "000")`
3. Ensure no blank rows in Sheet

### Issue: "Permission denied" when accessing Sheet

**Cause:** Service account doesn't have access

**Fix:**
1. Verify Sheet is shared with service account email
2. Check service account has "Editor" permission
3. Try resharing the Sheet

### Issue: No tasks appear in app

**Cause:** Backend can't read from Sheet

**Fix:**
1. Check Render logs: `heroku logs --tail` equivalent
2. Verify `GOOGLE_SHEET_ID` environment variable is correct
3. Test API endpoint directly: `/docs` → `GET /tasks/`

### Issue: Frontend shows old task list

**Cause:** Frontend not updated or caching

**Fix:**
1. Hard refresh browser (Ctrl+Shift+R)
2. Check Netlify deployment status
3. Verify frontend code was pushed to GitHub

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────┐
│  Google Sheet: "Fox Run Tasks"                 │
│  - 191 task templates                           │
│  - Aaron & Rai assign tasks                     │
│  - Historical completion tracking               │
└────────────────┬────────────────────────────────┘
                 │ Google Sheets API (gspread)
                 ↓
┌─────────────────────────────────────────────────┐
│  Backend (Render - FastAPI)                     │
│  sheets_service.py:                             │
│  - get_assigned_tasks(assignee_label)           │
│  - mark_completed(task_id, completed_by)        │
│                                                  │
│  tasks_json.py:                                 │
│  - GET /tasks/ → filtered by user               │
│  - PUT /tasks/{id}/complete → sync to Sheet     │
└────────────────┬────────────────────────────────┘
                 │ REST API (HTTPS)
                 ↓
┌─────────────────────────────────────────────────┐
│  Frontend (Netlify - React)                     │
│  TaskPlanner.jsx:                               │
│  - Display user's assigned tasks                │
│  - Checkbox for quick completion                │
│  - API call to /tasks/{id}/complete             │
│  - Show sync confirmation                       │
└─────────────────────────────────────────────────┘
```

---

## 🎯 User Workflows

### Admin Workflow (Aaron & Rai)

1. Open Google Sheet
2. Find task template (191 tasks available)
3. Assign task:
   - Column D (Assignee): Select name (Aaron, Rai, Sam, ZB, TB, Aur)
   - Column F (Due Date): Set deadline
   - Column L (Created By): Select your name
4. Save (auto-saves)
5. Task immediately appears in assignee's app view

### Member Workflow (Sam, ZB, TB, Aur)

1. Open app: https://foxruntasks.netlify.app
2. Log in with access code
3. See only tasks assigned to them
4. Click checkbox next to task when complete
5. See confirmation: "Task marked complete and synced to Google Sheet!"
6. Task disappears from active list (shown as completed)

### Historical Tracking

Admins can see in Google Sheet:
- Column G: Status (todo → completed)
- Column H: Completed Date (auto-filled)
- Column I: Completed By (auto-filled)
- All history preserved for reporting

---

## 💰 Cost Summary

| Service | Before | After | Savings |
|---------|--------|-------|---------|
| Zapier | $19.99/mo | $0/mo | **$239.88/year** |
| Google Sheets API | $0/mo | $0/mo | Free (generous quotas) |
| Render | $7/mo | $7/mo | No change |
| Netlify | $0/mo | $0/mo | No change |
| **Total** | **$26.99/mo** | **$7/mo** | **$239.88/year saved** |

---

## 📝 User Mapping Reference

| Google Sheet Name | Access Code Label | Role |
|-------------------|-------------------|------|
| Aaron | AJB - Admin (9553AJB) | Admin |
| Rai | RFB - Admin (9566RFB) | Admin |
| Sam / Samuel | SAM - Member (9127SAM) | Member |
| ZB / Zach | ZBB - Member (1112ZBB) | Member |
| TB / Tyler | TBB - Member (7226TBB) | Member |
| Aur / Aurora | AUR - Member (9807AUR) | Member |

**Note:** Both "Sam" and "Samuel" map to the same access code. Same for other aliases.

---

## 🚦 Next Steps

After successful deployment:

1. **Train admins:**
   - Show how to assign tasks in Google Sheet
   - Explain assignee mapping (Aaron = AJB - Admin, etc.)
   - Demo how completions sync back

2. **Train members:**
   - Show how to log in
   - Explain checkbox completion
   - Show where to view completed tasks

3. **Monitor for 1 week:**
   - Check Google Sheet for completion data
   - Verify sync working smoothly
   - Gather user feedback

4. **Optional improvements:**
   - Add email notifications when tasks assigned
   - Create recurring task templates
   - Add task analytics dashboard

---

## 📞 Support

If you encounter issues:

1. **Check deployment logs:**
   - Render: Dashboard → Service → Logs
   - Netlify: Dashboard → Site → Deploys → Deploy log

2. **Test API endpoints:**
   - Visit `/docs` to test manually
   - Check `/health` endpoint

3. **Review this guide:**
   - Double-check environment variables
   - Verify Google Sheet permissions

4. **Contact:**
   - Create GitHub issue for bugs
   - Check session notes in `/home/ajbir/task-planner-app/`

---

**Deployment guide complete! You're ready to go live with Google Sheets integration. 🚀**
