import { useNavigate, useLocation } from "react-router-dom";
import { FaSignOutAlt, FaBell } from "react-icons/fa";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500&display=swap');

  .navbar {
    height: 60px;
    background: #ffffff;
    border-bottom: 1px solid #e8edf3;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 28px;
    font-family: 'DM Sans', sans-serif;
    box-shadow: 0 1px 6px rgba(0,0,0,0.04);
    position: sticky;
    top: 0;
    z-index: 50;
  }

  /* ── KIRI: Judul Halaman ── */
  .navbar-left {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .navbar-page-title {
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
    line-height: 1.2;
  }

  .navbar-date {
    font-size: 11.5px;
    color: #94a3b8;
    margin: 0;
  }

  /* ── KANAN: Actions ── */
  .navbar-right {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  /* Bell icon */
  .navbar-bell {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    border: 1.5px solid #e8edf3;
    background: #f8fafc;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #94a3b8;
    font-size: 14px;
    transition: all 0.16s;
    position: relative;
  }

  .navbar-bell:hover {
    background: #eff6ff;
    border-color: #bfdbfe;
    color: #2563eb;
  }

  /* User chip */
  .navbar-user {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px 12px 5px 6px;
    border-radius: 10px;
    border: 1.5px solid #e8edf3;
    background: #f8fafc;
    cursor: default;
  }

  .navbar-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: linear-gradient(135deg, #2563eb, #3b82f6);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Syne', sans-serif;
    font-size: 11px;
    font-weight: 700;
    color: white;
    flex-shrink: 0;
  }

  .navbar-user-info {
    display: flex;
    flex-direction: column;
    line-height: 1.2;
  }

  .navbar-username {
    font-size: 12.5px;
    font-weight: 600;
    color: #1e293b;
  }

  .navbar-role {
    font-size: 10.5px;
    color: #94a3b8;
  }

  /* Logout button */
  .btn-logout {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 8px 16px;
    border-radius: 10px;
    background: #fff1f2;
    border: 1.5px solid #fecdd3;
    color: #e11d48;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.16s ease;
  }

  .btn-logout:hover {
    background: #ffe4e6;
    border-color: #fda4af;
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(225,29,72,0.15);
  }

  .logout-icon {
    font-size: 13px;
  }
`;

const PAGE_TITLES = {
  "/": "Dashboard",
  "/input-arsip": "Input Arsip",
  "/data-arsip": "Data Arsip",
  "/laporan-pemusnahan": "Laporan Pemusnahan",
  "/profile-saya": "Profil Saya",
  "/manajemen-user": "Manajemen User",
};

function Navbar({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const role = localStorage.getItem("role");
  const initial = currentUser.nama_lengkap
    ? currentUser.nama_lengkap.charAt(0).toUpperCase()
    : "A";

  const pageTitle = PAGE_TITLES[location.pathname] || "ArsipIn";

  const now = new Date();
  const dateStr = now.toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("currentUser");
    if (onLogout) onLogout();
    navigate("/login");
  };

  return (
    <>
      <style>{styles}</style>
      <div className="navbar">

        {/* KIRI — Judul halaman + tanggal */}
        <div className="navbar-left">
          <p className="navbar-page-title">{pageTitle}</p>
          <p className="navbar-date">{dateStr}</p>
        </div>

        {/* KANAN — Bell + User chip + Logout */}
        <div className="navbar-right">

          <div className="navbar-bell" title="Notifikasi">
            <FaBell />
          </div>

          <div className="navbar-user">
            <div className="navbar-avatar">{initial}</div>
            <div className="navbar-user-info">
              <span className="navbar-username">
                {currentUser.nama_lengkap || currentUser.username || "Pengguna"}
              </span>
              <span className="navbar-role">
                {role === "admin" ? "Administrator" : "Staff Arsip"}
              </span>
            </div>
          </div>

          <button className="btn-logout" onClick={handleLogout}>
            <FaSignOutAlt className="logout-icon" />
            Logout
          </button>

        </div>
      </div>
    </>
  );
}

export default Navbar;