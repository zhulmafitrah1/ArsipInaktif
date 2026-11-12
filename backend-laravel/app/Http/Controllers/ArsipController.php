<?php

namespace App\Http\Controllers;

use App\Models\Arsip;
use Illuminate\Http\Request;

class ArsipController extends Controller
{
    // GET ALL
    public function index()
    {
        return response()->json(Arsip::latest()->get());
    }

    // GET BY ID
    public function show($id)
    {
        return response()->json(Arsip::findOrFail($id));
    }

    // INSERT + UPLOAD FILE
    public function store(Request $request)
    {
        try {
            $data = $request->validate([
                'kode_unit'            => 'nullable|string|max:255',
                'indeks'               => 'nullable|string|max:255',
                'nomor_berkas'         => 'nullable|string|max:255',
                'judul_berkas'         => 'required|string|max:500',
                'nomor_isi'            => 'nullable|string|max:255',
                'jenis_naskah'         => 'nullable|string|max:255',
                'klasifikasi'          => 'nullable|string|max:255',
                'nomor_naskah'         => 'nullable|string|max:255',
                'tanggal'              => 'nullable|date_format:Y-m-d',
                'perihal'              => 'nullable|string|max:500',
                'tahun'                => 'required|integer|digits:4|min:1900|max:' . date('Y'),
                'tingkat_perkembangan' => 'nullable|string|max:255',
                'kondisi'              => 'nullable|string|max:255',
                'lokasi_simpan'        => 'nullable|string|max:255',
                'retensi_aktif'        => 'nullable|integer|min:0',
                'retensi_inaktif'      => 'nullable|integer|min:0',
                'keterangan'           => 'nullable|string',
                'rekomendasi'          => 'nullable|string|max:500',
                'file'                 => 'nullable|file|mimes:pdf|max:10240',
            ]);

            foreach ($data as $key => $value) {
                if ($value === null || $value === '') {
                    $data[$key] = null;
                }
            }

            if (empty($data['retensi_aktif'])) {
                $data['retensi_aktif'] = 10;
            }

            if ($request->hasFile('file')) {
                $fileContents         = file_get_contents($request->file('file')->getRealPath());
                $base64               = base64_encode($fileContents);
                $mimeType             = $request->file('file')->getMimeType();
                $data['file']         = 'data:' . $mimeType . ';base64,' . $base64; // ✅ simpan base64
                $data['file_digital'] = time() . '_' . $request->file('file')->getClientOriginalName();
            } else {
                unset($data['file']); // ✅ hapus key hanya jika tidak ada file
            }

            if (empty($data['rekomendasi'])) {
                $tahunSekarang = date('Y');
                $usia          = $tahunSekarang - $data['tahun'];

                if ($usia >= $data['retensi_aktif']) {
                    $data['status']      = 'inaktif';
                    $data['rekomendasi'] = $usia >= 10 ? 'Dimusnahkan (Fisik)' : 'Disimpan';
                } else {
                    $data['status']      = 'aktif';
                    $data['rekomendasi'] = 'Disimpan';
                }
            }

            $arsip = Arsip::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Arsip berhasil disimpan',
                'data'    => $arsip
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors'  => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Store arsip error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    // UPDATE + UPLOAD FILE
    public function update(Request $request, $id)
    {
        try {
            $arsip = Arsip::findOrFail($id);

            $data = $request->validate([
                'kode_unit'            => 'nullable|string',
                'indeks'               => 'nullable|string',
                'nomor_berkas'         => 'nullable|string',
                'judul_berkas'         => 'nullable|string',
                'nomor_isi'            => 'nullable|string',
                'jenis_naskah'         => 'nullable|string',
                'klasifikasi'          => 'nullable|string',
                'nomor_naskah'         => 'nullable|string',
                'tanggal'              => 'nullable|date',
                'perihal'              => 'nullable|string',
                'tahun'                => 'nullable|integer',
                'tingkat_perkembangan' => 'nullable|string',
                'kondisi'              => 'nullable|string',
                'lokasi_simpan'        => 'nullable|string',
                'retensi_aktif'        => 'nullable|integer',
                'retensi_inaktif'      => 'nullable|integer',
                'keterangan'           => 'nullable|string',
                'rekomendasi'          => 'nullable|string',
                'status'               => 'nullable|string',
                'file'                 => 'nullable|file|mimes:pdf|max:10240',
            ]);

          
            if ($request->hasFile('file')) {
                $fileContents         = file_get_contents($request->file('file')->getRealPath());
                $base64               = base64_encode($fileContents);
                $mimeType             = $request->file('file')->getMimeType();
                $data['file']         = 'data:' . $mimeType . ';base64,' . $base64;
                $data['file_digital'] = time() . '_' . $request->file('file')->getClientOriginalName();
                } else {
                    // Tidak ada file baru — pertahankan file lama dari database
                    unset($data['file']);
                    unset($data['file_digital']);
                }


            if (!empty($data['status']) && $data['status'] === 'setuju') {
                $arsip->update($data);
            } else {
                if (empty($data['rekomendasi'])) {
                    $tahunSekarang = date('Y');
                    $tahun         = $data['tahun']         ?? $arsip->tahun;
                    $retensi       = $data['retensi_aktif'] ?? $arsip->retensi_aktif ?? 10;
                    $usia          = $tahunSekarang - $tahun;

                    if ($usia >= $retensi) {
                        $data['status']      = 'inaktif';
                        $data['rekomendasi'] = $usia >= 10 ? 'Dimusnahkan (Fisik)' : 'Disimpan';
                    } else {
                        $data['status']      = 'aktif';
                        $data['rekomendasi'] = 'Disimpan';
                    }
                }

                $arsip->update($data);
            }

            return response()->json([
                'message' => 'Arsip berhasil diupdate',
                'data'    => $arsip
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors'  => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Update arsip error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    // DELETE
    public function destroy($id)
    {
        Arsip::destroy($id);

        return response()->json([
            'message' => 'Arsip berhasil dihapus'
        ]);
    }

    // PROSES RETENSI MASSAL
    public function prosesRetensi()
    {
        $tahunSekarang = date('Y');
        $arsips        = Arsip::all();

        foreach ($arsips as $arsip) {
            $usia = $tahunSekarang - $arsip->tahun;

            if ($usia >= $arsip->retensi_aktif) {
                $arsip->status      = 'inaktif';
                $arsip->rekomendasi = $usia >= 10 ? 'musnah' : 'simpan';
            } else {
                $arsip->status      = 'aktif';
                $arsip->rekomendasi = 'simpan';
            }

            $arsip->save();
        }

        return response()->json([
            'message' => 'Proses retensi berhasil'
        ]);
    }
}