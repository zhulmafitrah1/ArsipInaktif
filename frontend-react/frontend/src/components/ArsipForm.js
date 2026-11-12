import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ArsipForm({ arsipData, setArsipData }) {
  const navigate = useNavigate();
  const tahunSekarang = new Date().getFullYear();

  const [formData, setFormData] = useState({
    kode_unit: "",
    indeks: "",
    nomor_berkas: "",
    judul_berkas: "",
    nomor_isi: "",
    jenis_naskah: "",
    klasifikasi: "",
    nomor_naskah: "",
    tanggal: "",
    perihal: "",
    tahun: "",
    tingkat_perkembangan: "",
    kondisi: "",
    lokasi_simpan: "",
    retensi_aktif: "",
    keterangan: "",
    rekomendasi: "",
  });

  // 🔹 RULE-BASED OTOMATIS
  useEffect(() => {
    if (formData.tahun) {
      const umur = tahunSekarang - parseInt(formData.tahun);
      setFormData((prev) => ({
        ...prev,
        rekomendasi: umur > 3 ? "Dimusnahkan (Fisik)" : "Disimpan",
      }));
    }
  }, [formData.tahun, tahunSekarang]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 🔹 Tambahkan data baru ke arsipData global
    setArsipData([...arsipData, formData]);

    alert("Data arsip berhasil disimpan!");
    // 🔹 Redirect ke halaman ArsipTable
    navigate("/arsip-inaktif");
  };

  return (
    <form className="form-box" onSubmit={handleSubmit}>
      <h2>Form Input Arsip Inaktif</h2>

      <div className="form-grid">
        <input name="kode_unit" placeholder="Kode Unit" onChange={handleChange} />
        <input name="indeks" placeholder="Indeks" onChange={handleChange} />
        <input name="nomor_berkas" placeholder="Nomor Berkas" onChange={handleChange} />
        <input name="judul_berkas" placeholder="Judul Berkas" onChange={handleChange} />
        <input name="nomor_isi" placeholder="Nomor Isi Berkas" onChange={handleChange} />
        <input name="jenis_naskah" placeholder="Jenis Naskah Dinas" onChange={handleChange} />
        <input name="klasifikasi" placeholder="Klasifikasi" onChange={handleChange} />
        <input name="nomor_naskah" placeholder="Nomor Naskah Dinas" onChange={handleChange} />
        <input type="date" name="tanggal" onChange={handleChange} />
        <input name="perihal" placeholder="Perihal" onChange={handleChange} />
        <input type="number" name="tahun" placeholder="Tahun Arsip" onChange={handleChange} />
        <input name="tingkat_perkembangan" placeholder="Tingkat Perkembangan" onChange={handleChange} />
        <input name="kondisi" placeholder="Kondisi" onChange={handleChange} />
        <input name="lokasi_simpan" placeholder="Lokasi Simpan" onChange={handleChange} />
        <input name="retensi_aktif" placeholder="Retensi Aktif" onChange={handleChange} />
        <input name="keterangan" placeholder="Keterangan" onChange={handleChange} />
      </div>

      {/* 🔽 HASIL RULE-BASED */}
      <div className="rule-box">
        <strong>Rekomendasi Sistem:</strong>
        <span
          className={formData.rekomendasi.includes("Dimusnahkan") ? "danger-text" : "safe-text"}
        >
          {formData.rekomendasi || "-"}
        </span>
      </div>

      <button type="submit" className="btn-primary">
        Simpan Arsip
      </button>
    </form>
  );
}

export default ArsipForm;
