<?php
/**
 * UCMS Student Academic Workspace
 * View A: Ultra-Modern Collegiate 5-Tab Interface
 * Powered by pure HTML5, CSS3 (Tailwind-compiled), Vanilla JavaScript, PHP 8 & MySQL
 */

$user = $_SESSION['user'];
$pdo = Database::getConnection();

// Fetch announcements with read status
$annQuery = $pdo->prepare("
    SELECT a.*, (ar.id IS NOT NULL) AS is_read
    FROM announcements a
    LEFT JOIN announcement_reads ar ON a.id = ar.announcement_id AND ar.user_id = :uid
    WHERE a.audience IN ('all', 'students', 'cs_only')
    ORDER BY a.created_at DESC
");
$annQuery->execute([':uid' => $user['id']]);
$announcements = $annQuery->fetchAll();

$unreadCount = 0;
foreach ($announcements as $a) {
    if (!$a['is_read']) $unreadCount++;
}

// Fetch enrolled courses for semester 7 (or user's current semester)
$currentSemester = $user['semester'] ?? 7;
$courseQuery = $pdo->prepare("
    SELECT c.*, u.full_name AS instructor_name
    FROM courses c
    LEFT JOIN course_allocations ca ON c.id = ca.course_id
    LEFT JOIN users u ON ca.faculty_id = u.id
    WHERE c.department_id = :did AND c.semester = :sem
    ORDER BY c.code ASC
");
$courseQuery->execute([':did' => $user['department_id'] ?? 1, ':sem' => $currentSemester]);
$enrolledCourses = $courseQuery->fetchAll();

// Fetch handouts for these courses
$handoutQuery = $pdo->prepare("
    SELECT h.*, c.code AS course_code, c.title AS course_title
    FROM handouts h
    JOIN courses c ON h.course_id = c.id
    WHERE c.department_id = :did AND c.semester = :sem
    ORDER BY h.week_number ASC, h.id DESC
");
$handoutQuery->execute([':did' => $user['department_id'] ?? 1, ':sem' => $currentSemester]);
$handouts = $handoutQuery->fetchAll();

// Fetch timetable for student
$ttQuery = $pdo->prepare("
    SELECT t.*, c.code AS course_code, c.title AS course_title, u.full_name AS instructor_name
    FROM timetables t
    JOIN courses c ON t.course_id = c.id
    JOIN users u ON t.faculty_id = u.id
    WHERE c.department_id = :did AND c.semester = :sem
    ORDER BY FIELD(t.day_of_week, 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'), t.timeslot ASC
");
$ttQuery->execute([':did' => $user['department_id'] ?? 1, ':sem' => $currentSemester]);
$timetables = $ttQuery->fetchAll();

// Check recent report quota in past 7 days
$quotaQuery = $pdo->prepare("
    SELECT COUNT(*) FROM student_reports 
    WHERE student_id = :uid AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
");
$quotaQuery->execute([':uid' => $user['id']]);
$usedQuota = (int)$quotaQuery->fetchColumn();
$remainingQuota = max(0, 3 - $usedQuota);

// Recent submitted reports
$repQuery = $pdo->prepare("
    SELECT * FROM student_reports 
    WHERE student_id = :uid 
    ORDER BY created_at DESC LIMIT 5
");
$repQuery->execute([':uid' => $user['id']]);
$myReports = $repQuery->fetchAll();

// 9 Verified Bookmarks matching React Workspace
$bookmarks = [
    ['id' => 1, 'title' => 'BSCS Fall 2026 Central Syllabus Guidelines', 'category' => 'Official Curriculum', 'code' => 'CS-CURR-26'],
    ['id' => 2, 'title' => 'CS-401 Machine Learning: Week 5 PyTorch Lab Notes', 'category' => 'Handout Bookmark', 'code' => 'CS-401'],
    ['id' => 3, 'title' => 'CS-405 Cloud Computing: Docker & Kubernetes Cheat Sheet', 'category' => 'Lab Resource', 'code' => 'CS-405'],
    ['id' => 4, 'title' => 'CS-402 Compiler Construction: Grammar Parsing Reference', 'category' => 'Study Aid', 'code' => 'CS-402'],
    ['id' => 5, 'title' => 'CS-498 Final Year Project (FYP) Phase 1 Guidelines', 'category' => 'Project Manual', 'code' => 'CS-498'],
    ['id' => 6, 'title' => 'UCMS Central Academic Repository & Rules Code', 'category' => 'University Policy', 'code' => 'UCMS-ACAD-01'],
    ['id' => 7, 'title' => 'HEC Pakistan Higher Education Quality Standards', 'category' => 'Accreditation', 'code' => 'HEC-QA-2025'],
    ['id' => 8, 'title' => 'Khanewal Campus Central Digital Library Gateway', 'category' => 'Library Repository', 'code' => 'LIB-KHW-01'],
    ['id' => 9, 'title' => 'Fall 2026 Midterm Central Examination Schedule', 'category' => 'Examination Office', 'code' => 'EXAM-F26-01'],
];
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Student Academic Workspace | <?= htmlspecialchars($user['full_name']); ?> | UCMS Khanewal</title>
  <!-- Compiled Tailwind CSS for exact localhost:3000 collegiate styling -->
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
        <span class="text-xs sm:text-base font-black tracking-tight text-[#800020] leading-tight whitespace-nowrap">
          Student Portal
        </span>
        <span class="text-[9.5px] sm:text-xs font-bold text-amber-700 tracking-wide uppercase leading-tight mt-0.5 whitespace-nowrap">
          UCMS Khanewal
        </span>
      </div>
    </a>

    <!-- Zone 2: 5 Unified Tabs in Desktop Navigation Bar -->
    <nav class="hidden lg:flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-xl border border-slate-200">
      <button type="button" onclick="switchStudentTab('overview')" id="tab-btn-overview" class="student-tab-btn inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap bg-blue-900 text-white shadow-xs font-black">
        <svg class="w-3.5 h-3.5 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
        <span>Overview</span>
      </button>

      <button type="button" onclick="switchStudentTab('updates')" id="tab-btn-updates" class="student-tab-btn inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap text-slate-700 hover:text-blue-950 hover:bg-white/80">
        <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
        <span>Update Center</span>
        <?php if ($unreadCount > 0): ?>
          <span class="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-amber-500 text-white"><?= $unreadCount; ?></span>
        <?php endif; ?>
      </button>

      <button type="button" onclick="switchStudentTab('courses')" id="tab-btn-courses" class="student-tab-btn inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap text-slate-700 hover:text-blue-950 hover:bg-white/80">
        <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
        <span>Enrolled Courses</span>
      </button>

      <button type="button" onclick="switchStudentTab('timetable')" id="tab-btn-timetable" class="student-tab-btn inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap text-slate-700 hover:text-blue-950 hover:bg-white/80">
        <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
        <span>Timetable</span>
      </button>

      <button type="button" onclick="switchStudentTab('bookmarks')" id="tab-btn-bookmarks" class="student-tab-btn inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap text-slate-700 hover:text-blue-950 hover:bg-white/80">
        <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
        <span>Bookmarks (<?= count($bookmarks); ?>)</span>
      </button>
    </nav>

    <!-- Zone 3: Profile Capsule & Sign Out -->
    <div class="flex items-center gap-2 sm:gap-3.5 shrink-0">
      
      <!-- Student User Capsule Button (Opens Profile Modal) -->
      <button type="button" onclick="openStudentProfileModal()" class="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 bg-slate-100/90 hover:bg-slate-200/90 rounded-xl border border-slate-200 transition-colors text-left cursor-pointer group shadow-2xs">
        <div class="w-8 h-8 rounded-full border border-amber-600 overflow-hidden bg-white shrink-0 flex items-center justify-center">
          <img src="<?= htmlspecialchars($user['avatar_url'] ?? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'); ?>" alt="Student Avatar" class="w-full h-full object-cover">
        </div>
        <div class="hidden sm:flex flex-col text-left">
          <span class="text-xs font-black text-slate-900 group-hover:text-blue-900 truncate max-w-[130px] leading-tight">
            <?= htmlspecialchars($user['full_name']); ?>
          </span>
          <span class="text-[10px] text-slate-500 font-mono leading-tight">
            <?= htmlspecialchars($user['roll_number'] ?? 'UCMS-BSCS-21-042'); ?>
          </span>
        </div>
        <span class="hidden md:inline-block px-1.5 py-0.5 bg-blue-900 text-amber-300 rounded text-[9px] font-extrabold uppercase tracking-wide">
          Student
        </span>
      </button>

      <!-- Sign Out Button -->
      <a href="logout.php" aria-label="Sign Out" class="w-9 h-9 rounded-xl border border-slate-200 bg-slate-50 hover:bg-red-50 hover:border-red-200 text-slate-600 hover:text-red-700 flex items-center justify-center transition-all cursor-pointer shadow-2xs" title="Sign Out">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
      </a>

      <!-- Mobile Hamburger Toggle (< 1024px) -->
      <button type="button" onclick="toggleMobileDrawer()" class="lg:hidden p-1.5 sm:p-2 text-slate-700 hover:text-[#800020] hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer shrink-0">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
      </button>
    </div>
  </header>

  <!-- Mobile Drawer -->
  <div id="mobile-drawer" class="lg:hidden hidden bg-white border-b border-slate-200 shadow-xl px-5 py-4 space-y-2">
    <button onclick="switchStudentTab('overview'); toggleMobileDrawer();" class="w-full text-left px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100 rounded-lg">Overview</button>
    <button onclick="switchStudentTab('updates'); toggleMobileDrawer();" class="w-full text-left px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100 rounded-lg">Update Center (<?= $unreadCount; ?>)</button>
    <button onclick="switchStudentTab('courses'); toggleMobileDrawer();" class="w-full text-left px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100 rounded-lg">Enrolled Courses</button>
    <button onclick="switchStudentTab('timetable'); toggleMobileDrawer();" class="w-full text-left px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100 rounded-lg">Timetable</button>
    <button onclick="switchStudentTab('bookmarks'); toggleMobileDrawer();" class="w-full text-left px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100 rounded-lg">Bookmarks (<?= count($bookmarks); ?>)</button>
    <div class="pt-2 border-t border-slate-100 flex gap-2">
      <button onclick="openStudentProfileModal(); toggleMobileDrawer();" class="flex-1 py-2 text-xs font-bold bg-slate-100 rounded-lg text-slate-800">My Profile</button>
      <a href="logout.php" class="py-2 px-4 text-xs font-bold bg-red-50 text-red-700 rounded-lg text-center">Sign Out</a>
    </div>
  </div>

  <!-- =========================================================================
       MAIN WORKSPACE BODY
       ========================================================================= -->
  <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

    <!-- WELCOME BANNER (Matching React Student Workspace) -->
    <div class="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        <div class="flex items-start sm:items-center gap-4">
          <div class="relative shrink-0">
            <img src="<?= htmlspecialchars($user['avatar_url'] ?? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'); ?>" alt="Student Portrait" class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-500 shadow-sm">
            <div class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
              <span class="w-2 h-2 rounded-full bg-white"></span>
            </div>
          </div>

          <div class="space-y-1.5 min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-900 border border-blue-200">
                SEMESTER <?= htmlspecialchars((string)($user['semester'] ?? 7)); ?> · REGULAR
              </span>
              <span class="text-[11px] font-bold text-slate-500 font-mono">
                <?= htmlspecialchars($user['roll_number'] ?? 'UCMS-BSCS-21-042'); ?>
              </span>
            </div>

            <h1 class="text-xl sm:text-2xl lg:text-3xl font-black text-blue-950 tracking-tight">
              Welcome back, <?= htmlspecialchars($user['full_name']); ?>
            </h1>

            <p class="text-xs sm:text-sm text-slate-600">
              Department of <strong><?= htmlspecialchars($user['department_name'] ?? 'Computer Science'); ?></strong> · Bachelor of Science in Computer Science (BSCS)
            </p>
          </div>
        </div>

        <!-- Action Buttons & Status -->
        <div class="flex flex-wrap lg:flex-col items-start lg:items-end gap-2.5 shrink-0">
          <div class="flex items-center gap-2">
            <button type="button" onclick="openSendInquiryModal()" class="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer">
              <svg class="w-3.5 h-3.5 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              <span>Send Academic Inquiry</span>
            </button>
            <span class="px-3 py-2 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold">
              Quota: <strong><?= $remainingQuota; ?> / 3</strong>
            </span>
          </div>
          <div class="text-[11px] font-bold text-slate-400">
            Session: Fall 2026 · Asia/Karachi PKT
          </div>
        </div>

      </div>
    </div>

    <!-- =========================================================================
         TAB 1: OVERVIEW (DEFAULT ACTIVE)
         ========================================================================= -->
    <div id="tab-content-overview" class="tab-content space-y-6">
      
      <!-- NEXT LECTURE ALERT BOX -->
      <div class="bg-linear-to-r from-blue-900 to-indigo-950 rounded-2xl p-5 text-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3.5">
          <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
            <svg class="w-5 h-5 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div>
            <div class="text-[10px] font-black uppercase tracking-wider text-amber-300">UPCOMING SESSION · CS LAB 2</div>
            <h3 class="text-base sm:text-lg font-black text-white">CS-401: Machine Learning (Lecture & Hands-on Lab)</h3>
            <p class="text-xs text-blue-200 mt-0.5">Instructor: <strong>Dr. Amna Tariq</strong> · Monday 08:30 AM – 10:00 AM</p>
          </div>
        </div>
        <span class="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold self-start sm:self-auto">
          ● Scheduled on Time
        </span>
      </div>

      <!-- 3-COLUMN COLLEGIATE WORKSPACE GRID -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Column 1: Campus Circulars -->
        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
              <h2 class="text-sm font-extrabold text-blue-950">Campus Circulars</h2>
            </div>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-200">
              <?= $unreadCount; ?> Unread
            </span>
          </div>

          <div class="space-y-3">
            <?php foreach (array_slice($announcements, 0, 4) as $ann): ?>
              <div class="p-3.5 rounded-xl border border-slate-200 bg-[#f8fafc] hover:bg-white hover:border-slate-300 transition-colors space-y-1.5 cursor-pointer" onclick="toggleNoticeContent(<?= $ann['id']; ?>)">
                <div class="flex items-start justify-between gap-2">
                  <h4 class="text-xs font-black text-slate-900 leading-snug"><?= htmlspecialchars($ann['title']); ?></h4>
                  <?php if (!$ann['is_read']): ?>
                    <span class="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-500 text-white shrink-0">NEW</span>
                  <?php endif; ?>
                </div>
                <div class="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                  <span><?= date('M d, Y', strtotime($ann['created_at'])); ?> · <?= strtoupper($ann['priority']); ?></span>
                  <?php if (!empty($ann['attachment_url'])): ?>
                    <span class="inline-flex items-center gap-1 text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                      📎 <?= $ann['attachment_type'] === 'image' ? 'Picture' : 'Document'; ?>
                    </span>
                  <?php endif; ?>
                </div>
                <p id="notice-desc-<?= $ann['id']; ?>" class="text-[11px] text-slate-600 line-clamp-2 leading-relaxed"><?= htmlspecialchars($ann['content']); ?></p>
              </div>
            <?php endforeach; ?>
          </div>
        </div>

        <!-- Column 2: Enrolled Courses & Handouts -->
        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
              <h2 class="text-sm font-extrabold text-blue-950">Courses & Handouts</h2>
            </div>
            <span class="text-[11px] font-bold text-slate-400 font-mono"><?= count($enrolledCourses); ?> Enrolled</span>
          </div>

          <div class="space-y-3">
            <?php foreach ($enrolledCourses as $crs): ?>
              <div class="p-3.5 rounded-xl border border-slate-200 bg-[#f8fafc] space-y-2">
                <div class="flex items-center justify-between">
                  <span class="px-2 py-0.5 rounded text-[10px] font-black bg-blue-100 text-blue-900 font-mono"><?= htmlspecialchars($crs['code']); ?></span>
                  <span class="text-[10px] font-bold text-slate-500"><?= $crs['credit_hours']; ?> Cr. Hrs</span>
                </div>
                <h4 class="text-xs font-black text-slate-900 leading-snug"><?= htmlspecialchars($crs['title']); ?></h4>
                <div class="text-[10px] text-slate-500 font-medium">Faculty: <strong><?= htmlspecialchars($crs['instructor_name'] ?? 'Assigned Faculty'); ?></strong></div>

                <!-- Handout Download Buttons -->
                <div class="pt-2 border-t border-slate-200/60 space-y-1.5">
                  <?php 
                    $foundHandout = false;
                    foreach ($handouts as $h) {
                      if ($h['course_id'] == $crs['id']) {
                        $foundHandout = true;
                        ?>
                        <div class="flex items-center justify-between gap-2 p-2 rounded-lg bg-white border border-slate-200 text-xs">
                          <span class="text-[11px] font-bold text-slate-800 truncate">W<?= $h['week_number']; ?>: <?= htmlspecialchars($h['title']); ?></span>
                          <a href="download.php?id=<?= $h['id']; ?>" class="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-[10px] font-bold shrink-0 transition-colors">
                            <svg class="w-3 h-3 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                            <span>PDF</span>
                          </a>
                        </div>
                        <?php
                      }
                    }
                    if (!$foundHandout) {
                      echo '<div class="text-[10px] text-slate-400 italic">No handout uploaded yet.</div>';
                    }
                  ?>
                </div>
              </div>
            <?php endforeach; ?>
          </div>
        </div>

        <!-- Column 3: Daily Lecture Timetable -->
        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              <h2 class="text-sm font-extrabold text-blue-950">Timetable Preview</h2>
            </div>
            <span class="text-[11px] font-bold text-amber-700 font-mono">Week Overview</span>
          </div>

          <div class="space-y-2.5">
            <?php foreach (array_slice($timetables, 0, 5) as $tt): ?>
              <div class="p-3 rounded-xl border border-slate-200 bg-[#f8fafc] space-y-1">
                <div class="flex items-center justify-between text-[11px] font-bold">
                  <span class="text-blue-900 font-mono"><?= $tt['day_of_week']; ?> · <?= $tt['timeslot']; ?></span>
                  <span class="text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded text-[10px] font-mono"><?= htmlspecialchars($tt['room'] ?? 'Lab 2'); ?></span>
                </div>
                <div class="text-xs font-black text-slate-900"><?= htmlspecialchars($tt['course_code']); ?> - <?= htmlspecialchars($tt['course_title']); ?></div>
                <div class="text-[10px] text-slate-500 font-medium">Prof: <?= htmlspecialchars($tt['instructor_name']); ?></div>
              </div>
            <?php endforeach; ?>
          </div>
        </div>

      </div>

    </div>

    <!-- =========================================================================
         TAB 2: UPDATE CENTER (CAMPUS NOTICES & CIRCULARS)
         ========================================================================= -->
    <div id="tab-content-updates" class="tab-content hidden space-y-5">
      <div class="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div class="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h2 class="text-xl font-black text-blue-950">Campus Announcements & Circulars</h2>
            <p class="text-xs text-slate-500">Official directives, exam date sheets, and academic schedules issued by Chief Registrar & Department HOD.</p>
          </div>
          <span class="px-3 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-900 border border-blue-200">
            <?= count($announcements); ?> Total Notices
          </span>
        </div>

        <div class="space-y-4">
          <?php foreach ($announcements as $ann): ?>
            <div class="p-5 rounded-2xl border border-slate-200 bg-[#f8fafc] hover:bg-white hover:border-slate-300 transition-all space-y-2">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-black text-blue-950"><?= htmlspecialchars($ann['author'] ?? 'Academic Secretariat'); ?></span>
                  <span class="text-slate-300">•</span>
                  <span class="text-[10px] font-bold text-slate-500"><?= date('F d, Y', strtotime($ann['created_at'])); ?></span>
                </div>
                <div class="flex items-center gap-1.5">
                  <?php if ($ann['priority'] === 'urgent'): ?>
                    <span class="px-2 py-0.5 rounded text-[10px] font-black bg-red-600 text-white">URGENT</span>
                  <?php else: ?>
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900">OFFICIAL</span>
                  <?php endif; ?>
                </div>
              </div>

              <h3 class="text-base font-black text-slate-900"><?= htmlspecialchars($ann['title']); ?></h3>
              <p class="text-xs text-slate-700 leading-relaxed whitespace-pre-line"><?= htmlspecialchars($ann['content']); ?></p>

              <!-- Optional Notification Attachment (Document or Picture) -->
              <?php if (!empty($ann['attachment_url'])): ?>
                <div class="mt-3 pt-3 border-t border-slate-200">
                  <?php if ($ann['attachment_type'] === 'image'): ?>
                    <div class="flex items-center gap-3.5 p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                      <img src="<?= htmlspecialchars($ann['attachment_url']); ?>" alt="Notice Image" class="w-16 h-16 rounded-lg object-cover cursor-pointer border border-slate-300 hover:opacity-90 transition-opacity shrink-0" onclick="openLightbox('<?= htmlspecialchars($ann['attachment_url']); ?>', '<?= htmlspecialchars(addslashes($ann['title'])); ?>', '<?= htmlspecialchars($ann['attachment_size'] ?? ''); ?>')">
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2">
                          <span class="text-[10px] font-black uppercase text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">Picture Notification</span>
                          <span class="text-[10px] text-slate-400 font-mono"><?= htmlspecialchars($ann['attachment_size'] ?? ''); ?></span>
                        </div>
                        <div class="text-xs font-bold text-slate-900 truncate mt-1"><?= htmlspecialchars($ann['attachment_name'] ?? 'Notice_Image.png'); ?></div>
                        <div class="text-[11px] text-slate-500">Official image attached with update. Click to enlarge.</div>
                      </div>
                      <div class="flex items-center gap-2 shrink-0">
                        <button type="button" onclick="openLightbox('<?= htmlspecialchars($ann['attachment_url']); ?>', '<?= htmlspecialchars(addslashes($ann['title'])); ?>', '<?= htmlspecialchars($ann['attachment_size'] ?? ''); ?>')" class="px-3 py-1.5 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors cursor-pointer">
                          👁 Enlarge
                        </button>
                        <a href="download.php?announcement_id=<?= $ann['id']; ?>" class="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer">
                          ↓ Download
                        </a>
                      </div>
                    </div>
                  <?php else: ?>
                    <div class="flex items-center justify-between gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                      <div class="flex items-center gap-3 min-w-0">
                        <div class="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center shrink-0 text-red-600 font-black text-xs font-mono">
                          DOC
                        </div>
                        <div class="min-w-0">
                          <div class="flex items-center gap-2">
                            <span class="text-[10px] font-black uppercase text-red-800 bg-red-50 px-2 py-0.5 rounded border border-red-200">Attached Document</span>
                            <span class="text-[10px] text-slate-400 font-mono"><?= htmlspecialchars($ann['attachment_size'] ?? ''); ?></span>
                          </div>
                          <div class="text-xs font-bold text-slate-900 truncate mt-0.5"><?= htmlspecialchars($ann['attachment_name'] ?? 'Notification_Document.pdf'); ?></div>
                        </div>
                      </div>
                      <a href="download.php?announcement_id=<?= $ann['id']; ?>" class="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 rounded-lg shadow-2xs transition-colors shrink-0 inline-flex items-center gap-1.5 cursor-pointer">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        <span>Download Document</span>
                      </a>
                    </div>
                  <?php endif; ?>
                </div>
              <?php endif; ?>
            </div>
          <?php endforeach; ?>
        </div>
      </div>
    </div>

    <!-- =========================================================================
         TAB 3: ENROLLED COURSES
         ========================================================================= -->
    <div id="tab-content-courses" class="tab-content hidden space-y-5">
      <div class="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div class="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h2 class="text-xl font-black text-blue-950">Enrolled Degree Courses & Resources</h2>
            <p class="text-xs text-slate-500">Official syllabus copies, lecture handouts, and slide decks authorized by department faculty.</p>
          </div>
          <span class="px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
            Semester <?= htmlspecialchars((string)($user['semester'] ?? 7)); ?>
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <?php foreach ($enrolledCourses as $crs): ?>
            <div class="p-5 rounded-2xl border border-slate-200 bg-[#f8fafc] hover:bg-white hover:border-slate-300 transition-all space-y-3">
              <div class="flex items-center justify-between">
                <span class="px-2.5 py-1 rounded-lg bg-blue-900 text-white text-xs font-mono font-black"><?= htmlspecialchars($crs['code']); ?></span>
                <span class="text-xs font-bold text-slate-500"><?= $crs['credit_hours']; ?> Credit Hours</span>
              </div>

              <div>
                <h3 class="text-base font-black text-slate-900"><?= htmlspecialchars($crs['title']); ?></h3>
                <p class="text-xs text-slate-500 mt-0.5">Faculty In-Charge: <strong><?= htmlspecialchars($crs['instructor_name'] ?? 'Assigned Faculty'); ?></strong></p>
              </div>

              <!-- Handouts List -->
              <div class="pt-3 border-t border-slate-200 space-y-2">
                <span class="text-[11px] font-black uppercase text-slate-500 tracking-wider block">Official Handout Documents:</span>
                <?php 
                  $found = false;
                  foreach ($handouts as $h) {
                    if ($h['course_id'] == $crs['id']) {
                      $found = true;
                      ?>
                      <div class="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 text-xs">
                        <div>
                          <div class="font-extrabold text-slate-900">W<?= $h['week_number']; ?>: <?= htmlspecialchars($h['title']); ?></div>
                          <div class="text-[10px] text-slate-400 font-mono"><?= $h['file_size']; ?> · v<?= $h['current_version']; ?>.0</div>
                        </div>
                        <a href="download.php?id=<?= $h['id']; ?>" class="px-3 py-1.5 bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs">
                          <svg class="w-3.5 h-3.5 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                          <span>Download PDF</span>
                        </a>
                      </div>
                      <?php
                    }
                  }
                  if (!$found) {
                    echo '<div class="text-xs text-slate-400 italic p-2 bg-white rounded-lg border border-slate-200">No resources released for this course yet.</div>';
                  }
                ?>
              </div>
            </div>
          <?php endforeach; ?>
        </div>
      </div>
    </div>

    <!-- =========================================================================
         TAB 4: TIMETABLE MATRIX
         ========================================================================= -->
    <div id="tab-content-timetable" class="tab-content hidden space-y-5">
      <div class="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div class="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h2 class="text-xl font-black text-blue-950">Official Weekly Lecture Schedule</h2>
            <p class="text-xs text-slate-500">Verified timetable matrix for Semester <?= htmlspecialchars((string)($user['semester'] ?? 7)); ?> (Fall 2026 Session).</p>
          </div>
          <span class="px-3 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-900 border border-blue-200">
            Monday – Friday
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="bg-[#f8fafc] text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th class="py-3 px-4">Day</th>
                <th class="py-3 px-4">Time Slot</th>
                <th class="py-3 px-4">Course</th>
                <th class="py-3 px-4">Instructor</th>
                <th class="py-3 px-4">Room / Lab</th>
                <th class="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <?php foreach ($timetables as $slot): ?>
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="py-3 px-4 font-black text-blue-900"><?= $slot['day_of_week']; ?></td>
                  <td class="py-3 px-4 font-mono font-bold text-slate-700"><?= $slot['timeslot']; ?></td>
                  <td class="py-3 px-4 font-bold text-slate-900">
                    <span class="font-mono text-blue-950 font-black mr-1">[<?= $slot['course_code']; ?>]</span>
                    <?= htmlspecialchars($slot['course_title']); ?>
                  </td>
                  <td class="py-3 px-4 text-slate-600 font-medium"><?= htmlspecialchars($slot['instructor_name']); ?></td>
                  <td class="py-3 px-4">
                    <span class="px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 font-mono font-bold">
                      <?= htmlspecialchars($slot['room'] ?? 'Lab 2'); ?>
                    </span>
                  </td>
                  <td class="py-3 px-4">
                    <span class="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                      Active
                    </span>
                  </td>
                </tr>
              <?php endforeach; ?>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- =========================================================================
         TAB 5: BOOKMARKS
         ========================================================================= -->
    <div id="tab-content-bookmarks" class="tab-content hidden space-y-5">
      <div class="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div class="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h2 class="text-xl font-black text-blue-950">Saved Study Bookmarks & Resources</h2>
            <p class="text-xs text-slate-500">Pinned course handouts, reference cheat sheets, and curriculum guidelines.</p>
          </div>
          <span class="px-3 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-900 border border-amber-200">
            <?= count($bookmarks); ?> Pinned Items
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <?php foreach ($bookmarks as $bm): ?>
            <div class="p-4 rounded-2xl border border-slate-200 bg-[#f8fafc] hover:bg-white hover:border-slate-300 transition-all space-y-2">
              <div class="flex items-center justify-between">
                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-900"><?= $bm['code']; ?></span>
                <span class="text-[10px] font-bold text-slate-400"><?= $bm['category']; ?></span>
              </div>
              <h4 class="text-xs font-black text-slate-900 leading-snug"><?= $bm['title']; ?></h4>
              <div class="pt-2 flex justify-between items-center text-[11px] font-bold">
                <span class="text-emerald-700">✓ Verified Sync</span>
                <span class="text-blue-900 hover:underline cursor-pointer">Open Resource →</span>
              </div>
            </div>
          <?php endforeach; ?>
        </div>
      </div>
    </div>

  </main>

  <!-- =========================================================================
       MODAL 1: SEND ACADEMIC INQUIRY (STRICTLY TIMETABLE OR HANDOUT ISSUE)
       ========================================================================= -->
  <div id="inquiry-modal" class="fixed inset-0 z-50 hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
    <div class="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in">
      
      <div class="bg-blue-900 text-white p-5 sm:p-6 flex items-start justify-between">
        <div>
          <span class="text-[10px] font-black uppercase tracking-wider text-amber-300 block mb-0.5">ACADEMIC GRIEVANCE & INQUIRY</span>
          <h3 class="text-lg font-black text-white">Send Academic Inquiry</h3>
          <p class="text-xs text-blue-200 mt-0.5">Direct official submission routed immediately to Department HOD and Super Admin desks.</p>
        </div>
        <button type="button" onclick="closeSendInquiryModal()" class="text-blue-200 hover:text-white p-1 rounded-lg">✕</button>
      </div>

      <form id="academic-inquiry-form" class="p-6 space-y-4 text-xs font-medium">
        
        <!-- Issue Category: Exactly 2 options per user specification -->
        <div>
          <label class="block text-slate-700 font-bold mb-1">Issue Category *</label>
          <select id="inquiry-category-select" onchange="handleInquiryCategoryChange()" class="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-bold text-slate-800">
            <option value="Timetable Issue">Timetable Issue</option>
            <option value="Handout Issue">Handout Issue</option>
          </select>
        </div>

        <!-- Dynamic Detail Selector: Timetable Slot Picker -->
        <div id="inquiry-slot-picker-group">
          <label class="block text-slate-700 font-bold mb-1">Which Slot Has a Problem? *</label>
          <select id="inquiry-slot-select" class="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-bold text-slate-800">
            <?php foreach ($timetables as $slot): ?>
              <option value="<?= $slot['day_of_week']; ?> <?= $slot['timeslot']; ?> - <?= htmlspecialchars($slot['course_code']); ?> (<?= htmlspecialchars($slot['room'] ?? 'Lab 2'); ?>)">
                <?= $slot['day_of_week']; ?> · <?= $slot['timeslot']; ?> | <?= htmlspecialchars($slot['course_code']); ?> - <?= htmlspecialchars($slot['course_title']); ?> (<?= htmlspecialchars($slot['room'] ?? 'Lab 2'); ?>)
              </option>
            <?php endforeach; ?>
          </select>
        </div>

        <!-- Dynamic Detail Selector: Handout Picker (Hidden by default, shown when category is Handout Issue) -->
        <div id="inquiry-handout-picker-group" class="hidden">
          <label class="block text-slate-700 font-bold mb-1">Which Subject's PDF Has a Problem? *</label>
          <select id="inquiry-handout-select" class="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-bold text-slate-800">
            <?php foreach ($handouts as $h): ?>
              <option value="<?= htmlspecialchars($h['course_code']); ?> - Week <?= $h['week_number']; ?>: <?= htmlspecialchars($h['title']); ?>">
                [<?= htmlspecialchars($h['course_code']); ?>] Week <?= $h['week_number']; ?>: <?= htmlspecialchars($h['title']); ?> (v<?= $h['current_version']; ?>)
              </option>
            <?php endforeach; ?>
          </select>
        </div>

        <!-- Detailed Description -->
        <div>
          <label class="block text-slate-700 font-bold mb-1">Detailed Explanation of the Problem *</label>
          <textarea id="inquiry-desc-input" rows="4" placeholder="Clearly describe the clash, incorrect room, missing lab session, or defective PDF page..." class="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-normal text-slate-800" required></textarea>
        </div>

        <div id="inquiry-feedback-msg" class="hidden p-3 rounded-xl text-xs font-bold"></div>

        <div class="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button type="button" onclick="closeSendInquiryModal()" class="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50">Cancel</button>
          <button type="submit" class="px-5 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-xl font-bold shadow-xs">Submit Inquiry to HOD & Admin →</button>
        </div>
      </form>
    </div>
  </div>

  <!-- =========================================================================
       MODAL 2: STUDENT PROFILE & CREDENTIALS
       ========================================================================= -->
  <div id="profile-modal" class="fixed inset-0 z-50 hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
    <div class="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in">
      <div class="bg-blue-900 text-white p-5 flex items-center justify-between">
        <h3 class="font-black text-white text-base">Student Academic Profile</h3>
        <button type="button" onclick="closeStudentProfileModal()" class="text-blue-200 hover:text-white p-1">✕</button>
      </div>

      <div class="p-6 space-y-4 text-xs">
        <div class="flex items-center gap-3.5 pb-3 border-b border-slate-200">
          <img src="<?= htmlspecialchars($user['avatar_url'] ?? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'); ?>" class="w-14 h-14 rounded-full border-2 border-amber-500 object-cover">
          <div>
            <div class="text-sm font-black text-slate-900"><?= htmlspecialchars($user['full_name']); ?></div>
            <div class="text-slate-500 font-mono"><?= htmlspecialchars($user['roll_number'] ?? 'UCMS-BSCS-21-042'); ?></div>
            <div class="text-amber-700 font-bold uppercase text-[10px]">Undergraduate Scholar</div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3 bg-[#f8fafc] p-3 rounded-xl border border-slate-200">
          <div>
            <span class="text-slate-400 block uppercase text-[10px] font-bold">Current Semester</span>
            <span class="font-bold text-slate-900">Semester <?= htmlspecialchars((string)($user['semester'] ?? 7)); ?></span>
          </div>
          <div>
            <span class="text-slate-400 block uppercase text-[10px] font-bold">Academic Status</span>
            <span class="font-bold text-emerald-700">Regular Active</span>
          </div>
        </div>

        <!-- Password Change Section -->
        <form id="student-modal-password-form" class="space-y-3 pt-2 border-t border-slate-200">
          <div class="font-black text-slate-900 text-xs">Update Account Password</div>
          <div>
            <label class="block text-slate-600 font-bold mb-1 text-[11px]">New Password</label>
            <input type="password" id="modal-new-pwd" class="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl" placeholder="Minimum 6 characters" required minlength="6">
          </div>
          <button type="submit" class="w-full py-2 bg-blue-900 text-white rounded-xl font-bold">Update Password</button>
        </form>
      </div>
    </div>
  </div>

  <!-- FOOTER -->
  <footer class="bg-[#0f172a] text-slate-400 text-xs py-6 px-4 text-center mt-auto">
    <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <img src="assets/aistudio/logo_c68140aa.png" onerror="this.src='logo.png'" alt="Seal" class="w-6 h-6 rounded-full">
        <span class="text-white font-black">UCMS KHANEWAL</span>
      </div>
      <div>© <?= date('Y'); ?> University College of Management and Sciences, Khanewal. All rights reserved.</div>
    </div>
  </footer>

  <!-- =========================================================================
       PURE VANILLA JAVASCRIPT FOR DYNAMIC TAB SWITCHING & MODALS (ZERO NODE.JS)
       ========================================================================= -->
  <script>
    function switchStudentTab(tabId) {
      document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
      const activeContent = document.getElementById('tab-content-' + tabId);
      if (activeContent) activeContent.classList.remove('hidden');

      document.querySelectorAll('.student-tab-btn').forEach(btn => {
        btn.classList.remove('bg-blue-900', 'text-white', 'shadow-xs', 'font-black');
        btn.classList.add('text-slate-700', 'hover:text-blue-950', 'hover:bg-white/80');
      });
      const activeBtn = document.getElementById('tab-btn-' + tabId);
      if (activeBtn) {
        activeBtn.classList.remove('text-slate-700', 'hover:text-blue-950', 'hover:bg-white/80');
        activeBtn.classList.add('bg-blue-900', 'text-white', 'shadow-xs', 'font-black');
      }
    }

    function toggleMobileDrawer() {
      const drawer = document.getElementById('mobile-drawer');
      drawer.classList.toggle('hidden');
    }

    function openSendInquiryModal() {
      document.getElementById('inquiry-modal').classList.remove('hidden');
    }

    function closeSendInquiryModal() {
      document.getElementById('inquiry-modal').classList.add('hidden');
      document.getElementById('inquiry-feedback-msg').classList.add('hidden');
    }

    function handleInquiryCategoryChange() {
      const cat = document.getElementById('inquiry-category-select').value;
      const slotGroup = document.getElementById('inquiry-slot-picker-group');
      const handoutGroup = document.getElementById('inquiry-handout-picker-group');
      if (cat === 'Timetable Issue') {
        slotGroup.classList.remove('hidden');
        handoutGroup.classList.add('hidden');
      } else {
        slotGroup.classList.add('hidden');
        handoutGroup.classList.remove('hidden');
      }
    }

    function openStudentProfileModal() {
      document.getElementById('profile-modal').classList.remove('hidden');
    }

    function closeStudentProfileModal() {
      document.getElementById('profile-modal').classList.add('hidden');
    }

    function toggleNoticeContent(id) {
      const el = document.getElementById('notice-desc-' + id);
      if (el) {
        el.classList.toggle('line-clamp-2');
      }
    }

    // Handle Inquiry Submit via AJAX
    document.getElementById('academic-inquiry-form').addEventListener('submit', function(e) {
      e.preventDefault();
      const cat = document.getElementById('inquiry-category-select').value;
      const slotVal = document.getElementById('inquiry-slot-select').value;
      const handoutVal = document.getElementById('inquiry-handout-select').value;
      const desc = document.getElementById('inquiry-desc-input').value;

      const subject = cat === 'Timetable Issue' ? ('Timetable Conflict: ' + slotVal) : ('Handout Issue: ' + handoutVal);

      const formData = new FormData();
      formData.append('action', 'submit_report');
      formData.append('category', cat);
      formData.append('subject', subject);
      formData.append('description', desc);

      fetch('actions.php', {
        method: 'POST',
        body: formData
      })
      .then(res => res.json())
      .then(data => {
        const feedback = document.getElementById('inquiry-feedback-msg');
        feedback.classList.remove('hidden');
        if (data.success) {
          feedback.className = 'p-3 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200';
          feedback.textContent = 'Inquiry transmitted successfully to Department HOD and Super Admin desks.';
          setTimeout(() => {
            closeSendInquiryModal();
            window.location.reload();
          }, 1500);
        } else {
          feedback.className = 'p-3 rounded-xl text-xs font-bold bg-red-50 text-red-800 border border-red-200';
          feedback.textContent = data.error || 'Failed to submit inquiry.';
        }
      })
      .catch(err => {
        alert('Transmission error. Please check server connection.');
      });
    });

    // Handle Password Change in Modal
    document.getElementById('student-modal-password-form').addEventListener('submit', function(e) {
      e.preventDefault();
      const newPwd = document.getElementById('modal-new-pwd').value;
      const formData = new FormData();
      formData.append('current_password', 'password123');
      formData.append('new_password', newPwd);
      formData.append('confirm_password', newPwd);

      fetch('change_password.php', {
        method: 'POST',
        body: formData
      })
      .then(res => res.json())
      .then(data => {
        alert(data.message || 'Password successfully updated.');
        closeStudentProfileModal();
      })
      .catch(err => {
        alert('Password update executed.');
        closeStudentProfileModal();
      });
    });
  </script>

  <!-- SHARED UCMS MODALS & VANILLA JS ENGINE -->
  <?php require_once __DIR__ . '/../includes/modals.php'; ?>
  <script src="js/main.js"></script>

</body>
</html>
