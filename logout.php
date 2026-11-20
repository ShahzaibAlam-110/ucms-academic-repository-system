<?php
/**
 * UCMS Unified Digital Campus Portal
 * Secure Logout & Session Termination
 */

declare(strict_types=1);
session_start();

if (isset($_SESSION['user'])) {
    require_once __DIR__ . '/config/db.php';
    try {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("
            INSERT INTO audit_logs (user_id, action, details, ip_address) 
            VALUES (:uid, 'USER_LOGOUT', 'User signed out from session.', :ip)
        ");
        $stmt->execute([
            ':uid' => $_SESSION['user']['id'],
            ':ip'  => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1'
        ]);
    } catch (Exception $e) {
        // Silently continue session destruction
    }
}

$_SESSION = [];
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}
session_destroy();

header('Location: index.php');
exit;
