<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Arsip extends Model
{
    use HasFactory;

    protected $table = 'arsip'; 

    protected $primaryKey = 'id';

    protected $fillable = [
        'kode_unit',
        'indeks',
        'nomor_berkas',
        'judul_berkas',
        'nomor_isi',
        'jenis_naskah',
        'klasifikasi',
        'nomor_naskah',
        'tanggal',
        'perihal',
        'tahun',
        'tingkat_perkembangan',
        'kondisi',
        'lokasi_simpan',
        'retensi_aktif',
        'retensi_inaktif',
        'keterangan',
        'status',
        'rekomendasi',
        'file_digital',  
        'file'
    ];

    protected $casts = [
        'tanggal' => 'date',
        'tahun'   => 'integer',
    ];
}