<?php
/**
 * Logout Endpoint
 *
 * Destroys the user session
 * POST /api/auth/logout.php
 */

require_once '../config/cors.php';
require_once '../config/database.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendErrorResponse('Method not allowed', 405);
}

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    sendErrorResponse('Not authenticated', 401);
}

// Destroy session
session_unset();
session_destroy();

// Send success response
sendSuccessResponse(null, 'Logged out successfully');
