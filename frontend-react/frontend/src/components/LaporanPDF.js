import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // ✅ import sebagai fungsi

function generatePDF(arsipData) {
  const doc = new jsPDF();

  // ── HEADER ──
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Laporan Pemusnahan Arsip Fisik", 14, 20);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Tanggal: ${new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`,
    14,
    28
  );

  doc.text(`Total Arsip: ${arsipData.length} dokumen`, 14, 34);

  // ── GARIS PEMISAH ──
  doc.setDrawColor(220, 38, 38);
  doc.setLineWidth(0.5);
  doc.line(14, 37, 196, 37);

  // ── TABLE ──
  const headers = [
    "No",
    "Kode Unit",
    "Judul Berkas",
    "Jenis Naskah",
    "Tahun",
    "Umur",
    "Keterangan",
  ];

  const tahunSekarang = new Date().getFullYear();

  const data = arsipData.map((a, index) => [
    index + 1,
    a.kode_unit   || "-",
    a.judul_berkas || "-",
    a.jenis_naskah || "-",
    a.tahun        || "-",
    a.tahun ? `${tahunSekarang - a.tahun} thn` : "-",
    a.keterangan   || "-",
  ]);

  if (data.length === 0) {
    doc.setFontSize(11);
    doc.text("Tidak ada data arsip untuk dimusnahkan.", 14, 48);
  } else {
    //  PERBAIKAN: panggil autoTable sebagai fungsi, bukan doc.autoTable()
    autoTable(doc, {
      head: [headers],
      body: data,
      startY: 42,
      theme: "grid",
      styles: {
        fontSize: 9,
        cellPadding: 3,
        valign: "middle",
      },
      headStyles: {
        fillColor: [220, 38, 38],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 9,
      },
      alternateRowStyles: {
        fillColor: [254, 242, 242],
      },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" }, // No
        1: { cellWidth: 22 },                   // Kode Unit
        2: { cellWidth: 55 },                   // Judul Berkas
        3: { cellWidth: 32 },                   // Jenis Naskah
        4: { cellWidth: 16, halign: "center" }, // Tahun
        5: { cellWidth: 16, halign: "center" }, // Umur
        6: { cellWidth: 30 },                   // Keterangan
      },
    });
  }

  // ── FOOTER ──
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Halaman ${i} dari ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
    doc.text(
      "Dokumen ini digenerate otomatis oleh Sistem Arsip Digital",
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 6,
      { align: "center" }
    );
  }

  doc.save("laporan_pemusnahan_arsip.pdf");
}

export default generatePDF;