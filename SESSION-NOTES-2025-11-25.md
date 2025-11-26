# Session Notes - November 25, 2025

## Projects Worked On

### 1. GoCaving.AI Landing Page
### 2. Fox Run Task Tracker - Major Architecture Redesign

---

## GoCaving.AI Updates

### Completed Changes

#### 1. Added YouTube Recording to Past Recordings Section
- **Video:** November 18, 2025 discussion - "Caving Software and AI"
- **YouTube URL:** https://www.youtube.com/watch?v=j1pbNItf42A
- **Implementation:** Embedded YouTube player with responsive design
- **Details Panel:** Topics covered, description, link to watch on YouTube
- **Commit:** Pushed to GitHub, auto-deployed to Netlify

#### 2. Updated Upcoming Discussions Section
- **Removed:** November 18 event (now past)
- **Added:** December 9, 2025 discussion
- **Title:** "Democratizing Cave Survey and Cartography"
- **Time:** Tuesday, December 9, 2025 at 8:00 PM Eastern
- **Zoom:** https://us06web.zoom.us/j/85163958864?pwd=Wu5Q6bOfDfbbptBgWILKyaCNXQI6Um.1
- **Topics:**
  - DistoX2, BRIC-4, BRIC-5, digital sketching, AI tools
  - Opening cave mapping while maintaining data quality
  - Crowdsourcing cave maps: opportunities, risks, guardrails
  - Reducing the "bus factor of 1" in cave cartography
  - Beginner-friendly workflows with expert-level accuracy
  - AI eliminating bottlenecks in large cave projects

#### Deployment Status
- **Repository:** https://github.com/2dbatkv/go-caving-ai
- **Live Site:** gocaving.ai
- **Hosting:** Netlify (frontend), Render (forms/backend if needed)
- **Auto-deploy:** Yes, via GitHub push

---

## Fox Run Task Tracker - Architecture Redesign

### Current State (Before Changes)

**System:**
- 6 users with access codes (2 admin, 4 member)
- All users see all tasks
- Tasks created/managed within the app
- Data stored in JSON files on Render backend
- FastAPI backend, React frontend
- Deployed: Netlify (frontend) + Render (backend)

**Users:**
- Aaron (9553AJB) - Admin
- Rai (9566RFB) - Admin
- Sam (9127SAM) - Member
- ZB (1112ZBB) - Member
- TB (7226TBB) - Member
- Aur (9807AUR) - Member

### Desired State (After Changes)

**Core Requirement:**
> "Users should only see tasks assigned to them. Admins (Aaron & Rai) assign tasks in a Google Sheet. When users complete tasks, the completion syncs back to the Google Sheet."

### Key Changes Needed

1. **Task Assignment:** Google Sheet → Zapier → Render → Frontend
2. **User View:** Filtered tasks (only see your assignments)
3. **Task Completion:** Frontend → Render → Zapier → Google Sheet
4. **Admin View:** Toggle between "My Tasks" and "All Tasks"
5. **Single Source of Truth:** Google Sheet (not app)

### Design Decisions Made

User provided answers: **A C B A**

#### 1. Assignee Mapping: Option A
- **Google Sheet uses:** Short names (Aaron, Rai, Sam, ZB, TB, Aur)
- **Backend maps to:** Access codes (9553AJB, 9566RFB, etc.)
- **Rationale:** More user-friendly in Google Sheets

**Mapping:**
```
Aaron → 9553AJB (Admin)
Rai   → 9566RFB (Admin)
Sam   → 9127SAM (Member)
ZB    → 1112ZBB (Member)
TB    → 7226TBB (Member)
Aur   → 9807AUR (Member)
```

#### 2. Admin View: Option C
- **Behavior:** Toggle between "My Tasks" and "All Tasks"
- **Rationale:** Gives admins flexibility for oversight
- **Implementation:** Frontend switch/toggle component

#### 3. Existing Tasks: Option B
- **Action:** Archive existing tasks, start fresh from Sheet
- **Rationale:** Clean slate, avoid confusion
- **Migration:** Existing tasks moved to archive before go-live

#### 4. Task Creation: Option A
- **Source:** Google Sheet only (single source of truth)
- **App Behavior:** Users cannot create tasks, only view/complete
- **Admins:** Add tasks via Google Sheet, not app interface
- **Rationale:** Prevents sync conflicts, keeps it simple

### Architecture Decision: Webhooks via Zapier

**Challenge:** No direct Zapier-to-Render connector

**Solution:** Webhook-based integration

#### Data Flow 1: Google Sheet → Render (Task Assignment)

```
[Admin updates Google Sheet]
         ↓
[Zapier detects change - "New or Updated Row" trigger]
         ↓
[Zapier sends POST webhook to Render]
         ↓
POST https://foxrun-taskapp-backend.onrender.com/webhooks/zapier/tasks
Headers:
  - Content-Type: application/json
  - X-Zapier-Secret: [secret_token]
Body: {task data from Sheet}
         ↓
[Render validates secret, updates tasks.json]
         ↓
[Frontend fetches filtered tasks via existing API]
         ↓
[User sees only their assigned tasks]
```

#### Data Flow 2: Render → Google Sheet (Task Completion)

```
[User clicks complete checkbox]
         ↓
[Frontend calls PUT /tasks/{id}]
         ↓
[Render updates task status in tasks.json]
         ↓
[Render sends POST to Zapier webhook URL]
         ↓
POST https://hooks.zapier.com/hooks/catch/[zap-id]/
Body: {task_id, status, completed_date, completed_by}
         ↓
[Zapier catches webhook]
         ↓
[Zapier finds matching row by task_id]
         ↓
[Zapier updates Sheet: Status, Completed Date, Completed By]
```

### Zapier Plan

**Current:** Free tier (100 tasks/month, 15-min intervals)
**Needed:** Starter tier ($19.99/month)
**Capacity:** 750 tasks/month, 2-minute intervals, 20 Zaps
**Shared:** Will also use for GoCaving.AI integrations

### Implementation Approach: Prototype First

**Strategy:** Build Google Sheet + Zapier flow first, then adapt backend

**Rationale:**
- Discover real requirements through experimentation
- See actual Zapier data structure before coding
- Iterate quickly without backend changes
- Document what works, then implement once

**Steps:**
1. ✅ Create Google Sheet template
2. ⏳ Add sample tasks
3. ⏳ Set up Zapier → webhook.site (test endpoint)
4. ⏳ Document actual JSON payload received
5. Design backend endpoint based on real data
6. Implement backend webhooks
7. Update Zapier to point to Render
8. Test end-to-end flow

### Google Sheet Structure Designed

**Sheet Name:** Fox Run Tasks
**File:** Single Google Sheet, shared with Zapier

**Columns (12 total):**

| Col | Name | Type | Example | Purpose |
|-----|------|------|---------|---------|
| A | Task ID | Formula | FR-001 | Unique ID: `="FR-" & TEXT(ROW()-1, "000")` |
| B | Title | Text | Clean kitchen | Task name (required) |
| C | Description | Text | Wipe counters... | Details (optional) |
| D | Assignee | Dropdown | Sam | Who does the work |
| E | Priority | Dropdown | high | low, medium, high, urgent |
| F | Due Date | Date | 12/15/2025 | Deadline |
| G | Status | Dropdown | todo | todo, in_progress, completed |
| H | Completed Date | Date | 11/22/2025 | Auto-filled by Zapier |
| I | Completed By | Text | Sam | Auto-filled by Zapier |
| J | Time (minutes) | Number | 60 | Estimated duration |
| K | Created Date | Formula | 11/22/2025 | `=IF(B2<>"", TODAY(), "")` |
| L | Created By | Dropdown | Aaron | Aaron or Rai |

**Data Validation:**
- Assignee: Aaron, Rai, Sam, ZB, TB, Aur
- Priority: low, medium, high, urgent
- Status: todo, in_progress, completed
- Created By: Aaron, Rai

### Backend Changes Required

#### New Files to Create:
1. `backend/app/routers/webhooks.py` - Webhook endpoints
2. `backend/app/config.py` - Add Zapier env vars

#### New Endpoints:
1. `POST /webhooks/zapier/tasks` - Receive tasks from Zapier
2. Modified: `PUT /tasks/{id}` - Add webhook call on completion

#### New Environment Variables:
```env
ZAPIER_WEBHOOK_SECRET=your_secret_key_here
ZAPIER_COMPLETION_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/[id]/
```

#### Key Backend Logic:
- Validate incoming webhook secret (security)
- Map Sheet task_id to internal task ID
- Store `sheet_task_id` field for linkage
- Filter tasks by assignee in GET /tasks/ endpoint
- Send completion webhook asynchronously (don't block user)

### Frontend Changes Required

#### TaskPlanner.jsx Modifications:
1. **Filter tasks by user:**
   ```javascript
   const userTasks = tasks.filter(task =>
     task.assignee === currentUser.username ||
     task.assignee === currentUser.access_code
   );
   ```

2. **Admin toggle (for Aaron & Rai):**
   ```javascript
   const [viewMode, setViewMode] = useState('my'); // 'my' or 'all'
   const displayTasks = isAdmin && viewMode === 'all'
     ? tasks
     : userTasks;
   ```

3. **Remove "Create Task" button** (or hide for non-admins)
   - Users can only view/complete, not create

4. **Update task completion flow**
   - Call existing API endpoint
   - Show loading state while syncing
   - Display "Synced to Google Sheet" confirmation

### Testing Strategy

#### Phase 1: Zapier Testing (Current)
- Use webhook.site to capture real Zapier payload
- Document exact JSON structure
- Note date formats, data types, field names

#### Phase 2: Backend Implementation
- Build webhook receiver based on actual Zapier data
- Add secret validation
- Test with curl/Postman

#### Phase 3: Zapier → Render
- Update Zapier to point to Render endpoint
- Add secret header
- Test with Sheet updates

#### Phase 4: Render → Zapier
- Set up Zapier Catch Hook
- Configure Sheet update action
- Test completion flow

#### Phase 5: Frontend Integration
- Deploy frontend changes
- Test filtered task view
- Test admin toggle
- Test task completion → Sheet sync

#### Phase 6: End-to-End Validation
- Admin adds task in Sheet
- User sees task in app
- User completes task
- Completion appears in Sheet
- Verify timestamps, assignees correct

### Documentation Created

1. **GOOGLE-SHEET-ZAPIER-INTEGRATION.md**
   - Implementation log
   - Sheet structure
   - Zapier configurations
   - Testing log template
   - Space for actual JSON payloads

2. **SESSION-NOTES-2025-11-22.md** (this file)
   - High-level decisions
   - Architecture overview
   - Full context and reasoning

### Current Status

**Completed:**
- ✅ Architecture design
- ✅ Design decisions (A C B A)
- ✅ Google Sheet structure defined
- ✅ Data flow diagrams
- ✅ Documentation created

**In Progress:**
- ⏳ User creating Google Sheet
- ⏳ Adding sample data
- ⏳ Setting up Zapier test integration

**Next Steps:**
1. User creates Google Sheet with template
2. User sets up webhook.site test endpoint
3. User configures Zapier: Sheet → webhook.site
4. User tests and documents JSON payload
5. Review JSON together
6. Design/implement backend endpoints
7. Update Zapier to Render
8. Implement frontend filtering
9. Test complete flow

### Open Questions

1. **Date Format:** Will Zapier send dates as ISO 8601 or MM/DD/YYYY?
2. **Empty Fields:** How does Zapier handle empty/null values?
3. **Update Detection:** Does Zapier trigger on any column change or specific columns?
4. **Rate Limits:** How quickly can Zapier sync (2-min intervals on Starter)?
5. **Error Handling:** What if Render endpoint is down when Zapier sends?
6. **Conflict Resolution:** What if Sheet and app both updated simultaneously?

### Technical Considerations

**Pros of This Approach:**
- ✅ Google Sheets = familiar interface for admins
- ✅ Zapier = no-code integration, reliable
- ✅ Webhooks = real-time or near-real-time
- ✅ Users get personalized, focused view
- ✅ Admins retain oversight with toggle
- ✅ Single source of truth (Sheet) prevents conflicts

**Potential Challenges:**
- ⚠️ Sync delays (2-15 min depending on Zapier tier)
- ⚠️ Zapier task limits (need Starter tier)
- ⚠️ Need error handling for failed webhooks
- ⚠️ Migration plan for existing tasks
- ⚠️ User education (can't create tasks in app anymore)
- ⚠️ Webhook security (must validate secret token)

### Success Criteria

**System works when:**
1. Admin adds task in Sheet → appears in user's app within 2 min
2. User completes task → Sheet updates within 2 min
3. Users only see their assigned tasks (no confusion)
4. Admins can toggle to see all tasks (oversight)
5. No duplicate tasks or sync conflicts
6. Completed tasks stay completed (no overwrites)
7. System handles offline users gracefully
8. Error logs capture failed syncs for debugging

### Future Enhancements (Post-MVP)

- Task comments/notes in Sheet
- Email notifications when task assigned
- Task due date reminders
- Recurring task templates
- Task priority escalation (auto-change priority as due date approaches)
- Mobile app optimization
- Offline mode for users
- Task history/audit trail
- Reporting dashboard for admins
- Workload balancing suggestions (AI)

---

## Key Decisions Summary

| Decision Point | Choice | Rationale |
|----------------|--------|-----------|
| Assignee Format | Short names (map to codes) | User-friendly in Sheets |
| Admin View | Toggle My/All | Flexibility + oversight |
| Existing Tasks | Archive and start fresh | Clean slate, no confusion |
| Task Creation | Google Sheet only | Single source of truth |
| Sync Method | Zapier + webhooks | No direct connector available |
| Zapier Tier | Starter ($19.99/mo) | Needed for frequency + volume |
| Implementation | Prototype first | Learn real requirements |
| Test Method | webhook.site first | See actual Zapier data |

---

## Action Items

### For User (Aaron):
- [ ] Create Google Sheet with template structure
- [ ] Add 3-5 sample tasks with varied assignees
- [ ] Set up webhook.site test endpoint
- [ ] Configure Zapier: Google Sheet → webhook.site
- [ ] Test Zapier and capture JSON payload
- [ ] Paste JSON into GOOGLE-SHEET-ZAPIER-INTEGRATION.md
- [ ] Review findings with Claude

### For Implementation (Next Session):
- [ ] Review actual Zapier JSON payload together
- [ ] Design backend webhook endpoint to match data structure
- [ ] Implement `POST /webhooks/zapier/tasks` endpoint
- [ ] Add ZAPIER_WEBHOOK_SECRET validation
- [ ] Implement completion webhook sender
- [ ] Add ZAPIER_COMPLETION_WEBHOOK_URL to config
- [ ] Update Zapier to point to Render
- [ ] Modify frontend TaskPlanner for filtering
- [ ] Add admin toggle component
- [ ] Test end-to-end flow
- [ ] Archive existing tasks
- [ ] Deploy to production

---

## Resources & Links

### GoCaving.AI
- **Live Site:** https://gocaving.ai
- **GitHub:** https://github.com/2dbatkv/go-caving-ai
- **Netlify:** Auto-deploy from main branch

### Fox Run Task Tracker
- **Live Site:** https://foxruntasks.netlify.app
- **Backend:** https://foxrun-taskapp-backend.onrender.com
- **API Docs:** https://foxrun-taskapp-backend.onrender.com/docs
- **GitHub:** https://github.com/2dbatkv/foxrun-taskapp

### Tools
- **Zapier:** https://zapier.com/app/zaps
- **Webhook.site:** https://webhook.site
- **Render Dashboard:** https://dashboard.render.com
- **Netlify Dashboard:** https://app.netlify.com

### Documentation Files
- `/home/ajbir/task-planner-app/GOOGLE-SHEET-ZAPIER-INTEGRATION.md` - Implementation details
- `/home/ajbir/task-planner-app/SESSION-NOTES-2025-11-22.md` - This file
- `/home/ajbir/task-planner-app/README.md` - Project overview
- `/home/ajbir/task-planner-app/ARCHITECTURE.md` - System architecture

---

## Notes & Observations

### Why This Approach Makes Sense

**Aaron's Perspective:**
- Admins already comfortable with spreadsheets
- Google Sheets = flexible, familiar, accessible
- No need to learn new admin interface
- Easy bulk operations (copy/paste tasks)
- Can use Sheet formulas for automation

**User Perspective:**
- Focused view (only my tasks)
- Less overwhelming than seeing everything
- Clear assignments (no confusion about who does what)
- Simple completion flow (checkbox)

**Technical Perspective:**
- Zapier handles syncing complexity
- No need to build custom admin UI
- Webhooks = reliable, standard approach
- Leverages existing backend infrastructure
- Frontend changes are minimal

### Lessons from GoCaving.AI

**What worked well:**
- Simple static site with dynamic content
- Netlify auto-deploy from GitHub
- Good documentation (README, guides)
- Clear separation of concerns

**Applied to Fox Run:**
- Keep backend simple (webhooks, not complex API)
- Document everything as we build
- Test in stages (webhook.site first)
- Use proven tools (Zapier, not custom sync)

---

*Session Date: November 25, 2025*
*Duration: ~2 hours*
*Projects: GoCaving.AI, Fox Run Task Tracker*
*Next Session: Continue with Zapier testing and backend implementation*
