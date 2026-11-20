<?php
/**
 * UCMS UNIFIED 5-IN-1 DIGITAL CAMPUS PORTAL
 * Master Controller & Institutional Gateway
 * Institution: University College of Management and Sciences (UCMS), Khanewal
 */

declare(strict_types=1);

// Enable error reporting to prevent silent blank pages
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

// Deliver the unified collegiate interface matching localhost:3000 directly under XAMPP
if (!isset($_GET['render']) || $_GET['render'] !== 'server') {
    if (file_exists(__DIR__ . '/dist/index.html')) {
        header('Content-Type: text/html; charset=UTF-8');
        readfile(__DIR__ . '/dist/index.html');
        exit;
    }
}

session_start();

require_once __DIR__ . '/config/db.php';

// Check if user is authenticated in active session
$currentUser = $_SESSION['user'] ?? null;

// Determine which view to render
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
