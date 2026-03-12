# Grievon - Citizen Grievance Portal

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Conversational grievance submission chat interface with AI-guided step-by-step flow
- Auto-categorization of grievances into predefined civic categories
- Department routing based on grievance category
- Citizen dashboard to track grievance status
- Grievance ID generation and structured summary after submission
- Admin/authority panel to view, update status, and add remarks
- Sample/seed grievances for demo
- Authorization system for admin vs citizen roles

### Modify
N/A

### Remove
N/A

## Implementation Plan

### Backend (Motoko)
- Data types: Grievance (id, citizenName, description, category, department, location, severity, duration, status, createdAt, updatedAt, adminRemark, conversationHistory)
- Grievance categories enum: Roads & Infrastructure, Water Supply, Electricity, Sanitation, Public Safety, Healthcare, Education, Other
- Department routing map: category -> department name
- CRUD: submitGrievance, getGrievanceById, getGrievancesByUser, getAllGrievances (admin), updateGrievanceStatus (admin), addRemark (admin)
- ID generation: unique alphanumeric grievance IDs (GRV-YYYYMMDD-XXXX)
- Seed data: 5 sample grievances across different categories and statuses
- Authorization: admin role check for admin-only operations

### Frontend
- Navigation: Home/Submit, My Grievances, Admin Panel (role-gated)
- Conversational chat UI: message bubbles, typing indicators, step-based guided flow
  - Step 1: Describe problem (free text)
  - Step 2: Confirm/adjust detected category
  - Step 3: Provide location
  - Step 4: Severity and duration
  - Step 5: Any additional details
  - Step 6: Review and confirm submission
  - Step 7: Show grievance ID and summary
- Citizen dashboard: list of submitted grievances with status badges, detail view
- Admin panel: full grievance list with filters, status update dropdown, remark input
- Status badges: Submitted (gray), Under Review (yellow), In Progress (blue), Resolved (green)
- Responsive layout, blue/white government-inspired design
