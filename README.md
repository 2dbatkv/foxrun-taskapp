# Fox Run Task Tracker

A comprehensive full-stack productivity application for family task management, featuring authentication, workload tracking, task templates, calendar integration, AI-powered assistance, and admin management tools.

## 🌟 Overview

Fox Run Task Tracker is a family-oriented productivity system currently used by 5 team members. It provides secure access control, intelligent workload distribution, task archiving, and administrative oversight - all deployed on cloud infrastructure with automatic backups.

## ✨ Core Features

### Task Management
- **Task Planner**: Create, update, and manage tasks with priorities, statuses, due dates, and assignees
- **Task Templates**: Pre-configured task templates for daily, weekly, and monthly recurring activities
- **Archive System**: Archive completed tasks for record-keeping while keeping active lists clean
- **Workload Tracking**: Real-time visualization of team capacity and completed work by due date

### Organization
- **Calendar**: Schedule and manage events with date/time ranges and locations
- **Reminders**: Set up reminders with notifications for important items
- **Knowledge Base**: Store and organize notes, documentation, and information by category
- **Document References**: Keep track of files, URLs, and external resources

### Intelligence & Search
- **AI Assistant**: Chat with Claude AI for intelligent assistance and task recommendations
- **Smart Search**: Search across all data types with optional AI-powered analysis
- **Dashboard**: Real-time analytics showing task priorities, status breakdown, active tasks, and team workload

### Access & Security
- **Access Code Authentication**: 6 secure access codes (2 admin, 4 member) with role-based permissions
- **JWT Token System**: Secure session management with token expiration
- **Login Auditing**: Complete audit trail of all login attempts with IP tracking
- **Role-Based Access Control**: Admin-only features for system management

### Administration (Admin Only)
- **Login Activity Monitor**: View all successful and failed login attempts
- **Team Management**: Configure team members and their daily capacity
- **Task Template Library**: Create and manage task templates with bulk import
- **Archived Tasks Management**: View, unarchive, or permanently delete archived tasks
- **Database Viewer**: Browse and export all system data as JSON
- **User Feedback Review**: Monitor and manage user-submitted feedback

## 🏗️ Tech Stack

### Backend
- **FastAPI**: Modern Python web framework with automatic API documentation
- **JSON Storage**: File-based persistent storage on Render disk (fallback: PostgreSQL)
- **SQLAlchemy**: ORM for database operations (optional)
- **Anthropic Claude API**: AI-powered chat and search (Sonnet 3.5)
- **Pydantic**: Data validation and settings management
- **JWT Authentication**: Secure token-based authentication
- **Deployed on**: [Render](https://render.com) with automatic GitHub deployment

### Frontend
- **React 18**: Component-based UI library with hooks
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Axios**: HTTP client for API communication
- **Lucide React**: Beautiful icon library
- **Deployed on**: [Netlify](https://netlify.com) with automatic GitHub deployment

## 🚀 Live Deployment

- **Production URL**: https://foxruntasks.netlify.app
- **Backend API**: https://fox-run-task-planner.onrender.com
- **API Documentation**: https://fox-run-task-planner.onrender.com/docs

### Access Codes
The system uses 6 access codes for family members:
- **2 Admin codes**: Full system access including admin panel
- **4 Member codes**: Task management and productivity features

*Note: Access codes are pre-configured in the system and managed by administrators.*

## 📋 Prerequisites

### For Local Development
- Python 3.12+
- Node.js 18+
- Anthropic API Key (for AI features)

### For Production Deployment
- GitHub account
- Render account (backend hosting)
- Netlify account (frontend hosting)
- Anthropic API Key

## 🛠️ Local Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/2dbatkv/foxrun-taskapp.git
cd foxrun-taskapp
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

#### Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Required
USE_JSON_STORAGE=true
SECRET_KEY=your_secret_key_here_use_openssl_rand_hex_32
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Optional - for database mode (not required for JSON storage)
DATABASE_URL=postgresql://user:password@localhost/dbname

# CORS Configuration
CORS_ORIGINS=http://localhost:5173,https://foxruntasks.netlify.app
```

To generate a secret key:
```bash
openssl rand -hex 32
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install
```

Create a `.env` file in the `frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:8000
```

### 4. Initialize Data Directory

The system will automatically create the `data/` directory on first run, but you can pre-create it:

```bash
mkdir -p data
```

The following JSON files will be auto-generated:
- `access_codes.json` - Authentication access codes
- `login_attempts.json` - Login audit trail
- `tasks.json` - Task data
- `calendar.json` - Calendar events
- `reminders.json` - Reminder entries
- `knowledge.json` - Knowledge base articles
- `documents.json` - Document references
- `feedback.json` - User feedback submissions
- `team.json` - Team member configuration
- `task_templates.json` - Task templates

## ▶️ Running the Application Locally

### Start Backend Server

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will be available at: http://localhost:5173

## 📁 Project Structure

```
foxrun-taskapp/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                  # FastAPI app entry point
│   │   ├── config.py                # Configuration settings
│   │   ├── database.py              # Database connection (optional)
│   │   ├── models.py                # SQLAlchemy models (optional)
│   │   ├── schemas.py               # Pydantic schemas for validation
│   │   ├── security.py              # JWT and authentication logic
│   │   ├── routers/                 # API endpoints
│   │   │   ├── auth_json.py         # JSON-based authentication
│   │   │   ├── tasks_json.py        # Task management
│   │   │   ├── calendar.py          # Calendar events
│   │   │   ├── reminders.py         # Reminders
│   │   │   ├── knowledge.py         # Knowledge base
│   │   │   ├── documents.py         # Document references
│   │   │   ├── chat.py              # AI chat interface
│   │   │   ├── search.py            # Search functionality
│   │   │   ├── team.py              # Team member management
│   │   │   ├── feedback.py          # User feedback
│   │   │   ├── task_templates.py    # Task templates
│   │   │   └── admin.py             # Admin-only features
│   │   └── services/                # Business logic
│   │       ├── claude_service.py    # Claude AI integration
│   │       └── json_storage.py      # JSON file operations
│   ├── data/                        # JSON data storage (auto-created)
│   ├── requirements.txt
│   └── .env                         # Environment variables (create this)
│
├── frontend/
│   ├── src/
│   │   ├── components/              # React components
│   │   │   ├── TileLayout.jsx       # Responsive grid layout
│   │   │   ├── Tile.jsx             # Reusable tile container
│   │   │   ├── Dashboard.jsx        # Analytics dashboard
│   │   │   ├── TaskPlanner.jsx      # Task management
│   │   │   ├── Calendar.jsx         # Event scheduling
│   │   │   ├── Reminders.jsx        # Reminder system
│   │   │   ├── KnowledgeBase.jsx    # Knowledge management
│   │   │   ├── Documents.jsx        # Document tracking
│   │   │   ├── ChatInterface.jsx    # AI chat
│   │   │   ├── SearchBar.jsx        # Global search
│   │   │   ├── SearchResults.jsx    # Search results display
│   │   │   ├── FeedbackForm.jsx     # User feedback submission
│   │   │   └── AdminPanel.jsx       # Admin dashboard
│   │   ├── services/
│   │   │   └── api.js               # API client with auth interceptors
│   │   ├── App.jsx                  # Main app with routing
│   │   ├── main.jsx                 # React entry point
│   │   └── index.css                # Global styles with Tailwind
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── .env                         # Environment variables (create this)
│
├── README.md                        # This file
├── ARCHITECTURE.md                  # System architecture documentation
└── QUICKSTART.md                    # Quick deployment guide
```

## 🔌 API Endpoints

### Authentication
- `POST /auth/login` - Login with access code
- `GET /auth/session` - Get current session info
- `POST /auth/logout` - Logout (client-side JWT removal)

### Tasks
- `GET /tasks/` - Get all active tasks (excludes archived)
- `GET /tasks/archived` - Get archived tasks
- `GET /tasks/{id}` - Get specific task
- `POST /tasks/` - Create new task
- `PUT /tasks/{id}` - Update task
- `PATCH /tasks/{id}/archive` - Archive task
- `PATCH /tasks/{id}/unarchive` - Unarchive task
- `DELETE /tasks/{id}` - Delete task

### Calendar
- `GET /calendar/` - Get all events
- `GET /calendar/range?start=X&end=Y` - Get events in date range
- `POST /calendar/` - Create new event
- `PUT /calendar/{id}` - Update event
- `DELETE /calendar/{id}` - Delete event

### Reminders
- `GET /reminders/?active_only=true` - Get reminders
- `GET /reminders/upcoming` - Get upcoming reminders
- `POST /reminders/` - Create new reminder
- `PUT /reminders/{id}` - Update reminder
- `DELETE /reminders/{id}` - Delete reminder

### Knowledge Base
- `GET /knowledge/?category=X` - Get all entries (optional filter)
- `GET /knowledge/search/{term}` - Search entries
- `POST /knowledge/` - Create new entry
- `PUT /knowledge/{id}` - Update entry
- `DELETE /knowledge/{id}` - Delete entry

### Documents
- `GET /documents/?file_type=X` - Get all documents (optional filter)
- `GET /documents/search/{term}` - Search documents
- `POST /documents/` - Create new document
- `PUT /documents/{id}` - Update document
- `DELETE /documents/{id}` - Delete document

### Chat (AI Assistant)
- `POST /chat/` - Send message to Claude AI
- `GET /chat/history` - Get chat history
- `DELETE /chat/history` - Clear chat history

### Search
- `POST /search/` - Search across all data types
- `POST /search/ai` - AI-powered search with analysis

### Team Management
- `GET /team/` - Get all team members

### Task Templates
- `GET /task-templates/` - Get all templates
- `GET /task-templates/{id}` - Get specific template
- `POST /task-templates/` - Create new template
- `PUT /task-templates/{id}` - Update template
- `DELETE /task-templates/{id}` - Delete template
- `POST /task-templates/bulk-import` - Bulk import templates

### Feedback
- `POST /feedback/` - Submit feedback
- `GET /feedback/` - Get all feedback (admin only)
- `DELETE /feedback/{id}` - Delete feedback (admin only)

### Admin (Admin Access Only)
- `GET /admin/login-attempts?limit=100` - View login audit trail
- `GET /admin/access-codes` - View all access codes
- `GET /admin/team` - Get team configuration
- `PUT /admin/team` - Update team configuration
- `GET /admin/database` - List available data types
- `GET /admin/database/{type}` - View data for specific type

## 📖 Usage Guide

### For Members

#### Managing Your Tasks
1. Click "New Task" in the Task Planner tile
2. Fill in task details:
   - Title (required)
   - Description
   - Priority (low, medium, high, urgent)
   - Status (todo, in_progress, completed, cancelled)
   - Due date
   - Assignee (your name or team member)
   - Time to complete (in minutes)
3. Optionally use a template to pre-fill common tasks
4. Click "Create Task"
5. View your tasks sorted by status
6. Archive completed tasks to keep your list clean

#### Using the Dashboard
- **Task Priority**: See breakdown of urgent, high, medium, and low priority tasks
- **Task Status**: Monitor todos, in-progress, completed, and cancelled tasks
- **Active Tasks**: View all pending tasks with due dates (including overdue)
- **Team Workload**:
  - Click "Today" to see work completed today
  - Click "This Week" to see cumulative work this week
  - Green = under capacity, Yellow/Orange = approaching capacity, Red = over capacity

#### Scheduling Events
1. Click "New Event" in the Calendar tile
2. Enter event details (title, description, start/end times, location)
3. Check "All Day Event" if applicable
4. Save the event

#### Setting Reminders
1. Click "New Reminder"
2. Set reminder date/time
3. Reminders show as overdue if time has passed

#### Using AI Chat
1. Type questions or requests in the chat interface
2. Ask about tasks, get productivity tips, or general assistance
3. Chat history is saved for your session

#### Searching
1. Enter a query in the top search bar
2. Toggle "AI Search" for Claude-powered analysis
3. Results are organized by category (tasks, calendar, knowledge, etc.)

### For Administrators

#### Accessing Admin Panel
1. Log in with an admin access code
2. Click "Admin Panel" in the header
3. You'll see additional management tiles

#### Managing Login Activity
- View all login attempts (successful and failed)
- Monitor IP addresses and timestamps
- Identify security issues

#### Team Configuration
- Add/remove team members
- Set daily capacity (in minutes) for each person
- Assign roles

#### Task Templates
- Create templates for recurring tasks
- Bulk import templates via JSON
- Edit or delete existing templates

#### Archived Tasks
- Review archived tasks
- Unarchive tasks if needed
- Permanently delete old tasks

#### Database Viewer
- Select any data type to view
- Download data as JSON for backups
- Review system data

#### User Feedback
- Read feedback submissions
- Delete resolved feedback items

## 🔧 Development

### Backend Development

```bash
# Run with auto-reload
cd backend
source venv/bin/activate
uvicorn app.main:app --reload

# Check code formatting
black app/
flake8 app/

# Run tests (when implemented)
pytest
```

### Frontend Development

```bash
cd frontend

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Linting
npm run lint
```

### Adding New Features

#### Backend
1. Create schema in `schemas.py`
2. Add router in `routers/` directory
3. Implement JSON storage operations in router
4. Register router in `main.py`
5. Test via `/docs` endpoint

#### Frontend
1. Create component in `components/`
2. Add API methods in `services/api.js`
3. Import and use component in `App.jsx` or `AdminPanel.jsx`
4. Style with Tailwind CSS classes

## 🚢 Deployment

### Backend (Render)
1. Push code to GitHub
2. Render auto-deploys from `main` branch
3. Environment variables configured in Render dashboard
4. Data persists in `/data` directory on Render disk

### Frontend (Netlify)
1. Push code to GitHub
2. Netlify auto-deploys from `main` branch
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Environment variable: `VITE_API_BASE_URL`

### Deployment Checklist
- [ ] Update environment variables on Render
- [ ] Update environment variables on Netlify
- [ ] Verify CORS origins include production URLs
- [ ] Test all features after deployment
- [ ] Check login functionality
- [ ] Verify API health endpoint
- [ ] Test admin panel features

## 🐛 Troubleshooting

### Login Issues
- **Problem**: "Invalid password" error
- **Solution**: Verify access code is correct (no extra spaces)
- **Check**: Login attempts in Admin panel for details

### Backend 502 Errors
- **Problem**: Backend returning 502 Bad Gateway
- **Solution**: Check Render logs for errors
- **Common Cause**: Environment variables missing or incorrect

### CORS Errors
- **Problem**: Frontend can't connect to backend
- **Solution**: Ensure `CORS_ORIGINS` in backend includes frontend URL
- **Check**: Browser console for specific CORS error

### Data Not Persisting
- **Problem**: Changes don't save after restart
- **Solution**: Verify `/data` directory exists with write permissions
- **Check**: Render disk storage is mounted correctly

### Workload Shows Zero
- **Problem**: Team workload distribution shows 0 hours
- **Solution**:
  - Ensure tasks have `due_date` set
  - Mark tasks as "Completed" (not just in_progress)
  - Workload tracks completed tasks by due date

### Admin Panel Not Accessible
- **Problem**: Admin Panel button not visible
- **Solution**: Verify you're logged in with an admin access code
- **Check**: Role is "ADMIN" in session info

## 📊 System Metrics

- **Active Users**: 5 team members
- **Access Codes**: 6 total (2 admin, 4 member)
- **Deployment**: Render + Netlify
- **Storage**: JSON files on persistent disk
- **Uptime**: Auto-restarts on Render
- **Security**: JWT tokens, access code authentication

## 🎯 Feature Roadmap

### Completed ✅
- [x] Task management with templates
- [x] Workload tracking by team member
- [x] Archive system
- [x] Admin panel
- [x] Database viewer
- [x] Login auditing
- [x] AI chat integration
- [x] Global search

### Planned 🎯
- [ ] Email/SMS reminders
- [ ] Mobile responsive improvements
- [ ] Dark mode
- [ ] Recurring tasks
- [ ] Task dependencies
- [ ] File attachments
- [ ] Calendar sync (Google, Outlook)
- [ ] Export reports (PDF, Excel)
- [ ] Custom access code management

## 📄 License

This project is private and proprietary for Fox Run family use.

## 👥 Support

For issues or questions:
- Check the Admin panel for system status
- Review API documentation at `/docs`
- Submit feedback via the Feedback tile
- Contact system administrator

## 🙏 Acknowledgments

- Built with Claude Code assistance
- Powered by Anthropic's Claude AI
- Hosted on Render and Netlify
- UI icons from Lucide React
