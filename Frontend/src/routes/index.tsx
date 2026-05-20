import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Icon } from "@/components/jk/Icon";
import { useState, useEffect } from "react";
import { saveAuth, isLoggedIn, getCurrentUser } from "@/lib/auth";

export const Route = createFileRoute("/")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Masuk — JalanKita" },
      { name: "description", content: "Masuk ke JalanKita — sistem pelaporan kerusakan jalan Dinas Perhubungan Sidoarjo." },
    ],
  }),
});

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  // Jika sudah login, redirect langsung
  useEffect(() => {
    if (isLoggedIn()) {
      const user = getCurrentUser();
      navigate({ to: user?.role === "supervisor" ? "/supervisor" : "/home" });
    }
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message ?? "Login gagal. Periksa email dan kata sandi.");
        return;
      }

      saveAuth(data.user, data.token);

      if (data.user.role === "supervisor") {
        navigate({ to: "/supervisor" });
      } else {
        navigate({ to: "/home" });
      }
    } catch {
      setError("Tidak dapat terhubung ke server. Pastikan server berjalan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    // ── Fullscreen background ──────────────────────────────────────────────
    // overflow-y-auto + py-8 memastikan card tidak mentok atas/bawah
    // dan bisa di-scroll jika layar terlalu pendek
    <div
      className="fixed inset-0 w-full h-full overflow-y-auto"
      style={{
        backgroundImage: "url('/background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay gelap */}
      <div className="absolute inset-0 bg-black/50 pointer-events-none" />

      {/* Wrapper — min-h-full + py-8 agar card selalu punya jarak dari tepi atas/bawah */}
      <div className="relative z-10 min-h-full flex items-center justify-center py-8 px-4">

        {/* ── Login Card ─────────────────────────────────────────────── */}
        <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-2xl overflow-hidden">

          {/* Header card — logo + nama app */}
          <div className="flex flex-col items-center pt-6 pb-4 px-8 border-b border-slate-100">
            <div className="w-12 h-12 bg-primary-container rounded-xl flex items-center justify-center mb-3 shadow-md shadow-primary-container/30">
              <Icon name="edit_road" className="text-white !text-[28px]" />
            </div>
            <h1
              className="text-[20px] font-extrabold text-[#0F172A] leading-tight"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              JalanKita
            </h1>
            <p className="text-[12px] text-[#64748B] mt-0.5">
              Deteksi Cepat, Penanganan Tepat
            </p>
          </div>

          {/* Form body */}
          <div className="px-8 pt-5 pb-6">
            <div className="mb-4">
              <h2
                className="text-[18px] font-bold text-[#0F172A]"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Selamat Datang
              </h2>
              <p className="text-[12px] text-[#64748B] mt-0.5">
                Masuk dengan akun Dishub Sidoarjo Anda
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-4 flex items-start gap-2 bg-[#FEE2E2] border border-[#FCA5A5] rounded-xl px-3 py-2.5">
                <Icon name="error" className="text-[#991B1B] !text-[18px] shrink-0 mt-0.5" />
                <p className="text-[12px] text-[#991B1B] leading-relaxed">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-[#374151]">Email</label>
                <div className="relative flex items-center">
                  <Icon name="mail" className="absolute left-3 text-[#9CA3AF] !text-[18px]" />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@dishub.sidoarjo.go.id"
                    autoComplete="email"
                    className="w-full py-3 pl-10 pr-4 border border-[#E5E7EB] rounded-xl text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-primary-container/25 focus:border-primary-container transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-[#374151]">Kata Sandi</label>
                <div className="relative flex items-center">
                  <input
                    required
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi"
                    autoComplete="current-password"
                    className="w-full py-3 pl-4 pr-11 border border-[#E5E7EB] rounded-xl text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-primary-container/25 focus:border-primary-container transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
                    aria-label={showPw ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  >
                    <Icon name={showPw ? "visibility_off" : "visibility"} className="!text-[20px]" />
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[48px] bg-primary-container text-white rounded-xl text-[15px] font-semibold flex items-center justify-center gap-2 mt-1 shadow-md shadow-primary-container/25 hover:bg-primary-container/90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Memverifikasi...
                  </>
                ) : (
                  <>
                    <Icon name="login" className="!text-[20px]" />
                    Masuk
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer card */}
          <div className="px-8 py-3 bg-[#F8FAFC] border-t border-slate-100">
            <p className="text-[10px] text-[#9CA3AF] text-center uppercase tracking-widest">
              Dinas Perhubungan Kabupaten Sidoarjo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
