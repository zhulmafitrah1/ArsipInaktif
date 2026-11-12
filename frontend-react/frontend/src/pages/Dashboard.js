import "../css/Dashboard.css";
import ArsipChart from "../components/ArsipChart";
import ArsipDonutChart from "../components/ArsipDonutChart";
import { useNavigate } from "react-router-dom";
import ArsipKritisChart from "../components/ArsipKritisChart";


function Dashboard({ arsipData }) {
  const navigate = useNavigate();

  const dataDenganStatus = arsipData.map((arsip) => ({
    ...arsip,
    status: arsip.status || "pending",
  }));

  const totalArsip = dataDenganStatus.length;

//Disimpan sementara: rekomendasi masih disimpan DAN belum dimusnahkan
const arsipDisimpan = dataDenganStatus.filter((a) =>
  (
    a.rekomendasi === "Disimpan" ||
    a.rekomendasi === "Disimpan Permanen"
  ) &&
  a.status !== "setuju"
).length;

const rekomendasiMusnah = dataDenganStatus.filter((a) =>
  a.rekomendasi === "Dimusnahkan (Fisik)" &&
  a.status !== "setuju"
).length;

const arsipMusnah = dataDenganStatus.filter((a) =>
  a.status === "setuju"
);
  return (
    <div className="dashboard-page">

      {/* HEADER */}
      <div className="dashboard-header">
        <div>
          <h2 className="dashboard-title">Dashboard</h2>
          <p className="dashboard-subtitle">
            Selamat datang — ringkasan kondisi arsip hari ini
          </p>
        </div>
        <div className="dashboard-date">
          {new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="dashboard-stats">

        {/* Total Dokumen */}
        <div
          className="stat-card stat-total"
          onClick={() => navigate("/data-arsip?divisi=SEMUA")}
        >
          <div className="stat-content">
            <span className="stat-label">Total Dokumen</span>
            <span className="stat-number">{totalArsip}</span>
            <span className="stat-desc">Seluruh arsip tercatat</span>
          </div>
        </div>

        {/* Disimpan Sementara*/}
        <div
          className="stat-card stat-simpan"
          onClick={() => navigate("/data-arsip?divisi=SEMUA&filter=disimpan")}
        >
          <div className="stat-content">
            <span className="stat-label">Disimpan Sementara</span>
            <span className="stat-number">{arsipDisimpan}</span>
            <span className="stat-desc">Arsip Inaktif tersimpan</span>
          </div>
        </div>

        {/* Rekomendasi Musnah */}
        <div
          className="stat-card stat-musnah"
          onClick={() => navigate("/data-arsip?divisi=SEMUA&filter=rekomendasi_musnah")}
        >
          <div className="stat-content">
            <span className="stat-label">Rekomendasi Musnah</span>
            <span className="stat-number">{rekomendasiMusnah}</span>
            <span className="stat-desc">Perlu tindak lanjut</span>
          </div>
        </div>

        {/* Telah Dimusnahkan */}
        <div
          className="stat-card stat-dimusnahkan"
          onClick={() => navigate("/data-arsip?divisi=SEMUA&filter=dimusnahkan")}
        >
          <div className="stat-content">
            <span className="stat-label">Telah Dimusnahkan</span>
            <span className="stat-number">{arsipMusnah.length}</span>
            <span className="stat-desc">Arsip fisik sudah dimusnahkan</span>
          </div>
        </div>

      </div>

      {/* CHART STATISTIK */}
      <div className="section-card chart-section">
        <div className="section-card-header">
          <div>
            <h3 className="section-card-title">Statistik Arsip</h3>
            <p className="section-card-subtitle">
              Distribusi arsip berdasarkan tahun
            </p>
          </div>
        </div>
        <div className="chart-box">
          <ArsipChart arsipData={dataDenganStatus} />
        </div>
      </div>

      {/* DONUT CHARTS */}
      <div className="section-card chart-section" style={{ marginTop: 20 }}>
        <div className="section-card-header">
          <div>
            <h3 className="section-card-title">Distribusi Arsip per Bagian</h3>
            <p className="section-card-subtitle">
              Breakdown arsip berdasarkan status dan bagian
            </p>
          </div>
        </div>
        <ArsipDonutChart arsipData={dataDenganStatus} />
      </div>

      {/* KRITIS CHART */}
      <div className="section-card chart-section" style={{ marginTop: 20 }}>
        <div className="section-card-header">
          <div>
            <h3 className="section-card-title">Arsip Kritis</h3>
            <p className="section-card-subtitle">
              Distribusi arsip kritis berdasarkan tahun
            </p>
          </div>
        </div>
        <ArsipKritisChart arsipData={dataDenganStatus} />
      </div>

    </div>
  );
}

export default Dashboard;