<?php
/**
 * Get All Vehicles Endpoint
 *
 * Returns a list of all vehicles with optional filtering
 * GET /api/vehicles/index.php
 */

require_once '../config/cors.php';
require_once '../config/database.php';

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendErrorResponse('Method not allowed', 405);
}

// Get database connection
$conn = getDbConnection();

try {
    // Get query parameters for filtering
    $category = isset($_GET['category']) ? $_GET['category'] : null;
    $available = isset($_GET['available']) ? filter_var($_GET['available'], FILTER_VALIDATE_BOOLEAN) : null;
    $search = isset($_GET['search']) ? trim($_GET['search']) : null;

    // Build SQL query
    $sql = 'SELECT * FROM vehicles WHERE 1=1';
    $params = [];
    $types = '';

    // Add category filter
    if ($category && $category !== 'all') {
        $sql .= ' AND category = ?';
        $params[] = $category;
        $types .= 's';
    }

    // Add availability filter
    if ($available !== null) {
        $sql .= ' AND available = ?';
        $params[] = $available ? 1 : 0;
        $types .= 'i';
    }

    // Add search filter (name or brand)
    if ($search) {
        $sql .= ' AND (name LIKE ? OR brand LIKE ?)';
        $searchParam = '%' . $search . '%';
        $params[] = $searchParam;
        $params[] = $searchParam;
        $types .= 'ss';
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

    $vehicles = [];
    while ($row = $result->fetch_assoc()) {
        // Decode JSON features
        if ($row['features']) {
            $row['features'] = json_decode($row['features'], true);
        }
        // Convert available to boolean
        $row['available'] = (bool)$row['available'];
        // Convert price to float
        $row['price_per_day'] = (float)$row['price_per_day'];
        // Convert id to string for consistency with frontend
        $row['id'] = (string)$row['id'];
        // Rename fields to match frontend format
        $row['pricePerDay'] = $row['price_per_day'];
        unset($row['price_per_day']);
        unset($row['updated_at']);

        $vehicles[] = $row;
    }

    $stmt->close();

    // Send success response with vehicles
    sendSuccessResponse([
        'vehicles' => $vehicles,
        'count' => count($vehicles)
    ]);

} catch (Exception $e) {
    sendErrorResponse('An error occurred while fetching vehicles', 500);
} finally {
    closeDbConnection($conn);
}
