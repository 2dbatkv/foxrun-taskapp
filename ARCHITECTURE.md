# Fox Run Task Tracker - System Architecture

This document describes the system architecture, design decisions, development journey, and technical implementation of the Fox Run Task Tracker.

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Diagrams](#architecture-diagrams)
3. [Backend Architecture](#backend-architecture)
4. [Frontend Architecture](#frontend-architecture)
5. [Data Layer](#data-layer)
6. [Authentication & Security](#authentication--security)
7. [Development Journey](#development-journey)
8. [Key Technical Decisions](#key-technical-decisions)
9. [Deployment Architecture](#deployment-architecture)
10. [Performance Optimizations](#performance-optimizations)

---

## System Overview

Fox Run Task Tracker is a full-stack family productivity application built for 5 concurrent users. It features role-based access control, real-time workload tracking, AI-powered assistance, and comprehensive admin tools.

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                         Users (5)                             │
│              (2 Admins + 4 Members)                           │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│                    Frontend (Netlify)                         │
│                                                                │
│  React 18 + Vite + Tailwind CSS                              │
│  - Dashboard                                                  │
│  - Task Management                                            │
│  - Calendar & Reminders                                       │
│  - Knowledge Base & Documents                                 │
│  - AI Chat Interface                                          │
│  - Admin Panel (role-gated)                                   │
│                                                                │
│  https://foxruntasks.netlify.app                             │
└───────────────────────┬──────────────────────────────────────┘
                        │ HTTPS/REST
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│                    Backend (Render)                           │
│                                                                │
│  FastAPI + Python 3.12                                        │
│  - RESTful API (15+ endpoints)                               │
│  - JWT Authentication                                         │
│  - Role-based Access Control                                  │
│  - JSON Storage Layer                                         │
│  - Claude AI Integration                                      │
│                                                                │
│  https://fox-run-task-planner.onrender.com                   │
└───────────────────────┬───────────┬──────────────────────────┘
                        │           │
                        │           └───────────────┐
                        ▼                           ▼
        ┌───────────────────────┐    ┌──────────────────────────┐
        │   Persistent Disk     │    │   Anthropic Claude API   │
        │   /data/*.json        │    │   (Sonnet 3.5)           │
        │   - tasks.json        │    │   - Chat                 │
        │   - team.json         │    │   - Search               │
        │   - access_codes.json │    │   - Analysis             │
        │   - 7 more files      │    └──────────────────────────┘
        └───────────────────────┘
```

---

## Architecture Diagrams

### Component Architecture

```
Frontend Components
├── App.jsx (Root)
│   ├── LoginPanel (unauthenticated)
│   └── MainWorkspace (authenticated)
│       ├── Header (with SearchBar)
│       ├── Dashboard
│       ├── TaskPlanner
│       ├── Calendar
│       ├── Reminders
│       ├── KnowledgeBase
│       ├── Documents
│       ├── ChatInterface
│       ├── FeedbackForm
│       └── SearchResults (conditional)
│
└── AdminPanel (admin role only)
    ├── LoginAttemptsTile
    ├── TeamManagementTile
    ├── TaskTemplateLibraryTile
    ├── ArchivedTasksTile
    ├── DatabaseViewerTile
    ├── FeedbackListTile
    └── All main workspace components
```

### Backend API Structure

```
FastAPI Application
├── main.py (Entry point)
│   ├── CORS Configuration
│   ├── Auth Router (auth_json.py)
│   └── Feature Routers:
│
├── routers/
│   ├── auth_json.py         (POST /auth/login, GET /auth/session)
│   ├── tasks_json.py         (CRUD + archive/unarchive)
│   ├── calendar.py           (CRUD + date range queries)
│   ├── reminders.py          (CRUD + upcoming queries)
│   ├── knowledge.py          (CRUD + search)
│   ├── documents.py          (CRUD + search)
│   ├── chat.py               (Claude AI integration)
│   ├── search.py             (Multi-entity search + AI)
│   ├── team.py               (Team member management)
│   ├── task_templates.py     (CRUD + bulk import)
│   ├── feedback.py           (User feedback)
│   └── admin.py              (Admin-only endpoints)
│
├── services/
│   ├── json_storage.py       (Data persistence layer)
│   └── claude_service.py     (Anthropic API wrapper)
│
├── security.py               (JWT + access control)
├── schemas.py                (Pydantic models)
├── models.py                 (SQLAlchemy models - optional)
└── config.py                 (Settings management)
```

---

## Backend Architecture

### Technology Stack
- **Framework**: FastAPI 0.104+
- **Python**: 3.12
- **Data Storage**: JSON files (primary), PostgreSQL (optional fallback)
- **Authentication**: JWT tokens with 24-hour expiration
- **AI Integration**: Anthropic Claude API (Sonnet 3.5)
- **CORS**: Configured for Netlify frontend

### Key Design Patterns

#### 1. JSON Storage Layer
```python
# backend/app/services/json_storage.py
class JSONStorage:
    def __init__(self, data_dir="/data"):
        self.data_dir = Path(data_dir)

    def get_all(self, entity: str) -> List[Dict]
    def get_by_id(self, entity: str, id: int) -> Optional[Dict]
    def create(self, entity: str, item: Dict) -> Dict
    def update(self, entity: str, id: int, updates: Dict) -> Optional[Dict]
    def delete(self, entity: str, id: int) -> bool
```

**Why JSON Storage?**
- Simple, file-based persistence
- No database server required
- Easy backups (copy files)
- Version-controllable data (git)
- Fast read/write for small datasets
- Works on Render's persistent disk

#### 2. Router Pattern
Each feature is isolated in its own router module:

```python
# Example: tasks_json.py
router = APIRouter(
    prefix="/tasks",
    tags=["tasks"],
    dependencies=[Depends(require_role(AccessRole.MEMBER))]
)

@router.get("/", response_model=List[schemas.Task])
def get_tasks(skip: int = 0, limit: int = 100, include_archived: bool = False):
    tasks = json_storage.get_all("tasks")
    if not include_archived:
        tasks = [t for t in tasks if not t.get('is_archived', False)]
    return tasks[skip:skip + limit]
```

#### 3. Dependency Injection for Auth
```python
# backend/app/security.py
def require_role(required_role: AccessRole):
    async def role_checker(user: dict = Depends(get_current_user)):
        if user["role"] != required_role.value and user["role"] != AccessRole.ADMIN.value:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user
    return role_checker
```

### API Response Format

All endpoints follow consistent response patterns:

**Success (200/201)**:
```json
{
  "id": 123,
  "title": "Task title",
  "created_at": "2025-10-29T12:00:00",
  "updated_at": "2025-10-29T12:00:00"
}
```

**Error (4xx/5xx)**:
```json
{
  "detail": "Error description"
}
```

### Authentication Flow

```
1. User submits access code
   ↓
2. Backend hashes code and compares with stored hash
   ↓
3. If valid, generate JWT token (24h expiration)
   ↓
4. Return token + user info (label, role, expires_at)
   ↓
5. Frontend stores token in localStorage
   ↓
6. All subsequent requests include: Authorization: Bearer <token>
   ↓
7. Backend validates token on each request
```

---

## Frontend Architecture

### Technology Stack
- **Framework**: React 18.2.0
- **Build Tool**: Vite 5.0
- **Styling**: Tailwind CSS 3.3
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **State Management**: React hooks (useState, useEffect)

### Component Hierarchy

```
App.jsx (Root Component)
│
├── State Management
│   ├── auth (authenticated, user info, token)
│   ├── showAdminView (boolean)
│   ├── searchResults (search data)
│   └── isAISearch (boolean)
│
├── Authentication Layer
│   └── if (!auth.authenticated) → LoginPanel
│
└── if (auth.authenticated)
    │
    ├── if (showAdminView) → AdminPanel
    │
    └── else → MainWorkspace
        ├── Header
        │   ├── Logo
        │   ├── SearchBar
        │   ├── Admin Panel button (if admin)
        │   └── Sign Out
        │
        ├── SearchResults (conditional)
        │
        └── Dashboard (TileLayout)
            ├── Dashboard (analytics)
            ├── TaskPlanner
            ├── Calendar
            ├── Reminders
            ├── KnowledgeBase
            ├── Documents
            ├── ChatInterface
            └── FeedbackForm
```

### State Management Strategy

**Global State (App.jsx)**:
- Authentication state
- Admin view toggle
- Search results
- AI search toggle

**Local State (Components)**:
- Form data
- Loading states
- Error messages
- Component-specific data

### API Integration Pattern

```javascript
// services/api.js - Centralized API client
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor: Add auth token
api.interceptors.request.use((config) => {
  const token = getActiveToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthToken();
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    return Promise.reject(error);
  }
);

// Feature-specific APIs
export const tasksAPI = {
  getAll: () => api.get('/tasks/'),
  create: (data) => api.post('/tasks/', data),
  // ... more methods
};
```

### UI Design System

**Tile-Based Layout**:
```jsx
<TileLayout>
  <Tile title="Component Title" className="lg:col-span-2">
    {/* Content */}
  </Tile>
</TileLayout>
```

**Color Palette**:
- Primary: Blue (#3B82F6)
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Danger: Red (#EF4444)
- Neutral: Gray scale

**Responsive Breakpoints**:
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px

---

## Data Layer

### Storage Architecture

**Production (Render)**: JSON files on persistent disk at `/data/`
**Local Development**: JSON files in `backend/data/`

### Data Schema

#### tasks.json
```json
{
  "tasks": [
    {
      "id": 1,
      "title": "Complete project",
      "description": "Finish the task tracker",
      "priority": "high",
      "status": "in_progress",
      "due_date": "2025-10-30T00:00:00",
      "assignee": "Aaron",
      "time_to_complete_minutes": 120,
      "is_archived": false,
      "created_at": "2025-10-29T12:00:00",
      "updated_at": "2025-10-29T12:00:00",
      "completed_at": null
    }
  ]
}
```

#### access_codes.json
```json
{
  "access_codes": [
    {
      "id": 1,
      "label": "AJB - Admin (9553AJB)",
      "code_hash": "$2b$12$hashed_code_here",
      "role": "admin",
      "is_active": true,
      "created_at": "2025-10-29T12:00:00"
    }
  ]
}
```

#### login_attempts.json
```json
{
  "login_attempts": [
    {
      "id": 1,
      "submitted_code": "9553***",
      "code_label": "AJB - Admin (9553AJB)",
      "code_role": "admin",
      "success": true,
      "failure_reason": null,
      "client_ip": "192.168.1.1",
      "created_at": "2025-10-29T12:00:00"
    }
  ]
}
```

### Data Relationships

```
Team Members (team.json)
    ↓ (assignee reference)
Tasks (tasks.json)
    ↓ (templates reference)
Task Templates (task_templates.json)

Calendar Events (calendar.json)
    ↓ (no direct relations)
Independent

Reminders (reminders.json)
    ↓ (no direct relations)
Independent

Knowledge Base (knowledge.json)
    ↓ (category grouping)
Organized by category

Documents (documents.json)
    ↓ (file_type grouping)
Organized by type

Access Codes (access_codes.json)
    ↓ (used for authentication)
Login Attempts (login_attempts.json)
```

---

## Authentication & Security

### Access Code System

**Why Access Codes Instead of Username/Password?**
1. Simplified family sharing
2. No password reset complexity
3. Easy to communicate (e.g., "Use code 9127SAM")
4. Admin can track which code is used
5. No email validation required

### Security Measures

1. **Password Hashing**: bcrypt with 12 rounds
2. **JWT Tokens**: 24-hour expiration, HS256 algorithm
3. **CORS**: Whitelist specific origins only
4. **Role-Based Access**: Member vs Admin permissions
5. **Login Auditing**: All attempts logged with IP
6. **Token Refresh**: Manual (logout/login)

### Access Control Matrix

| Feature | Member | Admin |
|---------|--------|-------|
| Tasks CRUD | ✅ | ✅ |
| Calendar CRUD | ✅ | ✅ |
| Reminders CRUD | ✅ | ✅ |
| Knowledge CRUD | ✅ | ✅ |
| Documents CRUD | ✅ | ✅ |
| Chat/Search | ✅ | ✅ |
| Feedback Submit | ✅ | ✅ |
| Team View | ✅ | ✅ |
| Template View | ✅ | ✅ |
| Login Activity | ❌ | ✅ |
| Team Management | ❌ | ✅ |
| Template Management | ❌ | ✅ |
| Archived Tasks Management | ❌ | ✅ |
| Database Viewer | ❌ | ✅ |
| Feedback Management | ❌ | ✅ |

---

## Development Journey

### Phase 1: Foundation (Completed)
- ✅ FastAPI backend setup
- ✅ React frontend with Vite
- ✅ Basic CRUD for tasks, calendar, reminders
- ✅ Knowledge base and documents
- ✅ Authentication system
- ✅ JWT implementation
- ✅ Initial deployment to Render + Netlify

### Phase 2: Intelligence (Completed)
- ✅ Claude AI integration
- ✅ Chat interface
- ✅ Global search
- ✅ AI-powered search
- ✅ Dashboard analytics
- ✅ Priority and status tracking

### Phase 3: Team Features (Completed October 2025)
- ✅ Access code authentication (6 codes)
- ✅ Role-based access control (admin/member)
- ✅ Team management
- ✅ Team workload tracking (daily/weekly)
- ✅ Task templates library
- ✅ Task archive system
- ✅ Admin panel
- ✅ Login activity monitoring
- ✅ Database viewer
- ✅ User feedback system

### Key Milestones

**October 27, 2025**: Initial deployment
- Backend on Render
- Frontend on Netlify
- PostgreSQL database setup

**October 28, 2025**: Migration to JSON storage
- PostgreSQL connection issues
- Implemented JSON storage fallback
- Created graceful database failover

**October 29, 2025**: Phase 3 completion
- Task templates
- Archive functionality
- Database viewer
- Workload tracking fixes
- Login attempts tracking
- 5 users actively using system

---

## Key Technical Decisions

### 1. JSON Storage Over PostgreSQL

**Decision**: Use JSON files as primary storage

**Rationale**:
- Render's PostgreSQL had connectivity issues
- JSON files are simpler for small team
- Easy backups via database viewer
- No database maintenance required
- Fast enough for 5 concurrent users
- Persistent disk on Render works reliably

**Trade-offs**:
- ❌ No complex queries
- ❌ No transactions
- ❌ Manual relationship management
- ✅ Simple deployment
- ✅ No database costs
- ✅ Easy data export

### 2. Access Codes vs Username/Password

**Decision**: Use pre-configured access codes

**Rationale**:
- Family environment (trusted users)
- No need for self-registration
- Easy to share codes
- Simpler implementation
- No password reset flow needed

### 3. Workload by Due Date

**Decision**: Track workload by task due_date, not completed_at

**Rationale**:
- Reflects when work was scheduled
- Monday's 8h task counts for Monday, even if completed Wednesday
- Better capacity planning
- Aligns with how family assigns work

### 4. Tile-Based UI

**Decision**: Use tile/card layout instead of tabs or pages

**Rationale**:
- All features visible at once
- No navigation required
- Easy to scan
- Mobile-friendly scrolling
- Familiar dashboard pattern

### 5. Auto-Deploy on Git Push

**Decision**: Continuous deployment from main branch

**Rationale**:
- Fast iteration
- No manual deployment steps
- Immediate feedback
- Reduces deployment friction

---

## Deployment Architecture

### Production Infrastructure

```
GitHub Repository (main branch)
    ↓ (webhook triggers)
    ├─→ Netlify (Frontend)
    │   - Build: npm run build
    │   - Deploy: dist/ folder
    │   - CDN distribution
    │   - HTTPS automatic
    │
    └─→ Render (Backend)
        - Build: pip install -r requirements.txt
        - Start: uvicorn app.main:app
        - Persistent disk: /data
        - Environment variables
        - HTTPS automatic
```

### Environment Variables

**Backend (Render)**:
```
USE_JSON_STORAGE=true
SECRET_KEY=<generated 64-char hex>
ANTHROPIC_API_KEY=<claude api key>
CORS_ORIGINS=https://foxruntasks.netlify.app
JSON_DATA_DIR=/data
```

**Frontend (Netlify)**:
```
VITE_API_BASE_URL=https://fox-run-task-planner.onrender.com
```

### Deployment Process

1. Developer pushes to `main` branch
2. GitHub webhook notifies Render and Netlify
3. **Netlify**:
   - Pulls latest code
   - Runs `npm install`
   - Runs `npm run build`
   - Deploys `dist/` to CDN
   - **Duration**: 2-3 minutes
4. **Render**:
   - Pulls latest code
   - Installs Python dependencies
   - Restarts uvicorn server
   - **Duration**: 2-3 minutes
5. Changes live at production URLs

### Rollback Strategy

```bash
# Find previous commit
git log --oneline

# Revert to previous commit
git revert <commit-hash>

# Or reset (if safe)
git reset --hard <previous-commit>

# Push
git push origin main
```

### Backup Strategy

**Automated** (via Database Viewer):
- Admin can download any data type as JSON
- Recommended: Weekly backups

**Manual** (via Render):
```bash
# SSH into Render (if available) or use API
curl -H "Authorization: Bearer <token>" \
  https://fox-run-task-planner.onrender.com/admin/database/tasks > tasks_backup.json
```

---

## Performance Optimizations

### Backend Optimizations

1. **JSON Storage Caching**: Files only read when accessed
2. **FastAPI Async**: Uses uvicorn with async support
3. **Pagination**: All list endpoints support skip/limit
4. **Selective Loading**: Admin endpoints don't load all data at startup

### Frontend Optimizations

1. **Code Splitting**: Vite automatically splits chunks
2. **Lazy Loading**: Components loaded as needed
3. **Memoization**: React.memo on expensive components
4. **Debouncing**: Search input debounced 300ms
5. **Image Optimization**: Icons from Lucide (tree-shaken)

### Database Query Patterns

**Efficient**:
```python
# Load once, filter in memory
tasks = json_storage.get_all("tasks")
active_tasks = [t for t in tasks if t['status'] != 'completed']
```

**Avoid**:
```python
# Don't load full dataset for each operation
for id in task_ids:
    task = json_storage.get_by_id("tasks", id)  # Multiple reads
```

### Caching Strategy

Currently **no caching** implemented. For future:
- Client-side cache (React Query or SWR)
- Redis for backend (if needed)
- CDN caching for static assets (Netlify provides)

---

## Future Architecture Considerations

### Scalability

**Current capacity**: 5-20 users
**Growth path** (if needed):
1. Migrate to PostgreSQL (code already exists)
2. Add Redis for caching
3. Implement websockets for real-time updates
4. Split into microservices if needed

### Security Enhancements

- Two-factor authentication
- IP whitelisting
- Rate limiting
- Audit log exports
- Encrypted data at rest

### Feature Extensions

- Real-time collaboration (WebSockets)
- Mobile app (React Native)
- Email/SMS notifications (Twilio)
- File uploads (S3)
- Calendar sync (Google/Outlook APIs)
- Recurring tasks (cron-like)

---

## Conclusion

Fox Run Task Tracker demonstrates a pragmatic architecture balancing simplicity with functionality. The JSON storage approach, while unconventional, provides reliable persistence for a small team without database complexity. The modular router pattern and tile-based UI create a maintainable, extensible system that can grow with the family's needs.

**Key Success Factors**:
1. Simple, battle-tested technologies
2. Clear separation of concerns
3. Comprehensive admin tools
4. Automated deployment pipeline
5. Family-first design decisions

**Lessons Learned**:
1. Start simple, optimize later
2. JSON files work fine for small teams
3. Good observability (login tracking) is essential
4. Auto-deploy accelerates iteration
5. User feedback drives features (workload tracking)

---

## References

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Anthropic Claude API](https://docs.anthropic.com/)
- [Render Documentation](https://render.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)

---

**Document Version**: 1.0
**Last Updated**: October 29, 2025
**Maintained By**: Fox Run Development Team
**Built with**: Claude Code assistance
