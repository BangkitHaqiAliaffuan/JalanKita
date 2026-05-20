import { createFileRoute, Link } from "@tanstack/react-router";
import { Icon } from "@/components/jk/Icon";
import { BottomNav } from "@/components/jk/BottomNav";
import { IMG_PROFILE, IMG_DAMAGE_SEVERE, IMG_DAMAGE_CRACK, IMG_DAMAGE_MINOR } from "@/components/jk/images";
import { AppLayout } from "@/components/jk/AppLayout";

export const Route = createFileRoute("/reports")({
  component: ReportsPage,
  head: () => ({ meta: [{ title: "Semua Laporan — JalanKita" }] }),
});

const CARDS = [
  { id: "LP-2024-006", street: "Jl. Raya Porong No. 7", area: "Kec. Porong, Sidoarjo", img: IMG_DAMAGE_SEVERE, sev: "RUSAK BERAT", sevCls: "bg-red-50 text-rusak-berat border-rusak-berat/20", icon: "warning", type: "Lubang Besar", date: "14 Mei 2024", status: "Menunggu Review", statusCls: "bg-primary-container/10 text-primary border-primary/10" },
  { id: "LP-2024-005", street: "Jl. Gajah Mada", area: "Kec. Sidoarjo", img: IMG_DAMAGE_CRACK, sev: "RUSAK SEDANG", sevCls: "bg-orange-50 text-rusak-sedang border-rusak-sedang/20", icon: "error", type: "Retak Buaya", date: "13 Mei 2024", status: "Selesai", statusCls: "bg-selesai/10 text-selesai border-selesai/10" },
  { id: "LP-2024-004", street: "Jl. Ahmad Yani", area: "Kec. Gedangan", img: IMG_DAMAGE_MINOR, sev: "RUSAK RINGAN", sevCls: "bg-amber-50 text-rusak-ringan border-rusak-ringan/20", icon: "info", type: "Gelombang", date: "12 Mei 2024", status: "Diproses", statusCls: "bg-secondary-container/40 text-on-secondary-container border-secondary-container" },
];

function ReportsPage() {
  return (
    <AppLayout>
      <div className="flex flex-col min-h-screen w-full">
      <header className="sticky top-0 left-0 right-0 z-50 bg-surface border-b border-border-subtle flex justify-between items-center h-12 px-4">
        <Link to="/home" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center overflow-hidden border border-border-subtle">
            <img alt="Supervisor" className="w-full h-full object-cover" src={IMG_PROFILE} />
          </div>
          <span className="font-headline-sm text-headline-sm font-bold text-primary">JalanKita</span>
        </Link>
        <button className="text-primary hover:bg-surface-container-low transition-colors p-2 rounded-full">
          <Icon name="notifications" />
        </button>
      </header>

      <main className="pt-14 pb-24 px-margin-mobile flex flex-col gap-4">
        <section className="pt-2 flex flex-col gap-2">
          <h1 className="font-headline-md text-headline-md font-bold text-primary">Semua Laporan</h1>
          <div className="flex items-center gap-2 px-3 py-2 bg-primary-container text-on-primary rounded-xl w-fit">
            <Icon name="analytics" className="!text-[20px]" />
            <span className="font-label-md text-label-md font-medium">124 Total Laporan</span>
          </div>
        </section>

        <section className="relative">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input className="w-full h-tap-target-min pl-10 pr-4 bg-white border border-border-subtle rounded-xl text-body-md focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="Cari ID atau Nama Jalan..." />
        </section>

        <section className="flex items-center gap-2 overflow-x-auto hide-scrollbar -mx-margin-mobile px-margin-mobile">
          <button className="flex-shrink-0 flex items-center gap-1.5 px-4 h-9 bg-white border border-border-subtle rounded-full text-on-surface-variant font-label-md">
            <Icon name="tune" className="!text-[18px]" />
            <span>Filter</span>
          </button>
          <div className="h-6 w-px bg-border-subtle flex-shrink-0 mx-1" />
          {["Semua", "Menunggu", "Diproses", "Selesai"].map((t, i) => (
            <button key={t} className={`flex-shrink-0 px-4 h-9 rounded-full font-label-md ${i === 0 ? "bg-primary text-white" : "bg-white border border-border-subtle text-on-surface-variant"}`}>{t}</button>
          ))}
        </section>

        <div className="flex flex-col gap-4 mt-2">
          {CARDS.map((c) => (
            <Link to="/review" key={c.id} className="bg-white border border-border-subtle rounded-xl p-4 flex flex-col gap-3 active:scale-[0.98] transition-transform">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="font-id-code text-id-code text-on-surface-variant tracking-wider">{c.id}</span>
                  <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mt-0.5 leading-tight">{c.street}</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">{c.area}</p>
                </div>
                <div className="w-16 h-16 rounded-lg overflow-hidden border border-border-subtle flex-shrink-0">
                  <img className="w-full h-full object-cover" src={c.img} alt={c.street} />
                </div>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border font-label-sm font-bold ${c.sevCls}`}>
                  <Icon name={c.icon} className="!text-[14px]" filled />
                  {c.sev}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant border border-border-subtle font-label-sm uppercase">
                  {c.type}
                </span>
              </div>
              <div className="pt-3 border-t border-border-subtle flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-on-surface-variant">
                  <Icon name="calendar_today" className="!text-[16px]" />
                  <span className="text-label-md">{c.date}</span>
                </div>
                <span className={`px-3 py-1 rounded-full font-label-md border ${c.statusCls}`}>{c.status}</span>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <BottomNav />
      </div>
    </AppLayout>
  );
}
