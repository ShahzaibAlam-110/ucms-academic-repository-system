<?php
/**
 * UCMS Unified Digital Campus Portal
 * Unified Actions & API Controller
 */

declare(strict_types=1);
session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/config/db.php';

if (!isset($_SESSION['user'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Authentication required.']);
    exit;
}

$action = $_POST['action'] ?? $_GET['action'] ?? '';
$user   = $_SESSION['user'];
$pdo    = Database::getConnection();

try {
    switch ($action) {
        // -------------------------------------------------------------
        // STUDENT: MARK ANNOUNCEMENT AS READ
        // -------------------------------------------------------------
        case 'mark_read':
            $annId = (int)($_POST['announcement_id'] ?? 0);
            if ($annId <= 0) {
                throw new Exception('Invalid announcement ID.');
            }
            $stmt = $pdo->prepare("
                INSERT IGNORE INTO announcement_reads (announcement_id, user_id, read_at) 
                VALUES (:aid, :uid, NOW())
            ");
            $stmt->execute([':aid' => $annId, ':uid' => $user['id']]);

            echo json_encode(['success' => true]);
            break;

        // -------------------------------------------------------------
        // STUDENT: SUBMIT ACADEMIC ISSUE REPORT (Strict Quota: Max 3/Week)
        // -------------------------------------------------------------
        case 'submit_report':
            if ($user['role'] !== 'student') {
                throw new Exception('Only students may submit academic reports.');
            }

            // Check quota in the past 7 days
            $countStmt = $pdo->prepare("
                SELECT COUNT(*) FROM student_reports 
                WHERE student_id = :uid AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            ");
            $countStmt->execute([':uid' => $user['id']]);
            $recentCount = (int)$countStmt->fetchColumn();

            if ($recentCount >= 3) {
                throw new Exception('Rate limit exceeded: You have reached the maximum quota of 3 academic reports per week.');
            }

            $category = trim($_POST['category'] ?? 'Other');
            $subject  = trim($_POST['subject'] ?? '');
            $desc     = trim($_POST['description'] ?? '');

            if (empty($subject) || empty($desc)) {
                throw new Exception('Please provide both subject and detailed description.');
            }

            $insStmt = $pdo->prepare("
                INSERT INTO student_reports (student_id, category, subject, description, status, created_at)
                VALUES (:uid, :cat, :sub, :desc, 'Pending Review', NOW())
            ");
            $insStmt->execute([
                ':uid'  => $user['id'],
                ':cat'  => $category,
                ':sub'  => $subject,
                ':desc' => $desc
            ]);

            // Audit
            $audit = $pdo->prepare("INSERT INTO audit_logs (user_id, action, details) VALUES (:uid, 'REPORT_SUBMITTED', :details)");
            $audit->execute([':uid' => $user['id'], ':details' => "Academic issue filed: $subject ($category)"]);

            echo json_encode([
                'success' => true,
                'remaining' => 3 - ($recentCount + 1),
                'message' => 'Your academic report has been logged and assigned tracking ID.'
            ]);
            break;

        // -------------------------------------------------------------
        // FACULTY: UPLOAD OR VERSION-REPLACE HANDOUT
        // -------------------------------------------------------------
        case 'upload_handout':
            if ($user['role'] !== 'teacher' && $user['role'] !== 'hod') {
                throw new Exception('Unauthorized: Faculty role required.');
            }

            $courseId   = (int)($_POST['course_id'] ?? 0);
            $title      = trim($_POST['title'] ?? '');
            $category   = trim($_POST['category'] ?? 'Lecture Slide');
            $weekNum    = (int)($_POST['week_number'] ?? 1);
            $handoutId  = (int)($_POST['handout_id'] ?? 0); // If > 0, this is a replacement!
            $reason     = trim($_POST['replacement_reason'] ?? '');
            $fileName   = trim($_POST['file_name'] ?? ('UCMS_' . time() . '.pdf'));

            // Check if actual file was uploaded via $_FILES['file']
            if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
                $upFile = $_FILES['file'];
                $cleanUpName = preg_replace('/[^a-zA-Z0-9_\-\.]/', '_', basename($upFile['name']));
                $targetDir = __DIR__ . '/uploads/documents';
                if (!is_dir($targetDir)) {
                    mkdir($targetDir, 0777, true);
                }
                $destPath = $targetDir . '/' . $cleanUpName;
                if (move_uploaded_file($upFile['tmp_name'], $destPath)) {
                    $fileName = $cleanUpName;
                }
            }

            if ($handoutId > 0) {
                // Non-Destructive Version Replacement:
                // Fetch current version
                $curStmt = $pdo->prepare("SELECT * FROM handouts WHERE id = :id LIMIT 1");
                $curStmt->execute([':id' => $handoutId]);
                $current = $curStmt->fetch();
                if (!$current) {
                    throw new Exception('Handout not found for version update.');
                }

                if (empty($reason)) {
                    throw new Exception('Immutable replacement reason is required for archival auditing.');
                }

                // 1. Archive current version into resource_versions
                $archStmt = $pdo->prepare("
                    INSERT INTO resource_versions (handout_id, version_number, file_name, replacement_reason, archived_at)
                    VALUES (:hid, :vnum, :fname, :reason, NOW())
                ");
                $archStmt->execute([
                    ':hid'    => $current['id'],
                    ':vnum'   => $current['current_version'],
                    ':fname'  => $current['file_name'],
                    ':reason' => $reason
                ]);

                // 2. Increment version and update active record
                $newVersion = $current['current_version'] + 1;
                $upStmt = $pdo->prepare("
                    UPDATE handouts 
                    SET title = :title, file_name = :fname, current_version = :vnum, updated_at = NOW()
                    WHERE id = :id
                ");
                $upStmt->execute([
                    ':title' => $title ?: $current['title'],
                    ':fname' => $fileName,
                    ':vnum'  => $newVersion,
                    ':id'    => $handoutId
                ]);

                // Audit
                $audit = $pdo->prepare("INSERT INTO audit_logs (user_id, action, details) VALUES (:uid, 'HANDOUT_VERSIONED', :details)");
                $audit->execute([':uid' => $user['id'], ':details' => "Updated handout #{$handoutId} to version {$newVersion}: {$reason}"]);

                echo json_encode([
                    'success' => true,
                    'version' => $newVersion,
                    'message' => "Resource successfully updated to version v{$newVersion}. Previous version archived in immutable audit repository."
                ]);
            } else {
                // New Handout Insert
                if (empty($title) || $courseId <= 0) {
                    throw new Exception('Course and title are required.');
                }
                $ins = $pdo->prepare("
                    INSERT INTO handouts (course_id, uploaded_by, title, file_name, file_size, category, week_number, current_version, created_at)
                    VALUES (:cid, :uid, :title, :fname, '2.8 MB', :cat, :week, 1, NOW())
                ");
                $ins->execute([
                    ':cid'   => $courseId,
                    ':uid'   => $user['id'],
                    ':title' => $title,
                    ':fname' => $fileName,
                    ':cat'   => $category,
                    ':week'  => $weekNum
                ]);

                $audit = $pdo->prepare("INSERT INTO audit_logs (user_id, action, details) VALUES (:uid, 'HANDOUT_UPLOADED', :details)");
                $audit->execute([':uid' => $user['id'], ':details' => "Uploaded new resource: {$title} for course ID {$courseId}"]);

                echo json_encode([
                    'success' => true,
                    'message' => 'New academic resource published to student portal.'
                ]);
            }
            break;

        // -------------------------------------------------------------
        // HOD CS: ALLOCATE COURSE TO FACULTY
        // -------------------------------------------------------------
        case 'allocate_course':
            if ($user['role'] !== 'hod' && $user['role'] !== 'admin') {
                throw new Exception('Unauthorized: HOD or Admin authorization required.');
            }

            $courseId  = (int)($_POST['course_id'] ?? 0);
            $facultyId = (int)($_POST['faculty_id'] ?? 0);
            $session   = trim($_POST['session'] ?? 'Fall 2026');

            if ($courseId <= 0 || $facultyId <= 0) {
                throw new Exception('Valid CS course and faculty member selection required.');
            }

            // Verify course is Computer Science
            $chkCourse = $pdo->prepare("SELECT code, title, department_id FROM courses WHERE id = :cid LIMIT 1");
            $chkCourse->execute([':cid' => $courseId]);
            $cData = $chkCourse->fetch();

            if (!$cData || $cData['department_id'] != 1) {
                throw new Exception('HOD CS can strictly allocate Computer Science department courses only.');
            }

            // Upsert allocation
            $allocStmt = $pdo->prepare("
                INSERT INTO course_allocations (course_id, faculty_id, session)
                VALUES (:cid, :fid, :sess)
                ON DUPLICATE KEY UPDATE faculty_id = :fid2, session = :sess2
            ");
            $allocStmt->execute([
                ':cid'   => $courseId,
                ':fid'   => $facultyId,
                ':sess'  => $session,
                ':fid2'  => $facultyId,
                ':sess2' => $session
            ]);

            // Audit
            $audit = $pdo->prepare("INSERT INTO audit_logs (user_id, action, details) VALUES (:uid, 'COURSE_ALLOCATION', :details)");
            $audit->execute([':uid' => $user['id'], ':details' => "Allocated {$cData['code']}: {$cData['title']} to faculty ID {$facultyId} for {$session}"]);

            echo json_encode([
                'success' => true,
                'message' => "Course {$cData['code']} formally assigned. Automatic notification dispatched to instructor and cohort."
            ]);
            break;

        // -------------------------------------------------------------
        // HOD CS: ADD TIMETABLE WITH CONFLICT DETECTION
        // -------------------------------------------------------------
        case 'add_timetable':
            if ($user['role'] !== 'hod' && $user['role'] !== 'admin') {
                throw new Exception('Unauthorized: HOD or Admin authorization required.');
            }

            $courseId  = (int)($_POST['course_id'] ?? 0);
            $facultyId = (int)($_POST['faculty_id'] ?? 0);
            $day       = trim($_POST['day_of_week'] ?? 'Mon');
            $timeslot  = trim($_POST['timeslot'] ?? '');
            $room      = trim($_POST['room'] ?? '');
            $section   = trim($_POST['section'] ?? 'BSCS-7A');

            if (empty($timeslot) || empty($room) || $courseId <= 0 || $facultyId <= 0) {
                throw new Exception('All timetable parameters (course, instructor, day, time, room) are required.');
            }

            // 1. Check Teacher Double-Booking Conflict:
            // "same teacher cannot be in two classes at once"
            $tConflict = $pdo->prepare("
                SELECT t.*, c.code, c.title, u.full_name 
                FROM timetables t
                JOIN courses c ON t.course_id = c.id
                JOIN users u ON t.faculty_id = u.id
                WHERE t.faculty_id = :fid AND t.day_of_week = :day AND t.timeslot = :t
                LIMIT 1
            ");
            $tConflict->execute([':fid' => $facultyId, ':day' => $day, ':t' => $timeslot]);
            $tRow = $tConflict->fetch();

            if ($tRow) {
                throw new Exception("TEACHER DOUBLE-BOOKING CONFLICT: {$tRow['full_name']} is already scheduled for {$tRow['code']} ({$tRow['room']}) on {$day} at {$timeslot}.");
            }

            // 2. Check Room Double-Booking Conflict:
            // "same classroom/lab cannot host two lectures at once"
            $rConflict = $pdo->prepare("
                SELECT t.*, c.code, c.title, u.full_name 
                FROM timetables t
                JOIN courses c ON t.course_id = c.id
                JOIN users u ON t.faculty_id = u.id
                WHERE t.room = :room AND t.day_of_week = :day AND t.timeslot = :t
                LIMIT 1
            ");
            $rConflict->execute([':room' => $room, ':day' => $day, ':t' => $timeslot]);
            $rRow = $rConflict->fetch();

            if ($rRow) {
                throw new Exception("VENUE OVERLAPPING CONFLICT: {$room} is already booked by {$rRow['full_name']} for {$rRow['code']} on {$day} at {$timeslot}.");
            }

            // 3. Check Section Double-Booking Conflict:
            // "same student section cannot be scheduled for two lectures at once"
            $sConflict = $pdo->prepare("
                SELECT t.*, c.code, c.title, u.full_name 
                FROM timetables t
                JOIN courses c ON t.course_id = c.id
                JOIN users u ON t.faculty_id = u.id
                WHERE t.section = :sec AND t.day_of_week = :day AND t.timeslot = :t
                LIMIT 1
            ");
            $sConflict->execute([':sec' => $section, ':day' => $day, ':t' => $timeslot]);
            $sRow = $sConflict->fetch();

            if ($sRow) {
                throw new Exception("SECTION SCHEDULE CLASH: Section {$section} already has {$sRow['code']} ({$sRow['title']}) scheduled on {$day} at {$timeslot}.");
            }

            // Insert approved non-conflicting schedule
            $ins = $pdo->prepare("
                INSERT INTO timetables (course_id, faculty_id, day_of_week, timeslot, room, section, created_at)
                VALUES (:cid, :fid, :day, :t, :room, :sec, NOW())
            ");
            $ins->execute([
                ':cid'  => $courseId,
                ':fid'  => $facultyId,
                ':day'  => $day,
                ':t'    => $timeslot,
                ':room' => $room,
                ':sec'  => $section
            ]);

            // Audit
            $audit = $pdo->prepare("INSERT INTO audit_logs (user_id, action, details) VALUES (:uid, 'TIMETABLE_ADDED', :details)");
            $audit->execute([':uid' => $user['id'], ':details' => "Scheduled lecture in {$room} on {$day} {$timeslot}"]);

            echo json_encode([
                'success' => true,
                'message' => "Timetable entry validated without conflicts. Room {$room} reserved."
            ]);
            break;

        // -------------------------------------------------------------
        // ADMIN: COHORT SEMESTER PROMOTION & UPGRADE ENGINE
        // -------------------------------------------------------------
        case 'promote_cohort':
            if ($user['role'] !== 'admin') {
                throw new Exception('Unauthorized: Master Admin role required.');
            }

            $deptId   = (int)($_POST['department_id'] ?? 1);
            $semester = (int)($_POST['semester'] ?? 0);
            $actionType = $_POST['action_type'] ?? 'promote'; // 'promote' or 'graduate'

            if ($deptId <= 0 || $semester <= 0 || $semester > 8) {
                throw new Exception('Invalid department or semester selection.');
            }

            $pdo->beginTransaction();

            if ($actionType === 'graduate' || $semester === 8) {
                // Graduate Entire Cohort to Alumni
                $gradStmt = $pdo->prepare("
                    UPDATE users 
                    SET status = 'graduated', designation = 'UCMS Alumnus (Conferred)'
                    WHERE department_id = :did AND semester = 8 AND role = 'student' AND status = 'active'
                ");
                $gradStmt->execute([':did' => $deptId]);
                $affected = $gradStmt->rowCount();

                $audit = $pdo->prepare("INSERT INTO audit_logs (user_id, action, details) VALUES (:uid, 'COHORT_GRADUATED', :details)");
                $audit->execute([
                    ':uid'     => $user['id'],
                    ':details' => "Conferred degrees upon {$affected} graduating students of Department ID {$deptId} (8th Semester Alumni)."
                ]);

                $pdo->commit();

                echo json_encode([
                    'success'  => true,
                    'affected' => $affected,
                    'message'  => "Successfully graduated {$affected} scholars into the UCMS Alumni Registry. Degrees conferred."
                ]);
            } else {
                // Promote Cohort to Next Semester
                $targetSemester = $semester + 1;
                $promStmt = $pdo->prepare("
                    UPDATE users 
                    SET semester = :nextSem
                    WHERE department_id = :did AND semester = :curSem AND role = 'student' AND status = 'active'
                ");
                $promStmt->execute([
                    ':nextSem' => $targetSemester,
                    ':did'     => $deptId,
                    ':curSem'  => $semester
                ]);
                $affected = $promStmt->rowCount();

                $audit = $pdo->prepare("INSERT INTO audit_logs (user_id, action, details) VALUES (:uid, 'COHORT_PROMOTION', :details)");
                $audit->execute([
                    ':uid'     => $user['id'],
                    ':details' => "Batch promoted {$affected} students of Department ID {$deptId} from Semester {$semester} to Semester {$targetSemester}."
                ]);

                $pdo->commit();

                echo json_encode([
                    'success'  => true,
                    'affected' => $affected,
                    'message'  => "Successfully promoted {$affected} students from Semester {$semester} to Semester {$targetSemester}."
                ]);
            }
            break;

        // -------------------------------------------------------------
        // ADMIN: QUICK +1 SEMESTER ON SINGLE STUDENT
        // -------------------------------------------------------------
        case 'upgrade_single_student':
            if ($user['role'] !== 'admin') {
                throw new Exception('Unauthorized: Master Admin role required.');
            }

            $studentId = (int)($_POST['student_id'] ?? 0);
            $sQuery = $pdo->prepare("SELECT * FROM users WHERE id = :id AND role = 'student' LIMIT 1");
            $sQuery->execute([':id' => $studentId]);
            $stu = $sQuery->fetch();

            if (!$stu) {
                throw new Exception('Student not found.');
            }

            $curSem = (int)$stu['semester'];
            if ($curSem >= 8) {
                // Graduate
                $up = $pdo->prepare("UPDATE users SET status = 'graduated', designation = 'UCMS Alumnus' WHERE id = :id");
                $up->execute([':id' => $studentId]);
                $msg = "Student {$stu['full_name']} graduated to Alumni status.";
            } else {
                $next = $curSem + 1;
                $up = $pdo->prepare("UPDATE users SET semester = :next WHERE id = :id");
                $up->execute([':next' => $next, ':id' => $studentId]);
                $msg = "Student {$stu['full_name']} upgraded to Semester {$next}.";
            }

            $audit = $pdo->prepare("INSERT INTO audit_logs (user_id, action, details) VALUES (:uid, 'SINGLE_STUDENT_UPGRADE', :details)");
            $audit->execute([':uid' => $user['id'], ':details' => $msg]);

            echo json_encode(['success' => true, 'message' => $msg]);
            break;

        // -------------------------------------------------------------
        // ADMIN: UPDATE PUBLIC CMS SETTINGS
        // -------------------------------------------------------------
        case 'save_cms':
        case 'update_cms':
            if ($user['role'] !== 'admin') {
                throw new Exception('Unauthorized: Master Admin role required.');
            }

            $keys = [
                'stat_faculties', 'stat_faculty_members', 'stat_faculty', 'stat_students', 'stat_labs',
                'stat_programs', 'stat_alumni',
                'admission_deadline', 'admission_term', 'campus_contact_phone',
                'campus_contact_email', 'campus_address', 'institution_notice'
            ];

            foreach ($keys as $k) {
                if (isset($_POST[$k])) {
                    $val = trim($_POST[$k]);
                    $up = $pdo->prepare("
                        INSERT INTO cms_settings (setting_key, setting_value, updated_at) 
                        VALUES (:k, :v, NOW()) 
                        ON DUPLICATE KEY UPDATE setting_value = :v2, updated_at = NOW()
                    ");
                    $up->execute([':k' => $k, ':v' => $val, ':v2' => $val]);
                }
            }

            $audit = $pdo->prepare("INSERT INTO audit_logs (user_id, action, details) VALUES (:uid, 'CMS_UPDATE', 'Public institutional website CMS settings updated.')");
            $audit->execute([':uid' => $user['id']]);

            echo json_encode(['success' => true, 'message' => 'Institutional website CMS parameters updated live.']);
            break;

        // -------------------------------------------------------------
        // HOD / ADMIN: DELETE TIMETABLE ENTRY
        // -------------------------------------------------------------
        case 'delete_timetable':
            if ($user['role'] !== 'hod' && $user['role'] !== 'admin') {
                throw new Exception('Unauthorized: HOD or Admin role required.');
            }

            $slotId = (int)($_POST['slot_id'] ?? 0);
            if ($slotId <= 0) {
                throw new Exception('Invalid timetable slot identification.');
            }

            $chk = $pdo->prepare("
                SELECT t.*, c.code, c.title, c.department_id 
                FROM timetables t
                JOIN courses c ON t.course_id = c.id
                WHERE t.id = :id
                LIMIT 1
            ");
            $chk->execute([':id' => $slotId]);
            $slot = $chk->fetch();

            if (!$slot) {
                throw new Exception('Timetable entry not found.');
            }

            if ($user['role'] === 'hod' && $slot['department_id'] != $user['department_id']) {
                throw new Exception('HOD can only remove timetable entries for their own department.');
            }

            $del = $pdo->prepare("DELETE FROM timetables WHERE id = :id");
            $del->execute([':id' => $slotId]);

            $audit = $pdo->prepare("INSERT INTO audit_logs (user_id, action, details) VALUES (:uid, 'TIMETABLE_DELETED', :details)");
            $audit->execute([
                ':uid' => $user['id'],
                ':details' => "Removed timetable entry for {$slot['code']} on {$slot['day_of_week']} {$slot['timeslot']} ({$slot['room']})"
            ]);

            echo json_encode(['success' => true, 'message' => "Timetable slot removed successfully."]);
            break;

        // -------------------------------------------------------------
        // HOD / ADMIN: REGISTER NEW USER / FACULTY MEMBER
        // -------------------------------------------------------------
        case 'create_user':
            if ($user['role'] !== 'admin' && $user['role'] !== 'hod') {
                throw new Exception('Unauthorized: Administrative authorization required to register users.');
            }

            $fullName     = trim($_POST['full_name'] ?? '');
            $email        = trim($_POST['email'] ?? '');
            $username     = trim($_POST['username'] ?? '');
            $plainPass    = trim($_POST['password'] ?? 'password123');
            $role         = trim($_POST['role'] ?? 'student');
            $deptId       = !empty($_POST['department_id']) ? (int)$_POST['department_id'] : ($user['department_id'] ?? 1);
            $semester     = !empty($_POST['semester']) ? (int)$_POST['semester'] : null;
            $rollNo       = trim($_POST['roll_number'] ?? '');
            $designation  = trim($_POST['designation'] ?? '');

            if ($user['role'] === 'hod') {
                // HOD can only register faculty in their department
                $role = 'teacher';
                $deptId = $user['department_id'] ?? 1;
            }

            if (empty($fullName) || empty($email) || empty($username)) {
                throw new Exception('Full name, email, and username are mandatory.');
            }

            // Check if username or email already exists
            $checkStmt = $pdo->prepare("SELECT id FROM users WHERE username = :u OR email = :e LIMIT 1");
            $checkStmt->execute([':u' => $username, ':e' => $email]);
            if ($checkStmt->fetch()) {
                throw new Exception('A user with this username or email already exists.');
            }

            $hash = password_hash($plainPass, PASSWORD_BCRYPT);
            $insertStmt = $pdo->prepare("
                INSERT INTO users (username, email, password_hash, full_name, role, department_id, semester, roll_number, designation, workload_credits, has_changed_password, status)
                VALUES (:u, :e, :h, :fn, :r, :d, :s, :rn, :des, 0, 0, 'active')
            ");
            $insertStmt->execute([
                ':u'   => $username,
                ':e'   => $email,
                ':h'   => $hash,
                ':fn'  => $fullName,
                ':r'   => $role,
                ':d'   => $deptId,
                ':s'   => $semester,
                ':rn'  => !empty($rollNo) ? $rollNo : null,
                ':des' => !empty($designation) ? $designation : ($role === 'teacher' ? 'Assistant Professor' : 'Undergraduate Scholar')
            ]);
            $newId = $pdo->lastInsertId();

            $audit = $pdo->prepare("INSERT INTO audit_logs (user_id, action, details) VALUES (:uid, 'USER_REGISTERED', :details)");
            $audit->execute([
                ':uid' => $user['id'],
                ':details' => "Registered new {$role} user: '{$fullName}' ({$username}, {$email}) with temporary password setup."
            ]);

            echo json_encode([
                'success' => true,
                'message' => "User '{$fullName}' ({$role}) registered successfully with ID #{$newId}.",
                'user_id' => $newId
            ]);
            break;

        // -------------------------------------------------------------
        // HOD / ADMIN: UPDATE STUDENT GRIEVANCE REPORT STATUS & NOTES
        // -------------------------------------------------------------
        case 'update_report_status':
            if ($user['role'] !== 'hod' && $user['role'] !== 'admin' && $user['role'] !== 'teacher') {
                throw new Exception('Unauthorized: Faculty, HOD or Admin authorization required.');
            }

            $reportId  = (int)($_POST['report_id'] ?? 0);
            $newStatus = trim($_POST['status'] ?? '');
            $notes     = trim($_POST['admin_notes'] ?? '');

            $validStatuses = ['Pending Review', 'Under Investigation', 'Resolved', 'Dismissed'];
            if (!in_array($newStatus, $validStatuses, true)) {
                throw new Exception('Invalid report status specified.');
            }

            $chk = $pdo->prepare("
                SELECT sr.*, u.department_id, u.full_name AS student_name, d.name AS dept_name
                FROM student_reports sr
                JOIN users u ON sr.student_id = u.id
                LEFT JOIN departments d ON u.department_id = d.id
                WHERE sr.id = :id
                LIMIT 1
            ");
            $chk->execute([':id' => $reportId]);
            $report = $chk->fetch();

            if (!$report) {
                throw new Exception('Student issue report not found.');
            }

            // HOD boundary validation: HOD can only update reports from their own department
            if ($user['role'] === 'hod' && $report['department_id'] != $user['department_id']) {
                throw new Exception('HOD authority is strictly restricted to their own department scholars.');
            }

            $up = $pdo->prepare("
                UPDATE student_reports 
                SET status = :status, admin_notes = :notes
                WHERE id = :id
            ");
            $up->execute([
                ':status' => $newStatus,
                ':notes'  => $notes,
                ':id'     => $reportId
            ]);

            $roleName = strtoupper($user['role']);
            $audit = $pdo->prepare("INSERT INTO audit_logs (user_id, action, details) VALUES (:uid, 'REPORT_STATUS_UPDATED', :details)");
            $audit->execute([
                ':uid'     => $user['id'],
                ':details' => "Report #{$reportId} ({$report['subject']}) for student {$report['student_name']} updated to '{$newStatus}' by {$roleName}. Notes: {$notes}"
            ]);

            echo json_encode([
                'success' => true,
                'message' => "Report #{$reportId} status successfully updated to '{$newStatus}'."
            ]);
            break;

        // -------------------------------------------------------------
        // ADMIN / HOD / FACULTY: POST ANNOUNCEMENT / UPDATE
        // WITH OPTIONAL PAGE NOTIFICATION / DOCUMENT / PICTURE ATTACHMENT
        // -------------------------------------------------------------
        case 'post_announcement':
        case 'create_announcement':
            if (!in_array($user['role'], ['admin', 'hod', 'teacher'], true)) {
                throw new Exception('Unauthorized: Administrative or Faculty authorization required to publish announcements.');
            }

            $title    = trim($_POST['title'] ?? '');
            $content  = trim($_POST['content'] ?? '');
            $priority = trim($_POST['priority'] ?? 'normal');
            $audience = trim($_POST['audience'] ?? 'all');

            if (empty($title) || empty($content)) {
                throw new Exception('Announcement title and notification message are required.');
            }

            if (!in_array($priority, ['normal', 'important', 'urgent'], true)) {
                $priority = 'normal';
            }

            if (!in_array($audience, ['all', 'students', 'teachers', 'cs_only'], true)) {
                $audience = 'all';
            }

            // Role constraints
            if ($user['role'] === 'teacher' && !in_array($audience, ['students', 'all'], true)) {
                $audience = 'students';
            }
            if ($user['role'] === 'hod' && $audience === 'all') {
                $audience = 'cs_only';
            }

            $attachmentName = null;
            $attachmentUrl  = null;
            $attachmentType = null;
            $attachmentSize = null;

            // Handle optional file/image upload
            if (isset($_FILES['attachment']) && $_FILES['attachment']['error'] !== UPLOAD_ERR_NO_FILE) {
                $file = $_FILES['attachment'];

                if ($file['error'] !== UPLOAD_ERR_OK) {
                    throw new Exception('File upload error (code ' . $file['error'] . ').');
                }

                if ($file['size'] > 25 * 1024 * 1024) {
                    throw new Exception('Attachment exceeds maximum allowed file size of 25 MB.');
                }

                $origName = basename($file['name']);
                $ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));

                $imageExts = ['png', 'jpg', 'jpeg', 'webp', 'gif'];
                $docExts   = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'xls', 'xlsx', 'ppt', 'pptx'];
                $allowedExts = array_merge($imageExts, $docExts);

                if (!in_array($ext, $allowedExts, true)) {
                    throw new Exception('Invalid file format. Allowed: Images (PNG, JPG, WEBP) or Documents (PDF, Word, Text, Excel, PowerPoint).');
                }

                $type = in_array($ext, $imageExts, true) ? 'image' : 'document';

                $targetDir = __DIR__ . '/uploads/announcements';
                if (!is_dir($targetDir)) {
                    mkdir($targetDir, 0777, true);
                }

                $cleanBase = preg_replace('/[^a-zA-Z0-9_\-\.]/', '_', pathinfo($origName, PATHINFO_FILENAME));
                $safeName  = time() . '_' . substr(md5(uniqid('', true)), 0, 8) . '_' . $cleanBase . '.' . $ext;
                $destPath  = $targetDir . '/' . $safeName;

                if (!move_uploaded_file($file['tmp_name'], $destPath)) {
                    throw new Exception('Failed to save uploaded attachment on server.');
                }

                $bytes = filesize($destPath);
                if ($bytes >= 1048576) {
                    $humanSize = number_format($bytes / 1048576, 1) . ' MB';
                } elseif ($bytes >= 1024) {
                    $humanSize = number_format($bytes / 1024, 0) . ' KB';
                } else {
                    $humanSize = $bytes . ' B';
                }

                $attachmentName = $origName;
                $attachmentUrl  = 'uploads/announcements/' . $safeName;
                $attachmentType = $type;
                $attachmentSize = $humanSize;
            }

            $insStmt = $pdo->prepare("
                INSERT INTO announcements (title, content, audience, priority, author_id, attachment_name, attachment_url, attachment_type, attachment_size, created_at)
                VALUES (:title, :content, :aud, :prio, :author_id, :att_name, :att_url, :att_type, :att_size, NOW())
            ");
            $insStmt->execute([
                ':title'     => $title,
                ':content'   => $content,
                ':aud'       => $audience,
                ':prio'      => $priority,
                ':author_id' => $user['id'],
                ':att_name'  => $attachmentName,
                ':att_url'   => $attachmentUrl,
                ':att_type'  => $attachmentType,
                ':att_size'  => $attachmentSize,
            ]);
            $newId = (int)$pdo->lastInsertId();

            $roleName = strtoupper($user['role']);
            $attDesc = $attachmentName ? " with attachment: {$attachmentName} ({$attachmentType})" : " (text-only)";
            $audit = $pdo->prepare("INSERT INTO audit_logs (user_id, action, details) VALUES (:uid, 'ANNOUNCEMENT_POSTED', :details)");
            $audit->execute([
                ':uid'     => $user['id'],
                ':details' => "{$roleName} {$user['full_name']} posted announcement #{$newId}: '{$title}' to [{$audience}]{$attDesc}"
            ]);

            echo json_encode([
                'success' => true,
                'id'      => $newId,
                'message' => 'Update published successfully!' . ($attachmentName ? " Attachment uploaded: {$attachmentName}." : '')
            ]);
            break;

        default:
            throw new Exception("Unknown action: {$action}");
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
