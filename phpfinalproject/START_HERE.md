# 🚗 Car Rental System - Start Here!

Welcome! This guide will get your car rental system up and running quickly.

## 🎯 Quick Start (Easiest Way)

### Option 1: Automated Setup (Recommended)

Run the automated setup script:

```bash
cd /var/home/rafaelmedina/Documents/Finalproject/phpfinalproject
./setup.sh
```

This script will:
- ✅ Check if MySQL is running
- ✅ Create the database
- ✅ Import all tables and data
- ✅ Configure the database connection
- ✅ Test everything works
- ✅ Install dependencies

Then start the servers:

```bash
# Terminal 1 - Start PHP Backend
cd api
php -S localhost:8000

# Terminal 2 - Start React Frontend (in a new terminal)
npm run dev
```

**Or use the helper script:**
```bash
./start-servers.sh
```

That's it! Open http://localhost:5173 and login with:
- Email: `admin@example.com`
- Password: `password123`

---

## 📚 Detailed Setup (For Beginners)

If you're new to PHP/MySQL or want to understand each step, follow the complete guide:

👉 **[BEGINNER_SETUP_GUIDE.md](BEGINNER_SETUP_GUIDE.md)**

This guide includes:
- Prerequisites check
- Step-by-step MySQL setup
- How to configure the database
- How to test everything works
- Troubleshooting common issues
- All test account credentials

---

## 📖 Backend Documentation

For technical details about the API and database:

👉 **[BACKEND_SETUP.md](BACKEND_SETUP.md)**

This includes:
- Complete API documentation
- Database schema details
- Security features
- How to integrate with React
- Testing the API manually

---

## 🔍 What's Included?

### Backend (PHP + MySQL)
- ✅ User authentication (login/signup/logout)
- ✅ Vehicle management (CRUD operations)
- ✅ Booking system (create/update/cancel)
- ✅ Role-based access control (admin/customer)
- ✅ Session management
- ✅ Input validation and security

### Frontend (React + TypeScript)
- ✅ Customer-facing car rental website
- ✅ Admin dashboard for management
- ✅ Real-time booking system
- ✅ User authentication UI
- ✅ Responsive design

### Database
- ✅ MySQL database with 3 tables
- ✅ Sample data (9 users, 6 vehicles, 8 bookings)
- ✅ Proper relationships and indexes

---

## 🧪 Test Accounts

### Admin Account
- **Email:** admin@example.com
- **Password:** password123
- **Access:** Full admin panel, manage vehicles and bookings

### Customer Accounts
All customer accounts use password: `password123`

- john.doe@example.com
- jane.smith@example.com
- mike.johnson@example.com
- sarah.williams@example.com
- robert.brown@example.com
- emily.davis@example.com
- david.wilson@example.com
- lisa.martinez@example.com

---

## 🚀 Quick Commands

### First Time Setup
```bash
# Run the automated setup
./setup.sh

# Start PHP backend (Terminal 1)
cd api && php -S localhost:8000

# Start React frontend (Terminal 2)
npm run dev
```

### Daily Development
```bash
# Start both servers easily
./start-servers.sh

# Or manually in 2 terminals:
# Terminal 1:
cd api && php -S localhost:8000

# Terminal 2:
npm run dev
```

### Reset Database
```bash
mysql -u root -p -e "DROP DATABASE car_rental_db;"
mysql -u root -p -e "CREATE DATABASE car_rental_db;"
mysql -u root -p car_rental_db < api/config/schema.sql
mysql -u root -p car_rental_db < api/config/seed.sql
```

---

## 🆘 Quick Troubleshooting

### "MySQL connection failed"
```bash
# Check if MySQL is running
sudo systemctl status mariadb
# or
sudo systemctl status mysql

# Start MySQL
sudo systemctl start mariadb
# or
sudo systemctl start mysql
```

### "CORS policy error"
- Make sure PHP server is on port 8000
- Make sure React is on port 5173
- Check `api/config/cors.php` has correct origin

### "Failed to fetch"
- Ensure both servers are running
- Check PHP server is accessible: http://localhost:8000/vehicles/index.php
- Check browser console for specific errors

### "Port already in use"
```bash
# Kill process on port 8000
sudo lsof -ti:8000 | xargs kill -9

# Kill process on port 5173
sudo lsof -ti:5173 | xargs kill -9
```

---

## 📁 Project Structure

```
phpfinalproject/
├── api/                      # PHP Backend
│   ├── config/               # Database config & SQL files
│   ├── auth/                 # Authentication endpoints
│   ├── vehicles/             # Vehicle CRUD endpoints
│   └── bookings/             # Booking endpoints
├── src/                      # React Frontend
│   ├── api/client.ts         # API client
│   ├── features/             # Feature modules
│   └── components/           # UI components
├── setup.sh                  # Automated setup script ⭐
├── start-servers.sh          # Start both servers ⭐
├── START_HERE.md            # This file ⭐
├── BEGINNER_SETUP_GUIDE.md  # Detailed setup guide ⭐
└── BACKEND_SETUP.md         # Technical documentation ⭐
```

---

## ✅ Success Checklist

Before you start developing, make sure:

- [ ] MySQL is installed and running
- [ ] Database `car_rental_db` exists with data
- [ ] PHP backend starts on http://localhost:8000
- [ ] React frontend starts on http://localhost:5173
- [ ] Can login with admin@example.com
- [ ] Can see vehicles on homepage
- [ ] No CORS errors in browser console

---

## 🎓 What to Do After Setup

### As Admin
1. Login with admin account
2. Go to Admin Dashboard
3. Try adding a new vehicle
4. View all bookings
5. Try updating a booking status

### As Customer
1. Create a new customer account
2. Browse available vehicles
3. Make a booking
4. View your bookings
5. Try canceling a booking

---

## 📞 Need Help?

1. **First:** Check [BEGINNER_SETUP_GUIDE.md](BEGINNER_SETUP_GUIDE.md) troubleshooting section
2. **Second:** Run `./setup.sh` again to reset everything
3. **Third:** Check both terminal outputs for error messages
4. **Fourth:** Open browser console (F12) to see JavaScript errors

---

## 🎉 You're Ready!

Your car rental system is fully functional with:
- Real database backend
- Secure authentication
- Complete booking system
- Admin management panel
- Customer-facing website

Start coding and building amazing features! 🚀
