# 📚 API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

---

## 🔐 Authentication Endpoints

### Register Student

**POST** `/auth/register`

Create a new student account.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@college.edu",
  "password": "password123",
  "rollNumber": "21CSE001",
  "phone": "9876543210",
  "branch": "CSE",
  "semester": 6
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@college.edu",
    "rollNumber": "21CSE001",
    "branch": "CSE",
    "semester": 6,
    "registeredEvents": []
  }
}
```

---

### Login

**POST** `/auth/login`

Login with email and password.

**Request Body:**

```json
{
  "email": "john@college.edu",
  "password": "password123"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    /* user object */
  }
}
```

---

### Get Current User

**GET** `/auth/me` 🔒

Get currently logged-in user information.

**Response (200):**

```json
{
  "success": true,
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@college.edu",
    "rollNumber": "21CSE001",
    "phone": "9876543210",
    "branch": "CSE",
    "semester": 6,
    "registeredEvents": ["event_id_1", "event_id_2"],
    "createdAt": "2026-01-15T10:00:00.000Z"
  }
}
```

---

### Update Profile

**PUT** `/auth/update` 🔒

Update user profile information.

**Request Body:**

```json
{
  "name": "John Updated",
  "phone": "9876543211",
  "bio": "Computer Science student passionate about AI"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    /* updated user object */
  }
}
```

---

### Change Password

**PUT** `/auth/change-password` 🔒

Change user password.

**Request Body:**

```json
{
  "oldPassword": "password123",
  "newPassword": "newpassword456"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## 🎊 Event Endpoints

### Get All Events

**GET** `/events`

Get list of all events with pagination and filters.

**Query Parameters:**

- `status` - Filter by status (upcoming/ongoing/completed)
- `category` - Filter by category
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Example:** `/events?status=upcoming&category=Technical&page=1&limit=10`

**Response (200):**

```json
{
  "success": true,
  "count": 10,
  "totalEvents": 25,
  "totalPages": 3,
  "currentPage": 1,
  "events": [
    {
      "_id": "...",
      "title": "Tech Fest 2026",
      "description": "Annual technical festival...",
      "category": "Technical",
      "startDate": "2026-03-15T09:00:00.000Z",
      "endDate": "2026-03-17T18:00:00.000Z",
      "venue": "Main Auditorium",
      "capacity": 200,
      "registeredCount": 45,
      "status": "upcoming",
      "organizer": {
        "_id": "...",
        "name": "Event Organizer",
        "email": "organizer@college.edu"
      },
      "tags": ["coding", "hackathon"],
      "createdAt": "2026-01-10T08:00:00.000Z"
    }
  ]
}
```

---

### Get Event by ID

**GET** `/events/:id`

Get detailed information about a specific event.

**Response (200):**

```json
{
  "success": true,
  "event": {
    "_id": "...",
    "title": "Tech Fest 2026",
    "description": "Detailed description...",
    "category": "Technical",
    "startDate": "2026-03-15T09:00:00.000Z",
    "endDate": "2026-03-17T18:00:00.000Z",
    "venue": "Main Auditorium",
    "capacity": 200,
    "registeredCount": 45,
    "status": "upcoming",
    "organizer": {
      "_id": "...",
      "name": "Event Organizer",
      "email": "organizer@college.edu",
      "phone": "9876543210",
      "branch": "CSE"
    },
    "tags": ["coding", "hackathon", "tech talks"],
    "registrations": ["reg_id_1", "reg_id_2"]
  }
}
```

---

### Get Events by Category

**GET** `/events/category/:category`

Get events filtered by category.

**Categories:** Technical, Cultural, Sports, Academic, Social, Workshop

**Example:** `/events/category/Technical?page=1&limit=10`

**Response:** Same as Get All Events

---

### Search Events

**GET** `/events/search/:keyword`

Search events by title, description, or tags.

**Example:** `/events/search/hackathon?page=1&limit=10`

**Response:** Same as Get All Events

---

## 📋 Registration Endpoints

### Register for Event

**POST** `/registrations/register` 🔒

Register current user for an event.

**Request Body:**

```json
{
  "eventId": "event_id_here"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Successfully registered for the event",
  "registration": {
    "_id": "...",
    "student": {
      /* user object */
    },
    "event": {
      /* event object */
    },
    "registrationDate": "2026-01-23T10:30:00.000Z",
    "status": "registered",
    "participationHistory": {
      "attended": false,
      "feedbackGiven": false
    }
  }
}
```

---

### Get My Registrations

**GET** `/registrations/my-registrations` 🔒

Get all registrations for current user.

**Query Parameters:**

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Response (200):**

```json
{
  "success": true,
  "count": 5,
  "totalRegistrations": 5,
  "totalPages": 1,
  "registrations": [
    {
      "_id": "...",
      "student": {
        /* user object */
      },
      "event": {
        /* event object */
      },
      "registrationDate": "2026-01-20T14:00:00.000Z",
      "status": "registered",
      "participationHistory": {
        "attended": false,
        "feedbackGiven": false,
        "rating": null,
        "feedback": null
      }
    }
  ]
}
```

---

### Check Registration Status

**GET** `/registrations/check/:eventId` 🔒

Check if current user is registered for a specific event.

**Response (200):**

```json
{
  "success": true,
  "isRegistered": true,
  "registration": {
    /* registration object */
  }
}
```

---

### Cancel Registration

**DELETE** `/registrations/cancel/:registrationId` 🔒

Cancel event registration.

**Response (200):**

```json
{
  "success": true,
  "message": "Registration cancelled successfully"
}
```

---

### Submit Feedback

**PUT** `/registrations/feedback/:registrationId` 🔒

Submit feedback and rating for an attended event.

**Request Body:**

```json
{
  "rating": 5,
  "feedback": "Great event! Learned a lot about AI and ML."
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Feedback submitted successfully",
  "registration": {
    /* updated registration object */
  }
}
```

---

## 🔔 Notification Endpoints

### Get Notifications

**GET** `/notifications` 🔒

Get notifications for current user.

**Query Parameters:**

- `unreadOnly` - Show only unread notifications (true/false)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Response (200):**

```json
{
  "success": true,
  "count": 10,
  "totalNotifications": 25,
  "totalPages": 3,
  "unreadCount": 5,
  "notifications": [
    {
      "_id": "...",
      "recipient": "user_id",
      "title": "Event Registration Confirmed",
      "message": "You have successfully registered for Tech Fest 2026",
      "type": "event_registration",
      "event": {
        "_id": "...",
        "title": "Tech Fest 2026"
      },
      "read": false,
      "createdAt": "2026-01-23T10:30:00.000Z"
    }
  ]
}
```

---

### Mark as Read

**PUT** `/notifications/:notificationId/read` 🔒

Mark a specific notification as read.

**Response (200):**

```json
{
  "success": true,
  "message": "Notification marked as read",
  "notification": {
    /* updated notification */
  }
}
```

---

### Mark All as Read

**PUT** `/notifications/read-all` 🔒

Mark all notifications as read for current user.

**Response (200):**

```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

### Delete Notification

**DELETE** `/notifications/:notificationId` 🔒

Delete a specific notification.

**Response (200):**

```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

---

## 🚫 Error Responses

All endpoints return errors in the following format:

**400 Bad Request:**

```json
{
  "success": false,
  "message": "Validation error message"
}
```

**401 Unauthorized:**

```json
{
  "success": false,
  "message": "No token provided, authorization denied"
}
```

**404 Not Found:**

```json
{
  "success": false,
  "message": "Resource not found"
}
```

**500 Server Error:**

```json
{
  "success": false,
  "message": "Server Error"
}
```

---

## 🔒 Protected Routes

Routes marked with 🔒 require authentication. Include JWT token in header:

```javascript
headers: {
  'Authorization': 'Bearer your_jwt_token_here',
  'Content-Type': 'application/json'
}
```

---

## 📝 Notes

1. All dates are in ISO 8601 format
2. Pagination starts at page 1
3. Default limit is 10 items per page
4. Maximum limit per request is 100 items
5. Tokens expire after 7 days (configurable)
6. Notifications auto-delete after 30 days

---

**For more information, refer to the main README.md file.**
