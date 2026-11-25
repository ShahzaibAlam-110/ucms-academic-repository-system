<?php
/**
 * UCMS UNIFIED 5-IN-1 DIGITAL CAMPUS PORTAL
 * Master Controller & Institutional Gateway
 * Built with: HTML5, CSS3, Vanilla JavaScript, PHP 8+, MySQL
 * Institution: University College of Management and Sciences (UCMS), Khanewal
 */

declare(strict_types=1);

// Error reporting
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/includes/auth.php';

// Check if user is authenticated in active session
$currentUser = getCurrentUser();

// Determine which view to render based on session state and user role
if ($currentUser === null) {
    // 1. PUBLIC HOMEPAGE & CENTRAL LOGIN GATEWAY
    require_once __DIR__ . '/views/public_view.php';
} else {
    // 2. SEAMLESS ROLE WORKSPACE
    $role = $currentUser['role'] ?? 'student';
    switch ($role) {
        case 'student':
            require_once __DIR__ . '/views/student_view.php';
            break;
        case 'teacher':
            require_once __DIR__ . '/views/teacher_view.php';
            break;
        case 'hod':
            require_once __DIR__ . '/views/hod_view.php';
            break;
        case 'admin':
            require_once __DIR__ . '/views/admin_view.php';
            break;
        default:
            require_once __DIR__ . '/views/public_view.php';
            break;
    }
}
