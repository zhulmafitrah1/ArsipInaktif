import { useState, useEffect } from "react";

const API = "http://localhost:8000/api";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  .profile-page {
    min-height: 100vh;
    background: #f1f5f9;
    padding: 36px 32px;
    font-family: 'DM Sans', sans-serif;
  }

  .profile-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 28px;
  }

  .profile-header-icon {
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, #2563eb, #3b82f6);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    box-shadow: 0 4px 10px rgba(37,99,235,0.2);
  }

  .profile-title {
    font-family: 'Syne', sans-serif;
    font-size: 22px;
    font-weight: 800;
    color: #1e293b;
    margin: 0;
    letter-spacing: -0.3px;
  }

  .profile-subtitle {
    font-size: 13px;
    color: #94a3b8;
    margin: 2px 0 0 0;
  }

  .profile-layout {
    display: grid;
    grid-template-columns: 260px 1fr;
    gap: 20px;
    max-width: 880px;
  }

  .profile-avatar-card {
    background: #ffffff;
    border: 1px solid #e8edf3;
    border-radius: 18px;
    padding: 28px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    height: fit-content;
    position: relative;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0,0,0,0.04);
  }

  .profile-avatar-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, #2563eb, #f59e0b);
    border-radius: 18px 18px 0 0;
  }

  .avatar-circle {
    width: 84px;
    height: 84px;
    border-radius: 50%;
    background: linear-gradient(135deg, #2563eb, #3b82f6);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Syne', sans-serif;
    font-size: 30px;
    font-weight: 800;
    color: white;
    position: relative;
    box-shadow: 0 6px 20px rgba(37,99,235,0.25);
  }

  .avatar-status {
    position: absolute;
    bottom: 4px; right: 4px;
    width: 14px; height: 14px;
    background: #22c55e;
    border-radius: 50%;
    border: 2px solid white;
  }

  .avatar-name {
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 700;
    color: #1e293b;
    text-align: center;
    margin: 0;
  }

  .avatar-username {
    font-size: 12.5px;
    color: #94a3b8;
    background: #f1f5f9;
    padding: 3px 12px;
    border-radius: 20px;
    margin: 0;
  }

  .avatar-divider {
    width: 100%;
    height: 1px;
    background: #f0f4f8;
    margin: 2px 0;
  }

  .role-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    color: #2563eb;
    font-size: 11px;
    font-weight: 600;
    padding: 4px 12px;
    border-radius: 20px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .avatar-info-row {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 0;
  }

  .avatar-info-icon {
    width: 30px; height: 30px;
    background: #f1f5f9;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    flex-shrink: 0;
  }

  .avatar-info-label {
    font-size: 10.5px;
    color: #94a3b8;
    display: block;
    margin-bottom: 1px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .avatar-info-value {
    font-size: 12.5px;
    color: #475569;
    font-weight: 500;
  }

  .profile-form-card {
    background: #ffffff;
    border: 1px solid #e8edf3;
    border-radius: 18px;
    padding: 28px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.04);
  }

  .form-section-title {
    font-family: 'Syne', sans-serif;
    font-size: 11px;
    font-weight: 700;
    color: #2563eb;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin: 0 0 18px 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .form-section-title::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e8edf3;
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin-bottom: 4px;
  }

  .form-group { display: flex; flex-direction: column; gap: 6px; }
  .form-group.full-width { grid-column: 1 / -1; }

  .form-label {
    font-size: 11px;
    font-weight: 600;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .form-input {
    background: #f8fafc;
    border: 1.5px solid #e8edf3;
    border-radius: 10px;
    padding: 10px 13px;
    color: #475569;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    transition: all 0.16s ease;
    outline: none;
    width: 100%;
    box-sizing: border-box;
  }

  .form-input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
    color: #1e293b;
    background: #fff;
  }

  .form-input:disabled { opacity: 0.6; cursor: default; }
  .form-input.active { background: #ffffff; border-color: #bfdbfe; color: #1e293b; }

  .btn-group {
    display: flex;
    gap: 10px;
    margin-top: 20px;
    flex-wrap: wrap;
  }

  .btn {
    padding: 9px 18px;
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: all 0.16s ease;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .btn-primary {
    background: linear-gradient(135deg, #2563eb, #3b82f6);
    color: white;
    box-shadow: 0 3px 10px rgba(37,99,235,0.25);
  }

  .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 5px 16px rgba(37,99,235,0.35); }
  .btn-primary:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }

  .btn-outline {
    background: transparent;
    color: #64748b;
    border: 1.5px solid #e8edf3;
  }

  .btn-outline:hover { background: #f1f5f9; color: #1e293b; }

  .btn-teal {
    background: #f0fdf4;
    color: #16a34a;
    border: 1.5px solid #bbf7d0;
  }

  .btn-teal:hover { background: #dcfce7; }

  .btn-danger {
    background: #fff1f2;
    color: #e11d48;
    border: 1.5px solid #fecdd3;
  }

  .btn-danger:hover { background: #ffe4e6; }

  .password-section {
    margin-top: 24px;
    padding-top: 22px;
    border-top: 1px solid #f0f4f8;
    animation: slideDown 0.25s ease;
  }

  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .password-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  .alert {
    padding: 10px 14px;
    border-radius: 10px;
    font-size: 13px;
    margin-top: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    animation: slideDown 0.25s ease;
  }

  .alert-success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a; }
  .alert-error   { background: #fff1f2; border: 1px solid #fecdd3; color: #e11d48; }
`;

function ProfileSaya() {
  const [editMode, setEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  //  Ambil dari userProfile (seragam dengan Login.jsx)
  const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const [formData, setFormData] = useState({
    name:  userProfile?.name  || "",
    email: userProfile?.email || "",
    role:  userProfile?.role  || "",
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: "", confirmPassword: ""
  });

  const showAlertMsg = (message, type = "success") => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handlePasswordChange = (e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value });

  /* ===== SIMPAN PROFIL → kirim ke Laravel ===== */
  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      showAlertMsg("Nama dan Email wajib diisi!", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/users/${userProfile.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          nama_lengkap: formData.name,
          email:        formData.email,
          role:         formData.role,
        })
      });

      const data = await res.json();

      if (res.ok) {
        //  Update localStorage agar sidebar ikut berubah
        const updated = { ...userProfile, name: formData.name, email: formData.email };
        localStorage.setItem("userProfile", JSON.stringify(updated));
        showAlertMsg("Profil berhasil diperbarui!");
        setEditMode(false);
      } else {
        showAlertMsg(data.message || "Gagal memperbarui profil.", "error");
      }
    } catch {
      showAlertMsg("Tidak dapat terhubung ke server.", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ===== UBAH PASSWORD → kirim ke Laravel ===== */
  const handleChangePassword = async () => {
    if (!passwordData.newPassword) {
      showAlertMsg("Password baru wajib diisi!", "error"); return;
    }
    if (passwordData.newPassword.length < 6) {
      showAlertMsg("Password minimal 6 karakter!", "error"); return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showAlertMsg("Konfirmasi password tidak cocok!", "error"); return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/users/${userProfile.id}/reset-password`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ password: passwordData.newPassword })
      });

      const data = await res.json();

      if (res.ok) {
        showAlertMsg("Password berhasil diubah!");
        setPasswordData({ newPassword: "", confirmPassword: "" });
        setShowPassword(false);
      } else {
        showAlertMsg(data.message || "Gagal mengubah password.", "error");
      }
    } catch {
      showAlertMsg("Tidak dapat terhubung ke server.", "error");
    } finally {
      setLoading(false);
    }
  };

  const initials = formData.name ? formData.name.charAt(0).toUpperCase() : "A";

  return (
    <>
      <style>{styles}</style>
      <div className="profile-page">

        <div className="profile-header">
          <div className="profile-header-icon">👤</div>
          <div>
            <h2 className="profile-title">Profil Saya</h2>
            <p className="profile-subtitle">Kelola informasi akun dan keamanan Anda</p>
          </div>
        </div>

        <div className="profile-layout">

          {/* AVATAR CARD */}
          <div className="profile-avatar-card">
            <div className="avatar-circle">
              {initials}
              <div className="avatar-status" />
            </div>
            <div>
              <p className="avatar-name">{formData.name || "Nama Pengguna"}</p>
              <p className="avatar-username">@{userProfile?.name || "username"}</p>
            </div>
            <div className="role-badge">
              ⚡ {formData.role === "admin" ? "Administrator" : "Staff Arsip"}
            </div>
            <div className="avatar-divider" />
            <div className="avatar-info-row">
              <div className="avatar-info-icon">✉️</div>
              <div>
                <span className="avatar-info-label">Email</span>
                <span className="avatar-info-value">{formData.email || "—"}</span>
              </div>
            </div>
            <div className="avatar-info-row">
              <div className="avatar-info-icon">🏢</div>
              <div>
                <span className="avatar-info-label">Sistem</span>
                <span className="avatar-info-value">ArsipIn v1.0</span>
              </div>
            </div>
          </div>

          {/* FORM CARD */}
          <div className="profile-form-card">
            <p className="form-section-title">Informasi Akun</p>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Username</label>
                <input className="form-input" value={userProfile?.name || ""} disabled />
              </div>

              <div className="form-group">
                <label className="form-label">Nama Lengkap</label>
                <input
                  className={`form-input ${editMode ? "active" : ""}`}
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!editMode}
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label">Email</label>
                <input
                  className={`form-input ${editMode ? "active" : ""}`}
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!editMode}
                  placeholder="Masukkan email"
                />
              </div>
            </div>

            {!editMode ? (
              <div className="btn-group">
                <button className="btn btn-primary" onClick={() => setEditMode(true)}>✏️ Edit Profil</button>
                <button className="btn btn-teal" onClick={() => setShowPassword(!showPassword)}>
                  🔒 {showPassword ? "Tutup" : "Ubah Password"}
                </button>
              </div>
            ) : (
              <div className="btn-group">
                <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
                  {loading ? "Menyimpan..." : "✓ Simpan Perubahan"}
                </button>
                <button className="btn btn-outline" onClick={() => setEditMode(false)}>Batal</button>
              </div>
            )}

            {alert && (
              <div className={`alert ${alert.type === "error" ? "alert-error" : "alert-success"}`}>
                {alert.type === "error" ? "⚠️" : "✅"} {alert.message}
              </div>
            )}

            {showPassword && (
              <div className="password-section">
                <p className="form-section-title">Keamanan Akun</p>
                <div className="password-grid">
                  <div className="form-group">
                    <label className="form-label">Password Baru</label>
                    <input
                      type="password"
                      className="form-input active"
                      name="newPassword"
                      placeholder="Min. 6 karakter"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Konfirmasi Password</label>
                    <input
                      type="password"
                      className="form-input active"
                      name="confirmPassword"
                      placeholder="Ulangi password baru"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                    />
                  </div>
                </div>
                <div className="btn-group">
                  <button className="btn btn-primary" onClick={handleChangePassword} disabled={loading}>
                    {loading ? "Menyimpan..." : "🔐 Simpan Password"}
                  </button>
                  <button className="btn btn-danger" onClick={() => setShowPassword(false)}>Batal</button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}

export default ProfileSaya;