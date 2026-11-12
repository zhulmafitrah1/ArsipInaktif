import { useEffect, useRef } from "react";
import { Chart, ArcElement, Tooltip, Legend, DoughnutController } from "chart.js";

Chart.register(ArcElement, Tooltip, Legend, DoughnutController);

const JRA_RULES = {
  "Surat Undangan": 1,
  "Surat Rekomendasi Magang": 2,
  "Surat Keputusan": 5,
  "Surat Perjanjian": 10,
  "Laporan Keuangan": 10,
  "Dokumen Penting": 0,
};

const COLORS = [
  "#378ADD", "#1D9E75", "#D85A30", "#D4537E",
  "#888780", "#BA7517", "#639922", "#E24B4A", "#7F77DD",
];

function getRekom(arsip) {
  const umur = new Date().getFullYear() - arsip.tahun;
  const batas = JRA_RULES[arsip.jenis_naskah] ?? 3;
  if (batas === 0) return "Permanen";
  return umur >= batas ? "Musnah" : "Simpan";
}

function groupByDivisi(arr) {
  return arr.reduce((acc, a) => {
    const key = a.lokasi_simpan || a.bagian || "Tidak Diketahui";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function DonutCard({ title, subtitle, canvasId, grouped }) {
  const chartRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;
    if (instanceRef.current) instanceRef.current.destroy();

    const labels = Object.keys(grouped);
    const data = Object.values(grouped);
    const colors = labels.map((_, i) => COLORS[i % COLORS.length]);

    instanceRef.current = new Chart(chartRef.current, {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: colors,
            borderWidth: 2,
            borderColor: "transparent",
            hoverOffset: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "65%",
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                const pct = Math.round((ctx.parsed / total) * 100);
                return ` ${ctx.label}: ${ctx.parsed} dokumen (${pct}%)`;
              },
            },
            bodyFont: { size: 12 },
            padding: 10,
            cornerRadius: 8,
          },
        },
      },
    });

    return () => {
      if (instanceRef.current) instanceRef.current.destroy();
    };
  }, [grouped]);

  const labels = Object.keys(grouped);
  const data = Object.values(grouped);

  return (
    <div
      style={{
        background: "#fff",
        border: "0.5px solid #e2e8f0",
        borderRadius: 12,
        padding: "1rem",
        flex: "1 1 220px",
      }}
    >
      <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 500, color: "#1e293b" }}>
        {title}
      </p>
      <p style={{ margin: "0 0 12px", fontSize: 12, color: "#94a3b8" }}>
        {subtitle}
      </p>

      <div style={{ position: "relative", width: "100%", height: 200 }}>
        <canvas
          id={canvasId}
          ref={chartRef}
          role="img"
          aria-label={`Donut chart ${title}`}
        />
      </div>

      {/* Legend */}
      <div
        style={{
          marginTop: 12,
          display: "flex",
          flexDirection: "column",
          gap: 5,
          fontSize: 12,
          color: "#64748b",
        }}
      >
        {labels.map((l, i) => (
          <span key={l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: COLORS[i % COLORS.length],
                flexShrink: 0,
              }}
            />
            <span style={{ flex: 1 }}>{l}</span>
            <span style={{ fontWeight: 500, color: "#1e293b" }}>{data[i]}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function ArsipDonutCharts({ arsipData }) {
  const simpanArr = arsipData.filter((a) => {
    const r = getRekom(a);
    return r === "Simpan" || r === "Permanen" || a.status === "tolak";
  });

  const musnahArr = arsipData.filter(
    (a) => getRekom(a) === "Musnah" || a.status === "setuju"
  );

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 20, padding: "4px 0 8px" }}>
      <DonutCard
        title="Total dokumen"
        subtitle="Semua arsip per bagian"
        canvasId="donut-total"
        grouped={groupByDivisi(arsipData)}
      />
      <DonutCard
        title="Disimpan sementara"
        subtitle="Arsip Inaktif per bagian"
        canvasId="donut-simpan"
        grouped={groupByDivisi(simpanArr)}
      />
      <DonutCard
        title="Rekomendasi musnah"
        subtitle="Arsip kadaluarsa per bagian"
        canvasId="donut-musnah"
        grouped={groupByDivisi(musnahArr)}
      />
    </div>
  );
}