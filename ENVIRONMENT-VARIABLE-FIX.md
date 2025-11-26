# Google Sheets Environment Variable Fix

**Date:** November 26, 2025
**Issue:** Google Sheets service failing to initialize on Render
**Error:** `Invalid control character at: line 1 column 132 (char 131)`

---

## Problem Identified

The `GOOGLE_SERVICE_ACCOUNT_JSON` environment variable in Render has formatting issues:

❌ **Current (Broken):**
```
"{\n  \"type\": \"service_account\",\n  \"project_id\": \"fox-run-tasks\",\n ..."
```
- Extra outer quotes wrapping the JSON
- Escaped newlines (`\n`) instead of actual newlines
- Causes JSON parser to fail

---

## Solution

### Step 1: Update Environment Variable in Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select **foxrun-taskapp-backend** service
3. Go to **Environment** tab
4. Find `GOOGLE_SERVICE_ACCOUNT_JSON`
5. Click **Edit**
6. **Delete the current value completely**
7. **Paste the corrected JSON below** (no outer quotes, minified)

**IMPORTANT:** Use the actual JSON from your downloaded service account key file.

**DO NOT** paste the example below - it's just a template showing the structure.

The JSON should look like this (use YOUR actual credentials from the JSON file you downloaded from Google Cloud):

```json
{
  "type": "service_account",
  "project_id": "fox-run-tasks",
  "private_key_id": "YOUR_PRIVATE_KEY_ID_HERE",
  "private_key": "-----BEGIN PRIVATE KEY-----\nYOUR_ACTUAL_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n",
  "client_email": "fox-run-backend@fox-run-tasks.iam.gserviceaccount.com",
  "client_id": "YOUR_CLIENT_ID",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/fox-run-backend%40fox-run-tasks.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}
```

**To get your actual credentials:**
1. Open the JSON file you downloaded from Google Cloud Console (named something like `fox-run-tasks-abc123.json`)
2. Copy the ENTIRE contents
3. Minify it (remove line breaks) OR paste as-is - both work
4. Paste into Render environment variable field (NO outer quotes)

8. Click **Save**
9. Render will automatically redeploy (wait 2-3 minutes)

### Step 2: Share Google Sheet with Service Account

**IMPORTANT:** Your Google Sheet must be shared with the service account email:

1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1A1iVuKDpyBSp-zAZ3GHT0-8v44hreM_otj-lJvatsPk/edit
2. Click **Share** button (top right)
3. Add this email: `fox-run-backend@fox-run-tasks.iam.gserviceaccount.com`
4. Permission: **Editor**
5. Uncheck "Notify people"
6. Click **Share**

---

## Verification Steps

### 1. Check Render Deployment Logs

After saving the environment variable:

1. Go to **Logs** tab in Render
2. Wait for deployment to complete
3. **Look for this message:**
   ```
   INFO: Google Sheets service initialized successfully
   INFO: Application startup complete
   ```

✅ **Success:** You'll see "Google Sheets service initialized successfully"
❌ **Failure:** You'll see "Google Sheets service not available" or another error

### 2. Test Backend API

Once deployment succeeds:

1. Visit: https://foxrun-taskapp-backend.onrender.com/docs
2. Find `GET /tasks/` endpoint
3. Click "Try it out"
4. You'll need to authenticate first (login with access code to get token)
5. Execute the request
6. **Expected:** Returns tasks from Google Sheet (191 tasks)

### 3. Run Local Connection Test (Optional)

If you want to test locally before production:

```bash
cd /home/ajbir/task-planner-app/backend
source venv/bin/activate

# Create local .env file with same values
cat > .env << 'EOF'
GOOGLE_SHEET_ID=1A1iVuKDpyBSp-zAZ3GHT0-8v44hreM_otj-lJvatsPk
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
EOF

# Run connection test
python3 test_sheets_connection.py
```

**Expected output:**
```
✅ Environment Variables          PASSED
✅ Service Import                 PASSED
✅ User Mapping                   PASSED
✅ Google Sheets Connection       PASSED
✅ Task Reading                   PASSED
------------------------------------------------------------
Total: 5/5 tests passed
```

---

## Troubleshooting

### Issue: Still seeing "service not available"

**Check:**
1. Did you remove the outer quotes from the JSON?
2. Is the Google Sheet shared with the service account email?
3. Did Render redeploy after saving the environment variable?

**Test:** Look at Render logs for specific error message

### Issue: "Permission denied"

**Check:**
1. Google Sheet shared with: `fox-run-backend@fox-run-tasks.iam.gserviceaccount.com`
2. Permission level: **Editor** (not Viewer)
3. Service account has correct project_id: `fox-run-tasks`

### Issue: "Spreadsheet not found"

**Check:**
1. GOOGLE_SHEET_ID is correct: `1A1iVuKDpyBSp-zAZ3GHT0-8v44hreM_otj-lJvatsPk`
2. Sheet is not deleted or moved
3. Service account has access (check sharing)

---

## What Happens After Fix

Once the environment variable is corrected and Google Sheet is shared:

1. ✅ Backend connects to Google Sheets successfully
2. ✅ `/tasks/` endpoint returns 191 tasks from Sheet
3. ✅ Users see only tasks assigned to them
4. ✅ Admins see all tasks
5. ✅ Task completion syncs back to Sheet in real-time
6. ✅ Historical tracking works (Completed Date, Completed By columns)

---

## Quick Verification Checklist

After updating environment variable:

- [ ] GOOGLE_SERVICE_ACCOUNT_JSON updated in Render (no outer quotes)
- [ ] GOOGLE_SHEET_ID confirmed: `1A1iVuKDpyBSp-zAZ3GHT0-8v44hreM_otj-lJvatsPk`
- [ ] Google Sheet shared with `fox-run-backend@fox-run-tasks.iam.gserviceaccount.com`
- [ ] Service account has **Editor** permission
- [ ] Render deployment completed successfully
- [ ] Render logs show "Google Sheets service initialized successfully"
- [ ] Backend API `/docs` is accessible
- [ ] `GET /tasks/` returns tasks from Sheet
- [ ] Frontend can login and see tasks
- [ ] Task completion checkbox works
- [ ] Completions sync to Google Sheet

---

**Status:** Environment variable fix documented
**Next:** Apply fix in Render, verify deployment, test integration

For detailed testing steps, see: `backend/TESTING-GUIDE.md`
