const styles = `
*{box-sizing:border-box;}
.wrap{font-family:sans-serif;padding:4px 0;}
.summary-strip{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px;}
.sum-card{background:#f8fafc;border-radius:10px;padding:12px 14px;display:flex;flex-direction:column;gap:3px;}
.sum-label{font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px;}
.sum-val{font-size:22px;font-weight:500;}
.card-list{display:flex;flex-direction:column;gap:8px;}
.k-card{background:#fff;border:0.5px solid #e2e8f0;border-radius:14px;padding:14px 16px;display:grid;grid-template-columns:auto 1fr auto;gap:14px;align-items:center;transition:border-color .15s;}
.k-card:hover{border-color:#cbd5e1;}
.k-card-kritis{border-left:3px solid #E24B4A;border-radius:0 14px 14px 0;}
.k-card-siaga{border-left:3px solid #EF9F27;border-radius:0 14px 14px 0;}
.k-card-aman{border-left:3px solid #639922;border-radius:0 14px 14px 0;}
.rank-circle{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:500;flex-shrink:0;}
.rc-kritis{background:#FCEBEB;color:#791F1F;}
.rc-siaga{background:#FAEEDA;color:#633806;}
.rc-aman{background:#EAF3DE;color:#27500A;}
.card-body{min-width:0;}
.card-title{font-size:13px;font-weight:500;color:#1e293b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:4px;}
.card-meta{display:flex;gap:6px;flex-wrap:wrap;}
.meta-chip{display:inline-flex;align-items:center;gap:4px;font-size:11px;color:#64748b;background:#f1f5f9;padding:2px 8px;border-radius:99px;}
.meta-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0;}
.card-right{display:flex;flex-direction:column;align-items:flex-end;gap:8px;flex-shrink:0;}
.badge{padding:3px 11px;border-radius:99px;font-size:11px;font-weight:500;white-space:nowrap;}
.b-kritis{background:#FCEBEB;color:#791F1F;}
.b-siaga{background:#FAEEDA;color:#633806;}
.b-aman{background:#EAF3DE;color:#27500A;}
.urgency-bar{width:90px;height:5px;border-radius:99px;background:#f1f5f9;overflow:hidden;}
.urgency-fill{height:100%;border-radius:99px;}
.sisa-text{font-size:12px;color:#94a3b8;text-align:right;}
.legend-row{display:flex;gap:18px;flex-wrap:wrap;margin-bottom:16px;}
.leg-item{display:flex;align-items:center;gap:6px;font-size:12px;color:#64748b;}
.leg-line{width:16px;height:3px;border-radius:2px;}
`;

const JRA_RULES = {
  "Surat Undangan": 1,
  "Surat Rekomendasi Magang": 2,
  "Surat Keputusan": 5,
  "Surat Perjanjian": 10,
  "Laporan Keuangan": 10,
  "Dokumen Penting": 0,
};

const BAR_COLOR = { kritis: "#E24B4A", siaga: "#EF9F27", aman: "#639922" };

export default function ArsipKritisChart({ arsipData = [] }) {
  const now = new Date().getFullYear();

  const getSisa = (a) => {
    const b = JRA_RULES[a.jenis_naskah] ?? 3;
    if (b === 0) return Infinity;
    return b - (now - parseInt(a.tahun));
  };

  const getStatus = (sisa) => {
    if (sisa <= 0) return "kritis";
    if (sisa <= 2) return "siaga";
    return "aman";
  };

  const filtered = [...arsipData]
  .filter((a) => (JRA_RULES[a.jenis_naskah] ?? 3) !== 0 && a.status !== "setuju") // tambah ini
  .sort((a, b) => getSisa(a) - getSisa(b))
  .slice(0, 5);

  const countKritis = filtered.filter((a) => getStatus(getSisa(a)) === "kritis").length;
  const countSiaga  = filtered.filter((a) => getStatus(getSisa(a)) === "siaga").length;
  const countAman   = filtered.filter((a) => getStatus(getSisa(a)) === "aman").length;
  const maxAbs = Math.max(...filtered.map((a) => Math.abs(getSisa(a))), 1);

  if (filtered.length === 0) {
    return <div style={{ textAlign: "center", padding: "2rem", fontSize: 13, color: "#94a3b8" }}>Tidak ada data arsip tersedia</div>;
  }

  return (
    <>
      <style>{styles}</style>
      <div className="wrap">

        {/* Summary strip */}
        <div className="summary-strip">
          <div className="sum-card">
            <span className="sum-label">Kritis</span>
            <span className="sum-val" style={{ color: "#A32D2D" }}>{countKritis}</span>
            <span style={{ fontSize: 11, color: "#94a3b8" }}>Segera tindak lanjut</span>
          </div>
          <div className="sum-card">
            <span className="sum-label">Siaga</span>
            <span className="sum-val" style={{ color: "#854F0B" }}>{countSiaga}</span>
            <span style={{ fontSize: 11, color: "#94a3b8" }}>Mendekati batas retensi</span>
          </div>
          <div className="sum-card">
            <span className="sum-label">Aman</span>
            <span className="sum-val" style={{ color: "#3B6D11" }}>{countAman}</span>
            <span style={{ fontSize: 11, color: "#94a3b8" }}>Masih dalam retensi</span>
          </div>
        </div>

        {/* Legend */}
        <div className="legend-row">
          <div className="leg-item"><div className="leg-line" style={{ background: "#E24B4A" }} />Kritis — retensi habis</div>
          <div className="leg-item"><div className="leg-line" style={{ background: "#EF9F27" }} />Siaga — sisa ≤ 2 tahun</div>
          <div className="leg-item"><div className="leg-line" style={{ background: "#639922" }} />Aman — sisa &gt; 2 tahun</div>
        </div>

        {/* Card list */}
        <div className="card-list">
          {filtered.map((a, i) => {
            const sisa   = getSisa(a);
            const status = getStatus(sisa);
            const pct    = Math.min(Math.round((Math.abs(sisa) / maxAbs) * 100), 100);
            const sisaTxt = sisa <= 0
              ? `Lewat ${Math.abs(Math.round(sisa))} tahun`
              : `Sisa ${Math.round(sisa)} tahun`;
            const judul  = (a.judul_berkas || a.jenis_naskah || "Tanpa judul").slice(0, 50);
            const batas  = JRA_RULES[a.jenis_naskah] ?? 3;

            return (
              <div key={i} className={`k-card k-card-${status}`}>
                <div className={`rank-circle rc-${status}`}>{i + 1}</div>
                <div className="card-body">
                  <div className="card-title" title={a.judul_berkas}>{judul}</div>
                  <div className="card-meta">
                    <span className="meta-chip">
                      <span className="meta-dot" style={{ background: BAR_COLOR[status] }} />
                      {a.jenis_naskah}
                    </span>
                    <span className="meta-chip">Tahun {a.tahun}</span>
                    <span className="meta-chip">{a.lokasi_simpan || "-"}</span>
                    <span className="meta-chip">Retensi {batas} thn</span>
                  </div>
                </div>
                <div className="card-right">
                  <span className={`badge b-${status}`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                  <div className="urgency-bar">
                    <div className="urgency-fill" style={{ width: `${pct}%`, background: BAR_COLOR[status] }} />
                  </div>
                  <span className="sisa-text">{sisaTxt}</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </>
  );
}