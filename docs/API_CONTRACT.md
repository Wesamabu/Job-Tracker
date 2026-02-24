# Job-Tracker API Contract
Milestone 1 – Dashboard + Applications

This document defines the REST API contract between the frontend and backend.

All JSON fields use **camelCase**.
All responses return JSON.

---

# Base URL

Local Development Example:
http://localhost:PORT

---

# Data Models

## Application

Represents a single job or internship application.

```json
phase1:
{
  "id": number,
  "companyName": string,
  "role": string,
  "status": string,
  "dateApplied": string
}
phase2:
{
  "id": "string",
  "companyName": "Google",
  "role": "Software Engineer Intern",
  "status": "APPLIED",
  "dateApplied": "2026-02-18",
  "resumeId": "string or null",
  "resumeName": "Backend Resume v2",
  "jobUrl": "https://example.com/job-posting",
  "jobDescription": "Full job description text...",
  "createdAt": "2026-02-18T21:20:00Z",
  "updatedAt": "2026-02-19T03:10:00Z"
}

Status Values (Enum)

The following values must be used:

APPLIED

INTERVIEW

REJECTED

OFFER

Resume

Represents a stored resume.

{
  "id": "string",
  "name": "Backend Resume v2",
  "fileName": "backend_resume_v2.pdf",
  "createdAt": "2026-02-10T14:00:00Z"
}
DashboardStats

Represents aggregated dashboard metrics.

{
  "totalApplications": 42,
  "totalResponses": 13,
  "responseRate": 31.0,
  "totalInterviews": 8,
  "interviewRate": 19.0,
  "avgResponseTimeDays": 12.4
}

Notes:

Percentages are returned as numbers between 0 and 100.

If no applications exist, rates return 0.

Endpoints
Health Check
GET /health

Response:

{ "status": "ok" }
Applications
GET /applications

Returns all applications.

Response:

{
  "items": [ /* Application[] */ ],
  "total": 42
}
POST /applications

Creates a new application.

Request Body:

{
  "companyName": "Google",
  "role": "Software Engineer Intern",
  "status": "APPLIED",
  "dateApplied": "2026-02-18",
  "resumeId": "string or null",
  "jobUrl": "https://example.com/job-posting",
  "jobDescription": "Full job description text..."
}

Response:

{ /* Application */ }
PATCH /applications/:id

Updates an existing application.
Primarily used for status updates.

Request Body (example):

{
  "status": "INTERVIEW"
}

Response:

{ /* Updated Application */ }
DELETE /applications/:id

Deletes an application.

Response:

{ "success": true }
Resumes
GET /resumes

Returns all resumes.

Response:

{
  "items": [ /* Resume[] */ ],
  "total": 3
}
POST /resumes

Uploads a new resume.

Request:

multipart/form-data

file

name (optional)

Response:

{ /* Resume */ }
Dashboard
GET /dashboard/stats

Returns aggregated dashboard statistics.

Response:

{ /* DashboardStats */ }
Error Format

All errors should follow this structure:

{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "companyName is required"
  }
}

Common error codes:

VALIDATION_ERROR

NOT_FOUND

INTERNAL_ERROR
