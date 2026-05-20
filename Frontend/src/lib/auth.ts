// ── Auth Store — JalanKita ────────────────────────────────────────────────
// Menyimpan state autentikasi user di memory + localStorage untuk persistensi.
// Role ditentukan otomatis dari response API — tidak perlu dipilih manual.

export type UserRole = 'petugas' | 'supervisor';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  role_label: string;
  wilayah: string | null;
  nip: string | null;
  initials: string;
}

// ── Storage keys ──────────────────────────────────────────────────────────
const TOKEN_KEY = 'jalankita_token';
const USER_KEY  = 'jalankita_user';

// ── In-memory cache (untuk akses sinkron tanpa parse JSON berulang) ───────
let _currentUser: User | null = null;
let _token: string | null = null;

// ── Inisialisasi dari localStorage saat module pertama kali dimuat ────────
function init() {
  if (typeof window === 'undefined') return; // SSR guard
  try {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser  = localStorage.getItem(USER_KEY);
    if (storedToken && storedUser) {
      _token       = storedToken;
      _currentUser = JSON.parse(storedUser) as User;
    }
  } catch {
    // localStorage corrupt — clear it
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

init();

// ── Setters ───────────────────────────────────────────────────────────────

/**
 * Simpan user dan token setelah login berhasil.
 * Dipanggil dari login page setelah menerima response API.
 */
export function saveAuth(user: User, token: string): void {
  _currentUser = user;
  _token       = token;
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

/**
 * Hapus semua data auth (logout).
 */
export function clearAuth(): void {
  _currentUser = null;
  _token       = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

// ── Getters ───────────────────────────────────────────────────────────────

export function getCurrentUser(): User | null {
  return _currentUser;
}

export function getToken(): string | null {
  return _token;
}

export function isLoggedIn(): boolean {
  return _currentUser !== null && _token !== null;
}

// ── Backward compat (dipakai di beberapa tempat lama) ─────────────────────
/** @deprecated Gunakan saveAuth() */
export function setCurrentUser(role: UserRole): void {
  // no-op — kept for backward compat, login page sekarang pakai saveAuth()
}
