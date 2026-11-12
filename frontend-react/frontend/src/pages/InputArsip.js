import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiClient } from "../lib/apiClient";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// JRA_RULES: { label, aktif (tahun), inaktif (tahun), keterangan }
// null pada aktif/inaktif = "Selama Berlaku"
// keterangan: "Permanen" | "Musnah" | "Dinilai Kembali"
const JRA_RULES = {
  // ── I.A HUBUNGAN MASYARAKAT ──────────────────────────────────
  // 1. Penerangan dan Publikasi Bernilai Guna Primer
  "Wawancara":                                  { aktif: 1, inaktif: 2, keterangan: "Musnah" },
  "Pers Release":                               { aktif: 1, inaktif: 2, keterangan: "Musnah" },
  "Buletin":                                    { aktif: 1, inaktif: 2, keterangan: "Musnah" },
  "Majalah":                                    { aktif: 1, inaktif: 2, keterangan: "Musnah" },
  "Jurnal":                                     { aktif: 1, inaktif: 2, keterangan: "Musnah" },
  "Media Massa":                                { aktif: 1, inaktif: 2, keterangan: "Musnah" },
  "Bakohumas":                                  { aktif: 1, inaktif: 2, keterangan: "Musnah" },
  "Website":                                    { aktif: 1, inaktif: 2, keterangan: "Musnah" },
  // 2. Penerangan dan Publikasi Bernilai Guna Sekunder
  "Penerangan dan Publikasi Bernilai Guna Sekunder": { aktif: 1, inaktif: 2, keterangan: "Permanen" },
  // 3. Sponsorship atau Bentuk Partisipasi Lainnya
  "Sponsorship atau Bentuk Partisipasi Lainnya": { aktif: 1, inaktif: 3, keterangan: "Musnah" },
  // 4. Hubungan Antarlembaga (Eksternal)
  "Hubungan Antarlembaga Internasional":        { aktif: 1, inaktif: 4, keterangan: "Musnah" },
  "Hubungan Antarlembaga Negara":               { aktif: 1, inaktif: 4, keterangan: "Musnah" },
  // 5. Hubungan Antarlembaga (Internal)
  "Hubungan Antarlembaga Regional":             { aktif: 2, inaktif: 2, keterangan: "Musnah" },
  "Hubungan Antarlembaga Subholding & Anak Perusahaan": { aktif: 2, inaktif: 2, keterangan: "Musnah" },
  // 6. Rapat Dengar Pendapat DPR/DPD/DPRD
  "Rapat Dengar Pendapat DPR/DPD/DPRD":         { aktif: 2, inaktif: 3, keterangan: "Musnah" },
  // 7. Protokol
  "Kunjungan Dinas dari Luar Perusahaan":       { aktif: 1, inaktif: 4, keterangan: "Musnah" },
  "Kunjungan Dinas Komisaris dan Direksi":      { aktif: 1, inaktif: 3, keterangan: "Musnah" },
  "Kunjungan Dinas Pekerja ke Luar Perusahaan": { aktif: 1, inaktif: 1, keterangan: "Musnah" },
  "Tamu Perusahaan":                            { aktif: 1, inaktif: 1, keterangan: "Musnah" },
  "Agenda Pimpinan":                            { aktif: 1, inaktif: 1, keterangan: "Musnah" },
  "Acara Perusahaan":                           { aktif: 1, inaktif: 1, keterangan: "Musnah" },
  // 8. Souvenir/Cinderamata
  "Souvenir/Cinderamata":                        { aktif: 1, inaktif: 1, keterangan: "Musnah" },

  // ── I.B KESEKRETARIATAN ──────────────────────────────────────
  // 1. Good Corporate Governance (GCG)
  "GCG Awareness (Sosialisasi, Survei & Pakta Integritas)": { aktif: 2, inaktif: 3, keterangan: "Musnah" },
  "GCG Asesmen":                                { aktif: 2, inaktif: 3, keterangan: "Musnah" },
  // 2. Rapat Direksi
  "Rapat Direksi":                               { aktif: 2, inaktif: 3, keterangan: "Permanen" },
  // 3. Rapat Umum Pemegang Saham (RUPS) / AD / ART
  "Rapat Umum Pemegang Saham (RUPS)":           { aktif: 2, inaktif: 3, keterangan: "Permanen" },
  "Rapat Board of Director (BOD)":              { aktif: 2, inaktif: 3, keterangan: "Permanen" },
  "Rapat Board of Commissioner (BOC)":          { aktif: 2, inaktif: 3, keterangan: "Permanen" },
  "Rapat Koordinasi Komisaris dan Direksi":     { aktif: 2, inaktif: 3, keterangan: "Permanen" },
  // 4. Rapat Kerja Nasional (Rakernas)
  "Rapat Kerja Nasional (Rakernas)":             { aktif: 1, inaktif: 4, keterangan: "Musnah" },

  // ── I.C MANAJEMEN KEARSIPAN ──────────────────────────────────
  "Penciptaan Arsip":                            { aktif: 2, inaktif: 3, keterangan: "Musnah" },
  "Penggunaan dan Pemeliharaan Arsip":           { aktif: 2, inaktif: 3, keterangan: "Musnah" },
  "Penyusutan Arsip":                            { aktif: 2, inaktif: 3, keterangan: "Musnah" },
  "Instrumen Pengelolaan Arsip dan Pedoman Penyelenggaraan Kearsipan":  { aktif: 2, inaktif: 3, keterangan: "Musnah" },
  "Monitoring dan Pembinaan Kearsipan":                            { aktif: 2, inaktif: 3, keterangan: "Musnah" },

// ── I.D TANGGUNG JAWAB SOSIAL DAN LINGKUNGAN ──────────────────────────────────
"Bantuan dan/atau Kegiatan lainnya":                            { aktif: 2 , inaktif: 8, keterangan: "Musnah" },
"Bantuan/Program Pendanaan Usaha Mikro dan Kecil":                      { aktif: 2 , inaktif: 8, keterangan: "Musnah" },
"Bantuan/Program Pendanaan UMK Berskala Nasional":              { aktif: 2 , inaktif: 8, keterangan: "Musnah" },
"Permohonan Bantuan/Program yang Tidak Disetujui":             { aktif: 1 , inaktif: 2, keterangan: "Musnah" },
"Laporan Program Tanggung Jawab Sosial dan Lingkunqan":       { aktif: 2 , inaktif: 8, keterangan: "Musnah" },

// ── I.E HUKUM ──────────────────────────────────
"Peraturan Perusahaan":                                         { aktif: 2 , inaktif: 3, keterangan: "Permanen" },
"Penyelesaian Permasalahan Hukum":                              { aktif: 2 , inaktif: 3, keterangan: "Musnah" },
"Notarialisasi Akta":                                           { aktif: 2 , inaktif: 3, keterangan: "Permanen" },
"Kepatuhan":                                                    { aktif: 2 , inaktif: 3, keterangan: "Musnah" },
"Hak Atas Kekayaan Intelektual":                                { aktif: 2 , inaktif: 3, keterangan: "Permanen" },

// ── I.F KEPEGAWAIAN ──────────────────────────────────
"Formasi Pekerja":                                              { aktif: 2 , inaktif: 2, keterangan: "Musnah" },
"Pengadaan Pekerja":                                            { aktif: 2 , inaktif: 2, keterangan: "Musnah" },
"Pengangkatan Pekerja Organik":                                 { aktif: 2 , inaktif: 2, keterangan: "Musnah" },
"Pengangkatan Pekerja ":                                        { aktif: 2 , inaktif: 2, keterangan: "Musnah" },
"Perjanjian Kerja Waktu Tetap (PKWT)":                       { aktif: 2 , inaktif: 2, keterangan: "Musnah" },
"Pekerja Alih Daya":                                            { aktif: 2 , inaktif: 2, keterangan: "Musnah" },
"Pembinaan dan Pengembangan Karir Pegawai":                     { aktif: 1 , inaktif: 2, keterangan: "Musnah" },
"Key Perlorma lndikator (KPl)":                                 { aktif: 2 , inaktif: 3, keterangan: "Musnah" },
" Disiplin Pekerja":                                             { aktif: 2 , inaktif: 3, keterangan: "Musnah" },
"Penghargaan Pekerja/Pemberian Tanda Jasa":                     { aktif: 2 , inaktif: 2, keterangan: "Musnah" },
"Mutasi":                                                       { aktif: 2 , inaktif: 3, keterangan: "Musnah" },
"Perpanjangan Masa Jabatan":                                    { aktif: 2 , inaktif: 3, keterangan: "Musnah" },
"Mempekerjakan Kembali":                                        { aktif: 2 , inaktif: 3, keterangan: "Musnah" },
"Data Pekerja":                                                { aktif: 2 , inaktif: 5, keterangan: "Musnah" },
"Pemberian rzinlDispensasi":                                   { aktif: 1 , inaktif: 1, keterangan: "Musnah" },
"Perjalanan Dinas":                                            { aktif: 2 , inaktif: 3, keterangan: "Musnah" },
"Perubahan Status Keluarga":                                   { aktif: 1 , inaktif: 1, keterangan: "Musnah" },
// 15. Kesejahteraan Pekerja
"Cuti":                                                         { aktif: 2 , inaktif: 3, keterangan: "Musnah" },
"Remunerasi dan Benefit":                                       { aktif: 2 , inaktif: 3, keterangan: "Musnah" },
"Asuransi Pekerja":                                             { aktif: 2 , inaktif: 3, keterangan: "Musnah" },
"Pensiunan (Janda/Duda/Anak)":                                  { aktif: 2 , inaktif: 2, keterangan: "Musnah" },
"Administrasi Pelayanan Kesehatan":                             { aktif: 2 , inaktif: 3, keterangan: "Musnah" },
"Pembina Koperasi":                                             { aktif: 1 , inaktif: 1, keterangan: "Musnah" },
"Rekreasi, Olahraga, Rohani, Kesenian (Operasiomal)":                         { aktif: 1 , inaktif: 1, keterangan: "Musnah" },
"Rekreasi, Olahraga, Rohani, Kesenian ((Pengembangan SDM))":                         { aktif: 2 , inaktif: 3, keterangan: "Musnah" },
// 17. Berkas Perseorangan
"Berkas Perseorangan Pekerja":                                  { aktif: 2 , inaktif: 2, keterangan: "Musnah" },
"Organisasi Nonkedinasan":                                      { aktif: 1 , inaktif: 2, keterangan: "Musnah" },
"Penyelesaian Hubungan lndustrial (Tripartit)":                 { aktif: 1, inaktif: 2, keterangan: "Musnah" },
"Survei Kepuasan Pekerja":                                      { aktif: 1, inaktif: 2, keterangan: "Musnah" },
// ── I.G KEUANGAN ──────────────────────────────────
"Perencanaan Keuangan":                                         { aktif: 2, inaktif: 8, keterangan: "Musnah" },
"Pengelolaan Keuangan":                                         { aktif: 1, inaktif: 9, keterangan: "Musnah" },
"Akutansi Keuangan Kebijakan Akuntansi":                        { aktif: 2, inaktif: 8, keterangan: "Permanen" },
"Akutansi Keuangan Bukti Akuntansi":                            { aktif: 2, inaktif: 8, keterangan: "Musnah" },
"Laporan Keuangan":                                             { aktif: 2, inaktif: 8, keterangan: "Musnah" },
"Perpajakan":                                                   { aktif: 2, inaktif: 8, keterangan: "Musnah" },
"Pengelolaan Aset (Dokumen Asset (Serti{ikal Tanah, BPKB. lMB.dll ))": { aktif: 1, inaktif: 2, keterangan: "Musnah" },
"Pengelolaan Aset (Daftar Aset Tetap)":                       { aktif: 2, inaktif: 3, keterangan: "Musnah" },
"Pengelolaan Aset (Asuransi Aset)":                       { aktif: 2, inaktif: 8, keterangan: "Musnah" },
// ── II.A INVESTASI ──────────────────────────────────
"Usulan Investasi": { aktif: 2, inaktif: 8, keterangan: "Musnah" },
"Evaluasi Usulan": { aktif: 2, inaktif: 8, keterangan: "Musnah" },
"Penetapan Direksi": { aktif: 2, inaktif: 8, keterangan: "Musnah" },

// ── II.B LAPORAN REGIONAL / CABANG ──────────────────
"LRKAP": { aktif: 2, inaktif: 8, keterangan: "Musnah" },
"LHutang Piutang Cabang": { aktif: 3, inaktif: 7, keterangan: "Musnah" },
"LPerbendaharaan Cabang": { aktif: 3, inaktif: 7, keterangan: "Musnah" },

// ── II.C MANAJEMEN RISIKO ───────────────────────────
"Monitoring Triwulan": { aktif: 2, inaktif: 3, keterangan: "Musnah" },
"Monitoring Semester": { aktif: 2, inaktif: 3, keterangan: "Musnah" },
"Monitoring Tahunan": { aktif: 2, inaktif: 3, keterangan: "Musnah" },
"Review Kajian Risiko": { aktif: 2, inaktif: 3, keterangan: "Permanen" },
"Evaluasi Implementasi Risiko": { aktif: 2, inaktif: 3, keterangan: "Musnah" },

// ── II.D ORGANISASI & TATALAKSANA ──────────────────
"Strategi SDM": { aktif: 2, inaktif: 3, keterangan: "Permanen" },

"Anggaran Dasar": { aktif: "Selama Berlaku", inaktif: 4, keterangan: "Permanen" },
"Anggaran Rumah Tangga": { aktif: "Selama Berlaku", inaktif: 4, keterangan: "Permanen" },

"Struktur Organisasi": { aktif: 1, inaktif: 5, keterangan: "Permanen" },
"Pendirian Perusahaan": { aktif: 1, inaktif: 5, keterangan: "Permanen" },
"Pengembangan Organisasi": { aktif: 1, inaktif: 5, keterangan: "Permanen" },
"Pembubaran": { aktif: 1, inaktif: 5, keterangan: "Permanen" },

"Analisis Jabatan": { aktif: 1, inaktif: 5, keterangan: "Permanen" },
"Job Description": { aktif: 1, inaktif: 5, keterangan: "Permanen" },
"Job Specification": { aktif: 1, inaktif: 5, keterangan: "Permanen" },

"Perencanaan Budaya": { aktif: 1, inaktif: 4, keterangan: "Musnah" },
"Implementasi Budaya": { aktif: 1, inaktif: 4, keterangan: "Musnah" },
"Evaluasi Budaya": { aktif: 1, inaktif: 4, keterangan: "Musnah" },

"Monitoring Organisasi": { aktif: 2, inaktif: 3, keterangan: "Permanen" },
"Evaluasi Prosedur Kerja": { aktif: 2, inaktif: 3, keterangan: "Permanen" },

// ── II.E RUMAH TANGGA & UMUM ───────────────────────
"Konsumsi Perusahaan": { aktif: 1, inaktif: 1, keterangan: "Musnah" },

"Gedung Kantor": { aktif: 1, inaktif: 2, keterangan: "Musnah" },
"Rumah Dinas": { aktif: 1, inaktif: 2, keterangan: "Musnah" },
"Kendaraan Dinas": { aktif: 1, inaktif: 3, keterangan: "Musnah" },
"Peralatan Kantor": { aktif: 1, inaktif: 3, keterangan: "Musnah" },
"Mesin & Alat Berat": { aktif: 2, inaktif: 2, keterangan: "Musnah" },
"Peralatan Listrik": { aktif: 3, inaktif: 3, keterangan: "Musnah" },
"ATK": { aktif: 1, inaktif: 1, keterangan: "Musnah" },

"Pengamanan Lingkungan": { aktif: 1, inaktif: 3, keterangan: "Musnah" },
"Pengamanan Aset": { aktif: 1, inaktif: 3, keterangan: "Musnah" },
"Pengamanan Peralatan": { aktif: 1, inaktif: 3, keterangan: "Musnah" },
"Koordinasi Aparat": { aktif: 1, inaktif: 3, keterangan: "Musnah" },

"Seragam Dinas": { aktif: 1, inaktif: 1, keterangan: "Musnah" },
"Bukti Kepemilikan Aset": { aktif: "Selama Digunakan", inaktif: 0, keterangan: "Musnah" },

"Sewa Menyewa": { aktif: "Selama Digunakan", inaktif: 5, keterangan: "Musnah" },
"Bangun Serah Guna": { aktif: "Selama Digunakan", inaktif: 5, keterangan: "Musnah" },
"Bangun Guna Serah": { aktif: "Selama Digunakan", inaktif: 5, keterangan: "Musnah" },
"Ruislag": { aktif: "Selama Digunakan", inaktif: 5, keterangan: "Musnah" },

"Penghapusan Aset Tetap": { aktif: 1, inaktif: 2, keterangan: "Musnah" },
"Penghapusan Inventaris": { aktif: 1, inaktif: 2, keterangan: "Musnah" },
"Penghapusan Aset Tak Berwujud": { aktif: 1, inaktif: 2, keterangan: "Musnah" },

"Berita Acara Penghapusan": { aktif: 1, inaktif: 2, keterangan: "Musnah" },

// ── II.F PENGADAAN ────────────────────────────────
"Pengumuman Pengadaan": { aktif: 2, inaktif: 8, keterangan: "Musnah" },
"Pendaftaran Lelang": { aktif: 2, inaktif: 8, keterangan: "Musnah" },
"Evaluasi Lelang": { aktif: 2, inaktif: 8, keterangan: "Musnah" },
"Aanwijzing": { aktif: 2, inaktif: 8, keterangan: "Musnah" },
"Dokumen Penawaran": { aktif: 2, inaktif: 8, keterangan: "Musnah" },
"Konfirmasi Penawaran": { aktif: 2, inaktif: 8, keterangan: "Musnah" },
"Evaluasi Penawaran": { aktif: 2, inaktif: 8, keterangan: "Musnah" },
"Pengumuman Hasil": { aktif: 2, inaktif: 8, keterangan: "Musnah" },
"Dokumen Keuangan": { aktif: 2, inaktif: 8, keterangan: "Musnah" },
"Evaluasi Keuangan": { aktif: 2, inaktif: 8, keterangan: "Musnah" },
"Negosiasi": { aktif: 2, inaktif: 8, keterangan: "Musnah" },
"Usulan Pemenang": { aktif: 2, inaktif: 8, keterangan: "Musnah" },
"Pengumuman Pemenang": { aktif: 2, inaktif: 8, keterangan: "Musnah" },
"Penetapan Pemenang": { aktif: 2, inaktif: 8, keterangan: "Musnah" },
"Sanggahan": { aktif: 2, inaktif: 8, keterangan: "Musnah" },
"Kontrak Kerja": { aktif: 2, inaktif: 8, keterangan: "Musnah" },
"Distribusi Kontrak": { aktif: 2, inaktif: 3, keterangan: "Musnah" },

"Data Rekanan": { aktif: 2, inaktif: 3, keterangan: "Musnah" },

// ── II.G DIKLAT ────────────────────────────────
"Kurikulum Diklat": { aktif: 2, inaktif: 3, keterangan: "Permanen" },
"Modul Diklat": { aktif: 2, inaktif: 3, keterangan: "Musnah" },
"Panduan Fasilitator": { aktif: 1, inaktif: 2, keterangan: "Musnah" },
"Rekomendasi Penyelenggaraan Diklat": { aktif: 1, inaktif: 2, keterangan: "Musnah" },

// Magang / Penelitian
"Magang Mahasiswa": { aktif: 1, inaktif: 4, keterangan: "Musnah" },
"Penelitian": { aktif: 1, inaktif: 4, keterangan: "Musnah" },

// Sistem Informasi Diklat
"Data Lembaga Diklat": { aktif: 1, inaktif: 4, keterangan: "Musnah" },
"Data Prasarana Diklat": { aktif: 1, inaktif: 4, keterangan: "Musnah" },
"Data Sarana Diklat": { aktif: 1, inaktif: 4, keterangan: "Musnah" },
"Data Pengelola Diklat": { aktif: 1, inaktif: 4, keterangan: "Musnah" },
"Data Penyelenggara Diklat": { aktif: 1, inaktif: 4, keterangan: "Musnah" },
"Data Narasumber": { aktif: 1, inaktif: 4, keterangan: "Musnah" },
"Data Program Diklat": { aktif: 1, inaktif: 4, keterangan: "Musnah" },

// Perencanaan & Pelaksanaan
"Rencana Tahunan Diklat": { aktif: 2, inaktif: 3, keterangan: "Musnah" },

"Surat Perintah Diklat": { aktif: 1, inaktif: 3, keterangan: "Musnah" },
"Surat Penunjukan Penyelenggara": { aktif: 1, inaktif: 3, keterangan: "Musnah" },
"Buku Panduan Diklat": { aktif: 1, inaktif: 3, keterangan: "Musnah" },

"Laporan Penyelenggaraan Diklat": { aktif: 2, inaktif: 2, keterangan: "Musnah" },

// ── II.I TEKNOLOGI INFORMASI & KOMUNIKASI ────────────────

// Strategis
"Master Plan Sistem Informasi": { aktif: 2, inaktif: 3, keterangan: "Permanen" },

// Dokumentasi Arsitektur
"Arsitektur Sistem Informasi": { aktif: 2, inaktif: 5, keterangan: "Musnah" },
"Arsitektur Aplikasi": { aktif: 2, inaktif: 5, keterangan: "Musnah" },
"Arsitektur Infrastruktur": { aktif: 2, inaktif: 5, keterangan: "Musnah" },

// Dokumentasi Implementasi
"Implementasi Sistem Informasi": { aktif: 2, inaktif: 5, keterangan: "Musnah" },
"Implementasi Aplikasi": { aktif: 2, inaktif: 5, keterangan: "Musnah" },
"Implementasi Infrastruktur": { aktif: 2, inaktif: 5, keterangan: "Musnah" },

// Migrasi Sistem
"Migrasi Sistem & Data": { aktif: 1, inaktif: 3, keterangan: "Musnah" },
// ── TIK LANJUTAN (BERDASARKAN DOKUMEN JRA) ────────────────

// 5. Pengembangan / Perubahan Sistem Informasi
"Inisiasi Pengembangan SI": { aktif: 1, inaktif: 4, keterangan: "Musnah" },
"Perencanaan & Analisis SI": { aktif: 1, inaktif: 4, keterangan: "Musnah" },
"Desain Sistem Informasi": { aktif: 1, inaktif: 4, keterangan: "Musnah" },
"Pembangunan (Development)": { aktif: 1, inaktif: 4, keterangan: "Musnah" },
"Testing / Uji Coba": { aktif: 1, inaktif: 4, keterangan: "Musnah" },

// 6. Pengelolaan, Pengoperasian, dan Monitoring

// a. Pengelolaan Sistem Informasi
"Kelangsungan Layanan SI": { aktif: 1, inaktif: 1, keterangan: "Musnah" },
"Keamanan Sistem Informasi": { aktif: 1, inaktif: 1, keterangan: "Musnah" },
"Pengelolaan Layanan User": { aktif: 1, inaktif: 1, keterangan: "Musnah" },

// b. Perekaman & Pemutakhiran Data
"Formulir Data": { aktif: 1, inaktif: 2, keterangan: "Musnah" },
"Daftar Petugas Perekaman": { aktif: 1, inaktif: 2, keterangan: "Musnah" },
"Jadwal Pelaksanaan": { aktif: 1, inaktif: 2, keterangan: "Musnah" },
"Laporan Hasil Perekaman Data": { aktif: 1, inaktif: 2, keterangan: "Musnah" },

// c. Monitoring Sistem
"Monitoring Sistem Informasi": { aktif: 1, inaktif: 1, keterangan: "Musnah" },

// ── PENGAWASAN ───────────────────────────────────────────

// 1. Program Kerja Audit
"Program Kerja Audit": { aktif: 2, inaktif: 3, keterangan: "Musnah" },

// 2. Audit Internal

// a. LHA Terpadu / Rutin
"Surat Perintah Audit (Internal)": { aktif: 3, inaktif: 5, keterangan: "Musnah" },
"SPPD Audit (Internal)": { aktif: 3, inaktif: 5, keterangan: "Musnah" },
"KKA (Audit Internal)": { aktif: 3, inaktif: 5, keterangan: "Musnah" },
"Bukti Temuan (Audit Internal)": { aktif: 3, inaktif: 5, keterangan: "Musnah" },
"Berita Acara Pemeriksaan (Audit Internal)": { aktif: 3, inaktif: 5, keterangan: "Musnah" },
"LHA + Rekomendasi (Audit Internal)": { aktif: 3, inaktif: 5, keterangan: "Musnah" },

// b. LHA Investigasi
"Surat Permintaan Audit (Investigasi)": { aktif: 2, inaktif: 3, keterangan: "Musnah" },
"Surat Perintah (Investigasi)": { aktif: 2, inaktif: 3, keterangan: "Musnah" },
"SPPD (Investigasi)": { aktif: 2, inaktif: 3, keterangan: "Musnah" },
"KKA (Audit Investigasi)": { aktif: 2, inaktif: 3, keterangan: "Musnah" },
"Bukti Temuan (Audit Investigasi)": { aktif: 2, inaktif: 3, keterangan: "Musnah" },
"Berita Acara Pemeriksaan (Investigasi)": { aktif: 2, inaktif: 3, keterangan: "Musnah" },
"LHA + Rekomendasi (Audit Investigasi)": { aktif: 2, inaktif: 3, keterangan: "Musnah" },

// c. LHA Anak Perusahaan
"Surat Permintaan Audit (Anak Perusahaan)": { aktif: 2, inaktif: 3, keterangan: "Musnah" },
"Surat Perintah (Anak Perusahaan)": { aktif: 2, inaktif: 3, keterangan: "Musnah" },
"SPPD (Audit Anak Perusahaan)": { aktif: 2, inaktif: 3, keterangan: "Musnah" },
"KKA (Audit Anak Perusahaan)": { aktif: 2, inaktif: 3, keterangan: "Musnah" },
"Bukti Temuan (Audit Anak Perusahaan)": { aktif: 2, inaktif: 3, keterangan: "Musnah" },
"Berita Acara Pemeriksaan (Anak Perusahaan)": { aktif: 2, inaktif: 3, keterangan: "Musnah" },
"LHA + Rekomendasi (Audit Anak Perusahaan)": { aktif: 2, inaktif: 3, keterangan: "Musnah" },

// 3. Audit Eksternal

// a. Laporan Audit Eksternal
"Surat Tugas (Audit Eksternal)": { aktif: 2, inaktif: 5, keterangan: "Musnah" },
"LHA + Rekomendasi (Audit Eksternal)": { aktif: 2, inaktif: 5, keterangan: "Musnah" },

// b. Audit Kinerja
"Surat Tugas (Audit Kinerja)": { aktif: 2, inaktif: 5, keterangan: "Musnah" },
"LHA + Rekomendasi (Audit Kinerja)": { aktif: 2, inaktif: 5, keterangan: "Musnah" },

// ── AUDIT LANJUTAN ───────────────────────────────────────

// c. Audit Investigasi
"Surat Tugas (Investigasi)": { aktif: 2, inaktif: 5, keterangan: "Musnah" },
"LHA (Investigasi) + Rekomendasi": { aktif: 2, inaktif: 5, keterangan: "Musnah" },

// d. Audit Kepatuhan / Pengendalian Internal
"Surat Tugas Kepatuhan": { aktif: 2, inaktif: 5, keterangan: "Musnah" },
"LHA Kepatuhan + Rekomendasi": { aktif: 2, inaktif: 5, keterangan: "Musnah" },

// LHA indikasi penyimpangan nasional
"LHA Indikasi Penyimpangan Nasional": { aktif: 3, inaktif: 5, keterangan: "Permanen" },

// Manajemen persuratan audit
"Manajemen Persuratan Audit": { aktif: 2, inaktif: 5, keterangan: "Permanen" },

// Monitoring & pelaporan
"Monitoring Tindak Lanjut": { aktif: 2, inaktif: 5, keterangan: "Musnah" },
"Pelaporan Pelanggaran (WBS)": { aktif: 2, inaktif: 3, keterangan: "Musnah" },

// ── MANAJEMEN INTEGRASI ──────────────────────────────────

// Strategi integrasi
"Kajian Masterplan": { aktif: 2, inaktif: 3, keterangan: "Permanen" },
"Laporan Konsultan": { aktif: 2, inaktif: 3, keterangan: "Permanen" },
"Lembar Kerja Masterplan": { aktif: 2, inaktif: 3, keterangan: "Permanen" },

// Program kerja
"Undangan Program Kerja": { aktif: 1, inaktif: 2, keterangan: "Musnah" },
"Berita Acara Program Kerja": { aktif: 1, inaktif: 2, keterangan: "Musnah" },
"Surat Penyampaian Program": { aktif: 1, inaktif: 2, keterangan: "Musnah" },
"Laporan Pelaksanaan Program": { aktif: 1, inaktif: 2, keterangan: "Musnah" },

// Value Creation Plan
"Lembar Kerja VCP": { aktif: 1, inaktif: 2, keterangan: "Musnah" },
"Laporan Pelaksanaan VCP": { aktif: 1, inaktif: 2, keterangan: "Musnah" },

// Implementasi & Monitoring
"Undangan Asistensi Project": { aktif: 2, inaktif: 3, keterangan: "Musnah" },
"Laporan Asistensi Project": { aktif: 2, inaktif: 3, keterangan: "Musnah" },

"Action Item Direksi": { aktif: 1, inaktif: 2, keterangan: "Musnah" },

"Forum Integrasi": { aktif: 1, inaktif: 2, keterangan: "Musnah" },
"Pelindo Forum": { aktif: 1, inaktif: 2, keterangan: "Musnah" },
"Internal Progress Meeting": { aktif: 1, inaktif: 2, keterangan: "Musnah" },
"Executive Committee Meeting": { aktif: 1, inaktif: 2, keterangan: "Musnah" },

"Reporting Progress BOD": { aktif: 2, inaktif: 3, keterangan: "Musnah" },
"Reporting Progress Kementerian": { aktif: 2, inaktif: 3, keterangan: "Musnah" },

// ── TEKNIK ───────────────────────────────────────────────

// Perencanaan (In House & Konsultan)
"TOR / Kerangka Acuan Kerja": { aktif: 3, inaktif: 7, keterangan: "Permanen" },
"RAB": { aktif: 3, inaktif: 7, keterangan: "Permanen" },
"Kriteria Evaluasi Teknis": { aktif: 3, inaktif: 7, keterangan: "Permanen" },
"Gambar Teknis": { aktif: 3, inaktif: 7, keterangan: "Permanen" },
"RKS": { aktif: 3, inaktif: 7, keterangan: "Permanen" },

// Pelaksanaan Proyek
"Dokumen Pelaksanaan Proyek": { aktif: 3, inaktif: 7, keterangan: "Permanen" },

// Pasca Pelaksanaan
"Dokumen Pasca Proyek": { aktif: 3, inaktif: 7, keterangan: "Permanen" },

// Pengendalian Proyek
"Laporan Realisasi Investasi": { aktif: 2, inaktif: 8, keterangan: "Musnah" },

// ── K3L ─────────────────────────────────────────────────

// Sistem Manajemen
"K3Komitmen Direksi": { aktif: 1, inaktif: 2, keterangan: "Musnah" },
"K3Buku Panduan ISO": { aktif: 1, inaktif: 2, keterangan: "Musnah" },
"K3Analisis SWOT": { aktif: 1, inaktif: 2, keterangan: "Musnah" },
"K3Stakeholder List": { aktif: 1, inaktif: 2, keterangan: "Musnah" },
"K3Sasaran Sistem Manajemen": { aktif: 1, inaktif: 2, keterangan: "Musnah" },

"K3Sosialisasi": { aktif: 1, inaktif: 2, keterangan: "Musnah" },
"K3Implementasi Sistem": { aktif: 1, inaktif: 2, keterangan: "Musnah" },
"K3Audit Internal": { aktif: 1, inaktif: 2, keterangan: "Musnah" },
"K3Rapat Tinjauan Manajemen": { aktif: 1, inaktif: 2, keterangan: "Musnah" },
"K3Audit Eksternal": { aktif: 1, inaktif: 2, keterangan: "Musnah" },

// Kesehatan & Keselamatan
"K3Laporan Kecelakaan Kerja": { aktif: 1, inaktif: 2, keterangan: "Musnah" },
"K3Tanggap Darurat": { aktif: 1, inaktif: 2, keterangan: "Musnah" },
"K3Inspeksi": { aktif: 1, inaktif: 2, keterangan: "Musnah" },
"K3Job Safety Analysis": { aktif: 1, inaktif: 2, keterangan: "Musnah" },
"K3Medical Checkup & Training": { aktif: 1, inaktif: 2, keterangan: "Musnah" },

// Lingkungan
"K3AMDAL": { aktif: 2, inaktif: 3, keterangan: "Musnah" },
"K3UKL-UPL": { aktif: 2, inaktif: 3, keterangan: "Musnah" },
"K3SPPL": { aktif: 2, inaktif: 3, keterangan: "Musnah" },
"K3Izin Lingkungan": { aktif: 2, inaktif: 3, keterangan: "Musnah" },
"K3Persetujuan Teknis": { aktif: 2, inaktif: 3, keterangan: "Musnah" },
"K3SLO": { aktif: 2, inaktif: 3, keterangan: "Musnah" },
"K3Neraca Limbah": { aktif: 1, inaktif: 2, keterangan: "Musnah" },
"K3Monitoring Lingkungan": { aktif: 2, inaktif: 3, keterangan: "Musnah" },
"K3PROPER": { aktif: 1, inaktif: 2, keterangan: "Musnah" },
"K3Audit KLHK": { aktif: 2, inaktif: 3, keterangan: "Musnah" },

// ── SUBSTANTIF ───────────────────────────────────────────

// Perencanaan Strategis
"STVisi Misi Perusahaan": { aktif: 2, inaktif: 3, keterangan: "Permanen" },
"STProses Bisnis": { aktif: 2, inaktif: 3, keterangan: "Musnah" },
"STRJPP": { aktif: 2, inaktif: 3, keterangan: "Permanen" },
"STRencana Kerja Manajemen": { aktif: 2, inaktif: 3, keterangan: "Musnah" },
"STRencana Induk Pelabuhan": { aktif: 2, inaktif: 3, keterangan: "Musnah" },

// Pengendalian Kinerja
"STPengendalian Kinerja Perusahaan": { aktif: 2, inaktif: 3, keterangan: "Musnah" },
// Inovasi Perusahaan
"SK Komite Inovasi": { aktif: 2, inaktif: 3, keterangan: "Musnah" },
"Usulan Inovasi Unit Kerja": { aktif: 2, inaktif: 3, keterangan: "Musnah" },
"Daftar Usulan Inovasi": { aktif: 2, inaktif: 3, keterangan: "Musnah" },
"Penilaian Inovasi": { aktif: 2, inaktif: 3, keterangan: "Musnah" },
"Penetapan Pemenang Inovasi": { aktif: 2, inaktif: 3, keterangan: "Musnah" },

// Kajian Kepelabuhanan
"Kajian Kepelabuhanan": { aktif: 2, inaktif: 3, keterangan: "Musnah" },

// Pengembangan Bisnis
"Analisis Segmen Usaha": { aktif: 2, inaktif: 3, keterangan: "Permanen" },
"Laporan Kajian Segmen": { aktif: 2, inaktif: 3, keterangan: "Permanen" },

"Usulan Proyek Konsesi": { aktif: 2, inaktif: 3, keterangan: "Permanen" },
"Kajian Kelayakan Konsesi": { aktif: 2, inaktif: 3, keterangan: "Permanen" },
"Perjanjian Konsesi": { aktif: 2, inaktif: 3, keterangan: "Permanen" },

// Komersial - Bina Pelanggan
"Survei Kepuasan Pelanggan": { aktif: 1, inaktif: 2, keterangan: "Musnah" },
"Customer Visit": { aktif: 1, inaktif: 2, keterangan: "Musnah" },
"Key Account Management": { aktif: 1, inaktif: 2, keterangan: "Musnah" },
"Tarif Jasa Kepelabuhanan": { aktif: 1, inaktif: 2, keterangan: "Musnah" },

// Kerja Sama
"Proposal Kerja Sama": { aktif: 1, inaktif: 2, keterangan: "Musnah" },
"Evaluasi Kerja Sama": { aktif: 1, inaktif: 2, keterangan: "Musnah" },
"Persetujuan Kerja Sama": { aktif: 1, inaktif: 2, keterangan: "Musnah" },
"Penolakan Kerja Sama": { aktif: 1, inaktif: 2, keterangan: "Musnah" },

// Monitoring Pemasaran
"Monitoring Pemasaran": { aktif: 1, inaktif: 2, keterangan: "Musnah" },

// Logistik & Aneka Usaha
"Pengusahaan Air": { aktif: 1, inaktif: 2, keterangan: "Musnah" },
"Pengusahaan Listrik": { aktif: 1, inaktif: 2, keterangan: "Musnah" },
"Pas Terminal Penumpang": { aktif: 1, inaktif: 2, keterangan: "Musnah" },
"Pas Pelabuhan Orang": { aktif: 1, inaktif: 2, keterangan: "Musnah" },
"Pas Pelabuhan Kendaraan": { aktif: 1, inaktif: 2, keterangan: "Musnah" },
"Repair/Docking Kapal": { aktif: 1, inaktif: 2, keterangan: "Musnah" },
"Produksi Kontribusi": { aktif: 1, inaktif: 2, keterangan: "Musnah" },
"Pas Depo": { aktif: 1, inaktif: 2, keterangan: "Musnah" },
"Forwarding": { aktif: 1, inaktif: 2, keterangan: "Musnah" },

// Evaluasi & Pelayanan Pelanggan
"Evaluasi Pemasaran": { aktif: 2, inaktif: 3, keterangan: "Musnah" },
"Keluhan Pelanggan": { aktif: 1, inaktif: 3, keterangan: "Musnah" },
"Monitoring Pelanggan": { aktif: 1, inaktif: 3, keterangan: "Musnah" },
"Layanan Nonteknis": { aktif: 1, inaktif: 3, keterangan: "Musnah" },
"Call Center": { aktif: 1, inaktif: 3, keterangan: "Musnah" },
"Apresiasi Pelanggan": { aktif: 1, inaktif: 1, keterangan: "Musnah" },
"Database Pelanggan": { aktif: 0, inaktif: 1, keterangan: "Musnah" },

// Pembinaan Anak Perusahaan
"Arahan Pemegang Saham": { aktif: 2, inaktif: 3, keterangan: "Permanen" },
"Kajian Kelayakan Anak Perusahaan": { aktif: 2, inaktif: 3, keterangan: "Permanen" },
"Business Performance Review": { aktif: 2, inaktif: 3, keterangan: "Musnah" },

// RUPS
"Risalah RUPS Tahunan": { aktif: 2, inaktif: 8, keterangan: "Permanen" },
"Risalah RUPS Luar Biasa": { aktif: 2, inaktif: 8, keterangan: "Permanen" },

// Pelayanan Jasa Kapal
"Jasa Labuh": { aktif: 2, inaktif: 3, keterangan: "Musnah" },
"Jasa Pemanduan": { aktif: 2, inaktif: 3, keterangan: "Musnah" },
"Jasa Penundaan": { aktif: 2, inaktif: 3, keterangan: "Musnah" },
"Jasa Tambat": { aktif: 2, inaktif: 3, keterangan: "Musnah" },
"Jasa Kepil": { aktif: 2, inaktif: 3, keterangan: "Musnah" },
"Jasa Alur Pelayaran": { aktif: 1, inaktif: 2, keterangan: "Musnah" },

// Pelayanan Barang
"Barang Umum": { aktif: 2, inaktif: 3, keterangan: "Musnah" },
"Peti Kemas": { aktif: 2, inaktif: 3, keterangan: "Musnah" },
"Curah Cair/Gas": { aktif: 2, inaktif: 3, keterangan: "Musnah" },
"Curah Kering": { aktif: 2, inaktif: 3, keterangan: "Musnah" },
"Terminal Kendaraan": { aktif: 2, inaktif: 3, keterangan: "Musnah" },
"Bongkar Muat Terapung": { aktif: 2, inaktif: 3, keterangan: "Musnah" },
"Dry Port": { aktif: 2, inaktif: 3, keterangan: "Musnah" },
"Ro-Ro": { aktif: 2, inaktif: 3, keterangan: "Musnah" },

// Penumpang
"Pas Penumpang": { aktif: 2, inaktif: 3, keterangan: "Musnah" },
"Barang Bawaan": { aktif: 2, inaktif: 3, keterangan: "Musnah" },

// Konsolidasi & Distribusi
"Peti Kemas Konsolidasi": { aktif: 2, inaktif: 3, keterangan: "Musnah" },
"Non Peti Kemas": { aktif: 2, inaktif: 3, keterangan: "Musnah" },

// PELRA
"Paket": { aktif: 2, inaktif: 3, keterangan: "Musnah" },
"Non Paket": { aktif: 2, inaktif: 3, keterangan: "Musnah" },

// Pengusahaan Alat
"Alat Angkat": { aktif: 2, inaktif: 3, keterangan: "Musnah" },
"Alat Angkut": { aktif: 2, inaktif: 3, keterangan: "Musnah" },
"Alat Bantu": { aktif: 2, inaktif: 3, keterangan: "Musnah" },
"Alat Apung": { aktif: 2, inaktif: 3, keterangan: "Musnah" },




};

// Kelompokkan retensi per kategori untuk <optgroup>
const JRA_GROUPS = [
  {
    group: "Hubungan Masyarakat – Publikasi Primer",
    items: [
      "Wawancara",
      "Pers Release",
      "Buletin",
      "Majalah",
      "Jurnal",
      "Media Massa",
      "Bakohumas",
      "Website",
    ],
  },
  {
    group: "Hubungan Masyarakat – Publikasi & Partisipasi",
    items: [
      "Penerangan dan Publikasi Bernilai Guna Sekunder",
      "Sponsorship atau Bentuk Partisipasi Lainnya",
    ],
  },
  {
    group: "Hubungan Masyarakat – Antarlembaga",
    items: [
      "Hubungan Antarlembaga Internasional",
      "Hubungan Antarlembaga Negara",
      "Hubungan Antarlembaga Regional",
      "Hubungan Antarlembaga Subholding & Anak Perusahaan",
      "Rapat Dengar Pendapat DPR/DPD/DPRD",
    ],
  },
  {
    group: "Hubungan Masyarakat – Protokol & Souvenir",
    items: [
      "Kunjungan Dinas dari Luar Perusahaan",
      "Kunjungan Dinas Komisaris dan Direksi",
      "Kunjungan Dinas Pekerja ke Luar Perusahaan",
      "Tamu Perusahaan",
      "Agenda Pimpinan",
      "Acara Perusahaan",
      "Souvenir/Cinderamata",
    ],
  },
  {
    group: "Kesekretariatan – GCG",
    items: [
      "GCG Awareness (Sosialisasi, Survei & Pakta Integritas)",
      "GCG Asesmen",
    ],
  },
  {
    group: "Kesekretariatan – Rapat",
    items: [
      "Rapat Direksi",
      "Rapat Umum Pemegang Saham (RUPS)",
      "Rapat Board of Director (BOD)",
      "Rapat Board of Commissioner (BOC)",
      "Rapat Koordinasi Komisaris dan Direksi",
      "Rapat Kerja Nasional (Rakernas)",
    ],
  },
  {
    group: "Manajemen Kearsipan",
    items: [
      "Penciptaan Arsip",
      "Penggunaan dan Pemeliharaan Arsip",
      "Penyusutan Arsip",
      "lnstrumen Pengelolaan Arsip dan Pedoman Penyelenggaraan Kearsipan",
      "Monitoring dan Pembinaan Kearsipan",
    ],
  },
  {
    group: "Tanggung Jawab Sosial dan Lingkungan",
    items: [
      "Bantuan dan/atau Kegiatan lainnya",
      "Program Pendanaan Usaha Mikro dan Kecil",
      "Bantuan/Program Pendanaan UMK Berskala Nasional",
      "Permohonan Bantuan/Program yang Tidak Disetujui",
      "PLaporan Program Tanggung Jawab Sosial dan Lingkunqan",
    ],
  },
  {
    group: "Hukum",
    items: [
      "Peraturan Perusahaan",
      "Penyelesaian Permasalahan Hukum",
      "Notarialisasi Akta",
      "Kepatuhan",
      "Hak Atas Kekayaan Intelektual",
    ],
  },
  {
    group: "Kepegawaian – Rekrutmen & Pengangkatan",
    items: [
      "Formasi Pekerja",
      "Pengadaan Pekerja",
      "Pengangkatan Pekerja Organik",
      "Pengangkatan Pekerja ",
      "Perianjian Keria Waktu Terlentu (PKWI)",
      "Pekerja Alih Daya",
    ],
  },
  {
    group: "Kepegawaian – Pembinaan & Karir",
    items: [
      "Pembinaan dan Pengembangan Karir Pegawai",
      "Key Perlorma lndikator (KPl)",
      "Disiplin Pekerja",
      "Penghargaan Pekerja/Pemberian Tanda Jasa",
      "Mutasi",
      "Perpanjangan Masa Jabatan",
      "Mempekerjakan Kembali",
    ],
  },
  {
    group: "Kepegawaian – Administrasi & Data",
    items: [
      "Data Pekerja",
      "Pemberian rzinlDispensasi",
      "Perjalanan Dinas",
      "Perubahan Status Keluarga",
    ],
  },
  {
    group: "Kepegawaian – Kesejahteraan",
    items: [
      "Cuti",
      "Remunerasi dan Benefit",
      "Asuransi Pekerja",
      "Pensiunan (Janda/Duda/Anak)",
      "Administrasi Pelayanan Kesehatan",
      "Pembina Koperasi",
      "Rekreasi, Olahraga, Rohani, Kesenian",
      "Rekreasi, Olahraga, Rohani, Kesenian",
    ],
  },
  {
    group: "Kepegawaian – Berkas & Organisasi",
    items: [
      "Berkas Perseorangan Pekerja",
      "Organisasi Nonkedinasan",
      "Penyelesaian Hubungan lndustrial (Tripartit)",
      "Survei Kepuasan Pekerja",
    ],
  },
  {
    group: "Keuangan – Perencanaan & Pengelolaan",
    items: [
      "Perencanaan Keuangan",
      "Pengelolaan Keuangan",
      "Akutansi Keuangan Kebijakan Akuntansi",
      "Akutansi Keuangan Bukti Akuntansi",
      "Laporan Keuangan",
      "Perpajakan",
    ],
  },
  {
    group: "Keuangan – Pengelolaan Aset",
    items: [
      "Pengelolaan Aset (Dokumen Asset (Serti{ikal Tanah, BPKB. lMB.dll ))",
      "Pengelolaan Aset (Daftar Aset Tetap)",
      "Pengelolaan Aset (Asuransi Aset)",
    ],
  },
  {
    group: "Investasi",
    items: [
      "Usulan Investasi",
      "Evaluasi Usulan",
      "Penetapan Direksi",
    ],
  },
  {
    group: "Laporan Regional / Cabang",
    items: [
      "LRKAP",
      "LHutang Piutang Cabang",
      "LPerbendaharaan Cabang",
    ],
  },
  {
    group: "Manajemen Risiko",
    items: [
      "Monitoring Triwulan",
      "Monitoring Semester",
      "Monitoring Tahunan",
      "Review Kajian Risiko",
      "Evaluasi Implementasi Risiko",
    ],
  },
  {
    group: "Organisasi & Tatalaksana – Strategi & AD/ART",
    items: [
      "Strategi SDM",
      "Anggaran Dasar",
      "Anggaran Rumah Tangga",
    ],
  },
  {
    group: "Organisasi & Tatalaksana – Struktur & Jabatan",
    items: [
      "Struktur Organisasi",
      "Pendirian Perusahaan",
      "Pengembangan Organisasi",
      "Pembubaran",
      "Analisis Jabatan",
      "Job Description",
      "Job Specification",
    ],
  },
  {
    group: "Organisasi & Tatalaksana – Budaya & Monitoring",
    items: [
      "Perencanaan Budaya",
      "Implementasi Budaya",
      "Evaluasi Budaya",
      "Monitoring Organisasi",
      "Evaluasi Prosedur Kerja",
    ],
  },
  {
    group: "Rumah Tangga & Umum – Konsumsi & Fasilitas",
    items: [
      "Konsumsi Perusahaan",
      "Gedung Kantor",
      "Rumah Dinas",
      "Kendaraan Dinas",
      "Peralatan Kantor",
      "Mesin & Alat Berat",
      "Peralatan Listrik",
      "ATK",
    ],
  },
  {
    group: "Rumah Tangga & Umum – Pengamanan & Seragam",
    items: [
      "Pengamanan Lingkungan",
      "Pengamanan Aset",
      "Pengamanan Peralatan",
      "Koordinasi Aparat",
      "Seragam Dinas",
    ],
  },
  {
    group: "Rumah Tangga & Umum – Aset & Penghapusan",
    items: [
      "Bukti Kepemilikan Aset",
      "Sewa Menyewa",
      "Bangun Serah Guna",
      "Bangun Guna Serah",
      "Ruislag",
      "Penghapusan Aset Tetap",
      "Penghapusan Inventaris",
      "Penghapusan Aset Tak Berwujud",
      "Berita Acara Penghapusan",
    ],
  },
  {
    group: "Pengadaan – Proses Lelang",
    items: [
      "Pengumuman Pengadaan",
      "Pendaftaran Lelang",
      "Evaluasi Lelang",
      "Aanwijzing",
      "Dokumen Penawaran",
      "Konfirmasi Penawaran",
      "Evaluasi Penawaran",
      "Pengumuman Hasil",
      "Dokumen Keuangan",
      "Evaluasi Keuangan",
      "Negosiasi",
      "Usulan Pemenang",
      "Pengumuman Pemenang",
      "Penetapan Pemenang",
      "Sanggahan",
      "Kontrak Kerja",
      "Distribusi Kontrak",
    ],
  },
  {
    group: "Pengadaan – Data Rekanan",
    items: [
      "Data Rekanan",
    ],
  },
  {
    group: "Diklat – Kurikulum & Modul",
    items: [
      "Kurikulum Diklat",
      "Modul Diklat",
      "Panduan Fasilitator",
      "Rekomendasi Penyelenggaraan Diklat",
    ],
  },
  {
    group: "Diklat – Magang & Penelitian",
    items: [
      "Magang Mahasiswa",
      "Penelitian",
    ],
  },
  {
    group: "Diklat – Sistem Informasi",
    items: [
      "Data Lembaga Diklat",
      "Data Prasarana Diklat",
      "Data Sarana Diklat",
      "Data Pengelola Diklat",
      "Data Penyelenggara Diklat",
      "Data Narasumber",
      "Data Program Diklat",
    ],
  },
  {
    group: "Diklat – Perencanaan & Pelaksanaan",
    items: [
      "Rencana Tahunan Diklat",
      "Surat Perintah Diklat",
      "Surat Penunjukan Penyelenggara",
      "Buku Panduan Diklat",
      "Laporan Penyelenggaraan Diklat",
    ],
  },
  {
    group: "Teknologi Informasi – Strategis & Arsitektur",
    items: [
      "Master Plan Sistem Informasi",
      "Arsitektur Sistem Informasi",
      "Arsitektur Aplikasi",
      "Arsitektur Infrastruktur",
    ],
  },
  {
    group: "Teknologi Informasi – Implementasi & Migrasi",
    items: [
      "Implementasi Sistem Informasi",
      "Implementasi Aplikasi",
      "Implementasi Infrastruktur",
      "Migrasi Sistem & Data",
    ],
  },
  {
    group: "Teknologi Informasi – Pengembangan Sistem",
    items: [
      "Inisiasi Pengembangan SI",
      "Perencanaan & Analisis SI",
      "Desain Sistem Informasi",
      "Pembangunan (Development)",
      "Testing / Uji Coba",
    ],
  },
  {
    group: "Teknologi Informasi – Pengelolaan & Monitoring",
    items: [
      "Kelangsungan Layanan SI",
      "Keamanan Sistem Informasi",
      "Pengelolaan Layanan User",
      "Formulir Data",
      "Daftar Petugas Perekaman",
      "Jadwal Pelaksanaan",
      "Laporan Hasil Perekaman Data",
      "Monitoring Sistem Informasi",
    ],
  },
  {
    group: "Pengawasan – Program & Audit Internal",
    items: [
      "Program Kerja Audit",
      "Surat Perintah Audit",
      "SPPD Audit",
      "KKA Terpadu",
      "Bukti Temuan LHA Terpadu",
      "Berita Acara Pemeriksaan",
      "LHA + Rekomendasi",
    ],
  },
  {
    group: "Pengawasan – Audit Investigasi Internal",
    items: [
      "Surat Permintaan Audit",
      "Surat Perintah",
      "SPPD",
      "KKA Investigasi",
      "Bukti Temuan LHA Investigasi",
      "Berita Acara",
      "LHA + Rekomendasi",
    ],
  },
  {
    group: "Pengawasan – Audit Anak Perusahaan",
    items: [
      "Surat Permintaan Audit",
      "Surat Perintah",
      "SPPD",
      "KKA Anak Perusahaan",
      "Bukti Temuan LHA Anak Perusahaan",
      "Berita Acara",
      "LHA + Rekomendasi",
    ],
  },
  {
    group: "Pengawasan – Audit Eksternal",
    items: [
      "Surat Tugas",
      "LHA + Rekomendasi",
      "Surat Tugas",
      "LHA + Rekomendasi",
      "Surat Tugas Investigasi",
      "LHA Investigasi + Rekomendasi",
      "Surat Tugas Kepatuhan",
      "LHA Kepatuhan + Rekomendasi",
    ],
  },
  {
    group: "Pengawasan – Monitoring & Pelaporan",
    items: [
      "LHA Indikasi Penyimpangan Nasional",
      "Manajemen Persuratan Audit",
      "Monitoring Tindak Lanjut",
      "Pelaporan Pelanggaran (WBS)",
    ],
  },
  {
    group: "Manajemen Integrasi – Strategi & Masterplan",
    items: [
      "Kajian Masterplan",
      "Laporan Konsultan",
      "Lembar Kerja Masterplan",
      "Undangan Program Kerja",
      "Berita Acara Program Kerja",
      "Surat Penyampaian Program",
      "Laporan Pelaksanaan Program",
      "Lembar Kerja VCP",
      "Laporan Pelaksanaan VCP",
    ],
  },
  {
    group: "Manajemen Integrasi – Implementasi & Monitoring",
    items: [
      "Undangan Asistensi Project",
      "Laporan Asistensi Project",
      "Action Item Direksi",
      "Forum Integrasi",
      "Pelindo Forum",
      "Internal Progress Meeting",
      "Executive Committee Meeting",
      "Reporting Progress BOD",
      "Reporting Progress Kementerian",
    ],
  },
  {
    group: "Teknik – Perencanaan",
    items: [
      "TOR / Kerangka Acuan Kerja",
      "RAB",
      "Kriteria Evaluasi Teknis",
      "Gambar Teknis",
      "RKS",
    ],
  },
  {
    group: "Teknik – Pelaksanaan & Pengendalian Proyek",
    items: [
      "Dokumen Pelaksanaan Proyek",
      "Dokumen Pasca Proyek",
      "Laporan Realisasi Investasi",
    ],
  },
  {
    group: "K3L – Sistem Manajemen",
    items: [
      "K3Komitmen Direksi",
      "K3Buku Panduan ISO",
      "K3Analisis SWOT",
      "K3Stakeholder List",
      "K3Sasaran Sistem Manajemen",
      "K3Sosialisasi",
      "K3Implementasi Sistem",
      "K3Audit Internal",
      "K3Rapat Tinjauan Manajemen",
      "K3Audit Eksternal",
    ],
  },
  {
    group: "K3L – Kesehatan & Keselamatan",
    items: [
      "K3Laporan Kecelakaan Kerja",
      "K3Tanggap Darurat",
      "K3Inspeksi",
      "K3Job Safety Analysis",
      "K3Medical Checkup & Training",
    ],
  },
  {
    group: "K3L – Lingkungan",
    items: [
      "K3AMDAL",
      "K3UKL-UPL",
      "K3SPPL",
      "K3Izin Lingkungan",
      "K3Persetujuan Teknis",
      "K3SLO",
      "K3Neraca Limbah",
      "K3Monitoring Lingkungan",
      "K3PROPER",
      "K3Audit KLHK",
    ],
  },
  {
    group: "Strategis – Perencanaan",
    items: [
      "STVisi Misi Perusahaan",
      "STProses Bisnis",
      "STRJPP",
      "STRencana Kerja Manajemen",
      "STRencana Induk Pelabuhan",
      "STPengendalian Kinerja Perusahaan",
    ],
  },
  {
    group: "Substantif – Inovasi & Kajian",
    items: [
      "SK Komite Inovasi",
      "Usulan Inovasi Unit Kerja",
      "Daftar Usulan Inovasi",
      "Penilaian Inovasi",
      "Penetapan Pemenang Inovasi",
      "Kajian Kepelabuhanan",
    ],
  },
  {
    group: "Substantif – Pengembangan Bisnis & Konsesi",
    items: [
      "Analisis Segmen Usaha",
      "Laporan Kajian Segmen",
      "Usulan Proyek Konsesi",
      "Kajian Kelayakan Konsesi",
      "Perjanjian Konsesi",
    ],
  },
  {
    group: "Substantif – Komersial & Pemasaran",
    items: [
      "Survei Kepuasan Pelanggan",
      "Customer Visit",
      "Key Account Management",
      "Tarif Jasa Kepelabuhanan",
      "Proposal Kerja Sama",
      "Evaluasi Kerja Sama",
      "Persetujuan Kerja Sama",
      "Penolakan Kerja Sama",
      "Monitoring Pemasaran",
    ],
  },
  {
    group: "Substantif – Logistik & Aneka Usaha",
    items: [
      "Pengusahaan Air",
      "Pengusahaan Listrik",
      "Pas Terminal Penumpang",
      "Pas Pelabuhan Orang",
      "Pas Pelabuhan Kendaraan",
      "Repair/Docking Kapal",
      "Produksi Kontribusi",
      "Pas Depo",
      "Forwarding",
    ],
  },
  {
    group: "Substantif – Evaluasi & Layanan Pelanggan",
    items: [
      "Evaluasi Pemasaran",
      "Keluhan Pelanggan",
      "Monitoring Pelanggan",
      "Layanan Nonteknis",
      "Call Center",
      "Apresiasi Pelanggan",
      "Database Pelanggan",
    ],
  },
  {
    group: "Substantif – Anak Perusahaan & RUPS",
    items: [
      "Arahan Pemegang Saham",
      "Kajian Kelayakan Anak Perusahaan",
      "Business Performance Review",
      "Risalah RUPS Tahunan",
      "Risalah RUPS Luar Biasa",
    ],
  },
  {
    group: "Operasional – Pelayanan Jasa Kapal",
    items: [
      "Jasa Labuh",
      "Jasa Pemanduan",
      "Jasa Penundaan",
      "Jasa Tambat",
      "Jasa Kepil",
      "Jasa Alur Pelayaran",
    ],
  },
  {
    group: "Operasional – Pelayanan Barang",
    items: [
      "Barang Umum",
      "Peti Kemas",
      "Curah Cair/Gas",
      "Curah Kering",
      "Terminal Kendaraan",
      "Bongkar Muat Terapung",
      "Dry Port",
      "Ro-Ro",
    ],
  },
  {
    group: "Operasional – Penumpang & Distribusi",
    items: [
      "Pas Penumpang",
      "Barang Bawaan",
      "Peti Kemas Konsolidasi",
      "Non Peti Kemas",
    ],
  },
  {
    group: "Operasional – PELRA & Pengusahaan Alat",
    items: [
      "Paket",
      "Non Paket",
      "Alat Angkat",
      "Alat Angkut",
      "Alat Bantu",
      "Alat Apung",
    ],
  },
];

const kodeunitOptions = [
  "B1 - Bagian Komersial dan Kepatuhan Bisnis",
  "B2 - Bagian Teknik dan Operasi ",
  "B3 - Bagian Keuangan & SDM",
];

const kondisiOptions = [
  "Baik", "Rusak", "Rusak Ringan"
];

const tingkatPerkembanganOptions = [
  "Asli",
  "Copy",
];

const lokasiOptions = [
  "SDM, Umum, KBL",
  "Hukum, Klaim, Asuransi",
  "Keuangan",
  "Kearsipan",
  "Komersial",
  "Sub HSSE",
  "Teknik",
  "Rendal",
  "Properti",
  "Perencanaan, Pengendalian & Operasi Umum",
  "MR, PI & PM",
];

const keteranganOptions = [
  "Kertas",
  "Digital/PO",
  "Buku",
];

// ── DATA KLASIFIKASI BERTINGKAT ─────────────────────────────
const KLASIFIKASI_DATA = {
  "2010-2016": [
   // FP - Pelayanan Fasilitas Darat
  { kode: "FP.001", label: "Pemakaian/persewaan fasilitas alat-alat bongkar/muat" },
  { kode: "FP.002", label: "Pemakaian/persewaan fasilitas dermaga/air minum/listrik/Dersus" },
  { kode: "FP.003", label: "Pemakaian/persewaan fasilitas pergudangan/lapangan penumpukan" },
  { kode: "FP.004", label: "Pembinaan operasional" },
  { kode: "FP.005", label: "Pembinaan tarif pelabuhan" },
  { kode: "FP.006", label: "Pas pelabuhan" },
  { kode: "FP.007", label: "Izin masuk daerah kerja pelabuhan/berusaha di pelabuhan" },
  { kode: "FP.008", label: "Barang-barang berbahaya" },
  { kode: "FP.009", label: "Status pelabuhan" },
  { kode: "FP.010", label: "Permasalahan pelabuhan cabang" },
  { kode: "FP.011", label: "Pemakaian/persewaan fasilitas-fasilitas tambatan/buoy/gudang/dermaga" },
  { kode: "FP.012", label: "Batas perairan pelabuhan" },
  { kode: "FP.013", label: "Pemakaian/persewaan fasilitas alat-alat apung/alat-alat bongkar muat" },
  { kode: "FP.014", label: "Perkembangan usaha fasilitas perairan" },
  { kode: "FP.015", label: "Perijinan hak pakai tanah" },
  { kode: "FP.016", label: "Perijinan hak pakai gudang, listrik, air, jalan, bangunan" },
  { kode: "FP.017", label: "Pembinaan/pengaturan fasilitas penunjang" },
  { kode: "FP.018", label: "Batas wilayah pelabuhan" },
  { kode: "FP.019", label: "Penanggulangan bahaya kebakaran" },

  // UT - Usaha Terminal
  { kode: "UT.020", label: "Klaim ganti rugi kerusakan fasilitas pelabuhan akibat ditabrak kapal" },
  { kode: "UT.021", label: "Tolak ukur dan target" },
  { kode: "UT.022", label: "Program kerja/perencanaan" },
  { kode: "UT.023", label: "Pengendalian pembinaan" },
  { kode: "UT.024", label: "Tarip dan Klaim" },
  { kode: "UT.025", label: "Analisa dan evaluasi" },
  { kode: "UT.026", label: "Evaluasi kinerja operasional untuk kegiatan terminal non petikemas" },
  { kode: "UT.027", label: "Sistem Prosedur Pengoperasian" },
  { kode: "UT.028", label: "Pelaksanaan kegiatan penumpukan barang angkutan laut bandar" },
  { kode: "UT.029", label: "Kegiatan pelabuhan/pemeliharaan alat-alat bongkar muat/mutasi alat-alat B/M dan Conveyor" },

  // UC - Jasa Container (Petikemas)
  { kode: "UC.030", label: "Pergudangan/Penumpukan" },
  { kode: "UC.031", label: "C.F.S" },
  { kode: "UC.032", label: "C.Y" },
  { kode: "UC.033", label: "Alat B/M Container" },
  { kode: "UC.034", label: "Pembinaan operasional (Petikemas)" },
  { kode: "UC.035", label: "Perencanaan, Pembangunan dan pengawasan jasa terminal petikemas" },
  { kode: "UC.036", label: "Pengawasan jasa terminal petikemas" },
  { kode: "UC.037", label: "Stuffing dan Unstuffing" },
  { kode: "UC.038", label: "Evaluasi kinerja operasional untuk kegiatan terminal petikemas" },

  // PD - Operasi Pemanduan/Docking
  { kode: "PD.040", label: "Permasalahan kapal-kapal kepanduan" },
  { kode: "PD.041", label: "Pelabuhan wajib pandu" },
  { kode: "PD.042", label: "Penggunaan dan keadaan armada pemanduan dan stasiun pandu" },
  { kode: "PD.043", label: "Penggandengan kapal" },
  { kode: "PD.044", label: "Perbaikan/docking armada pemanduan" },
  { kode: "PD.045", label: "Mutasi kapal-kapal kepanduan/Alat Telekomunikasi" },
  { kode: "PD.046", label: "Radio pantai/kapal" },
  { kode: "PD.047", label: "Pengembangan/pengaturan stasiun radio" },
  { kode: "PD.048", label: "Perizinan telekomunikasi" },

  // LO - Laporan-laporan
  { kode: "LO.050", label: "Laporan realisasi produksi pendapatan pelabuhan" },
  { kode: "LO.051", label: "Laporan data kegiatan operasional pelabuhan/B/M dan angkutan laut" },
  { kode: "LO.052", label: "Laporan pemakaian tambatan" },
  { kode: "LO.053", label: "Laporan pemakaian perairan/alat-alat apung" },
  { kode: "LO.054", label: "Laporan bongkar muat" },
  { kode: "LO.055", label: "Laporan pengadaan/pemeliharaan sarana bantu navigasi" },
  { kode: "LO.056", label: "Laporan bulanan produksi/pendapatan kepanduan, kegiatan pemanduan dan stasiun pandu" },
  { kode: "LO.057", label: "Laporan bulanan produksi/pendapatan usaha terminal, kegiatan usaha terminal" },
  { kode: "LO.058", label: "Laporan simopel" },
  { kode: "LO.059", label: "Laporan key performance indicator" },

  // PR - Penelitian
  { kode: "PR.060", label: "Rencana penelitian" },
  { kode: "PR.061", label: "Tanah/metereologi/klimatologi" },
  { kode: "PR.062", label: "Hidrografi/topografi" },
  { kode: "PR.063", label: "Lingkungan/bahan bangunan/jalan dan jembatan" },
  { kode: "PR.064", label: "Penyampaian data teknis permintaan data tentang studi" },
  { kode: "PR.065", label: "Lalu-lintas angkutan laut/bongkar muat barang dan hewan di pelabuhan" },
  { kode: "PR.066", label: "Situasi/kondisi fasilitas pelabuhan" },
  { kode: "PR.067", label: "Perambuan dan telekomunikasi" },
  { kode: "PR.068", label: "Kantor/tempat kerja dan gudang rumah/tempat tinggal/asrama sekolah, rumah sakit" },
  { kode: "PR.069", label: "Tempat olah raga/ibadah" },

  // Survey dan Proyek
  { kode: "PR.070", label: "Surat perintah survey" },
  { kode: "PR.071", label: "Laporan hasil survey" },
  { kode: "PR.072", label: "Permintaan data survey" },
  { kode: "PR.073", label: "Permintaan data revisi" },
  { kode: "PR.074", label: "Permintaan bantuan asing/loan" },
  { kode: "PR.075", label: "Permintaan data tentang hasil proyek" },
  { kode: "PR.076", label: "Pengangkatan Pempro, Bendpro/Team proyek" },
  { kode: "PR.077", label: "Laporan proyek-proyek" },
  { kode: "PR.078", label: "BA Serah terima hasil proyek" },
  { kode: "PR.079", label: "Pelaksanaan survey lingkungan pelabuhan" },
    // PR - Survey dan Proyek
  { kode: "PR.071", label: "Laporan hasil survey" },
  { kode: "PR.072", label: "Permintaan data survey" },
  { kode: "PR.073", label: "Permintaan data revisi" },
  { kode: "PR.074", label: "Permintaan bantuan asing/loan" },
  { kode: "PR.075", label: "Permintaan data tentang hasil proyek" },
  { kode: "PR.076", label: "Pengangkatan Pempro, Bendpro/Team proyek" },
  { kode: "PR.077", label: "Laporan proyek-proyek" },
  { kode: "PR.078", label: "BA Serah terima hasil proyek" },
  { kode: "PR.079", label: "Pelaksanaan survey lingkungan pelabuhan" },

  // PR - Perhitungan Desain
  { kode: "PR.080", label: "Rencana pembangunan fasilitas pelabuhan" },
  { kode: "PR.081", label: "Jasa rencana perhitungan desain" },
  { kode: "PR.082", label: "Keadaan dermaga, riol dan selokan jalan dan jembatan" },
  { kode: "PR.083", label: "Keadaan kantor/tempat kerja/rumah dinas, asrama, rumah sakit" },
  { kode: "PR.084", label: "Keadaan tempat olahraga/tempat ibadah" },
  { kode: "PR.085", label: "Keadaan lapangan penumpukan/gudang" },
  { kode: "PR.086", label: "Keadaan kendaraan dinas" },
  { kode: "PR.087", label: "Rencana pengadaan perbekalan/Investasi" },
  { kode: "PR.088", label: "Rencana pemeliharaan fasilitas peralatan pelabuhan" },
  { kode: "PR.089", label: "Permintaan dokumen pelelangan" },

  // PR - Pembiayaan Proyek/Teknik
  { kode: "PR.090", label: "Perkenalan/rekanan Teknik" },
  { kode: "PR.091", label: "Permintaan data harga satuan bahan/barang" },
  { kode: "PR.092", label: "Permintaan harga satuan upah" },
  { kode: "PR.093", label: "Pengajuan TOR" },
  { kode: "PR.094", label: "Pengumuman pelelangan/berita acara" },
  { kode: "PR.095", label: "Aanwijzing" },
  { kode: "PR.096", label: "Perhitungan volume" },
  { kode: "PR.097", label: "Pembukaan penawaran" },
  { kode: "PR.098", label: "Evaluasi hasil pelelangan" },
  { kode: "PR.099", label: "Persetujuan pemenang pelelangan" },

  // PR - Pelaksanaan Pekerjaan Pemborongan/Asuransi
  { kode: "PR.100", label: "Pengumuman pemenang pelelangan/pelaksanaan pelelangan" },
  { kode: "PR.101", label: "Penunjukan Pemborong" },
  { kode: "PR.102", label: "Surat perintah kerja/surat perjanjian" },
  { kode: "PR.103", label: "Jaminan penawaran pekerjaan/penagihan" },
  { kode: "PR.104", label: "Pelimpahan pelaksanaan pekerjaan kepada cabang/unit" },
  { kode: "PR.105", label: "Asuransi kebakaran (gedung/gudang)" },
  { kode: "PR.106", label: "Claim asuransi gedung/barang/kapal" },
  { kode: "PR.107", label: "Asuransi kendaraan bermotor" },

  // TS - Pemeliharaan
  { kode: "TS.110", label: "Pemeliharaan konstruksi, alur dan kolam" },
  { kode: "TS.111", label: "Perbaikan dermaga, riol, selokan jalan dan jembatan" },
  { kode: "TS.112", label: "Perbaikan gudang, lapangan penumpukan" },
  { kode: "TS.113", label: "Perbaikan tempat olahraga/tempat ibadah" },
  { kode: "TS.114", label: "Perbaikan penahan gelombang/talud, tanah" },
  { kode: "TS.115", label: "Perbaikan gedung kantor/tempat kerja, rumah sakit, rumah dinas, asrama" },

  // TS - Pelaksanaan Pekerjaan Konstruksi
  { kode: "TS.120", label: "Rencana pelaksanaan pekerjaan konstruksi" },
  { kode: "TS.121", label: "Bangunan dermaga/jalan jembatan riol dan selokan" },
  { kode: "TS.122", label: "Bangunan lapangan penumpukan gudang" },
  { kode: "TS.123", label: "Bangunan kantor/tempat kerja, asrama, rumah dinas, rumah sakit" },
  { kode: "TS.124", label: "Bangunan tempat olahraga/tempat ibadah" },
  { kode: "TS.125", label: "Bangunan talud/penahan gelombang tanah" },
  { kode: "TS.126", label: "Sistem dan prosedur pelaksanaan konstruksi sipil" },
  { kode: "TS.127", label: "Analisa dan evaluasi kegiatan pelaksanaan konstruksi sipil" },
  { kode: "TS.128", label: "Gambar bangunan/pelabuhan, instalasi air, listrik, telepon" },

  // TS - Pemeliharaan Alur dan Kolam
  { kode: "TS.130", label: "Rencana pemeliharaan alur dan kolam" },
  { kode: "TS.131", label: "Analisa dan evaluasi kegiatan pemeliharaan alur dan kolam" },
  { kode: "TS.132", label: "Pekerjaan bawah air" },
  { kode: "TS.133", label: "Pengangkatan kerangka kapal" },
  { kode: "TS.134", label: "Pengangkatan barang-barang mengganggu alur dan kolam" },
  { kode: "TS.135", label: "Polusi di laut" },
  { kode: "TS.136", label: "Pemberian kerja keruk" },
  { kode: "TS.137", label: "Permintaan kerja keruk" },
  { kode: "TS.138", label: "Pelaksanaan Predrege Sounding" },
  { kode: "TS.139", label: "Penyelaman ilmiah dan peledakan" },

  // TS - Pembersihan Alur dan Kolam
  { kode: "TS.140", label: "Pemasangan kabel/pipa bawah air" },
  { kode: "TS.141", label: "Penyimpanan sisa industri lepas pantai" },
  { kode: "TS.142", label: "Menghilangkan gosong-gosong" },
  { kode: "TS.143", label: "Penyelamatan kapal yang kandas" },
  { kode: "TS.144", label: "Perintah kerja keruk" },
  { kode: "TS.145", label: "Peta kedalaman alur dan kolam pelabuhan" },
  { kode: "TS.146", label: "Pembersihan alur/kolam pelabuhan" },

  // TM - Alat Bongkar Muat
  { kode: "TM.150", label: "Rencana pengadaan alat bongkar muat" },
  { kode: "TM.151", label: "Rencana SISPRO alat bongkar muat" },
  { kode: "TM.152", label: "Analisa dan evaluasi kegiatan alat bongkar muat" },
  { kode: "TM.153", label: "Pengadaan alat bongkar muat" },
  { kode: "TM.154", label: "Pembinaan pengadaan alat bongkar muat" },
  { kode: "TM.155", label: "Persetujuan perbaikan kendaraan operasional" },

  // TM - Alat Petikemas
  { kode: "TM.160", label: "Rencana pengadaan alat petikemas" },
  { kode: "TM.161", label: "Pembinaan pengadaan alat petikemas" },
  { kode: "TM.162", label: "Gantry Crane/Container Crane" },
  { kode: "TM.163", label: "Transtainer" },
  { kode: "TM.164", label: "Top Loader" },
  { kode: "TM.165", label: "Trailer/Mobile Crane" },
  { kode: "TM.166", label: "Head Truck/Chassis" },
    { kode: "TM.167", label: "Penyusunan rencana sistem dan prosedur pengadaan dan pengelolaan teknis alat petikemas" },
    { kode: "TM.168", label: "Analisa dan evaluasi kegiatan pengadaan dan pengelolaan teknis alat petikemas" },
    { kode: "TM.170", label: "Penyusunan rencana pengadaan instalasi listrik dan air" },
    { kode: "TM.171", label: "Penyusunan sistem dan prosedur pengadaan dan pengelolaan teknis instalasi listrik dan air" },
    { kode: "TM.172", label: "Analisa dan evaluasi kegiatan pengadaan dan pengelolaan teknis instalasi listrik dan air" },
    { kode: "TM.173", label: "Pembinaan dan pengadaan dan pengelolaan teknis instalasi listrik dan air" },
    { kode: "TM.174", label: "Permintaan jaring-jaring instalasi air" },
    { kode: "TM.175", label: "Permintaan jaring-jaring instalasi listrik" },
    { kode: "TM.176", label: "Konservasi energi" },
    { kode: "TM.177", label: "Perbaikan instalasi listrik" },
    { kode: "TM.178", label: "Perbaikan instalasi air" },
    { kode: "TM.180", label: "Penyusunan rencana pengadaan alat-alat apung" },
    { kode: "TM.181", label: "Sistem dan prosedur alat-alat apung" },
    { kode: "TM.182", label: "Pengelolaan teknis alat-alat apung" },
    { kode: "TM.183", label: "Analisa dan evaluasi kegiatan pengadaan dan pengelolaan teknis alat-alat apung" },
    { kode: "TM.184", label: "Pemeliharaan dan perbaikan alat apung" },
    // LT - Laporan Teknik
  { kode: "LT.190", label: "Penyusunan rencana pelaksanaan di lapangan" },
  { kode: "LT.191", label: "Laporan pelaksanaan pekerjaan di lapangan" },
  { kode: "LT.192", label: "Laporan harian" },
  { kode: "LT.193", label: "Laporan mingguan" },
  { kode: "LT.194", label: "Laporan bulanan" },
  { kode: "LT.195", label: "Laporan pemakaian bahan" },
  { kode: "LT.196", label: "Laporan survey" },

  // KU - Anggaran Belanja
  { kode: "KU.200", label: "Evaluasi laporan realisasi RKAP/RKM" },
  { kode: "KU.201", label: "Penyusunan RAB/RKM" },
  { kode: "KU.202", label: "Anggaran belanja rutin untuk pegawai" },
  { kode: "KU.203", label: "Gaji/upah, tunjangan jabatan, SKPP" },
  { kode: "KU.204", label: "Anggaran belanja rutin untuk non pegawai" },
  { kode: "KU.205", label: "Barang, pemeliharaan, perjalanan dinas" },
  { kode: "KU.206", label: "Pengesahan APB" },
  { kode: "KU.207", label: "Revisi APB" },
  { kode: "KU.208", label: "Pelaksanaan APB" },
  { kode: "KU.209", label: "Saham/Obligasi/Bursa efek/Valuta asing" },

  // KU - Anggaran Bangunan/Investasi
  { kode: "KU.210", label: "Rencana penggunaan anggaran/Investasi" },
  { kode: "KU.211", label: "Rencana Jangka Panjang Perusahaan" },
  { kode: "KU.212", label: "Non Rencana Jangka Panjang Perusahaan" },
  { kode: "KU.213", label: "Pendapatan pelabuhan/Anggaran pengerukan" },
  { kode: "KU.214", label: "Penyusunan data investasi" },
  { kode: "KU.215", label: "Penggunaan sisa anggaran investasi" },

  // KU - Anggaran Pendapatan/Penerimaan
  { kode: "KU.220", label: "Jasa air dan listrik" },
  { kode: "KU.221", label: "Jasa pelabuhan" },
  { kode: "KU.222", label: "Jasa telephone" },
  { kode: "KU.223", label: "Sewa tanah/PN Pelabuhan" },
  { kode: "KU.224", label: "Sewa gedung kantor" },

  // KU - Anggaran Tambahan
  { kode: "KU.230", label: "Usulan anggaran belanja tambahan rutin" },
  { kode: "KU.231", label: "Tambahan rutin untuk pegawai" },
  { kode: "KU.232", label: "Tambahan rutin untuk non pegawai" },
  { kode: "KU.233", label: "Tambahan untuk kemitraan bina lingkungan" },

  // KU - Pertanggungjawaban Keuangan
  { kode: "KU.250", label: "Pertanggung jawaban kas kecil" },
  { kode: "KU.251", label: "Anggaran rutin (UUDP/SPJR/LKKR)" },
  { kode: "KU.252", label: "Anggaran pembangunan" },
  { kode: "KU.253", label: "Serah terima hasil proyek/uang muka" },
  { kode: "KU.254", label: "Serah terima hasil proyek" },

  // KU - Hutang Piutang
  { kode: "KU.260", label: "Piutang perusahaan" },
  { kode: "KU.261", label: "Hutang perusahaan" },
  { kode: "KU.262", label: "Transfer/pemindah bukuan/Dropping/Transaksi" },
  { kode: "KU.263", label: "Pajak fiscal/Bea masuk/LC" },
  { kode: "KU.264", label: "Posisi kas bank" },
  { kode: "KU.265", label: "Jaminan bank/Bank asuransi/Asuransi" },
  { kode: "KU.266", label: "Tunggakan listrik/biaya operasional" },
  { kode: "KU.267", label: "Claim penyelesaian hutang piutang" },
  { kode: "KU.268", label: "Pajak pribadi/MPO/MPS/LP2P" },
  { kode: "KU.269", label: "Tagihan pelabuhan" },

  // KU - Uang Muka & Biaya
  { kode: "KU.270", label: "Uang muka kas kecil/kebutuhan kantor/pensiun" },
  { kode: "KU.271", label: "Biaya perjalanan dinas/perhitungan rampung" },
  { kode: "KU.272", label: "Pemeliharaan gedung, rumah" },
  { kode: "KU.273", label: "Kendaraan" },

  // KU - Pemeriksaan Keuangan
  { kode: "KU.280", label: "Pemeriksaan auditor" },
  { kode: "KU.281", label: "Anggaran rutin/pembangunan" },
  { kode: "KU.282", label: "Pemeriksaan kas oleh atasan langsung" },
  { kode: "KU.283", label: "Kasus penyimpangan keuangan" },
  { kode: "KU.284", label: "Pemeriksaan BEPEKA" },
  { kode: "KU.285", label: "Pemeriksaan BPKP" },
  { kode: "KU.286", label: "Pemeriksaan IRJEN" },
  { kode: "KU.287", label: "Pemeriksaan SPI" },
  { kode: "KU.288", label: "Tindak lanjut hasil pemeriksaan" },

  // KU - Tunjangan
  { kode: "KU.290", label: "Bonus/THR/Gaji ke-13" },
  { kode: "KU.291", label: "Lauk pauk/pangan" },
  { kode: "KU.292", label: "Honorarium khusus" },
  { kode: "KU.293", label: "Tunjangan jabatan struktural/fungsional" },
  { kode: "KU.294", label: "Insentif/uang premi" },
  { kode: "KU.295", label: "Uang saku" },
  { kode: "KU.296", label: "Uang lembur" },
  { kode: "KU.297", label: "Dana sosial/upah buruh" },
  { kode: "KU.298", label: "Tunjangan isteri/suami, anak, calon pegawai" },

  // KU - Peraturan Tarif
  { kode: "KU.300", label: "Jasa bongkar muat" },
  { kode: "KU.301", label: "Jasa pelabuhan" },
  { kode: "KU.302", label: "Uang labuh" },
  { kode: "KU.303", label: "Uang tambat/dermaga" },
  { kode: "KU.304", label: "Uang tunda/Kepil" },
  { kode: "KU.305", label: "Uang pandu" },
  { kode: "KU.306", label: "Angkutan laut/darat/udara" },
  { kode: "KU.307", label: "Penyesuaian harga satuan" },
  { kode: "KU.308", label: "Uang Air" },

  // KU - Laporan Keuangan
  { kode: "KU.310", label: "SIM Keuangan" },
  { kode: "KU.311", label: "Perusahaan" },
  { kode: "KU.312", label: "Neraca rugi laba" },
  { kode: "KU.313", label: "Cash flow" },
  { kode: "KU.314", label: "Pembangunan" },
  { kode: "KU.315", label: "Laporan analisa" },
  { kode: "KU.316", label: "Laporan pemeriksaan" },
  { kode: "KU.317", label: "Laporan realisasi APB" },

  // KU - Pengangkatan Bendaharawan
  { kode: "KU.320", label: "Juru Bayar/Kasir" },
  { kode: "KU.321", label: "Bendaharawan rutin" },
  { kode: "KU.322", label: "Bendaharawan material" },
  { kode: "KU.323", label: "Pembuat daftar gaji" },
  { kode: "KU.324", label: "Pemegang buku kas umum" },
   // UM - Tata Usaha
  { kode: "UM.325", label: "Pemegang buku kas umum" },
  { kode: "UM.326", label: "Surat menyurat/Administrasi perkantoran" },
  { kode: "UM.327", label: "Surat pengantar ucapan terima kasih" },
  { kode: "UM.328", label: "Undangan" },
  { kode: "UM.329", label: "Cap, stempel dinas, slide, foto, film/buku" },
  { kode: "UM.330", label: "Pengetikan/penggandaan, stensil, copy" },
  { kode: "UM.331", label: "Rekaman, cetakan, penjilidan/daftar agen" },
  { kode: "UM.332", label: "Hak menandatangani surat-surat, rapat-rapat/notulen/risalah rapat" },
  { kode: "UM.333", label: "Pengarsipan" },
  { kode: "UM.334", label: "Blanko, ralat, koreksi, pendataan" },
  { kode: "UM.335", label: "Panitia/Tim" },
  { kode: "UM.336", label: "Berita acara" },

  // UM - Perjalanan Dinas/Pindah
  { kode: "UM.340", label: "Surat perintah jalan/pindah" },
  { kode: "UM.341", label: "Tiket" },
  { kode: "UM.342", label: "Paspor" },
  { kode: "UM.343", label: "Exit permit" },
  { kode: "UM.344", label: "Visa" },

  // UM - Perumahan/Rumah Tangga
  { kode: "UM.350", label: "Surat izin penempatan" },
  { kode: "UM.351", label: "Penggunaan ruangan/halaman/pekerjaan" },
  { kode: "UM.352", label: "Guarantee Letter/penginapan/akomodasi hotel" },
  { kode: "UM.353", label: "Kebersihan/tanaman/penataan" },
  { kode: "UM.354", label: "Sambungan listrik, air minum, telepon" },
  { kode: "UM.355", label: "Keamanan/ketertiban/protokol" },
  { kode: "UM.356", label: "Ruang gudang/perkantoran/peralatannya" },

  // UM - Kendaraan Dinas
  { kode: "UM.360", label: "Kendaraan dinas jabatan" },
  { kode: "UM.361", label: "Kendaraan dinas operasional" },
  { kode: "UM.362", label: "Kendaraan pegawai" },
  { kode: "UM.363", label: "Sewa kendaraan dinas" },
  { kode: "UM.364", label: "Laporan kerusakan kendaraan dinas" },
  { kode: "UM.365", label: "Perbaikan/pemeliharaan kendaraan dinas" },
  { kode: "UM.366", label: "SIM/STNK/BPKB" },
  { kode: "UM.367", label: "Peminjaman kendaraan dinas" },

  // KJ - Kesejahteraan Umum
  { kode: "KJ.370", label: "Koperasi pegawai" },
  { kode: "KJ.371", label: "Sumbangan/donatur" },
  { kode: "KJ.372", label: "Kerohanian/bimbingan mental" },
  { kode: "KJ.373", label: "Pakaian dinas/atribut" },
  { kode: "KJ.374", label: "Rekreasi" },
  { kode: "KJ.375", label: "Dana kesejahteraan" },
  { kode: "KJ.376", label: "Sumbangan kematian/uang duka" },

  // KJ - Olahraga
  { kode: "KJ.380", label: "Pembinaan BAPORKES" },
  { kode: "KJ.381", label: "Pertandingan/perlombaan" },
  { kode: "KJ.382", label: "Peralatan olahraga/kesenian" },
  { kode: "KJ.383", label: "Piala/hadiah perlombaan" },

  // SL - Statistik dan Laporan
  { kode: "SL.390", label: "Laporan perkembangan usaha pelabuhan" },
  { kode: "SL.391", label: "Laporan statistik/data pelabuhan" },
  { kode: "SL.392", label: "Dokumentasi dan statistik" },

  // KP - Tata Usaha Kepegawaian
  { kode: "KP.400", label: "Lamaran/test penerimaan/test kerja/koreksi perbaikan" },
  { kode: "KP.401", label: "Penempatan sebagai calon pegawai" },
  { kode: "KP.402", label: "Perubahan keluarga" },
  { kode: "KP.403", label: "Cuti/dispensasi" },
  { kode: "KP.404", label: "Absensi/jam kerja" },
  { kode: "KP.405", label: "Penghasilan pegawai/KGB" },
  { kode: "KP.406", label: "File pribadi" },
  { kode: "KP.407", label: "Koreksi/perbaikan SK" },
  { kode: "KP.408", label: "Permintaan Karpeg/NIP/Karis/Karsu" },
  { kode: "KP.409", label: "Surat keterangan" },

  // KP - Pengangkatan & Kepangkatan
  { kode: "KP.411", label: "Pengangkatan menjadi calon pegawai/pegawai penuh" },
  { kode: "KP.412", label: "Kenaikan pangkat/kenaikan kelas jabatan" },
  { kode: "KP.413", label: "Pengangkatan dalam jabatan/SPPT" },
  { kode: "KP.414", label: "SK pernyataan menduduki jabatan" },
  { kode: "KP.415", label: "Berita acara serah terima jabatan" },
  { kode: "KP.416", label: "Penundaan/penurunan pangkat" },

  // KP - Pengembangan Pegawai
  { kode: "KP.420", label: "Formasi dan Bezetting/Replacement SDM" },
  { kode: "KP.421", label: "Nominatif dan data pegawai/tenaga pandu/simpers" },
  { kode: "KP.422", label: "Daftar riwayat hidup" },
  { kode: "KP.423", label: "Peninjauan masa kerja" },
  { kode: "KP.424", label: "Ikatan dinas/Pembibitan/SDM pemikir" },
  { kode: "KP.425", label: "Penilaian karya pegawai (PKP)" },
  { kode: "KP.426", label: "Daftar nama pejabat/peta kepegawaian" },
  { kode: "KP.427", label: "Impasssing" },
  { kode: "KP.428", label: "Mutasi/penjenjangan" },
  { kode: "KP.429", label: "Pengadaan pegawai" },

  // KP - Pembinaan/Pengaturan Pegawai
  { kode: "KP.430", label: "JUKLAK pengadaan pegawai" },
  { kode: "KP.431", label: "JUKLAK pengangkatan" },
  { kode: "KP.432", label: "JUKLAK mutasi pindah" },
  { kode: "KP.433", label: "Pembinaan pegawai" },
  { kode: "KP.434", label: "Pembinaan operasional tenaga pandu" },

  // KP - Pemberhentian/Pensiun Pegawai
  { kode: "KP.440", label: "Pemberhentian atas permintaan sendiri" },
  { kode: "KP.441", label: "Pemberhentian karena mencapai batas pensiun" },
  { kode: "KP.442", label: "Pemberhentian karena penyederhanaan organisasi" },
  { kode: "KP.443", label: "Pemberhentian karena tidak cakap jasmani/rohani" },
  { kode: "KP.444", label: "Pemberhentian karena meninggalkan tugas" },
  { kode: "KP.445", label: "Pemberhentian karena meninggal dunia" },
  { kode: "KP.446", label: "Pemberhentian karena pelanggaran pidana" },

  // KP - Penertiban Pegawai
  { kode: "KP.450", label: "Skorsing" },
    // UM - Tata Usaha
  { kode: "UM.325", label: "Pemegang buku kas umum" },
  { kode: "UM.326", label: "Surat menyurat/Administrasi perkantoran" },
  { kode: "UM.327", label: "Surat pengantar ucapan terima kasih" },
  { kode: "UM.328", label: "Undangan" },
  { kode: "UM.329", label: "Cap, stempel dinas, slide, foto, film/buku" },
  { kode: "UM.330", label: "Pengetikan/penggandaan, stensil, copy" },
  { kode: "UM.331", label: "Rekaman, cetakan, penjilidan/daftar agen" },
  { kode: "UM.332", label: "Hak menandatangani surat-surat, rapat-rapat/notulen/risalah rapat" },
  { kode: "UM.333", label: "Pengarsipan" },
  { kode: "UM.334", label: "Blanko, ralat, koreksi, pendataan" },
  { kode: "UM.335", label: "Panitia/Tim" },
  { kode: "UM.336", label: "Berita acara" },

  // UM - Perjalanan Dinas/Pindah
  { kode: "UM.340", label: "Surat perintah jalan/pindah" },
  { kode: "UM.341", label: "Tiket" },
  { kode: "UM.342", label: "Paspor" },
  { kode: "UM.343", label: "Exit permit" },
  { kode: "UM.344", label: "Visa" },

  // UM - Perumahan/Rumah Tangga
  { kode: "UM.350", label: "Surat izin penempatan" },
  { kode: "UM.351", label: "Penggunaan ruangan/halaman/pekerjaan" },
  { kode: "UM.352", label: "Guarantee Letter/penginapan/akomodasi hotel" },
  { kode: "UM.353", label: "Kebersihan/tanaman/penataan" },
  { kode: "UM.354", label: "Sambungan listrik, air minum, telepon" },
  { kode: "UM.355", label: "Keamanan/ketertiban/protokol" },
  { kode: "UM.356", label: "Ruang gudang/perkantoran/peralatannya" },

  // UM - Kendaraan Dinas
  { kode: "UM.360", label: "Kendaraan dinas jabatan" },
  { kode: "UM.361", label: "Kendaraan dinas operasional" },
  { kode: "UM.362", label: "Kendaraan pegawai" },
  { kode: "UM.363", label: "Sewa kendaraan dinas" },
  { kode: "UM.364", label: "Laporan kerusakan kendaraan dinas" },
  { kode: "UM.365", label: "Perbaikan/pemeliharaan kendaraan dinas" },
  { kode: "UM.366", label: "SIM/STNK/BPKB" },
  { kode: "UM.367", label: "Peminjaman kendaraan dinas" },

  // KJ - Kesejahteraan Umum
  { kode: "KJ.370", label: "Koperasi pegawai" },
  { kode: "KJ.371", label: "Sumbangan/donatur" },
  { kode: "KJ.372", label: "Kerohanian/bimbingan mental" },
  { kode: "KJ.373", label: "Pakaian dinas/atribut" },
  { kode: "KJ.374", label: "Rekreasi" },
  { kode: "KJ.375", label: "Dana kesejahteraan" },
  { kode: "KJ.376", label: "Sumbangan kematian/uang duka" },

  // KJ - Olahraga
  { kode: "KJ.380", label: "Pembinaan BAPORKES" },
  { kode: "KJ.381", label: "Pertandingan/perlombaan" },
  { kode: "KJ.382", label: "Peralatan olahraga/kesenian" },
  { kode: "KJ.383", label: "Piala/hadiah perlombaan" },

  // SL - Statistik dan Laporan
  { kode: "SL.390", label: "Laporan perkembangan usaha pelabuhan" },
  { kode: "SL.391", label: "Laporan statistik/data pelabuhan" },
  { kode: "SL.392", label: "Dokumentasi dan statistik" },

  // KP - Tata Usaha Kepegawaian
  { kode: "KP.400", label: "Lamaran/test penerimaan/test kerja/koreksi perbaikan" },
  { kode: "KP.401", label: "Penempatan sebagai calon pegawai" },
  { kode: "KP.402", label: "Perubahan keluarga" },
  { kode: "KP.403", label: "Cuti/dispensasi" },
  { kode: "KP.404", label: "Absensi/jam kerja" },
  { kode: "KP.405", label: "Penghasilan pegawai/KGB" },
  { kode: "KP.406", label: "File pribadi" },
  { kode: "KP.407", label: "Koreksi/perbaikan SK" },
  { kode: "KP.408", label: "Permintaan Karpeg/NIP/Karis/Karsu" },
  { kode: "KP.409", label: "Surat keterangan" },

  // KP - Pengangkatan & Kepangkatan
  { kode: "KP.411", label: "Pengangkatan menjadi calon pegawai/pegawai penuh" },
  { kode: "KP.412", label: "Kenaikan pangkat/kenaikan kelas jabatan" },
  { kode: "KP.413", label: "Pengangkatan dalam jabatan/SPPT" },
  { kode: "KP.414", label: "SK pernyataan menduduki jabatan" },
  { kode: "KP.415", label: "Berita acara serah terima jabatan" },
  { kode: "KP.416", label: "Penundaan/penurunan pangkat" },

  // KP - Pengembangan Pegawai
  { kode: "KP.420", label: "Formasi dan Bezetting/Replacement SDM" },
  { kode: "KP.421", label: "Nominatif dan data pegawai/tenaga pandu/simpers" },
  { kode: "KP.422", label: "Daftar riwayat hidup" },
  { kode: "KP.423", label: "Peninjauan masa kerja" },
  { kode: "KP.424", label: "Ikatan dinas/Pembibitan/SDM pemikir" },
  { kode: "KP.425", label: "Penilaian karya pegawai (PKP)" },
  { kode: "KP.426", label: "Daftar nama pejabat/peta kepegawaian" },
  { kode: "KP.427", label: "Impasssing" },
  { kode: "KP.428", label: "Mutasi/penjenjangan" },
  { kode: "KP.429", label: "Pengadaan pegawai" },

  // KP - Pembinaan/Pengaturan Pegawai
  { kode: "KP.430", label: "JUKLAK pengadaan pegawai" },
  { kode: "KP.431", label: "JUKLAK pengangkatan" },
  { kode: "KP.432", label: "JUKLAK mutasi pindah" },
  { kode: "KP.433", label: "Pembinaan pegawai" },
  { kode: "KP.434", label: "Pembinaan operasional tenaga pandu" },

  // KP - Pemberhentian/Pensiun Pegawai
  { kode: "KP.440", label: "Pemberhentian atas permintaan sendiri" },
  { kode: "KP.441", label: "Pemberhentian karena mencapai batas pensiun" },
  { kode: "KP.442", label: "Pemberhentian karena penyederhanaan organisasi" },
  { kode: "KP.443", label: "Pemberhentian karena tidak cakap jasmani/rohani" },
  { kode: "KP.444", label: "Pemberhentian karena meninggalkan tugas" },
  { kode: "KP.445", label: "Pemberhentian karena meninggal dunia" },
  { kode: "KP.446", label: "Pemberhentian karena pelanggaran pidana" },

  // KP - Penertiban Pegawai
  { kode: "KP.450", label: "Skorsing" },
   { kode: "KP.451", label: "Pemberhentian dengan uang tunggu" },
  { kode: "KP.452", label: "Bebas tugas/MPP" },
  { kode: "KP.453", label: "Pemberhentian tidak dengan hormat" },
  { kode: "KP.454", label: "Panggilan/teguran/peringatan" },
  { kode: "KP.455", label: "Pemberhentian karena penyelewengan" },
  { kode: "KP.456", label: "Hukuman terhadap pelanggaran disiplin pegawai/hukuman jabatan" },
  { kode: "KP.457", label: "Pemberhentian dengan uang lepas" },
  { kode: "KP.458", label: "Pemberhentian karena keputusan pengadilan" },

  // KP - Kasus Kepegawaian
  { kode: "KP.460", label: "Penggunaan Narkoba/Psikoterapi" },
  { kode: "KP.461", label: "Pelanggaran disiplin pegawai" },
  { kode: "KP.462", label: "Pembocoran rahasia negara" },
  { kode: "KP.463", label: "Pungutan liar" },
  { kode: "KP.464", label: "Perceraian" },

  // KP - Asuransi Kepegawaian
  { kode: "KP.470", label: "TASPEN" },
  { kode: "KP.471", label: "ASKES" },
  { kode: "KP.472", label: "Asuransi kematian" },
  { kode: "KP.473", label: "Klaim asuransi pegawai" },
  { kode: "KP.474", label: "Tabungan hari tua (Multiguna dan Bank)" },
  { kode: "KP.475", label: "JAMSOSTEK" },

  // DL - Pendidikan dan Latihan
  { kode: "DL.490", label: "Persyaratan dan fasilitas pendidikan" },
  { kode: "DL.491", label: "Kurikulum dan silabus" },
  { kode: "DL.492", label: "Perguruan maritim swasta" },
  { kode: "DL.493", label: "Penerimaan dan pendaftaran" },
  { kode: "DL.494", label: "Surat ijin belajar" },
  { kode: "DL.495", label: "JUKLAK pendidikan" },
  { kode: "DL.496", label: "Staf pengajar" },

  // DL - Penyelenggaraan Pendidikan
  { kode: "DL.500", label: "Kursus SESPA dan lain-lain" },
  { kode: "DL.501", label: "Latihan penjenjangan" },
  { kode: "DL.502", label: "SPM, P3B, LAN dan lain-lain" },
  { kode: "DL.503", label: "Tugas/ijin belajar dalam negeri" },
  { kode: "DL.504", label: "Proyek laut (PROLA) dan proyek darat (PRODA)" },
  { kode: "DL.505", label: "Penataran up grading/Penyuluhan/Lokakarya/Seminar/Workshop" },
  { kode: "DL.506", label: "Orientasi" },
  { kode: "DL.507", label: "Laporan hasil pendidikan" },

  // DL - Ujian
  { kode: "DL.510", label: "Penyelenggaraan ujian" },
  { kode: "DL.511", label: "Ujian dinas/penyesuaian ijazah" },
  { kode: "DL.512", label: "Ujian ANT/ATT/ATTD" },
  { kode: "DL.513", label: "Ujian negara" },
  { kode: "DL.514", label: "Skripsi/Paper" },

  // DL - Ijazah dan Sertifikat
  { kode: "DL.520", label: "Pengiriman laporan ijazah" },
  { kode: "DL.521", label: "Pemalsuan ijazah/ijazah palsu" },
  { kode: "DL.522", label: "Pemeriksaan ijazah" },
  { kode: "DL.523", label: "Ijazah-ijazah dinas" },
  { kode: "DL.524", label: "STTB" },
  { kode: "DL.525", label: "Laporan pendidikan" },

  // DL - Pendidikan Luar Negeri
  { kode: "DL.530", label: "Tugas belajar di luar negeri" },
  { kode: "DL.531", label: "Pertukaran mahasiswa" },
  { kode: "DL.532", label: "Beasiswa/bantuan pendidikan negara asing" },
  { kode: "DL.533", label: "Kolombo Plan dan skema bantuan lain" },
  { kode: "DL.534", label: "Reference Letter untuk sekolah luar negeri" },

  // KS - Pelayanan Kesehatan
  { kode: "KS.540", label: "Opname Kepegawaian" },
  { kode: "KS.541", label: "Restitusi" },
  { kode: "KS.542", label: "Buku Berobat" },
  { kode: "KS.543", label: "Surat Keterangan Dokter (S.K.D)" },
  { kode: "KS.544", label: "Laporan Kegiatan Rumah Sakit" },
  { kode: "KS.545", label: "Keselamatan dan Kesehatan Kerja (K3)" },

  // HK - Hukum
  { kode: "HK.550", label: "Pertimbangan pelaksanaan hukum" },
  { kode: "HK.551", label: "Perselisihan/persengketaan" },
  { kode: "HK.552", label: "Perlindungan hukum/keadilan" },
  { kode: "HK.553", label: "Barang tak bertuan" },
  { kode: "HK.554", label: "Keputusan pengadilan negeri" },
  { kode: "HK.555", label: "Surat kuasa" },
  { kode: "HK.556", label: "Permintaan bantuan ahli hukum" },

  // HK - Perundang-undangan
  { kode: "HK.560", label: "Undang-undang" },
  { kode: "HK.561", label: "KEPPRES" },
  { kode: "HK.562", label: "PERPEM" },
  { kode: "HK.563", label: "INPRES" },
  { kode: "HK.564", label: "Hukum internasional" },
  { kode: "HK.565", label: "Perizinan/Akte Notaris" },
  { kode: "HK.566", label: "Perjanjian/Kontrak/Addendum" },
  { kode: "HK.567", label: "Pengesahan badan hukum" },
  { kode: "HK.568", label: "Obligasi/surat berharga/surat khusus perusahaan" },
  { kode: "HK.569", label: "Go Public/ISO 9002/jaminan mutu" },

  // HK - Konvensi & Peraturan Pelayaran
  { kode: "HK.570", label: "I.M.D (IMDO)" },
  { kode: "HK.571", label: "ESCAP" },
  { kode: "HK.572", label: "UNCTAD" },
  { kode: "HK.573", label: "Hukum laut internasional" },
  { kode: "HK.574", label: "Maritime Law (Conventional)" },
  { kode: "HK.575", label: "Masalah Bilateral/Regional" },
  { kode: "HK.576", label: "Pidana" },
  { kode: "HK.577", label: "Perdata" },
  { kode: "HK.578", label: "Perselisihan perburuhan" },

  // HM - Media & Kehumasan
  { kode: "HM.580", label: "P.B.B" },
  { kode: "HM.581", label: "IMO" },
  { kode: "HM.582", label: "ASEAN/APAA/ACFTA" },
  { kode: "HM.583", label: "IF/PH" },
  { kode: "HM.584", label: "IFPCD" },
  { kode: "HM.585", label: "World Bank/JICAA" },
  { kode: "HM.586", label: "Ambassador/Dubes Asing/Atase Asing" },
  { kode: "HM.587", label: "Atase Perhubungan/Dubes RI" },
  { kode: "HM.590", label: "Proses penurunan anak kapal dan pengajuan ke Mahkamah Pelayaran" },
    { kode: "HK.591", label: "Peradilan terhadap kejahatan/pelanggaran" },
  { kode: "HK.592", label: "Keputusan peradilan" },
  { kode: "HK.593", label: "Peradilan terhadap penyelundupan" },
  { kode: "HK.594", label: "Sengketa ganti rugi" },
  { kode: "HK.595", label: "Barang bukti/kadaluarsa" },
  { kode: "HK.596", label: "Keputusan mahkamah pelayaran" },

  // HM - Kehumasan & Publikasi
  { kode: "HM.600", label: "Surat kabar, bulletin, majalah, brosur/clipping" },
  { kode: "HM.601", label: "Iklan, poster" },
  { kode: "HM.602", label: "Press Release, wawancara" },
  { kode: "HM.603", label: "Audio, visual, siaran radio/televisi dan pameran" },
  { kode: "HM.604", label: "Hearing dengan DPR/delegasi DPR/MPR" },
  { kode: "HM.605", label: "Pelantikan/upacara/protokoler" },
  { kode: "HM.606", label: "Perpustakaan" },
  { kode: "HM.607", label: "Pengarahan, ceramah" },
  { kode: "HM.608", label: "Pengumuman/pemberitahuan edaran" },
  { kode: "HM.609", label: "Kewartawanan" },
  { kode: "HM.610", label: "Peninjauan pejabat/tamu/kunjungan" },
  { kode: "HM.611", label: "Rapat/lawatan ke lembaga negara" },
  { kode: "HM.612", label: "Rapat/lawatan ke lembaga asing" },
  { kode: "HM.613", label: "Audiensi" },

  // PD - Pengadaan Barang
  { kode: "PD.620", label: "Permintaan pengadaan barang" },
  { kode: "PD.621", label: "Permintaan penawaran harga" },
  { kode: "PD.622", label: "Berita acara penjelasan" },
  { kode: "PD.623", label: "Evaluasi penawaran harga" },
  { kode: "PD.624", label: "Penunjukan pelaksanaan/SPK" },
  { kode: "PD.625", label: "Perjanjian/pesanan barang" },
  { kode: "PD.626", label: "Surat pengantar tagihan" },

  // PD - Persediaan Barang
  { kode: "PD.630", label: "Penerimaan barang" },
  { kode: "PD.631", label: "Penyimpanan" },
  { kode: "PD.632", label: "Pengeluaran/distribusi" },
  { kode: "PD.633", label: "Laporan keadaan persediaan" },
  { kode: "PD.634", label: "Pengiriman/expedisi" },

  // PD - Perbaikan & Pemeliharaan
  { kode: "PD.640", label: "Permintaan perbaikan" },
  { kode: "PD.641", label: "Pemeriksaan kondisi" },
  { kode: "PD.642", label: "Pemakaian bahan bakar" },

  // PD - Inventaris
  { kode: "PD.650", label: "Pengumpulan/penyerahan data inventaris" },
  { kode: "PD.651", label: "Penjelasan prosedur inventaris" },
  { kode: "PD.652", label: "Teguran" },
  { kode: "PD.653", label: "Komputer/EDI/pengadaan/pemeliharaan perangkat komputer" },

  // PD - Penghapusan
  { kode: "PD.660", label: "Prosedur penghapusan" },
  { kode: "PD.661", label: "Pengusulan" },
  { kode: "PD.662", label: "Penetapan harga dasar (floor price)" },
  { kode: "PD.663", label: "Persetujuan" },
  { kode: "PD.664", label: "Pelaksanaan pelelangan/pemusnahan" },
  { kode: "PD.665", label: "Pelelangan kendaraan dinas" },
  { kode: "PD.666", label: "Berita acara pemeriksaan" },

  // PR - Studi & Survey
  { kode: "PR.670", label: "Survey lalu-lintas angkutan penumpang/terminal" },
  { kode: "PR.671", label: "Survey bongkar muat barang/hewan di pelabuhan" },
  { kode: "PR.672", label: "Survey tata guna tanah di pelabuhan" },
  { kode: "PR.673", label: "Survey kondisi fasilitas pelabuhan/telekomunikasi" },
  { kode: "PR.674", label: "Survey kondisi tenaga kerja di pelabuhan" },
  { kode: "PR.675", label: "Survey masalah konsultan rekanan" },
  { kode: "PR.676", label: "Survey sistem/prosedur pelayanan jasa pelabuhan" },
  { kode: "PR.677", label: "Survey masalah tarif jasa pelabuhan" },
  { kode: "PR.678", label: "Survey kegiatan unit usaha" },
  { kode: "PR.679", label: "Survey fasilitas perkapalan/keamanan pelayaran" },

  // OT - Organisasi & Tata Laksana
  { kode: "OT.680", label: "Bidang kepelabuhanan" },
  { kode: "OT.681", label: "Bidang pengerukan alur pelayaran" },
  { kode: "OT.682", label: "Bidang unit usaha di pelabuhan" },
  { kode: "OT.683", label: "Unit keamanan di pelabuhan" },
  { kode: "OT.684", label: "Unit lalu-lintas angkutan laut" },
  { kode: "OT.685", label: "Perkapalan dan pelayaran" },
  { kode: "OT.686", label: "Unit navigasi/perambuan" },
  { kode: "OT.687", label: "Unit telekomunikasi pelayaran" },
  { kode: "OT.688", label: "Bidang pemasaran/promosi" },
  { kode: "OT.689", label: "Bidang pembinaan/pengembangan anak perusahaan" },
  { kode: "OT.690", label: "Struktur organisasi" },
  { kode: "OT.691", label: "Rencana struktur organisasi" },
  { kode: "OT.692", label: "Penetapan struktur organisasi" },
  { kode: "OT.693", label: "Uraian tugas unit kerja" },
  { kode: "OT.694", label: "Santiadji/pemilu" },
  { kode: "OT.695", label: "Perispindo" },
  { kode: "OT.696", label: "Penetapan prosedur kerja" },
  { kode: "OT.697", label: "Rencana kerja" },
  { kode: "OT.698", label: "Sarana kerja" },
  { kode: "OT.699", label: "Evaluasi kerja" },

  // PY - Usaha Pelayaran
  { kode: "PY.700", label: "Ijin usaha pelayaran" },
  { kode: "PY.701", label: "Ijin prinsip pembelian/penjualan kapal/sandar" },
  { kode: "PY.702", label: "Pembinaan usaha pelayaran/armada" },
  { kode: "PY.703", label: "Surat pengoperasian kapal RLS (SPP)" },
  { kode: "PY.704", label: "Surat Ijin Charter (SIC)" },
  { kode: "PY.705", label: "Surat Ijin Berlayar (SIB)" },
  { kode: "PY.706", label: "Dispensasi Syarat Bendera (DSB)" },
  { kode: "PY.707", label: "Surat Ijin Trayek (SIT)" },
  { kode: "PY.708", label: "Surat Keagenan Umum" },
  { kode: "PY.709", label: "Surat sub agen dalam negeri/luar negeri" },
  { kode: "PY.710", label: "Masalah trayek" },
  { kode: "PY.711", label: "Masalah pelayaran perintis/angkutan transmigrasi" },
  { kode: "PY.712", label: "Masalah umum" },
  { kode: "PY.713", label: "Dispensasi Syarat Bendera (DSB)" },
  { kode: "PY.714", label: "Masalah Conference"},
    { kode: "PY.715", label: "Eksport/Import" },
  { kode: "PY.716", label: "Angkutan haji/turis/penumpang" },
  { kode: "PY.717", label: "Rekomendasi" },

  // PY - Pelayaran Khusus / Lokal
  { kode: "PY.720", label: "Surat Ijin Charter (SIC)" },
  { kode: "PY.721", label: "Surat Ijin Berlayar (SIB)" },
  { kode: "PY.722", label: "Dispensasi Syarat Bendera (DSB)" },
  { kode: "PY.723", label: "Surat Keagenan Umum (SKU)" },
  { kode: "PY.724", label: "Surat sub agen" },
  { kode: "PY.725", label: "Masalah Log/Sawn Timber/Plywood" },
  { kode: "PY.726", label: "Ijin Usaha EMKL Umum/khusus/perdagangan" },
  { kode: "PY.727", label: "Ijin Usaha Pelayaran Lokal/rakyat/khusus" },
  { kode: "PY.728", label: "Ijin Stevedoring/Surveyor/angkutan bandar" },
  { kode: "PY.729", label: "Masalah EMKL/Forwarding/Pelayaran Lokal/Rakyat/Khusus" },

  // PY - Pengendalian Angkutan Laut
  { kode: "PY.730", label: "Masalah Angkutan 9 Bahan Pokok" },
  { kode: "PY.731", label: "Masalah Transhipment" },
  { kode: "PY.732", label: "Angkutan karantina hewan" },
  { kode: "PY.733", label: "Survey angkutan laut" },
  { kode: "PY.734", label: "Masalah kebijakan angkutan laut" },
  { kode: "PY.735", label: "Masalah keselamatan pelayaran" },
  { kode: "PY.736", label: "Masalah kepelabuhanan" },
  { kode: "PY.737", label: "Masalah kapal asing" },
  { kode: "PY.738", label: "Masalah pencharteran kapal" },
  { kode: "PY.739", label: "Masalah INSA/GAVEKSI/ATHUB" },
    // PY - Keselamatan Pelayaran / Sertifikat Kapal
  { kode: "PY.740", label: "Sertifikat konstruksi" },
  { kode: "PY.741", label: "Sertifikat kesempurnaan" },
  { kode: "PY.742", label: "Sertifikat radio dan telekomunikasi" },
  { kode: "PY.743", label: "Sertifikat lambung timbul" },
  { kode: "PY.744", label: "Sertifikat kapal khusus" },
  { kode: "PY.745", label: "Pas-pas kapal" },

  // PY - Kelaikan Kapal
  { kode: "PY.750", label: "Pengawasan bangunan baru/perombakan kapal" },
  { kode: "PY.751", label: "Penentuan garis muat/dispensasi garis muat" },
  { kode: "PY.752", label: "Penilikan stabilitas kapal" },
  { kode: "PY.753", label: "Penilikan alat bongkar muat" },
  { kode: "PY.754", label: "Penilaian/Rekomendasi teknis dalam rangka ijin pemasukan/pembelian kapal dari luar negeri" },

  // PY - Pengukuran/Pendaftaran Kapal
  { kode: "PY.760", label: "Pengukuran kapal" },
  { kode: "PY.761", label: "Persetujuan ganti bendera kapal" },
  { kode: "PY.762", label: "Pemberian Call Sign Kapal" },
  { kode: "PY.763", label: "Pendaftaran/balik nama kapal" },
  { kode: "PY.764", label: "Surat keterangan status hukum kapal" },
  { kode: "PY.765", label: "Rekomendasi ijin penjualan/pembelian" },
  { kode: "PY.766", label: "Surat keterangan penghapusan diri daftar kapal" },

  // PY - Kebandaran & Awak Kapal
  { kode: "PY.770", label: "Penyijilan awak kapal di kapal-kapal" },
  { kode: "PY.771", label: "Jurnal Kapal/Exibitum" },
  { kode: "PY.772", label: "Rekomendasi ijin kerja orang asing di kapal Indonesia" },
  { kode: "PY.773", label: "Pembuatan/penggantian buku pelaut" },

  // PY - Keselamatan Berlayar
  { kode: "PY.780", label: "Pengawasan keselamatan berlayar di laut dan pelabuhan" },
  { kode: "PY.781", label: "Dispensasi/pengawasan pemuatan barang berbahaya" },
  { kode: "PY.782", label: "Dispensasi penumpang dek/awak kapal" },

  // PY - Pencemaran di Lingkungan Laut
  { kode: "PY.790", label: "Pengaturan nasional/internasional" },
  { kode: "PY.791", label: "Kecelakaan pelayaran yang mengakibatkan pencemaran" },
  { kode: "PY.792", label: "Langkah pencegahan/penanggulangan pencemaran" },

  // NV - Perambuan dan Penerangan Pantai
  { kode: "NV.800", label: "Kelainan sarana bantu navigasi" },
  { kode: "NV.801", label: "Data inventaris" },
  { kode: "NV.802", label: "Pembangunan/rehabilitasi alat navigasi" },
  { kode: "NV.803", label: "Penghapusan sarana bantu navigasi" },
  { kode: "NV.804", label: "Perijinan sarana bantu navigasi" },
  { kode: "NV.805", label: "Pemeliharaan sarana bantu navigasi" },
  { kode: "NV.806", label: "Survey dan pengamatan laut" },

  // NV - Pembinaan Kapal-Kapal Negara
  { kode: "NV.810", label: "Penempatan kapal negara" },
  { kode: "NV.811", label: "Pengoperasian kapal negara" },
  { kode: "NV.812", label: "Kerusakan/kecelakaan/penghapusan kapal negara" },
  { kode: "NV.813", label: "Fasilitas tambat/operasi kapal negara" },
  { kode: "NV.814", label: "Pembinaan pelaut" },
  { kode: "NV.815", label: "Kesejahteraan pelaut" },
  { kode: "NV.816", label: "Pembangunan kapal negara" },
  { kode: "NV.817", label: "Operasional/pemeliharaan bengkel navigasi" },
  { kode: "NV.818", label: "Pembangunan bengkel navigasi" },
  { kode: "NV.819", label: "Data bengkel navigasi" },

  // NV - Keselamatan Kerja Maritim
  { kode: "NV.820", label: "Pelayaran" },
  { kode: "NV.821", label: "Pelayanan kesehatan di luar RS Pelabuhan" },
  { kode: "NV.822", label: "Pencegahan penyakit & K3" },
  { kode: "NV.823", label: "Pengobatan/perawatan di luar RS Pelabuhan" },
  { kode: "NV.824", label: "Kelompok tenaga fungsional" },

  // JM - Pembinaan Usaha Jasa Maritim
  { kode: "JM.830", label: "Ijin usaha galangan/perbengkelan kapal" },
  { kode: "JM.831", label: "Perbandingan harga kapal & jasa reparasi" },
  { kode: "JM.832", label: "Laporan galangan/bengkel kapal" },
  { kode: "JM.833", label: "Klasifikasi & standarisasi material kapal" },
  { kode: "JM.834", label: "Masalah ijin docking" },
  { kode: "JM.835", label: "Rencana docking" },
  { kode: "JM.836", label: "Teknologi kapal/pembuatan kapal/evaluasi desain" },

  // KL - Keamanan Pelabuhan
  { kode: "KL.840", label: "Pengamanan/ISPS Code" },
  { kode: "KL.841", label: "Informasi/data pengamanan" },
  { kode: "KL.842", label: "Penyidikan/pemeriksaan/penangkapan" },
  { kode: "KL.843", label: "Subversi/Infiltrasi/mata-mata" },
  { kode: "KL.844", label: "Bahaya laten/Screening" },
  { kode: "KL.845", label: "Senjata api" },
  { kode: "KL.846", label: "Perkelahian/pembunuhan/perampokan" },
  { kode: "KL.847", label: "Penyalahgunaan wewenang/penyelewengan/hutang" },
  { kode: "KL.848", label: "AMDAL/Limbah kapal" },

  // KL - Keamanan di Daerah Pelabuhan
  { kode: "KL.850", label: "Keamanan bongkar muat di kapal" },
  { kode: "KL.851", label: "Keamanan penumpukan barang di dermaga" },
  { kode: "KL.852", label: "Keamanan penumpukan barang di gudang" },
  { kode: "KL.853", label: "Ijin masuk daerah kerja pelabuhan" },
  { kode: "KL.854", label: "Ijin masuk daerah kerja bandar" },
  { kode: "KL.855", label: "Pengrusakan/pencurian di daerah pelabuhan" },
  { kode: "KL.856", label: "Bandar/alur kolam" },
  { kode: "KL.857", label: "Razia tiket/penumpang gelap" },
  { kode: "KL.858", label: "Keamanan barang berbahaya" },
  { kode: "KL.859", label: "Bahaya kebakaran di pelabuhan" },
  { kode: "KL.860", label: "Keamanan terminal penumpang/huru-hara" },

  // KL - Patroli Perairan
  { kode: "KL.861", label: "Operasi patroli armada KPLP" },
  { kode: "KL.862", label: "Kunjungan kapal perang asing" },
  { kode: "KL.863", label: "Patroli SBN" },
  { kode: "KL.864", label: "Patroli perencanaan perairan" },
  { kode: "KL.865", label: "Patroli pengawasan bawah air/Salvage" },
  { kode: "K.866", label: "Pencurian dan perampokan di atas kapal/di tengah laut/pantai" },
    { kode: "KL.867", label: "Pembajakan, perampokan dan kejahatan di laut/pantai" },
    { kode: "KL.868", label: "Pelanggaran daerah territorial RI dan pencurian ikan di laut" },
    { kode: "KL.869", label: "Operasi lalu-lintas angkutan laut" },
    { kode: "KL.870", label: "Laporan bantuan SAR" },
    { kode: "KL.871", label: "Operasi bantuan SAR di laut" },
    { kode: "KL.872", label: "Kecelakaan/musibah di laut" },
    { kode: "KL.873", label: "Pencarian, pertolongan penyelamatan penumpang dan barang-barang berharga dalam kecelakaan di laut" },
    { kode: "KL.874", label: "Keadaan darurat/kebakaran kapal" },
    { kode: "KL.875", label: "Kegiatan armada niaga dalam bantuan SAR di laut" },
    { kode: "KL.876", label: "Potensi bantuan SAR di darat dan di perairan" },
    { kode: "KL.877", label: "Penggunaan perlengkapan dan komunikasi untuk bantuan SAR di laut" },
    { kode: "KL.879", label: "Dukungan logistik untuk bantuan SAR di laut" },
    { kode: "KL.880", label: "Laporan-laporan bantuan SAR di laut" },
    { kode: "HM.01", label: "Penerangan" },
    { kode: "HM.01.01", label: "Wawancara" },
    { kode: "HM.01.02", label: "Press Release" },

    { kode: "HM.02", label: "Publikasi" },
    { kode: "HM.02.01", label: "Buletin" },
    { kode: "HM.02.02", label: "Majalah" },
    { kode: "HM.02.03", label: "Jurnal" },
    { kode: "HM.02.04", label: "Sponsorship" },

    { kode: "HM.03", label: "Hubungan Antar Lembaga" },
    { kode: "HM.03.01", label: "Lembaga Internasional" },
    { kode: "HM.03.02", label: "Lembaga Negara" },
    { kode: "HM.03.03", label: "Perusahaan Swasta dan Anak Perusahaan" },
    { kode: "HM.03.04", label: "Organisasi Masyarakat, Profesi/Bakohumas" },
    { kode: "HM.03.05", label: "Perguruan Tinggi/Sekolah" },
    { kode: "HM.03.06", label: "Media Massa" },

    { kode: "HM.04", label: "Keprotokolan" },
    { kode: "HM.04.01", label: "Kunjungan Dinas" },
    { kode: "HM.04.02", label: "Tamu Perusahaan" },
    { kode: "HM.04.03", label: "Acara Perusahaan" },
    { kode: "HM.04.04", label: "Cenderamata" },
    { kode: "HM.04.05", label: "Website" },

    { kode: "SK", label: "Kesekretariatan" },
    { kode: "SK.01", label: "Good Corporate Governance (GCG)" },
    { kode: "SK.01.01", label: "Awareness GCG" },
    { kode: "SK.01.02", label: "Asesmen GCG" },
    { kode: "SK.02", label: "Rapat Direksi" },
    { kode: "SK.03", label: "RUPS, AD/ART" },

    { kode: "MK", label: "Manajemen Kearsipan" },
    { kode: "MK.01", label: "Kearsipan" },
    { kode: "MK.02", label: "Monitoring dan Pembinaan Kearsipan" },

    { kode: "TL", label: "Tanggung Jawab Sosial dan Lingkungan" },
    { kode: "TL.01", label: "Administrasi TJSL" },
    { kode: "TL.02", label: "Program Pendanaan Usaha Mikro dan Kecil" },
    { kode: "TL.03", label: "Bantuan dan/atau Kegiatan Lainnya" },

    { kode: "HK", label: "Hukum" },
    { kode: "HK.01", label: "Peraturan Perusahaan" },
    { kode: "HK.02", label: "Administrasi Peraturan Perusahaan" },
    { kode: "HK.03", label: "Perkara Hukum" },

    { kode: "KP", label: "Kepegawaian" },
    { kode: "KP.01", label: "Rekrutmen" },
    { kode: "KP.01.01", label: "Kebijakan Rekrutmen" },
    { kode: "KP.01.02", label: "Rekrutmen Pro Hire" },
    { kode: "KP.01.03", label: "Rekrutmen Fresh Graduate" },
    { kode: "KP.01.04", label: "Rekrutmen CSR" },
    { kode: "KP.01.05", label: "Perjanjian Kerja Waktu Tertentu (PKWT)" },

    { kode: "KP.02", label: "Assessment" },
    { kode: "KP.02.01", label: "Assessment Center" },
    { kode: "KP.02.02", label: "Assessment Multirater" },

    { kode: "KP.03", label: "Talent Management" }
  ],

  "2017-2021": [
  // HM - Kehumasan
  { kode: "HM.01", label: "Penerangan" },
  { kode: "HM.01.01", label: "Wawancara" },
  { kode: "HM.01.02", label: "Press Release" },
  { kode: "HM.02", label: "Publikasi" },
  { kode: "HM.02.01", label: "Buletin" },
  { kode: "HM.02.02", label: "Majalah" },
  { kode: "HM.02.03", label: "Jurnal" },
  { kode: "HM.02.04", label: "Sponsorship" },
  { kode: "HM.03", label: "Hubungan Antar Lembaga" },
  { kode: "HM.03.01", label: "Lembaga Internasional" },
  { kode: "HM.03.02", label: "Lembaga Negara" },
  { kode: "HM.03.03", label: "Organisasi Masyarakat/Profesi/Badan Hukum" },
  { kode: "HM.03.05", label: "Perguruan Tinggi/Sekolah" },
  { kode: "HM.03.06", label: "Media Massa" },
  { kode: "HM.04", label: "Keprotokolan" },
  { kode: "HM.04.01", label: "Kunjungan Dinas" },
  { kode: "HM.04.02", label: "Acara Perusahaan" },
  { kode: "HM.04.04", label: "Perayaan Hari Besar/Upacara" },
  { kode: "HM.04.04", label: "Cenderamata" },
  { kode: "HM.04.05", label: "Website" },

  // SK - Kesekretariatan
  { kode: "SK.01", label: "Good Corporate Governance (GCG)" },
  { kode: "SK.01.01", label: "Awareness GCG" },
  { kode: "SK.01.02", label: "Assessment GCG" },
  { kode: "SK.02", label: "Rapat Direksi" },
  { kode: "SK.03", label: "RUPS, AD/ART" },

  // MP - Manajemen Perkantoran
  { kode: "MP.01", label: "Kearsipan" },
  { kode: "MP.02", label: "Monitoring dan Pembinaan Kearsipan" },

  // MB - Kemitraan & Bina Lingkungan
  { kode: "MB.01", label: "Kemitraan" },
  { kode: "MB.02", label: "Lingkungan" },

  // HK - Hukum
  { kode: "HK.01", label: "Peraturan Perundangan" },
  { kode: "HK.02", label: "Administrasi Hukum" },
  { kode: "HK.03", label: "Perkara Hukum" },

  // KP - Kepegawaian
  { kode: "KP.01", label: "Rekrutmen" },
  { kode: "KP.01.01", label: "Kebijakan Rekrutmen" },
  { kode: "KP.01.02", label: "Rekrutmen Pro Hire" },
  { kode: "KP.01.03", label: "Rekrutmen Fresh Graduate" },
  { kode: "KP.01.04", label: "Rekrutmen CSR" },
  { kode: "KP.01.05", label: "PKWTT" },
  { kode: "KP.02", label: "Assessment" },
  { kode: "KP.02.01", label: "Assessment Center" },
  { kode: "KP.02.02", label: "Assessment Multilateral" },
  { kode: "KP.03", label: "Talent Management" },
  { kode: "KP.05.02", label: "Kinerja Individu" },
  { kode: "KP.06.01", label: "Perencanaan Karir" },
  { kode: "KP.06.02", label: "Mutasi" },
  { kode: "KP.06.03", label: "Perencanaan Karir Individu" },
  { kode: "KP.07.01", label: "Kompensasi" },
  { kode: "KP.07.02", label: "Benefit" },
  { kode: "KP.08.01", label: "Hubungan Bipartit" },
  { kode: "KP.08.02", label: "Hubungan Tripartit" },
  { kode: "KP.08.03", label: "PKB" },
  { kode: "KP.09.01", label: "Survey Pekerja" },
  { kode: "KP.09.03", label: "Hubungan Pegawai" },
  { kode: "KP.10.01", label: "SK Pengangkatan" },
  { kode: "KP.10.02", label: "SK Mutasi" },
  { kode: "KP.10.03", label: "SK Replacement" },
  { kode: "KP.10.04", label: "SK Promosi" },
  { kode: "KP.10.05", label: "SK Demosi" },
  { kode: "KP.10.06", label: "SK PHK" },
  { kode: "KP.1102", label: "SK APASY/GHS" },
  { kode: "KP.1103", label: "SK Indisipliner" },
  { kode: "KP.20.01", label: "Surat Perintah" },
  { kode: "KP.20.02", label: "SPHD" },
  { kode: "KP.20.03", label: "Administrasi Perjalanan Dinas" },
  { kode: "KP.20.04", label: "Surat Keterangan" },
  { kode: "KP.21.01", label: "Data Pegawai" },
  { kode: "KP.21.02", label: "Kesehatan/Restitusi Pegawai" },
  { kode: "KP.21.03", label: "Cuti/Ijin Pegawai" },
  { kode: "KP.21.04", label: "Administrasi Cuti/Ijin" },
  { kode: "KP.21.05", label: "Bantuan Sosial" },
  { kode: "KP.21.06", label: "Pegawai Pensiun" },

  // DL - Pendidikan & Pelatihan
  { kode: "DL.01", label: "Manajemen Pelatihan" },
  { kode: "DL.02", label: "Pendidikan Dalam Negeri" },
  { kode: "DL.03", label: "Pendidikan Luar Negeri" },
  { kode: "DL.04", label: "Magang/In House Training" },

  // OT - Organisasi & Tatalaksana
  { kode: "OT.01.02", label: "Perencanaan SDM" },
  { kode: "OT.01.03", label: "Pengembangan Organisasi" },
  { kode: "OT.02.01", label: "Perencanaan Budaya Perusahaan" },
  { kode: "OT.02.02", label: "Implementasi Budaya Perusahaan" },
  { kode: "OT.02.03", label: "Komunikasi Budaya Perusahaan" },

  // RT - Rumah Tangga & Umum
  { kode: "RT.01.01", label: "Pemeliharaan Prasarana (Barang Tidak Bergerak)" },
  { kode: "RT.01.02", label: "Pemeliharaan Sarana (Barang Bergerak)" },
  { kode: "RT.01.03", label: "Pengelolaan Barang Habis Pakai" },
  { kode: "RT.01.04", label: "Keamanan dan Ketertiban" },
  { kode: "RT.01.05", label: "Pelaksanaan Dinas" },
  { kode: "RT.02", label: "Pelayanan Ruangan & Konsumsi" },

  // SI - Sistem Informasi
  { kode: "SI.01", label: "Pengelolaan Sistem Aplikasi" },
  { kode: "SI.02", label: "Pengelolaan Perangkat Komputer & Infrastruktur IT" },

  // KU - Keuangan
  { kode: "KU.01", label: "Akuntansi Manajemen (RKAP)" },
  { kode: "KU.01.01", label: "RKAP Capex" },
  { kode: "KU.01.02", label: "RKAP Opex" },
  { kode: "KU.01.03", label: "RKAP Konsolidasi" },
  { kode: "KU.01.04", label: "Pelaksanaan RKAP" },
   { kode: "KU.01.05", label: "Revisi RKAP Capex" },
  { kode: "KU.01.06", label: "Revisi RKAP Opex" },
  { kode: "KU.01.07", label: "Revisi RKAP Konsolidasi" },
  { kode: "KU.01.08", label: "Laporan Manajemen" },
  { kode: "KU.01.09", label: "Akuntansi Biaya" },
  { kode: "KU.02", label: "Pengelolaan Keuangan" },
  { kode: "KU.02.01", label: "Pengelolaan Dana" },
  { kode: "KU.02.02", label: "Hutang" },
  { kode: "KU.02.03", label: "Piutang" },
  { kode: "KU.02.04", label: "Laba/Rugi" },
  { kode: "KU.02.05", label: "Transaksi Lindung Nilai (Hedging)" },
  { kode: "KU.02.06", label: "Investasi" },
  { kode: "KU.02.07", label: "Pengelolaan Keuangan Lain-lain" },
  { kode: "KU.02.08", label: "Aset" },
  { kode: "KU.03", label: "Akuntansi Keuangan" },
  { kode: "KU.03.01", label: "Kebijakan Akuntansi" },
  { kode: "KU.03.02", label: "Aktiva Tetap" },
  { kode: "KU.04", label: "Laporan Keuangan" },
  { kode: "KU.04.01", label: "Laporan Keuangan Cabang & Anak Perusahaan" },
  { kode: "KU.04.02", label: "Laporan Keuangan Konsolidasi" },
  { kode: "KU.05", label: "Perpajakan" },
  { kode: "KU.05.01", label: "PPh" },
  { kode: "KU.05.02", label: "PPN" },
  { kode: "KU.05.03", label: "Pemeriksaan Pajak" },

  // PD - Pengadaan
  { kode: "PD.01", label: "Pengadaan Bidang Teknik" },
  { kode: "PD.02", label: "Pengadaan Bidang Non Teknik" },
  { kode: "PD.03", label: "Pengadaan Peralatan Kantor, ATK, Cetakan" },
  { kode: "PD.04", label: "Data Rekanan" },
  { kode: "PD.05", label: "Pelaksanaan Pekerjaan" },
  { kode: "PD.05.01", label: "Pelaksanaan Pekerjaan Teknik" },
  { kode: "PD.05.02", label: "Pelaksanaan Pekerjaan Non Teknik" },
  { kode: "PD.05.03", label: "Pelaksanaan Pekerjaan ATK & Cetakan" },

  // PR - Perencanaan
  { kode: "PR.01", label: "Master Plan" },
  { kode: "PR.02", label: "Rencana Induk Pelabuhan" },
  { kode: "PR.03", label: "Rencana Jangka Panjang Perusahaan" },
  { kode: "PR.04", label: "DIK-DIK Cabang & Kawasan Pelabuhan" },
  { kode: "PR.05", label: "RKM" },
  { kode: "PR.06", label: "Project Charter" },

  // PW - Pengawasan
  { kode: "PW.01", label: "Kebijakan Audit" },
  { kode: "PW.02", label: "Pelaksanaan Audit" },
  { kode: "PW.02.01", label: "Audit Rutin" },
  { kode: "PW.02.02", label: "Audit Khusus" },
  { kode: "PW.02.03", label: "Audit Eksternal" },
  { kode: "PW.03", label: "Monitoring Tindak Lanjut Audit" },
  { kode: "PW.04", label: "Pelaporan Pelanggaran" },
  { kode: "PW.05", label: "Manajemen Resiko" },
  { kode: "PW.05.01", label: "Manajemen Resiko Operasional" },
  { kode: "PW.05.02", label: "Manajemen Resiko Non Operasional" },
  { kode: "PW.06", label: "Kinerja Perusahaan" },
  { kode: "PW.06.01", label: "KPI/Indikator" },
  { kode: "PW.06.02", label: "Indikator" },
  { kode: "PW.06.03", label: "Sasaran Mutu" },

  // PU - Pengembangan Bisnis
  { kode: "PU.01", label: "Bisnis Plan" },
  { kode: "PU.01.01", label: "Bisnis Inti" },
  { kode: "PU.01.02", label: "Bisnis Pendukung" },
  { kode: "PU.02", label: "Kajian Bisnis" },
  { kode: "PU.02.01", label: "Kajian Bisnis Inti" },
  { kode: "PU.02.02", label: "Kajian Bisnis Pendukung" },
  { kode: "PU.03", label: "FS Bisnis" },
  { kode: "PU.03.01", label: "FS Bisnis Inti" },
  { kode: "PU.03.02", label: "FS Bisnis Pendukung" },
  { kode: "PU.04", label: "Property" },
  { kode: "PU.04.01", label: "Database Property" },
  { kode: "PU.04.02", label: "Penguasaan Property" },
  { kode: "PU.05", label: "Penarifan" },
  { kode: "PU.05.01", label: "Rencana Penarifan" },
  { kode: "PU.05.02", label: "Pelaksanaan Penarifan" },
  { kode: "PU.05.03", label: "Evaluasi Penarifan" },

  // KS - Kerja Sama
  { kode: "KS.01", label: "Perencanaan Kerja Sama" },
  { kode: "KS.02", label: "Pelaksanaan Kerja Sama" },
  { kode: "KS.03", label: "Evaluasi Kerja Sama" },

  // PS - Pemasaran
  { kode: "PS.01", label: "Perencanaan Pemasaran" },
  { kode: "PS.02", label: "Pelaksanaan Pemasaran" },
  { kode: "PS.03", label: "Evaluasi Pemasaran" },
  { kode: "PS.04", label: "Hubungan Pelanggan" },
  { kode: "PS.04.01", label: "Database Pelanggan" },
  { kode: "PS.04.02", label: "Penanganan Keluhan Pelanggan" },
  { kode: "PS.04.03", label: "Survey Kepuasan Pelanggan" },

  // PP - Pengelolaan Aset dan Properti Perusahaan
  { kode: "PP.01", label: "Pemanfaatan Aset" },
  { kode: "PP.02", label: "Pengamanan Aset" },
  { kode: "PP.03.01", label: "Pemeliharaan Aset Fasilitas" },
  { kode: "PP.03.02", label: "Pemeliharaan Aset Peralatan" },
  { kode: "PP.03.03", label: "Pemeliharaan Aset Perairan" },

  // PJ - Pelayanan Jasa Kepelabuhanan
  { kode: "PJ.01", label: "Pelayanan Jasa Kapal" },
  { kode: "PJ.02", label: "Pelayanan Peti Kemas" },
  { kode: "PJ.02.01", label: "Pelayanan Peti Kemas Internasional" },
  { kode: "PJ.02.02", label: "Pelayanan Peti Kemas Domestik" },
  { kode: "PJ.03", label: "Pelayanan Non Peti Kemas" },
  { kode: "PJ.03.01", label: "Pelayanan Non Peti Kemas General Cargo" },
  { kode: "PJ.03.02", label: "Pelayanan Non Peti Kemas Curah Kering" },
  { kode: "PJ.03.03", label: "Pelayanan Non Peti Kemas Curah Cair" },
  { kode: "PJ.03.04", label: "Pelayanan Jasa Alat" },
  { kode: "PJ.03.05", label: "Pelayanan Jasa Rupa-Rupa Usaha" },
  { kode: "PJ.03.06", label: "Pelayanan Jasa Kepelabuhanan Lainnya" },

  ],

  "2022-Sekarang": [
  // KP - SDM
  { kode: "KP.04", label: "Knowledge Management" },

  { kode: "KP.05", label: "Kinerja SDM" },
  { kode: "KP.05.01", label: "Manajemen Kinerja SDM" },
  { kode: "KP.05.02", label: "Kinerja Individu" },

  { kode: "KP.06", label: "Karir" },
  { kode: "KP.06.01", label: "Perancangan Karir" },
  { kode: "KP.06.02", label: "Mutasi" },
  { kode: "KP.06.03", label: "Perencanaan Karir Individu" },

  { kode: "KP.07", label: "Remunerasi (Penggajian)" },
  { kode: "KP.07.01", label: "Kompensasi" },
  { kode: "KP.07.02", label: "Benefit" },

  { kode: "KP.08", label: "Hubungan Industrial" },
  { kode: "KP.08.01", label: "Hubungan Bipartit" },
  { kode: "KP.08.02", label: "Hubungan Tripartit" },
  { kode: "KP.08.03", label: "PKB" },

  { kode: "KP.09", label: "Hubungan Pekerja" },
  { kode: "KP.09.01", label: "Survey Pekerja" },
  { kode: "KP.09.02", label: "Keagamaan, Olahraga, dan Kesenian" },

  { kode: "KP.10", label: "SK Pekerja" },
  { kode: "KP.10.01", label: "SK Pengangkatan" },
  { kode: "KP.10.02", label: "SK Mutasi" },
  { kode: "KP.10.03", label: "SK Replacement" },
  { kode: "KP.10.04", label: "SK Penghargaan" },
  { kode: "KP.10.05", label: "Administrasi SK Pekerja" },

  { kode: "KP.11", label: "SK Pemutusan Hubungan Kerja (PHK)" },
  { kode: "KP.11.01", label: "SK Usia Pensiun" },
  { kode: "KP.11.02", label: "SK APS/GHS/Meninggal Dunia" },
  { kode: "KP.11.03", label: "SK Indisipliner" },

  { kode: "KP.20", label: "Administrasi Pekerja" },
  { kode: "KP.20.01", label: "Surat Perintah" },
  { kode: "KP.20.02", label: "SPPD" },
  { kode: "KP.20.03", label: "Administrasi Perjalanan Dinas" },
  { kode: "KP.20.04", label: "Surat Keterangan" },

  { kode: "KP.21", label: "Transaksi Pekerja" },
  { kode: "KP.21.01", label: "Data Pekerja" },
  { kode: "KP.21.02", label: "Kesehatan/Restitusi Pekerja" },
  { kode: "KP.21.03", label: "Cuti/Izin Pekerja" },
  { kode: "KP.21.04", label: "Administrasi Cuti/Izin" },
  { kode: "KP.21.05", label: "Bantuan Sosial" },
  { kode: "KP.21.06", label: "Pekerja Pensiun" },

  // DL - Diklat
  { kode: "DL.01", label: "Manajemen Pelatihan" },
  { kode: "DL.02", label: "Pendidikan Dalam Negeri" },
  { kode: "DL.03", label: "Pendidikan Luar Negeri" },
  { kode: "DL.04", label: "Magang Pekerja" },

  // OT - Organisasi
  { kode: "OT.01", label: "Organisasi" },
  { kode: "OT.01.01", label: "Perancangan Sistem Kerja" },
  { kode: "OT.01.02", label: "Perencanaan SDM" },
  { kode: "OT.01.03", label: "Pengembangan Organisasi" },

  { kode: "OT.02", label: "Budaya Perusahaan" },
  { kode: "OT.02.01", label: "Perencanaan Budaya Perusahaan" },
  { kode: "OT.02.02", label: "Implementasi Budaya Perusahaan" },
  { kode: "OT.02.03", label: "Komunikasi & Evaluasi Budaya" },

  // RT
  { kode: "RT.01", label: "Pengelolaan/Pemeliharaan Sarana dan Prasarana" },

  // ORGANISASI & TATA LAKSANA
  { kode: "OT.01", label: "Organisasi" },
  { kode: "OT.01.01", label: "Perancangan Sistem Kerja" },
  { kode: "OT.01.02", label: "Perencanaan SDM" },
  { kode: "OT.01.03", label: "Pengembangan Organisasi" },

  { kode: "OT.02", label: "Budaya Perusahaan" },
  { kode: "OT.02.01", label: "Perencanaan Budaya Perusahaan" },
  { kode: "OT.02.02", label: "Implementasi Budaya Perusahaan" },
  { kode: "OT.02.03", label: "Komunikasi & Evaluasi Budaya Perusahaan" },

  // RUMAH TANGGA & UMUM
  { kode: "RT.01", label: "Pengelolaan/Pemeliharaan Sarana Prasarana" },
  { kode: "RT.01.01", label: "Barang Tidak Bergerak" },
  { kode: "RT.01.02", label: "Barang Bergerak" },
  { kode: "RT.01.03", label: "Barang Habis Pakai" },
  { kode: "RT.01.04", label: "Tenaga Keamanan & Kebersihan" },
  { kode: "RT.01.05", label: "Pakaian Dinas" },

  { kode: "RT.02", label: "Pelayanan Penyediaan Ruangan & Konsumsi" },

  // SISTEM INFORMASI
  { kode: "SI.01", label: "Pengelolaan Sistem Aplikasi" },
  { kode: "SI.02", label: "Pengelolaan Perangkat Komputer & Infrastruktur IT" },

  // KEUANGAN
  { kode: "KU.01", label: "Akuntansi Manajemen (RKAP)" },
  { kode: "KU.01.01", label: "Penyusunan RKAP" },
  { kode: "KU.01.02", label: "RKAP Operasi" },
  { kode: "KU.01.03", label: "RKAP Konsolidasi" },
  { kode: "KU.01.04", label: "Pelaksanaan RKAP" },
  { kode: "KU.01.05", label: "Revisi RKAP Investasi" },
  { kode: "KU.01.06", label: "Revisi RKAP Operasi" },
  { kode: "KU.01.07", label: "Revisi RKAP Konsolidasi" },
  { kode: "KU.01.08", label: "Laporan Manajemen" },
  { kode: "KU.01.09", label: "Akuntansi Biaya" },

  { kode: "KU.02", label: "Pengelolaan Keuangan" },
  { kode: "KU.02.01", label: "Pengelolaan Dana" },
  { kode: "KU.02.02", label: "Hutang" },
  { kode: "KU.02.03", label: "Piutang" },
  { kode: "KU.02.04", label: "Lalu Lintas Keuangan" },
  { kode: "KU.02.05", label: "Transaksi Lindung Nilai" },
  { kode: "KU.02.06", label: "Perbankan" },
  { kode: "KU.02.07", label: "Pengelolaan Keuangan Lainnya" },
  { kode: "KU.02.08", label: "Aset" },

  { kode: "KU.03", label: "Akuntansi Keuangan" },
  { kode: "KU.03.01", label: "Kebijakan Akuntansi" },
  { kode: "KU.03.02", label: "Aktiva Tetap" },

  { kode: "KU.04", label: "Laporan Keuangan" },
  { kode: "KU.04.01", label: "Laporan Regional/Cabang" },
  { kode: "KU.04.02", label: "Laporan Konsolidasi" },

  { kode: "KU.05", label: "Perpajakan" },
  { kode: "KU.05.01", label: "PPN" },
  { kode: "KU.05.02", label: "PPH" },
  { kode: "KU.05.03", label: "Pajak Lainnya" },
  { kode: "KU.05.04", label: "Pemeriksaan Pajak" },
  { kode: "KU.05.05", label: "Non Pajak (PNBP)" },

  // PENGADAAN
  { kode: "PD.01", label: "Pengadaan Barang Teknik" },
  { kode: "PD.02", label: "Pengadaan Non Teknik/Jasa" },
  { kode: "PD.03", label: "Pengadaan Peralatan Kantor" },
  { kode: "PD.04", label: "Data Rekanan" },
  { kode: "PD.05", label: "Pelaksanaan Pekerjaan" },
  { kode: "PD.05.01", label: "Pekerjaan Teknik" },
  { kode: "PD.05.02", label: "Pekerjaan Non Teknik" },
  { kode: "PD.05.03", label: "E-Catalogue" },

  // PERENCANAAN
  { kode: "PR.01", label: "Master Plan" },
  { kode: "PR.02", label: "Rencana Induk Pelabuhan (RIP)" },
  { kode: "PR.03", label: "RJPP / Corporate Planning" },
  { kode: "PR.04", label: "DLKr/DLKp" },
  { kode: "PR.05", label: "RKJM" },
  { kode: "PR.06", label: "Studi Bisnis & Desain" },
  { kode: "PR.07", label: "Studi Logistik Cost & Peran Pelabuhan" },

  // PENGAWASAN
  { kode: "PW.01", label: "Kebijakan Audit" },
  { kode: "PW.02", label: "Pelaksanaan Audit" },
  { kode: "PW.02.01", label: "Audit Rutin" },
  { kode: "PW.02.02", label: "Audit Khusus" },
  { kode: "PW.02.03", label: "Audit Eksternal" },
  { kode: "PW.03", label: "Monitoring Tindak Lanjut Audit" },
  { kode: "PW.04", label: "Pelaporan Pelanggaran" },

  { kode: "PW.05", label: "Manajemen Risiko" },
  { kode: "PW.05.01", label: "Risiko Operasional" },
  { kode: "PW.05.02", label: "Risiko Non Operasional" },

  { kode: "PW.06", label: "Kinerja Perusahaan" },
  { kode: "PW.06.01", label: "KPKU" },
  { kode: "PW.06.02", label: "KPI" },
  { kode: "PW.06.03", label: "Sasaran Mutu" },

  // K3 & LINGKUNGAN
  { kode: "KL.01", label: "Manajemen K3" },
  { kode: "KL.01.01", label: "Implementasi & Sertifikasi K3" },
  { kode: "KL.01.02", label: "Kecelakaan Kerja & Penyakit Akibat Kerja" },

  { kode: "KL.02", label: "Manajemen Keamanan" },
  { kode: "KL.02.01", label: "Sertifikasi Sistem Keamanan" },
  { kode: "KL.02.02", label: "Keamanan & Ketertiban" },

  { kode: "KL.03", label: "Manajemen Lingkungan" },
  { kode: "KL.03.01", label: "Sertifikasi Lingkungan & PROPER" },
  { kode: "KL.03.02", label: "Pencemaran Lingkungan" },

  { kode: "KL.04", label: "Manajemen HSSE" },

  // PENGEMBANGAN BISNIS
  { kode: "PU.01", label: "Bisnis Plan" },
  { kode: "PU.01.01", label: "Bisnis Inti" },
  { kode: "PU.01.02", label: "Bisnis Pendukung" },

  { kode: "PU.02", label: "Kajian Bisnis" },
  { kode: "PU.02.01", label: "Kajian Bisnis Inti" },
  { kode: "PU.02.02", label: "Kajian Bisnis Pendukung" },

  { kode: "PU.03", label: "Feasibility Study" },
  { kode: "PU.03.01", label: "FS Bisnis Inti" },
  { kode: "PU.03.02", label: "FS Bisnis Pendukung" },

  { kode: "PU.04", label: "Property" },
  { kode: "PU.04.01", label: "Database Property" },
  { kode: "PU.04.02", label: "Pengadaan Property" },

  { kode: "PU.05", label: "Pentariifan" },
  { kode: "PU.05.01", label: "Rencana Pentarifan" },
  { kode: "PU.05.02", label: "Pelaksanaan Pentarifan" },

  { kode: "PU.05.03", label: "Evaluasi Penarifan" },
  { kode: "KS.01", label: "Perencanaan Kerja Sama" },
  { kode: "KS.02", label: "Pelaksanaan Kerja Sama" },
  { kode: "KS.03", label: "Evaluasi Kerja Sama" },
  { kode: "PS.01", label: "Perencanaan Pemasaran" },
  { kode: "PS.02", label: "Pelaksanaan Pemasaran" },
  { kode: "PS.03", label: "Evaluasi Pemasaran" },
  { kode: "PS.04.01", label: "Database Pelanggan" },
  { kode: "PS.04.02", label: "Penanganan Keluhan Pelanggan" },
  { kode: "PS.04.03", label: "Survey Kepuasan Pelanggan" },
  { kode: "PP.01", label: "Pemanfaatan Aset" },
  { kode: "PP.02", label: "Pengamanan Aset" },
  { kode: "PP.03.01", label: "Pemeliharaan Aset Fasilitas" },
  { kode: "PP.03.02", label: "Pemeliharaan Aset Peralatan" },
  { kode: "PP.03.03", label: "Pemeliharaan Aset Perairan" },
  { kode: "PJ.01", label: "Pelayanan Jasa Kapal" },
  { kode: "PJ.02", label: "Pelayanan Peti Kemas" },
  { kode: "PJ.02.01", label: "Pelayanan Peti Kemas Internasional" },
  { kode: "PJ.02.02", label: "Pelayanan Peti Kemas Domestik" },
  { kode: "PJ.03", label: "Pelayanan Non Peti Kemas" },
  { kode: "PJ.03.01", label: "Pelayanan Non Peti Kemas General Cargo" },
  { kode: "PJ.03.02", label: "Pelayanan Non Peti Kemas Curah Kering" },
  { kode: "PJ.03.03", label: "Pelayanan Non Peti Kemas Curah Cair" },
  { kode: "PJ.03.04", label: "Pelayanan Jasa Alat" },
  { kode: "PJ.03.05", label: "Pelayanan Jasa Rupa-Rupa Usaha" },
  { kode: "PJ.03.06", label: "Pelayanan Jasa Kepelabuhanan Lainnya" },

],
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  .ia-page {
    font-family: 'Plus Jakarta Sans', sans-serif;
    padding: 24px;
    max-width: 900px;
  }

  .ia-header {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 24px;
  }

  .ia-header-icon {
    width: 42px;
    height: 42px;
    background: linear-gradient(135deg, #2563eb, #3b82f6);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 4px 10px rgba(37,99,235,0.25);
  }

  .ia-header-icon svg {
    width: 20px;
    height: 20px;
    stroke: white;
  }

  .ia-title {
    font-family: 'Syne', sans-serif;
    font-size: 20px;
    font-weight: 800;
    color: #1e293b;
    margin: 0;
    letter-spacing: -0.3px;
  }

  .ia-subtitle {
    font-size: 13px;
    color: #94a3b8;
    margin: 2px 0 0 0;
  }

  .ia-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .form-section {
    background: #ffffff;
    border: 1px solid #e8edf3;
    border-radius: 16px;
    padding: 20px 22px;
    box-shadow: 0 1px 6px rgba(0,0,0,0.04);
  }

  .form-section-label {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 18px;
    font-family: 'Syne', sans-serif;
    font-size: 12px;
    font-weight: 700;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.8px;
  }

  .section-num {
    width: 26px;
    height: 26px;
    background: linear-gradient(135deg, #2563eb, #3b82f6);
    color: white;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    flex-shrink: 0;
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  .field-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .field-label {
    font-size: 11px;
    font-weight: 600;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .field-auto-badge {
    background: #f0fdf4;
    color: #16a34a;
    border: 1px solid #bbf7d0;
    font-size: 9px;
    padding: 1px 7px;
    border-radius: 20px;
    text-transform: uppercase;
    font-weight: 700;
    letter-spacing: 0.3px;
  }

  .field-input {
    background: #f8fafc;
    border: 1.5px solid #e8edf3;
    border-radius: 10px;
    padding: 9px 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
    color: #334155;
    transition: all 0.15s ease;
    outline: none;
    width: 100%;
    box-sizing: border-box;
    appearance: none;
    -webkit-appearance: none;
  }

  .field-input::placeholder { color: #cbd5e1; }

  .field-input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
    background: #ffffff;
    color: #1e293b;
  }

  .field-readonly {
    background: #f1f5f9 !important;
    color: #64748b !important;
    cursor: default;
  }

  .field-select {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    padding-right: 36px;
    cursor: pointer;
  }

  /* ── JRA INFO CARD ──────────────────────────────────── */
  .jra-info {
    margin-top: 10px;
    padding: 12px 14px;
    border-radius: 10px;
    background: #eff6ff;
    border: 1.5px solid #bfdbfe;
    display: flex;
    gap: 18px;
    flex-wrap: wrap;
  }

  .jra-info-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .jra-info-label {
    font-size: 10px;
    font-weight: 700;
    color: #93c5fd;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .jra-info-value {
    font-size: 13px;
    font-weight: 600;
    color: #1e40af;
  }

  .jra-info-value.ket-musnah   { color: #e11d48; }
  .jra-info-value.ket-permanen { color: #2563eb; }
  .jra-info-value.ket-dinilai  { color: #d97706; }

  /* ── UPLOAD ─────────────────────────────────────────── */
  .upload-zone {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px dashed #e2e8f0;
    border-radius: 12px;
    padding: 28px;
    cursor: pointer;
    transition: all 0.18s ease;
    position: relative;
    background: #f8fafc;
  }

  .upload-zone:hover { border-color: #3b82f6; background: #eff6ff; }

  .upload-zone.has-file {
    border-color: #86efac;
    background: #f0fdf4;
    border-style: solid;
  }

  .upload-zone.loading {
    border-color: #93c5fd;
    background: #eff6ff;
    pointer-events: none;
  }

  .upload-input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
    width: 100%;
    height: 100%;
  }

  .upload-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    pointer-events: none;
  }

  .upload-icon {
    width: 40px;
    height: 40px;
    background: #e8edf3;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .upload-icon svg { width: 18px; height: 18px; stroke: #64748b; }
  .upload-icon-success { background: #dcfce7; }
  .upload-icon-success svg { stroke: #16a34a; }

  .upload-text { font-size: 13.5px; font-weight: 500; color: #64748b; margin: 0; }
  .upload-text-success { color: #16a34a; }
  .upload-hint { font-size: 12px; color: #94a3b8; margin: 0; }

  .upload-spinner {
    width: 28px;
    height: 28px;
    border: 3px solid #e2e8f0;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── REKOMENDASI ────────────────────────────────────── */
  .rekomendasi-card {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px 20px;
    border-radius: 14px;
    border: 1.5px solid #e2e8f0;
    background: #f8fafc;
    transition: all 0.2s;
  }

  .rekomendasi-danger    { background: #fff1f2; border-color: #fecdd3; }
  .rekomendasi-safe      { background: #f0fdf4; border-color: #bbf7d0; }
  .rekomendasi-permanent { background: #eff6ff; border-color: #bfdbfe; }

  .rek-icon {
    width: 38px; height: 38px;
    border-radius: 10px;
    background: #e8edf3;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  .rek-icon svg { width: 18px; height: 18px; stroke: #64748b; }
  .rekomendasi-danger    .rek-icon { background: #fecdd3; }
  .rekomendasi-danger    .rek-icon svg { stroke: #e11d48; }
  .rekomendasi-safe      .rek-icon { background: #bbf7d0; }
  .rekomendasi-safe      .rek-icon svg { stroke: #16a34a; }
  .rekomendasi-permanent .rek-icon { background: #bfdbfe; }
  .rekomendasi-permanent .rek-icon svg { stroke: #2563eb; }

  .rek-content { display: flex; flex-direction: column; gap: 2px; flex: 1; }

  .rek-label {
    font-size: 10.5px; font-weight: 700;
    color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;
  }

  .rek-value { font-size: 14px; font-weight: 600; color: #334155; }

  .rekomendasi-danger    .rek-value { color: #e11d48; }
  .rekomendasi-safe      .rek-value { color: #16a34a; }
  .rekomendasi-permanent .rek-value { color: #2563eb; }

  .rek-badge {
    font-size: 11px; font-weight: 700;
    padding: 4px 12px; border-radius: 20px;
    text-transform: uppercase; letter-spacing: 0.4px;
  }

  .rek-badge-danger    { background: #fecdd3; color: #e11d48; }
  .rek-badge-safe      { background: #bbf7d0; color: #16a34a; }
  .rek-badge-permanent { background: #bfdbfe; color: #2563eb; }

  /* ── ACTIONS ────────────────────────────────────────── */
  .ia-actions {
    display: flex; justify-content: flex-end;
    gap: 10px; padding-bottom: 8px;
  }

  .btn-primary {
    display: flex; align-items: center; gap: 7px;
    padding: 10px 22px;
    background: linear-gradient(135deg, #2563eb, #3b82f6);
    color: white; border: none; border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 600; cursor: pointer;
    box-shadow: 0 3px 10px rgba(37,99,235,0.25);
    transition: all 0.16s;
  }

  .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 5px 16px rgba(37,99,235,0.35); }
  .btn-primary svg { width: 15px; height: 15px; }

  .btn-secondary {
    padding: 10px 20px;
    background: transparent; color: #64748b;
    border: 1.5px solid #e8edf3; border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 500; cursor: pointer;
    transition: all 0.16s;
  }

  .btn-secondary:hover { background: #f1f5f9; color: #1e293b; }
`;

// ── Helper ──────────────────────────────────────────────────────────────────
const formatRetensi = (val) => (val === null ? "Selama Berlaku" : `${val} Tahun`);

function computeRekomendasi(jenis, tahun) {
  const rule = JRA_RULES[jenis];
  if (!rule) return { rekomendasi: "-", retensi_aktif: "", retensi_inaktif: "" };

  const { aktif, inaktif, keterangan } = rule;

  // Siapkan label retensi untuk ditampilkan
  const retensiAktif   = aktif   !== null ? String(aktif)   : "Selama Berlaku";
  const retensiInaktif = inaktif !== null ? String(inaktif) : "Selama Berlaku";

  // ── PERMANEN: tidak pernah dimusnahkan apapun umurnya ──
  if (keterangan === "Permanen") {
    return {
      rekomendasi: "Disimpan Permanen",
      retensi_aktif: retensiAktif,
      retensi_inaktif: retensiInaktif,
    };
  }

  // ── Belum ada tahun: belum bisa dihitung ──
  if (!tahun) {
    return {
      rekomendasi: "-",
      retensi_aktif: retensiAktif,
      retensi_inaktif: retensiInaktif,
    };
  }

  // ── Hitung umur arsip ──
  const umur         = new Date().getFullYear() - parseInt(tahun);
  const batasAktif   = aktif   ?? 0;
  const totalRetensi = batasAktif + (inaktif ?? 0);

  let rekomendasi;

  if (umur <= batasAktif) {
  rekomendasi = "Disimpan";  // ← ganti dari "Aktif"
} else if (umur <= totalRetensi) {
  rekomendasi = "Disimpan";  // ← ganti dari "Disimpan (Inaktif)"
} else {
  rekomendasi = "Dimusnahkan (Fisik)";  // ← biarkan sama
}
  return {
    rekomendasi,
    retensi_aktif: retensiAktif,
    retensi_inaktif: retensiInaktif,
  };
}

// ── Komponen NumberCombobox
function NumberCombobox({ name, value, onChange, count = 100, placeholder = "Pilih atau ketik..." }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value || "");
  const inputRef = useRef(null);

  const options = Array.from({ length: count }, (_, i) =>
    String(i + 1).padStart(3, "0")
  );

  const filtered = query
    ? options.filter((o) => o.includes(query))
    : options;

  const select = (val) => {
    setQuery(val);
    onChange({ target: { name, value: val } });
    setOpen(false);
  };

  // Saat blur: simpan nilai manual jika tidak ada di list
  const handleBlur = () => {
    setTimeout(() => {
      setOpen(false);
      onChange({ target: { name, value: query } });
    }, 150);
  };

  return (
    <div style={{ position: "relative" }}>
      <div style={{ position: "relative" }}>
        <input
          ref={inputRef}
          className="field-input"
          value={query}
          placeholder={placeholder}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === "Escape") inputRef.current.blur();
            if (e.key === "Enter" && filtered.length > 0) select(filtered[0]);
          }}
          autoComplete="off"
          style={{ paddingRight: "32px" }}
        />
        <span
          style={{
            position: "absolute", right: "10px", top: "50%",
            transform: "translateY(-50%)", fontSize: "11px",
            color: "#94a3b8", pointerEvents: "none",
          }}
        >▾</span>
      </div>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          background: "#ffffff", border: "1.5px solid #e8edf3",
          borderRadius: "10px", zIndex: 100, maxHeight: "180px",
          overflowY: "auto", boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "8px 12px", fontSize: "13px", color: "#94a3b8", fontStyle: "italic" }}>
              Nilai akan disimpan manual
            </div>
          ) : (
            filtered.map((opt) => (
              <div
                key={opt}
                onMouseDown={(e) => { e.preventDefault(); select(opt); }}
                style={{
                  padding: "8px 12px", fontSize: "13.5px", cursor: "pointer",
                  color: opt === query ? "#2563eb" : "#334155",
                  background: opt === query ? "#eff6ff" : "transparent",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
                onMouseLeave={(e) => e.currentTarget.style.background = opt === query ? "#eff6ff" : "transparent"}
              >
                {opt}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ── Komponen KlasifikasiSelect (Dropdown 2 Level) ────────────
function KlasifikasiSelect({ value, onKlasifikasiChange }) {
  const [periode, setPeriode] = useState("");

  const periodeList = Object.keys(KLASIFIKASI_DATA);

  // Saat mode edit: deteksi dan set periode otomatis dari value yang sudah ada
  useEffect(() => {
    if (!value || periode) return;
    for (const [p, items] of Object.entries(KLASIFIKASI_DATA)) {
      const found = items.find(
        (item) => `${item.kode} - ${item.label}` === value
      );
      if (found) {
        setPeriode(p);
        break;
      }
    }
  }, [value, periode]); // ← tambahkan periode di sini

  // Bangun options untuk SearchableSelect, dikelompokkan berdasarkan prefix kode
  const kodeOptions = periode
    ? (() => {
        // Kelompokkan berdasarkan prefix kode (FP, UC, KU, HK, dst)
        const groups = {};
        KLASIFIKASI_DATA[periode].forEach((item) => {
          const prefix = item.kode.split(".")[0];
          if (!groups[prefix]) groups[prefix] = [];
          groups[prefix].push({
            value: `${item.kode} - ${item.label}`,
            label: item.label,
            kode: item.kode,
          });
        });
        return Object.entries(groups).map(([g, items]) => ({ group: g, items }));
      })()
    : [];

  const handlePeriode = (e) => {
    const p = e.target.value;
    setPeriode(p);
    onKlasifikasiChange(""); // reset pilihan kode saat periode berubah
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {/* Dropdown periode */}
      <select
        className="field-input field-select"
        value={periode}
        onChange={handlePeriode}
      >
        <option value="">— Pilih periode —</option>
        {periodeList.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      {/* SearchableSelect kode — muncul setelah periode dipilih */}
      {periode && (
        <SearchableSelect
          options={kodeOptions}
          value={value}
          onChange={(val) => onKlasifikasiChange(val)}
          placeholder="Cari kode atau nama klasifikasi..."
        />
      )}

      {/* Preview nilai terpilih */}
      {value && (
        <div
          style={{
            fontSize: "11.5px",
            color: "#2563eb",
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: "8px",
            padding: "6px 10px",
            fontWeight: 500,
          }}
        >
          ✓ {value}
        </div>
      )}
    </div>
  );
}

function SearchableSelect({ options, value, onChange, placeholder = "Cari atau pilih..." }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef(null);

  // Tutup dropdown jika user klik di luar area komponen
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Ubah semua options menjadi array datar agar mudah dicari
  // options bisa berupa: [{ group: "...", items: [...] }] ATAU [{ value, label }]
  const flatOptions = options.flatMap((o) =>
    o.items ? o.items.map((item) => ({ ...item, group: o.group })) : [o]
  );

  // Filter berdasarkan query pencarian (cocokkan label atau kode)
  const filtered = query.trim()
    ? flatOptions.filter((o) =>
        (o.label || "").toLowerCase().includes(query.toLowerCase()) ||
        (o.kode || "").toLowerCase().includes(query.toLowerCase())
      )
    : flatOptions;

  // Kelompokkan hasil filter berdasarkan group
  const grouped = filtered.reduce((acc, item) => {
    const g = item.group || "Lainnya";
    if (!acc[g]) acc[g] = [];
    acc[g].push(item);
    return acc;
  }, {});

  // Cari label untuk nilai yang sedang terpilih
  const selectedLabel =
    flatOptions.find((o) => (o.value || o.label) === value)?.label || value;

  return (
    <div ref={wrapperRef} style={{ position: "relative" }}>

      {/* ── Tombol pemicu dropdown ── */}
      <div
        className="field-input field-select"
        style={{
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          userSelect: "none",
        }}
        onClick={() => {
          setOpen((v) => !v);
          setQuery("");
        }}
      >
        <span style={{ color: value ? "#334155" : "#cbd5e1", fontSize: "13.5px" }}>
          {value ? selectedLabel : placeholder}
        </span>
      </div>

      {/* ── Panel dropdown (muncul saat open === true) ── */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            background: "#fff",
            border: "1.5px solid #e8edf3",
            borderRadius: "12px",
            zIndex: 200,
            boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
            overflow: "hidden",
          }}
        >
          {/* Kotak pencarian */}
          <div style={{ padding: "10px 12px", borderBottom: "1px solid #f1f5f9" }}>
            <input
              autoFocus
              className="field-input"
              placeholder="🔍  Ketik untuk mencari..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ marginBottom: 0 }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Daftar pilihan */}
          <div style={{ maxHeight: "240px", overflowY: "auto" }}>
            {Object.keys(grouped).length === 0 ? (
              <div style={{ padding: "12px", fontSize: "13px", color: "#94a3b8", textAlign: "center" }}>
                Tidak ada hasil
              </div>
            ) : (
              Object.entries(grouped).map(([group, items]) => (
                <div key={group}>
                  {/* Header grup */}
                  <div
                    style={{
                      padding: "6px 12px 4px",
                      fontSize: "10px",
                      fontWeight: 700,
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      background: "#f8fafc",
                      borderTop: "1px solid #f1f5f9",
                    }}
                  >
                    {group}
                  </div>

                  {/* Item-item dalam grup */}
                  {items.map((item) => {
                    const itemValue = item.value || item.label;
                    const isSelected = itemValue === value;
                    return (
                      <div
                        key={itemValue}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          onChange(itemValue);
                          setOpen(false);
                          setQuery("");
                        }}
                        style={{
                          padding: "9px 14px",
                          fontSize: "13px",
                          cursor: "pointer",
                          background: isSelected ? "#eff6ff" : "transparent",
                          color: isSelected ? "#2563eb" : "#334155",
                          fontWeight: isSelected ? 600 : 400,
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.background = "#f8fafc";
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.currentTarget.style.background = "transparent";
                        }}
                      >
                        {/* Badge kode (khusus klasifikasi) */}
                        {item.kode && (
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: 600,
                              color: "#3b82f6",
                              background: "#eff6ff",
                              padding: "2px 7px",
                              borderRadius: "6px",
                              flexShrink: 0,
                            }}
                          >
                            {item.kode}
                          </span>
                        )}
                        {item.label}
                        {isSelected && (
                          <span style={{ marginLeft: "auto", color: "#2563eb" }}>✓</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Komponen ─────────────────────────────────────────────────────────────────
function InputArsip() {
  const navigate = useNavigate();
  const location = useLocation();

  // Deteksi mode edit dari URL ?id=xxx
  const editId = new URLSearchParams(location.search).get("id");
  const isEditMode = !!editId;

  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfFileName, setPdfFileName] = useState("");
  const [pdfFile, setPdfFile] = useState(null);

  const [formData, setFormData] = useState({
    kode_unit: "", indeks: "", nomor_berkas: "", judul_berkas: "",
    nomor_isi: "", jenis_naskah: "", klasifikasi: "", nomor_naskah: "",
    tanggal: "", perihal: "", tahun: "", tingkat_perkembangan: "",
    kondisi: "", lokasi_simpan: "", retensi_aktif: "", retensi_inaktif: "",
    keterangan_jra: "", keterangan: "",retensi: "", rekomendasi: "", status: "pending", file: "",
  });

  // ── Fetch data arsip saat mode edit ──
  useEffect(() => {
    if (!editId) return;

    apiClient.get(`/arsip/${editId}`)
      .then((res) => {
        const data = res.data || res;
        setFormData({
          kode_unit:            data.kode_unit || "",
          indeks:               data.indeks || "",
          nomor_berkas:         String(data.nomor_berkas || ""),
          judul_berkas:         data.judul_berkas || "",
          nomor_isi:            String(data.nomor_isi || ""),
          jenis_naskah:         data.jenis_naskah || "",
          klasifikasi:          data.klasifikasi || "",
          nomor_naskah:         data.nomor_naskah || "",
          tanggal:              data.tanggal || "",
          perihal:              data.perihal || "",
          tahun:                data.tahun ? String(data.tahun) : "",
          tingkat_perkembangan: data.tingkat_perkembangan || "",
          kondisi:              data.kondisi || "",
          lokasi_simpan:        data.lokasi_simpan || "",
          retensi_aktif:        data.retensi_aktif ? String(data.retensi_aktif) : "",
          retensi_inaktif:      data.retensi_inaktif ? String(data.retensi_inaktif) : "",
          keterangan_jra:       data.keterangan_jra || "",
          keterangan:           data.keterangan || "",
          retensi:              data.retensi || "",
          rekomendasi:          data.rekomendasi || "",
          status:               data.status || "pending",
          file:                 data.file || "",
        });

        // Tampilkan info file lama jika ada
        if (data.file) {
          setPdfFileName("File tersimpan — upload baru untuk mengganti");
        }
      })
      .catch((err) => console.error("Gagal fetch data arsip:", err));
  }, [editId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "tanggal") {
      const tahun = value.split("-")[0];
      setFormData((prev) => ({ ...prev, tanggal: value, tahun }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (file) => {
    if (!file) return;
    setPdfLoading(true);
    setPdfFileName(file.name);
    setPdfFile(file);
    try {
      const reader = new FileReader();
      reader.onload = async function () {
        const typedarray = new Uint8Array(this.result);
        const pdf = await pdfjsLib.getDocument(typedarray).promise;
        let text = "";
        for (let i = 1; i <= Math.min(pdf.numPages, 3); i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item) => item.str).join(" ") + " ";
        }
        if (text && text.trim().length >= 10) autoFillForm(text);
        setPdfLoading(false);
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error(err);
      setPdfLoading(false);
    }
  };

  const autoFillForm = (text) => {
  const nomor   = text.match(/(Nomor|No|No Surat)\s*[:-]?\s*([A-Za-z0-9/.-]+)/i)?.[2] || "";
  const perihal = text.match(/(Perihal|Hal)\s*[:-]?\s*(.{5,100})/i)?.[2] || "";
  const tahun   = text.match(/20\d{2}/)?.[0] || "";
  setFormData((prev) => ({ ...prev, nomor_naskah: nomor, perihal, tahun }));
};

  // Hitung ulang retensi & rekomendasi setiap kali retensi atau tahun berubah
  useEffect(() => {
    if (!formData.retensi) return;
    const rule = JRA_RULES[formData.retensi];
    if (!rule) return;

    const { rekomendasi, retensi_aktif, retensi_inaktif } = computeRekomendasi(
      formData.retensi,
      formData.tahun
    );

    setFormData((prev) => ({
      ...prev,
      retensi_aktif,
      retensi_inaktif,
      keterangan_jra: rule.keterangan,
      rekomendasi,
    }));
  }, [formData.retensi, formData.tahun]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = [
      "kode_unit", "indeks", "nomor_berkas", "judul_berkas",
      "nomor_isi", "jenis_naskah", "klasifikasi", "nomor_naskah",
      "tanggal", "perihal", "tahun", "tingkat_perkembangan",
      "kondisi", "lokasi_simpan",
    ];

    for (let field of requiredFields) {
      if (!formData[field] || formData[field].toString().trim() === "") {
        alert(`Field "${field.replaceAll("_", " ")}" wajib diisi!`);
        return;
      }
    }

    try {
      const token = localStorage.getItem("token") || "";
      const fd = new FormData();

      const fields = [
      "kode_unit","indeks","nomor_berkas","judul_berkas","nomor_isi",
      "jenis_naskah","klasifikasi","nomor_naskah","tanggal","perihal",
      "tingkat_perkembangan","kondisi","lokasi_simpan","keterangan",
      "retensi","rekomendasi","retensi_inaktif",
    ];

      fields.forEach((f) => fd.append(f, formData[f]?.trim() || ""));
      fd.append("tahun", parseInt(formData.tahun));

      const aktifNum = JRA_RULES[formData.retensi]?.aktif ?? 10;
      fd.append("retensi_aktif", aktifNum);

            if (pdfFile) {
  fd.append("file", pdfFile);
}

      const url = isEditMode
        ? `http://localhost:8000/api/arsip/${editId}`
        : "http://localhost:8000/api/arsip";

      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const result = await response.json();

      if (!response.ok) {
        const msg = result.errors
          ? Object.entries(result.errors)
              .map(([k, v]) => `${k}: ${v.join(", ")}`)
              .join("\n")
          : result.message || "Gagal menyimpan arsip";
        alert("Validasi gagal:\n\n" + msg);
        console.error(result);
      } else {
        alert(isEditMode ? "Data arsip berhasil diperbarui!" : "Data arsip berhasil disimpan!");
        navigate("/data-arsip");
      }
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan arsip.\n\nError: " + err.message);
    }
  };

  const rekStatus = formData.rekomendasi.includes("Dimusnahkan")
  ? "danger"
  : formData.rekomendasi.includes("Permanen")
  ? "permanent"
  : formData.rekomendasi === "Aktif" || formData.rekomendasi === "Disimpan (Inaktif)"
  ? "safe"
  : "idle";

  const selectedRule = JRA_RULES[formData.retensi];

  return (
    <>
      <style>{styles}</style>
      <div className="ia-page">

        {/* HEADER */}
        <div className="ia-header">
          <div className="ia-header-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          </div>
          <div>
            <h2 className="ia-title">
              {isEditMode ? "Edit Arsip Inaktif" : "Form Input Arsip Inaktif"}
            </h2>
            <p className="ia-subtitle">
              {isEditMode ? "Perbaiki data arsip yang salah" : "Lengkapi seluruh data arsip dengan benar"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="ia-form">

          {/* 01 IDENTITAS BERKAS */}
          <div className="form-section">
            <div className="form-section-label">
              <span className="section-num">01</span>
              <span>Identitas Berkas</span>
            </div>
            <div className="form-grid">
              <div className="field-group">
                <label className="field-label">Kode Unit</label>
                <select className="field-input field-select" name="kode_unit" value={formData.kode_unit} onChange={handleChange}>
                  <option value="">— Pilih kode unit —</option>
                  {kodeunitOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div className="field-group">
                <label className="field-label">Indeks</label>
                <input className="field-input" name="indeks" placeholder="Masukkan indeks" value={formData.indeks} onChange={handleChange} />
              </div>
              <div className="field-group">
                <label className="field-label">Nomor Berkas</label>
                <NumberCombobox
                  name="nomor_berkas"
                  value={formData.nomor_berkas}
                  onChange={handleChange}
                  count={999}
                  placeholder="Pilih atau ketik nomor..."
                />
              </div>
              <div className="field-group">
                <label className="field-label">Judul Berkas</label>
                <input
                  className="field-input"
                  name="judul_berkas"
                  placeholder="Masukkan judul berkas"
                  value={formData.judul_berkas}
                  onChange={handleChange}
                />
              </div>
              <div className="field-group">
                <label className="field-label">Nomor Isi</label>
                <NumberCombobox
                  name="nomor_isi"
                  value={formData.nomor_isi}
                  onChange={handleChange}
                  count={999}
                  placeholder="Pilih atau ketik nomor isi..."
                />
              </div>
              <div className="field-group" style={{ gridColumn: "1 / -1" }}>
                <label className="field-label">Klasifikasi</label>
                <KlasifikasiSelect
                  value={formData.klasifikasi}
                  onKlasifikasiChange={(klasifikasi) =>
                    setFormData((prev) => ({ ...prev, klasifikasi }))
                  }
                />
              </div>
              <div className="field-group">
                <label className="field-label">Nomor Naskah</label>
                <input className="field-input" name="nomor_naskah" placeholder="Nomor surat/naskah" value={formData.nomor_naskah} onChange={handleChange} />
              </div>
              <div className="field-group">
                <label className="field-label">Jenis Naskah</label>
                <input className="field-input" name="jenis_naskah" placeholder="Jenis surat/naskah" value={formData.jenis_naskah} onChange={handleChange} />
              </div>
              <div className="field-group">
                <label className="field-label">Tanggal Naskah</label>
                <input className="field-input" type="date" name="tanggal" value={formData.tanggal} onChange={handleChange} />
              </div>
              <div className="field-group">
                <label className="field-label">Perihal</label>
                <input className="field-input" name="perihal" placeholder="Perihal surat" value={formData.perihal} onChange={handleChange} />
              </div>
              <div className="field-group">
                <label className="field-label">Tahun <span className="field-auto-badge">otomatis</span></label>
                <input className="field-input field-readonly" name="tahun" placeholder="Terisi otomatis" value={formData.tahun} readOnly />
              </div>
              <div className="field-group">
                <label className="field-label">Tingkat Perkembangan</label>
                <select className="field-input field-select" name="tingkat_perkembangan" value={formData.tingkat_perkembangan} onChange={handleChange}>
                  <option value="">Pilih tingkat perkembangan</option>
                  {tingkatPerkembanganOptions.map((t, i) => (
                    <option key={i} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 02 PENYIMPANAN */}
          <div className="form-section">
            <div className="form-section-label">
              <span className="section-num">02</span>
              <span>Informasi Penyimpanan</span>
            </div>
            <div className="form-grid">
              <div className="field-group">
                <label className="field-label">Kondisi Arsip</label>
                <select className="field-input field-select" name="kondisi" value={formData.kondisi} onChange={handleChange}>
                  <option value="">Kondisi Arsip</option>
                  {kondisiOptions.map((k, i) => <option key={i}>{k}</option>)}
                </select>
              </div>
              <div className="field-group">
                <label className="field-label">Lokasi Simpan</label>
                <select className="field-input field-select" name="lokasi_simpan" value={formData.lokasi_simpan} onChange={handleChange}>
                  <option value="">Pilih lokasi simpan</option>
                  {lokasiOptions.map((l, i) => (
                    <option key={i} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div className="field-group">
                <label className="field-label">Retensi Aktif <span className="field-auto-badge">otomatis</span></label>
                <input className="field-input field-readonly" name="retensi_aktif" placeholder="Terisi otomatis" value={formData.retensi_aktif} readOnly />
              </div>
              <div className="field-group">
                <label className="field-label">Retensi Inaktif <span className="field-auto-badge">otomatis</span></label>
                <input className="field-input field-readonly" name="retensi_inaktif" placeholder="Terisi otomatis" value={formData.retensi_inaktif} readOnly />
              </div>
              <div className="field-group" style={{ gridColumn: "1 / -1" }}>
                <label className="field-label">Keterangan</label>
                <select className="field-input field-select" name="keterangan" value={formData.keterangan} onChange={handleChange}>
                  <option value="">Pilih keterangan</option>
                  {keteranganOptions.map((k, i) => (
                    <option key={i} value={k}>{k}</option>
                  ))}
                </select>
              </div>
              <div className="field-group" style={{ gridColumn: "1 / -1" }}>
                <label className="field-label">Retensi</label>
                <SearchableSelect
                  options={JRA_GROUPS.map((g) => ({
                    group: g.group,
                    items: g.items.map((item) => ({ value: item, label: item })),
                  }))}
                  value={formData.retensi}
                  onChange={(val) =>
                    handleChange({ target: { name: "retensi", value: val } })
                  }
                  placeholder="Cari jenis retensi..."
                />
              </div>
            </div>

            {/* JRA INFO */}
            {selectedRule && (
              <div className="jra-info">
                <div className="jra-info-item">
                  <span className="jra-info-label">Retensi Aktif</span>
                  <span className="jra-info-value">{formatRetensi(selectedRule.aktif)}</span>
                </div>
                <div className="jra-info-item">
                  <span className="jra-info-label">Retensi Inaktif</span>
                  <span className="jra-info-value">{formatRetensi(selectedRule.inaktif)}</span>
                </div>
                <div className="jra-info-item">
                  <span className="jra-info-label">Total Retensi</span>
                  <span className="jra-info-value">
                    {selectedRule.aktif === null && selectedRule.inaktif === null
                      ? "Selama Berlaku"
                      : `${(selectedRule.aktif ?? 0) + (selectedRule.inaktif ?? 0)} Tahun`}
                  </span>
                </div>
                <div className="jra-info-item">
                  <span className="jra-info-label">Keterangan JRA</span>
                  <span className={`jra-info-value ket-${selectedRule.keterangan.toLowerCase()}`}>
                    {selectedRule.keterangan}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 03 UPLOAD PDF */}
          <div className="form-section">
            <div className="form-section-label">
              <span className="section-num">03</span>
              <span>Unggah File Arsip</span>
            </div>
            <label className={`upload-zone ${pdfLoading ? "loading" : ""} ${pdfFileName ? "has-file" : ""}`}>
              <input
                type="file"
                accept="application/pdf"
                className="upload-input"
                onChange={(e) => { const f = e.target.files[0]; if (f) handleFileChange(f); }}
              />
              {pdfLoading ? (
                <div className="upload-content">
                  <div className="upload-spinner" />
                  <p className="upload-text">Memproses PDF...</p>
                </div>
              ) : pdfFileName ? (
                <div className="upload-content">
                  <div className="upload-icon upload-icon-success">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <p className="upload-text upload-text-success">{pdfFileName}</p>
                  <p className="upload-hint">File siap dikirim</p>
                </div>
              ) : (
                <div className="upload-content">
                  <div className="upload-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <p className="upload-text">Klik atau seret file PDF ke sini</p>
                  <p className="upload-hint">Sistem akan mengisi form secara otomatis</p>
                </div>
              )}
            </label>
          </div>

          {/* REKOMENDASI */}
          <div className={`rekomendasi-card rekomendasi-${rekStatus}`}>
            <div className="rek-icon">
              {rekStatus === "danger" ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                </svg>
              ) : rekStatus === "safe" || rekStatus === "permanent" ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              )}
            </div>
            <div className="rek-content">
              <span className="rek-label">Rekomendasi Sistem</span>
              <span className="rek-value">{formData.rekomendasi || "Lengkapi retensi & tahun"}</span>
            </div>
            {rekStatus !== "idle" && (
              <span className={`rek-badge rek-badge-${rekStatus}`}>
                {rekStatus === "danger" ? "Perlu Tindakan" :
                 rekStatus === "permanent" ? "Permanen" : "Aman"}
              </span>
            )}
          </div>

          {/* ACTIONS */}
          <div className="ia-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>Batal</button>
            <button type="submit" className="btn-primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Simpan Arsip
            </button>
          </div>

        </form>
      </div>
    </>
  );
}

export default InputArsip;