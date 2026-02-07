# Crime Management System - Complete Node.js + React Implementation

A comprehensive web-based crime management system built with **Node.js/Express backend** and **React frontend**, replacing the previous PHP implementation.

## 🎯 Features

### Multi-Role System
- **Admin**: Manage all aspects (criminals, police, stations, FIRs)
- **Police Officer**: Review and manage assigned FIRs
- **User**: File and track FIRs

### Core Functionality
- ✅ Criminal database management
- ✅ FIR (First Information Report) filing and tracking
- ✅ Police officer management
- ✅ Police station management
- ✅ Real-time dashboard with statistics
- ✅ Crime analysis and reporting
- ✅ File uploads (photos, documents)
- ✅ User authentication and session management
- ✅ Role-based access control

---

## 📦 Project Structure

```
CrimeManagementSystem3/
├── backend/                    # Node.js Express Server
│   ├── server.js              # Main server file
│   ├── db_schema.js           # Database schema initialization
│   ├── package.json           # Backend dependencies
│   ├── routes/
│   │   ├── auth.js            # Authentication endpoints
│   │   ├── criminals.js       # Criminal management APIs
│   │   ├── firs.js            # FIR management APIs
│   │   ├── police.js          # Police management APIs
│   │   ├── stations.js        # Station management APIs
│   │   ├── dashboard.js       # Dashboard statistics APIs
│   │   └── upload.js          # File upload APIs
│   └── db_crime.sqlite        # SQLite database
│
├── frontend/                   # React Application
│   ├── public/
│   │   └── index.html         # HTML entry point
│   ├── src/
│   │   ├── App.js             # Main App component
│   │   ├── index.js           # React entry point
│   │   ├── api/
│   │   │   ├── client.js      # API client configuration
│   │   │   └── PrivateRoute.js # Protected route component
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── AdminDashboard.js
│   │   │   ├── UserDashboard.js
│   │   │   ├── PoliceDashboard.js
│   │   │   ├── CriminalsManagement.js
│   │   │   ├── PoliceManagement.js
│   │   │   ├── StationsManagement.js
│   │   │   └── FIRManagement.js
│   │   ├── components/
│   │   │   └── Navigation.js  # Navbar component
│   │   ├── styles/
│   │   │   ├── global.css
│   │   │   ├── auth.css
│   │   │   └── dashboard.css
│   │   └── package.json       # Frontend dependencies
│   └── package.json           # Frontend root config
│
├── uploads/                    # File uploads directory
├── Img/                        # Image assets
└── README.md                   # This file
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- SQLite3

### 1️⃣ Backend Setup

```bash
# Navigate to backend folder
cd CrimeManagementSystem3/backend

# Install dependencies
npm install

# Initialize database with schema
node db_schema.js

# Start the server
npm start
# or for development with auto-reload
npm run dev
```

**Backend will run on**: `http://localhost:3000`

### 2️⃣ Frontend Setup

```bash
# Navigate to frontend folder
cd CrimeManagementSystem3/frontend

# Install dependencies
npm install

# Start React development server
npm start
```

**Frontend will run on**: `http://localhost:3000` (after build)

---

## 🔐 Login Credentials

Create test accounts through the Register page, or use these default test credentials:

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Police | police1 | police123 |
| User | user1 | user123 |

**Note**: These are examples. You can create accounts through the registration page.

---

## 📚 API Endpoints

### Authentication
```
POST   /api/auth/login              - User login
POST   /api/auth/register           - User registration
POST   /api/auth/register-police    - Police registration
POST   /api/auth/logout             - User logout
GET    /api/auth/current-user       - Get current user
POST   /api/auth/change-password    - Change password
```

### Criminals
```
POST   /api/criminals/add           - Add criminal
GET    /api/criminals/all           - Get all criminals
GET    /api/criminals/:id           - Get criminal by ID
PUT    /api/criminals/:id           - Update criminal
DELETE /api/criminals/:id           - Delete criminal
GET    /api/criminals/search/query  - Search criminals
```

### FIRs
```
POST   /api/firs/create             - Create FIR
GET    /api/firs/all                - Get all FIRs
GET    /api/firs/:id                - Get FIR by ID
GET    /api/firs/user/:userId       - Get user's FIRs
GET    /api/firs/status/:status     - Get FIRs by status
PUT    /api/firs/:id/approve        - Approve FIR
PUT    /api/firs/:id/reject         - Reject FIR
```

### Police
```
POST   /api/police/add              - Add police officer
GET    /api/police/all              - Get all officers
GET    /api/police/:id              - Get officer by ID
GET    /api/police/station/:stationId - Get officers by station
PUT    /api/police/:id              - Update officer
DELETE /api/police/:id              - Delete officer
```

### Stations
```
POST   /api/stations/add            - Add station
GET    /api/stations/all            - Get all stations
GET    /api/stations/:id            - Get station by ID
GET    /api/stations/:id/details    - Get station with officer count
PUT    /api/stations/:id            - Update station
DELETE /api/stations/:id            - Delete station
```

### Dashboard
```
GET    /api/dashboard/stats         - Get system statistics
GET    /api/dashboard/crimes-by-type - Get crimes by type
GET    /api/dashboard/fir-status    - Get FIR status distribution
GET    /api/dashboard/crimes-by-location - Get crimes by location
GET    /api/dashboard/activity      - Get recent activity
```

### Upload
```
POST   /api/upload/photo           - Upload photo
POST   /api/upload/document        - Upload document
POST   /api/upload/multiple        - Upload multiple files
```

---

## 🗄️ Database Schema

### Tables

**users**
- User accounts with role-based access

**police**
- Police officer records with station assignments

**police_stations**
- Police station information and details

**criminals**
- Criminal database with crime information

**firs**
- First Information Reports with status tracking

**crime_analysis**
- Statistical data for crime analysis

---

## 🎨 Frontend Features

### Admin Dashboard
- System statistics (police, criminals, stations, FIRs)
- Quick action buttons
- FIR status summary
- Full management of all resources

### Police Dashboard
- Assigned FIRs overview
- Case management
- Investigation tracking

### User Dashboard
- File new FIR
- Track my FIRs
- View FIR status

### Management Pages
- **Criminals**: Add, view, update, delete, search
- **Police**: Add, view, update, delete officers
- **Stations**: Add, view, update, delete police stations
- **FIRs**: File, review, approve, reject FIRs

---

## 🔄 Workflow Examples

### Filing a FIR (User)
1. Login as User
2. Click "File New FIR"
3. Fill in crime details
4. Submit FIR
5. Track status in "My FIRs"

### Managing FIRs (Admin/Police)
1. Login as Admin/Police
2. View pending FIRs in FIR Management
3. Click to view details
4. Approve or reject with notes
5. Assign to investigating officer

### Managing Criminals (Admin)
1. Login as Admin
2. Go to Criminal Management
3. Add new criminal with details
4. Search or filter criminals
5. View, update, or delete records

---

## 🚀 Development Tips

### Running in Development Mode

**Backend:**
```bash
cd backend
npm run dev  # Uses nodemon for auto-reload
```

**Frontend:**
```bash
cd frontend
npm start    # Uses React scripts with hot reload
```

### Environment Variables

Create `.env` files as needed:

**Backend (.env)**
```
NODE_ENV=development
PORT=3000
DATABASE_PATH=./db_crime.sqlite
```

**Frontend (.env)**
```
REACT_APP_API_URL=http://localhost:3000/api
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Terminal/PowerShell (Windows)
Get-Process -Name node | Stop-Process -Force

# Or change port in backend
env PORT=3001 npm start
```

### Database Issues
```bash
# Reinitialize database
node backend/db_schema.js
```

### npm install Issues
```bash
# Clear cache and reinstall
npm cache clean --force
rm -r node_modules
npm install
```

---

## 📝 Security Notes

⚠️ **Important for Production:**
- Replace hardcoded secrets with environment variables
- Use password hashing (bcrypt)
- Implement JWT tokens instead of sessions
- Add HTTPS/SSL
- Implement rate limiting
- Use prepared statements (already done with SQLite)
- Add input validation on backend
- Implement CORS properly
- Add logging and monitoring

---

## 🎯 Future Enhancements

- [ ] Advanced search and filtering
- [ ] PDF report generation
- [ ] Email notifications
- [ ] Two-factor authentication
- [ ] Case assignment optimization
- [ ] Analytics dashboard with charts
- [ ] Mobile app (React Native)
- [ ] Audit logs
- [ ] Case timeline visualization
- [ ] Integration with law enforcement agencies

---

## 📄 License

MIT License - Feel free to use and modify

---

## 👥 Support

For issues or questions:
1. Check the API endpoints documentation
2. Review database schema
3. Check browser console for errors
4. Review backend logs

---

## ✅ Checklist for Running

- [ ] Node.js installed
- [ ] Database initialized (`node db_schema.js`)
- [ ] Backend dependencies installed (`npm install` in backend)
- [ ] Frontend dependencies installed (`npm install` in frontend)
- [ ] Backend running on port 3000
- [ ] Frontend configured to connect to backend
- [ ] Can access login page
- [ ] Can create account
- [ ] Can login and access dashboard

**Once all checks pass, your Crime Management System is ready to use!** 🎉
