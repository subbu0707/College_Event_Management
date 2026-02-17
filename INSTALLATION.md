# 📦 Installation Instructions

## Complete Setup Guide for College Event Management System

---

## ⚙️ System Requirements

### Required Software

- **Node.js**: v14.0.0 or higher
- **npm**: v6.0.0 or higher (comes with Node.js)
- **MongoDB**: v4.4.0 or higher
- **Git**: Latest version (optional, for version control)

### Recommended

- **Code Editor**: VS Code, Sublime Text, or any preferred editor
- **API Testing Tool**: Postman or Thunder Client (optional)
- **MongoDB GUI**: MongoDB Compass (optional)

---

## 📥 Step 1: Install Prerequisites

### Install Node.js and npm

#### Windows

1. Download from https://nodejs.org/
2. Run the installer (.msi file)
3. Follow installation wizard
4. Verify installation:

```bash
node --version
npm --version
```

#### macOS

```bash
# Using Homebrew
brew install node

# Verify
node --version
npm --version
```

#### Linux (Ubuntu/Debian)

```bash
# Update package list
sudo apt update

# Install Node.js and npm
sudo apt install nodejs npm

# Verify
node --version
npm --version
```

---

### Install MongoDB

#### Windows

1. Download from https://www.mongodb.com/try/download/community
2. Run the installer
3. Choose "Complete" installation
4. Install as a Windows Service
5. Install MongoDB Compass (GUI tool)
6. Verify installation:

```bash
mongosh --version
```

#### macOS

```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Verify
mongosh --version
```

#### Linux (Ubuntu/Debian)

```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package list
sudo apt update

# Install MongoDB
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify
mongosh --version
```

---

## 📂 Step 2: Get Project Files

### Option A: Download ZIP

1. Download the project as ZIP
2. Extract to your desired location
3. Open terminal in extracted folder

### Option B: Clone Repository (if using Git)

```bash
git clone <repository-url>
cd college_event_management
```

---

## 🔧 Step 3: Backend Setup

### Navigate to Backend Directory

```bash
cd backend
```

### Install Dependencies

```bash
npm install
```

This will install:

- express (^4.18.2)
- mongoose (^7.0.0)
- bcryptjs (^2.4.3)
- jsonwebtoken (^9.0.0)
- dotenv (^16.0.3)
- cors (^2.8.5)
- express-validator (^7.0.0)
- nodemailer (^6.9.1)
- nodemon (^2.0.20) - dev dependency

### Configure Environment Variables

The `.env` file is already created. Review and update if needed:

```bash
# Open .env in your editor
notepad .env       # Windows
nano .env          # Linux/Mac
code .env          # VS Code
```

Default configuration:

```env
MONGODB_URI=mongodb://localhost:27017/college_event_management
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**Important**: Change `JWT_SECRET` to a random secure string in production!

### Start MongoDB Service

#### Windows

```bash
net start MongoDB
```

#### macOS

```bash
brew services start mongodb-community
```

#### Linux

```bash
sudo systemctl start mongod
```

### Verify MongoDB Connection

```bash
mongosh
# You should see MongoDB shell
# Type 'exit' to close
```

### Seed Sample Data (Optional but Recommended)

```bash
npm run seed
```

This creates:

- 8 sample events
- 1 organizer account (email: organizer@college.edu, password: password123)

### Start Backend Server

```bash
# Development mode (with auto-restart)
npm run dev

# OR Production mode
npm start
```

**Expected Output:**

```
Server running on port 5000
MongoDB Connected: localhost
```

✅ Backend is now running on http://localhost:5000

---

## ⚛️ Step 4: Frontend Setup

### Open New Terminal Window

Keep the backend terminal running and open a new terminal.

### Navigate to Frontend Directory

```bash
cd frontend
```

### Install Dependencies

```bash
npm install
```

This will install:

- react (^18.2.0)
- react-dom (^18.2.0)
- react-router-dom (^6.8.0)
- axios (^1.3.0)
- react-scripts (5.0.1)
- date-fns (^2.29.3)

**Note**: This may take 2-5 minutes depending on your internet connection.

### Configure Environment Variables

The `.env` file is already configured. Verify:

```bash
# Open .env
notepad .env       # Windows
nano .env          # Linux/Mac
code .env          # VS Code
```

Content should be:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Start Frontend Server

```bash
npm start
```

**Expected Output:**

```
Compiled successfully!

You can now view the app in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

A browser window should automatically open to http://localhost:3000

✅ Frontend is now running!

---

## ✅ Step 5: Verify Installation

### Check All Services

1. **MongoDB**: Running on port 27017
2. **Backend**: Running on http://localhost:5000
3. **Frontend**: Running on http://localhost:3000

### Test Backend

Open browser or use curl:

```bash
curl http://localhost:5000/health
```

Expected response:

```json
{ "message": "Backend server is running" }
```

### Test Frontend

1. Open http://localhost:3000 in browser
2. You should see the landing page
3. Click "Get Started" or "Register"

---

## 🎯 Step 6: Create Test Account

### Option A: Use Seeded Organizer Account

If you ran `npm run seed`:

- Email: organizer@college.edu
- Password: password123

### Option B: Register New Account

1. Click "Register" in navbar
2. Fill in the form:
   - Name: Test Student
   - Email: test@college.edu
   - Roll Number: TEST001
   - Phone: 9876543210
   - Branch: CSE
   - Semester: 6
   - Password: test123
3. Click "Register"
4. You'll be automatically logged in

### Option C: Use createUser Script

```bash
cd backend
npm run create-user

# Follow the prompts to create a user
```

---

## 🚀 Step 7: Start Using the Application

After logging in:

1. **Browse Events**: Click "Events" in navbar
2. **View Details**: Click any event card
3. **Register**: Click "Register" button on event
4. **Check Notifications**: Click "Notifications" in navbar
5. **View Registrations**: Click "My Registrations"
6. **Update Profile**: Click "Profile" in navbar

---

## 🔄 Daily Usage

### Starting the Application

#### Terminal 1 - Backend

```bash
cd backend
npm run dev
```

#### Terminal 2 - Frontend

```bash
cd frontend
npm start
```

#### Terminal 3 - MongoDB (if not running as service)

```bash
mongod
```

### Stopping the Application

1. Press `Ctrl + C` in each terminal
2. Stop MongoDB (if not running as service):
   - Windows: `net stop MongoDB`
   - Mac: `brew services stop mongodb-community`
   - Linux: `sudo systemctl stop mongod`

---

## 📊 Optional Tools

### MongoDB Compass (GUI)

1. Download from https://www.mongodb.com/try/download/compass
2. Install
3. Connect to: `mongodb://localhost:27017`
4. Select database: `college_event_management`
5. Browse collections: users, events, registrations, notifications

### Postman (API Testing)

1. Download from https://www.postman.com/downloads/
2. Import API endpoints from API_DOCUMENTATION.md
3. Test backend endpoints directly

### VS Code Extensions (Recommended)

- ES7+ React/Redux/React-Native snippets
- MongoDB for VS Code
- REST Client
- Prettier - Code formatter
- ESLint

---

## 🐛 Troubleshooting Installation

### Issue: Node.js not found

**Solution**: Restart terminal after installing Node.js or add to PATH

### Issue: npm install fails

**Solution**:

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue: MongoDB connection fails

**Solution**:

```bash
# Check if MongoDB is running
mongosh

# If not, start it
# Windows: net start MongoDB
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

### Issue: Port already in use

**Solution**: See TROUBLESHOOTING.md for detailed steps

### Issue: Permission denied (Linux/Mac)

**Solution**:

```bash
# Use sudo for system-wide installs
sudo npm install -g <package>

# Or fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.profile
source ~/.profile
```

---

## 📝 Quick Command Reference

### Backend

```bash
npm start              # Start production server
npm run dev            # Start development server (auto-restart)
npm run seed           # Seed sample data
npm run create-user    # Interactive user creation
```

### Frontend

```bash
npm start              # Start development server
npm run build          # Build for production
npm test               # Run tests
```

### MongoDB

```bash
mongosh                # Open MongoDB shell
mongod                 # Start MongoDB server
```

---

## ✅ Installation Complete!

Your College Event Management System is now:

- ✅ Fully installed
- ✅ Configured
- ✅ Running
- ✅ Ready to use

**Next Steps:**

1. Read QUICKSTART.md for usage guide
2. Review API_DOCUMENTATION.md for API details
3. Check TROUBLESHOOTING.md if you encounter issues
4. Start developing additional features!

---

## 📞 Need Help?

If you encounter issues:

1. Check TROUBLESHOOTING.md
2. Review error messages in terminal
3. Verify all services are running
4. Ensure all dependencies are installed
5. Check environment variables

**Happy Coding! 🎉**
