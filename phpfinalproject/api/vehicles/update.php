<?php
/**
 * Update Vehicle Endpoint
 *
 * Updates an existing vehicle (Admin only)
 * PUT /api/vehicles/update.php
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

// Validate ID
if (!isset($input['id'])) {
    sendErrorResponse('Vehicle ID is required');
}

$vehicleId = intval($input['id']);

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

    // Build update query dynamically based on provided fields
    $updateFields = [];
    $params = [];
    $types = '';

    // Map of frontend field names to database column names
    $fieldMap = [
        'name' => 'name',
        'brand' => 'brand',
        'category' => 'category',
        'pricePerDay' => 'price_per_day',
        'image' => 'image',
        'seats' => 'seats',
        'transmission' => 'transmission',
        'fuel' => 'fuel',
        'available' => 'available',
        'description' => 'description',
        'year' => 'year',
        'mileage' => 'mileage',
        'features' => 'features'
    ];

    foreach ($fieldMap as $frontendField => $dbField) {
        if (isset($input[$frontendField])) {
            $updateFields[] = "$dbField = ?";

            if ($dbField === 'price_per_day') {
                $params[] = floatval($input[$frontendField]);
                $types .= 'd';
            } elseif ($dbField === 'seats' || $dbField === 'year') {
                $params[] = intval($input[$frontendField]);
                $types .= 'i';
            } elseif ($dbField === 'available') {
                $params[] = filter_var($input[$frontendField], FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
                $types .= 'i';
            } elseif ($dbField === 'features') {
                $params[] = json_encode($input[$frontendField]);
                $types .= 's';
            } else {
                $params[] = trim($input[$frontendField]);
                $types .= 's';
            }
        }
    }

    if (empty($updateFields)) {
        sendErrorResponse('No fields to update');
    }

    // Add vehicle ID to params
    $params[] = $vehicleId;
    $types .= 'i';

    // Build and execute update query
    $sql = 'UPDATE vehicles SET ' . implode(', ', $updateFields) . ' WHERE id = ?';
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);

    if (!$stmt->execute()) {
        throw new Exception('Failed to update vehicle');
    }
    $stmt->close();

    // Get the updated vehicle
    $stmt = $conn->prepare('SELECT * FROM vehicles WHERE id = ?');
    $stmt->bind_param('i', $vehicleId);
    $stmt->execute();
    $result = $stmt->get_result();
    $vehicle = $result->fetch_assoc();
    $stmt->close();

    // Format response
    if ($vehicle['features']) {
        $vehicle['features'] = json_decode($vehicle['features'], true);
    }
    $vehicle['available'] = (bool)$vehicle['available'];
    $vehicle['price_per_day'] = (float)$vehicle['price_per_day'];
    $vehicle['id'] = (string)$vehicle['id'];
    $vehicle['pricePerDay'] = $vehicle['price_per_day'];
    unset($vehicle['price_per_day']);
    unset($vehicle['updated_at']);

    // Send success response
    sendSuccessResponse([
        'vehicle' => $vehicle,
        'message' => 'Vehicle updated successfully'
    ]);

} catch (Exception $e) {
    sendErrorResponse('An error occurred while updating vehicle', 500);
} finally {
    closeDbConnection($conn);
}
