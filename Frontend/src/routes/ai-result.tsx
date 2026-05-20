import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Icon } from "@/components/jk/Icon";
import { TopBar } from "@/components/jk/TopBar";
import { AppLayout } from "@/components/jk/AppLayout";
import { getAiResult, getFormData, SEVERITY_CONFIG, type Detection } from "@/lib/aiStore";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/ai-result")({
  component: AiResultPage,
  head: () => ({ meta: [{ title: "Hasil Deteksi AI — JalanKita" }] }),
});

// Warna bounding box per kelas (sesuai server.py)
const CLASS_COLORS: Record<string, string> = {
  "Lubang Besar":      "#C85000",
  "Lubang Kecil":      "#00A0C8",
  "Retak Kulit Buaya": "#C87800",
  "Retak Memanjang":   "#A000A0",
};

function SeverityBadge({ severity }: { severity: string }) {
  const cfg = SEVERITY_CONFIG[severity] ?? SEVERITY_CONFIG["Baik"];
  return (
    <span className={`px-3 py-1 rounded-full font-label-md text-[12px] font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {cfg.label}
    </span>
  );
}

function DetectionCard({ det, index }: { det: Detection; index: number }) {
  const color = CLASS_COLORS[det.class] ?? "#6B7280";
  const pct = Math.round(det.confidence * 100);
  return (
    <div className="flex items-start gap-3 p-3 bg-surface-container rounded-xl border border-border-subtle">
      <div
        className="w-3 h-3 rounded-full shrink-0 mt-1"
        style={{ backgroundColor: color }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="font-label-md text-[13px] font-bold text-on-surface truncate">
            #{index + 1} {det.class}
          </span>
          <SeverityBadge severity={det.severity} />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-selesai"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="font-id-code text-[11px] text-on-surface-variant shrink-0">
            {pct}%
          </span>
        </div>
        <p className="font-id-code text-[10px] text-on-surface-variant mt-1">
          bbox: ({det.bbox.x1}, {det.bbox.y1}) → ({det.bbox.x2}, {det.bbox.y2})
        </p>
      </div>
    </div>
  );
}

function AiResultPage() {
  const navigate = useNavigate();
  const result = getAiResult();
  const formData = getFormData();
  const [imgError, setImgError] = useState(false);

  // Jika tidak ada hasil (misal akses langsung ke URL), redirect ke upload
  useEffect(() => {
    if (!result) {
      navigate({ to: "/upload" });
    }
  }, [result, navigate]);

  if (!result || !formData) {
    return (
      <AppLayout>
        <div className="flex flex-col min-h-screen w-full items-center justify-center gap-4 p-8">
          <Icon name="hourglass_empty" className="text-on-surface-variant !text-[48px]" />
          <p className="font-body-md text-body-md text-on-surface-variant text-center">
            Tidak ada hasil analisis. Silakan upload foto terlebih dahulu.
          </p>
          <Link
            to="/upload"
            className="h-11 px-6 bg-primary-container text-white rounded-xl flex items-center gap-2 font-label-md text-[14px] font-bold"
          >
            <Icon name="arrow_back" className="!text-[18px]" />
            Kembali ke Upload
          </Link>
        </div>
      </AppLayout>
    );
  }

  const hasDetections = result.total > 0;
  const overallCfg = SEVERITY_CONFIG[result.overall_severity] ?? SEVERITY_CONFIG["Baik"];

  return (
    <AppLayout>
      <div className="flex flex-col min-h-screen w-full">
        <TopBar
          title="Hasil Deteksi AI"
          back="/upload"
          right={
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low">
              <Icon name="share" className="text-on-surface-variant" />
            </button>
          }
        />

        <main className="flex-1 overflow-y-auto px-4 pt-4 pb-6 w-full">
          <div style={{ maxWidth: "42rem", marginLeft: "auto", marginRight: "auto" }} className="flex flex-col gap-4">

            {/* ── Gambar Hasil Deteksi (dengan bounding box dari server) ── */}
            <section className="bg-surface-container-lowest border border-border-subtle rounded-xl overflow-hidden shadow-sm">
              <div className="relative w-full bg-surface-container-high">
                {!imgError ? (
                  <img
                    src={`data:image/jpeg;base64,${result.image_result}`}
                    alt="Hasil deteksi AI dengan bounding box"
                    className="w-full object-contain max-h-[400px]"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="w-full h-48 flex items-center justify-center text-on-surface-variant">
                    <Icon name="broken_image" className="!text-[48px]" />
                  </div>
                )}

                {/* Overall severity badge overlay */}
                <div className="absolute top-3 left-3">
                  <span className={`px-3 py-1.5 rounded-lg font-label-md text-[12px] font-bold border shadow-sm ${overallCfg.bg} ${overallCfg.text} ${overallCfg.border}`}>
                    {result.overall_severity}
                  </span>
                </div>

                {/* Detection count badge */}
                <div className="absolute top-3 right-3 bg-black/60 text-white px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                  <Icon name="search" className="!text-[14px]" />
                  <span className="font-label-md text-[12px] font-bold">
                    {result.total} deteksi
                  </span>
                </div>
              </div>

              {/* Summary stats */}
              <div className="p-4 grid grid-cols-2 gap-3 border-t border-border-subtle">
                <div className="flex flex-col gap-0.5">
                  <span className="font-label-sm text-[11px] text-on-surface-variant">Total Kerusakan</span>
                  <span className="font-headline-sm text-[18px] font-bold text-on-surface">
                    {result.total} titik
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-label-sm text-[11px] text-on-surface-variant">Tingkat Keparahan</span>
                  <SeverityBadge severity={result.overall_severity} />
                </div>
              </div>
            </section>

            {/* ── Daftar Deteksi ── */}
            {hasDetections ? (
              <section className="bg-surface-container-lowest border border-border-subtle rounded-xl p-4 flex flex-col gap-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <Icon name="manage_search" className="text-primary !text-[20px]" />
                  <h3 className="font-headline-sm text-[14px] font-bold text-on-surface">
                    Detail Deteksi
                  </h3>
                </div>
                <div className="flex flex-col gap-2">
                  {result.detections.map((det, i) => (
                    <DetectionCard key={i} det={det} index={i} />
                  ))}
                </div>
              </section>
            ) : (
              <section className="bg-[#D1FAE5] border border-[#6EE7B7] rounded-xl p-4 flex gap-3 items-start">
                <Icon name="check_circle" className="text-[#065F46] !text-[22px] shrink-0" filled />
                <div>
                  <p className="font-label-md text-[13px] font-bold text-[#065F46]">Tidak Ada Kerusakan Terdeteksi</p>
                  <p className="font-body-md text-[12px] text-[#065F46]/80 mt-0.5">
                    AI tidak menemukan kerusakan pada foto ini. Kondisi jalan terlihat baik.
                  </p>
                </div>
              </section>
            )}

            {/* ── Informasi Lokasi ── */}
            <section className="bg-surface-container-lowest border border-border-subtle rounded-xl p-4 flex flex-col gap-2 shadow-sm">
              <div className="flex items-center gap-2">
                <Icon name="location_on" className="text-primary !text-[20px]" filled />
                <h3 className="font-headline-sm text-[14px] font-bold text-primary">Lokasi Laporan</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-1">
                <div>
                  <p className="font-label-sm text-[11px] text-on-surface-variant mb-0.5">Nama Jalan</p>
                  <p className="font-label-md text-[13px] font-semibold text-on-surface">{formData.namaJalan}</p>
                </div>
                <div>
                  <p className="font-label-sm text-[11px] text-on-surface-variant mb-0.5">Kecamatan</p>
                  <p className="font-label-md text-[13px] font-semibold text-on-surface">Kec. {formData.kecamatan}</p>
                </div>
                <div>
                  <p className="font-label-sm text-[11px] text-on-surface-variant mb-0.5">Tanggal</p>
                  <p className="font-label-md text-[13px] font-semibold text-on-surface">{formData.tanggal}</p>
                </div>
                <div>
                  <p className="font-label-sm text-[11px] text-on-surface-variant mb-0.5">File Foto</p>
                  <p className="font-id-code text-[11px] text-on-surface truncate">{formData.fileName}</p>
                </div>
              </div>
              {formData.catatan && (
                <div className="mt-1 pt-3 border-t border-border-subtle">
                  <p className="font-label-sm text-[11px] text-on-surface-variant mb-0.5">Catatan</p>
                  <p className="font-body-md text-[13px] text-on-surface">{formData.catatan}</p>
                </div>
              )}
            </section>

            {/* ── Disclaimer ── */}
            <div className="flex items-start gap-2 bg-[#FEF3C7] border border-[#FCD34D] rounded-xl px-4 py-3">
              <Icon name="warning" className="text-[#92400E] !text-[20px] shrink-0 mt-0.5" />
              <p className="font-label-md text-[12px] text-[#92400E] leading-relaxed">
                Hasil ini merupakan deteksi awal AI (confidence threshold 60%). Mohon verifikasi sebelum membuat laporan resmi.
              </p>
            </div>

            {/* ── Action Buttons ── */}
            <div className="flex flex-col gap-3 pb-4">
              <Link
                to="/create-report"
                className="w-full h-[52px] bg-primary-container text-white rounded-xl flex items-center justify-center gap-2 font-headline-sm text-[15px] font-bold active:scale-[0.98] transition-transform shadow-md shadow-primary-container/20"
              >
                <Icon name="check_circle" className="!text-[20px]" />
                Konfirmasi & Buat Laporan
              </Link>
              <button
                type="button"
                onClick={() => navigate({ to: "/upload" })}
                className="w-full h-[48px] border border-primary-container text-primary-container rounded-xl flex items-center justify-center gap-2 font-label-md text-[14px] font-bold hover:bg-primary-container/5 transition-colors"
              >
                <Icon name="refresh" className="!text-[20px]" />
                Analisis Ulang dengan Foto Baru
              </button>
            </div>

          </div>
        </main>
      </div>
    </AppLayout>
  );
}
