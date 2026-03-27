# College Event Management System

A comprehensive web application for managing college events with student registration, notifications, and event tracking capabilities.

> 📚 **New to this project?** Start with [INDEX.md](INDEX.md) for complete documentation navigation.

> 🚀 **Quick Start?** Jump to [QUICKSTART.md](QUICKSTART.md) to get running in minutes.

## 🚀 Features

### Student Module (Implemented)

- ✅ Student registration and secure login with JWT authentication
- ✅ View list of upcoming and ongoing events
- ✅ View detailed event information (date, venue, description, organizer)
- ✅ Online event registration with capacity management
- ✅ Receive notifications and event updates
- ✅ View registered events and participation history
- ✅ Cancel event registrations
- ✅ Submit feedback for attended events
- ✅ Search and filter events by category
- ✅ Responsive design for all devices

## 🛠️ Tech Stack

### Frontend

- **React** - UI library
- **React Router** - Navigation
- **Axios** - HTTP client
- **CSS3** - Styling with gradients and animations

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## 📁 Project Structure

```
college_event_management/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── eventController.js    # Event management
│   │   ├── registrationController.js  # Registration logic
│   │   └── notificationController.js  # Notification logic
│   ├── middleware/
│   │   ├── auth.js               # JWT verification
│   │   └── errorHandler.js       # Error handling
│   ├── models/
│   │   ├── User.js               # User schema
│   │   ├── Event.js              # Event schema
│   │   ├── Registration.js       # Registration schema
│   │   └── Notification.js       # Notification schema
│   ├── routes/
│   │   ├── authRoutes.js         # Auth endpoints
│   │   ├── eventRoutes.js        # Event endpoints
│   │   ├── registrationRoutes.js # Registration endpoints
│   │   └── notificationRoutes.js # Notification endpoints
│   ├── .env                      # Environment variables
│   ├── package.json
│   └── server.js                 # Entry point
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.js         # Navigation bar
    │   │   └── EventCard.js      # Event card component
    │   ├── context/
    │   │   └── AuthContext.js    # Authentication context
    │   ├── pages/
    │   │   ├── Home.js           # Landing page
    │   │   ├── Login.js          # Login page
    │   │   ├── Register.js       # Registration page
    │   │   ├── Events.js         # Events listing
    │   │   ├── EventDetails.js   # Event details
    │   │   ├── MyRegistrations.js # User registrations
    │   │   ├── Notifications.js  # Notifications page
    │   │   └── Profile.js        # User profile
    │   ├── services/
    │   │   ├── api.js            # Axios configuration
    │   │   ├── authService.js    # Auth API calls
    │   │   ├── eventService.js   # Event API calls
    │   │   ├── registrationService.js # Registration API calls
    │   │   └── notificationService.js # Notification API calls
    │   ├── styles/
    │   │   └── index.css         # Global styles
    │   ├── App.js                # Main app component
    │   └── index.js              # Entry point
    ├── .env
    └── package.json
```

## 🚦 Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:
   - Open `.env` file
   - Update the following variables:

```env
MONGODB_URI=mongodb://localhost:27017/college_event_management
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_email_app_password
EMAIL_FROM=Event Management <your_email@example.com>
```

4. Start MongoDB service:

```bash
# Windows
net start MongoDB

# Linux/Mac
sudo systemctl start mongod
```

5. Start the backend server:

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The backend server will start on http://localhost:5000

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:
   - The `.env` file is already configured with:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the React development server:

```bash
npm start
```

The frontend will start on http://localhost:3000

## 📋 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new student
- `POST /api/auth/login` - Login student
- `GET /api/auth/me` - Get current user (Protected)
- `PUT /api/auth/update` - Update profile (Protected)
- `PUT /api/auth/change-password` - Change password (Protected)
- `POST /api/auth/forgot-password` - Request password reset link
- `PUT /api/auth/reset-password/:token` - Reset password using token

### Events

- `GET /api/events` - Get all events (with pagination & filters)
- `GET /api/events/:id` - Get event by ID
- `GET /api/events/category/:category` - Get events by category
- `GET /api/events/search/:keyword` - Search events

### Registrations

- `POST /api/registrations/register` - Register for event (Protected)
- `GET /api/registrations/my-registrations` - Get user registrations (Protected)
- `GET /api/registrations/check/:eventId` - Check registration status (Protected)
- `DELETE /api/registrations/cancel/:registrationId` - Cancel registration (Protected)
- `PUT /api/registrations/feedback/:registrationId` - Submit feedback (Protected)

### Notifications

- `GET /api/notifications` - Get user notifications (Protected)
- `PUT /api/notifications/:notificationId/read` - Mark as read (Protected)
- `PUT /api/notifications/read-all` - Mark all as read (Protected)
- `DELETE /api/notifications/:notificationId` - Delete notification (Protected)

## 👤 User Credentials for Testing

After starting the application, register a new account using the registration form. You'll need:

- Full Name
- Email
- Roll Number (unique)
- Phone Number (10 digits)
- Branch (CSE, ECE, ME, CE, EE, Other)
- Semester (1-8)
- Password (minimum 6 characters)

## 🎨 Features Demonstration

### 1. User Registration & Login

- Secure registration with form validation
- JWT-based authentication
- Password encryption with bcryptjs

### 2. Event Management

- Browse all events with pagination
- Filter by category (Technical, Cultural, Sports, etc.)
- Search events by title, description, or tags
- View detailed event information
- Real-time capacity tracking

### 3. Event Registration

- One-click event registration
- Registration status tracking
- Prevent duplicate registrations
- Cancel registrations
- View participation history

### 4. Notifications

- Real-time notification updates
- Notification badges for unread count
- Mark as read/unread functionality
- Auto-delete old notifications (30 days)
- Different notification types with icons

### 5. Profile Management

- Update personal information
- View registration statistics
- Change password
- View member since date

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcryptjs
- Protected API routes
- Input validation with express-validator
- MongoDB injection prevention
- CORS configuration
- Token expiration handling

## 📱 Responsive Design

The application is fully responsive and works seamlessly on:

- Desktop computers
- Tablets
- Mobile phones

## 🎯 Future Enhancements (Not Yet Implemented)

### Admin Module

- Event creation and management
- User management
- Analytics dashboard
- Approval system for events

### Event Organizer Module

- Create and manage events
- View registration lists
- Send targeted notifications
- Export attendance reports

### Additional Features

- Event calendar view
- Email notifications
- File uploads for event posters
- QR code for event check-in
- Event categories customization
- Advanced analytics

## 🐛 Troubleshooting

### MongoDB Connection Issues

```bash
# Check if MongoDB is running
mongosh

# If not, start MongoDB service
# Windows: net start MongoDB
# Linux/Mac: sudo systemctl start mongod
```

### Port Already in Use

```bash
# Backend (Port 5000)
# Kill process: netstat -ano | findstr :5000
# Then: taskkill /PID <PID> /F

# Frontend (Port 3000)
# Kill process: netstat -ano | findstr :3000
# Then: taskkill /PID <PID> /F
```

### CORS Issues

Make sure the `FRONTEND_URL` in backend `.env` matches your frontend URL.

## 📝 License

This project is created for educational purposes.

## 👥 Contributors

- Your Name - Initial development

## 📞 Support

For any queries or issues, please contact the development team.

---

## 📚 Additional Documentation

- **[INDEX.md](INDEX.md)** - Documentation navigation hub
- **[INSTALLATION.md](INSTALLATION.md)** - Detailed installation guide
- **[QUICKSTART.md](QUICKSTART.md)** - Quick setup in minutes
- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - Complete API reference
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Technical summary and architecture
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues and solutions
- **[FILES_LIST.md](FILES_LIST.md)** - Complete file structure

---

**Happy Event Management! 🎉**
