<?php
/**
 * CORS Configuration
 *
 * This file handles Cross-Origin Resource Sharing (CORS) headers
 * to allow the React frontend to communicate with the PHP backend.
 */

// Allow requests from React dev server
header('Access-Control-Allow-Origin: http://localhost:8080');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Start session for authentication
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
