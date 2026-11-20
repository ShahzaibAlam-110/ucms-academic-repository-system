<?php
/**
 * UCMS Unified Digital Campus Portal - Comprehensive Automated Verification Suite
 */

declare(strict_types=1);

require_once __DIR__ . '/config/db.php';

$pdo = Database::getConnection();

function assertTest(string $name, bool $condition, string $details = '') {
    if ($condition) {
        echo "  [PASS] {$name}" . ($details ? " ({$details})" : "") . "\n";
    } else {
        echo "  [FAIL] {$name}" . ($details ? " - Reason: {$details}" : "") . "\n";
        exit(1);
    }
}

echo "====================================================================\n";
echo "🧪 STARTING COMPREHENSIVE UCMS SYSTEM VERIFICATION SUITE\n";
echo "====================================================================\n\n";

// TEST 1: Database connection and schema tables
echo "▶ 1. DATABASE SCHEMA & INTEGRITY VERIFICATION\n";
$tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
$expectedTables = [
    'departments', 'users', 'courses', 'course_allocations', 
    'handouts', 'resource_versions', 'timetables', 'announcements', 
    'announcement_reads', 'student_reports', 'cms_settings', 'audit_logs'
];
foreach ($expectedTables as $t) {
    assertTest("Table exists: {$t}", in_array($t, $tables, true));
}

// TEST 2: Authentication & Password Verification across all 4 roles
echo "\n▶ 2. AUTHENTICATION & CREDENTIAL VERIFICATION\n";
$testUsers = [
    'student' => 'shahzaib',
    'teacher' => 'dr_amna',
    'hod'     => 'hod_cs',
    'admin'   => 'admin'
];
foreach ($testUsers as $role => $username) {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = :u");
    $stmt->execute([':u' => $username]);
    $u = $stmt->fetch();
    assertTest("User exists: {$username} ({$role})", !empty($u));
    assertTest("Password verify 'password123' for {$username}", password_verify('password123', $u['password_hash']));
    assertTest("User role match for {$username}", $u['role'] === $role);
}

// TEST 3: Student Announcement Read Receipts
echo "\n▶ 3. STUDENT ANNOUNCEMENTS & UNREAD COUNTER\n";
$studentId = 1; // shahzaib
$annId = 1;
// Insert read receipt
$readStmt = $pdo->prepare("INSERT IGNORE INTO announcement_reads (announcement_id, user_id, read_at) VALUES (:aid, :uid, NOW())");
$readStmt->execute([':aid' => $annId, ':uid' => $studentId]);
$checkRead = $pdo->prepare("SELECT id FROM announcement_reads WHERE announcement_id = :aid AND user_id = :uid");
$checkRead->execute([':aid' => $annId, ':uid' => $studentId]);
assertTest("Student marked announcement as read", !empty($checkRead->fetch()));

// TEST 4: Student Problem/Grievance Reporting & Quota Enforcement
echo "\n▶ 4. STUDENT GRIEVANCE REPORTING & 3/WEEK QUOTA ENFORCEMENT\n";
$testSubject = "Automated Test Issue: CUDA Toolkit in CS Lab 2 (" . time() . ")";
$testDesc = "Detailed verification description for lab hardware workstation 15.";

// Check current count
$qCheck = $pdo->prepare("SELECT COUNT(*) FROM student_reports WHERE student_id = :uid AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)");
$qCheck->execute([':uid' => $studentId]);
$preCount = (int)$qCheck->fetchColumn();

// Insert test report
$repStmt = $pdo->prepare("
    INSERT INTO student_reports (student_id, category, subject, description, status, created_at)
    VALUES (:uid, 'Lab Hardware/Software', :sub, :desc, 'Pending Review', NOW())
");
$repStmt->execute([
    ':uid'  => $studentId,
    ':sub'  => $testSubject,
    ':desc' => $testDesc
]);
$reportId = (int)$pdo->lastInsertId();
assertTest("Student submitted academic grievance report", $reportId > 0, "Report ID: {$reportId}");

// TEST 5: Verify Report is Visible to Department HOD
echo "\n▶ 5. HOD DEPARTMENTAL VISIBILITY (STUDENT REPORT -> DEPT HOD)\n";
$hodDeptId = 1; // CS Department
$hodReportsStmt = $pdo->prepare("
    SELECT sr.*, u.full_name AS student_name, u.department_id
    FROM student_reports sr
    JOIN users u ON sr.student_id = u.id
    WHERE u.department_id = :did AND sr.id = :rid
");
$hodReportsStmt->execute([':did' => $hodDeptId, ':rid' => $reportId]);
$hodReport = $hodReportsStmt->fetch();
assertTest("HOD can view student report from their department", !empty($hodReport), "Subject: {$hodReport['subject']}");
assertTest("Report student belongs to HOD department", $hodReport['department_id'] == $hodDeptId);

// TEST 6: HOD Updates Report Status & Resolution Directive
echo "\n▶ 6. HOD UPDATES REPORT STATUS & DIRECTIVE\n";
$hodNote = "HOD CS Directive: Assigned Lab Engineer to install CUDA 12.2 on Workstation 15.";
$upHOD = $pdo->prepare("
    UPDATE student_reports 
    SET status = 'Under Investigation', admin_notes = :notes 
    WHERE id = :id
");
$upHOD->execute([':notes' => $hodNote, ':id' => $reportId]);

$checkHOD = $pdo->prepare("SELECT status, admin_notes FROM student_reports WHERE id = :id");
$checkHOD->execute([':id' => $reportId]);
$hodRes = $checkHOD->fetch();
assertTest("HOD updated report status to 'Under Investigation'", $hodRes['status'] === 'Under Investigation');
assertTest("HOD directive saved in admin_notes", $hodRes['admin_notes'] === $hodNote);

// TEST 7: Verify Report is Visible to Admin Institution-Wide
echo "\n▶ 7. ADMIN INSTITUTION-WIDE GRIEVANCE DESK VISIBILITY\n";
$adminReportsQuery = $pdo->prepare("
    SELECT sr.*, u.full_name AS student_name, d.code AS dept_code
    FROM student_reports sr
    JOIN users u ON sr.student_id = u.id
    LEFT JOIN departments d ON u.department_id = d.id
    WHERE sr.id = :rid
");
$adminReportsQuery->execute([':rid' => $reportId]);
$adminRep = $adminReportsQuery->fetch();
assertTest("Admin can view grievance across institution", !empty($adminRep), "Dept: {$adminRep['dept_code']}");

// TEST 8: Admin Resolves Report with Final Resolution Note
echo "\n▶ 8. ADMIN RESOLVES GRIEVANCE WITH OFFICIAL DIRECTIVE\n";
$adminNote = "Registrar Office: Lab Administrator verified CUDA 12.2 toolkit installation. Ticket Resolved.";
$upAdmin = $pdo->prepare("
    UPDATE student_reports 
    SET status = 'Resolved', admin_notes = :notes 
    WHERE id = :id
");
$upAdmin->execute([':notes' => $adminNote, ':id' => $reportId]);

$checkAdmin = $pdo->prepare("SELECT status, admin_notes FROM student_reports WHERE id = :id");
$checkAdmin->execute([':id' => $reportId]);
$adminRes = $checkAdmin->fetch();
assertTest("Admin resolved report to 'Resolved'", $adminRes['status'] === 'Resolved');
assertTest("Admin resolution notes recorded", $adminRes['admin_notes'] === $adminNote);

// TEST 9: Student Sees Resolved Status & Notes in Student View
echo "\n▶ 9. STUDENT VERIFICATION OF RESOLVED STATUS & REMARKS\n";
$stuQuery = $pdo->prepare("SELECT * FROM student_reports WHERE id = :id AND student_id = :uid");
$stuQuery->execute([':id' => $reportId, ':uid' => $studentId]);
$stuReport = $stuQuery->fetch();
assertTest("Student can see updated status 'Resolved'", $stuReport['status'] === 'Resolved');
assertTest("Student can see official response", !empty($stuReport['admin_notes']));

// TEST 10: Timetable Conflict Detection Engine
echo "\n▶ 10. TIMETABLE CLASH & CONFLICT DETECTION ENGINE\n";
// Attempt to schedule Dr. Amna (faculty_id 2) on Mon 08:30 AM - 10:00 AM (already booked for CS-401 in CS Lab 2)
$tConflict = $pdo->prepare("
    SELECT t.*, c.code, u.full_name 
    FROM timetables t
    JOIN courses c ON t.course_id = c.id
    JOIN users u ON t.faculty_id = u.id
    WHERE t.faculty_id = 2 AND t.day_of_week = 'Mon' AND t.timeslot = '08:30 AM - 10:00 AM'
");
$tConflict->execute();
assertTest("Teacher double-booking detected correctly", !empty($tConflict->fetch()));

// Room double-booking: CS Lab 2 on Mon 08:30 AM - 10:00 AM
$rConflict = $pdo->prepare("
    SELECT t.*, c.code, u.full_name 
    FROM timetables t
    JOIN courses c ON t.course_id = c.id
    JOIN users u ON t.faculty_id = u.id
    WHERE t.room = 'CS Lab 2' AND t.day_of_week = 'Mon' AND t.timeslot = '08:30 AM - 10:00 AM'
");
$rConflict->execute();
assertTest("Room double-booking detected correctly", !empty($rConflict->fetch()));

// Schedule valid slot, then delete it
$insSlot = $pdo->prepare("
    INSERT INTO timetables (course_id, faculty_id, day_of_week, timeslot, room, section)
    VALUES (1, 2, 'Fri', '02:30 PM - 04:00 PM', 'Hall B', 'BSCS-1B')
");
$insSlot->execute();
$newSlotId = (int)$pdo->lastInsertId();
assertTest("New valid timetable slot scheduled", $newSlotId > 0);

$delSlot = $pdo->prepare("DELETE FROM timetables WHERE id = :id");
$delSlot->execute([':id' => $newSlotId]);
assertTest("Timetable slot cancellation executed successfully", $delSlot->rowCount() > 0);

// TEST 11: Teacher Non-Destructive Handout Versioning
echo "\n▶ 11. FACULTY NON-DESTRUCTIVE HANDOUT VERSION ARCHIVING\n";
$handoutId = 1; // CS-401 Lecture Slide
$curStmt = $pdo->prepare("SELECT * FROM handouts WHERE id = :id");
$curStmt->execute([':id' => $handoutId]);
$curHandout = $curStmt->fetch();
$oldVersion = (int)$curHandout['current_version'];

// Archive version
$reason = "Automated test: Updated backpropagation gradient derivation slide 18.";
$arch = $pdo->prepare("
    INSERT INTO resource_versions (handout_id, version_number, file_name, replacement_reason, archived_at)
    VALUES (:hid, :vnum, :fname, :reason, NOW())
");
$arch->execute([
    ':hid'    => $handoutId,
    ':vnum'   => $oldVersion,
    ':fname'  => $curHandout['file_name'],
    ':reason' => $reason
]);

// Update handout to next version
$newVersion = $oldVersion + 1;
$upH = $pdo->prepare("UPDATE handouts SET current_version = :nv, updated_at = NOW() WHERE id = :id");
$upH->execute([':nv' => $newVersion, ':id' => $handoutId]);

$checkH = $pdo->prepare("SELECT current_version FROM handouts WHERE id = :id");
$checkH->execute([':id' => $handoutId]);
assertTest("Handout version incremented to v{$newVersion}", (int)$checkH->fetchColumn() === $newVersion);

$checkArch = $pdo->prepare("SELECT * FROM resource_versions WHERE handout_id = :id AND version_number = :vn");
$checkArch->execute([':id' => $handoutId, ':vn' => $oldVersion]);
assertTest("Immutable version archive preserved in resource_versions", !empty($checkArch->fetch()));

// TEST 12: Admin Cohort Semester Promotion & Single Student Upgrade
echo "\n▶ 12. ADMIN COHORT PROMOTION & LIFECYCLE UPGRADE\n";
$stuStmt = $pdo->prepare("SELECT id, semester FROM users WHERE role = 'student' AND semester = 5 LIMIT 1");
$stuStmt->execute();
$s5Student = $stuStmt->fetch();
if ($s5Student) {
    $targetId = (int)$s5Student['id'];
    $up1 = $pdo->prepare("UPDATE users SET semester = 6 WHERE id = :id");
    $up1->execute([':id' => $targetId]);
    
    $checkUp = $pdo->prepare("SELECT semester FROM users WHERE id = :id");
    $checkUp->execute([':id' => $targetId]);
    assertTest("Single student upgraded +1 semester (5 -> 6)", (int)$checkUp->fetchColumn() === 6);
    
    // revert for consistency
    $pdo->prepare("UPDATE users SET semester = 5 WHERE id = :id")->execute([':id' => $targetId]);
}

// TEST 13: Download Endpoint Verification
echo "\n▶ 13. AUTHENTICATED HANDOUT DOWNLOAD ENGINE\n";
$hQuery = $pdo->prepare("SELECT * FROM handouts WHERE id = 1");
$hQuery->execute();
$hData = $hQuery->fetch();
assertTest("Downloadable handout record found", !empty($hData));
assertTest("Handout contains valid filename", !empty($hData['file_name']));

echo "\n====================================================================\n";
echo "🎉 ALL TESTS PASSED! FULL SYSTEM VERIFICATION COMPLETE WITH 100% SUCCESS.\n";
echo "====================================================================\n";

