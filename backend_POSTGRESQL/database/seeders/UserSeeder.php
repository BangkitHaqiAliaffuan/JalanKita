<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * UserSeeder — Data dummy pengguna JalanKita.
 *
 * Password semua akun: password123
 * (Di-hash dengan bcrypt via Hash::make())
 *
 * Akun yang dibuat:
 * - 4 Petugas Lapangan (berbeda kecamatan)
 * - 4 Supervisor (berbeda wilayah)
 */
class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Hapus data lama agar tidak duplikat saat re-seed
        User::truncate();

        $password = Hash::make('password123');

        // ── Petugas Lapangan ──────────────────────────────────────────────
        $petugas = [
            [
                'name'    => 'Agus Setiawan',
                'email'   => 'agus.setiawan@dishub.sidoarjo.go.id',
                'role'    => 'petugas',
                'wilayah' => 'Kec. Sidoarjo',
                'nip'     => '198501012010011001',
            ],
            [
                'name'    => 'Rizky Firmansyah',
                'email'   => 'rizky.firmansyah@dishub.sidoarjo.go.id',
                'role'    => 'petugas',
                'wilayah' => 'Kec. Waru & Gedangan',
                'nip'     => '199203152015031002',
            ],
            [
                'name'    => 'Dewi Rahayu',
                'email'   => 'dewi.rahayu@dishub.sidoarjo.go.id',
                'role'    => 'petugas',
                'wilayah' => 'Kec. Taman & Krian',
                'nip'     => '199507202018032003',
            ],
            [
                'name'    => 'Bambang Eko',
                'email'   => 'bambang.eko@dishub.sidoarjo.go.id',
                'role'    => 'petugas',
                'wilayah' => 'Kec. Porong & Tanggulangin',
                'nip'     => '198812102012011004',
            ],
        ];

        // ── Supervisor ────────────────────────────────────────────────────
        $supervisors = [
            [
                'name'    => 'Budi Santoso',
                'email'   => 'budi.santoso@dishub.sidoarjo.go.id',
                'role'    => 'supervisor',
                'wilayah' => 'Wilayah Utara',
                'nip'     => '197804052005011005',
            ],
            [
                'name'    => 'Siti Marlina',
                'email'   => 'siti.marlina@dishub.sidoarjo.go.id',
                'role'    => 'supervisor',
                'wilayah' => 'Wilayah Selatan',
                'nip'     => '198006152006022006',
            ],
            [
                'name'    => 'Hendra Kusuma',
                'email'   => 'hendra.kusuma@dishub.sidoarjo.go.id',
                'role'    => 'supervisor',
                'wilayah' => 'Wilayah Barat',
                'nip'     => '197912202004011007',
            ],
            [
                'name'    => 'Fajar Nugroho',
                'email'   => 'fajar.nugroho@dishub.sidoarjo.go.id',
                'role'    => 'supervisor',
                'wilayah' => 'Wilayah Pusat & Timur',
                'nip'     => '198503102008011008',
            ],
        ];

        foreach ([...$petugas, ...$supervisors] as $data) {
            User::create([...$data, 'password' => $password]);
        }

        $this->command->info('✅ UserSeeder: ' . count($petugas) . ' petugas + ' . count($supervisors) . ' supervisor berhasil dibuat.');
        $this->command->info('   Password semua akun: password123');
    }
}
