/**
 * UCMS UNIFIED 5-IN-1 DIGITAL CAMPUS PORTAL - CLIENT ENGINE
 * Pure Vanilla JavaScript (Zero external dependencies)
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Hamburger Drawer
  const hamburger = document.getElementById('ucms-hamburger-btn');
  const mobileDrawer = document.getElementById('ucms-mobile-drawer');
  if (hamburger && mobileDrawer) {
    hamburger.addEventListener('click', () => {
      mobileDrawer.classList.toggle('open');
    });
  }

  // 2. Role Switcher Tabs & Quick Credentials
  const roleTabs = document.querySelectorAll('.role-tab-btn');
  const roleInput = document.getElementById('login-role-input');
  const usernameInput = document.getElementById('login-username');
  const passwordInput = document.getElementById('login-password');
  const roleContextText = document.getElementById('role-context-description');
  const activeRoleBadge = document.getElementById('active-role-badge');

  function selectRole(role) {
    if (!['student', 'teacher', 'hod', 'admin'].includes(role)) return;
    
    roleTabs.forEach(tab => {
      const isCurrent = tab.dataset.role === role;
      tab.classList.toggle('active', isCurrent);
      tab.style.background = isCurrent ? '#1e3a8a' : '#f1f5f9';
      tab.style.color = isCurrent ? '#ffffff' : '#334155';
    });

    if (roleInput) roleInput.value = role;
    if (activeRoleBadge) activeRoleBadge.textContent = role.toUpperCase();
  }

  roleTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      selectRole(tab.dataset.role);
    });
  });

  // Direct Gateway Cards on public left hero
  document.querySelectorAll('.gateway-card').forEach(card => {
    card.addEventListener('click', () => {
      const role = card.dataset.role;
      selectRole(role);
      const loginCard = document.getElementById('institutional-login-card');
      if (loginCard) {
        loginCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });

  // Demo Pill Click Handlers - Instant Credential Filling
  document.querySelectorAll('.quick-demo-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const role = pill.dataset.role;
      selectRole(role);
      if (pill.dataset.username && usernameInput) {
        usernameInput.value = pill.dataset.username;
      }
      if (passwordInput) {
        passwordInput.value = 'password123';
      }
    });
  });

  // 3. Password Eye Toggle
  const togglePassBtn = document.getElementById('toggle-password-btn');
  if (togglePassBtn && passwordInput) {
    togglePassBtn.addEventListener('click', () => {
      const isPass = passwordInput.getAttribute('type') === 'password';
      passwordInput.setAttribute('type', isPass ? 'text' : 'password');
      togglePassBtn.textContent = isPass ? '🔒 Hide' : '👁 Show';
    });
  }

  // 4. First-Time Password Enforcement Modal
  const firstLoginModal = document.getElementById('first-login-modal');
  const passwordChangeForm = document.getElementById('password-change-form');
  if (passwordChangeForm) {
    passwordChangeForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newPass = document.getElementById('new-password-input').value;
      const confPass = document.getElementById('confirm-password-input').value;
      const feedback = document.getElementById('password-change-feedback');

      if (newPass.length < 8) {
        if (feedback) feedback.textContent = 'Password must be at least 8 characters.';
        return;
      }
      if (newPass !== confPass) {
        if (feedback) feedback.textContent = 'Passwords do not match.';
        return;
      }

      const formData = new FormData(passwordChangeForm);
      try {
        const res = await fetch('change_password.php', {
          method: 'POST',
          body: formData,
          headers: { 'X-Requested-With': 'XMLHttpRequest' }
        });
        const data = await res.json();
        if (data.success) {
          if (firstLoginModal) firstLoginModal.classList.remove('open');
          alert('Security setup complete! Your default password has been updated.');
          window.location.reload();
        } else {
          if (feedback) feedback.textContent = data.message || 'Error updating password.';
        }
      } catch (err) {
        if (feedback) feedback.textContent = 'Failed to communicate with server.';
      }
    });
  }

  // 5. Unread Notice Center - Expanding decrements counter
  document.querySelectorAll('.announcement-card').forEach(card => {
    card.addEventListener('click', async () => {
      const isUnread = card.dataset.unread === '1';
      const content = card.querySelector('.announcement-body');
      if (content) content.classList.toggle('hidden');

      if (isUnread) {
        card.dataset.unread = '0';
        card.classList.remove('border-amber-300', 'bg-amber-50/20');
        const badge = card.querySelector('.unread-indicator');
        if (badge) badge.remove();

        const counter = document.getElementById('unread-notices-counter');
        if (counter) {
          let count = parseInt(counter.textContent || '0', 10);
          if (count > 0) counter.textContent = (count - 1).toString();
        }

        // Call backend mark read
        try {
          const body = new FormData();
          body.append('action', 'mark_read');
          body.append('announcement_id', card.dataset.id);
          fetch('actions.php', { method: 'POST', body });
        } catch (e) {}
      }
    });
  });

  // 6. Academic Issue Report (Max 3/Week Quota)
  const reportForm = document.getElementById('student-report-form');
  if (reportForm) {
    reportForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(reportForm);
      formData.append('action', 'submit_report');

      try {
        const res = await fetch('actions.php', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success) {
          alert('Report Submitted! ' + data.message + ' Remaining weekly quota: ' + data.remaining);
          window.location.reload();
        } else {
          alert('Submission Error: ' + data.error);
        }
      } catch (err) {
        alert('Could not submit report. Network failure.');
      }
    });
  }

  // 7. Faculty Handout Upload & Replacement Engine
  const handoutForm = document.getElementById('faculty-handout-form');
  if (handoutForm) {
    handoutForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(handoutForm);
      formData.append('action', 'upload_handout');

      try {
        const res = await fetch('actions.php', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success) {
          alert(data.message);
          window.location.reload();
        } else {
          alert('Error: ' + data.error);
        }
      } catch (e) {
        alert('Upload request failed.');
      }
    });
  }

  // 8. HOD Master Timetable Conflict Detection
  const timetableForm = document.getElementById('hod-timetable-form');
  if (timetableForm) {
    timetableForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(timetableForm);
      formData.append('action', 'add_timetable');

      try {
        const res = await fetch('actions.php', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success) {
          alert('Schedule Validated! ' + data.message);
          window.location.reload();
        } else {
          alert('CONFLICT DETECTED!\n\n' + data.error);
        }
      } catch (e) {
        alert('Server validation error.');
      }
    });
  }

  // 9. Admin Cohort Promotion Engine
  const cohortPromoteBtn = document.getElementById('btn-promote-cohort');
  const cohortGraduateBtn = document.getElementById('btn-graduate-cohort');
  
  async function handleCohortAction(actionType) {
    const deptSelect = document.getElementById('cohort-dept-select');
    const semSelect = document.getElementById('cohort-semester-select');
    if (!deptSelect || !semSelect) return;

    const deptId = deptSelect.value;
    const sem = semSelect.value;

    const confirmMsg = actionType === 'graduate' 
      ? `Confer degrees and graduate all Semester 8 students of Department ID ${deptId} to Alumni?`
      : `Promote all active students of Department ID ${deptId} from Semester ${sem} to Semester ${parseInt(sem)+1}?`;

    if (!confirm(confirmMsg)) return;

    const body = new FormData();
    body.append('action', 'promote_cohort');
    body.append('department_id', deptId);
    body.append('semester', sem);
    body.append('action_type', actionType);

    try {
      const res = await fetch('actions.php', { method: 'POST', body });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        window.location.reload();
      } else {
        alert('Promotion error: ' + data.error);
      }
    } catch (e) {
      alert('Network error executing cohort upgrade.');
    }
  }

  if (cohortPromoteBtn) {
    cohortPromoteBtn.addEventListener('click', () => handleCohortAction('promote'));
  }
  if (cohortGraduateBtn) {
    cohortGraduateBtn.addEventListener('click', () => handleCohortAction('graduate'));
  }

  // 10. Handout Replacement Reason Dynamic Visibility Toggle
  const replaceSelect = document.getElementById('replace-handout-select');
  const replaceReasonContainer = document.getElementById('replacement-reason-container');
  if (replaceSelect && replaceReasonContainer) {
    const updateReplaceVisibility = () => {
      const isReplacing = replaceSelect.value !== '0';
      replaceReasonContainer.style.display = isReplacing ? 'block' : 'none';
      const reasonInput = replaceReasonContainer.querySelector('input[name="replacement_reason"]');
      if (reasonInput) reasonInput.required = isReplacing;
    };
    replaceSelect.addEventListener('change', updateReplaceVisibility);
    updateReplaceVisibility();
  }

  // 11. HOD Course Allocation AJAX Handler
  const allocForm = document.getElementById('hod-allocation-form');
  if (allocForm) {
    allocForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(allocForm);
      try {
        const res = await fetch('actions.php', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success) {
          alert('Allocation Successful!\n\n' + data.message);
          window.location.reload();
        } else {
          alert('Allocation Error: ' + data.error);
        }
      } catch (err) {
        alert('Network error submitting course allocation.');
      }
    });
  }

  // 12. Admin Public CMS Settings Live Update Handler
  const cmsForm = document.getElementById('admin-cms-form');
  if (cmsForm) {
    cmsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(cmsForm);
      try {
        const res = await fetch('actions.php', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success) {
          alert('CMS Parameters Saved!\n\n' + data.message);
          window.location.reload();
        } else {
          alert('CMS Update Error: ' + data.error);
        }
      } catch (err) {
        alert('Network error updating CMS settings.');
      }
    });
  }

  // 13. Student Grievance / Report Status Update Handler (HOD & Admin)
  document.querySelectorAll('.report-status-update-form').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      try {
        const res = await fetch('actions.php', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success) {
          alert('Grievance Status Updated!\n\n' + data.message);
          window.location.reload();
        } else {
          alert('Status Update Error: ' + data.error);
        }
      } catch (err) {
        alert('Network error updating report status.');
      }
    });
  });
});

// =====================================================================
// GLOBAL UCMS LIGHTBOX VIEWER FOR ANNOUNCEMENT ATTACHMENTS (VANILLA JS)
// =====================================================================
window.openLightbox = function(url, title, size) {
  const modal = document.getElementById('ucms-lightbox-modal');
  const img = document.getElementById('ucms-lightbox-img');
  const titleEl = document.getElementById('ucms-lightbox-title');
  const sizeEl = document.getElementById('ucms-lightbox-size');
  const dlLink = document.getElementById('ucms-lightbox-download');

  if (modal && img) {
    img.src = url;
    if (titleEl) titleEl.textContent = title || 'Notification Image';
    if (sizeEl) sizeEl.textContent = size || '';
    if (dlLink) dlLink.href = url;
    modal.classList.add('active');
  }
};

window.closeLightboxModal = function(e) {
  const modal = document.getElementById('ucms-lightbox-modal');
  if (modal) {
    modal.classList.remove('active');
    const img = document.getElementById('ucms-lightbox-img');
    if (img) img.src = '';
  }
};
