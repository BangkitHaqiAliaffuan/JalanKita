<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Menambahkan kolom role, wilayah, dan nip ke tabel users.
 *
 * Role yang didukung:
 * - petugas    : Petugas lapangan, bisa upload & buat laporan
 * - supervisor : Supervisor wilayah, bisa review & approve laporan
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Role pengguna — default petugas
            $table->enum('role', ['petugas', 'supervisor'])->default('petugas')->after('email');

            // Wilayah tugas (kecamatan untuk petugas, wilayah untuk supervisor)
            $table->string('wilayah', 100)->nullable()->after('role');

            // NIP (Nomor Induk Pegawai) — opsional
            $table->string('nip', 20)->nullable()->after('wilayah');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'wilayah', 'nip']);
        });
    }
};
