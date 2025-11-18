<?php
/**
 * Cancel Booking Endpoint
 *
 * Cancels a booking (Customers can cancel their own, admins can cancel any)
 * DELETE /api/bookings/cancel.php?id={id}
 */

require_once '../config/cors.php';
require_once '../config/database.php';

// Only allow DELETE requests
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
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
    // Get booking details
    $stmt = $conn->prepare('SELECT * FROM bookings WHERE id = ?');
    $stmt->bind_param('i', $bookingId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        sendErrorResponse('Booking not found', 404);
    }

    $booking = $result->fetch_assoc();
    $stmt->close();

    // Check authorization: customers can only cancel their own bookings
    if ($_SESSION['user_role'] !== 'admin' && $booking['user_id'] != $_SESSION['user_id']) {
        sendErrorResponse('Unauthorized to cancel this booking', 403);
    }

    // Check if booking can be cancelled
    if ($booking['status'] === 'cancelled') {
        sendErrorResponse('Booking is already cancelled');
    }

    if ($booking['status'] === 'completed') {
        sendErrorResponse('Cannot cancel completed booking');
    }

    // Update booking status to cancelled
    $stmt = $conn->prepare('UPDATE bookings SET status = ? WHERE id = ?');
    $cancelledStatus = 'cancelled';
    $stmt->bind_param('si', $cancelledStatus, $bookingId);

    if (!$stmt->execute()) {
        throw new Exception('Failed to cancel booking');
    }
    $stmt->close();

    // Mark vehicle as available
    $stmt = $conn->prepare('UPDATE vehicles SET available = 1 WHERE id = ?');
    $stmt->bind_param('i', $booking['vehicle_id']);
    $stmt->execute();
    $stmt->close();

    // Send success response
    sendSuccessResponse(null, 'Booking cancelled successfully');

} catch (Exception $e) {
    sendErrorResponse('An error occurred while cancelling booking', 500);
} finally {
    closeDbConnection($conn);
}
