/**
 * Enhanced Login Modal Component with 2FA, Security Features, and Advanced Authentication
 */

import { enhancedAuthService } from "../services/auth-enhanced.service.js";

import { deviceFingerprint } from "../utils/device-fingerprint.js";
import { ErrorHandler } from "../utils/error-handler.js";

class EnhancedLoginModal {
  constructor() {
    this.isVisible = false;
    this.currentStep = "login"; // login, twoFactor, setup2FA, passwordReset
    this.loginData = {};
    this.deviceFingerprint = null;

    this.steps = {
      login: "Basic Authentication",
      twoFactor: "2FA Verification",
      setup2FA: "2FA Setup",
      passwordReset: "Password Reset",
    };
  }

  /**
   * Initialize the enhanced login modal
   */
  async init() {
    try {
      await this.createModal();
      await this.setupEventListeners();

      // Generate device fingerprint
      this.deviceFingerprint = await deviceFingerprint.generateFingerprint();

      console.log("Enhanced login modal initialized");
    } catch (error) {
      ErrorHandler.handle(error, "Failed to initialize enhanced login modal");
    }
  }

  /**
   * Create the login modal HTML structure
   */
  async createModal() {
    const modalHTML = `
            <div id="enhancedLoginModal" class="modal" style="display: none;">
                <div class="modal-content enhanced-login-modal">
                    <div class="modal-header">
                        <h2 id="loginModalTitle">Secure Login</h2>
                        <span class="close" id="closeEnhancedLogin">&times;</span>
                    </div>
                    
                    <div class="modal-body">
                        <!-- Progress indicator -->
                        <div class="login-progress">
                            <div class="progress-step active" data-step="login">
                                <i class="fas fa-user"></i>
                                <span>Login</span>
                            </div>
                            <div class="progress-step" data-step="twoFactor">
                                <i class="fas fa-shield-alt"></i>
                                <span>2FA</span>
                            </div>
                        </div>

                        <!-- Login Form -->
                        <div id="loginStep" class="login-step active">
                            <form id="enhancedLoginForm" class="login-form">
                                <div class="form-group">
                                    <label for="loginUsername">Username</label>
                                    <input type="text" id="loginUsername" name="username" required autocomplete="username">
                                    <i class="fas fa-user field-icon"></i>
                                </div>

                                <div class="form-group">
                                    <label for="loginPassword">Password</label>
                                    <input type="password" id="loginPassword" name="password" required autocomplete="current-password">
                                    <i class="fas fa-eye password-toggle" data-target="loginPassword"></i>
                                </div>

                                <div class="form-options">
                                    <label class="checkbox-container">
                                        <input type="checkbox" id="rememberMe" name="rememberMe">
                                        <span class="checkmark"></span>
                                        Remember me for 30 days
                                    </label>
                                    
                                    <button type="button" class="link-button" id="forgotPasswordBtn">
                                        Forgot password?
                                    </button>
                                </div>

                                <button type="submit" class="btn btn-primary login-btn">
                                    <i class="fas fa-sign-in-alt"></i>
                                    Sign In
                                </button>
                            </form>

                            <div class="login-help">
                                <p><strong>Demo Accounts:</strong></p>
                                <div class="demo-accounts">
                                    <button class="demo-account-btn" data-username="admin" data-password="admin">
                                        <i class="fas fa-user-shield"></i>
                                        Administrator
                                    </button>
                                    <button class="demo-account-btn" data-username="finance" data-password="finance">
                                        <i class="fas fa-calculator"></i>
                                        Finance Officer
                                    </button>
                                    <button class="demo-account-btn" data-username="auditor" data-password="auditor">
                                        <i class="fas fa-search"></i>
                                        Auditor
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Two-Factor Authentication Form -->
                        <div id="twoFactorStep" class="login-step">
                            <div class="two-factor-form">
                                <div class="step-header">
                                    <i class="fas fa-shield-alt step-icon"></i>
                                    <h3>Two-Factor Authentication</h3>
                                    <p>Enter the 6-digit code from your authenticator app</p>
                                </div>

                                <form id="twoFactorForm">
                                    <div class="form-group">
                                        <div class="totp-input-container">
                                            <input type="text" id="totpCode" name="totpCode" maxlength="6" 
                                                   pattern="[0-9]{6}" placeholder="000000" autocomplete="one-time-code">
                                        </div>
                                    </div>

                                    <div class="form-actions">
                                        <button type="submit" class="btn btn-primary">
                                            <i class="fas fa-check"></i>
                                            Verify Code
                                        </button>
                                        <button type="button" class="btn btn-secondary" id="useBackupCodeBtn">
                                            Use Backup Code
                                        </button>
                                    </div>
                                </form>

                                <!-- Backup Code Form -->
                                <form id="backupCodeForm" style="display: none;">
                                    <div class="form-group">
                                        <label for="backupCode">Enter backup code</label>
                                        <input type="text" id="backupCode" name="backupCode" placeholder="XXXXXXXX">
                                    </div>
                                    <div class="form-actions">
                                        <button type="submit" class="btn btn-primary">
                                            <i class="fas fa-key"></i>
                                            Use Backup Code
                                        </button>
                                        <button type="button" class="btn btn-secondary" id="useTotpBtn">
                                            Use Authenticator Code
                                        </button>
                                    </div>
                                </form>

                                <div class="help-text">
                                    <p><i class="fas fa-info-circle"></i> Having trouble? Contact your administrator.</p>
                                </div>
                            </div>
                        </div>

                        <!-- 2FA Setup -->
                        <div id="setup2FAStep" class="login-step">
                            <div class="setup-2fa-form">
                                <div class="step-header">
                                    <i class="fas fa-qrcode step-icon"></i>
                                    <h3>Setup Two-Factor Authentication</h3>
                                    <p>Scan this QR code with your authenticator app</p>
                                </div>

                                <div class="qr-code-container">
                                    <div id="qrCode" class="qr-code"></div>
                                    <div class="manual-entry">
                                        <p>Can't scan? Enter this code manually:</p>
                                        <code id="manualSecret" class="secret-code"></code>
                                        <button class="copy-btn" data-target="manualSecret">
                                            <i class="fas fa-copy"></i>
                                        </button>
                                    </div>
                                </div>

                                <form id="verify2FASetupForm">
                                    <div class="form-group">
                                        <label for="verifyTotpCode">Enter verification code</label>
                                        <input type="text" id="verifyTotpCode" name="verifyTotpCode" 
                                               maxlength="6" pattern="[0-9]{6}" placeholder="000000">
                                    </div>
                                    <div class="form-actions">
                                        <button type="submit" class="btn btn-primary">
                                            <i class="fas fa-check"></i>
                                            Enable 2FA
                                        </button>
                                        <button type="button" class="btn btn-secondary" id="skip2FABtn">
                                            Skip for Now
                                        </button>
                                    </div>
                                </form>

                                <div class="backup-codes" id="backupCodesDisplay" style="display: none;">
                                    <h4><i class="fas fa-key"></i> Backup Codes</h4>
                                    <p>Save these codes in a secure place. Each can only be used once.</p>
                                    <div class="codes-grid" id="backupCodesList"></div>
                                    <button class="btn btn-secondary" id="downloadBackupCodes">
                                        <i class="fas fa-download"></i>
                                        Download Codes
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Password Reset -->
                        <div id="passwordResetStep" class="login-step">
                            <div class="password-reset-form">
                                <div class="step-header">
                                    <i class="fas fa-key step-icon"></i>
                                    <h3>Reset Password</h3>
                                    <p>Enter your username and email to reset your password</p>
                                </div>

                                <form id="passwordResetForm">
                                    <div class="form-group">
                                        <label for="resetUsername">Username</label>
                                        <input type="text" id="resetUsername" name="resetUsername" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="resetEmail">Email Address</label>
                                        <input type="email" id="resetEmail" name="resetEmail" required>
                                    </div>
                                    <div class="form-actions">
                                        <button type="submit" class="btn btn-primary">
                                            <i class="fas fa-paper-plane"></i>
                                            Send Reset Link
                                        </button>
                                        <button type="button" class="btn btn-secondary" id="backToLoginBtn">
                                            Back to Login
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <!-- Security Notifications -->
                        <div id="securityNotifications" class="security-notifications"></div>
                    </div>
                </div>
            </div>
        `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // Add CSS for enhanced login modal
    await this.addStyles();
  }

  /**
   * Add enhanced login modal styles
   */
  async addStyles() {
    const styles = `
            <style id="enhancedLoginStyles">
                .enhanced-login-modal {
                    max-width: 450px;
                    width: 90%;
                }

                .login-progress {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 2rem;
                    padding: 0 1rem;
                }

                .progress-step {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 1rem;
                    margin: 0 1rem;
                    border-radius: 8px;
                    background: #f8f9fa;
                    opacity: 0.6;
                    transition: all 0.3s ease;
                    flex: 1;
                }

                .progress-step.active {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    opacity: 1;
                    transform: scale(1.05);
                }

                .progress-step i {
                    font-size: 1.5rem;
                    margin-bottom: 0.5rem;
                }

                .progress-step span {
                    font-size: 0.875rem;
                    font-weight: 600;
                }

                .login-step {
                    display: none;
                }

                .login-step.active {
                    display: block;
                }

                .form-group {
                    position: relative;
                    margin-bottom: 1.5rem;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 600;
                    color: #333;
                }

                .form-group input {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border: 2px solid #e1e5e9;
                    border-radius: 6px;
                    font-size: 1rem;
                    transition: border-color 0.3s ease;
                }

                .form-group input:focus {
                    outline: none;
                    border-color: #667eea;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                }

                .field-icon {
                    position: absolute;
                    right: 1rem;
                    top: 2.5rem;
                    color: #6c757d;
                    pointer-events: none;
                }

                .password-toggle {
                    cursor: pointer;
                    pointer-events: all;
                }

                .form-options {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }

                .checkbox-container {
                    display: flex;
                    align-items: center;
                    cursor: pointer;
                    font-size: 0.875rem;
                    position: relative;
                }

                .checkbox-container input {
                    width: auto;
                    margin-right: 0.5rem;
                }

                .link-button {
                    background: none;
                    border: none;
                    color: #667eea;
                    cursor: pointer;
                    font-size: 0.875rem;
                    text-decoration: underline;
                }

                .login-btn {
                    width: 100%;
                    padding: 0.875rem;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: transform 0.2s ease;
                }

                .login-btn:hover {
                    transform: translateY(-1px);
                }

                .login-help {
                    margin-top: 2rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid #e1e5e9;
                }

                .demo-accounts {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 0.5rem;
                    margin-top: 1rem;
                }

                .demo-account-btn {
                    display: flex;
                    align-items: center;
                    padding: 0.75rem;
                    background: #f8f9fa;
                    border: 1px solid #dee2e6;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: background-color 0.2s ease;
                    font-size: 0.875rem;
                }

                .demo-account-btn:hover {
                    background: #e9ecef;
                }

                .demo-account-btn i {
                    margin-right: 0.75rem;
                    width: 1rem;
                }

                .two-factor-form, .setup-2fa-form, .password-reset-form {
                    text-align: center;
                }

                .step-header {
                    margin-bottom: 2rem;
                }

                .step-icon {
                    font-size: 3rem;
                    color: #667eea;
                    margin-bottom: 1rem;
                }

                .step-header h3 {
                    margin: 1rem 0 0.5rem 0;
                    color: #333;
                }

                .step-header p {
                    color: #6c757d;
                    margin: 0;
                }

                .totp-input-container {
                    display: flex;
                    justify-content: center;
                }

                #totpCode, #verifyTotpCode {
                    width: 200px;
                    text-align: center;
                    font-size: 2rem;
                    font-family: 'Courier New', monospace;
                    letter-spacing: 0.5rem;
                    padding: 1rem;
                }

                .form-actions {
                    display: flex;
                    gap: 1rem;
                    justify-content: center;
                    flex-wrap: wrap;
                    margin-top: 1.5rem;
                }

                .btn {
                    padding: 0.75rem 1.5rem;
                    border-radius: 6px;
                    border: none;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .btn-primary {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }

                .btn-secondary {
                    background: #f8f9fa;
                    color: #333;
                    border: 1px solid #dee2e6;
                }

                .btn:hover {
                    transform: translateY(-1px);
                }

                .qr-code-container {
                    margin: 2rem 0;
                }

                .qr-code {
                    width: 200px;
                    height: 200px;
                    margin: 0 auto 1rem;
                    border: 2px solid #dee2e6;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: white;
                }

                .manual-entry {
                    background: #f8f9fa;
                    padding: 1rem;
                    border-radius: 6px;
                    margin-top: 1rem;
                }

                .secret-code {
                    background: white;
                    padding: 0.5rem;
                    border-radius: 4px;
                    font-family: 'Courier New', monospace;
                    word-break: break-all;
                    margin: 0 0.5rem;
                }

                .copy-btn {
                    background: none;
                    border: none;
                    color: #667eea;
                    cursor: pointer;
                    padding: 0.25rem;
                }

                .backup-codes {
                    margin-top: 2rem;
                    padding: 1rem;
                    background: #fff3cd;
                    border: 1px solid #ffeaa7;
                    border-radius: 6px;
                }

                .codes-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 0.5rem;
                    margin: 1rem 0;
                }

                .backup-code {
                    background: white;
                    padding: 0.5rem;
                    border-radius: 4px;
                    font-family: 'Courier New', monospace;
                    text-align: center;
                    border: 1px solid #dee2e6;
                }

                .security-notifications {
                    margin-top: 1rem;
                }

                .security-notification {
                    padding: 0.75rem;
                    border-radius: 6px;
                    margin-bottom: 0.5rem;
                    display: flex;
                    align-items: center;
                }

                .security-notification.warning {
                    background: #fff3cd;
                    border: 1px solid #ffeaa7;
                    color: #856404;
                }

                .security-notification.error {
                    background: #f8d7da;
                    border: 1px solid #f5c6cb;
                    color: #721c24;
                }

                .security-notification.info {
                    background: #cce7f0;
                    border: 1px solid #b3d7ed;
                    color: #055160;
                }

                .security-notification i {
                    margin-right: 0.5rem;
                }

                .help-text {
                    margin-top: 1.5rem;
                    padding-top: 1rem;
                    border-top: 1px solid #e1e5e9;
                    font-size: 0.875rem;
                    color: #6c757d;
                }

                @media (max-width: 768px) {
                    .enhanced-login-modal {
                        width: 95%;
                        margin: 1rem;
                    }
                    
                    .form-actions {
                        flex-direction: column;
                    }
                    
                    .btn {
                        width: 100%;
                    }
                }
            </style>
        `;

    if (!document.getElementById("enhancedLoginStyles")) {
      document.head.insertAdjacentHTML("beforeend", styles);
    }
  }

  /**
   * Setup event listeners for the enhanced login modal
   */
  async setupEventListeners() {
    const modal = document.getElementById("enhancedLoginModal");
    const closeBtn = document.getElementById("closeEnhancedLogin");

    // Close modal events
    closeBtn.addEventListener("click", () => this.hide());
    modal.addEventListener("click", (e) => {
      if (e.target === modal) this.hide();
    });

    // Main login form
    document
      .getElementById("enhancedLoginForm")
      .addEventListener("submit", (e) => this.handleLogin(e));

    // Demo account buttons
    document.querySelectorAll(".demo-account-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => this.fillDemoCredentials(e));
    });

    // Password visibility toggle
    document.querySelectorAll(".password-toggle").forEach((toggle) => {
      toggle.addEventListener("click", (e) => this.togglePasswordVisibility(e));
    });

    // Two-factor forms
    document
      .getElementById("twoFactorForm")
      .addEventListener("submit", (e) => this.handleTwoFactor(e));
    document
      .getElementById("backupCodeForm")
      .addEventListener("submit", (e) => this.handleBackupCode(e));

    // 2FA setup form
    document
      .getElementById("verify2FASetupForm")
      .addEventListener("submit", (e) => this.handleVerify2FASetup(e));

    // Password reset form
    document
      .getElementById("passwordResetForm")
      .addEventListener("submit", (e) => this.handlePasswordReset(e));

    // Navigation buttons
    document
      .getElementById("forgotPasswordBtn")
      .addEventListener("click", () => this.showStep("passwordReset"));
    document
      .getElementById("backToLoginBtn")
      .addEventListener("click", () => this.showStep("login"));
    document
      .getElementById("useBackupCodeBtn")
      .addEventListener("click", () => this.toggleBackupCodeForm(true));
    document
      .getElementById("useTotpBtn")
      .addEventListener("click", () => this.toggleBackupCodeForm(false));
    document
      .getElementById("skip2FABtn")
      .addEventListener("click", () => this.complete2FASetup(true));

    // Copy button for manual secret
    document.querySelectorAll(".copy-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => this.copyToClipboard(e));
    });

    // Download backup codes
    document
      .getElementById("downloadBackupCodes")
      .addEventListener("click", () => this.downloadBackupCodes());
  }

  /**
   * Show the enhanced login modal
   */
  show() {
    this.isVisible = true;
    this.currentStep = "login";
    this.showStep("login");
    document.getElementById("enhancedLoginModal").style.display = "block";
    document.getElementById("loginUsername").focus();
  }

  /**
   * Hide the enhanced login modal
   */
  hide() {
    this.isVisible = false;
    document.getElementById("enhancedLoginModal").style.display = "none";
    this.resetModal();
  }

  /**
   * Show specific step in the login process
   */
  showStep(step) {
    // Hide all steps
    document
      .querySelectorAll(".login-step")
      .forEach((s) => s.classList.remove("active"));
    document
      .querySelectorAll(".progress-step")
      .forEach((s) => s.classList.remove("active"));

    // Show current step
    document.getElementById(`${step}Step`).classList.add("active");

    // Update progress indicator
    const progressStep = document.querySelector(`[data-step="${step}"]`);
    if (progressStep) {
      progressStep.classList.add("active");
    }

    // Update title
    document.getElementById("loginModalTitle").textContent =
      this.steps[step] || "Secure Login";

    this.currentStep = step;
  }

  /**
   * Handle main login form submission
   */
  async handleLogin(e) {
    e.preventDefault();

    try {
      const formData = new FormData(e.target);
      const username = formData.get("username");
      const password = formData.get("password");
      const rememberMe = formData.get("rememberMe") === "on";

      this.showLoading("Signing in...");

      const result = await enhancedAuthService.login(
        username,
        password,
        null,
        rememberMe,
        this.deviceFingerprint,
      );

      this.hideLoading();

      if (result.requiresTwoFactor) {
        this.loginData = { username, password, rememberMe };
        this.showStep("twoFactor");
      } else if (result.success) {
        this.showSuccessNotification("Login successful!");
        setTimeout(() => {
          this.hide();
          window.location.reload(); // Refresh to load authenticated state
        }, 1000);
      }
    } catch (error) {
      this.hideLoading();
      this.showErrorNotification(error.message);
    }
  }

  /**
   * Handle two-factor authentication
   */
  async handleTwoFactor(e) {
    e.preventDefault();

    try {
      const formData = new FormData(e.target);
      const totpCode = formData.get("totpCode");

      this.showLoading("Verifying code...");

      const result = await enhancedAuthService.login(
        this.loginData.username,
        this.loginData.password,
        totpCode,
        this.loginData.rememberMe,
        this.deviceFingerprint,
      );

      this.hideLoading();

      if (result.success) {
        this.showSuccessNotification("Login successful!");
        setTimeout(() => {
          this.hide();
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      this.hideLoading();
      this.showErrorNotification(error.message);
    }
  }

  /**
   * Handle backup code authentication
   */
  async handleBackupCode(e) {
    e.preventDefault();

    try {
      const formData = new FormData(e.target);
      const backupCode = formData.get("backupCode");

      this.showLoading("Verifying backup code...");

      const result = await enhancedAuthService.login(
        this.loginData.username,
        this.loginData.password,
        backupCode,
        this.loginData.rememberMe,
        this.deviceFingerprint,
      );

      this.hideLoading();

      if (result.success) {
        this.showSuccessNotification("Login successful!");
        setTimeout(() => {
          this.hide();
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      this.hideLoading();
      this.showErrorNotification(error.message);
    }
  }

  /**
   * Handle 2FA setup verification
   */
  async handleVerify2FASetup(e) {
    e.preventDefault();

    try {
      const formData = new FormData(e.target);
      const totpCode = formData.get("verifyTotpCode");

      this.showLoading("Enabling 2FA...");

      const result = await enhancedAuthService.enable2FA(
        this.loginData.username,
        totpCode,
      );

      this.hideLoading();

      if (result) {
        this.showBackupCodes();
        this.showSuccessNotification(
          "Two-factor authentication enabled successfully!",
        );
      }
    } catch (error) {
      this.hideLoading();
      this.showErrorNotification(error.message);
    }
  }

  /**
   * Handle password reset request
   */
  async handlePasswordReset(e) {
    e.preventDefault();

    try {
      const formData = new FormData(e.target);
      const username = formData.get("resetUsername");
      const email = formData.get("resetEmail");

      this.showLoading("Sending reset link...");

      const token = await enhancedAuthService.generatePasswordResetToken(
        username,
        email,
      );

      this.hideLoading();

      if (token) {
        this.showInfoNotification(
          "Password reset link sent! Check console for demo token.",
        );
        this.showStep("login");
      }
    } catch (error) {
      this.hideLoading();
      this.showErrorNotification(error.message);
    }
  }

  /**
   * Fill demo credentials
   */
  fillDemoCredentials(e) {
    const username = e.currentTarget.dataset.username;
    const password = e.currentTarget.dataset.password;

    document.getElementById("loginUsername").value = username;
    document.getElementById("loginPassword").value = password;
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(e) {
    const targetId = e.currentTarget.dataset.target;
    const input = document.getElementById(targetId);
    const icon = e.currentTarget;

    if (input.type === "password") {
      input.type = "text";
      icon.classList.remove("fa-eye");
      icon.classList.add("fa-eye-slash");
    } else {
      input.type = "password";
      icon.classList.remove("fa-eye-slash");
      icon.classList.add("fa-eye");
    }
  }

  /**
   * Toggle backup code form
   */
  toggleBackupCodeForm(show) {
    const totpForm = document.getElementById("twoFactorForm");
    const backupForm = document.getElementById("backupCodeForm");

    if (show) {
      totpForm.style.display = "none";
      backupForm.style.display = "block";
      document.getElementById("backupCode").focus();
    } else {
      totpForm.style.display = "block";
      backupForm.style.display = "none";
      document.getElementById("totpCode").focus();
    }
  }

  /**
   * Show backup codes after 2FA setup
   */
  showBackupCodes() {
    // This would be called after successful 2FA setup
    const backupCodesDisplay = document.getElementById("backupCodesDisplay");
    backupCodesDisplay.style.display = "block";

    // In a real implementation, backup codes would be retrieved from the setup result
    const demoBackupCodes = [
      "ABCD1234",
      "EFGH5678",
      "IJKL9012",
      "MNOP3456",
      "QRST7890",
    ];
    const codesList = document.getElementById("backupCodesList");

    codesList.innerHTML = demoBackupCodes
      .map((code) => `<div class="backup-code">${code}</div>`)
      .join("");
  }

  /**
   * Complete 2FA setup (skip or after viewing backup codes)
   */
  complete2FASetup(skipped = false) {
    if (skipped) {
      this.showWarningNotification(
        "2FA setup skipped. You can enable it later in your profile.",
      );
    }

    setTimeout(() => {
      this.hide();
      window.location.reload();
    }, 1000);
  }

  /**
   * Copy text to clipboard
   */
  async copyToClipboard(e) {
    const targetId = e.currentTarget.dataset.target;
    const element = document.getElementById(targetId);

    try {
      await navigator.clipboard.writeText(element.textContent);
      this.showInfoNotification("Copied to clipboard!");
    } catch (error) {
      // Fallback for older browsers
      element.select();
      document.execCommand("copy");
      this.showInfoNotification("Copied to clipboard!");
    }
  }

  /**
   * Download backup codes
   */
  downloadBackupCodes() {
    const codes = Array.from(document.querySelectorAll(".backup-code")).map(
      (el) => el.textContent,
    );

    const content =
      "Mining Royalties Manager - Backup Codes\\n\\n" +
      codes.join("\\n") +
      "\\n\\nKeep these codes safe. Each can only be used once.";

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "backup-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Show loading state
   */
  showLoading(message = "Loading...") {
    // Add loading indicator
    const loadingHTML = `
            <div id="loginLoading" class="login-loading">
                <div class="spinner"></div>
                <span>${message}</span>
            </div>
        `;

    document
      .querySelector(".modal-body")
      .insertAdjacentHTML("beforeend", loadingHTML);
  }

  /**
   * Hide loading state
   */
  hideLoading() {
    const loading = document.getElementById("loginLoading");
    if (loading) {
      loading.remove();
    }
  }

  /**
   * Show success notification
   */
  showSuccessNotification(message) {
    this.showNotification(message, "success");
  }

  /**
   * Show error notification
   */
  showErrorNotification(message) {
    this.showNotification(message, "error");
  }

  /**
   * Show warning notification
   */
  showWarningNotification(message) {
    this.showNotification(message, "warning");
  }

  /**
   * Show info notification
   */
  showInfoNotification(message) {
    this.showNotification(message, "info");
  }

  /**
   * Show notification
   */
  showNotification(message, type) {
    const icons = {
      success: "fa-check-circle",
      error: "fa-exclamation-circle",
      warning: "fa-exclamation-triangle",
      info: "fa-info-circle",
    };

    const notification = document.createElement("div");
    notification.className = `security-notification ${type}`;
    notification.innerHTML = `
            <i class="fas ${icons[type]}"></i>
            ${message}
        `;

    const container = document.getElementById("securityNotifications");
    container.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }

  /**
   * Reset modal to initial state
   */
  resetModal() {
    document.getElementById("enhancedLoginForm").reset();
    document.getElementById("twoFactorForm").reset();
    document.getElementById("backupCodeForm").reset();
    document.getElementById("verify2FASetupForm").reset();
    document.getElementById("passwordResetForm").reset();

    document.getElementById("securityNotifications").innerHTML = "";

    this.loginData = {};
    this.currentStep = "login";
  }
}

export const enhancedLoginModal = new EnhancedLoginModal();
