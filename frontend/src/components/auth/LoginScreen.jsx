import React, { useState } from "react";

// Hardcoded users — in production this would be a proper auth system
const USERS = {
  admin: {
    password: "admin123",
    role: "System Administrator",
    name: "System Admin",
    access: "full",
    color: "#1a56db",
  },
  analyst: {
    password: "analyst123",
    role: "Fraud Analyst",
    name: "Fraud Analyst",
    access: "analyst",
    color: "#7c3aed",
  },
  viewer: {
    password: "viewer123",
    role: "Viewer",
    name: "Viewer",
    access: "viewer",
    color: "#16a34a",
  },
};

const LoginScreen = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulate a short delay for realism
    await new Promise((resolve) => setTimeout(resolve, 800));

    const user = USERS[username.toLowerCase()];

    if (!user) {
      setError("Username not found");
      setLoading(false);
      return;
    }

    if (user.password !== password) {
      setError("Incorrect password");
      setLoading(false);
      return;
    }

    // Login successful
    onLogin({
      username: username.toLowerCase(),
      name: user.name,
      role: user.role,
      access: user.access,
      color: user.color,
    });

    setLoading(false);
  };

  const handleQuickLogin = async (username) => {
    const user = USERS[username];
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    onLogin({
      username,
      name: user.name,
      role: user.role,
      access: user.access,
      color: user.color,
    });
    setLoading(false);
  };

  const globalCSS = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }

    .login-bg {
      min-height: 100vh;
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Inter', sans-serif;
      position: relative;
      overflow: hidden;
    }

    /* Animated background blobs */
    .blob {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.15;
      animation: float 8s ease-in-out infinite;
    }
    .blob-1 {
      width: 400px; height: 400px;
      background: #3b82f6;
      top: -100px; left: -100px;
      animation-delay: 0s;
    }
    .blob-2 {
      width: 300px; height: 300px;
      background: #7c3aed;
      bottom: -50px; right: -50px;
      animation-delay: 2s;
    }
    .blob-3 {
      width: 200px; height: 200px;
      background: #06b6d4;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      animation-delay: 4s;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px) scale(1); }
      50%       { transform: translateY(-30px) scale(1.05); }
    }

    /* Glass card */
    .glass-card {
      background:    rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border:        1px solid rgba(255, 255, 255, 0.15);
      border-radius: 24px;
      padding:       40px;
      width:         100%;
      max-width:     420px;
      position:      relative;
      z-index:       10;
      box-shadow:    0 25px 50px rgba(0, 0, 0, 0.4);
    }

    /* Logo */
    .logo-section {
      text-align: center;
      margin-bottom: 32px;
    }
    .logo-icon {
      width:           64px;
      height:          64px;
      background:      linear-gradient(135deg, #1a56db, #7c3aed);
      border-radius:   16px;
      display:         flex;
      align-items:     center;
      justify-content: center;
      margin:          0 auto 16px;
      font-size:       28px;
    }
    .logo-title {
      font-size:   24px;
      font-weight: 700;
      color:       #ffffff;
      margin:      0 0 4px 0;
    }
    .logo-sub {
      font-size: 13px;
      color:     rgba(255,255,255,0.5);
      margin:    0;
    }

    /* Form inputs */
    .input-group {
      margin-bottom: 16px;
    }
    .input-label {
      display:       block;
      font-size:     12px;
      font-weight:   500;
      color:         rgba(255,255,255,0.6);
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .input-wrapper {
      position: relative;
    }
    .glass-input {
      width:            100%;
      padding:          12px 16px;
      background:       rgba(255,255,255,0.08);
      border:           1px solid rgba(255,255,255,0.15);
      border-radius:    10px;
      color:            #ffffff;
      font-size:        14px;
      font-family:      'Inter', sans-serif;
      outline:          none;
      transition:       all 0.2s;
    }
    .glass-input::placeholder {
      color: rgba(255,255,255,0.3);
    }
    .glass-input:focus {
      border-color:  rgba(99, 102, 241, 0.8);
      background:    rgba(255,255,255,0.12);
      box-shadow:    0 0 0 3px rgba(99, 102, 241, 0.2);
    }
    .show-pass-btn {
      position:        absolute;
      right:           12px;
      top:             50%;
      transform:       translateY(-50%);
      background:      none;
      border:          none;
      color:           rgba(255,255,255,0.4);
      cursor:          pointer;
      font-size:       12px;
      padding:         4px;
    }
    .show-pass-btn:hover {
      color: rgba(255,255,255,0.8);
    }

    /* Error */
    .error-msg {
      background:    rgba(220, 38, 38, 0.15);
      border:        1px solid rgba(220, 38, 38, 0.3);
      border-radius: 8px;
      padding:       10px 14px;
      color:         #fca5a5;
      font-size:     13px;
      margin-bottom: 16px;
      display:       flex;
      align-items:   center;
      gap:           8px;
    }

    /* Login button */
    .login-btn {
      width:           100%;
      padding:         13px;
      background:      linear-gradient(135deg, #1a56db, #7c3aed);
      border:          none;
      border-radius:   10px;
      color:           #ffffff;
      font-size:       15px;
      font-weight:     600;
      font-family:     'Inter', sans-serif;
      cursor:          pointer;
      transition:      all 0.2s;
      margin-bottom:   24px;
    }
    .login-btn:hover:not(:disabled) {
      transform:  translateY(-1px);
      box-shadow: 0 8px 20px rgba(26, 86, 219, 0.4);
    }
    .login-btn:disabled {
      opacity: 0.7;
      cursor:  not-allowed;
    }

    /* Divider */
    .divider {
      display:        flex;
      align-items:    center;
      gap:            12px;
      margin-bottom:  20px;
    }
    .divider-line {
      flex:             1;
      height:           1px;
      background:       rgba(255,255,255,0.1);
    }
    .divider-text {
      font-size: 12px;
      color:     rgba(255,255,255,0.3);
    }

    /* Quick login buttons */
    .quick-logins {
      display: flex;
      gap:     8px;
    }
    .quick-btn {
      flex:            1;
      padding:         8px 4px;
      background:      rgba(255,255,255,0.06);
      border:          1px solid rgba(255,255,255,0.1);
      border-radius:   8px;
      color:           rgba(255,255,255,0.7);
      font-size:       11px;
      font-family:     'Inter', sans-serif;
      cursor:          pointer;
      transition:      all 0.2s;
      text-align:      center;
    }
    .quick-btn:hover {
      background:   rgba(255,255,255,0.12);
      border-color: rgba(255,255,255,0.2);
      color:        #ffffff;
    }
    .quick-btn-role {
      display:     block;
      font-size:   10px;
      color:       rgba(255,255,255,0.4);
      margin-top:  2px;
    }

    /* Footer */
    .login-footer {
      text-align:  center;
      margin-top:  24px;
      font-size:   11px;
      color:       rgba(255,255,255,0.25);
    }

    /* Loading spinner */
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .spinner {
      display:       inline-block;
      width:         16px;
      height:        16px;
      border:        2px solid rgba(255,255,255,0.3);
      border-top:    2px solid #ffffff;
      border-radius: 50%;
      animation:     spin 0.8s linear infinite;
      margin-right:  8px;
      vertical-align: middle;
    }
  `;

  return (
    <>
      <style>{globalCSS}</style>
      <div className="login-bg">
        {/* Animated background blobs */}
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />

        {/* Glass card */}
        <div className="glass-card">
          {/* Logo */}
          <div className="logo-section">
            <div className="logo-icon">🛡</div>
            <p className="logo-title">FraudShield</p>
            <p className="logo-sub">ML-Powered Fraud Detection System</p>
          </div>

          {/* Login form */}
          <form onSubmit={handleLogin}>
            {/* Username */}
            <div className="input-group">
              <label className="input-label">Username</label>
              <input
                className="glass-input"
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                }}
                autoComplete="username"
              />
            </div>

            {/* Password */}
            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="input-wrapper">
                <input
                  className="glass-input"
                  type={showPass ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  autoComplete="current-password"
                  style={{ paddingRight: "60px" }}
                />
                <button
                  type="button"
                  className="show-pass-btn"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="error-msg">
                <span>⚠</span>
                <span>{error}</span>
              </div>
            )}

            {/* Login button */}
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
                "Login to Dashboard"
              )}
            </button>
          </form>

          {/* Quick login section */}
          <div className="divider">
            <div className="divider-line" />
            <span className="divider-text">Quick access for demo</span>
            <div className="divider-line" />
          </div>

          <div className="quick-logins">
            {Object.entries(USERS).map(([key, user]) => (
              <button
                key={key}
                className="quick-btn"
                onClick={() => handleQuickLogin(key)}
                disabled={loading}
              >
                {user.name}
                <span className="quick-btn-role">{user.role}</span>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="login-footer">
            FYP 2026 · Asia Pacific University · Eshaal Irshad
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginScreen;
