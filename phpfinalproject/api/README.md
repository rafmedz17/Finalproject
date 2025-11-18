# Car Rental System - PHP Backend Setup Guide

## Prerequisites

- PHP 7.4 or higher
- MySQL 5.7 or higher
- Apache or Nginx web server (with mod_rewrite enabled)
- Composer (optional, for future dependencies)

## Database Setup

### Step 1: Create the Database

Open your MySQL client (phpMyAdmin, MySQL Workbench, or command line) and run:

```sql
CREATE DATABASE car_rental_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Step 2: Import the Schema

Run the schema file to create all tables:

```bash
mysql -u root -p car_rental_db < config/schema.sql
```

Or using phpMyAdmin:
1. Select the `car_rental_db` database
2. Go to the "Import" tab
3. Choose `config/schema.sql`
4. Click "Go"

### Step 3: Import the Seed Data

Run the seed file to populate the database with mock data:

```bash
mysql -u root -p car_rental_db < config/seed.sql
```

Or using phpMyAdmin:
1. Select the `car_rental_db` database
2. Go to the "Import" tab
3. Choose `config/seed.sql`
4. Click "Go"

## Configuration

### Database Connection

Edit `config/database.php` if your MySQL credentials are different:

```php
define('DB_HOST', 'localhost');  // Your MySQL host
define('DB_USER', 'root');       // Your MySQL username
define('DB_PASS', '');           // Your MySQL password
define('DB_NAME', 'car_rental_db');
```

### CORS Configuration

The CORS settings in `config/cors.php` are configured for React dev server on `http://localhost:5173`.

If your React app runs on a different port, update:

```php
header('Access-Control-Allow-Origin: http://localhost:YOUR_PORT');
```

## Default User Credentials

After running the seed data, you can log in with these accounts:

**Admin Account:**
- Email: `admin@example.com`
- Password: `password123`

**Customer Accounts:**
- Email: `john.doe@example.com`, `jane.smith@example.com`, etc.
- Password: `password123` (same for all test accounts)

## API Endpoints Structure

### Authentication
- `POST /api/auth/login.php` - User login
- `POST /api/auth/signup.php` - User registration
- `POST /api/auth/logout.php` - User logout
- `GET /api/auth/me.php` - Get current user

### Vehicles
- `GET /api/vehicles/index.php` - Get all vehicles
- `GET /api/vehicles/show.php?id={id}` - Get single vehicle
- `POST /api/vehicles/create.php` - Create vehicle (admin only)
- `PUT /api/vehicles/update.php` - Update vehicle (admin only)
- `DELETE /api/vehicles/delete.php?id={id}` - Delete vehicle (admin only)

### Bookings
- `GET /api/bookings/index.php` - Get all bookings (admin) or user's bookings
- `GET /api/bookings/show.php?id={id}` - Get single booking
- `POST /api/bookings/create.php` - Create booking
- `PUT /api/bookings/update.php` - Update booking status (admin only)
- `DELETE /api/bookings/cancel.php?id={id}` - Cancel booking

## Development Server

If using PHP's built-in server for testing:

```bash
cd api
php -S localhost:8000
```

Then your API will be available at `http://localhost:8000`

## Project Structure

```
api/
├── config/
│   ├── database.php    # Database connection
│   ├── cors.php        # CORS configuration
│   ├── schema.sql      # Database schema
│   └── seed.sql        # Seed data
├── auth/
│   ├── login.php       # Login endpoint
│   ├── signup.php      # Signup endpoint
│   ├── logout.php      # Logout endpoint
│   └── me.php          # Get current user
├── vehicles/
│   ├── index.php       # List vehicles
│   ├── show.php        # Get single vehicle
│   ├── create.php      # Create vehicle
│   ├── update.php      # Update vehicle
│   └── delete.php      # Delete vehicle
└── bookings/
    ├── index.php       # List bookings
    ├── show.php        # Get single booking
    ├── create.php      # Create booking
    ├── update.php      # Update booking
    └── cancel.php      # Cancel booking
```

## Security Notes

- All endpoints use prepared statements to prevent SQL injection
- Passwords are hashed using PHP's `password_hash()` with bcrypt
- Session-based authentication for simplicity
- Input validation on all endpoints
- Role-based access control (admin vs customer)

## Troubleshooting

### CORS Issues
If you get CORS errors, make sure:
1. The origin in `config/cors.php` matches your React dev server URL
2. Your PHP server supports CORS headers
3. Credentials are enabled in both backend and frontend

### Database Connection Issues
1. Check MySQL is running
2. Verify credentials in `config/database.php`
3. Ensure the database `car_rental_db` exists
4. Check user permissions for the database

### Session Issues
1. Ensure PHP sessions are enabled
2. Check session save path is writable
3. Clear browser cookies if needed
