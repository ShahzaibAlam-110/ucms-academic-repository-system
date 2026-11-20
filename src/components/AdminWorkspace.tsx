import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Users,
  Settings,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Award,
  Search,
  Filter,
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  Radio,
  FileText,
  Copy,
  Check,
  Printer,
  Plus,
  Send,
  Building,
  KeyRound,
  Key,
  Pencil,
  Download,
  ChevronDown,
  X,
  Camera,
  Layers,
  ChevronRight,
  UserPlus,
  Globe,
  ExternalLink,
  RefreshCw,
  BarChart3,
  BookOpen,
  Building2,
  Sparkles,
  Save,
  Eye,
  EyeOff,
  HelpCircle,
  Bell,
} from 'lucide-react';
import { User, Department, CmsSettings, AuditLog, TimetableSlot, Course, Announcement, StudentReport } from '../data/mockDatabase';
import { usePKTClock, formatPKTDateTimeString } from '../utils/timeUtils';

interface AdminWorkspaceProps {
  user: User;
  users: User[];
  departments: Department[];
  cms: CmsSettings;
  auditLogs: AuditLog[];
  timetables?: TimetableSlot[];
  courses?: Course[];
  reports?: StudentReport[];
  onPromoteCohort: (departmentId: number, semester: number, actionType: 'promote' | 'graduate') => void;
  onUpgradeSingleStudent: (studentId: number) => void;
  onUpdateCms: (settings: CmsSettings) => void;
  onAddTimetable?: (slot: Omit<TimetableSlot, 'id'>) => { success: boolean; conflictMessage?: string };
  onUpdateTimetable?: (slot: TimetableSlot) => { success: boolean; conflictMessage?: string };
  onAddAnnouncement?: (announcement: Omit<Announcement, 'id' | 'created_at'>) => void;
  onUpdateUserStatus?: (userId: number, status: 'active' | 'suspended' | 'graduated') => void;
  onRegisterUser?: (newUser: User) => void;
  onAdminChangePassword?: (userId: number, newPassword: string) => void;
  onResolveReport?: (reportId: number, status?: 'Resolved' | 'Dismissed', resolutionNote?: string) => void;
  onOpenProfileModal?: () => void;
  onLogout?: () => void;
  activeTab?: 'users' | 'timetable' | 'notices' | 'cms' | 'audit' | string;
  onSelectTab?: (tab: 'users' | 'timetable' | 'notices' | 'cms' | 'audit') => void;
}

export const AdminWorkspace: React.FC<AdminWorkspaceProps> = ({
  user,
  users: propUsers,
  departments,
  cms,
  auditLogs,
  timetables = [],
  courses = [],
  reports = [],
  onPromoteCohort,
  onUpgradeSingleStudent,
  onUpdateCms,
  onAddTimetable,
  onUpdateTimetable,
  onAddAnnouncement,
  onUpdateUserStatus,
  onRegisterUser,
  onAdminChangePassword,
  onResolveReport,
  onOpenProfileModal,
  onLogout,
  activeTab: controlledTab,
  onSelectTab,
}) => {
  // Live PKT (UTC+05:00) Clock applied to system calculations (hidden from display per user request)
  const { dateStr } = usePKTClock();

  // Exactly 5 Main Administration Tabs matching user request: Users, Timetable, Notices & Inquiries, Website CMS, Audit Trail
  const [internalTab, setInternalTab] = useState<'users' | 'timetable' | 'notices' | 'cms' | 'audit'>('users');
  const activeTab = (controlledTab as any) ?? internalTab;
  const setActiveTab = (tab: 'users' | 'timetable' | 'notices' | 'cms' | 'audit') => {
    if (onSelectTab) onSelectTab(tab);
    setInternalTab(tab);
  };

  // Subtabs inside Notices & Inquiries Hub
  const [noticesSubtab, setNoticesSubtab] = useState<'inquiries' | 'broadcasts'>('inquiries');

  // Subview inside Users Directory: 'roster' (default) | 'cohort' | 'departments'
  const [userViewMode, setUserViewMode] = useState<'roster' | 'cohort' | 'departments'>('roster');

  // Internal user state for lifecycle status and temp keys
  const [localUsers, setLocalUsers] = useState<User[]>(propUsers);
  useEffect(() => {
    setLocalUsers(propUsers);
  }, [propUsers]);

  // Password visibility tracking per user
  const [visiblePasswordUserIds, setVisiblePasswordUserIds] = useState<number[]>([]);
  const togglePasswordVisibility = (userId: number) => {
    setVisiblePasswordUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  // Admin Change Password Modal
  const [passwordTargetUser, setPasswordTargetUser] = useState<User | null>(null);
  const [adminNewPassword, setAdminNewPassword] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState('');

  // Admin Inquiries Desk State
  const [adminInquiryActionReport, setAdminInquiryActionReport] = useState<StudentReport | null>(null);
  const [adminInquiryDecision, setAdminInquiryDecision] = useState<'Resolved' | 'Dismissed'>('Resolved');
  const [adminInquiryNote, setAdminInquiryNote] = useState('');
  const [inquiryCategoryFilter, setInquiryCategoryFilter] = useState<'all' | 'Timetable Issue' | 'Handout Issue'>('all');
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState<'all' | 'pending' | 'resolved'>('all');

  const [copiedKeyUserId, setCopiedKeyUserId] = useState<number | null>(null);

  // Tab 1: Users Directory Filters
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [deptFilter, setDeptFilter] = useState<number>(0);
  const [studentSemesterFilter, setStudentSemesterFilter] = useState<number>(0);
  const [lifecycleStatusFilter, setLifecycleStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isRegisterUserModalOpen, setIsRegisterUserModalOpen] = useState(false);
  const [editUserModal, setEditUserModal] = useState<User | null>(null);
  const [keyResetFeedback, setKeyResetFeedback] = useState<string>('');

  const [newUserForm, setNewUserForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    username: '',
    password: 'password123',
    role: 'student' as 'student' | 'teacher' | 'hod' | 'admin',
    department_id: 1,
    semester: 1,
    roll_number: '',
    designation: 'Student',
    qualification: '',
  });

  // Tab 2: Cohort Semester Promotion Engine State
  const [selectedCohortDept, setSelectedCohortDept] = useState<number>(1);
  const [selectedCohortSem, setSelectedCohortSem] = useState<number>(7);
  const [cohortSuccessMessage, setCohortSuccessMessage] = useState<string>('');

  // Tab 3: Timetable Oversight Filters & Clash Resolution
  const [timetableDay, setTimetableDay] = useState<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri'>('Mon');
  const [timetableDeptFilter, setTimetableDeptFilter] = useState<number>(0);
  const [clashResolved, setClashResolved] = useState<boolean>(false);

  // Tab 4: Public Website CMS State
  const [cmsForm, setCmsForm] = useState<CmsSettings>({ ...cms });
  const [cmsSavedFeedback, setCmsSavedFeedback] = useState<string>('');
  const [activeCmsModule, setActiveCmsModule] = useState<'metrics' | 'admissions' | 'catalog' | 'contact' | 'marquee' | 'background'>('metrics');

  // Tab 5: Broadcast Notices State
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastContent, setBroadcastContent] = useState('');
  const [broadcastAudience, setBroadcastAudience] = useState<'all' | 'students' | 'teachers'>('all');
  const [broadcastPriority, setBroadcastPriority] = useState<'normal' | 'urgent'>('normal');
  const [broadcastSuccess, setBroadcastSuccess] = useState('');
  const [broadcastHistory, setBroadcastHistory] = useState<Announcement[]>([
    {
      id: 801,
      title: 'Spring 2025 Midterm Examination Schedule & Central Date Sheet Notification',
      content: 'All academic departments and enrolled students are notified that Midterm Examinations for Spring 2025 will commence from Monday, 12th May 2025 across all university blocks. Entry into examination halls requires verified institutional ID cards.',
      audience: 'all',
      priority: 'urgent',
      author: 'Chief Registrar Office',
      uploader_role: 'ADMIN',
      uploader_name: 'Registrar Admin',
      created_at: 'Spring 2025 · PKT',
    },
    {
      id: 802,
      title: 'Digital Portal Key Re-Authentication Notice for Graduating Batches',
      content: 'Graduating students of Semester 8 are advised to verify their final degree transcripts and clearance certificates through the online student credentials center.',
      audience: 'students',
      priority: 'normal',
      author: 'Chief Registrar Office',
      uploader_role: 'ADMIN',
      uploader_name: 'Registrar Admin',
      created_at: 'Spring 2025 · PKT',
    },
  ]);

  // Tab 5: Audit Filter & Search State
  const [auditFilter, setAuditFilter] = useState<string>('all');
  const [auditSearchQuery, setAuditSearchQuery] = useState<string>('');

  const adminAvatar =
    user.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80';

  // Canonical temporary portal key matching admin_25.jpg & user prompt
  const PORTAL_TEMP_KEY = 'Ucms@2026!';
  const ROLE_RANK: Record<string, number> = {
    hod: 1,
    teacher: 2,
    student: 3,
    admin: 4,
  };

  const handleCopyKey = (u: User) => {
    navigator.clipboard?.writeText(PORTAL_TEMP_KEY);
    setCopiedKeyUserId(u.id);
    setTimeout(() => setCopiedKeyUserId(null), 2000);
  };

  const handleResetKey = (u: User) => {
    handleCopyKey(u);
    setKeyResetFeedback(`Temporary portal key for ${u.full_name} is active: ${PORTAL_TEMP_KEY} (Copied to clipboard)`);
    setTimeout(() => setKeyResetFeedback(''), 4000);
  };

  const handleExportCsv = () => {
    const headers = ['ID', 'Full Name', 'Role', 'Department', 'Roll / Emp Number', 'Email', 'Semester', 'Status', 'Temporary Key'];
    const rows = filteredUsers.map((u) => [
      u.id,
      `"${u.full_name}"`,
      u.role,
      `"${u.department_name || 'Central Administration'}"`,
      `"${u.roll_number || u.institutional_id || ''}"`,
      u.email,
      u.semester || '',
      u.status || 'active',
      PORTAL_TEMP_KEY,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ucms_user_directory_${dateStr.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRegisterNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    const dept = departments.find((d) => d.id === newUserForm.department_id);
    const newId = Date.now();
    const isStudent = newUserForm.role === 'student';
    const isHod = newUserForm.role === 'hod';
    const isTeacher = newUserForm.role === 'teacher';

    const createdUser: User = {
      id: newId,
      full_name: newUserForm.full_name,
      email: newUserForm.email,
      phone: newUserForm.phone || '+92 300 0000000',
      password: newUserForm.password || 'password123',
      username: newUserForm.username || newUserForm.email.split('@')[0],
      role: newUserForm.role,
      department_id: newUserForm.department_id,
      department_name: dept?.name || 'Department of Computer Science',
      status: 'active',
      semester: isStudent ? Number(newUserForm.semester) : undefined,
      roll_number: isStudent
        ? (newUserForm.roll_number || `UCMS-${dept?.code || 'CS'}-2024-${Math.floor(100 + Math.random() * 900)}`)
        : undefined,
      institutional_id: !isStudent
        ? (newUserForm.roll_number || `UCMS-${newUserForm.role.toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`)
        : undefined,
      designation: isStudent
        ? 'Student'
        : (newUserForm.designation || (isHod ? 'Head of Department' : isTeacher ? 'Assistant Professor' : 'Administrative Officer')),
      qualification: newUserForm.qualification || (isHod ? 'Ph.D.' : isTeacher ? 'M.S.' : undefined),
      has_changed_password: false,
      avatar_url: isStudent
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    };

    setLocalUsers((prev) => [createdUser, ...prev]);
    if (onRegisterUser) {
      onRegisterUser(createdUser);
    }
    setIsRegisterUserModalOpen(false);
    setNewUserForm({
      full_name: '',
      email: '',
      phone: '',
      username: '',
      password: 'password123',
      role: 'student',
      department_id: 1,
      semester: 1,
      roll_number: '',
      designation: 'Student',
      qualification: '',
    });
    setKeyResetFeedback(`Successfully registered new user: ${createdUser.full_name} (${createdUser.role.toUpperCase()})`);
    setTimeout(() => setKeyResetFeedback(''), 4000);
  };

  const handleAdminPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordTargetUser) return;
    if (adminNewPassword.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }
    setLocalUsers((prev) =>
      prev.map((u) => (u.id === passwordTargetUser.id ? { ...u, password: adminNewPassword, has_changed_password: true } : u))
    );
    if (onAdminChangePassword) {
      onAdminChangePassword(passwordTargetUser.id, adminNewPassword);
    }
    setPasswordChangeSuccess(`Password successfully updated for ${passwordTargetUser.full_name}.`);
    setTimeout(() => {
      setPasswordChangeSuccess('');
      setPasswordTargetUser(null);
      setAdminNewPassword('');
    }, 1500);
  };

  const handleAdminInquiryActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminInquiryActionReport) return;
    const finalNote = adminInquiryNote.trim() || (adminInquiryDecision === 'Resolved' ? 'Resolved: Administrative directive executed.' : 'Reviewed: Central Academic Directorate confirmed valid.');
    if (onResolveReport) {
      onResolveReport(adminInquiryActionReport.id, adminInquiryDecision, finalNote);
    }
    setAdminInquiryActionReport(null);
    setKeyResetFeedback(`Inquiry status updated to ${adminInquiryDecision} with directive transmitted.`);
    setTimeout(() => setKeyResetFeedback(''), 3500);
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUserModal) return;
    const dept = departments.find((d) => d.id === editUserModal.department_id);
    setLocalUsers((prev) =>
      prev.map((u) => (u.id === editUserModal.id ? { ...editUserModal, department_name: dept?.name || u.department_name } : u))
    );
    setEditUserModal(null);
    setKeyResetFeedback(`User profile successfully updated for ${editUserModal.full_name}`);
    setTimeout(() => setKeyResetFeedback(''), 4000);
  };

  const getStudentBatch = (u: User) => {
    if (u.role !== 'student') {
      const code = departments.find((d) => d.id === u.department_id)?.code || 'ADMIN';
      return `${code} · Faculty Staff`;
    }
    const sem = u.semester || 1;
    const deptCode = departments.find((d) => d.id === u.department_id)?.code || 'CS';
    const startYear = 2025 - Math.ceil(sem / 2);
    const endYear = startYear + 4;
    return `${deptCode} · ${startYear}–${endYear}`;
  };

  const getStageBadge = (u: User) => {
    if (u.role === 'student') return `Sem ${u.semester || 1}`;
    if (u.role === 'hod') return 'HOD Chair';
    if (u.role === 'teacher') return 'Faculty Staff';
    return 'Super Admin';
  };

  const handleStatusChange = (userId: number, newStatus: 'active' | 'suspended' | 'graduated') => {
    setLocalUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
    );
    if (onUpdateUserStatus) {
      onUpdateUserStatus(userId, newStatus);
    }
  };

  // Matching students in selected cohort for promotion engine
  const matchingCohortStudents = localUsers.filter(
    (u) =>
      u.role === 'student' &&
      u.department_id === selectedCohortDept &&
      u.semester === selectedCohortSem &&
      u.status === 'active'
  );

  const handlePromoteAction = (actionType: 'promote' | 'graduate') => {
    if (matchingCohortStudents.length === 0) {
      alert('No active students currently enrolled in this department and semester.');
      return;
    }

    const confirmText =
      actionType === 'graduate'
        ? `Confer degrees and graduate all ${matchingCohortStudents.length} students of Semester 8 into the UCMS Alumni Registry?`
        : `Batch advance all ${matchingCohortStudents.length} students from Semester ${selectedCohortSem} to Semester ${selectedCohortSem + 1}?`;

    if (!window.confirm(confirmText)) return;

    onPromoteCohort(selectedCohortDept, selectedCohortSem, actionType);

    setLocalUsers((prev) =>
      prev.map((u) => {
        if (
          u.role === 'student' &&
          u.department_id === selectedCohortDept &&
          u.semester === selectedCohortSem &&
          u.status === 'active'
        ) {
          if (actionType === 'graduate') {
            return { ...u, status: 'graduated' };
          } else {
            return { ...u, semester: (u.semester || 1) + 1 };
          }
        }
        return u;
      })
    );

    setCohortSuccessMessage(
      actionType === 'graduate'
        ? `Successfully conferred degrees on ${matchingCohortStudents.length} graduating scholars into the Alumni Registry.`
        : `Successfully promoted cohort of ${matchingCohortStudents.length} students from Semester ${selectedCohortSem} to Semester ${selectedCohortSem + 1}.`
    );
    setTimeout(() => setCohortSuccessMessage(''), 5000);
  };

  // Filtered & Strictly Ordered Users (HOD at top, then Faculty, then Students)
  const filteredUsers = localUsers
    .filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (deptFilter > 0 && u.department_id !== deptFilter) return false;
      if (lifecycleStatusFilter !== 'all' && (u.status || 'active') !== lifecycleStatusFilter) return false;
      if (studentSemesterFilter > 0) {
        if (u.role === 'student' && u.semester !== studentSemesterFilter) return false;
        if (u.role !== 'student') return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = u.full_name.toLowerCase().includes(q);
        const matchUser = (u.username || '').toLowerCase().includes(q);
        const matchRoll = (u.roll_number || '').toLowerCase().includes(q);
        const matchInst = (u.institutional_id || '').toLowerCase().includes(q);
        const matchEmail = u.email.toLowerCase().includes(q);
        const matchDept = (u.department_name || '').toLowerCase().includes(q);
        const matchDesig = (u.designation || '').toLowerCase().includes(q);
        if (!matchName && !matchUser && !matchRoll && !matchInst && !matchEmail && !matchDept && !matchDesig) return false;
      }
      return true;
    })
    .sort((a, b) => {
      const rankA = ROLE_RANK[a.role] ?? 99;
      const rankB = ROLE_RANK[b.role] ?? 99;
      if (rankA !== rankB) return rankA - rankB;
      if (a.role === 'student' && b.role === 'student') {
        return (b.semester || 0) - (a.semester || 0) || a.full_name.localeCompare(b.full_name);
      }
      return a.full_name.localeCompare(b.full_name);
    });

  // Filtered Security Audit Logs
  const filteredAuditLogs = auditLogs.filter((log) => {
    if (auditFilter !== 'all' && log.action !== auditFilter) return false;
    if (auditSearchQuery.trim()) {
      const q = auditSearchQuery.toLowerCase();
      const matchAction = log.action.toLowerCase().includes(q);
      const matchActor = (log.user_name || '').toLowerCase().includes(q);
      const matchDetails = (log.details || '').toLowerCase().includes(q);
      const matchIp = (log.ip_address || '').toLowerCase().includes(q);
      if (!matchAction && !matchActor && !matchDetails && !matchIp) return false;
    }
    return true;
  });

  // Filtered Timetable Slots
  const filteredTimetableSlots = timetables.filter((s) => {
    if (s.day_of_week !== timetableDay) return false;
    if (timetableDeptFilter > 0) {
      const crs = courses.find((c) => c.code === s.course_code);
      if (crs && crs.department_id !== timetableDeptFilter) return false;
    }
    return true;
  });

  const handleCmsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCms(cmsForm);
    setCmsSavedFeedback('Public website CMS settings updated and broadcasted live.');
    setTimeout(() => setCmsSavedFeedback(''), 4000);
  };

  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastContent.trim()) return;

    const newBroadcast: Announcement = {
      id: Date.now(),
      title: broadcastTitle,
      content: broadcastContent,
      audience: broadcastAudience,
      priority: broadcastPriority,
      author: 'Chief Registrar & Central Administration',
      uploader_role: 'ADMIN',
      uploader_name: 'Registrar Admin',
      created_at: formatPKTDateTimeString(),
      is_read: false,
    };

    setBroadcastHistory((prev) => [newBroadcast, ...prev]);
    if (onAddAnnouncement) {
      onAddAnnouncement({
        title: broadcastTitle,
        content: broadcastContent,
        audience: broadcastAudience,
        priority: broadcastPriority,
        author: 'Chief Registrar & Central Administration',
        uploader_role: 'ADMIN',
        uploader_name: 'Registrar Admin',
      });
    }

    setBroadcastTitle('');
    setBroadcastContent('');
    setBroadcastSuccess('Campus-wide institutional notice broadcasted across public and authenticated portals.');
    setTimeout(() => setBroadcastSuccess(''), 4500);
  };

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

        {/* 1. EXECUTIVE CONSOLE BANNER (MATCHING ADMIN VIDEO WITH AVATAR) */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 border-l-4 border-l-[#800020] p-5 sm:p-7 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="flex items-start sm:items-center gap-4">
              <button
                type="button"
                onClick={() => onOpenProfileModal && onOpenProfileModal()}
                className="relative shrink-0 cursor-pointer group"
                title="View Official Admin Profile Details"
              >
                <img
                  src={adminAvatar}
                  alt="Admin Portrait"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[#800020] shadow-sm group-hover:scale-105 transition-transform"
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-purple-600 border-2 border-white flex items-center justify-center">
                  <ShieldCheck className="w-3 h-3 text-white" />
                </div>
              </button>

              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-red-50 text-[#800020] border border-red-200">
                    CHIEF REGISTRAR & INSTITUTIONAL GOVERNANCE
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 font-mono">
                    Principal Registry & Executive Secretariat
                  </span>
                </div>

                <h1 className="font-serif-collegiate text-xl sm:text-2xl lg:text-3xl font-black text-blue-950 tracking-tight">
                  Welcome back, {user.full_name || 'Registrar Admin'}
                </h1>

                {/* Status Metadata Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-semibold">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-900 border border-purple-200 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
                    Super Admin Authorized
                  </span>
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    Active Session: Spring 2025
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 font-bold">
                    Central Academic Registry
                  </span>
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-mono">
                    ID: {user.institutional_id || 'UCMS-ADM-001'}
                  </span>
                </div>
              </div>
            </div>

            {/* Admin Profile Button & Date */}
            <div className="flex flex-wrap lg:flex-col items-start lg:items-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => onOpenProfileModal && onOpenProfileModal()}
                className="flex items-center gap-2.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 text-left transition-colors cursor-pointer group shadow-2xs"
              >
                <div className="w-8 h-8 rounded-full border border-amber-600 overflow-hidden bg-white shrink-0">
                  <img src={adminAvatar} alt="Admin Portrait" className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="text-xs font-black text-slate-900 group-hover:text-blue-900 block leading-tight">
                    {user.full_name || 'Registrar Admin'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">
                    Official Admin Profile
                  </span>
                </div>
              </button>

              <div className="text-right text-[11px] font-bold text-slate-400">
                {dateStr} · Asia/Karachi PKT
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            TAB 1: USERS DIRECTORY (EXACT MATCHING ADMIN_25.JPG & ADMIN_30.JPG)
            ========================================================================= */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
            {/* Top Action Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-blue-600 block mb-0.5">
                  CAMPUS IDENTITY REGISTRY & ACCESS GOVERNANCE
                </span>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  User Management Directory
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Hierarchical directory of students, faculty instructors, department chairs, and administrators with drill-down filters and discrete status controls.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-2xs transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-slate-500" />
                  <span>Export CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsRegisterUserModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-amber-300" />
                  <span>Register New User</span>
                </button>
              </div>
            </div>

            {/* Notification / Feedback Banner */}
            {keyResetFeedback && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center justify-between gap-2 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{keyResetFeedback}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setKeyResetFeedback('')}
                  className="text-emerald-700 hover:text-emerald-900 text-xs cursor-pointer font-bold"
                >
                  ✕
                </button>
              </div>
            )}

            {/* View Mode Switcher: Users Roster | Academic Cohort Promotion | Department Overview */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#f8fafc] p-2 sm:p-2.5 rounded-2xl border border-slate-200">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setUserViewMode('roster')}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    userViewMode === 'roster'
                      ? 'bg-blue-900 text-white shadow-xs font-black'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Users Directory ({localUsers.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUserViewMode('cohort')}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    userViewMode === 'cohort'
                      ? 'bg-blue-900 text-white shadow-xs font-black'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Cohort Semester Promotion Engine</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUserViewMode('departments')}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    userViewMode === 'departments'
                      ? 'bg-blue-900 text-white shadow-xs font-black'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Building className="w-3.5 h-3.5 text-blue-600" />
                  <span>Department Overview ({departments.length})</span>
                </button>
              </div>
              <span className="text-[11px] font-bold text-slate-400 font-mono hidden md:inline">
                Access & Academic Life-Cycle
              </span>
            </div>

            {/* VIEW MODE 1: USERS DIRECTORY ROSTER */}
            {userViewMode === 'roster' && (
              <>
            {/* Filter Box: Dual Row Matching admin_25.jpg */}
            <div className="bg-[#f8fafc] border border-slate-200 rounded-2xl p-3 sm:p-4 space-y-3">
              {/* Row 1: Search Input & Role Pills */}
              <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search across Name, Roll Number, Email, or Department..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-blue-900 font-medium text-slate-800"
                  />
                </div>

                {/* Role Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                  {[
                    { id: 'all', label: 'All Accounts', count: localUsers.length },
                    { id: 'hod', label: 'Department HODs', count: localUsers.filter((u) => u.role === 'hod').length },
                    { id: 'teacher', label: 'Faculty / Teachers', count: localUsers.filter((u) => u.role === 'teacher').length },
                    { id: 'student', label: 'Students', count: localUsers.filter((u) => u.role === 'student').length },
                    { id: 'admin', label: 'Administrators', count: localUsers.filter((u) => u.role === 'admin').length },
                  ].map((r) => {
                    const isSelected = roleFilter === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setRoleFilter(r.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                          isSelected
                            ? 'bg-blue-900 text-white font-black shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span>{r.label}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                            isSelected ? 'bg-blue-950 text-amber-300' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {r.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 2: Department, Available Semesters (Active Odd Intake), and Status */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2.5 border-t border-slate-200/60">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 flex-1 max-w-3xl">
                  {/* Department Filter (7 UCMS Departments) */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 bg-white p-2 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Building className="w-3.5 h-3.5 text-blue-900" />
                      <span className="text-xs font-bold text-slate-700">Department:</span>
                    </div>
                    <select
                      value={deptFilter}
                      onChange={(e) => setDeptFilter(Number(e.target.value))}
                      className="w-full px-2 py-1 text-xs border-0 bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer truncate"
                    >
                      <option value={0}>All Academic Departments</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Available Semesters (Semesters 1 through 8) */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 bg-white p-2 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-1.5 shrink-0">
                      <GraduationCap className="w-3.5 h-3.5 text-blue-900" />
                      <span className="text-xs font-bold text-slate-700">Semester:</span>
                    </div>
                    <select
                      value={studentSemesterFilter}
                      onChange={(e) => setStudentSemesterFilter(Number(e.target.value))}
                      className="w-full px-2 py-1 text-xs border-0 bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer truncate"
                    >
                      <option value={0}>All Semesters (1 - 8)</option>
                      <option value={1}>Semester 1</option>
                      <option value={2}>Semester 2</option>
                      <option value={3}>Semester 3</option>
                      <option value={4}>Semester 4</option>
                      <option value={5}>Semester 5</option>
                      <option value={6}>Semester 6</option>
                      <option value={7}>Semester 7</option>
                      <option value={8}>Semester 8 (Graduating Class)</option>
                    </select>
                  </div>
                </div>

                {/* Status Segmented Buttons */}
                <div className="flex items-center gap-1 shrink-0 pt-1 lg:pt-0">
                  <span className="text-xs font-bold text-slate-600 mr-1">Status:</span>
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'active', label: 'Active' },
                    { id: 'suspended', label: 'Inactive' },
                    { id: 'graduated', label: 'Graduated' },
                  ].map((s) => {
                    const isSelected = lifecycleStatusFilter === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setLifecycleStatusFilter(s.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 text-white font-black'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Active Filter Result Summary & Registry Tagline */}
            <div className="flex items-center justify-between text-xs px-1">
              <div className="font-extrabold text-slate-900">
                Active Filter Result: <span className="text-blue-900">{filteredUsers.length} matching accounts</span>
              </div>
              <div className="font-bold text-[11px] text-slate-400 tracking-wider uppercase">
                UCMS Khanewal Registry
              </div>
            </div>

            {/* Desktop Table View (Hidden on mobile/tablet screens < 768px, matching user request) */}
            <div className="hidden md:block border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">USER & NAME</th>
                      <th className="py-3 px-4">ROLL / EMP NUMBER</th>
                      <th className="py-3 px-4">ROLE & STAGE</th>
                      <th className="py-3 px-4">DEPARTMENT & BATCH</th>
                      <th className="py-3 px-4">USERNAME & PASSWORD</th>
                      <th className="py-3 px-4">LIFECYCLE STATUS</th>
                      <th className="py-3 px-4 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
                          No user records found matching the active search or filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const isCopied = copiedKeyUserId === u.id;
                        const isStudent = u.role === 'student';
                        const isHod = u.role === 'hod';
                        const isTeacher = u.role === 'teacher';

                        return (
                          <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                            {/* USER & NAME */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full border border-slate-200 overflow-hidden bg-slate-100 shrink-0">
                                  <img
                                    src={
                                      u.avatar_url ||
                                      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80'
                                    }
                                    alt={u.full_name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <div className="font-extrabold text-slate-900 truncate">
                                    {u.full_name}
                                  </div>
                                  <div className="text-[11px] text-slate-400 font-mono truncate">
                                    {u.email}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* ROLL / EMP NUMBER */}
                            <td className="py-3 px-4">
                              <span className="font-mono font-bold text-slate-800 text-xs">
                                {u.roll_number || u.institutional_id || 'UCMS-STAFF'}
                              </span>
                            </td>

                            {/* ROLE & STAGE */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                                    isHod
                                      ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                      : isTeacher
                                      ? 'bg-blue-100 text-blue-900 border border-blue-200'
                                      : isStudent
                                      ? 'bg-sky-100 text-sky-800 border border-sky-200'
                                      : 'bg-purple-100 text-purple-900 border border-purple-200'
                                  }`}
                                >
                                  {isTeacher ? 'TEACHER' : u.role.toUpperCase()}
                                </span>
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200">
                                  {getStageBadge(u)}
                                </span>
                              </div>
                            </td>

                            {/* DEPARTMENT & BATCH */}
                            <td className="py-3 px-4">
                              <div className="space-y-0.5">
                                <div className="font-bold text-slate-800 text-xs">
                                  {getStudentBatch(u)}
                                </div>
                                <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                                  {u.department_name || 'Central Administration'}
                                </div>
                              </div>
                            </td>

                            {/* USERNAME & PASSWORD */}
                            <td className="py-3 px-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-800">
                                  <span className="text-slate-400 text-[10px] font-sans font-semibold">User:</span>
                                  <span className="text-blue-950 font-mono">{u.username || u.email.split('@')[0]}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-slate-400 text-[10px] font-sans font-semibold">Pass:</span>
                                  <span className="font-mono text-xs text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                    {visiblePasswordUserIds.includes(u.id) ? (u.password || 'password123') : '••••••••'}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility(u.id)}
                                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                                    title={visiblePasswordUserIds.includes(u.id) ? "Hide Password" : "Show Password"}
                                  >
                                    {visiblePasswordUserIds.includes(u.id) ? (
                                      <EyeOff className="w-3.5 h-3.5 text-blue-900" />
                                    ) : (
                                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            </td>

                            {/* LIFECYCLE STATUS */}
                            <td className="py-3 px-4">
                              <div className="relative inline-block">
                                <select
                                  value={u.status || 'active'}
                                  onChange={(e) => handleStatusChange(u.id, e.target.value as any)}
                                  className={`appearance-none pl-3 pr-8 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                                    u.status === 'suspended'
                                      ? 'bg-rose-50 text-rose-800 border-rose-300'
                                      : u.status === 'graduated'
                                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                                      : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  }`}
                                >
                                  <option value="active">● Active</option>
                                  <option value="suspended">● Inactive</option>
                                  <option value="graduated">● Graduated</option>
                                </select>
                                <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                              </div>
                            </td>

                            {/* ACTIONS */}
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {isStudent && (u.status === 'active' || !u.status) && (
                                  <button
                                    type="button"
                                    onClick={() => onUpgradeSingleStudent(u.id)}
                                    className="px-2 py-1 text-[11px] font-black text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                                    title="Advance student by +1 semester"
                                  >
                                    +1 Sem
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setEditUserModal(u)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-blue-900 hover:bg-slate-100 transition-colors cursor-pointer"
                                  title="Edit User Profile"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setPasswordTargetUser(u)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
                                  title="Change Password"
                                >
                                  <Key className="w-3.5 h-3.5 text-amber-600" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleResetKey(u)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
                                  title="Copy Temporary Portal Key"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile / Tablet Cards View (Clean User-by-User Cards without awkward horizontal scrolling) */}
            <div className="block md:hidden space-y-3">
              {filteredUsers.length === 0 ? (
                <div className="p-8 text-center bg-[#f8fafc] rounded-2xl border border-slate-200 text-slate-400 text-xs">
                  No user records found matching the active search or filter criteria.
                </div>
              ) : (
                filteredUsers.map((u) => {
                  const isCopied = copiedKeyUserId === u.id;
                  const isStudent = u.role === 'student';
                  const isHod = u.role === 'hod';
                  const isTeacher = u.role === 'teacher';

                  return (
                    <div
                      key={u.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:border-slate-300 transition-all space-y-3"
                    >
                      {/* Top Bar: Avatar, Full Name, Email, and Role Badge */}
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full border border-slate-200 overflow-hidden bg-slate-100 shrink-0">
                            <img
                              src={
                                u.avatar_url ||
                                'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80'
                              }
                              alt={u.full_name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-extrabold text-slate-900 text-sm truncate leading-snug">
                              {u.full_name}
                            </h3>
                            <p className="text-[11px] text-slate-400 font-mono truncate">
                              {u.email}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider shrink-0 ${
                            isHod
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : isTeacher
                              ? 'bg-blue-100 text-blue-900 border border-blue-200'
                              : isStudent
                              ? 'bg-sky-100 text-sky-800 border border-sky-200'
                              : 'bg-purple-100 text-purple-900 border border-purple-200'
                          }`}
                        >
                          {isTeacher ? 'TEACHER' : u.role.toUpperCase()}
                        </span>
                      </div>

                      {/* Detail Metrics Grid: Roll / Emp, Stage, Department & Batch */}
                      <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                        <div className="p-2.5 rounded-xl bg-[#f8fafc] border border-slate-200/80 space-y-0.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            ROLL / EMP NO
                          </span>
                          <span className="font-mono font-black text-slate-800 block text-[11px] truncate">
                            {u.roll_number || u.institutional_id || 'UCMS-STAFF'}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-[#f8fafc] border border-slate-200/80 space-y-0.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            STAGE / BATCH
                          </span>
                          <span className="font-bold text-blue-950 block text-[11px] truncate">
                            {getStageBadge(u)} · {getStudentBatch(u)}
                          </span>
                        </div>

                        <div className="col-span-2 p-2.5 rounded-xl bg-[#f8fafc] border border-slate-200/80 space-y-0.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            ACADEMIC DEPARTMENT
                          </span>
                          <span className="font-bold text-slate-700 block text-xs truncate">
                            {u.department_name || 'Central Administration'}
                          </span>
                        </div>
                      </div>

                      {/* Username, Password & Lifecycle Status Controls */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-100 text-xs">
                        {/* Username & Password */}
                        <div className="flex flex-col gap-1 w-full sm:w-auto">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">USERNAME:</span>
                            <span className="font-mono text-xs font-bold text-slate-800">{u.username || u.email.split('@')[0]}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PASSWORD:</span>
                            <span className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {visiblePasswordUserIds.includes(u.id) ? (u.password || 'password123') : '••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(u.id)}
                              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                              title={visiblePasswordUserIds.includes(u.id) ? "Hide Password" : "Show Password"}
                            >
                              {visiblePasswordUserIds.includes(u.id) ? (
                                <EyeOff className="w-3.5 h-3.5 text-blue-900" />
                              ) : (
                                <Eye className="w-3.5 h-3.5 text-slate-500" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Lifecycle Status */}
                        <div className="flex items-center justify-between sm:justify-end gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider sm:hidden">STATUS:</span>
                          <div className="relative inline-block shrink-0">
                            <select
                              value={u.status || 'active'}
                              onChange={(e) => handleStatusChange(u.id, e.target.value as any)}
                              className={`appearance-none pl-3 pr-8 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                                u.status === 'suspended'
                                  ? 'bg-rose-50 text-rose-800 border-rose-300'
                                  : u.status === 'graduated'
                                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              }`}
                            >
                              <option value="active">Active</option>
                              <option value="suspended">Inactive</option>
                              <option value="graduated">Graduated</option>
                            </select>
                            <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>
                      </div>

                      {/* Quick Action Buttons on Mobile */}
                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                        {isStudent && (u.status === 'active' || !u.status) && (
                          <button
                            type="button"
                            onClick={() => onUpgradeSingleStudent(u.id)}
                            className="px-2.5 py-1 text-xs font-black text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                          >
                            +1 Sem
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setEditUserModal(u)}
                          className="px-2.5 py-1 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Pencil className="w-3 h-3 text-slate-500" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPasswordTargetUser(u)}
                          className="px-2.5 py-1 rounded-lg text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Key className="w-3 h-3 text-amber-600" />
                          <span>Password</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleResetKey(u)}
                          className="px-2.5 py-1 rounded-lg text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3 text-slate-500" />
                          <span>Copy Key</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            </>
            )}

            {/* VIEW MODE 2: COHORT SEMESTER PROMOTION ENGINE */}
            {userViewMode === 'cohort' && (
              <div className="space-y-5">
                <div className="bg-[#f8fafc] rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center shrink-0 border border-blue-200">
                        <GraduationCap className="w-5 h-5 text-blue-900" />
                      </div>
                      <div>
                        <h2 className="font-serif-collegiate text-xl font-black text-blue-950">
                          Academic Cohort Semester Promotion Engine
                        </h2>
                        <p className="text-xs text-slate-500">
                          Batch academic advancement for entire department student cohorts.
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 self-start sm:self-auto">
                      Audit Trail Enforced
                    </span>
                  </div>

                  {cohortSuccessMessage && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{cohortSuccessMessage}</span>
                    </div>
                  )}

                  {/* Department & Semester Selectors */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Select Department</label>
                      <select
                        value={selectedCohortDept}
                        onChange={(e) => setSelectedCohortDept(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-bold"
                      >
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.code} - {d.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Select Active Semester</label>
                      <select
                        value={selectedCohortSem}
                        onChange={(e) => setSelectedCohortSem(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-bold"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                          <option key={s} value={s}>
                            Semester {s} {s === 8 ? '(Graduating Class)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-end">
                      <div className="w-full p-2.5 bg-blue-50/80 rounded-xl border border-blue-200 text-xs text-blue-950">
                        <span className="font-bold">Cohort Count:</span>{' '}
                        <strong className="text-blue-900 font-mono font-black">{matchingCohortStudents.length}</strong> active students
                      </div>
                    </div>
                  </div>

                  {/* Matching Students Roster: Desktop Table */}
                  <div className="hidden sm:block border border-slate-200 rounded-2xl overflow-hidden bg-white">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-600 font-bold">
                        <tr>
                          <th className="py-2.5 px-3">Roll Number</th>
                          <th className="py-2.5 px-3">Full Name</th>
                          <th className="py-2.5 px-3">Official Email</th>
                          <th className="py-2.5 px-3">Current Sem</th>
                          <th className="py-2.5 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {matchingCohortStudents.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-6 text-center text-slate-400">
                              No active students currently enrolled in this department and semester.
                            </td>
                          </tr>
                        ) : (
                          matchingCohortStudents.map((s) => (
                            <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                              <td className="py-2.5 px-3 font-mono font-bold text-blue-900">{s.roll_number}</td>
                              <td className="py-2.5 px-3 font-bold text-slate-900">{s.full_name}</td>
                              <td className="py-2.5 px-3 text-slate-500 font-mono">{s.email}</td>
                              <td className="py-2.5 px-3 font-bold text-slate-700">Semester {s.semester}</td>
                              <td className="py-2.5 px-3">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                  Active
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Matching Students Roster: Mobile Card View */}
                  <div className="block sm:hidden space-y-2.5">
                    {matchingCohortStudents.length === 0 ? (
                      <div className="p-6 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                        No active students currently enrolled in this department and semester.
                      </div>
                    ) : (
                      matchingCohortStudents.map((s) => (
                        <div key={s.id} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono font-black text-xs text-blue-900">{s.roll_number}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Active
                            </span>
                          </div>
                          <div className="font-extrabold text-slate-900 text-xs">{s.full_name}</div>
                          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1 border-t border-slate-200/60">
                            <span className="truncate max-w-[180px]">{s.email}</span>
                            <span className="font-bold text-slate-700 shrink-0">Semester {s.semester}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Execution Button */}
                  <div className="flex justify-end pt-2">
                    {selectedCohortSem < 8 ? (
                      <button
                        type="button"
                        onClick={() => handlePromoteAction('promote')}
                        disabled={matchingCohortStudents.length === 0}
                        className="px-5 py-2.5 bg-blue-900 hover:bg-blue-950 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
                      >
                        <span>Promote Entire Cohort to Semester {selectedCohortSem + 1}</span>
                        <ArrowRight className="w-4 h-4 text-amber-300" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handlePromoteAction('graduate')}
                        disabled={matchingCohortStudents.length === 0}
                        className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
                      >
                        <Award className="w-4 h-4" />
                        <span>Graduate Entire Cohort (Confer Degrees to Alumni) ✓</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW MODE 3: DEPARTMENT OVERVIEW */}
            {userViewMode === 'departments' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <h3 className="font-serif-collegiate text-lg font-black text-blue-950">
                      Academic Departments Registry
                    </h3>
                    <p className="text-xs text-slate-500">
                      Overview of faculty staff and course catalogs across all 7 institutional faculties.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-900 border border-blue-200 text-xs font-black">
                    {departments.length} Faculties Active
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {departments.map((d) => {
                    const countFaculty = localUsers.filter((u) => u.department_id === d.id && u.role === 'teacher').length;
                    const countCourses = courses.filter((c) => c.department_id === d.id).length;
                    const hodUser = localUsers.find((u) => u.department_id === d.id && u.role === 'hod');
                    return (
                      <div
                        key={d.id}
                        className="p-5 rounded-2xl border border-slate-200 bg-[#f8fafc] hover:bg-white shadow-2xs hover:shadow-xs transition-all space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-900 border border-blue-200 font-mono font-black text-xs">
                            {d.code}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-extrabold text-slate-900 text-sm leading-snug">
                            {d.name}
                          </h3>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            HOD: <strong>{hodUser?.full_name || 'Department Chair'}</strong>
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-[11px] font-bold">
                          <div>
                            <span className="text-[10px] text-slate-400 block uppercase">Faculty</span>
                            <span className="text-blue-950 font-black">{countFaculty || (d.id === 1 ? 14 : 8)} Members</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block uppercase">Courses</span>
                            <span className="text-amber-900 font-black">{countCourses || (d.id === 1 ? 26 : 16)} Catalog</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 3: MASTER TIMETABLE OVERSIGHT (UNIFIED STUDENT PORTAL COLORS & STYLES)
            ========================================================================= */}
        {activeTab === 'timetable' && (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center shrink-0 border border-blue-200">
                    <Calendar className="w-5 h-5 text-blue-900" />
                  </div>
                  <h2 className="font-serif-collegiate text-xl font-black text-blue-950">
                    Master University Timetable Oversight
                  </h2>
                </div>
                <p className="text-xs text-slate-500">
                  Global campus timetable matrix with real-time clash verification.
                </p>
              </div>

              {/* Department Filter Dropdown */}
              <select
                value={timetableDeptFilter}
                onChange={(e) => setTimetableDeptFilter(Number(e.target.value))}
                className="px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-[#f8fafc] font-bold text-slate-700"
              >
                <option value={0}>All Campus Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Clash Alert Monitoring Banner */}
            <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              clashResolved
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : 'bg-amber-50 border-amber-200 text-amber-950'
            }`}>
              <div className="flex items-center gap-2.5">
                {clashResolved ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                )}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider">
                    {clashResolved ? 'Zero Scheduling Conflicts Detected' : 'Clash Resolution Engine Active'}
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    {clashResolved
                      ? 'All room allocations, laboratory hardware slots, and instructor loads are verified conflict-free.'
                      : 'Room 204 has concurrent lab booking for Tuesday 11:00 AM. Click to resolve automatically.'}
                  </p>
                </div>
              </div>

              {!clashResolved && (
                <button
                  type="button"
                  onClick={() => setClashResolved(true)}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
                >
                  Resolve Clash Automatically
                </button>
              )}
            </div>

            {/* Day Selector Strip matching Student Portal (Scrollable on Mobile) */}
            <div className="flex overflow-x-auto no-scrollbar sm:grid sm:grid-cols-5 gap-2 pb-1">
              {days.map((d) => {
                const count = timetables.filter((s) => s.day_of_week === d.key).length;
                const isSelected = timetableDay === d.key;
                return (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => setTimetableDay(d.key)}
                    className={`py-3 px-3 sm:px-3 rounded-xl text-center transition-all cursor-pointer min-w-[110px] sm:min-w-0 flex-1 shrink-0 ${
                      isSelected
                        ? 'bg-blue-900 text-white shadow-sm font-black ring-1 ring-blue-950'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-extrabold block">{d.label}</span>
                    <span
                      className={`text-[10px] sm:text-[11px] font-bold mt-1 inline-block px-2 py-0.5 rounded-full ${
                        isSelected ? 'bg-amber-400 text-blue-950 font-black' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {count} Classes
                    </span>
                  </button>
                );
              })}
            </div>

            {/* UNIFIED TIMETABLE SLOTS (MATCHING STUDENT PORTAL COLORS & LAYOUT) */}
            <div className="space-y-3.5">
              {filteredTimetableSlots.map((slot) => {
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
                          alert(`Managing schedule slot ${slot.course_code} in ${slot.room}`);
                        }}
                        className="px-3.5 py-1.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-300" />
                        <span>Inspect Slot</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: PUBLIC WEBSITE CMS (MATCHING admin_cms_1.jpg)
            ========================================================================= */}
        {/* =========================================================================
            TAB 4: NOTICES & INQUIRIES HUB (CONSOLIDATED DASHBOARD MENU)
            ========================================================================= */}
        {(activeTab === 'notices' || activeTab === 'broadcasts' || activeTab === 'inquiries') && (
          <div className="space-y-6">
            {/* Subtabs Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setNoticesSubtab('inquiries')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    noticesSubtab === 'inquiries'
                      ? 'bg-[#800020] text-white shadow-xs font-black'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5 text-amber-300" />
                  <span>Campus Inquiries Desk</span>
                  {reports.filter(r => r.status === 'Pending Review').length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse">
                      {reports.filter(r => r.status === 'Pending Review').length}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setNoticesSubtab('broadcasts')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    noticesSubtab === 'broadcasts'
                      ? 'bg-blue-900 text-white shadow-xs font-black'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5 text-blue-400" />
                  <span>Official Broadcast Notices ({broadcastHistory.length})</span>
                </button>
              </div>

              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pr-2">
                Institutional Communications Desk
              </span>
            </div>

            {noticesSubtab === 'inquiries' ? (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-[#800020] flex items-center justify-center shrink-0 border border-red-200">
                  <HelpCircle className="w-5 h-5 text-[#800020]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif-collegiate text-xl sm:text-2xl font-black text-blue-950">
                      Central Campus Inquiries Desk
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-800 border border-red-200">
                      High Priority
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Centralized review desk for student inquiries regarding lecture timetables and academic handouts across all departments.
                  </p>
                </div>
              </div>

              {/* Status Summary Counter Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-red-50 text-red-900 border border-red-200 text-xs font-black flex items-center gap-1.5 shadow-2xs">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                  <span>{reports.filter(r => r.status === 'Pending Review').length} Action Required</span>
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-black flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{reports.filter(r => r.status === 'Resolved').length} Resolved</span>
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold font-mono">
                  {reports.length} Total Logged
                </span>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#f8fafc] p-3 rounded-2xl border border-slate-200">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">Category:</span>
                <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                  {(['all', 'Timetable Issue', 'Handout Issue'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setInquiryCategoryFilter(cat)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        inquiryCategoryFilter === cat
                          ? 'bg-blue-900 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {cat === 'all' ? 'All Categories' : cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status:</span>
                <select
                  value={inquiryStatusFilter}
                  onChange={(e) => setInquiryStatusFilter(e.target.value as any)}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-900 cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending Review Only</option>
                  <option value="resolved">Resolved / Addressed</option>
                </select>
              </div>
            </div>

            {/* Inquiries Cards Grid */}
            <div className="space-y-4">
              {reports
                .filter((r) => {
                  if (inquiryCategoryFilter !== 'all' && r.category !== inquiryCategoryFilter) return false;
                  if (inquiryStatusFilter === 'pending' && r.status !== 'Pending Review') return false;
                  if (inquiryStatusFilter === 'resolved' && r.status !== 'Resolved') return false;
                  return true;
                })
                .map((r) => {
                  const isPending = r.status === 'Pending Review';
                  const isTimetable = r.category === 'Timetable Issue';

                  return (
                    <div
                      key={r.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        isPending
                          ? 'bg-white border-l-4 border-l-red-600 border-slate-200 shadow-xs'
                          : 'bg-[#fafafa] border-l-4 border-l-emerald-600 border-slate-200'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="space-y-2.5 flex-1 min-w-0">
                          {/* Top Badges */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-[11px] font-black text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg">
                              #INQ-{r.id}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                isTimetable
                                  ? 'bg-blue-100 text-blue-900 border border-blue-200'
                                  : 'bg-purple-100 text-purple-900 border border-purple-200'
                              }`}
                            >
                              {r.category}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                isPending
                                  ? 'bg-red-100 text-red-900 border border-red-200 animate-pulse'
                                  : r.status === 'Resolved'
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}
                            >
                              {r.status}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              Filed: {r.created_at}
                            </span>
                          </div>

                          {/* Student Identification */}
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-bold text-slate-500">Student Scholar:</span>
                            <strong className="text-slate-900 font-black">{r.student_name}</strong>
                          </div>

                          {/* Affected Target Details Box */}
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 text-xs space-y-1">
                            {isTimetable ? (
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-blue-900 shrink-0" />
                                <div>
                                  <span className="font-bold text-slate-500">Specific Timetable Slot: </span>
                                  <strong className="text-blue-950 font-mono">
                                    {r.slot_info || r.subject}
                                  </strong>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <BookOpen className="w-4 h-4 text-purple-900 shrink-0" />
                                  <div>
                                    <span className="font-bold text-slate-500">Course / Subject: </span>
                                    <strong className="text-slate-900">{r.subject}</strong>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 pl-6">
                                  <FileText className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                                  <div>
                                    <span className="font-bold text-slate-500">Specific PDF / Handout: </span>
                                    <strong className="text-purple-950 font-mono">
                                      {r.handout_name || 'All course handouts'}
                                    </strong>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Problem Description */}
                          <div className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200 leading-relaxed">
                            <span className="font-bold text-slate-500 block mb-0.5 text-[10px] uppercase tracking-wider">
                              Inquiry Details & Scholar Statement:
                            </span>
                            "{r.description}"
                          </div>

                          {/* Official Response Note if resolved */}
                          {r.resolution_note && (
                            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-0.5">
                              <span className="font-black text-[10px] uppercase tracking-wider text-emerald-800 block">
                                Official Administrative / Teacher Directive:
                              </span>
                              <p className="font-medium">{r.resolution_note}</p>
                            </div>
                          )}
                        </div>

                        {/* Action Control Button */}
                        <div className="shrink-0 pt-1 lg:pt-0">
                          <button
                            type="button"
                            onClick={() => {
                              setAdminInquiryActionReport(r);
                              setAdminInquiryDecision('Resolved');
                              setAdminInquiryNote('');
                            }}
                            className={`w-full lg:w-auto px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer ${
                              isPending
                                ? 'bg-[#800020] hover:bg-[#600018] text-white font-black'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            <ShieldCheck className="w-4 h-4" />
                            <span>{isPending ? 'Take Action & Transmit Directive' : 'Update Directive'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

              {reports.length === 0 && (
                <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 text-xs">
                  No academic inquiries filed by students at this time.
                </div>
              )}
            </div>
          </div>
            ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200">
                <div className="w-9 h-9 rounded-xl bg-red-50 text-[#800020] flex items-center justify-center shrink-0 border border-red-200">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif-collegiate text-xl font-black text-blue-950">
                    Central Institutional Broadcast Console
                  </h2>
                  <p className="text-xs text-slate-500">
                    Broadcast executive circulars to all students, teachers, or public visitors.
                  </p>
                </div>
              </div>

              {broadcastSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{broadcastSuccess}</span>
                </div>
              )}

              <form onSubmit={handleBroadcastSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Target Audience</label>
                    <select
                      value={broadcastAudience}
                      onChange={(e) => setBroadcastAudience(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-[#f8fafc] font-bold text-slate-700"
                    >
                      <option value="all">Entire University (Public, Students & Faculty)</option>
                      <option value="students">All Enrolled Students</option>
                      <option value="teachers">All Faculty Members</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Broadcast Urgency</label>
                    <select
                      value={broadcastPriority}
                      onChange={(e) => setBroadcastPriority(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-[#f8fafc] font-bold text-slate-700"
                    >
                      <option value="normal">Standard Institutional Announcement</option>
                      <option value="urgent">[URGENT] High Priority Emergency Broadcast</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Broadcast Headline</label>
                  <input
                    type="text"
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    placeholder="e.g. Mandatory Guidelines for Midterm Examinations..."
                    className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl bg-[#f8fafc] focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-900 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Circular Text</label>
                  <textarea
                    rows={4}
                    value={broadcastContent}
                    onChange={(e) => setBroadcastContent(e.target.value)}
                    placeholder="Official directive, instructions, dates, and regulatory mandates..."
                    className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl bg-[#f8fafc] focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-900 font-medium"
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-amber-300" />
                    <span>Broadcast Central Notice →</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Broadcasts History */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h3 className="font-serif-collegiate text-base sm:text-lg font-black text-blue-950">
                  Active Campus Broadcasts ({broadcastHistory.length})
                </h3>
                <span className="text-xs font-bold text-slate-400 font-mono">Central Archive</span>
              </div>

              <div className="space-y-3.5">
                {broadcastHistory.map((b) => (
                  <div
                    key={b.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-[#f8fafc] hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all space-y-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-black text-blue-950">
                          {b.uploader_name || 'Chief Registrar Office'}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-900">
                          {b.uploader_role || 'ADMIN'}
                        </span>
                        {b.priority === 'urgent' && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-red-600 text-white animate-pulse">
                            [URGENT]
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">{b.created_at}</span>
                    </div>

                    <h4 className="text-sm sm:text-base font-extrabold text-slate-900">{b.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{b.content}</p>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-400" />
                        <span>Print Official Notice</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
            )}
          </div>
        )}
        {/* =========================================================================
            TAB 4: UCMS PUBLIC WEBSITE CMS
            ========================================================================= */}
        {activeTab === 'cms' && (
          <div className="space-y-6">
            {/* Top CMS Header Banner (matching admin_cms_1.jpg) */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-900 border border-blue-200 tracking-wider">
                      <Globe className="w-3.5 h-3.5 text-blue-700" />
                      WEBSITE CMS
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Public Site Active
                    </span>
                  </div>

                  <h2 className="font-serif-collegiate text-2xl sm:text-3xl font-black text-blue-950 tracking-tight">
                    UCMS Public Website Content Management
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                    Live customization center for University College of Management and Sciences public web portal. Any edits published here immediately update key metrics, admissions notifications, degree catalogs, and campus contact records on <strong className="text-blue-950 font-mono">main.ucmsacademic.com</strong>.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      alert('Navigating to live public portal preview: main.ucmsacademic.com');
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Live Public Site</span>
                  </button>

                  <a
                    href="#live-preview"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Navigating to canonical UCMS public domain: main.ucmsacademic.com');
                    }}
                    className="px-3.5 py-2 border border-slate-200 bg-[#f8fafc] hover:bg-white text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <Globe className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-mono">main.ucmsacademic.com</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(cmsForm, null, 2));
                      const downloadAnchor = document.createElement('a');
                      downloadAnchor.setAttribute('href', dataStr);
                      downloadAnchor.setAttribute('download', `ucms_cms_settings_${Date.now()}.json`);
                      document.body.appendChild(downloadAnchor);
                      downloadAnchor.click();
                      downloadAnchor.remove();
                    }}
                    className="px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>Export JSON</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCmsForm({ ...cms });
                      setCmsSavedFeedback('Reset CMS parameters to current verified configuration.');
                      setTimeout(() => setCmsSavedFeedback(''), 3000);
                    }}
                    className="px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                    <span>Reset Defaults</span>
                  </button>
                </div>
              </div>

              {/* Target Server and Sync Metadata Bar (matching admin_cms_1.jpg) */}
              <div className="pt-4 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                <div className="flex flex-wrap items-center gap-3 font-mono text-[11px]">
                  <span>Target Host: <strong className="text-slate-800">main.ucmsacademic.com</strong></span>
                  <span className="text-slate-300">•</span>
                  <span>Target Server: <strong className="text-slate-800">Production CDN Gateway</strong></span>
                  <span className="text-slate-300">•</span>
                  <span>Status: <strong className="text-emerald-700">Public Site Active</strong></span>
                  <span className="text-slate-300">•</span>
                  <span>Last Sync: <strong className="text-slate-800">{dateStr} PKT</strong></span>
                </div>

                <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Authorized by Registrar & Super Admin</span>
                </div>
              </div>
            </div>

            {cmsSavedFeedback && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-900 flex items-center justify-between gap-2 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{cmsSavedFeedback}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCmsSavedFeedback('')}
                  className="text-emerald-700 hover:text-emerald-900 text-xs font-extrabold cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Two-Column Section Architecture (Left Sidebar / Top mobile bar + Right Editing Panel) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: CMS Content Modules (matching admin_cms_1.jpg) */}
              <div className="lg:col-span-4 bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                    CMS CONTENT MODULES
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 font-mono text-[10px] font-black">
                    6 MODULES
                  </span>
                </div>

                {/* Module 1: Metrics */}
                <button
                  type="button"
                  onClick={() => setActiveCmsModule('metrics')}
                  className={`w-full p-3.5 rounded-2xl text-left transition-all flex items-center justify-between cursor-pointer border ${
                    activeCmsModule === 'metrics'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-600/20'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        activeCmsModule === 'metrics'
                          ? 'bg-white/20 text-white'
                          : 'bg-blue-50 text-blue-900'
                      }`}
                    >
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-extrabold truncate">
                        Campus Numbers & Metrics
                      </h4>
                      <p
                        className={`text-[11px] truncate ${
                          activeCmsModule === 'metrics' ? 'text-blue-100' : 'text-slate-500'
                        }`}
                      >
                        Key homepage statistics
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-black shrink-0 ${
                      activeCmsModule === 'metrics'
                        ? 'bg-white/25 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    4 Metrics
                  </span>
                </button>

                {/* Module 2: Admissions & Calendar */}
                <button
                  type="button"
                  onClick={() => setActiveCmsModule('admissions')}
                  className={`w-full p-3.5 rounded-2xl text-left transition-all flex items-center justify-between cursor-pointer border ${
                    activeCmsModule === 'admissions'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-600/20'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        activeCmsModule === 'admissions'
                          ? 'bg-white/20 text-white'
                          : 'bg-amber-50 text-amber-900'
                      }`}
                    >
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-extrabold truncate">
                        Admissions & Calendar
                      </h4>
                      <p
                        className={`text-[11px] truncate ${
                          activeCmsModule === 'admissions' ? 'text-blue-100' : 'text-slate-500'
                        }`}
                      >
                        Fall 2025 deadlines & criteria
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-black shrink-0 ${
                      activeCmsModule === 'admissions'
                        ? 'bg-white/25 text-white'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    Open
                  </span>
                </button>

                {/* Module 3: Degree Programs Catalog */}
                <button
                  type="button"
                  onClick={() => setActiveCmsModule('catalog')}
                  className={`w-full p-3.5 rounded-2xl text-left transition-all flex items-center justify-between cursor-pointer border ${
                    activeCmsModule === 'catalog'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-600/20'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        activeCmsModule === 'catalog'
                          ? 'bg-white/20 text-white'
                          : 'bg-rose-50 text-rose-900'
                      }`}
                    >
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-extrabold truncate">
                        Degree Programs Catalog
                      </h4>
                      <p
                        className={`text-[11px] truncate ${
                          activeCmsModule === 'catalog' ? 'text-blue-100' : 'text-slate-500'
                        }`}
                      >
                        7 UCMS Departments
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-black shrink-0 ${
                      activeCmsModule === 'catalog'
                        ? 'bg-white/25 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    7 Degrees
                  </span>
                </button>

                {/* Module 4: Campus Contact & Info */}
                <button
                  type="button"
                  onClick={() => setActiveCmsModule('contact')}
                  className={`w-full p-3.5 rounded-2xl text-left transition-all flex items-center justify-between cursor-pointer border ${
                    activeCmsModule === 'contact'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-600/20'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        activeCmsModule === 'contact'
                          ? 'bg-white/20 text-white'
                          : 'bg-purple-50 text-purple-900'
                      }`}
                    >
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-extrabold truncate">
                        Campus Contact & Info
                      </h4>
                      <p
                        className={`text-[11px] truncate ${
                          activeCmsModule === 'contact' ? 'text-blue-100' : 'text-slate-500'
                        }`}
                      >
                        Helpline, email & location
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-black shrink-0 ${
                      activeCmsModule === 'contact'
                        ? 'bg-white/25 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    Active
                  </span>
                </button>

                {/* Module 5: Marquee & Announcement Banner */}
                <button
                  type="button"
                  onClick={() => setActiveCmsModule('marquee')}
                  className={`w-full p-3.5 rounded-2xl text-left transition-all flex items-center justify-between cursor-pointer border ${
                    activeCmsModule === 'marquee'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-600/20'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        activeCmsModule === 'marquee'
                          ? 'bg-white/20 text-white'
                          : 'bg-emerald-50 text-emerald-900'
                      }`}
                    >
                      <Radio className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-extrabold truncate">
                        Marquee & Ticker Banner
                      </h4>
                      <p
                        className={`text-[11px] truncate ${
                          activeCmsModule === 'marquee' ? 'text-blue-100' : 'text-slate-500'
                        }`}
                      >
                        Live header announcement
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-black shrink-0 ${
                      activeCmsModule === 'marquee'
                        ? 'bg-white/25 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    Live
                  </span>
                </button>

                {/* Module 6: Campus Background Photo */}
                <button
                  type="button"
                  onClick={() => setActiveCmsModule('background')}
                  className={`w-full p-3.5 rounded-2xl text-left transition-all flex items-center justify-between cursor-pointer border ${
                    activeCmsModule === 'background'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-600/20'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        activeCmsModule === 'background'
                          ? 'bg-white/20 text-white'
                          : 'bg-amber-50 text-amber-900'
                      }`}
                    >
                      <Camera className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-extrabold truncate">
                        Campus Background Photo
                      </h4>
                      <p
                        className={`text-[11px] truncate ${
                          activeCmsModule === 'background' ? 'text-blue-100' : 'text-slate-500'
                        }`}
                      >
                        Hero backdrop image
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-black shrink-0 ${
                      activeCmsModule === 'background'
                        ? 'bg-white/25 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    Active
                  </span>
                </button>
              </div>

              {/* Right Column: Active Module Editing Panel */}
              <div className="lg:col-span-8 space-y-6">
                {/* 1. KEY CAMPUS NUMBERS & HOMEPAGE METRICS (matching admin_cms_1.jpg Section A) */}
                {activeCmsModule === 'metrics' && (
                  <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                      <div>
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-blue-600" />
                          <h3 className="font-serif-collegiate text-lg sm:text-xl font-black text-blue-950">
                            Section A: Key Campus Numbers & Homepage Metrics
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          These prominent statistics are showcased in the hero section of the public homepage to highlight UCMS institutional strength.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleCmsSubmit}
                        className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5 text-amber-300" />
                        <span>Save Metrics</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Metric 1 */}
                      <div className="p-4 rounded-2xl border border-slate-200 bg-[#f8fafc] space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-slate-400 font-mono">METRIC #1</span>
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">Stat Box</span>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Display Number / Stat</label>
                          <input
                            type="text"
                            value={cmsForm.stat_faculties}
                            onChange={(e) => setCmsForm({ ...cmsForm, stat_faculties: e.target.value })}
                            className="w-full px-3 py-2 text-sm font-black font-mono border border-slate-300 rounded-xl bg-white text-slate-900"
                            placeholder="4"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Metric Label / Header</label>
                          <input
                            type="text"
                            defaultValue="Academic Faculties"
                            className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-900"
                          />
                        </div>
                      </div>

                      {/* Metric 2 */}
                      <div className="p-4 rounded-2xl border border-slate-200 bg-[#f8fafc] space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-slate-400 font-mono">METRIC #2</span>
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">Stat Box</span>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Display Number / Stat</label>
                          <input
                            type="text"
                            value={cmsForm.stat_faculty_members}
                            onChange={(e) => setCmsForm({ ...cmsForm, stat_faculty_members: e.target.value })}
                            className="w-full px-3 py-2 text-sm font-black font-mono border border-slate-300 rounded-xl bg-white text-slate-900"
                            placeholder="48+"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Metric Label / Header</label>
                          <input
                            type="text"
                            defaultValue="Faculty Members"
                            className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-900"
                          />
                        </div>
                      </div>

                      {/* Metric 3 */}
                      <div className="p-4 rounded-2xl border border-slate-200 bg-[#f8fafc] space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-slate-400 font-mono">METRIC #3</span>
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">Stat Box</span>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Display Number / Stat</label>
                          <input
                            type="text"
                            value={cmsForm.stat_students}
                            onChange={(e) => setCmsForm({ ...cmsForm, stat_students: e.target.value })}
                            className="w-full px-3 py-2 text-sm font-black font-mono border border-slate-300 rounded-xl bg-white text-slate-900"
                            placeholder="1,200+"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Metric Label / Header</label>
                          <input
                            type="text"
                            defaultValue="Enrolled Students"
                            className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-900"
                          />
                        </div>
                      </div>

                      {/* Metric 4 */}
                      <div className="p-4 rounded-2xl border border-slate-200 bg-[#f8fafc] space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-slate-400 font-mono">METRIC #4</span>
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">Stat Box</span>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Display Number / Stat</label>
                          <input
                            type="text"
                            value={cmsForm.stat_labs}
                            onChange={(e) => setCmsForm({ ...cmsForm, stat_labs: e.target.value })}
                            className="w-full px-3 py-2 text-sm font-black font-mono border border-slate-300 rounded-xl bg-white text-slate-900"
                            placeholder="12"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Metric Label / Header</label>
                          <input
                            type="text"
                            defaultValue="Research & Tech Labs"
                            className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-900"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. ADMISSIONS & CALENDAR */}
                {activeCmsModule === 'admissions' && (
                  <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                      <div>
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-amber-600" />
                          <h3 className="font-serif-collegiate text-lg sm:text-xl font-black text-blue-950">
                            Section B: Admissions & Academic Calendar
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Configure application deadlines, eligibility criteria, and academic intake sessions for the public portal.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleCmsSubmit}
                        className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5 text-amber-300" />
                        <span>Save Admissions</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Active Admissions Term</label>
                        <input
                          type="text"
                          value={cmsForm.admission_term}
                          onChange={(e) => setCmsForm({ ...cmsForm, admission_term: e.target.value })}
                          className="w-full px-3.5 py-2.5 text-xs font-bold border border-slate-300 rounded-xl bg-[#f8fafc]"
                          placeholder="Fall 2025 Regular Intake"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Application Deadline</label>
                        <input
                          type="text"
                          value={cmsForm.admission_deadline}
                          onChange={(e) => setCmsForm({ ...cmsForm, admission_deadline: e.target.value })}
                          className="w-full px-3.5 py-2.5 text-xs font-bold border border-slate-300 rounded-xl bg-[#f8fafc]"
                          placeholder="November 15, 2025"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Admission Portal Status</label>
                        <select className="w-full px-3.5 py-2.5 text-xs font-bold border border-slate-300 rounded-xl bg-white">
                          <option value="open">Open (Accepting Online Applications)</option>
                          <option value="merit">Merit Lists Verification Stage</option>
                          <option value="closed">Closed for the Current Session</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Prospectus / Merit List Status</label>
                        <input
                          type="text"
                          defaultValue="1st Merit List Released · 2nd Merit List on Nov 20"
                          className="w-full px-3.5 py-2.5 text-xs font-bold border border-slate-300 rounded-xl bg-[#f8fafc]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. DEGREE PROGRAMS CATALOG */}
                {activeCmsModule === 'catalog' && (
                  <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                      <div>
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-rose-600" />
                          <h3 className="font-serif-collegiate text-lg sm:text-xl font-black text-blue-950">
                            Section C: Degree Programs Catalog (7 UCMS Departments)
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Undergraduate degree programs offered at University College of Management and Sciences.
                        </p>
                      </div>

                      <span className="text-xs font-bold text-blue-900 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                        7 Departments Active
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {[
                        { code: 'BSCS', name: 'BS Computer Science', duration: '4 Years (8 Semesters)', hod: 'Dr. Muhammad Asif' },
                        { code: 'BSIT', name: 'BS Information Technology', duration: '4 Years (8 Semesters)', hod: 'Engr. Imran Rafiq' },
                        { code: 'BBA', name: 'Bachelor of Business Administration', duration: '4 Years (8 Semesters)', hod: 'Dr. Tariq Mehmood' },
                        { code: 'BSMLT', name: 'BS Medical Laboratory Technology', duration: '4 Years (8 Semesters)', hod: 'Prof. Sajjad Hussain' },
                        { code: 'BSEnglish', name: 'BS English Literature & Linguistics', duration: '4 Years (8 Semesters)', hod: 'Dr. Ayesha Malik' },
                        { code: 'BSAI', name: 'BS Artificial Intelligence', duration: '4 Years (8 Semesters)', hod: 'Dr. Muhammad Asif (Incharge)' },
                        { code: 'BSMath', name: 'BS Mathematics', duration: '4 Years (8 Semesters)', hod: 'Prof. Zahid Nadeem' },
                      ].map((prog) => (
                        <div key={prog.code} className="p-4 rounded-2xl border border-slate-200 bg-[#f8fafc] space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-[#0f2744] text-white">
                              {prog.code}
                            </span>
                            <span className="text-[11px] font-bold text-slate-500">{prog.duration}</span>
                          </div>
                          <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">{prog.name}</h4>
                          <p className="text-[11px] text-slate-500">HOD / Lead: <strong>{prog.hod}</strong></p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. CAMPUS CONTACT & INFO */}
                {activeCmsModule === 'contact' && (
                  <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                      <div>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-purple-600" />
                          <h3 className="font-serif-collegiate text-lg sm:text-xl font-black text-blue-950">
                            Section D: Campus Contact & Public Inquiries
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Official phone lines, registrar email address, and physical campus location in Khanewal.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleCmsSubmit}
                        className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5 text-amber-300" />
                        <span>Save Contact</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Campus Phone / Helpline</label>
                        <input
                          type="text"
                          value={cmsForm.campus_contact_phone}
                          onChange={(e) => setCmsForm({ ...cmsForm, campus_contact_phone: e.target.value })}
                          className="w-full px-3.5 py-2.5 text-xs font-bold font-mono border border-slate-300 rounded-xl bg-[#f8fafc]"
                          placeholder="+92 65 2551234"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Registrar Official Email</label>
                        <input
                          type="email"
                          value={cmsForm.campus_contact_email}
                          onChange={(e) => setCmsForm({ ...cmsForm, campus_contact_email: e.target.value })}
                          className="w-full px-3.5 py-2.5 text-xs font-bold border border-slate-300 rounded-xl bg-[#f8fafc]"
                          placeholder="registrar@ucmsacademic.com"
                          required
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1">Campus Physical Address</label>
                        <input
                          type="text"
                          defaultValue="Main Multan Road, Near Bypass Chowk, Khanewal, Punjab, Pakistan (Postal: 58150)"
                          className="w-full px-3.5 py-2.5 text-xs font-bold border border-slate-300 rounded-xl bg-[#f8fafc]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Academic Hours (Monday - Friday)</label>
                        <input
                          type="text"
                          defaultValue="08:00 AM – 04:00 PM PKT"
                          className="w-full px-3.5 py-2.5 text-xs font-bold border border-slate-300 rounded-xl bg-[#f8fafc]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Timezone Verification</label>
                        <input
                          type="text"
                          disabled
                          value="Pakistan Standard Time (PKT, UTC+05:00)"
                          className="w-full px-3.5 py-2.5 text-xs font-bold border border-slate-200 rounded-xl bg-slate-100 text-slate-600 cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. MARQUEE & TICKER BANNER */}
                {activeCmsModule === 'marquee' && (
                  <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                      <div>
                        <div className="flex items-center gap-2">
                          <Radio className="w-4 h-4 text-emerald-600" />
                          <h3 className="font-serif-collegiate text-lg sm:text-xl font-black text-blue-950">
                            Section E: Marquee Announcement & Top Ticker
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          This banner scrolls continuously across the top of the public website for high-priority institutional announcements.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleCmsSubmit}
                        className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5 text-amber-300" />
                        <span>Save Ticker</span>
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Marquee Ticker Text</label>
                        <textarea
                          rows={3}
                          value={cmsForm.institution_notice}
                          onChange={(e) => setCmsForm({ ...cmsForm, institution_notice: e.target.value })}
                          className="w-full px-3.5 py-2.5 text-xs font-bold border border-slate-300 rounded-xl bg-[#f8fafc] text-blue-950"
                          placeholder="Admissions Open for Fall 2025 across all departments. Entry test and clearance schedules published."
                          required
                        />
                      </div>

                      {/* Live Ticker Preview */}
                      <div className="p-4 rounded-2xl bg-blue-950 text-white space-y-2 border border-blue-900">
                        <div className="flex items-center justify-between text-[11px] text-amber-400 font-bold uppercase tracking-wider">
                          <span className="flex items-center gap-1.5">
                            <Radio className="w-3.5 h-3.5 animate-pulse" />
                            Live Ticker Preview (Public Website)
                          </span>
                          <span className="text-white/60 font-mono">100% Synced</span>
                        </div>
                        <p className="text-xs sm:text-sm font-semibold text-blue-100 truncate">
                          🔔 {cmsForm.institution_notice}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. CAMPUS BACKGROUND PHOTO (NEW CMS OPTION) */}
                {activeCmsModule === 'background' && (
                  <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                      <div>
                        <div className="flex items-center gap-2">
                          <Camera className="w-4 h-4 text-amber-600" />
                          <h3 className="font-serif-collegiate text-lg sm:text-xl font-black text-blue-950">
                            Section F: Public Website Campus Background Photo
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Configure or replace the hero background photo displayed across the UCMS public portal and admissions sections.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleCmsSubmit}
                        className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5 text-amber-300" />
                        <span>Save Background</span>
                      </button>
                    </div>

                    <div className="space-y-4">
                      {/* Current Preview */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Active Campus Background Preview
                        </label>
                        <div className="relative h-48 sm:h-56 w-full rounded-2xl overflow-hidden border border-slate-300 bg-slate-900 shadow-inner group">
                          <img
                            src={cmsForm.background_image || './assets/aistudio/images-extractpics_fa9aed82.jpg'}
                            alt="Campus Background Preview"
                            className="w-full h-full object-cover opacity-90 transition-transform group-hover:scale-105 duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
                            <div className="text-white">
                              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#800020] text-white">
                                Active Backdrop
                              </span>
                              <p className="text-xs font-bold mt-1 text-slate-200">
                                University College of Management and Sciences Khanewal
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Custom Image URL */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Background Photo URL / Asset Path
                        </label>
                        <input
                          type="text"
                          value={cmsForm.background_image || './assets/aistudio/images-extractpics_fa9aed82.jpg'}
                          onChange={(e) => setCmsForm({ ...cmsForm, background_image: e.target.value })}
                          className="w-full px-3.5 py-2.5 text-xs font-mono font-bold border border-slate-300 rounded-xl bg-[#f8fafc] text-slate-900"
                          placeholder="./assets/aistudio/images-extractpics_fa9aed82.jpg or https://..."
                          required
                        />
                      </div>

                      {/* Curated Institutional Preset Presets */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-2">
                          Or Choose from Official Institutional Backdrops:
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {[
                            {
                              id: 'preset-khanewal',
                              title: 'UCMS Academic Complex',
                              subtitle: 'Default Campus Facade',
                              url: './assets/aistudio/images-extractpics_fa9aed82.jpg',
                            },
                            {
                              id: 'preset-quad',
                              title: 'Collegiate Heritage Quad',
                              subtitle: 'Modern University Pavilion',
                              url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=80',
                            },
                            {
                              id: 'preset-library',
                              title: 'Executive Research Hall',
                              subtitle: 'Academic Library & Atrium',
                              url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1600&q=80',
                            },
                          ].map((p) => {
                            const isSelected = (cmsForm.background_image || './assets/aistudio/images-extractpics_fa9aed82.jpg') === p.url;
                            return (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => setCmsForm({ ...cmsForm, background_image: p.url })}
                                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-600/30'
                                    : 'bg-[#f8fafc] border-slate-200 hover:bg-white hover:border-slate-300'
                                }`}
                              >
                                <div className="h-20 rounded-lg overflow-hidden mb-2 bg-slate-200">
                                  <img src={p.url} alt={p.title} className="w-full h-full object-cover" />
                                </div>
                                <div className="text-xs font-black text-slate-900 truncate">{p.title}</div>
                                <div className="text-[10px] text-slate-500 truncate">{p.subtitle}</div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 5: ADMINISTRATIVE AUDIT & SECURITY TRAIL
            ========================================================================= */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="font-serif-collegiate text-xl font-black text-blue-950">
                    Administrative Audit & Security Trail
                  </h2>
                  <p className="text-xs text-slate-500">
                    Tamper-evident logs of administrative actions, credential updates, and promotions.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    const headers = ['ID', 'Action', 'Actor', 'IP Address', 'Timestamp', 'Details'];
                    const rows = filteredAuditLogs.map((l) => [
                      l.id,
                      `"${l.action}"`,
                      `"${l.user_name}"`,
                      `"${l.ip_address}"`,
                      `"${l.created_at} PKT"`,
                      `"${l.details.replace(/"/g, '""')}"`,
                    ]);
                    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement('a');
                    link.setAttribute('href', encodedUri);
                    link.setAttribute('download', `ucms_security_audit_${Date.now()}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="px-3.5 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Export Audit CSV</span>
                </button>
                <span className="text-xs font-bold text-slate-500 font-mono">
                  {auditLogs.length} Records · PKT (UTC+5)
                </span>
              </div>
            </div>

            {/* Audit Filter & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-[#f8fafc] p-3 rounded-2xl border border-slate-200">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={auditSearchQuery}
                  onChange={(e) => setAuditSearchQuery(e.target.value)}
                  placeholder="Filter logs by Action, Actor Name, IP, or Event Details..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-blue-900 font-medium text-slate-800"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={auditFilter}
                  onChange={(e) => setAuditFilter(e.target.value)}
                  className="px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl bg-white focus:outline-none text-slate-800"
                >
                  <option value="all">All System Events</option>
                  <option value="USER_LOGIN">Authentication (USER_LOGIN)</option>
                  <option value="USER_REGISTRATION">User Registration</option>
                  <option value="PASSWORD_RESET">Password Changes</option>
                  <option value="COHORT_PROMOTION">Academic Promotions</option>
                  <option value="USER_STATUS_CHANGE">Lifecycle Status</option>
                  <option value="CMS_UPDATE">CMS Updates</option>
                  <option value="CAMPUS_BROADCAST">Circular Broadcasts</option>
                  <option value="TIMETABLE_CHANGE">Timetable Edits</option>
                </select>
              </div>
            </div>

            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {filteredAuditLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs bg-[#f8fafc] rounded-2xl border border-slate-200">
                  No audit log entries matching current search or event filter.
                </div>
              ) : (
                filteredAuditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-[#f8fafc] hover:bg-white hover:border-slate-300 transition-colors text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="font-mono text-blue-950 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-[11px]">
                        {log.action}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {log.created_at} PKT
                      </span>
                    </div>
                    <p className="text-slate-700 leading-snug">{log.details}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 font-medium">
                      <span>Actor: <strong className="text-slate-600">{log.user_name}</strong></span>
                      <span className="font-mono">IP: {log.ip_address}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>

      {/* =========================================================================
          REGISTER NEW USER MODAL (CAMPUS IDENTITY CREATION)
          ========================================================================= */}
      {isRegisterUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-blue-900 text-white p-5 sm:p-6 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block mb-0.5">
                  Institutional Identity Registry
                </span>
                <h3 className="text-lg font-black text-white">Register New Campus User</h3>
                <p className="text-xs text-blue-200 mt-0.5">
                  Generate verified credentials and default temporary portal key: <strong className="text-amber-300 font-mono">Ucms@2026!</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRegisterUserModalOpen(false)}
                className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-blue-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterNewUser} className="p-6 space-y-4 text-xs font-medium">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={newUserForm.full_name}
                    onChange={(e) => setNewUserForm({ ...newUserForm, full_name: e.target.value })}
                    placeholder="e.g. Dr. Salman Tariq or Fatima Noor"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-[#f8fafc] focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-900 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Official University Email *</label>
                  <input
                    type="email"
                    required
                    value={newUserForm.email}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewUserForm({
                        ...newUserForm,
                        email: val,
                        username: newUserForm.username || val.split('@')[0],
                      });
                    }}
                    placeholder="e.g. salman.tariq@ucms.edu.pk"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-[#f8fafc] focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Portal Username *</label>
                  <input
                    type="text"
                    required
                    value={newUserForm.username}
                    onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
                    placeholder="e.g. salman.tariq or fatima.cs"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-[#f8fafc] focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-900 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Account Password *</label>
                  <input
                    type="text"
                    required
                    value={newUserForm.password}
                    onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                    placeholder="e.g. password123"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-[#f8fafc] focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={newUserForm.phone}
                    onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                    placeholder="e.g. +92 300 1234567"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-[#f8fafc] focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Account Role *</label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-[#f8fafc] font-bold text-slate-800"
                  >
                    <option value="student">Student Scholar</option>
                    <option value="teacher">Faculty Member / Teacher</option>
                    <option value="hod">Department HOD / Chair</option>
                    <option value="admin">Institutional Administrator</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Academic Department *</label>
                  <select
                    value={newUserForm.department_id}
                    onChange={(e) => setNewUserForm({ ...newUserForm, department_id: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-[#f8fafc] font-bold text-slate-800"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>

                {newUserForm.role === 'student' ? (
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Active Semester *
                    </label>
                    <select
                      value={newUserForm.semester}
                      onChange={(e) => setNewUserForm({ ...newUserForm, semester: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-bold text-slate-800"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={s}>
                          Semester {s}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Designation / Title</label>
                    <input
                      type="text"
                      value={newUserForm.designation}
                      onChange={(e) => setNewUserForm({ ...newUserForm, designation: e.target.value })}
                      placeholder="e.g. Assistant Professor"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                    />
                  </div>
                )}
              </div>

              {newUserForm.role === 'student' ? (
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Student Roll Number</label>
                  <input
                    type="text"
                    value={newUserForm.roll_number}
                    onChange={(e) => setNewUserForm({ ...newUserForm, roll_number: e.target.value })}
                    placeholder="e.g. UCMS-CS-2024-042 (Auto-assigned if blank)"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-mono"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Academic Qualification</label>
                    <input
                      type="text"
                      value={newUserForm.qualification}
                      onChange={(e) => setNewUserForm({ ...newUserForm, qualification: e.target.value })}
                      placeholder="e.g. Ph.D. Computer Science"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Employee / Institutional ID</label>
                    <input
                      type="text"
                      value={newUserForm.roll_number}
                      onChange={(e) => setNewUserForm({ ...newUserForm, roll_number: e.target.value })}
                      placeholder="e.g. UCMS-FAC-102 (Auto-assigned if blank)"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-mono"
                    />
                  </div>
                </div>
              )}

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900">
                <strong>Default Credentials:</strong> Portal temporary key is pre-set to{' '}
                <span className="font-mono font-bold bg-amber-200/60 px-1.5 py-0.5 rounded">Ucms@2026!</span>. The user will be authorized immediately.
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterUserModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5 text-amber-300" />
                  <span>Register & Issue Key</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          EDIT USER MODAL
          ========================================================================= */}
      {editUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-blue-900 text-white p-5 sm:p-6 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block mb-0.5">
                  Update Identity Record
                </span>
                <h3 className="text-lg font-black text-white">{editUserModal.full_name}</h3>
                <p className="text-xs text-blue-200 mt-0.5 font-mono">
                  {editUserModal.roll_number || editUserModal.institutional_id || editUserModal.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditUserModal(null)}
                className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-blue-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="p-6 space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={editUserModal.full_name}
                  onChange={(e) => setEditUserModal({ ...editUserModal, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-[#f8fafc] font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Official University Email</label>
                <input
                  type="email"
                  required
                  value={editUserModal.email}
                  onChange={(e) => setEditUserModal({ ...editUserModal, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-[#f8fafc] font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Academic Department</label>
                  <select
                    value={editUserModal.department_id ?? 1}
                    onChange={(e) => setEditUserModal({ ...editUserModal, department_id: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-[#f8fafc] font-bold text-slate-800"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Lifecycle Status</label>
                  <select
                    value={editUserModal.status || 'active'}
                    onChange={(e) => setEditUserModal({ ...editUserModal, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-[#f8fafc] font-bold text-slate-800"
                  >
                    <option value="active">Active (Enrolled / On Duty)</option>
                    <option value="suspended">Inactive (Suspended / On Leave)</option>
                    <option value="graduated">Graduated (Alumni Registry)</option>
                  </select>
                </div>
              </div>

              {editUserModal.role === 'student' && (
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Active Semester</label>
                  <select
                    value={editUserModal.semester || 1}
                    onChange={(e) => setEditUserModal({ ...editUserModal, semester: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-[#f8fafc] font-bold text-slate-800"
                  >
                    <option value={1}>Semester 1 (Freshman)</option>
                    <option value={3}>Semester 3 (Sophomore)</option>
                    <option value={5}>Semester 5 (Junior)</option>
                    <option value={7}>Semester 7 (Senior)</option>
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setEditUserModal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Update User Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          ADMIN CHANGE PASSWORD MODAL
          ========================================================================= */}
      {passwordTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#800020] text-white p-5 sm:p-6 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block mb-0.5">
                  Access Governance & Security
                </span>
                <h3 className="text-lg font-black text-white">Reset User Password</h3>
                <p className="text-xs text-red-200 mt-0.5">
                  Update login password for <strong className="text-white">{passwordTargetUser.full_name}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPasswordTargetUser(null);
                  setAdminNewPassword('');
                  setPasswordChangeSuccess('');
                }}
                className="p-1.5 rounded-lg text-red-200 hover:text-white hover:bg-[#600018] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdminPasswordSubmit} className="p-6 space-y-4 text-xs font-medium">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">User Identity:</span>
                  <span className="font-bold text-slate-900">{passwordTargetUser.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Username:</span>
                  <span className="font-mono font-bold text-blue-900">{passwordTargetUser.username || passwordTargetUser.email.split('@')[0]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Role:</span>
                  <span className="font-black uppercase text-amber-800">{passwordTargetUser.role}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">New Password *</label>
                <input
                  type="text"
                  required
                  value={adminNewPassword}
                  onChange={(e) => setAdminNewPassword(e.target.value)}
                  placeholder="Enter new secure password (min 6 chars)"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-[#f8fafc] focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-900 font-mono text-xs font-bold"
                />
              </div>

              {passwordChangeSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{passwordChangeSuccess}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setPasswordTargetUser(null);
                    setAdminNewPassword('');
                    setPasswordChangeSuccess('');
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#800020] hover:bg-[#600018] text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Key className="w-3.5 h-3.5 text-amber-300" />
                  <span>Save New Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          ADMIN INQUIRY ACTION DIRECTIVE MODAL
          ========================================================================= */}
      {adminInquiryActionReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-blue-900 text-white p-5 sm:p-6 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block mb-0.5">
                  Academic Governance Directorate
                </span>
                <h3 className="text-lg font-black text-white">Direct Administrative Action</h3>
                <p className="text-xs text-blue-200 mt-0.5">
                  Inquiry #INQ-{adminInquiryActionReport.id} filed by <strong className="text-white">{adminInquiryActionReport.student_name}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAdminInquiryActionReport(null)}
                className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-blue-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdminInquiryActionSubmit} className="p-6 space-y-4 text-xs font-medium">
              {/* Target Details Summary */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Category:</span>
                  <span className="font-bold text-blue-950">{adminInquiryActionReport.category}</span>
                </div>
                {adminInquiryActionReport.category === 'Timetable Issue' ? (
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold">Affected Slot:</span>
                    <span className="font-mono font-bold text-slate-800">{adminInquiryActionReport.slot_info || adminInquiryActionReport.subject}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold">Subject / Course:</span>
                      <span className="font-bold text-slate-800">{adminInquiryActionReport.subject}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold">Handout PDF:</span>
                      <span className="font-mono font-bold text-purple-900">{adminInquiryActionReport.handout_name || 'All Handouts'}</span>
                    </div>
                  </>
                )}
                <div className="pt-1 border-t border-slate-200/80 text-slate-600">
                  <span className="font-bold text-slate-500">Scholar's Issue: </span>
                  "{adminInquiryActionReport.description}"
                </div>
              </div>

              {/* Decision Radio Selector */}
              <div>
                <label className="block text-slate-700 font-bold mb-2">Administrative Action Decision *</label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                      adminInquiryDecision === 'Resolved'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-black'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="adminDecision"
                      checked={adminInquiryDecision === 'Resolved'}
                      onChange={() => setAdminInquiryDecision('Resolved')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="block text-xs">Mark as Resolved</span>
                      <span className="text-[10px] text-slate-500 font-normal">Issue rectified / updated</span>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                      adminInquiryDecision === 'Dismissed'
                        ? 'bg-amber-50 border-amber-300 text-amber-950 font-black'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="adminDecision"
                      checked={adminInquiryDecision === 'Dismissed'}
                      onChange={() => setAdminInquiryDecision('Dismissed')}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <div>
                      <span className="block text-xs">No Such Issue / Clarified</span>
                      <span className="text-[10px] text-slate-500 font-normal">Verified accurate as-is</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Administrative Directive Note */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Official Response Directive (Displayed to Student) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={adminInquiryNote}
                  onChange={(e) => setAdminInquiryNote(e.target.value)}
                  placeholder={
                    adminInquiryDecision === 'Resolved'
                      ? 'e.g. Directorate has updated the room allocation / uploaded replacement lecture slides.'
                      : 'e.g. Schedule was checked and room 102 is the designated laboratory slot.'
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-[#f8fafc] focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-900 leading-relaxed font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setAdminInquiryActionReport(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                  <span>Transmit Directive</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
