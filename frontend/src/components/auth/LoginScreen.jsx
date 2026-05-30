import React, { useState } from "react";
import { notifyLoginSuccess, notifyLoginError } from "../../utils/notification";

const LoginScreen = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);

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
    } catch (err) {
      const msg = "Cannot connect to server — is Flask running?";
      setError(msg);
      notifyLoginError(msg);
    } finally {
      setLoading(false);
    }
  };

  const globalCSS = `
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=DM+Sans:wght@400;500&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    .login-bg {
      min-height: 100vh;
      background: #f0f4f8;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'DM Sans', sans-serif;
    }

    .login-card {
      display: flex;
      width: 860px;
      min-height: 520px;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    }

    .brand-panel {
      flex: 1;
      background: #0d2a4e;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 32px;
    }

    .hex-bg {
      position: absolute;
      inset: 0;
      opacity: 0.07;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100'%3E%3Cpath d='M28 66L0 50V18L28 2l28 16v32L28 66zM28 98L0 82V50l28-16 28 16v32L28 98z' fill='none' stroke='%23ffffff' stroke-width='1'/%3E%3C/svg%3E");
    }

    .glow-ring {
      position: absolute;
      width: 320px; height: 320px;
      border-radius: 50%;
      border: 1px solid rgba(56, 139, 253, 0.2);
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
    }

    .glow-ring-inner {
      position: absolute;
      width: 220px; height: 220px;
      border-radius: 50%;
      border: 1px solid rgba(56, 139, 253, 0.15);
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      background: radial-gradient(circle, rgba(24, 95, 165, 0.25) 0%, transparent 70%);
    }

    .shield-wrap {
      position: relative;
      z-index: 2;
      margin-bottom: 28px;
    }

    .shield-svg {
      filter: drop-shadow(0 0 24px rgba(56, 139, 253, 0.5));
    }

    .brand-name {
      font-family: 'Sora', sans-serif;
      font-size: 26px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: -0.5px;
      position: relative;
      z-index: 2;
      margin-bottom: 8px;
    }

    .brand-tagline {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.45);
      text-align: center;
      position: relative;
      z-index: 2;
      line-height: 1.6;
      max-width: 200px;
    }

    .badge-row {
      display: flex;
      gap: 8px;
      margin-top: 28px;
      position: relative;
      z-index: 2;
    }

    .badge {
      background: rgba(56, 139, 253, 0.15);
      border: 0.5px solid rgba(56, 139, 253, 0.3);
      border-radius: 20px;
      padding: 5px 12px;
      font-size: 11px;
      color: rgba(255, 255, 255, 0.6);
    }

    .form-panel {
      flex: 1.1;
      background: linear-gradient(135deg, #ffffff 0%, #e8f1fb 50%, #c8ddf5 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 48px 44px;
    }

    .form-heading {
      margin-bottom: 28px;
    }

    .form-title {
      font-family: 'Sora', sans-serif;
      font-size: 24px;
      font-weight: 700;
      color: #0d2a4e;
      margin-bottom: 6px;
    }

    .form-sub {
      font-size: 13px;
      color: #4a6fa5;
      line-height: 1.6;
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
      letter-spacing: 0.03em;
    }

    .input-wrapper {
      position: relative;
    }

    .form-input {
      width: 100%;
      padding: 11px 42px 11px 14px;
      border: 0.5px solid rgba(24, 95, 165, 0.25);
      border-radius: 10px;
      font-size: 14px;
      font-family: 'DM Sans', sans-serif;
      background: rgba(255, 255, 255, 0.75);
      color: #0d2a4e;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    }

    .form-input::placeholder {
      color: #8aaacf;
    }

    .form-input:focus {
      border-color: #185fa5;
      box-shadow: 0 0 0 3px rgba(24, 95, 165, 0.12);
      background: rgba(255, 255, 255, 0.95);
    }

    .input-icon {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: #4a6fa5;
      cursor: pointer;
      font-size: 16px;
      padding: 2px;
      display: flex;
      align-items: center;
    }

    .input-icon:hover {
      color: #185fa5;
    }

    .error-msg {
      background: rgba(220, 38, 38, 0.1);
      border: 0.5px solid rgba(220, 38, 38, 0.3);
      border-radius: 8px;
      padding: 10px 14px;
      color: #b91c1c;
      font-size: 13px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .remember-row {
      display: flex;
      align-items: center;
      gap: 7px;
      font-size: 13px;
      color: #4a6fa5;
      cursor: pointer;
      margin-bottom: 20px;
      user-select: none;
    }

    .remember-row input[type="checkbox"] {
      accent-color: #185fa5;
      width: 14px;
      height: 14px;
      cursor: pointer;
    }

    .login-btn {
      width: 100%;
      padding: 13px;
      background: #185fa5;
      border: none;
      border-radius: 10px;
      color: #ffffff;
      font-size: 15px;
      font-weight: 600;
      font-family: 'Sora', sans-serif;
      cursor: pointer;
      letter-spacing: 0.01em;
      transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
    }

    .login-btn:hover:not(:disabled) {
      background: #0c447c;
      transform: translateY(-1px);
      box-shadow: 0 8px 24px rgba(24, 95, 165, 0.3);
    }

    .login-btn:disabled {
      opacity: 0.65;
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
      margin-right: 8px;
      vertical-align: middle;
    }

    @media (max-width: 680px) {
      .login-card { flex-direction: column; width: 94vw; }
      .brand-panel { padding: 36px 24px; min-height: 220px; }
      .form-panel { padding: 36px 28px; }
    }
  `;

  return (
    <>
      <style>{globalCSS}</style>
      <div className="login-bg">
        <div className="login-card">
          {/* Left: branding panel */}
          <div className="brand-panel">
            <div className="hex-bg" />
            <div className="glow-ring" />
            <div className="glow-ring-inner" />

            <div className="shield-wrap">
              <svg
                className="shield-svg"
                width="100"
                height="116"
                viewBox="0 0 100 116"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M50 4L8 20v32c0 26.5 18 51.3 42 58 24-6.7 42-31.5 42-58V20L50 4z"
                  fill="rgba(24,95,165,0.35)"
                  stroke="rgba(56,139,253,0.7)"
                  strokeWidth="1.5"
                />
                <path
                  d="M50 14L16 27.6v24.4c0 21.2 14.4 41 34 46.4 19.6-5.4 34-25.2 34-46.4V27.6L50 14z"
                  fill="rgba(24,95,165,0.2)"
                  stroke="rgba(56,139,253,0.4)"
                  strokeWidth="1"
                />
                <path
                  d="M36 54l9 9 19-19"
                  stroke="#388bfd"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <p className="brand-name">FraudShield</p>
            <p className="brand-tagline">
              Smarter Fraud Detection, Safer Transactions.
            </p>

            <div className="badge-row">
              <span className="badge">ML-Powered</span>
              <span className="badge">Real-time</span>
            </div>
          </div>

          {/* Right: form panel */}
          <div className="form-panel">
            <div className="form-heading">
              <h1 className="form-title">Welcome Back!</h1>
              <p className="form-sub">
                Log in to access your dashboard, manage your account, and
                continue securely with full control.
              </p>
            </div>

            <form onSubmit={handleLogin}>
              <div className="input-group">
                <label className="input-label">Username</label>
                <div className="input-wrapper">
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
                  <span className="input-icon">👤</span>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Password</label>
                <div className="input-wrapper">
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
                    style={{ paddingRight: "48px" }}
                  />
                  <button
                    type="button"
                    className="input-icon"
                    onClick={() => setShowPass(!showPass)}
                    aria-label={showPass ? "Hide password" : "Show password"}
                  >
                    {showPass ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              {error && (
                <div className="error-msg">
                  <span>⚠</span>
                  <span>{error}</span>
                </div>
              )}

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
                  "Login to the Dashboard"
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
