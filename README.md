# 🎓 UCMS Academic Repository & Multi-Role Management System

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/Vanilla_JS-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![PHP 8+](https://img.shields.io/badge/PHP_8+-777BB4?style=for-the-badge&logo=php&logoColor=white)](https://www.php.net/)
[![MySQL](https://img.shields.io/badge/MySQL_8.x-00758F?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![XAMPP Ready](https://img.shields.io/badge/XAMPP-Ready-FB7A24?style=for-the-badge&logo=xampp&logoColor=white)](https://www.apachefriends.org/)

> **University College of Management and Sciences (UCMS), Khanewal**  
> An institutional-grade academic repository, dynamic timetable coordinator, and multi-role academic management system built strictly using **HTML5, CSS3, Vanilla JavaScript (ES6+), PHP 8+, and MySQL**.

---

## 🌐 Project Links

- **Official GitHub Repository**: [https://github.com/ShahzaibAlam-110/ucms-academic-repository-system](https://github.com/ShahzaibAlam-110/ucms-academic-repository-system)
- **Live Interactive Client Demo (GitHub Pages)**: [https://shahzaibalam-110.github.io/ucms-academic-repository-system/](https://shahzaibalam-110.github.io/ucms-academic-repository-system/)
- **Original React/TypeScript Source Branch**: [backup-react-version](https://github.com/ShahzaibAlam-110/ucms-academic-repository-system/tree/backup-react-version)

---

## 🏛️ System Overview

The UCMS Academic Repository & Multi-Role Management System is an end-to-end collegiate web application designed to manage university operations across 4 distinct institutional roles: **Students**, **Faculty / Teachers**, **Head of Department (HOD)**, and **Administrators**.

The system has been completely converted into a lightweight, framework-free architecture adhering strictly to **FIVE foundational technologies**:
1. **HTML5**: Semantic document layouts, accessible forms, and modular components.
2. **CSS3**: Custom responsive grid, flexbox layouts, institutional branding, cards, tables, and modal overlays without external CSS frameworks.
3. **Vanilla JavaScript (ES6+)**: Pure client-side event delegation, modal controls, asynchronous AJAX requests, form validation, and image lightbox viewer without npm or JavaScript libraries.
4. **PHP 8+**: Server-side request routing, session-based authentication, Role-Based Access Control (RBAC), CSRF protection, file upload validation, and audit logging.
5. **MySQL**: Normalized relational database schema (`database.sql`) with 12 core tables, foreign key constraints, and sample data.

---

## 👥 The Four User Roles & Core Features

### 👨‍🎓 1. Student Workspace (`student`)
- **Degree Course Repository**: Instant access to enrolled courses (BSCS Fall 2026), credit hours, assigned instructors, and verified handouts.
- **Handout & Slide Downloads**: Authenticated file delivery via `download.php` with fallback watermarked PDF generator.
- **Daily Lecture Timetable**: Personal timetable organized by weekday, timeslot, and laboratory/classroom venue.
- **Update Center**: View campus-wide and departmental notices with unread counter tracking.
- **Attachment Previews**: Interactive preview for picture notifications and one-click download for attached PDF/Word documents.
- **Academic Grievance Desk**: Rate-limited submission of academic/lab issues enforced at **maximum 3 reports per week**.
- **Institutional Bookmarks**: Quick access to curriculum guidelines, library gateway, and academic policies.

### 👩‍🏫 2. Faculty / Teacher Workspace (`teacher`)
- **Assigned Course Directory**: View all assigned degree courses and lecture schedules.
- **Handout Upload & Non-Destructive Versioning**: Upload lecture handouts or replace existing versions with immutable version history (`resource_versions`).
- **Teaching Timetable**: Weekday schedule with classroom locations.
- **Notice & Circular Publisher**: Post class notices with **optional document or picture attachments** (PDF, Word, PNG, JPG).
- **Student Inquiry Actions**: Review, resolve, or investigate student inquiries relating to course materials.

### 🏛️ 3. Head of Department (HOD CS) Leadership Console (`hod`)
- **CS Faculty Roster**: Monitor all 14 Computer Science faculty members, designations, and assigned teaching loads.
- **Course Allocation Engine**: Assign faculty members to all 26 departmental courses across Semesters 1 to 8.
- **Master Timetable Coordinator with 3-Tier Conflict Detection**:
  - *Teacher Double-Booking*: Prevents scheduling an instructor for two classes simultaneously.
  - *Room Clash*: Prevents double-booking classrooms or computer labs.
  - *Section Overlap*: Prevents scheduling the same cohort for overlapping lectures.
- **Departmental Circulars**: Broadcast official directives with **optional file/image attachments**.
- **Department Inquiries Desk**: Action student grievances within the CS jurisdiction.

### ⚙️ 4. Master Administrator Console (`admin`)
- **User Directory & Account Creation**: Create and manage accounts across all departments with BCRYPT password security.
- **Cohort Lifecycle Promotion Engine**: Batch-promote students from Semester 1 through 8, or confer degrees to graduating alumni.
- **Master University Timetable**: View and manage timetable slots across all faculties.
- **Campus Broadcast Publisher**: Issue university-wide circulars with **optional document or photo attachments**.
- **Public Website CMS**: Dynamically update homepage metrics, admission deadlines, and campus contact details.
- **Security Audit Trail**: Real-time logging of user logins, role actions, handout downloads, and configuration updates.

---

## 📎 New Feature: Announcement & Notice Attachments

When an Admin, HOD, or Faculty member posts an update or notice, they now have the option to attach a file:
- **Format Support**: Page notifications, document formats (`.pdf`, `.doc`, `.docx`, `.txt`, `.xls`, `.xlsx`, `.ppt`, `.pptx`), or image formats (`.png`, `.jpg`, `.jpeg`, `.webp`).
- **Optional Nature**: The author may choose to attach a file or post a text-only notice.
- **Display & Download**:
  - **Images**: Rendered with a thumbnail, "Enlarge" button (opens the built-in Vanilla JS Lightbox modal), and direct download button.
  - **Documents**: Rendered with document metadata, file size, and authenticated download link via `download.php?announcement_id=X`.

---

## 🔑 Demo Access Credentials

All pre-configured accounts share the default password: **`password123`**

| Role | Username | Institutional Email | Department |
| :--- | :--- | :--- | :--- |
| **Student** | `shahzaib` | `shahzaib.alam@student.ucms.edu.pk` | Computer Science (Sem 7) |
| **Faculty / Teacher** | `dr_amna` | `dr.amna@ucms.edu.pk` | Computer Science |
| **Head of Department (HOD)** | `hod_cs` | `hod.cs@ucms.edu.pk` | Computer Science |
| **Institutional Admin** | `admin` | `registrar@ucms.edu.pk` | Central Administration |

---

## 📂 Project Directory Structure

```
├── actions.php                    # Server-side API & action controller (POST/GET)
├── assets/                        # University seal, campus imagery, and graphic assets
│   └── aistudio/                  # Institutional logos and campus photography
├── campus.jpg                     # Campus banner image
├── change_password.php            # Secure password update endpoint
├── config/
│   └── db.php                     # Singleton PDO database connector (MySQL utf8mb4)
├── css/
│   └── style.css                  # Pure CSS3 stylesheet (zero framework dependencies)
├── database.sql                   # 12-table relational MySQL database schema & sample data
├── download.php                   # Authenticated secure document & attachment download engine
├── includes/                      # Reusable PHP modular includes
│   ├── auth.php                   # Session security, RBAC enforcement, CSRF & audit helpers
│   ├── header.php                 # Reusable HTML head, fonts, and stylesheets
│   ├── footer.php                 # Reusable collegiate footer
│   └── modals.php                 # Shared image lightbox viewer & password setup modals
├── index.php                      # Master application entrypoint & role router
├── js/
│   └── main.js                    # Pure Vanilla JavaScript engine (zero npm libraries)
├── login.php                      # Authentication engine with password_verify()
├── logout.php                     # Session termination & cleanup
├── logo.png                       # High-resolution institutional seal
├── start.sh                       # One-click startup script for PHP built-in server
├── test_system.php                # Automated 13-point system verification test suite
├── uploads/                       # Secure file uploads storage
│   ├── announcements/             # Notice attachments (PDFs, Word docs, images)
│   └── documents/                 # Course handouts & syllabus materials
└── views/                         # Role-specific collegiate workspaces
    ├── public_view.php            # Public homepage, admissions calendar & login portal
    ├── student_view.php           # Student academic workspace (5 tabs)
    ├── teacher_view.php           # Faculty workspace (5 tabs)
    ├── hod_view.php               # HOD CS leadership console (4 tabs)
    └── admin_view.php             # Master administrative console (5 tabs)
```

---

## 🗄️ Database Architecture (`database.sql`)

The database consists of **12 core relational tables**:

1. `departments`: Institutional departments (Computer Science, Business Administration, Electrical Engineering, Software Engineering).
2. `users`: Multi-role user accounts with BCRYPT password hashes, roles, departments, designations, and semesters.
3. `courses`: Degree syllabus courses with course codes, credit hours, and semester levels.
4. `course_allocations`: Faculty-to-course assignments for each academic term.
5. `handouts`: Academic syllabus documents, lecture notes, and active versions.
6. `resource_versions`: Immutable version archives tracking replacement reasons and timestamps.
7. `timetables`: Lecture schedule slots with day, timeslot, venue, and section.
8. `announcements`: Campus notices supporting optional attachment metadata (`attachment_name`, `attachment_url`, `attachment_type`, `attachment_size`).
9. `announcement_reads`: Student read receipts tracking unread counts.
10. `student_reports`: Student grievances with weekly rate-limiting (max 3/week) and HOD/Admin resolution workflows.
11. `cms_settings`: Key-value store for public homepage statistics and institutional settings.
12. `audit_logs`: Immutable security audit trail recording logins, uploads, promotions, and downloads.

---

## 🚀 Installation & Running Locally

### Option 1: XAMPP (Recommended for Local Development)

1. **Install XAMPP** (with PHP 8.0+ and MySQL).
2. **Move Project**: Place the project folder inside your XAMPP `htdocs` directory:
   - **Windows**: `C:\xampp\htdocs\ucms`
   - **Linux**: `/opt/lampp/htdocs/ucms`
3. **Start Apache and MySQL**:
   - Open XAMPP Control Panel and start **Apache** and **MySQL**.
4. **Import Database**:
   - Open [http://localhost/phpmyadmin](http://localhost/phpmyadmin) in your browser.
   - Create a new database named `ucms_portal` with collation `utf8mb4_unicode_ci`.
   - Click **Import**, select `database.sql` from the project directory, and click **Go**.
5. **Launch Application**:
   - Navigate to `http://localhost/ucms/` in your browser.

---

### Option 2: PHP Built-in Server

If you have PHP 8+ and MySQL installed natively:

1. **Import Database**:
   ```bash
   mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS ucms_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   mysql -u root -p ucms_portal < database.sql
   ```

2. **Configure Database Credentials** (if not using default `root` with no password):
   Edit `config/db.php` or set environment variables:
   ```bash
   export DB_HOST=127.0.0.1
   export DB_NAME=ucms_portal
   export DB_USER=root
   export DB_PASS=your_password
   ```

3. **Start the Application**:
   ```bash
   chmod +x start.sh
   ./start.sh
   ```
   Or run directly with PHP:
   ```bash
   php -S 0.0.0.0:8000
   ```
   Open **`http://localhost:8000`** in your browser.

---

### Option 3: Automated Verification Suite

Run the included verification suite to validate database schema, credentials, conflict detection, and quotas:
```bash
php test_system.php
```

---

## 🔒 Security Architecture

- **Session Security**: Enforces `HttpOnly`, `SameSite`, and `Secure` cookie flags to prevent session hijacking.
- **Role-Based Access Control (RBAC)**: All protected operations verify identity on the PHP server; frontend JavaScript is never trusted for authorization.
- **Prepared Statements**: 100% of SQL queries utilize PDO prepared statements with parameter binding to prevent SQL injection.
- **XSS Prevention**: Output data is escaped using `htmlspecialchars(..., ENT_QUOTES, 'UTF-8')`.
- **Upload Validation**: File uploads validate MIME type, file extension, and enforce a 25MB maximum size.
- **Audit Trail**: Every significant action (logins, uploads, cohort upgrades, downloads) is logged in `audit_logs` with timestamps and client IP addresses.

---

## 📄 License

This project is licensed under the **MIT License**.  
Developed for **University College of Management and Sciences (UCMS), Khanewal**.
