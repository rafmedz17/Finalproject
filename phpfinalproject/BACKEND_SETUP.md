# PHP Backend Implementation - Complete Setup Guide

## Overview

Your car rental system now has a complete PHP backend with MySQL database integration. All mock data has been replaced with real API calls.

## What Was Implemented

### 1. Database Layer (`api/config/`)
- **schema.sql**: Complete database schema with 3 tables:
  - `users`: User accounts (customers and admins)
  - `vehicles`: Car inventory
  - `bookings`: Rental bookings
- **seed.sql**: Mock data for all tables
- **database.php**: Database connection and helper functions
- **cors.php**: CORS configuration for React frontend

### 2. Authentication API (`api/auth/`)
- `login.php` - User login with session management
- `signup.php` - New user registration
- `logout.php` - Session destruction
- `me.php` - Get current user data

### 3. Vehicles API (`api/vehicles/`)
- `index.php` - Get all vehicles (with filtering)
- `show.php` - Get single vehicle by ID
- `create.php` - Create new vehicle (admin only)
- `update.php` - Update vehicle (admin only)
- `delete.php` - Delete vehicle (admin only)

### 4. Bookings API (`api/bookings/`)
- `index.php` - Get bookings (all for admin, own for customers)
- `show.php` - Get single booking
- `create.php` - Create new booking
- `update.php` - Update booking status (admin only)
- `cancel.php` - Cancel booking

### 5. React Integration (`src/api/`)
- **client.ts**: Complete API client with TypeScript types
- Updated **authStore**: Now uses PHP login/signup endpoints
- Updated **vehicleStore**: Now uses PHP CRUD endpoints
- Updated **bookingStore**: Now uses PHP booking endpoints

## Setup Instructions

### Step 1: Database Setup

1. Open phpMyAdmin or MySQL Workbench

2. Create the database:
```sql
CREATE DATABASE car_rental_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. Import schema:
```bash
mysql -u root -p car_rental_db < api/config/schema.sql
```

4. Import seed data:
```bash
mysql -u root -p car_rental_db < api/config/seed.sql
```

Or use phpMyAdmin Import feature for both files.

### Step 2: Configure Database Connection

Edit `api/config/database.php` if needed:
```php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');  // Your MySQL password
define('DB_NAME', 'car_rental_db');
```

### Step 3: Start PHP Server

Navigate to the api directory and start the built-in PHP server:
```bash
cd api
php -S localhost:8000
```

Your API will be available at `http://localhost:8000`

### Step 4: Start React Dev Server

In a new terminal:
```bash
npm run dev
```

React dev server will run on `http://localhost:5173`

## Default Login Credentials

### Admin Account
- Email: `admin@example.com`
- Password: `password123`

### Customer Accounts
All customer accounts use password: `password123`
- `john.doe@example.com`
- `jane.smith@example.com`
- `mike.johnson@example.com`
- And more (see seed.sql)

## API Endpoints Summary

### Authentication
```
POST /auth/login.php        - Login user
POST /auth/signup.php       - Register new user
POST /auth/logout.php       - Logout user
GET  /auth/me.php           - Get current user
```

### Vehicles
```
GET    /vehicles/index.php     - List all vehicles
GET    /vehicles/show.php?id=  - Get vehicle by ID
POST   /vehicles/create.php    - Create vehicle (admin)
PUT    /vehicles/update.php    - Update vehicle (admin)
DELETE /vehicles/delete.php?id= - Delete vehicle (admin)
```

### Bookings
```
GET    /bookings/index.php       - List bookings
GET    /bookings/show.php?id=    - Get booking by ID
POST   /bookings/create.php      - Create booking
PUT    /bookings/update.php      - Update booking status (admin)
DELETE /bookings/cancel.php?id=  - Cancel booking
```

## How the React App Now Works

### 1. Authentication Flow
- Login/Signup forms call `authApi.login()` or `authApi.signup()`
- Session cookie is stored automatically
- All subsequent requests include credentials
- `authStore.checkAuth()` can be called on app load to restore session

### 2. Vehicle Management
- CarList component should call `fetchVehicles()` on mount
- Admin panel calls `addVehicle()`, `updateVehicle()`, `deleteVehicle()`
- All data comes from MySQL database

### 3. Booking Management
- Components call `fetchBookings()` to load data
- BookingModal calls `createBooking()` to make reservations
- Admin can update status with `updateBookingStatus()`
- Users/admins can cancel with `cancelBooking()`

## Important Notes

### Session Management
- Uses PHP sessions (not JWT)
- Session persists across page refreshes
- Logout clears session on server

### CORS Configuration
- Configured for `http://localhost:5173`
- If React runs on different port, update `api/config/cors.php`

### Image Handling
- Currently stores base64 strings in database
- For production, consider file upload to server directory

### Error Handling
- All API errors show toast notifications
- Errors are properly typed with `ApiError` class
- Loading states are managed in Zustand stores

## Next Steps to Update Components

You'll need to update components that display data to call the fetch methods:

1. **CarList component**: Add `useEffect` to call `fetchVehicles()`
2. **ManageVehicles**: Add `useEffect` to call `fetchVehicles()`
3. **ManageBookings**: Add `useEffect` to call `fetchBookings()`
4. **MyBookings**: Add `useEffect` to call `fetchBookings()`
5. **App.tsx**: Consider calling `checkAuth()` on app load

Example:
```typescript
const { vehicles, fetchVehicles } = useVehicleStore();

useEffect(() => {
  fetchVehicles();
}, [fetchVehicles]);
```

## Troubleshooting

### CORS Errors
- Ensure PHP server is running on port 8000
- Check `api/config/cors.php` origin matches React URL
- Clear browser cache

### Database Connection Failed
- Verify MySQL is running
- Check credentials in `api/config/database.php`
- Ensure database exists

### Session Not Persisting
- Check PHP session configuration
- Ensure cookies are enabled
- Verify `credentials: 'include'` in API client

## File Structure

```
phpfinalproject/
├── api/
│   ├── config/
│   │   ├── database.php
│   │   ├── cors.php
│   │   ├── schema.sql
│   │   └── seed.sql
│   ├── auth/
│   │   ├── login.php
│   │   ├── signup.php
│   │   ├── logout.php
│   │   └── me.php
│   ├── vehicles/
│   │   ├── index.php
│   │   ├── show.php
│   │   ├── create.php
│   │   ├── update.php
│   │   └── delete.php
│   └── bookings/
│       ├── index.php
│       ├── show.php
│       ├── create.php
│       ├── update.php
│       └── cancel.php
├── src/
│   ├── api/
│   │   └── client.ts
│   └── features/
│       ├── auth/stores/authStore.ts
│       └── admin/stores/
│           ├── vehicleStore.ts
│           └── bookingStore.ts
└── BACKEND_SETUP.md (this file)
```

## Testing the Backend

### Test Authentication
```bash
# Login
curl -X POST http://localhost:8000/auth/login.php \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}' \
  -c cookies.txt

# Get current user
curl http://localhost:8000/auth/me.php -b cookies.txt
```

### Test Vehicles
```bash
# Get all vehicles
curl http://localhost:8000/vehicles/index.php

# Get single vehicle
curl http://localhost:8000/vehicles/show.php?id=1
```

### Test Bookings
```bash
# Get bookings (requires login)
curl http://localhost:8000/bookings/index.php -b cookies.txt
```

## Security Features

- ✅ Password hashing with bcrypt
- ✅ SQL injection protection (prepared statements)
- ✅ Session-based authentication
- ✅ Role-based access control
- ✅ Input validation on all endpoints
- ✅ CORS protection

Your backend is now fully functional and ready to use!
