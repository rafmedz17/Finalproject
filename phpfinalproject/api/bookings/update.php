<?php
/**
 * Update Booking Status Endpoint
 *
 * Updates booking status (Admin only)
 * PUT /api/bookings/update.php
 */

require_once '../config/cors.php';
require_once '../config/database.php';

// Only allow PUT requests
if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    sendErrorResponse('Method not allowed', 405);
}

// Check if user is logged in and is admin
if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'admin') {
    sendErrorResponse('Unauthorized. Admin access required.', 403);
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (!isset($input['id']) || !isset($input['status'])) {
    sendErrorResponse('Booking ID and status are required');
}

$bookingId = intval($input['id']);
$status = trim($input['status']);

// Validate status value
$validStatuses = ['pending', 'confirmed', 'active', 'completed', 'cancelled'];
if (!in_array($status, $validStatuses)) {
    sendErrorResponse('Invalid status value. Must be one of: ' . implode(', ', $validStatuses));
}

// Get database connection
$conn = getDbConnection();

try {
    // Check if booking exists
    $stmt = $conn->prepare('SELECT id, vehicle_id FROM bookings WHERE id = ?');
    $stmt->bind_param('i', $bookingId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        sendErrorResponse('Booking not found', 404);
    }

    $booking = $result->fetch_assoc();
    $stmt->close();

    // Update booking status
    $stmt = $conn->prepare('UPDATE bookings SET status = ? WHERE id = ?');
    $stmt->bind_param('si', $status, $bookingId);

    if (!$stmt->execute()) {
        throw new Exception('Failed to update booking status');
    }
    $stmt->close();

    // If booking is cancelled or completed, mark vehicle as available
    if ($status === 'cancelled' || $status === 'completed') {
        $stmt = $conn->prepare('UPDATE vehicles SET available = 1 WHERE id = ?');
        $stmt->bind_param('i', $booking['vehicle_id']);
        $stmt->execute();
        $stmt->close();
    }

    // If booking is confirmed or active, mark vehicle as unavailable
    if ($status === 'confirmed' || $status === 'active') {
        $stmt = $conn->prepare('UPDATE vehicles SET available = 0 WHERE id = ?');
        $stmt->bind_param('i', $booking['vehicle_id']);
        $stmt->execute();
        $stmt->close();
    }

    // Get the updated booking
    $stmt = $conn->prepare('SELECT * FROM bookings WHERE id = ?');
    $stmt->bind_param('i', $bookingId);
    $stmt->execute();
    $result = $stmt->get_result();
    $booking = $result->fetch_assoc();
    $stmt->close();

    // Format response
    $booking['price_per_day'] = (float)$booking['price_per_day'];
    $booking['total_amount'] = (float)$booking['total_amount'];
    $booking['total_days'] = (int)$booking['total_days'];
    $booking['id'] = (string)$booking['id'];
    $booking['user_id'] = (string)$booking['user_id'];
    $booking['vehicle_id'] = (string)$booking['vehicle_id'];

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

    unset($booking['booking_number'], $booking['customer_name'], $booking['customer_email']);
    unset($booking['vehicle_id'], $booking['vehicle_name'], $booking['start_date']);
    unset($booking['end_date'], $booking['total_days'], $booking['price_per_day']);
    unset($booking['total_amount'], $booking['updated_at'], $booking['user_id']);

    // Send success response
    sendSuccessResponse([
        'booking' => $booking,
        'message' => 'Booking status updated successfully'
    ]);

} catch (Exception $e) {
    sendErrorResponse('An error occurred while updating booking', 500);
} finally {
    closeDbConnection($conn);
}
