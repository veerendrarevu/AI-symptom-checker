import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";

// ── Icon Components ──────────────────────────────────────────
const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
  </svg>
);

const PulseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);

const ChatIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const EmailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const AlertIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
  </svg>
);

// ── Floating icons pool ──────────────────────────────────────
const floatingIconComponents = [HeartIcon, PlusIcon, PulseIcon, ChatIcon, HeartIcon, PlusIcon, PulseIcon, ShieldIcon];

// ── Password strength ────────────────────────────────────────
function getPasswordStrength(pwd) {
  if (!pwd) return { score: 0, label: "" };
  let score = 0;
  if (pwd.length >= 8)              score++;
  if (/[A-Z]/.test(pwd))            score++;
  if (/[0-9]/.test(pwd))            score++;
  if (/[^A-Za-z0-9]/.test(pwd))    score++;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const keys   = ["", "weak", "fair", "good", "strong"];
  return { score, label: labels[score], key: keys[score] };
}

// ── Theme Hook ────────────────────────────────────────────────
function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem("hc-theme") || "light");
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("hc-theme", theme);
  }, [theme]);
  const toggle = () => setTheme(t => (t === "light" ? "dark" : "light"));
  return { theme, toggle };
}

// ── Main Component ─────────────────────────────────────────────
export default function Register() {
  const [fullName, setFullName]         = useState("");
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [confirmPwd, setConfirmPwd]     = useState("");
  const [showPass, setShowPass]         = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [error, setError]               = useState("");
  const [success, setSuccess]           = useState("");
  const [loading, setLoading]           = useState(false);
  const navigate                        = useNavigate();
  const { theme, toggle }               = useTheme();

  const strength = getPasswordStrength(password);

  useEffect(() => {
    if (localStorage.getItem("token")) navigate("/chat");
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPwd) {
      setError("Passwords do not match. Please try again.");
      return;
    }
    if (strength.score < 2) {
      setError("Please choose a stronger password (8+ chars, uppercase, number).");
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:8000/auth/register", { fullName, email, password });
      setSuccess("Account created! Redirecting to login…");
      setTimeout(() => navigate("/login"), 1800);
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const strengthColors = {
    weak:   "active-weak",
    fair:   "active-fair",
    good:   "active-good",
    strong: "active-strong",
  };
  const activeClass = strengthColors[strength.key] || "";

  return (
    <>
      {/* ── Background ── */}
      <div className="auth-bg" aria-hidden="true" />
      <div className="auth-grid" aria-hidden="true" />

      {/* ── Floating Icons ── */}
      <div className="floating-icons" aria-hidden="true">
        {floatingIconComponents.map((Icon, i) => (
          <div key={i} className="float-icon"><Icon /></div>
        ))}
      </div>

      {/* ── Theme Toggle ── */}
      <button
        className="theme-toggle"
        onClick={toggle}
        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      >
        {theme === "light" ? <MoonIcon /> : <SunIcon />}
      </button>

      {/* ── Page ── */}
      <main className="auth-page">
        <div className="auth-container">

          {/* Brand */}
          <div className="auth-brand">
            <div className="auth-brand-logo" aria-hidden="true">
              <HeartIcon />
            </div>
            <h1>AI Healthcare<br /><span>Symptom Checker</span></h1>
            <p>Team 7 Project</p>
          </div>

          {/* Card */}
          <div className="auth-card" role="main">
            <div className="ai-badge" aria-label="AI-powered system">
              <span className="pulse-dot" aria-hidden="true" />
              AI-Powered Diagnostics
            </div>

            <div className="card-header">
              <h2>Create account</h2>
              <p>Join thousands getting AI-powered health insights</p>
            </div>

            {error && (
              <div className="auth-message error" role="alert">
                <AlertIcon />{error}
              </div>
            )}
            {success && (
              <div className="auth-message success" role="status">
                <CheckIcon />{success}
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit} noValidate>

              {/* Full Name */}
              <div className="input-group">
                <label htmlFor="fullName">Full Name</label>
                <div className="input-wrapper">
                  <span className="input-icon" aria-hidden="true"><UserIcon /></span>
                  <input
                    id="fullName"
                    type="text"
                    placeholder="Dr. Jane Smith"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    autoComplete="name"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="input-group">
                <label htmlFor="email">Email address</label>
                <div className="input-wrapper">
                  <span className="input-icon" aria-hidden="true"><EmailIcon /></span>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="input-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper has-toggle">
                  <span className="input-icon" aria-hidden="true"><LockIcon /></span>
                  <input
                    id="password"
                    type={showPass ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="pass-toggle"
                    onClick={() => setShowPass(v => !v)}
                    aria-label={showPass ? "Hide password" : "Show password"}
                  >
                    {showPass ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>

                {/* Strength Bars */}
                {password && (
                  <div
                    className="pwd-strength"
                    role="progressbar"
                    aria-valuenow={strength.score}
                    aria-valuemin={0}
                    aria-valuemax={4}
                    aria-label={`Password strength: ${strength.label}`}
                  >
                    {[1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className={`pwd-bar ${i <= strength.score ? activeClass : ""}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="input-group">
                <label htmlFor="confirmPwd">Confirm Password</label>
                <div className="input-wrapper has-toggle">
                  <span className="input-icon" aria-hidden="true"><ShieldIcon /></span>
                  <input
                    id="confirmPwd"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repeat your password"
                    value={confirmPwd}
                    onChange={e => setConfirmPwd(e.target.value)}
                    autoComplete="new-password"
                    required
                    disabled={loading}
                    style={{
                      borderColor: confirmPwd && confirmPwd !== password
                        ? "var(--error-text)"
                        : confirmPwd && confirmPwd === password
                          ? "var(--accent-2)"
                          : undefined
                    }}
                  />
                  <button
                    type="button"
                    className="pass-toggle"
                    onClick={() => setShowConfirm(v => !v)}
                    aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? (
                  <span className="btn-loader">
                    <span className="spinner" aria-hidden="true" />
                    Creating account…
                  </span>
                ) : "Create Account"}
              </button>
            </form>

            <div className="auth-divider">
              <span>already have an account?</span>
            </div>

            <div className="auth-footer-link">
              <Link to="/login">Sign in instead</Link>
            </div>
          </div>

        </div>
      </main>

      {/* ── Page Footer ── */}
      <footer className="page-footer" aria-label="Team attribution">
        <span>Developed by Team 7</span>
      </footer>
    </>
  );
}