<?php
/**
 * Create Booking Endpoint
 *
 * Creates a new booking
 * POST /api/bookings/create.php
 */

require_once '../config/cors.php';
require_once '../config/database.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendErrorResponse('Method not allowed', 405);
}

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    sendErrorResponse('Unauthorized. Please login.', 401);
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
$requiredFields = ['vehicleId', 'startDate', 'endDate'];
foreach ($requiredFields as $field) {
    if (!isset($input[$field]) || trim($input[$field]) === '') {
        sendErrorResponse("Field '$field' is required");
    }
}

// Extract data
$vehicleId = intval($input['vehicleId']);
$startDate = trim($input['startDate']);
$endDate = trim($input['endDate']);

// Get database connection
$conn = getDbConnection();

try {
    // Get vehicle details
    $stmt = $conn->prepare('SELECT * FROM vehicles WHERE id = ?');
    $stmt->bind_param('i', $vehicleId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        sendErrorResponse('Vehicle not found', 404);
    }

    $vehicle = $result->fetch_assoc();
    $stmt->close();

    // Check if vehicle is available
    if (!$vehicle['available']) {
        sendErrorResponse('Vehicle is not available');
    }

    // Calculate total days
    $start = new DateTime($startDate);
    $end = new DateTime($endDate);
    $interval = $start->diff($end);
    $totalDays = $interval->days;

    if ($totalDays <= 0) {
        sendErrorResponse('End date must be after start date');
    }

    // Calculate total amount
    $pricePerDay = $vehicle['price_per_day'];
    $totalAmount = $pricePerDay * $totalDays;

    // Get user details for booking
    $stmt = $conn->prepare('SELECT name, email FROM users WHERE id = ?');
    $stmt->bind_param('i', $_SESSION['user_id']);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    $stmt->close();

    // Generate booking number
    $year = date('Y');
    $randomNum = str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
    $bookingNumber = "BK-{$year}-{$randomNum}";

    // Check for booking number conflicts (very unlikely but safe)
    $stmt = $conn->prepare('SELECT id FROM bookings WHERE booking_number = ?');
    $stmt->bind_param('s', $bookingNumber);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        // Generate a new one with timestamp
        $bookingNumber = "BK-{$year}-" . time();
    }
    $stmt->close();

    // Insert booking
    $stmt = $conn->prepare('
        INSERT INTO bookings
        (booking_number, user_id, vehicle_id, customer_name, customer_email, vehicle_name,
         start_date, end_date, total_days, price_per_day, total_amount, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ');

    $status = 'pending';
    $stmt->bind_param(
        'siisssssidds',
        $bookingNumber,
        $_SESSION['user_id'],
        $vehicleId,
        $user['name'],
        $user['email'],
        $vehicle['name'],
        $startDate,
        $endDate,
        $totalDays,
        $pricePerDay,
        $totalAmount,
        $status
    );

    if (!$stmt->execute()) {
        error_log('MySQL Error: ' . $stmt->error);
        throw new Exception('Failed to create booking: ' . $stmt->error);
    }

    $bookingId = $conn->insert_id;
    $stmt->close();

    // Get the newly created booking
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
        'message' => 'Booking created successfully'
    ]);

} catch (Exception $e) {
    error_log('Create booking error: ' . $e->getMessage());
    sendErrorResponse('An error occurred while creating booking: ' . $e->getMessage(), 500);
} finally {
    closeDbConnection($conn);
}
