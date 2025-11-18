# Complete Beginner's Setup Guide - PHP Backend

This guide will walk you through setting up your car rental system backend step-by-step, assuming you're new to PHP and MySQL.

## Prerequisites Check

Before we start, make sure you have these installed:

### 1. Check if you have PHP installed
Open a terminal and type:
```bash
php --version
```

**Expected output:** Something like `PHP 8.x.x` or `PHP 7.x.x`

If you see "command not found":
- **Linux (Fedora)**: `sudo dnf install php php-mysqlnd php-json`
- **Linux (Ubuntu)**: `sudo apt install php php-mysql php-json`
- **macOS**: `brew install php`
- **Windows**: Download from https://www.php.net/downloads

### 2. Check if you have MySQL/MariaDB installed
```bash
mysql --version
```

**Expected output:** Something like `mysql Ver 8.x.x` or `mariadb Ver 10.x.x`

If you see "command not found":
- **Linux (Fedora)**: `sudo dnf install mariadb-server`
- **Linux (Ubuntu)**: `sudo apt install mysql-server`
- **macOS**: `brew install mysql`
- **Windows**: Download from https://dev.mysql.com/downloads/installer/

### 3. Check if MySQL is running
```bash
sudo systemctl status mariadb
# or
sudo systemctl status mysql
```

If it's not running, start it:
```bash
sudo systemctl start mariadb
# or
sudo systemctl start mysql
```

---

## Step 1: Set Up MySQL Database

### Option A: Using Command Line (Recommended)

#### 1.1. Log into MySQL
```bash
mysql -u root -p
```

When prompted, enter your MySQL root password. If you've never set one, just press Enter.

**Tip:** If you can't log in, try:
```bash
sudo mysql
```

#### 1.2. Create the Database
Once you're in the MySQL prompt (you'll see `mysql>`), type:

```sql
CREATE DATABASE car_rental_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Press Enter. You should see: `Query OK, 1 row affected`

#### 1.3. Verify the Database was Created
```sql
SHOW DATABASES;
```

You should see `car_rental_db` in the list.

#### 1.4. Exit MySQL
```sql
EXIT;
```

#### 1.5. Import the Database Schema
Now we'll create all the tables. In your terminal:

```bash
cd /var/home/rafaelmedina/Documents/Finalproject/phpfinalproject

mysql -u root -p car_rental_db < api/config/schema.sql
```

Enter your MySQL password when prompted.

**No output means success!** If you see errors, read them carefully and ask for help.

#### 1.6. Import the Sample Data
```bash
mysql -u root -p car_rental_db < api/config/seed.sql
```

Enter your password again.

#### 1.7. Verify Everything Worked
```bash
mysql -u root -p car_rental_db -e "SELECT COUNT(*) FROM users; SELECT COUNT(*) FROM vehicles; SELECT COUNT(*) FROM bookings;"
```

**Expected output:**
- COUNT(*) = 9 (users)
- COUNT(*) = 6 (vehicles)
- COUNT(*) = 8 (bookings)

✅ **Database setup complete!**

---

### Option B: Using phpMyAdmin (If you prefer GUI)

#### 1.1. Open phpMyAdmin
- **XAMPP/WAMP**: Go to http://localhost/phpmyadmin
- **Local installation**: Usually http://localhost:8080/phpmyadmin

#### 1.2. Create Database
1. Click "New" in the left sidebar
2. Database name: `car_rental_db`
3. Collation: `utf8mb4_unicode_ci`
4. Click "Create"

#### 1.3. Import Schema
1. Click on `car_rental_db` in the left sidebar
2. Click "Import" tab at the top
3. Click "Choose File"
4. Navigate to: `/var/home/rafaelmedina/Documents/Finalproject/phpfinalproject/api/config/schema.sql`
5. Click "Go" at the bottom
6. Wait for success message

#### 1.4. Import Data
1. Click "Import" tab again
2. Click "Choose File"
3. Navigate to: `/var/home/rafaelmedina/Documents/Finalproject/phpfinalproject/api/config/seed.sql`
4. Click "Go"
5. Wait for success message

#### 1.5. Verify
1. Click on `car_rental_db` in left sidebar
2. You should see 3 tables: `bookings`, `users`, `vehicles`
3. Click on each table and click "Browse" - you should see data

✅ **Database setup complete!**

---

## Step 2: Configure Database Connection

### 2.1. Open the Database Config File
```bash
cd /var/home/rafaelmedina/Documents/Finalproject/phpfinalproject
nano api/config/database.php
```

Or open it in your favorite text editor (VS Code, etc.)

### 2.2. Update MySQL Credentials
Find these lines (around line 8-11):

```php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'car_rental_db');
```

**Update them based on your MySQL setup:**

- `DB_HOST`: Usually `localhost` (leave as is)
- `DB_USER`: Your MySQL username (usually `root`)
- `DB_PASS`: Your MySQL password
  - If you have a password, put it between the quotes: `'yourpassword'`
  - If no password, leave empty: `''`
- `DB_NAME`: Leave as `car_rental_db`

**Example with password:**
```php
define('DB_PASS', 'mySecretPassword123');
```

**Example without password:**
```php
define('DB_PASS', '');
```

### 2.3. Save the File
- If using nano: Press `Ctrl+X`, then `Y`, then `Enter`
- If using GUI editor: Just click Save

---

## Step 3: Test Database Connection

Let's make sure PHP can connect to MySQL.

### 3.1. Create a Test File
```bash
cd /var/home/rafaelmedina/Documents/Finalproject/phpfinalproject/api
nano test-connection.php
```

### 3.2. Paste This Code
```php
<?php
require_once 'config/database.php';

echo "Testing database connection...\n\n";

try {
    $conn = getDbConnection();
    echo "✅ SUCCESS! Connected to database.\n";

    // Test query
    $result = $conn->query("SELECT COUNT(*) as count FROM users");
    $row = $result->fetch_assoc();
    echo "✅ Found {$row['count']} users in database.\n";

    closeDbConnection($conn);
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}
?>
```

### 3.3. Save and Run the Test
```bash
php test-connection.php
```

**Expected output:**
```
Testing database connection...

✅ SUCCESS! Connected to database.
✅ Found 9 users in database.
```

**If you see errors:**
- `Access denied`: Wrong username or password in database.php
- `Unknown database`: Database wasn't created properly
- `Connection refused`: MySQL isn't running

### 3.4. Delete Test File (Optional)
```bash
rm test-connection.php
```

---

## Step 4: Start the PHP Backend Server

### 4.1. Navigate to API Directory
```bash
cd /var/home/rafaelmedina/Documents/Finalproject/phpfinalproject/api
```

### 4.2. Start PHP Built-in Server
```bash
php -S localhost:8000
```

**Expected output:**
```
[Thu Jan 18 10:30:00 2024] PHP 8.x.x Development Server (http://localhost:8000) started
```

**Important Notes:**
- Keep this terminal window open - don't close it!
- The server will show requests as they come in
- To stop the server later, press `Ctrl+C`

### 4.3. Test the Server
Open a **new terminal window** (keep the server running in the first one) and run:

```bash
curl http://localhost:8000/vehicles/index.php
```

**Expected output:** You should see JSON data with vehicles.

Or open your browser and go to:
```
http://localhost:8000/vehicles/index.php
```

You should see JSON data!

✅ **PHP backend is running!**

---

## Step 5: Start the React Frontend

### 5.1. Open a New Terminal
Keep the PHP server running in the first terminal.

### 5.2. Navigate to Project Root
```bash
cd /var/home/rafaelmedina/Documents/Finalproject/phpfinalproject
```

### 5.3. Install Dependencies (if not done already)
```bash
npm install
```

This might take a few minutes.

### 5.4. Start React Dev Server
```bash
npm run dev
```

**Expected output:**
```
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 5.5. Open in Browser
Open your browser and go to:
```
http://localhost:5173
```

✅ **Your app should now load!**

---

## Step 6: Test the Complete Setup

### 6.1. Test Login
1. Click "Login" on the homepage
2. Use these credentials:
   - **Email:** `admin@example.com`
   - **Password:** `password123`
3. Click "Sign In"

**Expected:** You should be logged in and see "Welcome back" or similar message.

### 6.2. Test Vehicle Loading
1. Scroll down to the "Our Exclusive Vehicle Collection" section
2. You should see 6 vehicles loaded from the database

**If you see no vehicles:**
- Open browser console (F12)
- Check for errors
- Make sure PHP server is still running

### 6.3. Test Admin Panel (Admin Only)
1. After logging in as admin, look for "Admin Dashboard" or admin link
2. Navigate to "Manage Vehicles"
3. You should see the list of vehicles
4. Try adding a new vehicle

### 6.4. Test Customer Account
1. Logout from admin
2. Click "Sign Up"
3. Create a new account:
   - Name: Your Name
   - Email: test@example.com
   - Password: password123
4. After signup, you should be automatically logged in
5. Try to rent a car

---

## Troubleshooting Common Issues

### Issue 1: "CORS policy" Error in Browser Console

**Problem:** Browser shows CORS error

**Solution:**
1. Make sure PHP server is running on port 8000
2. Check `api/config/cors.php` file
3. Verify this line says `localhost:5173`:
   ```php
   header('Access-Control-Allow-Origin: http://localhost:5173');
   ```
4. Restart both servers

### Issue 2: "Failed to fetch" or Network Error

**Problem:** React can't connect to PHP

**Checklist:**
- ✅ Is PHP server running? Check terminal 1
- ✅ Is it on port 8000? Check the output
- ✅ Can you access http://localhost:8000/vehicles/index.php in browser?
- ✅ Is the API_BASE_URL correct in `src/api/client.ts`?

**Fix:** Check `src/api/client.ts` line 7:
```typescript
const API_BASE_URL = 'http://localhost:8000';
```

### Issue 3: "Database connection failed"

**Problem:** PHP can't connect to MySQL

**Checklist:**
- ✅ Is MySQL running? `sudo systemctl status mariadb`
- ✅ Are credentials correct in `api/config/database.php`?
- ✅ Did you import schema.sql and seed.sql?

**Fix:**
1. Check MySQL is running
2. Verify credentials
3. Run the test-connection.php script

### Issue 4: Empty White Page

**Problem:** React app shows blank page

**Solution:**
1. Open browser console (F12)
2. Look for errors
3. Check both servers are running
4. Try `npm run build` to check for TypeScript errors

### Issue 5: "Cannot POST /auth/login.php"

**Problem:** Login doesn't work

**Solution:**
1. Make sure PHP server is running
2. Check the endpoint exists: `ls api/auth/`
3. Test manually:
   ```bash
   curl -X POST http://localhost:8000/auth/login.php \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"password123"}'
   ```

---

## Quick Reference: Commands You'll Use Often

### Start Everything (3 Terminal Windows)

**Terminal 1 - PHP Backend:**
```bash
cd /var/home/rafaelmedina/Documents/Finalproject/phpfinalproject/api
php -S localhost:8000
```

**Terminal 2 - React Frontend:**
```bash
cd /var/home/rafaelmedina/Documents/Finalproject/phpfinalproject
npm run dev
```

**Terminal 3 - For Commands:**
Use this terminal for git, testing, etc.

### Stop Everything
- Terminal 1 (PHP): Press `Ctrl+C`
- Terminal 2 (React): Press `Ctrl+C`

### Restart Everything
Just run the start commands again in each terminal.

---

## Test Accounts

### Admin Account
- Email: `admin@example.com`
- Password: `password123`
- Access: Full admin panel, manage everything

### Customer Accounts
All use password: `password123`
- `john.doe@example.com`
- `jane.smith@example.com`
- `mike.johnson@example.com`
- `sarah.williams@example.com`

---

## What You Should See When Everything Works

### PHP Server Terminal
```
[Thu Jan 18 10:30:00 2024] PHP 8.2.0 Development Server (http://localhost:8000) started
[Thu Jan 18 10:30:15 2024] [::1]:54321 Accepted
[Thu Jan 18 10:30:15 2024] [::1]:54321 [200]: GET /vehicles/index.php
[Thu Jan 18 10:30:15 2024] [::1]:54321 Closing
```

### React Server Terminal
```
  VITE v5.4.19  ready in 1234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Browser
- Homepage loads with vehicles
- Login works
- Creating bookings works
- Admin panel shows data from database

---

## Need Help?

### Check Logs
1. **PHP errors:** Look at Terminal 1 (PHP server)
2. **React errors:** Look at Terminal 2 (React server)
3. **Browser errors:** Open browser console (F12)

### Database Issues
```bash
# Check if database exists
mysql -u root -p -e "SHOW DATABASES LIKE 'car_rental_db';"

# Check tables
mysql -u root -p car_rental_db -e "SHOW TABLES;"

# Check data
mysql -u root -p car_rental_db -e "SELECT * FROM users LIMIT 5;"
```

### Reset Everything
If things are really broken, you can start fresh:

```bash
# Drop and recreate database
mysql -u root -p -e "DROP DATABASE car_rental_db;"
mysql -u root -p -e "CREATE DATABASE car_rental_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Re-import
mysql -u root -p car_rental_db < api/config/schema.sql
mysql -u root -p car_rental_db < api/config/seed.sql
```

---

## Success Checklist

Before you consider setup complete, verify:

- [ ] MySQL is running
- [ ] Database `car_rental_db` exists with data
- [ ] PHP server starts without errors on port 8000
- [ ] React dev server starts without errors on port 5173
- [ ] Can access http://localhost:8000/vehicles/index.php and see JSON
- [ ] Can access http://localhost:5173 and see the homepage
- [ ] Can login with admin@example.com / password123
- [ ] Can see vehicles on homepage
- [ ] Browser console shows no CORS errors
- [ ] Can create a new customer account
- [ ] Can make a booking

✅ **If all checked, you're good to go!**

---

## Next Steps

Once everything is working:

1. Try creating a new vehicle as admin
2. Try making a booking as a customer
3. Try canceling a booking
4. Explore the admin panel
5. Check the bookings management page

Enjoy your fully functional car rental system! 🚗
