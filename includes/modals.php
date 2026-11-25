<?php
/**
 * UCMS Reusable Shared Modals Include
 * 1. Image / Notification Lightbox Viewer Modal
 * 2. Mandatory First-Time Password Change Modal
 */
?>
<!-- UCMS ATTACHMENT IMAGE LIGHTBOX MODAL -->
<div id="ucms-lightbox-modal" class="ucms-lightbox-modal" onclick="closeLightboxModal(event)">
  <div class="ucms-lightbox-content" onclick="event.stopPropagation()">
    <div style="display:flex; align-items:center; justify-content:space-between; padding:0.75rem 1.25rem; border-bottom:1px solid #e2e8f0; background:#f8fafc;">
      <div style="display:flex; align-items:center; gap:0.5rem;">
        <span style="font-size:0.875rem; font-weight:800; color:#1e3a8a;" id="ucms-lightbox-title">Attachment Preview</span>
        <span id="ucms-lightbox-size" style="font-size:0.75rem; font-weight:700; color:#64748b; background:#e2e8f0; padding:0.15rem 0.5rem; border-radius:9999px;"></span>
      </div>
      <div style="display:flex; align-items:center; gap:0.5rem;">
        <a id="ucms-lightbox-download" href="#" download class="ucms-btn ucms-btn-primary" style="padding:0.35rem 0.75rem; font-size:0.75rem; text-decoration:none;">Download Original</a>
        <button type="button" onclick="closeLightboxModal()" style="background:none; border:none; font-size:1.5rem; line-height:1; cursor:pointer; color:#64748b; padding:0.25rem 0.5rem;">&times;</button>
      </div>
    </div>
    <div style="padding:1rem; display:flex; align-items:center; justify-content:center; background:#0f172a; overflow:auto;">
      <img id="ucms-lightbox-img" src="" alt="Attachment Full View" class="ucms-lightbox-img">
    </div>
  </div>
</div>

<!-- MANDATORY FIRST-TIME PASSWORD SETUP MODAL -->
<div id="first-login-modal" class="first-login-modal <?= (isset($_SESSION['user']) && empty($_SESSION['user']['has_changed_password'])) ? 'open' : ''; ?>">
  <div class="first-login-content">
    <div style="width:48px; height:48px; border-radius:50%; background:#fef3c7; border:2px solid #d97706; display:flex; align-items:center; justify-content:center; margin-bottom:1rem; font-size:1.5rem;">
      🔐
    </div>
    <h3 style="font-size:1.25rem; font-weight:900; color:#0f172a; margin-bottom:0.5rem;">Security Credential Setup</h3>
    <p style="font-size:0.8125rem; color:#64748b; margin-bottom:1.25rem; line-height:1.5;">
      You are currently accessing your institutional portal using default initial credentials. Please establish a personalized, secure password to continue.
    </p>

    <form id="password-change-form" style="display:flex; flex-direction:column; gap:0.875rem;">
      <div>
        <label style="display:block; font-size:0.75rem; font-weight:800; text-transform:uppercase; color:#334155; margin-bottom:0.25rem;">New Secure Password *</label>
        <input type="password" id="new-password-input" name="new_password" required minlength="8" placeholder="At least 8 characters" class="ucms-input" style="width:100%;">
      </div>
      <div>
        <label style="display:block; font-size:0.75rem; font-weight:800; text-transform:uppercase; color:#334155; margin-bottom:0.25rem;">Confirm New Password *</label>
        <input type="password" id="confirm-password-input" name="confirm_password" required minlength="8" placeholder="Re-enter password" class="ucms-input" style="width:100%;">
      </div>
      <div id="password-change-feedback" style="font-size:0.75rem; color:#dc2626; font-weight:700;"></div>
      <button type="submit" class="ucms-btn ucms-btn-primary" style="margin-top:0.5rem; justify-content:center;">Save Secure Password & Access Portal →</button>
    </form>
  </div>
</div>
