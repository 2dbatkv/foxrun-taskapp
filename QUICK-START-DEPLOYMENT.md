# Quick Start: Complete the Deployment

**Time Required:** 15-30 minutes
**Current Status:** Code ready, environment variable needs fixing

---

## 🚀 3 Steps to Production

### Step 1: Fix Environment Variable (5 minutes)

1. Go to https://dashboard.render.com
2. Click **foxrun-taskapp-backend**
3. Click **Environment** tab
4. Find `GOOGLE_SERVICE_ACCOUNT_JSON`
5. Click **Edit**
6. **Delete current value**
7. **Paste your actual service account JSON** (from the file you downloaded from Google Cloud)

**IMPORTANT:** DO NOT use the placeholder below. Use YOUR actual credentials.

Open the JSON file you downloaded (named something like `fox-run-tasks-abc123.json`), copy ALL the contents, and paste into Render. No outer quotes needed.

Your JSON should look similar to this structure:
```json
{
  "type": "service_account",
  "project_id": "fox-run-tasks",
  "private_key_id": "YOUR_KEY_ID",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "fox-run-backend@fox-run-tasks.iam.gserviceaccount.com",
  ...
}
```

8. Click **Save**
9. Wait 2-3 minutes for automatic redeployment

---

### Step 2: Share Google Sheet (2 minutes)

1. Open: https://docs.google.com/spreadsheets/d/1A1iVuKDpyBSp-zAZ3GHT0-8v44hreM_otj-lJvatsPk/edit
2. Click **Share** button (top right)
3. Add email: `fox-run-backend@fox-run-tasks.iam.gserviceaccount.com`
4. Permission: **Editor**
5. Uncheck "Notify people"
6. Click **Share**

---

### Step 3: Verify Deployment (10 minutes)

#### 3.1 Check Render Logs

1. In Render dashboard, go to **Logs** tab
2. Look for these messages:
   ```
   ✅ INFO: Google Sheets service initialized successfully
   ✅ INFO: Application startup complete
   ```

**If you see "service not available"** → Check Steps 1 & 2 again

#### 3.2 Test Backend API

1. Visit: https://foxrun-taskapp-backend.onrender.com/docs
2. Should load FastAPI documentation
3. Find `GET /tasks/` endpoint
4. Click "Try it out" → "Execute"
5. You'll need authentication (login first to get token)

#### 3.3 Test Frontend

1. Go to: https://foxruntasks.netlify.app
2. Login with your access code
3. **Expected:** See tasks from Google Sheet
4. **Expected:** See checkbox next to incomplete tasks
5. Click checkbox to complete a task
6. **Expected:** Success message appears
7. Check Google Sheet - task should show:
   - Status: completed
   - Completed Date: today
   - Completed By: your name

---

## ✅ Success Checklist

After completing all 3 steps, verify:

- [ ] Render logs show "Google Sheets service initialized successfully"
- [ ] Backend /docs page loads
- [ ] Frontend loads and login works
- [ ] Tasks appear from Google Sheet (191 tasks for admins)
- [ ] Members see only their assigned tasks
- [ ] Admins see all tasks
- [ ] Checkbox completion works
- [ ] Success message appears after completion
- [ ] Google Sheet updates with completion data

---

## 🎉 You're Live!

Once all checkboxes are marked, you have:

✅ **$239.88/year savings** (no Zapier needed)
✅ **Real-time sync** (no delays)
✅ **Single source of truth** (Google Sheet)
✅ **Historical tracking** (all data in one place)

---

## 📚 Reference Documents

For more details, see:
- `ENVIRONMENT-VARIABLE-FIX.md` - Detailed explanation of the fix
- `backend/TESTING-GUIDE.md` - Comprehensive testing guide
- `GOOGLE-SHEETS-DEPLOYMENT.md` - Full deployment documentation
- `STATUS.md` - Current status and progress tracking

---

## 🐛 Troubleshooting

### Issue: Still seeing "service not available" after fix

**Check:**
1. Did you remove the outer quotes from JSON?
2. Did you click Save in Render?
3. Did deployment complete? (check Logs tab)
4. Is Sheet shared with service account email?

### Issue: "Permission denied"

**Check:**
1. Google Sheet shared with: `fox-run-backend@fox-run-tasks.iam.gserviceaccount.com`
2. Permission: **Editor** (not Viewer)

### Issue: No tasks showing in app

**Check:**
1. Backend logs show successful initialization?
2. Logged in with correct access code?
3. Google Sheet has tasks with assignees filled in?

---

**Ready to go!** Follow the 3 steps above and you'll be live in 15-30 minutes.
