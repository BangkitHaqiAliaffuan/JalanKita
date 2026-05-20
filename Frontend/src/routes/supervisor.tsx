import { createFileRoute, Link } from "@tanstack/react-router";
import { Icon } from "@/components/jk/Icon";
import { BottomNav } from "@/components/jk/BottomNav";
import { AppLayout } from "@/components/jk/AppLayout";

export const Route = createFileRoute("/supervisor")({
  component: SupervisorPage,
  head: () => ({ meta: [{ title: "Beranda Supervisor — JalanKita" }] }),
});

function SupervisorPage() {
  return (
    <AppLayout>
      <div className="flex flex-col min-h-screen w-full pb-24">
      <header className="flex justify-between items-center h-14 px-4 sticky top-0 z-40 bg-surface border-b border-border-subtle">
        <h1 className="text-headline-sm font-headline-sm font-bold text-primary-container">JalanKita</h1>
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-center w-tap-target-min h-tap-target-min">
            <Icon name="notifications" className="text-on-surface-variant" />
            <span className="absolute top-2 right-2 w-4 h-4 bg-error text-[10px] text-white flex items-center justify-center rounded-full font-bold">3</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-xs">BS</div>
        </div>
      </header>

      <section className="bg-[#E8F0FA] px-margin-mobile py-lg">
        <h2 className="text-headline-sm font-headline-sm font-bold text-primary">Selamat pagi, Budi Santoso</h2>
        <div className="flex items-center gap-2 mt-1">
          <span className="px-2 py-0.5 bg-selesai/10 text-selesai text-label-sm font-bold rounded border border-selesai/20 uppercase tracking-wide">Supervisor</span>
          <span className="text-on-surface-variant text-label-md font-label-md">· Wilayah Utara</span>
        </div>
      </section>

      <section className="px-margin-mobile -mt-4">
        <div className="grid grid-cols-2 gap-3">
          {[
            { l: "Total Laporan Zona", v: 23, c: "text-primary-container" },
            { l: "Menunggu Review", v: 7, c: "text-rusak-sedang", pulse: true },
            { l: "Rusak Berat", v: 5, c: "text-rusak-berat" },
            { l: "Selesai", v: 11, c: "text-selesai" },
          ].map((m) => (
            <div key={m.l} className="bg-surface-container-lowest border border-border-subtle p-md rounded-xl shadow-sm relative overflow-hidden">
              {m.pulse && <div className="absolute top-2 right-2 w-2 h-2 bg-rusak-sedang rounded-full animate-pulse" />}
              <p className="text-on-surface-variant text-label-sm font-label-sm mb-1">{m.l}</p>
              <p className={`text-headline-md font-headline-md font-bold ${m.c}`}>{m.v}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-margin-mobile mt-xl">
        <div className="flex justify-between items-center mb-md">
          <h3 className="text-headline-sm font-headline-sm font-bold text-primary">Menunggu Review</h3>
          <Link to="/reports" className="text-primary text-label-md font-bold">Lihat Semua</Link>
        </div>
        <div className="flex flex-col gap-3">
          {[
            { id: "LP-2024-006", street: "Jl. Raya Porong No. 7", reporter: "Bambang Eko", sev: "Rusak Berat", bar: "bg-rusak-berat", chip: "text-rusak-berat bg-rusak-berat/10", action: true },
            { id: "LP-2024-007", street: "Jl. Raya Krian No. 31", reporter: "Dewi Rahayu", sev: "Rusak Sedang", bar: "bg-rusak-sedang", chip: "text-rusak-sedang bg-rusak-sedang/10" },
            { id: "LP-2024-010", street: "Jl. Raya Sedati", reporter: "Rizky Firmansyah", sev: "Rusak Ringan", bar: "bg-rusak-ringan", chip: "text-rusak-ringan bg-rusak-ringan/10" },
          ].map((c) => (
            <div key={c.id} className="bg-surface-container-lowest border border-border-subtle rounded-xl overflow-hidden shadow-sm flex">
              <div className={`w-1.5 ${c.bar}`} />
              <div className="p-md flex-1">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-id-code text-id-code text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded">{c.id}</span>
                  <span className={`${c.chip} text-label-sm font-bold px-2 py-0.5 rounded`}>{c.sev}</span>
                </div>
                <h4 className="text-body-lg font-bold text-on-surface mb-1">{c.street}</h4>
                <div className="flex items-center gap-1 text-on-surface-variant text-label-md mb-3">
                  <Icon name="person" className="!text-[16px]" />
                  <span>Pelapor: {c.reporter}</span>
                </div>
                {c.action && (
                  <Link to="/review" className="flex items-center gap-2 text-primary-container font-bold text-label-md">
                    Review Sekarang
                    <Icon name="arrow_forward" className="!text-[18px]" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-margin-mobile mt-xl mb-xl">
        <h3 className="text-headline-sm font-headline-sm font-bold text-primary mb-md">Aktivitas Tim</h3>
        <div className="bg-surface-container-lowest border border-border-subtle rounded-xl shadow-sm">
          {[
            { icon: "assignment_turned_in", bg: "bg-secondary-container text-on-secondary-container", txt: <><b>Rizky</b> memperbarui status <b>Selesai</b> pada LP-2024-002.</>, time: "2 menit yang lalu" },
            { icon: "photo_camera", bg: "bg-tertiary-fixed text-on-tertiary-fixed", txt: <><b>Dewi</b> mengunggah foto penanganan di <b>Jl. Krian</b>.</>, time: "15 menit yang lalu" },
            { icon: "warning", bg: "bg-error-container text-on-error-container", txt: <><b>Bambang</b> melaporkan kerusakan baru <b>Rusak Berat</b>.</>, time: "45 menit yang lalu" },
          ].map((a, i) => (
            <div key={i} className="flex items-start gap-3 p-md border-b border-border-subtle last:border-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${a.bg}`}>
                <Icon name={a.icon} />
              </div>
              <div className="flex-1">
                <p className="text-body-md text-on-surface leading-tight">{a.txt}</p>
                <p className="text-label-sm text-outline mt-1">{a.time}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <BottomNav />
      </div>
    </AppLayout>
  );
}
