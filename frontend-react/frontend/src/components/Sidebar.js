import { NavLink, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaPlusCircle,
  FaFolder,
  FaTrash,
  FaUserCircle,
  FaUsers,
  FaSignOutAlt
} from "react-icons/fa";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  .sidebar {
    width: 240px;
    min-height: 100vh;
    background: #ffffff;
    border-right: 1px solid #e8edf3;
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0; left: 0;
    z-index: 100;
    font-family: 'DM Sans', sans-serif;
    box-shadow: 2px 0 12px rgba(0,0,0,0.04);
  }

  .sidebar-logo {
    padding: 26px 22px 20px;
    border-bottom: 1px solid #f0f4f8;
  }

  .sidebar-logo-inner {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .sidebar-logo-icon {
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, #2563eb, #3b82f6);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
    box-shadow: 0 4px 10px rgba(37,99,235,0.25);
  }

  .sidebar-logo-text {
    font-family: 'DM Sans', sans-serif; 
    font-size: 19px;
    font-weight: 800;
    color: #1e293b;
    letter-spacing: -0.5px;
    line-height: 1;
  }

  .sidebar-logo-version {
    font-size: 10.5px;
    color: #94a3b8;
    margin-top: 2px;
  }

  .sidebar-section-label {
    font-size: 10px;
    font-weight: 700;
    color: #b0bec5;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    padding: 20px 22px 8px;
  }

  .sidebar-menu {
    flex: 1;
    padding: 6px 10px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .menu-btn {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 10px 12px;
    border-radius: 10px;
    text-decoration: none;
    color: #64748b;
    font-size: 13.5px;
    font-weight: 500;
    transition: all 0.16s ease;
    position: relative;
  }

  .menu-btn:hover {
    background: #f1f5f9;
    color: #1e293b;
  }

  .menu-btn.active {
    background: #eff6ff;
    color: #2563eb;
    font-weight: 600;
  }

  .menu-btn.active::before {
    content: '';
    position: absolute;
    left: 0; top: 20%; bottom: 20%;
    width: 3px;
    background: #2563eb;
    border-radius: 0 3px 3px 0;
  }

  .menu-icon {
    font-size: 15px;
    flex-shrink: 0;
    opacity: 0.75;
  }

  .menu-btn.active .menu-icon {
    opacity: 1;
    color: #2563eb;
  }

  .sidebar-divider {
    height: 1px;
    background: #f0f4f8;
    margin: 6px 10px;
  }

  .admin-section-label {
    font-size: 10px;
    font-weight: 700;
    color: #b0bec5;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    padding: 10px 22px 6px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .admin-badge {
    background: #fff3cd;
    color: #d97706;
    font-size: 9px;
    padding: 2px 7px;
    border-radius: 20px;
    border: 1px solid #fde68a;
    font-weight: 700;
    letter-spacing: 0.5px;
  }

  .menu-btn.admin-btn { color: #d97706; }
  .menu-btn.admin-btn:hover { background: #fffbeb; color: #b45309; }
  .menu-btn.admin-btn.active { background: #fffbeb; color: #b45309; }
  .menu-btn.admin-btn.active::before { background: #f59e0b; }

  .sidebar-footer {
    padding: 14px 10px;
    border-top: 1px solid #f0f4f8;
  }

  .sidebar-user {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 10px;
    background: #f8fafc;
    cursor: pointer;
    transition: all 0.16s;
    border: 1px solid #f0f4f8;
  }

  .sidebar-user:hover {
    background: #fee2e2;
    border-color: #fecaca;
  }

  .sidebar-user-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, #2563eb, #3b82f6);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    font-weight: 700;
    color: white;
    flex-shrink: 0;
  }

  .sidebar-user-info { flex: 1; min-width: 0; }

  .sidebar-user-name {
    font-size: 13px;
    font-weight: 600;
    color: #1e293b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .sidebar-user-role {
    font-size: 11px;
    color: #94a3b8;
  }

  .sidebar-logout-icon {
    color: #cbd5e1;
    font-size: 14px;
    transition: color 0.16s;
    flex-shrink: 0;
  }

  .sidebar-user:hover .sidebar-logout-icon { color: #ef4444; }
`;

function Sidebar() {
  const navigate = useNavigate();

  // Ambil dari userProfile — seragam dengan Login.jsx
  // Kolom database pakai "name" bukan "username" atau "nama_lengkap"
  const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
  const role        = userProfile?.role || "";
  const namaLengkap = userProfile?.name || userProfile?.nama_lengkap || "Pengguna";
  const initial     = namaLengkap.charAt(0).toUpperCase();

  const handleLogout = () => {
    const konfirmasi = window.confirm("Apakah Anda yakin ingin keluar?");
    if (!konfirmasi) return;

    localStorage.removeItem("userProfile");
    localStorage.removeItem("token");
    localStorage.setItem("isLoggedIn", "false");
    navigate("/login");
  };

  return (
    <>
      <style>{styles}</style>
      <div className="sidebar">

        <div className="sidebar-logo">
          <div className="sidebar-logo-inner">
            <div className="sidebar-logo-icon">🗂️</div>
            <div>
              <div className="sidebar-logo-text">ArsipIn</div>
              <div className="sidebar-logo-version">Sistem Arsip Digital</div>
            </div>
          </div>
        </div>

        <div className="sidebar-section-label">Menu Utama</div>
        <nav className="sidebar-menu">

          <NavLink to="/" end className={({ isActive }) => `menu-btn ${isActive ? "active" : ""}`}>
            <FaTachometerAlt className="menu-icon" /> Dashboard
          </NavLink>

          <NavLink to="/input-arsip" className={({ isActive }) => `menu-btn ${isActive ? "active" : ""}`}>
            <FaPlusCircle className="menu-icon" /> Input Arsip
          </NavLink>

          <NavLink to="/data-arsip" className={({ isActive }) => `menu-btn ${isActive ? "active" : ""}`}>
            <FaFolder className="menu-icon" /> Data Arsip
          </NavLink>

          <NavLink to="/laporan-pemusnahan" className={({ isActive }) => `menu-btn ${isActive ? "active" : ""}`}>
            <FaTrash className="menu-icon" /> Laporan Pemusnahan
          </NavLink>

          <div className="sidebar-divider" />

          <NavLink to="/profile-saya" className={({ isActive }) => `menu-btn ${isActive ? "active" : ""}`}>
            <FaUserCircle className="menu-icon" /> Profile Saya
          </NavLink>

          {/* ✅ Hanya muncul jika role = admin */}
          {role === "admin" && (
            <>
              <div className="admin-section-label">
                Admin <span className="admin-badge">ADMIN</span>
              </div>
              <NavLink
                to="/manajemen-user"
                className={({ isActive }) => `menu-btn admin-btn ${isActive ? "active" : ""}`}
              >
                <FaUsers className="menu-icon" /> Manajemen User
              </NavLink>
            </>
          )}

        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user" onClick={handleLogout} title="Klik untuk Logout">
            <div className="sidebar-user-avatar">{initial}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{namaLengkap}</div>
              <div className="sidebar-user-role">
                {role === "admin" ? "Administrator" : "Staff Arsip"}
              </div>
            </div>
            <FaSignOutAlt className="sidebar-logout-icon" />
          </div>
        </div>

      </div>
    </>
  );
}

export default Sidebar;