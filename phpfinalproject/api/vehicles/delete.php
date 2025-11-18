<?php
/**
 * Delete Vehicle Endpoint
 *
 * Deletes a vehicle (Admin only)
 * DELETE /api/vehicles/delete.php?id={id}
 */

require_once '../config/cors.php';
require_once '../config/database.php';

// Only allow DELETE requests
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    sendErrorResponse('Method not allowed', 405);
}

// Check if user is logged in and is admin
if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'admin') {
    sendErrorResponse('Unauthorized. Admin access required.', 403);
}

// Get vehicle ID from query parameter
if (!isset($_GET['id'])) {
    sendErrorResponse('Vehicle ID is required');
}

$vehicleId = intval($_GET['id']);

// Get database connection
$conn = getDbConnection();

try {
    // Check if vehicle exists
    $stmt = $conn->prepare('SELECT id FROM vehicles WHERE id = ?');
    $stmt->bind_param('i', $vehicleId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        sendErrorResponse('Vehicle not found', 404);
    }
    $stmt->close();

    // Check if vehicle has active bookings
    $stmt = $conn->prepare("
        SELECT COUNT(*) as count FROM bookings
        WHERE vehicle_id = ?
        AND status IN ('pending', 'confirmed', 'active')
    ");
    $stmt->bind_param('i', $vehicleId);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();

    if ($row['count'] > 0) {
        sendErrorResponse('Cannot delete vehicle with active bookings');
    }
    $stmt->close();

    // Delete the vehicle
    $stmt = $conn->prepare('DELETE FROM vehicles WHERE id = ?');
    $stmt->bind_param('i', $vehicleId);

    if (!$stmt->execute()) {
        throw new Exception('Failed to delete vehicle');
    }
    $stmt->close();

    // Send success response
    sendSuccessResponse(null, 'Vehicle deleted successfully');

} catch (Exception $e) {
    sendErrorResponse('An error occurred while deleting vehicle', 500);
} finally {
    closeDbConnection($conn);
}
