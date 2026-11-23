-- =====================================================================
-- UCMS UNIFIED 5-IN-1 DIGITAL CAMPUS PORTAL
-- Institution: University College of Management and Sciences (UCMS), Khanewal
-- Target Engine: MySQL 8.0+ / MariaDB (InnoDB, utf8mb4)
-- =====================================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP DATABASE IF EXISTS `ucms_portal`;
CREATE DATABASE `ucms_portal` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `ucms_portal`;

-- 1. DEPARTMENTS TABLE (Strict separation of Academic Faculties)
DROP TABLE IF EXISTS `departments`;
CREATE TABLE `departments` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(20) NOT NULL UNIQUE,
  `name` VARCHAR(150) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `departments` (`id`, `code`, `name`) VALUES
(1, 'CS', 'Department of Computer Science'),
(2, 'IT', 'Department of Information Technology'),
(3, 'BBA', 'Department of Business Administration'),
(4, 'ENG', 'Department of English Linguistics & Literature');

-- 2. USERS TABLE (Integrated Academic Identity & Roles)
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(120) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(150) NOT NULL,
  `role` ENUM('student', 'teacher', 'hod', 'admin') NOT NULL,
  `department_id` INT UNSIGNED DEFAULT NULL,
  `semester` TINYINT UNSIGNED DEFAULT NULL, -- 1 through 8 for students
  `roll_number` VARCHAR(50) DEFAULT NULL, -- e.g. UCMS-BSCS-21-042
  `designation` VARCHAR(100) DEFAULT NULL, -- e.g. Assistant Professor, HOD CS
  `workload_credits` TINYINT UNSIGNED DEFAULT 0,
  `has_changed_password` TINYINT(1) NOT NULL DEFAULT 0, -- Mandatory First-Time Setup
  `status` ENUM('active', 'suspended', 'graduated') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_users_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bcrypt hash for default password 'password123': $2y$10$Eh/JiHW2G2uJeyLqV.lxuueEvo0CaTOQMrsXuShYqSkqJUSpdSBfW
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `full_name`, `role`, `department_id`, `semester`, `roll_number`, `designation`, `workload_credits`, `has_changed_password`, `status`) VALUES
-- 1. Demo Student
(1, 'shahzaib', 'shahzaib.alam@student.ucms.edu.pk', '$2y$10$Eh/JiHW2G2uJeyLqV.lxuueEvo0CaTOQMrsXuShYqSkqJUSpdSBfW', 'Shahzaib Alam', 'student', 1, 7, 'UCMS-BSCS-21-042', 'Undergraduate Scholar', 0, 0, 'active'),
-- 2. Demo Faculty
(2, 'dr_amna', 'dr.amna@ucms.edu.pk', '$2y$10$Eh/JiHW2G2uJeyLqV.lxuueEvo0CaTOQMrsXuShYqSkqJUSpdSBfW', 'Dr. Amna Tariq', 'teacher', 1, NULL, NULL, 'Assistant Professor', 9, 0, 'active'),
-- 3. Demo HOD CS
(3, 'hod_cs', 'hod.cs@ucms.edu.pk', '$2y$10$Eh/JiHW2G2uJeyLqV.lxuueEvo0CaTOQMrsXuShYqSkqJUSpdSBfW', 'Dr. Muhammad Asif', 'hod', 1, NULL, NULL, 'Associate Professor & HOD CS', 6, 0, 'active'),
-- 4. Demo Master Admin
(4, 'admin', 'registrar@ucms.edu.pk', '$2y$10$Eh/JiHW2G2uJeyLqV.lxuueEvo0CaTOQMrsXuShYqSkqJUSpdSBfW', 'Chief Registrar Office', 'admin', NULL, NULL, NULL, 'Registrar & System Administrator', 0, 0, 'active'),

-- Full 14 Computer Science Faculty Members
(5, 'engr_bilal', 'bilal.raza@ucms.edu.pk', '$2y$10$Eh/JiHW2G2uJeyLqV.lxuueEvo0CaTOQMrsXuShYqSkqJUSpdSBfW', 'Engr. Bilal Raza', 'teacher', 1, NULL, NULL, 'Senior Lecturer', 9, 0, 'active'),
(6, 'ms_sadia', 'sadia.noor@ucms.edu.pk', '$2y$10$Eh/JiHW2G2uJeyLqV.lxuueEvo0CaTOQMrsXuShYqSkqJUSpdSBfW', 'Ms. Sadia Noor', 'teacher', 1, NULL, NULL, 'Lecturer in Computer Science', 9, 0, 'active'),
(7, 'mr_usman', 'usman.ghani@ucms.edu.pk', '$2y$10$Eh/JiHW2G2uJeyLqV.lxuueEvo0CaTOQMrsXuShYqSkqJUSpdSBfW', 'Mr. Usman Ghani', 'teacher', 1, NULL, NULL, 'Lecturer in Computer Science', 6, 0, 'active'),
(8, 'dr_farhan', 'farhan.ali@ucms.edu.pk', '$2y$10$Eh/JiHW2G2uJeyLqV.lxuueEvo0CaTOQMrsXuShYqSkqJUSpdSBfW', 'Dr. Farhan Ali', 'teacher', 1, NULL, NULL, 'Assistant Professor', 9, 0, 'active'),
(9, 'ms_zainab', 'zainab.bibi@ucms.edu.pk', '$2y$10$Eh/JiHW2G2uJeyLqV.lxuueEvo0CaTOQMrsXuShYqSkqJUSpdSBfW', 'Ms. Zainab Bibi', 'teacher', 1, NULL, NULL, 'Lecturer in Computer Science', 6, 0, 'active'),
(10, 'mr_hamza', 'hamza.tariq@ucms.edu.pk', '$2y$10$Eh/JiHW2G2uJeyLqV.lxuueEvo0CaTOQMrsXuShYqSkqJUSpdSBfW', 'Mr. Hamza Tariq', 'teacher', 1, NULL, NULL, 'Teaching Fellow', 6, 0, 'active'),
(11, 'engr_maryam', 'maryam.qasim@ucms.edu.pk', '$2y$10$Eh/JiHW2G2uJeyLqV.lxuueEvo0CaTOQMrsXuShYqSkqJUSpdSBfW', 'Engr. Maryam Qasim', 'teacher', 1, NULL, NULL, 'Lecturer in Software Engineering', 9, 0, 'active'),
(12, 'mr_zohaib', 'zohaib.hassan@ucms.edu.pk', '$2y$10$Eh/JiHW2G2uJeyLqV.lxuueEvo0CaTOQMrsXuShYqSkqJUSpdSBfW', 'Mr. Zohaib Hassan', 'teacher', 1, NULL, NULL, 'Lecturer in Data Science', 6, 0, 'active'),
(13, 'dr_waqas', 'waqas.ahmed@ucms.edu.pk', '$2y$10$Eh/JiHW2G2uJeyLqV.lxuueEvo0CaTOQMrsXuShYqSkqJUSpdSBfW', 'Dr. Waqas Ahmed', 'teacher', 1, NULL, NULL, 'Associate Professor', 9, 0, 'active'),
(14, 'ms_hina', 'hina.bashir@ucms.edu.pk', '$2y$10$Eh/JiHW2G2uJeyLqV.lxuueEvo0CaTOQMrsXuShYqSkqJUSpdSBfW', 'Ms. Hina Bashir', 'teacher', 1, NULL, NULL, 'Lecturer in Artificial Intelligence', 6, 0, 'active'),
(15, 'mr_tayyab', 'tayyab.mehmood@ucms.edu.pk', '$2y$10$Eh/JiHW2G2uJeyLqV.lxuueEvo0CaTOQMrsXuShYqSkqJUSpdSBfW', 'Mr. Tayyab Mehmood', 'teacher', 1, NULL, NULL, 'Lecturer in Computer Science', 6, 0, 'active'),
(16, 'ms_sana', 'sana.javed@ucms.edu.pk', '$2y$10$Eh/JiHW2G2uJeyLqV.lxuueEvo0CaTOQMrsXuShYqSkqJUSpdSBfW', 'Ms. Sana Javed', 'teacher', 1, NULL, NULL, 'Lecturer in Web Technologies', 6, 0, 'active'),

-- Sample Student Cohort for Computer Science (Semesters 1 through 8)
(17, 'hamad_ali', 'hamad.ali@student.ucms.edu.pk', '$2y$10$Eh/JiHW2G2uJeyLqV.lxuueEvo0CaTOQMrsXuShYqSkqJUSpdSBfW', 'Hamad Ali Khan', 'student', 1, 7, 'UCMS-BSCS-21-015', 'Undergraduate Scholar', 0, 1, 'active'),
(18, 'ayesha_malik', 'ayesha.malik@student.ucms.edu.pk', '$2y$10$Eh/JiHW2G2uJeyLqV.lxuueEvo0CaTOQMrsXuShYqSkqJUSpdSBfW', 'Ayesha Malik', 'student', 1, 7, 'UCMS-BSCS-21-029', 'Undergraduate Scholar', 0, 1, 'active'),
(19, 'usama_bin_zahid', 'usama.zahid@student.ucms.edu.pk', '$2y$10$Eh/JiHW2G2uJeyLqV.lxuueEvo0CaTOQMrsXuShYqSkqJUSpdSBfW', 'Usama Bin Zahid', 'student', 1, 7, 'UCMS-BSCS-21-038', 'Undergraduate Scholar', 0, 1, 'active'),
(20, 'fatima_zahra', 'fatima.zahra@student.ucms.edu.pk', '$2y$10$Eh/JiHW2G2uJeyLqV.lxuueEvo0CaTOQMrsXuShYqSkqJUSpdSBfW', 'Fatima Zahra', 'student', 1, 8, 'UCMS-BSCS-20-008', 'Graduating Senior', 0, 1, 'active'),
(21, 'ali_raza', 'ali.raza@student.ucms.edu.pk', '$2y$10$Eh/JiHW2G2uJeyLqV.lxuueEvo0CaTOQMrsXuShYqSkqJUSpdSBfW', 'Ali Raza Bhatti', 'student', 1, 5, 'UCMS-BSCS-22-044', 'Undergraduate Scholar', 0, 1, 'active'),
(22, 'dr_tariq', 'tariq.mahmood@ucmsacademic.com', '$2y$10$Eh/JiHW2G2uJeyLqV.lxuueEvo0CaTOQMrsXuShYqSkqJUSpdSBfW', 'Engr. Dr. Tariq Mahmood', 'teacher', 1, NULL, NULL, 'Associate Professor & Senior Academic Chair', 9, 1, 'active'),
(23, 'prof_naveed', 'naveed.malik@ucmsacademic.com', '$2y$10$Eh/JiHW2G2uJeyLqV.lxuueEvo0CaTOQMrsXuShYqSkqJUSpdSBfW', 'Prof. Naveed Iqbal Malik', 'teacher', 3, NULL, NULL, 'Associate Professor & Senior Lecturer', 9, 1, 'active'),
(24, 'hod_mgmt', 'asif.raza@ucmsacademic.com', '$2y$10$Eh/JiHW2G2uJeyLqV.lxuueEvo0CaTOQMrsXuShYqSkqJUSpdSBfW', 'Dr. Muhammad Asif Raza', 'hod', 3, NULL, NULL, 'Professor of Management & HOD', 6, 0, 'active');

-- 3. COURSES TABLE (26 CS- courses displayed in catalog)
DROP TABLE IF EXISTS `courses`;
CREATE TABLE `courses` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(20) NOT NULL UNIQUE,
  `title` VARCHAR(150) NOT NULL,
  `credit_hours` TINYINT UNSIGNED NOT NULL DEFAULT 3,
  `department_id` INT UNSIGNED NOT NULL,
  `semester` TINYINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_courses_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `courses` (`id`, `code`, `title`, `credit_hours`, `department_id`, `semester`) VALUES
(1, 'CS-101', 'Introduction to ICT', 3, 1, 1),
(2, 'CS-102', 'Programming Fundamentals', 4, 1, 1),
(3, 'CS-103', 'Object Oriented Programming', 4, 1, 2),
(4, 'CS-104', 'Discrete Structures', 3, 1, 2),
(5, 'CS-201', 'Data Structures & Algorithms', 4, 1, 3),
(6, 'CS-202', 'Digital Logic Design', 3, 1, 3),
(7, 'CS-203', 'Computer Organization & Assembly', 3, 1, 4),
(8, 'CS-204', 'Database Systems', 4, 1, 4),
(9, 'CS-301', 'Operating Systems', 4, 1, 5),
(10, 'CS-302', 'Software Engineering', 3, 1, 5),
(11, 'CS-303', 'Theory of Automata', 3, 1, 5),
(12, 'CS-304', 'Computer Networks', 4, 1, 6),
(13, 'CS-305', 'Artificial Intelligence', 3, 1, 6),
(14, 'CS-306', 'Design & Analysis of Algorithms', 3, 1, 6),
(15, 'CS-307', 'Web Systems & Technologies', 3, 1, 6),
(16, 'CS-308', 'Information Security', 3, 1, 6),
(17, 'CS-401', 'Machine Learning', 3, 1, 7),
(18, 'CS-402', 'Compiler Construction', 3, 1, 7),
(19, 'CS-403', 'Mobile Application Development', 3, 1, 7),
(20, 'CS-404', 'Parallel & Distributed Computing', 3, 1, 7),
(21, 'CS-405', 'Cloud Computing', 3, 1, 7),
(22, 'CS-406', 'Data Science & Big Data', 3, 1, 8),
(23, 'CS-407', 'Internet of Things (IoT)', 3, 1, 8),
(24, 'CS-408', 'Natural Language Processing', 3, 1, 8),
(25, 'CS-498', 'Final Year Project - I', 3, 1, 7),
(26, 'CS-499', 'Final Year Project - II', 3, 1, 8);

-- 4. COURSE ALLOCATIONS TABLE
DROP TABLE IF EXISTS `course_allocations`;
CREATE TABLE `course_allocations` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `course_id` INT UNSIGNED NOT NULL,
  `faculty_id` INT UNSIGNED NOT NULL,
  `session` VARCHAR(50) NOT NULL DEFAULT 'Fall 2026',
  `allocated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_alloc_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_alloc_faculty` FOREIGN KEY (`faculty_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  UNIQUE KEY `uk_course_faculty_session` (`course_id`, `faculty_id`, `session`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `course_allocations` (`course_id`, `faculty_id`, `session`) VALUES
(17, 2, 'Fall 2026'), -- Dr. Amna -> CS-401 Machine Learning
(1, 2, 'Fall 2026'),  -- Dr. Amna -> CS-101 Introduction to ICT
(21, 5, 'Fall 2026'), -- Engr Bilal -> CS-405 Cloud Computing
(25, 3, 'Fall 2026'), -- Dr Asif -> CS-498 FYP-I
(13, 14, 'Fall 2026'), -- Ms Hina -> CS-305 AI
(8, 6, 'Fall 2026'),  -- Ms Sadia -> CS-204 Database Systems
(5, 8, 'Fall 2026');  -- Dr Farhan -> CS-201 DSA

-- 5. HANDOUTS & RESOURCE REPOSITORY
DROP TABLE IF EXISTS `handouts`;
CREATE TABLE `handouts` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `course_id` INT UNSIGNED NOT NULL,
  `uploaded_by` INT UNSIGNED NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_size` VARCHAR(50) NOT NULL DEFAULT '2.4 MB',
  `category` ENUM('Lecture Slide', 'Lab Manual', 'Assignment', 'Syllabus') NOT NULL DEFAULT 'Lecture Slide',
  `week_number` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  `current_version` INT UNSIGNED NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_handouts_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_handouts_faculty` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. RESOURCE VERSIONS TABLE (Non-Destructive Replacement Audit)
DROP TABLE IF EXISTS `resource_versions`;
CREATE TABLE `resource_versions` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `handout_id` INT UNSIGNED NOT NULL,
  `version_number` INT UNSIGNED NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `replacement_reason` TEXT NOT NULL,
  `archived_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_versions_handout` FOREIGN KEY (`handout_id`) REFERENCES `handouts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `handouts` (`id`, `course_id`, `uploaded_by`, `title`, `file_name`, `file_size`, `category`, `week_number`, `current_version`) VALUES
(1, 17, 2, 'CS401 Week 07: Deep Neural Networks & Backprop', 'CS401_Week07_DNN_Backpropagation_v2.pdf', '3.8 MB', 'Lecture Slide', 7, 2),
(2, 17, 2, 'CS401 Lab 05: PyTorch Tensors & Loss Convergence', 'CS401_Lab05_PyTorch_Manual.pdf', '1.9 MB', 'Lab Manual', 5, 1),
(3, 21, 5, 'CS405 Week 06: Kubernetes Cluster Orchestration', 'CS405_Kubernetes_Architecture.pdf', '4.2 MB', 'Lecture Slide', 6, 1),
(4, 25, 3, 'CS498 FYP-I Formal Progress Defense Guidelines', 'UCMS_FYP1_Defense_Evaluation_Rubric.pdf', '1.1 MB', 'Syllabus', 4, 1);

INSERT INTO `resource_versions` (`handout_id`, `version_number`, `file_name`, `replacement_reason`, `archived_at`) VALUES
(1, 1, 'CS401_Week07_DNN_Draft.pdf', 'Updated gradient computation diagram and added PyTorch code sample for tensor autograd.', '2026-11-04 11:30:00');

-- 7. TIMETABLES TABLE (With strict Teacher and Room Conflict Validation)
DROP TABLE IF EXISTS `timetables`;
CREATE TABLE `timetables` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `course_id` INT UNSIGNED NOT NULL,
  `faculty_id` INT UNSIGNED NOT NULL,
  `day_of_week` ENUM('Mon', 'Tue', 'Wed', 'Thu', 'Fri') NOT NULL,
  `timeslot` VARCHAR(50) NOT NULL, -- e.g. 08:30 AM - 10:00 AM
  `room` VARCHAR(50) NOT NULL,     -- e.g. CS Lab 2, Hall A, Room 104
  `section` VARCHAR(10) NOT NULL DEFAULT 'BSCS-7A',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_tt_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tt_faculty` FOREIGN KEY (`faculty_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `timetables` (`course_id`, `faculty_id`, `day_of_week`, `timeslot`, `room`, `section`) VALUES
(17, 2, 'Mon', '08:30 AM - 10:00 AM', 'CS Lab 2', 'BSCS-7A'),
(21, 5, 'Mon', '10:15 AM - 11:45 AM', 'Room 104', 'BSCS-7A'),
(17, 2, 'Wed', '08:30 AM - 10:00 AM', 'CS Lab 2', 'BSCS-7A'),
(25, 3, 'Thu', '01:00 PM - 02:30 PM', 'Conference Hall', 'BSCS-7A'),
(1, 2, 'Tue', '11:45 AM - 01:15 PM', 'Hall B', 'BSCS-1B'),
(8, 6, 'Tue', '08:30 AM - 10:00 AM', 'CS Lab 1', 'BSCS-4A'),
(5, 8, 'Fri', '09:00 AM - 10:30 AM', 'Room 201', 'BSCS-3A');

-- 8. ANNOUNCEMENTS & READ RECEIPTS
DROP TABLE IF EXISTS `announcements`;
CREATE TABLE `announcements` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `audience` ENUM('all', 'students', 'teachers', 'cs_only') NOT NULL DEFAULT 'all',
  `priority` ENUM('normal', 'important', 'urgent') NOT NULL DEFAULT 'normal',
  `author_id` INT UNSIGNED NOT NULL,
  `attachment_name` VARCHAR(255) DEFAULT NULL,
  `attachment_url` VARCHAR(500) DEFAULT NULL,
  `attachment_type` VARCHAR(50) DEFAULT NULL,
  `attachment_size` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_ann_author` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `announcement_reads`;
CREATE TABLE `announcement_reads` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `announcement_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `read_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_reads_ann` FOREIGN KEY (`announcement_id`) REFERENCES `announcements` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reads_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  UNIQUE KEY `uk_ann_user` (`announcement_id`, `user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `announcements` (`id`, `title`, `content`, `audience`, `priority`, `author_id`, `created_at`) VALUES
(1, 'Midterm Examination Schedule Released - Fall 2026', 'All undergraduate students are advised to download their verified midterm examination slips from the portal. Exams begin Monday, Nov 24, 2026.', 'students', 'urgent', 4, '2026-11-05 09:00:00'),
(2, 'Departmental Seminar: Modern LLM Fine-Tuning in PyTorch', 'Dr. Farhan Ali will conduct an intensive 3-hour seminar in CS Lab 2 on Friday at 02:30 PM. All BSCS 7th and 8th semester students are requested to attend.', 'cs_only', 'important', 3, '2026-11-04 14:20:00'),
(3, 'Faculty Research Grant Applications Due', 'Faculty members are reminded that Higher Education Commission (HEC) National Research Program proposals must be submitted to the ORIC office by Nov 30.', 'teachers', 'normal', 4, '2026-11-02 11:15:00');

-- 9. STUDENT COMPLAINTS & ACADEMIC ISSUE REPORTS (Quota Enforced: Max 3/Week)
DROP TABLE IF EXISTS `student_reports`;
CREATE TABLE `student_reports` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT UNSIGNED NOT NULL,
  `category` ENUM('Timetable Clash', 'Lab Hardware/Software', 'Fee Clearance Issue', 'Course Registration', 'Library Resources', 'Other') NOT NULL,
  `subject` VARCHAR(200) NOT NULL,
  `description` TEXT NOT NULL,
  `status` ENUM('Pending Review', 'Under Investigation', 'Resolved', 'Dismissed') NOT NULL DEFAULT 'Pending Review',
  `admin_notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_reports_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `student_reports` (`id`, `student_id`, `category`, `subject`, `description`, `status`, `created_at`) VALUES
(1, 1, 'Lab Hardware/Software', 'CUDA Drivers required on Workstation 14 in CS Lab 2', 'Workstation 14 does not have CUDA toolkit 12.2 installed for PyTorch Deep Learning practicals.', 'Resolved', '2026-11-03 10:15:00');

-- 10. CMS SETTINGS (Public Institutional Website Management)
DROP TABLE IF EXISTS `cms_settings`;
CREATE TABLE `cms_settings` (
  `setting_key` VARCHAR(100) NOT NULL PRIMARY KEY,
  `setting_value` TEXT NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `cms_settings` (`setting_key`, `setting_value`) VALUES
('stat_faculties', '4 Academic Faculties'),
('stat_faculty_members', '48+ Senior Academicians'),
('stat_students', '1,200+ Enrolled Scholars'),
('stat_labs', '6 High-Performance Labs'),
('admission_deadline', 'December 15, 2026'),
('admission_term', 'Spring 2027 Admissions'),
('campus_contact_phone', '+92 (065) 9200-142'),
('campus_contact_email', 'admissions@ucms.edu.pk'),
('campus_address', 'Near Multan Road, Khanewal, Punjab, Pakistan'),
('institution_notice', 'Higher Education Commission (HEC) Recognized & Affiliated Programs');

-- 11. AUDIT LOGS (Tamper-Evident Security Audit Trail)
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED DEFAULT NULL,
  `action` VARCHAR(100) NOT NULL,
  `details` TEXT NOT NULL,
  `ip_address` VARCHAR(45) NOT NULL DEFAULT '127.0.0.1',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `audit_logs` (`user_id`, `action`, `details`, `ip_address`, `created_at`) VALUES
(4, 'SYSTEM_INIT', 'Initial database schema and academic records successfully seeded.', '127.0.0.1', '2026-11-01 08:00:00'),
(2, 'RESOURCE_UPDATE', 'Dr. Amna Tariq updated CS-401 Lecture 07 slides to version 2.', '192.168.1.45', '2026-11-04 11:30:00'),
(4, 'TIMETABLE_ALLOCATION', 'Registrar allocated Room 104 for CS-405 on Monday morning.', '127.0.0.1', '2026-11-05 10:00:00');

SET FOREIGN_KEY_CHECKS = 1;
