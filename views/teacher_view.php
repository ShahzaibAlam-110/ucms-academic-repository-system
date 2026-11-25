<?php
/**
 * UCMS Faculty / Teacher Workspace
 * View B: Ultra-Modern Collegiate 5-Tab Interface
 * Powered by pure HTML5, CSS3 (Tailwind-compiled), Vanilla JavaScript, PHP 8 & MySQL
 */

$user = $_SESSION['user'];
$pdo = Database::getConnection();

// Fetch assigned courses
$courseStmt = $pdo->prepare("
    SELECT c.*, ca.session 
    FROM courses c
    JOIN course_allocations ca ON c.id = ca.course_id
    WHERE ca.faculty_id = :uid
    ORDER BY c.code ASC
");
$courseStmt->execute([':uid' => $user['id']]);
$assignedCourses = $courseStmt->fetchAll();

// Fetch teacher's timetable
$ttStmt = $pdo->prepare("
    SELECT t.*, c.code AS course_code, c.title AS course_title
    FROM timetables t
    JOIN courses c ON t.course_id = c.id
    WHERE t.faculty_id = :uid
    ORDER BY FIELD(t.day_of_week, 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'), t.timeslot ASC
");
$ttStmt->execute([':uid' => $user['id']]);
$myTimetable = $ttStmt->fetchAll();

// Teacher's uploaded handouts with current version
$hStmt = $pdo->prepare("
    SELECT h.*, c.code AS course_code, c.title AS course_title
    FROM handouts h
    JOIN courses c ON h.course_id = c.id
    WHERE h.uploaded_by = :uid
    ORDER BY h.updated_at DESC
");
$hStmt->execute([':uid' => $user['id']]);
$myHandouts = $hStmt->fetchAll();

// Version archives for teacher
$verStmt = $pdo->prepare("
    SELECT rv.*, h.title AS handout_title, c.code AS course_code
    FROM resource_versions rv
    JOIN handouts h ON rv.handout_id = h.id
    JOIN courses c ON h.course_id = c.id
    WHERE h.uploaded_by = :uid
    ORDER BY rv.archived_at DESC LIMIT 10
");
$verStmt->execute([':uid' => $user['id']]);
$versionArchives = $verStmt->fetchAll();

// Student Inquiries relevant to this faculty
$repStmt = $pdo->prepare("
    SELECT sr.*, u.full_name AS student_name, u.roll_number AS student_roll
    FROM student_reports sr
    JOIN users u ON sr.student_id = u.id
    ORDER BY sr.created_at DESC LIMIT 20
");
$repStmt->execute();
$inquiries = $repStmt->fetchAll();

$pendingInquiriesCount = 0;
foreach ($inquiries as $inq) {
    if ($inq['status'] === 'Pending Review' || $inq['status'] === 'Under Investigation') {
        $pendingInquiriesCount++;
    }
}

// Administrative circulars
$circStmt = $pdo->query("
    SELECT * FROM announcements 
    WHERE audience IN ('all', 'teachers') 
    ORDER BY created_at DESC LIMIT 6
");
$circulars = $circStmt->fetchAll();

// Calculate total credit hours
$totalCredits = 0;
foreach ($assignedCourses as $ac) {
    $totalCredits += (int)($ac['credit_hours'] ?? 3);
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Faculty Console | <?= htmlspecialchars($user['full_name']); ?> | UCMS Khanewal</title>
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
          UCMS FACULTY CONSOLE
        </span>
        <span class="text-[10px] sm:text-[11px] font-bold text-amber-700 leading-tight">
          Academic Operations & Curriculum Delivery
        </span>
      </div>
    </a>

    <!-- Zone 2: 5 Desktop Workspace Navigation Tabs -->
    <nav class="hidden md:flex items-center gap-1.5 lg:gap-2 bg-slate-100/90 p-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
      <button type="button" onclick="switchFacultyTab('dashboard')" id="fac-tab-btn-dashboard" class="fac-nav-tab px-3.5 py-2 text-xs font-bold rounded-lg transition-all duration-150 bg-[#800020] text-white shadow-xs">
        Dashboard
      </button>
      <button type="button" onclick="switchFacultyTab('courses')" id="fac-tab-btn-courses" class="fac-nav-tab px-3.5 py-2 text-xs font-bold rounded-lg transition-all duration-150 text-slate-600 hover:text-slate-900 hover:bg-white/80">
        Assigned Courses (<?= count($assignedCourses); ?>)
      </button>
      <button type="button" onclick="switchFacultyTab('timetable')" id="fac-tab-btn-timetable" class="fac-nav-tab px-3.5 py-2 text-xs font-bold rounded-lg transition-all duration-150 text-slate-600 hover:text-slate-900 hover:bg-white/80">
        Timetable
      </button>
      <button type="button" onclick="switchFacultyTab('handouts')" id="fac-tab-btn-handouts" class="fac-nav-tab px-3.5 py-2 text-xs font-bold rounded-lg transition-all duration-150 text-slate-600 hover:text-slate-900 hover:bg-white/80">
        Handouts (<?= count($myHandouts); ?>)
      </button>
      <button type="button" onclick="switchFacultyTab('notices')" id="fac-tab-btn-notices" class="fac-nav-tab px-3.5 py-2 text-xs font-bold rounded-lg transition-all duration-150 text-slate-600 hover:text-slate-900 hover:bg-white/80 relative">
        Notices & Inquiries
        <?php if ($pendingInquiriesCount > 0): ?>
          <span class="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse"><?= $pendingInquiriesCount; ?></span>
        <?php endif; ?>
      </button>
    </nav>

    <!-- Zone 3: Faculty Profile, Key Setup & Sign Out -->
    <div class="flex items-center gap-2 sm:gap-3 shrink-0">
      <div class="hidden sm:flex flex-col text-right">
        <span class="text-xs font-bold text-slate-800 leading-tight"><?= htmlspecialchars($user['full_name']); ?></span>
        <span class="text-[10px] font-semibold text-slate-500 font-mono"><?= htmlspecialchars($user['designation'] ?? 'Assistant Professor'); ?> · CS</span>
      </div>

      <button type="button" onclick="document.getElementById('faculty-profile-modal').classList.remove('hidden')" class="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs">
        Key Setup
      </button>

      <a href="logout.php" class="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all shadow-2xs">
        Sign Out
      </a>
    </div>
  </header>

  <!-- Mobile Sub-Navigation -->
  <div class="md:hidden flex overflow-x-auto gap-1 bg-white border-b border-slate-200 px-3 py-2">
    <button type="button" onclick="switchFacultyTab('dashboard')" class="fac-mobile-tab text-xs font-bold px-3 py-1.5 rounded-md bg-[#800020] text-white shrink-0">Dashboard</button>
    <button type="button" onclick="switchFacultyTab('courses')" class="fac-mobile-tab text-xs font-bold px-3 py-1.5 rounded-md text-slate-600 bg-slate-100 shrink-0">Courses</button>
    <button type="button" onclick="switchFacultyTab('timetable')" class="fac-mobile-tab text-xs font-bold px-3 py-1.5 rounded-md text-slate-600 bg-slate-100 shrink-0">Timetable</button>
    <button type="button" onclick="switchFacultyTab('handouts')" class="fac-mobile-tab text-xs font-bold px-3 py-1.5 rounded-md text-slate-600 bg-slate-100 shrink-0">Handouts</button>
    <button type="button" onclick="switchFacultyTab('notices')" class="fac-mobile-tab text-xs font-bold px-3 py-1.5 rounded-md text-slate-600 bg-slate-100 shrink-0">Notices</button>
  </div>

  <!-- MAIN WORKSPACE CONTAINER -->
  <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

    <!-- =========================================================================
         TAB 1: DASHBOARD
         ========================================================================= -->
    <div id="fac-pane-dashboard" class="fac-tab-pane space-y-6">
      
      <!-- Top Alert: Upcoming Class Matrix -->
      <div class="bg-linear-to-r from-amber-500/10 via-amber-50 to-white border border-amber-300/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div class="flex items-center gap-3.5">
          <div class="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
            ⏳
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-600 text-white">Upcoming Session</span>
              <span class="text-xs font-semibold text-amber-800">Department of Computer Science</span>
            </div>
            <h2 class="text-base sm:text-lg font-black text-slate-900 mt-0.5">
              CS-401: Machine Learning (Lecture & Lab 05)
            </h2>
            <p class="text-xs text-slate-600">
              Scheduled: <strong class="text-slate-800">Monday 08:30 AM - 10:00 AM</strong> at <span class="px-2 py-0.5 rounded bg-amber-200 text-amber-950 font-bold">CS Lab 2</span>
            </p>
          </div>
        </div>
        <button type="button" onclick="openUploadModal()" class="px-4 py-2 bg-[#800020] hover:bg-[#600018] text-white text-xs font-bold rounded-xl transition-all shadow-xs shrink-0">
          + Upload Handout
        </button>
      </div>

      <!-- 4 Stats Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div class="text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Courses</div>
          <div class="text-2xl font-black text-[#800020] mt-1"><?= count($assignedCourses); ?> Courses</div>
          <div class="text-[11px] font-semibold text-emerald-600 mt-0.5">Active Fall 2026</div>
        </div>
        <div class="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div class="text-xs font-bold text-slate-500 uppercase tracking-wider">Weekly Workload</div>
          <div class="text-2xl font-black text-blue-900 mt-1"><?= $totalCredits; ?> Cr. Hrs</div>
          <div class="text-[11px] font-semibold text-slate-500 mt-0.5"><?= count($myTimetable); ?> Weekly Lectures</div>
        </div>
        <div class="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div class="text-xs font-bold text-slate-500 uppercase tracking-wider">Uploaded Handouts</div>
          <div class="text-2xl font-black text-indigo-900 mt-1"><?= count($myHandouts); ?> Files</div>
          <div class="text-[11px] font-semibold text-slate-500 mt-0.5">Direct PDF Downloads</div>
        </div>
        <div class="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div class="text-xs font-bold text-slate-500 uppercase tracking-wider">Student Inquiries</div>
          <div class="text-2xl font-black <?= $pendingInquiriesCount > 0 ? 'text-rose-600' : 'text-slate-700'; ?> mt-1">
            <?= $pendingInquiriesCount; ?> Pending
          </div>
          <div class="text-[11px] font-semibold text-slate-500 mt-0.5">Timetable & Handout Issues</div>
        </div>
      </div>

      <!-- 2 Columns: Active Courses & Recent Handout Uploads -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- Left 7 cols: Assigned Courses Overview -->
        <div class="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 class="text-sm font-black text-slate-900 uppercase tracking-wide">Allocated Teaching Courses</h3>
              <p class="text-xs text-slate-500">Official CS Department Faculty Allocations</p>
            </div>
            <button type="button" onclick="switchFacultyTab('courses')" class="text-xs font-bold text-blue-700 hover:underline">View All →</button>
          </div>

          <div class="space-y-3">
            <?php foreach ($assignedCourses as $c): ?>
              <div class="border border-slate-200 rounded-xl p-3.5 hover:border-slate-300 transition-all flex items-center justify-between gap-4">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200"><?= htmlspecialchars($c['code']); ?></span>
                    <span class="text-xs font-bold text-slate-500">Semester <?= $c['semester']; ?></span>
                  </div>
                  <h4 class="text-sm font-bold text-slate-900 mt-1"><?= htmlspecialchars($c['title']); ?></h4>
                  <p class="text-xs text-slate-500 mt-0.5"><?= $c['credit_hours']; ?> Credit Hours · Fall 2026 Session</p>
                </div>
                <button type="button" onclick="openUploadModal(<?= $c['id']; ?>, '<?= htmlspecialchars($c['code']); ?> - <?= htmlspecialchars($c['title']); ?>')" class="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs shrink-0">
                  Upload PDF
                </button>
              </div>
            <?php endforeach; ?>
          </div>
        </div>

        <!-- Right 5 cols: Recent Handout Uploads -->
        <div class="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 class="text-sm font-black text-slate-900 uppercase tracking-wide">Recent Handouts</h3>
              <p class="text-xs text-slate-500">Latest Course Materials Uploaded</p>
            </div>
            <button type="button" onclick="openUploadModal()" class="text-xs font-bold text-blue-700 hover:underline">+ Upload</button>
          </div>

          <div class="space-y-3">
            <?php if (empty($myHandouts)): ?>
              <p class="text-xs text-slate-500 italic py-4 text-center">No handouts uploaded yet.</p>
            <?php else: ?>
              <?php foreach (array_slice($myHandouts, 0, 5) as $h): ?>
                <div class="border border-slate-100 bg-slate-50/50 rounded-xl p-3 flex items-center justify-between gap-3">
                  <div class="truncate">
                    <span class="text-[10px] font-bold text-amber-700 uppercase">Week <?= $h['week_number']; ?> · <?= htmlspecialchars($h['course_code']); ?></span>
                    <h5 class="text-xs font-bold text-slate-800 truncate"><?= htmlspecialchars($h['title']); ?></h5>
                    <span class="text-[10px] text-slate-500">v<?= $h['version']; ?> · <?= number_format($h['file_size_bytes'] / (1024*1024), 1); ?> MB</span>
                  </div>
                  <a href="download.php?id=<?= $h['id']; ?>" class="px-2.5 py-1 rounded bg-[#800020] text-white text-[11px] font-bold hover:bg-[#600018] shrink-0">
                    PDF ⬇
                  </a>
                </div>
              <?php endforeach; ?>
            <?php endif; ?>
          </div>
        </div>

      </div>
    </div>

    <!-- =========================================================================
         TAB 2: ASSIGNED COURSES
         ========================================================================= -->
    <div id="fac-pane-courses" class="fac-tab-pane hidden space-y-6">
      <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 class="text-base font-black text-slate-900">Assigned Courses Catalog</h3>
            <p class="text-xs text-slate-500">Accredited Academic Courses Under Your Instruction for Fall 2026</p>
          </div>
          <span class="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold rounded-full">
            <?= count($assignedCourses); ?> Official Courses
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
          <?php foreach ($assignedCourses as $c): ?>
            <div class="border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-all space-y-4">
              <div class="flex items-start justify-between">
                <div>
                  <span class="px-2.5 py-1 rounded-md font-mono text-xs font-bold bg-[#800020]/10 text-[#800020] border border-[#800020]/20">
                    <?= htmlspecialchars($c['code']); ?>
                  </span>
                  <h4 class="text-base font-black text-slate-900 mt-2"><?= htmlspecialchars($c['title']); ?></h4>
                  <p class="text-xs text-slate-500 font-semibold mt-0.5">Semester <?= $c['semester']; ?> · <?= $c['credit_hours']; ?> Credit Hours</p>
                </div>
                <button type="button" onclick="openUploadModal(<?= $c['id']; ?>, '<?= htmlspecialchars($c['code']); ?> - <?= htmlspecialchars($c['title']); ?>')" class="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 text-xs font-bold hover:bg-blue-100 border border-blue-200 transition-all">
                  + Add Handout
                </button>
              </div>

              <div class="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs text-slate-600 leading-relaxed">
                <?= htmlspecialchars($c['description'] ?? 'Official syllabus and course outcomes approved by the Department of Computer Science Board of Studies.'); ?>
              </div>

              <!-- Handouts for this course -->
              <div>
                <h5 class="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Uploaded Materials</h5>
                <div class="space-y-2">
                  <?php 
                    $courseHandouts = array_filter($myHandouts, function($h) use ($c) { return $h['course_id'] == $c['id']; });
                  ?>
                  <?php if (empty($courseHandouts)): ?>
                    <p class="text-[11px] text-slate-400 italic">No handouts uploaded for this course yet.</p>
                  <?php else: ?>
                    <?php foreach ($courseHandouts as $ch): ?>
                      <div class="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs">
                        <span class="truncate font-semibold text-slate-800">Week <?= $ch['week_number']; ?>: <?= htmlspecialchars($ch['title']); ?></span>
                        <a href="download.php?id=<?= $ch['id']; ?>" class="ml-2 text-rose-700 font-bold hover:underline shrink-0">PDF ⬇</a>
                      </div>
                    <?php endforeach; ?>
                  <?php endif; ?>
                </div>
              </div>
            </div>
          <?php endforeach; ?>
        </div>
      </div>
    </div>

    <!-- =========================================================================
         TAB 3: TIMETABLE
         ========================================================================= -->
    <div id="fac-pane-timetable" class="fac-tab-pane hidden space-y-6">
      <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 class="text-base font-black text-slate-900">Weekly Faculty Teaching Schedule</h3>
            <p class="text-xs text-slate-500">Official Timetable Allocated by CS Department HOD Office</p>
          </div>
          <div class="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button type="button" onclick="filterFacultyDay('All')" class="fac-day-btn px-2.5 py-1 text-xs font-bold rounded-lg bg-white text-slate-900 shadow-2xs">All Days</button>
            <button type="button" onclick="filterFacultyDay('Mon')" class="fac-day-btn px-2.5 py-1 text-xs font-bold rounded-lg text-slate-600 hover:text-slate-900">Mon</button>
            <button type="button" onclick="filterFacultyDay('Tue')" class="fac-day-btn px-2.5 py-1 text-xs font-bold rounded-lg text-slate-600 hover:text-slate-900">Tue</button>
            <button type="button" onclick="filterFacultyDay('Wed')" class="fac-day-btn px-2.5 py-1 text-xs font-bold rounded-lg text-slate-600 hover:text-slate-900">Wed</button>
            <button type="button" onclick="filterFacultyDay('Thu')" class="fac-day-btn px-2.5 py-1 text-xs font-bold rounded-lg text-slate-600 hover:text-slate-900">Thu</button>
            <button type="button" onclick="filterFacultyDay('Fri')" class="fac-day-btn px-2.5 py-1 text-xs font-bold rounded-lg text-slate-600 hover:text-slate-900">Fri</button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="faculty-timetable-grid">
          <?php foreach ($myTimetable as $slot): ?>
            <div class="fac-tt-card border border-slate-200 rounded-xl p-4 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all space-y-2.5" data-day="<?= $slot['day_of_week']; ?>">
              <div class="flex items-center justify-between">
                <span class="px-2 py-0.5 rounded font-mono text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                  <?= $slot['day_of_week']; ?> · <?= htmlspecialchars($slot['timeslot']); ?>
                </span>
                <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-200 text-slate-800">
                  <?= htmlspecialchars($slot['room']); ?>
                </span>
              </div>
              <h4 class="text-sm font-black text-slate-900"><?= htmlspecialchars($slot['course_code']); ?>: <?= htmlspecialchars($slot['course_title']); ?></h4>
              <p class="text-xs text-slate-500 font-semibold">Semester <?= $slot['semester']; ?> · Session <?= htmlspecialchars($slot['session'] ?? 'Fall 2026'); ?></p>
            </div>
          <?php endforeach; ?>
        </div>
      </div>
    </div>

    <!-- =========================================================================
         TAB 4: HANDOUTS
         ========================================================================= -->
    <div id="fac-pane-handouts" class="fac-tab-pane hidden space-y-6">
      <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 class="text-base font-black text-slate-900">Digital Handout Repository & Version Manager</h3>
            <p class="text-xs text-slate-500">Upload and Maintain Official PDFs with Verified Audit Logging</p>
          </div>
          <button type="button" onclick="openUploadModal()" class="px-4 py-2 bg-[#800020] hover:bg-[#600018] text-white text-xs font-bold rounded-xl transition-all shadow-xs">
            + Upload New Handout
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
            <thead class="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th class="py-3 px-4">Course</th>
                <th class="py-3 px-4">Week & Title</th>
                <th class="py-3 px-4">Version</th>
                <th class="py-3 px-4">Size</th>
                <th class="py-3 px-4">Uploaded</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <?php foreach ($myHandouts as $h): ?>
                <tr class="hover:bg-slate-50/80 transition-all">
                  <td class="py-3 px-4 font-mono font-bold text-blue-900"><?= htmlspecialchars($h['course_code']); ?></td>
                  <td class="py-3 px-4">
                    <div class="font-bold text-slate-900"><?= htmlspecialchars($h['title']); ?></div>
                    <div class="text-[11px] text-slate-500">Week <?= $h['week_number']; ?></div>
                  </td>
                  <td class="py-3 px-4">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">v<?= $h['version']; ?></span>
                  </td>
                  <td class="py-3 px-4 text-slate-500"><?= number_format($h['file_size_bytes'] / (1024*1024), 1); ?> MB</td>
                  <td class="py-3 px-4 text-slate-500"><?= date('M d, Y', strtotime($h['updated_at'])); ?></td>
                  <td class="py-3 px-4 text-right space-x-2">
                    <a href="download.php?id=<?= $h['id']; ?>" class="px-2.5 py-1 rounded bg-[#800020] text-white text-[11px] font-bold hover:bg-[#600018]">
                      Download PDF ⬇
                    </a>
                  </td>
                </tr>
              <?php endforeach; ?>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- =========================================================================
         TAB 5: NOTICES & CIRCULARS (INCLUDES STUDENT INQUIRIES DESK WITH TAKE ACTION)
         ========================================================================= -->
    <div id="fac-pane-notices" class="fac-tab-pane hidden space-y-6">
      
      <!-- Student Inquiries Desk -->
      <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 class="text-base font-black text-slate-900">Student Inquiries Desk</h3>
            <p class="text-xs text-slate-500">Timetable & Handout Issues Submitted by Scholars Under Your Department</p>
          </div>
          <span class="px-3 py-1 rounded-full text-xs font-bold <?= $pendingInquiriesCount > 0 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'; ?>">
            <?= $pendingInquiriesCount; ?> Awaiting Action
          </span>
        </div>

        <div class="space-y-3">
          <?php if (empty($inquiries)): ?>
            <p class="text-xs text-slate-500 italic py-6 text-center">No student inquiries pending.</p>
          <?php else: ?>
            <?php foreach ($inquiries as $inq): ?>
              <div class="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50 hover:bg-white transition-all">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 rounded text-[11px] font-bold uppercase <?= $inq['category'] === 'Timetable Clash' ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-900'; ?>">
                      <?= htmlspecialchars($inq['category']); ?>
                    </span>
                    <span class="text-xs font-bold text-slate-700">From: <?= htmlspecialchars($inq['student_name']); ?> (<?= htmlspecialchars($inq['student_roll'] ?? 'BSCS Scholar'); ?>)</span>
                  </div>
                  
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-black <?= $inq['status'] === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : ($inq['status'] === 'Dismissed' ? 'bg-slate-200 text-slate-700' : 'bg-rose-100 text-rose-800'); ?>">
                      <?= htmlspecialchars($inq['status']); ?>
                    </span>
                    <button type="button" onclick="openTakeActionModal(<?= $inq['id']; ?>, '<?= htmlspecialchars(addslashes($inq['subject'])); ?>', '<?= htmlspecialchars(addslashes($inq['status'])); ?>', '<?= htmlspecialchars(addslashes($inq['admin_notes'] ?? '')); ?>')" class="px-3 py-1 bg-[#800020] hover:bg-[#600018] text-white text-xs font-bold rounded-lg transition-all shadow-2xs">
                      Take Action
                    </button>
                  </div>
                </div>

                <div>
                  <h4 class="text-sm font-bold text-slate-900"><?= htmlspecialchars($inq['subject']); ?></h4>
                  <p class="text-xs text-slate-600 mt-1 leading-relaxed"><?= htmlspecialchars($inq['description']); ?></p>
                </div>

                <?php if (!empty($inq['admin_notes'])): ?>
                  <div class="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-xs text-amber-900">
                    <strong>Official Feedback / Response:</strong> <?= htmlspecialchars($inq['admin_notes']); ?>
                  </div>
                <?php endif; ?>

                <div class="text-[10px] text-slate-400">Submitted: <?= date('M d, Y · h:i A', strtotime($inq['created_at'])); ?></div>
              </div>
            <?php endforeach; ?>
          <?php endif; ?>
        </div>
      </div>

      <!-- Publish Class Notice / Academic Update Form -->
      <div class="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 class="text-base font-black text-slate-900">Post Class Notice / Academic Update</h3>
            <p class="text-xs text-slate-500">Publish directives or announcements to enrolled students or faculty with optional document/picture attachment.</p>
          </div>
          <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200">
            Faculty Announcement
          </span>
        </div>

        <form id="faculty-announcement-form" class="space-y-4" enctype="multipart/form-data">
          <input type="hidden" name="action" value="post_announcement">

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="sm:col-span-2">
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Notice Title *</label>
              <input type="text" name="title" required placeholder="e.g. CS-401: Lab Quiz 2 Rescheduled to Thursday" class="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-900">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Priority Level *</label>
              <select name="priority" class="w-full text-xs font-bold p-2.5 border border-slate-300 rounded-lg bg-white">
                <option value="normal">Normal Notice</option>
                <option value="important">Important Directive</option>
                <option value="urgent">Urgent Announcement</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Target Audience *</label>
            <select name="audience" class="w-full text-xs font-bold p-2.5 border border-slate-300 rounded-lg bg-white">
              <option value="students">Enrolled Students (Published on Student Portal)</option>
              <option value="all">Entire Campus Community</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Notice Body / Message *</label>
            <textarea name="content" rows="3" required placeholder="Provide instructions, timetable changes, syllabus references, or academic guidance..." class="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-900"></textarea>
          </div>

          <!-- OPTIONAL FILE / PICTURE ATTACHMENT -->
          <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div class="flex items-center justify-between">
              <label class="block text-xs font-bold text-slate-800">
                📎 Attach Notification Document or Picture <span class="text-slate-400 font-normal">(Optional)</span>
              </label>
              <span class="text-[10px] text-slate-400">PDF, DOC, DOCX, PNG, JPG up to 25MB</span>
            </div>
            <input type="file" name="attachment" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,.txt,.xls,.xlsx,.ppt,.pptx" class="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-900 file:text-white hover:file:bg-blue-950 file:cursor-pointer">
            <p class="text-[10px] text-slate-500 italic">You can upload any notice page in image/document format, or leave empty if not required.</p>
          </div>

          <div class="flex justify-end">
            <button type="submit" id="faculty-ann-submit-btn" class="px-5 py-2.5 bg-[#800020] hover:bg-[#600018] text-white text-xs font-bold rounded-lg transition-colors shadow-2xs flex items-center gap-2 cursor-pointer">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
              <span>Publish Notice / Update</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Department Circulars -->
      <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
        <h3 class="text-base font-black text-slate-900 pb-2 border-b border-slate-100">Official Campus Circulars</h3>
        <div class="space-y-3">
          <?php foreach ($circulars as $circ): ?>
            <div class="border border-slate-100 rounded-xl p-3.5 bg-slate-50/50 space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-[#800020]"><?= htmlspecialchars($circ['title']); ?></span>
                <span class="text-[10px] text-slate-500"><?= date('M d, Y', strtotime($circ['created_at'])); ?></span>
              </div>
              <p class="text-xs text-slate-600 mt-1"><?= htmlspecialchars($circ['content']); ?></p>

              <!-- Attachment indicator / action -->
              <?php if (!empty($circ['attachment_url'])): ?>
                <div class="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span class="text-slate-600 font-medium">📎 <?= htmlspecialchars($circ['attachment_name'] ?? 'Notice Attachment'); ?> (<?= htmlspecialchars($circ['attachment_size'] ?? ''); ?>)</span>
                  <div class="flex items-center gap-2">
                    <?php if ($circ['attachment_type'] === 'image'): ?>
                      <button type="button" onclick="openLightbox('<?= htmlspecialchars($circ['attachment_url']); ?>', '<?= htmlspecialchars(addslashes($circ['title'])); ?>', '<?= htmlspecialchars($circ['attachment_size'] ?? ''); ?>')" class="px-2.5 py-1 text-[11px] font-bold text-blue-900 bg-blue-50 rounded hover:bg-blue-100">
                        View Image
                      </button>
                    <?php endif; ?>
                    <a href="download.php?announcement_id=<?= $circ['id']; ?>" class="px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 rounded hover:bg-slate-200">
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
       MODAL 1: TAKE ACTION ON STUDENT INQUIRY
       ========================================================================= -->
  <div id="take-action-modal" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 hidden">
    <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 class="text-base font-black text-slate-900">Take Action on Student Inquiry</h3>
        <button type="button" onclick="closeTakeActionModal()" class="text-slate-400 hover:text-slate-600 text-lg font-bold">&times;</button>
      </div>

      <form id="take-action-form" onsubmit="submitTakeAction(event)" class="space-y-4">
        <input type="hidden" name="report_id" id="action-report-id" value="">

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Inquiry Topic</label>
          <div id="action-report-subject" class="text-xs font-semibold text-slate-800 bg-slate-100 p-2.5 rounded-lg border border-slate-200"></div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Action Decision *</label>
          <select name="status" id="action-report-status" class="w-full text-xs font-bold p-2.5 border border-slate-300 rounded-lg bg-white" required>
            <option value="Resolved">✅ Mark as Resolved (Issue fixed / Handout updated)</option>
            <option value="Dismissed">❌ No Such Issue / Dismiss (Valid reason specified)</option>
            <option value="Under Investigation">⏳ Keep Under Investigation</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Response Note (Shown to Student) *</label>
          <textarea name="admin_notes" id="action-report-notes" rows="3" class="w-full text-xs p-2.5 border border-slate-300 rounded-lg" placeholder="Explain the resolution or clarify why no issue was found..." required></textarea>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2">
          <button type="button" onclick="closeTakeActionModal()" class="px-4 py-2 border border-slate-200 text-xs font-bold text-slate-700 rounded-lg hover:bg-slate-50">Cancel</button>
          <button type="submit" id="take-action-submit-btn" class="px-4 py-2 bg-[#800020] text-white text-xs font-bold rounded-lg hover:bg-[#600018]">Save Action</button>
        </div>
      </form>
    </div>
  </div>

  <!-- =========================================================================
       MODAL 2: UPLOAD HANDOUT (PDF)
       ========================================================================= -->
  <div id="upload-handout-modal" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 hidden">
    <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 class="text-base font-black text-slate-900">Upload Course Handout (PDF)</h3>
        <button type="button" onclick="closeUploadModal()" class="text-slate-400 hover:text-slate-600 text-lg font-bold">&times;</button>
      </div>

      <form action="actions.php" method="POST" enctype="multipart/form-data" class="space-y-4">
        <input type="hidden" name="action" value="upload_handout">

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Target Course *</label>
          <select name="course_id" id="upload-course-select" class="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white" required>
            <?php foreach ($assignedCourses as $c): ?>
              <option value="<?= $c['id']; ?>"><?= htmlspecialchars($c['code']); ?> - <?= htmlspecialchars($c['title']); ?> (Sem <?= $c['semester']; ?>)</option>
            <?php endforeach; ?>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Week Number *</label>
            <input type="number" name="week_number" min="1" max="16" value="1" class="w-full text-xs p-2.5 border border-slate-300 rounded-lg" required>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Handout Title *</label>
            <input type="text" name="title" placeholder="e.g. Week 05: Deep Neural Networks" class="w-full text-xs p-2.5 border border-slate-300 rounded-lg" required>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Select PDF File *</label>
          <input type="file" name="handout_file" accept=".pdf" class="w-full text-xs p-2 border border-slate-300 rounded-lg bg-slate-50" required>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2">
          <button type="button" onclick="closeUploadModal()" class="px-4 py-2 border border-slate-200 text-xs font-bold text-slate-700 rounded-lg hover:bg-slate-50">Cancel</button>
          <button type="submit" class="px-4 py-2 bg-[#800020] text-white text-xs font-bold rounded-lg hover:bg-[#600018]">Upload PDF</button>
        </div>
      </form>
    </div>
  </div>

  <!-- =========================================================================
       MODAL 3: KEY SETUP / CHANGE PASSWORD
       ========================================================================= -->
  <div id="faculty-profile-modal" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 hidden">
    <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 class="text-base font-black text-slate-900">Faculty Key Setup</h3>
        <button type="button" onclick="document.getElementById('faculty-profile-modal').classList.add('hidden')" class="text-slate-400 hover:text-slate-600 text-lg font-bold">&times;</button>
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
          <button type="button" onclick="document.getElementById('faculty-profile-modal').classList.add('hidden')" class="px-4 py-2 border border-slate-200 text-xs font-bold text-slate-700 rounded-lg hover:bg-slate-50">Cancel</button>
          <button type="submit" class="px-4 py-2 bg-[#800020] text-white text-xs font-bold rounded-lg hover:bg-[#600018]">Update Key</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Vanilla JS Engine -->
  <script>
    function switchFacultyTab(tabKey) {
      document.querySelectorAll('.fac-tab-pane').forEach(p => p.classList.add('hidden'));
      const activePane = document.getElementById('fac-pane-' + tabKey);
      if (activePane) activePane.classList.remove('hidden');

      document.querySelectorAll('.fac-nav-tab').forEach(b => {
        b.classList.remove('bg-[#800020]', 'text-white', 'shadow-xs');
        b.classList.add('text-slate-600', 'hover:text-slate-900', 'hover:bg-white/80');
      });

      const activeBtn = document.getElementById('fac-tab-btn-' + tabKey);
      if (activeBtn) {
        activeBtn.classList.remove('text-slate-600', 'hover:text-slate-900', 'hover:bg-white/80');
        activeBtn.classList.add('bg-[#800020]', 'text-white', 'shadow-xs');
      }
    }

    function filterFacultyDay(day) {
      document.querySelectorAll('.fac-day-btn').forEach(b => {
        b.classList.remove('bg-white', 'text-slate-900', 'shadow-2xs');
        b.classList.add('text-slate-600');
      });
      event.target.classList.add('bg-white', 'text-slate-900', 'shadow-2xs');

      document.querySelectorAll('.fac-tt-card').forEach(c => {
        if (day === 'All' || c.getAttribute('data-day') === day) {
          c.classList.remove('hidden');
        } else {
          c.classList.add('hidden');
        }
      });
    }

    function openTakeActionModal(id, subject, status, notes) {
      document.getElementById('action-report-id').value = id;
      document.getElementById('action-report-subject').innerText = subject;
      document.getElementById('action-report-status').value = status === 'Pending Review' ? 'Resolved' : status;
      document.getElementById('action-report-notes').value = notes || '';
      document.getElementById('take-action-modal').classList.remove('hidden');
    }

    function closeTakeActionModal() {
      document.getElementById('take-action-modal').classList.add('hidden');
    }

    function submitTakeAction(e) {
      e.preventDefault();
      const form = document.getElementById('take-action-form');
      const submitBtn = document.getElementById('take-action-submit-btn');
      submitBtn.disabled = true;
      submitBtn.innerText = 'Saving...';

      const formData = new FormData(form);
      formData.append('action', 'update_report_status');

      fetch('actions.php', {
        method: 'POST',
        body: formData
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('Action successfully saved!');
          location.reload();
        } else {
          alert('Error: ' + (data.error || 'Failed to update inquiry status.'));
          submitBtn.disabled = false;
          submitBtn.innerText = 'Save Action';
        }
      })
      .catch(err => {
        alert('Request failed: ' + err.message);
        submitBtn.disabled = false;
        submitBtn.innerText = 'Save Action';
      });
    }

    function openUploadModal(courseId, courseTitle) {
      if (courseId) {
        document.getElementById('upload-course-select').value = courseId;
      }
      document.getElementById('upload-handout-modal').classList.remove('hidden');
    }

    function closeUploadModal() {
      document.getElementById('upload-handout-modal').classList.add('hidden');
    }

    // Faculty Announcement Form Submit Handler
    const facAnnForm = document.getElementById('faculty-announcement-form');
    if (facAnnForm) {
      facAnnForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const submitBtn = document.getElementById('faculty-ann-submit-btn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Publishing...';

        const formData = new FormData(facAnnForm);
        fetch('actions.php', {
          method: 'POST',
          body: formData
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            alert(data.message || 'Notice published successfully!');
            location.reload();
          } else {
            alert('Error: ' + (data.error || 'Failed to publish notice.'));
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Publish Notice / Update';
          }
        })
        .catch(err => {
          alert('Network communication error: ' + err.message);
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Publish Notice / Update';
        });
      });
    }
  </script>

  <!-- SHARED UCMS MODALS & VANILLA JS ENGINE -->
  <?php require_once __DIR__ . '/../includes/modals.php'; ?>
  <script src="js/main.js"></script>
</body>
</html>
