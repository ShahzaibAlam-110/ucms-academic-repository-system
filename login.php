<?php
/**
 * UCMS Unified Digital Campus Portal
 * Institutional Authentication Engine
 */

declare(strict_types=1);
session_start();

require_once __DIR__ . '/config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: index.php');
    exit;
}

$identifier = trim($_POST['username'] ?? '');
$password   = trim($_POST['password'] ?? '');
$targetRole = trim($_POST['role'] ?? '');

if (empty($identifier) || empty($password)) {
    $_SESSION['login_error'] = 'Please provide both your institutional username/email and password.';
    header('Location: index.php');
    exit;
}

$pdo = Database::getConnection();

// Query user by username or official institutional email
$stmt = $pdo->prepare("
    SELECT u.*, d.name AS department_name, d.code AS department_code 
    FROM users u
    LEFT JOIN departments d ON u.department_id = d.id
    WHERE (u.username = :ident1 OR u.email = :ident2) AND u.status = 'active'
    LIMIT 1
");
$stmt->execute([':ident1' => $identifier, ':ident2' => $identifier]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    $_SESSION['login_error'] = 'Invalid institutional credentials. Please verify your username and password.';
    header('Location: index.php');
    exit;
}

// Optional role matching check
if (!empty($targetRole) && $user['role'] !== $targetRole) {
    // If user attempted to log in under wrong role tab, still authorize them in their authentic system role
    // and note it for seamless UX
}

// Set authenticated session state
$_SESSION['user'] = [
    'id'                   => (int)$user['id'],
    'username'             => $user['username'],
    'email'                => $user['email'],
    'full_name'            => $user['full_name'],
    'role'                 => $user['role'],
    'department_id'        => $user['department_id'],
    'department_name'      => $user['department_name'] ?? 'General Administration',
    'department_code'      => $user['department_code'] ?? 'ADMIN',
    'semester'             => $user['semester'] ? (int)$user['semester'] : null,
    'roll_number'          => $user['roll_number'],
    'designation'          => $user['designation'],
    'has_changed_password' => (int)$user['has_changed_password'],
    'login_time'           => date('Y-m-d H:i:s'),
];

// Audit trail logging
$auditStmt = $pdo->prepare("
    INSERT INTO audit_logs (user_id, action, details, ip_address) 
    VALUES (:uid, 'USER_LOGIN', :details, :ip)
");
$auditStmt->execute([
    ':uid'     => $user['id'],
    ':details' => "Successful login to role workspace: " . strtoupper($user['role']),
    ':ip'      => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1'
]);

// If AJAX request, return JSON
if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') {
    header('Content-Type: application/json');
    echo json_encode([
        'success'              => true,
        'user'                 => $_SESSION['user'],
        'has_changed_password' => (int)$user['has_changed_password'],
        'redirect'             => 'index.php'
    ]);
    exit;
}

header('Location: index.php');
exit;
