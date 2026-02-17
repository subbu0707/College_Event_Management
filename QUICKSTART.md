# 🚀 Quick Start Guide

## Step-by-Step Setup

### 1. Prerequisites Check

Make sure you have installed:

- ✅ Node.js (v14+) - Check: `node --version`
- ✅ MongoDB (v4.4+) - Check: `mongosh --version`
- ✅ npm or yarn - Check: `npm --version`

### 2. Start MongoDB

```bash
# Windows
net start MongoDB

# Linux/Mac
sudo systemctl start mongod

# Verify MongoDB is running
mongosh
# Type 'exit' to close mongosh
```

### 3. Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Seed sample data (optional but recommended)
node seed.js

# Start backend server
npm run dev
```

✅ Backend should now be running on http://localhost:5000

### 4. Frontend Setup

Open a **NEW terminal** window:

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start React app
npm start
```

✅ Frontend should now be running on http://localhost:3000

### 5. Access the Application

Open your browser and go to: **http://localhost:3000**

### 6. Test the Application

#### Option A: Register New Account

1. Click "Register" in the navbar
2. Fill in the registration form:
   - Name: John Doe
   - Email: john@college.edu
   - Roll Number: 21CSE001
   - Phone: 9876543210
   - Branch: CSE
   - Semester: 6
   - Password: password123
3. Click "Register"

#### Option B: Use Seeded Organizer Account (if you ran seed.js)

- Email: organizer@college.edu
- Password: password123

### 7. Explore Features

After logging in, you can:

- 📅 **View Events**: Browse all available events
- ✅ **Register**: Register for events you're interested in
- 📋 **My Registrations**: View your registered events
- 🔔 **Notifications**: Check notifications about your events
- 👤 **Profile**: Update your profile information

## Common Commands

### Backend Commands

```bash
npm start          # Start server
npm run dev        # Start with nodemon (auto-restart)
node seed.js       # Seed sample data
```

### Frontend Commands

```bash
npm start          # Start React dev server
npm run build      # Build for production
```

## Troubleshooting

### Issue: MongoDB not connecting

**Solution**:

- Make sure MongoDB service is running
- Check MONGODB_URI in backend/.env
- Default: `mongodb://localhost:27017/college_event_management`

### Issue: Port 5000 already in use

**Solution**:

- Change PORT in backend/.env to another port (e.g., 5001)
- Update REACT_APP_API_URL in frontend/.env accordingly

### Issue: Port 3000 already in use

**Solution**:

- Press 'Y' when asked to run on another port
- Or kill the process using port 3000

### Issue: Cannot register/login

**Solution**:

- Check if backend server is running
- Check browser console for errors
- Verify MongoDB is running and connected

## Development Tips

### Adding Sample Events

Run the seed script to add sample events:

```bash
cd backend
node seed.js
```

This creates:

- 8 sample events across different categories
- 1 organizer user account
- Ready-to-use test data

### Viewing API Responses

Use tools like:

- **Postman**: Test API endpoints
- **Browser DevTools**: Check network requests
- **MongoDB Compass**: View database directly

### Hot Reload

- Backend: Uses nodemon for auto-restart on file changes
- Frontend: React dev server auto-reloads on save

## Next Steps

1. ✅ Register a student account
2. ✅ Browse and register for events
3. ✅ Check notifications
4. ✅ Update your profile
5. ✅ View your participation history

## Need Help?

- Check the main README.md for detailed documentation
- Review API endpoints in README.md
- Check backend/server.js for route configurations
- Review frontend/src/services/ for API call implementations

---

**Enjoy using the College Event Management System! 🎉**
