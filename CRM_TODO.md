'''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
                                        
                                            
                                            podes continaur a implementar

You are a full-stack engineer tasked with building a production-ready CRM system for QuimeraTech. Your objective is to create a complete, functional, scalable application—not a mockup or interface prototype.

**Core Requirement:**

Every feature must be fully functional and database-backed. All data must persist, relate correctly, and support the complete workflows described. This is a real system, not a demo.

**System Scope:**

Build a multi-module CRM covering:

- Lead management with qualification pipeline

- Company and contact management with relationships

- Client profiles with health scoring

- Sales opportunities and proposals

- Project management with tasks and milestones

- Contracts and document management

- Financial tracking (invoices, payments, expenses)

- Support ticketing

- Activity timeline and audit history

- Notifications and automations

- Global search and permissions

**Database Architecture:**

Create a relational schema with these core entities and proper foreign keys:

`users`, `companies`, `contacts`, `leads`, `opportunities`, `clients`, `proposals`, `proposal_items`, `projects`, `project_tasks`, `milestones`, `activities`, `meetings`, `contracts`, `invoices`, `payments`, `expenses`, `documents`, `tickets`, `notifications`, `tags`, `audit_logs`

Prevent data duplication through proper relationships. Example: a company should not be duplicated when a lead converts to a client—create the relationship instead.

**Lead Management:**

Build a complete lead lifecycle with states: NEW → QUALIFIED → CONTACTED → MEETING → PROPOSAL → NEGOTIATION → WON / LOST

Each lead must store: name, company, email, phone, website, origin, service interest, estimated value, probability, state, priority, owner, notes, tags, creation date, last contact, next follow-up.

Implement lead actions: create, edit, delete, convert, add notes, create tasks, log activities, schedule follow-ups, move in pipeline, search, filter, sort.

When a lead moves to WON, surface an action to "Convert to Client" that automatically creates the company (if new), contact, client record, and marks the opportunity as won—without duplicating existing data.

**Pipeline View:**

Create a professional Kanban interface with columns for each lead state (New, Qualified, Contacted, Meeting, Proposal, Negotiation, Won, Lost).

Support drag-and-drop state changes. When a lead moves:

- Update the database immediately

- Record the state change in audit history

- Refresh related metrics

- Log an activity entry for the change

**Companies & Contacts:**

Company fields: name, NIF, website, email, phone, address, sector, size, description, state, owner, tags.

Contacts belong to companies. Each contact stores: name, title, email, phone, LinkedIn, primary contact flag, notes.

Relationships flow from company to leads, opportunities, projects, proposals, contracts, invoices, documents, and activities.

**Client Dashboard (High Priority):**

When opening a client record, display immediately:

*Overview section:* name, state, primary contact, total value, active projects, proposals, contracts, tasks, last interaction, next interaction.

*Client Health Score:* Calculate based on objective rules (recent activity, project status, task completion, communication frequency, proposal pipeline, payment history). Display as Healthy / At Risk / Critical with the underlying rationale, never as arbitrary judgments.

*Timeline:* Chronological view of emails, meetings, calls, notes, proposals, contracts, changes, tasks, payments, documents.

Layout must answer these questions in seconds: "Who is this?" "What are we doing?" "What's the value?" "What's pending?" "Is there a problem?" "What's next?"

**Dashboard & Insights:**

Main dashboard must answer: "How is the business doing?"

Include cards for: new leads, qualified leads, open opportunities, sent proposals, accepted proposals, projected revenue, won revenue, active projects, overdue projects, pending tasks, overdue follow-ups.

*Pipeline visualization:* Show the lead journey with visual flow and count at each stage.

*Revenue view:* This month's revenue, last month's revenue, projected revenue, pipeline revenue, average deal size.

*Activity view:* Today's tasks, upcoming follow-ups, upcoming meetings, recent activities.

*Quimera Insights section:* Real, data-driven alerts like "3 leads have no follow-up in 7+ days," "Pipeline grew 18% this month," "2 proposals awaiting response," "Project X is overdue," "Client X has no recent activity." Never invent data.

Dedicated Insights page with categories (Sales, Clients, Projects, Finance, Productivity) showing: conversion rate, pipeline value, average deal size, win rate, revenue per client, inactive clients, on-time delivery rate, budget deviation, monthly revenue, outstanding payments, task completion rate, overdue tasks.

**Proposals:**

Integrate proposals into the CRM workflow. Each proposal links to lead, company, contact, client, and/or project.

States: DRAFT, SENT, VIEWED, NEGOTIATION, ACCEPTED, REJECTED, EXPIRED.

Track: value, expiry date, creation date, send date, acceptance date.

When accepted, surface "Convert to Project" to create a linked project automatically.

**Projects:**

Fields: name, client, description, owner, state, priority, budget, value, start date, deadline, progress percentage, linked proposal, linked contract.

States: PLANNING, IN_PROGRESS, ON_HOLD, REVIEW, COMPLETED, CANCELLED.

Sections: Overview, Tasks, Milestones, Timeline, Files, Activities, Meetings, Notes, Budget.

**Tasks:**

Fields: title, description, owner, linked project/client, priority, state, deadline, estimate, time spent.

States: TODO, IN_PROGRESS, BLOCKED, REVIEW, DONE.

Views: list, Kanban, calendar.

Associate tasks to clients and projects.

**Contracts:**

Fields: number, client, project, type, value, start date, end date, state, document, notes.

States: DRAFT, SENT, SIGNED, ACTIVE, EXPIRED, CANCELLED.

Create alerts for contracts nearing expiry.

**Financial Module:**

Simplified internal view (not replacing accounting software). Show: contracted value, invoiced value, received value, pending value, monthly revenue, annual revenue, revenue by client, revenue by project.

Track invoices, payments, expenses with states: PENDING, PARTIALLY_PAID, PAID, OVERDUE, CANCELLED.

**Activities & Audit:**

Global activity timeline logging all events: calls, emails, meetings, notes, tasks, proposals, contracts, payments, status changes.

Each activity records: type, description, user, date, linked entity.

Audit log captures critical changes with: user, action, entity, old value, new value, timestamp. Example: "Rafael changed ACME opportunity from Proposal to Negotiation."

**Support Module:**

Simple ticketing system. Fields: number, client, project, subject, description, priority, state, owner, created, updated.

States: OPEN, IN_PROGRESS, WAITING_CLIENT, RESOLVED, CLOSED.

**Notifications:**

System must alert on: task deadline approaching, task overdue, pending follow-up, proposal expiring, contract expiring, payment overdue, new ticket, project overdue.

Include a notification center.

**Automations:**

Implement deterministic automations:

- Lead moves to WON → auto-create client record

- Proposal accepted → enable "Convert to Project"

- Project completed → suggest handover task

- Contract near expiry → create notification

- Task overdue → notify owner

- Invoice overdue → mark as OVERDUE status

- New lead → create initial activity entry

**UX Standards:**

- **Minimize clicks for common tasks:** Simple forms for adding leads, quick actions for creating tasks, drag/drop or dropdowns for state changes.

- **Global quick-action button (+)** for: New Lead, New Company, New Contact, New Proposal, New Project, New Task, New Meeting, New Note.

- **Never show blank screens.** Every empty state must explain the absence and offer a CTA (e.g., "No leads yet — + Create Lead").

- **Every page must handle loading, skeleton, error, and empty states.** Never leave a page white on failure; show errors with retry options.

- **Responsive and performant.** Drag-and-drop, filters, search must feel instant.

**Security:**

Implement: user authentication, role-based authorization, Row-Level Security (RLS), input validation, secure file storage, file type validation, safe error handling. Never expose secrets or API keys in frontend code.

**Deliverable:**

A fully functional CRM application with complete backend logic, database persistence, and frontend UI covering all modules described. Every feature must work end-to-end; data relationships must be enforced; automations must execute; insights must be calculated from real data. Test the critical workflows: lead-to-client conversion, proposal-to-project, financial tracking, and notifications.