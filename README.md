# 🎓 UCMS Academic Repository & Multi-Role Management System

[![Live Demo](https://img.shields.io/badge/Live_Demo-GitHub_Pages-2ea44f?style=for-the-badge&logo=github)](https://shahzaibalam-110.github.io/ucms-academic-repository-system/)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript_5.8-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite_6-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PHP](https://img.shields.io/badge/PHP_8-777BB4?style=for-the-badge&logo=php&logoColor=white)](https://www.php.net/)
[![MySQL](https://img.shields.io/badge/MySQL-00758F?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)

> **University College of Management and Sciences, Khanewal**  
> An institutional-grade academic repository, dynamic timetable coordinator, and multi-role academic management system designed to streamline departmental workflows, academic resources, and campus communications.

---

## 🌐 Live Interactive Demo

Experience the full interactive client application live on GitHub Pages:  
👉 **[Launch UCMS Academic Portal Demo](https://shahzaibalam-110.github.io/ucms-academic-repository-system/)**

---

## ✨ Key Features & Roles

### 👨‍🎓 1. Student Workspace
- **Academic Handouts & Resources**: Browse, search, and download course handouts and syllabus documents with version history.
- **Timetable & Schedule Viewer**: Filter class timetables by semester, section, and day.
- **Assessments & Performance**: Access continuous assessment scores, midterms, finals, and GPA tracking.
- **Campus Announcements**: Real-time institutional circulars and notifications.

### 👩‍🏫 2. Faculty / Teacher Workspace
- **Resource Management**: Upload, update, and manage syllabus documents, lecture notes, and revision versions.
- **Academic Grading**: Record and submit student evaluations, assignments, and test scores.
- **Course Allocations**: View assigned department courses, enrolled student lists, and classroom schedules.

### 🏛️ 3. Head of Department (HOD) Workspace
- **Curriculum & Syllabus Oversight**: Approve, reject, or request revisions for department handouts.
- **Course & Faculty Allocation**: Assign faculty members to courses and manage department sections.
- **Department Timetable Management**: Resolve room conflicts and coordinate schedules.
- **Academic Health Reports**: Monitor department GPA averages and student submission stats.

### ⚙️ 4. Administrator Workspace
- **User & Account Management**: Full CRUD for Student, Teacher, and HOD accounts with role-based permissions (RBAC).
- **Institutional CMS Settings**: Configure university logos, campus banners, academic calendar dates, and contact information.
- **Audit Logging**: Trace administrative operations, logins, resource updates, and system events.

---

## 🔑 Demo Access Credentials

All demo accounts share the password: **`password123`**

| Role | Username | Institutional Email |
| :--- | :--- | :--- |
| **Student** | `shahzaib` | `shahzaib.alam@student.ucms.edu.pk` |
| **Faculty / Teacher** | `dr_amna` | `dr.amna@ucms.edu.pk` |
| **Head of Department (HOD)** | `hod_cs` | `hod.cs@ucms.edu.pk` |
| **Institutional Admin** | `admin` | `registrar@ucms.edu.pk` |

---

## 🏗️ System Architecture

The project features a versatile dual architecture:

1. **Modern Client-Side SPA (React 19 + TypeScript + Vite + Tailwind CSS)**:
   - Ultra-fast, responsive UI with interactive mock state engine for instant demonstration and deployment anywhere (including static hosts and GitHub Pages).
2. **Production Full-Stack Backend (PHP 8 + MySQL PDO)**:
   - Normalized relational schema in [`database.sql`](database.sql) covering 12 core institutional tables.
   - Server-side sessions, password hashing (`BCRYPT`), role enforcement, audit logging, and automated test suite ([`test_system.php`](test_system.php)).

```
├── .github/workflows/deploy.yml   # Automated GitHub Pages CI/CD pipeline
├── config/
│   └── db.php                     # PDO Database singleton connection
├── src/
│   ├── components/                # Modular React role workspaces and dialogs
│   ├── data/mockDatabase.ts       # Realistic seed data and relational models
│   ├── App.tsx                    # Main multi-role app controller
│   └── main.tsx                   # React root entry point
├── views/                         # Native PHP server-rendered role views
├── actions.php                    # PHP backend REST / action handlers
├── database.sql                   # Complete relational MySQL database dump
├── start.sh                       # One-click startup script for PHP & Vite
├── test_system.php                # Automated 12-point system verification suite
└── vite.config.ts                 # Optimized Vite configuration
```

---

## 🚀 Getting Started

### Option A: Run the React UI Frontend

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ShahzaibAlam-110/ucms-academic-repository-system.git
   cd ucms-academic-repository-system
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### Option B: Run with PHP & MySQL Backend

1. **Import the Database**:
   - Start MySQL (e.g. via XAMPP or system service).
   - Create database `ucms_portal` and import [`database.sql`](database.sql):
     ```bash
     mysql -u root -p ucms_portal < database.sql
     ```

2. **Verify the Installation**:
   ```bash
   php test_system.php
   ```

3. **Launch the Combined Servers**:
   ```bash
   chmod +x start.sh
   ./start.sh
   ```
   Access the PHP portal at [http://localhost:8000](http://localhost:8000).

---

## 📄 License & Credits

Developed for **University College of Management and Sciences, Khanewal**.  
Authored by **[Shahzaib Alam](https://github.com/ShahzaibAlam-110)**.
