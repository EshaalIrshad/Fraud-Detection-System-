import React, { useState } from "react";
import { notifyLoginSuccess, notifyLoginError } from "../../utils/notification";
import { useNavigate } from "react-router-dom";

const LoginScreen = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.toLowerCase(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        notifyLoginError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("fraudshield_token", data.access_token);
      localStorage.setItem("fraudshield_user", JSON.stringify(data.user));

      const userData = {
        username: data.user.username,
        name: data.user.name,
        role: data.user.role,
        access: data.user.role,
        color: data.user.role === "admin" ? "#1a56db" : "#7c3aed",
        id: data.user.id,
        token: data.access_token,
      };

      notifyLoginSuccess(userData);
      onLogin(userData);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const msg = "Cannot connect to server — is Flask running?";
      setError(msg);
      notifyLoginError(msg);
    } finally {
      setLoading(false);
    }
  };

  const globalCSS = `
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700&family=DM+Sans:wght@400;500&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    .login-bg {
      min-height: 100vh;
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'DM Sans', sans-serif;
      padding: 24px;
      background: linear-gradient(135deg, #eef4fb 0%, #dbe9f7 50%, #c9def2 100%);
    }

    .bg-blob {
      position: absolute;
      border-radius: 50%;
      filter: blur(60px);
      opacity: 0.55;
      pointer-events: none;
    }

    .bg-blob-1 {
      width: 420px;
      height: 420px;
      background: #a9cdf2;
      top: -140px;
      left: -120px;
    }

    .bg-blob-2 {
      width: 380px;
      height: 380px;
      background: #185fa5;
      opacity: 0.25;
      bottom: -160px;
      right: -100px;
    }

    .bg-blob-3 {
      width: 260px;
      height: 260px;
      background: #ffffff;
      opacity: 0.5;
      bottom: 8%;
      left: 6%;
    }

    .login-card {
      display: flex;
      width: 100%;
      max-width: 780px;
      min-height: 480px;
      border-radius: 18px;
      overflow: hidden;
      position: relative;
      z-index: 2;
      border: 1px solid rgba(255, 255, 255, 0.5);
      box-shadow: 0 25px 60px rgba(13, 42, 78, 0.18);
    }

    /* ── Left: branding panel ── */
    .brand-panel {
      flex: 1;
      background: #0d2a4e;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      padding: 36px 32px;
    }

    .hex-bg {
      position: absolute;
      inset: 0;
      opacity: 0.06;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='52' height='90'%3E%3Cpath d='M26 60L0 45V15L26 0l26 15v30L26 60zM26 90L0 75V45l26-15 26 15v30L26 90z' fill='none' stroke='%23ffffff' stroke-width='1'/%3E%3C/svg%3E");
    }

    .brand-top-row {
      display: flex;
      align-items: center;
      gap: 10px;
      position: relative;
      z-index: 2;
    }

    .shield-mini {
      width: 34px;
      height: 34px;
      flex-shrink: 0;
    }

    .brand-name-small {
      font-family: 'Sora', sans-serif;
      font-size: 19px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: -0.3px;
    }

    .brand-mid {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      z-index: 2;
      padding: 20px 0;
    }

    .shield-big {
      width: 92px;
      height: 106px;
      filter: drop-shadow(0 0 18px rgba(56, 139, 253, 0.45));
      margin-bottom: 22px;
    }

    .brand-tagline {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.85);
      text-align: center;
      line-height: 1.55;
      max-width: 230px;
      font-weight: 500;
    }

    .badge-row {
      display: flex;
      gap: 8px;
      position: relative;
      z-index: 2;
      margin-top: auto;
    }

    .badge {
      display: flex;
      align-items: center;
      gap: 5px;
      background: rgba(56, 139, 253, 0.14);
      border: 1px solid rgba(56, 139, 253, 0.35);
      border-radius: 999px;
      padding: 5px 11px;
      font-size: 11px;
      color: #9cc4f0;
      font-weight: 500;
    }

    .badge svg {
      width: 13px;
      height: 13px;
    }

    /* ── Right: glass form panel ── */
    .form-panel {
      flex: 1.05;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.55), rgba(232, 241, 251, 0.65));
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      border-left: 1px solid rgba(255, 255, 255, 0.6);
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 44px 42px;
      position: relative;
    }

    .form-title {
      font-family: 'Sora', sans-serif;
      font-size: 23px;
      font-weight: 700;
      color: #0d2a4e;
      margin-bottom: 6px;
    }

    .form-sub {
      font-size: 13px;
      color: #4a6fa5;
      line-height: 1.6;
      margin-bottom: 26px;
      max-width: 320px;
    }

    .input-group {
      margin-bottom: 16px;
    }

    .input-label {
      display: block;
      font-size: 12px;
      font-weight: 500;
      color: #2d5080;
      margin-bottom: 6px;
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .lead-icon {
      position: absolute;
      left: 13px;
      color: #6396d0;
      display: flex;
      pointer-events: none;
    }

    .form-input {
      width: 100%;
      padding: 11px 14px 11px 38px;
      border: 1px solid rgba(24, 95, 165, 0.18);
      border-radius: 10px;
      font-size: 14px;
      font-family: 'DM Sans', sans-serif;
      background: rgba(255, 255, 255, 0.6);
      backdrop-filter: blur(6px);
      color: #0d2a4e;
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
    }

    .form-input::placeholder {
      color: #9bb3d1;
    }

    .form-input:focus {
      border-color: #185fa5;
      box-shadow: 0 0 0 3px rgba(24, 95, 165, 0.14);
      background: rgba(255, 255, 255, 0.85);
    }

    .eye-btn {
      position: absolute;
      right: 12px;
      background: none;
      border: none;
      cursor: pointer;
      color: #8aaacf;
      display: flex;
      padding: 2px;
    }

    .eye-btn:hover {
      color: #4a6fa5;
    }

    .error-msg {
      background: rgba(220, 38, 38, 0.08);
      border: 1px solid rgba(220, 38, 38, 0.25);
      border-radius: 8px;
      padding: 10px 14px;
      color: #b91c1c;
      font-size: 13px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .login-btn {
      width: 100%;
      margin-top: 6px;
      padding: 12px;
      background: #185fa5;
      border: none;
      border-radius: 10px;
      color: #ffffff;
      font-size: 14.5px;
      font-weight: 500;
      font-family: 'Sora', sans-serif;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: background 0.15s, transform 0.1s;
      box-shadow: 0 8px 20px rgba(24, 95, 165, 0.25);
    }

    .login-btn:hover:not(:disabled) {
      background: #0c447c;
    }

    .login-btn:active:not(:disabled) {
      transform: scale(0.99);
    }

    .login-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .spinner {
      display: inline-block;
      width: 15px; height: 15px;
      border: 2px solid rgba(255, 255, 255, 0.35);
      border-top: 2px solid #ffffff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @media (max-width: 640px) {
      .login-card { flex-direction: column; }
      .brand-panel { padding: 28px; min-height: 220px; }
      .form-panel { padding: 36px 28px; border-left: none; border-top: 1px solid rgba(255,255,255,0.6); }
    }
  `;

  return (
    <>
      <style>{globalCSS}</style>
      <div className="login-bg">
        <div className="bg-blob bg-blob-1" />
        <div className="bg-blob bg-blob-2" />
        <div className="bg-blob bg-blob-3" />

        <div className="login-card">
          {/* Left: branding panel */}
          <div className="brand-panel">
            <div className="hex-bg" />

            <div className="brand-top-row">
              <svg
                className="shield-mini"
                viewBox="0 0 100 116"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M50 4L8 20v32c0 26.5 18 51.3 42 58 24-6.7 42-31.5 42-58V20L50 4z"
                  fill="rgba(24,95,165,0.4)"
                  stroke="#388bfd"
                  strokeWidth="2"
                />
                <path
                  d="M36 54l9 9 19-19"
                  stroke="#9cc4f0"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="brand-name-small">FraudShield</span>
            </div>

            <div className="brand-mid">
              <svg
                className="shield-big"
                viewBox="0 0 100 116"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M50 4L8 20v32c0 26.5 18 51.3 42 58 24-6.7 42-31.5 42-58V20L50 4z"
                  fill="rgba(24,95,165,0.35)"
                  stroke="rgba(56,139,253,0.75)"
                  strokeWidth="1.5"
                />
                <path
                  d="M50 14L16 27.6v24.4c0 21.2 14.4 41 34 46.4 19.6-5.4 34-25.2 34-46.4V27.6L50 14z"
                  fill="rgba(24,95,165,0.22)"
                  stroke="rgba(56,139,253,0.45)"
                  strokeWidth="1"
                />
                <path
                  d="M36 54l9 9 19-19"
                  stroke="#388bfd"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="brand-tagline">
                Smarter fraud detection, safer transactions.
              </p>
            </div>

            <div className="badge-row">
              <span className="badge">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2a4 4 0 0 0-4 4v1a3 3 0 0 0-2 2.8V12a3 3 0 0 0 1.5 2.6V17a3 3 0 0 0 3 3h3a3 3 0 0 0 3-3v-2.4A3 3 0 0 0 18 12V9.8a3 3 0 0 0-2-2.8V6a4 4 0 0 0-4-4z" />
                </svg>
                ML-powered
              </span>
              <span className="badge">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 2 3 14h7l-1 8 11-12h-7z" />
                </svg>
                Real-time
              </span>
            </div>
          </div>

          {/* Right: glass form panel */}
          <div className="form-panel">
            <h1 className="form-title">Welcome back</h1>
            <p className="form-sub">Log in to access the system</p>

            <form onSubmit={handleLogin}>
              {/* Username */}
              <div className="input-group">
                <label className="input-label">Username</label>
                <div className="input-wrapper">
                  <span className="lead-icon">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 21v-1a7 7 0 0 1 14 0v1" />
                    </svg>
                  </span>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setError("");
                    }}
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="input-group">
                <label className="input-label">Password</label>
                <div className="input-wrapper">
                  <span className="lead-icon">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="4" y="11" width="16" height="9" rx="2" />
                      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                    </svg>
                  </span>
                  <input
                    className="form-input"
                    type={showPass ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    autoComplete="current-password"
                    style={{ paddingRight: "40px" }}
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowPass(!showPass)}
                    aria-label={showPass ? "Hide password" : "Show password"}
                  >
                    {showPass ? (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M3 3l18 18" />
                        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                        <path d="M9.9 4.2A9.8 9.8 0 0 1 12 4c5 0 9 4 10 8-.4 1.4-1.1 2.7-2 3.8M6.1 6.1C4.2 7.4 2.8 9.5 2 12c1 4 5 8 10 8 1.1 0 2.1-.2 3-.5" />
                      </svg>
                    ) : (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="error-msg">
                  <span>⚠</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                className="login-btn"
                disabled={loading || !username || !password}
              >
                {loading ? (
                  <>
                    <span className="spinner" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Login to the dashboard
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginScreen;
