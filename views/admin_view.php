<?php
/**
 * UCMS Master Administrative Console & Public CMS
 * View D: Ultra-Modern Collegiate 5-Menu Interface
 * Strictly 5 Menus: Users, Timetable, Notices & Inquiries, Website CMS, Audit Trail
 * Powered by pure HTML5, CSS3 (Tailwind-compiled), Vanilla JavaScript, PHP 8 & MySQL
 */

$user = $_SESSION['user'];
$pdo = Database::getConnection();

// Fetch Departments
$deptQuery = $pdo->query("SELECT * FROM departments ORDER BY id ASC");
$departments = $deptQuery->fetchAll();

// Fetch CMS Settings
$cmsQuery = $pdo->query("SELECT * FROM cms_settings");
$cmsRows = $cmsQuery->fetchAll();
$cms = [];
foreach ($cmsRows as $r) {
    $cms[$r['setting_key']] = $r['setting_value'];
}

// Fetch Audit Logs
$auditQuery = $pdo->query("
    SELECT a.*, u.full_name, u.username, u.role 
    FROM audit_logs a
    LEFT JOIN users u ON a.user_id = u.id
    ORDER BY a.created_at DESC LIMIT 50
");
$auditLogs = $auditQuery->fetchAll();

// Fetch All Users for Directory
$usersQuery = $pdo->query("
    SELECT u.*, d.name AS department_name, d.code AS department_code
    FROM users u
    LEFT JOIN departments d ON u.department_id = d.id
    ORDER BY FIELD(u.role, 'admin', 'hod', 'teacher', 'student'), u.id ASC
");
$allUsers = $usersQuery->fetchAll();

// Fetch Master Timetable
$ttQuery = $pdo->query("
    SELECT t.*, c.code AS course_code, c.title AS course_title, u.full_name AS instructor_name, d.name AS department_name, d.code AS dept_code
    FROM timetables t
    JOIN courses c ON t.course_id = c.id
    LEFT JOIN departments d ON c.department_id = d.id
    LEFT JOIN users u ON t.faculty_id = u.id
    ORDER BY FIELD(t.day_of_week, 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'), t.timeslot ASC
");
$allTimetables = $ttQuery->fetchAll();

// Filter values for cohort selector
$selectedDept = (int)($_GET['dept_id'] ?? 1);
$selectedSem  = (int)($_GET['semester'] ?? 7);

$cohortStmt = $pdo->prepare("
    SELECT * FROM users 
    WHERE role = 'student' AND department_id = :did AND semester = :sem AND status = 'active'
    ORDER BY roll_number ASC
");
$cohortStmt->execute([':did' => $selectedDept, ':sem' => $selectedSem]);
$cohortStudents = $cohortStmt->fetchAll();

// Fetch All Student Inquiries Across All Departments
$allReportsQuery = $pdo->query("
    SELECT sr.*, u.full_name AS student_name, u.roll_number, u.email AS student_email, u.semester, d.name AS dept_name, d.code AS dept_code
    FROM student_reports sr
    JOIN users u ON sr.student_id = u.id
    LEFT JOIN departments d ON u.department_id = d.id
    ORDER BY FIELD(sr.status, 'Pending Review', 'Under Investigation', 'Resolved', 'Dismissed'), sr.created_at DESC
");
$allStudentReports = $allReportsQuery->fetchAll();

$adminPendingCount = 0;
foreach ($allStudentReports as $r) {
    if ($r['status'] === 'Pending Review' || $r['status'] === 'Under Investigation') {
        $adminPendingCount++;
    }
}

// Fetch Broadcast Announcements
$annQuery = $pdo->query("SELECT * FROM announcements ORDER BY created_at DESC");
$broadcastHistory = $annQuery->fetchAll();
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Master Administrative Console | UCMS Khanewal</title>
  <link rel="stylesheet" href="css/tailwind.css">
  <link rel="stylesheet" href="css/style.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;0,800;1,700&display=swap" rel="stylesheet">
  <link rel="icon" type="image/png" href="assets/aistudio/logo_c68140aa.png">
</head>
<body class="bg-[#f8fafc] text-slate-800 antialiased min-h-screen flex flex-col font-sans">

  <!-- =========================================================================
       STICKY TOP HEADER (72px, Strictly 5 Menus matching user specification)
       ========================================================================= -->
  <header class="sticky top-0 z-40 h-[72px] w-full bg-white/98 backdrop-blur-md border-b border-slate-200 px-3 sm:px-6 lg:px-8 flex items-center justify-between shadow-2xs">
    
    <!-- Zone 1: Brand Lockup -->
    <a href="index.php" class="flex items-center gap-2.5 sm:gap-3 group cursor-pointer shrink-0 text-decoration-none">
      <div class="w-11 h-11 sm:w-13 sm:h-13 rounded-full border-2 border-[#800020] p-0.5 bg-white shadow-xs shrink-0 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
        <img src="assets/aistudio/logo_c68140aa.png" onerror="this.src='logo.png'" alt="UCMS Seal" class="w-full h-full object-contain rounded-full">
      </div>
      <div class="flex flex-col text-left">
        <span class="text-xs sm:text-base font-black tracking-tight text-[#800020] leading-tight whitespace-nowrap">
          Admin Portal
        </span>
        <span class="text-[9.5px] sm:text-xs font-bold text-amber-700 tracking-wide uppercase leading-tight mt-0.5 whitespace-nowrap">
          UCMS Khanewal
        </span>
      </div>
    </a>

    <!-- Zone 2: Strictly 5 Menus in Desktop Navbar -->
    <nav class="hidden lg:flex items-center gap-1 xl:gap-1.5 bg-slate-100/90 p-1 rounded-xl border border-slate-200 shrink-0">
      
      <!-- Menu 1: Users -->
      <button type="button" onclick="switchAdminTab('users')" id="tab-btn-users" class="admin-tab-btn inline-flex items-center gap-1.5 px-2.5 xl:px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap bg-blue-900 text-white shadow-xs font-black">
        <svg class="w-3.5 h-3.5 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
        <span>Users</span>
      </button>

      <!-- Menu 2: Timetable -->
      <button type="button" onclick="switchAdminTab('timetable')" id="tab-btn-timetable" class="admin-tab-btn inline-flex items-center gap-1.5 px-2.5 xl:px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap text-slate-700 hover:text-blue-950 hover:bg-white/80">
        <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
        <span>Timetable</span>
      </button>

      <!-- Menu 3: Notices & Inquiries -->
      <button type="button" onclick="switchAdminTab('notices')" id="tab-btn-notices" class="admin-tab-btn inline-flex items-center gap-1.5 px-2.5 xl:px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap text-slate-700 hover:text-blue-950 hover:bg-white/80">
        <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
        <span>Notices & Inquiries</span>
        <?php if ($adminPendingCount > 0): ?>
          <span class="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-red-500 text-white animate-pulse"><?= $adminPendingCount; ?></span>
        <?php endif; ?>
      </button>

      <!-- Menu 4: Website CMS -->
      <button type="button" onclick="switchAdminTab('cms')" id="tab-btn-cms" class="admin-tab-btn inline-flex items-center gap-1.5 px-2.5 xl:px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap text-slate-700 hover:text-blue-950 hover:bg-white/80">
        <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
        <span>Website CMS</span>
      </button>

      <!-- Menu 5: Audit Trail (First-class top level menu) -->
      <button type="button" onclick="switchAdminTab('audit')" id="tab-btn-audit" class="admin-tab-btn inline-flex items-center gap-1.5 px-2.5 xl:px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap text-slate-700 hover:text-blue-950 hover:bg-white/80">
        <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
        <span>Audit Trail</span>
      </button>

    </nav>

    <!-- Zone 3: Profile Capsule & Sign Out -->
    <div class="flex items-center gap-2 sm:gap-3.5 shrink-0">
      <button type="button" onclick="openAdminProfileModal()" class="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 bg-slate-100/90 hover:bg-slate-200/90 rounded-xl border border-slate-200 transition-colors text-left cursor-pointer group shadow-2xs">
        <div class="w-8 h-8 rounded-full border border-[#800020] overflow-hidden bg-white shrink-0 flex items-center justify-center">
          <img src="<?= htmlspecialchars($user['avatar_url'] ?? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80'); ?>" class="w-full h-full object-cover">
        </div>
        <div class="hidden sm:flex flex-col text-left">
          <span class="text-xs font-black text-slate-900 group-hover:text-[#800020] truncate max-w-[140px] leading-tight"><?= htmlspecialchars($user['full_name']); ?></span>
          <span class="text-[10px] text-slate-500 font-mono leading-tight">Chief Registrar</span>
        </div>
        <span class="hidden md:inline-block px-1.5 py-0.5 bg-[#800020] text-amber-300 rounded text-[9px] font-extrabold uppercase tracking-wide">Admin</span>
      </button>

      <a href="logout.php" aria-label="Sign Out" class="w-9 h-9 rounded-xl border border-slate-200 bg-slate-50 hover:bg-red-50 hover:border-red-200 text-slate-600 hover:text-red-700 flex items-center justify-center transition-all cursor-pointer shadow-2xs" title="Sign Out">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
      </a>

      <button type="button" onclick="toggleAdminDrawer()" class="lg:hidden p-1.5 sm:p-2 text-slate-700 hover:text-[#800020] hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer shrink-0">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
      </button>
    </div>
  </header>

  <!-- Mobile Drawer -->
  <div id="admin-mobile-drawer" class="lg:hidden hidden bg-white border-b border-slate-200 shadow-xl px-5 py-4 space-y-2">
    <button onclick="switchAdminTab('users'); toggleAdminDrawer();" class="w-full text-left px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100 rounded-lg">Users Directory</button>
    <button onclick="switchAdminTab('timetable'); toggleAdminDrawer();" class="w-full text-left px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100 rounded-lg">Master Timetable</button>
    <button onclick="switchAdminTab('notices'); toggleAdminDrawer();" class="w-full text-left px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100 rounded-lg">Notices & Inquiries (<?= $adminPendingCount; ?>)</button>
    <button onclick="switchAdminTab('cms'); toggleAdminDrawer();" class="w-full text-left px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100 rounded-lg">Website CMS</button>
    <button onclick="switchAdminTab('audit'); toggleAdminDrawer();" class="w-full text-left px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100 rounded-lg">Audit Trail</button>
    <div class="pt-2 border-t border-slate-100">
      <a href="logout.php" class="block w-full py-2 text-xs font-bold bg-red-50 text-red-700 rounded-lg text-center">Sign Out</a>
    </div>
  </div>

  <!-- =========================================================================
       MAIN ADMINISTRATIVE WORKSPACE
       ========================================================================= -->
  <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

    <!-- TOP ADMIN WELCOME BANNER -->
    <div class="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div class="flex items-start sm:items-center gap-4">
          <div class="relative shrink-0">
            <img src="<?= htmlspecialchars($user['avatar_url'] ?? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80'); ?>" alt="Admin Portrait" class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[#800020] shadow-sm">
            <div class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-purple-600 border-2 border-white flex items-center justify-center">
              <span class="w-2 h-2 rounded-full bg-white"></span>
            </div>
          </div>
          <div class="space-y-1.5 min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-red-50 text-[#800020] border border-red-200">
                CHIEF REGISTRAR & INSTITUTIONAL GOVERNANCE
              </span>
              <span class="text-[11px] font-bold text-slate-500 font-mono">Principal Registry & Executive Secretariat</span>
            </div>
            <h1 class="text-xl sm:text-2xl lg:text-3xl font-black text-blue-950 tracking-tight">
              Welcome back, <?= htmlspecialchars($user['full_name']); ?>
            </h1>
            <p class="text-xs sm:text-sm text-slate-600">
              Institutional ID: <strong class="font-mono text-blue-950"><?= htmlspecialchars($user['institutional_id'] ?? 'UCMS-ADM-001'); ?></strong> · Session: <strong>Spring 2025</strong>
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2.5 shrink-0">
          <span class="px-3 py-1.5 rounded-full bg-purple-50 text-purple-900 border border-purple-200 text-xs font-bold">
            🛡️ Super Admin Authorized
          </span>
          <span class="text-xs font-mono font-bold text-slate-400">
            <?= date('d M Y'); ?> · PKT
          </span>
        </div>
      </div>
    </div>

    <!-- =========================================================================
         TAB 1: USERS DIRECTORY (WITH MULTI-DIMENSIONAL FILTERS)
         ========================================================================= -->
    <div id="admin-tab-users" class="admin-tab-content space-y-5">
      <div class="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        
        <!-- Header & Action -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <span class="text-[11px] font-black uppercase tracking-wider text-blue-600 block mb-0.5">CAMPUS IDENTITY REGISTRY & ACCESS GOVERNANCE</span>
            <h2 class="text-2xl font-black text-slate-900 tracking-tight">User Management Directory</h2>
            <p class="text-xs text-slate-500 mt-0.5">Hierarchical directory of students, faculty instructors, department chairs, and administrators.</p>
          </div>
        </div>

        <!-- View Mode Switcher: Users Directory | Academic Cohort Semester Promotion | Department Overview -->
        <div class="flex flex-wrap items-center justify-between gap-3 bg-[#f8fafc] p-2.5 rounded-2xl border border-slate-200">
          <div class="flex flex-wrap items-center gap-2">
            <button type="button" onclick="switchUserViewMode('roster')" id="user-view-btn-roster" class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer bg-blue-900 text-white shadow-xs font-black">
              <span>Users Directory (<?= count($allUsers); ?>)</span>
            </button>
            <button type="button" onclick="switchUserViewMode('cohort')" id="user-view-btn-cohort" class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer bg-white text-slate-700 border border-slate-200 hover:bg-slate-100">
              <span>🎓 Cohort Semester Promotion Engine</span>
            </button>
            <button type="button" onclick="switchUserViewMode('departments')" id="user-view-btn-departments" class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer bg-white text-slate-700 border border-slate-200 hover:bg-slate-100">
              <span>🏢 Department Overview (<?= count($departments); ?>)</span>
            </button>
          </div>
          <span class="text-[11px] font-bold text-slate-400 font-mono hidden md:inline">Access & Academic Life-Cycle</span>
        </div>

        <!-- SUBVIEW 1: USERS DIRECTORY ROSTER WITH 4-WAY SEARCH & FILTERS -->
        <div id="user-subview-roster" class="space-y-4">
          
          <!-- Filter Box: Department-wise, Semester-wise, Role-wise, and Status-wise -->
          <div class="bg-[#f8fafc] border border-slate-200 rounded-2xl p-4 space-y-3">
            
            <!-- Row 1: Search Query + Role Pills -->
            <div class="flex flex-col lg:flex-row lg:items-center gap-3">
              <div class="relative flex-1">
                <input type="text" id="user-search-input" onkeyup="filterUsersDirectory()" placeholder="Search across Name, Roll Number, Email, or Department..." class="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-blue-900 font-medium text-slate-800">
              </div>

              <!-- Role Filter Pills -->
              <div class="flex items-center gap-1.5 overflow-x-auto shrink-0">
                <button type="button" onclick="setRoleFilter('all')" id="role-pill-all" class="role-pill px-3 py-1.5 rounded-xl text-xs font-bold transition-all bg-blue-900 text-white font-black shadow-xs">All Accounts</button>
                <button type="button" onclick="setRoleFilter('hod')" id="role-pill-hod" class="role-pill px-3 py-1.5 rounded-xl text-xs font-bold transition-all bg-white border border-slate-200 text-slate-600 hover:bg-slate-100">HODs</button>
                <button type="button" onclick="setRoleFilter('teacher')" id="role-pill-teacher" class="role-pill px-3 py-1.5 rounded-xl text-xs font-bold transition-all bg-white border border-slate-200 text-slate-600 hover:bg-slate-100">Faculty</button>
                <button type="button" onclick="setRoleFilter('student')" id="role-pill-student" class="role-pill px-3 py-1.5 rounded-xl text-xs font-bold transition-all bg-white border border-slate-200 text-slate-600 hover:bg-slate-100">Students</button>
                <button type="button" onclick="setRoleFilter('admin')" id="role-pill-admin" class="role-pill px-3 py-1.5 rounded-xl text-xs font-bold transition-all bg-white border border-slate-200 text-slate-600 hover:bg-slate-100">Admins</button>
              </div>
            </div>

            <!-- Row 2: Department, Semester (1-8), and Status -->
            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2.5 border-t border-slate-200/60">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 max-w-3xl">
                
                <!-- Department Filter -->
                <div class="flex items-center gap-1.5 bg-white p-2 rounded-xl border border-slate-200">
                  <span class="text-xs font-bold text-slate-700 shrink-0">Department:</span>
                  <select id="user-dept-select" onchange="filterUsersDirectory()" class="w-full text-xs font-bold text-slate-800 bg-transparent border-0 focus:outline-none cursor-pointer">
                    <option value="0">All Academic Departments</option>
                    <?php foreach ($departments as $d): ?>
                      <option value="<?= $d['id']; ?>"><?= htmlspecialchars($d['name']); ?> (<?= $d['code']; ?>)</option>
                    <?php endforeach; ?>
                  </select>
                </div>

                <!-- Semester Filter (All 8 Semesters) -->
                <div class="flex items-center gap-1.5 bg-white p-2 rounded-xl border border-slate-200">
                  <span class="text-xs font-bold text-slate-700 shrink-0">Semester:</span>
                  <select id="user-sem-select" onchange="filterUsersDirectory()" class="w-full text-xs font-bold text-slate-800 bg-transparent border-0 focus:outline-none cursor-pointer">
                    <option value="0">All Semesters (1 - 8)</option>
                    <option value="1">Semester 1</option>
                    <option value="2">Semester 2</option>
                    <option value="3">Semester 3</option>
                    <option value="4">Semester 4</option>
                    <option value="5">Semester 5</option>
                    <option value="6">Semester 6</option>
                    <option value="7">Semester 7</option>
                    <option value="8">Semester 8 (Graduating Batch)</option>
                  </select>
                </div>

              </div>

              <!-- Status Filter -->
              <div class="flex items-center gap-1 shrink-0">
                <span class="text-xs font-bold text-slate-600 mr-1">Status:</span>
                <button type="button" onclick="setStatusFilter('all')" id="status-btn-all" class="status-btn px-2.5 py-1 rounded-lg text-xs font-bold transition-all bg-slate-900 text-white font-black">All</button>
                <button type="button" onclick="setStatusFilter('active')" id="status-btn-active" class="status-btn px-2.5 py-1 rounded-lg text-xs font-bold transition-all text-slate-600 hover:bg-slate-200/60">Active</button>
                <button type="button" onclick="setStatusFilter('suspended')" id="status-btn-suspended" class="status-btn px-2.5 py-1 rounded-lg text-xs font-bold transition-all text-slate-600 hover:bg-slate-200/60">Inactive</button>
                <button type="button" onclick="setStatusFilter('graduated')" id="status-btn-graduated" class="status-btn px-2.5 py-1 rounded-lg text-xs font-bold transition-all text-slate-600 hover:bg-slate-200/60">Graduated</button>
              </div>

            </div>
          </div>

          <!-- Users Table -->
          <div class="border border-slate-200 rounded-2xl overflow-hidden bg-white">
            <table class="w-full text-left text-xs border-collapse" id="users-directory-table">
              <thead class="bg-[#f8fafc] text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th class="py-3 px-4">User Identity</th>
                  <th class="py-3 px-4">Role</th>
                  <th class="py-3 px-4">Department / Cohort</th>
                  <th class="py-3 px-4">Roll / Institutional ID</th>
                  <th class="py-3 px-4">Official Email</th>
                  <th class="py-3 px-4">Lifecycle Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <?php foreach ($allUsers as $u): ?>
                  <tr class="user-row hover:bg-slate-50 transition-colors" 
                      data-role="<?= $u['role']; ?>" 
                      data-dept="<?= $u['department_id'] ?? 0; ?>" 
                      data-sem="<?= $u['semester'] ?? 0; ?>" 
                      data-status="<?= $u['status'] ?? 'active'; ?>"
                      data-text="<?= strtolower(htmlspecialchars($u['full_name'] . ' ' . $u['username'] . ' ' . ($u['roll_number'] ?? '') . ' ' . $u['email'] . ' ' . ($u['department_name'] ?? ''))); ?>">
                    
                    <td class="py-3 px-4 font-bold text-slate-900">
                      <div class="flex items-center gap-2">
                        <div class="w-7 h-7 rounded-full bg-slate-200 overflow-hidden shrink-0">
                          <img src="<?= htmlspecialchars($u['avatar_url'] ?? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'); ?>" class="w-full h-full object-cover">
                        </div>
                        <div>
                          <div class="font-black text-slate-900"><?= htmlspecialchars($u['full_name']); ?></div>
                          <div class="text-[10px] text-slate-400 font-mono">@<?= htmlspecialchars($u['username']); ?></div>
                        </div>
                      </div>
                    </td>

                    <td class="py-3 px-4">
                      <?php if ($u['role'] === 'admin'): ?>
                        <span class="px-2 py-0.5 rounded text-[10px] font-black bg-purple-100 text-purple-900">ADMIN</span>
                      <?php elseif ($u['role'] === 'hod'): ?>
                        <span class="px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-900">HOD CHAIR</span>
                      <?php elseif ($u['role'] === 'teacher'): ?>
                        <span class="px-2 py-0.5 rounded text-[10px] font-black bg-blue-100 text-blue-900">FACULTY</span>
                      <?php else: ?>
                        <span class="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-900">STUDENT</span>
                      <?php endif; ?>
                    </td>

                    <td class="py-3 px-4 font-bold text-slate-700">
                      <?= htmlspecialchars($u['department_name'] ?? 'Central Admin'); ?>
                      <?php if ($u['role'] === 'student' && !empty($u['semester'])): ?>
                        <span class="text-[10px] text-blue-900 font-black block">Semester <?= $u['semester']; ?></span>
                      <?php endif; ?>
                    </td>

                    <td class="py-3 px-4 font-mono font-bold text-blue-900">
                      <?= htmlspecialchars($u['roll_number'] ?? $u['institutional_id'] ?? '—'); ?>
                    </td>

                    <td class="py-3 px-4 font-mono text-slate-600">
                      <?= htmlspecialchars($u['email']); ?>
                    </td>

                    <td class="py-3 px-4">
                      <?php if (($u['status'] ?? 'active') === 'active'): ?>
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">Active</span>
                      <?php elseif (($u['status'] ?? 'active') === 'suspended'): ?>
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-800 border border-red-200">Inactive</span>
                      <?php else: ?>
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">Graduated</span>
                      <?php endif; ?>
                    </td>

                  </tr>
                <?php endforeach; ?>
              </tbody>
            </table>
          </div>

        </div>

        <!-- SUBVIEW 2: COHORT SEMESTER PROMOTION ENGINE -->
        <div id="user-subview-cohort" class="hidden space-y-5">
          <div class="bg-[#f8fafc] rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 class="font-black text-lg text-blue-950">Academic Cohort Semester Promotion Engine</h3>
            <p class="text-xs text-slate-600">Batch advance enrolled student cohorts between semesters (Semester 1 through 8) or confer degrees to graduating batches.</p>
            
            <form method="GET" action="index.php" class="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-slate-200">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Department</label>
                <select name="dept_id" class="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg font-bold">
                  <?php foreach ($departments as $d): ?>
                    <option value="<?= $d['id']; ?>" <?= $selectedDept == $d['id'] ? 'selected' : ''; ?>><?= htmlspecialchars($d['name']); ?></option>
                  <?php endforeach; ?>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Active Semester</label>
                <select name="semester" class="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg font-bold">
                  <?php for ($s = 1; $s <= 8; $s++): ?>
                    <option value="<?= $s; ?>" <?= $selectedSem == $s ? 'selected' : ''; ?>>Semester <?= $s; ?> <?= $s == 8 ? '(Graduating Class)' : ''; ?></option>
                  <?php endfor; ?>
                </select>
              </div>
              <div class="flex items-end">
                <button type="submit" class="w-full py-2 bg-blue-900 text-white font-bold text-xs rounded-lg">Load Cohort (<?= count($cohortStudents); ?> Enrolled)</button>
              </div>
            </form>

            <div class="flex justify-end pt-2">
              <form action="actions.php" method="POST">
                <input type="hidden" name="action" value="promote_cohort">
                <input type="hidden" name="department_id" value="<?= $selectedDept; ?>">
                <input type="hidden" name="semester" value="<?= $selectedSem; ?>">
                <?php if ($selectedSem < 8): ?>
                  <button type="submit" class="px-5 py-2.5 bg-blue-900 text-white font-bold text-xs rounded-xl shadow-xs" onclick="return confirm('Promote all <?= count($cohortStudents); ?> students to Semester <?= $selectedSem + 1; ?>?')">
                    Promote Entire Cohort to Semester <?= $selectedSem + 1; ?> →
                  </button>
                <?php else: ?>
                  <button type="submit" name="action_type" value="graduate" class="px-5 py-2.5 bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs" onclick="return confirm('Confer degrees on all <?= count($cohortStudents); ?> Semester 8 scholars?')">
                    Graduate Entire Cohort (Confer Degrees to Alumni) ✓
                  </button>
                <?php endif; ?>
              </form>
            </div>
          </div>
        </div>

        <!-- SUBVIEW 3: DEPARTMENT OVERVIEW -->
        <div id="user-subview-departments" class="hidden space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <?php foreach ($departments as $d): ?>
              <?php 
                $countFaculty = count(array_filter($allUsers, fn($u) => ($u['department_id'] ?? 0) == $d['id'] && $u['role'] === 'teacher'));
                $hod = current(array_filter($allUsers, fn($u) => ($u['department_id'] ?? 0) == $d['id'] && $u['role'] === 'hod'));
              ?>
              <div class="p-5 rounded-2xl border border-slate-200 bg-[#f8fafc] space-y-3">
                <span class="px-2.5 py-1 rounded bg-blue-100 text-blue-900 font-mono font-black text-xs"><?= $d['code']; ?></span>
                <h4 class="font-extrabold text-slate-900 text-sm"><?= htmlspecialchars($d['name']); ?></h4>
                <div class="text-[11px] text-slate-500">HOD: <strong><?= htmlspecialchars($hod['full_name'] ?? 'Department Chair'); ?></strong></div>
                <div class="pt-2 border-t border-slate-200/60 text-xs font-bold text-blue-950"><?= $countFaculty ?: 8; ?> Faculty Members</div>
              </div>
            <?php endforeach; ?>
          </div>
        </div>

      </div>
    </div>

    <!-- =========================================================================
         TAB 2: MASTER TIMETABLE OVERSIGHT
         ========================================================================= -->
    <div id="admin-tab-timetable" class="admin-tab-content hidden space-y-5">
      <div class="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div class="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h2 class="text-xl font-black text-blue-950">Master University Timetable Oversight</h2>
            <p class="text-xs text-slate-500">Global institutional lecture schedule across all 7 departments with room allocations.</p>
          </div>
          <span class="px-3 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-900 border border-blue-200">
            <?= count($allTimetables); ?> Total Slots
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="bg-[#f8fafc] text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th class="py-3 px-4">Day</th>
                <th class="py-3 px-4">Time Slot</th>
                <th class="py-3 px-4">Department</th>
                <th class="py-3 px-4">Course</th>
                <th class="py-3 px-4">Instructor</th>
                <th class="py-3 px-4">Room</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <?php foreach ($allTimetables as $slot): ?>
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="py-3 px-4 font-black text-blue-900"><?= $slot['day_of_week']; ?></td>
                  <td class="py-3 px-4 font-mono font-bold text-slate-700"><?= $slot['timeslot']; ?></td>
                  <td class="py-3 px-4 font-bold text-slate-600"><?= htmlspecialchars($slot['dept_code'] ?? 'CS'); ?></td>
                  <td class="py-3 px-4 font-bold text-slate-900"><?= htmlspecialchars($slot['course_code']); ?> - <?= htmlspecialchars($slot['course_title']); ?></td>
                  <td class="py-3 px-4 text-slate-600"><?= htmlspecialchars($slot['instructor_name'] ?? 'Faculty Staff'); ?></td>
                  <td class="py-3 px-4 font-mono font-bold text-amber-800"><?= htmlspecialchars($slot['room'] ?? 'Lab 2'); ?></td>
                </tr>
              <?php endforeach; ?>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- =========================================================================
         TAB 3: NOTICES & INQUIRIES HUB (CAMPUS INQUIRIES + BROADCAST NOTICES)
         ========================================================================= -->
    <div id="admin-tab-notices" class="admin-tab-content hidden space-y-5">
      <div class="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        
        <div class="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h2 class="text-xl font-black text-blue-950">Notices & Student Inquiries Hub</h2>
            <p class="text-xs text-slate-500">Central Inquiries Desk for resolving timetable & handout issues, plus campus broadcast publisher.</p>
          </div>
          <span class="px-3 py-1 rounded-full text-xs font-black bg-red-50 text-red-700 border border-red-200">
            <?= $adminPendingCount; ?> Pending Inquiries
          </span>
        </div>

        <!-- Student Inquiries Desk -->
        <div class="space-y-4">
          <h3 class="font-black text-base text-blue-950">Campus Student Inquiries Desk</h3>
          <div class="space-y-3">
            <?php foreach ($allStudentReports as $rep): ?>
              <div class="p-4 rounded-2xl border border-slate-200 bg-[#f8fafc] space-y-2">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <div class="flex items-center gap-2">
                    <span class="font-black text-xs text-blue-950"><?= htmlspecialchars($rep['student_name']); ?></span>
                    <span class="text-slate-400 font-mono text-[10px]">(<?= htmlspecialchars($rep['roll_number']); ?>)</span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-black bg-blue-100 text-blue-900"><?= htmlspecialchars($rep['category']); ?></span>
                  </div>
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold <?= $rep['status'] === 'Resolved' ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'; ?>"><?= $rep['status']; ?></span>
                </div>
                <div class="text-xs font-bold text-slate-800"><?= htmlspecialchars($rep['subject']); ?></div>
                <p class="text-xs text-slate-600 leading-relaxed"><?= htmlspecialchars($rep['description']); ?></p>
              </div>
            <?php endforeach; ?>
          </div>
        </div>

      </div>
    </div>

    <!-- =========================================================================
         TAB 4: WEBSITE CMS (PUBLIC SITE CONTENT MANAGEMENT)
         ========================================================================= -->
    <div id="admin-tab-cms" class="admin-tab-content hidden space-y-5">
      <div class="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div class="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h2 class="text-xl font-black text-blue-950">UCMS Public Website Content Management</h2>
            <p class="text-xs text-slate-500">Live configuration for homepage metrics, admissions calendar, program catalogs, and contact details.</p>
          </div>
          <span class="px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
            Public Site Active
          </span>
        </div>

        <form action="actions.php" method="POST" class="space-y-4 text-xs font-medium">
          <input type="hidden" name="action" value="save_cms">
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-slate-700 font-bold mb-1">Campus Students Metric</label>
              <input type="text" name="stat_students" value="<?= htmlspecialchars($cms['stat_students'] ?? '3,500+'); ?>" class="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl">
            </div>
            <div>
              <label class="block text-slate-700 font-bold mb-1">Accredited Faculty Metric</label>
              <input type="text" name="stat_faculty" value="<?= htmlspecialchars($cms['stat_faculty'] ?? '120+'); ?>" class="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl">
            </div>
            <div>
              <label class="block text-slate-700 font-bold mb-1">Degree Programs Metric</label>
              <input type="text" name="stat_programs" value="<?= htmlspecialchars($cms['stat_programs'] ?? '24+'); ?>" class="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl">
            </div>
            <div>
              <label class="block text-slate-700 font-bold mb-1">Graduation Rate Metric</label>
              <input type="text" name="stat_alumni" value="<?= htmlspecialchars($cms['stat_alumni'] ?? '96%'); ?>" class="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl">
            </div>
          </div>

          <div class="flex justify-end pt-2">
            <button type="submit" class="px-5 py-2.5 bg-blue-900 text-white font-bold text-xs rounded-xl shadow-xs">Publish CMS Updates Live →</button>
          </div>
        </form>
      </div>
    </div>

    <!-- =========================================================================
         TAB 5: AUDIT TRAIL (STANDALONE SECURITY LOGS)
         ========================================================================= -->
    <div id="admin-tab-audit" class="admin-tab-content hidden space-y-5">
      <div class="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div class="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h2 class="text-xl font-black text-blue-950">Administrative Audit & Security Trail</h2>
            <p class="text-xs text-slate-500">Tamper-evident logs of administrative actions, credential updates, and academic promotions.</p>
          </div>
          <span class="text-xs font-mono font-bold text-slate-500"><?= count($auditLogs); ?> Immutable Records · PKT (UTC+5)</span>
        </div>

        <div class="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
          <?php foreach ($auditLogs as $log): ?>
            <div class="p-3.5 rounded-xl border border-slate-200 bg-[#f8fafc] hover:bg-white transition-colors text-xs space-y-1.5">
              <div class="flex items-center justify-between font-bold">
                <span class="font-mono text-blue-950 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-[11px]"><?= htmlspecialchars($log['action']); ?></span>
                <span class="text-[10px] text-slate-400 font-mono"><?= $log['created_at']; ?> PKT</span>
              </div>
              <p class="text-slate-700 leading-snug"><?= htmlspecialchars($log['details']); ?></p>
              <div class="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 font-medium">
                <span>Actor: <strong class="text-slate-600"><?= htmlspecialchars($log['full_name'] ?? 'System Identity'); ?></strong></span>
                <span class="font-mono">IP: <?= htmlspecialchars($log['ip_address'] ?? '127.0.0.1'); ?></span>
              </div>
            </div>
          <?php endforeach; ?>
        </div>
      </div>
    </div>

  </main>

  <!-- MODAL: ADMIN PROFILE -->
  <div id="admin-profile-modal" class="fixed inset-0 z-50 hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
    <div class="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 text-xs">
      <div class="flex items-center justify-between pb-3 border-b border-slate-200">
        <h3 class="font-black text-slate-900 text-sm">Master Administrator Profile</h3>
        <button type="button" onclick="closeAdminProfileModal()" class="text-slate-400 hover:text-slate-600">✕</button>
      </div>
      <div class="space-y-2">
        <div>Name: <strong><?= htmlspecialchars($user['full_name']); ?></strong></div>
        <div>Role: <strong>Chief Registrar & Super Admin</strong></div>
        <div>ID: <strong class="font-mono"><?= htmlspecialchars($user['institutional_id'] ?? 'UCMS-ADM-001'); ?></strong></div>
      </div>
    </div>
  </div>

  <!-- =========================================================================
       PURE VANILLA JAVASCRIPT FOR ADMIN TABS & FILTERS
       ========================================================================= -->
  <script>
    function switchAdminTab(tabId) {
      document.querySelectorAll('.admin-tab-content').forEach(el => el.classList.add('hidden'));
      const activeContent = document.getElementById('admin-tab-' + tabId);
      if (activeContent) activeContent.classList.remove('hidden');

      document.querySelectorAll('.admin-tab-btn').forEach(btn => {
        btn.classList.remove('bg-blue-900', 'text-white', 'shadow-xs', 'font-black');
        btn.classList.add('text-slate-700', 'hover:text-blue-950', 'hover:bg-white/80');
      });
      const activeBtn = document.getElementById('tab-btn-' + tabId);
      if (activeBtn) {
        activeBtn.classList.remove('text-slate-700', 'hover:text-blue-950', 'hover:bg-white/80');
        activeBtn.classList.add('bg-blue-900', 'text-white', 'shadow-xs', 'font-black');
      }
    }

    function toggleAdminDrawer() {
      document.getElementById('admin-mobile-drawer').classList.toggle('hidden');
    }

    function switchUserViewMode(mode) {
      document.getElementById('user-subview-roster').classList.add('hidden');
      document.getElementById('user-subview-cohort').classList.add('hidden');
      document.getElementById('user-subview-departments').classList.add('hidden');
      document.getElementById('user-subview-' + mode).classList.remove('hidden');

      ['roster', 'cohort', 'departments'].forEach(m => {
        const b = document.getElementById('user-view-btn-' + m);
        b.className = (m === mode) 
          ? 'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer bg-blue-900 text-white shadow-xs font-black'
          : 'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer bg-white text-slate-700 border border-slate-200 hover:bg-slate-100';
      });
    }

    let activeRole = 'all';
    let activeStatus = 'all';

    function setRoleFilter(r) {
      activeRole = r;
      document.querySelectorAll('.role-pill').forEach(p => {
        p.className = 'role-pill px-3 py-1.5 rounded-xl text-xs font-bold transition-all bg-white border border-slate-200 text-slate-600 hover:bg-slate-100';
      });
      document.getElementById('role-pill-' + r).className = 'role-pill px-3 py-1.5 rounded-xl text-xs font-bold transition-all bg-blue-900 text-white font-black shadow-xs';
      filterUsersDirectory();
    }

    function setStatusFilter(s) {
      activeStatus = s;
      document.querySelectorAll('.status-btn').forEach(b => {
        b.className = 'status-btn px-2.5 py-1 rounded-lg text-xs font-bold transition-all text-slate-600 hover:bg-slate-200/60';
      });
      document.getElementById('status-btn-' + s).className = 'status-btn px-2.5 py-1 rounded-lg text-xs font-bold transition-all bg-slate-900 text-white font-black';
      filterUsersDirectory();
    }

    function filterUsersDirectory() {
      const q = document.getElementById('user-search-input').value.toLowerCase().trim();
      const dept = parseInt(document.getElementById('user-dept-select').value);
      const sem = parseInt(document.getElementById('user-sem-select').value);

      document.querySelectorAll('.user-row').forEach(row => {
        const rRole = row.getAttribute('data-role');
        const rDept = parseInt(row.getAttribute('data-dept'));
        const rSem = parseInt(row.getAttribute('data-sem'));
        const rStatus = row.getAttribute('data-status');
        const rText = row.getAttribute('data-text');

        let show = true;
        if (activeRole !== 'all' && rRole !== activeRole) show = false;
        if (dept > 0 && rDept !== dept) show = false;
        if (sem > 0 && rSem !== sem) show = false;
        if (activeStatus !== 'all' && rStatus !== activeStatus) show = false;
        if (q && !rText.includes(q)) show = false;

        row.style.display = show ? '' : 'none';
      });
    }

    function openAdminProfileModal() {
      document.getElementById('admin-profile-modal').classList.remove('hidden');
    }
    function closeAdminProfileModal() {
      document.getElementById('admin-profile-modal').classList.add('hidden');
    }
  </script>

</body>
</html>
