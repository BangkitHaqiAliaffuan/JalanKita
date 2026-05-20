import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Icon } from "@/components/jk/Icon";
import { TopBar } from "@/components/jk/TopBar";
import { AppLayout } from "@/components/jk/AppLayout";
import { FraudWarningModal } from "@/components/jk/FraudWarningModal";
import { useRef, useState, useCallback } from "react";
import { setAiResult, setFormData, API_BASE_URL } from "@/lib/aiStore";
import {
  useLocationFromPhoto,
  type GpsStatus,
} from "@/hooks/useLocationFromPhoto";
import {
  validatePhotoDate,
  type PhotoDateValidationStatus,
} from "@/lib/validatePhotoDate";

export const Route = createFileRoute("/upload")({
  component: UploadPage,
  head: () => ({ meta: [{ title: "Upload & Analisis — JalanKita" }] }),
});

const TODAY = new Date().toISOString().split("T")[0];

const KECAMATAN_LIST = [
  { group: "Pusat",   items: ["Sidoarjo"] },
  { group: "Utara",   items: ["Buduran", "Gedangan", "Sedati", "Waru"] },
  { group: "Barat",   items: ["Taman", "Krian", "Balongbendo", "Wonoayu", "Sukodono"] },
  { group: "Timur",   items: ["Candi", "Tarik", "Prambon"] },
  { group: "Selatan", items: ["Porong", "Krembung", "Tulangan", "Tanggulangin", "Jabon"] },
];

const ALL_KECAMATAN = KECAMATAN_LIST.flatMap((g) => g.items);

type AnalysisState = "idle" | "loading" | "error";

// ── GPS Status Banner ──────────────────────────────────────────────────────

function GpsBanner({
  status,
  message,
  lat,
  lng,
}: {
  status: GpsStatus;
  message: string;
  lat: number | null;
  lng: number | null;
}) {
  if (status === "idle") return null;

  const variants: Record<
    string,
    { bg: string; border: string; text: string; icon: string }
  > = {
    detecting: {
      bg: "bg-[#EFF6FF]", border: "border-[#93C5FD]",
      text: "text-[#1E40AF]", icon: "gps_fixed",
    },
    geocoding: {
      bg: "bg-[#EFF6FF]", border: "border-[#93C5FD]",
      text: "text-[#1E40AF]", icon: "travel_explore",
    },
    success: {
      bg: "bg-[#D1FAE5]", border: "border-[#6EE7B7]",
      text: "text-[#065F46]", icon: "check_circle",
    },
    exif_no_gps: {
      bg: "bg-[#FEF3C7]", border: "border-[#FCD34D]",
      text: "text-[#92400E]", icon: "info",
    },
    permission_denied: {
      bg: "bg-[#FEE2E2]", border: "border-[#FCA5A5]",
      text: "text-[#991B1B]", icon: "location_off",
    },
    timeout: {
      bg: "bg-[#FEF3C7]", border: "border-[#FCD34D]",
      text: "text-[#92400E]", icon: "timer_off",
    },
    error: {
      bg: "bg-[#FEE2E2]", border: "border-[#FCA5A5]",
      text: "text-[#991B1B]", icon: "error",
    },
  };

  const v = variants[status] ?? variants.error;
  const isSpinning = status === "detecting" || status === "geocoding";

  return (
    <div className={`flex items-start gap-2.5 ${v.bg} border ${v.border} rounded-xl px-4 py-3`}>
      {isSpinning ? (
        <span className={`w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin shrink-0 mt-0.5 ${v.text}`} />
      ) : (
        <Icon name={v.icon} className={`${v.text} !text-[20px] shrink-0 mt-0.5`} filled={status === "success"} />
      )}
      <div className="flex-1 min-w-0">
        <p className={`font-label-md text-[12px] leading-relaxed ${v.text}`}>{message}</p>
        {status === "success" && lat !== null && lng !== null && (
          <p className={`font-id-code text-[10px] mt-0.5 ${v.text} opacity-70`}>
            {lat.toFixed(6)}, {lng.toFixed(6)}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

function UploadPage() {
  const navigate = useNavigate();

  // Dua input terpisah: kamera dan galeri
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl]     = useState<string | null>(null);
  const [namaJalan, setNamaJalan]       = useState("");
  const [kecamatan, setKecamatan]       = useState("Sidoarjo");
  const [tanggal, setTanggal]           = useState(TODAY);
  const [catatan, setCatatan]           = useState("");

  // Analysis state
  const [analysisState, setAnalysisState] = useState<AnalysisState>("idle");
  const [errorMsg, setErrorMsg]           = useState("");

  // Anti-fraud modal state
  const [fraudModal, setFraudModal] = useState<{
    isOpen: boolean;
    status: PhotoDateValidationStatus;
    title: string;
    message: string;
  }>({
    isOpen: false,
    status: "no_exif_date",
    title: "",
    message: "",
  });

  // ── Callbacks untuk hook lokasi ──────────────────────────────────────────

  const handleLocationResolved = useCallback(
    (resolvedNamaJalan: string, resolvedKecamatan: string | null, _lat: number, _lng: number) => {
      if (resolvedNamaJalan) setNamaJalan(resolvedNamaJalan);
      if (resolvedKecamatan && ALL_KECAMATAN.includes(resolvedKecamatan)) {
        setKecamatan(resolvedKecamatan);
      }
    },
    []
  );

  const handleLocationFailed = useCallback((_reason: GpsStatus) => {
    // Tidak perlu action tambahan — GpsBanner sudah menampilkan pesan
    // User akan mengisi manual lewat form
  }, []);

  const { locationState, handleCameraCapture, handleGallerySelect, resetLocation } =
    useLocationFromPhoto(handleLocationResolved, handleLocationFailed);

  // ── File handling ────────────────────────────────────────────────────────

  function validateFile(file: File): string | null {
    if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      return "File harus berupa gambar JPG atau PNG.";
    }
    if (file.size > 10 * 1024 * 1024) {
      return "Ukuran file maksimal 10MB.";
    }
    return null;
  }

  function applyFile(file: File, source: "camera" | "gallery") {
    const err = validateFile(file);
    if (err) { setErrorMsg(err); return false; }
    setErrorMsg("");
    setSelectedFile(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    return true;
  }

  /** Dipanggil saat user mengambil foto via kamera */
  async function handleCameraChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!applyFile(file, "camera")) return;
    // Strategi 1: live GPS
    await handleCameraCapture(file);
  }

  /** Dipanggil saat user memilih foto dari galeri */
  async function handleGalleryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // ── Validasi Anti-Fraud Tanggal EXIF ──────────────────────────────────
    // Hanya berlaku untuk foto galeri (bukan kamera langsung)
    const dateValidation = await validatePhotoDate(file);

    if (dateValidation.status !== "valid") {
      // Tolak foto — tampilkan modal peringatan
      setFraudModal({
        isOpen: true,
        status: dateValidation.status,
        title: dateValidation.title,
        message: dateValidation.message,
      });
      // Kosongkan input file agar user harus memilih ulang
      if (galleryInputRef.current) galleryInputRef.current.value = "";
      return; // hentikan proses, jangan lanjut ke applyFile
    }
    // ── End Validasi ──────────────────────────────────────────────────────

    if (!applyFile(file, "gallery")) return;
    // Strategi 2: baca EXIF GPS
    await handleGallerySelect(file);
  }

  /** Drag & drop → perlakukan seperti galeri (validasi EXIF juga berlaku) */
  async function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    // Validasi anti-fraud tanggal EXIF (sama seperti galeri)
    const dateValidation = await validatePhotoDate(file);
    if (dateValidation.status !== "valid") {
      setFraudModal({
        isOpen: true,
        status: dateValidation.status,
        title: dateValidation.title,
        message: dateValidation.message,
      });
      return;
    }

    if (!applyFile(file)) return;
    handleGallerySelect(file);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  function removeFile() {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    resetLocation();
    setNamaJalan("");
    setKecamatan("Sidoarjo");
    if (cameraInputRef.current)  cameraInputRef.current.value  = "";
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  }

  function closeFraudModal() {
    setFraudModal((s) => ({ ...s, isOpen: false }));
  }

  // ── Analisis AI ──────────────────────────────────────────────────────────

  async function handleAnalyze() {
    if (!selectedFile) {
      setErrorMsg("Pilih foto terlebih dahulu sebelum menganalisis.");
      return;
    }

    setAnalysisState("loading");
    setErrorMsg("");

    try {
      const fd = new FormData();
      fd.append("file", selectedFile);

      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: "POST",
        body: fd,
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Server error ${response.status}: ${errText}`);
      }

      const result = await response.json();

      setAiResult(result);
      setFormData({
        namaJalan: namaJalan || "Tidak diketahui",
        kecamatan,
        tanggal,
        catatan,
        previewUrl: previewUrl ?? "",
        fileName: selectedFile.name,
        lat: locationState.lat ?? undefined,
        lng: locationState.lng ?? undefined,
      });

      setAnalysisState("idle");
      navigate({ to: "/ai-result" });
    } catch (err) {
      console.error("Analyze error:", err);
      setAnalysisState("error");
      if (err instanceof TypeError && err.message.includes("fetch")) {
        setErrorMsg(
          "Tidak dapat terhubung ke server AI. Pastikan server berjalan di localhost:8000."
        );
      } else {
        setErrorMsg(
          err instanceof Error ? err.message : "Terjadi kesalahan saat menganalisis."
        );
      }
    }
  }

  const isLoading = analysisState === "loading";
  const isGpsWorking =
    locationState.status === "detecting" || locationState.status === "geocoding";

  return (
    <AppLayout>
      <div className="flex flex-col min-h-screen w-full">
        <TopBar title="Upload & Analisis" back="/home" />

        <main className="flex-1 overflow-y-auto px-4 pt-4 pb-6 w-full">
          {/* 
            PENTING: div pembatas lebar ini TIDAK boleh pakai mx-auto langsung
            sebagai flex item. Gunakan block display (default div) di dalam
            main yang sudah w-full, lalu mx-auto bekerja sebagai block margin.
          */}
          <div style={{ maxWidth: "42rem", marginLeft: "auto", marginRight: "auto" }} className="flex flex-col gap-4">

            {/* ── Upload Zone ── */}
            {!selectedFile ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-border-subtle rounded-xl bg-bg-surface px-5 py-10 flex flex-col items-center text-center"
              >
                <div className="w-14 h-14 mb-4 rounded-full bg-primary-container/10 flex items-center justify-center">
                  <Icon name="cloud_upload" className="text-primary-container !text-[32px]" />
                </div>
                <h2 className="font-headline-sm text-headline-sm font-bold text-[#0F172A] mb-1">
                  Foto Kerusakan Jalan
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant mb-6 px-4">
                  Ambil foto langsung atau pilih dari galeri
                </p>

                {/* Dua tombol terpisah */}
                <div className="flex gap-3 w-full justify-center">
                  {/* Tombol Kamera — trigger live GPS */}
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex-1 max-w-[160px] flex items-center justify-center gap-2 bg-primary-container text-white rounded-xl px-4 py-3 font-label-md text-[13px] font-semibold hover:bg-primary-container/90 active:scale-95 transition-all"
                  >
                    <Icon name="photo_camera" className="!text-[20px]" />
                    Kamera
                  </button>

                  {/* Tombol Galeri — trigger EXIF GPS */}
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="flex-1 max-w-[160px] flex items-center justify-center gap-2 border-2 border-primary-container text-primary-container rounded-xl px-4 py-3 font-label-md text-[13px] font-semibold hover:bg-primary-container/5 active:scale-95 transition-all"
                  >
                    <Icon name="photo_library" className="!text-[20px]" />
                    Galeri
                  </button>
                </div>

                <span className="mt-5 font-label-sm text-label-sm text-[#94A3B8]">
                  Format JPG/PNG · Maks. 10MB · Drag & drop didukung
                </span>

                {/* Info untuk pengguna desktop */}
                <div className="mt-4 w-full text-left text-[11px] text-[#64748B] bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg p-3">
                  <p className="font-semibold mb-1">💡 Tips:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li><strong>Kamera:</strong> Ambil foto baru langsung (mobile) atau pilih file terbaru (desktop)</li>
                    <li><strong>Galeri:</strong> Pilih foto dari penyimpanan perangkat Anda</li>
                  </ul>
                </div>
              </div>
            ) : (
              /* ── Preview Foto ── */
              <div className="rounded-xl border border-border-subtle overflow-hidden shadow-sm bg-surface-container-lowest">
                <div className="relative w-full aspect-video bg-surface-container-high">
                  <img
                    src={previewUrl!}
                    alt="Preview foto"
                    className="w-full h-full object-cover"
                  />
                  {/* Hapus foto */}
                  <button
                    type="button"
                    onClick={removeFile}
                    className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                    title="Hapus foto"
                  >
                    <Icon name="close" className="!text-[18px]" />
                  </button>
                  {/* Nama file */}
                  <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded-lg flex items-center gap-1.5">
                    <Icon name="image" className="!text-[14px]" />
                    <span className="font-label-sm text-[11px] truncate max-w-[200px]">
                      {selectedFile.name}
                    </span>
                  </div>
                  {/* Sumber foto badge */}
                  {locationState.source && (
                    <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded-lg flex items-center gap-1">
                      <Icon
                        name={locationState.source === "camera" ? "photo_camera" : "photo_library"}
                        className="!text-[13px]"
                      />
                      <span className="font-label-sm text-[10px]">
                        {locationState.source === "camera" ? "Kamera" : "Galeri"}
                      </span>
                    </div>
                  )}
                </div>
                <div className="px-4 py-2 flex items-center justify-between border-t border-border-subtle">
                  <span className="font-label-sm text-[11px] text-on-surface-variant">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB ·{" "}
                    {selectedFile.type.split("/")[1]?.toUpperCase() ?? "IMG"}
                  </span>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="flex items-center gap-1 text-primary-container font-label-md text-[12px] font-semibold hover:underline"
                    >
                      <Icon name="photo_camera" className="!text-[14px]" />
                      Kamera
                    </button>
                    <button
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      className="flex items-center gap-1 text-primary-container font-label-md text-[12px] font-semibold hover:underline"
                    >
                      <Icon name="swap_horiz" className="!text-[14px]" />
                      Ganti
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Input kamera — capture="environment" untuk kamera belakang */}
            {/* PENTING: Di desktop, capture attribute diabaikan browser. */}
            {/* Pengguna desktop akan melihat file picker biasa. */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              capture="environment"
              className="hidden"
              onChange={handleCameraChange}
              aria-label="Ambil foto menggunakan kamera"
            />

            {/* Input galeri — tanpa capture agar buka file picker */}
            {/* Ini adalah input terpisah untuk memilih foto dari galeri/penyimpanan */}
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              className="hidden"
              onChange={handleGalleryChange}
              aria-label="Pilih foto dari galeri"
            />

            {/* GPS Status Banner */}
            <GpsBanner
              status={locationState.status}
              message={locationState.statusMessage}
              lat={locationState.lat}
              lng={locationState.lng}
            />

            {/* Error message analisis */}
            {errorMsg && (
              <div className="flex items-start gap-2 bg-[#FEE2E2] border border-[#FCA5A5] rounded-xl px-4 py-3">
                <Icon name="error" className="text-[#991B1B] !text-[20px] shrink-0 mt-0.5" />
                <p className="font-label-md text-[12px] text-[#991B1B] leading-relaxed">
                  {errorMsg}
                </p>
              </div>
            )}

            {/* ── Form Informasi Lokasi ── */}
            <section className="bg-surface-container-lowest rounded-xl border border-border-subtle p-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-headline-sm text-[14px] font-bold text-[#0F172A]">
                  Informasi Lokasi
                </h3>
                {/* Indikator sumber GPS */}
                {locationState.status === "success" && (
                  <span className="font-id-code text-[10px] text-[#065F46] bg-[#D1FAE5] border border-[#6EE7B7] px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Icon name="check_circle" className="!text-[12px]" filled />
                    {locationState.source === "camera" ? "GPS Live" : "EXIF GPS"}
                  </span>
                )}
                {(locationState.status === "exif_no_gps" ||
                  locationState.status === "permission_denied" ||
                  locationState.status === "timeout") && (
                  <span className="font-id-code text-[10px] text-[#92400E] bg-[#FEF3C7] border border-[#FCD34D] px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Icon name="edit" className="!text-[12px]" />
                    Isi Manual
                  </span>
                )}
                {isGpsWorking && (
                  <span className="font-id-code text-[10px] text-[#1E40AF] flex items-center gap-1">
                    <span className="w-3 h-3 border border-current/30 border-t-current rounded-full animate-spin" />
                    Mendeteksi...
                  </span>
                )}
              </div>

              {/* Nama Jalan */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-[#0F172A]">
                  Nama Jalan
                  {locationState.status !== "success" && (
                    <span className="text-[#EF4444] ml-1">*</span>
                  )}
                </label>
                <div className="relative">
                  <Icon
                    name="location_on"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant !text-[20px]"
                  />
                  <input
                    value={namaJalan}
                    onChange={(e) => setNamaJalan(e.target.value)}
                    placeholder={
                      isGpsWorking
                        ? "Mendeteksi lokasi..."
                        : "Contoh: Jl. Raya Porong No. 7"
                    }
                    disabled={isGpsWorking}
                    className="w-full pl-10 pr-4 py-3 border border-border-subtle rounded-xl font-body-md text-body-md bg-surface-container-low focus:ring-2 focus:ring-primary-container focus:border-primary-container outline-none disabled:opacity-60 disabled:cursor-wait"
                  />
                  {isGpsWorking && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary-container/30 border-t-primary-container rounded-full animate-spin" />
                  )}
                </div>
              </div>

              {/* Kecamatan */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-[#0F172A]">Kecamatan</label>
                <div className="relative">
                  <select
                    value={kecamatan}
                    onChange={(e) => setKecamatan(e.target.value)}
                    disabled={isGpsWorking}
                    className="w-full appearance-none px-4 py-3 border border-border-subtle rounded-xl font-body-md text-body-md bg-surface-container-low focus:ring-2 focus:ring-primary-container outline-none disabled:opacity-60 disabled:cursor-wait"
                  >
                    {KECAMATAN_LIST.map((g) => (
                      <optgroup key={g.group} label={g.group}>
                        {g.items.map((k) => (
                          <option key={k}>{k}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <Icon
                    name="expand_more"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
                  />
                </div>
              </div>

              {/* Koordinat GPS (readonly, tampil jika ada) */}
              {locationState.lat !== null && locationState.lng !== null && (
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md text-[#0F172A]">Koordinat GPS</label>
                  <div className="relative">
                    <Icon
                      name="my_location"
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-container !text-[18px]"
                    />
                    <input
                      readOnly
                      value={`${locationState.lat.toFixed(6)}, ${locationState.lng.toFixed(6)}`}
                      className="w-full pl-10 pr-4 py-3 border border-border-subtle rounded-xl font-id-code text-[12px] bg-surface-container text-on-surface-variant cursor-default"
                    />
                  </div>
                </div>
              )}

              {/* Tanggal */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-[#0F172A]">Tanggal Laporan</label>
                <div className="relative">
                  <Icon
                    name="calendar_today"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant !text-[20px]"
                  />
                  <input
                    type="date"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-border-subtle rounded-xl font-body-md text-body-md bg-surface-container-low outline-none focus:ring-2 focus:ring-primary-container focus:border-primary-container"
                  />
                </div>
              </div>

              {/* Catatan */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-[#0F172A]">Catatan Tambahan</label>
                <textarea
                  rows={3}
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Tambahkan keterangan kondisi jalan, situasi sekitar, dll..."
                  className="w-full px-4 py-3 border border-border-subtle rounded-xl font-body-md text-body-md bg-surface-container-low resize-none outline-none focus:ring-2 focus:ring-primary-container focus:border-primary-container"
                />
              </div>
            </section>

          </div>
        </main>

        {/* ── Footer Actions ── */}
        <div className="sticky bottom-0 bg-surface border-t border-border-subtle shadow-[0_-4px_12px_rgba(0,0,0,0.05)] w-full">
          <div style={{ maxWidth: "42rem", marginLeft: "auto", marginRight: "auto" }} className="p-4 flex flex-col gap-3">
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={isLoading || !selectedFile || isGpsWorking}
              className="w-full h-[52px] bg-primary-container text-white rounded-xl flex items-center justify-center gap-2 font-headline-sm-mobile text-[16px] font-bold active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {isLoading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Menganalisis...
                </>
              ) : isGpsWorking ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Mendeteksi Lokasi...
                </>
              ) : (
                <>
                  <Icon name="auto_awesome" />
                  Analisis Sekarang
                </>
              )}
            </button>
            <button
              type="button"
              disabled={isLoading || isGpsWorking}
              className="w-full h-[48px] border-2 border-primary-container text-primary-container rounded-xl flex items-center justify-center gap-2 font-label-md text-[15px] font-bold disabled:opacity-40"
            >
              <Icon name="cloud_off" />
              Simpan sebagai Draf (Offline)
            </button>
          </div>
        </div>
      </div>

      {/* ── Anti-Fraud Modal ── */}
      <FraudWarningModal
        isOpen={fraudModal.isOpen}
        status={fraudModal.status}
        title={fraudModal.title}
        message={fraudModal.message}
        onClose={closeFraudModal}
      />
    </AppLayout>
  );
}