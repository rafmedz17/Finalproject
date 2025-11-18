#!/bin/bash

# Car Rental System - Quick Setup Script
# This script helps you set up the database quickly

echo "================================================"
echo "  Car Rental System - Quick Setup"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if MySQL is running
echo "Step 1: Checking MySQL/MariaDB..."
if systemctl is-active --quiet mariadb || systemctl is-active --quiet mysql; then
    echo -e "${GREEN}✅ MySQL/MariaDB is running${NC}"
else
    echo -e "${YELLOW}⚠️  MySQL/MariaDB is not running${NC}"
    echo "Starting MySQL/MariaDB..."
    sudo systemctl start mariadb 2>/dev/null || sudo systemctl start mysql 2>/dev/null

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ MySQL/MariaDB started successfully${NC}"
    else
        echo -e "${RED}❌ Could not start MySQL/MariaDB${NC}"
        echo "Please start it manually and run this script again"
        exit 1
    fi
fi

echo ""
echo "Step 2: Setting up database..."
echo ""

# Prompt for MySQL credentials
read -p "Enter MySQL username (default: root): " DB_USER
DB_USER=${DB_USER:-root}

read -sp "Enter MySQL password (press Enter if no password): " DB_PASS
echo ""

# Test connection
echo ""
echo "Testing MySQL connection..."
if [ -z "$DB_PASS" ]; then
    mysql -u "$DB_USER" -e "SELECT 1;" > /dev/null 2>&1
else
    mysql -u "$DB_USER" -p"$DB_PASS" -e "SELECT 1;" > /dev/null 2>&1
fi

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Could not connect to MySQL. Please check your credentials.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ MySQL connection successful${NC}"
echo ""

# Create database
echo "Creating database 'car_rental_db'..."
if [ -z "$DB_PASS" ]; then
    mysql -u "$DB_USER" -e "CREATE DATABASE IF NOT EXISTS car_rental_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>&1
else
    mysql -u "$DB_USER" -p"$DB_PASS" -e "CREATE DATABASE IF NOT EXISTS car_rental_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>&1
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database created${NC}"
else
    echo -e "${RED}❌ Failed to create database${NC}"
    exit 1
fi

# Import schema
echo ""
echo "Importing database schema..."
if [ -z "$DB_PASS" ]; then
    mysql -u "$DB_USER" car_rental_db < api/config/schema.sql 2>&1
else
    mysql -u "$DB_USER" -p"$DB_PASS" car_rental_db < api/config/schema.sql 2>&1
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Schema imported${NC}"
else
    echo -e "${RED}❌ Failed to import schema${NC}"
    exit 1
fi

# Import seed data
echo ""
echo "Importing sample data..."
if [ -z "$DB_PASS" ]; then
    mysql -u "$DB_USER" car_rental_db < api/config/seed.sql 2>&1
else
    mysql -u "$DB_USER" -p"$DB_PASS" car_rental_db < api/config/seed.sql 2>&1
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Sample data imported${NC}"
else
    echo -e "${RED}❌ Failed to import sample data${NC}"
    exit 1
fi

# Verify data
echo ""
echo "Verifying database setup..."
if [ -z "$DB_PASS" ]; then
    USERS=$(mysql -u "$DB_USER" car_rental_db -N -e "SELECT COUNT(*) FROM users;")
    VEHICLES=$(mysql -u "$DB_USER" car_rental_db -N -e "SELECT COUNT(*) FROM vehicles;")
    BOOKINGS=$(mysql -u "$DB_USER" car_rental_db -N -e "SELECT COUNT(*) FROM bookings;")
else
    USERS=$(mysql -u "$DB_USER" -p"$DB_PASS" car_rental_db -N -e "SELECT COUNT(*) FROM users;")
    VEHICLES=$(mysql -u "$DB_USER" -p"$DB_PASS" car_rental_db -N -e "SELECT COUNT(*) FROM vehicles;")
    BOOKINGS=$(mysql -u "$DB_USER" -p"$DB_PASS" car_rental_db -N -e "SELECT COUNT(*) FROM bookings;")
fi

echo -e "${GREEN}✅ Found $USERS users${NC}"
echo -e "${GREEN}✅ Found $VEHICLES vehicles${NC}"
echo -e "${GREEN}✅ Found $BOOKINGS bookings${NC}"

# Update database.php config
echo ""
echo "Updating database configuration..."

# Create backup
cp api/config/database.php api/config/database.php.backup

# Update the password in database.php
if [ -z "$DB_PASS" ]; then
    # Empty password
    sed -i "s/define('DB_PASS', '.*');/define('DB_PASS', '');/" api/config/database.php
else
    # Has password - escape special characters
    ESCAPED_PASS=$(printf '%s\n' "$DB_PASS" | sed 's/[[\.*^$/]/\\&/g')
    sed -i "s/define('DB_PASS', '.*');/define('DB_PASS', '$ESCAPED_PASS');/" api/config/database.php
fi

# Update username
sed -i "s/define('DB_USER', '.*');/define('DB_USER', '$DB_USER');/" api/config/database.php

echo -e "${GREEN}✅ Database configuration updated${NC}"

# Test PHP connection
echo ""
echo "Testing PHP database connection..."

cat > /tmp/test_connection.php << 'EOF'
<?php
require_once 'api/config/database.php';
try {
    $conn = getDbConnection();
    echo "SUCCESS";
    closeDbConnection($conn);
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
    exit(1);
}
?>
EOF

RESULT=$(php /tmp/test_connection.php 2>&1)
rm /tmp/test_connection.php

if [[ $RESULT == *"SUCCESS"* ]]; then
    echo -e "${GREEN}✅ PHP can connect to database${NC}"
else
    echo -e "${RED}❌ PHP connection test failed: $RESULT${NC}"
    exit 1
fi

# Check if node_modules exists
echo ""
if [ ! -d "node_modules" ]; then
    echo "Installing Node.js dependencies..."
    npm install
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Dependencies installed${NC}"
    else
        echo -e "${YELLOW}⚠️  Failed to install dependencies. Run 'npm install' manually.${NC}"
    fi
else
    echo -e "${GREEN}✅ Node.js dependencies already installed${NC}"
fi

# Success message
echo ""
echo "================================================"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo "================================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Start the PHP backend (Terminal 1):"
echo "   cd api"
echo "   php -S localhost:8000"
echo ""
echo "2. Start the React frontend (Terminal 2):"
echo "   npm run dev"
echo ""
echo "3. Open your browser:"
echo "   http://localhost:5173"
echo ""
echo "4. Login with:"
echo "   Email: admin@example.com"
echo "   Password: password123"
echo ""
echo "================================================"
echo ""
echo "For detailed instructions, see BEGINNER_SETUP_GUIDE.md"
echo ""
