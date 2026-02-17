# 🔧 Troubleshooting Guide

## Common Issues and Solutions

### 1. MongoDB Connection Issues

#### Problem: "MongooseError: Connection failed"

**Symptoms:**

- Backend server crashes on startup
- Error: "ECONNREFUSED" or "Connection timed out"

**Solutions:**

```bash
# Check if MongoDB is running
mongosh

# If not running, start MongoDB:
# Windows:
net start MongoDB

# Linux:
sudo systemctl start mongod

# Mac:
brew services start mongodb-community

# Verify MongoDB status
# Windows:
sc query MongoDB

# Linux/Mac:
sudo systemctl status mongod
```

**Check Connection String:**
Open `backend/.env` and verify:

```env
MONGODB_URI=mongodb://localhost:27017/college_event_management
```

---

### 2. Port Already in Use

#### Problem: "EADDRINUSE: address already in use :::5000"

**Symptoms:**

- Backend fails to start
- Port 5000 or 3000 already occupied

**Solutions:**

**Windows:**

```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# For port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Linux/Mac:**

```bash
# Find and kill process on port 5000
lsof -ti:5000 | xargs kill -9

# For port 3000
lsof -ti:3000 | xargs kill -9
```

**Alternative:** Change the port in `.env`:

```env
# Backend .env
PORT=5001

# Frontend .env
REACT_APP_API_URL=http://localhost:5001/api
```

---

### 3. Authentication Issues

#### Problem: "No token provided" or "Invalid token"

**Symptoms:**

- Cannot access protected routes
- Automatically logged out
- 401 Unauthorized errors

**Solutions:**

1. **Clear browser storage:**

```javascript
// In browser console (F12)
localStorage.clear();
sessionStorage.clear();
```

2. **Check token expiration:**
   - Tokens expire after 7 days by default
   - Login again to get a new token

3. **Verify JWT_SECRET:**
   - Make sure `JWT_SECRET` in backend `.env` is set
   - Don't change it after users have logged in

4. **Check Authorization header:**

```javascript
// Should be in format:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 4. CORS Errors

#### Problem: "Access to fetch blocked by CORS policy"

**Symptoms:**

- API calls fail from frontend
- Console shows CORS errors
- Network tab shows failed requests

**Solutions:**

1. **Check backend CORS configuration:**

```javascript
// In server.js
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);
```

2. **Verify environment variables:**

```env
# Backend .env
FRONTEND_URL=http://localhost:3000

# Frontend .env
REACT_APP_API_URL=http://localhost:5000/api
```

3. **Make sure both servers are running:**
   - Backend on port 5000
   - Frontend on port 3000

---

### 5. Registration/Login Failures

#### Problem: "User already exists" or "Validation failed"

**Symptoms:**

- Cannot register with email or roll number
- Form validation errors

**Solutions:**

1. **Check if user exists:**

```bash
# Connect to MongoDB
mongosh

# Switch to database
use college_event_management

# Check for existing user
db.users.findOne({ email: "your@email.com" })
db.users.findOne({ rollNumber: "YOUR_ROLL" })
```

2. **Delete existing user (if needed):**

```bash
db.users.deleteOne({ email: "your@email.com" })
```

3. **Verify form inputs:**
   - Email must be valid format
   - Roll number must be unique
   - Phone must be exactly 10 digits
   - Password minimum 6 characters
   - All required fields filled

---

### 6. npm/Package Installation Issues

#### Problem: "npm ERR!" or "Module not found"

**Symptoms:**

- Dependencies fail to install
- Import errors in code

**Solutions:**

1. **Clear npm cache:**

```bash
npm cache clean --force
```

2. **Delete node_modules and reinstall:**

```bash
# In backend or frontend directory
rm -rf node_modules package-lock.json
npm install
```

3. **Check Node.js version:**

```bash
node --version
# Should be v14 or higher
```

4. **Update npm:**

```bash
npm install -g npm@latest
```

---

### 7. React Build/Start Issues

#### Problem: "Module not found" or "React Scripts not found"

**Symptoms:**

- Frontend fails to start
- Build errors

**Solutions:**

1. **Reinstall React dependencies:**

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

2. **Clear React cache:**

```bash
# Delete .cache folder if exists
rm -rf node_modules/.cache
```

3. **Check for syntax errors:**
   - Review console errors
   - Fix any JavaScript syntax issues

---

### 8. API Endpoint Not Found

#### Problem: "404 Not Found" on API calls

**Symptoms:**

- API calls return 404
- Routes not working

**Solutions:**

1. **Verify API URL:**

```javascript
// Frontend .env
REACT_APP_API_URL=http://localhost:5000/api
```

2. **Check backend routes:**

```javascript
// Make sure routes are registered in server.js
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
```

3. **Test endpoint directly:**

```bash
# Using curl or browser
curl http://localhost:5000/api/events
```

---

### 9. Database Seeding Issues

#### Problem: "Cannot seed database" or duplicate key errors

**Symptoms:**

- seed.js script fails
- Duplicate entry errors

**Solutions:**

1. **Clear existing data first:**

```bash
mongosh
use college_event_management
db.events.deleteMany({})
db.users.deleteMany({})
db.registrations.deleteMany({})
db.notifications.deleteMany({})
exit
```

2. **Run seed script:**

```bash
cd backend
node seed.js
```

3. **Check for errors in seed script:**
   - Verify MongoDB connection
   - Check data format in seed.js

---

### 10. Browser Console Errors

#### Problem: Various JavaScript errors

**Symptoms:**

- UI not rendering correctly
- Features not working
- Console shows errors

**Common Errors & Fixes:**

**"Cannot read property of undefined":**

- Add null checks: `user?.name`
- Add loading states
- Check API response structure

**"Failed to fetch":**

- Check if backend is running
- Verify API URL in .env
- Check network tab in DevTools

**"Maximum update depth exceeded":**

- Remove infinite loops in useEffect
- Add proper dependencies array

---

### 11. Environment Variables Not Loading

#### Problem: `undefined` for environment variables

**Symptoms:**

- API calls fail
- Configuration not working

**Solutions:**

1. **Restart development servers:**

```bash
# Stop both servers (Ctrl+C)
# Start backend
cd backend
npm run dev

# Start frontend (new terminal)
cd frontend
npm start
```

2. **Check .env file names:**
   - Must be exactly `.env` (not `.env.txt`)
   - No spaces in variable names
   - No quotes needed for values

3. **Verify variable names:**

```env
# Backend
MONGODB_URI=mongodb://localhost:27017/college_event_management
JWT_SECRET=your_secret

# Frontend (must start with REACT_APP_)
REACT_APP_API_URL=http://localhost:5000/api
```

---

### 12. Data Not Showing/Updating

#### Problem: Data doesn't display or update

**Symptoms:**

- Empty lists
- Outdated information
- Changes not reflected

**Solutions:**

1. **Hard refresh browser:**
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

2. **Check API responses:**
   - Open DevTools (F12)
   - Go to Network tab
   - Look for API calls
   - Check response data

3. **Clear browser cache:**

```javascript
// In browser console
localStorage.clear();
location.reload();
```

4. **Verify database has data:**

```bash
mongosh
use college_event_management
db.events.count()
db.users.count()
```

---

## 🆘 Getting Help

If issues persist:

1. **Check error messages carefully:**
   - Backend console
   - Frontend console
   - Browser DevTools

2. **Verify all services are running:**
   - MongoDB
   - Backend server (port 5000)
   - Frontend server (port 3000)

3. **Review logs:**
   - Check terminal outputs
   - Look for stack traces

4. **Test step by step:**
   - Test backend API with Postman
   - Test frontend separately
   - Check database directly

5. **Common quick fixes:**

```bash
# Restart everything
# 1. Stop all servers
# 2. Restart MongoDB
# 3. Clear caches
# 4. Reinstall dependencies
# 5. Restart servers
```

---

## 📞 Support Checklist

Before asking for help, ensure:

- ✅ Node.js and MongoDB are installed
- ✅ All dependencies are installed (`npm install`)
- ✅ Environment variables are set correctly
- ✅ MongoDB is running
- ✅ Both servers are running
- ✅ Ports 3000 and 5000 are available
- ✅ No console errors (check both terminals)
- ✅ Browser console has no errors

---

## 🔍 Debugging Tips

1. **Use console.log generously:**

```javascript
console.log("Data:", data);
console.log("Error:", error);
```

2. **Check network requests:**
   - Open DevTools (F12)
   - Network tab
   - Look for failed requests (red)
   - Check request/response

3. **Test backend independently:**

```bash
# Use curl or Postman
curl http://localhost:5000/api/events
```

4. **MongoDB debugging:**

```bash
mongosh
use college_event_management
db.users.find().pretty()
db.events.find().pretty()
```

5. **Check file paths:**
   - Use absolute paths when possible
   - Verify imports are correct
   - Check for typos

---

**Remember: Most issues are configuration-related. Double-check your .env files and ensure all services are running!**
