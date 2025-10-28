# Quick Start Guide

Get your Task Planner & Productivity Suite up and running in minutes!

## Prerequisites Checklist

Before starting, ensure you have:
- [ ] Python 3.8+ installed (`python3 --version`)
- [ ] Node.js 18+ installed (`node --version`)
- [ ] PostgreSQL installed and running
- [ ] Anthropic API key (get one at https://console.anthropic.com/)

## 5-Minute Setup

### Step 1: PostgreSQL Database Setup (2 minutes)

```bash
# Start PostgreSQL
sudo systemctl start postgresql

# Create database and user
sudo -u postgres psql -c "CREATE DATABASE task_planner_db;"
sudo -u postgres psql -c "CREATE USER taskuser WITH PASSWORD 'taskpass123';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE task_planner_db TO taskuser;"
```

### Step 2: Backend Configuration (1 minute)

```bash
cd /home/ajbir/task-planner-app/backend

# Create and configure .env file
cat > .env << EOF
DATABASE_URL=postgresql://taskuser:taskpass123@localhost/task_planner_db
ANTHROPIC_API_KEY=your_api_key_here
SECRET_KEY=$(openssl rand -hex 32)
EOF

# Edit .env to add your Anthropic API key
nano .env
```

Replace `your_api_key_here` with your actual Anthropic API key.

### Step 3: Run Setup Script (2 minutes)

```bash
cd /home/ajbir/task-planner-app
./setup.sh
```

This will:
- Create Python virtual environment
- Install backend dependencies
- Install frontend dependencies

## Running the Application

### Option 1: Use the Start Script (Recommended)

```bash
cd /home/ajbir/task-planner-app
./start.sh
```

This starts both backend and frontend automatically!

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd /home/ajbir/task-planner-app/backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd /home/ajbir/task-planner-app/frontend
npm run dev
```

## Access Your Application

Once running, open your browser and visit:

- **Frontend App**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## First Steps

1. **Create Your First Task**
   - Click "New Task" in the Task Planner tile
   - Fill in the details and save

2. **Schedule an Event**
   - Click "New Event" in the Calendar tile
   - Add your first meeting or appointment

3. **Try the AI Assistant**
   - Scroll to the AI Assistant tile
   - Ask Claude a question like "What tasks do I have?"

4. **Search Everything**
   - Use the search bar at the top
   - Toggle AI search for intelligent results

## Common Issues & Solutions

### Issue: Database connection failed
**Solution:**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# If not running, start it
sudo systemctl start postgresql
```

### Issue: Port 8000 already in use
**Solution:**
```bash
# Find and kill the process using port 8000
lsof -i :8000
kill -9 <PID>
```

### Issue: Anthropic API error
**Solution:**
- Verify your API key in `backend/.env`
- Check your API key is active at https://console.anthropic.com/
- Ensure no extra spaces or quotes around the key

### Issue: Frontend can't connect to backend
**Solution:**
- Ensure backend is running on port 8000
- Check browser console for CORS errors
- Verify `http://localhost:5173` is in CORS allowed origins

## Testing the Features

### Tasks
1. Create a task with high priority
2. Update its status to "in_progress"
3. Mark it as completed

### Calendar
1. Create an all-day event for tomorrow
2. Create a timed event with start and end times
3. View your upcoming events

### Reminders
1. Set a reminder for 5 minutes from now
2. Mark a reminder as completed
3. View upcoming reminders

### Knowledge Base
1. Add a note with some useful information
2. Categorize it and add tags
3. Search for it using keywords

### Documents
1. Add a reference to a local file or URL
2. Categorize by file type
3. Search for documents

### AI Chat
1. Ask "Help me plan my day"
2. Ask "What tasks are due soon?"
3. Ask for productivity tips

### Search
1. Enter a search term in the top bar
2. View results across all categories
3. Try AI search for intelligent analysis

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Explore the API docs at http://localhost:8000/docs
- Customize the application to your needs
- Add your own features and components

## Getting Help

- Check the README.md for detailed documentation
- Review API documentation at http://localhost:8000/docs
- Check backend logs for error messages
- Check browser console for frontend issues

## Stopping the Application

If you used `./start.sh`, press `Ctrl+C` to stop both services.

If running manually, press `Ctrl+C` in each terminal window.

---

Enjoy your new productivity suite powered by Claude AI!
