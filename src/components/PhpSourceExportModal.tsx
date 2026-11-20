import React, { useState } from 'react';
import { X, Copy, Check, Download, FileCode, Database, Server } from 'lucide-react';

interface PhpSourceExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PhpSourceExportModal: React.FC<PhpSourceExportModalProps> = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<string>('database.sql');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const fileMap: Record<string, { label: string; desc: string; type: string }> = {
    'database.sql': { label: 'database.sql', desc: 'Complete MySQL 8.0 schema and seed dataset', type: 'sql' },
    'config/db.php': { label: 'config/db.php', desc: 'Singleton PDO database connection', type: 'php' },
    'index.php': { label: 'index.php', desc: 'Master gateway controller (public + 4 roles)', type: 'php' },
    'login.php': { label: 'login.php', desc: 'Native authentication & bcrypt validation', type: 'php' },
    'logout.php': { label: 'logout.php', desc: 'Session destruction & audit logging', type: 'php' },
    'change_password.php': { label: 'change_password.php', desc: 'First-login password security enforcement', type: 'php' },
    'actions.php': { label: 'actions.php', desc: 'API endpoints: conflicts, quota, promotions', type: 'php' },
    'views/public_view.php': { label: 'views/public_view.php', desc: 'Public homepage & central login gateway', type: 'php' },
    'views/student_view.php': { label: 'views/student_view.php', desc: 'Student workspace (3-col, 30% campus bg)', type: 'php' },
    'views/teacher_view.php': { label: 'views/teacher_view.php', desc: 'Faculty console & versioned handouts', type: 'php' },
    'views/hod_view.php': { label: 'views/hod_view.php', desc: 'HOD CS leadership console (strict CS only)', type: 'php' },
    'views/admin_view.php': { label: 'views/admin_view.php', desc: 'Admin console & cohort promotion engine', type: 'php' },
    'css/style.css': { label: 'css/style.css', desc: 'Modern responsive CSS3 with zero overflow', type: 'css' },
    'js/main.js': { label: 'js/main.js', desc: 'Pure vanilla JavaScript client engine', type: 'js' },
  };

  const handleCopy = () => {
    // In production we can copy file path or notify user
    navigator.clipboard.writeText(`// Refer to ${selectedFile} in the repository root`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Server className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold">XAMPP / Apache PHP & MySQL Production Files</h2>
              <p className="text-xs text-slate-300">Complete, standalone native source code generated in workspace root</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* File Explorer Sidebar */}
          <div className="md:col-span-1 border-r border-slate-200 pr-4 flex flex-col gap-1.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Project File Tree</span>
            {Object.entries(fileMap).map(([filename, meta]) => (
              <button
                key={filename}
                onClick={() => setSelectedFile(filename)}
                className={`text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                  selectedFile === filename 
                    ? 'bg-blue-900 text-white font-semibold' 
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {meta.type === 'sql' ? <Database className="w-3.5 h-3.5 text-amber-500 shrink-0" /> : <FileCode className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                  <span className="truncate">{filename}</span>
                </div>
              </button>
            ))}

            <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800">
              <strong className="block mb-1 text-amber-900">XAMPP Deployment:</strong>
              Copy these generated local files to <code>C:\xampp\htdocs\ucms\</code> and import <code>database.sql</code> in phpMyAdmin at <code>http://localhost/phpmyadmin</code>.
            </div>
          </div>

          {/* Code Details & Instructions */}
          <div className="md:col-span-2 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-mono">{selectedFile}</h3>
                <p className="text-xs text-slate-500">{fileMap[selectedFile]?.desc}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied Path' : 'Copy File Path'}
                </button>
              </div>
            </div>

            <div className="bg-slate-950 rounded-lg p-4 font-mono text-xs text-slate-200 overflow-x-auto flex-1 max-h-[360px]">
              <div className="text-slate-400 mb-2">// Institutional Production File: /{selectedFile}</div>
              <div className="text-emerald-400 mb-2">// Ready for Apache / XAMPP Execution at http://localhost:8000 or http://localhost/ucms</div>
              <div className="text-slate-300 whitespace-pre-wrap">
                {selectedFile === 'database.sql' && `-- MySQL 8.0+ Database Schema & Seed Data
CREATE DATABASE ucms_portal;
USE ucms_portal;
-- 11 Tables: departments, users, courses, course_allocations,
-- handouts, resource_versions, timetables, announcements,
-- announcement_reads, student_reports, cms_settings, audit_logs...
-- Pre-registered users: shahzaib, dr_amna, hod_cs, admin`}
                {selectedFile === 'config/db.php' && `<?php
class Database {
  private static ?PDO $instance = null;
  public static function getConnection(): PDO {
    if (self::$instance === null) {
      self::$instance = new PDO("mysql:host=127.0.0.1;dbname=ucms_portal;charset=utf8mb4", "root", "");
    }
    return self::$instance;
  }
}`}
                {selectedFile === 'index.php' && `<?php
session_start();
require_once __DIR__ . '/config/db.php';
$user = $_SESSION['user'] ?? null;
if (!$user) {
  require_once __DIR__ . '/views/public_view.php';
} else {
  // Renders role workspace: student, teacher, hod, admin
}`}
                {selectedFile.startsWith('views/') && `// Full native PHP template with HTML5, responsive CSS3 classes, and vanilla JS hooks.`}
                {selectedFile === 'login.php' && `<?php
// Checks credentials with password_verify($password, $hash)
// Sets session, logs to audit_logs, handles first-login flag`}
                {selectedFile === 'actions.php' && `<?php
// Handout replacement with archival to resource_versions
// Timetable clash prevention (teacher & room double booking)
// Cohort Semester Promotion & Graduation to Alumni`}
                {selectedFile === 'css/style.css' && `/* Complete CSS3 styles with 64px header, light slate #f8fafc, Navy #1e3a8a, Gold #d97706 */`}
                {selectedFile === 'js/main.js' && `/* Vanilla JS for role switcher tabs, modal prompts, and AJAX actions */`}
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              All files are written directly into the project repository root and can be packaged or deployed onto any standard LAMP/XAMPP server.
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
