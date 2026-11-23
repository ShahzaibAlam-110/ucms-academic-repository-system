import React, { useState, useEffect } from 'react';
import {
  Upload,
  Calendar,
  FileText,
  History,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
  Layers,
  ChevronDown,
  ChevronUp,
  Download,
  Search,
  Plus,
  X,
  Printer,
  Sparkles,
  ExternalLink,
  MapPin,
  Users,
  Check,
  RefreshCw,
  Bell,
  GraduationCap,
  ChevronRight,
  Send,
  Paperclip,
} from 'lucide-react';
import {
  User,
  Course,
  Handout,
  ResourceVersion,
  TimetableSlot,
  Announcement,
  StudentReport,
  AcademicAssessment,
  INITIAL_ASSESSMENTS,
} from '../data/mockDatabase';
import { AttachmentUploader, AttachmentData } from './AttachmentUploader';
import { AnnouncementAttachment } from './AnnouncementAttachment';

interface FacultyWorkspaceProps {
  user: User;
  courses: Course[];
  handouts: Handout[];
  resourceVersions: ResourceVersion[];
  timetables: TimetableSlot[];
  announcements: Announcement[];
  reports?: StudentReport[];
  assessments?: AcademicAssessment[];
  activeTab?: 'dashboard' | 'courses' | 'timetable' | 'handouts' | 'notices';
  onSelectTab?: (tab: 'dashboard' | 'courses' | 'timetable' | 'handouts' | 'notices') => void;
  onOpenProfileModal?: () => void;
  onLogout?: () => void;
  onAddAnnouncement?: (announcement: Omit<Announcement, 'id' | 'created_at'>) => void;
  onUploadHandout: (
    courseId: number,
    title: string,
    category: 'Lecture Slide' | 'Lab Manual' | 'Assignment' | 'Syllabus' | string,
    weekNumber: number,
    fileName: string,
    replaceHandoutId?: number,
    replacementReason?: string
  ) => void;
  onResolveReport?: (reportId: number, status?: 'Resolved' | 'Dismissed', resolutionNote?: string) => void;
  onCreateAssessment?: (newA: Omit<AcademicAssessment, 'id' | 'created_at' | 'submission_status'>) => void;
}

export const FacultyWorkspace: React.FC<FacultyWorkspaceProps> = ({
  user,
  courses,
  handouts,
  resourceVersions,
  timetables,
  announcements,
  reports = [],
  assessments = INITIAL_ASSESSMENTS,
  activeTab: controlledTab,
  onSelectTab,
  onOpenProfileModal,
  onLogout,
  onUploadHandout,
  onResolveReport,
  onCreateAssessment,
  onAddAnnouncement,
}) => {
  // Local fallback if activeTab is not controlled from header
  const [localTab, setLocalTab] = useState<'dashboard' | 'courses' | 'timetable' | 'handouts' | 'notices'>('dashboard');
  const currentTab = controlledTab ?? localTab;
  const switchTab = (t: 'dashboard' | 'courses' | 'timetable' | 'handouts' | 'notices') => {
    if (onSelectTab) onSelectTab(t);
    else setLocalTab(t);
  };

  // Faculty Broadcast / Update state
  const [isPostingNotice, setIsPostingNotice] = useState(false);
  const [facultyNoticeTitle, setFacultyNoticeTitle] = useState('');
  const [facultyNoticeContent, setFacultyNoticeContent] = useState('');
  const [facultyNoticeAudience, setFacultyNoticeAudience] = useState<'students' | 'all' | 'cs_only'>('students');
  const [facultyNoticePriority, setFacultyNoticePriority] = useState<'normal' | 'urgent'>('normal');
  const [facultyNoticeAttachment, setFacultyNoticeAttachment] = useState<AttachmentData | null>(null);
  const [facultyNoticeSuccess, setFacultyNoticeSuccess] = useState('');

  const handleFacultyNoticeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!facultyNoticeTitle.trim() || !facultyNoticeContent.trim()) return;

    if (onAddAnnouncement) {
      onAddAnnouncement({
        title: facultyNoticeTitle,
        content: facultyNoticeContent,
        audience: facultyNoticeAudience,
        priority: facultyNoticePriority,
        author: user.full_name,
        uploader_role: 'FACULTY',
        uploader_name: user.full_name,
        attachment_name: facultyNoticeAttachment?.name,
        attachment_url: facultyNoticeAttachment?.url,
        attachment_type: facultyNoticeAttachment?.type,
        attachment_size: facultyNoticeAttachment?.size,
      });
    }

    setFacultyNoticeTitle('');
    setFacultyNoticeContent('');
    setFacultyNoticeAttachment(null);
    setFacultyNoticeSuccess('Class update & notice broadcasted successfully across student portals.');
    setTimeout(() => {
      setFacultyNoticeSuccess('');
      setIsPostingNotice(false);
    }, 3500);
  };

  // Assigned Courses for Faculty
  const assignedCourses = courses.filter(
    (c) =>
      c.allocated_teacher_id === user.id ||
      (user.id === 2 && ['CS-401', 'CS-601', 'CS-301', 'CS-402'].includes(c.code))
  );

  // Timetable Day options with full day names
  const FACULTY_DAYS: Array<{ key: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri'; label: string; isToday?: boolean }> = [
    { key: 'Mon', label: 'Monday' },
    { key: 'Tue', label: 'Tuesday', isToday: true },
    { key: 'Wed', label: 'Wednesday' },
    { key: 'Thu', label: 'Thursday' },
    { key: 'Fri', label: 'Friday' },
  ];

  // Timetable Day selection (MON, TUE Today, WED, THU, FRI)
  const [selectedDay, setSelectedDay] = useState<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri'>('Tue');

  // Filter faculty timetable
  const facultyTimetables = timetables.filter(
    (t) =>
      t.faculty_id === user.id ||
      t.faculty_name.toLowerCase().includes(user.full_name.toLowerCase()) ||
      (user.id === 2 && (t.faculty_id === 2 || t.faculty_name.includes('Asim')))
  );

  // Handouts state & search
  const [searchHandout, setSearchHandout] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [selectedWeekFilter, setSelectedWeekFilter] = useState('all');

  // Notices Tab: Subtabs ('reports' | 'department')
  const [noticesSubtab, setNoticesSubtab] = useState<'reports' | 'department'>('reports');
  const [reportFilter, setReportFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  const [expandedNoticeId, setExpandedNoticeId] = useState<number | null>(null);

  // Local student reports state
  const [localReports, setLocalReports] = useState<StudentReport[]>(() => {
    if (reports && reports.length > 0) return reports;
    return [
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
        resolution_note: 'Resolved: Clarified in class lecture; C++ delete operator example uploaded.',
        created_at: '21 Oct 2026, 09:20 AM',
      },
    ];
  });

  useEffect(() => {
    if (reports && reports.length > 0) {
      setLocalReports(reports);
    }
  }, [reports]);

  // Take Action Modal State for Faculty
  const [actionReport, setActionReport] = useState<StudentReport | null>(null);
  const [actionDecision, setActionDecision] = useState<'Resolved' | 'Dismissed'>('Resolved');
  const [actionNote, setActionNote] = useState('');

  // Handout Upload Engine Modal State (video 00:16)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [modalCourseId, setModalCourseId] = useState<number>(assignedCourses[0]?.id || 401);
  const [modalTitle, setModalTitle] = useState('');
  const [modalWeek, setModalWeek] = useState<number>(8);
  const [modalCategory, setModalCategory] = useState<'Lecture Slide' | 'Lab Manual' | 'Assignment' | 'Syllabus'>('Lecture Slide');
  const [modalDescription, setModalDescription] = useState('');
  const [modalFileName, setModalFileName] = useState('');
  const [modalObjectives, setModalObjectives] = useState('');
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);

  // Assessment & Quiz Engine State
  const [localAssessments, setLocalAssessments] = useState<AcademicAssessment[]>(assessments || INITIAL_ASSESSMENTS);
  const [assessmentFilter, setAssessmentFilter] = useState<'all' | 'active' | 'passed'>('active');
  const [isCreateAssessmentModalOpen, setIsCreateAssessmentModalOpen] = useState(false);
  const [newCourseId, setNewCourseId] = useState<number>(assignedCourses[0]?.id || 401);
  const [newAssessmentType, setNewAssessmentType] = useState<'Assignment' | 'Quiz' | 'Lab Assessment'>('Assignment');
  const [newAssessmentTitle, setNewAssessmentTitle] = useState('');
  const [newAssessmentDesc, setNewAssessmentDesc] = useState('');
  const [newAssessmentMarks, setNewAssessmentMarks] = useState<number>(20);
  const [newAssessmentDate, setNewAssessmentDate] = useState('2025-03-25');
  const [newAssessmentTime, setNewAssessmentTime] = useState('23:59');

  useEffect(() => {
    if (assessments) {
      setLocalAssessments(assessments);
    }
  }, [assessments]);

  // Deadline calculation helper
  const getDeadlineInfo = (deadlineDate: string, deadlineTime: string = '23:59') => {
    try {
      const target = new Date(`${deadlineDate}T${deadlineTime}:00`);
      const now = new Date();
      const diffMs = target.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (diffMs < 0) {
        return { isPassed: true, label: 'Deadline Passed', color: 'bg-red-100 text-red-800 border-red-200' };
      }
      if (diffDays <= 1) {
        return { isPassed: false, label: 'Due Today / Urgent', color: 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse' };
      }
      if (diffDays <= 3) {
        return { isPassed: false, label: `Due in ${diffDays} days`, color: 'bg-amber-50 text-amber-800 border-amber-200' };
      }
      return { isPassed: false, label: `Due in ${diffDays} days`, color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
    } catch {
      return { isPassed: false, label: 'Active Deadline', color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const handleCreateAssessmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssessmentTitle.trim()) {
      alert('Please enter an assessment title.');
      return;
    }

    const targetCourse = courses.find((c) => c.id === Number(newCourseId)) || assignedCourses[0];
    const dateObj = new Date(newAssessmentDate);
    const dateFormatted = !isNaN(dateObj.getTime())
      ? dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : newAssessmentDate;
    const deadlineDisplay = `${dateFormatted} at ${newAssessmentTime}`;

    const newAssessmentData: Omit<AcademicAssessment, 'id' | 'created_at' | 'submission_status'> = {
      course_id: Number(newCourseId),
      course_code: targetCourse?.code || 'CS-401',
      course_title: targetCourse?.title || 'Database Systems',
      title: newAssessmentTitle.trim(),
      type: newAssessmentType,
      total_marks: Number(newAssessmentMarks) || 20,
      deadline_date: newAssessmentDate,
      deadline_time: newAssessmentTime,
      deadline_display: deadlineDisplay,
      description: newAssessmentDesc.trim() || undefined,
      teacher_name: user.full_name || 'Prof. Asim Riaz',
      teacher_id: user.id || 2,
    };

    if (onCreateAssessment) {
      onCreateAssessment(newAssessmentData);
    } else {
      const created: AcademicAssessment = {
        ...newAssessmentData,
        id: Date.now(),
        created_at: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        submission_status: 'Pending',
      };
      setLocalAssessments((prev) => [created, ...prev]);
    }

    setIsCreateAssessmentModalOpen(false);
    setNewAssessmentTitle('');
    setNewAssessmentDesc('');
    setUploadFeedback(`Assessment published: "${newAssessmentTitle.trim()}" with deadline ${deadlineDisplay}`);
    setTimeout(() => setUploadFeedback(null), 4000);
  };

  // Replace PDF Version Modal State (Non-destructive archival)
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
  const [targetHandout, setTargetHandout] = useState<Handout | null>(null);
  const [replaceReason, setReplaceReason] = useState('');
  const [replaceFileName, setReplaceFileName] = useState('');

  // Department circulars for faculty
  const facultyAnnouncements = announcements.filter(
    (a) => a.audience === 'teachers' || a.audience === 'all'
  );

  // Unread circulars count
  const unreadCircularsCount = facultyAnnouncements.filter((a) => !a.is_read).length;
  const pendingReportsCount = localReports.filter((r) => r.status === 'Pending Review').length;

  const handleResolveReport = (reportId: number) => {
    setLocalReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status: 'Resolved',
              resolution_note: 'Resolved: Issue reviewed and verified by faculty instructor.',
            }
          : r
      )
    );
    if (onResolveReport) onResolveReport(reportId, 'Resolved', 'Resolved: Issue reviewed and verified by faculty instructor.');
    setUploadFeedback('Student report marked as resolved.');
    setTimeout(() => setUploadFeedback(null), 3000);
  };

  const handleTakeActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionReport) return;
    const finalNote = actionNote.trim() || (actionDecision === 'Resolved' ? 'Resolved: Issue reviewed and verified by faculty instructor.' : 'Reviewed: Handout/slot verified according to university course syllabus.');
    setLocalReports((prev) =>
      prev.map((r) =>
        r.id === actionReport.id
          ? {
              ...r,
              status: actionDecision,
              resolution_note: finalNote,
            }
          : r
      )
    );
    if (onResolveReport) onResolveReport(actionReport.id, actionDecision, finalNote);
    setActionReport(null);
    setUploadFeedback(`Inquiry status updated to ${actionDecision} and response sent to student.`);
    setTimeout(() => setUploadFeedback(null), 3500);
  };

  const handleOpenUploadModal = (courseId?: number) => {
    if (courseId) setModalCourseId(courseId);
    setIsUploadModalOpen(true);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTitle.trim()) {
      alert('Please enter a lecture title & topic.');
      return;
    }

    const resolvedWeek = modalWeek > 0 ? modalWeek : 1;
    const resolvedFile = modalFileName.trim() || `Lecture_${resolvedWeek}_${Date.now()}.pdf`;

    onUploadHandout(
      modalCourseId,
      modalTitle.trim(),
      modalCategory,
      resolvedWeek,
      resolvedFile
    );

    setIsUploadModalOpen(false);
    setModalTitle('');
    setModalDescription('');
    setModalFileName('');
    setModalObjectives('');
    setUploadFeedback(`"${modalTitle.trim()}" published to Student Academic Portal.`);
    setTimeout(() => setUploadFeedback(null), 4000);
  };

  const handleReplaceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetHandout || !replaceReason.trim()) {
      alert('Please state an immutable reason for updating the file version.');
      return;
    }

    const resolvedFile = replaceFileName.trim() || `${targetHandout.file_name.replace('.pdf', '')}_v2.pdf`;

    onUploadHandout(
      targetHandout.course_id,
      targetHandout.title,
      targetHandout.category,
      targetHandout.week_number,
      resolvedFile,
      targetHandout.id,
      replaceReason.trim()
    );

    setIsReplaceModalOpen(false);
    setTargetHandout(null);
    setReplaceReason('');
    setReplaceFileName('');
    setUploadFeedback('Handout successfully replaced and previous version archived in MySQL.');
    setTimeout(() => setUploadFeedback(null), 4000);
  };

  const handleDownloadSimulation = (title: string) => {
    setUploadFeedback(`Downloading "${title}"...`);
    setTimeout(() => {
      setUploadFeedback(`"${title}" downloaded.`);
      setTimeout(() => setUploadFeedback(null), 3000);
    }, 1000);
  };

  // Filtered handouts
  const facultyHandouts = handouts.filter(
    (h) => h.uploaded_by === 2 || ['CS-301', 'CS-401', 'CS-402', 'CS-201', 'CS-490', 'CS-601'].includes(h.course_code)
  );

  const displayedHandouts = facultyHandouts.filter((h) => {
    const matchesSearch =
      h.title.toLowerCase().includes(searchHandout.toLowerCase()) ||
      h.course_code.toLowerCase().includes(searchHandout.toLowerCase()) ||
      h.course_title.toLowerCase().includes(searchHandout.toLowerCase());
    const matchesCourse = selectedCourseFilter === 'all' || h.course_code === selectedCourseFilter;
    const matchesCategory = selectedCategoryFilter === 'all' || h.category === selectedCategoryFilter;
    const matchesWeek = selectedWeekFilter === 'all' || String(h.week_number) === selectedWeekFilter;
    return matchesSearch && matchesCourse && matchesCategory && matchesWeek;
  });

  return (
    <div className="w-full bg-[#f8fafc] min-h-[calc(100vh-72px)] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      
      {/* Toast Feedback */}
      {uploadFeedback && (
        <div className="fixed bottom-5 right-5 z-50 p-3.5 bg-blue-900 text-white rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{uploadFeedback}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">

        {/* =========================================================================
            TAB 1: DASHBOARD (MATCHING FACULTY VIDEO 00:00 - 00:10)
            ========================================================================= */}
        {currentTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Top Row: Welcome Banner + Upcoming Class Today */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Welcome Back Card (8 Cols) */}
              <div className="lg:col-span-8 bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] sm:text-xs font-black tracking-wider text-amber-700 uppercase flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-amber-600" />
                      <span>Faculty Portal · UCMS Khanewal</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-50 text-amber-900 border border-amber-200 w-fit">
                      Active Session: Spring 2025
                    </span>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-5 mt-2">
                    {/* Big Prominent UCMS Crest Logo */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-[#800020] p-1.5 bg-white shadow-xs shrink-0 flex items-center justify-center overflow-hidden">
                      <img
                        src="./assets/aistudio/logo_c68140aa.png"
                        onError={(e) => { (e.target as HTMLImageElement).src = './logo.png'; }}
                        alt="UCMS Crest"
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Faculty Avatar */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-amber-500 overflow-hidden bg-white shrink-0 shadow-xs hidden sm:block">
                      <img
                        src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'}
                        alt={user.full_name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h1 className="text-xl sm:text-2xl font-black text-blue-950 tracking-tight leading-tight">
                        Welcome back, {user.full_name || 'Prof. Asim Riaz'}
                      </h1>
                      <p className="text-xs font-bold text-slate-700 mt-0.5">
                        {user.department_name || 'Department of Computer Science'}
                      </p>
                      <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                        Institutional ID: {user.institutional_id || 'UCMS-FAC-2018-042'} · {user.chamber || 'Room 204, Academic Block B'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5 mt-4 border-t border-slate-100">
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-blue-900" />
                      <span><strong>4</strong> Assigned Subjects</span>
                    </div>
                    <span>·</span>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-emerald-700" />
                      <span><strong>184</strong> Enrolled Students</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenUploadModal()}
                    className="px-4 py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-300" />
                    <span>Upload Handout</span>
                  </button>
                </div>
              </div>

              {/* Upcoming Class Today Card (4 Cols) - Unified Timetable Color Scheme */}
              <div className="lg:col-span-4 bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5 shadow-2xs">
                      <Clock className="w-3 h-3 text-amber-700 animate-spin" />
                      <span>UPCOMING CLASS TODAY</span>
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">Spring 2025</span>
                  </div>

                  {/* Course Code (#0f2744) & Title */}
                  <div className="space-y-1.5 mb-3.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-[#0f2744] text-white shadow-2xs tracking-wider">
                        CS-401
                      </span>
                      <h2 className="text-base font-extrabold text-blue-950 truncate">
                        Database Systems
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      Enrolled Cohort: <strong className="text-slate-800">BSCS-6A</strong> · Morning Session
                    </p>
                  </div>

                  {/* Timetable Details with #dbeafe Time Capsule & #fef3c6 Venue Badge */}
                  <div className="space-y-2.5 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-500 font-bold uppercase">Class Time</span>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#dbeafe] text-blue-950 border border-blue-200 font-mono text-xs font-black shadow-2xs">
                        <Clock className="w-3.5 h-3.5 text-blue-800 shrink-0" />
                        <span>11:00 AM - 12:30 PM</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-500 font-bold uppercase">Lecture Hall</span>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-[#fef3c6] text-amber-950 border border-amber-300 shadow-2xs">
                        <MapPin className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                        <span>Room 204 (Block B)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3.5 mt-3.5 border-t border-slate-100 text-xs">
                  <span className="text-xs font-semibold text-slate-500">Format: Theory Lecture</span>
                  <button
                    type="button"
                    onClick={() => handleOpenUploadModal(401)}
                    className="py-1.5 px-3 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Add Handout</span>
                    <span>→</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Section: Assigned Courses */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    Assigned Courses
                  </h2>
                  <p className="text-xs text-slate-500">
                    Spring 2025 subjects with credit hours · Tap "View Course" to inspect Handouts, Assignments, Quizzes & Enrolled Students
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => switchTab('courses')}
                  className="text-xs font-bold text-blue-900 hover:underline cursor-pointer self-start sm:self-auto"
                >
                  View All →
                </button>
              </div>

              {/* 4 Assigned Course Cards Grid (Matching video 00:04) */}
              {/* 4 Assigned Course Cards Grid (Matching video 00:04) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {assignedCourses.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-[#f8fafc] hover:bg-slate-50 transition-all flex flex-col justify-between space-y-3.5"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-blue-100 text-blue-950 border border-blue-200">
                          {c.code}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500">
                          {c.credit_display || `${c.credit_hours} Cr`}
                        </span>
                      </div>

                      <h3 className="text-sm font-black text-slate-900 mt-2 line-clamp-2 leading-snug">
                        {c.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {c.description || 'Core academic curriculum syllabus.'}
                      </p>
                    </div>

                    <div className="space-y-2.5 pt-2 border-t border-slate-200/80 text-[11px]">
                      <div className="flex items-center justify-between text-slate-600">
                        <span><strong>{c.enrolled_count || 50}</strong> Students</span>
                        <span className="font-mono font-semibold">{c.assigned_sections || 'BSCS-6A'}</span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600">
                        <span><strong>{c.materials_count || 5}</strong> Uploaded</span>
                        <span className="text-amber-800 font-bold">{c.venue || 'Room 204'}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => switchTab('courses')}
                        className="w-full py-2.5 px-3 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer text-center"
                      >
                        View Details →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section: Upcoming Quizzes & Course Assessments (With Deadlines & Countdown) */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0 border border-amber-200">
                    <Clock className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-black text-slate-900">
                        Upcoming Quizzes & Course Assessments
                      </h2>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-900 border border-amber-200">
                        {localAssessments.filter((a) => !getDeadlineInfo(a.deadline_date, a.deadline_time).isPassed).length} Active Deadlines
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Enforced submission deadlines for your assigned subjects · Manage quizzes, assignments and student solutions
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateAssessmentModalOpen(true)}
                    className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-amber-400" />
                    <span>Create Quiz / Assessment</span>
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-500">View:</span>
                {(
                  [
                    { key: 'active', label: `Active Deadlines (${localAssessments.filter((a) => !getDeadlineInfo(a.deadline_date, a.deadline_time).isPassed).length})` },
                    { key: 'all', label: `All Assessments (${localAssessments.length})` },
                    { key: 'passed', label: `Passed Deadlines (${localAssessments.filter((a) => getDeadlineInfo(a.deadline_date, a.deadline_time).isPassed).length})` },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setAssessmentFilter(tab.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      assessmentFilter === tab.key
                        ? 'bg-blue-900 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Assessment Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {localAssessments
                  .filter((item) => {
                    const info = getDeadlineInfo(item.deadline_date, item.deadline_time);
                    if (assessmentFilter === 'active') return !info.isPassed;
                    if (assessmentFilter === 'passed') return info.isPassed;
                    return true;
                  })
                  .map((item) => {
                    const deadlineInfo = getDeadlineInfo(item.deadline_date, item.deadline_time);
                    const isAssignment = item.type === 'Assignment';
                    const isQuiz = item.type === 'Quiz';
                    return (
                      <div
                        key={item.id}
                        className="p-5 rounded-2xl border border-slate-200 bg-[#f8fafc] hover:bg-slate-50 transition-all flex flex-col justify-between space-y-4 hover:shadow-xs"
                      >
                        <div>
                          {/* Card Top Row */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${
                                isQuiz
                                  ? 'bg-purple-100 text-purple-900 border-purple-300'
                                  : isAssignment
                                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                                  : 'bg-blue-100 text-blue-900 border-blue-300'
                              }`}
                            >
                              {item.type}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${deadlineInfo.color}`}
                            >
                              {deadlineInfo.label}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-500 mb-1">
                            <span className="text-blue-950 font-black">{item.course_code}</span>
                            <span>·</span>
                            <span className="truncate">{item.course_title}</span>
                          </div>

                          <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                            {item.title}
                          </h3>

                          {item.description && (
                            <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                              {item.description}
                            </p>
                          )}
                        </div>

                        {/* Card Footer / Deadline & Stats */}
                        <div className="pt-3 border-t border-slate-200/80 space-y-2 text-xs">
                          <div className="flex items-center justify-between text-slate-600">
                            <span className="font-medium flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-blue-700" />
                              Deadline:
                            </span>
                            <span className="font-bold text-slate-900 font-mono text-[11px]">
                              {item.deadline_display}
                            </span>
                          </div>

                          <div className="flex flex-col text-slate-600 text-xs gap-1 pt-1.5 border-t border-slate-100">
                            <div>Weightage: <strong className="text-amber-800 font-bold">{item.total_marks} Marks</strong></div>
                            <div>By: <strong className="text-slate-800 font-semibold">{item.teacher_name || user.full_name || 'Prof. Asim Riaz'}</strong></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {localAssessments.filter((item) => {
                const info = getDeadlineInfo(item.deadline_date, item.deadline_time);
                if (assessmentFilter === 'active') return !info.isPassed;
                if (assessmentFilter === 'passed') return info.isPassed;
                return true;
              }).length === 0 && (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">No assessments found for this filter.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Click "Create Quiz / Assessment" to schedule a new one with an active cutoff deadline.</p>
                </div>
              )}
            </div>

            {/* Section: Updates Center */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center shrink-0">
                    <Bell className="w-4 h-4 text-blue-900" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900">
                      Department Updates & Circulars Center
                    </h2>
                    <p className="text-xs text-slate-500">
                      Official notifications from HOD CS & Institutional Administration · Click any notice to read in full
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 self-start sm:self-auto">
                  <span className="px-2.5 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-900">
                    {unreadCircularsCount} Unread
                  </span>
                  <button
                    type="button"
                    onClick={() => switchTab('notices')}
                    className="text-xs font-bold text-blue-900 hover:underline cursor-pointer"
                  >
                    View All Notices →
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {facultyAnnouncements.map((notice) => {
                  const isExpanded = expandedNoticeId === notice.id;
                  const isHod = notice.uploader_role === 'HOD CS' || notice.author.includes('HOD') || notice.author.includes('Tariq') || notice.author.includes('Chair');
                  const senderRole = notice.uploader_role || (isHod ? 'HOD CS' : 'ADMIN');
                  const senderName = notice.uploader_name || (isHod ? 'Dr. Tariq Mahmood (Head of CS)' : 'Central Academic Administration');
                  return (
                    <div
                      key={notice.id}
                      className={`rounded-2xl border transition-all overflow-hidden ${
                        isExpanded
                          ? 'border-blue-900 bg-blue-50/20 shadow-xs ring-1 ring-blue-900/15'
                          : 'border-slate-200 bg-[#f8fafc] hover:bg-slate-50'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedNoticeId(isExpanded ? null : notice.id)}
                        className="w-full p-4 sm:p-5 text-left transition-colors flex flex-col gap-2.5 cursor-pointer"
                      >
                        {/* Top Line: Role, [URGENT] badge, Uploader Name, Date */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`px-2.5 py-0.5 text-[10px] font-black rounded-md uppercase tracking-wide ${
                                isHod
                                  ? 'bg-amber-100 text-amber-950 border border-amber-300'
                                  : 'bg-blue-100 text-blue-950 border border-blue-300'
                              }`}
                            >
                              [{senderRole}]
                            </span>
                            {notice.priority === 'urgent' && (
                              <span className="px-2 py-0.5 text-[9.5px] font-black uppercase tracking-wider rounded border bg-red-50 text-red-700 border-red-200">
                                [URGENT]
                              </span>
                            )}
                            <span className="text-xs font-bold text-slate-800">
                              Uploaded by: <strong className="text-slate-900 font-extrabold">{senderName}</strong>
                            </span>
                            {notice.attachment_name && (
                              <AnnouncementAttachment
                                compact
                                attachmentName={notice.attachment_name}
                                attachmentType={notice.attachment_type}
                              />
                            )}
                          </div>

                          <span className="text-[11px] text-slate-400 font-mono">
                            {notice.created_at}
                          </span>
                        </div>

                        {/* Middle: Title & Excerpt Preview */}
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 leading-snug">
                            {notice.title}
                          </h3>
                          <p className="text-xs text-slate-500 line-clamp-1 mt-1 font-normal">
                            {notice.content}
                          </p>
                        </div>

                        {/* Bottom Row: Action / Read Notice Button */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                          <span className="text-[11px] font-medium text-slate-400">
                            {isExpanded ? 'Full circular open' : 'Click to expand official circular'}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 hover:text-blue-950 bg-blue-50 px-2.5 py-1 rounded-lg">
                            <span>{isExpanded ? 'Collapse' : 'Read Notice'}</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </span>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 pt-2 border-t border-slate-200/80 bg-white space-y-3 animate-in fade-in duration-100">
                          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                            {notice.content}
                          </div>

                          {/* Attached Document or Image (if present) */}
                          <AnnouncementAttachment
                            attachmentName={notice.attachment_name}
                            attachmentUrl={notice.attachment_url}
                            attachmentType={notice.attachment_type}
                            attachmentSize={notice.attachment_size}
                          />

                          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                            <span className="font-semibold text-emerald-800 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Authorized Notice from {senderName} ({senderRole})
                            </span>
                            <span className="text-slate-400 font-mono">Status: Verified Dispatch</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section: Teaching Timetable */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                <div>
                  <h2 className="text-base font-black text-slate-900">
                    Teaching Timetable
                  </h2>
                  <p className="text-xs text-slate-500">
                    Weekly academic workload across Monday to Friday · Tap a day to view assigned lectures
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => switchTab('timetable')}
                  className="text-xs font-bold text-blue-900 hover:underline cursor-pointer self-start sm:self-auto"
                >
                  Full Timetable view →
                </button>
              </div>

              {/* Day Switcher - Mobile 2-line layout */}
              <div className="sm:hidden p-2.5 bg-slate-100/90 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  {FACULTY_DAYS.slice(0, 3).map((d) => {
                    const isSelected = selectedDay === d.key;
                    const count = facultyTimetables.filter((t) => t.day_of_week === d.key).length;
                    return (
                      <button
                        key={d.key}
                        type="button"
                        onClick={() => setSelectedDay(d.key)}
                        className={`py-2.5 px-1.5 rounded-xl text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-900 text-white shadow-xs ring-1 ring-blue-950 font-black'
                            : 'bg-white/70 hover:bg-white text-slate-700 border border-slate-200/60'
                        }`}
                      >
                        <span className="text-xs font-black block leading-tight">{d.label}</span>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          {d.isToday && (
                            <span className={`text-[9px] font-black uppercase px-1 py-0.2 rounded ${
                              isSelected ? 'bg-amber-400 text-blue-950 font-black' : 'bg-amber-100 text-amber-900 font-bold'
                            }`}>
                              Today
                            </span>
                          )}
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            isSelected ? 'bg-blue-800 text-white' : 'bg-slate-200/70 text-slate-600'
                          }`}>
                            {count}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {FACULTY_DAYS.slice(3, 5).map((d) => {
                    const isSelected = selectedDay === d.key;
                    const count = facultyTimetables.filter((t) => t.day_of_week === d.key).length;
                    return (
                      <button
                        key={d.key}
                        type="button"
                        onClick={() => setSelectedDay(d.key)}
                        className={`py-2.5 px-2 rounded-xl text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-900 text-white shadow-xs ring-1 ring-blue-950 font-black'
                            : 'bg-white/70 hover:bg-white text-slate-700 border border-slate-200/60'
                        }`}
                      >
                        <span className="text-xs font-black block leading-tight">{d.label}</span>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          {d.isToday && (
                            <span className={`text-[9px] font-black uppercase px-1 py-0.2 rounded ${
                              isSelected ? 'bg-amber-400 text-blue-950 font-black' : 'bg-amber-100 text-amber-900 font-bold'
                            }`}>
                              Today
                            </span>
                          )}
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            isSelected ? 'bg-blue-800 text-white' : 'bg-slate-200/70 text-slate-600'
                          }`}>
                            {count}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Day Switcher - Laptop / Tablet 5-column layout */}
              <div className="hidden sm:grid sm:grid-cols-5 gap-3 p-2.5 bg-slate-100/90 rounded-2xl border border-slate-200/80">
                {FACULTY_DAYS.map((d) => {
                  const isSelected = selectedDay === d.key;
                  const count = facultyTimetables.filter((t) => t.day_of_week === d.key).length;
                  return (
                    <button
                      key={d.key}
                      type="button"
                      onClick={() => setSelectedDay(d.key)}
                      className={`py-3.5 px-3 rounded-xl text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-900 text-white shadow-md border-b-2 border-amber-400'
                          : 'bg-white/70 hover:bg-white text-slate-700 hover:text-slate-950 border border-slate-200/70'
                      }`}
                    >
                      <span className="text-sm font-extrabold block">{d.label}</span>
                      <div className="flex items-center justify-center gap-1.5 mt-1.5">
                        {d.isToday && (
                          <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded ${
                            isSelected ? 'bg-amber-400 text-blue-950 font-black' : 'bg-amber-100 text-amber-900 font-bold'
                          }`}>
                            Today
                          </span>
                        )}
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          isSelected ? 'bg-amber-400/90 text-blue-950 font-black' : 'bg-slate-200/80 text-slate-600'
                        }`}>
                          {count} {count === 1 ? 'Class' : 'Classes'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Day's Classes List (Matching Video 00:06) */}
              <div className="space-y-3">
                {facultyTimetables
                  .filter((t) => t.day_of_week === selectedDay)
                  .map((slot) => {
                    const isLab = slot.course_title.toLowerCase().includes('lab') || slot.session_type?.toLowerCase().includes('lab');
                    return (
                      <div
                        key={slot.id}
                        className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-[#f8fafc] hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 flex-1 min-w-0">
                          {/* Time Capsule: Light Sky Blue #dbeafe matching Student Portal */}
                          <div className="p-2.5 sm:p-3 rounded-xl bg-white border border-slate-200 w-full sm:w-48 shrink-0 flex flex-col items-start justify-center gap-1.5 shadow-2xs">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#dbeafe] text-blue-950 border border-blue-200 font-mono text-xs sm:text-sm font-black shadow-2xs">
                              <Clock className="w-3.5 h-3.5 text-blue-800 shrink-0" />
                              <span>{slot.timeslot}</span>
                            </div>
                            <span className="text-xs font-semibold text-slate-500">
                              {slot.session_type || (isLab ? 'Lab Practical' : 'Theory Lecture')}
                            </span>
                          </div>

                          {/* Course Information */}
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-[#0f2744] text-white shadow-2xs tracking-wider">
                                {slot.course_code}
                              </span>
                              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                                {slot.course_title}
                              </h3>
                            </div>
                            <p className="text-xs text-slate-600 font-medium">
                              Enrolled Section: <strong className="text-slate-800">{slot.section}</strong> · BSCS Regular
                            </p>
                          </div>
                        </div>

                        {/* Venue in #fef3c6 & Action */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 border-t sm:border-t-0 border-slate-200/80 pt-3 sm:pt-0">
                          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#fef3c6] text-amber-950 border border-amber-300 shadow-2xs">
                            <MapPin className="w-3.5 h-3.5 text-amber-700" />
                            <span>{slot.room}</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleOpenUploadModal(slot.course_id)}
                            className="px-3.5 py-1.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5 text-amber-300" />
                            <span>Upload Handout</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

          </div>
        )}

        {/* =========================================================================
            TAB 2: ASSIGNED COURSES (MATCHING FACULTY VIDEO 00:10 - 00:20)
            ========================================================================= */}
        {currentTab === 'courses' && (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-blue-950">
                  Assigned Courses
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Official academic teaching portfolio for Spring 2025 Semester
                </p>
              </div>
              <span className="px-3 py-1 bg-blue-50 text-blue-900 border border-blue-200 rounded-full text-xs font-bold self-start sm:self-auto">
                {assignedCourses.length} Active Courses · 212 Total Enrolled
              </span>
            </div>

            {/* Course Cards (2 Columns matching video 00:12) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {assignedCourses.map((c) => (
                <div
                  key={c.id}
                  className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-[#f8fafc] hover:bg-slate-50 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-blue-100 text-blue-950 border border-blue-200">
                          {c.code}
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          Credit Hours: {c.credit_display || `${c.credit_hours} Cr`}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-amber-800">
                        Spring 2025 (Semester {c.semester})
                      </span>
                    </div>

                    <h2 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                      {c.title}
                    </h2>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {c.description || 'Comprehensive university degree curriculum syllabus modules.'}
                    </p>

                    {/* Meta info boxes - Pristine mobile stacking */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3.5 bg-white rounded-xl border border-slate-200 text-xs">
                      <div className="p-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Enrolled Students</span>
                        <span className="font-black text-slate-900 text-xs sm:text-sm">{c.enrolled_count || 50} Students</span>
                      </div>
                      <div className="p-1 border-t sm:border-t-0 sm:border-l border-slate-100 pt-2 sm:pt-1 sm:pl-2.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Assigned Sections</span>
                        <span className="font-bold text-slate-900 font-mono text-xs sm:text-sm">{c.assigned_sections || 'BSCS-6A'}</span>
                      </div>
                      <div className="p-1 border-t sm:border-t-0 sm:border-l border-slate-100 pt-2 sm:pt-1 sm:pl-2.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Classroom Venue</span>
                        <span className="font-bold text-amber-900 text-xs sm:text-sm">{c.venue || 'Room 204'}</span>
                      </div>
                    </div>

                    {/* Syllabus Coverage Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-600">Syllabus Coverage</span>
                        <span className="text-blue-950 font-black">{c.syllabus_coverage || 75}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-900 rounded-full transition-all"
                          style={{ width: `${c.syllabus_coverage || 75}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-200/80">
                    <span className="text-xs font-bold text-slate-700">
                      Course Materials: <strong>{c.materials_count || 6} Handouts</strong>
                    </span>

                    <button
                      type="button"
                      onClick={() => handleOpenUploadModal(c.id)}
                      className="w-full sm:w-auto px-4 py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-amber-300" />
                      <span>Upload Handout</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: TIMETABLE (MATCHING FACULTY VIDEO 00:21 - 00:24)
            ========================================================================= */}
        {currentTab === 'timetable' && (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-blue-950">
                  Teaching Timetable
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Weekly academic workload and assigned lecture rooms · Spring 2025 Semester
                </p>
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span>Print Schedule</span>
              </button>
            </div>

            {/* Day Switcher Tabs - Unified Responsive Layout */}
            {/* Mobile Horizontal Scrollable Segmented Bar */}
            <div className="sm:hidden flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {FACULTY_DAYS.map((d) => {
                const count = facultyTimetables.filter((t) => t.day_of_week === d.key).length;
                const isSelected = selectedDay === d.key;
                return (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => setSelectedDay(d.key)}
                    className={`py-2.5 px-4 rounded-xl text-center whitespace-nowrap transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
                      isSelected
                        ? 'bg-blue-900 text-white font-black shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/80 font-bold'
                    }`}
                  >
                    <span className="text-xs">{d.label}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                        isSelected ? 'bg-amber-400 text-blue-950 font-black' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Laptop / Tablet View: Elegant 5-Column Segmented Bar */}
            <div className="hidden sm:grid sm:grid-cols-5 gap-3 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/90">
              {FACULTY_DAYS.map((d) => {
                const count = facultyTimetables.filter((t) => t.day_of_week === d.key).length;
                const isSelected = selectedDay === d.key;
                return (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => setSelectedDay(d.key)}
                    className={`py-3 px-3 rounded-xl text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-900 text-white shadow-sm font-black ring-1 ring-blue-950'
                        : 'bg-white/80 hover:bg-white text-slate-700 hover:text-slate-950 border border-slate-200/70 font-bold'
                    }`}
                  >
                    <span className="text-sm font-extrabold block">{d.label}</span>
                    <span
                      className={`text-[11px] font-bold mt-1 inline-block px-2 py-0.5 rounded-full ${
                        isSelected ? 'bg-amber-400 text-blue-950 font-black' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {count} {count === 1 ? 'Class' : 'Classes'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Time Slot Cards for Selected Day */}
            <div className="space-y-3.5">
              {facultyTimetables
                .filter((t) => t.day_of_week === selectedDay)
                .map((slot) => {
                  const isLab = slot.course_title.toLowerCase().includes('lab') || slot.session_type?.toLowerCase().includes('lab');
                  const isCSLab1 = slot.room.toLowerCase().includes('cs lab 1') || slot.room.toLowerCase().includes('lab 1');
                  const isTimeGolden = slot.timeslot.includes('11:30');
                  return (
                    <div
                      key={slot.id}
                      className="p-5 rounded-2xl border border-slate-200 bg-[#f8fafc] hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-4 flex-1 min-w-0">
                        {/* Time Capsule: Light Sky Blue #dbeafe */}
                        <div className="p-2.5 sm:p-3 rounded-xl bg-white border border-slate-200 md:w-48 shrink-0 flex md:flex-col items-center md:items-start justify-between md:justify-center gap-1.5 shadow-2xs">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#dbeafe] text-blue-950 border border-blue-200 font-mono text-xs sm:text-sm font-black shadow-2xs">
                            <Clock className="w-3.5 h-3.5 text-blue-800 shrink-0" />
                            <span>{slot.timeslot}</span>
                          </div>
                          <span className="text-xs font-semibold text-slate-500">
                            {slot.session_type || (isLab ? 'Lab Practical' : 'Theory Lecture')}
                          </span>
                        </div>

                        {/* Course Information */}
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-[#0f2744] text-white shadow-2xs tracking-wider">
                              {slot.course_code}
                            </span>
                            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                              {slot.course_title}
                            </h2>
                          </div>
                          <p className="text-xs text-slate-600 font-medium">
                            Enrolled Section: <strong className="text-slate-800">{slot.section}</strong> · BSCS Regular
                          </p>
                        </div>
                      </div>

                      {/* Venue & Action - Yellow/golden #fef3c6 for location, and Access Repository style (bg-blue-900) for Upload */}
                      <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 border-t md:border-t-0 border-slate-200/80 pt-3 md:pt-0">
                        <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#fef3c6] text-amber-950 border border-amber-300 shadow-2xs">
                          <MapPin className="w-3.5 h-3.5 text-amber-700" />
                          <span>{slot.room}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenUploadModal(slot.course_id)}
                          className="px-3.5 py-1.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5 text-amber-300" />
                          <span>Upload Handout</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: HANDOUTS (MATCHING FACULTY VIDEO 00:25 - 00:32)
            ========================================================================= */}
        {currentTab === 'handouts' && (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl sm:text-2xl font-black text-blue-950">
                    Handout Hub & PDF Version Engine
                  </h1>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-900 border border-blue-200">
                    Non-Destructive Archival
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Manage academic lecture notes, slides, and lab manuals. Version replacements preserve full audit history in MySQL resource_versions.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleOpenUploadModal()}
                className="px-4 py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
              >
                <Upload className="w-3.5 h-3.5 text-amber-300" />
                <span>Upload New Handout</span>
              </button>
            </div>

            {/* Filters Row (matching video 00:26) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="relative lg:col-span-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchHandout}
                  onChange={(e) => setSearchHandout(e.target.value)}
                  placeholder="Search by topic, keyword, week number, or..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-[#f8fafc] focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-900 font-medium"
                />
              </div>

              <div>
                <select
                  value={selectedCourseFilter}
                  onChange={(e) => setSelectedCourseFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-[#f8fafc] focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-900 font-medium"
                >
                  <option value="all">All Assigned Courses</option>
                  <option value="CS-401">CS-401: Database Systems</option>
                  <option value="CS-601">CS-601: Software Engineering</option>
                  <option value="CS-301">CS-301: Data Structures & Algorithms</option>
                  <option value="CS-402">CS-402: Cloud Computing & Distributed Systems</option>
                </select>
              </div>

              <div>
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-[#f8fafc] focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-900 font-medium"
                >
                  <option value="all">All Categories</option>
                  <option value="Lecture Notes">Lecture Notes</option>
                  <option value="SLIDES">Lecture Slides</option>
                  <option value="LAB">Lab Manual</option>
                  <option value="NOTES">Reference Notes</option>
                </select>
              </div>

              <div className="flex items-center justify-between gap-2">
                <select
                  value={selectedWeekFilter}
                  onChange={(e) => setSelectedWeekFilter(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl bg-[#f8fafc] focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-900 font-medium"
                >
                  <option value="all">All Weeks</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                    <option key={w} value={String(w)}>Week {w}</option>
                  ))}
                </select>
                <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">
                  {displayedHandouts.length} of {facultyHandouts.length} resources
                </span>
              </div>
            </div>

            {/* Handouts Cards (2-Columns Grid matching video 00:27 - 00:32) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {displayedHandouts.map((h) => (
                <div
                  key={h.id}
                  className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-[#f8fafc] hover:bg-slate-50 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-blue-100 text-blue-950 border border-blue-200">
                          {h.course_code}
                        </span>
                        <span className="text-xs font-bold text-slate-600">
                          Week {h.week_number}
                        </span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                          {h.category}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                        v{h.current_version} Active
                      </span>
                    </div>

                    <h2 className="text-base font-black text-slate-900 leading-snug">
                      {h.title}
                    </h2>
                    <p className="text-xs font-semibold text-slate-500">
                      Course: {h.course_title}
                    </p>

                    {/* Key Learning Objectives */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1.5">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                        KEY LEARNING OBJECTIVES
                      </span>
                      {h.key_objectives && h.key_objectives.length > 0 ? (
                        <ul className="space-y-1 text-slate-600 font-medium list-none">
                          {h.key_objectives.slice(0, 2).map((obj, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-blue-900 font-bold">•</span>
                              <span>{obj}</span>
                            </li>
                          ))}
                          {h.key_objectives.length > 2 && (
                            <li className="text-[11px] text-slate-400 font-semibold italic">
                              +{h.key_objectives.length - 2} more objectives
                            </li>
                          )}
                        </ul>
                      ) : (
                        <p className="text-slate-500 italic text-[11px]">
                          Comprehensive lecture notes and code demonstrations.
                        </p>
                      )}
                    </div>

                    {/* Attached file box */}
                    <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="w-5 h-5 text-red-600 shrink-0" />
                        <div className="truncate">
                          <span className="font-mono font-bold text-slate-900 truncate block">
                            {h.file_name}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {h.file_size} · Uploaded {h.updated_at}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Replace PDF Version & Download */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-3 border-t border-slate-200/80">
                    <button
                      type="button"
                      onClick={() => {
                        setTargetHandout(h);
                        setIsReplaceModalOpen(true);
                      }}
                      className="px-4 py-2.5 text-xs font-bold text-blue-900 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Replace PDF Version</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadSimulation(h.title)}
                      className="px-4 py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Handout</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 5: NOTICES (MATCHING FACULTY VIDEO 00:33 - 00:41)
            ========================================================================= */}
        {currentTab === 'notices' && (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-blue-950">
                  Notices & Student Reports
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Student feedback alerts on uploaded lecture handouts & official department communications
                </p>
              </div>

              {/* Subtabs Switcher (Matching video 00:33) */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-100 p-1.5 rounded-2xl sm:rounded-xl">
                <button
                  type="button"
                  onClick={() => setNoticesSubtab('reports')}
                  className={`px-3 py-2 sm:py-1.5 rounded-xl sm:rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    noticesSubtab === 'reports'
                      ? 'bg-white text-blue-950 shadow-2xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Student Reports ({pendingReportsCount} Pending)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setNoticesSubtab('department')}
                  className={`px-3 py-2 sm:py-1.5 rounded-xl sm:rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    noticesSubtab === 'department'
                      ? 'bg-white text-blue-950 shadow-2xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                  <span>Department Notices ({unreadCircularsCount} Unread)</span>
                </button>
              </div>
            </div>

            {/* SUBTAB 1: STUDENT REPORTS (MATCHING VIDEO 00:34 - 00:37) */}
            {noticesSubtab === 'reports' && (
              <div className="space-y-4">
                {/* Filter tabs */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">Filter Reports:</span>
                    {(
                      [
                        { key: 'all', label: `All (${localReports.length})` },
                        { key: 'pending', label: `Pending Action (${pendingReportsCount})` },
                        { key: 'resolved', label: `Resolved (${localReports.length - pendingReportsCount})` },
                      ] as const
                    ).map((f) => (
                      <button
                        key={f.key}
                        type="button"
                        onClick={() => setReportFilter(f.key)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          reportFilter === f.key
                            ? 'bg-blue-900 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <span className="text-[11px] text-slate-400 font-medium">
                    Direct alerts from UCMS student portal feedback desk
                  </span>
                </div>

                {/* Reports List */}
                <div className="space-y-3">
                  {localReports
                    .filter((r) => {
                      if (reportFilter === 'pending') return r.status === 'Pending Review';
                      if (reportFilter === 'resolved') return r.status === 'Resolved';
                      return true;
                    })
                    .map((report) => (
                      <div
                        key={report.id}
                        className="p-5 rounded-2xl border border-slate-200 bg-[#f8fafc] hover:bg-slate-50 transition-colors space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-blue-100 text-blue-950 border border-blue-200">
                              {report.course_code || 'CS-401'}
                            </span>
                            <span className="text-xs font-bold text-slate-700">
                              {report.week_text || 'Week 4 Handout'}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                                report.error_tag === 'MISSING PAGES'
                                  ? 'bg-red-100 text-red-800'
                                  : report.error_tag === 'CLARIFICATION'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-amber-100 text-amber-900'
                              }`}
                            >
                              {report.error_tag || 'FEEDBACK'}
                            </span>
                          </div>

                          <span className="text-[11px] text-slate-500 font-mono">
                            Reported by <strong>{report.student_name}</strong> ({report.reporter_roll || 'UCMS-2022-041'}) on {report.created_at}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-sm font-black text-slate-900">
                            Handout: "{report.handout_title || report.subject}"
                          </h3>
                          <div className="p-3 mt-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-medium">
                            <strong>Reported Issue:</strong> {report.description}
                          </div>
                        </div>

                        {report.resolution_note && (
                          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>{report.resolution_note}</span>
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-200/80">
                          <div>
                            {report.status === 'Pending Review' ? (
                              <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 inline-flex items-center gap-1">
                                <AlertCircle className="w-3 h-3 text-amber-600" />
                                <span>Action Required</span>
                              </span>
                            ) : report.status === 'Dismissed' ? (
                              <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-300 inline-flex items-center gap-1">
                                <Check className="w-3 h-3 text-slate-600" />
                                <span>No Such Issue / Clarified</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300 inline-flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>Resolved</span>
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setActionReport(report);
                              setActionDecision(report.status === 'Dismissed' ? 'Dismissed' : 'Resolved');
                              setActionNote(report.resolution_note || '');
                            }}
                            className="w-full sm:w-auto px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
                          >
                            <span>Take Action</span>
                            <ChevronRight className="w-3.5 h-3.5 text-amber-300" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* SUBTAB 2: DEPARTMENT NOTICES (MATCHING VIDEO 00:38 - 00:40) */}
            {noticesSubtab === 'department' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-black text-slate-900">
                      Department Circulars & Class Updates
                    </h2>
                    <span className="text-xs text-slate-500">
                      Head of Department, Academic Administration & Faculty Notices
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPostingNotice(!isPostingNotice)}
                    className="px-3.5 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-300" />
                    <span>{isPostingNotice ? 'Close Form' : 'Post Class Update / Notice'}</span>
                  </button>
                </div>

                {/* Faculty Post Notice Form (Collapsible) */}
                {isPostingNotice && (
                  <div className="bg-[#f8fafc] border border-blue-200 rounded-2xl p-5 space-y-4 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <Send className="w-4 h-4 text-blue-900" />
                        <h3 className="text-sm font-bold text-slate-900">
                          Post New Course / Class Update
                        </h3>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500">
                        Instructor: {user.full_name}
                      </span>
                    </div>

                    {facultyNoticeSuccess && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{facultyNoticeSuccess}</span>
                      </div>
                    )}

                    <form onSubmit={handleFacultyNoticeSubmit} className="space-y-3.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Target Audience</label>
                          <select
                            value={facultyNoticeAudience}
                            onChange={(e) => setFacultyNoticeAudience(e.target.value as any)}
                            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-medium text-slate-700"
                          >
                            <option value="students">Enrolled Students in My Courses</option>
                            <option value="cs_only">All Computer Science Students</option>
                            <option value="all">Entire Department</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Notice Priority</label>
                          <select
                            value={facultyNoticePriority}
                            onChange={(e) => setFacultyNoticePriority(e.target.value as any)}
                            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-medium text-slate-700"
                          >
                            <option value="normal">Standard Class Notice</option>
                            <option value="urgent">[URGENT] High Priority Update</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Notice Headline</label>
                        <input
                          type="text"
                          value={facultyNoticeTitle}
                          onChange={(e) => setFacultyNoticeTitle(e.target.value)}
                          placeholder="e.g. Rescheduled Lab Session, Assignment Submission Guidelines..."
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-blue-900 font-medium"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Message / Directive</label>
                        <textarea
                          rows={3}
                          value={facultyNoticeContent}
                          onChange={(e) => setFacultyNoticeContent(e.target.value)}
                          placeholder="Provide all guidelines, room numbers, deadlines, or instructions..."
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-blue-900 font-medium"
                          required
                        />
                      </div>

                      {/* Optional Document, Image, or Page Notification Attachment */}
                      <AttachmentUploader
                        attachment={facultyNoticeAttachment}
                        onAttachmentChange={setFacultyNoticeAttachment}
                        label="Attach Document, Image, or Page Notification"
                        helperText="Optional: You can attach a document (PDF, Word, TXT), image (PNG, JPG), or page format notification. Leave empty if no file is needed."
                      />

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsPostingNotice(false)}
                          className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5 text-amber-300" />
                          <span>Broadcast Class Notice →</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="space-y-3">
                  {facultyAnnouncements.map((ann) => {
                    const isExpanded = expandedNoticeId === ann.id;
                    const isHod = ann.uploader_role === 'HOD CS' || ann.author.includes('HOD') || ann.author.includes('Tariq') || ann.author.includes('Chair');
                    const senderRole = ann.uploader_role || (isHod ? 'HOD CS' : 'ADMIN');
                    const senderName = ann.uploader_name || (isHod ? 'Dr. Tariq Mahmood (Head of CS)' : 'Central Academic Administration');
                    return (
                      <div
                        key={ann.id}
                        className={`rounded-2xl border transition-all ${
                          isExpanded
                            ? 'bg-white border-blue-900 shadow-xs'
                            : 'bg-[#f8fafc] border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setExpandedNoticeId(isExpanded ? null : ann.id)}
                          className="w-full p-4 sm:p-5 text-left transition-colors flex flex-col gap-2.5 cursor-pointer"
                        >
                          {/* Top Line: Role, [URGENT] badge, Uploader Name, Date */}
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`px-2.5 py-0.5 text-[10px] font-black rounded-md uppercase tracking-wide ${
                                  isHod
                                    ? 'bg-amber-100 text-amber-950 border border-amber-300'
                                    : 'bg-blue-100 text-blue-950 border border-blue-300'
                                }`}
                              >
                                [{senderRole}]
                              </span>
                              {ann.priority === 'urgent' && (
                                <span className="px-2 py-0.5 text-[9.5px] font-black uppercase tracking-wider rounded border bg-red-50 text-red-700 border-red-200">
                                  [URGENT]
                                </span>
                              )}
                              <span className="text-xs font-bold text-slate-800">
                                Uploaded by: <strong className="text-slate-900 font-extrabold">{senderName}</strong>
                              </span>
                              {ann.attachment_name && (
                                <AnnouncementAttachment
                                  compact
                                  attachmentName={ann.attachment_name}
                                  attachmentType={ann.attachment_type}
                                />
                              )}
                            </div>

                            <span className="text-[11px] text-slate-400 font-mono">
                              {ann.created_at}
                            </span>
                          </div>

                          {/* Middle: Title & Excerpt Preview */}
                          <div>
                            <h3 className="text-sm font-bold text-slate-900 leading-snug">
                              {ann.title}
                            </h3>
                            <p className="text-xs text-slate-500 line-clamp-1 mt-1 font-normal">
                              {ann.content}
                            </p>
                          </div>

                          {/* Bottom Row: Action / Read Notice Button */}
                          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                            <span className="text-[11px] font-medium text-slate-400">
                              {isExpanded ? 'Full circular open' : 'Click to expand official circular'}
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 hover:text-blue-950 bg-blue-50 px-2.5 py-1 rounded-lg">
                              <span>{isExpanded ? 'Collapse' : 'Read Notice'}</span>
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </span>
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="px-5 pb-5 pt-2 border-t border-slate-100 text-xs text-slate-700 space-y-3">
                            <p className="leading-relaxed font-medium whitespace-pre-line bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                              {ann.content}
                            </p>

                            {/* Attached Document or Image (if present) */}
                            <AnnouncementAttachment
                              attachmentName={ann.attachment_name}
                              attachmentUrl={ann.attachment_url}
                              attachmentType={ann.attachment_type}
                              attachmentSize={ann.attachment_size}
                            />

                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                              <span className="text-emerald-700 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verified Dispatch by {senderName} ({senderRole})
                              </span>
                              <span className="font-mono">Reference: UCMS/HOD/2026/092</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* =========================================================================
          HANDOUT UPLOAD ENGINE MODAL (MATCHING VIDEO 00:16)
          ========================================================================= */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Blue Header Bar */}
            <div className="bg-blue-900 text-white p-5 sm:p-6 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-950 flex items-center justify-center shrink-0 border border-blue-800">
                  <Upload className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black tracking-tight">
                    Handout Upload Engine
                  </h2>
                  <p className="text-xs text-blue-100 opacity-90">
                    Faculty Portal · Instant Student Portal Distribution
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 text-blue-200 hover:text-white hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-5 sm:p-6 space-y-4 max-h-[calc(85vh-130px)] overflow-y-auto">
              {/* Select Assigned Course */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  Select Assigned Course *
                </label>
                <select
                  value={modalCourseId}
                  onChange={(e) => setModalCourseId(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-900 font-semibold bg-[#f8fafc]"
                  required
                >
                  {assignedCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code}: {c.title} ({c.assigned_sections || 'BSCS-6A'})
                    </option>
                  ))}
                </select>
                {/* Department and Semester preview */}
                <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] font-bold">
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-900 border border-blue-200">
                    Dept: Department of Computer Science
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
                    Semester: {assignedCourses.find(c => c.id === modalCourseId)?.semester || 6} ({assignedCourses.find(c => c.id === modalCourseId)?.assigned_sections || 'BSCS-6A'})
                  </span>
                </div>
              </div>

              {/* Lecture Title & Week */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                    Handout / Slide Title *
                  </label>
                  <input
                    type="text"
                    value={modalTitle}
                    onChange={(e) => setModalTitle(e.target.value)}
                    placeholder="e.g. Lecture 09: Minimum Spanning Trees & Prim's Algorithm"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-900 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                    Week Number (Optional)
                  </label>
                  <select
                    value={modalWeek}
                    onChange={(e) => setModalWeek(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-900 font-bold bg-[#f8fafc]"
                  >
                    <option value={0}>General (No Specific Week)</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((w) => (
                      <option key={w} value={w}>Week {w}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={modalCategory}
                    onChange={(e) => setModalCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-900 font-bold bg-[#f8fafc]"
                  >
                    <option value="Lecture Notes">Lecture Notes</option>
                    <option value="Lecture Slide">Lecture Slides</option>
                    <option value="Lab Manual">Lab Manual</option>
                    <option value="Assignment">Assignment</option>
                    <option value="Syllabus">Syllabus</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                    Description / Context
                  </label>
                  <input
                    type="text"
                    value={modalDescription}
                    onChange={(e) => setModalDescription(e.target.value)}
                    placeholder="Brief summary for students regarding this document..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-900 font-medium"
                  />
                </div>
              </div>

              {/* File Dropzone */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  Handout File Attachment (.PDF, .DOCX, .PPTX) *
                </label>
                <div className="border-2 border-dashed border-blue-300 hover:border-blue-500 rounded-2xl p-5 text-center bg-blue-50/30 transition-colors">
                  <Upload className="w-7 h-7 text-blue-900 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-800">
                    Drop lecture PDF or document here, or <span className="text-blue-900 underline cursor-pointer">browse</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Supports official course handouts, lecture slides, and tutorial sheets up to 25MB
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.docx,.pptx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setModalFileName(file.name);
                    }}
                    className="mt-2 text-xs text-slate-600 block mx-auto cursor-pointer"
                  />
                </div>
                {modalFileName && (
                  <p className="text-xs font-mono font-bold text-emerald-700 mt-1.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Selected File: {modalFileName}</span>
                  </p>
                )}
              </div>

              {/* Learning Objectives */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  Lecture Objectives & Learning Outcomes
                </label>
                <textarea
                  rows={2}
                  value={modalObjectives}
                  onChange={(e) => setModalObjectives(e.target.value)}
                  placeholder="Core theoretical foundation and formal algorithmic definition"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-900 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Publish Handout →
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* =========================================================================
          REPLACE PDF VERSION MODAL (NON-DESTRUCTIVE ARCHIVAL)
          ========================================================================= */}
      {isReplaceModalOpen && targetHandout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-blue-900 text-white p-5 flex items-start justify-between">
              <div>
                <h2 className="text-base font-black">
                  Replace PDF Version (v{targetHandout.current_version} → v{targetHandout.current_version + 1})
                </h2>
                <p className="text-xs text-blue-100 mt-0.5">
                  Target: {targetHandout.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsReplaceModalOpen(false)}
                className="p-1 text-blue-200 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReplaceSubmit} className="p-5 sm:p-6 space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                <strong>Non-Destructive Versioning:</strong> Previous version {targetHandout.current_version} will be archived into <code className="font-mono">resource_versions</code> along with your immutable reason for audit tracking.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  New File Name *
                </label>
                <input
                  type="text"
                  value={replaceFileName}
                  onChange={(e) => setReplaceFileName(e.target.value)}
                  placeholder={`e.g. ${targetHandout.file_name.replace('.pdf', '')}_v2.pdf`}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Replacement Reason (Mandatory Audit Log) *
                </label>
                <textarea
                  rows={3}
                  value={replaceReason}
                  onChange={(e) => setReplaceReason(e.target.value)}
                  placeholder="e.g. Corrected syntax in slide 12 SQL query and added missing code comments."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900 font-medium"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReplaceModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Archive & Publish v{targetHandout.current_version + 1}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE ASSESSMENT / QUIZ MODAL */}
      {isCreateAssessmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-blue-950 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400">
                  ASSESSMENT & QUIZ ENGINE
                </span>
                <h3 className="text-base font-extrabold text-white">
                  Create New Quiz / Assessment
                </h3>
                <p className="text-xs text-blue-200">
                  Set enforced submission deadlines visible to enrolled students
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateAssessmentModalOpen(false)}
                className="p-1.5 text-blue-300 hover:text-white hover:bg-blue-900 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateAssessmentSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Course *
                  </label>
                  <select
                    value={newCourseId}
                    onChange={(e) => setNewCourseId(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-900 font-semibold"
                  >
                    {assignedCourses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} · {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Assessment Category *
                  </label>
                  <select
                    value={newAssessmentType}
                    onChange={(e) => setNewAssessmentType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-900 font-semibold"
                  >
                    <option value="Assignment">Assignment</option>
                    <option value="Quiz">Quiz</option>
                    <option value="Lab Assessment">Lab Assessment</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assessment / Quiz Title *
                </label>
                <input
                  type="text"
                  value={newAssessmentTitle}
                  onChange={(e) => setNewAssessmentTitle(e.target.value)}
                  placeholder="e.g. Quiz 03: Normalization & BCNF Decomposition Proofs"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-900 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Total Marks *
                  </label>
                  <input
                    type="number"
                    value={newAssessmentMarks}
                    onChange={(e) => setNewAssessmentMarks(Number(e.target.value))}
                    min={1}
                    max={100}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-900 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Deadline Date *
                  </label>
                  <input
                    type="date"
                    value={newAssessmentDate}
                    onChange={(e) => setNewAssessmentDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-900 font-mono font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Deadline Cutoff Time *
                  </label>
                  <input
                    type="time"
                    value={newAssessmentTime}
                    onChange={(e) => setNewAssessmentTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-900 font-mono font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Instructions & Guidelines
                </label>
                <textarea
                  rows={3}
                  value={newAssessmentDesc}
                  onChange={(e) => setNewAssessmentDesc(e.target.value)}
                  placeholder="e.g. Submit single PDF file via the student workspace portal before cutoff time. Late submissions will receive zero credit."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-900 font-sans"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Strict Deadline Enforcement:</strong> This deadline will be displayed with live countdown in both student and faculty dashboards. After cutoff, the assessment submission status automatically transitions to "Deadline Passed".
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateAssessmentModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Publish Assessment with Deadline</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: TAKE ACTION ON STUDENT INQUIRY (RESOLVE OR CLARIFY)
          ========================================================================= */}
      {actionReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-blue-900 text-white p-5 sm:p-6 flex items-start justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-black tracking-tight">
                  Take Action on Student Inquiry
                </h3>
                <p className="text-xs text-blue-100 opacity-90 mt-0.5">
                  Inquiry #{actionReport.id} · Filed by {actionReport.student_name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActionReport(null)}
                className="p-1 text-blue-200 hover:text-white hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTakeActionSubmit} className="p-5 sm:p-6 space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
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
                  Action Decision *
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
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark as Resolved</span>
                    </div>
                    <span className="text-[11px] font-normal text-slate-500">
                      Issue verified and corrected.
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
                      <AlertCircle className="w-4 h-4" />
                      <span>No Such Issue / Clarification</span>
                    </div>
                    <span className="text-[11px] font-normal text-slate-500">
                      Content verified correct as published.
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  Teacher's Response to Student *
                </label>
                <textarea
                  rows={3}
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder="Enter detailed clarification, advice, or confirmation that will be directly displayed on the student's portal..."
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
                  className="px-5 py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Submit Action & Notify Student →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
