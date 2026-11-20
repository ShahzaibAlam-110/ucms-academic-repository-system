import React, { useState } from 'react';
import {
  INITIAL_USERS,
  INITIAL_COURSES,
  INITIAL_DEPARTMENTS,
  INITIAL_HANDOUTS,
  INITIAL_RESOURCE_VERSIONS,
  INITIAL_TIMETABLES,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_REPORTS,
  INITIAL_CMS,
  INITIAL_AUDIT_LOGS,
  INITIAL_ASSESSMENTS,
  User,
  Course,
  Handout,
  ResourceVersion,
  TimetableSlot,
  Announcement,
  StudentReport,
  AcademicAssessment,
  CmsSettings,
  AuditLog,
} from './data/mockDatabase';

import { Header } from './components/Header';
import { PublicGateway } from './components/PublicGateway';
import { StudentWorkspace } from './components/StudentWorkspace';
import { FacultyWorkspace } from './components/FacultyWorkspace';
import { HodWorkspace } from './components/HodWorkspace';
import { AdminWorkspace } from './components/AdminWorkspace';
import { FirstLoginModal } from './components/FirstLoginModal';
import { PhpSourceExportModal } from './components/PhpSourceExportModal';
import { StudentProfileModal } from './components/StudentProfileModal';
import { FacultyProfileModal } from './components/FacultyProfileModal';
import { HodProfileModal } from './components/HodProfileModal';
import { AdminProfileModal } from './components/AdminProfileModal';

export default function App() {
  // Institutional State
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [departments] = useState(INITIAL_DEPARTMENTS);
  const [handouts, setHandouts] = useState<Handout[]>(INITIAL_HANDOUTS);
  const [resourceVersions, setResourceVersions] = useState<ResourceVersion[]>(INITIAL_RESOURCE_VERSIONS);
  const [timetables, setTimetables] = useState<TimetableSlot[]>(INITIAL_TIMETABLES);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [reports, setReports] = useState<StudentReport[]>(INITIAL_REPORTS);
  const [assessments, setAssessments] = useState<AcademicAssessment[]>(INITIAL_ASSESSMENTS);
  const [cms, setCms] = useState<CmsSettings>(INITIAL_CMS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  // Session State (null = public portal)
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Student Portal Navigation & Modals
  const [studentTab, setStudentTab] = useState<'overview' | 'updates' | 'courses' | 'timetable' | 'bookmarks'>('overview');
  const [isStudentProfileOpen, setIsStudentProfileOpen] = useState(false);

  // Faculty Portal Navigation & Modals
  const [facultyTab, setFacultyTab] = useState<'dashboard' | 'courses' | 'timetable' | 'handouts' | 'notices'>('dashboard');
  const [isFacultyProfileOpen, setIsFacultyProfileOpen] = useState(false);

  // HOD Portal Navigation & Modals
  const [hodTab, setHodTab] = useState<'faculty' | 'courses' | 'timetable' | 'notices'>('faculty');
  const [isHodProfileOpen, setIsHodProfileOpen] = useState(false);

  // Admin Portal Navigation & Modals
  const [adminTab, setAdminTab] = useState<'users' | 'timetable' | 'notices' | 'cms' | 'audit'>('users');
  const [isAdminProfileOpen, setIsAdminProfileOpen] = useState(false);

  // Modals
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPasswordModalForced, setIsPasswordModalForced] = useState(false);

  // Audit Log Helper
  const logAudit = (action: string, details: string, userName?: string) => {
    const newLog: AuditLog = {
      id: Date.now(),
      user_name: userName || currentUser?.full_name || 'System Identity',
      action,
      details,
      ip_address: '127.0.0.1',
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // 1. Authentication
  const handleLogin = (identifier: string, role: 'student' | 'teacher' | 'hod' | 'admin') => {
    // Find matching user by username or email
    const found = users.find(
      u => (u.username.toLowerCase() === identifier.toLowerCase() || u.email.toLowerCase() === identifier.toLowerCase())
    );

    if (found) {
      setCurrentUser(found);
      logAudit('USER_LOGIN', `User ${found.full_name} authenticated to ${found.role.toUpperCase()} workspace.`, found.full_name);

      // Check first-time password requirement
      if (!found.has_changed_password) {
        setIsPasswordModalForced(true);
      }
    } else {
      // Fallback create demo user of that role if not found
      const fallbackUser: User = {
        id: Date.now(),
        username: identifier,
        email: `${identifier}@ucms.edu.pk`,
        full_name: identifier.charAt(0).toUpperCase() + identifier.slice(1),
        role,
        department_id: 1,
        department_name: 'Department of Computer Science',
        semester: role === 'student' ? 7 : null,
        roll_number: role === 'student' ? 'UCMS-BSCS-21-099' : null,
        designation: role === 'teacher' ? 'Faculty Member' : role === 'hod' ? 'HOD CS' : 'Administrator',
        has_changed_password: false,
        status: 'active',
      };
      setUsers(prev => [...prev, fallbackUser]);
      setCurrentUser(fallbackUser);
      setIsPasswordModalForced(true);
      logAudit('USER_LOGIN', `User ${fallbackUser.full_name} authenticated to ${role.toUpperCase()} workspace.`, fallbackUser.full_name);
    }
  };

  const handleLogout = () => {
    if (currentUser) {
      logAudit('USER_LOGOUT', `User ${currentUser.full_name} signed out.`, currentUser.full_name);
    }
    setCurrentUser(null);
    setIsPasswordModalForced(false);
    setIsStudentProfileOpen(false);
    setIsFacultyProfileOpen(false);
    setIsHodProfileOpen(false);
    setIsAdminProfileOpen(false);
    setStudentTab('overview');
    setFacultyTab('dashboard');
    setHodTab('faculty');
    setAdminTab('users');
  };

  // 2. Password Update (First login enforcement or voluntary)
  const handlePasswordChanged = (newPassword: string) => {
    if (!currentUser) return;
    setUsers(prev =>
      prev.map(u => (u.id === currentUser.id ? { ...u, password: newPassword, has_changed_password: true } : u))
    );
    setCurrentUser(prev => (prev ? { ...prev, password: newPassword, has_changed_password: true } : null));
    setIsPasswordModalForced(false);
    logAudit('PASSWORD_CHANGE', `User ${currentUser.full_name} updated institutional access credentials.`, currentUser.full_name);
  };

  const handleDismissFirstLoginModal = () => {
    if (!currentUser) return;
    setUsers(prev =>
      prev.map(u => (u.id === currentUser.id ? { ...u, has_changed_password: true } : u))
    );
    setCurrentUser(prev => (prev ? { ...prev, has_changed_password: true } : null));
    setIsPasswordModalForced(false);
  };

  // Student Avatar Update
  const handleStudentAvatarUpdate = (avatarUrl: string) => {
    if (!currentUser) return;
    setUsers(prev =>
      prev.map(u => (u.id === currentUser.id ? { ...u, avatar_url: avatarUrl } : u))
    );
    setCurrentUser(prev => (prev ? { ...prev, avatar_url: avatarUrl } : null));
    logAudit('AVATAR_UPDATE', `User ${currentUser.full_name} updated institutional avatar.`, currentUser.full_name);
  };

  // 3. Student Actions: Mark announcement as read
  const handleMarkAnnouncementRead = (id: number) => {
    setAnnouncements(prev =>
      prev.map(a => (a.id === id ? { ...a, is_read: true } : a))
    );
  };

  // Student Actions: Submit Academic Report (Quota 3/week)
  const handleSubmitReport = (category: string, subject: string, description: string) => {
    if (!currentUser) return;
    const newReport: StudentReport = {
      id: Date.now(),
      student_id: currentUser.id,
      student_name: currentUser.full_name,
      category,
      subject,
      description,
      status: 'Pending Review',
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setReports(prev => [newReport, ...prev]);
    logAudit('REPORT_SUBMITTED', `Academic report filed: "${subject}" (${category})`, currentUser.full_name);
  };

  // 4. Faculty Actions: Upload or Version Replace Handout
  const handleUploadHandout = (
    courseId: number,
    title: string,
    category: 'Lecture Slide' | 'Lab Manual' | 'Assignment' | 'Syllabus' | string,
    weekNumber: number,
    fileName: string,
    replaceHandoutId?: number,
    replacementReason?: string
  ) => {
    const course = courses.find(c => c.id === courseId);
    if (!course || !currentUser) return;

    if (replaceHandoutId && replacementReason) {
      // Non-Destructive Version Replacement:
      const existing = handouts.find(h => h.id === replaceHandoutId);
      if (existing) {
        // 1. Archive current version to resourceVersions
        const newArchived: ResourceVersion = {
          id: Date.now(),
          handout_id: existing.id,
          version_number: existing.current_version,
          file_name: existing.file_name,
          replacement_reason: replacementReason,
          archived_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
        };
        setResourceVersions(prev => [newArchived, ...prev]);

        // 2. Increment version and update active handout
        const nextVersion = existing.current_version + 1;
        setHandouts(prev =>
          prev.map(h =>
            h.id === replaceHandoutId
              ? {
                  ...h,
                  title,
                  file_name: fileName,
                  current_version: nextVersion,
                  updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
                }
              : h
          )
        );

        logAudit(
          'HANDOUT_VERSIONED',
          `Resource "${title}" updated to v${nextVersion}. Previous v${existing.current_version} archived: "${replacementReason}"`,
          currentUser.full_name
        );

        // Notify students of updated version
        const updateNotice: Announcement = {
          id: Date.now() + 1,
          title: `Updated Learning Resource: ${title} (v${nextVersion})`,
          content: `Course Instructor ${currentUser.full_name} has published an updated revision (v${nextVersion}) of "${title}" [${category}] for ${course.code} - ${course.title}. Revision note: "${replacementReason}".`,
          audience: 'students',
          priority: 'normal',
          author: currentUser.full_name,
          uploader_role: 'FACULTY',
          uploader_name: currentUser.full_name,
          created_at: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' · PKT',
          is_read: false,
        };
        setAnnouncements(prev => [updateNotice, ...prev]);
      }
    } else {
      // Fresh new handout
      const newHandout: Handout = {
        id: Date.now(),
        course_id: courseId,
        course_code: course.code,
        course_title: course.title,
        uploaded_by: currentUser.id,
        title,
        file_name: fileName,
        file_size: '2.8 MB',
        category,
        week_number: weekNumber,
        current_version: 1,
        updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      };
      setHandouts(prev => [newHandout, ...prev]);

      // Dispatch real-time student notification
      const uploadNotice: Announcement = {
        id: Date.now() + 1,
        title: `New Learning Resource: ${title} (${course.code})`,
        content: `Course Instructor ${currentUser.full_name} has published "${title}" [${category}, Week ${weekNumber}] for ${course.code} - ${course.title}. Students can download it directly from their Handouts repository.`,
        audience: 'students',
        priority: 'normal',
        author: currentUser.full_name,
        uploader_role: 'FACULTY',
        uploader_name: currentUser.full_name,
        created_at: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' · PKT',
        is_read: false,
      };
      setAnnouncements(prev => [uploadNotice, ...prev]);

      logAudit(
        'HANDOUT_UPLOADED',
        `New resource published: "${title}" for ${course.code}`,
        currentUser.full_name
      );
    }
  };

  // 4b. Assessments & Quizzes with Deadlines
  const handleCreateAssessment = (newA: Omit<AcademicAssessment, 'id' | 'created_at' | 'submission_status'>) => {
    const item: AcademicAssessment = {
      ...newA,
      id: Date.now(),
      created_at: new Date().toISOString().substring(0, 10),
      submission_status: 'Pending',
    };
    setAssessments(prev => [item, ...prev]);
    if (currentUser) {
      logAudit('ASSESSMENT_PUBLISHED', `Published ${item.type}: ${item.title} (${item.course_code}) with deadline ${item.deadline_display}`, currentUser.full_name);
    }
  };

  const handleSubmitAssessment = (assessmentId: number, notes?: string, fileName?: string) => {
    setAssessments(prev =>
      prev.map(a =>
        a.id === assessmentId
          ? {
              ...a,
              submission_status: 'Submitted',
              submitted_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
              submission_note: notes || 'Submitted via Student Portal',
              file_name: fileName || 'Submission_Work.pdf',
            }
          : a
      )
    );
    if (currentUser) {
      logAudit('ASSESSMENT_SUBMITTED', `Student submitted work for assessment ID #${assessmentId}`, currentUser.full_name);
    }
  };

  // 5. HOD CS Actions: Allocate Course to CS Faculty
  const handleAllocateCourse = (courseId: number, facultyId: number, session: string) => {
    const course = courses.find(c => c.id === courseId);
    const faculty = users.find(u => u.id === facultyId);
    if (!course || !faculty || !currentUser) return;

    setCourses(prev =>
      prev.map(c =>
        c.id === courseId
          ? { ...c, allocated_teacher_id: facultyId, allocated_teacher_name: faculty.full_name }
          : c
      )
    );

    // Urgent notification to students and faculty regarding the course allocation
    const allocationNotice: Announcement = {
      id: Date.now(),
      title: `Urgent Course Allocation: ${course.code} - ${course.title}`,
      content: `Official Assignment: ${course.code} (${course.title}) has been assigned to ${faculty.full_name} for Semester ${course.semester} (${session}). Enrolled students and faculty can access official handouts and schedule on their portals.`,
      audience: 'all',
      priority: 'urgent',
      author: currentUser.full_name,
      uploader_role: 'HOD CS',
      uploader_name: currentUser.full_name,
      deadline: 'Spring 2025 Cycle',
      deadline_display: 'Spring 2025 Enforced',
      created_at: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' · PKT',
      is_read: false,
    };
    setAnnouncements(prev => [allocationNotice, ...prev]);

    logAudit(
      'COURSE_ALLOCATION',
      `Allocated ${course.code}: ${course.title} to ${faculty.full_name} (${session}) and dispatched urgent institutional broadcast`,
      currentUser.full_name
    );
  };

  // HOD CS Actions: Add Timetable with Conflict Detection
  const handleAddTimetable = (slot: Omit<TimetableSlot, 'id'>): { success: boolean; conflictMessage?: string } => {
    // Conflict 1: Teacher Double-Booking (same teacher cannot be in two classes at once)
    const teacherConflict = timetables.find(
      t => t.faculty_id === slot.faculty_id &&
           t.day_of_week === slot.day_of_week &&
           t.timeslot === slot.timeslot
    );

    if (teacherConflict) {
      return {
        success: false,
        conflictMessage: `TEACHER DOUBLE-BOOKING CONFLICT: ${slot.faculty_name} is already scheduled for ${teacherConflict.course_code} (${teacherConflict.room}) on ${slot.day_of_week} at ${slot.timeslot}.`,
      };
    }

    // Conflict 2: Room Double-Booking (same classroom/lab cannot host two lectures at once)
    const roomConflict = timetables.find(
      t => t.room === slot.room &&
           t.day_of_week === slot.day_of_week &&
           t.timeslot === slot.timeslot
    );

    if (roomConflict) {
      return {
        success: false,
        conflictMessage: `VENUE OVERLAPPING CONFLICT: ${slot.room} is already booked by ${roomConflict.faculty_name} for ${roomConflict.course_code} on ${slot.day_of_week} at ${slot.timeslot}.`,
      };
    }

    // No conflict: commit slot
    const newSlot: TimetableSlot = {
      id: Date.now(),
      ...slot,
    };
    setTimetables(prev => [...prev, newSlot]);

    if (currentUser) {
      logAudit(
        'TIMETABLE_ADDED',
        `Scheduled lecture for ${slot.course_code} in ${slot.room} on ${slot.day_of_week} ${slot.timeslot}`,
        currentUser.full_name
      );
    }

    return { success: true };
  };

  // HOD & Admin: Update Existing Timetable Slot with Collision Detection & Urgent Notification
  const handleUpdateTimetable = (updatedSlot: TimetableSlot): { success: boolean; conflictMessage?: string } => {
    // Check teacher conflict excluding current slot
    const teacherConflict = timetables.find(
      t => t.id !== updatedSlot.id &&
           t.faculty_id === updatedSlot.faculty_id &&
           t.day_of_week === updatedSlot.day_of_week &&
           t.timeslot === updatedSlot.timeslot
    );

    if (teacherConflict) {
      return {
        success: false,
        conflictMessage: `TEACHER DOUBLE-BOOKING CONFLICT: ${updatedSlot.faculty_name} is already scheduled for ${teacherConflict.course_code} (${teacherConflict.room}) on ${updatedSlot.day_of_week} at ${updatedSlot.timeslot}.`,
      };
    }

    // Check room conflict excluding current slot
    const roomConflict = timetables.find(
      t => t.id !== updatedSlot.id &&
           t.room === updatedSlot.room &&
           t.day_of_week === updatedSlot.day_of_week &&
           t.timeslot === updatedSlot.timeslot
    );

    if (roomConflict) {
      return {
        success: false,
        conflictMessage: `VENUE OVERLAPPING CONFLICT: ${updatedSlot.room} is already booked by ${roomConflict.faculty_name} for ${roomConflict.course_code} on ${updatedSlot.day_of_week} at ${updatedSlot.timeslot}.`,
      };
    }

    // Update state
    setTimetables(prev => prev.map(t => t.id === updatedSlot.id ? updatedSlot : t));

    // Dispatch urgent notification for timetable rescheduling
    const rescheduleNotice: Announcement = {
      id: Date.now(),
      title: `Urgent Timetable Adjustment: ${updatedSlot.course_code} (${updatedSlot.section})`,
      content: `Notice of Schedule Revision: ${updatedSlot.course_code} (${updatedSlot.course_title}) with ${updatedSlot.faculty_name} has been updated to ${updatedSlot.day_of_week} at ${updatedSlot.timeslot} in ${updatedSlot.room}.`,
      audience: 'all',
      priority: 'urgent',
      author: currentUser?.full_name || 'Academic Administration',
      uploader_role: currentUser?.role === 'hod' ? 'HOD CS' : 'ADMIN',
      uploader_name: currentUser?.full_name || 'Administration',
      deadline: 'Spring 2025 Active',
      deadline_display: 'Effective Immediately',
      created_at: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' · PKT',
      is_read: false,
    };
    setAnnouncements(prev => [rescheduleNotice, ...prev]);

    if (currentUser) {
      logAudit(
        'TIMETABLE_UPDATED',
        `Updated slot for ${updatedSlot.course_code} in ${updatedSlot.room} on ${updatedSlot.day_of_week} ${updatedSlot.timeslot}`,
        currentUser.full_name
      );
    }

    return { success: true };
  };

  // 6. Admin Actions: Cohort Semester Promotion & Graduation Engine
  const handlePromoteCohort = (departmentId: number, semester: number, actionType: 'promote' | 'graduate') => {
    if (!currentUser) return;
    const dept = departments.find(d => d.id === departmentId);
    const deptName = dept?.code || 'CS';

    if (actionType === 'graduate' || semester === 8) {
      // Graduate all semester 8 students
      let count = 0;
      setUsers(prev =>
        prev.map(u => {
          if (u.role === 'student' && u.department_id === departmentId && u.semester === 8 && u.status === 'active') {
            count++;
            return {
              ...u,
              status: 'graduated',
              designation: 'UCMS Alumnus (Degree Conferred)',
            };
          }
          return u;
        })
      );

      const gradNotice: Announcement = {
        id: Date.now(),
        title: `Urgent: Degree Conferred & Graduation Concluded - ${deptName} Batch`,
        content: `Central Administration has officially conferred degrees upon ${count} graduating seniors of ${deptName} (Semester 8). All academic records have been archived to Alumni status. Congratulations to our graduates!`,
        audience: 'all',
        priority: 'urgent',
        author: currentUser.full_name,
        uploader_role: 'ADMIN',
        uploader_name: currentUser.full_name,
        deadline: 'Convocation 2025',
        deadline_display: 'Degree Conferred',
        created_at: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' · PKT',
        is_read: false,
      };
      setAnnouncements(prev => [gradNotice, ...prev]);

      logAudit(
        'COHORT_GRADUATED',
        `Conferred degrees upon ${count} graduating seniors of ${deptName} (Semester 8 Alumni conferred).`,
        currentUser.full_name
      );
    } else {
      // Batch increment semester
      const nextSem = semester + 1;
      let count = 0;
      setUsers(prev =>
        prev.map(u => {
          if (u.role === 'student' && u.department_id === departmentId && u.semester === semester && u.status === 'active') {
            count++;
            return {
              ...u,
              semester: nextSem,
            };
          }
          return u;
        })
      );

      const promoNotice: Announcement = {
        id: Date.now(),
        title: `Urgent: Cohort Promotion Alert - ${deptName} Semester ${semester} → Semester ${nextSem}`,
        content: `Academic Progression Notification: Central Administration has officially promoted ${count} students of ${deptName} from Semester ${semester} to Semester ${nextSem}. All students must check their course enrollment, updated timetables, and academic handouts for the new semester.`,
        audience: 'all',
        priority: 'urgent',
        author: currentUser.full_name,
        uploader_role: 'ADMIN',
        uploader_name: currentUser.full_name,
        deadline: `Semester ${nextSem} Enrollment`,
        deadline_display: 'Effective Immediately',
        created_at: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' · PKT',
        is_read: false,
      };
      setAnnouncements(prev => [promoNotice, ...prev]);

      logAudit(
        'COHORT_PROMOTION',
        `Batch promoted ${count} students of ${deptName} from Semester ${semester} to Semester ${nextSem}.`,
        currentUser.full_name
      );
    }
  };

  // Admin Actions: Quick +1 Sem on single student row
  const handleUpgradeSingleStudent = (studentId: number) => {
    const student = users.find(u => u.id === studentId);
    if (!student || !currentUser) return;

    const curSem = student.semester || 1;
    if (curSem >= 8) {
      setUsers(prev =>
        prev.map(u =>
          u.id === studentId ? { ...u, status: 'graduated', designation: 'UCMS Alumnus' } : u
        )
      );
      logAudit('STUDENT_GRADUATED', `Student ${student.full_name} conferred degree to Alumni status.`, currentUser.full_name);
    } else {
      const next = curSem + 1;
      setUsers(prev =>
        prev.map(u => (u.id === studentId ? { ...u, semester: next } : u))
      );
      logAudit('STUDENT_UPGRADE', `Advanced student ${student.full_name} from Semester ${curSem} to Semester ${next}.`, currentUser.full_name);
    }
  };

  // Admin Actions: Update Public Website CMS
  const handleUpdateCms = (newCms: CmsSettings) => {
    setCms(newCms);
    if (currentUser) {
      logAudit('CMS_UPDATE', 'Public institutional website metrics and calendar settings updated live.', currentUser.full_name);
    }
  };

  // User Registration & Security
  const handleRegisterUser = (newUser: User) => {
    setUsers(prev => [newUser, ...prev]);
    logAudit('USER_REGISTERED', `Admin registered new user: ${newUser.full_name} (${newUser.role.toUpperCase()}) - ${newUser.email}`, currentUser?.full_name);
  };

  const handleAdminChangePassword = (userId: number, newPassword: string) => {
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, password: newPassword, has_changed_password: true } : u))
    );
    const target = users.find(u => u.id === userId);
    logAudit('PASSWORD_RESET', `Admin reset password for user: ${target?.full_name || userId}`, currentUser?.full_name);
  };

  const handleAddFacultyMember = (newFaculty: any) => {
    const dept = departments.find(d => d.id === newFaculty.department_id);
    const createdFaculty: User = {
      id: Date.now(),
      full_name: newFaculty.full_name,
      email: newFaculty.email,
      phone: newFaculty.phone || '+92 300 0000000',
      password: newFaculty.password || 'password123',
      username: newFaculty.username || newFaculty.email.split('@')[0],
      role: 'teacher',
      department_id: newFaculty.department_id || 1,
      department_name: dept?.name || 'Department of Computer Science',
      status: 'active',
      designation: newFaculty.designation || 'Lecturer',
      qualification: newFaculty.qualification || 'M.S. Computer Science',
      institutional_id: `UCMS-FAC-${Math.floor(100 + Math.random() * 900)}`,
      has_changed_password: false,
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    };
    setUsers(prev => [createdFaculty, ...prev]);

    const notice: Announcement = {
      id: Date.now() + 1,
      title: `New Faculty Induction: ${createdFaculty.full_name}`,
      content: `The Department is pleased to welcome ${createdFaculty.full_name} (${createdFaculty.designation}) to the academic faculty.`,
      audience: 'all',
      priority: 'normal',
      author: currentUser?.full_name || 'HOD Office',
      uploader_role: 'HOD',
      uploader_name: currentUser?.full_name || 'HOD Office',
      created_at: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' · PKT',
      is_read: false,
    };
    setAnnouncements(prev => [notice, ...prev]);
    logAudit('FACULTY_INDUCTED', `HOD added faculty member: ${createdFaculty.full_name}`, currentUser?.full_name);
  };

  const handleUnassignCourse = (courseId: number) => {
    const targetCourse = courses.find(c => c.id === courseId);
    setCourses(prev =>
      prev.map(c => (c.id === courseId ? { ...c, allocated_teacher_id: undefined, allocated_teacher_name: undefined } : c))
    );
    if (targetCourse) {
      const notice: Announcement = {
        id: Date.now(),
        title: `Course Instruction Unassigned: ${targetCourse.code}`,
        content: `Course ${targetCourse.code} (${targetCourse.title}) instruction load has been unassigned for schedule reallocation.`,
        audience: 'teachers',
        priority: 'normal',
        author: currentUser?.full_name || 'HOD Office',
        uploader_role: 'HOD',
        uploader_name: currentUser?.full_name || 'HOD Office',
        created_at: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' · PKT',
        is_read: false,
      };
      setAnnouncements(prev => [notice, ...prev]);
      logAudit('COURSE_UNASSIGNED', `HOD unassigned instructor from course: ${targetCourse.code}`, currentUser?.full_name);
    }
  };

  const handleResolveReport = (reportId: number, status?: 'Resolved' | 'Dismissed', resolutionNote?: string) => {
    setReports(prev =>
      prev.map(r =>
        r.id === reportId
          ? {
              ...r,
              status: status || 'Resolved',
              resolution_note: resolutionNote || 'Inquiry addressed and verified by academic administration.',
            }
          : r
      )
    );
    const rep = reports.find(r => r.id === reportId);
    logAudit(
      'INQUIRY_RESOLVED',
      `Inquiry #${reportId} (${rep?.category || 'Academic'}) set to "${status || 'Resolved'}" with directive: "${resolutionNote || 'Verified'}"`,
      currentUser?.full_name
    );
  };

  // Student unread announcements count
  const studentUnreadCount = announcements.filter(
    (a) => !a.is_read && (a.audience === 'students' || a.audience === 'all' || a.audience === 'cs_only')
  ).length;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-blue-900 selection:text-white">
      
      {/* STICKY 72px HEADER WITH 3-ZONE CONTRACT */}
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenPasswordModal={() => setIsPasswordModalForced(true)}
        studentTab={studentTab}
        onSelectStudentTab={setStudentTab}
        onOpenStudentProfileModal={() => setIsStudentProfileOpen(true)}
        facultyTab={facultyTab}
        onSelectFacultyTab={setFacultyTab}
        onOpenFacultyProfileModal={() => setIsFacultyProfileOpen(true)}
        pendingReportsCount={reports.filter(r => r.status === 'Pending Review').length}
        unreadAnnouncementsCount={studentUnreadCount}
        bookmarksCount={9}
        hodTab={hodTab}
        onSelectHodTab={setHodTab}
        onOpenHodProfileModal={() => setIsHodProfileOpen(true)}
        adminTab={adminTab}
        onSelectAdminTab={setAdminTab}
        onOpenAdminProfileModal={() => setIsAdminProfileOpen(true)}
      />

      {/* SEAMLESS VIEW RENDERING */}
      <main className="flex-1 w-full">
        {!currentUser && (
          <PublicGateway onLogin={handleLogin} cms={cms} />
        )}

        {currentUser?.role === 'student' && (
          <StudentWorkspace
            user={currentUser}
            courses={courses}
            handouts={handouts}
            timetables={timetables}
            announcements={announcements}
            reports={reports}
            assessments={assessments}
            activeTab={studentTab}
            onSelectTab={setStudentTab}
            onOpenProfileModal={() => setIsStudentProfileOpen(true)}
            onLogout={handleLogout}
            onMarkAnnouncementRead={handleMarkAnnouncementRead}
            onSubmitReport={handleSubmitReport}
            onSubmitAssessment={handleSubmitAssessment}
          />
        )}

        {currentUser?.role === 'teacher' && (
          <FacultyWorkspace
            user={currentUser}
            courses={courses}
            handouts={handouts}
            resourceVersions={resourceVersions}
            timetables={timetables}
            announcements={announcements}
            reports={reports}
            assessments={assessments}
            activeTab={facultyTab}
            onSelectTab={setFacultyTab}
            onOpenProfileModal={() => setIsFacultyProfileOpen(true)}
            onLogout={handleLogout}
            onUploadHandout={handleUploadHandout}
            onCreateAssessment={handleCreateAssessment}
            onResolveReport={handleResolveReport}
          />
        )}

        {currentUser?.role === 'hod' && (
          <HodWorkspace
            user={currentUser}
            facultyMembers={users}
            courses={courses}
            timetables={timetables}
            announcements={announcements}
            reports={reports}
            onResolveReport={handleResolveReport}
            onAllocateCourse={handleAllocateCourse}
            onUnassignCourse={handleUnassignCourse}
            onAddFacultyMember={handleAddFacultyMember}
            onAddTimetable={handleAddTimetable}
            onUpdateTimetable={handleUpdateTimetable}
            activeTab={hodTab}
            onSelectTab={setHodTab}
            onOpenProfileModal={() => setIsHodProfileOpen(true)}
            onLogout={handleLogout}
            onAddAnnouncement={(a) => {
              const item: Announcement = {
                ...a,
                id: Date.now(),
                created_at: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' · PKT',
                is_read: false,
              };
              setAnnouncements(prev => [item, ...prev]);
              logAudit('NOTICE_BROADCAST', `HOD broadcasted notice: ${item.title}`, currentUser?.full_name);
            }}
          />
        )}

        {currentUser?.role === 'admin' && (
          <AdminWorkspace
            user={currentUser}
            users={users}
            departments={departments}
            cms={cms}
            auditLogs={auditLogs}
            timetables={timetables}
            courses={courses}
            reports={reports}
            onResolveReport={handleResolveReport}
            onRegisterUser={handleRegisterUser}
            onAdminChangePassword={handleAdminChangePassword}
            activeTab={adminTab}
            onSelectTab={setAdminTab}
            onOpenProfileModal={() => setIsAdminProfileOpen(true)}
            onLogout={handleLogout}
            onPromoteCohort={handlePromoteCohort}
            onUpgradeSingleStudent={handleUpgradeSingleStudent}
            onUpdateCms={handleUpdateCms}
            onAddTimetable={handleAddTimetable}
            onUpdateTimetable={handleUpdateTimetable}
            onAddAnnouncement={(a) => {
              const item: Announcement = {
                ...a,
                id: Date.now(),
                created_at: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' · PKT',
                is_read: false,
              };
              setAnnouncements(prev => [item, ...prev]);
              logAudit('CAMPUS_BROADCAST', `Admin broadcasted notice: ${item.title}`, currentUser?.full_name);
            }}
            onUpdateUserStatus={(userId, status) => {
              setUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));
              logAudit('USER_STATUS_CHANGE', `User ID ${userId} status set to ${status}`, currentUser?.full_name);
            }}
          />
        )}
      </main>

      {/* STUDENT PROFILE & ACCOUNT SETTINGS MODAL */}
      {currentUser?.role === 'student' && (
        <StudentProfileModal
          isOpen={isStudentProfileOpen}
          onClose={() => setIsStudentProfileOpen(false)}
          user={currentUser}
          onUpdatePassword={handlePasswordChanged}
          onUpdateAvatar={handleStudentAvatarUpdate}
          onLogout={handleLogout}
        />
      )}

      {/* FACULTY PROFILE & ACCOUNT SETTINGS MODAL */}
      {currentUser?.role === 'teacher' && (
        <FacultyProfileModal
          isOpen={isFacultyProfileOpen}
          onClose={() => setIsFacultyProfileOpen(false)}
          user={currentUser}
          onUpdatePassword={handlePasswordChanged}
          onLogout={handleLogout}
        />
      )}

      {/* HOD PROFILE & LEADERSHIP SETTINGS MODAL */}
      {currentUser?.role === 'hod' && (
        <HodProfileModal
          isOpen={isHodProfileOpen}
          onClose={() => setIsHodProfileOpen(false)}
          user={currentUser}
          onUpdatePassword={handlePasswordChanged}
          onUpdateAvatar={handleStudentAvatarUpdate}
          onLogout={handleLogout}
        />
      )}

      {/* ADMIN PROFILE & MASTER CREDENTIALS MODAL */}
      {currentUser?.role === 'admin' && (
        <AdminProfileModal
          isOpen={isAdminProfileOpen}
          onClose={() => setIsAdminProfileOpen(false)}
          user={currentUser}
          onUpdatePassword={handlePasswordChanged}
          onUpdateAvatar={handleStudentAvatarUpdate}
          onLogout={handleLogout}
        />
      )}

      {/* FIRST-TIME LOGIN PASSWORD ENFORCEMENT MODAL */}
      {isPasswordModalForced && currentUser && (
        <FirstLoginModal
          user={currentUser}
          onPasswordChanged={handlePasswordChanged}
          onSkipForNow={handleDismissFirstLoginModal}
        />
      )}

      {/* PHP & MYSQL SOURCE CODE EXPORT MODAL */}
      <PhpSourceExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

    </div>
  );
}
