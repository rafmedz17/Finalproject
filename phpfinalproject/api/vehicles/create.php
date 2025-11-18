<?php
/**
 * Create Vehicle Endpoint
 *
 * Creates a new vehicle (Admin only)
 * POST /api/vehicles/create.php
 */

require_once '../config/cors.php';
require_once '../config/database.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendErrorResponse('Method not allowed', 405);
}

// Check if user is logged in and is admin
if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'admin') {
    sendErrorResponse('Unauthorized. Admin access required.', 403);
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
$requiredFields = ['name', 'brand', 'category', 'pricePerDay', 'seats', 'transmission', 'fuel'];
foreach ($requiredFields as $field) {
    if (!isset($input[$field]) || trim($input[$field]) === '') {
        sendErrorResponse("Field '$field' is required");
    }
}

// Extract and validate data
$name = trim($input['name']);
$brand = trim($input['brand']);
$category = trim($input['category']);
$pricePerDay = floatval($input['pricePerDay']);
$image = isset($input['image']) ? $input['image'] : '/placeholder.svg';
$seats = intval($input['seats']);
$transmission = trim($input['transmission']);
$fuel = trim($input['fuel']);
$available = isset($input['available']) ? (filter_var($input['available'], FILTER_VALIDATE_BOOLEAN) ? 1 : 0) : 1;
$description = isset($input['description']) && trim($input['description']) !== '' ? trim($input['description']) : null;
$year = isset($input['year']) && $input['year'] !== '' ? intval($input['year']) : null;
$mileage = isset($input['mileage']) && trim($input['mileage']) !== '' ? trim($input['mileage']) : null;
$features = isset($input['features']) && !empty($input['features']) ? json_encode($input['features']) : '[]';

// Validate numeric values
if ($pricePerDay <= 0) {
    sendErrorResponse('Price per day must be greater than 0');
}

if ($seats <= 0) {
    sendErrorResponse('Seats must be greater than 0');
}

// Get database connection
$conn = getDbConnection();

try {
    // Insert new vehicle
    $stmt = $conn->prepare('
        INSERT INTO vehicles
        (name, brand, category, price_per_day, image, seats, transmission, fuel, available, description, year, mileage, features)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ');

    $stmt->bind_param(
        'sssdsissisiss',
        $name,
        $brand,
        $category,
        $pricePerDay,
        $image,
        $seats,
        $transmission,
        $fuel,
        $available,
        $description,
        $year,
        $mileage,
        $features
    );

    if (!$stmt->execute()) {
        error_log('MySQL Error: ' . $stmt->error);
        throw new Exception('Failed to create vehicle: ' . $stmt->error);
    }

    $vehicleId = $conn->insert_id;
    $stmt->close();

    // Get the newly created vehicle
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
        'message' => 'Vehicle created successfully'
    ]);

} catch (Exception $e) {
    error_log('Create vehicle error: ' . $e->getMessage());
    sendErrorResponse('An error occurred while creating vehicle: ' . $e->getMessage(), 500);
} finally {
    closeDbConnection($conn);
}
