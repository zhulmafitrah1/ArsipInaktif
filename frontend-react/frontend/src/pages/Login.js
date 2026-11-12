import { useState } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .login-root {
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    display: flex;
    background: #f4f6f9;
  }

  .lp-left {
    width: 480px;
    min-width: 420px;
    background: #fff;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 3rem 3.5rem;
    box-shadow: 4px 0 40px rgba(0,0,0,0.06);
    position: relative;
    z-index: 1;
  }

  .lp-brand {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    margin-bottom: 2.75rem;
  }

  .lp-brand-icon {
    width: 40px; height: 40px;
    background: #2563eb;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  .lp-brand-text { display: flex; flex-direction: column; line-height: 1; }
  .lp-brand-name { font-size: 1.0625rem; font-weight: 700; color: #0f1117; letter-spacing: -0.3px; }
  .lp-brand-sub  { font-size: 0.75rem; color: #6b7280; font-weight: 400; margin-top: 2px; }

  .lp-heading h1 {
    font-size: 1.875rem;
    font-weight: 700;
    color: #0f1117;
    letter-spacing: -0.5px;
    line-height: 1.25;
  }

  .lp-heading h1 span { color: #2563eb; }

  .lp-heading p {
    font-size: 0.9375rem;
    color: #6b7280;
    font-weight: 400;
    margin-top: 0.3rem;
  }

  .lp-divider {
    width: 40px; height: 3px;
    background: #2563eb;
    border-radius: 99px;
    margin: 1.25rem 0 2rem;
  }

  .lp-form { display: flex; flex-direction: column; gap: 1rem; }

  .lp-field-label {
    font-size: 0.8125rem;
    font-weight: 600;
    color: #374151;
    display: block;
    margin-bottom: 0.375rem;
    letter-spacing: 0.01em;
  }

  .lp-input-wrap {
    display: flex;
    align-items: center;
    background: #f8fafc;
    border: 1.5px solid #e4e8f0;
    border-radius: 10px;
    padding: 0 1rem;
    height: 48px;
    gap: 0.625rem;
    transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
  }

  .lp-input-wrap:focus-within {
    border-color: #2563eb;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(37,99,235,0.10);
  }

  .lp-input-icon {
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    color: #9ca3af;
    width: 18px; height: 18px;
  }

  .lp-input-wrap input {
    flex: 1;
    border: none;
    background: transparent;
    outline: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9375rem;
    color: #0f1117;
    font-weight: 400;
    line-height: 1;
    height: 100%;
  }

  .lp-input-wrap input::placeholder { color: #b0b7c3; font-weight: 400; }

  .lp-forgot-row { display: flex; justify-content: flex-end; margin-top: 0.125rem; }

  .lp-forgot {
    font-size: 0.8125rem;
    color: #2563eb;
    text-decoration: none;
    font-weight: 500;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    font-family: 'DM Sans', sans-serif;
  }

  .lp-forgot:hover { color: #1d4ed8; text-decoration: underline; }

  .lp-error {
    font-size: 0.8125rem;
    color: #dc2626;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    padding: 0.6rem 0.875rem;
    font-weight: 500;
    margin: 0;
  }

  .lp-btn {
    height: 48px;
    background: #2563eb;
    color: #fff;
    border: none;
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9375rem;
    font-weight: 600;
    cursor: pointer;
    letter-spacing: 0.01em;
    transition: background 0.15s, transform 0.12s, box-shadow 0.15s;
    box-shadow: 0 4px 14px rgba(37,99,235,0.30);
    margin-top: 0.25rem;
  }

  .lp-btn:hover { background: #1d4ed8; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37,99,235,0.38); }
  .lp-btn:active { transform: translateY(0); }
  .lp-btn:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }

  .lp-footer {
    margin-top: 2.5rem;
    font-size: 0.75rem;
    color: #c4c9d4;
    text-align: center;
  }

  .lp-right {
    flex: 1;
    background: linear-gradient(145deg, #eef2ff 0%, #e0eaff 50%, #dbeafe 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3rem 2rem;
    position: relative;
    overflow: hidden;
  }

  .lp-right::before {
    content: '';
    position: absolute;
    width: 400px; height: 400px;
    background: radial-gradient(circle, rgba(37,99,235,0.10) 0%, transparent 70%);
    top: -80px; right: -80px;
    border-radius: 50%;
    pointer-events: none;
  }

  .lp-right::after {
    content: '';
    position: absolute;
    width: 300px; height: 300px;
    background: radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%);
    bottom: -60px; left: -60px;
    border-radius: 50%;
    pointer-events: none;
  }

  .lp-right-content { position: relative; z-index: 1; text-align: center; max-width: 420px; }

  .lp-right-content h2 {
    font-size: 1.5rem; font-weight: 700; color: #0f1117;
    margin-bottom: 0.5rem; letter-spacing: -0.3px;
  }

  .lp-right-content p {
    font-size: 0.9rem; color: #6b7280; line-height: 1.6; margin-bottom: 2rem;
  }

  .lp-badges { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }

  .lp-badge {
    background: #fff; border: 1px solid #dde3f0; border-radius: 12px;
    padding: 0.625rem 1.25rem; display: flex; flex-direction: column;
    align-items: center; gap: 2px; min-width: 90px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }

  .lp-badge-val { font-size: 1.125rem; font-weight: 700; color: #2563eb; letter-spacing: -0.3px; }
  .lp-badge-lbl { font-size: 0.75rem; color: #6b7280; font-weight: 500; }

  @media (max-width: 820px) {
    .lp-right { display: none; }
    .lp-left  { width: 100%; min-width: unset; padding: 2.5rem 2rem; }
  }
`;

const IconArchive = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="M8 4v16M2 9h6M2 15h6"/>
  </svg>
);

const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
);

const IconLock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const IconEye = ({ show }) => show ? (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const Illustration = () => (
  <svg width="300" height="220" viewBox="0 0 320 240" fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ marginBottom: "2rem", filter: "drop-shadow(0 24px 48px rgba(37,99,235,0.12))" }}>
    <rect x="60" y="160" width="200" height="14" rx="7" fill="#c7d7f5"/>
    <rect x="80" y="58" width="160" height="107" rx="8" fill="#dce8ff" stroke="#a5b8e8" strokeWidth="2"/>
    <rect x="86" y="64" width="148" height="95" rx="5" fill="#f0f5ff"/>
    <rect x="100" y="74" width="52" height="14" rx="3" fill="#c8d8ff" stroke="#a5b8e8" strokeWidth="1.2"/>
    <rect x="100" y="93" width="52" height="14" rx="3" fill="#c8d8ff" stroke="#a5b8e8" strokeWidth="1.2"/>
    <rect x="100" y="112" width="52" height="14" rx="3" fill="#c8d8ff" stroke="#a5b8e8" strokeWidth="1.2"/>
    <rect x="122" y="79" width="8" height="4" rx="2" fill="#7fa3e8"/>
    <rect x="122" y="98" width="8" height="4" rx="2" fill="#7fa3e8"/>
    <rect x="122" y="117" width="8" height="4" rx="2" fill="#7fa3e8"/>
    <rect x="168" y="76" width="50" height="38" rx="4" fill="#fde68a"/>
    <path d="M168 80 Q176 74 184 76 H218 V114 H168 Z" fill="#fbbf24" opacity="0.45"/>
    <circle cx="219" cy="97" r="14" fill="#2563eb" opacity="0.12"/>
    <circle cx="219" cy="91" r="7" fill="#2563eb" opacity="0.45"/>
    <path d="M207 115 c0-7 5-12 12-12s12 5 12 12" fill="#2563eb" opacity="0.35"/>
    <rect x="80" y="163" width="160" height="6" rx="3" fill="#b0c4e8"/>
  </svg>
);

export default function Login({ onLogin }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Email dan password wajib diisi.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/login", { // ← DIPERBAIKI
        method: "POST",
        credentials: "include",                  // ← DITAMBAHKAN
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",          // ← DITAMBAHKAN
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Email atau password salah.");
      } else {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userProfile", JSON.stringify(data.user));
        onLogin();
      }
    } catch (err) {
      setError("Tidak dapat terhubung ke server. Pastikan backend Laravel berjalan di http://127.0.0.1:8000");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <>
      <style>{styles}</style>
      <div className="login-root">

        <div className="lp-left">

          <div className="lp-brand">
            <div className="lp-brand-icon"><IconArchive /></div>
            <div className="lp-brand-text">
              <span className="lp-brand-name">ArsipIn</span>
              <span className="lp-brand-sub">Sistem Arsip Digital</span>
            </div>
          </div>

          <div className="lp-heading">
            <h1>Selamat Datang di<br /><span>ArsipIn</span></h1>
            <p>Masuk untuk mengelola arsip Anda</p>
          </div>

          <div className="lp-divider" />

          <div className="lp-form">

            <div>
              <label className="lp-field-label" htmlFor="lp-email">Email</label>
              <div className="lp-input-wrap">
                <span className="lp-input-icon"><IconUser /></span>
                <input
                  id="lp-email"
                  type="email"
                  placeholder="Masukkan email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="lp-field-label" htmlFor="lp-password">Password</label>
              <div className="lp-input-wrap">
                <span className="lp-input-icon"><IconLock /></span>
                <input
                  id="lp-password"
                  type={showPass ? "text" : "password"}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  style={{ background: "none", border: "none", cursor: "pointer",
                    color: "#9ca3af", padding: 0, display: "flex", alignItems: "center" }}>
                  <IconEye show={showPass} />
                </button>
              </div>
            </div>

            {error && <p className="lp-error">{error}</p>}

            <button
              className="lp-btn"
              type="button"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Memproses..." : "Masuk ke Sistem"}
            </button>

          </div>

          <p className="lp-footer">© 2026 ArsipIn · Sistem Manajemen Arsip Digital</p>
        </div>

        <div className="lp-right">
          <div className="lp-right-content">
            <Illustration />
            <h2>Kelola Arsip dengan Mudah</h2>
            <p>Sistem manajemen arsip digital yang profesional</p>
            <div className="lp-badges">
              {[["100%","Digital"],["Aman","Terenkripsi"],["Cepat","Pencarian"]].map(([val, lbl]) => (
                <div className="lp-badge" key={lbl}>
                  <span className="lp-badge-val">{val}</span>
                  <span className="lp-badge-lbl">{lbl}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </>
  );
}