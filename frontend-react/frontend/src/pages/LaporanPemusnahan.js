// LaporanPemusnahan.jsx
// eslint-disable-next-line no-unused-vars
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import generatePDF from "../components/LaporanPDF";
import "../css/LaporanPemusnahan.css";
import { useNavigate } from "react-router-dom";

const COLORS = ["#378ADD", "#7F77DD", "#1D9E75", "#EF9F27", "#E24B4A", "#D4537E", "#5DCAA5", "#BA7517"];

function LaporanPemusnahan({ arsipData }) {
  const navigate = useNavigate();
  const tahunSekarang = new Date().getFullYear();

  const dataDenganStatus = arsipData.map((arsip) => ({
    ...arsip,
    status: arsip.status || "pending",
  }));

  const dataPemusnahan = dataDenganStatus.filter((arsip) => arsip.status === "setuju");

  const jenisCount = dataPemusnahan.reduce((acc, a) => {
    acc[a.jenis_naskah] = (acc[a.jenis_naskah] || 0) + 1;
    return acc;
  }, {});

  const tahunCount = dataPemusnahan.reduce((acc, a) => {
    const thn = String(a.tahun);
    acc[thn] = (acc[thn] || 0) + 1;
    return acc;
  }, {});
  const dataChartTahun = Object.entries(tahunCount)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([name, value]) => ({ name, value }));

  const bagianCount = dataPemusnahan.reduce((acc, a) => {
    const div = a.lokasi_simpan || "Tidak Diketahui";
    acc[div] = (acc[div] || 0) + 1;
    return acc;
  }, {});
  const dataChartBagian = Object.entries(bagianCount).map(([name, value]) => ({ name, value }));

  const tahunList = dataPemusnahan.map((a) => a.tahun).filter(Boolean);
  const tahunMin = tahunList.length ? Math.min(...tahunList) : "—";
  const tahunMax = tahunList.length ? Math.max(...tahunList) : "—";
  const divisiCount2 = Object.keys(bagianCount).length;

  const base64ToBlob = (base64) => {
    try {
      const byteCharacters = atob(base64.split(",")[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++)
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      return new Blob([new Uint8Array(byteNumbers)], { type: "application/pdf" });
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const openPDF = (base64) => {
    if (!base64) return alert("File tidak tersedia");
    const blob = base64ToBlob(base64);
    if (!blob) return alert("Gagal membuka PDF");
    window.open(URL.createObjectURL(blob), "_blank");
  };

  return (
    <div className="lp-page">

      {/* ── HEADER ── */}
      <div className="lp-header">
        <div className="lp-header-left">
          <div className="lp-header-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </div>
          <div>
            <h2 className="lp-title">Laporan Pemusnahan Arsip Fisik</h2>
            <p className="lp-subtitle">
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long", year: "numeric", month: "long", day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      {dataPemusnahan.length > 0 && (
        <div className="lp-stats">

          {/* Total Dimusnahkan — bisa diklik */}
          <div
            className="lp-stat-card"
            onClick={() => navigate("/data-arsip?divisi=SEMUA&filter=dimusnahkan")}
            style={{ cursor: "pointer" }}
          >
            <div className="lp-stat-icon lp-icon-red">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              </svg>
            </div>
            <div>
              <p className="lp-stat-label">Total Dimusnahkan</p>
              <p className="lp-stat-num">{dataPemusnahan.length}</p>
              <p className="lp-stat-desc">Arsip disetujui</p>
            </div>
          </div>

          {/* Jenis Naskah — bisa diklik */}
          <div
            className="lp-stat-card"
            onClick={() => navigate("/data-arsip?divisi=SEMUA")}
            style={{ cursor: "pointer" }}
          >
            <div className="lp-stat-icon lp-icon-blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div>
              <p className="lp-stat-label">Jenis Naskah</p>
              <p className="lp-stat-num">{Object.keys(jenisCount).length}</p>
              <p className="lp-stat-desc">Kategori berbeda</p>
            </div>
          </div>

          {/* Rentang Tahun — tidak diklik */}
          <div className="lp-stat-card" style={{ cursor: "default" }}>
            <div className="lp-stat-icon lp-icon-amber">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <p className="lp-stat-label">Rentang Tahun</p>
              <p className="lp-stat-num lp-stat-num-sm">{tahunMin}–{tahunMax}</p>
              <p className="lp-stat-desc">{dataChartTahun.length} tahun tercatat</p>
            </div>
          </div>

          {/* Bagian Terlibat — tidak diklik */}
          <div className="lp-stat-card" style={{ cursor: "default" }}>
            <div className="lp-stat-icon lp-icon-teal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
            </div>
            <div>
              <p className="lp-stat-label">Bagian Terlibat</p>
              <p className="lp-stat-num">{divisiCount2}</p>
              <p className="lp-stat-desc">Unit kerja</p>
            </div>
          </div>

        </div>
      )}

      {/* ── CHARTS ── */}
      {dataPemusnahan.length > 0 && (
        <div className="lp-charts">

          {/* Donut — per Tahun */}
          <div className="lp-chart-card">
            <div className="lp-chart-header">
              <div>
                <p className="lp-chart-title">Arsip Inaktif per Tahun</p>
                <p className="lp-chart-sub">{dataChartTahun.length} tahun tercatat</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={dataChartTahun}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {dataChartTahun.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: "10px", fontSize: "0.78rem", border: "1px solid #e4e8f0" }}
                  formatter={(value, name, props) => {
                    return [`${value} arsip`, `Tahun ${props.payload.name}`];
                  }}
                />
                <Legend iconType="square" iconSize={9} wrapperStyle={{ fontSize: "0.75rem" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Pie — per Bagian */}
          <div className="lp-chart-card">
            <p className="lp-chart-title">Komposisi per Bagian</p>
            <p className="lp-chart-sub">Proporsi arsip dari setiap unit kerja</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={dataChartBagian}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {dataChartBagian.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: "8px", fontSize: "0.78rem", border: "0.5px solid #e4e8f0" }}
                  formatter={(value, name, props) => {
                    return [`${value} arsip`, props.payload.name];
                  }}
                />
                <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: "0.75rem" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

        </div>
      )}

      {/* ── TABLE ── */}
      <div className="lp-card">
        {dataPemusnahan.length === 0 ? (
          <div className="lp-empty">
            <div className="lp-empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <p className="lp-empty-title">Tidak ada arsip untuk dimusnahkan</p>
            <p className="lp-empty-desc">
              Belum ada arsip yang disetujui untuk pemusnahan. Setujui arsip dari halaman Dashboard terlebih dahulu.
            </p>
          </div>
        ) : (
          <>
            <div className="lp-card-header">
              <h3 className="lp-card-title">Daftar Arsip yang Dimusnahkan</h3>
              <span className="lp-badge-count">{dataPemusnahan.length} Arsip</span>
            </div>

            <div className="lp-table-wrap">
              <table className="lp-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Kode Unit</th>
                    <th>Judul Berkas</th>
                    <th>Jenis Naskah</th>
                    <th>Tahun</th>
                    <th>Umur</th>
                    <th>File Digital</th>
                    <th>Status</th>
                    <th>Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {dataPemusnahan.map((arsip, index) => {
                    const umur = tahunSekarang - arsip.tahun;
                    return (
                      <tr key={arsip.id}>
                        <td className="lp-td-num">{String(index + 1).padStart(2, "0")}</td>
                        <td><span className="lp-badge-kode">{arsip.kode_unit}</span></td>
                        <td className="lp-td-judul">{arsip.judul_berkas}</td>
                        <td><span className="lp-badge-jenis">{arsip.jenis_naskah}</span></td>
                        <td>{arsip.tahun}</td>
                        <td><span className="lp-badge-umur">{umur} thn</span></td>
                        <td>
                          {arsip.file ? (
                            <button className="lp-btn-pdf" onClick={() => openPDF(arsip.file)}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16" />
                                <polyline points="14 2 14 8 20 8" />
                              </svg>
                              PDF
                            </button>
                          ) : (
                            <span className="lp-no-file">Tidak ada</span>
                          )}
                        </td>
                        <td>
                          <span className="lp-badge-status">
                            <span className="lp-status-dot" />
                            Dimusnahkan
                          </span>
                        </td>
                        <td className="lp-td-ket">{arsip.keterangan || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="lp-card-footer">
              <span className="lp-footer-info">
                Total <strong>{dataPemusnahan.length}</strong> arsip dimusnahkan
              </span>
              <button className="lp-btn-download" onClick={() => generatePDF(dataPemusnahan)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download Laporan PDF
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default LaporanPemusnahan;