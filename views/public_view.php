<?php
/**
 * UCMS Public Homepage & Central Institutional Login Gateway
 * Institution: University College of Management and Sciences (UCMS), Khanewal
 * Pure HTML5, CSS3, Vanilla JS, PHP 8.x PDO & MySQL
 */
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>UCMS Institutional Gateway | University College of Management and Sciences Khanewal</title>
  <link rel="stylesheet" href="css/tailwind.css">
  <link rel="stylesheet" href="css/style.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap" rel="stylesheet">
  <link rel="icon" type="image/png" href="assets/aistudio/logo_c68140aa.png">
</head>
<body class="ucms-solid-bg">

  <!-- =========================================================================
       STICKY TOP HEADER (64px, 5 Menus: Home, Admissions, Programs, Faculty, Contact Us)
       ========================================================================= -->
  <header class="ucms-header">
    <!-- Zone 1: Official UCMS Brand Lockup -->
    <a href="#home" class="ucms-brand-lockup">
      <div style="width:56px; height:56px; border-radius:50%; border:2px solid #800020; padding:1px; background:#fff; display:flex; align-items:center; justify-content:center; overflow:hidden;">
        <img src="assets/aistudio/logo_c68140aa.png" onerror="this.src='logo.png'" alt="UCMS Seal" style="width:100%; height:100%; object-fit:contain;">
      </div>
      <div class="ucms-brand-text">
        <span class="ucms-brand-title" style="color:#800020;">UCMS KHANEWAL</span>
        <span class="ucms-brand-sub" style="color:#b45309;">University College of Management and Sciences</span>
      </div>
    </a>

    <!-- Zone 2: 5 Navigation Menus -->
    <nav class="ucms-nav-desktop">
      <a href="#home" class="ucms-nav-link active">Home</a>
      <a href="#admissions-calendar" class="ucms-nav-link">Admissions</a>
      <a href="#academic-programs" class="ucms-nav-link">Programs</a>
      <a href="#faculty-overview" class="ucms-nav-link">Faculty</a>
      <a href="#contact-us" class="ucms-nav-link">Contact Us</a>
    </nav>

    <!-- Zone 3: Primary Action & Hamburger -->
    <div class="ucms-header-action">
      <a href="#portal-login-card" class="ucms-btn ucms-btn-primary" style="background:#1e3a8a;">Portal Login →</a>
      <button class="ucms-hamburger" id="ucms-hamburger-btn" aria-label="Toggle Navigation">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
  </header>

  <!-- Mobile Drawer -->
  <div class="ucms-mobile-drawer" id="ucms-mobile-drawer">
    <a href="#home" class="ucms-nav-link">Home</a>
    <a href="#admissions-calendar" class="ucms-nav-link">Admissions</a>
    <a href="#academic-programs" class="ucms-nav-link">Programs</a>
    <a href="#faculty-overview" class="ucms-nav-link">Faculty</a>
    <a href="#contact-us" class="ucms-nav-link">Contact Us</a>
    <a href="#portal-login-card" class="ucms-btn ucms-btn-primary" style="width:100%; background:#1e3a8a;">Portal Login →</a>
  </div>

  <!-- =========================================================================
       HERO SECTION WITH 30% CAMPUS BACKGROUND
       ========================================================================= -->
  <div id="home" class="ucms-campus-bg" style="border-bottom:1px solid #e2e8f0; min-height:calc(100vh - 64px); display:flex; align-items:center;">
    <main class="ucms-container" style="width:100%;">
      <div class="ucms-hero-split" style="gap:2.5rem; align-items:center;">
        
        <!-- LEFT COLUMN: INSTITUTIONAL HERITAGE & DIRECT GATEWAYS -->
        <section style="display:flex; flex-direction:column; gap:1.25rem;">
          
          <div>
            <span style="display:inline-flex; align-items:center; gap:0.5rem; background:#ffffff; color:#1e3a8a; border:1px solid #cbd5e1; font-size:0.75rem; font-weight:700; padding:0.35rem 0.85rem; border-radius:9999px; box-shadow:0 1px 2px rgba(0,0,0,0.05);">
              <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#d97706;"></span>
              Registered Higher Education Institution - Khanewal Campus
            </span>
          </div>

          <div>
            <div style="display:flex; align-items:center; gap:0.875rem; margin-bottom:0.75rem;">
              <div style="width:76px; height:76px; border-radius:50%; border:3px solid #800020; padding:2px; background:#fff; overflow:hidden; flex-shrink:0;">
                <img src="assets/aistudio/logo_c68140aa.png" onerror="this.src='logo.png'" alt="UCMS Seal" style="width:100%; height:100%; object-fit:contain;">
              </div>
              <div>
                <span style="font-size:0.75rem; font-weight:800; color:#800020; text-transform:uppercase; letter-spacing:0.04em; display:block;">
                  University College of Management and Sciences
                </span>
                <span style="font-size:0.875rem; font-weight:700; color:#d97706;">
                  Khanewal Campus · Learning Today for a Better Tomorrow
                </span>
              </div>
            </div>

            <h1 style="font-size: clamp(2rem, 3.2vw, 2.75rem); font-weight: 900; color:#1e3a8a; line-height: 1.15; letter-spacing: -0.025em; text-wrap: balance;">
              UCMS Academic Repository & Management System
            </h1>
          </div>

          <p style="font-size: 0.95rem; color: #475569; max-width: 620px; line-height: 1.6;">
            Official centralized academic repository and institutional management system of UCMS Khanewal. Access authenticated departmental portals, review accredited degree programs, and explore current admission cycles.
          </p>

          <!-- DIRECT INSTITUTIONAL GATEWAYS (24/7 SSO REMOVED) -->
          <div style="background: rgba(255,255,255,0.96); border: 1px solid #cbd5e1; border-radius: 12px; padding: 1.25rem; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.875rem;">
              <span style="font-size:0.75rem; font-weight:800; color:#1e3a8a; text-transform:uppercase; letter-spacing:0.05em;">
                DIRECT INSTITUTIONAL GATEWAYS
              </span>
              <span style="font-size:0.7rem; font-weight:600; color:#64748b;">
                Click any role to select portal
              </span>
            </div>

            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 0.75rem;">
              <!-- Student -->
              <div class="gateway-card" data-role="student" style="cursor:pointer; border:1px solid #cbd5e1; border-radius:8px; padding:0.75rem; text-align:center; background:#ffffff; transition:all 0.15s ease;">
                <div style="font-size:1.35rem; margin-bottom:0.25rem;">🎓</div>
                <div style="font-weight:700; font-size:0.875rem; color:#1e3a8a;">Student Portal</div>
                <div style="font-size:0.7rem; color:#64748b;">Scholars & LMS</div>
              </div>

              <!-- Teacher -->
              <div class="gateway-card" data-role="teacher" style="cursor:pointer; border:1px solid #cbd5e1; border-radius:8px; padding:0.75rem; text-align:center; background:#ffffff; transition:all 0.15s ease;">
                <div style="font-size:1.35rem; margin-bottom:0.25rem;">📚</div>
                <div style="font-weight:700; font-size:0.875rem; color:#1e3a8a;">Teacher Portal</div>
                <div style="font-size:0.7rem; color:#64748b;">Faculty & Lectures</div>
              </div>

              <!-- HOD CS -->
              <div class="gateway-card" data-role="hod" style="cursor:pointer; border:1px solid #cbd5e1; border-radius:8px; padding:0.75rem; text-align:center; background:#ffffff; transition:all 0.15s ease;">
                <div style="font-size:1.35rem; margin-bottom:0.25rem;">🏛</div>
                <div style="font-weight:700; font-size:0.875rem; color:#1e3a8a;">HOD CS Console</div>
                <div style="font-size:0.7rem; color:#64748b;">CS Chair Authority</div>
              </div>

              <!-- Admin -->
              <div class="gateway-card" data-role="admin" style="cursor:pointer; border:1px solid #cbd5e1; border-radius:8px; padding:0.75rem; text-align:center; background:#ffffff; transition:all 0.15s ease;">
                <div style="font-size:1.35rem; margin-bottom:0.25rem;">⚙️</div>
                <div style="font-weight:700; font-size:0.875rem; color:#1e3a8a;">Master Admin</div>
                <div style="font-size:0.7rem; color:#64748b;">Registrar Office</div>
              </div>
            </div>
          </div>

          <!-- Trust Badges -->
          <div style="display:flex; flex-wrap:wrap; gap:1.5rem; font-size:0.8125rem; font-weight:700; color:#475569;">
            <span>✓ Merit-Based Higher Education</span>
            <span>✓ Continuous Cohort Progression</span>
            <span>✓ Dedicated Career Placement Directorate</span>
          </div>

        </section>

        <!-- RIGHT COLUMN: HERO LOGIN CARD -->
        <section id="portal-login-card">
          <div class="ucms-card" style="box-shadow: 0 12px 32px -4px rgba(30, 58, 138, 0.12); border: 2px solid #cbd5e1; background:#ffffff;">
            
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 1rem;">
              <div>
                <h2 style="font-size:1.2rem; font-weight:900; color:#1e3a8a; letter-spacing:-0.02em;">INSTITUTIONAL PORTAL LOGIN</h2>
                <p style="font-size:0.8125rem; color:#64748b;">Centralized Academic Identity & Secure Access</p>
              </div>
              <span id="active-role-badge" style="background:#1e3a8a; color:#ffffff; font-size:0.7rem; font-weight:800; padding:0.25rem 0.6rem; border-radius:4px; letter-spacing:0.05em;">STUDENT</span>
            </div>

            <!-- Role Tabs -->
            <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap: 0.35rem; background:#f1f5f9; padding:0.25rem; border-radius:8px; margin-bottom:0.75rem;">
              <button type="button" class="role-tab-btn active" data-role="student" style="background:#1e3a8a; color:#fff; border:none; padding:0.5rem 0.25rem; font-size:0.8125rem; font-weight:700; border-radius:6px; cursor:pointer;">Student</button>
              <button type="button" class="role-tab-btn" data-role="teacher" style="background:#f1f5f9; color:#334155; border:none; padding:0.5rem 0.25rem; font-size:0.8125rem; font-weight:700; border-radius:6px; cursor:pointer;">Teacher</button>
              <button type="button" class="role-tab-btn" data-role="hod" style="background:#f1f5f9; color:#334155; border:none; padding:0.5rem 0.25rem; font-size:0.8125rem; font-weight:700; border-radius:6px; cursor:pointer;">HOD</button>
              <button type="button" class="role-tab-btn" data-role="admin" style="background:#f1f5f9; color:#334155; border:none; padding:0.5rem 0.25rem; font-size:0.8125rem; font-weight:700; border-radius:6px; cursor:pointer;">Admin</button>
            </div>

            <!-- Quick Demo Credential Pills -->
            <div style="margin-bottom:1rem; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:0.6rem;">
              <span style="font-size:0.7rem; font-weight:800; color:#64748b; text-transform:uppercase; display:block; margin-bottom:0.4rem;">
                ⚡️ Quick One-Click Fill:
              </span>
              <div style="display:grid; grid-template-columns: 1fr 1fr; gap:0.4rem;">
                <button type="button" class="quick-demo-pill" data-role="student" data-username="shahzaib" style="background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:0.35rem 0.5rem; text-align:left; cursor:pointer; font-size:0.75rem;">
                  <strong style="color:#1e3a8a; display:block;">🎓 Student</strong>
                  <span style="color:#64748b; font-family:'JetBrains Mono',monospace; font-size:0.7rem;">shahzaib</span>
                </button>
                <button type="button" class="quick-demo-pill" data-role="teacher" data-username="dr_amna" style="background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:0.35rem 0.5rem; text-align:left; cursor:pointer; font-size:0.75rem;">
                  <strong style="color:#1e3a8a; display:block;">📚 Faculty</strong>
                  <span style="color:#64748b; font-family:'JetBrains Mono',monospace; font-size:0.7rem;">dr_amna</span>
                </button>
                <button type="button" class="quick-demo-pill" data-role="hod" data-username="hod_cs" style="background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:0.35rem 0.5rem; text-align:left; cursor:pointer; font-size:0.75rem;">
                  <strong style="color:#1e3a8a; display:block;">🏛 HOD CS</strong>
                  <span style="color:#64748b; font-family:'JetBrains Mono',monospace; font-size:0.7rem;">hod_cs</span>
                </button>
                <button type="button" class="quick-demo-pill" data-role="admin" data-username="admin" style="background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:0.35rem 0.5rem; text-align:left; cursor:pointer; font-size:0.75rem;">
                  <strong style="color:#1e3a8a; display:block;">⚙️ Registrar</strong>
                  <span style="color:#64748b; font-family:'JetBrains Mono',monospace; font-size:0.7rem;">admin</span>
                </button>
              </div>
            </div>

            <?php if (isset($_SESSION['login_error'])): ?>
              <div style="background:#fee2e2; border:1px solid #f87171; color:#991b1b; padding:0.75rem; border-radius:8px; font-size:0.8125rem; font-weight:600; margin-bottom:1rem;">
                <?= htmlspecialchars($_SESSION['login_error']); unset($_SESSION['login_error']); ?>
              </div>
            <?php endif; ?>

            <!-- Login Form -->
            <form action="login.php" method="POST" id="portal-login-form">
              <input type="hidden" name="role" id="login-role-input" value="student">

              <div style="margin-bottom:1rem;">
                <label for="login-username" class="ucms-label">Username or Institutional Email</label>
                <input type="text" name="username" id="login-username" class="ucms-input" placeholder="Enter official username (e.g. shahzaib, dr_amna)" value="" required autocomplete="username">
              </div>

              <div style="margin-bottom:1.25rem;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <label for="login-password" class="ucms-label">Password</label>
                  <button type="button" id="toggle-password-btn" style="background:none; border:none; font-size:0.75rem; color:#1e3a8a; font-weight:700; cursor:pointer;">👁 Show</button>
                </div>
                <input type="password" name="password" id="login-password" class="ucms-input" placeholder="Enter security password" value="" required autocomplete="current-password">
              </div>

              <button type="submit" class="ucms-btn ucms-btn-primary" style="width:100%; padding:0.75rem; font-size:0.9375rem; background:#1e3a8a;">
                Sign In to Portal →
              </button>
            </form>


            <p style="font-size:0.75rem; color:#94a3b8; text-align:center; margin-top:0.75rem; line-height:1.4;">
              Accounts are pre-registered by the UCMS Administration. Please use your official institutional credentials.
            </p>

          </div>
        </section>

      </div>
    </main>
  </div>

  <!-- =========================================================================
       SECTION 1: KEY UNIVERSITY METRICS (FACULTIES, SENIOR, ACADEMICS, SEMESTERS)
       ========================================================================= -->
  <section style="padding:4rem 1.5rem; max-width:1400px; margin:0 auto;">
    <div style="text-align:center; max-width:640px; margin:0 auto 2.5rem;">
      <span style="font-size:0.75rem; font-weight:800; color:#800020; text-transform:uppercase; letter-spacing:0.05em; display:block; margin-bottom:0.25rem;">
        UCMS Khanewal At A Glance
      </span>
      <h2 style="font-size:1.85rem; font-weight:900; color:#1e3a8a;">
        Institutional Strength & Academic Scale
      </h2>
      <p style="font-size:0.875rem; color:#64748b; margin-top:0.5rem;">
        Delivering accredited undergraduate education across South Punjab.
      </p>
    </div>

    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap:1.5rem;">
      <!-- Faculties -->
      <div class="ucms-card">
        <div style="font-size:1.75rem; margin-bottom:0.75rem;">🏛</div>
        <span style="font-size:1.75rem; font-weight:900; color:#1e3a8a; display:block;">4 Academic</span>
        <span style="font-size:0.8125rem; font-weight:800; color:#800020; text-transform:uppercase; display:block; margin-top:0.25rem;">
          Specialized Faculties
        </span>
        <p style="font-size:0.8125rem; color:#64748b; margin-top:0.5rem; line-height:1.5;">
          Computer Science & IT, Management Sciences, Basic Sciences, and Allied Health Sciences.
        </p>
      </div>

      <!-- Senior Faculty Members -->
      <div class="ucms-card">
        <div style="font-size:1.75rem; margin-bottom:0.75rem;">👨‍🏫</div>
        <span style="font-size:1.75rem; font-weight:900; color:#1e3a8a; display:block;">48+ Senior</span>
        <span style="font-size:0.8125rem; font-weight:800; color:#800020; text-transform:uppercase; display:block; margin-top:0.25rem;">
          Faculty Academicians
        </span>
        <p style="font-size:0.8125rem; color:#64748b; margin-top:0.5rem; line-height:1.5;">
          Distinguished professors, PhD scholars, and experienced lecturers mentoring every cohort.
        </p>
      </div>

      <!-- Enrolled Scholars -->
      <div class="ucms-card">
        <div style="font-size:1.75rem; margin-bottom:0.75rem;">🎓</div>
        <span style="font-size:1.75rem; font-weight:900; color:#1e3a8a; display:block;">1,200+ Enrolled</span>
        <span style="font-size:0.8125rem; font-weight:800; color:#800020; text-transform:uppercase; display:block; margin-top:0.25rem;">
          Undergraduate Scholars
        </span>
        <p style="font-size:0.8125rem; color:#64748b; margin-top:0.5rem; line-height:1.5;">
          Full-time registered scholars learning on campus with merit scholarships and career focus.
        </p>
      </div>

      <!-- Active Semesters -->
      <div class="ucms-card">
        <div style="font-size:1.75rem; margin-bottom:0.75rem;">📖</div>
        <span style="font-size:1.75rem; font-weight:900; color:#1e3a8a; display:block;">8 Enrolled</span>
        <span style="font-size:0.8125rem; font-weight:800; color:#800020; text-transform:uppercase; display:block; margin-top:0.25rem;">
          Academic Semesters
        </span>
        <p style="font-size:0.8125rem; color:#64748b; margin-top:0.5rem; line-height:1.5;">
          Synchronized 4-year degree milestones with continuous assessment and capstone FYP defense.
        </p>
      </div>
    </div>
  </section>

  <!-- =========================================================================
       SECTION 2: ADMISSIONS & SESSIONS (MATCHING SCREENSHOT EXACTLY)
       ========================================================================= -->
  <section id="admissions-calendar" class="ucms-campus-bg" style="border-top:1px solid #e2e8f0; border-bottom:1px solid #e2e8f0; padding:4rem 1.5rem;">
    <div style="max-width:1400px; margin:0 auto; position:relative; z-index:10;">
      
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap:2rem; align-items:start;">
        
        <!-- LEFT COLUMN: LAST DATE FOR SUBMISSION OF APPLICATION -->
        <div style="background:#ffffff; border:2px solid #d97706; border-radius:24px; padding:2rem; box-shadow:0 4px 16px rgba(0,0,0,0.06); display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:1rem;">
              <span style="display:inline-flex; align-items:center; gap:0.35rem; padding:0.25rem 0.75rem; border-radius:9999px; font-size:0.75rem; font-weight:700; background:#fef3c7; color:#92400e; border:1px solid #f59e0b;">
                ✨ Active Admission Cycle
              </span>
              <span style="font-size:0.7rem; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:0.05em;">
                IMPORTANT NOTICE
              </span>
            </div>

            <h2 style="font-family:'Playfair Display',Georgia,serif; font-size:1.65rem; font-weight:900; color:#1e3a8a; text-transform:uppercase; line-height:1.2; margin-bottom:1.25rem;">
              LAST DATE FOR SUBMISSION OF APPLICATION
            </h2>

            <!-- Gray Inset Details Box -->
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:16px; padding:1.25rem; margin-bottom:1.25rem;">
              <div style="font-family:'JetBrains Mono',monospace; font-weight:700; color:#dc2626; font-size:0.95rem; margin-bottom:0.25rem;">
                Spring 2025 Deadline: January 15, 2025
              </div>
              <div style="font-family:'JetBrains Mono',monospace; font-weight:700; color:#1e293b; font-size:0.875rem; margin-bottom:0.5rem;">
                Fall 2025 Early Applications: Open
              </div>
              <p style="font-size:0.75rem; color:#64748b; line-height:1.5; padding-top:0.5rem; border-top:1px solid #e2e8f0; margin:0;">
                Applications received after 04:00 PM on the cutoff date will be considered in the second merit list subject to seat availability.
              </p>
            </div>

            <!-- Checklist -->
            <div style="display:flex; flex-direction:column; gap:0.65rem; font-size:0.8125rem; color:#334155; margin-bottom:1.5rem;">
              <div style="display:flex; align-items:flex-start; gap:0.5rem;">
                <span style="color:#16a34a; font-weight:800;">✓</span>
                <span>Merit-based scholarships available for applicants with 75%+ marks in Intermediate</span>
              </div>
              <div style="display:flex; align-items:flex-start; gap:0.5rem;">
                <span style="color:#16a34a; font-weight:800;">✓</span>
                <span>Fast-track verification desk operational at Main Campus Admissions Office</span>
              </div>
            </div>
          </div>

          <a href="#contact-us" class="ucms-btn ucms-btn-primary" style="width:100%; padding:0.85rem; font-size:0.875rem; background:#1e3a8a; text-align:center;">
            Submit Inquiry Form →
          </a>
        </div>

        <!-- RIGHT COLUMN: STACKED OFFICIAL SESSIONS & ELIGIBILITY -->
        <div style="display:flex; flex-direction:column; gap:1.5rem;">
          
          <!-- Card 1: Official Admission Sessions (2025) -->
          <div style="background:#ffffff; border:1px solid #cbd5e1; border-radius:24px; padding:1.75rem; box-shadow:0 2px 8px rgba(0,0,0,0.04);">
            <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:1.25rem;">
              <span style="font-size:1.25rem;">📅</span>
              <h3 style="font-family:'Playfair Display',Georgia,serif; font-size:1.35rem; font-weight:900; color:#1e3a8a; margin:0;">
                OFFICIAL ADMISSION SESSIONS (2025)
              </h3>
            </div>

            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap:1rem;">
              <!-- Spring 2025 -->
              <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:14px; padding:1rem; font-size:0.8125rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                  <strong style="color:#1e3a8a; font-size:0.875rem;">Spring 2025 Intake</strong>
                  <span style="background:#dcfce7; color:#166534; font-size:0.65rem; font-weight:800; padding:0.15rem 0.5rem; border-radius:4px; border:1px solid #86efac;">NOW OPEN</span>
                </div>
                <div style="color:#475569; line-height:1.6;">
                  <div><strong>Applications Open:</strong> December 01, 2024</div>
                  <div><strong>Deadline:</strong> January 15, 2025</div>
                  <div><strong>Merit List:</strong> January 18, 2025</div>
                  <div><strong>Classes Begin:</strong> February 03, 2025</div>
                </div>
              </div>

              <!-- Fall 2025 -->
              <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:14px; padding:1rem; font-size:0.8125rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                  <strong style="color:#1e3a8a; font-size:0.875rem;">Fall 2025 Intake</strong>
                  <span style="background:#fef3c7; color:#92400e; font-size:0.65rem; font-weight:800; padding:0.15rem 0.5rem; border-radius:4px; border:1px solid #fcd34d;">PRE-REGISTRATION</span>
                </div>
                <div style="color:#475569; line-height:1.6;">
                  <div><strong>Applications Open:</strong> July 01, 2025</div>
                  <div><strong>Deadline:</strong> August 25, 2025</div>
                  <div><strong>Merit List:</strong> August 28, 2025</div>
                  <div><strong>Classes Begin:</strong> September 15, 2025</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Card 2: Eligibility Criteria & Admission Procedure -->
          <div style="background:#ffffff; border:1px solid #cbd5e1; border-radius:24px; padding:1.75rem; box-shadow:0 2px 8px rgba(0,0,0,0.04);">
            <h3 style="font-family:'Playfair Display',Georgia,serif; font-size:1.35rem; font-weight:900; color:#1e3a8a; margin:0 0 1rem;">
              ELIGIBILITY CRITERIA & ADMISSION PROCEDURE
            </h3>

            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:14px; padding:1rem; margin-bottom:1rem; font-size:0.8125rem;">
              <strong style="color:#0f172a; display:block; margin-bottom:0.25rem;">Undergraduate Eligibility:</strong>
              <p style="color:#475569; line-height:1.5; margin:0;">
                Candidates must possess an Intermediate certificate (FA, F.Sc Pre-Engineering, Pre-Medical, ICS, I.Com, or equivalent qualification) with a minimum of 45% to 50% marks depending on the chosen discipline (50% for BSCS and BSIT; 45% for BBA and BS Commerce).
              </p>
            </div>

            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap:0.75rem;">
              <div style="background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:0.75rem;">
                <div style="font-weight:800; font-size:0.8125rem; color:#1e3a8a;">1. Inquiry</div>
                <div style="font-size:0.7rem; color:#64748b; margin-top:2px;">Submit form or visit campus</div>
              </div>
              <div style="background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:0.75rem;">
                <div style="font-weight:800; font-size:0.8125rem; color:#1e3a8a;">2. Verification</div>
                <div style="font-size:0.7rem; color:#64748b; margin-top:2px;">Provide transcripts & CNIC</div>
              </div>
              <div style="background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:0.75rem;">
                <div style="font-weight:800; font-size:0.8125rem; color:#1e3a8a;">3. Challan</div>
                <div style="font-size:0.7rem; color:#64748b; margin-top:2px;">Pay fee at designated bank</div>
              </div>
              <div style="background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:0.75rem;">
                <div style="font-weight:800; font-size:0.8125rem; color:#1e3a8a;">4. Enrollment</div>
                <div style="font-size:0.7rem; color:#64748b; margin-top:2px;">Receive Roll No & portal ID</div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  </section>
  <!-- =========================================================================
       SECTION 3: ACADEMIC DEGREE PROGRAMS (BSCS, BSIT, BSAI, BS CHEM, BSMLT, BBA)
       ========================================================================= -->
  <section id="academic-programs" style="padding:4rem 1.5rem; max-width:1400px; margin:0 auto;">
    <div style="text-align:center; max-width:640px; margin:0 auto 2.5rem;">
      <span style="font-size:0.75rem; font-weight:800; color:#800020; text-transform:uppercase; letter-spacing:0.05em; display:block; margin-bottom:0.25rem;">
        Undergraduate Curricula
      </span>
      <h2 style="font-size:1.85rem; font-weight:900; color:#1e3a8a;">
        Accredited Academic Degree Programs
      </h2>
      <p style="font-size:0.875rem; color:#64748b; margin-top:0.5rem;">
        4-year degree programs providing hands-on practical skills and scientific foundation.
      </p>
    </div>

    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap:1.5rem;">
      
      <!-- 1. BSCS -->
      <div class="ucms-card" style="display:flex; flex-direction:column; justify-content:space-between;">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <span style="font-family:'JetBrains Mono',monospace; font-size:0.75rem; font-weight:700; color:#1e3a8a; background:#eff6ff; padding:0.2rem 0.5rem; border-radius:4px;">BSCS</span>
            <span style="font-size:0.75rem; color:#64748b;">4 Years · 8 Sem</span>
          </div>
          <h3 style="font-size:1.1rem; font-weight:800; color:#0f172a;">BS Computer Science</h3>
          <span style="font-size:0.75rem; font-weight:700; color:#800020;">Faculty of Computer Science & IT</span>
          <p style="font-size:0.8125rem; color:#475569; margin-top:0.5rem; line-height:1.5;">
            Algorithms, deep machine learning, cloud systems architecture, and scalable software design.
          </p>
        </div>
        <div style="margin-top:1rem; padding-top:0.75rem; border-top:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.75rem; color:#16a34a; font-weight:700;">✓ Admissions Open</span>
          <a href="#contact-us" class="ucms-btn ucms-btn-primary" style="padding:0.4rem 0.8rem; font-size:0.75rem; background:#1e3a8a;">Apply Now →</a>
        </div>
      </div>

      <!-- 2. BSIT -->
      <div class="ucms-card" style="display:flex; flex-direction:column; justify-content:space-between;">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <span style="font-family:'JetBrains Mono',monospace; font-size:0.75rem; font-weight:700; color:#1e3a8a; background:#eff6ff; padding:0.2rem 0.5rem; border-radius:4px;">BSIT</span>
            <span style="font-size:0.75rem; color:#64748b;">4 Years · 8 Sem</span>
          </div>
          <h3 style="font-size:1.1rem; font-weight:800; color:#0f172a;">BS Information Technology</h3>
          <span style="font-size:0.75rem; font-weight:700; color:#800020;">Faculty of Computer Science & IT</span>
          <p style="font-size:0.8125rem; color:#475569; margin-top:0.5rem; line-height:1.5;">
            Enterprise networking, cybersecurity, cloud infrastructure management, and IT administration.
          </p>
        </div>
        <div style="margin-top:1rem; padding-top:0.75rem; border-top:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.75rem; color:#16a34a; font-weight:700;">✓ Admissions Open</span>
          <a href="#contact-us" class="ucms-btn ucms-btn-primary" style="padding:0.4rem 0.8rem; font-size:0.75rem; background:#1e3a8a;">Apply Now →</a>
        </div>
      </div>

      <!-- 3. BSAI -->
      <div class="ucms-card" style="display:flex; flex-direction:column; justify-content:space-between;">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <span style="font-family:'JetBrains Mono',monospace; font-size:0.75rem; font-weight:700; color:#1e3a8a; background:#eff6ff; padding:0.2rem 0.5rem; border-radius:4px;">BSAI</span>
            <span style="font-size:0.75rem; color:#64748b;">4 Years · 8 Sem</span>
          </div>
          <h3 style="font-size:1.1rem; font-weight:800; color:#0f172a;">BS Artificial Intelligence</h3>
          <span style="font-size:0.75rem; font-weight:700; color:#800020;">Faculty of Computer Science & IT</span>
          <p style="font-size:0.8125rem; color:#475569; margin-top:0.5rem; line-height:1.5;">
            Neural computation, computer vision, natural language processing, and autonomous systems.
          </p>
        </div>
        <div style="margin-top:1rem; padding-top:0.75rem; border-top:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.75rem; color:#16a34a; font-weight:700;">✓ Admissions Open</span>
          <a href="#contact-us" class="ucms-btn ucms-btn-primary" style="padding:0.4rem 0.8rem; font-size:0.75rem; background:#1e3a8a;">Apply Now →</a>
        </div>
      </div>

      <!-- 4. BS Chemistry -->
      <div class="ucms-card" style="display:flex; flex-direction:column; justify-content:space-between;">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <span style="font-family:'JetBrains Mono',monospace; font-size:0.75rem; font-weight:700; color:#1e3a8a; background:#eff6ff; padding:0.2rem 0.5rem; border-radius:4px;">BS CHEM</span>
            <span style="font-size:0.75rem; color:#64748b;">4 Years · 8 Sem</span>
          </div>
          <h3 style="font-size:1.1rem; font-weight:800; color:#0f172a;">BS Chemistry</h3>
          <span style="font-size:0.75rem; font-weight:700; color:#800020;">Faculty of Basic Sciences</span>
          <p style="font-size:0.8125rem; color:#475569; margin-top:0.5rem; line-height:1.5;">
            Analytical, organic, inorganic, and applied industrial chemistry with laboratory practicals.
          </p>
        </div>
        <div style="margin-top:1rem; padding-top:0.75rem; border-top:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.75rem; color:#16a34a; font-weight:700;">✓ Admissions Open</span>
          <a href="#contact-us" class="ucms-btn ucms-btn-primary" style="padding:0.4rem 0.8rem; font-size:0.75rem; background:#1e3a8a;">Apply Now →</a>
        </div>
      </div>

      <!-- 5. BS MLT -->
      <div class="ucms-card" style="display:flex; flex-direction:column; justify-content:space-between;">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <span style="font-family:'JetBrains Mono',monospace; font-size:0.75rem; font-weight:700; color:#1e3a8a; background:#eff6ff; padding:0.2rem 0.5rem; border-radius:4px;">BSMLT</span>
            <span style="font-size:0.75rem; color:#64748b;">4 Years · 8 Sem</span>
          </div>
          <h3 style="font-size:1.1rem; font-weight:800; color:#0f172a;">BS Medical Lab Technology</h3>
          <span style="font-size:0.75rem; font-weight:700; color:#800020;">Faculty of Allied Health Sciences</span>
          <p style="font-size:0.8125rem; color:#475569; margin-top:0.5rem; line-height:1.5;">
            Clinical diagnostics, pathology, hematology, medical microbiology, and hospital lab protocols.
          </p>
        </div>
        <div style="margin-top:1rem; padding-top:0.75rem; border-top:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.75rem; color:#16a34a; font-weight:700;">✓ Admissions Open</span>
          <a href="#contact-us" class="ucms-btn ucms-btn-primary" style="padding:0.4rem 0.8rem; font-size:0.75rem; background:#1e3a8a;">Apply Now →</a>
        </div>
      </div>

      <!-- 6. BBA -->
      <div class="ucms-card" style="display:flex; flex-direction:column; justify-content:space-between;">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <span style="font-family:'JetBrains Mono',monospace; font-size:0.75rem; font-weight:700; color:#1e3a8a; background:#eff6ff; padding:0.2rem 0.5rem; border-radius:4px;">BBA</span>
            <span style="font-size:0.75rem; color:#64748b;">4 Years · 8 Sem</span>
          </div>
          <h3 style="font-size:1.1rem; font-weight:800; color:#0f172a;">Bachelor of Business Administration</h3>
          <span style="font-size:0.75rem; font-weight:700; color:#800020;">Faculty of Management Sciences</span>
          <p style="font-size:0.8125rem; color:#475569; margin-top:0.5rem; line-height:1.5;">
            Corporate finance, strategic marketing, entrepreneurship, and modern supply chain operations.
          </p>
        </div>
        <div style="margin-top:1rem; padding-top:0.75rem; border-top:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.75rem; color:#16a34a; font-weight:700;">✓ Admissions Open</span>
          <a href="#contact-us" class="ucms-btn ucms-btn-primary" style="padding:0.4rem 0.8rem; font-size:0.75rem; background:#1e3a8a;">Apply Now →</a>
        </div>
      </div>

    </div>
  </section>

  <!-- =========================================================================
       SECTION 4: FACULTY OVERVIEW
       ========================================================================= -->
  <section id="faculty-overview" style="background:#ffffff; border-top:1px solid #e2e8f0; border-bottom:1px solid #e2e8f0; padding:4rem 1.5rem;">
    <div style="max-width:1400px; margin:0 auto;">
      <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:flex-end; border-bottom:1px solid #e2e8f0; padding-bottom:1rem; margin-bottom:2rem; gap:1rem;">
        <div>
          <span style="font-size:0.75rem; font-weight:800; color:#800020; text-transform:uppercase; letter-spacing:0.05em; display:block; margin-bottom:0.25rem;">
            SCHOLARLY MENTORSHIP · KHANEWAL CAMPUS FACULTY
          </span>
          <h2 style="font-family:'Playfair Display',Georgia,serif; font-size:1.85rem; font-weight:900; color:#1e3a8a; margin:0;">
            DISTINGUISHED FACULTY OVERVIEW
          </h2>
        </div>
        <p style="font-size:0.875rem; color:#64748b; margin:0; max-width:440px;">
          Departmental chairs, professors, and lecturers holding Ph.D., MS, and M.Phil degrees from premier institutions.
        </p>
      </div>

      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 1fr)); gap:1.5rem;">
        <!-- Card 1: Engr. Dr. Tariq Mahmood -->
        <div class="ucms-card" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:16px; padding:1.5rem; display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
              <div style="width:48px; height:48px; border-radius:50%; background:#1e3a8a; color:#fff; font-weight:900; font-size:0.875rem; display:flex; align-items:center; justify-content:center;">TM</div>
              <span style="font-size:0.65rem; font-weight:800; text-transform:uppercase; padding:0.2rem 0.5rem; border-radius:4px; background:#eff6ff; color:#1e3a8a; border:1px solid #bfdbfe;">CS & IT</span>
            </div>
            <h3 style="font-size:1.05rem; font-weight:800; color:#0f172a; margin:0 0 0.25rem;">Engr. Dr. Tariq Mahmood</h3>
            <div style="font-size:0.75rem; font-weight:700; color:#d97706; margin-bottom:0.75rem;">Associate Professor & Senior Academic Chair</div>
            <div style="font-size:0.75rem; color:#475569; line-height:1.5;">
              <div>🎓 Ph.D. in Computer Science, MS Software Engineering</div>
              <div style="margin-top:0.25rem;">🔬 Distributed Systems, Cloud Architecture & ML</div>
            </div>
          </div>
          <div style="margin-top:1.25rem; padding-top:0.75rem; border-top:1px solid #e2e8f0; display:flex; justify-content:space-between; font-size:0.75rem; color:#64748b;">
            <span>16+ Years Experience</span>
            <span style="color:#1e3a8a; font-weight:600;">tariq.mahmood@ucmsacademic.com</span>
          </div>
        </div>

        <!-- Card 2: Dr. Muhammad Asif Raza -->
        <div class="ucms-card" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:16px; padding:1.5rem; display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
              <div style="width:48px; height:48px; border-radius:50%; background:#1e3a8a; color:#fff; font-weight:900; font-size:0.875rem; display:flex; align-items:center; justify-content:center;">AR</div>
              <span style="font-size:0.65rem; font-weight:800; text-transform:uppercase; padding:0.2rem 0.5rem; border-radius:4px; background:#f3e8ff; color:#6b21a8; border:1px solid #e9d5ff;">BUSINESS ADMIN</span>
            </div>
            <h3 style="font-size:1.05rem; font-weight:800; color:#0f172a; margin:0 0 0.25rem;">Dr. Muhammad Asif Raza</h3>
            <div style="font-size:0.75rem; font-weight:700; color:#d97706; margin-bottom:0.75rem;">Professor of Management & HOD</div>
            <div style="font-size:0.75rem; color:#475569; line-height:1.5;">
              <div>🎓 Ph.D. in Management Sciences, MBA (Finance)</div>
              <div style="margin-top:0.25rem;">🔬 Strategic Corporate Management & Finance</div>
            </div>
          </div>
          <div style="margin-top:1.25rem; padding-top:0.75rem; border-top:1px solid #e2e8f0; display:flex; justify-content:space-between; font-size:0.75rem; color:#64748b;">
            <span>18+ Years Experience</span>
            <span style="color:#1e3a8a; font-weight:600;">asif.raza@ucmsacademic.com</span>
          </div>
        </div>

        <!-- Card 3: Prof. Naveed Iqbal Malik -->
        <div class="ucms-card" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:16px; padding:1.5rem; display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
              <div style="width:48px; height:48px; border-radius:50%; background:#1e3a8a; color:#fff; font-weight:900; font-size:0.875rem; display:flex; align-items:center; justify-content:center;">NM</div>
              <span style="font-size:0.65rem; font-weight:800; text-transform:uppercase; padding:0.2rem 0.5rem; border-radius:4px; background:#dcfce7; color:#166534; border:1px solid #bbf7d0;">COMMERCE</span>
            </div>
            <h3 style="font-size:1.05rem; font-weight:800; color:#0f172a; margin:0 0 0.25rem;">Prof. Naveed Iqbal Malik</h3>
            <div style="font-size:0.75rem; font-weight:700; color:#d97706; margin-bottom:0.75rem;">Associate Professor & Senior Lecturer</div>
            <div style="font-size:0.75rem; color:#475569; line-height:1.5;">
              <div>🎓 M.Phil Commerce, ACMA, M.Com (Gold Medalist)</div>
              <div style="margin-top:0.25rem;">🔬 Advanced Cost Accounting, Auditing & IFRS</div>
            </div>
          </div>
          <div style="margin-top:1.25rem; padding-top:0.75rem; border-top:1px solid #e2e8f0; display:flex; justify-content:space-between; font-size:0.75rem; color:#64748b;">
            <span>14+ Years Experience</span>
            <span style="color:#1e3a8a; font-weight:600;">naveed.malik@ucmsacademic.com</span>
          </div>
        </div>

        <!-- Card 4: Dr. Amna Tariq -->
        <div class="ucms-card" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:16px; padding:1.5rem; display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
              <div style="width:48px; height:48px; border-radius:50%; background:#1e3a8a; color:#fff; font-weight:900; font-size:0.875rem; display:flex; align-items:center; justify-content:center;">AT</div>
              <span style="font-size:0.65rem; font-weight:800; text-transform:uppercase; padding:0.2rem 0.5rem; border-radius:4px; background:#fef3c7; color:#92400e; border:1px solid #fde68a;">ARTIFICIAL INTEL</span>
            </div>
            <h3 style="font-size:1.05rem; font-weight:800; color:#0f172a; margin:0 0 0.25rem;">Dr. Amna Tariq</h3>
            <div style="font-size:0.75rem; font-weight:700; color:#d97706; margin-bottom:0.75rem;">Assistant Professor & AI Lead</div>
            <div style="font-size:0.75rem; color:#475569; line-height:1.5;">
              <div>🎓 Ph.D. in Computing & Data Mining, MS IT</div>
              <div style="margin-top:0.25rem;">🔬 Deep Learning, Predictive Modeling & Neural Systems</div>
            </div>
          </div>
          <div style="margin-top:1.25rem; padding-top:0.75rem; border-top:1px solid #e2e8f0; display:flex; justify-content:space-between; font-size:0.75rem; color:#64748b;">
            <span>11+ Years Experience</span>
            <span style="color:#1e3a8a; font-weight:600;">amna.tariq@ucmsacademic.com</span>
          </div>
        </div>

        <!-- Card 5: Dr. Waqas Ahmed -->
        <div class="ucms-card" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:16px; padding:1.5rem; display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
              <div style="width:48px; height:48px; border-radius:50%; background:#1e3a8a; color:#fff; font-weight:900; font-size:0.875rem; display:flex; align-items:center; justify-content:center;">WA</div>
              <span style="font-size:0.65rem; font-weight:800; text-transform:uppercase; padding:0.2rem 0.5rem; border-radius:4px; background:#e0e7ff; color:#3730a3; border:1px solid #c7d2fe;">NETWORKS & CYBER</span>
            </div>
            <h3 style="font-size:1.05rem; font-weight:800; color:#0f172a; margin:0 0 0.25rem;">Dr. Waqas Ahmed</h3>
            <div style="font-size:0.75rem; font-weight:700; color:#d97706; margin-bottom:0.75rem;">Associate Professor & Research Lead</div>
            <div style="font-size:0.75rem; color:#475569; line-height:1.5;">
              <div>🎓 Ph.D. in Computer Networks, MS Network Security</div>
              <div style="margin-top:0.25rem;">🔬 Cybersecurity, IoT Architecture & Cloud Infrastructure</div>
            </div>
          </div>
          <div style="margin-top:1.25rem; padding-top:0.75rem; border-top:1px solid #e2e8f0; display:flex; justify-content:space-between; font-size:0.75rem; color:#64748b;">
            <span>13+ Years Experience</span>
            <span style="color:#1e3a8a; font-weight:600;">waqas.ahmed@ucmsacademic.com</span>
          </div>
        </div>

        <!-- Card 6: Dr. Farhan Ali -->
        <div class="ucms-card" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:16px; padding:1.5rem; display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
              <div style="width:48px; height:48px; border-radius:50%; background:#1e3a8a; color:#fff; font-weight:900; font-size:0.875rem; display:flex; align-items:center; justify-content:center;">FA</div>
              <span style="font-size:0.65rem; font-weight:800; text-transform:uppercase; padding:0.2rem 0.5rem; border-radius:4px; background:#ccfbf1; color:#115e59; border:1px solid #99f6e4;">SOFTWARE SYSTEMS</span>
            </div>
            <h3 style="font-size:1.05rem; font-weight:800; color:#0f172a; margin:0 0 0.25rem;">Dr. Farhan Ali</h3>
            <div style="font-size:0.75rem; font-weight:700; color:#d97706; margin-bottom:0.75rem;">Assistant Professor & Systems Specialist</div>
            <div style="font-size:0.75rem; color:#475569; line-height:1.5;">
              <div>🎓 Ph.D. in Software Engineering, MS Computer Science</div>
              <div style="margin-top:0.25rem;">🔬 Formal Verification, Software Quality & Distributed Algorithms</div>
            </div>
          </div>
          <div style="margin-top:1.25rem; padding-top:0.75rem; border-top:1px solid #e2e8f0; display:flex; justify-content:space-between; font-size:0.75rem; color:#64748b;">
            <span>10+ Years Experience</span>
            <span style="color:#1e3a8a; font-weight:600;">farhan.ali@ucmsacademic.com</span>
          </div>
        </div>

      </div>
    </div>
  </section>

  <!-- =========================================================================
       SECTION 5: INSTITUTIONAL & DEPARTMENTAL VISION
       ========================================================================= -->
  <section style="padding:4rem 1.5rem; max-width:1400px; margin:0 auto;">
    <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:flex-end; border-bottom:1px solid #e2e8f0; padding-bottom:1rem; margin-bottom:2rem; gap:1rem;">
      <div>
        <div style="font-size:0.75rem; font-weight:800; color:#800020; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.25rem;">
          GUIDING PRINCIPLES · MISSION & MANDATE
        </div>
        <h2 style="font-family:'Playfair Display',Georgia,serif; font-size:1.85rem; font-weight:900; color:#1e3a8a; margin:0;">
          INSTITUTIONAL & DEPARTMENTAL VISION
        </h2>
      </div>
      <div style="font-size:0.8125rem; color:#64748b; max-width:440px;">
        Strategic roadmaps shaping ethical leadership, computing excellence, and socio-economic transformation.
      </div>
    </div>

    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 1fr)); gap:1.75rem;">
      
      <!-- Card 1: Institutional Vision of UCMS -->
      <div style="background:#ffffff; border:1px solid #e2e8f0; border-top:4px solid #d97706; border-radius:20px; padding:1.75rem; box-shadow:0 2px 8px rgba(0,0,0,0.04); display:flex; flex-direction:column; justify-content:space-between;">
        <div>
          <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; margin-bottom:1rem; gap:0.5rem;">
            <span style="background:#fef3c7; color:#92400e; font-size:0.7rem; font-weight:800; padding:0.2rem 0.6rem; border-radius:9999px; border:1px solid #fde68a;">
              UCMS FOUNDATIONAL CHARTER
            </span>
            <span style="font-size:0.75rem; font-weight:700; color:#d97706;">Khanewal Campus</span>
          </div>

          <h3 style="font-family:'Playfair Display',Georgia,serif; font-size:1.25rem; font-weight:900; color:#0f172a; text-transform:uppercase; margin-bottom:0.5rem;">
            INSTITUTIONAL VISION OF UCMS
          </h3>
          <div style="font-size:0.8125rem; font-weight:700; color:#d97706; font-style:italic; margin-bottom:0.75rem;">
            "Learning Today for a Better Tomorrow"
          </div>
          <p style="font-size:0.8125rem; color:#475569; line-height:1.6; margin:0;">
            To establish UCMS Khanewal as a distinguished center of higher academic learning in South Punjab, empowering graduates with ethical character, rigorous critical inquiry, modern technological competence, and visionary leadership to elevate society and enterprise.
          </p>
        </div>

        <div style="margin-top:1.5rem; padding-top:1rem; border-top:1px solid #f1f5f9; display:flex; flex-wrap:wrap; gap:0.5rem; font-size:0.75rem;">
          <span style="background:#fff; border:1px solid #cbd5e1; padding:0.3rem 0.6rem; border-radius:8px; font-weight:700; color:#1e293b;">
            🛡 Academic Integrity
          </span>
          <span style="background:#fff; border:1px solid #cbd5e1; padding:0.3rem 0.6rem; border-radius:8px; font-weight:700; color:#1e293b;">
            🏆 Research Excellence
          </span>
          <span style="background:#fff; border:1px solid #cbd5e1; padding:0.3rem 0.6rem; border-radius:8px; font-weight:700; color:#1e293b;">
            🌐 Regional Empowerment
          </span>
        </div>
      </div>

      <!-- Card 2: Department of CS Vision -->
      <div style="background:#ffffff; border:1px solid #e2e8f0; border-top:4px solid #1e3a8a; border-radius:20px; padding:1.75rem; box-shadow:0 2px 8px rgba(0,0,0,0.04); display:flex; flex-direction:column; justify-content:space-between;">
        <div>
          <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; margin-bottom:1rem; gap:0.5rem;">
            <span style="background:#eff6ff; color:#1e40af; font-size:0.7rem; font-weight:800; padding:0.2rem 0.6rem; border-radius:9999px; border:1px solid #dbeafe;">
              COMPUTING & IT CHARTER
            </span>
            <span style="font-size:0.75rem; font-weight:700; color:#1d4ed8;">Faculty of CS & IT</span>
          </div>

          <h3 style="font-family:'Playfair Display',Georgia,serif; font-size:1.25rem; font-weight:900; color:#0f172a; text-transform:uppercase; margin-bottom:0.5rem;">
            DEPARTMENT OF CS VISION
          </h3>
          <div style="font-size:0.8125rem; font-weight:700; color:#1d4ed8; font-style:italic; margin-bottom:0.75rem;">
            Engineering the Computing Future of South Punjab
          </div>
          <p style="font-size:0.8125rem; color:#475569; line-height:1.6; margin:0;">
            The Department of Computer Science envisions producing forward-thinking software engineers, data scientists, and computing architects equipped with profound algorithmic knowledge, robust development skills, and high ethical standards to drive technological innovation globally and regionally.
          </p>
        </div>

        <div style="margin-top:1.5rem; padding-top:1rem; border-top:1px solid #f1f5f9; display:flex; flex-wrap:wrap; gap:0.5rem; font-size:0.75rem;">
          <span style="background:#fff; border:1px solid #cbd5e1; padding:0.3rem 0.6rem; border-radius:8px; font-weight:700; color:#1e293b;">
            💻 Algorithmic Mastery
          </span>
          <span style="background:#fff; border:1px solid #cbd5e1; padding:0.3rem 0.6rem; border-radius:8px; font-weight:700; color:#1e293b;">
            ⚙️ Applied Software Engineering
          </span>
          <span style="background:#fff; border:1px solid #cbd5e1; padding:0.3rem 0.6rem; border-radius:8px; font-weight:700; color:#1e293b;">
            ✨ Intelligent Systems
          </span>
        </div>
      </div>

    </div>
  </section>

  <!-- =========================================================================
       SECTION 6: GET IN TOUCH (3 STRUCTURED SECTIONS)
       ========================================================================= -->
  <section id="contact-us" style="background:#f1f5f9; border-top:1px solid #cbd5e1; padding:4rem 1.5rem;">
    <div style="max-width:1400px; margin:0 auto;">
      
      <div style="text-align:center; max-width:640px; margin:0 auto 2.5rem;">
        <span style="font-size:0.75rem; font-weight:800; color:#800020; text-transform:uppercase; letter-spacing:0.05em; display:block; margin-bottom:0.25rem;">
          Campus Liaison
        </span>
        <h2 style="font-size:1.85rem; font-weight:900; color:#1e3a8a;">
          Get in Touch with UCMS Khanewal
        </h2>
        <p style="font-size:0.875rem; color:#64748b; margin-top:0.5rem;">
          Visit our admissions office or send your academic inquiries directly.
        </p>
      </div>

      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap:1.5rem;">
        
        <!-- Sub-section 1: Campus Location and Address -->
        <div class="ucms-card">
          <h3 style="font-size:1rem; font-weight:800; color:#1e3a8a; margin-bottom:0.75rem;">
            1. Campus Location & Address
          </h3>
          <div style="font-size:0.8125rem; color:#475569; line-height:1.6; display:flex; flex-direction:column; gap:0.5rem;">
            <div>
              <strong style="color:#0f172a; display:block;">Physical Campus:</strong>
              Near Multan Road, Khanewal, Punjab, Pakistan
            </div>
            <div>
              <strong style="color:#0f172a; display:block;">Landmarks & Accessibility:</strong>
              Situated on the main highway corridor with dedicated student university transport connecting Khanewal city, Jahanian, and Kabirwala.
            </div>
          </div>
          <div style="margin-top:1rem; border-radius:8px; overflow:hidden; border:1px solid #cbd5e1;">
            <img src="assets/aistudio/images-extractpics_fa9aed82.jpg" onerror="this.src='campus.jpg'" alt="Campus Building" style="width:100%; height:130px; object-fit:cover;">
          </div>
        </div>

        <!-- Sub-section 2: Telephones, Mail Inquiries, Timings -->
        <div class="ucms-card">
          <h3 style="font-size:1rem; font-weight:800; color:#1e3a8a; margin-bottom:0.75rem;">
            2. Telephone, Mail & Timings
          </h3>
          <div style="font-size:0.8125rem; color:#475569; line-height:1.6; display:flex; flex-direction:column; gap:0.75rem;">
            <div>
              <strong style="color:#0f172a; display:block;">Official Telephones:</strong>
              <div style="font-family:'JetBrains Mono',monospace; color:#1e3a8a;">
                +92 (065) 9200-142 (Admissions Desk)<br>
                +92 (065) 9200-143 (Registrar Office)<br>
                +92 300 7861234 (WhatsApp Cell)
              </div>
            </div>

            <div>
              <strong style="color:#0f172a; display:block;">Mail Inquiries ID:</strong>
              <div style="font-family:'JetBrains Mono',monospace; color:#1e3a8a;">
                admissions@ucms.edu.pk<br>
                info@ucms.edu.pk
              </div>
            </div>

            <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:6px; padding:0.5rem 0.75rem;">
              <strong style="color:#1e3a8a; display:block;">Registration & Admission Timings:</strong>
              Monday to Saturday: 08:30 AM – 04:30 PM<br>
              Friday Prayer Break: 12:30 PM – 02:00 PM<br>
              Sunday: Closed
            </div>
          </div>
        </div>

        <!-- Sub-section 3: Send Inquiry Form -->
        <div class="ucms-card">
          <h3 style="font-size:1rem; font-weight:800; color:#1e3a8a; margin-bottom:0.75rem;">
            3. Send Direct Inquiry
          </h3>
          <form onsubmit="alert('Inquiry dispatched to UCMS Admission Office. An academic liaison will contact you shortly.'); return false;" style="display:flex; flex-direction:column; gap:0.6rem;">
            <div>
              <label class="ucms-label">Your Full Name</label>
              <input type="text" class="ucms-input" placeholder="e.g. Muhammad Ali" required>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem;">
              <div>
                <label class="ucms-label">Email</label>
                <input type="email" class="ucms-input" placeholder="name@email.com" required>
              </div>
              <div>
                <label class="ucms-label">Phone</label>
                <input type="tel" class="ucms-input" placeholder="0300-1234567" required>
              </div>
            </div>
            <div>
              <label class="ucms-label">Program of Interest</label>
              <select class="ucms-select">
                <option value="BSCS">BS Computer Science (BSCS)</option>
                <option value="BSIT">BS Information Technology (BSIT)</option>
                <option value="BSAI">BS Artificial Intelligence (BSAI)</option>
                <option value="BS Chem">BS Chemistry</option>
                <option value="BS MLT">BS Medical Lab Technology (BSMLT)</option>
                <option value="BBA">Bachelor of Business Administration (BBA)</option>
              </select>
            </div>
            <div>
              <label class="ucms-label">Message</label>
              <textarea class="ucms-textarea" rows="2" placeholder="Your inquiry details..." required></textarea>
            </div>
            <button type="submit" class="ucms-btn ucms-btn-primary" style="background:#1e3a8a; padding:0.5rem;">
              Submit Inquiry to Admission Office →
            </button>
          </form>
        </div>

      </div>
    </div>
  </section>

  <!-- FOOTER -->
  <footer style="background:#0f172a; color:#94a3b8; font-size:0.75rem; padding:2rem 1.5rem; text-align:center;">
    <div style="max-width:1400px; margin:0 auto; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
      <div style="display:flex; align-items:center; gap:0.5rem;">
        <img src="assets/aistudio/logo_c68140aa.png" onerror="this.src='logo.png'" alt="Seal" style="width:28px; height:28px; border-radius:50%;">
        <span style="color:#ffffff; font-weight:800;">UCMS KHANEWAL</span>
      </div>
      <div>
        © <?= date('Y'); ?> University College of Management and Sciences, Khanewal. All rights reserved.
      </div>
    </div>
  </footer>

  <script src="js/main.js"></script>
</body>
</html>
