<?php
/**
 * Get All Bookings Endpoint
 *
 * Returns bookings based on user role:
 * - Admin: All bookings
 * - Customer: Only their own bookings
 * GET /api/bookings/index.php
 */

require_once '../config/cors.php';
require_once '../config/database.php';

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendErrorResponse('Method not allowed', 405);
}

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    sendErrorResponse('Unauthorized. Please login.', 401);
}

// Get database connection
$conn = getDbConnection();

try {
    // Get query parameters for filtering
    $status = isset($_GET['status']) ? $_GET['status'] : null;

    // Build SQL query based on user role
    if ($_SESSION['user_role'] === 'admin') {
        // Admin sees all bookings
        $sql = 'SELECT * FROM bookings WHERE 1=1';
        $params = [];
        $types = '';
    } else {
        // Customers see only their bookings
        $sql = 'SELECT * FROM bookings WHERE user_id = ?';
        $params = [$_SESSION['user_id']];
        $types = 'i';
    }

    // Add status filter
    if ($status && $status !== 'all') {
        $sql .= ' AND status = ?';
        $params[] = $status;
        $types .= 's';
    }

    // Order by created_at desc
    $sql .= ' ORDER BY created_at DESC';

    // Prepare and execute
    $stmt = $conn->prepare($sql);

    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $bookings = [];
    while ($row = $result->fetch_assoc()) {
        // Convert numeric values
        $row['price_per_day'] = (float)$row['price_per_day'];
        $row['total_amount'] = (float)$row['total_amount'];
        $row['total_days'] = (int)$row['total_days'];
        $row['id'] = (string)$row['id'];
        $row['user_id'] = (string)$row['user_id'];
        $row['vehicle_id'] = (string)$row['vehicle_id'];

        // Rename fields to match frontend format (camelCase)
        $row['bookingNumber'] = $row['booking_number'];
        $row['customerName'] = $row['customer_name'];
        $row['customerEmail'] = $row['customer_email'];
        $row['vehicleId'] = $row['vehicle_id'];
        $row['vehicleName'] = $row['vehicle_name'];
        $row['startDate'] = $row['start_date'];
        $row['endDate'] = $row['end_date'];
        $row['totalDays'] = $row['total_days'];
        $row['pricePerDay'] = $row['price_per_day'];
        $row['totalAmount'] = $row['total_amount'];
        $row['userId'] = $row['user_id'];

        // Remove snake_case fields
        unset($row['booking_number'], $row['customer_name'], $row['customer_email']);
        unset($row['vehicle_id'], $row['vehicle_name'], $row['start_date']);
        unset($row['end_date'], $row['total_days'], $row['price_per_day']);
        unset($row['total_amount'], $row['updated_at'], $row['user_id']);

        $bookings[] = $row;
    }

    $stmt->close();

    // Send success response with bookings
    sendSuccessResponse([
        'bookings' => $bookings,
        'count' => count($bookings)
    ]);

} catch (Exception $e) {
    sendErrorResponse('An error occurred while fetching bookings', 500);
} finally {
    closeDbConnection($conn);
}
