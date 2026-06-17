# Timetable Management System — API Documentation

**Base URL:** `http://localhost:3333/api/v1`  
**Swagger UI:** `http://localhost:3333/api/docs`  
**Auth:** Bearer Token (JWT). Add `Authorization: Bearer <accessToken>` to every protected request.

All responses are wrapped in a standard envelope:
```json
{
  "statusCode": 200,
  "message": "success",
  "data": { ... }
}
```
Errors return:
```json
{
  "statusCode": 404,
  "timestamp": "2024-09-01T10:00:00.000Z",
  "path": "/api/v1/...",
  "message": "..."
}
```

---

## 1. Authentication

### 1.1 Login
`POST /api/v1/auth/login`  
**Auth:** None (public)

**Request body:**
```json
{
  "email": "admin@school.edu",
  "password": "password123"
}
```
**Response 200:**
```json
{
  "statusCode": 200,
  "message": "success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "role": "ADMIN"
  }
}
```
**Frontend usage:**
```js
const res = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const { data } = await res.json();
localStorage.setItem('accessToken', data.accessToken);
localStorage.setItem('refreshToken', data.refreshToken);
localStorage.setItem('role', data.role);
```

---

### 1.2 Logout
`POST /api/v1/auth/logout`  
**Auth:** Bearer token required

**Request body:**
```json
{ "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
```
**Response 200:**
```json
{ "statusCode": 200, "message": "success", "data": { "message": "Logged out successfully" } }
```

---

### 1.3 Refresh Access Token
`POST /api/v1/auth/refresh`  
**Auth:** None (public)

**Request body:**
```json
{ "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
```
**Response 200:**
```json
{
  "statusCode": 200,
  "message": "success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```
**Frontend usage:**
```js
// Call this when you receive a 401 response
async function refreshToken() {
  const res = await fetch('/api/v1/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: localStorage.getItem('refreshToken') })
  });
  const { data } = await res.json();
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  return data.accessToken;
}
```

---

### 1.4 Get Current User Profile
`GET /api/v1/auth/me`  
**Auth:** Bearer token required

**Response 200:**
```json
{
  "statusCode": 200,
  "message": "success",
  "data": {
    "id": "clx1abc",
    "email": "admin@school.edu",
    "role": "ADMIN",
    "admin": { "id": "clx2def", "firstName": "John", "lastName": "Doe" }
  }
}
```
*For LECTURER role, `data.lecturer` is populated instead of `data.admin`. For STUDENT, `data.student` is populated.*

---

## 2. Admin

All endpoints require `ADMIN` role.

### 2.1 Get All Admins
`GET /api/v1/admin`

**Response 200:**
```json
{
  "data": [
    {
      "id": "clx2def",
      "firstName": "John",
      "lastName": "Doe",
      "createdAt": "2024-09-01T10:00:00.000Z",
      "user": { "id": "clx1abc", "email": "admin@school.edu", "role": "ADMIN" }
    }
  ]
}
```

### 2.2 Create Admin
`POST /api/v1/admin`

**Request body:**
```json
{
  "email": "newadmin@school.edu",
  "password": "securePass123",
  "firstName": "Jane",
  "lastName": "Smith"
}
```

### 2.3 Update Admin
`PATCH /api/v1/admin/:id`

**Request body (all fields optional):**
```json
{
  "firstName": "Updated",
  "lastName": "Name",
  "email": "updated@school.edu"
}
```

### 2.4 Delete Admin
`DELETE /api/v1/admin/:id`

---

## 3. Lecturers

### 3.1 Get All Lecturers
`GET /api/v1/lecturers`  
**Auth:** ADMIN only

**Response 200:**
```json
{
  "data": [
    {
      "id": "clxlec1",
      "staffId": "STF001",
      "firstName": "James",
      "lastName": "Brown",
      "departmentId": "clxdept1",
      "user": { "id": "clxusr2", "email": "jbrown@school.edu", "role": "LECTURER" },
      "department": { "id": "clxdept1", "name": "Computer Science", "code": "CS" }
    }
  ]
}
```

### 3.2 Get Single Lecturer
`GET /api/v1/lecturers/:id`  
**Auth:** ADMIN or LECTURER (own)

### 3.3 Create Lecturer
`POST /api/v1/lecturers`  
**Auth:** ADMIN only

**Request body:**
```json
{
  "email": "lecturer@school.edu",
  "password": "password123",
  "firstName": "James",
  "lastName": "Brown",
  "staffId": "STF001",
  "departmentId": "clxdept1"
}
```

### 3.4 Update Lecturer
`PATCH /api/v1/lecturers/:id`  
**Auth:** ADMIN only

### 3.5 Delete Lecturer
`DELETE /api/v1/lecturers/:id`  
**Auth:** ADMIN only

### 3.6 Get Courses Assigned to a Lecturer
`GET /api/v1/lecturers/:id/courses`  
**Auth:** ADMIN, LECTURER

**Response 200:**
```json
{
  "data": [
    {
      "course": {
        "id": "clxcrs1",
        "code": "CS101",
        "name": "Intro to Computer Science",
        "credits": 3,
        "level": "L100",
        "department": { "id": "clxdept1", "name": "Computer Science", "code": "CS" }
      }
    }
  ]
}
```

### 3.7 Get Lecturer Availability (Booked Slots)
`GET /api/v1/lecturers/:id/availability`  
**Auth:** ADMIN only

**Response 200:**
```json
{
  "data": [
    {
      "id": "clxslot1",
      "day": "MONDAY",
      "startTime": "08:00",
      "endTime": "10:00",
      "venue": "LT1",
      "timetable": { "id": "clxtt1", "semester": "FIRST", "academicYear": "2024/2025", "department": { "name": "Computer Science" }, "level": "L100" },
      "course": { "code": "CS101", "name": "Intro to CS" }
    }
  ]
}
```

---

## 4. Students

### 4.1 Get All Students
`GET /api/v1/students?department=<id>&level=L100`  
**Auth:** ADMIN only

**Query params (optional):**
- `department` — filter by department ID
- `level` — `L100 | L200 | L300 | L400 | L500`

**Response 200:**
```json
{
  "data": [
    {
      "id": "clxstu1",
      "studentId": "STU001",
      "firstName": "Alice",
      "lastName": "Smith",
      "level": "L100",
      "user": { "id": "clxusr3", "email": "alice@school.edu", "role": "STUDENT" },
      "department": { "id": "clxdept1", "name": "Computer Science", "code": "CS" }
    }
  ]
}
```

### 4.2 Get Single Student
`GET /api/v1/students/:id`  
**Auth:** ADMIN, or STUDENT (own)

### 4.3 Create Student
`POST /api/v1/students`  
**Auth:** ADMIN only

**Request body:**
```json
{
  "email": "student@school.edu",
  "password": "password123",
  "firstName": "Alice",
  "lastName": "Smith",
  "studentId": "STU001",
  "departmentId": "clxdept1",
  "level": "L100"
}
```

### 4.4 Update Student
`PATCH /api/v1/students/:id`  
**Auth:** ADMIN only

### 4.5 Delete Student
`DELETE /api/v1/students/:id`  
**Auth:** ADMIN only

---

## 5. Departments

### 5.1 Get All Departments
`GET /api/v1/departments`  
**Auth:** Any logged-in user

**Response 200:**
```json
{
  "data": [
    {
      "id": "clxdept1",
      "name": "Computer Science",
      "code": "CS",
      "createdAt": "2024-09-01T10:00:00.000Z",
      "_count": { "lecturers": 5, "students": 120, "courses": 18 }
    }
  ]
}
```

### 5.2 Create Department
`POST /api/v1/departments`  
**Auth:** ADMIN only

**Request body:**
```json
{
  "name": "Computer Science",
  "code": "CS"
}
```

### 5.3 Update Department
`PATCH /api/v1/departments/:id`  
**Auth:** ADMIN only

### 5.4 Delete Department
`DELETE /api/v1/departments/:id`  
**Auth:** ADMIN only

---

## 6. Courses

### 6.1 Get All Courses
`GET /api/v1/courses?department=<id>&level=L100`  
**Auth:** Any logged-in user

**Query params (optional):**
- `department` — filter by department ID
- `level` — `L100 | L200 | L300 | L400 | L500`

**Response 200:**
```json
{
  "data": [
    {
      "id": "clxcrs1",
      "code": "CS101",
      "name": "Intro to Computer Science",
      "credits": 3,
      "level": "L100",
      "isShared": false,
      "department": { "id": "clxdept1", "name": "Computer Science", "code": "CS" },
      "lecturers": [
        { "lecturer": { "id": "clxlec1", "firstName": "James", "lastName": "Brown", "staffId": "STF001" } }
      ]
    }
  ]
}
```

### 6.2 Get Courses by Lecturer
`GET /api/v1/courses/lecturer/:lecturerId`  
**Auth:** ADMIN, LECTURER

### 6.3 Create Course
`POST /api/v1/courses`  
**Auth:** ADMIN only

**Request body:**
```json
{
  "code": "CS101",
  "name": "Intro to Computer Science",
  "credits": 3,
  "departmentId": "clxdept1",
  "level": "L100",
  "isShared": false
}
```

### 6.4 Update Course
`PATCH /api/v1/courses/:id`  
**Auth:** ADMIN only

### 6.5 Delete Course
`DELETE /api/v1/courses/:id`  
**Auth:** ADMIN only

### 6.6 Assign Lecturer to Course
`POST /api/v1/courses/:id/lecturers`  
**Auth:** ADMIN only

**Request body:**
```json
{ "lecturerId": "clxlec1" }
```

### 6.7 Remove Lecturer from Course
`DELETE /api/v1/courses/:id/lecturers/:lecturerId`  
**Auth:** ADMIN only

---

## 7. Timetable

### 7.1 Get All Timetables
`GET /api/v1/timetables?department=<id>&level=L100&semester=FIRST&status=DRAFT`  
**Auth:** Any logged-in user

**Query params (all optional):**
- `department` — department ID
- `level` — `L100 | L200 | L300 | L400 | L500`
- `semester` — `FIRST | SECOND`
- `status` — `DRAFT | PUBLISHED`

**Response 200:**
```json
{
  "data": [
    {
      "id": "clxtt1",
      "level": "L100",
      "semester": "FIRST",
      "academicYear": "2024/2025",
      "status": "DRAFT",
      "department": { "id": "clxdept1", "name": "Computer Science", "code": "CS" },
      "_count": { "slots": 12 }
    }
  ]
}
```

### 7.2 Get Single Timetable
`GET /api/v1/timetables/:id`  
**Auth:** Any logged-in user

**Response 200:**
```json
{
  "data": {
    "id": "clxtt1",
    "level": "L100",
    "semester": "FIRST",
    "academicYear": "2024/2025",
    "status": "PUBLISHED",
    "department": { "id": "clxdept1", "name": "Computer Science", "code": "CS" },
    "slots": [
      {
        "id": "clxslot1",
        "day": "MONDAY",
        "startTime": "08:00",
        "endTime": "10:00",
        "venue": "LT1",
        "course": { "id": "clxcrs1", "code": "CS101", "name": "Intro to CS", "level": "L100" },
        "lecturer": { "id": "clxlec1", "firstName": "James", "lastName": "Brown", "staffId": "STF001" }
      }
    ]
  }
}
```

### 7.3 Create Timetable
`POST /api/v1/timetables`  
**Auth:** ADMIN only

**Request body:**
```json
{
  "departmentId": "clxdept1",
  "level": "L100",
  "semester": "FIRST",
  "academicYear": "2024/2025"
}
```

### 7.4 Update Timetable Status
`PATCH /api/v1/timetables/:id/status`  
**Auth:** ADMIN only

**Request body:**
```json
{ "status": "PUBLISHED" }
```

### 7.5 Delete Timetable
`DELETE /api/v1/timetables/:id`  
**Auth:** ADMIN only

---

### 7.6 Get Slots for a Timetable
`GET /api/v1/timetables/:id/slots`  
**Auth:** Any logged-in user

**Response 200:**
```json
{
  "data": [
    {
      "id": "clxslot1",
      "day": "MONDAY",
      "startTime": "08:00",
      "endTime": "10:00",
      "venue": "LT1",
      "course": { "id": "clxcrs1", "code": "CS101", "name": "Intro to CS", "level": "L100" },
      "lecturer": { "id": "clxlec1", "firstName": "James", "lastName": "Brown", "staffId": "STF001" }
    }
  ]
}
```

### 7.7 Add a Slot
`POST /api/v1/timetables/:id/slots`  
**Auth:** ADMIN only

**Request body:**
```json
{
  "day": "MONDAY",
  "startTime": "08:00",
  "endTime": "10:00",
  "courseId": "clxcrs1",
  "lecturerId": "clxlec1",
  "venue": "LT1"
}
```
**On conflict, response 400:**
```json
{
  "statusCode": 400,
  "message": "Slot conflicts detected",
  "data": {
    "message": "Slot conflicts detected",
    "conflicts": [
      {
        "type": "LECTURER_DOUBLE_BOOKED",
        "conflictingSlotIds": ["clxslot99"],
        "details": "Lecturer is already scheduled for CS201 (08:00–10:00) on MONDAY"
      }
    ]
  }
}
```

### 7.8 Update a Slot
`PATCH /api/v1/timetables/:id/slots/:slotId`  
**Auth:** ADMIN only

**Request body (all fields optional):**
```json
{
  "day": "TUESDAY",
  "startTime": "10:00",
  "endTime": "12:00",
  "courseId": "clxcrs1",
  "lecturerId": "clxlec1",
  "venue": "LT2"
}
```

### 7.9 Delete a Slot
`DELETE /api/v1/timetables/:id/slots/:slotId`  
**Auth:** ADMIN only

---

### 7.10 Auto-Generate Timetable
`POST /api/v1/timetables/:id/generate`  
**Auth:** ADMIN only

Automatically fills the timetable with slots respecting all hard constraints (no lecturer double-booking, no level clashes, no venue clashes).

**Response 200:**
```json
{
  "data": {
    "generated": 8,
    "total": 10,
    "slots": [
      { "id": "clxslot1", "day": "MONDAY", "startTime": "07:00", "endTime": "09:00", "courseId": "clxcrs1", "lecturerId": "clxlec1" }
    ]
  }
}
```
*`generated` = slots successfully placed. `total` = courses in that dept/level.*

---

### 7.11 Get Student's Timetable (Read-Only)
`GET /api/v1/timetables/my/student?semester=FIRST&academicYear=2024/2025`  
**Auth:** STUDENT only  
Automatically uses the logged-in student's department and level.

**Query params (required):**
- `semester` — `FIRST | SECOND`
- `academicYear` — e.g. `2024/2025`

**Response 200:**
```json
{
  "data": {
    "id": "clxtt1",
    "level": "L100",
    "semester": "FIRST",
    "academicYear": "2024/2025",
    "status": "PUBLISHED",
    "department": { "name": "Computer Science", "code": "CS" },
    "slots": [
      {
        "id": "clxslot1",
        "day": "MONDAY",
        "startTime": "08:00",
        "endTime": "10:00",
        "venue": "LT1",
        "course": { "code": "CS101", "name": "Intro to CS", "credits": 3 },
        "lecturer": { "firstName": "James", "lastName": "Brown" }
      }
    ]
  }
}
```
**Frontend usage:**
```js
const res = await fetch(
  '/api/v1/timetables/my/student?semester=FIRST&academicYear=2024/2025',
  { headers: { Authorization: `Bearer ${accessToken}` } }
);
const { data } = await res.json();
// data.slots contains the full weekly grid, ordered by day then startTime
```

---

### 7.12 Get Lecturer's Timetable (Read-Only)
`GET /api/v1/timetables/my/lecturer`  
**Auth:** LECTURER only  
Returns all slots assigned to the logged-in lecturer across all departments and levels.

**Response 200:**
```json
{
  "data": [
    {
      "id": "clxslot1",
      "day": "MONDAY",
      "startTime": "08:00",
      "endTime": "10:00",
      "venue": "LT1",
      "course": { "code": "CS101", "name": "Intro to CS" },
      "timetable": {
        "id": "clxtt1",
        "level": "L100",
        "semester": "FIRST",
        "academicYear": "2024/2025",
        "department": { "name": "Computer Science", "code": "CS" }
      }
    }
  ]
}
```

---

## 8. Complaints

### 8.1 Submit a Complaint
`POST /api/v1/complaints`  
**Auth:** LECTURER or STUDENT only

**Request body:**
```json
{
  "description": "My Monday 8am slot clashes with another class",
  "courseId": "clxcrs1",
  "level": "L100"
}
```
**Response 201:**
```json
{
  "data": {
    "id": "clxcmp1",
    "submitterRole": "STUDENT",
    "description": "My Monday 8am slot clashes with another class",
    "status": "PENDING",
    "createdAt": "2024-09-01T10:00:00.000Z"
  }
}
```

### 8.2 Get All Complaints (Admin)
`GET /api/v1/complaints?status=PENDING&role=STUDENT&date=2024-09-01`  
**Auth:** ADMIN only

**Query params (all optional):**
- `status` — `PENDING | RESOLVED`
- `role` — `LECTURER | STUDENT`
- `department` — department ID
- `date` — ISO date string (returns complaints from that date onwards)

**Response 200:**
```json
{
  "data": [
    {
      "id": "clxcmp1",
      "submitterRole": "STUDENT",
      "description": "...",
      "level": "L100",
      "status": "PENDING",
      "resolvedById": null,
      "resolvedAt": null,
      "createdAt": "2024-09-01T10:00:00.000Z",
      "course": { "code": "CS101", "name": "Intro to CS" },
      "student": { "id": "clxstu1", "firstName": "Alice", "lastName": "Smith" }
    }
  ]
}
```

### 8.3 Get Single Complaint
`GET /api/v1/complaints/:id`  
**Auth:** ADMIN, or the submitter

### 8.4 Get My Complaints
`GET /api/v1/complaints/my`  
**Auth:** LECTURER or STUDENT

Returns only complaints submitted by the currently logged-in user.

### 8.5 Resolve a Complaint
`PATCH /api/v1/complaints/:id/resolve`  
**Auth:** ADMIN only

No request body needed. Marks complaint as RESOLVED, logs who resolved it, and sends a notification to the submitter.

**Response 200:**
```json
{
  "data": {
    "id": "clxcmp1",
    "status": "RESOLVED",
    "resolvedById": "clxadm1",
    "resolvedAt": "2024-09-02T12:00:00.000Z"
  }
}
```

---

## 9. Notifications

### 9.1 Get My Notifications
`GET /api/v1/notifications`  
**Auth:** LECTURER or STUDENT

**Response 200:**
```json
{
  "data": [
    {
      "id": "clxnotif1",
      "type": "COMPLAINT_RESOLVED",
      "message": "Your complaint (ID: clxcmp1) has been resolved.",
      "isRead": false,
      "createdAt": "2024-09-02T12:00:00.000Z"
    }
  ]
}
```

**Notification types:**
| Type | Triggered by |
|------|-------------|
| `COMPLAINT_SUBMITTED` | Admin when a complaint is filed |
| `COMPLAINT_RESOLVED` | Submitter when admin resolves it |
| `TIMETABLE_PUBLISHED` | Students & lecturers in that dept/level |
| `TIMETABLE_UPDATED` | Students & lecturers after a published timetable changes |

### 9.2 Mark Notification as Read
`PATCH /api/v1/notifications/:id/read`  
**Auth:** LECTURER or STUDENT

**Response 200:**
```json
{ "data": { "id": "clxnotif1", "isRead": true } }
```

---

## 10. Dashboard

`GET /api/v1/dashboard/stats`  
**Auth:** ADMIN only

**Response 200:**
```json
{
  "data": {
    "totalLecturers": 24,
    "totalStudents": 450,
    "timetables": {
      "DRAFT": 3,
      "PUBLISHED": 12
    },
    "pendingComplaints": 7,
    "recentActivity": {
      "complaints": [
        { "id": "clxcmp1", "submitterRole": "STUDENT", "description": "...", "status": "PENDING", "createdAt": "..." }
      ],
      "timetables": [
        { "id": "clxtt1", "status": "PUBLISHED", "updatedAt": "...", "level": "L100", "semester": "FIRST", "department": { "name": "Computer Science" } }
      ]
    }
  }
}
```

---

## 11. Settings

### 11.1 Get System Settings
`GET /api/v1/settings`  
**Auth:** ADMIN only

**Response 200:**
```json
{
  "data": {
    "id": "clxset1",
    "academicYear": "2024/2025",
    "currentSemester": "FIRST",
    "semesterStartDate": "2024-09-01T00:00:00.000Z",
    "semesterEndDate": "2025-01-31T00:00:00.000Z",
    "slotDuration": 60,
    "slotStartTime": "07:00",
    "slotEndTime": "19:00"
  }
}
```

### 11.2 Update System Settings
`PATCH /api/v1/settings`  
**Auth:** ADMIN only

**Request body (all fields optional):**
```json
{
  "academicYear": "2025/2026",
  "currentSemester": "SECOND",
  "semesterStartDate": "2025-02-01T00:00:00.000Z",
  "semesterEndDate": "2025-06-30T00:00:00.000Z",
  "slotDuration": 60,
  "slotStartTime": "07:00",
  "slotEndTime": "19:00"
}
```

---

## Appendix A — Enums

| Enum | Values |
|------|--------|
| `Role` | `ADMIN`, `LECTURER`, `STUDENT` |
| `Level` | `L100`, `L200`, `L300`, `L400`, `L500` |
| `Semester` | `FIRST`, `SECOND` |
| `Day` | `MONDAY`, `TUESDAY`, `WEDNESDAY`, `THURSDAY`, `FRIDAY` |
| `TimetableStatus` | `DRAFT`, `PUBLISHED` |
| `ComplaintStatus` | `PENDING`, `RESOLVED` |

---

## Appendix B — Recommended Frontend API Client Setup

Create a single reusable `api.ts` (or `api.js`) file:

```typescript
const BASE_URL = 'http://localhost:3333/api/v1';

async function request(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('accessToken');

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  // Token expired — try refreshing once
  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${newToken}`,
          ...options.headers,
        },
      }).then((r) => r.json());
    }
    // Refresh also failed — redirect to login
    localStorage.clear();
    window.location.href = '/login';
    return;
  }

  return res.json();
}

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return null;

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) return null;
  const { data } = await res.json();
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  return data.accessToken;
}

// Convenience helpers
export const api = {
  get:    (path: string)                    => request(path),
  post:   (path: string, body: object)      => request(path, { method: 'POST',   body: JSON.stringify(body) }),
  patch:  (path: string, body: object)      => request(path, { method: 'PATCH',  body: JSON.stringify(body) }),
  delete: (path: string)                    => request(path, { method: 'DELETE' }),
};
```

**Usage examples:**
```typescript
import { api } from './api';

// Login
const loginRes = await api.post('/auth/login', { email, password });

// Get student timetable
const timetable = await api.get('/timetables/my/student?semester=FIRST&academicYear=2024/2025');

// Admin: Add a slot
const slot = await api.post(`/timetables/${timetableId}/slots`, {
  day: 'MONDAY',
  startTime: '08:00',
  endTime: '10:00',
  courseId,
  lecturerId,
  venue: 'LT1',
});

// Submit complaint
const complaint = await api.post('/complaints', {
  description: 'My timetable has a clash on Monday morning',
  courseId,
  level: 'L100',
});

// Mark notification read
await api.patch(`/notifications/${notificationId}/read`, {});
```

---

## Appendix C — Role-Based Route Summary

| Route | ADMIN | LECTURER | STUDENT |
|-------|:-----:|:--------:|:-------:|
| POST /auth/login | ✓ | ✓ | ✓ |
| GET /auth/me | ✓ | ✓ | ✓ |
| GET /departments | ✓ | ✓ | ✓ |
| GET /courses | ✓ | ✓ | ✓ |
| GET /timetables | ✓ | ✓ | ✓ |
| GET /timetables/:id | ✓ | ✓ | ✓ |
| GET /timetables/:id/slots | ✓ | ✓ | ✓ |
| GET /timetables/my/student | ✗ | ✗ | ✓ |
| GET /timetables/my/lecturer | ✗ | ✓ | ✗ |
| POST /complaints | ✗ | ✓ | ✓ |
| GET /complaints/my | ✗ | ✓ | ✓ |
| GET /notifications | ✗ | ✓ | ✓ |
| PATCH /notifications/:id/read | ✗ | ✓ | ✓ |
| All WRITE operations | ✓ | ✗ | ✗ |
| GET /dashboard/stats | ✓ | ✗ | ✗ |
| GET/PATCH /settings | ✓ | ✗ | ✗ |
