<?php
/**
 * UCMS HOD Computer Science Leadership Console
 * View C: Ultra-Modern Collegiate 4-Tab Interface
 * Powered by pure HTML5, CSS3 (Tailwind-compiled), Vanilla JavaScript, PHP 8 & MySQL
 * Jurisdiction: Department of Computer Science (CS) ONLY
 */

$user = $_SESSION['user'];
$pdo = Database::getConnection();

$csDeptId = 1;

// 1. Fetch all 14 Computer Science Faculty Members
$facultyStmt = $pdo->prepare("
    SELECT u.*, 
           COUNT(ca.id) AS course_count,
           GROUP_CONCAT(c.code SEPARATOR ', ') AS assigned_codes
    FROM users u
    LEFT JOIN course_allocations ca ON u.id = ca.faculty_id
    LEFT JOIN courses c ON ca.course_id = c.id
    WHERE u.department_id = :did AND u.role IN ('teacher', 'hod')
    GROUP BY u.id
    ORDER BY FIELD(u.role, 'hod', 'teacher'), u.full_name ASC
");
$facultyStmt->execute([':did' => $csDeptId]);
$csFacultyRoster = $facultyStmt->fetchAll();

// 2. Fetch all 26 CS- courses
$courseStmt = $pdo->prepare("
    SELECT c.*, u.full_name AS allocated_teacher, ca.id AS allocation_id
    FROM courses c
    LEFT JOIN course_allocations ca ON c.id = ca.course_id
    LEFT JOIN users u ON ca.faculty_id = u.id
    WHERE c.department_id = :did
    ORDER BY c.semester ASC, c.code ASC
");
$courseStmt->execute([':did' => $csDeptId]);
$csCourses = $courseStmt->fetchAll();

// 3. Fetch Master Timetable for CS
$ttStmt = $pdo->prepare("
    SELECT t.*, c.code AS course_code, c.title AS course_title, u.full_name AS instructor_name
    FROM timetables t
    JOIN courses c ON t.course_id = c.id
    JOIN users u ON t.faculty_id = u.id
    WHERE c.department_id = :did
    ORDER BY FIELD(t.day_of_week, 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'), t.timeslot ASC
");
$ttStmt->execute([':did' => $csDeptId]);
$masterTimetable = $ttStmt->fetchAll();

// 4. Fetch Departmental Student Inquiries
$repStmt = $pdo->prepare("
    SELECT sr.*, u.full_name AS student_name, u.roll_number, u.email AS student_email, u.semester
    FROM student_reports sr
    JOIN users u ON sr.student_id = u.id
    WHERE u.department_id = :did
    ORDER BY FIELD(sr.status, 'Pending Review', 'Under Investigation', 'Resolved', 'Dismissed'), sr.created_at DESC
");
$repStmt->execute([':did' => $csDeptId]);
$deptReports = $repStmt->fetchAll();

$pendingCount = 0;
foreach ($deptReports as $r) {
    if ($r['status'] === 'Pending Review' || $r['status'] === 'Under Investigation') {
        $pendingCount++;
    }
}

// Announcements for HOD
$annStmt = $pdo->query("
    SELECT * FROM announcements 
    WHERE audience IN ('all', 'teachers') 
    ORDER BY created_at DESC LIMIT 5
");
$deptAnnouncements = $annStmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HOD CS Console | <?= htmlspecialchars($user['full_name']); ?> | UCMS Khanewal</title>
  <link rel="stylesheet" href="css/style.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;0,800;1,700&display=swap" rel="stylesheet">
  <link rel="icon" type="image/png" href="assets/aistudio/logo_c68140aa.png">
</head>
<body class="bg-[#f8fafc] text-slate-800 antialiased min-h-screen flex flex-col font-sans">

  <!-- =========================================================================
       STICKY TOP HEADER (72px, Official 3-Zone Contract matching localhost:3000)
       ========================================================================= -->
  <header class="sticky top-0 z-40 h-[72px] w-full bg-white/98 backdrop-blur-md border-b border-slate-200 px-3 sm:px-6 lg:px-8 flex items-center justify-between shadow-2xs">
    
    <!-- Zone 1: Official Brand Lockup -->
    <a href="index.php" class="flex items-center gap-2.5 sm:gap-3 group cursor-pointer shrink-0 text-decoration-none">
      <div class="w-11 h-11 sm:w-13 sm:h-13 rounded-full border-2 border-[#800020] p-0.5 bg-white shadow-xs shrink-0 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
        <img src="assets/aistudio/logo_c68140aa.png" onerror="this.src='logo.png'" alt="UCMS Seal" class="w-full h-full object-contain rounded-full">
      </div>
      <div class="flex flex-col text-left">
        <span class="text-[12px] sm:text-[13px] font-black tracking-wide text-[#800020] uppercase leading-tight font-serif">
          UCMS HOD CS CONSOLE
        </span>
        <span class="text-[10px] sm:text-[11px] font-bold text-amber-700 leading-tight">
          Departmental Academic Leadership & Governance
        </span>
      </div>
    </a>

    <!-- Zone 2: 4 Desktop Workspace Navigation Tabs -->
    <nav class="hidden md:flex items-center gap-1.5 lg:gap-2 bg-slate-100/90 p-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
      <button type="button" onclick="switchHodTab('faculty')" id="hod-tab-btn-faculty" class="hod-nav-tab px-3.5 py-2 text-xs font-bold rounded-lg transition-all duration-150 bg-[#800020] text-white shadow-xs">
        Faculty Hub (<?= count($csFacultyRoster); ?>)
      </button>
      <button type="button" onclick="switchHodTab('courses')" id="hod-tab-btn-courses" class="hod-nav-tab px-3.5 py-2 text-xs font-bold rounded-lg transition-all duration-150 text-slate-600 hover:text-slate-900 hover:bg-white/80">
        Courses (<?= count($csCourses); ?>)
      </button>
      <button type="button" onclick="switchHodTab('timetable')" id="hod-tab-btn-timetable" class="hod-nav-tab px-3.5 py-2 text-xs font-bold rounded-lg transition-all duration-150 text-slate-600 hover:text-slate-900 hover:bg-white/80">
        Timetables (<?= count($masterTimetable); ?>)
      </button>
      <button type="button" onclick="switchHodTab('notices')" id="hod-tab-btn-notices" class="hod-nav-tab px-3.5 py-2 text-xs font-bold rounded-lg transition-all duration-150 text-slate-600 hover:text-slate-900 hover:bg-white/80 relative">
        Department Notices
        <?php if ($pendingCount > 0): ?>
          <span class="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse"><?= $pendingCount; ?></span>
        <?php endif; ?>
      </button>
    </nav>

    <!-- Zone 3: HOD Profile, Key Setup & Sign Out -->
    <div class="flex items-center gap-2 sm:gap-3 shrink-0">
      <div class="hidden sm:flex flex-col text-right">
        <span class="text-xs font-bold text-slate-800 leading-tight"><?= htmlspecialchars($user['full_name']); ?></span>
        <span class="text-[10px] font-semibold text-amber-700 font-mono">Department Chair · CS ONLY</span>
      </div>

      <button type="button" onclick="document.getElementById('hod-profile-modal').classList.remove('hidden')" class="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs">
        Key Setup
      </button>

      <a href="logout.php" class="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all shadow-2xs">
        Sign Out
      </a>
    </div>
  </header>

  <!-- Mobile Sub-Navigation -->
  <div class="md:hidden flex overflow-x-auto gap-1 bg-white border-b border-slate-200 px-3 py-2">
    <button type="button" onclick="switchHodTab('faculty')" class="hod-mobile-tab text-xs font-bold px-3 py-1.5 rounded-md bg-[#800020] text-white shrink-0">Faculty</button>
    <button type="button" onclick="switchHodTab('courses')" class="hod-mobile-tab text-xs font-bold px-3 py-1.5 rounded-md text-slate-600 bg-slate-100 shrink-0">Courses</button>
    <button type="button" onclick="switchHodTab('timetable')" class="hod-mobile-tab text-xs font-bold px-3 py-1.5 rounded-md text-slate-600 bg-slate-100 shrink-0">Timetables</button>
    <button type="button" onclick="switchHodTab('notices')" class="hod-mobile-tab text-xs font-bold px-3 py-1.5 rounded-md text-slate-600 bg-slate-100 shrink-0">Notices</button>
  </div>

  <!-- MAIN WORKSPACE CONTAINER -->
  <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

    <!-- Jurisdiction Strict Boundary Alert -->
    <div class="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
      <div>
        <span class="text-[10px] font-black uppercase tracking-wider text-blue-900 bg-blue-200/80 px-2 py-0.5 rounded-full">Executive Departmental Jurisdiction</span>
        <h2 class="text-base sm:text-lg font-black text-slate-900 mt-1">Department of Computer Science (Strict Boundary)</h2>
        <p class="text-xs text-slate-600">Governing 14 CS Faculty Members and 26 Accredited CS- Degree Courses under the authority of Dr. Muhammad Asif.</p>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <span class="px-3 py-1 rounded-xl bg-white border border-blue-200 text-blue-950 text-xs font-bold shadow-2xs">
          14 CS Faculty
        </span>
        <span class="px-3 py-1 rounded-xl bg-white border border-amber-200 text-amber-900 text-xs font-bold shadow-2xs">
          26 Courses
        </span>
      </div>
    </div>

    <!-- =========================================================================
         TAB 1: FACULTY HUB
         ========================================================================= -->
    <div id="hod-pane-faculty" class="hod-tab-pane space-y-6">
      <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 class="text-base font-black text-slate-900">Computer Science Faculty Roster</h3>
            <p class="text-xs text-slate-500">14 Verified CS Faculty Members & Course Workload Allocations</p>
          </div>
          <button type="button" onclick="openAddFacultyModal()" class="px-4 py-2 bg-[#800020] hover:bg-[#600018] text-white text-xs font-bold rounded-xl transition-all shadow-xs">
            + Add Faculty Member
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <?php foreach ($csFacultyRoster as $f): ?>
            <div class="border border-slate-200 rounded-2xl p-4.5 hover:border-slate-300 transition-all space-y-3 bg-white shadow-2xs">
              <div class="flex items-start justify-between">
                <div>
                  <h4 class="text-sm font-black text-slate-900"><?= htmlspecialchars($f['full_name']); ?></h4>
                  <span class="text-xs font-bold text-amber-700"><?= htmlspecialchars($f['designation'] ?? 'Faculty Member'); ?></span>
                  <div class="text-[11px] text-slate-500 font-mono mt-0.5"><?= htmlspecialchars($f['email']); ?></div>
                </div>
                <span class="px-2 py-0.5 rounded text-[10px] font-black <?= $f['role'] === 'hod' ? 'bg-amber-100 text-amber-900' : 'bg-blue-50 text-blue-800'; ?>">
                  <?= strtoupper($f['role']); ?>
                </span>
              </div>

              <div class="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs space-y-1">
                <div class="flex justify-between text-slate-600">
                  <span>Assigned Courses:</span>
                  <strong class="text-slate-900"><?= $f['course_count']; ?> Courses</strong>
                </div>
                <div class="text-[11px] text-slate-500 truncate">
                  <?= !empty($f['assigned_codes']) ? htmlspecialchars($f['assigned_codes']) : '<em class="text-slate-400">No active course allocation</em>'; ?>
                </div>
              </div>

              <div class="pt-1 flex items-center justify-end gap-2">
                <button type="button" onclick="openAssignCourseModal(<?= $f['id']; ?>, '<?= htmlspecialchars(addslashes($f['full_name'])); ?>')" class="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all">
                  Assign Course
                </button>
              </div>
            </div>
          <?php endforeach; ?>
        </div>
      </div>
    </div>

    <!-- =========================================================================
         TAB 2: COURSES CATALOG
         ========================================================================= -->
    <div id="hod-pane-courses" class="hod-tab-pane hidden space-y-6">
      <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 class="text-base font-black text-slate-900">Computer Science Courses Catalog</h3>
            <p class="text-xs text-slate-500">26 Accredited Courses across Semesters 1 to 8</p>
          </div>
          <div class="flex items-center gap-1.5 overflow-x-auto bg-slate-100 p-1 rounded-xl">
            <button type="button" onclick="filterCourseSem('all')" class="hod-sem-btn px-2.5 py-1 text-xs font-bold rounded-lg bg-white text-slate-900 shadow-2xs">All</button>
            <?php for ($s = 1; $s <= 8; $s++): ?>
              <button type="button" onclick="filterCourseSem('<?= $s; ?>')" class="hod-sem-btn px-2.5 py-1 text-xs font-bold rounded-lg text-slate-600 hover:text-slate-900">Sem <?= $s; ?></button>
            <?php endfor; ?>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4" id="hod-courses-grid">
          <?php foreach ($csCourses as $c): ?>
            <div class="hod-course-card border border-slate-200 rounded-2xl p-4.5 hover:border-slate-300 transition-all space-y-3 bg-white shadow-2xs" data-sem="<?= $c['semester']; ?>">
              <div class="flex items-start justify-between">
                <div>
                  <span class="px-2 py-0.5 rounded font-mono text-xs font-black bg-blue-50 text-blue-900 border border-blue-200">
                    <?= htmlspecialchars($c['code']); ?>
                  </span>
                  <h4 class="text-sm font-black text-slate-900 mt-1.5"><?= htmlspecialchars($c['title']); ?></h4>
                  <p class="text-xs text-slate-500">Semester <?= $c['semester']; ?> · <?= $c['credit_hours']; ?> Credit Hours</p>
                </div>
                <span class="px-2.5 py-1 rounded-full text-[10px] font-bold <?= !empty($c['allocated_teacher']) ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'; ?>">
                  <?= !empty($c['allocated_teacher']) ? 'Allocated' : 'Unassigned'; ?>
                </span>
              </div>

              <div class="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs">
                <span class="text-slate-500 font-semibold block text-[11px]">Instructor:</span>
                <strong class="text-slate-900"><?= htmlspecialchars($c['allocated_teacher'] ?? 'Unassigned Faculty Member'); ?></strong>
              </div>

              <div class="pt-1 flex items-center justify-end">
                <button type="button" onclick="openAllocateInstructorModal(<?= $c['id']; ?>, '<?= htmlspecialchars(addslashes($c['code'])); ?>: <?= htmlspecialchars(addslashes($c['title'])); ?>')" class="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-900 hover:bg-blue-100 text-xs font-bold transition-all">
                  <?= !empty($c['allocated_teacher']) ? 'Reassign Instructor' : 'Assign Instructor'; ?>
                </button>
              </div>
            </div>
          <?php endforeach; ?>
        </div>
      </div>
    </div>

    <!-- =========================================================================
         TAB 3: TIMETABLES
         ========================================================================= -->
    <div id="hod-pane-timetable" class="hod-tab-pane hidden space-y-6">
      <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 class="text-base font-black text-slate-900">Master Department Timetable Matrix</h3>
            <p class="text-xs text-slate-500">Official Weekly Schedule with Venue & Lecturer Oversight</p>
          </div>
          <button type="button" onclick="openAddSlotModal()" class="px-4 py-2 bg-[#800020] hover:bg-[#600018] text-white text-xs font-bold rounded-xl transition-all shadow-xs">
            + Add Timetable Slot
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
            <thead class="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th class="py-3 px-4">Day & Time</th>
                <th class="py-3 px-4">Course</th>
                <th class="py-3 px-4">Semester</th>
                <th class="py-3 px-4">Instructor</th>
                <th class="py-3 px-4">Venue</th>
                <th class="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <?php foreach ($masterTimetable as $slot): ?>
                <tr class="hover:bg-slate-50/80 transition-all">
                  <td class="py-3 px-4">
                    <span class="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      <?= $slot['day_of_week']; ?> · <?= htmlspecialchars($slot['timeslot']); ?>
                    </span>
                  </td>
                  <td class="py-3 px-4 font-bold text-slate-900">
                    <?= htmlspecialchars($slot['course_code']); ?>: <?= htmlspecialchars($slot['course_title']); ?>
                  </td>
                  <td class="py-3 px-4 text-slate-600 font-bold">Sem <?= $slot['semester']; ?></td>
                  <td class="py-3 px-4 text-blue-900 font-bold"><?= htmlspecialchars($slot['instructor_name']); ?></td>
                  <td class="py-3 px-4">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-800">
                      <?= htmlspecialchars($slot['room']); ?>
                    </span>
                  </td>
                  <td class="py-3 px-4 text-right">
                    <button type="button" onclick="deleteTimetableSlot(<?= $slot['id']; ?>)" class="text-rose-600 hover:text-rose-800 font-bold text-xs">
                      Remove
                    </button>
                  </td>
                </tr>
              <?php endforeach; ?>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- =========================================================================
         TAB 4: DEPARTMENT NOTICES & STUDENT INQUIRIES DESK
         ========================================================================= -->
    <div id="hod-pane-notices" class="hod-tab-pane hidden space-y-6">
      
      <!-- Student Inquiries Desk -->
      <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 class="text-base font-black text-slate-900">CS Department Inquiries Desk</h3>
            <p class="text-xs text-slate-500">Official Student Inquiries Regarding Timetables & Handouts</p>
          </div>
          <span class="px-3 py-1 rounded-full text-xs font-bold <?= $pendingCount > 0 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'; ?>">
            <?= $pendingCount; ?> Pending Action
          </span>
        </div>

        <div class="space-y-3">
          <?php if (empty($deptReports)): ?>
            <p class="text-xs text-slate-500 italic py-6 text-center">No student inquiries currently on file for CS department.</p>
          <?php else: ?>
            <?php foreach ($deptReports as $r): ?>
              <div class="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50 hover:bg-white transition-all">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 rounded text-[11px] font-bold uppercase <?= $r['category'] === 'Timetable Clash' ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-900'; ?>">
                      <?= htmlspecialchars($r['category']); ?>
                    </span>
                    <span class="text-xs font-bold text-slate-800">
                      Scholar: <?= htmlspecialchars($r['student_name']); ?> (<?= htmlspecialchars($r['roll_number'] ?? 'BSCS'); ?> · Sem <?= $r['semester']; ?>)
                    </span>
                  </div>

                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-black <?= $r['status'] === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : ($r['status'] === 'Dismissed' ? 'bg-slate-200 text-slate-700' : 'bg-rose-100 text-rose-800'); ?>">
                      <?= htmlspecialchars($r['status']); ?>
                    </span>
                    <button type="button" onclick="openHodTakeActionModal(<?= $r['id']; ?>, '<?= htmlspecialchars(addslashes($r['subject'])); ?>', '<?= htmlspecialchars(addslashes($r['status'])); ?>', '<?= htmlspecialchars(addslashes($r['admin_notes'] ?? '')); ?>')" class="px-3 py-1 bg-[#800020] hover:bg-[#600018] text-white text-xs font-bold rounded-lg transition-all shadow-2xs">
                      Take Action
                    </button>
                  </div>
                </div>

                <div>
                  <h4 class="text-sm font-bold text-slate-900"><?= htmlspecialchars($r['subject']); ?></h4>
                  <p class="text-xs text-slate-600 mt-1 leading-relaxed"><?= htmlspecialchars($r['description']); ?></p>
                </div>

                <?php if (!empty($r['admin_notes'])): ?>
                  <div class="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-xs text-amber-900">
                    <strong>HOD Official Decision / Note:</strong> <?= htmlspecialchars($r['admin_notes']); ?>
                  </div>
                <?php endif; ?>

                <div class="text-[10px] text-slate-400">Received: <?= date('M d, Y · h:i A', strtotime($r['created_at'])); ?></div>
              </div>
            <?php endforeach; ?>
          <?php endif; ?>
        </div>
      </div>

      <!-- Issue Departmental Circular / Notice Form -->
      <div class="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 class="text-base font-black text-slate-900">Issue Departmental Circular / Academic Notice</h3>
            <p class="text-xs text-slate-500">Broadcast directives to Computer Science faculty, students, or campus community with optional document/picture attachment.</p>
          </div>
          <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-[#800020]/10 text-[#800020] border border-[#800020]/20">
            HOD Executive Desk
          </span>
        </div>

        <form id="hod-announcement-form" class="space-y-4" enctype="multipart/form-data">
          <input type="hidden" name="action" value="post_announcement">

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="sm:col-span-2">
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Circular Title *</label>
              <input type="text" name="title" required placeholder="e.g. CS Lab 2 Maintenance & Rescheduled Lecture Hours" class="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#800020]">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Priority Level *</label>
              <select name="priority" class="w-full text-xs font-bold p-2.5 border border-slate-300 rounded-lg bg-white">
                <option value="important">Important Directive</option>
                <option value="urgent">Urgent Notice</option>
                <option value="normal">Normal Information</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Target Audience *</label>
            <select name="audience" class="w-full text-xs font-bold p-2.5 border border-slate-300 rounded-lg bg-white">
              <option value="cs_only">Computer Science Department (Students & Faculty)</option>
              <option value="students">All Enrolled Students</option>
              <option value="teachers">Department Faculty Only</option>
              <option value="all">Entire University Campus</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Directive Body / Details *</label>
            <textarea name="content" rows="3" required placeholder="Type the official notification details, guidelines, or departmental instructions..." class="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#800020]"></textarea>
          </div>

          <!-- OPTIONAL FILE / PICTURE ATTACHMENT -->
          <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div class="flex items-center justify-between">
              <label class="block text-xs font-bold text-slate-800">
                📎 Attach Notification Document or Picture <span class="text-slate-400 font-normal">(Optional)</span>
              </label>
              <span class="text-[10px] text-slate-400">PDF, Word, Images up to 25MB</span>
            </div>
            <input type="file" name="attachment" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,.txt,.xls,.xlsx,.ppt,.pptx" class="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#800020] file:text-white hover:file:bg-[#600018] file:cursor-pointer">
            <p class="text-[10px] text-slate-500 italic">You may attach an official signed circular, timetable page, or event flyer, or leave it blank.</p>
          </div>

          <div class="flex justify-end">
            <button type="submit" id="hod-ann-submit-btn" class="px-5 py-2.5 bg-[#800020] hover:bg-[#600018] text-white text-xs font-bold rounded-lg transition-colors shadow-2xs flex items-center gap-2 cursor-pointer">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>
              <span>Broadcast Departmental Circular</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Campus Announcements -->
      <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
        <h3 class="text-base font-black text-slate-900 pb-2 border-b border-slate-100">Department & Campus Circulars</h3>
        <div class="space-y-3">
          <?php foreach ($deptAnnouncements as $a): ?>
            <div class="border border-slate-100 rounded-xl p-3.5 bg-slate-50/50 space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-[#800020]"><?= htmlspecialchars($a['title']); ?></span>
                <span class="text-[10px] text-slate-500"><?= date('M d, Y', strtotime($a['created_at'])); ?></span>
              </div>
              <p class="text-xs text-slate-600 mt-1"><?= htmlspecialchars($a['content']); ?></p>

              <!-- Optional Attachment indicator / download -->
              <?php if (!empty($a['attachment_url'])): ?>
                <div class="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span class="text-slate-600 font-medium">📎 <?= htmlspecialchars($a['attachment_name'] ?? 'Notice Attachment'); ?> (<?= htmlspecialchars($a['attachment_size'] ?? ''); ?>)</span>
                  <div class="flex items-center gap-2">
                    <?php if ($a['attachment_type'] === 'image'): ?>
                      <button type="button" onclick="openLightbox('<?= htmlspecialchars($a['attachment_url']); ?>', '<?= htmlspecialchars(addslashes($a['title'])); ?>', '<?= htmlspecialchars($a['attachment_size'] ?? ''); ?>')" class="px-2.5 py-1 text-[11px] font-bold text-blue-900 bg-blue-50 rounded hover:bg-blue-100">
                        View Image
                      </button>
                    <?php endif; ?>
                    <a href="download.php?announcement_id=<?= $a['id']; ?>" class="px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 rounded hover:bg-slate-200">
                      Download
                    </a>
                  </div>
                </div>
              <?php endif; ?>
            </div>
          <?php endforeach; ?>
        </div>
      </div>

    </div>

  </main>

  <!-- =========================================================================
       MODAL: ADD FACULTY MEMBER
       ========================================================================= -->
  <div id="add-faculty-modal" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 hidden">
    <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 class="text-base font-black text-slate-900">Add Computer Science Faculty</h3>
        <button type="button" onclick="closeAddFacultyModal()" class="text-slate-400 hover:text-slate-600 text-lg font-bold">&times;</button>
      </div>

      <form id="add-faculty-form" onsubmit="submitAddFaculty(event)" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name *</label>
          <input type="text" name="full_name" placeholder="e.g. Engr. Usman Tariq" class="w-full text-xs p-2.5 border border-slate-300 rounded-lg" required>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Institutional Email *</label>
          <input type="email" name="email" placeholder="e.g. usman.tariq@ucms.edu.pk" class="w-full text-xs p-2.5 border border-slate-300 rounded-lg" required>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Username *</label>
            <input type="text" name="username" placeholder="e.g. usman_cs" class="w-full text-xs p-2.5 border border-slate-300 rounded-lg" required>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Temporary Password *</label>
            <input type="password" name="password" value="password123" class="w-full text-xs p-2.5 border border-slate-300 rounded-lg" required>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Academic Designation *</label>
          <select name="designation" class="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white" required>
            <option value="Assistant Professor">Assistant Professor</option>
            <option value="Lecturer">Lecturer</option>
            <option value="Associate Professor">Associate Professor</option>
            <option value="Professor">Professor</option>
            <option value="Lab Instructor">Lab Instructor</option>
          </select>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2">
          <button type="button" onclick="closeAddFacultyModal()" class="px-4 py-2 border border-slate-200 text-xs font-bold text-slate-700 rounded-lg hover:bg-slate-50">Cancel</button>
          <button type="submit" id="add-fac-submit-btn" class="px-4 py-2 bg-[#800020] text-white text-xs font-bold rounded-lg hover:bg-[#600018]">Register Faculty</button>
        </div>
      </form>
    </div>
  </div>

  <!-- =========================================================================
       MODAL: ASSIGN / REASSIGN COURSE TO INSTRUCTOR
       ========================================================================= -->
  <div id="allocate-instructor-modal" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 hidden">
    <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 class="text-base font-black text-slate-900">Allocate Course Instructor</h3>
        <button type="button" onclick="closeAllocateModal()" class="text-slate-400 hover:text-slate-600 text-lg font-bold">&times;</button>
      </div>

      <form id="allocate-instructor-form" onsubmit="submitAllocation(event)" class="space-y-4">
        <input type="hidden" name="course_id" id="alloc-course-id" value="">

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Selected Course</label>
          <div id="alloc-course-title" class="text-xs font-semibold text-slate-900 bg-slate-100 p-2.5 rounded-lg border border-slate-200"></div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Select Faculty Instructor *</label>
          <select name="faculty_id" id="alloc-faculty-id" class="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white" required>
            <?php foreach ($csFacultyRoster as $f): ?>
              <option value="<?= $f['id']; ?>"><?= htmlspecialchars($f['full_name']); ?> (<?= htmlspecialchars($f['designation'] ?? 'Teacher'); ?>)</option>
            <?php endforeach; ?>
          </select>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2">
          <button type="button" onclick="closeAllocateModal()" class="px-4 py-2 border border-slate-200 text-xs font-bold text-slate-700 rounded-lg hover:bg-slate-50">Cancel</button>
          <button type="submit" id="alloc-submit-btn" class="px-4 py-2 bg-[#800020] text-white text-xs font-bold rounded-lg hover:bg-[#600018]">Save Allocation</button>
        </div>
      </form>
    </div>
  </div>

  <!-- =========================================================================
       MODAL: ADD TIMETABLE SLOT
       ========================================================================= -->
  <div id="add-slot-modal" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 hidden">
    <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 class="text-base font-black text-slate-900">Add Master Timetable Slot</h3>
        <button type="button" onclick="closeAddSlotModal()" class="text-slate-400 hover:text-slate-600 text-lg font-bold">&times;</button>
      </div>

      <form id="add-slot-form" onsubmit="submitAddSlot(event)" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Select Course *</label>
          <select name="course_id" class="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white" required>
            <?php foreach ($csCourses as $c): ?>
              <option value="<?= $c['id']; ?>"><?= htmlspecialchars($c['code']); ?> - <?= htmlspecialchars($c['title']); ?> (Sem <?= $c['semester']; ?>)</option>
            <?php endforeach; ?>
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Select Faculty Instructor *</label>
          <select name="faculty_id" class="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white" required>
            <?php foreach ($csFacultyRoster as $f): ?>
              <option value="<?= $f['id']; ?>"><?= htmlspecialchars($f['full_name']); ?> (<?= htmlspecialchars($f['designation'] ?? 'Teacher'); ?>)</option>
            <?php endforeach; ?>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Day of Week *</label>
            <select name="day_of_week" class="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white" required>
              <option value="Mon">Monday</option>
              <option value="Tue">Tuesday</option>
              <option value="Wed">Wednesday</option>
              <option value="Thu">Thursday</option>
              <option value="Fri">Friday</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Timeslot *</label>
            <select name="timeslot" class="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white" required>
              <option value="08:30 AM - 10:00 AM">08:30 AM - 10:00 AM</option>
              <option value="10:15 AM - 11:45 AM">10:15 AM - 11:45 AM</option>
              <option value="12:00 PM - 01:30 PM">12:00 PM - 01:30 PM</option>
              <option value="01:45 PM - 03:15 PM">01:45 PM - 03:15 PM</option>
              <option value="03:30 PM - 05:00 PM">03:30 PM - 05:00 PM</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Classroom / Lab Venue *</label>
            <input type="text" name="room" value="CS Lab 2" class="w-full text-xs p-2.5 border border-slate-300 rounded-lg" required>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Semester *</label>
            <input type="number" name="semester" min="1" max="8" value="7" class="w-full text-xs p-2.5 border border-slate-300 rounded-lg" required>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2">
          <button type="button" onclick="closeAddSlotModal()" class="px-4 py-2 border border-slate-200 text-xs font-bold text-slate-700 rounded-lg hover:bg-slate-50">Cancel</button>
          <button type="submit" id="add-slot-submit-btn" class="px-4 py-2 bg-[#800020] text-white text-xs font-bold rounded-lg hover:bg-[#600018]">Add Slot</button>
        </div>
      </form>
    </div>
  </div>

  <!-- =========================================================================
       MODAL: TAKE ACTION ON INQUIRY (HOD)
       ========================================================================= -->
  <div id="hod-take-action-modal" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 hidden">
    <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 class="text-base font-black text-slate-900">Take Action on Student Inquiry (HOD)</h3>
        <button type="button" onclick="closeHodTakeActionModal()" class="text-slate-400 hover:text-slate-600 text-lg font-bold">&times;</button>
      </div>

      <form id="hod-take-action-form" onsubmit="submitHodTakeAction(event)" class="space-y-4">
        <input type="hidden" name="report_id" id="hod-action-report-id" value="">

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Inquiry Subject</label>
          <div id="hod-action-report-subject" class="text-xs font-semibold text-slate-800 bg-slate-100 p-2.5 rounded-lg border border-slate-200"></div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Action Decision *</label>
          <select name="status" id="hod-action-report-status" class="w-full text-xs font-bold p-2.5 border border-slate-300 rounded-lg bg-white" required>
            <option value="Resolved">✅ Mark as Resolved (Issue fixed / Handout updated)</option>
            <option value="Dismissed">❌ No Such Issue / Dismiss (Valid reason specified)</option>
            <option value="Under Investigation">⏳ Keep Under Investigation</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Official Response Note *</label>
          <textarea name="admin_notes" id="hod-action-report-notes" rows="3" class="w-full text-xs p-2.5 border border-slate-300 rounded-lg" placeholder="Enter HOD remarks for the student..." required></textarea>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2">
          <button type="button" onclick="closeHodTakeActionModal()" class="px-4 py-2 border border-slate-200 text-xs font-bold text-slate-700 rounded-lg hover:bg-slate-50">Cancel</button>
          <button type="submit" id="hod-take-action-submit-btn" class="px-4 py-2 bg-[#800020] text-white text-xs font-bold rounded-lg hover:bg-[#600018]">Save Decision</button>
        </div>
      </form>
    </div>
  </div>

  <!-- =========================================================================
       MODAL: HOD KEY SETUP / CHANGE PASSWORD
       ========================================================================= -->
  <div id="hod-profile-modal" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 hidden">
    <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 class="text-base font-black text-slate-900">HOD Key Setup</h3>
        <button type="button" onclick="document.getElementById('hod-profile-modal').classList.add('hidden')" class="text-slate-400 hover:text-slate-600 text-lg font-bold">&times;</button>
      </div>

      <form action="change_password.php" method="POST" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Current Password *</label>
          <input type="password" name="current_password" class="w-full text-xs p-2.5 border border-slate-300 rounded-lg" required>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">New Secure Password *</label>
          <input type="password" name="new_password" class="w-full text-xs p-2.5 border border-slate-300 rounded-lg" required>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Confirm New Password *</label>
          <input type="password" name="confirm_password" class="w-full text-xs p-2.5 border border-slate-300 rounded-lg" required>
        </div>
        <div class="flex items-center justify-end gap-2 pt-2">
          <button type="button" onclick="document.getElementById('hod-profile-modal').classList.add('hidden')" class="px-4 py-2 border border-slate-200 text-xs font-bold text-slate-700 rounded-lg hover:bg-slate-50">Cancel</button>
          <button type="submit" class="px-4 py-2 bg-[#800020] text-white text-xs font-bold rounded-lg hover:bg-[#600018]">Update Key</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Vanilla JS Engine -->
  <script>
    function switchHodTab(tabKey) {
      document.querySelectorAll('.hod-tab-pane').forEach(p => p.classList.add('hidden'));
      const activePane = document.getElementById('hod-pane-' + tabKey);
      if (activePane) activePane.classList.remove('hidden');

      document.querySelectorAll('.hod-nav-tab').forEach(b => {
        b.classList.remove('bg-[#800020]', 'text-white', 'shadow-xs');
        b.classList.add('text-slate-600', 'hover:text-slate-900', 'hover:bg-white/80');
      });

      const activeBtn = document.getElementById('hod-tab-btn-' + tabKey);
      if (activeBtn) {
        activeBtn.classList.remove('text-slate-600', 'hover:text-slate-900', 'hover:bg-white/80');
        activeBtn.classList.add('bg-[#800020]', 'text-white', 'shadow-xs');
      }
    }

    function filterCourseSem(sem) {
      document.querySelectorAll('.hod-sem-btn').forEach(b => {
        b.classList.remove('bg-white', 'text-slate-900', 'shadow-2xs');
        b.classList.add('text-slate-600');
      });
      event.target.classList.add('bg-white', 'text-slate-900', 'shadow-2xs');

      document.querySelectorAll('.hod-course-card').forEach(c => {
        if (sem === 'all' || c.getAttribute('data-sem') === sem) {
          c.classList.remove('hidden');
        } else {
          c.classList.add('hidden');
        }
      });
    }

    function openAddFacultyModal() {
      document.getElementById('add-faculty-modal').classList.remove('hidden');
    }
    function closeAddFacultyModal() {
      document.getElementById('add-faculty-modal').classList.add('hidden');
    }

    function submitAddFaculty(e) {
      e.preventDefault();
      const form = document.getElementById('add-faculty-form');
      const btn = document.getElementById('add-fac-submit-btn');
      btn.disabled = true;
      btn.innerText = 'Registering...';

      const formData = new FormData(form);
      formData.append('action', 'create_user');

      fetch('actions.php', { method: 'POST', body: formData })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('Faculty member registered successfully!');
          location.reload();
        } else {
          alert('Error: ' + (data.error || 'Failed to add faculty member.'));
          btn.disabled = false;
          btn.innerText = 'Register Faculty';
        }
      })
      .catch(err => {
        alert('Request failed: ' + err.message);
        btn.disabled = false;
        btn.innerText = 'Register Faculty';
      });
    }

    function openAllocateInstructorModal(courseId, courseTitle) {
      document.getElementById('alloc-course-id').value = courseId;
      document.getElementById('alloc-course-title').innerText = courseTitle;
      document.getElementById('allocate-instructor-modal').classList.remove('hidden');
    }
    function closeAllocateModal() {
      document.getElementById('allocate-instructor-modal').classList.add('hidden');
    }

    function submitAllocation(e) {
      e.preventDefault();
      const form = document.getElementById('allocate-instructor-form');
      const btn = document.getElementById('alloc-submit-btn');
      btn.disabled = true;
      btn.innerText = 'Saving...';

      const formData = new FormData(form);
      formData.append('action', 'allocate_course');

      fetch('actions.php', { method: 'POST', body: formData })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('Course instructor successfully allocated!');
          location.reload();
        } else {
          alert('Error: ' + (data.error || 'Failed to allocate instructor.'));
          btn.disabled = false;
          btn.innerText = 'Save Allocation';
        }
      })
      .catch(err => {
        alert('Request failed: ' + err.message);
        btn.disabled = false;
        btn.innerText = 'Save Allocation';
      });
    }

    function openAddSlotModal() {
      document.getElementById('add-slot-modal').classList.remove('hidden');
    }
    function closeAddSlotModal() {
      document.getElementById('add-slot-modal').classList.add('hidden');
    }

    function submitAddSlot(e) {
      e.preventDefault();
      const form = document.getElementById('add-slot-form');
      const btn = document.getElementById('add-slot-submit-btn');
      btn.disabled = true;
      btn.innerText = 'Saving...';

      const formData = new FormData(form);
      formData.append('action', 'add_timetable');

      fetch('actions.php', { method: 'POST', body: formData })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('Timetable slot added successfully!');
          location.reload();
        } else {
          alert('Error: ' + (data.error || 'Failed to add timetable slot.'));
          btn.disabled = false;
          btn.innerText = 'Add Slot';
        }
      })
      .catch(err => {
        alert('Request failed: ' + err.message);
        btn.disabled = false;
        btn.innerText = 'Add Slot';
      });
    }

    function deleteTimetableSlot(slotId) {
      if (!confirm('Are you sure you want to remove this timetable slot?')) return;
      const formData = new FormData();
      formData.append('action', 'delete_timetable');
      formData.append('slot_id', slotId);

      fetch('actions.php', { method: 'POST', body: formData })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('Slot removed successfully!');
          location.reload();
        } else {
          alert('Error: ' + (data.error || 'Failed to delete slot.'));
        }
      });
    }

    function openHodTakeActionModal(id, subject, status, notes) {
      document.getElementById('hod-action-report-id').value = id;
      document.getElementById('hod-action-report-subject').innerText = subject;
      document.getElementById('hod-action-report-status').value = status === 'Pending Review' ? 'Resolved' : status;
      document.getElementById('hod-action-report-notes').value = notes || '';
      document.getElementById('hod-take-action-modal').classList.remove('hidden');
    }
    function closeHodTakeActionModal() {
      document.getElementById('hod-take-action-modal').classList.add('hidden');
    }

    function submitHodTakeAction(e) {
      e.preventDefault();
      const form = document.getElementById('hod-take-action-form');
      const btn = document.getElementById('hod-take-action-submit-btn');
      btn.disabled = true;
      btn.innerText = 'Saving...';

      const formData = new FormData(form);
      formData.append('action', 'update_report_status');

      fetch('actions.php', { method: 'POST', body: formData })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('Decision saved successfully!');
          location.reload();
        } else {
          alert('Error: ' + (data.error || 'Failed to update status.'));
          btn.disabled = false;
          btn.innerText = 'Save Decision';
        }
      })
      .catch(err => {
        alert('Request failed: ' + err.message);
        btn.disabled = false;
        btn.innerText = 'Save Decision';
      });
    }

    // HOD Announcement Form Submit Handler
    const hodAnnForm = document.getElementById('hod-announcement-form');
    if (hodAnnForm) {
      hodAnnForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const submitBtn = document.getElementById('hod-ann-submit-btn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Broadcasting...';

        const formData = new FormData(hodAnnForm);
        fetch('actions.php', {
          method: 'POST',
          body: formData
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            alert(data.message || 'Departmental circular published successfully!');
            location.reload();
          } else {
            alert('Error: ' + (data.error || 'Failed to publish circular.'));
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Broadcast Departmental Circular';
          }
        })
        .catch(err => {
          alert('Network communication error: ' + err.message);
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Broadcast Departmental Circular';
        });
      });
    }
  </script>

  <!-- SHARED UCMS MODALS & VANILLA JS ENGINE -->
  <?php require_once __DIR__ . '/../includes/modals.php'; ?>
  <script src="js/main.js"></script>
</body>
</html>
