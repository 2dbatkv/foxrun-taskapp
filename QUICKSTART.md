# Fox Run Task Tracker - Quick Start Guide

Get your family productivity system up and running in 10 minutes!

## 🎯 What You'll Get

After this guide, you'll have:
- ✅ Local development environment running
- ✅ Access to the production system at https://foxruntasks.netlify.app
- ✅ Understanding of how to use all features
- ✅ Knowledge of how to deploy updates

## 🌐 Using the Production System (Fastest Start)

**Already deployed and running!**

1. Visit: **https://foxruntasks.netlify.app**
2. Log in with your access code (ask admin for your code)
3. Start creating tasks, events, and using all features

That's it! The system is live and ready to use.

## 💻 Local Development Setup

Want to develop locally or understand how it works? Follow these steps.

### Prerequisites

- [ ] Python 3.12+ (`python3 --version`)
- [ ] Node.js 18+ (`node --version`)
- [ ] Anthropic API key (optional, for AI features)
- [ ] Git installed

### Step 1: Clone the Repository (30 seconds)

```bash
git clone https://github.com/2dbatkv/foxrun-taskapp.git
cd foxrun-taskapp
```

### Step 2: Backend Setup (2 minutes)

```bash
cd backend

# Create virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << 'EOF'
USE_JSON_STORAGE=true
SECRET_KEY=$(openssl rand -hex 32)
ANTHROPIC_API_KEY=your_key_here_optional
CORS_ORIGINS=http://localhost:5173
EOF
```

**Note:** If you don't have an Anthropic API key, AI features won't work but everything else will!

### Step 3: Frontend Setup (1 minute)

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_BASE_URL=http://localhost:8000" > .env
```

### Step 4: Start the System (1 minute)

**Terminal 1 - Start Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Wait for: `Application startup complete.`

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm run dev
```

Wait for: `Local: http://localhost:5173/`

## 🚀 Access Your Local System

Open your browser to:
- **App**: http://localhost:5173
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 🔐 Login

The system uses access codes instead of usernames/passwords. On first run, 6 default codes are created:

**Default Access Codes:**
- Admin codes: `9566RFB`, `9553AJB` (full system access)
- Member codes: `9127SAM`, `1112ZBB`, `7226TBB`, `9807AUR`

*Note: These can be viewed in the Admin panel by logging in with an admin code.*

## 📝 First Steps - 5 Minute Tutorial

### 1. Login (30 seconds)
1. Enter any access code from above
2. Click "Sign In"
3. You're in!

### 2. Create Your First Task (1 minute)
1. Find the "Task Planner" tile
2. Click "New Task"
3. Fill in:
   - Title: "Test Task"
   - Priority: "High"
   - Due Date: Tomorrow
   - Assignee: Your name
   - Time to complete: 60 minutes
4. Click "Create Task"

### 3. Use a Task Template (30 seconds)
1. Click "New Task" again
2. Use the template dropdown
3. Select a pre-made template
4. Notice how it pre-fills the form
5. Click "Create Task"

### 4. View Dashboard Analytics (30 seconds)
1. Scroll to the "Dashboard Overview" tile
2. See task priority breakdown
3. See task status counts
4. View active tasks
5. Check team workload distribution (Today vs This Week)

### 5. Try the AI Assistant (1 minute) *(requires API key)*
1. Scroll to "AI Assistant" tile
2. Type: "Help me organize my tasks"
3. Claude will respond with intelligent suggestions
4. Ask: "What tasks are due soon?"

### 6. Use Global Search (30 seconds)
1. Look at the top search bar
2. Type any keyword
3. See results from all categories
4. Toggle "AI Search" for smart analysis

### 7. Archive a Task (30 seconds)
1. Mark a task as "Completed"
2. Click the Archive icon (folder icon)
3. Task moves to archived list
4. Check Admin panel to see archived tasks

## 👑 Admin Features (For Admin Access Codes Only)

After logging in with an admin code, click "Admin Panel":

### Login Activity Monitor
- See all login attempts (success/failure)
- Monitor IP addresses
- Track timestamps

### Team Management
- Configure team members
- Set daily capacity for each person
- Manage roles

### Task Template Library
- Create new templates
- Edit existing templates
- Bulk import via JSON
- Delete templates

### Archived Tasks
- View all archived tasks
- Unarchive tasks
- Permanently delete tasks

### Database Viewer
- Browse all system data
- Download as JSON
- Backup data

### User Feedback
- Review submitted feedback
- Delete resolved items

## 🔧 Common Commands

### Backend
```bash
# Start backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload

# View logs in real-time
tail -f logs/app.log

# Check health
curl http://localhost:8000/health
```

### Frontend
```bash
# Start development server
cd frontend
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find what's using port 8000
lsof -i :8000

# Kill it
kill -9 <PID>
```

### Access Code Not Working
- Make sure there are no spaces before/after the code
- Codes are case-sensitive
- Check Admin panel Login Activity for failure reason

### Frontend Can't Connect to Backend
- Ensure backend is running (`http://localhost:8000/health` should work)
- Check browser console for errors
- Verify `.env` has correct `VITE_API_BASE_URL`

### Data Not Saving
- Check that `data/` directory exists in backend folder
- Ensure write permissions on `data/` directory
- Check backend logs for errors

### AI Features Not Working
- Verify `ANTHROPIC_API_KEY` is set in backend `.env`
- Check API key is valid at https://console.anthropic.com/
- Review backend logs for API errors

## 🚢 Deploying Your Changes

### To Production (Render + Netlify)

Changes deploy automatically when pushed to GitHub:

```bash
# Make your changes to code
git add .
git commit -m "Description of changes"
git push origin main
```

**What happens automatically:**
1. GitHub receives your push
2. Netlify rebuilds frontend (2-3 minutes)
3. Render rebuilds backend (2-3 minutes)
4. Changes go live at https://foxruntasks.netlify.app

### Verify Deployment

**Backend:**
```bash
curl https://fox-run-task-planner.onrender.com/health
```

**Frontend:**
Visit https://foxruntasks.netlify.app and test features

## 📊 Understanding the Data

All data is stored in JSON files in the `backend/data/` directory:

- `access_codes.json` - Authentication codes (hashed)
- `login_attempts.json` - Audit trail of all logins
- `tasks.json` - All task data
- `calendar.json` - Calendar events
- `reminders.json` - Reminders
- `knowledge.json` - Knowledge base articles
- `documents.json` - Document references
- `feedback.json` - User feedback
- `team.json` - Team member configuration
- `task_templates.json` - Task templates

**Backup Strategy:** Admin can download any data type as JSON from the Database Viewer.

## 🎓 Learning More

### Explore the API
Visit http://localhost:8000/docs to see:
- All available endpoints
- Request/response formats
- Try endpoints interactively

### Read the Code
- **Backend routers**: `backend/app/routers/` - Each feature has its own router
- **Frontend components**: `frontend/src/components/` - React components
- **API client**: `frontend/src/services/api.js` - How frontend talks to backend

### Key Files to Understand
- `backend/app/main.py` - Backend entry point
- `backend/app/security.py` - JWT authentication
- `backend/app/services/json_storage.py` - Data persistence
- `frontend/src/App.jsx` - Frontend entry point
- `frontend/src/components/AdminPanel.jsx` - Admin features

## 📚 Next Steps

1. **Customize for your family:**
   - Update team members in Admin panel
   - Create task templates for recurring activities
   - Add your common calendar events

2. **Explore advanced features:**
   - AI-powered search
   - Workload tracking
   - Knowledge base organization

3. **Learn the architecture:**
   - Read `ARCHITECTURE.md` for system design
   - Review `README.md` for comprehensive docs

4. **Contribute improvements:**
   - Add new features
   - Fix bugs
   - Enhance UI/UX

## 💡 Tips for Success

1. **Set up task templates** for recurring work (daily check-ins, weekly reviews, etc.)
2. **Use due dates** consistently so workload tracking works correctly
3. **Archive completed tasks** regularly to keep lists clean
4. **Check Dashboard daily** to see team capacity and priorities
5. **Use AI chat** to get productivity suggestions
6. **Administrators should review Login Activity** weekly for security

## 🆘 Getting Help

- **System issues**: Check Admin panel → Login Activity
- **API errors**: Check backend logs or `/docs`
- **Frontend issues**: Check browser console (F12)
- **Need a feature**: Submit via Feedback tile
- **Security concerns**: Contact admin immediately

## 🎉 You're Ready!

Your Fox Run Task Tracker is now running. Start managing tasks, tracking workload, and boosting your family's productivity!

**Remember:**
- Production: https://foxruntasks.netlify.app
- Local: http://localhost:5173
- API Docs: http://localhost:8000/docs

Happy tracking! 📋✨
