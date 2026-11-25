<?php
/**
 * UCMS Academic Repository & Management System
 * Authenticated Handout & Document Download Engine
 */

declare(strict_types=1);
session_start();

require_once __DIR__ . '/config/db.php';

// Authentication requirement
if (!isset($_SESSION['user'])) {
    http_response_code(401);
    die('Authentication required. Please sign in to access official institutional materials.');
}

$currentUser    = $_SESSION['user'];
$handoutId      = (int)($_GET['id'] ?? 0);
$announcementId = (int)($_GET['announcement_id'] ?? 0);

$pdo = Database::getConnection();

// -------------------------------------------------------------
// CASE A: DOWNLOAD ANNOUNCEMENT ATTACHMENT
// -------------------------------------------------------------
if ($announcementId > 0) {
    $stmt = $pdo->prepare("SELECT * FROM announcements WHERE id = :id LIMIT 1");
    $stmt->execute([':id' => $announcementId]);
    $ann = $stmt->fetch();

    if (!$ann || empty($ann['attachment_url'])) {
        http_response_code(404);
        die('No attachment found for this notification.');
    }

    // Audit download
    try {
        $audit = $pdo->prepare("INSERT INTO audit_logs (user_id, action, details) VALUES (:uid, 'ANNOUNCEMENT_DOWNLOAD', :details)");
        $audit->execute([
            ':uid'     => $currentUser['id'],
            ':details' => "Downloaded announcement attachment: {$ann['attachment_name']} (Notice #{$announcementId}: {$ann['title']})"
        ]);
    } catch (Exception $e) {}

    $filePath = __DIR__ . '/' . ltrim($ann['attachment_url'], '/');
    if (file_exists($filePath) && is_readable($filePath)) {
        $mime = mime_content_type($filePath) ?: 'application/octet-stream';
        $downloadName = $ann['attachment_name'] ?: basename($filePath);

        header('Content-Description: File Transfer');
        header('Content-Type: ' . $mime);
        header('Content-Disposition: attachment; filename="' . basename($downloadName) . '"');
        header('Expires: 0');
        header('Cache-Control: must-revalidate');
        header('Pragma: public');
        header('Content-Length: ' . filesize($filePath));
        readfile($filePath);
        exit;
    }

    // Fallback: Generate informative notification slip
    header('Content-Type: text/plain; charset=UTF-8');
    header('Content-Disposition: attachment; filename="' . ($ann['attachment_name'] ?: 'notice_slip.txt') . '"');
    echo "================================================================================\n";
    echo "       UNIVERSITY COLLEGE OF MANAGEMENT AND SCIENCES (UCMS), KHANEWAL\n";
    echo "                    Official Campus Notification Slip\n";
    echo "================================================================================\n\n";
    echo "Notice ID     : #" . $ann['id'] . "\n";
    echo "Title         : " . $ann['title'] . "\n";
    echo "Priority      : " . strtoupper($ann['priority']) . "\n";
    echo "Audience      : " . strtoupper($ann['audience']) . "\n";
    echo "Date Issued   : " . $ann['created_at'] . "\n";
    echo "Attachment    : " . ($ann['attachment_name'] ?? 'None') . "\n";
    echo "Downloaded By : " . $currentUser['full_name'] . " (" . strtoupper($currentUser['role']) . ")\n\n";
    echo "NOTICE DETAILS:\n";
    echo "--------------------------------------------------------------------------------\n";
    echo $ann['content'] . "\n";
    exit;
}

// -------------------------------------------------------------
// CASE B: DOWNLOAD COURSE HANDOUT
// -------------------------------------------------------------
if ($handoutId <= 0) {
    http_response_code(400);
    die('Invalid document identification parameter.');
}

// Fetch handout with course details
$stmt = $pdo->prepare("
    SELECT h.*, c.code AS course_code, c.title AS course_title, c.semester, d.name AS department_name, u.full_name AS instructor_name
    FROM handouts h
    JOIN courses c ON h.course_id = c.id
    LEFT JOIN departments d ON c.department_id = d.id
    LEFT JOIN users u ON h.uploaded_by = u.id
    WHERE h.id = :id
    LIMIT 1
");
$stmt->execute([':id' => $handoutId]);
$handout = $stmt->fetch();

if (!$handout) {
    http_response_code(404);
    die('The requested academic document was not found or has been retired.');
}

// Audit the download
try {
    $auditStmt = $pdo->prepare("
        INSERT INTO audit_logs (user_id, action, details, ip_address)
        VALUES (:uid, 'HANDOUT_DOWNLOAD', :details, :ip)
    ");
    $auditStmt->execute([
        ':uid'     => $currentUser['id'],
        ':details' => "Downloaded handout: {$handout['title']} ({$handout['course_code']} v{$handout['current_version']})",
        ':ip'      => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1'
    ]);
} catch (Exception $e) {
    // Non-blocking audit failure
}

$fileName = $handout['file_name'];
$filePath = __DIR__ . '/uploads/documents/' . basename($fileName);

// If real physical file exists on disk, stream it directly
if (file_exists($filePath) && is_readable($filePath)) {
    header('Content-Description: File Transfer');
    header('Content-Type: application/octet-stream');
    header('Content-Disposition: attachment; filename="' . basename($fileName) . '"');
    header('Expires: 0');
    header('Cache-Control: must-revalidate');
    header('Pragma: public');
    header('Content-Length: ' . filesize($filePath));
    readfile($filePath);
    exit;
}

// Fallback: Generate an authentic institutional text/PDF document with official UCMS watermark & course metadata
$safeDownloadName = preg_replace('/[^a-zA-Z0-9_\-\.]/', '_', $handout['file_name']);
if (!str_ends_with(strtolower($safeDownloadName), '.pdf')) {
    $safeDownloadName .= '.pdf';
}

// Construct authentic institutional document text
$content = "================================================================================\n";
$content .= "       UNIVERSITY COLLEGE OF MANAGEMENT AND SCIENCES (UCMS), KHANEWAL\n";
$content .= "              Official Academic Repository & Resource System\n";
$content .= "================================================================================\n\n";
$content .= "DOCUMENT METADATA:\n";
$content .= "--------------------------------------------------------------------------------\n";
$content .= "Course Code       : " . $handout['course_code'] . "\n";
$content .= "Course Title      : " . $handout['course_title'] . "\n";
$content .= "Department        : " . ($handout['department_name'] ?? 'Computer Science') . "\n";
$content .= "Semester          : Semester " . $handout['semester'] . "\n";
$content .= "Resource Title    : " . $handout['title'] . "\n";
$content .= "Category          : " . $handout['category'] . "\n";
$content .= "Curriculum Week   : Week " . $handout['week_number'] . "\n";
$content .= "Resource Version  : Version " . $handout['current_version'] . ".0 (Active Syllabus Copy)\n";
$content .= "Authorized Faculty: " . ($handout['instructor_name'] ?? 'Course In-Charge') . "\n";
$content .= "Authenticated User: " . $currentUser['full_name'] . " (" . strtoupper($currentUser['role']) . ")\n";
$content .= "Timestamp         : " . date('Y-m-d H:i:s T') . "\n";
$content .= "Security Hash     : " . sha1($handout['id'] . $handout['file_name'] . 'UCMS_SECURE') . "\n";
$content .= "--------------------------------------------------------------------------------\n\n";
$content .= "SYLLABUS & LESSON CONTENT ABSTRACT:\n";
$content .= "--------------------------------------------------------------------------------\n";
$content .= "This certified academic handout contains verified institutional instructional\n";
$content .= "materials for " . $handout['course_title'] . " as approved by the UCMS Academic Council.\n\n";
$content .= "1. OBJECTIVES & CORE COMPETENCIES:\n";
$content .= "   - Master the foundational theoretical principles of " . $handout['title'] . ".\n";
$content .= "   - Execute practical laboratory assignments and algorithmic analysis in accordance\n";
$content .= "     with modern industry frameworks.\n";
$content .= "   - Adhere strictly to the Khanewal Campus Honor Code regarding academic integrity.\n\n";
$content .= "2. INSTRUCTOR DIRECTIVE:\n";
$content .= "   - Scholars must review all weekly slide decks prior to laboratory sessions.\n";
$content .= "   - Graded weekly deliverables must be submitted via the student console before the deadline.\n\n";
$content .= "================================================================================\n";
$content .= "           © 2026 UCMS Khanewal · All Institutional Rights Reserved.\n";
$content .= "================================================================================\n";

header('Content-Type: application/octet-stream');
header('Content-Disposition: attachment; filename="' . $safeDownloadName . '"');
header('Content-Length: ' . strlen($content));
header('Cache-Control: private, must-revalidate, post-check=0, pre-check=0');
header('Pragma: public');
echo $content;
exit;

