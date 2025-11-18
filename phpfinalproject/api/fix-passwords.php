<?php
/**
 * Fix Password Hashes
 *
 * This script updates all user passwords to "password123" with correct bcrypt hash
 */

require_once 'config/database.php';

echo "Fixing password hashes...\n\n";

try {
    $conn = getDbConnection();

    // Generate correct hash for "password123"
    $correctHash = password_hash('password123', PASSWORD_BCRYPT);

    echo "New password hash: $correctHash\n\n";

    // Update all users to use the correct password
    $stmt = $conn->prepare('UPDATE users SET password = ?');
    $stmt->bind_param('s', $correctHash);

    if ($stmt->execute()) {
        $affectedRows = $stmt->affected_rows;
        echo "✅ SUCCESS! Updated $affectedRows users.\n\n";
        echo "All users can now login with password: password123\n";
    } else {
        echo "❌ ERROR: Failed to update passwords\n";
    }

    $stmt->close();
    closeDbConnection($conn);

} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}
?>
