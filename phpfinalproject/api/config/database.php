<?php
/**
 * Database Configuration
 *
 * This file handles the database connection for the car rental system.
 * It uses MySQLi with prepared statements for security.
 */

// Database configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'car_rental_db');

// Create database connection
function getDbConnection() {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

    // Check connection
    if ($conn->connect_error) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Database connection failed: ' . $conn->connect_error
        ]);
        exit();
    }

    // Set charset to utf8mb4
    $conn->set_charset('utf8mb4');

    return $conn;
}

// Function to close database connection
function closeDbConnection($conn) {
    if ($conn) {
        $conn->close();
    }
}

// Function to send JSON response
function sendJsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit();
}

// Function to handle errors
function sendErrorResponse($message, $statusCode = 400) {
    sendJsonResponse([
        'success' => false,
        'message' => $message
    ], $statusCode);
}

// Function to handle success responses
function sendSuccessResponse($data = null, $message = 'Success') {
    $response = [
        'success' => true,
        'message' => $message
    ];

    if ($data !== null) {
        $response['data'] = $data;
    }

    sendJsonResponse($response);
}
