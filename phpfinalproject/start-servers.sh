#!/bin/bash

# Car Rental System - Start All Servers
# This script starts both PHP backend and React frontend in separate terminals

echo "================================================"
echo "  Car Rental System - Starting Servers"
echo "================================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "Error: Please run this script from the project root directory"
    exit 1
fi

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if PHP is available
if ! command -v php &> /dev/null; then
    echo "Error: PHP is not installed or not in PATH"
    exit 1
fi

# Check if node is available
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed or not in PATH"
    exit 1
fi

# Check if MySQL is running
if ! (systemctl is-active --quiet mariadb || systemctl is-active --quiet mysql); then
    echo -e "${YELLOW}⚠️  MySQL/MariaDB is not running. Starting it...${NC}"
    sudo systemctl start mariadb 2>/dev/null || sudo systemctl start mysql 2>/dev/null
fi

echo "Starting servers in separate terminal windows..."
echo ""

# Detect terminal emulator and start servers
if command -v gnome-terminal &> /dev/null; then
    # GNOME Terminal
    gnome-terminal --tab --title="PHP Backend" -- bash -c "cd '$(pwd)/api' && echo 'Starting PHP Backend on http://localhost:8000' && php -S localhost:8000; exec bash"
    gnome-terminal --tab --title="React Frontend" -- bash -c "cd '$(pwd)' && echo 'Starting React Frontend...' && npm run dev; exec bash"
    echo -e "${GREEN}✅ Servers started in new terminal tabs${NC}"

elif command -v konsole &> /dev/null; then
    # KDE Konsole
    konsole --new-tab -e bash -c "cd '$(pwd)/api' && echo 'Starting PHP Backend on http://localhost:8000' && php -S localhost:8000; exec bash" &
    konsole --new-tab -e bash -c "cd '$(pwd)' && echo 'Starting React Frontend...' && npm run dev; exec bash" &
    echo -e "${GREEN}✅ Servers started in new terminal tabs${NC}"

elif command -v xterm &> /dev/null; then
    # xterm fallback
    xterm -T "PHP Backend" -e "cd '$(pwd)/api' && echo 'Starting PHP Backend on http://localhost:8000' && php -S localhost:8000; bash" &
    xterm -T "React Frontend" -e "cd '$(pwd)' && echo 'Starting React Frontend...' && npm run dev; bash" &
    echo -e "${GREEN}✅ Servers started in new terminal windows${NC}"

else
    # No GUI terminal found, give manual instructions
    echo "Could not detect a GUI terminal emulator."
    echo ""
    echo "Please open 2 terminal windows manually and run:"
    echo ""
    echo "Terminal 1 (PHP Backend):"
    echo "  cd $(pwd)/api"
    echo "  php -S localhost:8000"
    echo ""
    echo "Terminal 2 (React Frontend):"
    echo "  cd $(pwd)"
    echo "  npm run dev"
    exit 0
fi

echo ""
echo "================================================"
echo "Servers are starting..."
echo "================================================"
echo ""
echo "PHP Backend: http://localhost:8000"
echo "React Frontend: http://localhost:5173"
echo ""
echo "Wait a few seconds for React to compile, then open:"
echo "  http://localhost:5173"
echo ""
echo "Login with:"
echo "  Email: admin@example.com"
echo "  Password: password123"
echo ""
echo "To stop servers: Press Ctrl+C in each terminal"
echo "================================================"
