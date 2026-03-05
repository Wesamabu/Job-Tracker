# Job Tracker — Database Schema

## Overview

SQLite file-based database managed by SQLAlchemy ORM.
Tables are auto-created on server startup via `Base.metadata.create_all()`.

---

## Tables

### users
| Column | Type | Details |
|--------|------|---------|
| id | Integer | Primary key |
| created_at | DateTime | Auto-set on creation |

> Placeholder for authentication. Will be expanded in a future milestone.

---

### resumes
| Column | Type | Details |
|--------|------|---------|
| id | Integer | Primary key |
| user_id | Integer | Foreign key → users.id |
| name | String | Display name of the resume |
| file_path | String | Local file storage path |
| created_at | DateTime | Auto-set on creation |

---

### applications
| Column | Type | Details |
|--------|------|---------|
| id | Integer | Primary key |
| user_id | Integer | Foreign key → users.id |
| resume_id | Integer | Foreign key → resumes.id (nullable) |
| company_name | String | Required |
| role | String | Required |
| date_applied | String | Format: YYYY-MM-DD |
| status | String | APPLIED, INTERVIEW, REJECTED, OFFER |
| job_description | Text | Nullable |
| created_at | DateTime | Auto-set on creation |
| updated_at | DateTime | Auto-updated on every change |

---

## Relationships

```
User ──< Application
User ──< Resume
Resume ──< Application (optional)
```

- A User can have many Applications
- A User can have many Resumes
- An Application can optionally reference one Resume