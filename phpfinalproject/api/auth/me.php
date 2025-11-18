<?php
/**
 * Get Current User Endpoint
 *
 * Returns the currently authenticated user's data
 * GET /api/auth/me.php
 */

require_once '../config/cors.php';
require_once '../config/database.php';

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendErrorResponse('Method not allowed', 405);
}

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    sendErrorResponse('Not authenticated', 401);
}

// Get database connection
$conn = getDbConnection();

try {
    // Get user data from database
    $stmt = $conn->prepare('SELECT id, email, name, role FROM users WHERE id = ?');
    $stmt->bind_param('i', $_SESSION['user_id']);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        // User not found in database, clear session
        session_unset();
        session_destroy();
        sendErrorResponse('User not found', 404);
    }

    $user = $result->fetch_assoc();
    $stmt->close();

    // Send success response with user data
    sendSuccessResponse([
        'user' => $user
    ]);

} catch (Exception $e) {
    sendErrorResponse('An error occurred', 500);
} finally {
    closeDbConnection($conn);
}
