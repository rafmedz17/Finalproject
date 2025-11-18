<?php
/**
 * Get Single Booking Endpoint
 *
 * Returns details of a specific booking
 * GET /api/bookings/show.php?id={id}
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

// Get booking ID from query parameter
if (!isset($_GET['id'])) {
    sendErrorResponse('Booking ID is required');
}

$bookingId = intval($_GET['id']);

// Get database connection
$conn = getDbConnection();

try {
    // Prepare statement to find booking by ID
    $stmt = $conn->prepare('SELECT * FROM bookings WHERE id = ?');
    $stmt->bind_param('i', $bookingId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        sendErrorResponse('Booking not found', 404);
    }

    $booking = $result->fetch_assoc();
    $stmt->close();

    // Check authorization: customers can only see their own bookings
    if ($_SESSION['user_role'] !== 'admin' && $booking['user_id'] != $_SESSION['user_id']) {
        sendErrorResponse('Unauthorized to view this booking', 403);
    }

    // Convert numeric values
    $booking['price_per_day'] = (float)$booking['price_per_day'];
    $booking['total_amount'] = (float)$booking['total_amount'];
    $booking['total_days'] = (int)$booking['total_days'];
    $booking['id'] = (string)$booking['id'];
    $booking['user_id'] = (string)$booking['user_id'];
    $booking['vehicle_id'] = (string)$booking['vehicle_id'];

    // Rename fields to match frontend format (camelCase)
    $booking['bookingNumber'] = $booking['booking_number'];
    $booking['customerName'] = $booking['customer_name'];
    $booking['customerEmail'] = $booking['customer_email'];
    $booking['vehicleId'] = $booking['vehicle_id'];
    $booking['vehicleName'] = $booking['vehicle_name'];
    $booking['startDate'] = $booking['start_date'];
    $booking['endDate'] = $booking['end_date'];
    $booking['totalDays'] = $booking['total_days'];
    $booking['pricePerDay'] = $booking['price_per_day'];
    $booking['totalAmount'] = $booking['total_amount'];
    $booking['userId'] = $booking['user_id'];

    // Remove snake_case fields
    unset($booking['booking_number'], $booking['customer_name'], $booking['customer_email']);
    unset($booking['vehicle_id'], $booking['vehicle_name'], $booking['start_date']);
    unset($booking['end_date'], $booking['total_days'], $booking['price_per_day']);
    unset($booking['total_amount'], $booking['updated_at'], $booking['user_id']);

    // Send success response with booking data
    sendSuccessResponse([
        'booking' => $booking
    ]);

} catch (Exception $e) {
    sendErrorResponse('An error occurred while fetching booking', 500);
} finally {
    closeDbConnection($conn);
}
