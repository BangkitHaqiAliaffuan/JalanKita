import { createFileRoute, Link } from "@tanstack/react-router";
import { Icon } from "@/components/jk/Icon";
import { BottomNav } from "@/components/jk/BottomNav";
import { IMG_JENGGOLO, IMG_TAMAN, IMG_PAHLAWAN, IMG_LINGKAR } from "@/components/jk/images";
import { AppLayout } from "@/components/jk/AppLayout";

export const Route = createFileRoute("/my-reports")({
  component: MyReportsPage,
  head: () => ({ meta: [{ title: "Laporan Saya — JalanKita" }] }),
});

const CARDS = [
  { id: "LP-2024-001", date: "12 Mar 2024", street: "Jl. Jenggolo No. 5", area: "Kec. Sidoarjo", img: IMG_JENGGOLO, sev: "Rusak Berat", sevCls: "bg-error-container text-error border-rusak-berat/20", status: "Diproses", statusCls: "bg-secondary-container text-on-secondary-container border-secondary-container" },
  { id: "LP-2024-004", date: "14 Mar 2024", street: "Jl. Raya Taman No. 14", area: "Kec. Taman", img: IMG_TAMAN, sev: "Rusak Berat", sevCls: "bg-error-container text-error border-rusak-berat/20", status: "Menunggu Review", statusCls: "bg-surface-variant text-on-surface-variant border-outline-variant" },
  { id: "LP-2024-002", date: "10 Mar 2024", street: "Jl. Pahlawan No. 23", area: "Kec. Sidoarjo", img: IMG_PAHLAWAN, sev: "Rusak Sedang", sevCls: "bg-orange-100 text-rusak-sedang border-rusak-sedang/20", status: "Selesai", statusCls: "bg-emerald-100 text-selesai border-selesai/20" },
  { id: "LP-2024-008", date: "08 Mar 2024", street: "Jl. Lingkar Barat", area: "Kec. Sukodono", img: IMG_LINGKAR, sev: "Rusak Ringan", sevCls: "bg-amber-100 text-rusak-ringan border-rusak-ringan/20", status: "Selesai", statusCls: "bg-emerald-100 text-selesai border-selesai/20" },
];

function MyReportsPage() {
  return (
    <AppLayout>
      <div className="flex flex-col min-h-screen w-full">
      <header className="sticky top-0 z-40 flex justify-between items-center px-4 py-2 bg-surface-container-lowest border-b border-border-subtle h-[60px]">
        <div className="w-10" />
        <h1 className="font-headline-sm text-headline-sm font-semibold text-primary">Laporan Saya</h1>
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low">
          <Icon name="filter_list" className="text-on-surface-variant" />
        </button>
      </header>

      <section className="px-margin-mobile pt-md">
        <div className="relative flex items-center">
          <Icon name="search" className="absolute left-4 text-on-surface-variant" />
          <input className="w-full bg-[#F1F5F9] border-none rounded-xl h-12 pl-12 pr-4 font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary" placeholder="Cari ID atau nama jalan..." />
        </div>
      </section>

      <section className="px-margin-mobile py-md">
        <div className="flex bg-surface-container-low p-1 rounded-xl">
          <button className="flex-1 py-2 text-center rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm">Milik Saya</button>
          <Link to="/reports" className="flex-1 py-2 text-center rounded-lg text-on-surface-variant font-label-md text-label-md">Semua Laporan</Link>
        </div>
      </section>

      <section className="flex overflow-x-auto gap-2 px-margin-mobile py-md no-scrollbar">
        {["Semua", "Rusak Berat", "Rusak Sedang", "Rusak Ringan", "Diproses", "Selesai"].map((t, i) => (
          <button key={t} className={`whitespace-nowrap px-4 py-2 rounded-full font-label-md text-label-md active:scale-95 transition-transform ${i === 0 ? "bg-primary text-on-primary" : "bg-surface-container-lowest border border-border-subtle text-on-surface-variant"}`}>{t}</button>
        ))}
      </section>

      <div className="px-margin-mobile mb-sm">
        <p className="font-label-md text-label-md text-on-surface-variant">12 laporan Anda</p>
      </div>

      <main className="px-margin-mobile flex flex-col gap-md pb-28">
        {CARDS.map((c) => (
          <Link to="/review" key={c.id} className="bg-surface-container-lowest rounded-xl border border-border-subtle p-md shadow-sm hover:border-primary-container transition-all">
            <div className="flex justify-between items-start mb-sm">
              <span className="font-id-code text-id-code text-primary font-bold">{c.id}</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">{c.date}</span>
            </div>
            <div className="flex gap-md mb-md">
              <div className="w-16 h-16 rounded-lg bg-surface-container overflow-hidden flex-shrink-0">
                <img className="w-full h-full object-cover" src={c.img} alt={c.street} />
              </div>
              <div className="flex-grow">
                <h3 className="font-headline-sm text-[15px] font-bold text-on-surface leading-tight mb-1">{c.street}</h3>
                <p className="font-body-md text-[13px] text-on-surface-variant">{c.area}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={`px-2.5 py-1 rounded-full font-label-sm text-label-sm border ${c.sevCls}`}>{c.sev}</span>
              <span className={`px-2.5 py-1 rounded-full font-label-sm text-label-sm border ${c.statusCls}`}>{c.status}</span>
            </div>
          </Link>
        ))}
      </main>
      <BottomNav />
      </div>
    </AppLayout>
  );
}
