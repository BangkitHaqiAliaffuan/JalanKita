/**
 * useLocationFromPhoto
 *
 * Hook yang mengimplementasikan strategi hybrid untuk mendapatkan koordinat GPS:
 *
 * 1. KAMERA  → navigator.geolocation.getCurrentPosition (live GPS)
 * 2. GALERI  → exifr.gps(file) untuk membaca metadata EXIF foto
 * 3. REVERSE GEOCODING → Nominatim (OpenStreetMap) untuk mengisi nama jalan & kecamatan
 * 4. FALLBACK → notifikasi agar user isi manual
 */

import { useState, useCallback } from "react";
import exifr from "exifr";

// ── Konstanta ──────────────────────────────────────────────────────────────

/** 18 kecamatan Sidoarjo beserta alias yang mungkin muncul dari Nominatim */
const KECAMATAN_MAP: Record<string, string> = {
  // Nama resmi → nama resmi (normalisasi)
  sidoarjo:     "Sidoarjo",
  buduran:      "Buduran",
  gedangan:     "Gedangan",
  sedati:       "Sedati",
  waru:         "Waru",
  taman:        "Taman",
  krian:        "Krian",
  balongbendo:  "Balongbendo",
  wonoayu:      "Wonoayu",
  sukodono:     "Sukodono",
  candi:        "Candi",
  tarik:        "Tarik",
  prambon:      "Prambon",
  porong:       "Porong",
  krembung:     "Krembung",
  tulangan:     "Tulangan",
  tanggulangin: "Tanggulangin",
  jabon:        "Jabon",
};

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";

// ── Types ──────────────────────────────────────────────────────────────────

export type LocationSource = "camera" | "exif" | "manual" | null;

export type GpsStatus =
  | "idle"
  | "detecting"       // sedang mengambil koordinat
  | "geocoding"       // sedang reverse geocoding
  | "success"         // berhasil auto-fill
  | "exif_no_gps"     // foto galeri tidak punya GPS EXIF
  | "permission_denied"
  | "timeout"
  | "error";

export interface LocationState {
  lat: number | null;
  lng: number | null;
  source: LocationSource;
  status: GpsStatus;
  statusMessage: string;
}

export interface UseLocationFromPhotoReturn {
  locationState: LocationState;
  /** Panggil ini saat user memilih foto dari KAMERA (capture="environment") */
  handleCameraCapture: (file: File) => Promise<void>;
  /** Panggil ini saat user memilih foto dari GALERI */
  handleGallerySelect: (file: File) => Promise<void>;
  /** Reset state lokasi */
  resetLocation: () => void;
}

// ── Helper: Nominatim Reverse Geocoding ───────────────────────────────────

interface NominatimResult {
  namaJalan: string;
  kecamatan: string | null;
}

async function reverseGeocode(lat: number, lng: number): Promise<NominatimResult> {
  const url = new URL(NOMINATIM_URL);
  url.searchParams.set("lat", lat.toString());
  url.searchParams.set("lon", lng.toString());
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("zoom", "18");
  url.searchParams.set("accept-language", "id");

  const res = await fetch(url.toString(), {
    headers: {
      // Nominatim mewajibkan User-Agent yang informatif
      "User-Agent": "JalanKita/1.0 (Dishub Sidoarjo; magang project)",
    },
  });

  if (!res.ok) throw new Error(`Nominatim error: ${res.status}`);

  const data = await res.json();
  const addr = data.address ?? {};

  // Bangun nama jalan dari komponen address Nominatim
  const roadParts: string[] = [];
  if (addr.road)          roadParts.push(addr.road);
  if (addr.house_number)  roadParts.push(`No. ${addr.house_number}`);
  const namaJalan = roadParts.length > 0
    ? roadParts.join(" ")
    : addr.neighbourhood ?? addr.suburb ?? addr.village ?? "Jalan tidak diketahui";

  // Cari kecamatan dari berbagai field Nominatim
  const kecamatanRaw: string =
    addr.suburb ??
    addr.city_district ??
    addr.town ??
    addr.village ??
    addr.county ??
    "";

  const kecamatan = matchKecamatan(kecamatanRaw);

  return { namaJalan, kecamatan };
}

/** Cocokkan string dari Nominatim ke salah satu dari 18 kecamatan Sidoarjo */
function matchKecamatan(raw: string): string | null {
  if (!raw) return null;
  const normalized = raw.toLowerCase().replace(/kecamatan\s*/i, "").trim();

  // Exact match dulu
  if (KECAMATAN_MAP[normalized]) return KECAMATAN_MAP[normalized];

  // Partial match — cari kecamatan yang namanya ada di dalam string Nominatim
  for (const [key, value] of Object.entries(KECAMATAN_MAP)) {
    if (normalized.includes(key)) return value;
  }

  return null;
}

// ── Helper: HTML5 Geolocation ─────────────────────────────────────────────

function getCurrentPosition(): Promise<GeolocationCoordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation tidak didukung browser ini."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos.coords),
      (err) => reject(err),
      {
        enableHighAccuracy: true,
        timeout: 10_000,
        maximumAge: 0,
      }
    );
  });
}

// ── Helper: EXIF GPS dari file ────────────────────────────────────────────

interface ExifGps {
  latitude: number;
  longitude: number;
}

async function readExifGps(file: File): Promise<ExifGps | null> {
  try {
    const gps = await exifr.gps(file);
    if (gps && typeof gps.latitude === "number" && typeof gps.longitude === "number") {
      return { latitude: gps.latitude, longitude: gps.longitude };
    }
    return null;
  } catch {
    return null;
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────

const INITIAL_STATE: LocationState = {
  lat: null,
  lng: null,
  source: null,
  status: "idle",
  statusMessage: "",
};

export function useLocationFromPhoto(
  onLocationResolved: (namaJalan: string, kecamatan: string | null, lat: number, lng: number) => void,
  onLocationFailed: (reason: GpsStatus) => void
): UseLocationFromPhotoReturn {
  const [locationState, setLocationState] = useState<LocationState>(INITIAL_STATE);

  /** Proses koordinat yang sudah didapat: lakukan reverse geocoding lalu callback */
  const processCoordinates = useCallback(
    async (lat: number, lng: number, source: LocationSource) => {
      setLocationState((s) => ({
        ...s,
        lat,
        lng,
        source,
        status: "geocoding",
        statusMessage: "Mengidentifikasi lokasi...",
      }));

      try {
        const { namaJalan, kecamatan } = await reverseGeocode(lat, lng);
        setLocationState({
          lat,
          lng,
          source,
          status: "success",
          statusMessage: `Lokasi terdeteksi via ${source === "camera" ? "GPS kamera" : "EXIF foto"}`,
        });
        onLocationResolved(namaJalan, kecamatan, lat, lng);
      } catch {
        // Reverse geocoding gagal — koordinat tetap tersimpan, tapi nama jalan kosong
        setLocationState({
          lat,
          lng,
          source,
          status: "success",
          statusMessage: "Koordinat didapat, nama jalan tidak teridentifikasi",
        });
        onLocationResolved("", null, lat, lng);
      }
    },
    [onLocationResolved]
  );

  /** STRATEGI 1: Foto dari kamera → gunakan live GPS */
  const handleCameraCapture = useCallback(
    async (_file: File) => {
      setLocationState({
        lat: null,
        lng: null,
        source: "camera",
        status: "detecting",
        statusMessage: "Mengambil koordinat GPS...",
      });

      try {
        const coords = await getCurrentPosition();
        await processCoordinates(coords.latitude, coords.longitude, "camera");
      } catch (err) {
        let status: GpsStatus = "error";
        let msg = "Gagal mendapatkan lokasi GPS.";

        if (err instanceof GeolocationPositionError) {
          if (err.code === GeolocationPositionError.PERMISSION_DENIED) {
            status = "permission_denied";
            msg = "Izin lokasi ditolak. Aktifkan GPS di pengaturan browser.";
          } else if (err.code === GeolocationPositionError.TIMEOUT) {
            status = "timeout";
            msg = "GPS timeout. Isi lokasi secara manual.";
          }
        }

        setLocationState({ lat: null, lng: null, source: "camera", status, statusMessage: msg });
        onLocationFailed(status);
      }
    },
    [processCoordinates, onLocationFailed]
  );

  /** STRATEGI 2: Foto dari galeri → baca EXIF GPS */
  const handleGallerySelect = useCallback(
    async (file: File) => {
      setLocationState({
        lat: null,
        lng: null,
        source: "exif",
        status: "detecting",
        statusMessage: "Membaca metadata GPS dari foto...",
      });

      const gps = await readExifGps(file);

      if (gps) {
        await processCoordinates(gps.latitude, gps.longitude, "exif");
      } else {
        // Tidak ada EXIF GPS → fallback manual
        setLocationState({
          lat: null,
          lng: null,
          source: "exif",
          status: "exif_no_gps",
          statusMessage: "Foto tidak memiliki data GPS. Isi lokasi secara manual.",
        });
        onLocationFailed("exif_no_gps");
      }
    },
    [processCoordinates, onLocationFailed]
  );

  const resetLocation = useCallback(() => {
    setLocationState(INITIAL_STATE);
  }, []);

  return { locationState, handleCameraCapture, handleGallerySelect, resetLocation };
}
