import React, { useState } from 'react';
import {
  Menu,
  X,
  LogOut,
  KeyRound,
  Bell,
  BookOpen,
  Calendar,
  Bookmark,
  LayoutDashboard,
  UserCheck,
  FileText,
  Clock,
  Layers,
  Users,
  Building,
  Radio,
  ShieldCheck,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { User } from '../data/mockDatabase';

interface HeaderProps {
  currentUser: User | null;
  onLogout: () => void;
  onOpenPasswordModal?: () => void;
  // Student Portal tab integration
  studentTab?: 'overview' | 'updates' | 'courses' | 'timetable' | 'bookmarks';
  onSelectStudentTab?: (tab: 'overview' | 'updates' | 'courses' | 'timetable' | 'bookmarks') => void;
  onOpenStudentProfileModal?: () => void;
  unreadAnnouncementsCount?: number;
  bookmarksCount?: number;
  // Faculty Portal tab integration
  facultyTab?: 'dashboard' | 'courses' | 'timetable' | 'handouts' | 'notices';
  onSelectFacultyTab?: (tab: 'dashboard' | 'courses' | 'timetable' | 'handouts' | 'notices') => void;
  onOpenFacultyProfileModal?: () => void;
  pendingReportsCount?: number;
  // HOD Portal tab integration
  hodTab?: 'faculty' | 'courses' | 'timetable' | 'notices';
  onSelectHodTab?: (tab: 'faculty' | 'courses' | 'timetable' | 'notices') => void;
  onOpenHodProfileModal?: () => void;
  // Admin Portal tab integration
  adminTab?: 'users' | 'timetable' | 'notices' | 'cms' | 'audit';
  onSelectAdminTab?: (tab: 'users' | 'timetable' | 'notices' | 'cms' | 'audit') => void;
  onOpenAdminProfileModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLogout,
  onOpenPasswordModal,
  studentTab = 'overview',
  onSelectStudentTab,
  onOpenStudentProfileModal,
  unreadAnnouncementsCount = 0,
  bookmarksCount = 9,
  facultyTab = 'dashboard',
  onSelectFacultyTab,
  onOpenFacultyProfileModal,
  pendingReportsCount = 2,
  hodTab = 'faculty',
  onSelectHodTab,
  onOpenHodProfileModal,
  adminTab = 'users',
  onSelectAdminTab,
  onOpenAdminProfileModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const publicNavLinks = [
    { label: 'Home', href: '#home' },
    { label: 'Admissions', href: '#admissions-calendar' },
    { label: 'Programs', href: '#academic-programs' },
    { label: 'Faculty', href: '#faculty-overview' },
    { label: 'Contact Us', href: '#contact-us' },
  ];

  const studentTabsList: Array<{
    id: 'overview' | 'updates' | 'courses' | 'timetable' | 'bookmarks';
    label: string;
    icon: React.ElementType;
    badge?: number | string;
  }> = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'updates', label: 'Update Center', icon: Bell, badge: unreadAnnouncementsCount > 0 ? unreadAnnouncementsCount : undefined },
    { id: 'courses', label: 'Enrolled Courses', icon: BookOpen },
    { id: 'timetable', label: 'Timetable', icon: Calendar },
    { id: 'bookmarks', label: `Bookmarks (${bookmarksCount})`, icon: Bookmark },
  ];

  const facultyTabsList: Array<{
    id: 'dashboard' | 'courses' | 'timetable' | 'handouts' | 'notices';
    label: string;
    icon: React.ElementType;
    badge?: number | string;
  }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'courses', label: 'Assigned Courses', icon: BookOpen },
    { id: 'timetable', label: 'Timetable', icon: Calendar },
    { id: 'handouts', label: 'Handouts', icon: FileText },
    { id: 'notices', label: 'Notices', icon: Bell, badge: pendingReportsCount > 0 ? pendingReportsCount : undefined },
  ];

  const hodTabsList: Array<{
    id: 'faculty' | 'courses' | 'timetable' | 'notices';
    label: string;
    icon: React.ElementType;
  }> = [
    { id: 'faculty', label: 'Faculty Hub', icon: Users },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'timetable', label: 'Timetables', icon: Calendar },
    { id: 'notices', label: 'Department Notices', icon: Bell },
  ];

  const adminTabsList: Array<{
    id: 'users' | 'timetable' | 'notices' | 'cms' | 'audit';
    label: string;
    icon: React.ElementType;
    badge?: number;
  }> = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'timetable', label: 'Timetable', icon: Calendar },
    { id: 'notices', label: 'Notices & Inquiries', icon: Bell, badge: pendingReportsCount },
    { id: 'cms', label: 'Website CMS', icon: Settings },
    { id: 'audit', label: 'Audit Trail', icon: ShieldCheck },
  ];

  const isStudent = currentUser?.role === 'student';
  const isFaculty = currentUser?.role === 'teacher';
  const isHod = currentUser?.role === 'hod';
  const isAdmin = currentUser?.role === 'admin';

  const defaultAvatar = isFaculty
    ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
    : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80';

  const signOutIconControl = (
    <div className="relative group flex items-center shrink-0">
      <button
        type="button"
        onClick={onLogout}
        aria-label="Sign Out"
        className="w-9 h-9 rounded-xl border border-slate-200 bg-slate-50 hover:bg-red-50 hover:border-red-200 text-slate-600 hover:text-red-700 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
      >
        <LogOut className="w-4 h-4" />
      </button>
      <div
        role="tooltip"
        className="pointer-events-none opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0 transition-all duration-150 absolute top-full right-0 mt-2 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[11px] font-bold tracking-wide shadow-lg whitespace-nowrap z-50"
      >
        <span className="absolute -top-1 right-3.5 w-2 h-2 bg-slate-900 rotate-45" />
        Sign Out
      </div>
    </div>
  );

  return (
    <>
      <header className="sticky top-0 z-40 h-[72px] w-full bg-white/98 backdrop-blur-md border-b border-slate-200 px-2.5 sm:px-6 lg:px-8 flex items-center justify-between overflow-visible shadow-2xs">
        
        {/* Zone 1: Official Brand Lockup */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1 lg:flex-initial mr-2 sm:mr-auto lg:mr-0 pr-1 sm:pr-6">
          <a
            href={isStudent ? '#overview' : isFaculty ? '#dashboard' : isHod ? '#faculty' : isAdmin ? '#users' : '#home'}
            onClick={(e) => {
              if (isStudent && onSelectStudentTab) {
                e.preventDefault();
                onSelectStudentTab('overview');
              } else if (isFaculty && onSelectFacultyTab) {
                e.preventDefault();
                onSelectFacultyTab('dashboard');
              } else if (isHod && onSelectHodTab) {
                e.preventDefault();
                onSelectHodTab('faculty');
              } else if (isAdmin && onSelectAdminTab) {
                e.preventDefault();
                onSelectAdminTab('users');
              }
            }}
            className="flex items-center gap-2 sm:gap-3 text-decoration-none group cursor-pointer min-w-0"
          >
            <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full border-2 border-[#800020] p-1 bg-white shadow-xs shrink-0 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
              <img
                src="./assets/aistudio/logo_c68140aa.png"
                onError={(e) => { (e.target as HTMLImageElement).src = './logo.png'; }}
                alt="UCMS Official Crest"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <div className="flex flex-col min-w-0 text-left">
              {isFaculty ? (
                <>
                  <span className="text-xs sm:text-base font-black tracking-tight text-[#800020] leading-tight">
                    Faculty Portal
                  </span>
                  <span className="text-[9.5px] sm:text-xs font-bold text-amber-700 tracking-wide uppercase leading-tight mt-0.5">
                    UCMS Khanewal
                  </span>
                </>
              ) : isStudent ? (
                <>
                  <span className="text-xs sm:text-base font-black tracking-tight text-[#800020] leading-tight">
                    Student Portal
                  </span>
                  <span className="text-[9.5px] sm:text-xs font-bold text-amber-700 tracking-wide uppercase leading-tight mt-0.5">
                    UCMS Khanewal
                  </span>
                </>
              ) : isHod ? (
                <>
                  <span className="text-xs sm:text-base font-black tracking-tight text-[#800020] leading-tight">
                    HOD Portal
                  </span>
                  <span className="text-[9.5px] sm:text-xs font-bold text-amber-700 tracking-wide uppercase leading-tight mt-0.5">
                    UCMS Khanewal
                  </span>
                </>
              ) : isAdmin ? (
                <>
                  <span className="text-xs sm:text-base font-black tracking-tight text-[#800020] leading-tight whitespace-nowrap">
                    Admin Portal
                  </span>
                  <span className="text-[9.5px] sm:text-xs font-bold text-amber-700 tracking-wide uppercase leading-tight mt-0.5 whitespace-nowrap">
                    UCMS Khanewal
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[11px] sm:text-sm md:text-base font-black tracking-tight text-[#800020] leading-tight whitespace-nowrap">
                    University College of
                  </span>
                  <span className="text-[11px] sm:text-sm md:text-base font-black tracking-tight text-[#800020] leading-tight whitespace-nowrap">
                    Management and Sciences
                  </span>
                </>
              )}
            </div>
          </a>
        </div>

        {/* Zone 2: Navigation Links (Desktop) */}
        {!currentUser ? (
          <nav className="hidden lg:flex items-center gap-7 text-[14px] font-bold text-slate-700">
            {publicNavLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="hover:text-[#800020] transition-colors whitespace-nowrap shrink-0 py-1.5 border-b-2 border-transparent hover:border-[#800020]"
              >
                {item.label}
              </a>
            ))}
          </nav>
        ) : isStudent ? (
          /* Student 5 Unified Tabs in Desktop Navigation */
          <nav className="hidden lg:flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-xl border border-slate-200">
            {studentTabsList.map((tab) => {
              const Icon = tab.icon;
              const isActive = studentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onSelectStudentTab && onSelectStudentTab(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-900 text-white shadow-xs'
                      : 'text-slate-700 hover:text-blue-950 hover:bg-white/80'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span
                      className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                        isActive ? 'bg-amber-400 text-blue-950' : 'bg-red-500 text-white'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        ) : isFaculty ? (
          /* Faculty 5 Unified Tabs in Desktop Navigation (matching video 00:00 - 00:40) */
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200">
            {facultyTabsList.map((tab) => {
              const Icon = tab.icon;
              const isActive = facultyTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onSelectFacultyTab && onSelectFacultyTab(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-900 text-white shadow-xs font-black'
                      : 'text-slate-700 hover:text-blue-950 hover:bg-white/80'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span
                      className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                        isActive ? 'bg-amber-400 text-blue-950' : 'bg-amber-500 text-white'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        ) : isHod ? (
          /* HOD 4 Unified Tabs in Desktop Navigation Bar */
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200">
            {hodTabsList.map((tab) => {
              const Icon = tab.icon;
              const isActive = hodTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onSelectHodTab && onSelectHodTab(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#0f2744] text-white shadow-xs font-black'
                      : 'text-slate-700 hover:text-blue-950 hover:bg-white/80'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        ) : isAdmin ? (
          /* Admin 5 Unified Tabs in Desktop Navigation Bar */
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 bg-slate-100/90 p-1 rounded-xl border border-slate-200 shrink-0">
            {adminTabsList.map((tab) => {
              const Icon = tab.icon;
              const isActive = adminTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onSelectAdminTab && onSelectAdminTab(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-2.5 xl:px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-900 text-white shadow-xs font-black'
                      : 'text-slate-700 hover:text-blue-950 hover:bg-white/80'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span
                      className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                        isActive ? 'bg-amber-400 text-blue-950' : 'bg-red-500 text-white animate-pulse'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        ) : (
          <nav className="hidden lg:flex items-center gap-2 p-1.5 bg-slate-100 rounded-lg text-xs font-semibold">
            <span className="px-3 py-1 text-slate-500 font-medium whitespace-nowrap">
              Active Portal:
            </span>
            <span className="px-3 py-1 bg-white text-blue-900 rounded-md shadow-2xs font-extrabold uppercase tracking-wider whitespace-nowrap">
              {currentUser.role}
            </span>
          </nav>
        )}

        {/* Zone 3: Primary Action & Authentication Identity */}
        <div className="flex items-center gap-1.5 sm:gap-3.5 shrink-0 ml-1 sm:ml-6">
          
          {!currentUser ? (
            <a
              href="#portal-login-card"
              className="px-2.5 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 rounded-xl shadow-xs transition-colors whitespace-nowrap shrink-0 flex items-center gap-1"
            >
              <span>Portal Login</span>
              <span className="hidden sm:inline">→</span>
            </a>
          ) : isStudent ? (
            /* Student User Capsule Button */
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenStudentProfileModal}
                className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 bg-slate-100/90 hover:bg-slate-200/90 rounded-xl border border-slate-200 transition-colors text-left cursor-pointer group"
                title="Open Student Profile & Settings"
              >
                <div className="w-8 h-8 rounded-full border border-amber-600 overflow-hidden bg-white shrink-0 flex items-center justify-center">
                  <img
                    src={currentUser.avatar_url || defaultAvatar}
                    onError={(e) => { (e.target as HTMLImageElement).src = defaultAvatar; }}
                    alt="Student Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-black text-slate-900 group-hover:text-blue-900 truncate max-w-[130px] leading-tight">
                    {currentUser.full_name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono leading-tight">
                    {currentUser.roll_number || 'UCMS-BSCS-2022-041'}
                  </span>
                </div>
                <span className="hidden md:inline-block px-1.5 py-0.5 bg-blue-900 text-amber-300 rounded text-[9px] font-extrabold uppercase tracking-wide">
                  Student
                </span>
              </button>

              {signOutIconControl}
            </div>
          ) : isFaculty ? (
            /* Faculty User Capsule Button (opens Faculty Profile Modal, matching video 00:00 & 00:41) */
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenFacultyProfileModal}
                className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 bg-slate-100/90 hover:bg-slate-200/90 rounded-xl border border-slate-200 transition-colors text-left cursor-pointer group"
                title="Open Official Faculty Profile"
              >
                <div className="w-8 h-8 rounded-full border border-amber-600 overflow-hidden bg-white shrink-0 flex items-center justify-center">
                  <img
                    src={currentUser.avatar_url || defaultAvatar}
                    onError={(e) => { (e.target as HTMLImageElement).src = defaultAvatar; }}
                    alt="Faculty Portrait"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-black text-slate-900 group-hover:text-blue-900 truncate max-w-[140px] leading-tight">
                    {currentUser.full_name || 'Prof. Asim Riaz'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono leading-tight">
                    {currentUser.role.toUpperCase()}
                  </span>
                </div>
                <span className="hidden md:inline-block px-1.5 py-0.5 bg-blue-900 text-amber-300 rounded text-[9px] font-extrabold uppercase tracking-wide">
                  Faculty
                </span>
              </button>

              {signOutIconControl}
            </div>
          ) : isHod ? (
            /* HOD Capsule Button (matches student and faculty profile buttons) */
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenHodProfileModal}
                className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 bg-slate-100/90 hover:bg-slate-200/90 rounded-xl border border-slate-200 transition-colors text-left cursor-pointer group shadow-2xs"
                title="Open Official HOD Leadership Profile"
              >
                <div className="w-8 h-8 rounded-full border border-amber-600 overflow-hidden bg-white shrink-0 flex items-center justify-center">
                  <img
                    src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80'}
                    alt="HOD Portrait"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-black text-slate-900 group-hover:text-blue-900 truncate max-w-[140px] leading-tight">
                    {currentUser.full_name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono leading-tight">
                    HOD · Computer Science
                  </span>
                </div>
                <span className="hidden md:inline-block px-1.5 py-0.5 bg-[#0f2744] text-amber-300 rounded text-[9px] font-extrabold uppercase tracking-wide">
                  HOD
                </span>
              </button>

              {signOutIconControl}
            </div>
          ) : (
            /* Admin Capsule Button (matches student and faculty profile buttons) */
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenAdminProfileModal}
                className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 bg-slate-100/90 hover:bg-slate-200/90 rounded-xl border border-slate-200 transition-colors text-left cursor-pointer group shadow-2xs"
                title="Open Official Administrator Profile"
              >
                <div className="w-8 h-8 rounded-full border border-[#800020] overflow-hidden bg-white shrink-0 flex items-center justify-center">
                  <img
                    src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80'}
                    alt="Admin Portrait"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-black text-slate-900 group-hover:text-[#800020] truncate max-w-[140px] leading-tight">
                    {currentUser.full_name || 'Registrar Admin'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono leading-tight">
                    Chief Registrar
                  </span>
                </div>
                <span className="hidden md:inline-block px-1.5 py-0.5 bg-[#800020] text-amber-300 rounded text-[9px] font-extrabold uppercase tracking-wide">
                  Admin
                </span>
              </button>

              {signOutIconControl}
            </div>
          )}

          {/* Mobile Hamburger Toggle (< 1024px) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 sm:p-2 text-slate-700 hover:text-[#800020] hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer shrink-0"
            aria-label="Toggle Navigation Drawer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>

      </header>

      {/* Mobile Slide-Down Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed top-[72px] left-0 w-full bg-white border-b border-slate-200 shadow-2xl z-50 px-5 py-4 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-150 max-h-[calc(100vh-72px)] overflow-y-auto">
          {!currentUser ? (
            <>
              {publicNavLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-bold text-slate-800 py-2 border-b border-slate-100 hover:text-[#800020] transition-colors"
                >
                  {item.label}
                </a>
              ))}
              <a
                href="#portal-login-card"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 bg-blue-900 text-white rounded-xl text-xs font-bold mt-2 shadow-xs"
              >
                Sign In to Portal →
              </a>
            </>
          ) : isStudent ? (
            /* Student Mobile Navigation Drawer */
            <>
              {/* Student Capsule Header */}
              <div
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenStudentProfileModal) onOpenStudentProfileModal();
                }}
                className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="w-11 h-11 rounded-full border-2 border-amber-600 p-0.5 bg-white shrink-0 overflow-hidden flex items-center justify-center">
                  <img
                    src={currentUser.avatar_url || defaultAvatar}
                    onError={(e) => { (e.target as HTMLImageElement).src = defaultAvatar; }}
                    alt="Student Avatar"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-black text-slate-900 truncate">
                    {currentUser.full_name}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500">
                    {currentUser.roll_number || 'UCMS-BSCS-2022-041'}
                  </div>
                  <div className="text-[10px] font-bold text-emerald-800">
                    {currentUser.department_name || 'Department of Computer Science'}
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-blue-900 text-amber-300 rounded text-[10px] font-extrabold uppercase">
                  Profile
                </span>
              </div>

              {/* 5 Student Tabs in Mobile Drawer */}
              <div className="flex flex-col gap-1 py-1">
                {studentTabsList.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = studentTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        if (onSelectStudentTab) onSelectStudentTab(tab.id);
                      }}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-blue-900 text-white shadow-xs font-black'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-slate-500'}`} />
                        <span>{tab.label}</span>
                      </div>
                      {tab.badge !== undefined && tab.badge > 0 && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            isActive ? 'bg-amber-400 text-blue-950' : 'bg-red-500 text-white'
                          }`}
                        >
                          {tab.badge}
                        </span>
                      )}
                      {tab.badge !== undefined && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            isActive ? 'bg-amber-400 text-blue-950' : 'bg-red-500 text-white'
                          }`}
                        >
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenStudentProfileModal) onOpenStudentProfileModal();
                  }}
                  className="w-full py-2.5 px-3 bg-white text-blue-950 border border-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-50 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4 text-amber-600" />
                  <span>My Profile (Details & Password)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full py-2.5 px-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-red-100 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          ) : isFaculty ? (
            /* Faculty Mobile Navigation Drawer (matching video 00:49 - 01:25) */
            <>
              {/* Faculty Profile Card */}
              <div
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenFacultyProfileModal) onOpenFacultyProfileModal();
                }}
                className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="w-11 h-11 rounded-full border-2 border-amber-500 overflow-hidden bg-white shrink-0 flex items-center justify-center">
                  <img
                    src={currentUser.avatar_url || defaultAvatar}
                    onError={(e) => { (e.target as HTMLImageElement).src = defaultAvatar; }}
                    alt="Faculty Portrait"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-black text-slate-900 truncate">
                    {currentUser.full_name || 'Prof. Asim Riaz'}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 truncate">
                    {currentUser.designation || 'Assistant Professor - CS'}
                  </div>
                  <div className="text-[10px] font-bold text-blue-900">
                    ID: {currentUser.institutional_id || 'UCMS-FAC-2018-042'}
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-blue-900 text-amber-300 rounded text-[10px] font-extrabold uppercase">
                  Profile
                </span>
              </div>

              {/* 5 Faculty Navigation Tabs in Mobile Drawer */}
              <div className="flex flex-col gap-1 py-1">
                {facultyTabsList.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = facultyTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        if (onSelectFacultyTab) onSelectFacultyTab(tab.id);
                      }}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-blue-900 text-white shadow-xs font-black'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-slate-500'}`} />
                        <span>{tab.label}</span>
                      </div>
                      {tab.badge !== undefined && tab.badge > 0 && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            isActive ? 'bg-amber-400 text-blue-950' : 'bg-red-500 text-white'
                          }`}
                        >
                          {tab.badge}
                        </span>
                      )}
                      {tab.badge !== undefined && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            isActive ? 'bg-amber-400 text-blue-950' : 'bg-amber-500 text-white'
                          }`}
                        >
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenFacultyProfileModal) onOpenFacultyProfileModal();
                  }}
                  className="w-full py-2.5 px-3 bg-white text-blue-950 border border-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-50 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4 text-amber-600" />
                  <span>Official Faculty Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full py-2.5 px-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-red-100 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          ) : isHod ? (
            /* HOD Mobile Navigation Drawer (3-lines menu icon) */
            <>
              <div
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenHodProfileModal) onOpenHodProfileModal();
                }}
                className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="w-12 h-12 rounded-full border-2 border-amber-500 bg-white shrink-0 overflow-hidden flex items-center justify-center shadow-xs">
                  <img
                    src={
                      currentUser.avatar_url ||
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80'
                    }
                    alt="HOD Portrait"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-black text-slate-900 truncate">{currentUser.full_name}</div>
                  <div className="text-[11px] font-mono text-slate-500 truncate">{currentUser.department_name || 'Department of Computer Science'}</div>
                  <div className="text-[10px] font-bold text-amber-700">Office: HOD Suite, Room 101</div>
                </div>
                <span className="px-2 py-0.5 bg-[#0f2744] text-amber-300 rounded text-[10px] font-extrabold uppercase shrink-0">
                  Profile
                </span>
              </div>

              {/* 4 HOD Tabs in Mobile Drawer */}
              <div className="flex flex-col gap-1 py-1">
                {hodTabsList.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = hodTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        if (onSelectHodTab) onSelectHodTab(tab.id);
                      }}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#0f2744] text-white shadow-xs font-black'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-slate-500'}`} />
                        <span>{tab.label}</span>
                      </div>
                      {tab.badge !== undefined && tab.badge > 0 && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            isActive ? 'bg-amber-400 text-blue-950' : 'bg-red-500 text-white'
                          }`}
                        >
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenHodProfileModal) onOpenHodProfileModal();
                  }}
                  className="w-full py-2.5 px-3 bg-white text-blue-950 border border-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-50 cursor-pointer shadow-2xs"
                >
                  <UserCheck className="w-4 h-4 text-amber-600" />
                  <span>Official HOD Leadership Profile</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setMobileMenuOpen(false); onLogout(); }}
                  className="w-full py-2.5 px-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-red-100 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          ) : isAdmin ? (
            /* Admin Mobile Navigation Drawer (3-lines menu icon) */
            <>
              <div
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenAdminProfileModal) onOpenAdminProfileModal();
                }}
                className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="w-12 h-12 rounded-full border-2 border-[#800020] bg-white shrink-0 overflow-hidden flex items-center justify-center shadow-xs">
                  <img
                    src={
                      currentUser.avatar_url ||
                      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80'
                    }
                    alt="Admin Portrait"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-black text-slate-900 truncate">{currentUser.full_name || 'Registrar Admin'}</div>
                  <div className="text-[11px] font-mono text-slate-500 truncate">{currentUser.institutional_id || 'UCMS-ADM-001'}</div>
                  <div className="text-[10px] font-bold text-[#800020]">Chief Registrar & Super Admin</div>
                </div>
                <span className="px-2 py-0.5 bg-[#800020] text-amber-300 rounded text-[10px] font-extrabold uppercase shrink-0">
                  Profile
                </span>
              </div>

              {/* 6 Admin Tabs in Mobile Drawer */}
              <div className="flex flex-col gap-1 py-1">
                {adminTabsList.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = adminTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        if (onSelectAdminTab) onSelectAdminTab(tab.id);
                      }}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-blue-900 text-white shadow-xs font-black'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-slate-500'}`} />
                        <span>{tab.label}</span>
                      </div>
                      {tab.badge !== undefined && tab.badge > 0 && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            isActive ? 'bg-amber-400 text-blue-950' : 'bg-red-500 text-white'
                          }`}
                        >
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenAdminProfileModal) onOpenAdminProfileModal();
                  }}
                  className="w-full py-2.5 px-3 bg-white text-slate-900 border border-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-50 cursor-pointer shadow-2xs"
                >
                  <UserCheck className="w-4 h-4 text-[#800020]" />
                  <span>Master Administrator Profile</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setMobileMenuOpen(false); onLogout(); }}
                  className="w-full py-2.5 px-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-red-100 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          ) : (
            /* Fallback Mobile Drawer */
            <>
              <div className="pb-2.5 border-b border-slate-100">
                <div className="text-sm font-extrabold text-slate-900">{currentUser.full_name}</div>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  {currentUser.role.toUpperCase()}
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setMobileMenuOpen(false); onLogout(); }}
                className="w-full text-center py-2.5 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-bold mt-1 cursor-pointer"
              >
                Sign Out of Workspace
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
};
