# Multi-Database Authentication System

## Overview

The application now supports three separate database collections for different user types:

- **Students** → `users` collection (User model)
- **Organizers** → `organizers` collection (Organizer model)
- **Admins** → `admins` collection (Admin model)

## Database Models

### 1. Student Model (User.js)

**Collection:** `users`
**Fields:**

- name, email, password
- rollNumber (Roll Number/Student ID)
- phone
- branch (CSE/ECE/ME/CE/EE/Other)
- semester (1-8)
- role: "student" (default)
- isActive: true/false
- registeredEvents: [Event IDs]

### 2. Organizer Model (Organizer.js)

**Collection:** `organizers`
**Fields:**

- name, email, password
- rollNumber (Employee ID - unique)
- phone
- branch (Department: CSE/ECE/ME/CE/EE/Other)
- role: "organizer" (default, immutable)
- isActive: true/false
- bio (optional)

### 3. Admin Model (Admin.js)

**Collection:** `admins`
**Fields:**

- name, email, password
- rollNumber (Admin ID - unique)
- phone
- role: "admin" (default, immutable)
- isActive: true/false

## Authentication Flow

### Registration

1. User selects role (student/organizer/admin)
2. Form shows different fields based on role:
   - **Student:** Roll Number, Branch, Semester
   - **Organizer:** Employee ID, Department
   - **Admin:** Admin ID only
3. Backend routes to appropriate model based on role
4. Account created in respective database collection
5. JWT token generated with user ID and role

### Login

1. User selects role from dropdown
2. Enters email and password
3. Backend validates credentials against selected role's database
4. Returns JWT token with role information
5. Frontend redirects to role-specific dashboard

## Updated Files

### Backend

- **models/Admin.js** - New admin database model
- **models/Organizer.js** - New organizer database model
- **models/User.js** - Updated with isActive field
- **controllers/authController.js** - Multi-model authentication logic
- **middleware/auth.js** - Role-based authentication middleware

### Frontend

- **pages/Login.js** - Role selector with role parameter
- **pages/Register.js** - Dynamic form fields per role
- **services/authService.js** - Role parameter in login
- **context/AuthContext.js** - Role support in login function

## Key Features

### Backend

✅ Separate database collections for each role
✅ Role-based model selection using `getModelByRole()`
✅ JWT tokens include role information
✅ Middleware authenticates from correct collection
✅ Account deactivation support (isActive field)
✅ Unique constraint checks per model
✅ Password hashing with bcrypt

### Frontend

✅ Role selector on login/register forms
✅ Dynamic form fields based on selected role
✅ Role validation before authentication
✅ Role-based dashboard redirects
✅ Error messages specific to selected role

## Security Enhancements

1. **Separate Databases:** Each role type has isolated data
2. **Role Verification:** Login checks correct database for credentials
3. **Immutable Roles:** Admin and Organizer roles cannot be changed
4. **Account Status:** Deactivated accounts cannot login
5. **Token-Based Auth:** JWT includes role for request authorization

## Testing the System

### Register as Student

```
Role: Student
Email: student@college.edu
Roll Number: CS2024001
Branch: CSE
Semester: 5
Password: password123
```

### Register as Organizer

```
Role: Organizer
Email: organizer@college.edu
Employee ID: EMP001
Department: CSE
Password: password123
```

### Register as Admin

```
Role: Admin
Email: admin@college.edu
Admin ID: ADM001
Password: password123
```

### Login

1. Select your role from dropdown
2. Enter registered email and password
3. System validates against correct database
4. Redirects to appropriate dashboard

## Database Schema Comparison

| Field            | Student | Organizer | Admin    |
| ---------------- | ------- | --------- | -------- |
| name             | ✓       | ✓         | ✓        |
| email            | ✓       | ✓         | ✓        |
| password         | ✓       | ✓         | ✓        |
| rollNumber       | Roll#   | Emp ID    | Admin ID |
| phone            | ✓       | ✓         | ✓        |
| branch           | ✓       | ✓ (Dept)  | ✗        |
| semester         | ✓       | ✗         | ✗        |
| bio              | ✗       | ✓         | ✗        |
| registeredEvents | ✓       | ✗         | ✗        |
| role             | student | organizer | admin    |
| isActive         | ✓       | ✓         | ✓        |

## Next Steps

To further enhance the system:

1. Add email verification for new accounts
2. Implement password reset functionality
3. Add two-factor authentication
4. Create admin panel for user management
5. Add role-specific permissions and access control
6. Implement audit logging for sensitive operations
