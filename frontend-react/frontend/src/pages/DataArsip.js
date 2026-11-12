import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import generatePDF from "../components/LaporanPDF";
import { apiClient } from "../lib/apiClient";
import "../css/DataArsip.css";

const divisiList = [
  { name: "SDM, Umum, KBL", icon: "👥" },
  { name: "Hukum, Klaim, Asuransi", icon: "⚖️" },
  { name: "Keuangan", icon: "💰" },
  { name: "Kearsipan", icon: "🗂️" },
  { name: "Komersial", icon: "🏪" },
  { name: "Sub HSSE", icon: "🛡️" },
  { name: "Teknik", icon: "⚙️" },
  { name: "Rendal", icon: "📊" },
  { name: "Properti", icon: "🏢" },
  { name: "Perencanaan, Pengendalian & Operasi Umum", icon: "📋" },
  { name: "MR, PI & PM", icon: "📌" },
];

function DataArsip({ arsipData, setArsipData }) {
  const navigate = useNavigate();
  const location = useLocation();

const query = new URLSearchParams(location.search);
const filterUrl  = query.get("filter");   // disimpan | rekomendasi_musnah | dimusnahkan
const filterDivisi = query.get("divisi"); // SEMUA | nama divisi

const [selectedDivisi, setSelectedDivisi] = useState(filterDivisi || null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (filterDivisi) setSelectedDivisi(filterDivisi);
    else setSelectedDivisi(null);
  }, [filterDivisi]);

  useEffect(() => {
    apiClient
      .get("/arsip")
      .then((data) => setArsipData(data.data || data))
      .catch((err) => console.error("Error fetch:", err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const dataFiltered = arsipData
  .filter((arsip) => {
    // Filter divisi
    if (!selectedDivisi) return false;
    if (selectedDivisi !== "SEMUA" && arsip.lokasi_simpan !== selectedDivisi) return false;

    // Filter berdasarkan tombol dashboard
   if (filterUrl === "disimpan") {
  return (
    (
      arsip.rekomendasi === "Disimpan" ||
      arsip.rekomendasi === "Disimpan Permanen"
    ) &&
    arsip.status !== "setuju"
  );
}
    if (filterUrl === "rekomendasi_musnah") {
      return arsip.rekomendasi === "Dimusnahkan (Fisik)" && arsip.status !== "setuju";
    }
    if (filterUrl === "dimusnahkan") {
      return arsip.status === "setuju";
    }

    return true; // tidak ada filter → tampilkan semua
  })
  .filter((arsip) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      arsip.judul_berkas?.toLowerCase().includes(q) ||
      arsip.kode_unit?.toLowerCase().includes(q) ||
      arsip.perihal?.toLowerCase().includes(q)
    );
  });

  
  const handleMusnah = (id) => {
  if (window.confirm("Yakin ingin memusnahkan arsip fisik ini? Data digital tetap tersimpan.")) {
    apiClient
      .put(`/arsip/${id}`, { status: "setuju" })
      .then(() => {
        // Re-fetch ulang dari server agar data pasti fresh
        return apiClient.get("/arsip");
      })
      .then((data) => {
        setArsipData(data.data || data);
        // Redirect ke halaman laporan pemusnahan
        navigate("/laporan-pemusnahan");
      })
      .catch((err) => {
        console.error("❌ Error:", err.response || err);
        alert("Gagal memusnahkan arsip. Cek koneksi atau hubungi admin.");
      });
  }
};

  const handleBack = () => {
    setSelectedDivisi(null);
    navigate("/data-arsip");
  };

  return (
    <div className="da-page">

      {/* ── HEADER ── */}
      <div className="da-header">
        <div className="da-header-left">
          {selectedDivisi && (
            <button className="da-back-btn" onClick={handleBack}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}
          <div>
            <h2 className="da-title">
            {selectedDivisi
              ? selectedDivisi === "SEMUA"
                ? filterUrl === "disimpan"
                  ? "Arsip Disimpan Sementara"
                  : filterUrl === "rekomendasi_musnah"
                  ? "Arsip Rekomendasi Musnah"
                  : filterUrl === "dimusnahkan"
                  ? "Arsip Telah Dimusnahkan"
                  : "Semua Arsip"
                : selectedDivisi
              : "Data Arsip"}
          </h2>
            <p className="da-subtitle">
              {selectedDivisi
                ? `${dataFiltered.length} arsip ditemukan`
                : "Pilih divisi untuk melihat arsip"}
            </p>
          </div>
        </div>

        {selectedDivisi && (
          <div className="da-header-actions">
            <div className="da-search-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                className="da-search"
                placeholder="Cari arsip..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="da-btn-add" onClick={() => navigate("/input-arsip")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Tambah Arsip
            </button>
          </div>
        )}
      </div>

      {/* ── DIVISI GRID ── */}
      {!selectedDivisi && (
        <div className="divisi-section">
          <button
            className="divisi-card divisi-card-all"
            onClick={() => setSelectedDivisi("SEMUA")}
          >
            <div className="divisi-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <span className="divisi-card-name">Semua Arsip</span>
            <span className="divisi-card-count">{arsipData.length} dokumen</span>
          </button>

          {divisiList.map((divisi, index) => {
            const count = arsipData.filter((a) => a.lokasi_simpan === divisi.name).length;
            return (
              <button
                key={index}
                className="divisi-card"
                onClick={() => setSelectedDivisi(divisi.name)}
              >
                <div className="divisi-card-emoji">{divisi.icon}</div>
                <span className="divisi-card-name">{divisi.name}</span>
                <span className="divisi-card-count">{count} dokumen</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── TABLE VIEW ── */}
      {selectedDivisi && (
        <div className="da-table-section">
          {dataFiltered.length === 0 ? (
            <div className="da-empty">
              <div className="da-empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <p className="da-empty-title">Tidak ada arsip</p>
              <p className="da-empty-desc">
                {searchQuery
                  ? `Tidak ada hasil untuk "${searchQuery}"`
                  : "Belum ada arsip di divisi ini."}
              </p>
            </div>
          ) : (
            <div className="da-table-wrap">
              <table className="da-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Kode Unit</th>
                    <th>Judul Berkas</th>
                    <th>Jenis Naskah</th>
                    <th>Tahun</th>
                    <th>Perihal</th>
                    <th>Divisi</th>
                    <th>Rekomendasi</th>
                    <th>Status Fisik</th>
                    <th>File</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {dataFiltered.map((arsip, index) => {
                    const rekom = arsip.rekomendasi || "-";
                    const isDanger   = rekom === "Dimusnahkan (Fisik)";
                    const isPermanent = rekom === "Disimpan Permanen";
                    const sudahMusnah = arsip.status === "setuju";
                    return (
                      <tr key={arsip.id}>
                        <td className="td-num">{index + 1}</td>
                        <td>
                          <span className="kode-badge">{arsip.kode_unit}</span>
                        </td>
                        <td className="td-judul">{arsip.judul_berkas}</td>
                        <td>{arsip.jenis_naskah || "-"}</td>
                        <td className="td-center">{arsip.tahun}</td>
                        <td className="td-perihal">{arsip.perihal}</td>
                        <td>
                          <span className="divisi-pill">{arsip.lokasi_simpan}</span>
                        </td>
                        <td>
                          <span className={`rek-pill ${isDanger ? "rek-danger" : isPermanent ? "rek-permanent" : "rek-safe"}`}>
                            {isDanger ? "Musnah" : isPermanent ? "Permanen" : "Disimpan"}
                          </span>
                        </td>

                        {/* ✅ Kolom Status Fisik */}
                        <td className="td-center">
                          {sudahMusnah ? (
                            <span className="fisik-pill fisik-musnah">🔥 Dimusnahkan</span>
                          ) : (
                            <span className="fisik-pill fisik-ada">📦 Ada</span>
                          )}
                        </td>

                        <td className="td-center">
                          {arsip.file ? (
                            <button className="btn-pdf" onClick={() => openPDF(arsip.file)}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                              </svg>
                              PDF
                            </button>
                          ) : (
                            <span className="td-none">—</span>
                          )}
                        </td>

                        <td>
                          <div className="action-group">
                            <button
                              className="btn-edit"
                              onClick={() => navigate(`/input-arsip?id=${arsip.id}`)}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>

                            {/* ✅ Tombol musnah hanya muncul jika belum dimusnahkan */}
                            {!sudahMusnah ? (
                              <button
                                className="btn-delete"
                                title="Musnahkan arsip fisik"
                                onClick={() => handleMusnah(arsip.id)}
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                                  <path d="M10 11v6M14 11v6" />
                                </svg>
                              </button>
                            ) : (
                              <button className="btn-delete" disabled style={{ opacity: 0.3, cursor: "not-allowed" }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                                  <path d="M10 11v6M14 11v6" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ── FOOTER ── */}
          <div className="da-table-footer">
            <span className="da-table-info">
              Menampilkan <strong>{dataFiltered.length}</strong> arsip
            </span>
            <button className="da-btn-download" onClick={() => generatePDF(dataFiltered)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download Laporan PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataArsip;