# Task Planner & Productivity Suite

A comprehensive full-stack productivity application featuring task management, calendar, reminders, knowledge base, document references, and AI-powered assistance through Claude API.

## Features

- **Task Planner**: Create, update, and manage tasks with priorities, statuses, and due dates
- **Calendar**: Schedule and manage events with date/time ranges and locations
- **Reminders**: Set up reminders with notifications for important items
- **Knowledge Base**: Store and organize notes, documentation, and information
- **Document References**: Keep track of files and external resources
- **AI Assistant**: Chat with Claude AI for intelligent assistance
- **Smart Search**: Search across all data types with optional AI-powered analysis
- **Tile-Based UI**: Clean, responsive interface with modular components

## Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **PostgreSQL**: Robust relational database
- **SQLAlchemy**: ORM for database operations
- **Anthropic Claude API**: AI-powered chat and search
- **Pydantic**: Data validation and settings management

### Frontend
- **React**: Component-based UI library
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API calls
- **Lucide React**: Beautiful icon library

## Prerequisites

- Python 3.8+
- Node.js 18+
- PostgreSQL 12+
- Anthropic API Key

## Installation & Setup

### 1. Clone and Navigate to Project

```bash
cd /home/ajbir/task-planner-app
```

### 2. Backend Setup

#### Install PostgreSQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Create Database
```bash
sudo -u postgres psql
```

In PostgreSQL prompt:
```sql
CREATE DATABASE task_planner_db;
CREATE USER your_username WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE task_planner_db TO your_username;
\q
```

#### Set Up Python Environment
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
```bash
# Copy example env file
cp .env.example .env

# Edit .env file with your credentials
nano .env
```

Update `.env` with:
```env
DATABASE_URL=postgresql://your_username:your_password@localhost/task_planner_db
ANTHROPIC_API_KEY=your_anthropic_api_key_here
SECRET_KEY=generate_with_openssl_rand_hex_32
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

# The project is already configured with Tailwind CSS and Vite
```

## Running the Application

### Start Backend Server

```bash
cd backend
source venv/bin/activate  # Activate virtual environment
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Alternative Docs: http://localhost:8000/redoc

### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will be available at: http://localhost:5173

## Project Structure

```
task-planner-app/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── config.py            # Configuration settings
│   │   ├── database.py          # Database connection
│   │   ├── models.py            # SQLAlchemy models
│   │   ├── schemas.py           # Pydantic schemas
│   │   ├── routers/             # API endpoints
│   │   │   ├── tasks.py
│   │   │   ├── calendar.py
│   │   │   ├── reminders.py
│   │   │   ├── knowledge.py
│   │   │   ├── documents.py
│   │   │   ├── chat.py
│   │   │   └── search.py
│   │   └── services/            # Business logic
│   │       └── claude_service.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── TileLayout.jsx
│   │   │   ├── Tile.jsx
│   │   │   ├── TaskPlanner.jsx
│   │   │   ├── Calendar.jsx
│   │   │   ├── Reminders.jsx
│   │   │   ├── KnowledgeBase.jsx
│   │   │   ├── Documents.jsx
│   │   │   ├── ChatInterface.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   └── SearchResults.jsx
│   │   ├── services/            # API service layer
│   │   │   └── api.js
│   │   ├── App.jsx              # Main app component
│   │   ├── main.jsx             # Entry point
│   │   └── index.css            # Global styles
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```

## API Endpoints

### Tasks
- `GET /tasks/` - Get all tasks
- `GET /tasks/{id}` - Get specific task
- `POST /tasks/` - Create new task
- `PUT /tasks/{id}` - Update task
- `DELETE /tasks/{id}` - Delete task

### Calendar
- `GET /calendar/` - Get all events
- `GET /calendar/range` - Get events in date range
- `POST /calendar/` - Create new event
- `PUT /calendar/{id}` - Update event
- `DELETE /calendar/{id}` - Delete event

### Reminders
- `GET /reminders/` - Get all reminders
- `GET /reminders/upcoming` - Get upcoming reminders
- `POST /reminders/` - Create new reminder
- `PUT /reminders/{id}` - Update reminder
- `DELETE /reminders/{id}` - Delete reminder

### Knowledge Base
- `GET /knowledge/` - Get all entries
- `GET /knowledge/search/{term}` - Search entries
- `POST /knowledge/` - Create new entry
- `PUT /knowledge/{id}` - Update entry
- `DELETE /knowledge/{id}` - Delete entry

### Documents
- `GET /documents/` - Get all documents
- `GET /documents/search/{term}` - Search documents
- `POST /documents/` - Create new document
- `PUT /documents/{id}` - Update document
- `DELETE /documents/{id}` - Delete document

### Chat
- `POST /chat/` - Send message to Claude
- `GET /chat/history` - Get chat history
- `DELETE /chat/history` - Clear chat history

### Search
- `POST /search/` - Search across all data types
- `POST /search/ai` - AI-powered search with Claude

## Usage Guide

### Managing Tasks
1. Click "New Task" in the Task Planner tile
2. Fill in task details (title, description, priority, status, due date)
3. Click "Create Task" to save
4. Edit or delete tasks using the action buttons

### Scheduling Events
1. Click "New Event" in the Calendar tile
2. Enter event details (title, description, start/end times, location)
3. Optionally mark as "All Day Event"
4. Click "Create Event" to save

### Setting Reminders
1. Click "New Reminder" in the Reminders tile
2. Enter reminder details and set the remind time
3. The reminder will show as overdue if the time has passed

### Using the Knowledge Base
1. Click "New Entry" to add information
2. Organize with categories and tags
3. Click on entries to expand and view full content

### Chat with AI Assistant
1. Type your message in the chat interface
2. Ask questions about your tasks, schedule, or for general assistance
3. Claude will help you manage your productivity

### Smart Search
1. Enter a search query in the top search bar
2. Toggle "AI Search" for Claude-powered analysis
3. View results organized by category

## Development

### Backend Development

```bash
# Run with auto-reload
uvicorn app.main:app --reload

# Run tests (if implemented)
pytest

# Create database migrations
alembic revision --autogenerate -m "description"
alembic upgrade head
```

### Frontend Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running: `sudo systemctl status postgresql`
- Check database credentials in `.env`
- Verify database exists: `psql -U your_username -d task_planner_db`

### Backend Port Already in Use
```bash
# Find process using port 8000
lsof -i :8000

# Kill the process
kill -9 <PID>
```

### Frontend CORS Issues
- Ensure backend is running on port 8000
- Check CORS settings in `backend/app/main.py`

### API Key Issues
- Verify your Anthropic API key is valid
- Check the key is correctly set in `.env`
- Ensure no extra spaces or quotes in the key

## Future Enhancements

- User authentication and authorization
- Real-time notifications
- File upload for documents
- Export data to various formats
- Mobile responsive improvements
- Dark mode
- Recurring events and tasks
- Task dependencies and subtasks
- Collaborative features

## License

This project is open source and available for educational purposes.

## Support

For issues or questions, please refer to the project documentation or contact the development team.
