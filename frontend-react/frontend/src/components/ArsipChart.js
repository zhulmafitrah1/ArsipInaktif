import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function ArsipChart({ arsipData }) {
  const navigate = useNavigate();

  // Hitung arsip per tahun
  const arsipPerTahun = arsipData.reduce((acc, arsip) => {
    const t = arsip.tahun;
    if (t) acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  const labels = Object.keys(arsipPerTahun).sort();
  const dataJumlah = labels.map((label) => arsipPerTahun[label]);

  const data = {
    labels,
    datasets: [
      {
        label: "Jumlah Arsip",
        data: dataJumlah,
        backgroundColor: [
        "#4DB6AC",
        "#4A90E2",
        "#F28B82",
        "#F6C26B",
        "#A78BFA",
        "#34D399",
        "#FB7185"
      ],
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top", labels: { boxWidth: 12 } },
      title: { display: true, text: "Statistik Arsip Berdasarkan Tahun", font: { size: 14 } },
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } },
    },
    onClick: (e, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const tahun = labels[index];
        navigate(`/data-arsip?tahun=${tahun}`);
      }
    },
  };

  return <Bar data={data} options={options} />;
}

export default ArsipChart;
