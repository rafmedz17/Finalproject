<?php
/**
 * Signup Endpoint
 *
 * Registers a new user
 * POST /api/auth/signup.php
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
if (!isset($input['email']) || !isset($input['password']) || !isset($input['name'])) {
    sendErrorResponse('Email, password, and name are required');
}

$email = trim($input['email']);
$password = $input['password'];
$name = trim($input['name']);
$role = 'customer'; // Default role for new users

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendErrorResponse('Invalid email format');
}

// Validate password length
if (strlen($password) < 6) {
    sendErrorResponse('Password must be at least 6 characters long');
}

// Validate name
if (strlen($name) < 2) {
    sendErrorResponse('Name must be at least 2 characters long');
}

// Get database connection
$conn = getDbConnection();

try {
    // Check if email already exists
    $stmt = $conn->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        sendErrorResponse('Email already exists');
    }
    $stmt->close();

    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

    // Insert new user
    $stmt = $conn->prepare('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)');
    $stmt->bind_param('ssss', $email, $hashedPassword, $name, $role);

    if (!$stmt->execute()) {
        throw new Exception('Failed to create user');
    }

    $userId = $conn->insert_id;
    $stmt->close();

    // Create user object (without password)
    $user = [
        'id' => $userId,
        'email' => $email,
        'name' => $name,
        'role' => $role
    ];

    // Store user data in session
    $_SESSION['user_id'] = $userId;
    $_SESSION['user_email'] = $email;
    $_SESSION['user_role'] = $role;
    $_SESSION['user_name'] = $name;

    // Send success response with user data
    sendSuccessResponse([
        'user' => $user,
        'message' => 'Account created successfully'
    ]);

} catch (Exception $e) {
    sendErrorResponse('An error occurred during registration', 500);
} finally {
    closeDbConnection($conn);
}
