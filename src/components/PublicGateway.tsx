import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  GraduationCap,
  BookOpen,
  Building2,
  UserCog,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Award,
  Users,
  Compass,
  Clock,
  Sparkles,
  ArrowRight,
  Send,
  FileCheck,
  Microscope,
  Cpu,
  Binary,
  Layers,
  ChevronRight,
  Code2,
  Server,
  Bot,
  FlaskConical,
  TrendingUp,
  ShieldCheck,
  Globe,
} from 'lucide-react';
import { CmsSettings } from '../data/mockDatabase';

interface PublicGatewayProps {
  onLogin: (username: string, role: 'student' | 'teacher' | 'hod' | 'admin') => void;
  cms: CmsSettings;
}

export const PublicGateway: React.FC<PublicGatewayProps> = ({ onLogin, cms }) => {
  // Login form state - clean and empty at start as requested
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher' | 'hod' | 'admin'>('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Inquiry Form State matching Screenshot 2
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryDepartment, setInquiryDepartment] = useState('General Campus Inquiry');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquiryFeedback, setInquiryFeedback] = useState('');

  // Quick Application Modal State
  const [selectedApplyProgram, setSelectedApplyProgram] = useState<string | null>(null);
  const [applyApplicantName, setApplyApplicantName] = useState('');
  const [applyApplicantPhone, setApplyApplicantPhone] = useState('');
  const [applyApplicantMarks, setApplyApplicantMarks] = useState('');
  const [applyFeedback, setApplyFeedback] = useState('');

  // Role switch handler: switches active role without pre-filling credentials or showing description boxes
  const handleRoleSelect = (role: 'student' | 'teacher' | 'hod' | 'admin') => {
    setSelectedRole(role);
    setLoginError('');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setLoginError('Please enter both your institutional username and password.');
      return;
    }
    onLogin(username.trim(), selectedRole);
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName.trim() || !inquiryPhone.trim() || !inquiryEmail.trim() || !inquiryMessage.trim()) {
      setInquiryFeedback('Please fill out all required inquiry fields.');
      return;
    }
    setInquiryFeedback(
      `Thank you, ${inquiryName}! Your direct inquiry regarding "${inquiryDepartment}" has been submitted to the Office of the Registrar. An academic counselor will follow up via phone or email within 24 working hours.`
    );
    setInquiryName('');
    setInquiryPhone('');
    setInquiryEmail('');
    setInquiryMessage('');
    setTimeout(() => setInquiryFeedback(''), 6000);
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setApplyFeedback(
      `Application submitted for ${selectedApplyProgram}! Your provisional token is UCMS-ADM-${Math.floor(1000 + Math.random() * 9000)}. Please submit verified transcripts at the campus admission desk.`
    );
    setTimeout(() => {
      setApplyFeedback('');
      setSelectedApplyProgram(null);
      setApplyApplicantName('');
      setApplyApplicantPhone('');
      setApplyApplicantMarks('');
    }, 4500);
  };

  // 6 Accredited Academic Programs with prestigious emblems and micro-accents
  const academicPrograms = [
    {
      code: 'BSCS',
      title: 'BS Computer Science',
      duration: '4 Years (8 Semesters)',
      credits: '134 Credit Hours',
      faculty: 'Department of Computer Science',
      badge: 'STEM · COMPUTING',
      signBg: 'from-blue-600 via-indigo-600 to-indigo-800',
      icon: <Code2 className="w-7 h-7 text-white" />,
      description:
        'Rigorous computing curriculum covering algorithms, machine learning, distributed cloud architecture, database systems, and modern software engineering.',
      eligibility: 'Min 50% in F.Sc (Pre-Eng) / ICS / General Science with Mathematics',
      careers: 'Software Engineer, Data Scientist, ML Engineer, Cloud Solutions Architect',
    },
    {
      code: 'BSIT',
      title: 'BS Information Technology',
      duration: '4 Years (8 Semesters)',
      credits: '132 Credit Hours',
      faculty: 'Department of Information Technology',
      badge: 'NETWORKS & INFRASTRUCTURE',
      signBg: 'from-cyan-600 via-sky-600 to-blue-700',
      icon: <Server className="w-7 h-7 text-white" />,
      description:
        'Focused on enterprise network systems, cybersecurity defense, cloud virtualization, DevOps automation, and institutional database administration.',
      eligibility: 'Min 50% in F.Sc / ICS / F.A with Mathematics or Computer Studies',
      careers: 'Network Administrator, Cybersecurity Analyst, DevOps Engineer, IT Manager',
    },
    {
      code: 'BSAI',
      title: 'BS Artificial Intelligence',
      duration: '4 Years (8 Semesters)',
      credits: '134 Credit Hours',
      faculty: 'Department of Computer Science',
      badge: 'INTELLIGENT SYSTEMS',
      signBg: 'from-amber-500 via-amber-600 to-orange-700',
      icon: <Bot className="w-7 h-7 text-white" />,
      description:
        'Cutting-edge study of deep learning models, natural language processing, computer vision, robotics, and ethical AI development.',
      eligibility: 'Min 50% in F.Sc (Pre-Eng) / ICS with Mathematics',
      careers: 'AI Specialist, NLP Engineer, Computer Vision Researcher, Robotics Engineer',
    },
    {
      code: 'BS Chem',
      title: 'BS Chemistry',
      duration: '4 Years (8 Semesters)',
      credits: '136 Credit Hours',
      faculty: 'Faculty of Basic Sciences',
      badge: 'CHEMICAL SCIENCES',
      signBg: 'from-emerald-600 via-teal-600 to-emerald-800',
      icon: <FlaskConical className="w-7 h-7 text-white" />,
      description:
        'Comprehensive theoretical and experimental investigations across organic, inorganic, analytical, physical, and industrial chemistry.',
      eligibility: 'Min 50% in F.Sc Pre-Medical or Pre-Engineering',
      careers: 'Chemical Analyst, Pharmaceutical Researcher, Quality Controller, Forensic Scientist',
    },
    {
      code: 'BSMLT',
      title: 'BS Medical Laboratory Technology',
      duration: '4 Years (8 Semesters)',
      credits: '138 Credit Hours',
      faculty: 'Faculty of Allied Health Sciences',
      badge: 'CLINICAL PATHOLOGY',
      signBg: 'from-rose-600 via-red-600 to-rose-800',
      icon: <Microscope className="w-7 h-7 text-white" />,
      description:
        'Professional clinical diagnostic training encompassing clinical hematology, microbiology, molecular pathology, and clinical biochemistry.',
      eligibility: 'Min 50% in F.Sc Pre-Medical',
      careers: 'Clinical Laboratory Scientist, Medical Technologist, Pathology Specialist',
    },
    {
      code: 'BBA',
      title: 'Bachelor of Business Administration',
      duration: '4 Years (8 Semesters)',
      credits: '132 Credit Hours',
      faculty: 'Faculty of Management Sciences',
      badge: 'STRATEGIC MANAGEMENT',
      signBg: 'from-slate-800 via-blue-900 to-indigo-950',
      icon: <TrendingUp className="w-7 h-7 text-amber-300" />,
      description:
        'Strategic management program delivering leadership competence in corporate finance, digital marketing, supply chain, and entrepreneurship.',
      eligibility: 'Min 50% in Intermediate (F.A / F.Sc / I.Com / ICS)',
      careers: 'Business Analyst, Marketing Strategist, Corporate Banker, Operations Manager',
    },
  ];

  return (
    <div className="w-full bg-[#f8fafc] text-slate-900 overflow-x-hidden">
      
      {/* Official Marquee / Institutional Broadcast Ticker (Controlled via Admin CMS) */}
      {cms.institution_notice && (
        <div className="bg-[#800020] text-amber-200 text-xs font-bold py-2 px-4 shadow-sm border-b border-amber-900/40">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-blue-950 text-[10px] font-black uppercase tracking-wider shrink-0 shadow-2xs">
              OFFICIAL NOTICE
            </span>
            <span className="truncate text-white font-medium text-xs">
              {cms.institution_notice}
            </span>
          </div>
        </div>
      )}

      {/* =========================================================================
          HERO SECTION WITH CAMPUS BACKGROUND
          ========================================================================= */}
      <section
        id="home"
        className="relative min-h-[calc(100vh-72px)] flex items-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-200 overflow-hidden"
      >
        {/* Background Image Layer (Customizable via Admin CMS) */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-500"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(248, 250, 252, 0.72) 0%, rgba(248, 250, 252, 0.55) 50%, rgba(248, 250, 252, 0.88) 100%), url('${
              cms.background_image || './assets/aistudio/images-extractpics_fa9aed82.jpg'
            }'), url('./campus.jpg')`,
            backgroundPosition: 'center 32%',
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT COLUMN: INSTITUTIONAL HERITAGE & DIRECT GATEWAYS (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-5 sm:gap-6">
            
            {/* Top Pill Badge */}
            <div>
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/90 text-blue-950 border border-slate-200 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span>
                {cms.institution_notice || 'Registered Higher Education Institution - Khanewal Campus'}
              </span>
            </div>

            {/* UCMS Seal (Larger Logo) & Header */}
            <div>
              <div className="flex items-center gap-4 mb-3.5">
                <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full border-3 border-[#800020] p-1.5 bg-white shadow-md overflow-hidden shrink-0 flex items-center justify-center">
                  <img
                    src="./assets/aistudio/logo_c68140aa.png"
                    onError={(e) => { (e.target as HTMLImageElement).src = './logo.png'; }}
                    alt="UCMS Official Crest"
                    className="w-full h-full object-contain rounded-full"
                  />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-black text-[#800020] tracking-wider uppercase block">
                    University College of Management and Sciences
                  </span>
                  <span className="text-sm sm:text-base font-bold text-amber-700">
                    Khanewal Campus · Learning Today for a Better Tomorrow
                  </span>
                </div>
              </div>

              <h1 className="font-serif-collegiate text-3xl sm:text-4xl lg:text-[42px] font-black text-blue-950 tracking-tight leading-[1.15] text-balance">
                UCMS Academic Repository & Management System
              </h1>
            </div>

            {/* Description */}
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed max-w-2xl font-medium">
              Official centralized repository and academic management system for the University College of Management and Sciences (UCMS), Khanewal. Streamlining departmental resources, verified curricula, student cohorts, and administrative governance.
            </p>

            {/* DIRECT INSTITUTIONAL GATEWAYS */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-xs font-black text-blue-950 uppercase tracking-wider">
                  DIRECT INSTITUTIONAL GATEWAYS
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  Select your role
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                {/* Student */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect('student')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedRole === 'student'
                      ? 'border-blue-900 bg-blue-50/70 shadow-xs ring-2 ring-blue-900/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center mb-2">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-xs text-blue-950">Student Portal</div>
                  <div className="text-[11px] text-slate-500">Scholars & LMS</div>
                </button>

                {/* Faculty */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect('teacher')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedRole === 'teacher'
                      ? 'border-blue-900 bg-blue-50/70 shadow-xs ring-2 ring-blue-900/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center mb-2">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-xs text-blue-950">Teacher Portal</div>
                  <div className="text-[11px] text-slate-500">Faculty & Lectures</div>
                </button>

                {/* HOD CS */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect('hod')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedRole === 'hod'
                      ? 'border-blue-900 bg-blue-50/70 shadow-xs ring-2 ring-blue-900/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center mb-2">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-xs text-blue-950">HOD CS Console</div>
                  <div className="text-[11px] text-slate-500">CS Chair Authority</div>
                </button>

                {/* Admin */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect('admin')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedRole === 'admin'
                      ? 'border-blue-900 bg-blue-50/70 shadow-xs ring-2 ring-blue-900/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center mb-2">
                    <UserCog className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-xs text-blue-950">Master Admin</div>
                  <div className="text-[11px] text-slate-500">Registrar Office</div>
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Merit-Based Higher Education
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Continuous Cohort Progression
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Career Placement Directorate
              </span>
            </div>

          </div>

          {/* RIGHT COLUMN: HERO LOGIN CARD (CLEAN: ZERO CREDENTIALS DISPLAYED ON WEBSITE) */}
          <div className="lg:col-span-5" id="portal-login-card">
            <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-xl p-6 sm:p-7 relative overflow-hidden">
              
              {/* Card Header & Active Role Badge */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-black text-blue-950 tracking-tight">
                    INSTITUTIONAL PORTAL LOGIN
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Centralized Academic Identity & Secure Access
                  </p>
                </div>
                <span className="px-2.5 py-1 text-[11px] font-black uppercase tracking-wider rounded-md bg-blue-900 text-white shrink-0">
                  {selectedRole.toUpperCase()}
                </span>
              </div>

              {/* 4 Role Switcher Tabs */}
              <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-lg mb-4">
                {(['student', 'teacher', 'hod', 'admin'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRoleSelect(r)}
                    className={`py-1.5 text-xs font-bold rounded-md transition-colors ${
                      selectedRole === r
                        ? 'bg-blue-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    {r === 'teacher' ? 'Faculty' : r === 'hod' ? 'HOD' : r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>


              {loginError && (
                <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs font-semibold text-red-700">
                  {loginError}
                </div>
              )}

              {/* Native Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Username or Institutional Email
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter official username (e.g. shahzaib, dr_amna)"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 font-medium"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-xs font-semibold text-blue-900 hover:text-blue-950 flex items-center gap-1"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showPassword ? 'Hide' : 'Show'}</span>
                    </button>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter security password"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 font-medium"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-blue-900 hover:bg-blue-950 text-white font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  Sign In to Portal →
                </button>
              </form>

              <p className="mt-4 text-[11px] text-slate-400 text-center leading-normal">
                Accounts are pre-registered by the UCMS Administration. Please use your official institutional credentials.
              </p>

            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 1: KEY UNIVERSITY METRICS (FACULTIES, SENIOR, ACADEMICS, SEMESTERS)
          ========================================================================= */}
      <section className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-black text-[#800020] uppercase tracking-wider block mb-1">
            UCMS Khanewal At A Glance
          </span>
          <h2 className="font-serif-collegiate text-2xl sm:text-3xl lg:text-4xl font-black text-blue-950 tracking-tight">
            Institutional Strength & Academic Scale
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Established under recognized standards, delivering accredited undergraduate education across South Punjab.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          
          {/* Metric 1: Academic Faculties */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center mb-4">
              <Building2 className="w-6 h-6" />
            </div>
            <span className="text-3xl font-black text-blue-950 block tabular-nums">
              {cms.stat_faculties || '4 Academic'}
            </span>
            <span className="text-xs font-bold text-[#800020] uppercase tracking-wider block mt-1">
              Specialized Faculties
            </span>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Computer Science, Information Technology, Management Sciences, and Commerce.
            </p>
          </div>

          {/* Metric 2: Senior Faculty Members */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-3xl font-black text-blue-950 block tabular-nums">
              {cms.stat_faculty_members || '48+ Senior'}
            </span>
            <span className="text-xs font-bold text-[#800020] uppercase tracking-wider block mt-1">
              Faculty Academicians
            </span>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Distinguished professors, PhD scholars, and experienced lecturers mentoring every cohort.
            </p>
          </div>

          {/* Metric 3: Enrolled Scholars */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-4">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-3xl font-black text-blue-950 block tabular-nums">
              {cms.stat_students || '1,200+ Enrolled'}
            </span>
            <span className="text-xs font-bold text-[#800020] uppercase tracking-wider block mt-1">
              Undergraduate Scholars
            </span>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Full-time registered scholars learning on campus with merit scholarships and career focus.
            </p>
          </div>

          {/* Metric 4: Enrolled Semesters / Labs */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-900 flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="text-3xl font-black text-blue-950 block tabular-nums">
              {cms.stat_labs || '8 Enrolled'}
            </span>
            <span className="text-xs font-bold text-[#800020] uppercase tracking-wider block mt-1">
              State-of-the-Art Labs
            </span>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Synchronized 4-year degree milestones with continuous assessment and capstone FYP defense.
            </p>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 2: ADMISSIONS & SESSIONS (MATCHING SCREENSHOT EXACTLY)
          ========================================================================= */}
      <section
        id="admissions-calendar"
        className="relative py-14 sm:py-16 px-4 sm:px-6 lg:px-8 border-y border-slate-200 overflow-hidden"
      >
        <div
          className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-500"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(248, 250, 252, 0.78) 0%, rgba(248, 250, 252, 0.65) 50%, rgba(248, 250, 252, 0.9) 100%), url('${
              cms.background_image || './assets/aistudio/images-extractpics_fa9aed82.jpg'
            }'), url('./campus.jpg')`,
            backgroundPosition: 'center 32%',
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* LEFT COLUMN: LAST DATE FOR SUBMISSION OF APPLICATION (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border-2 border-amber-500 p-6 sm:p-8 shadow-sm flex flex-col justify-between">
            <div>
              {/* Header Badges */}
              <div className="flex items-center gap-2.5 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-400">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Active Admission Cycle
                </span>
                <span className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase">
                  IMPORTANT NOTICE
                </span>
              </div>

              {/* Title in Collegiate Serif */}
              <h2 className="font-serif-collegiate text-2xl sm:text-[27px] font-black text-[#1e3a8a] tracking-tight uppercase leading-[1.2] mb-5">
                LAST DATE FOR SUBMISSION OF APPLICATION
              </h2>

              {/* Gray Inset Details Box */}
              <div className="bg-[#f8fafc] border border-slate-200 rounded-2xl p-4 sm:p-5 mb-5 space-y-1.5">
                <div className="font-mono font-bold text-red-600 text-sm sm:text-[15px]">
                  {cms.admission_term || 'Spring 2025'} Deadline: {cms.admission_deadline || 'January 15, 2025'}
                </div>
                <div className="font-mono font-bold text-slate-800 text-xs sm:text-sm">
                  Active Intake Applications: Open
                </div>
                <p className="text-xs text-slate-500 pt-2.5 border-t border-slate-200/80 leading-relaxed font-normal">
                  Applications received after 04:00 PM on the cutoff date will be considered in the second merit list subject to seat availability.
                </p>
              </div>

              {/* Checklist */}
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2.5 text-xs text-slate-700 font-medium leading-relaxed">
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Merit-based scholarships available for applicants with 75%+ marks in Intermediate</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-700 font-medium leading-relaxed">
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Fast-track verification desk operational at Main Campus Admissions Office</span>
                </div>
              </div>
            </div>

            {/* Bottom Button */}
            <a
              href="#contact-us"
              className="w-full mt-4 py-3.5 px-4 bg-[#1e3a8a] hover:bg-[#172554] text-white font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Submit Inquiry Form</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* RIGHT COLUMN: STACKED OFFICIAL SESSIONS & ELIGIBILITY (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* CARD 1: OFFICIAL ADMISSION SESSIONS (2025) */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs">
              <div className="flex items-center gap-2.5 mb-5">
                <Calendar className="w-5 h-5 text-amber-600" />
                <h3 className="font-serif-collegiate text-xl sm:text-2xl font-black text-[#1e3a8a] tracking-tight">
                  OFFICIAL ADMISSION SESSIONS (2025)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Active Intake Cycle */}
                <div className="border border-blue-200 bg-blue-50/40 rounded-2xl p-4 sm:p-5 space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-blue-950">{cms.admission_term || 'Spring 2025 Intake'}</span>
                    <span className="px-2 py-0.5 text-[10px] font-black rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                      NOW OPEN
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    <div><strong className="text-slate-800">Admission Cycle:</strong> {cms.admission_term || 'Spring 2025'}</div>
                    <div><strong className="text-slate-800">Deadline:</strong> {cms.admission_deadline || 'January 15, 2025'}</div>
                    <div><strong className="text-slate-800">Merit List:</strong> Rolling Evaluations</div>
                    <div><strong className="text-slate-800">Classes Begin:</strong> Semester Onboarding</div>
                  </div>
                </div>

                {/* Fall 2025 Intake */}
                <div className="border border-slate-200 bg-slate-50/50 rounded-2xl p-4 sm:p-5 space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-blue-950">Fall 2025 Intake</span>
                    <span className="px-2 py-0.5 text-[10px] font-black rounded bg-amber-100 text-amber-800 border border-amber-300">
                      PRE-REGISTRATION
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    <div><strong className="text-slate-800">Applications Open:</strong> July 01, 2025</div>
                    <div><strong className="text-slate-800">Deadline:</strong> August 25, 2025</div>
                    <div><strong className="text-slate-800">Merit List:</strong> August 28, 2025</div>
                    <div><strong className="text-slate-800">Classes Begin:</strong> September 15, 2025</div>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 2: ELIGIBILITY CRITERIA & ADMISSION PROCEDURE */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs">
              <h3 className="font-serif-collegiate text-xl sm:text-2xl font-black text-[#1e3a8a] tracking-tight mb-4">
                ELIGIBILITY CRITERIA & ADMISSION PROCEDURE
              </h3>

              {/* Undergraduate Eligibility Box */}
              <div className="bg-[#f8fafc] border border-slate-200 rounded-2xl p-4 sm:p-5 mb-4">
                <strong className="text-xs font-bold text-slate-900 block mb-1">
                  Undergraduate Eligibility:
                </strong>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Candidates must possess an Intermediate certificate (FA, F.Sc Pre-Engineering, Pre-Medical, ICS, I.Com, or equivalent qualification) with a minimum of 45% to 50% marks depending on the chosen discipline (50% for BSCS and BSIT; 45% for BBA and BS Commerce).
                </p>
              </div>

              {/* 4 Step Boxes in a row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <div className="text-xs font-bold text-blue-950">1. Inquiry</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">Submit form or visit campus</div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <div className="text-xs font-bold text-blue-950">2. Verification</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">Provide transcripts & CNIC</div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <div className="text-xs font-bold text-blue-950">3. Challan</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">Pay fee at designated bank</div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <div className="text-xs font-bold text-blue-950">4. Enrollment</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">Receive Roll No & portal ID</div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 3: ACADEMIC DEGREE PROGRAMS (BSCS, BSIT, BSAI, BS CHEM, BSMLT, BBA)
          ========================================================================= */}
      <section id="academic-programs" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
          <span className="text-xs font-black text-[#800020] uppercase tracking-widest block mb-1.5">
            UNDERGRADUATE OFFERINGS
          </span>
          <h2 className="font-serif-collegiate text-2xl sm:text-3xl lg:text-4xl font-black text-blue-950 tracking-tight">
            Accredited Academic Degree Programs
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 font-medium">
            Explore our 4-year undergraduate degrees designed to bridge theoretical knowledge with real-world industry practice.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {academicPrograms.map((prog) => (
            <div
              key={prog.code}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group flex flex-col justify-between"
            >
              {/* Top Accent Line */}
              <div className="h-1.5 w-full bg-[#1e3a8a] group-hover:bg-[#d97706] transition-colors"></div>

              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                <div>
                  {/* Top Sign Emblem & Badges */}
                  <div className="flex items-start justify-between gap-3 mb-5">
                    {/* Prestigious Sign Emblem */}
                    <div className="w-13 h-13 rounded-2xl bg-[#1e3a8a] text-white p-3 flex items-center justify-center shadow-xs group-hover:bg-[#172554] transition-colors shrink-0">
                      {prog.icon}
                    </div>

                    {/* Metadata Badges */}
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="font-mono text-xs font-black text-blue-950 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200">
                        {prog.code}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {prog.credits}
                      </span>
                    </div>
                  </div>

                  {/* Title & Faculty */}
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-900 transition-colors leading-snug">
                    {prog.title}
                  </h3>
                  <span className="text-xs font-bold text-[#800020] block mt-1">
                    {prog.faculty}
                  </span>

                  <p className="text-xs text-slate-600 mt-3.5 leading-relaxed font-normal">
                    {prog.description}
                  </p>

                  {/* Program Highlights */}
                  <div className="mt-5 pt-4 border-t border-slate-100 space-y-2 text-xs">
                    <div className="flex items-start gap-1.5">
                      <span className="font-bold text-slate-700 shrink-0">Duration:</span>
                      <span className="text-slate-500">{prog.duration}</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="font-bold text-slate-700 shrink-0">Eligibility:</span>
                      <span className="text-slate-500">{prog.eligibility}</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="font-bold text-slate-700 shrink-0">Career:</span>
                      <span className="text-slate-500">{prog.careers}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Open Spring 2025
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedApplyProgram(prog.title)}
                    className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5 group-hover:gap-2 cursor-pointer"
                  >
                    <span>Apply Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: DISTINGUISHED FACULTY OVERVIEW (MATCHING SCREENSHOT 1 EXACTLY)
          ========================================================================= */}
      <section id="faculty-overview" className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header matching Screenshot 1 */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1">
                <span>SCHOLARLY MENTORSHIP</span>
                <span>·</span>
                <span>KHANEWAL CAMPUS FACULTY</span>
              </div>
              <h2 className="font-serif-collegiate text-2xl sm:text-3xl font-black text-blue-950 tracking-tight">
                DISTINGUISHED FACULTY OVERVIEW
              </h2>
            </div>
            <div className="text-xs text-slate-500 max-w-md text-left md:text-right">
              Departmental chairs, professors, and lecturers holding Ph.D., MS, and M.Phil degrees from premier institutions.
            </div>
          </div>

          {/* 6 Distinguished Faculty Cards (Responsive 3x2 Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Card 1: Engr. Dr. Tariq Mahmood */}
            <div className="bg-[#f8fafc] rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-shadow">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#1e3a8a] text-white font-black text-sm flex items-center justify-center shadow-xs">
                    TM
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200">
                    Computer Science
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  Engr. Dr. Tariq Mahmood
                </h3>
                <div className="text-xs font-bold text-amber-700 mt-0.5">
                  Associate Professor & Senior Academic Chair
                </div>

                <div className="text-xs text-slate-600 mt-3 space-y-1">
                  <div className="flex items-start gap-1.5">
                    <span className="text-slate-400">🎓</span>
                    <span>Ph.D. in Computer Science, MS Software Engineering</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-slate-400">🔬</span>
                    <span>Distributed Systems, Cloud Architecture & ML</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3.5 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>16+ Years Experience</span>
                <span className="text-blue-900 font-semibold truncate max-w-[150px]">tariq.mahmood@ucmsacademic.com</span>
              </div>
            </div>

            {/* Card 2: Dr. Muhammad Asif Raza */}
            <div className="bg-[#f8fafc] rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-shadow">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#1e3a8a] text-white font-black text-sm flex items-center justify-center shadow-xs">
                    AR
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200">
                    BUSINESS ADMIN
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  Dr. Muhammad Asif Raza
                </h3>
                <div className="text-xs font-bold text-amber-700 mt-0.5">
                  Professor of Management & HOD
                </div>

                <div className="text-xs text-slate-600 mt-3 space-y-1">
                  <div className="flex items-start gap-1.5">
                    <span className="text-slate-400">🎓</span>
                    <span>Ph.D. in Management Sciences, MBA (Finance)</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-slate-400">🔬</span>
                    <span>Strategic Corporate Management & Finance</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3.5 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>18+ Years Experience</span>
                <span className="text-blue-900 font-semibold truncate max-w-[150px]">asif.raza@ucmsacademic.com</span>
              </div>
            </div>

            {/* Card 3: Prof. Naveed Iqbal Malik */}
            <div className="bg-[#f8fafc] rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-shadow">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#1e3a8a] text-white font-black text-sm flex items-center justify-center shadow-xs">
                    NM
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200">
                    BSMLT
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  Prof. Naveed Iqbal Malik
                </h3>
                <div className="text-xs font-bold text-amber-700 mt-0.5">
                  Associate Professor & Senior Lecturer
                </div>

                <div className="text-xs text-slate-600 mt-3 space-y-1">
                  <div className="flex items-start gap-1.5">
                    <span className="text-slate-400">🎓</span>
                    <span>M.Phil Commerce, ACMA, M.Com (Gold Medalist)</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-slate-400">🔬</span>
                    <span>Advanced Cost Accounting, Auditing & IFRS</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3.5 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>14+ Years Experience</span>
                <span className="text-blue-900 font-semibold truncate max-w-[150px]">naveed.malik@ucmsacademic.com</span>
              </div>
            </div>

            {/* Card 4: Dr. Amna Tariq */}
            <div className="bg-[#f8fafc] rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-shadow">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#1e3a8a] text-white font-black text-sm flex items-center justify-center shadow-xs">
                    AT
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                    ARTIFICIAL INTEL
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  Dr. Amna Tariq
                </h3>
                <div className="text-xs font-bold text-amber-700 mt-0.5">
                  Assistant Professor & AI Lead
                </div>

                <div className="text-xs text-slate-600 mt-3 space-y-1">
                  <div className="flex items-start gap-1.5">
                    <span className="text-slate-400">🎓</span>
                    <span>Ph.D. in Computing & Data Mining, MS IT</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-slate-400">🔬</span>
                    <span>Deep Learning, Predictive Modeling & Neural Systems</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3.5 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>11+ Years Experience</span>
                <span className="text-blue-900 font-semibold truncate max-w-[150px]">amna.tariq@ucmsacademic.com</span>
              </div>
            </div>

            {/* Card 5: Dr. Waqas Ahmed */}
            <div className="bg-[#f8fafc] rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-shadow">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#1e3a8a] text-white font-black text-sm flex items-center justify-center shadow-xs">
                    WA
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 border border-indigo-200">
                    NETWORKS & CYBER
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  Dr. Waqas Ahmed
                </h3>
                <div className="text-xs font-bold text-amber-700 mt-0.5">
                  Associate Professor & Research Lead
                </div>

                <div className="text-xs text-slate-600 mt-3 space-y-1">
                  <div className="flex items-start gap-1.5">
                    <span className="text-slate-400">🎓</span>
                    <span>Ph.D. in Computer Networks, MS Network Security</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-slate-400">🔬</span>
                    <span>Cybersecurity, IoT Architecture & Wireless Protocols</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3.5 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>13+ Years Experience</span>
                <span className="text-blue-900 font-semibold truncate max-w-[150px]">waqas.ahmed@ucmsacademic.com</span>
              </div>
            </div>

            {/* Card 6: Dr. Farhan Ali */}
            <div className="bg-[#f8fafc] rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-shadow">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#1e3a8a] text-white font-black text-sm flex items-center justify-center shadow-xs">
                    FA
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-100 text-teal-900 border border-teal-200">
                    SOFTWARE SYSTEMS
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  Dr. Farhan Ali
                </h3>
                <div className="text-xs font-bold text-amber-700 mt-0.5">
                  Assistant Professor & Systems Specialist
                </div>

                <div className="text-xs text-slate-600 mt-3 space-y-1">
                  <div className="flex items-start gap-1.5">
                    <span className="text-slate-400">🎓</span>
                    <span>Ph.D. in Software Engineering, MS Computer Science</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-slate-400">🔬</span>
                    <span>Formal Verification, Software Quality & Distributed Algorithms</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3.5 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>10+ Years Experience</span>
                <span className="text-blue-900 font-semibold truncate max-w-[150px]">farhan.ali@ucmsacademic.com</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 5: INSTITUTIONAL & DEPARTMENTAL VISION (BEAUTIFUL & PRESTIGIOUS)
          ========================================================================= */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
        
        {/* Header matching Screenshot 3 with enhanced typography */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-3 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-black text-[#800020] uppercase tracking-widest mb-1.5">
              <span>GUIDING PRINCIPLES</span>
              <span>·</span>
              <span>MISSION & MANDATE</span>
            </div>
            <h2 className="font-serif-collegiate text-2xl sm:text-3xl lg:text-4xl font-black text-blue-950 tracking-tight">
              INSTITUTIONAL & DEPARTMENTAL VISION
            </h2>
          </div>
          <div className="text-xs sm:text-sm text-slate-500 max-w-md text-left md:text-right font-medium">
            Strategic roadmaps shaping ethical leadership, computing excellence, and socio-economic transformation.
          </div>
        </div>

        {/* Two Enhanced Vision Cards (Responsive Tablet & Mobile Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          
          {/* Card 1: Institutional Vision of UCMS */}
          <div className="bg-white rounded-3xl border border-slate-200 border-t-4 border-t-amber-600 p-6 sm:p-7 lg:p-8 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
                <span className="text-[10px] sm:text-[10.5px] font-black uppercase tracking-wider px-2.5 sm:px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                  UCMS FOUNDATIONAL CHARTER
                </span>
                <span className="text-xs font-bold text-amber-700">Khanewal Campus</span>
              </div>

              <h3 className="font-serif-collegiate text-xl sm:text-2xl font-black text-blue-950 uppercase tracking-tight">
                INSTITUTIONAL VISION OF UCMS
              </h3>

              <div className="my-2.5 text-xs font-bold text-amber-700 italic">
                "Learning Today for a Better Tomorrow"
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                To establish UCMS Khanewal as a distinguished center of higher academic learning in South Punjab, empowering graduates with ethical character, rigorous critical inquiry, modern technological competence, and visionary leadership to elevate society and enterprise.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                Academic Integrity
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold shadow-2xs">
                <Award className="w-4 h-4 text-amber-600 shrink-0" />
                Research Excellence
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold shadow-2xs">
                <Globe className="w-4 h-4 text-blue-600 shrink-0" />
                Regional Empowerment
              </span>
            </div>
          </div>

          {/* Card 2: Department of CS Vision */}
          <div className="bg-white rounded-3xl border border-slate-200 border-t-4 border-t-[#1e3a8a] p-6 sm:p-7 lg:p-8 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
                <span className="text-[10px] sm:text-[10.5px] font-black uppercase tracking-wider px-2.5 sm:px-3 py-1 rounded-full bg-blue-50 text-blue-900 border border-blue-200">
                  COMPUTING & IT CHARTER
                </span>
                <span className="text-xs font-bold text-blue-800">Department of Computer Science</span>
              </div>

              <h3 className="font-serif-collegiate text-xl sm:text-2xl font-black text-blue-950 uppercase tracking-tight">
                DEPARTMENT OF CS VISION
              </h3>

              <div className="my-2.5 text-xs font-bold text-blue-800 italic">
                Engineering the Computing Future of South Punjab
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                The Department of Computer Science envisions producing forward-thinking software engineers, data scientists, and computing architects equipped with profound algorithmic knowledge, robust development skills, and high ethical standards to drive technological innovation globally and regionally.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold shadow-2xs">
                <Binary className="w-4 h-4 text-blue-700 shrink-0" />
                Algorithmic Mastery
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold shadow-2xs">
                <Cpu className="w-4 h-4 text-indigo-700 shrink-0" />
                Applied Software Engineering
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold shadow-2xs">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                Intelligent Systems
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 6: GET IN TOUCH WITH UCMS (MATCHING SCREENSHOT 2 EXACTLY)
          ========================================================================= */}
      <section id="contact-us" className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 bg-slate-100/70 border-t border-slate-200">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header matching Screenshot 2 */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-300">
            <div>
              <h2 className="font-serif-collegiate text-2xl sm:text-3xl font-black text-blue-950 tracking-tight">
                GET IN TOUCH WITH UCMS
              </h2>
            </div>
            <div className="text-xs text-slate-500">
              Desk for academic queries, verification, and visits.
            </div>
          </div>

          {/* 2-Column Split matching Screenshot 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            
            {/* LEFT BOX: INFORMATION DETAILS (5 Cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-6">
              
              {/* Item 1: Campus Location & Address */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-900 shrink-0" />
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    CAMPUS LOCATION & ADDRESS
                  </h3>
                </div>
                <div className="text-xs font-bold text-amber-700 pl-6">
                  Khanewal, Punjab
                </div>
                <div className="text-xs text-slate-600 pl-6 leading-relaxed">
                  <strong>University College of Management and Sciences (UCMS)</strong><br />
                  {cms.campus_address || 'Main Campus, Lahore-Multan Highway, Khanewal, Punjab, Pakistan.'}
                </div>
              </div>

              {/* Item 2: Telephone / Information Desk */}
              <div className="space-y-1 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-900 shrink-0" />
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Telephone / Information Desk
                  </h3>
                </div>
                <div className="text-xs text-slate-700 pl-6 font-mono space-y-0.5">
                  <div>{cms.campus_contact_phone || '+92 (65) 255-4400 / 255-4422'}</div>
                  <div className="text-emerald-700 font-bold">Admissions Hotline: {cms.campus_contact_phone || '+92 300 1234567'}</div>
                </div>
              </div>

              {/* Item 3: Electronic Mail Inquiries */}
              <div className="space-y-1 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-900 shrink-0" />
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Electronic Mail Inquiries
                  </h3>
                </div>
                <div className="text-xs text-slate-700 pl-6 font-mono">
                  General & Admissions: <span className="text-blue-900 font-bold">{cms.campus_contact_email || 'registrar@ucmsacademic.com'}</span>
                </div>
              </div>

              {/* Item 4: Registrar & Administrative Timings */}
              <div className="space-y-1 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-900 shrink-0" />
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Registrar & Administrative Timings
                  </h3>
                </div>
                <div className="text-xs text-slate-600 pl-6 leading-relaxed">
                  Monday - Friday: 08:30 AM - 04:00 PM (Saturday Admissions: 09:00 AM - 01:00 PM)<br />
                  <span className="text-red-700 font-semibold">Sunday Closed</span>
                </div>
              </div>

            </div>

            {/* RIGHT BOX: SEND DIRECT INQUIRY FORM (7 Cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
              
              <div>
                <h3 className="text-sm sm:text-base font-black text-blue-950 uppercase tracking-tight">
                  SEND DIRECT INQUIRY TO ADMISSIONS & REGISTRAR
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Fill in your details below and an academic counselor will follow up via phone or email within 24 working hours.
                </p>
              </div>

              {inquiryFeedback && (
                <div className="p-3.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {inquiryFeedback}
                </div>
              )}

              <form onSubmit={handleInquirySubmit} className="space-y-4">
                
                {/* Row 1: Full Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      placeholder="e.g. Muhammad Hamza"
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900 font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      value={inquiryPhone}
                      onChange={(e) => setInquiryPhone(e.target.value)}
                      placeholder="0300-1234567"
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900 font-medium"
                      required
                    />
                  </div>
                </div>

                {/* Row 2: Email Address & Department/Program */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={inquiryEmail}
                      onChange={(e) => setInquiryEmail(e.target.value)}
                      placeholder="hamza@example.com"
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900 font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Department / Program
                    </label>
                    <select
                      value={inquiryDepartment}
                      onChange={(e) => setInquiryDepartment(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900 font-medium bg-white"
                    >
                      <option value="General Campus Inquiry">General Campus Inquiry</option>
                      <option value="BS Computer Science">BS Computer Science</option>
                      <option value="BS Information Technology">BS Information Technology</option>
                      <option value="BS Artificial Intelligence">BS Artificial Intelligence</option>
                      <option value="BS Chemistry">BS Chemistry</option>
                      <option value="BS Medical Laboratory Technology">BS Medical Laboratory Technology</option>
                      <option value="Bachelor of Business Administration">Bachelor of Business Administration</option>
                    </select>
                  </div>
                </div>

                {/* Row 3: Inquiry Message */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Inquiry Message *
                  </label>
                  <textarea
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    rows={3}
                    placeholder="Please enter your specific academic or admission inquiry..."
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900 font-medium"
                    required
                  ></textarea>
                </div>

                {/* Submit Inquiry Button */}
                <div>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Inquiry</span>
                  </button>
                </div>

              </form>

              {/* Footnote matching Screenshot 2 */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
                <span>Direct inquiries welcome at Campus Reception</span>
                <span className="font-semibold text-slate-500">Office of the Registrar</span>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-amber-500 bg-white p-0.5 overflow-hidden">
              <img
                src="./assets/aistudio/logo_c68140aa.png"
                onError={(e) => { (e.target as HTMLImageElement).src = './logo.png'; }}
                alt="UCMS Crest"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <div>
              <span className="font-extrabold text-white text-sm block">UCMS KHANEWAL</span>
              <span className="text-[10px] text-amber-400">University College of Management and Sciences</span>
            </div>
          </div>

          <div className="text-center sm:text-right text-[11px]">
            <div>© {new Date().getFullYear()} University College of Management and Sciences, Khanewal.</div>
            <div className="text-slate-500 mt-0.5">Official Campus Web Platform · Built for Academic Excellence</div>
          </div>
        </div>
      </footer>

      {/* QUICK APPLICATION MODAL */}
      {selectedApplyProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div>
                <span className="text-[10px] font-black text-[#800020] uppercase tracking-wider block">Spring 2027 Admissions</span>
                <h3 className="text-base font-bold text-blue-950">Apply for {selectedApplyProgram}</h3>
              </div>
              <button
                onClick={() => setSelectedApplyProgram(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {applyFeedback ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p>{applyFeedback}</p>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Applicant Full Name
                  </label>
                  <input
                    type="text"
                    value={applyApplicantName}
                    onChange={(e) => setApplyApplicantName(e.target.value)}
                    placeholder="e.g. Shahzaib Alam"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contact Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={applyApplicantPhone}
                    onChange={(e) => setApplyApplicantPhone(e.target.value)}
                    placeholder="0300-1234567"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Intermediate / HSSC Marks (or Percentage)
                  </label>
                  <input
                    type="text"
                    value={applyApplicantMarks}
                    onChange={(e) => setApplyApplicantMarks(e.target.value)}
                    placeholder="e.g. 840/1100 or 76%"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-900"
                    required
                  />
                </div>

                <div className="p-2.5 bg-blue-50 rounded-lg text-[11px] text-blue-900 leading-normal">
                  Submitting generates a provisional application token. Verified copies of CNIC/B-Form, Matric, and Intermediate certificates must be submitted at the UCMS Khanewal Admission Office before December 15.
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedApplyProgram(null)}
                    className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer"
                  >
                    Submit Application
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
