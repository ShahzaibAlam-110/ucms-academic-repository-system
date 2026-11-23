import React, { useState } from 'react';
import {
  Shield,
  Users,
  BookOpen,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Plus,
  Sparkles,
  MapPin,
  Clock,
  Search,
  Filter,
  Bell,
  Printer,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  GraduationCap,
  UserCheck,
  Award,
  Layers,
  Send,
  X,
  FileText,
  Building,
  AlertCircle,
} from 'lucide-react';
import { User, Course, TimetableSlot, Announcement, StudentReport } from '../data/mockDatabase';
import { usePKTClock, formatPKTDateTimeString } from '../utils/timeUtils';
import { AttachmentUploader, AttachmentData } from './AttachmentUploader';
import { AnnouncementAttachment } from './AnnouncementAttachment';

interface HodWorkspaceProps {
  user: User;
  facultyMembers: User[];
  courses: Course[];
  timetables: TimetableSlot[];
  announcements?: Announcement[];
  reports?: StudentReport[];
  onAllocateCourse: (courseId: number, facultyId: number, session: string) => void;
  onAddTimetable: (slot: Omit<TimetableSlot, 'id'>) => { success: boolean; conflictMessage?: string };
  onUpdateTimetable?: (slot: TimetableSlot) => { success: boolean; conflictMessage?: string };
  onAddAnnouncement?: (announcement: Omit<Announcement, 'id' | 'created_at'>) => void;
  onAddFacultyMember?: (newFaculty: Omit<User, 'id'>) => void;
  onUnassignCourse?: (courseId: number) => void;
  onResolveReport?: (reportId: number, status?: 'Resolved' | 'Dismissed', resolutionNote?: string) => void;
  onOpenProfileModal?: () => void;
  onLogout?: () => void;
  activeTab?: 'faculty' | 'courses' | 'timetable' | 'notices';
  onSelectTab?: (tab: 'faculty' | 'courses' | 'timetable' | 'notices') => void;
}

export const HodWorkspace: React.FC<HodWorkspaceProps> = ({
  user,
  facultyMembers,
  courses,
  timetables,
  announcements = [],
  reports = [],
  onAllocateCourse,
  onAddTimetable,
  onUpdateTimetable,
  onAddAnnouncement,
  onAddFacultyMember,
  onUnassignCourse,
  onResolveReport,
  onOpenProfileModal,
  onLogout,
  activeTab: controlledTab,
  onSelectTab,
}) => {
  // Live PKT (UTC+05:00) Clock applied to system calculations (hidden from display per user request)
  const { dateStr } = usePKTClock();

  // Navigation Tabs matching HOD portal video (controlled or internal)
  const [internalTab, setInternalTab] = useState<'faculty' | 'courses' | 'timetable' | 'notices'>('faculty');
  const activeTab = controlledTab ?? internalTab;
  const setActiveTab = (tab: 'faculty' | 'courses' | 'timetable' | 'notices') => {
    if (onSelectTab) onSelectTab(tab);
    setInternalTab(tab);
  };

  // Timetable Edit Slot Modal State
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);
  const [editSlotConflict, setEditSlotConflict] = useState<string>('');
  const [editSlotSuccess, setEditSlotSuccess] = useState<string>('');

  // STRICT JURISDICTION: Department of Computer Science ONLY (dept_id === 1)
  const csFaculty = facultyMembers.filter(
    (f) => f.department_id === 1 && (f.role === 'teacher' || f.role === 'hod')
  );
  const csCourses = courses.filter((c) => c.department_id === 1);

  // Tab 1: Faculty Hub Search & Expansion State
  const [facultySearch, setFacultySearch] = useState('');
  const [selectedDesignation, setSelectedDesignation] = useState<string>('all');
  const [expandedFacultyIds, setExpandedFacultyIds] = useState<number[]>([3]); // Dr. Muhammad Asif initially expanded
  const [selectedFacultyForAssign, setSelectedFacultyForAssign] = useState<User | null>(null);
  const [assignCourseId, setAssignCourseId] = useState<number>(csCourses[0]?.id || 1);
  const [assignFeedback, setAssignFeedback] = useState<string>('');

  // Add Faculty Modal State
  const [isAddFacultyModalOpen, setIsAddFacultyModalOpen] = useState(false);
  const [newFacultyForm, setNewFacultyForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    username: '',
    password: 'password123',
    designation: 'Assistant Professor - CS',
    workload_credits: 12,
    qualification: 'M.S. Computer Science',
  });

  // Notices Tab subtab: 'circulars' | 'inquiries'
  const [noticesSubtab, setNoticesSubtab] = useState<'circulars' | 'inquiries'>('circulars');
  const [actionReport, setActionReport] = useState<StudentReport | null>(null);
  const [actionDecision, setActionDecision] = useState<'Resolved' | 'Dismissed'>('Resolved');
  const [actionNote, setActionNote] = useState('');

  const toggleExpandFaculty = (id: number) => {
    setExpandedFacultyIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Tab 2: Courses Catalog Filters
  const [courseProgramFilter, setCourseProgramFilter] = useState<'all' | 'bscs' | 'adp'>('all');
  const [courseSemesterFilter, setCourseSemesterFilter] = useState<number>(0);
  const [courseSearch, setCourseSearch] = useState('');
  const [courseToAssign, setCourseToAssign] = useState<Course | null>(null);
  const [selectedTeacherIdForCourse, setSelectedTeacherIdForCourse] = useState<number>(csFaculty[0]?.id || 2);

  // Tab 3: Timetables Subtab & Filters
  const [timetableSubtab, setTimetableSubtab] = useState<'semester' | 'teacher'>('semester');
  const [selectedSemester, setSelectedSemester] = useState<number>(6);
  const [selectedTeacherFilter, setSelectedTeacherFilter] = useState<number>(csFaculty[0]?.id || 2);
  const [selectedDay, setSelectedDay] = useState<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri'>('Mon');
  const [isAddSlotModalOpen, setIsAddSlotModalOpen] = useState(false);

  // Schedule New Slot State
  const [slotCourseId, setSlotCourseId] = useState<number>(csCourses[0]?.id || 101);
  const [slotFacultyId, setSlotFacultyId] = useState<number>(csFaculty[0]?.id || 2);
  const [slotDay, setSlotDay] = useState<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri'>('Mon');
  const [slotTime, setSlotTime] = useState<string>('08:30 AM - 10:00 AM');
  const [slotRoom, setSlotRoom] = useState<string>('CS Lab 2');
  const [slotSection, setSlotSection] = useState<string>('BSCS-6A');
  const [slotSessionType, setSlotSessionType] = useState<'Theory Lecture' | 'Lab Session'>('Theory Lecture');
  const [slotError, setSlotError] = useState<string>('');
  const [slotSuccess, setSlotSuccess] = useState<string>('');

  // Tab 4: Notices & Circulars
  const [localNotices, setLocalNotices] = useState<Announcement[]>([
    {
      id: 901,
      title: 'Departmental Faculty Council: Final Term Exam Paper Moderation',
      content:
        'All Computer Science faculty members are hereby directed to submit 3 sets of moderated question papers mapped with CLOs/PLOs for the upcoming Spring 2025 examinations by Friday 03:00 PM.',
      audience: 'teachers',
      priority: 'urgent',
      author: 'Dr. Muhammad Asif (Head of Department)',
      uploader_role: 'HOD CS',
      uploader_name: 'Dr. Muhammad Asif',
      created_at: 'Spring 2025 · PKT',
      attachment_name: 'Moderation_Committee_Guidelines.pdf',
      attachment_url: '#',
      attachment_type: 'pdf',
      attachment_size: '1.5 MB',
    },
    {
      id: 902,
      title: 'Final Year Project (FYP-I) Mid-Term Evaluation & Milestone Submission',
      content:
        'Students of BSCS Semester 7 must present their working software prototypes and sprint backlog documentation before the departmental defense committee in Conference Hall A.',
      audience: 'cs_only',
      priority: 'normal',
      author: 'Dr. Muhammad Asif (Head of Department)',
      uploader_role: 'HOD CS',
      uploader_name: 'Dr. Muhammad Asif',
      created_at: 'Spring 2025 · PKT',
    },
    ...announcements.filter((a) => a.uploader_role === 'HOD CS' || a.audience === 'cs_only'),
  ]);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeAudience, setNoticeAudience] = useState<'cs_only' | 'teachers' | 'all'>('cs_only');
  const [noticePriority, setNoticePriority] = useState<'normal' | 'urgent'>('normal');
  const [noticeAttachment, setNoticeAttachment] = useState<AttachmentData | null>(null);
  const [noticeSuccess, setNoticeSuccess] = useState('');

  // Handle Course Assignment from Faculty Modal
  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFacultyForAssign) return;
    onAllocateCourse(assignCourseId, selectedFacultyForAssign.id, 'Spring 2025');
    const targetCourse = csCourses.find((c) => c.id === assignCourseId);
    setAssignFeedback(
      `Course ${targetCourse?.code}: ${targetCourse?.title} successfully assigned to ${selectedFacultyForAssign.full_name}.`
    );
    setTimeout(() => {
      setAssignFeedback('');
      setSelectedFacultyForAssign(null);
    }, 2500);
  };

  // Handle Course Assignment from Courses Tab Modal
  const handleCourseReassignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseToAssign) return;
    onAllocateCourse(courseToAssign.id, selectedTeacherIdForCourse, 'Spring 2025');
    const targetTeacher = csFaculty.find((f) => f.id === selectedTeacherIdForCourse);
    setAssignFeedback(
      `${courseToAssign.code} successfully assigned to ${targetTeacher?.full_name}.`
    );
    setTimeout(() => {
      setAssignFeedback('');
      setCourseToAssign(null);
    }, 2500);
  };

  // Handle Unassign Course
  const handleUnassignCourse = (courseId: number) => {
    if (onUnassignCourse) {
      onUnassignCourse(courseId);
    }
    const targetCourse = csCourses.find((c) => c.id === courseId);
    setAssignFeedback(`Course ${targetCourse?.code || ''} unassigned successfully.`);
    setTimeout(() => {
      setAssignFeedback('');
      setCourseToAssign(null);
      setSelectedFacultyForAssign(null);
    }, 2500);
  };

  // Handle Add Faculty Member
  const handleAddFacultySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFacultyForm.full_name.trim() || !newFacultyForm.email.trim()) return;

    if (onAddFacultyMember) {
      onAddFacultyMember({
        full_name: newFacultyForm.full_name.trim(),
        email: newFacultyForm.email.trim(),
        phone: newFacultyForm.phone.trim() || '+92 300 1234567',
        username: newFacultyForm.username.trim() || newFacultyForm.email.split('@')[0],
        password: newFacultyForm.password || 'password123',
        role: 'teacher',
        department_id: 1,
        department_name: 'Department of Computer Science',
        designation: newFacultyForm.designation,
        workload_credits: Number(newFacultyForm.workload_credits) || 12,
        qualification: newFacultyForm.qualification,
        status: 'active',
        has_changed_password: false,
        session: 'Spring 2025',
        batch: 'Spring 2025 (Morning)',
        institutional_id: `UCMS-FAC-${Math.floor(1000 + Math.random() * 9000)}`,
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
      });
    }

    setIsAddFacultyModalOpen(false);
    setNewFacultyForm({
      full_name: '',
      email: '',
      phone: '',
      username: '',
      password: 'password123',
      designation: 'Assistant Professor - CS',
      workload_credits: 12,
      qualification: 'M.S. Computer Science',
    });
    setAssignFeedback(`Faculty member enrolled successfully into Computer Science Department.`);
    setTimeout(() => setAssignFeedback(''), 4000);
  };

  // Handle HOD Action on Inquiry
  const handleHodTakeActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionReport) return;
    const finalNote = actionNote.trim() || (actionDecision === 'Resolved' ? 'Resolved: Investigated and verified by HOD CS.' : 'Reviewed: HOD CS verified schedule and repository standards.');
    if (onResolveReport) {
      onResolveReport(actionReport.id, actionDecision, finalNote);
    }
    setActionReport(null);
    setAssignFeedback(`Inquiry status updated to ${actionDecision} with response sent to student.`);
    setTimeout(() => setAssignFeedback(''), 3500);
  };

  // Handle Add Slot with Conflict Detection
  const handleAddSlotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSlotError('');
    setSlotSuccess('');

    const targetCourse = csCourses.find((c) => c.id === slotCourseId);
    const targetFaculty = csFaculty.find((f) => f.id === slotFacultyId);

    if (!targetCourse || !targetFaculty) return;

    const result = onAddTimetable({
      course_id: slotCourseId,
      course_code: targetCourse.code,
      course_title: targetCourse.title,
      faculty_id: slotFacultyId,
      faculty_name: targetFaculty.full_name,
      day_of_week: slotDay,
      timeslot: slotTime,
      room: slotRoom,
      section: slotSection,
      session_type: slotSessionType,
    });

    if (!result.success && result.conflictMessage) {
      setSlotError(result.conflictMessage);
    } else {
      setSlotSuccess(`Timetable slot verified & published for ${targetCourse.code} in ${slotRoom}.`);
      setTimeout(() => {
        setSlotSuccess('');
        setIsAddSlotModalOpen(false);
      }, 2000);
    }
  };

  // Handle Publish Circular Notice
  const handlePublishNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeContent.trim()) return;

    const newNotice: Announcement = {
      id: Date.now(),
      title: noticeTitle,
      content: noticeContent,
      audience: noticeAudience,
      priority: noticePriority,
      author: 'Dr. Muhammad Asif (Head of Department)',
      uploader_role: 'HOD CS',
      uploader_name: 'Dr. Muhammad Asif',
      created_at: formatPKTDateTimeString(),
      is_read: false,
      attachment_name: noticeAttachment?.name,
      attachment_url: noticeAttachment?.url,
      attachment_type: noticeAttachment?.type,
      attachment_size: noticeAttachment?.size,
    };

    setLocalNotices((prev) => [newNotice, ...prev]);
    if (onAddAnnouncement) {
      onAddAnnouncement({
        title: noticeTitle,
        content: noticeContent,
        audience: noticeAudience,
        priority: noticePriority,
        author: 'Dr. Muhammad Asif (Head of Department)',
        uploader_role: 'HOD CS',
        uploader_name: 'Dr. Muhammad Asif',
        attachment_name: noticeAttachment?.name,
        attachment_url: noticeAttachment?.url,
        attachment_type: noticeAttachment?.type,
        attachment_size: noticeAttachment?.size,
      });
    }

    setNoticeTitle('');
    setNoticeContent('');
    setNoticeAttachment(null);
    setNoticeSuccess('Department circular broadcasted immediately across student and faculty portals.');
    setTimeout(() => setNoticeSuccess(''), 4000);
  };

  // Filtered Faculty (HOD first, matching hod_05.jpg)
  const filteredFaculty = csFaculty
    .filter((f) => {
      if (selectedDesignation !== 'all' && !(f.designation || '').toLowerCase().includes(selectedDesignation.toLowerCase())) {
        return false;
      }
      if (!facultySearch.trim()) return true;
      const q = facultySearch.toLowerCase();
      return (
        f.full_name.toLowerCase().includes(q) ||
        (f.designation || '').toLowerCase().includes(q) ||
        (f.email || '').toLowerCase().includes(q) ||
        (f.qualification || '').toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (a.role === 'hod' && b.role !== 'hod') return -1;
      if (a.role !== 'hod' && b.role === 'hod') return 1;
      return a.full_name.localeCompare(b.full_name);
    });

  // Filtered Courses
  const filteredCourses = csCourses.filter((c) => {
    if (courseSemesterFilter > 0 && c.semester !== courseSemesterFilter) return false;
    if (courseProgramFilter === 'bscs' && !c.code.startsWith('CS-')) return false;
    if (courseSearch.trim()) {
      const q = courseSearch.toLowerCase();
      return c.title.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
    }
    return true;
  });

  // Filtered Timetable Slots for Subtab
  const currentSlots = timetables.filter((slot) => {
    if (slot.day_of_week !== selectedDay) return false;
    if (timetableSubtab === 'semester') {
      // Filter slots that belong to courses in the selected semester
      const c = courses.find((crs) => crs.code === slot.course_code);
      if (c && c.semester !== selectedSemester) return false;
    } else {
      // Filter slots by selected teacher
      if (slot.faculty_id !== selectedTeacherFilter) return false;
    }
    return true;
  });

  const days: Array<{ key: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri'; label: string }> = [
    { key: 'Mon', label: 'Monday' },
    { key: 'Tue', label: 'Tuesday' },
    { key: 'Wed', label: 'Wednesday' },
    { key: 'Thu', label: 'Thursday' },
    { key: 'Fri', label: 'Friday' },
  ];

  return (
    <div className="bg-[#f8fafc] min-h-[calc(100vh-72px)] py-6 sm:py-8 px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* 1. EXECUTIVE BANNER (MATCHING HOD PORTAL VIDEO hod_70.jpg WITH AVATAR) */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="flex items-start sm:items-center gap-4">
              <button
                type="button"
                onClick={() => onOpenProfileModal && onOpenProfileModal()}
                className="relative shrink-0 cursor-pointer group"
                title="View HOD Profile Details"
              >
                <img
                  src={
                    user.avatar_url ||
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80'
                  }
                  alt={user.full_name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-500 shadow-sm group-hover:scale-105 transition-transform"
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center">
                  <Shield className="w-3 h-3 text-white" />
                </div>
              </button>

              <div className="space-y-1.5 min-w-0">
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
                  DEPARTMENT LEADERSHIP CONSOLE · UCMS KHANEWAL
                </span>

                <h1 className="font-serif-collegiate text-xl sm:text-2xl lg:text-3xl font-black text-blue-950 tracking-tight">
                  Welcome back, {user.full_name}
                </h1>

                {/* Status Metadata Pills matching hod_70.jpg */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-semibold">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0f2744] text-white font-bold text-xs shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Department of Computer Science</span>
                  </span>
                  <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-900 border border-blue-200 font-bold text-xs">
                    Active Session: Spring 2025
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs">
                    <Shield className="w-3.5 h-3.5 text-amber-700" />
                    <span>Head of Department (HOD)</span>
                  </span>
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-mono text-xs border border-slate-200">
                    Employee ID: {user.institutional_id || 'UCMS-HOD-001'}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    <span>{user.chamber || 'HOD Suite - Room 101'}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Office suite & Official Profile */}
            <div className="flex flex-col items-start lg:items-end justify-between gap-3 shrink-0">
              {onOpenProfileModal && (
                <button
                  type="button"
                  onClick={onOpenProfileModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-blue-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all cursor-pointer shadow-2xs"
                >
                  <span>Official HOD Details</span>
                </button>
              )}
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                <MapPin className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                <span>Office: HOD Suite, Room 101, Academic Block A</span>
              </div>
              <div className="text-[11px] font-bold text-slate-500 font-mono">
                <span>Academic Block A · Faculty Chamber</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. THREE INSTITUTIONAL METRIC CARDS (Matching hod_70.jpg) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-900 border border-blue-200 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 text-blue-900" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                CS FACULTY MEMBERS
              </span>
              <div className="text-xl sm:text-2xl font-black text-blue-950 tabular-nums">
                14 Faculty Members
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-900 border border-blue-200 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6 text-blue-900" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                ACTIVE CS COURSES
              </span>
              <div className="text-xl sm:text-2xl font-black text-blue-950 tabular-nums">
                26 Courses Offered
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-900 border border-blue-200 flex items-center justify-center shrink-0">
              <GraduationCap className="w-6 h-6 text-blue-900" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                ENROLLED CS STUDENTS
              </span>
              <div className="text-xl sm:text-2xl font-black text-blue-950 tabular-nums">
                420 Students
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            TAB 1: FACULTY HUB (MATCHING hod_05.jpg & hod_20.jpg EXACT ACCORDION LAYOUT)
            ========================================================================= */}
        {activeTab === 'faculty' && (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            {/* Top Breadcrumb & Action Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2 mb-1.5 text-xs">
                  <span className="font-extrabold text-blue-900 uppercase tracking-wider text-[11px]">
                    FACULTY HUB
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#0f2744] text-white font-bold text-[10px]">
                    ● Department of Computer Science
                  </span>
                  <span className="text-slate-400 font-semibold text-xs">Spring 2025</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-blue-950 tracking-tight">
                  Department Faculty Members ({filteredFaculty.length})
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Managing Computer Science faculty roster and teaching assignments.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddFacultyModalOpen(true)}
                className="py-2.5 px-4 bg-[#0f2744] hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4 text-amber-300" />
                <span>+ Add Faculty Member</span>
              </button>
            </div>

            {/* Filter Bar matching hod_05.jpg */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Left Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={facultySearch}
                  onChange={(e) => setFacultySearch(e.target.value)}
                  placeholder="Search by faculty name, subject, or email..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-900 font-medium"
                />
              </div>

              {/* Right Designation Filter */}
              <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-slate-600 font-medium">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span>Designation:</span>
                <select
                  value={selectedDesignation}
                  onChange={(e) => setSelectedDesignation(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-white font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-900"
                >
                  <option value="all">All Designations ({csFaculty.length})</option>
                  <option value="Professor">Professors</option>
                  <option value="Assistant Professor">Assistant Professors</option>
                  <option value="Lecturer">Lecturers</option>
                  <option value="Lab Engineer">Lab Engineers</option>
                  <option value="Visiting">Visiting Faculty</option>
                </select>
              </div>
            </div>

            {assignFeedback && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{assignFeedback}</span>
              </div>
            )}

            {/* Expandable Accordion List matching hod_05.jpg & hod_20.jpg */}
            <div className="space-y-3.5">
              {filteredFaculty.map((member) => {
                const isExpanded = expandedFacultyIds.includes(member.id);
                const isHod = member.role === 'hod' || member.id === 3 || member.id === 303;
                const assignedCourses = csCourses.filter(
                  (c) =>
                    c.allocated_teacher_id === member.id ||
                    c.allocated_teacher_name?.includes(member.full_name) ||
                    (isHod && ['CS-402', 'CS-499'].includes(c.code)) ||
                    (member.id === 5 && ['CS-401', 'CS-601'].includes(c.code)) ||
                    (member.id === 6 && ['CS-301', 'CS-402', 'CS-101'].includes(c.code)) ||
                    (member.id === 7 && ['CS-201', 'CS-501', 'CS-302'].includes(c.code)) ||
                    (member.id === 8 && ['CS-202', 'CS-303'].includes(c.code)) ||
                    (member.id === 9 && ['CS-102'].includes(c.code))
                );
                const totalCredits =
                  assignedCourses.reduce((sum, c) => sum + (c.credit_hours || 3), 0) ||
                  member.workload_credits ||
                  6;

                return (
                  <div
                    key={member.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:border-slate-300 transition-all"
                  >
                    {/* Accordion Row Header */}
                    <div
                      onClick={() => toggleExpandFaculty(member.id)}
                      className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/60 transition-colors"
                    >
                      {/* Left: Avatar + Identity + Contact */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 shadow-2xs">
                          <img
                            src={
                              member.avatar_url ||
                              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80'
                            }
                            alt={member.full_name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-extrabold text-blue-950">
                              {member.full_name}
                            </h3>
                            {isHod && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-200">
                                HOD
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-600 font-medium">
                            {member.designation || 'Faculty Member'} •{' '}
                            <span className="text-slate-500">
                              {member.qualification || 'M.S. Computer Science'}
                            </span>
                          </p>

                          <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-slate-500 font-medium pt-0.5">
                            <span className="flex items-center gap-1 font-mono">
                              <span>✉</span>
                              <span>{member.email}</span>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 font-mono">
                              <span>📞</span>
                              <span>{member.phone || '+92 300 7891234'}</span>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{member.chamber || 'Faculty Block B-17'}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Courses Assigned Pill + Credit Hours + Chevron in circle */}
                      <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                        <div className="text-left md:text-right">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-950 border border-blue-200 text-xs font-bold shadow-2xs">
                            <BookOpen className="w-3.5 h-3.5 text-blue-800" />
                            <span>{assignedCourses.length} Courses Assigned</span>
                          </div>
                          <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
                            {totalCredits} Credit Hours Assigned
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpandFaculty(member.id);
                          }}
                          className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-600 shadow-2xs transition-colors cursor-pointer"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expanded View: ASSIGNED SUBJECT MODULES Grid matching hod_05.jpg */}
                    {isExpanded && (
                      <div className="px-5 pb-5 pt-3.5 border-t border-slate-100 bg-[#f8fafc]/60 space-y-3.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-black text-blue-950 uppercase tracking-wider">
                            <BookOpen className="w-4 h-4 text-blue-900" />
                            <span>ASSIGNED SUBJECT MODULES ({assignedCourses.length})</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedFacultyForAssign(member);
                              setAssignCourseId(csCourses[0]?.id || 1);
                            }}
                            className="py-1.5 px-3.5 bg-[#0f2744] hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5 text-amber-300" />
                            <span>Assign / Edit Courses</span>
                          </button>
                        </div>

                        {/* Modules Cards Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {assignedCourses.length === 0 ? (
                            <div className="p-4 bg-white rounded-xl border border-dashed border-slate-200 col-span-full text-center text-xs text-slate-400">
                              No course modules assigned yet. Click "Assign / Edit Courses" to allocate.
                            </div>
                          ) : (
                            assignedCourses.map((c) => (
                              <div
                                key={c.id}
                                className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2 hover:border-slate-300 transition-colors"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-xs font-black text-blue-900">
                                    {c.code}
                                  </span>
                                  <span className="font-mono text-xs font-bold text-slate-500">
                                    {c.assigned_sections || 'BSCS-8A'}
                                  </span>
                                </div>
                                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug line-clamp-1">
                                  {c.title}
                                </h4>
                                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                                  <span className="text-slate-500 font-semibold">
                                    {c.credit_hours || 3} Cr. Hours
                                  </span>
                                  <span className="px-2 py-0.5 rounded text-[9.5px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                                    {c.title.toLowerCase().includes('lab') ? 'PRACTICAL' : 'THEORY'}
                                  </span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: COURSES CATALOG
            ========================================================================= */}
        {activeTab === 'courses' && (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <h2 className="font-serif-collegiate text-xl font-black text-blue-950">
                  Accredited CS Courses Catalog (26 Offered)
                </h2>
                <p className="text-xs text-slate-500">
                  Manage teaching allocations, credit weights, and semester distribution.
                </p>
              </div>

              {/* Program Filters & Search */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                  <button
                    type="button"
                    onClick={() => setCourseProgramFilter('all')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      courseProgramFilter === 'all' ? 'bg-blue-900 text-white shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    All CS Courses
                  </button>
                  <button
                    type="button"
                    onClick={() => setCourseProgramFilter('bscs')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      courseProgramFilter === 'bscs' ? 'bg-blue-900 text-white shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    BS Computer Science
                  </button>
                </div>

                <select
                  value={courseSemesterFilter}
                  onChange={(e) => setCourseSemesterFilter(Number(e.target.value))}
                  className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-[#f8fafc] font-bold text-slate-700"
                >
                  <option value={0}>All Semesters</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Courses List */}
            <div className="space-y-3">
              {filteredCourses.map((c) => {
                return (
                  <div
                    key={c.id}
                    className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-[#f8fafc] hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3.5 flex-1 min-w-0">
                      <div className="px-3 py-1.5 rounded-xl bg-[#0f2744] text-white font-mono font-black text-xs sm:text-sm tracking-wider shrink-0 w-fit shadow-2xs">
                        {c.code}
                      </div>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                            {c.title}
                          </h3>
                          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-950 font-bold text-[11px] font-mono">
                            {c.credit_display || `${c.credit_hours} Cr`}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold text-[11px]">
                            Sem {c.semester}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-medium">
                          <span>
                            Assigned Teacher:{' '}
                            <strong className="text-blue-950">
                              {c.allocated_teacher_name || 'Prof. Asim Riaz'}
                            </strong>
                          </span>
                          <span className="text-slate-300">•</span>
                          <span>
                            Venue:{' '}
                            <strong className="text-slate-700">{c.room || 'CS Block - Lab 3'}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0">
                      <button
                        type="button"
                        onClick={() => {
                          setCourseToAssign(c);
                          setSelectedTeacherIdForCourse(c.allocated_teacher_id || csFaculty[0]?.id || 2);
                        }}
                        className="px-3.5 py-1.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-amber-300" />
                        <span>Assign / Reassign</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: TIMETABLES (UNIFIED LAYOUT & COLORS MATCHING STUDENT PORTAL EXACTLY)
            ========================================================================= */}
        {activeTab === 'timetable' && (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center shrink-0 border border-blue-200">
                    <Calendar className="w-5 h-5 text-blue-900" />
                  </div>
                  <h2 className="font-serif-collegiate text-lg sm:text-xl font-black text-blue-950">
                    Department Timetable & Master Schedule
                  </h2>
                </div>
                <p className="text-xs text-slate-500">
                  Unified departmental schedule matching official student & faculty portals.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddSlotModalOpen(true)}
                  className="px-3.5 sm:px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-amber-300" />
                  <span>Schedule Slot</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 sm:px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-slate-500" />
                  <span>Print</span>
                </button>
              </div>
            </div>

            {/* Subtabs: Semester-Wise vs Teacher-Wise */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#f8fafc] p-3 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs overflow-x-auto no-scrollbar shrink-0">
                <button
                  type="button"
                  onClick={() => setTimetableSubtab('semester')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    timetableSubtab === 'semester'
                      ? 'bg-blue-900 text-white shadow-2xs font-black'
                      : 'text-slate-600 hover:text-blue-950'
                  }`}
                >
                  Semester-Wise
                </button>
                <button
                  type="button"
                  onClick={() => setTimetableSubtab('teacher')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    timetableSubtab === 'teacher'
                      ? 'bg-blue-900 text-white shadow-2xs font-black'
                      : 'text-slate-600 hover:text-blue-950'
                  }`}
                >
                  Teacher-Wise
                </button>
              </div>

              {timetableSubtab === 'semester' ? (
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                  {[1, 3, 5, 7].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSemester(s)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        selectedSemester === s
                          ? 'bg-amber-400 text-blue-950 font-black shadow-2xs ring-1 ring-amber-500'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Semester {s}
                    </button>
                  ))}
                </div>
              ) : (
                <select
                  value={selectedTeacherFilter}
                  onChange={(e) => setSelectedTeacherFilter(Number(e.target.value))}
                  className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-white font-bold text-slate-700 w-full md:max-w-[260px]"
                >
                  {csFaculty.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.full_name} ({f.designation?.split('-')[0] || 'Faculty'})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Day Selector Strip matching Student Portal (Scrollable on mobile, 5-col on desktop) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none sm:grid sm:grid-cols-5">
              {days.map((d) => {
                const count = timetables.filter((slot) => {
                  if (slot.day_of_week !== d.key) return false;
                  if (timetableSubtab === 'semester') {
                    const c = courses.find((crs) => crs.code === slot.course_code);
                    if (c && c.semester !== selectedSemester) return false;
                  } else {
                    if (slot.faculty_id !== selectedTeacherFilter) return false;
                  }
                  return true;
                }).length;
                const isSelected = selectedDay === d.key;
                return (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => setSelectedDay(d.key)}
                    className={`py-3 px-3 rounded-2xl text-center transition-all cursor-pointer min-w-[100px] sm:min-w-0 shrink-0 ${
                      isSelected
                        ? 'bg-[#0f2744] text-white shadow-xs font-black ring-1 ring-[#0f2744]'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-extrabold block">{d.label}</span>
                    <span
                      className={`text-[10px] sm:text-[11px] font-bold mt-1 inline-block px-2 py-0.5 rounded-full ${
                        isSelected ? 'bg-amber-400 text-blue-950 font-black' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {count} {count === 1 ? 'Class' : 'Classes'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* UNIFIED TIMETABLE SLOTS (MATCHING STUDENT PORTAL COLORS & LAYOUT) */}
            <div className="space-y-3.5">
              {currentSlots.length === 0 ? (
                <div className="p-8 text-center bg-[#f8fafc] rounded-2xl border border-slate-200">
                  <p className="text-sm font-bold text-slate-500">
                    No classes scheduled for {days.find((d) => d.key === selectedDay)?.label} in this selection.
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Click "Schedule Timetable Slot" above to add a conflict-free lecture or lab.
                  </p>
                </div>
              ) : (
                currentSlots.map((slot) => {
                  const isLab =
                    slot.course_title.toLowerCase().includes('lab') ||
                    slot.session_type?.toLowerCase().includes('lab');
                  return (
                    <div
                      key={slot.id}
                      className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-[#f8fafc] hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        {/* Time Capsule: Light Sky Blue #dbeafe with Clock */}
                        <div className="p-2.5 sm:p-3 rounded-xl bg-white border border-slate-200 w-full sm:w-48 shrink-0 flex flex-col items-start justify-center gap-1.5 shadow-2xs">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#dbeafe] text-blue-950 border border-blue-200 font-mono text-xs sm:text-sm font-black shadow-2xs">
                            <Clock className="w-3.5 h-3.5 text-blue-800 shrink-0" />
                            <span>{slot.timeslot}</span>
                          </div>
                          <span className="text-xs font-semibold text-slate-500">
                            {slot.session_type || (isLab ? 'Lab Session' : 'Theory Lecture')}
                          </span>
                        </div>

                        {/* Course Information */}
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-[#0f2744] text-white shadow-2xs tracking-wider">
                              {slot.course_code}
                            </span>
                            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                              {slot.course_title}
                            </h3>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-medium">
                            <span>
                              Instructor: <strong className="text-slate-800">{slot.faculty_name}</strong>
                            </span>
                            <span className="text-slate-300">•</span>
                            <span>
                              Section: <strong className="text-slate-700">{slot.section}</strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Room in #fef3c6 & Action */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 border-t sm:border-t-0 border-slate-200/80 pt-3 sm:pt-0">
                        <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#fef3c6] text-amber-950 border border-amber-300 shadow-2xs">
                          <MapPin className="w-3.5 h-3.5 text-amber-700" />
                          <span>{slot.room}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setEditingSlot({ ...slot });
                            setEditSlotConflict('');
                            setEditSlotSuccess('');
                          }}
                          className="px-3.5 py-1.5 bg-[#0f2744] hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-amber-300" />
                          <span>Edit Slot</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: DEPARTMENT NOTICES (COLORFUL CARDS, TAGS & ACCORDIONS)
            ========================================================================= */}
        {activeTab === 'notices' && (
          <div className="space-y-6">
            {/* Subtabs: Circulars vs Inquiries */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setNoticesSubtab('circulars')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    noticesSubtab === 'circulars'
                      ? 'bg-[#0f2744] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Department Circulars ({localNotices.length})
                </button>
                <button
                  type="button"
                  onClick={() => setNoticesSubtab('inquiries')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    noticesSubtab === 'inquiries'
                      ? 'bg-[#0f2744] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>Student Inquiries Desk</span>
                  {reports.filter(r => r.status === 'Pending Review').length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse">
                      {reports.filter(r => r.status === 'Pending Review').length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {noticesSubtab === 'inquiries' ? (
              <div className="space-y-6">
                {/* Urgent Attention Header Banner */}
                <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-900 flex items-center justify-center shrink-0 border border-indigo-200">
                        <AlertCircle className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <h2 className="font-serif-collegiate text-xl font-black text-blue-950">
                          Student Academic Inquiries Desk
                        </h2>
                        <p className="text-xs text-slate-500">
                          Centralized oversight for Timetable Conflicts & Handout Inquiries submitted by CS scholars
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                        {reports.filter(r => r.status === 'Pending Review').length} Pending Action
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    As Department Chair, you hold sovereign review authority. Actions taken here immediately update the student's console and dispatch authoritative directives to course instructors.
                  </p>
                </div>

                {/* Inquiries List */}
                <div className="space-y-4">
                  {reports.length === 0 ? (
                    <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs font-medium">
                      No student inquiries currently on file for the Department of Computer Science.
                    </div>
                  ) : (
                    reports.map((report) => (
                      <div
                        key={report.id}
                        className={`p-6 rounded-2xl sm:rounded-3xl border bg-white shadow-2xs space-y-4 transition-all ${
                          report.status === 'Pending Review'
                            ? 'border-indigo-300 ring-2 ring-indigo-500/10'
                            : 'border-slate-200'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                                report.category === 'Timetable Issue'
                                  ? 'bg-indigo-100 text-indigo-950 border border-indigo-300'
                                  : 'bg-amber-100 text-amber-950 border border-amber-300'
                              }`}
                            >
                              {report.category === 'Timetable Issue' ? '📅 Timetable Issue' : '📄 Handout Issue'}
                            </span>
                            {report.course_code && (
                              <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-blue-50 text-blue-900 border border-blue-200">
                                {report.course_code}
                              </span>
                            )}
                            <span className="text-slate-300">•</span>
                            <span className="text-xs font-bold text-slate-800">
                              Scholar: <strong className="text-slate-900">{report.student_name}</strong> ({report.reporter_roll || 'UCMS-BSCS'})
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-400 font-mono">{report.created_at}</span>
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                report.status === 'Resolved'
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                  : report.status === 'Dismissed'
                                  ? 'bg-slate-100 text-slate-700 border border-slate-300'
                                  : 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                              }`}
                            >
                              {report.status}
                            </span>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm sm:text-base font-extrabold text-slate-900">{report.subject}</h4>
                          <div className="mt-2 p-3.5 bg-[#f8fafc] rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-medium">
                            <strong className="text-slate-900">Student Explanation:</strong> {report.description}
                          </div>
                        </div>

                        {(report.slot_info || report.handout_title) && (
                          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-xs text-blue-950 flex flex-wrap items-center gap-2">
                            <span className="font-extrabold">Affected Target Resource:</span>
                            <span className="font-mono font-bold text-blue-900">{report.slot_info || report.handout_title}</span>
                          </div>
                        )}

                        {report.resolution_note && (
                          <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 font-medium space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">
                              Official Resolution / Guidance Note on Record:
                            </span>
                            <p className="leading-relaxed">{report.resolution_note}</p>
                          </div>
                        )}

                        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                          <span className="text-[11px] text-slate-400 font-mono">
                            Institutional Inquiry Reference #{report.id}
                          </span>

                          <button
                            type="button"
                            onClick={() => {
                              setActionReport(report);
                              setActionDecision(report.status === 'Dismissed' ? 'Dismissed' : 'Resolved');
                              setActionNote(report.resolution_note || '');
                            }}
                            className="px-4 py-2 bg-[#0f2744] hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>Take Action / Resolve Inquiry</span>
                            <ChevronRight className="w-3.5 h-3.5 text-amber-300" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <>
            {/* Compose Card */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif-collegiate text-xl font-black text-blue-950">
                    Broadcast Department Circular or Urgent Notice
                  </h2>
                  <p className="text-xs text-slate-500">
                    Published officially under Dr. Muhammad Asif (HOD CS) across portal workspaces.
                  </p>
                </div>
              </div>

              {noticeSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{noticeSuccess}</span>
                </div>
              )}

              <form onSubmit={handlePublishNotice} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Target Audience</label>
                    <select
                      value={noticeAudience}
                      onChange={(e) => setNoticeAudience(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-[#f8fafc] font-bold text-slate-700"
                    >
                      <option value="cs_only">CS Students Only</option>
                      <option value="teachers">CS Faculty Members</option>
                      <option value="all">Entire CS Department (Students & Teachers)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Notice Priority Tag</label>
                    <select
                      value={noticePriority}
                      onChange={(e) => setNoticePriority(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-[#f8fafc] font-bold text-slate-700"
                    >
                      <option value="normal">Standard Academic Circular (No Badge)</option>
                      <option value="urgent">[URGENT] High Priority Alert</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Circular Title</label>
                  <input
                    type="text"
                    value={noticeTitle}
                    onChange={(e) => setNoticeTitle(e.target.value)}
                    placeholder="e.g. Schedule for Midterm Practical Assessments in CS Labs..."
                    className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl bg-[#f8fafc] focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-900 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Notice Content</label>
                  <textarea
                    rows={4}
                    value={noticeContent}
                    onChange={(e) => setNoticeContent(e.target.value)}
                    placeholder="Provide full official text, instructions, deadlines, and room allocations..."
                    className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl bg-[#f8fafc] focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-900 font-medium"
                    required
                  />
                </div>

                {/* Optional Document, Image, or Page Notification Attachment */}
                <AttachmentUploader
                  attachment={noticeAttachment}
                  onAttachmentChange={setNoticeAttachment}
                  label="Attach Circular Document / Image / Page Notification"
                  helperText="Optional: You can attach a document (PDF, Word, TXT), image/flyer (PNG, JPG), or page format notification. Leave empty if no file is needed."
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#0f2744] hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-amber-300" />
                    <span>Broadcast Department Circular →</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Active Department Notices History - Colorful Cards with Tags & Left Borders */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h3 className="font-serif-collegiate text-base sm:text-lg font-black text-blue-950">
                  Active Department Notices & Directives ({localNotices.length})
                </h3>
                <span className="text-xs font-bold text-slate-400 font-mono">Official CS Archives</span>
              </div>

              <div className="space-y-3.5">
                {localNotices.map((n, idx) => {
                  const isUrgent = n.priority === 'urgent' || n.title.toLowerCase().includes('moderation') || n.title.toLowerCase().includes('urgent');
                  const isCouncil = n.title.toLowerCase().includes('council') || n.title.toLowerCase().includes('faculty');
                  const isDirective = n.title.toLowerCase().includes('fyp') || n.title.toLowerCase().includes('evaluation') || n.title.toLowerCase().includes('submission');

                  // Distinct color styling per type
                  const borderClass = isUrgent
                    ? 'border-l-4 border-l-rose-600 border-rose-300 bg-rose-50/70'
                    : isCouncil
                    ? 'border-l-4 border-l-purple-600 border-purple-300 bg-purple-50/70'
                    : isDirective
                    ? 'border-l-4 border-l-blue-600 border-blue-300 bg-blue-50/70'
                    : 'border-l-4 border-l-emerald-600 border-emerald-300 bg-emerald-50/70';

                  const tagBadge = isUrgent ? (
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-md bg-rose-100 text-rose-900 border border-rose-300 shadow-2xs">
                      [URGENT DIRECTIVE]
                    </span>
                  ) : isCouncil ? (
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-md bg-purple-100 text-purple-900 border border-purple-300 shadow-2xs">
                      [FACULTY COUNCIL]
                    </span>
                  ) : isDirective ? (
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-md bg-blue-100 text-blue-900 border border-blue-300 shadow-2xs">
                      [ACADEMIC MILESTONE]
                    </span>
                  ) : (
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs">
                      [OFFICIAL CIRCULAR]
                    </span>
                  );

                  return (
                    <div
                      key={n.id}
                      className={`p-5 rounded-2xl border transition-all space-y-3 hover:shadow-xs ${borderClass}`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          {tagBadge}
                          <span className="text-slate-400">•</span>
                          <span className="text-xs font-black text-blue-950">
                            {n.uploader_name || 'Dr. Muhammad Asif'}
                          </span>
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 border border-blue-200">
                            {n.uploader_role || 'HOD CS'}
                          </span>
                        </div>

                        <span className="text-xs font-mono text-slate-500 font-semibold">{n.created_at}</span>
                      </div>

                      <h4 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">{n.title}</h4>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line font-normal">{n.content}</p>

                      {/* Attached Document or Image (if present) */}
                      <AnnouncementAttachment
                        attachmentName={n.attachment_name}
                        attachmentUrl={n.attachment_url}
                        attachmentType={n.attachment_type}
                        attachmentSize={n.attachment_size}
                      />

                      <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/80">
                        <span className="text-[11px] text-slate-600 font-medium">Audience: <strong className="text-slate-800">{n.audience === 'teachers' ? 'Faculty Members' : n.audience === 'cs_only' ? 'CS Students' : 'All Department'}</strong></span>
                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="px-3 py-1.5 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Printer className="w-3.5 h-3.5 text-slate-500" />
                          <span>Print Circular</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            </>
            )}
          </div>
        )}

      </div>

      {/* =========================================================================
          MODAL 1: ASSIGN / EDIT COURSES TO FACULTY
          ========================================================================= */}
      {selectedFacultyForAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-blue-900 text-white p-5 sm:p-6 flex items-start justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-black">Assign Course to Faculty</h3>
                <p className="text-xs text-blue-200 mt-0.5">
                  Assigning to {selectedFacultyForAssign.full_name} ({selectedFacultyForAssign.designation})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFacultyForAssign(null)}
                className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-blue-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Computer Science Course
                </label>
                <select
                  value={assignCourseId}
                  onChange={(e) => setAssignCourseId(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-bold text-slate-800"
                >
                  {csCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code}: {c.title} (Sem {c.semester} · {c.credit_display || `${c.credit_hours} Cr`})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-950 space-y-1">
                <span className="font-bold block">Academic Policy Notice:</span>
                <p className="text-[11px] text-slate-600">
                  Allocations will instantly appear in the faculty member's portal, sync into the student lecture repository, and update the accreditation roster.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedFacultyForAssign(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4 text-amber-300" />
                  <span>Confirm Allocation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: ASSIGN INSTRUCTOR TO COURSE (FROM COURSES TAB)
          ========================================================================= */}
      {courseToAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-blue-900 text-white p-5 sm:p-6 flex items-start justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-black">Assign Instructor</h3>
                <p className="text-xs text-blue-200 mt-0.5">
                  Course: {courseToAssign.code} - {courseToAssign.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCourseToAssign(null)}
                className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-blue-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCourseReassignSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select CS Faculty Member
                </label>
                <select
                  value={selectedTeacherIdForCourse}
                  onChange={(e) => setSelectedTeacherIdForCourse(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-bold text-slate-800"
                >
                  {csFaculty.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.full_name} — {f.designation} ({f.workload_credits || 9} Cr Hrs)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-between items-center gap-2 pt-2">
                {courseToAssign.allocated_teacher_id ? (
                  <button
                    type="button"
                    onClick={() => handleUnassignCourse(courseToAssign.id)}
                    className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-colors cursor-pointer"
                  >
                    Unassign Course
                  </button>
                ) : <div />}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCourseToAssign(null)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4 text-amber-300" />
                    <span>Update Instructor</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: SCHEDULE TIMETABLE SLOT (WITH CLASH DETECTOR)
          ========================================================================= */}
      {isAddSlotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-blue-900 text-white p-5 sm:p-6 flex items-start justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-black">Schedule Timetable Slot</h3>
                <p className="text-xs text-blue-200 mt-0.5">
                  Automated Clash Verification across Rooms & Faculty
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddSlotModalOpen(false)}
                className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-blue-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {slotError && (
              <div className="m-6 mb-0 p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{slotError}</span>
              </div>
            )}

            {slotSuccess && (
              <div className="m-6 mb-0 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{slotSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAddSlotSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Course</label>
                  <select
                    value={slotCourseId}
                    onChange={(e) => setSlotCourseId(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-bold"
                  >
                    {csCourses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code}: {c.title} (Sem {c.semester})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Instructor</label>
                  <select
                    value={slotFacultyId}
                    onChange={(e) => setSlotFacultyId(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-bold"
                  >
                    {csFaculty.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.full_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Day of Week</label>
                  <select
                    value={slotDay}
                    onChange={(e) => setSlotDay(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-bold"
                  >
                    <option value="Mon">Monday</option>
                    <option value="Tue">Tuesday</option>
                    <option value="Wed">Wednesday</option>
                    <option value="Thu">Thursday</option>
                    <option value="Fri">Friday</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Timeslot (PKT)</label>
                  <select
                    value={slotTime}
                    onChange={(e) => setSlotTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-bold"
                  >
                    <option value="08:30 AM - 10:00 AM">08:30 AM - 10:00 AM</option>
                    <option value="10:30 AM - 12:00 PM">10:30 AM - 12:00 PM</option>
                    <option value="11:00 AM - 12:30 PM">11:00 AM - 12:30 PM</option>
                    <option value="01:00 PM - 02:30 PM">01:00 PM - 02:30 PM</option>
                    <option value="02:30 PM - 04:00 PM">02:30 PM - 04:00 PM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Session Type</label>
                  <select
                    value={slotSessionType}
                    onChange={(e) => setSlotSessionType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-bold"
                  >
                    <option value="Theory Lecture">Theory Lecture</option>
                    <option value="Lab Session">Lab Session</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Venue / Room</label>
                  <input
                    type="text"
                    value={slotRoom}
                    onChange={(e) => setSlotRoom(e.target.value)}
                    placeholder="e.g. CS Lab 2 or Room 204"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Class Section</label>
                  <input
                    type="text"
                    value={slotSection}
                    onChange={(e) => setSlotSection(e.target.value)}
                    placeholder="e.g. BSCS-6A"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-medium"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddSlotModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4 text-amber-300" />
                  <span>Verify & Schedule Slot</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TIMETABLE SLOT MODAL */}
      {editingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#0f2744] text-white p-5 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 block">
                  TIMETABLE MANAGEMENT ENGINE
                </span>
                <h2 className="text-base sm:text-lg font-black">
                  Edit Lecture Slot: {editingSlot.course_code}
                </h2>
                <p className="text-xs text-blue-200 mt-0.5">
                  {editingSlot.course_title} · Section {editingSlot.section}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingSlot(null)}
                className="p-1.5 text-blue-200 hover:text-white rounded-lg hover:bg-blue-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              {editSlotConflict && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{editSlotConflict}</span>
                </div>
              )}
              {editSlotSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{editSlotSuccess}</span>
                </div>
              )}

              {/* Assigned Instructor */}
              <div className="p-3 bg-[#f8fafc] rounded-xl border border-slate-200 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Instructor</span>
                <strong className="text-blue-950 font-bold text-sm">{editingSlot.faculty_name}</strong>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Day */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Day of Week *</label>
                  <select
                    value={editingSlot.day_of_week}
                    onChange={(e) => setEditingSlot({ ...editingSlot, day_of_week: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-bold"
                  >
                    <option value="Mon">Monday</option>
                    <option value="Tue">Tuesday</option>
                    <option value="Wed">Wednesday</option>
                    <option value="Thu">Thursday</option>
                    <option value="Fri">Friday</option>
                  </select>
                </div>

                {/* Timeslot */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Timeslot *</label>
                  <select
                    value={editingSlot.timeslot}
                    onChange={(e) => setEditingSlot({ ...editingSlot, timeslot: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-bold"
                  >
                    <option value="08:30 AM - 10:00 AM">08:30 AM - 10:00 AM</option>
                    <option value="10:05 AM - 11:35 AM">10:05 AM - 11:35 AM</option>
                    <option value="11:40 AM - 01:10 PM">11:40 AM - 01:10 PM</option>
                    <option value="01:45 PM - 03:15 PM">01:45 PM - 03:15 PM</option>
                    <option value="03:20 PM - 04:50 PM">03:20 PM - 04:50 PM</option>
                  </select>
                </div>

                {/* Room */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Room / Venue *</label>
                  <input
                    type="text"
                    value={editingSlot.room}
                    onChange={(e) => setEditingSlot({ ...editingSlot, room: e.target.value })}
                    placeholder="e.g. CS Lab 3, Room 101"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-bold"
                    required
                  />
                </div>

                {/* Section */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Section *</label>
                  <input
                    type="text"
                    value={editingSlot.section}
                    onChange={(e) => setEditingSlot({ ...editingSlot, section: e.target.value })}
                    placeholder="e.g. BSCS-1A, BSCS-3A, BSCS-5A, BSCS-7A"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-bold"
                    required
                  />
                </div>

                {/* Session Format */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Session Type *</label>
                  <select
                    value={editingSlot.session_type || 'Theory Lecture'}
                    onChange={(e) => setEditingSlot({ ...editingSlot, session_type: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-bold"
                  >
                    <option value="Theory Lecture">Theory Lecture</option>
                    <option value="Lab Session">Lab Session</option>
                    <option value="Tutorial">Tutorial</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingSlot(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onUpdateTimetable && editingSlot) {
                      const res = onUpdateTimetable(editingSlot);
                      if (res.success) {
                        setEditSlotSuccess('Timetable slot updated successfully!');
                        setTimeout(() => {
                          setEditingSlot(null);
                          setEditSlotSuccess('');
                        }, 1200);
                      } else {
                        setEditSlotConflict(res.conflictMessage || 'Timetable conflict detected.');
                      }
                    } else {
                      setEditingSlot(null);
                    }
                  }}
                  className="px-5 py-2.5 bg-[#0f2744] hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Save Slot Changes →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ADD NEW FACULTY MEMBER TO DEPARTMENT
          ========================================================================= */}
      {isAddFacultyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#0f2744] text-white p-5 sm:p-6 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block mb-0.5">
                  Department of Computer Science
                </span>
                <h3 className="text-lg font-black text-white">Add New Faculty Member</h3>
                <p className="text-xs text-blue-200 mt-0.5">
                  Induct verified teaching staff into CS Department & generate faculty credentials.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddFacultyModalOpen(false)}
                className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-blue-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddFacultySubmit} className="p-6 space-y-4 text-xs font-medium">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    value={newFacultyForm.full_name}
                    onChange={(e) => setNewFacultyForm({ ...newFacultyForm, full_name: e.target.value })}
                    placeholder="e.g. Dr. Salman Qureshi"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-[#f8fafc] font-semibold text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Official Email *</label>
                  <input
                    type="email"
                    value={newFacultyForm.email}
                    onChange={(e) => setNewFacultyForm({ ...newFacultyForm, email: e.target.value })}
                    placeholder="s.qureshi@ucms.edu.pk"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-[#f8fafc] font-semibold text-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={newFacultyForm.phone}
                    onChange={(e) => setNewFacultyForm({ ...newFacultyForm, phone: e.target.value })}
                    placeholder="+92 300 1234567"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-[#f8fafc] font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Academic Designation *</label>
                  <select
                    value={newFacultyForm.designation}
                    onChange={(e) => setNewFacultyForm({ ...newFacultyForm, designation: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-[#f8fafc] font-bold text-slate-900"
                  >
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor - CS">Assistant Professor - CS</option>
                    <option value="Lecturer - CS">Lecturer - CS</option>
                    <option value="Lab Instructor">Lab Instructor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Workload Credit Limit</label>
                  <input
                    type="number"
                    min={1}
                    max={24}
                    value={newFacultyForm.workload_credits}
                    onChange={(e) => setNewFacultyForm({ ...newFacultyForm, workload_credits: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-[#f8fafc] font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Highest Qualification</label>
                  <input
                    type="text"
                    value={newFacultyForm.qualification}
                    onChange={(e) => setNewFacultyForm({ ...newFacultyForm, qualification: e.target.value })}
                    placeholder="Ph.D. / M.S. Computer Science"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-[#f8fafc] font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Portal Username *</label>
                  <input
                    type="text"
                    value={newFacultyForm.username}
                    onChange={(e) => setNewFacultyForm({ ...newFacultyForm, username: e.target.value })}
                    placeholder="dr_salman"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-[#f8fafc] font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Initial Password *</label>
                  <input
                    type="text"
                    value={newFacultyForm.password}
                    onChange={(e) => setNewFacultyForm({ ...newFacultyForm, password: e.target.value })}
                    placeholder="password123"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-[#f8fafc] font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddFacultyModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0f2744] hover:bg-blue-950 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-300" />
                  <span>Induct Faculty Member</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: TAKE ACTION ON INQUIRY (HOD DIRECTIVE)
          ========================================================================= */}
      {actionReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#0f2744] text-white p-5 sm:p-6 flex items-start justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-black tracking-tight">
                  HOD Action on Student Inquiry
                </h3>
                <p className="text-xs text-blue-200 opacity-90 mt-0.5">
                  Inquiry #{actionReport.id} · Scholar: {actionReport.student_name} ({actionReport.reporter_roll || 'BSCS'})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActionReport(null)}
                className="p-1 text-blue-200 hover:text-white hover:bg-blue-900 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleHodTakeActionSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="font-bold text-slate-800">Inquiry Subject: {actionReport.subject}</div>
                <div className="text-slate-600">Details: {actionReport.description}</div>
                {(actionReport.slot_info || actionReport.handout_title) && (
                  <div className="text-[11px] font-mono text-blue-900 font-bold">
                    Target: {actionReport.slot_info || actionReport.handout_title}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                  HOD Determination *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setActionDecision('Resolved')}
                    className={`p-3 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                      actionDecision === 'Resolved'
                        ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 ring-2 ring-emerald-600/30'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-emerald-800 font-black">
                      <CheckCircle className="w-4 h-4" />
                      <span>Mark as Resolved</span>
                    </div>
                    <span className="text-[11px] font-normal text-slate-500">
                      HOD verified adjustment or handout update.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActionDecision('Dismissed')}
                    className={`p-3 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                      actionDecision === 'Dismissed'
                        ? 'border-blue-600 bg-blue-50/80 text-blue-950 ring-2 ring-blue-600/30'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-blue-900 font-black">
                      <AlertTriangle className="w-4 h-4" />
                      <span>No Such Issue / Clarification</span>
                    </div>
                    <span className="text-[11px] font-normal text-slate-500">
                      Verified schedule/handout as valid.
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  HOD Response Directive to Student *
                </label>
                <textarea
                  rows={3}
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder="Enter official departmental response note for the student..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-900 font-medium"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActionReport(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0f2744] hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Confirm Determination & Send →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
