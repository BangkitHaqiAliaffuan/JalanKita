import { createFileRoute, Link } from "@tanstack/react-router";
import { Icon } from "@/components/jk/Icon";
import { IMG_AI_PORONG } from "@/components/jk/images";
import { useState, Fragment } from "react";
import { AppLayout } from "@/components/jk/AppLayout";

export const Route = createFileRoute("/review")({
  component: ReviewPage,
  head: () => ({ meta: [{ title: "Review Laporan — JalanKita" }] }),
});

function ReviewPage() {
  const [priority, setPriority] = useState<"Rendah" | "Sedang" | "Tinggi">("Tinggi");
  return (
    <AppLayout>
      <div className="flex flex-col min-h-screen w-full">
        <header className="sticky top-0 z-40 bg-surface border-b border-border-subtle flex justify-between items-center px-4 h-14">
        <div className="flex items-center gap-3">
          <Link to="/supervisor"><Icon name="arrow_back" className="text-primary" /></Link>
          <h1 className="font-headline-sm text-[17px] font-bold text-on-surface">Review Laporan</h1>
        </div>
        <span className="font-id-code text-[12px] text-slate-400">LP-2026-006</span>
      </header>

      <section className="bg-surface-container-lowest px-4 py-3 flex items-center justify-between overflow-x-auto hide-scrollbar border-b border-border-subtle">
        {([
          { l: "Laporan Masuk", done: true },
          { l: "AI Selesai", done: true },
          { l: "Review", active: true },
          { l: "Disposisi" },
        ] as { l: string; done?: boolean; active?: boolean }[]).map((s, i, arr) => (
          <Fragment key={s.l}>
            <div className="flex flex-col items-center gap-1 min-w-[64px]">
              {s.done ? (
                <div className="w-5 h-5 rounded-full bg-selesai flex items-center justify-center">
                  <Icon name="check" className="!text-[14px] text-white" weight={700} />
                </div>
              ) : s.active ? (
                <div className="w-5 h-5 rounded-full bg-primary-container flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-border-subtle" />
              )}
              <span className={`font-label-sm text-[10px] text-center whitespace-nowrap ${s.active ? "text-primary-container font-bold" : s.done ? "text-on-surface-variant" : "text-slate-400"}`}>{s.l}</span>
            </div>
            {i < arr.length - 1 && <div className={`h-px flex-1 mx-1 min-w-[20px] ${s.done ? "bg-selesai" : s.active ? "bg-primary-container" : "bg-border-subtle"}`} />}
          </Fragment>
        ))}
      </section>

      <main className="flex-1 p-4 flex flex-col gap-4 pb-[120px]">
        <div className="bg-white rounded-xl border border-border-subtle p-4 shadow-sm">
          <h2 className="font-headline-sm text-base font-bold text-on-surface mb-3">Jl. Raya Porong No. 7</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-600">
              <Icon name="location_pin" className="!text-[18px]" />
              <span className="text-[13px]">Kec. Porong, Kab. Sidoarjo</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-slate-400">
                <Icon name="calendar_month" className="!text-[18px]" />
                <span className="text-[12px]">14 Mei 2026</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Icon name="person" className="!text-[18px]" />
                <span className="text-[12px]">Bambang Eko</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border-subtle overflow-hidden shadow-sm">
          <div className="relative aspect-video">
            <img className="w-full h-full object-cover" src={IMG_AI_PORONG} alt="Road damage" />
            <div className="absolute inset-0 border-4 border-yellow-400 rounded-lg m-8 pointer-events-none">
              <div className="absolute -top-7 left-0 bg-yellow-400 text-black font-bold text-[10px] px-2 py-0.5 rounded-t-sm">
                Lubang Besar (AI)
              </div>
            </div>
            <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
              <button className="w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg text-primary border border-white">
                <Icon name="visibility" className="!text-[20px]" />
              </button>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-label-md text-on-surface font-bold">Hasil Deteksi AI</h3>
              <span className="text-[11px] font-id-code text-slate-400">v1.2.0-engine</span>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-[11px] text-on-surface-variant mb-1">Jenis Kerusakan</p>
                <p className="text-sm font-semibold text-on-surface">Lubang Besar</p>
              </div>
              <div>
                <p className="text-[11px] text-on-surface-variant mb-1">Tingkat</p>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-error-container text-error border border-error/20">Rusak Berat</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <p className="text-[11px] text-on-surface-variant">Confidence</p>
                <p className="text-[11px] font-bold text-selesai">94.7%</p>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-selesai h-full rounded-full" style={{ width: "94.7%" }} />
              </div>
              <p className="text-[11px] font-id-code text-on-surface-variant mt-1">Estimasi Luas: 2.3 m²</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border-subtle p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Icon name="format_text_clip" className="text-primary" />
              <h3 className="font-label-md font-bold text-on-surface">Penilaian Supervisor</h3>
            </div>
            <span className="bg-orange-50 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded border border-orange-200 uppercase">Wajib Diisi</span>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-slate-600 mb-1.5">Konfirmasi Jenis Kerusakan</label>
              <select className="w-full h-11 border border-border-subtle rounded-lg px-3 text-sm bg-slate-50 focus:ring-1 focus:ring-primary outline-none">
                <option>Lubang Besar</option>
                <option>Retak Buaya</option>
                <option>Amblas</option>
                <option>Bergelombang</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-slate-600 mb-1.5">Konfirmasi Tingkat Keparahan</label>
              <select className="w-full h-11 border border-border-subtle rounded-lg px-3 text-sm bg-slate-50 focus:ring-1 focus:ring-primary outline-none">
                <option>Rusak Berat</option>
                <option>Rusak Sedang</option>
                <option>Rusak Ringan</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-slate-600 mb-2.5">Prioritas Penanganan</label>
              <div className="flex gap-2">
                {(["Rendah", "Sedang", "Tinggi"] as const).map((p) => {
                  const active = priority === p;
                  return (
                    <button
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`flex-1 py-2 text-[12px] font-semibold rounded-lg border ${
                        active ? (p === "Tinggi" ? "bg-rusak-berat text-white border-transparent shadow-sm" : "bg-primary-container text-white border-transparent shadow-sm") : "bg-white border-border-subtle text-slate-500"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-slate-600 mb-1.5">Catatan Supervisor</label>
              <textarea placeholder="Tambahkan instruksi khusus di sini..." className="w-full border border-border-subtle rounded-lg p-3 text-sm bg-slate-50 min-h-[80px] outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border-subtle p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="arrow_right_alt" className="text-primary" />
            <h3 className="font-label-md font-bold text-on-surface">Disposisi ke Unit</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-slate-600 mb-1.5">Unit/Tim Perbaikan</label>
              <select className="w-full h-11 border border-border-subtle rounded-lg px-3 text-sm bg-slate-50 focus:ring-1 focus:ring-primary outline-none">
                <option>Pilih Tim Pemeliharaan</option>
                <option>Dinas PUPR Sidoarjo (UPTD Wilayah Porong)</option>
                <option>URC Marka & Jalan Dishub</option>
                <option>Tim Reaksi Cepat (TRC) A</option>
                <option>Vendor Eksternal - PT. Aspal Jaya</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-slate-600 mb-1.5">Target Penyelesaian</label>
              <div className="relative">
                <input type="date" className="w-full h-11 border border-border-subtle rounded-lg px-3 text-sm bg-slate-50 focus:ring-1 focus:ring-primary outline-none" />
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="sticky bottom-0 bg-white border-t border-border-subtle p-4 flex gap-3 z-50">
        <button className="flex-1 h-tap-target-min border-2 border-rusak-berat text-rusak-berat font-bold rounded-xl text-sm active:scale-95 transition-all">
          Tolak Laporan
        </button>
        <Link to="/supervisor" className="flex-[2] h-tap-target-min bg-primary-container text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-all">
          <Icon name="check_circle" className="!text-[20px]" filled />
          Setujui & Disposisi
        </Link>
      </footer>
      </div>
    </AppLayout>
  );
}
