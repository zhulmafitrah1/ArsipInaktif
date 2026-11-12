<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('arsip', function (Blueprint $table) {
    $table->id();

    // Identitas arsip
    $table->string('kode_unit')->nullable();
    $table->string('indeks')->nullable();
    $table->string('nomor_berkas')->nullable();
    $table->string('judul_berkas');

    // Detail dokumen
    $table->string('nomor_isi')->nullable();
    $table->string('jenis_naskah')->nullable();
    $table->string('klasifikasi')->nullable();
    $table->string('nomor_naskah')->nullable();
    $table->date('tanggal')->nullable();
    $table->string('perihal')->nullable();

    // Tahun & retensi
    $table->integer('tahun');
    $table->integer('retensi_aktif');
    $table->integer('retensi_inaktif')->nullable(); // tambahan penting

    // Kondisi & status
    $table->string('tingkat_perkembangan')->nullable();
    $table->string('kondisi')->nullable();
    $table->string('status')->default('aktif'); // aktif / dihapuskan

    // Penyimpanan
    $table->string('lokasi_simpan')->nullable(); // fisik
    $table->string('file_digital')->nullable(); //  upload file

    // Keterangan
    $table->text('keterangan')->nullable();

    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('arsip');
    }
};