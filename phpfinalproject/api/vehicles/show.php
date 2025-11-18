<?php
/**
 * Get Single Vehicle Endpoint
 *
 * Returns details of a specific vehicle
 * GET /api/vehicles/show.php?id={id}
 */

require_once '../config/cors.php';
require_once '../config/database.php';

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendErrorResponse('Method not allowed', 405);
}

// Get vehicle ID from query parameter
if (!isset($_GET['id'])) {
    sendErrorResponse('Vehicle ID is required');
}

$vehicleId = intval($_GET['id']);

// Get database connection
$conn = getDbConnection();

try {
    // Prepare statement to find vehicle by ID
    $stmt = $conn->prepare('SELECT * FROM vehicles WHERE id = ?');
    $stmt->bind_param('i', $vehicleId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        sendErrorResponse('Vehicle not found', 404);
    }

    $vehicle = $result->fetch_assoc();
    $stmt->close();

    // Decode JSON features
    if ($vehicle['features']) {
        $vehicle['features'] = json_decode($vehicle['features'], true);
    }

    // Convert available to boolean
    $vehicle['available'] = (bool)$vehicle['available'];

    // Convert price to float
    $vehicle['price_per_day'] = (float)$vehicle['price_per_day'];

    // Convert id to string for consistency with frontend
    $vehicle['id'] = (string)$vehicle['id'];

    // Rename fields to match frontend format
    $vehicle['pricePerDay'] = $vehicle['price_per_day'];
    unset($vehicle['price_per_day']);
    unset($vehicle['updated_at']);

    // Send success response with vehicle data
    sendSuccessResponse([
        'vehicle' => $vehicle
    ]);

} catch (Exception $e) {
    sendErrorResponse('An error occurred while fetching vehicle', 500);
} finally {
    closeDbConnection($conn);
}
