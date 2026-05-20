<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ReportController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — JalanKita Backend
|--------------------------------------------------------------------------
*/

// ── Auth Routes (publik, tidak perlu token) ───────────────────────────────

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Response: { success, token, user: { id, name, role, wilayah, initials, ... } }
 */
Route::post('/auth/login', [AuthController::class, 'login']);

// ── Auth Routes (butuh token Sanctum) ────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me',     [AuthController::class, 'me']);
});

// ── Routes JalanKita ──────────────────────────────────────────────────────

/**
 * POST /api/analyze
 * Proxy endpoint untuk analisis AI (forward ke FastAPI).
 */
Route::post('/analyze', [ReportController::class, 'analyze']);

/**
 * POST /api/reports
 * Simpan laporan kerusakan jalan baru ke PostgreSQL.
 */
Route::post('/reports', [ReportController::class, 'store']);
