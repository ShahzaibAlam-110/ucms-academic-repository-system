<?php
/**
 * UCMS Authentication, Session & Authorization Engine
 * Provides server-side Role-Based Access Control (RBAC), CSRF protection, and audit helpers.
 */

declare(strict_types=1);

if (session_status() === PHP_SESSION_NONE) {
    // Configure session cookie security
    ini_set('session.cookie_httponly', '1');
    ini_set('session.use_only_cookies', '1');
    if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') {
        ini_set('session.cookie_secure', '1');
    }
    session_start();
}

require_once __DIR__ . '/../config/db.php';

/**
 * Get currently authenticated user array or null
 */
function getCurrentUser(): ?array {
    return $_SESSION['user'] ?? null;
}

/**
 * Enforce authentication: redirect or exit if not authenticated
 */
function requireAuth(?string $redirectUrl = 'index.php'): array {
    $user = getCurrentUser();
    if ($user === null) {
        if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') {
            http_response_code(401);
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'error' => 'Authentication required. Please sign in.']);
            exit;
        }
        header("Location: {$redirectUrl}");
        exit;
    }
    return $user;
}

/**
 * Enforce role-based access control
 * @param array|string $allowedRoles e.g. ['admin', 'hod'] or 'student'
 */
function requireRole($allowedRoles, ?string $redirectUrl = 'index.php'): array {
    $user = requireAuth($redirectUrl);
    $roles = is_array($allowedRoles) ? $allowedRoles : [$allowedRoles];

    if (!in_array($user['role'], $roles, true)) {
        if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') {
            http_response_code(403);
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'error' => 'Unauthorized: Access restricted to authorized roles.']);
            exit;
        }
        header("Location: {$redirectUrl}");
        exit;
    }

    return $user;
}

/**
 * Generate or retrieve CSRF token
 */
function getCsrfToken(): string {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

/**
 * Validate CSRF token
 */
function verifyCsrfToken(?string $token): bool {
    if (empty($token) || empty($_SESSION['csrf_token'])) {
        return false;
    }
    return hash_equals($_SESSION['csrf_token'], $token);
}

/**
 * Sanitize string output for safe HTML display
 */
function e(?string $string): string {
    return htmlspecialchars($string ?? '', ENT_QUOTES, 'UTF-8');
}

/**
 * Insert an audit log entry
 */
function logAudit(PDO $pdo, int $userId, string $action, string $details): void {
    try {
        $stmt = $pdo->prepare("
            INSERT INTO audit_logs (user_id, action, details, ip_address, created_at)
            VALUES (:uid, :action, :details, :ip, NOW())
        ");
        $stmt->execute([
            ':uid'     => $userId,
            ':action'  => $action,
            ':details' => $details,
            ':ip'      => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1'
        ]);
    } catch (Exception $e) {
        // Non-blocking failure for audit logs
        error_log("Audit log failed: " . $e->getMessage());
    }
}

