<?php
/**
 * Login Endpoint
 *
 * Authenticates a user and creates a session
 * POST /api/auth/login.php
 */

require_once '../config/cors.php';
require_once '../config/database.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendErrorResponse('Method not allowed', 405);
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate input
if (!isset($input['email']) || !isset($input['password'])) {
    sendErrorResponse('Email and password are required');
}

$email = trim($input['email']);
$password = $input['password'];

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendErrorResponse('Invalid email format');
}

// Get database connection
$conn = getDbConnection();

try {
    // Prepare statement to find user by email
    $stmt = $conn->prepare('SELECT id, email, password, name, role FROM users WHERE email = ?');
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        sendErrorResponse('Invalid email or password', 401);
    }

    $user = $result->fetch_assoc();
    $stmt->close();

    // Verify password
    if (!password_verify($password, $user['password'])) {
        sendErrorResponse('Invalid email or password', 401);
    }

    // Remove password from user data
    unset($user['password']);

    // Store user data in session
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['user_role'] = $user['role'];
    $_SESSION['user_name'] = $user['name'];

    // Send success response with user data
    sendSuccessResponse([
        'user' => $user,
        'message' => 'Login successful'
    ]);

} catch (Exception $e) {
    sendErrorResponse('An error occurred during login', 500);
} finally {
    closeDbConnection($conn);
}
