<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * Model User untuk autentikasi JalanKita.
 *
 * @property int         $id
 * @property string      $name
 * @property string      $email
 * @property string      $role        'petugas' | 'supervisor'
 * @property string|null $wilayah     Wilayah tugas
 * @property string|null $nip         Nomor Induk Pegawai
 * @property string      $password    Bcrypt hashed
 */
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'wilayah',
        'nip',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
        ];
    }

    // ── Helper ────────────────────────────────────────────────────────────

    /**
     * Inisial nama untuk avatar (maks 2 huruf).
     * Contoh: "Agus Setiawan" → "AS"
     */
    public function getInitialsAttribute(): string
    {
        $words = explode(' ', trim($this->name));
        if (count($words) >= 2) {
            return strtoupper(substr($words[0], 0, 1) . substr($words[1], 0, 1));
        }
        return strtoupper(substr($this->name, 0, 2));
    }

    /**
     * Label role yang ramah untuk ditampilkan di UI.
     */
    public function getRoleLabelAttribute(): string
    {
        return match ($this->role) {
            'supervisor' => 'Supervisor',
            default      => 'Petugas Lapangan',
        };
    }
}
