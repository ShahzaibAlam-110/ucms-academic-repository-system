import React, { useState, useEffect } from 'react';
import {
  Bell,
  BookOpen,
  Calendar,
  AlertCircle,
  FileText,
  Download,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Send,
  Bookmark,
  BookmarkCheck,
  Search,
  ExternalLink,
  Printer,
  Sparkles,
  MapPin,
  ArrowRight,
  Layers,
  GraduationCap,
  X,
  Upload,
  FileCode,
  FileSpreadsheet,
  CheckCircle2,
  Lock,
  Plus,
} from 'lucide-react';
import {
  User,
  Course,
  Handout,
  TimetableSlot,
  Announcement,
  StudentReport,
  StudyBookmark,
  INITIAL_BOOKMARKS,
  AcademicAssessment,
  INITIAL_ASSESSMENTS,
} from '../data/mockDatabase';
import { triggerPdfDownload } from '../utils/pdfGenerator';
import { AnnouncementAttachment } from './AnnouncementAttachment';

interface StudentWorkspaceProps {
  user: User;
  courses: Course[];
  handouts: Handout[];
  timetables: TimetableSlot[];
  announcements: Announcement[];
  reports: StudentReport[];
  assessments?: AcademicAssessment[];
  activeTab?: 'overview' | 'updates' | 'courses' | 'timetable' | 'bookmarks';
  onSelectTab?: (tab: 'overview' | 'updates' | 'courses' | 'timetable' | 'bookmarks') => void;
  onOpenProfileModal?: () => void;
  onMarkAnnouncementRead: (id: number) => void;
  onSubmitReport: (
    category: string,
    subject: string,
    description: string,
    details?: { slot_info?: string; course_code?: string; handout_title?: string }
  ) => void;
  onSubmitAssessment?: (id: number, notes?: string, fileName?: string) => void;
  onLogout?: () => void;
}

export const StudentWorkspace: React.FC<StudentWorkspaceProps> = ({
  user,
  courses,
  handouts,
  timetables,
  announcements,
  reports,
  assessments,
  activeTab = 'overview',
  onSelectTab,
  onOpenProfileModal,
  onMarkAnnouncementRead,
  onSubmitReport,
  onSubmitAssessment,
  onLogout,
}) => {
  // Local fallback if activeTab is not controlled from header
  const [localActiveTab, setLocalActiveTab] = useState<'overview' | 'updates' | 'courses' | 'timetable' | 'bookmarks'>('overview');
  const currentTab = onSelectTab ? activeTab : localActiveTab;
  const switchTab = (t: 'overview' | 'updates' | 'courses' | 'timetable' | 'bookmarks') => {
    if (onSelectTab) onSelectTab(t);
    else setLocalActiveTab(t);
  };

  // Timetable Day Selection
  const [selectedDay, setSelectedDay] = useState<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri'>('Mon');

  // Academic Repository Modal State
  const [repositoryCourse, setRepositoryCourse] = useState<Course | null>(null);

  // Search & Filters
  const [searchCourses, setSearchCourses] = useState('');
  const [searchCirculars, setSearchCirculars] = useState('');
  const [circularFilter, setCircularFilter] = useState<'all' | 'unread' | 'inquiries'>('all');
  const [bookmarkFilter, setBookmarkFilter] = useState<'all' | 'courses' | 'handouts' | 'notes'>('all');

  // Accordion for announcements
  const [expandedNoticeId, setExpandedNoticeId] = useState<number | null>(null);

  // Bookmarks State
  const [bookmarks, setBookmarks] = useState<StudyBookmark[]>(INITIAL_BOOKMARKS);

  // Academic Inquiry Modal State (Timetable Issue or Handout Issue)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportCategory, setReportCategory] = useState<'Timetable Issue' | 'Handout Issue'>('Timetable Issue');
  const [reportSlotIssue, setReportSlotIssue] = useState<string>('');
  const [reportCourseIssue, setReportCourseIssue] = useState<string>('');
  const [reportHandoutIssue, setReportHandoutIssue] = useState<string>('');
  const [reportSubject, setReportSubject] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportFeedback, setReportFeedback] = useState('');

  // Pin Study Reference Modal State
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinTitle, setPinTitle] = useState('');
  const [pinType, setPinType] = useState<'course' | 'handout' | 'note'>('note');
  const [pinSubtitle, setPinSubtitle] = useState('');

  // Download simulation feedback
  const [downloadFeedback, setDownloadFeedback] = useState<string | null>(null);

  // Live timer for upcoming class
  const [timeRemaining, setTimeRemaining] = useState('01h 10m 40s');

  // Upcoming Quizzes & Assignments State
  const [localAssessments, setLocalAssessments] = useState<AcademicAssessment[]>(assessments || INITIAL_ASSESSMENTS);
  useEffect(() => {
    if (assessments) setLocalAssessments(assessments);
  }, [assessments]);

  const [assessmentFilter, setAssessmentFilter] = useState<'active' | 'all' | 'quizzes' | 'assignments' | 'passed'>('active');

  const getDeadlineInfo = (deadlineDate: string, deadlineTime: string = '23:59') => {
    try {
      const now = new Date();
      const target = new Date(`${deadlineDate}T${deadlineTime}:00`);
      const diffMs = target.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      if (diffMs < 0) {
        return { isExpired: true, text: 'Deadline Passed', pillClass: 'bg-red-50 text-red-800 border-red-200' };
      }
      if (diffDays <= 1) {
        return { isExpired: false, text: 'Due Today / Urgent', pillClass: 'bg-amber-100 text-amber-950 border-amber-300 font-black animate-pulse' };
      }
      return { isExpired: false, text: `Due in ${diffDays} days`, pillClass: 'bg-emerald-50 text-emerald-900 border-emerald-200 font-bold' };
    } catch {
      return { isExpired: false, text: 'Active Deadline', pillClass: 'bg-blue-50 text-blue-900 border-blue-200' };
    }
  };

  // Dynamic PKT Real-Time Countdown & Active Class Detection
  const [activeOrNextSlot, setActiveOrNextSlot] = useState<TimetableSlot | null>(null);
  const [slotStatusLabel, setSlotStatusLabel] = useState<string>('Starts in');

  useEffect(() => {
    const updateCountdown = () => {
      // 1. Current PKT Time (UTC+05:00 / Asia/Karachi)
      const now = new Date();
      const pktFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Karachi',
        weekday: 'short',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false,
      });
      const parts = pktFormatter.formatToParts(now);
      let pktHour = 0;
      let pktMinute = 0;
      let pktSecond = 0;
      let pktDayShort = 'Mon';
      for (const p of parts) {
        if (p.type === 'hour') pktHour = parseInt(p.value, 10);
        if (p.type === 'minute') pktMinute = parseInt(p.value, 10);
        if (p.type === 'second') pktSecond = parseInt(p.value, 10);
        if (p.type === 'weekday') pktDayShort = p.value;
      }
      const pktTotalSeconds = pktHour * 3600 + pktMinute * 60 + pktSecond;

      const parseTimeslotToSeconds = (timeslot: string) => {
        const [startStr, endStr] = timeslot.split(' - ');
        const parsePart = (str: string) => {
          if (!str) return 0;
          const [time, meridiem] = str.trim().split(' ');
          let [h, m] = (time || '0:0').split(':').map(Number);
          if (meridiem === 'PM' && h < 12) h += 12;
          if (meridiem === 'AM' && h === 12) h = 0;
          return h * 3600 + m * 60;
        };
        const startSec = parsePart(startStr);
        const endSec = endStr ? parsePart(endStr) : startSec + 90 * 60;
        return { startSec, endSec };
      };

      const dayKeys: Array<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri'> = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
      const weekDayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      const currentDayIdx = weekDayMap[pktDayShort] ?? 1;

      let chosenSlot: TimetableSlot | null = null;
      let diffSeconds = 0;
      let isLiveNow = false;

      // If today is a standard weekday (Monday to Friday)
      if (currentDayIdx >= 1 && currentDayIdx <= 5) {
        const todayKey = dayKeys[currentDayIdx - 1];
        const todaySlots = timetables
          .filter((t) => t.day_of_week === todayKey)
          .map((t) => ({ ...t, ...parseTimeslotToSeconds(t.timeslot) }))
          .sort((a, b) => a.startSec - b.startSec);

        // Check if a class is active right now
        for (const s of todaySlots) {
          if (pktTotalSeconds >= s.startSec && pktTotalSeconds < s.endSec) {
            chosenSlot = s;
            isLiveNow = true;
            diffSeconds = s.endSec - pktTotalSeconds;
            break;
          }
        }

        // If no class live, check for an upcoming class later today
        if (!chosenSlot) {
          for (const s of todaySlots) {
            if (s.startSec > pktTotalSeconds) {
              chosenSlot = s;
              isLiveNow = false;
              diffSeconds = s.startSec - pktTotalSeconds;
              break;
            }
          }
        }
      }

      // If no slot today (or today finished, or weekend), find next upcoming weekday with classes
      if (!chosenSlot) {
        for (let offset = 1; offset <= 7; offset++) {
          const nextIdx = (currentDayIdx + offset) % 7;
          if (nextIdx >= 1 && nextIdx <= 5) {
            const nextKey = dayKeys[nextIdx - 1];
            const nextSlots = timetables
              .filter((t) => t.day_of_week === nextKey)
              .map((t) => ({ ...t, ...parseTimeslotToSeconds(t.timeslot) }))
              .sort((a, b) => a.startSec - b.startSec);

            if (nextSlots.length > 0) {
              const earliest = nextSlots[0];
              chosenSlot = earliest;
              isLiveNow = false;
              // Total seconds until that slot starts
              diffSeconds = (offset * 86400) - pktTotalSeconds + earliest.startSec;
              break;
            }
          }
        }
      }

      // Fallback to first available slot if timetable exists
      if (!chosenSlot && timetables.length > 0) {
        chosenSlot = timetables[0];
        diffSeconds = 3600;
      }

      setActiveOrNextSlot(chosenSlot);

      if (diffSeconds > 0) {
        const totalSec = Math.floor(diffSeconds);
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        const formatted = `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;

        if (isLiveNow) {
          setSlotStatusLabel('Class In Session');
          setTimeRemaining(`ends in ${formatted}`);
        } else if (h >= 24) {
          const days = Math.floor(h / 24);
          const remHours = h % 24;
          setSlotStatusLabel('Next Lecture');
          setTimeRemaining(days === 1 ? `Tomorrow at ${chosenSlot?.timeslot?.split(' - ')[0] || ''}` : `in ${days}d ${remHours}h`);
        } else {
          setSlotStatusLabel('Starts in');
          setTimeRemaining(formatted);
        }
      } else {
        setSlotStatusLabel('Class Starting');
        setTimeRemaining('00h 00m 00s');
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [timetables]);

  // Filter 6 active BSCS-VI semester courses
  const enrolledCourses = courses.filter((c) => c.semester === 6 || c.code.startsWith('CS-4'));

  // Filter announcements for student
  const studentAnnouncements = announcements.filter(
    (a) => a.audience === 'students' || a.audience === 'all' || a.audience === 'cs_only'
  );

  const unreadCount = studentAnnouncements.filter((a) => !a.is_read).length;

  // Rate limiting quota: max 3 per week
  const studentReports = reports.filter((r) => r.student_id === user.id);
  const quotaRemaining = Math.max(0, 3 - studentReports.length);

  // Toggle announcement
  const handleToggleNotice = (id: number) => {
    if (expandedNoticeId === id) {
      setExpandedNoticeId(null);
    } else {
      setExpandedNoticeId(id);
      onMarkAnnouncementRead(id);
    }
  };

  // Bookmark Toggle
  const isItemBookmarked = (type: 'course' | 'handout' | 'note', targetId: number) => {
    return bookmarks.some((b) => b.item_type === type && b.target_id === targetId);
  };

  const toggleBookmark = (type: 'course' | 'handout' | 'note', targetId: number, title: string, subtitle?: string) => {
    if (isItemBookmarked(type, targetId)) {
      setBookmarks((prev) => prev.filter((b) => !(b.item_type === type && b.target_id === targetId)));
    } else {
      const newB: StudyBookmark = {
        id: Date.now(),
        student_id: user.id,
        item_type: type,
        target_id: targetId,
        title,
        subtitle,
        meta_info: 'Pinned via Student Workspace',
        created_at: new Date().toISOString().substring(0, 10),
      };
      setBookmarks((prev) => [newB, ...prev]);
    }
  };

  // Add custom study reference
  const handleAddPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinTitle.trim()) return;
    const newB: StudyBookmark = {
      id: Date.now(),
      student_id: user.id,
      item_type: pinType,
      title: pinTitle.trim(),
      subtitle: pinSubtitle.trim() || 'Custom Study Reference',
      meta_info: `Added ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
      created_at: new Date().toISOString().substring(0, 10),
    };
    setBookmarks((prev) => [newB, ...prev]);
    setPinTitle('');
    setPinSubtitle('');
    setIsPinModalOpen(false);
  };

  // Certified Handout PDF Download (Generates and downloads valid PDF 1.4 document)
  const handleDownload = (fileName: string, title: string, courseCode?: string, weekNumber?: number) => {
    try {
      triggerPdfDownload({
        title,
        fileName,
        courseCode: courseCode || 'CS-401',
        courseTitle: title,
        weekNumber: weekNumber || 1,
        author: 'Department Faculty In-Charge',
        department: user.department_name || 'Department of Computer Science',
        semester: user.semester || 6,
      });
      setDownloadFeedback(`"${fileName}" downloaded successfully.`);
    } catch {
      setDownloadFeedback(`Downloaded "${fileName}".`);
    }
    setTimeout(() => setDownloadFeedback(null), 3500);
  };

  // Submit Academic Inquiry (Strictly Timetable Issue or Handout Issue)
  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quotaRemaining <= 0) {
      setReportFeedback('Weekly quota reached. Maximum 3 academic inquiries allowed per 7-day period.');
      return;
    }
    if (!reportSubject.trim() || !reportDescription.trim()) {
      setReportFeedback('Please enter both inquiry subject and description.');
      return;
    }

    if (reportCategory === 'Timetable Issue' && !reportSlotIssue) {
      setReportFeedback('Please select the specific timetable slot with an issue.');
      return;
    }

    if (reportCategory === 'Handout Issue' && !reportCourseIssue) {
      setReportFeedback('Please select the course with a handout issue.');
      return;
    }

    onSubmitReport(
      reportCategory,
      reportSubject.trim(),
      reportDescription.trim(),
      {
        slot_info: reportCategory === 'Timetable Issue' ? reportSlotIssue : undefined,
        course_code: reportCategory === 'Handout Issue' ? reportCourseIssue : undefined,
        handout_title: reportCategory === 'Handout Issue' ? reportHandoutIssue : undefined,
      }
    );

    setReportSubject('');
    setReportDescription('');
    setReportSlotIssue('');
    setReportCourseIssue('');
    setReportHandoutIssue('');
    setReportFeedback('Inquiry successfully submitted to HOD CS & Academic Directorate.');
    setTimeout(() => {
      setReportFeedback('');
      setIsReportModalOpen(false);
    }, 2000);
  };

  // Timetable days counts
  const getDaySlots = (day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri') => {
    return timetables.filter((t) => t.day_of_week === day);
  };

  return (
    <div className="w-full bg-[#f8fafc] min-h-[calc(100vh-72px)] py-6 sm:py-8 lg:py-10 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      
      {/* Toast Feedback */}
      {downloadFeedback && (
        <div className="fixed bottom-5 right-5 z-50 p-4 bg-blue-900 text-white rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-bottom-2">
          <Download className="w-4 h-4 text-amber-300 animate-bounce" />
          <span>{downloadFeedback}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">

        {/* =========================================================================
            VIEW 1: OVERVIEW / DASHBOARD (CLEAN, BALANCED & ELEGANT SPACING)
            ========================================================================= */}
        {currentTab === 'overview' && (
          <div className="space-y-6">
            
            {/* 1. TOP GRID: STUDENT PROFILE BANNER (8 COLS) + NEXT UPCOMING CLASS (4 COLS) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* LEFT: STUDENT WELCOME HERO BANNER (8 Cols) */}
              <div className="lg:col-span-8 bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-5">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
                    <span className="text-[11px] sm:text-xs font-black tracking-wider text-amber-700 uppercase flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-amber-600" />
                      <span>Student Portal · UCMS Khanewal</span>
                    </span>
                    <span className="text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-200/60 w-fit">
                      Semester 6 · BSCS Regular Morning
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

                    {/* Student Avatar */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-amber-500 overflow-hidden bg-white shrink-0 shadow-xs hidden sm:block">
                      <img
                        src={user.avatar_url || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80'}
                        alt={user.full_name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h1 className="font-serif-collegiate text-xl sm:text-2xl lg:text-3xl font-black text-blue-950 tracking-tight leading-tight">
                        Welcome back, {user.full_name}
                      </h1>
                      <p className="text-xs text-slate-600 font-medium mt-0.5">
                        Department of Computer Science · University College of Management and Sciences
                      </p>
                      <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                        Campus ID: {user.roll_number || 'UCMS-BSCS-2022-041'} · Regular Session
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4 Metric Cards Strip: ROLL NO, SESSION, DEPARTMENT, SEMESTER */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-3 border-t border-slate-100">
                  <div className="p-2.5 sm:p-3 bg-[#f8fafc] rounded-2xl border border-slate-200 text-center min-h-[76px] flex flex-col justify-center">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">
                      ROLL NO
                    </span>
                    <span className="text-xs sm:text-sm font-mono font-black text-blue-950 block">
                      {user.roll_number || 'UCMS-BSCS-2022-041'}
                    </span>
                  </div>

                  <div className="p-2.5 sm:p-3 bg-[#f8fafc] rounded-2xl border border-slate-200 text-center min-h-[76px] flex flex-col justify-center">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">
                      SESSION
                    </span>
                    <span className="text-xs sm:text-sm font-black text-slate-900 block">
                      {user.session || 'Spring 2025'}
                    </span>
                  </div>

                  <div className="p-2.5 sm:p-3 bg-[#f8fafc] rounded-2xl border border-slate-200 text-center min-h-[76px] flex flex-col justify-center">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">
                      DEPARTMENT
                    </span>
                    <span className="text-xs sm:text-sm font-black text-blue-950 block leading-tight break-words">
                      Computer Science
                    </span>
                  </div>

                  <div className="p-2.5 sm:p-3 bg-[#f8fafc] rounded-2xl border border-slate-200 text-center min-h-[76px] flex flex-col justify-center">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">
                      SEMESTER
                    </span>
                    <span className="text-xs sm:text-sm font-black text-slate-900 block leading-tight">
                      6th Semester (BSCS)
                    </span>
                  </div>
                </div>
              </div>

              {/* RIGHT: NEXT UPCOMING CLASS TODAY (4 Cols) */}
              <div className="lg:col-span-4 bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <span className="self-start px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5 shadow-2xs">
                      <Clock className="w-3 h-3 text-amber-700 animate-spin shrink-0" />
                      <span>UPCOMING CLASS TODAY</span>
                    </span>
                    <span className="self-start sm:self-auto text-[11px] font-mono font-bold text-amber-800 bg-amber-50 sm:bg-transparent px-2 sm:px-0 py-0.5 rounded border sm:border-0 border-amber-200">
                      {slotStatusLabel} {timeRemaining}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-blue-100 text-blue-950 border border-blue-200">
                        {activeOrNextSlot?.course_code || 'CS-401'}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400 font-mono">
                        {activeOrNextSlot?.timeslot || '10:30 AM - 12:00 PM'}
                      </span>
                    </div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                      {activeOrNextSlot?.course_title || 'Design & Analysis of Algorithms'}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      Instructor: <strong className="text-slate-800">{activeOrNextSlot?.faculty_name || 'Prof. Muhammad Tariq'}</strong>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">ROOM NO</span>
                      <span className="text-xs font-black text-blue-950 font-mono">
                        {activeOrNextSlot?.room || 'CS Lab 3'}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">SECTION</span>
                      <span className="text-xs font-black text-blue-950 font-mono">
                        {activeOrNextSlot?.section || 'BSCS-6A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-slate-500">
                    Format: {activeOrNextSlot?.session_type || 'Theory Lecture'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const targetCode = activeOrNextSlot?.course_code || 'CS-401';
                      const targetCourse = enrolledCourses.find((c) => c.code === targetCode) || enrolledCourses[0];
                      if (targetCourse) setRepositoryCourse(targetCourse);
                    }}
                    className="text-xs font-bold text-blue-900 hover:text-blue-950 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Course Handouts</span>
                    <span>→</span>
                  </button>
                </div>
              </div>

            </div>

            {/* 2. ENROLLED COURSES 4-COLUMN GRID (PARITY WITH FACULTY ASSIGNED COURSES ON LAPTOPS) */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    Enrolled Courses (Spring 2025)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Core degree modules · Tap "Access Repository" to view syllabus, lecture slides, lab manuals and notes
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => switchTab('courses')}
                  className="text-xs font-bold text-blue-900 hover:underline cursor-pointer self-start sm:self-auto"
                >
                  View All Modules →
                </button>
              </div>

              {/* 4 Cards Grid on Laptop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {enrolledCourses.slice(0, 4).map((c) => {
                  const courseHandoutsCount = handouts.filter(h => h.course_code === c.code || h.course_id === c.id).length || 4;
                  return (
                    <div
                      key={c.id}
                      className="p-5 rounded-2xl border border-slate-200 bg-[#f8fafc] hover:bg-slate-50 transition-all flex flex-col justify-between space-y-3.5"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-blue-100 text-blue-950 border border-blue-200">
                            {c.code}
                          </span>
                          <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            {c.credit_display || '3(3-0)'}
                          </span>
                        </div>

                        <h3 className="text-sm font-black text-slate-900 leading-snug line-clamp-1">
                          {c.title}
                        </h3>

                        <p className="text-xs text-slate-600 font-medium">
                          Teacher: <strong className="text-slate-800">{c.allocated_teacher_name || 'Faculty Member'}</strong>
                        </p>
                      </div>

                      <div className="space-y-2.5 pt-2 border-t border-slate-200/80 text-[11px]">
                        <div className="flex items-center justify-between text-slate-600">
                          <span>Handouts: <strong>{courseHandoutsCount} Files</strong></span>
                          <span className="font-mono text-amber-900 font-semibold">{c.room || 'CS Block'}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setRepositoryCourse(c)}
                          className="w-full py-2 px-3 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer text-center"
                        >
                          Access Repository →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. TODAY'S CLASS SCHEDULE (REDESIGNED FOR PRESTIGIOUS COLLEGIATE ELEGANCE) */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-blue-900" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                      Today's Class Schedule
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium">
                      Monday Lecture Schedule · 3 Contact Lectures Scheduled for Semester 6
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-900 border border-amber-200">
                    Spring 2025 · Week 7 Active
                  </span>
                  <button
                    type="button"
                    onClick={() => switchTab('timetable')}
                    className="text-xs font-bold text-blue-900 hover:underline cursor-pointer"
                  >
                    Full Week Timetable →
                  </button>
                </div>
              </div>

              {/* Lecture Cards List */}
              <div className="space-y-3.5">
                {/* Class 1: CS-403 */}
                <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-[#f8fafc] hover:bg-slate-50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1 min-w-0">
                    {/* Time Capsule: Light Sky Blue #dbeafe */}
                    <div className="p-2.5 sm:p-3 rounded-xl bg-white border border-slate-200 sm:w-48 shrink-0 flex sm:flex-col items-center sm:items-start justify-between sm:justify-center gap-1.5 shadow-2xs">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#dbeafe] text-blue-950 border border-blue-200 font-mono text-xs sm:text-sm font-black shadow-2xs">
                        <Clock className="w-3.5 h-3.5 text-blue-800 shrink-0" />
                        <span>08:30 AM - 10:00 AM</span>
                      </div>
                      <span className="text-xs font-semibold text-slate-500">
                        Theory Lecture
                      </span>
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-[#0f2744] text-white shadow-2xs tracking-wider">
                          CS-403
                        </span>
                        <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                          Database Administration & High Availability
                        </h3>
                      </div>
                      <p className="text-xs text-slate-600 flex flex-wrap items-center gap-2 font-medium">
                        <span>Instructor: <strong className="text-slate-800">Engr. Bilal Raza</strong></span>
                        <span className="text-slate-300">•</span>
                        <span>Credit Hours: <strong>3(3-0)</strong></span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 self-stretch sm:self-center border-t sm:border-t-0 border-slate-200/60 pt-2.5 sm:pt-0">
                    <span className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#fef3c6] text-amber-950 border border-amber-300 flex items-center gap-1.5 shadow-2xs">
                      <MapPin className="w-3.5 h-3.5 text-amber-700" />
                      <span>Lecture Hall 2</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const targetCourse = enrolledCourses.find((c) => c.code === 'CS-403') || enrolledCourses[0];
                        setRepositoryCourse(targetCourse);
                      }}
                      className="px-3.5 py-1.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                      <span>Handouts</span>
                    </button>
                  </div>
                </div>

                {/* Class 2: CS-401 (NEXT UP - 11:30 AM to 01:30 PM in CS Lab 1) */}
                <div className="p-4 sm:p-5 rounded-2xl border-2 border-blue-900 bg-blue-50/25 shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1 min-w-0">
                    {/* Time Capsule: Light Sky Blue #dbeafe */}
                    <div className="p-2.5 sm:p-3 rounded-xl bg-white border border-blue-200 sm:w-48 shrink-0 flex sm:flex-col items-center sm:items-start justify-between sm:justify-center gap-1.5 shadow-2xs">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#dbeafe] text-blue-950 border border-blue-300 font-mono text-xs sm:text-sm font-black shadow-2xs">
                        <Clock className="w-3.5 h-3.5 text-blue-800 shrink-0" />
                        <span>11:30 AM - 01:30 PM</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-500">
                          Lab Practical
                        </span>
                        <span className="px-1.5 py-0.5 text-[9px] font-black rounded uppercase tracking-wider bg-amber-400 text-blue-950 shadow-2xs">
                          NEXT UP
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-[#0f2744] text-white shadow-2xs tracking-wider">
                          CS-401
                        </span>
                        <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                          Design & Analysis of Algorithms Lab
                        </h3>
                      </div>
                      <p className="text-xs text-slate-600 flex flex-wrap items-center gap-2 font-medium">
                        <span>Instructor: <strong className="text-slate-800 font-bold">Prof. Muhammad Tariq</strong></span>
                        <span className="text-slate-300">•</span>
                        <span>Section: <strong>BSCS-6A</strong></span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 self-stretch sm:self-center border-t sm:border-t-0 border-slate-200/60 pt-2.5 sm:pt-0">
                    <span className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#fef3c6] text-amber-950 border border-amber-300 flex items-center gap-1.5 shadow-2xs">
                      <MapPin className="w-3.5 h-3.5 text-amber-700" />
                      <span>CS Lab 1</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const targetCourse = enrolledCourses.find((c) => c.code === 'CS-401') || enrolledCourses[0];
                        setRepositoryCourse(targetCourse);
                      }}
                      className="px-3.5 py-1.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                      <span>Handouts</span>
                    </button>
                  </div>
                </div>

                {/* Class 3: CS-405 */}
                <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-[#f8fafc] hover:bg-slate-50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1 min-w-0">
                    {/* Time Capsule: Light Sky Blue #dbeafe */}
                    <div className="p-2.5 sm:p-3 rounded-xl bg-white border border-slate-200 sm:w-48 shrink-0 flex sm:flex-col items-center sm:items-start justify-between sm:justify-center gap-1.5 shadow-2xs">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#dbeafe] text-blue-950 border border-blue-200 font-mono text-xs sm:text-sm font-black shadow-2xs">
                        <Clock className="w-3.5 h-3.5 text-blue-800 shrink-0" />
                        <span>01:45 PM - 03:15 PM</span>
                      </div>
                      <span className="text-xs font-semibold text-slate-500">
                        Theory Lecture
                      </span>
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-[#0f2744] text-white shadow-2xs tracking-wider">
                          CS-405
                        </span>
                        <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                          Software Engineering & Agile Frameworks
                        </h3>
                      </div>
                      <p className="text-xs text-slate-600 flex flex-wrap items-center gap-2 font-medium">
                        <span>Instructor: <strong className="text-slate-800">Dr. Nadia Parveen</strong></span>
                        <span className="text-slate-300">•</span>
                        <span>Credit Hours: <strong>3(3-0)</strong></span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 self-stretch sm:self-center border-t sm:border-t-0 border-slate-200/60 pt-2.5 sm:pt-0">
                    <span className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#fef3c6] text-amber-950 border border-amber-300 flex items-center gap-1.5 shadow-2xs">
                      <MapPin className="w-3.5 h-3.5 text-amber-700" />
                      <span>Lecture Hall 2</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const targetCourse = enrolledCourses.find((c) => c.code === 'CS-405') || enrolledCourses[0];
                        setRepositoryCourse(targetCourse);
                      }}
                      className="px-3.5 py-1.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                      <span>Handouts</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Links */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() => switchTab('timetable')}
                  className="w-full sm:w-auto px-5 py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>See Whole Timetable →</span>
                </button>

                <button
                  type="button"
                  onClick={() => switchTab('courses')}
                  className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <BookOpen className="w-4 h-4 text-blue-900" />
                  <span>My Enrolled Courses →</span>
                </button>
              </div>
            </div>

            {/* 3. UPCOMING QUIZZES & ASSIGNMENTS (OFFICIAL DEADLINES & EXAM SCHEDULE) */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                        Upcoming Quizzes & Course Assessments
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-900 border border-amber-200">
                        {localAssessments.filter(a => !getDeadlineInfo(a.deadline_date, a.deadline_time).isExpired).length} Active Deadlines
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      Official submission cutoffs & scheduled quiz dates assigned by course instructors
                    </p>
                  </div>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  {(
                    [
                      { key: 'active', label: `Active Deadlines (${localAssessments.filter(a => !getDeadlineInfo(a.deadline_date, a.deadline_time).isExpired).length})` },
                      { key: 'all', label: `All (${localAssessments.length})` },
                      { key: 'quizzes', label: 'Quizzes' },
                      { key: 'assignments', label: 'Assignments' },
                      { key: 'passed', label: `Passed (${localAssessments.filter(a => getDeadlineInfo(a.deadline_date, a.deadline_time).isExpired).length})` },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setAssessmentFilter(f.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                        assessmentFilter === f.key
                          ? 'bg-blue-900 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assessment Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {localAssessments
                  .filter((a) => {
                    const info = getDeadlineInfo(a.deadline_date, a.deadline_time);
                    if (assessmentFilter === 'active') return !info.isExpired;
                    if (assessmentFilter === 'passed') return info.isExpired;
                    if (assessmentFilter === 'assignments') return a.type === 'Assignment';
                    if (assessmentFilter === 'quizzes') return a.type === 'Quiz';
                    return true;
                  })
                  .map((item) => {
                    const deadlineInfo = getDeadlineInfo(item.deadline_date, item.deadline_time);

                    return (
                      <div
                        key={item.id}
                        className="p-5 rounded-2xl border border-slate-200 bg-[#f8fafc] hover:bg-white hover:shadow-xs transition-all flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span
                              className={`px-2 py-0.5 text-[10px] font-black rounded uppercase tracking-wider ${
                                item.type === 'Quiz'
                                  ? 'bg-purple-100 text-purple-900 border border-purple-200'
                                  : item.type === 'Assignment'
                                  ? 'bg-blue-100 text-blue-900 border border-blue-200'
                                  : 'bg-amber-100 text-amber-900 border border-amber-200'
                              }`}
                            >
                              {item.type}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10.5px] font-bold border ${deadlineInfo.pillClass}`}>
                              {deadlineInfo.text}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-500">
                            <span className="text-blue-950 font-black">{item.course_code}</span>
                            <span>·</span>
                            <span className="truncate">{item.course_title}</span>
                          </div>

                          <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                            {item.title}
                          </h3>

                          {item.description && (
                            <p className="text-xs text-slate-600 leading-relaxed font-normal line-clamp-3">
                              {item.description}
                            </p>
                          )}

                          {/* Deadline Box */}
                          <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 text-xs">
                            <div className="flex items-center justify-between text-slate-700">
                              <span className="font-semibold flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-blue-900" />
                                Cutoff Deadline:
                              </span>
                              <span className="font-mono font-black text-slate-900">
                                {item.deadline_display}
                              </span>
                            </div>
                            <div className="flex flex-col text-slate-600 text-[11px] pt-1.5 border-t border-slate-100 gap-1">
                              <div>Weightage: <strong className="text-amber-800 font-bold">{item.total_marks} Marks</strong></div>
                              <div>By: <strong className="text-slate-800 font-semibold">{item.teacher_name}</strong></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {localAssessments.filter((a) => {
                const info = getDeadlineInfo(a.deadline_date, a.deadline_time);
                if (assessmentFilter === 'active') return !info.isExpired;
                if (assessmentFilter === 'passed') return info.isExpired;
                if (assessmentFilter === 'assignments') return a.type === 'Assignment';
                if (assessmentFilter === 'quizzes') return a.type === 'Quiz';
                return true;
              }).length === 0 && (
                <div className="p-8 text-center bg-[#f8fafc] rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs space-y-1">
                  <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-600" />
                  <p className="font-bold text-slate-800">No scheduled items under this filter</p>
                  <p className="text-slate-400">All current assessment schedules and quizzes are up to date.</p>
                </div>
              )}
            </div>

            {/* 4. DEPARTMENT UPDATES & NOTICES CENTER (IN OVERVIEW) */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-6 sm:p-8 lg:p-10 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 flex items-center justify-center shrink-0">
                    <Bell className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                      Department Updates & Notices Center
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium">
                      Official circulars & communications from Department of Computer Science
                    </p>
                  </div>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setCircularFilter('all')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                      circularFilter === 'all'
                        ? 'bg-blue-900 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All Announcements ({studentAnnouncements.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCircularFilter('unread')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                      circularFilter === 'unread'
                        ? 'bg-blue-900 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Unread ({unreadCount})
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchCirculars}
                  onChange={(e) => setSearchCirculars(e.target.value)}
                  placeholder="Search circulars..."
                  className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-200 rounded-xl bg-[#f8fafc] focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-900 font-medium"
                />
              </div>

              {/* Announcements List */}
              <div className="space-y-2.5">
                {studentAnnouncements
                  .filter((a) => (circularFilter === 'unread' ? !a.is_read : true))
                  .filter((a) => a.title.toLowerCase().includes(searchCirculars.toLowerCase()))
                  .map((notice) => {
                    const isExpanded = expandedNoticeId === notice.id;
                    return (
                      <div
                        key={notice.id}
                        className={`rounded-xl border transition-all ${
                          isExpanded
                            ? 'bg-white border-blue-900 shadow-xs'
                            : 'bg-[#f8fafc] border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {(() => {
                          const isHodNotice = notice.uploader_role === 'HOD CS' || notice.author.includes('HOD') || notice.author.includes('Tariq');
                          const roleLabel = notice.uploader_role || (isHodNotice ? 'HOD CS' : 'ADMIN');
                          const uploaderDisplayName = notice.uploader_name || (isHodNotice ? 'Dr. Tariq Mahmood (Head of CS)' : 'Central Academic Administration');

                          return (
                            <>
                              <button
                                type="button"
                                onClick={() => handleToggleNotice(notice.id)}
                                className="w-full text-left p-4 sm:p-5 flex flex-col gap-2.5 cursor-pointer transition-colors"
                              >
                                {/* Top Line: Role, [URGENT] badge, Uploader Name, Date */}
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span
                                      className={`px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md border ${
                                        isHodNotice
                                          ? 'bg-amber-100 text-amber-950 border-amber-300'
                                          : 'bg-blue-100 text-blue-950 border-blue-300'
                                      }`}
                                    >
                                      [{roleLabel}]
                                    </span>
                                    {notice.priority === 'urgent' && (
                                      <span className="px-2 py-0.5 text-[9.5px] font-black uppercase tracking-wider rounded border bg-red-50 text-red-700 border-red-200">
                                        [URGENT]
                                      </span>
                                    )}
                                    <span className="text-xs font-bold text-slate-800">
                                      Uploaded by: <strong className="text-slate-900 font-extrabold">{uploaderDisplayName}</strong>
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

                                {/* Middle: Title and Excerpt Preview */}
                                <div>
                                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                                    {notice.title}
                                  </h3>
                                  <p className="text-xs text-slate-500 line-clamp-1 mt-1 font-normal">
                                    {notice.content}
                                  </p>
                                </div>

                                {/* Bottom: Read Notice Action Bar */}
                                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                                  <span className="text-[11px] font-medium text-slate-400">
                                    {isExpanded ? 'Full circular open' : 'Click to expand details'}
                                  </span>
                                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 hover:text-blue-950 bg-blue-50 px-2.5 py-1 rounded-lg">
                                    <span>{isExpanded ? 'Collapse' : 'Read Notice'}</span>
                                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                  </span>
                                </div>
                              </button>

                              {isExpanded && (
                                <div className="px-4 pb-4 pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-3 animate-in fade-in duration-100">
                                  <p className="leading-relaxed font-normal bg-white p-3.5 rounded-xl border border-slate-200 text-slate-700 whitespace-pre-line">
                                    {notice.content}
                                  </p>

                                  {/* Attached Document or Image (if present) */}
                                  <AnnouncementAttachment
                                    attachmentName={notice.attachment_name}
                                    attachmentUrl={notice.attachment_url}
                                    attachmentType={notice.attachment_type}
                                    attachmentSize={notice.attachment_size}
                                  />

                                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-emerald-800 flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Authorized Notice from {uploaderDisplayName} ({roleLabel})
                                      </span>
                                    </div>
                                    <span className="text-slate-400 font-mono">Status: {notice.is_read ? 'Read & Acknowledged' : 'New Circular'}</span>
                                  </div>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* 5. TWO-COLUMN SPLIT: LATEST COURSE HANDOUTS & SAVED BOOKMARKS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT: LATEST COURSE HANDOUTS (8 Cols) */}
              <div className="lg:col-span-8 bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Latest Course Handouts
                    </h2>
                    <p className="text-xs text-slate-500">
                      Newly Uploaded Notes
                    </p>
                  </div>
                  <span className="text-xs font-bold text-blue-900 font-mono">
                    CS-401 & CS-403
                  </span>
                </div>

                {/* 2x2 Grid matching Video */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {handouts.slice(0, 4).map((h) => (
                    <div
                      key={h.id}
                      className="p-4 rounded-xl border border-slate-200 bg-[#f8fafc] hover:bg-slate-50 transition-colors flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                            {h.course_code}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {h.file_size}
                          </span>
                        </div>

                        <h3 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                          {h.title}
                        </h3>

                        <span className="text-[10.5px] text-slate-400 block mt-2">
                          {h.updated_at}
                        </span>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => toggleBookmark('handout', h.id, h.title, h.course_code)}
                          className="text-slate-400 hover:text-amber-600 transition-colors cursor-pointer"
                          title="Bookmark Handout"
                        >
                          {isItemBookmarked('handout', h.id) ? (
                            <BookmarkCheck className="w-4 h-4 text-amber-600 fill-amber-600" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDownload(h.file_name, h.title)}
                          className="px-3 py-1.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT: SAVED BOOKMARKS & REPORT (4 Cols) */}
              <div className="lg:col-span-4 space-y-5">
                
                {/* Bookmarks Card */}
                <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                        <Bookmark className="w-4 h-4 fill-amber-600" />
                      </div>
                      <div>
                        <h2 className="text-sm font-black text-slate-900 leading-tight">
                          Saved Bookmarks
                        </h2>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Pinned learning materials & lecture references
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-50 text-amber-900 border border-amber-200 shrink-0">
                      {bookmarks.length} Pinned
                    </span>
                  </div>

                  {bookmarks.length === 0 ? (
                    <div className="py-6 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-1.5">
                      <Bookmark className="w-5 h-5 mx-auto text-slate-300" />
                      <p className="font-semibold text-slate-700">No bookmarks saved yet</p>
                      <p className="text-[11px] text-slate-400">Click the bookmark icon on any course or handout to pin it here.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {bookmarks.slice(0, 4).map((b) => (
                        <div
                          key={b.id}
                          className="p-3 rounded-xl border border-slate-200 bg-[#f8fafc] hover:bg-slate-50 hover:border-slate-300 transition-all flex items-start justify-between gap-3 group"
                        >
                          <div
                            onClick={() => switchTab('bookmarks')}
                            className="min-w-0 flex-1 cursor-pointer space-y-1"
                          >
                            <div className="flex flex-wrap items-center gap-1.5">
                              {b.course_code && (
                                <span className="font-mono text-[10px] font-black px-1.5 py-0.5 rounded bg-blue-100 text-blue-950 border border-blue-200">
                                  {b.course_code}
                                </span>
                              )}
                              <span className="text-[9.5px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-950 border border-amber-200">
                                {b.item_type}
                              </span>
                              {b.file_size && (
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {b.file_size}
                                </span>
                              )}
                            </div>
                            <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-900 transition-colors">
                              {b.title}
                            </h4>
                            {b.subtitle && (
                              <p className="text-[10.5px] text-slate-500 line-clamp-1">
                                {b.subtitle}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-1 shrink-0 mt-0.5">
                            <button
                              type="button"
                              onClick={() => switchTab('bookmarks')}
                              className="w-7 h-7 rounded-lg text-slate-400 hover:text-blue-900 hover:bg-blue-50 flex items-center justify-center transition-colors cursor-pointer"
                              title="Open in bookmarks"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => switchTab('bookmarks')}
                    className="w-full py-2.5 px-3 text-center text-xs font-bold text-blue-950 bg-slate-100 hover:bg-blue-50 hover:text-blue-900 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Manage All {bookmarks.length} Pinned Items</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Report a Problem Card */}
                <div className="bg-amber-50/40 rounded-2xl sm:rounded-3xl border border-amber-200 p-5 sm:p-6 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                      <AlertCircle className="w-4 h-4 text-amber-700" />
                      <span>Report a Problem</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-900">
                      {quotaRemaining} / 3 Left
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed font-normal">
                    Missing handout or timetable conflict? Rate limited to max 3 reports per week.
                  </p>

                  <button
                    type="button"
                    onClick={() => setIsReportModalOpen(true)}
                    className="w-full py-2.5 px-3 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Academic Inquiry ({quotaRemaining} Remaining)</span>
                  </button>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* =========================================================================
            VIEW 2: UPDATE CENTER (MATCHING VIDEO EXACTLY)
            ========================================================================= */}
        {currentTab === 'updates' && (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Bell className="w-5 h-5 text-amber-600" />
                  <h1 className="font-serif-collegiate text-xl sm:text-2xl font-black text-blue-950">
                    Department Updates & Notices Center
                  </h1>
                </div>
                <p className="text-xs text-slate-500">
                  Official announcements from Department of Computer Science, UCMS Khanewal
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setCircularFilter('all')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                    circularFilter === 'all'
                      ? 'bg-blue-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All Announcements ({studentAnnouncements.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCircularFilter('unread')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                    circularFilter === 'unread'
                      ? 'bg-blue-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Unread ({unreadCount})
                </button>
                <button
                  type="button"
                  onClick={() => setCircularFilter('inquiries')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                    circularFilter === 'inquiries'
                      ? 'bg-blue-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  My Inquiries & Responses ({studentReports.length})
                </button>
              </div>
            </div>

            {/* Inquiries View or Announcements View */}
            {circularFilter === 'inquiries' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-600">
                    Track status of your submitted academic inquiries and faculty resolutions
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsReportModalOpen(true)}
                    className="px-3.5 py-1.5 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-300" />
                    <span>New Inquiry</span>
                  </button>
                </div>

                {studentReports.length === 0 ? (
                  <div className="p-8 text-center bg-[#f8fafc] rounded-2xl border border-slate-200 text-slate-500 text-xs">
                    You have not filed any academic inquiries this session.
                  </div>
                ) : (
                  studentReports.map((report) => (
                    <div
                      key={report.id}
                      className="p-5 rounded-2xl border border-slate-200 bg-[#f8fafc] hover:bg-white transition-all space-y-3 shadow-2xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                              report.category === 'Timetable Issue'
                                ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                                : 'bg-amber-100 text-amber-900 border border-amber-200'
                            }`}
                          >
                            {report.category}
                          </span>
                          {report.course_code && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-900 border border-blue-200 font-mono">
                              {report.course_code}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-400 font-mono">
                            {report.created_at}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              report.status === 'Resolved'
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : report.status === 'Dismissed'
                                ? 'bg-slate-200 text-slate-800 border border-slate-300'
                                : 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                            }`}
                          >
                            {report.status}
                          </span>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{report.subject}</h3>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed font-normal">
                          {report.description}
                        </p>
                      </div>

                      {(report.slot_info || report.handout_title) && (
                        <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-600 flex flex-wrap items-center gap-2">
                          <span className="font-bold text-slate-800">Target Resource:</span>
                          <span className="font-mono text-slate-700">
                            {report.slot_info || report.handout_title}
                          </span>
                        </div>
                      )}

                      {/* Prominent Teacher / Faculty Response Box */}
                      {report.resolution_note && (
                        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl space-y-1">
                          <div className="flex items-center gap-1.5 text-xs font-black text-emerald-900 uppercase tracking-wider">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Official Faculty / Teacher Response:</span>
                          </div>
                          <p className="text-xs font-semibold text-emerald-950 pl-5.5 leading-relaxed">
                            {report.resolution_note}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            ) : (
              <>
                {/* Search Input */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchCirculars}
                    onChange={(e) => setSearchCirculars(e.target.value)}
                    placeholder="Search circulars by keyword..."
                    className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-200 rounded-xl bg-[#f8fafc] focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-900 font-medium"
                  />
                </div>

                {/* Full Announcements Accordion */}
                <div className="space-y-3">
                  {studentAnnouncements
                    .filter((a) => (circularFilter === 'unread' ? !a.is_read : true))
                .filter((a) => a.title.toLowerCase().includes(searchCirculars.toLowerCase()))
                .map((notice) => {
                  const isExpanded = expandedNoticeId === notice.id;
                  return (
                    <div
                      key={notice.id}
                      className={`rounded-2xl border transition-all ${
                        isExpanded
                          ? 'bg-white border-blue-900 shadow-xs'
                          : 'bg-[#f8fafc] border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {(() => {
                        const isHodNotice = notice.uploader_role === 'HOD CS' || notice.author.includes('HOD') || notice.author.includes('Tariq');
                        const roleLabel = notice.uploader_role || (isHodNotice ? 'HOD CS' : 'ADMIN');
                        const uploaderDisplayName = notice.uploader_name || (isHodNotice ? 'Dr. Tariq Mahmood (Head of CS)' : 'Central Academic Administration');

                        return (
                          <button
                            type="button"
                            onClick={() => handleToggleNotice(notice.id)}
                            className="w-full text-left p-4 sm:p-5 flex flex-col gap-2.5 cursor-pointer transition-colors"
                          >
                            {/* Top Line: Role, [URGENT] badge, Uploader Name, Date */}
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md border ${
                                    isHodNotice
                                      ? 'bg-amber-100 text-amber-950 border-amber-300'
                                      : 'bg-blue-100 text-blue-950 border-blue-300'
                                  }`}
                                >
                                  [{roleLabel}]
                                </span>
                                {notice.priority === 'urgent' && (
                                  <span className="px-2 py-0.5 text-[9.5px] font-black uppercase tracking-wider rounded border bg-red-50 text-red-700 border-red-200">
                                    [URGENT]
                                  </span>
                                )}
                                <span className="text-xs font-bold text-slate-800">
                                  Uploaded by: <strong className="text-slate-900 font-extrabold">{uploaderDisplayName}</strong>
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

                            {/* Middle: Title and Excerpt Preview */}
                            <div>
                              <h3 className="text-sm font-bold text-slate-900 leading-snug">
                                {notice.title}
                              </h3>
                              <p className="text-xs text-slate-500 line-clamp-1 mt-1 font-normal">
                                {notice.content}
                              </p>
                            </div>

                            {/* Bottom: Read Notice Action Bar */}
                            <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                              <span className="text-[11px] font-medium text-slate-400">
                                {isExpanded ? 'Full circular open' : 'Click to expand details'}
                              </span>
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 hover:text-blue-950 bg-blue-50 px-2.5 py-1 rounded-lg">
                                <span>{isExpanded ? 'Collapse' : 'Read Notice'}</span>
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </span>
                            </div>
                          </button>
                        );
                      })()}

                      {isExpanded && (
                        <div className="px-5 pb-5 pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-3.5 animate-in fade-in duration-100">
                          <p className="leading-relaxed font-normal bg-white p-3.5 rounded-xl border border-slate-100">
                            {notice.content}
                          </p>

                          {/* Attached Document or Image (if present) */}
                          <AnnouncementAttachment
                            attachmentName={notice.attachment_name}
                            attachmentUrl={notice.attachment_url}
                            attachmentType={notice.attachment_type}
                            attachmentSize={notice.attachment_size}
                          />

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-slate-400 pt-1">
                            <span>Status: {notice.is_read ? 'Marked as Reviewed' : 'Unread'}</span>
                            <span className="text-emerald-700 font-semibold">✓ Verified Institutional Circular Dispatch</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

        {/* =========================================================================
            VIEW 3: ENROLLED COURSES (MATCHING VIDEO EXACTLY)
            ========================================================================= */}
        {currentTab === 'courses' && (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <h1 className="font-serif-collegiate text-xl sm:text-2xl font-black text-blue-950">
                    Enrolled Courses
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-100 text-blue-900 border border-blue-200">
                    {enrolledCourses.length} Modules
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Department of Computer Science · Click any module to access its lecture repository
                </p>
              </div>
            </div>

            {/* Search Courses */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchCourses}
                onChange={(e) => setSearchCourses(e.target.value)}
                placeholder="Search enrolled courses..."
                className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-200 rounded-xl bg-[#f8fafc] focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-900 font-medium"
              />
            </div>

            {/* Course Cards List matching Video */}
            <div className="space-y-4">
              {enrolledCourses
                .filter(
                  (c) =>
                    c.title.toLowerCase().includes(searchCourses.toLowerCase()) ||
                    c.code.toLowerCase().includes(searchCourses.toLowerCase())
                )
                .map((course) => {
                  const isBookmarked = isItemBookmarked('course', course.id);
                  return (
                    <div
                      key={course.id}
                      className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-[#f8fafc] hover:bg-slate-50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-2">
                        {/* Meta strip */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-blue-100 text-blue-950 border border-blue-200">
                            {course.code}
                          </span>
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                            {course.credit_display || '3(3-0)'}
                          </span>
                          <span className="text-xs font-semibold text-slate-500">
                            {course.section || 'BSCS-VI Morning'}
                          </span>
                          <span>·</span>
                          <span className="text-xs font-medium text-slate-600 font-mono">
                            {course.schedule_display || 'Mon & Wed · 10:30 AM - 12:00 PM'}
                          </span>
                        </div>

                        {/* Title */}
                        <h2 className="text-base sm:text-lg font-black text-slate-900">
                          {course.title}
                        </h2>

                        {/* Instructor & Room */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                          <span>Teacher: <strong className="text-slate-800">{course.allocated_teacher_name || 'Department Faculty'}</strong></span>
                          <span>·</span>
                          <span className="text-amber-800 font-semibold">{course.room || 'CS Block - Lab 3'}</span>
                        </div>
                      </div>

                      {/* Right Action Buttons */}
                      <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 w-full md:w-auto pt-2.5 md:pt-0 border-t md:border-t-0 border-slate-200/70">
                        <button
                          type="button"
                          onClick={() => toggleBookmark('course', course.id, course.title, course.allocated_teacher_name || '')}
                          className="p-2.5 text-slate-400 hover:text-amber-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer border border-slate-200 bg-white"
                          title="Bookmark Course"
                        >
                          {isBookmarked ? (
                            <BookmarkCheck className="w-4 h-4 text-amber-600 fill-amber-600" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setRepositoryCourse(course)}
                          className="flex-1 md:flex-none px-4 py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <BookOpen className="w-4 h-4 text-amber-400" />
                          <span>Academic Repository</span>
                          <span className="px-1.5 py-0.5 rounded-full bg-blue-800 text-[10px] font-mono">
                            {course.materials_count || 3}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
        )}

        {/* =========================================================================
            VIEW 4: TIMETABLE (PROFESSIONAL UNIVERSITY SCHEDULE)
            ========================================================================= */}
        {currentTab === 'timetable' && (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center shrink-0 border border-blue-200">
                    <Calendar className="w-5 h-5 text-blue-900" />
                  </div>
                  <div>
                    <h1 className="font-serif-collegiate text-xl sm:text-2xl font-black text-blue-950">
                      Class Timetable
                    </h1>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    Spring 2025
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Department of Computer Science · BSCS-VI Regular Morning · UCMS Khanewal
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
              {(
                [
                  { key: 'Mon', label: 'Monday' },
                  { key: 'Tue', label: 'Tuesday' },
                  { key: 'Wed', label: 'Wednesday' },
                  { key: 'Thu', label: 'Thursday' },
                  { key: 'Fri', label: 'Friday' },
                ] as const
              ).map((d) => {
                const count = getDaySlots(d.key).length;
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
              {(
                [
                  { key: 'Mon', label: 'Monday' },
                  { key: 'Tue', label: 'Tuesday' },
                  { key: 'Wed', label: 'Wednesday' },
                  { key: 'Thu', label: 'Thursday' },
                  { key: 'Fri', label: 'Friday' },
                ] as const
              ).map((d) => {
                const count = getDaySlots(d.key).length;
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
                    <span className="text-sm font-extrabold block">
                      {d.label}
                    </span>
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

            {/* Day Schedule Cards */}
            <div className="space-y-3.5">
              {getDaySlots(selectedDay).map((slot) => {
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
                      <div className="p-2.5 sm:p-3 rounded-xl bg-white border border-slate-200 sm:w-48 shrink-0 flex sm:flex-col items-center sm:items-start justify-between sm:justify-center gap-1.5 shadow-2xs">
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
                          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                            {slot.course_title}
                          </h3>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-medium">
                          <span>Instructor: <strong className="text-slate-800">{slot.faculty_name}</strong></span>
                          <span className="text-slate-300">•</span>
                          <span>Section: <strong className="text-slate-700">BSCS-6A Morning</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Room & Handouts - Yellow/golden #fef3c6 for location, and Access Repository style (bg-blue-900) for Handouts */}
                    <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 border-t md:border-t-0 border-slate-200/80 pt-3 md:pt-0">
                      <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#fef3c6] text-amber-950 border border-amber-300 shadow-2xs">
                        <MapPin className="w-3.5 h-3.5 text-amber-700" />
                        <span>{slot.room}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const targetCourse = enrolledCourses.find((c) => c.code === slot.course_code) || enrolledCourses[0];
                          setRepositoryCourse(targetCourse);
                        }}
                        className="px-3.5 py-1.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                        <span>Handouts</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            VIEW 5: BOOKMARKS (MATCHING VIDEO EXACTLY)
            ========================================================================= */}
        {currentTab === 'bookmarks' && (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Bookmark className="w-5 h-5 text-amber-600" />
                  <h1 className="font-serif-collegiate text-xl sm:text-2xl font-black text-blue-950">
                    Saved Bookmarks
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-50 text-amber-900 border border-amber-200">
                    {bookmarks.length} Pinned
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Pinned courses, academic handouts, and custom study references
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsPinModalOpen(true)}
                className="px-4 py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto"
              >
                <span>+ Pin Study Reference</span>
              </button>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {(
                [
                  { key: 'all', label: `All Items (${bookmarks.length})` },
                  { key: 'courses', label: `Pinned Courses (${bookmarks.filter((b) => b.item_type === 'course').length})` },
                  { key: 'handouts', label: `Saved Handouts (${bookmarks.filter((b) => b.item_type === 'handout').length})` },
                  { key: 'notes', label: `Study Notes (${bookmarks.filter((b) => b.item_type === 'note').length})` },
                ] as const
              ).map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setBookmarkFilter(f.key)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    bookmarkFilter === f.key
                      ? 'bg-blue-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* PINNED COURSES */}
            {(bookmarkFilter === 'all' || bookmarkFilter === 'courses') && (
              <div className="space-y-3 pt-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 block">
                  PINNED COURSES
                </span>
                <div className="space-y-3">
                  {bookmarks
                    .filter((b) => b.item_type === 'course')
                    .map((item) => (
                      <div
                        key={item.id}
                        className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-[#f8fafc] hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
                      >
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-blue-100 text-blue-950 border border-blue-200">
                              {item.course_code || 'CS-401'}
                            </span>
                            <h3 className="text-sm font-bold text-slate-900 leading-snug">
                              {item.title}
                            </h3>
                          </div>
                          <p className="text-xs text-slate-500 font-medium">
                            {item.subtitle}
                          </p>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 w-full sm:w-auto shrink-0">
                          <button
                            type="button"
                            onClick={() => toggleBookmark('course', item.target_id || item.id, item.title)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Unpin Course"
                          >
                            <BookmarkCheck className="w-4 h-4 text-amber-600 fill-amber-600" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const c = enrolledCourses.find((x) => x.code === item.course_code) || enrolledCourses[0];
                              setRepositoryCourse(c);
                            }}
                            className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                            <span>Open Repository →</span>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* SAVED HANDOUTS */}
            {(bookmarkFilter === 'all' || bookmarkFilter === 'handouts') && (
              <div className="space-y-3 pt-5 border-t border-slate-200/80">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 block">
                  SAVED HANDOUTS
                </span>
                <div className="space-y-3">
                  {bookmarks
                    .filter((b) => b.item_type === 'handout')
                    .map((item) => (
                      <div
                        key={item.id}
                        className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-[#f8fafc] hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
                      >
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                              {item.course_code || 'CS-401'}
                            </span>
                            <span className="text-xs text-slate-500 font-medium">{item.subtitle}</span>
                          </div>
                          <h3 className="text-sm font-bold text-slate-900 leading-snug">
                            {item.title}
                          </h3>
                          <span className="text-[11px] text-slate-400 block font-mono">
                            {item.file_size || '2.8 MB'} · {item.meta_info}
                          </span>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 w-full sm:w-auto shrink-0">
                          <button
                            type="button"
                            onClick={() => toggleBookmark('handout', item.target_id || item.id, item.title)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Unpin Handout"
                          >
                            <BookmarkCheck className="w-4 h-4 text-amber-600 fill-amber-600" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownload('handout.pdf', item.title)}
                            className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download PDF</span>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* STUDY NOTES */}
            {(bookmarkFilter === 'all' || bookmarkFilter === 'notes') && (
              <div className="space-y-3 pt-5 border-t border-slate-200/80">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 block">
                  STUDY NOTES & REFERENCES
                </span>
                <div className="space-y-3">
                  {bookmarks
                    .filter((b) => b.item_type === 'note')
                    .map((item) => (
                      <div
                        key={item.id}
                        className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-[#f8fafc] hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <h3 className="text-sm font-bold text-slate-900 leading-snug">
                            {item.title}
                          </h3>
                          <p className="text-xs text-slate-500 font-medium">
                            {item.subtitle}
                          </p>
                          <span className="text-[11px] text-slate-400 font-mono block mt-1">
                            {item.meta_info}
                          </span>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 w-full sm:w-auto shrink-0">
                          <button
                            type="button"
                            onClick={() => toggleBookmark('note', item.target_id || item.id, item.title)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Unpin Note"
                          >
                            <BookmarkCheck className="w-4 h-4 text-amber-600 fill-amber-600" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownload('note.pdf', item.title)}
                            className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 rounded-xl border border-slate-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download Notes</span>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* =========================================================================
          MODAL: ACADEMIC REPOSITORY (MATCHING VIDEO AT 00:25-00:28)
          ========================================================================= */}
      {repositoryCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-200 bg-[#f8fafc] flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200">
                    {repositoryCourse.code}
                  </span>
                  <h2 className="text-base sm:text-lg font-black text-blue-950">
                    {repositoryCourse.title}
                  </h2>
                </div>
                <p className="text-xs text-slate-500">
                  Academic Repository & Lecture Handouts · Instructor: {repositoryCourse.allocated_teacher_name || 'Prof. Muhammad Tariq'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setRepositoryCourse(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Room Banner */}
            <div className="px-5 sm:px-6 py-2.5 bg-blue-50/50 border-b border-blue-100 flex items-center justify-between text-xs">
              <span className="font-extrabold text-blue-900">
                COURSE MATERIALS & HANDOUTS ({handouts.filter((h) => h.course_code === repositoryCourse.code || h.course_id === repositoryCourse.id).length || 3})
              </span>
              <span className="text-slate-600">
                Room: <strong className="text-slate-800">{repositoryCourse.room || 'CS Block - Lab 3'}</strong>
              </span>
            </div>

            {/* Handouts List */}
            <div className="p-5 sm:p-6 space-y-3 max-h-[calc(75vh-150px)] overflow-y-auto">
              {(
                handouts.filter((h) => h.course_code === repositoryCourse.code || h.course_id === repositoryCourse.id).length > 0
                  ? handouts.filter((h) => h.course_code === repositoryCourse.code || h.course_id === repositoryCourse.id)
                  : handouts.slice(0, 3)
              ).map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-200 bg-[#f8fafc] hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center shrink-0 mt-0.5">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 uppercase">
                          {item.category || 'SLIDES'}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Week {item.week_number} · {item.updated_at}
                        </span>
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                        {item.title}
                      </h3>
                      <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
                        File Size: {item.file_size}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => toggleBookmark('handout', item.id, item.title, repositoryCourse.code)}
                      className="p-2 text-slate-400 hover:text-amber-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                      title="Bookmark Handout"
                    >
                      {isItemBookmarked('handout', item.id) ? (
                        <BookmarkCheck className="w-4 h-4 text-amber-600 fill-amber-600" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownload(item.file_name, item.title)}
                      className="px-3.5 py-1.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-[#f8fafc] flex justify-end">
              <button
                type="button"
                onClick={() => setRepositoryCourse(null)}
                className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 border border-slate-300 rounded-xl transition-colors cursor-pointer"
              >
                Close Repository
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: SUBMIT ACADEMIC INQUIRY (RATE LIMITED 3/WEEK)
          ========================================================================= */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            
            <div className="p-5 sm:p-6 border-b border-slate-200 bg-[#f8fafc] flex items-start justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Submit Academic Inquiry
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct submission to Department HOD & Central Academic Administration
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="p-5 sm:p-6 space-y-4">
              {reportFeedback && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
                  {reportFeedback}
                </div>
              )}

              {/* Category: Strictly 2 Options (Timetable Issue or Handout Issue) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Inquiry Category *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReportCategory('Timetable Issue')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      reportCategory === 'Timetable Issue'
                        ? 'border-blue-900 bg-blue-50/80 text-blue-950 ring-2 ring-blue-900/20'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    📅 Timetable Issue
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportCategory('Handout Issue')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      reportCategory === 'Handout Issue'
                        ? 'border-blue-900 bg-blue-50/80 text-blue-950 ring-2 ring-blue-900/20'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    📄 Handout Issue
                  </button>
                </div>
              </div>

              {/* Detailed slot selector for Timetable Issue */}
              {reportCategory === 'Timetable Issue' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Which Slot has a Problem? *
                  </label>
                  <select
                    value={reportSlotIssue}
                    onChange={(e) => setReportSlotIssue(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-900 font-medium bg-white"
                    required
                  >
                    <option value="">-- Select affected lecture slot --</option>
                    {timetables.map((t) => (
                      <option key={t.id} value={`${t.day_of_week} | ${t.course_code}: ${t.course_title} (${t.timeslot} - ${t.room})`}>
                        {t.day_of_week} · {t.course_code}: {t.course_title} ({t.timeslot} - {t.room} · {t.faculty_name})
                      </option>
                    ))}
                    <option value="General Timetable Conflict / Unscheduled Slot">General Timetable Conflict / Unscheduled Slot</option>
                  </select>
                </div>
              )}

              {/* Course & Handout selectors for Handout Issue */}
              {reportCategory === 'Handout Issue' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Which Subject / Course has a Handout Problem? *
                    </label>
                    <select
                      value={reportCourseIssue}
                      onChange={(e) => {
                        setReportCourseIssue(e.target.value);
                        setReportHandoutIssue('');
                      }}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-900 font-medium bg-white"
                      required
                    >
                      <option value="">-- Select Course --</option>
                      {enrolledCourses.map((c) => (
                        <option key={c.id} value={c.code}>
                          {c.code}: {c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Which Specific Handout / PDF? *
                    </label>
                    <select
                      value={reportHandoutIssue}
                      onChange={(e) => setReportHandoutIssue(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-900 font-medium bg-white"
                      required
                    >
                      <option value="">-- Select Specific PDF / Handout --</option>
                      {handouts
                        .filter((h) => !reportCourseIssue || h.course_code === reportCourseIssue)
                        .map((h) => (
                          <option key={h.id} value={`${h.title} (Week ${h.week_number}) - ${h.file_name}`}>
                            {h.course_code}: {h.title} (Week {h.week_number}) - {h.file_name}
                          </option>
                        ))}
                      <option value="Missing Handout / Upload Not Found on Portal">Missing Handout / Upload Not Found on Portal</option>
                      <option value="Corrupted File / Incomplete PDF Pages">Corrupted File / Incomplete PDF Pages</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Inquiry Subject *
                </label>
                <input
                  type="text"
                  value={reportSubject}
                  onChange={(e) => setReportSubject(e.target.value)}
                  placeholder="e.g. Typo in slide 14 or Time clash on Tuesday slot"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-900 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Inquiry Details *
                </label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  rows={4}
                  placeholder="Provide precise details regarding your academic concern..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-900 font-medium"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  Quota Remaining: {quotaRemaining} / 3
                </span>
                <button
                  type="submit"
                  disabled={quotaRemaining <= 0}
                  className="px-5 py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  Submit Inquiry
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: PIN STUDY REFERENCE
          ========================================================================= */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            
            <div className="p-5 border-b border-slate-200 bg-[#f8fafc] flex items-start justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Pin Study Reference
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Add custom research links, formulas, or lecture bookmarks
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPinModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPin} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Item Type
                </label>
                <select
                  value={pinType}
                  onChange={(e) => setPinType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-900 font-medium bg-white"
                >
                  <option value="note">Study Note / Quick Summary</option>
                  <option value="course">Course Module</option>
                  <option value="handout">Academic Handout</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={pinTitle}
                  onChange={(e) => setPinTitle(e.target.value)}
                  placeholder="e.g. Master Theorem Asymptotic Formulas"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-900 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subtitle / Subject Note
                </label>
                <input
                  type="text"
                  value={pinSubtitle}
                  onChange={(e) => setPinSubtitle(e.target.value)}
                  placeholder="e.g. CS-401 Quick Reference"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-900 font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Save to Bookmarks
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
