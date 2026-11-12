import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const styles = `
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    background: #f1f5f9;
  }

  .layout {
    display: flex;
    min-height: 100vh;
  }

  /* Sidebar sudah fixed 240px, jadi kita kasih space di kiri */
  .layout-main {
    margin-left: 240px;
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  /* Navbar sticky di atas konten (bukan di atas sidebar) */
  .layout-navbar {
    position: sticky;
    top: 0;
    z-index: 50;
  }

  /* Area konten halaman */
  .layout-content {
    flex: 1;
    padding: 28px;
  }
`;

function Layout({ children, onLogout }) {

  const handleLogout = () => {
    const confirmLogout = window.confirm("Apakah Anda yakin ingin keluar?");
    if (confirmLogout) onLogout();
  };

  return (
    <>
      <style>{styles}</style>
      <div className="layout">

        {/* SIDEBAR — fixed di kiri */}
        <Sidebar />

        {/* MAIN AREA — semua konten di kanan sidebar */}
        <div className="layout-main">

          {/* NAVBAR — sticky di atas konten */}
          <div className="layout-navbar">
            <Navbar onLogout={handleLogout} />
          </div>

          {/* KONTEN HALAMAN */}
          <div className="layout-content">
            {children}
          </div>

        </div>

      </div>
    </>
  );
}

export default Layout;