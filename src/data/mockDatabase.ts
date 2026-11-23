/**
 * UCMS UNIFIED 5-IN-1 DIGITAL CAMPUS PORTAL
 * Unified Institutional Data Store (Mirror of database.sql)
 */

export interface Department {
  id: number;
  code: string;
  name: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: 'student' | 'teacher' | 'hod' | 'admin';
  department_id: number | null;
  department_name?: string;
  semester?: number | null;
  roll_number?: string | null;
  designation?: string | null;
  batch?: string;
  session?: string;
  institutional_id?: string;
  avatar_url?: string;
  workload_credits?: number;
  chamber?: string;
  appointment_type?: string;
  qualification?: string;
  phone?: string;
  password?: string;
  has_changed_password: boolean;
  status: 'active' | 'suspended' | 'graduated';
}

export interface Course {
  id: number;
  code: string;
  title: string;
  credit_hours: number;
  credit_display?: string;
  department_id: number;
  semester: number;
  section?: string;
  room?: string;
  schedule_display?: string;
  materials_count?: number;
  description?: string;
  enrolled_count?: number;
  assigned_sections?: string;
  venue?: string;
  syllabus_coverage?: number;
  allocated_teacher_id?: number | null;
  allocated_teacher_name?: string | null;
}

export interface Handout {
  id: number;
  course_id: number;
  course_code: string;
  course_title: string;
  uploaded_by: number;
  title: string;
  file_name: string;
  file_size: string;
  category: string;
  week_number: number;
  current_version: number;
  updated_at: string;
  key_objectives?: string[];
}

export interface StudyBookmark {
  id: number;
  student_id: number;
  item_type: 'course' | 'handout' | 'note';
  target_id?: number;
  course_code?: string;
  title: string;
  subtitle?: string;
  meta_info?: string;
  file_size?: string;
  created_at: string;
}

export interface ResourceVersion {
  id: number;
  handout_id: number;
  version_number: number;
  file_name: string;
  replacement_reason: string;
  archived_at: string;
}

export interface TimetableSlot {
  id: number;
  course_id: number;
  course_code: string;
  course_title: string;
  faculty_id: number;
  faculty_name: string;
  day_of_week: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri';
  timeslot: string;
  room: string;
  section: string;
  session_type?: 'Theory Lecture' | 'Lab Session' | 'Tutorial';
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  audience: 'all' | 'students' | 'teachers' | 'cs_only';
  priority: 'normal' | 'important' | 'urgent';
  author: string;
  uploader_role?: 'HOD CS' | 'ADMIN' | 'FACULTY' | string;
  uploader_name?: string;
  deadline?: string;
  deadline_display?: string;
  created_at: string;
  is_read?: boolean;
  attachment_name?: string;
  attachment_url?: string;
  attachment_type?: 'image' | 'pdf' | 'doc' | 'file';
  attachment_size?: string;
}

export interface AcademicAssessment {
  id: number;
  course_id: number;
  course_code: string;
  course_title: string;
  type: 'Quiz' | 'Assignment' | 'Lab Assessment';
  title: string;
  description?: string;
  total_marks: number;
  deadline_date: string;
  deadline_time: string;
  deadline_display: string;
  created_at: string;
  teacher_id?: number;
  teacher_name?: string;
  submission_status: 'Pending' | 'Submitted';
  submitted_at?: string;
  submission_note?: string;
  file_name?: string;
}

export interface StudentReport {
  id: number;
  student_id: number;
  student_name: string;
  category: string;
  subject: string;
  description: string;
  status: 'Pending Review' | 'Under Investigation' | 'Resolved' | 'Dismissed';
  created_at: string;
  course_code?: string;
  handout_title?: string;
  handout_name?: string;
  slot_info?: string;
  week_text?: string;
  error_tag?: 'TYPO/ERROR' | 'MISSING PAGES' | 'CLARIFICATION' | string;
  reporter_roll?: string;
  resolution_note?: string;
}

export interface CmsSettings {
  stat_faculties: string;
  stat_faculty_members: string;
  stat_students: string;
  stat_labs: string;
  admission_deadline: string;
  admission_term: string;
  campus_contact_phone: string;
  campus_contact_email: string;
  campus_address: string;
  institution_notice: string;
  background_image?: string;
}

export interface AuditLog {
  id: number;
  user_name: string;
  action: string;
  details: string;
  ip_address: string;
  created_at: string;
}

export const INITIAL_DEPARTMENTS: Department[] = [
  { id: 1, code: 'CS', name: 'Department of Computer Science' },
  { id: 2, code: 'IT', name: 'Department of Information Technology' },
  { id: 3, code: 'BBA', name: 'Department of Business Administration' },
  { id: 4, code: 'BSMLT', name: 'Department of Medical Laboratory Technology' },
  { id: 5, code: 'BSEnglish', name: 'Department of English Linguistics & Literature' },
  { id: 6, code: 'BSAI', name: 'Department of Artificial Intelligence' },
  { id: 7, code: 'BSMath', name: 'Department of Mathematics' },
];

export const INITIAL_USERS: User[] = [
  // Demo Student (Shahzaib Alam) - BS Computer Science (Semester 5 - Active Odd Intake)
  {
    id: 1,
    username: 'shahzaib',
    email: 'shahzaib.alam@student.ucms.edu.pk',
    full_name: 'Shahzaib Alam',
    role: 'student',
    department_id: 1,
    department_name: 'Department of Computer Science',
    semester: 5,
    roll_number: 'UCMS-BSCS-2022-041',
    batch: 'Batch 2022-2026',
    session: 'Spring 2025',
    institutional_id: 'UCMS-2022-041',
    avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80',
    designation: 'Undergraduate Scholar',
    workload_credits: 0,
    has_changed_password: false,
    status: 'active',
  },
  // Demo Faculty (Prof. Asim Riaz - CS Faculty)
  {
    id: 2,
    username: 'dr_amna',
    email: 'asim.riaz@ucms.edu.pk',
    full_name: 'Prof. Asim Riaz',
    role: 'teacher',
    department_id: 1,
    department_name: 'Department of Computer Science',
    semester: null,
    roll_number: null,
    designation: 'Assistant Professor - CS',
    institutional_id: 'UCMS-FAC-2018-042',
    batch: 'Spring 2025 (Morning)',
    session: 'Spring 2025',
    workload_credits: 12,
    chamber: 'Room 204, Academic Block B',
    appointment_type: 'Grade-19 · Tenured Regular',
    qualification: 'M.S. Computer Science',
    phone: '+92 300 1234567',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    has_changed_password: false,
    status: 'active',
  },
  {
    id: 202,
    username: 'prof_asim',
    email: 'asim.riaz@ucms.edu.pk',
    full_name: 'Prof. Asim Riaz',
    role: 'teacher',
    department_id: 1,
    department_name: 'Department of Computer Science',
    semester: null,
    roll_number: null,
    designation: 'Assistant Professor - CS',
    institutional_id: 'UCMS-FAC-2018-042',
    batch: 'Spring 2025 (Morning)',
    session: 'Spring 2025',
    workload_credits: 12,
    chamber: 'Room 204, Academic Block B',
    appointment_type: 'Grade-19 · Tenured Regular',
    qualification: 'M.S. Computer Science',
    phone: '+92 300 1234567',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    has_changed_password: false,
    status: 'active',
  },
  // Demo HOD CS (Dr. Muhammad Asif) - Matches HOD Video hod_05.jpg & hod_70.jpg
  {
    id: 3,
    username: 'dr_asif',
    email: 'hod.cs@ucms.edu.pk',
    full_name: 'Dr. Muhammad Asif',
    role: 'hod',
    department_id: 1,
    department_name: 'Department of Computer Science',
    semester: null,
    roll_number: null,
    designation: 'Tenured Professor & HOD',
    institutional_id: 'UCMS-HOD-001',
    chamber: 'Executive Wing HOD-01',
    qualification: 'Ph.D. Computer Science',
    phone: '+92 300 7891234',
    workload_credits: 6,
    has_changed_password: false,
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 303,
    username: 'hod_cs',
    email: 'hod.cs@ucms.edu.pk',
    full_name: 'Dr. Muhammad Asif',
    role: 'hod',
    department_id: 1,
    department_name: 'Department of Computer Science',
    semester: null,
    roll_number: null,
    designation: 'Tenured Professor & HOD',
    institutional_id: 'UCMS-HOD-001',
    chamber: 'Executive Wing HOD-01',
    qualification: 'Ph.D. Computer Science',
    phone: '+92 300 7891234',
    workload_credits: 6,
    has_changed_password: false,
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
  },
  // Distinct HOD IT (Dr. Muhammad Usman) - Separate IT Department
  {
    id: 304,
    username: 'hod_it',
    email: 'hod.it@ucms.edu.pk',
    full_name: 'Dr. Muhammad Usman',
    role: 'hod',
    department_id: 2,
    department_name: 'Department of Information Technology',
    semester: null,
    roll_number: null,
    designation: 'Head of Department (HOD) - Information Technology',
    institutional_id: 'UCMS-HOD-002',
    chamber: 'HOD Suite - Room 102',
    qualification: 'Ph.D. Information Technology',
    phone: '+92 300 6543210',
    workload_credits: 6,
    has_changed_password: false,
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
  },
  // HOD BBA (Dr. Muhammad Asif Raza)
  {
    id: 25,
    username: 'hod_mgmt',
    email: 'asif.raza@ucms.edu.pk',
    full_name: 'Dr. Muhammad Asif Raza',
    role: 'hod',
    department_id: 3,
    department_name: 'Department of Business Administration',
    designation: 'Professor of Management & HOD',
    institutional_id: 'UCMS-HOD-003',
    chamber: 'Business Block HOD-01',
    qualification: 'Ph.D. Business Administration',
    phone: '+92 300 9876543',
    workload_credits: 6,
    has_changed_password: false,
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80',
  },
  // HOD BSMLT (Dr. Naveed Iqbal Malik)
  {
    id: 24,
    username: 'hod_mlt',
    email: 'naveed.malik@ucms.edu.pk',
    full_name: 'Prof. Naveed Iqbal Malik',
    role: 'hod',
    department_id: 4,
    department_name: 'Department of Medical Laboratory Technology',
    designation: 'Head of Department - MLT',
    institutional_id: 'UCMS-HOD-004',
    chamber: 'Medical Block HOD-01',
    qualification: 'M.Phil Pathology & Clinical Lab Sciences',
    phone: '+92 301 8765432',
    workload_credits: 6,
    has_changed_password: false,
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=80',
  },
  // HOD BSEnglish (Dr. Sarah Khan)
  {
    id: 305,
    username: 'hod_english',
    email: 'sarah.khan@ucms.edu.pk',
    full_name: 'Dr. Sarah Khan',
    role: 'hod',
    department_id: 5,
    department_name: 'Department of English Linguistics & Literature',
    designation: 'Head of Department - English',
    institutional_id: 'UCMS-HOD-005',
    chamber: 'Humanities Wing HOD-01',
    qualification: 'Ph.D. Applied Linguistics',
    phone: '+92 302 7654321',
    workload_credits: 6,
    has_changed_password: false,
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
  },
  // HOD BSAI (Dr. Farhan Ali)
  {
    id: 306,
    username: 'hod_ai',
    email: 'farhan.ali@ucms.edu.pk',
    full_name: 'Dr. Farhan Ali',
    role: 'hod',
    department_id: 6,
    department_name: 'Department of Artificial Intelligence',
    designation: 'Associate Professor & HOD AI',
    institutional_id: 'UCMS-HOD-006',
    chamber: 'AI Innovation Lab HOD-01',
    qualification: 'Ph.D. Artificial Intelligence & Robotics',
    phone: '+92 303 6543219',
    workload_credits: 6,
    has_changed_password: false,
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80',
  },
  // HOD BSMath (Dr. Waqas Ahmed)
  {
    id: 307,
    username: 'hod_math',
    email: 'waqas.ahmed@ucms.edu.pk',
    full_name: 'Dr. Waqas Ahmed',
    role: 'hod',
    department_id: 7,
    department_name: 'Department of Mathematics',
    designation: 'Head of Department - Mathematics',
    institutional_id: 'UCMS-HOD-007',
    chamber: 'Basic Sciences Block HOD-01',
    qualification: 'Ph.D. Applied Mathematics',
    phone: '+92 304 5432198',
    workload_credits: 6,
    has_changed_password: false,
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=256&q=80',
  },
  // Demo Admin (Registrar Admin - Matches Admin Video)
  {
    id: 4,
    username: 'admin',
    email: 'registrar@ucms.edu.pk',
    full_name: 'Registrar Admin',
    role: 'admin',
    department_id: null,
    department_name: 'Central Academic Administration',
    semester: null,
    roll_number: null,
    designation: 'Chief Registrar & Super Administrator',
    institutional_id: 'UCMS-ADM-001',
    workload_credits: 0,
    has_changed_password: false,
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80',
  },
  // CS Faculty Members (Matching Video hod_05.jpg and hod_20.jpg)
  {
    id: 5,
    username: 'engr_noman',
    email: 'noman.ali@ucmsacademic.com',
    full_name: 'Engr. Noman Ali',
    role: 'teacher',
    department_id: 1,
    department_name: 'Department of Computer Science',
    designation: 'Assistant Professor',
    qualification: 'M.S. Computer Science',
    phone: '+92 309 0123456',
    chamber: 'Faculty Block B-17',
    workload_credits: 7,
    has_changed_password: true,
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 6,
    username: 'ms_rabia',
    email: 'rabia.zafar@ucmsacademic.com',
    full_name: 'Ms. Rabia Zafar',
    role: 'teacher',
    department_id: 1,
    department_name: 'Department of Computer Science',
    designation: 'Lecturer',
    qualification: 'M.Phil Mathematics & Computing',
    phone: '+92 310 1234567',
    chamber: 'Faculty Block B-22',
    workload_credits: 9,
    has_changed_password: true,
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 7,
    username: 'mr_kashif',
    email: 'kashif.rauf@ucmsacademic.com',
    full_name: 'Mr. Kashif Rauf',
    role: 'teacher',
    department_id: 1,
    department_name: 'Department of Computer Science',
    designation: 'Lecturer',
    qualification: 'M.S. Computer Science',
    phone: '+92 311 2345678',
    chamber: 'Faculty Block B-23',
    workload_credits: 9,
    has_changed_password: true,
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 8,
    username: 'engr_zainab',
    email: 'zainab.lab@ucmsacademic.com',
    full_name: 'Engr. Zainab Bukhari',
    role: 'teacher',
    department_id: 1,
    department_name: 'Department of Computer Science',
    designation: 'Lab Engineer',
    qualification: 'B.S. Computer Science',
    phone: '+92 312 3456789',
    chamber: 'Software Lab Workshop L-2',
    workload_credits: 6,
    has_changed_password: true,
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 9,
    username: 'mr_adnan',
    email: 'adnan.haider@ucmsacademic.com',
    full_name: 'Mr. Adnan Haider',
    role: 'teacher',
    department_id: 1,
    department_name: 'Department of Computer Science',
    designation: 'Visiting Faculty',
    qualification: 'M.S. Computer Science',
    phone: '+92 313 4567890',
    chamber: 'Visiting Faculty Lounge',
    workload_credits: 3,
    has_changed_password: true,
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 10,
    username: 'engr_bilal',
    email: 'bilal.raza@ucms.edu.pk',
    full_name: 'Engr. Bilal Raza',
    role: 'teacher',
    department_id: 1,
    department_name: 'Department of Computer Science',
    designation: 'Senior Lecturer',
    qualification: 'M.S. Software Engineering',
    phone: '+92 301 2345678',
    chamber: 'Faculty Block B-12',
    workload_credits: 9,
    has_changed_password: true,
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 11,
    username: 'ms_sadia',
    email: 'sadia.noor@ucms.edu.pk',
    full_name: 'Ms. Sadia Noor',
    role: 'teacher',
    department_id: 1,
    department_name: 'Department of Computer Science',
    designation: 'Lecturer in Computer Science',
    qualification: 'M.Phil Computer Science',
    phone: '+92 302 3456789',
    chamber: 'Faculty Block B-14',
    workload_credits: 9,
    has_changed_password: true,
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 12,
    username: 'mr_usman',
    email: 'usman.ghani@ucms.edu.pk',
    full_name: 'Mr. Usman Ghani',
    role: 'teacher',
    department_id: 1,
    department_name: 'Department of Computer Science',
    designation: 'Lecturer in Computer Science',
    qualification: 'M.S. Information Security',
    phone: '+92 303 4567890',
    chamber: 'Faculty Block B-15',
    workload_credits: 6,
    has_changed_password: true,
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 13,
    username: 'ms_zainab',
    email: 'zainab.bibi@ucms.edu.pk',
    full_name: 'Ms. Zainab Bibi',
    role: 'teacher',
    department_id: 1,
    department_name: 'Department of Computer Science',
    designation: 'Lecturer in Computer Science',
    qualification: 'M.S. Data Science',
    phone: '+92 305 6789012',
    chamber: 'Faculty Block B-18',
    workload_credits: 6,
    has_changed_password: true,
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 14,
    username: 'mr_hamza_tariq',
    email: 'hamza.tariq@ucms.edu.pk',
    full_name: 'Mr. Hamza Tariq',
    role: 'teacher',
    department_id: 1,
    department_name: 'Department of Computer Science',
    designation: 'Teaching Fellow',
    qualification: 'B.S. Computer Science',
    phone: '+92 306 7890123',
    chamber: 'Faculty Block B-19',
    workload_credits: 6,
    has_changed_password: true,
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 15,
    username: 'engr_maryam',
    email: 'maryam.qasim@ucms.edu.pk',
    full_name: 'Engr. Maryam Qasim',
    role: 'teacher',
    department_id: 1,
    department_name: 'Department of Computer Science',
    designation: 'Lecturer in Software Engineering',
    qualification: 'M.S. Computer Engineering',
    phone: '+92 307 8901234',
    chamber: 'Faculty Block B-20',
    workload_credits: 9,
    has_changed_password: true,
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 16,
    username: 'mr_zohaib',
    email: 'zohaib.hassan@ucms.edu.pk',
    full_name: 'Mr. Zohaib Hassan',
    role: 'teacher',
    department_id: 1,
    department_name: 'Department of Computer Science',
    designation: 'Lecturer in Data Science',
    qualification: 'M.S. Machine Learning',
    phone: '+92 308 9012345',
    chamber: 'Faculty Block B-21',
    workload_credits: 6,
    has_changed_password: true,
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 23,
    username: 'dr_tariq',
    email: 'tariq.mahmood@ucmsacademic.com',
    full_name: 'Engr. Dr. Tariq Mahmood',
    role: 'teacher',
    department_id: 1,
    department_name: 'Department of Computer Science',
    designation: 'Associate Professor & Senior Academic Chair',
    qualification: 'Ph.D. Computer Systems',
    phone: '+92 300 4567890',
    chamber: 'Academic Block A-14',
    workload_credits: 9,
    has_changed_password: true,
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80',
  },
  // Students across UCMS Departments - ALL ON ACTIVE ODD SEMESTERS (1, 3, 5, 7)
  // Annual intake = currently only odd semesters are running!
  {
    id: 17,
    username: 'hamad_ali',
    email: 'hamad.ali@student.ucms.edu.pk',
    full_name: 'Hamad Ali Khan',
    role: 'student',
    department_id: 1,
    department_name: 'Department of Computer Science',
    semester: 7,
    roll_number: 'UCMS-BSCS-21-015',
    batch: 'Batch 2021-2025',
    designation: 'Undergraduate Scholar',
    has_changed_password: true,
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 18,
    username: 'ayesha_malik',
    email: 'ayesha.malik@student.ucms.edu.pk',
    full_name: 'Ayesha Malik',
    role: 'student',
    department_id: 1,
    department_name: 'Department of Computer Science',
    semester: 7,
    roll_number: 'UCMS-BSCS-21-029',
    batch: 'Batch 2021-2025',
    designation: 'Undergraduate Scholar',
    has_changed_password: true,
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 19,
    username: 'usama_bin_zahid',
    email: 'usama.zahid@student.ucms.edu.pk',
    full_name: 'Usama Bin Zahid',
    role: 'student',
    department_id: 1,
    department_name: 'Department of Computer Science',
    semester: 7,
    roll_number: 'UCMS-BSCS-21-038',
    batch: 'Batch 2021-2025',
    designation: 'Undergraduate Scholar',
    has_changed_password: true,
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 20,
    username: 'fatima_zahra',
    email: 'fatima.zahra@student.ucms.edu.pk',
    full_name: 'Fatima Zahra',
    role: 'student',
    department_id: 1,
    department_name: 'Department of Computer Science',
    semester: 5,
    roll_number: 'UCMS-BSCS-22-008',
    batch: 'Batch 2022-2026',
    designation: 'Undergraduate Scholar',
    has_changed_password: true,
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 21,
    username: 'muhammad_hamza',
    email: 'hamza.ucms2023@gmail.com',
    full_name: 'Muhammad Hamza',
    role: 'student',
    department_id: 1,
    department_name: 'Department of Computer Science',
    semester: 3,
    roll_number: 'UCMS-CS-2023-014',
    batch: 'Batch 2023-2027',
    designation: 'Undergraduate Scholar',
    has_changed_password: true,
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 22,
    username: 'ayesha_noor',
    email: 'ayesha.noor@ucmsacademic.com',
    full_name: 'Ayesha Noor',
    role: 'student',
    department_id: 1,
    department_name: 'Department of Computer Science',
    semester: 5,
    roll_number: 'UCMS-CS-2022-089',
    batch: 'Batch 2022-2026',
    designation: 'Undergraduate Scholar',
    has_changed_password: true,
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 27,
    username: 'zain_it',
    email: 'zain.malik@student.ucms.edu.pk',
    full_name: 'Zain Malik',
    role: 'student',
    department_id: 2,
    department_name: 'Department of Information Technology',
    semester: 5,
    roll_number: 'UCMS-BSIT-2022-019',
    batch: 'Batch 2022-2026',
    designation: 'Undergraduate Scholar',
    has_changed_password: true,
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 28,
    username: 'ali_bba',
    email: 'ali.raza@student.ucms.edu.pk',
    full_name: 'Ali Raza',
    role: 'student',
    department_id: 3,
    department_name: 'Department of Business Administration',
    semester: 3,
    roll_number: 'UCMS-BBA-2023-012',
    batch: 'Batch 2023-2027',
    designation: 'Undergraduate Scholar',
    has_changed_password: true,
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 29,
    username: 'sara_mlt',
    email: 'sara.ahmed@student.ucms.edu.pk',
    full_name: 'Sara Ahmed',
    role: 'student',
    department_id: 4,
    department_name: 'Department of Medical Laboratory Technology',
    semester: 5,
    roll_number: 'UCMS-MLT-2022-005',
    batch: 'Batch 2022-2026',
    designation: 'Clinical Scholar',
    has_changed_password: true,
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 30,
    username: 'bilal_eng',
    email: 'bilal.hassan@student.ucms.edu.pk',
    full_name: 'Bilal Hassan',
    role: 'student',
    department_id: 5,
    department_name: 'Department of English Linguistics & Literature',
    semester: 1,
    roll_number: 'UCMS-ENG-2024-002',
    batch: 'Batch 2024-2028',
    designation: 'Freshman Scholar',
    has_changed_password: true,
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 31,
    username: 'maryam_ai',
    email: 'maryam.tariq@student.ucms.edu.pk',
    full_name: 'Maryam Tariq',
    role: 'student',
    department_id: 6,
    department_name: 'Department of Artificial Intelligence',
    semester: 3,
    roll_number: 'UCMS-BSAI-2023-018',
    batch: 'Batch 2023-2027',
    designation: 'AI Scholar',
    has_changed_password: true,
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 32,
    username: 'usman_math',
    email: 'usman.khalid@student.ucms.edu.pk',
    full_name: 'Usman Khalid',
    role: 'student',
    department_id: 7,
    department_name: 'Department of Mathematics',
    semester: 5,
    roll_number: 'UCMS-MATH-2022-011',
    batch: 'Batch 2022-2026',
    designation: 'Mathematics Scholar',
    has_changed_password: true,
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=256&q=80',
  },
];

export const INITIAL_COURSES: Course[] = [
  // 6 Active Enrolled Courses for BSCS-VI Morning (Matching Video)
  {
    id: 101,
    code: 'CS-401',
    title: 'Design & Analysis of Algorithms',
    credit_hours: 3,
    credit_display: '3(3-0)',
    department_id: 1,
    semester: 6,
    section: 'BSCS-VI Morning',
    room: 'CS Block - Lab 3',
    schedule_display: 'Mon & Wed · 10:30 AM - 12:00 PM',
    materials_count: 4,
    allocated_teacher_id: 23,
    allocated_teacher_name: 'Prof. Muhammad Tariq',
  },
  {
    id: 102,
    code: 'CS-403',
    title: 'Database Administration & Optimization',
    credit_hours: 4,
    credit_display: '4(3-1)',
    department_id: 1,
    semester: 6,
    section: 'BSCS-VI Morning',
    room: 'Data Systems Lab (Ground Floor)',
    schedule_display: 'Tue & Thu · 08:30 AM - 10:00 AM',
    materials_count: 3,
    allocated_teacher_id: 5,
    allocated_teacher_name: 'Engr. Bilal Raza',
  },
  {
    id: 103,
    code: 'CS-405',
    title: 'Software Engineering & Agile Frameworks',
    credit_hours: 3,
    credit_display: '3(3-0)',
    department_id: 1,
    semester: 6,
    section: 'BSCS-VI Morning',
    room: 'Lecture Hall 2 (CS Wing)',
    schedule_display: 'Mon & Wed · 01:00 PM - 02:30 PM',
    materials_count: 2,
    allocated_teacher_id: 11,
    allocated_teacher_name: 'Dr. Nadia Parveen',
  },
  {
    id: 104,
    code: 'CS-407',
    title: 'Computer Networks & Distributed Systems',
    credit_hours: 4,
    credit_display: '4(3-1)',
    department_id: 1,
    semester: 6,
    section: 'BSCS-VI Morning',
    room: 'Network Infrastructure Lab (Room 204)',
    schedule_display: 'Tue & Thu · 11:00 AM - 01:00 PM',
    materials_count: 3,
    allocated_teacher_id: 10,
    allocated_teacher_name: 'Engr. Hamza Aslam',
  },
  {
    id: 105,
    code: 'CS-409',
    title: 'Web Application Development & Frameworks',
    credit_hours: 3,
    credit_display: '3(2-1)',
    department_id: 1,
    semester: 6,
    section: 'BSCS-VI Morning',
    room: 'Advanced Software Lab (Room 108)',
    schedule_display: 'Friday · 08:30 AM - 11:30 AM',
    materials_count: 2,
    allocated_teacher_id: 7,
    allocated_teacher_name: 'Engr. Usman Farooq',
  },
  {
    id: 106,
    code: 'CS-411',
    title: 'Artificial Intelligence & Knowledge Systems',
    credit_hours: 3,
    credit_display: '3(3-0)',
    department_id: 1,
    semester: 6,
    section: 'BSCS-VI Morning',
    room: 'AI Computing Lab 1',
    schedule_display: 'Mon & Thu · 02:30 PM - 04:00 PM',
    materials_count: 3,
    allocated_teacher_id: 23,
    allocated_teacher_name: 'Dr. Amna Tariq',
  },
  // 4 Official Teaching Courses Assigned to Prof. Asim Riaz (Matching Video)
  {
    id: 401,
    code: 'CS-401',
    title: 'Database Systems',
    credit_hours: 4,
    credit_display: '3+1 Cr',
    department_id: 1,
    semester: 6,
    section: 'BSCS-6A, BSCS-6B',
    assigned_sections: 'BSCS-6A, BSCS-6B',
    room: 'Room 204 & CS Lab 2',
    venue: 'Room 204 & CS Lab 2',
    schedule_display: 'Tue 11:00 AM - 12:30 PM & Thu',
    materials_count: 8,
    enrolled_count: 58,
    syllabus_coverage: 82,
    description: 'Relational algebra, SQL query optimization, transaction processing, concurrency control, and ACID compliance.',
    allocated_teacher_id: 2,
    allocated_teacher_name: 'Prof. Asim Riaz',
  },
  {
    id: 601,
    code: 'CS-601',
    title: 'Software Engineering',
    credit_hours: 3,
    credit_display: '3 Cr',
    department_id: 1,
    semester: 6,
    section: 'BSCS-4A',
    assigned_sections: 'BSCS-4A',
    room: 'Room 214',
    venue: 'Room 214',
    schedule_display: 'Tue 01:20 PM - 02:00 PM',
    materials_count: 5,
    enrolled_count: 48,
    syllabus_coverage: 76,
    description: 'Software development lifecycle models, agile methodologies, requirements engineering, design patterns, and QA test suites.',
    allocated_teacher_id: 2,
    allocated_teacher_name: 'Prof. Asim Riaz',
  },
  {
    id: 301,
    code: 'CS-301',
    title: 'Data Structures & Algorithms',
    credit_hours: 4,
    credit_display: '3+1 Cr',
    department_id: 1,
    semester: 4,
    section: 'BSCS-4A, BSCS-4B',
    assigned_sections: 'BSCS-4A, BSCS-4B',
    room: 'Room 208 & Lab 3',
    venue: 'Room 208 & Lab 3',
    schedule_display: 'Tue 03:15 PM - 04:45 PM',
    materials_count: 7,
    enrolled_count: 62,
    syllabus_coverage: 84,
    description: 'Trees, hash, graph traversals, dynamic programming, and computational complexity analysis.',
    allocated_teacher_id: 2,
    allocated_teacher_name: 'Prof. Asim Riaz',
  },
  {
    id: 402,
    code: 'CS-402',
    title: 'Cloud Computing & Distributed Systems',
    credit_hours: 3,
    credit_display: '3 Cr',
    department_id: 1,
    semester: 6,
    section: 'BSCS-6A',
    assigned_sections: 'BSCS-6A',
    room: 'Room 214',
    venue: 'Room 214',
    schedule_display: 'Wed & Thu 11:30 AM',
    materials_count: 6,
    enrolled_count: 44,
    syllabus_coverage: 69,
    description: 'Container orchestration, microservices communication, consensus protocols, and serverless compute.',
    allocated_teacher_id: 2,
    allocated_teacher_name: 'Prof. Asim Riaz',
  },
  // Supporting accredited CS catalogue courses (Total 26 CS courses)
  { id: 1, code: 'CS-101', title: 'Introduction to ICT', credit_hours: 3, credit_display: '3(2-1)', department_id: 1, semester: 1, section: 'BSCS-1A', room: 'CS Block - Lab 1', schedule_display: 'Mon & Wed · 08:30 AM - 10:00 AM', materials_count: 3, allocated_teacher_id: 5, allocated_teacher_name: 'Engr. Bilal Raza' },
  { id: 2, code: 'CS-102', title: 'Programming Fundamentals', credit_hours: 4, credit_display: '4(3-1)', department_id: 1, semester: 1, section: 'BSCS-1A', room: 'CS Block - Lab 2', schedule_display: 'Tue & Thu · 10:30 AM - 12:30 PM', materials_count: 5, allocated_teacher_id: 7, allocated_teacher_name: 'Mr. Usman Ghani' },
  { id: 3, code: 'CS-103', title: 'Object Oriented Programming', credit_hours: 4, credit_display: '4(3-1)', department_id: 1, semester: 2, section: 'BSCS-2A', room: 'CS Block - Lab 2', schedule_display: 'Mon & Wed · 11:00 AM - 01:00 PM', materials_count: 4, allocated_teacher_id: 6, allocated_teacher_name: 'Ms. Sadia Noor' },
  { id: 4, code: 'CS-104', title: 'Discrete Structures', credit_hours: 3, credit_display: '3(3-0)', department_id: 1, semester: 2, section: 'BSCS-2A', room: 'Lecture Hall 1', schedule_display: 'Tue & Thu · 01:00 PM - 02:30 PM', materials_count: 3, allocated_teacher_id: 8, allocated_teacher_name: 'Dr. Farhan Ali' },
  { id: 5, code: 'CS-105', title: 'Digital Logic Design', credit_hours: 4, credit_display: '4(3-1)', department_id: 1, semester: 2, section: 'BSCS-2A', room: 'DLD Hardware Lab', schedule_display: 'Friday · 08:30 AM - 11:30 AM', materials_count: 4, allocated_teacher_id: 11, allocated_teacher_name: 'Engr. Maryam Qasim' },
  { id: 6, code: 'CS-201', title: 'Data Structures & Algorithms', credit_hours: 4, credit_display: '4(3-1)', department_id: 1, semester: 3, section: 'BSCS-3A', room: 'CS Block - Lab 3', schedule_display: 'Mon & Wed · 09:00 AM - 11:00 AM', materials_count: 6, allocated_teacher_id: 12, allocated_teacher_name: 'Mr. Zohaib Hassan' },
  { id: 7, code: 'CS-202', title: 'Computer Organization & Assembly', credit_hours: 4, credit_display: '4(3-1)', department_id: 1, semester: 3, section: 'BSCS-3A', room: 'Hardware Lab', schedule_display: 'Tue & Thu · 10:00 AM - 12:00 PM', materials_count: 4, allocated_teacher_id: 13, allocated_teacher_name: 'Dr. Waqas Ahmed' },
  { id: 8, code: 'CS-203', title: 'Linear Algebra & Multivariable Calculus', credit_hours: 3, credit_display: '3(3-0)', department_id: 1, semester: 3, section: 'BSCS-3A', room: 'Lecture Hall 2', schedule_display: 'Friday · 09:00 AM - 12:00 PM', materials_count: 3, allocated_teacher_id: 15, allocated_teacher_name: 'Mr. Tayyab Mehmood' },
  { id: 9, code: 'CS-204', title: 'Theory of Automata & Formal Languages', credit_hours: 3, credit_display: '3(3-0)', department_id: 1, semester: 4, section: 'BSCS-4A', room: 'Room 208', schedule_display: 'Mon & Wed · 01:30 PM - 03:00 PM', materials_count: 4, allocated_teacher_id: 9, allocated_teacher_name: 'Ms. Zainab Bibi' },
  { id: 10, code: 'CS-206', title: 'Operating Systems & Concurrency', credit_hours: 4, credit_display: '4(3-1)', department_id: 1, semester: 4, section: 'BSCS-4A', room: 'CS Lab 2', schedule_display: 'Tue & Thu · 08:30 AM - 10:30 AM', materials_count: 5, allocated_teacher_id: 10, allocated_teacher_name: 'Mr. Hamza Tariq' },
  { id: 11, code: 'CS-302', title: 'Computer Communication & Networks', credit_hours: 4, credit_display: '4(3-1)', department_id: 1, semester: 5, section: 'BSCS-5A', room: 'Network Lab 204', schedule_display: 'Mon & Wed · 10:30 AM - 12:30 PM', materials_count: 4, allocated_teacher_id: 14, allocated_teacher_name: 'Ms. Hina Bashir' },
  { id: 12, code: 'CS-303', title: 'Human Computer Interaction (HCI)', credit_hours: 3, credit_display: '3(3-0)', department_id: 1, semester: 5, section: 'BSCS-5A', room: 'Room 214', schedule_display: 'Tue & Thu · 02:00 PM - 03:30 PM', materials_count: 3, allocated_teacher_id: 16, allocated_teacher_name: 'Ms. Sana Javed' },
  { id: 13, code: 'CS-305', title: 'Information Security & Cryptography', credit_hours: 3, credit_display: '3(3-0)', department_id: 1, semester: 5, section: 'BSCS-5A', room: 'Room 204', schedule_display: 'Friday · 08:30 AM - 11:30 AM', materials_count: 4, allocated_teacher_id: 8, allocated_teacher_name: 'Dr. Farhan Ali' },
  { id: 14, code: 'CS-491', title: 'Compiler Construction', credit_hours: 3, credit_display: '3(3-0)', department_id: 1, semester: 7, section: 'BSCS-7A', room: 'Room 208', schedule_display: 'Mon & Wed · 11:30 AM - 01:00 PM', materials_count: 5, allocated_teacher_id: 13, allocated_teacher_name: 'Dr. Waqas Ahmed' },
  { id: 15, code: 'CS-495', title: 'Parallel & Distributed Computing', credit_hours: 3, credit_display: '3(3-0)', department_id: 1, semester: 7, section: 'BSCS-7A', room: 'CS Lab 3', schedule_display: 'Tue & Thu · 01:30 PM - 03:00 PM', materials_count: 4, allocated_teacher_id: 23, allocated_teacher_name: 'Engr. Dr. Tariq Mahmood' },
  { id: 25, code: 'CS-498', title: 'Final Year Project - I (FYP-I)', credit_hours: 3, credit_display: '3(0-3)', department_id: 1, semester: 7, section: 'BSCS-7A', room: 'Conference Hall A', schedule_display: 'Friday · 02:00 PM - 05:00 PM', materials_count: 6, allocated_teacher_id: 3, allocated_teacher_name: 'Dr. Muhammad Asif' },
  { id: 26, code: 'CS-499', title: 'Final Year Project - II (FYP-II)', credit_hours: 3, credit_display: '3(0-3)', department_id: 1, semester: 8, section: 'BSCS-8A', room: 'Auditorium CS Block', schedule_display: 'Thursday · 02:00 PM - 05:00 PM', materials_count: 4, allocated_teacher_id: 3, allocated_teacher_name: 'Dr. Muhammad Asif' },

  // Accredited Department of Information Technology (IT) Courses
  { id: 501, code: 'IT-101', title: 'Introduction to Information Technology', credit_hours: 3, credit_display: '3(2-1)', department_id: 2, semester: 1, section: 'BSIT-1A', room: 'IT Lab 1', schedule_display: 'Mon & Wed · 08:30 AM - 10:00 AM', materials_count: 3, allocated_teacher_id: 304, allocated_teacher_name: 'Dr. Muhammad Usman' },
  { id: 502, code: 'IT-201', title: 'System Administration & Linux Infrastructure', credit_hours: 4, credit_display: '4(3-1)', department_id: 2, semester: 3, section: 'BSIT-3A', room: 'IT Server Room 102', schedule_display: 'Tue & Thu · 10:30 AM - 12:30 PM', materials_count: 4, allocated_teacher_id: 304, allocated_teacher_name: 'Dr. Muhammad Usman' },
  { id: 503, code: 'IT-301', title: 'Cloud Virtualization & DevOps Automation', credit_hours: 4, credit_display: '4(3-1)', department_id: 2, semester: 5, section: 'BSIT-5A', room: 'Cloud Infrastructure Lab', schedule_display: 'Mon & Wed · 01:00 PM - 03:00 PM', materials_count: 5, allocated_teacher_id: 304, allocated_teacher_name: 'Dr. Muhammad Usman' },
  { id: 504, code: 'IT-401', title: 'Enterprise Network Architecture & Cybersecurity', credit_hours: 4, credit_display: '4(3-1)', department_id: 2, semester: 7, section: 'BSIT-7A', room: 'Cisco Routing Lab', schedule_display: 'Tue & Thu · 01:30 PM - 03:30 PM', materials_count: 6, allocated_teacher_id: 304, allocated_teacher_name: 'Dr. Muhammad Usman' },
];

export const INITIAL_HANDOUTS: Handout[] = [
  // Handouts matching the video for CS-401, CS-403, CS-405, CS-409
  {
    id: 101,
    course_id: 101,
    course_code: 'CS-401',
    course_title: 'Design & Analysis of Algorithms',
    uploaded_by: 23,
    title: 'Lecture 01-03: Asymptotic Notations & Master Theorem',
    file_name: 'CS401_Lec01-03_Asymptotic_Master.pdf',
    file_size: '4.2 MB',
    category: 'SLIDES',
    week_number: 1,
    current_version: 1,
    updated_at: 'Uploaded Apr 25, 2025',
  },
  {
    id: 102,
    course_id: 101,
    course_code: 'CS-401',
    course_title: 'Design & Analysis of Algorithms',
    uploaded_by: 23,
    title: 'Lecture 04-06: Divide & Conquer Strategies (FFT & Strassen)',
    file_name: 'CS401_Lec04-06_Divide_Conquer.pdf',
    file_size: '3.8 MB',
    category: 'SLIDES',
    week_number: 2,
    current_version: 1,
    updated_at: 'Uploaded Apr 20, 2025',
  },
  {
    id: 103,
    course_id: 101,
    course_code: 'CS-401',
    course_title: 'Design & Analysis of Algorithms',
    uploaded_by: 23,
    title: 'Lab Sheet 03: Benchmarking QuickSort vs TimSort in C++',
    file_name: 'CS401_Lab03_Sorting_Benchmark.pdf',
    file_size: '1.2 MB',
    category: 'LAB',
    week_number: 3,
    current_version: 1,
    updated_at: 'Uploaded Apr 18, 2025',
  },
  {
    id: 104,
    course_id: 101,
    course_code: 'CS-401',
    course_title: 'Design & Analysis of Algorithms',
    uploaded_by: 23,
    title: 'Lecture 07-09: Greedy Approaches & Huffman Coding',
    file_name: 'CS401_Lec07-09_Greedy_Huffman.pdf',
    file_size: '5.1 MB',
    category: 'SLIDES',
    week_number: 4,
    current_version: 1,
    updated_at: 'Uploaded Apr 15, 2025',
  },
  {
    id: 105,
    course_id: 102,
    course_code: 'CS-403',
    course_title: 'Database Administration & Optimization',
    uploaded_by: 5,
    title: 'Lecture 01-04: Storage Architecture & Buffer Pool Management',
    file_name: 'CS403_Lec01-04_Storage_BufferPool.pdf',
    file_size: '4.6 MB',
    category: 'SLIDES',
    week_number: 1,
    current_version: 1,
    updated_at: 'Uploaded Apr 18, 2025',
  },
  {
    id: 106,
    course_id: 102,
    course_code: 'CS-403',
    course_title: 'Database Administration & Optimization',
    uploaded_by: 5,
    title: 'Lab Manual: PostgreSQL Clustering & WAL Archival Setup',
    file_name: 'CS403_Lab_PostgreSQL_Clustering.pdf',
    file_size: '2.4 MB',
    category: 'LAB',
    week_number: 2,
    current_version: 1,
    updated_at: 'Uploaded Apr 12, 2025',
  },
  {
    id: 107,
    course_id: 102,
    course_code: 'CS-403',
    course_title: 'Database Administration & Optimization',
    uploaded_by: 5,
    title: 'Reference Note: ACID Isolation Levels & 2-Phase Locking',
    file_name: 'CS403_Note_ACID_2PL.pdf',
    file_size: '820 KB',
    category: 'NOTES',
    week_number: 3,
    current_version: 1,
    updated_at: 'Uploaded Apr 05, 2025',
  },
  {
    id: 108,
    course_id: 103,
    course_code: 'CS-405',
    course_title: 'Software Engineering & Agile Frameworks',
    uploaded_by: 11,
    title: 'SRS Template (IEEE 830 Standard) & Case Breakdown',
    file_name: 'CS405_SRS_Template_IEEE830.pdf',
    file_size: '2.3 MB',
    category: 'NOTES',
    week_number: 2,
    current_version: 1,
    updated_at: 'Uploaded Apr 16, 2025',
  },
  {
    id: 109,
    course_id: 105,
    course_code: 'CS-409',
    course_title: 'Web Application Development & Frameworks',
    uploaded_by: 7,
    title: 'Modern React Architecture, Hooks & State Patterns',
    file_name: 'CS409_React_Hooks_Patterns.pdf',
    file_size: '5.6 MB',
    category: 'SLIDES',
    week_number: 3,
    current_version: 1,
    updated_at: 'Uploaded Apr 09, 2025',
  },
  // 5 Faculty Handouts (Matching Video Tab 4: Handouts)
  {
    id: 201,
    course_id: 301,
    course_code: 'CS-301',
    course_title: 'Data Structures & Algorithms',
    uploaded_by: 2,
    title: 'Lecture 08: Binary Search Trees & AVL Rotations',
    file_name: 'CS301_week08_AVL_Tree_Rotations.pdf',
    file_size: '2.4 MB · Uploaded 12 Oct 2026',
    category: 'Lecture Notes',
    week_number: 8,
    current_version: 1,
    updated_at: '12 Oct 2026',
    key_objectives: [
      'Understand strict binary search tree invariant properties',
      'Calculate node balance factor (height(left) - height(right))',
      'AVL Single (LL/RR) and Double (LR/RL) Rotations',
      'Time complexity O(log N) proofs',
    ],
  },
  {
    id: 202,
    course_id: 402,
    course_code: 'CS-402',
    course_title: 'Cloud Computing & Distributed Systems',
    uploaded_by: 2,
    title: 'Lecture 07: Distributed Consensus & Raft Algorithm',
    file_name: 'CS402_week07_Distributed_Consensus_Raft.pdf',
    file_size: '3.1 MB · Uploaded 08 Oct 2026',
    category: 'Lecture Notes',
    week_number: 7,
    current_version: 1,
    updated_at: '08 Oct 2026',
    key_objectives: [
      'Contrast Paxos and Raft consensus methodologies',
      'Understand Leader Election, Log Replication, and Safety Invariants',
      'Split-brain mitigation via quorum majority',
    ],
  },
  {
    id: 203,
    course_id: 301,
    course_code: 'CS-301',
    course_title: 'Data Structures & Algorithms',
    uploaded_by: 2,
    title: 'Lecture 07: Graph Traversals - BFS, DFS & Dijkstra',
    file_name: 'CS301_week07_Graph_Traversals.pdf',
    file_size: '2.2 MB · Uploaded 05 Oct 2026',
    category: 'Lecture Notes',
    week_number: 7,
    current_version: 1,
    updated_at: '05 Oct 2026',
    key_objectives: [
      'Adjacency List vs Adjacency Matrix tradeoffs',
      'Breadth-First Search (Queue-based shortest path in unweighted graphs)',
      'Dijkstra Priority Queue Single-Source Shortest Path',
    ],
  },
  {
    id: 204,
    course_id: 103,
    course_code: 'CS-201',
    course_title: 'Object-Oriented Programming',
    uploaded_by: 2,
    title: 'Lecture 06: Abstract Classes, Interfaces & Virtual Tables',
    file_name: 'CS201_week06_Polymorphism_VTables.pdf',
    file_size: '1.8 MB · Uploaded 02 Oct 2026',
    category: 'Lecture Notes',
    week_number: 6,
    current_version: 1,
    updated_at: '02 Oct 2026',
    key_objectives: [
      'Runtime vs Compile-time Polymorphism mechanisms',
      'Virtual table (vtable) and virtual pointer (vptr) internals',
      'Pure virtual functions and abstract contracts',
    ],
  },
  {
    id: 205,
    course_id: 490,
    course_code: 'CS-490',
    course_title: 'Capstone Project Supervision',
    uploaded_by: 2,
    title: 'Senior Capstone Guidelines: Sprint 2 Deliverables & Architecture Rubric',
    file_name: 'CS490_Capstone_Sprint2_Evaluation_Criteria.pdf',
    file_size: '950 KB · Uploaded 01 Oct 2026',
    category: 'Lecture Notes',
    week_number: 6,
    current_version: 1,
    updated_at: '01 Oct 2026',
    key_objectives: [
      'System Architecture Diagram specifications (C4 model)',
      'Database Schema Normalization & ERD verification standards',
      'Sprint 2 Milestone presentation rubrics',
    ],
  },
];

export const INITIAL_RESOURCE_VERSIONS: ResourceVersion[] = [
  {
    id: 1,
    handout_id: 101,
    version_number: 1,
    file_name: 'CS401_Lec01-03_Asymptotic_Master.pdf',
    replacement_reason: 'Updated asymptotic growth equations and amortized cost proof diagrams.',
    archived_at: '2025-04-25 10:00:00',
  },
];

export const INITIAL_TIMETABLES: TimetableSlot[] = [
  // Monday
  { id: 101, course_id: 102, course_code: 'CS-403', course_title: 'Database Administration (Theory)', faculty_id: 5, faculty_name: 'Engr. Bilal Raza', day_of_week: 'Mon', timeslot: '08:30 AM - 10:00 AM', room: 'Lecture Hall 2', section: 'BSCS-VI Morning', session_type: 'Theory Lecture' },
  { id: 102, course_id: 101, course_code: 'CS-401', course_title: 'Design & Analysis of Algorithms', faculty_id: 23, faculty_name: 'Prof. Muhammad Tariq', day_of_week: 'Mon', timeslot: '10:30 AM - 12:00 PM', room: 'CS Block - Lab 3', section: 'BSCS-VI Morning', session_type: 'Lab Session' },
  { id: 103, course_id: 103, course_code: 'CS-405', course_title: 'Software Engineering & Agile Frameworks', faculty_id: 11, faculty_name: 'Dr. Nadia Parveen', day_of_week: 'Mon', timeslot: '01:00 PM - 02:30 PM', room: 'Lecture Hall 2 (CS Wing)', section: 'BSCS-VI Morning', session_type: 'Theory Lecture' },
  { id: 201, course_id: 401, course_code: 'CS-401', course_title: 'Database Systems (Theory)', faculty_id: 2, faculty_name: 'Prof. Asim Riaz', day_of_week: 'Mon', timeslot: '09:00 AM - 10:30 AM', room: 'Room 204', section: 'BSCS-6A', session_type: 'Theory Lecture' },
  { id: 202, course_id: 301, course_code: 'CS-301', course_title: 'Data Structures & Algorithms', faculty_id: 2, faculty_name: 'Prof. Asim Riaz', day_of_week: 'Mon', timeslot: '11:00 AM - 12:30 PM', room: 'Room 208', section: 'BSCS-4A', session_type: 'Theory Lecture' },

  // Tuesday (Matching Faculty Video: 3 classes for Prof. Asim Riaz)
  { id: 203, course_id: 401, course_code: 'CS-401', course_title: 'Database Management Systems - Lab', faculty_id: 2, faculty_name: 'Prof. Asim Riaz', day_of_week: 'Tue', timeslot: '11:00 AM - 12:30 PM', room: 'CS Lab 2', section: 'BSCS-6th Morning', session_type: 'Lab Session' },
  { id: 204, course_id: 601, course_code: 'CS-601', course_title: 'Software Engineering', faculty_id: 2, faculty_name: 'Prof. Asim Riaz', day_of_week: 'Tue', timeslot: '01:20 PM - 02:00 PM', room: 'Room 214', section: 'BSCS-4th Morning', session_type: 'Theory Lecture' },
  { id: 205, course_id: 301, course_code: 'CS-301', course_title: 'Data Structures & Algorithms - Lab', faculty_id: 2, faculty_name: 'Prof. Asim Riaz', day_of_week: 'Tue', timeslot: '03:15 PM - 04:45 PM', room: 'CS Lab 3', section: 'BSCS-4th Morning', session_type: 'Lab Session' },
  { id: 104, course_id: 102, course_code: 'CS-403', course_title: 'Database Administration (Theory)', faculty_id: 5, faculty_name: 'Engr. Bilal Raza', day_of_week: 'Tue', timeslot: '08:30 AM - 10:00 AM', room: 'Data Systems Lab (Ground Floor)', section: 'BSCS-VI Morning', session_type: 'Theory Lecture' },
  { id: 105, course_id: 104, course_code: 'CS-407', course_title: 'Computer Networks & Distributed Systems', faculty_id: 10, faculty_name: 'Engr. Hamza Aslam', day_of_week: 'Tue', timeslot: '11:00 AM - 01:00 PM', room: 'Network Infrastructure Lab (Room 204)', section: 'BSCS-VI Morning', session_type: 'Lab Session' },

  // Wednesday
  { id: 206, course_id: 601, course_code: 'CS-601', course_title: 'Software Engineering', faculty_id: 2, faculty_name: 'Prof. Asim Riaz', day_of_week: 'Wed', timeslot: '10:00 AM - 11:30 AM', room: 'Room 214', section: 'BSCS-4A', session_type: 'Theory Lecture' },
  { id: 207, course_id: 402, course_code: 'CS-402', course_title: 'Cloud Computing & Distributed Systems', faculty_id: 2, faculty_name: 'Prof. Asim Riaz', day_of_week: 'Wed', timeslot: '01:30 PM - 03:00 PM', room: 'Room 214', section: 'BSCS-6A', session_type: 'Theory Lecture' },
  { id: 106, course_id: 101, course_code: 'CS-401', course_title: 'Design & Analysis of Algorithms', faculty_id: 23, faculty_name: 'Prof. Muhammad Tariq', day_of_week: 'Wed', timeslot: '10:30 AM - 12:00 PM', room: 'CS Block - Lab 3', section: 'BSCS-VI Morning', session_type: 'Lab Session' },
  { id: 107, course_id: 103, course_code: 'CS-405', course_title: 'Software Engineering Practice & Sprint Review', faculty_id: 11, faculty_name: 'Dr. Nadia Parveen', day_of_week: 'Wed', timeslot: '01:00 PM - 02:30 PM', room: 'Lecture Hall 2 (CS Wing)', section: 'BSCS-VI Morning', session_type: 'Theory Lecture' },

  // Thursday
  { id: 208, course_id: 401, course_code: 'CS-401', course_title: 'Database Systems (Theory)', faculty_id: 2, faculty_name: 'Prof. Asim Riaz', day_of_week: 'Thu', timeslot: '09:30 AM - 11:00 AM', room: 'Room 204', section: 'BSCS-6B', session_type: 'Theory Lecture' },
  { id: 209, course_id: 402, course_code: 'CS-402', course_title: 'Cloud Computing Lab', faculty_id: 2, faculty_name: 'Prof. Asim Riaz', day_of_week: 'Thu', timeslot: '11:30 AM - 01:00 PM', room: 'CS Lab 1', section: 'BSCS-6A', session_type: 'Lab Session' },
  { id: 108, course_id: 104, course_code: 'CS-407', course_title: 'Computer Networks Lab (Cisco / Wireshark)', faculty_id: 10, faculty_name: 'Engr. Hamza Aslam', day_of_week: 'Thu', timeslot: '09:00 AM - 11:00 AM', room: 'Network Lab 204', section: 'BSCS-VI Morning', session_type: 'Lab Session' },
  { id: 109, course_id: 102, course_code: 'CS-403', course_title: 'Database Query Optimization & Tuning', faculty_id: 5, faculty_name: 'Engr. Bilal Raza', day_of_week: 'Thu', timeslot: '11:30 AM - 01:00 PM', room: 'Room 104', section: 'BSCS-VI Morning', session_type: 'Theory Lecture' },

  // Friday
  { id: 210, course_id: 401, course_code: 'CS-401', course_title: 'Faculty Advising & Capstone Supervision', faculty_id: 2, faculty_name: 'Prof. Asim Riaz', day_of_week: 'Fri', timeslot: '09:00 AM - 11:00 AM', room: 'Chamber 204', section: 'Senior Projects', session_type: 'Tutorial' },
  { id: 110, course_id: 105, course_code: 'CS-409', course_title: 'Web Application Development Lab (React & Node.js)', faculty_id: 7, faculty_name: 'Engr. Usman Farooq', day_of_week: 'Fri', timeslot: '08:30 AM - 11:30 AM', room: 'Advanced Software Lab (Room 108)', section: 'BSCS-VI Morning', session_type: 'Lab Session' },
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  // Faculty Department Notices (Matching Video Tab 5 Subtab 2)
  {
    id: 101,
    title: 'Departmental Faculty Meeting: Midterm Exam Paper Moderation Schedule',
    content: "All faculty members are hereby requested to submit three confidential sets of Midterm Examination Question Papers for Fall 2026 by Thursday, 29th October 2026 at 03:00 PM. Papers must adhere to Outcome-Based Education (OBE) mapping with Bloom's Taxonomy levels. Paper moderation committee will convene in the Department Conference Room on Friday.\n\nRequired Action: Submit 3 moderated exam sets with solution keys to Departmental Examination Cell.",
    audience: 'teachers',
    priority: 'important',
    author: 'Dr. Tariq Mahmood (Head of Academic Committee)',
    uploader_role: 'HOD CS',
    uploader_name: 'Dr. Tariq Mahmood',
    created_at: '29 Oct 2026',
    is_read: false,
    attachment_name: 'Midterm_Moderation_Guidelines_Fall2026.pdf',
    attachment_url: '#',
    attachment_type: 'pdf',
    attachment_size: '1.4 MB',
  },
  {
    id: 102,
    title: 'Notification: Implementation of Digital Attendance & Handout Repository Policy',
    content: 'All faculty members are required to upload lecture slides and lab manuals at least 24 hours prior to each scheduled lecture into the central institutional repository.',
    audience: 'teachers',
    priority: 'urgent',
    author: 'ADMIN (Institutional Academic Affairs)',
    uploader_role: 'ADMIN',
    uploader_name: 'Central Academic Administration',
    created_at: '24 Oct 2026',
    is_read: false,
    attachment_name: 'Official_Directive_Notice.jpg',
    attachment_url: './campus.jpg',
    attachment_type: 'image',
    attachment_size: '680 KB',
  },
  {
    id: 103,
    title: 'Allocation of Teaching Assistants for BSCS 4th & 6th Semester Laboratory Modules',
    content: 'Teaching assistants have been assigned to all practical laboratory courses for Spring 2025. Faculty coordinators should review lab rubrics with assigned TAs.',
    audience: 'teachers',
    priority: 'normal',
    author: 'HOD Computer Science',
    uploader_role: 'HOD CS',
    uploader_name: 'Dr. Tariq Mahmood (Head of Department)',
    created_at: '20 Oct 2026',
    is_read: false,
  },
  {
    id: 104,
    title: 'Annual Research Grant & Conference Sponsorship Submissions for Fall 2026',
    content: 'Faculty members wishing to present research papers at international IEEE / ACM conferences are invited to submit grant proposals to the ORIC office.',
    audience: 'teachers',
    priority: 'normal',
    author: 'HOD Computer Science & Academic Research',
    uploader_role: 'HOD CS',
    uploader_name: 'Dr. Tariq Mahmood (Head of CS & Research)',
    created_at: '15 Oct 2026',
    is_read: false,
  },
  // Student Announcements
  {
    id: 1,
    title: 'Midterm Examination Schedule Announcement - Spring 2025',
    content: 'All undergraduate scholars enrolled in Spring 2025 semester are hereby notified that the official Midterm Examinations will commence from Monday, May 12, 2025. Detailed date sheets and room allocations have been dispatched to student portals. Please ensure 75% biometric attendance compliance prior to examination roll issuance.',
    audience: 'students',
    priority: 'urgent',
    author: 'Central Administration (Examination Directorate)',
    uploader_role: 'ADMIN',
    uploader_name: 'Central Academic Administration',
    created_at: 'Apr 28, 2025',
    is_read: false,
    attachment_name: 'Official_Midterm_DateSheet_Spring2025.pdf',
    attachment_url: '#',
    attachment_type: 'pdf',
    attachment_size: '840 KB',
  },
  {
    id: 2,
    title: 'Final Year Project (FYP-I) Proposal Submission & Defense Schedule',
    content: 'Students eligible for Final Year Project (FYP-I) must submit their finalized three-tier system proposals signed by their approved departmental supervisor by May 05, 2025. Proposal defenses will take place in Conference Hall A before the departmental evaluation committee.',
    audience: 'cs_only',
    priority: 'important',
    author: 'HOD Computer Science & FYP Committee',
    uploader_role: 'HOD CS',
    uploader_name: 'Dr. Muhammad Asif (Head of Department)',
    created_at: 'Apr 24, 2025',
    is_read: false,
  },
  {
    id: 3,
    title: 'Special Workshop: Modern Cloud Architectures & Kubernetes by Industry Alumni',
    content: 'Department of Computer Science is organizing a hands-on technical workshop on cloud containerization, Docker microservices, and Kubernetes orchestration. Guest speakers include senior DevOps engineers from leading software enterprises. Registered students will receive cloud compute credits.',
    audience: 'cs_only',
    priority: 'normal',
    author: 'HOD Computer Science',
    uploader_role: 'HOD CS',
    uploader_name: 'Dr. Muhammad Asif (Head of Department)',
    created_at: 'Apr 21, 2025',
    is_read: true,
    attachment_name: 'Cloud_Workshop_Brochure_Poster.jpg',
    attachment_url: './campus.jpg',
    attachment_type: 'image',
    attachment_size: '1.2 MB',
  },
  {
    id: 4,
    title: 'Library Extended Hours During Examination Preparation Period',
    content: 'The Central Academic Library will remain operational from 08:00 AM to 08:00 PM on weekdays and 09:00 AM to 05:00 PM on Saturdays. Digital IEEE Xplore terminals and private study carrels are accessible with verified student portal credentials.',
    audience: 'students',
    priority: 'normal',
    author: 'ADMIN (Institutional Academic Affairs)',
    uploader_role: 'ADMIN',
    uploader_name: 'Central Administration',
    created_at: 'Apr 18, 2025',
    is_read: true,
  },
  {
    id: 5,
    title: 'Tuition Fee Installment Schedule & Financial Aid Verification Notice',
    content: 'Students availing fee installment facilities or Merit-Based Provincial Scholarships are instructed to verify their clearance status at the Accounts & Finance Directorate before cutoff date to prevent portal LMS lockouts.',
    audience: 'students',
    priority: 'important',
    author: 'ADMIN (Finance & Student Accounts)',
    uploader_role: 'ADMIN',
    uploader_name: 'Central Administration (Finance Directorate)',
    created_at: 'Apr 14, 2025',
    is_read: true,
  },
];

export const INITIAL_BOOKMARKS: StudyBookmark[] = [
  { id: 1, student_id: 1, item_type: 'course', target_id: 101, course_code: 'CS-401', title: 'Design & Analysis of Algorithms', subtitle: 'Teacher: Prof. Muhammad Tariq', meta_info: '3(3-0) · BSCS-VI Morning', created_at: '2025-04-10' },
  { id: 2, student_id: 1, item_type: 'course', target_id: 103, course_code: 'CS-405', title: 'Software Engineering & Agile Frameworks', subtitle: 'Teacher: Dr. Nadia Parveen', meta_info: '3(3-0) · BSCS-VI Morning', created_at: '2025-04-12' },
  { id: 3, student_id: 1, item_type: 'course', target_id: 105, course_code: 'CS-409', title: 'Web Application Development & Frameworks', subtitle: 'Teacher: Engr. Usman Farooq', meta_info: '3(2-1) · BSCS-VI Morning', created_at: '2025-04-14' },
  { id: 4, student_id: 1, item_type: 'handout', target_id: 103, course_code: 'CS-401', title: 'Lab Sheet 03: Benchmarking QuickSort vs TimSort in C++', subtitle: 'Week 3', meta_info: 'Uploaded Apr 18, 2025', file_size: '1.2 MB', created_at: '2025-04-18' },
  { id: 5, student_id: 1, item_type: 'handout', target_id: 108, course_code: 'CS-405', title: 'SRS Template (IEEE 830 Standard) & Case Breakdown', subtitle: 'Week 2', meta_info: 'Uploaded Apr 16, 2025', file_size: '2.3 MB', created_at: '2025-04-19' },
  { id: 6, student_id: 1, item_type: 'handout', target_id: 109, course_code: 'CS-409', title: 'Modern React Architecture, Hooks & State Patterns', subtitle: 'Week 3', meta_info: 'Uploaded Apr 09, 2025', file_size: '5.6 MB', created_at: '2025-04-20' },
  { id: 7, student_id: 1, item_type: 'handout', target_id: 101, course_code: 'CS-401', title: 'Lecture 01-03: Asymptotic Notations & Master Theorem', subtitle: 'Week 1', meta_info: 'Uploaded Apr 25, 2025', file_size: '4.2 MB', created_at: '2025-04-25' },
  { id: 8, student_id: 1, item_type: 'note', title: 'Master Theorem Asymptotic Formulas Summary', subtitle: 'CS-401 Quick Reference · Divide and Conquer Recurrences', meta_info: 'Updated Apr 22, 2025', created_at: '2025-04-22' },
  { id: 9, student_id: 1, item_type: 'note', title: 'PostgreSQL WAL, Archival & Replication Setup', subtitle: 'CS-403 Lab Sheet 04 Reference Architecture', meta_info: 'Updated Apr 15, 2025', created_at: '2025-04-15' },
];

export const INITIAL_REPORTS: StudentReport[] = [
  // 3 Reports for Faculty (Matching Video Tab 5 Subtab 1)
  {
    id: 201,
    student_id: 1,
    student_name: 'Muhammad Hamza Khan',
    reporter_roll: 'UCMS-2022-041',
    course_code: 'CS-401',
    week_text: 'Week 4 Handout',
    handout_title: 'Lecture 04: SQL Joins & Subqueries',
    category: 'Typo / Handout Error',
    error_tag: 'TYPO/ERROR',
    subject: 'Typo error in LEFT OUTER JOIN syntax on page 3',
    description: "On slide 12 and page 3 of the PDF handout, the query for LEFT OUTER JOIN uses table alias 'e' instead of 'd' which causes a syntax error during testing.",
    status: 'Pending Review',
    created_at: '27 Oct 2026, 04:15 PM',
  },
  {
    id: 202,
    student_id: 18,
    student_name: 'Ayesha Fatima',
    reporter_roll: 'UCMS-2022-029',
    course_code: 'CS-601',
    week_text: 'Week 5 Handout',
    handout_title: 'Lecture 05: UML Sequence Diagrams & Collaboration',
    category: 'Missing Pages',
    error_tag: 'MISSING PAGES',
    subject: 'Figure 5.3 Sequence diagram blurred in PDF export',
    description: 'The diagram on Figure 5.3 appears blurred in the uploaded PDF file. Could you please re-export the high-res diagram for the Sequence Diagram example?',
    status: 'Pending Review',
    created_at: '25 Oct 2026, 11:20 AM',
  },
  {
    id: 203,
    student_id: 19,
    student_name: 'Ali Raza',
    reporter_roll: 'UCMS-2023-011',
    course_code: 'CS-301',
    week_text: 'Week 3 Handout',
    handout_title: 'Lecture 03: Doubly Linked Lists Code Reference',
    category: 'Clarification',
    error_tag: 'CLARIFICATION',
    subject: 'free(tmp) vs delete tmp in C++ pointer deletion',
    description: 'In the deleteNode() routine, line 14 shows free(tmp) was this intended for C or C++ pointer deletion? Re-verified with TA.',
    status: 'Resolved',
    resolution_note: 'Clarified in class lecture; C++ delete operator example uploaded.',
    created_at: '21 Oct 2026, 09:20 AM',
  },
];

export const INITIAL_CMS: CmsSettings = {
  stat_faculties: '4 Academic Faculties',
  stat_faculty_members: '48+ Senior Academicians',
  stat_students: '1,200+ Enrolled Scholars',
  stat_labs: '6 High-Performance Labs',
  admission_deadline: 'December 15, 2026',
  admission_term: 'Spring 2027 Admissions',
  campus_contact_phone: '+92 (065) 9200-142',
  campus_contact_email: 'admissions@ucms.edu.pk',
  campus_address: 'Near Multan Road, Khanewal, Punjab, Pakistan',
  institution_notice: 'Higher Education Commission (HEC) Recognized & Affiliated Programs',
  background_image: './assets/aistudio/images-extractpics_fa9aed82.jpg',
};

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  { id: 1, user_name: 'Chief Registrar Office', action: 'SYSTEM_INIT', details: 'Initial database schema and academic records successfully seeded.', ip_address: '127.0.0.1', created_at: '2026-11-01 08:00:00' },
  { id: 2, user_name: 'Dr. Amna Tariq', action: 'RESOURCE_UPDATE', details: 'Dr. Amna Tariq updated CS-401 Lecture 07 slides to version 2.', ip_address: '192.168.1.45', created_at: '2026-11-04 11:30:00' },
  { id: 3, user_name: 'Chief Registrar Office', action: 'TIMETABLE_ALLOCATION', details: 'Registrar allocated Room 104 for CS-405 on Monday morning.', ip_address: '127.0.0.1', created_at: '2026-11-05 10:00:00' },
];

export const INITIAL_ASSESSMENTS: AcademicAssessment[] = [
  {
    id: 1,
    course_id: 401,
    course_code: 'CS-401',
    course_title: 'Database Systems',
    type: 'Assignment',
    title: 'Assignment 02: Relational Schema Normalization (3NF & BCNF)',
    description: 'Decompose the given enterprise university database schema into 3NF and Boyce-Codd Normal Form with functional dependency preservation proof.',
    total_marks: 20,
    deadline_date: '2026-11-20',
    deadline_time: '23:59',
    deadline_display: 'Nov 20, 2026 · 11:59 PM',
    created_at: '2026-11-08',
    teacher_id: 2,
    teacher_name: 'Prof. Asim Riaz',
    submission_status: 'Pending',
  },
  {
    id: 2,
    course_id: 401,
    course_code: 'CS-401',
    course_title: 'Database Systems',
    type: 'Quiz',
    title: 'Quiz 03: Transaction ACID Properties & Concurrency Control',
    description: 'Online 20-minute multiple-choice and short conceptual quiz evaluating serializability, two-phase locking (2PL), and deadlock detection algorithms.',
    total_marks: 15,
    deadline_date: '2026-11-25',
    deadline_time: '14:00',
    deadline_display: 'Nov 25, 2026 · 02:00 PM',
    created_at: '2026-11-09',
    teacher_id: 2,
    teacher_name: 'Prof. Asim Riaz',
    submission_status: 'Pending',
  },
  {
    id: 3,
    course_id: 601,
    course_code: 'CS-601',
    course_title: 'Software Engineering',
    type: 'Assignment',
    title: 'Assignment 01: IEEE-830 Software Requirements Specification (SRS)',
    description: 'Prepare complete SRS document for the assigned Hospital Management System case study including UML use-case diagrams, sequence diagrams, and non-functional metrics.',
    total_marks: 25,
    deadline_date: '2026-11-28',
    deadline_time: '23:59',
    deadline_display: 'Nov 28, 2026 · 11:59 PM',
    created_at: '2026-11-05',
    teacher_id: 2,
    teacher_name: 'Prof. Asim Riaz',
    submission_status: 'Submitted',
    submitted_at: '2026-11-09 16:45',
    submission_note: 'Submitted SRS v1.2 PDF via Student Portal',
  },
  {
    id: 4,
    course_id: 101,
    course_code: 'CS-401',
    course_title: 'Design & Analysis of Algorithms',
    type: 'Lab Assessment',
    title: 'Lab Assessment 02: Dynamic Programming vs Greedy Knapsack',
    description: 'Implementation of 0/1 Knapsack with memoization and Fractional Knapsack greedy approach in C++ / Python with runtime complexity benchmarks.',
    total_marks: 20,
    deadline_date: '2026-12-02',
    deadline_time: '17:00',
    deadline_display: 'Dec 02, 2026 · 05:00 PM',
    created_at: '2026-11-07',
    teacher_id: 1,
    teacher_name: 'Prof. Muhammad Tariq',
    submission_status: 'Pending',
  },
];
