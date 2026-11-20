<?php
/**
 * UCMS Unified Digital Campus Portal
 * Password Update & First-Login Security Enforcement Handler
 */

declare(strict_types=1);
session_start();

if (!isset($_SESSION['user'])) {
    header('Location: index.php');
    exit;
}

require_once __DIR__ . '/config/db.php';

$userId = (int)$_SESSION['user']['id'];
$currentPassword = $_POST['current_password'] ?? '';
$newPassword     = $_POST['new_password'] ?? '';
$confirmPassword = $_POST['confirm_password'] ?? '';
$isFirstLogin    = isset($_POST['is_first_login']) && $_POST['is_first_login'] === '1';

$response = ['success' => false, 'message' => ''];

if (strlen($newPassword) < 8) {
    $response['message'] = 'New password must contain at least 8 characters.';
    echo json_encode($response);
    exit;
}

if ($newPassword !== $confirmPassword) {
    $response['message'] = 'New password and confirmation do not match.';
    echo json_encode($response);
    exit;
}

$pdo = Database::getConnection();

// Verify current password if not forced first login or if current password provided
$stmt = $pdo->prepare("SELECT password_hash FROM users WHERE id = :id LIMIT 1");
$stmt->execute([':id' => $userId]);
$userRecord = $stmt->fetch();

if (!$userRecord) {
    $response['message'] = 'User account not found.';
    echo json_encode($response);
    exit;
}

if (!empty($currentPassword) && !password_verify($currentPassword, $userRecord['password_hash'])) {
    $response['message'] = 'Current password is incorrect.';
    echo json_encode($response);
    exit;
}

// Generate new bcrypt hash
$newHash = password_hash($newPassword, PASSWORD_BCRYPT);

$updateStmt = $pdo->prepare("
    UPDATE users 
    SET password_hash = :hash, has_changed_password = 1, updated_at = NOW() 
    WHERE id = :id
");
$updateStmt->execute([
    ':hash' => $newHash,
    ':id'   => $userId
]);

// Update active session
$_SESSION['user']['has_changed_password'] = 1;

// Log to audit trail
$auditStmt = $pdo->prepare("
    INSERT INTO audit_logs (user_id, action, details, ip_address) 
    VALUES (:uid, 'PASSWORD_CHANGE', 'User updated institutional security credentials.', :ip)
");
$auditStmt->execute([
    ':uid' => $userId,
    ':ip'  => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1'
]);

$response['success'] = true;
$response['message'] = 'Password updated successfully. Institutional access credentials secured.';

if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') {
    header('Content-Type: application/json');
    echo json_encode($response);
    exit;
}

$_SESSION['success_flash'] = $response['message'];
header('Location: index.php');
exit;
