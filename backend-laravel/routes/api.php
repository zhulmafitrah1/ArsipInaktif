<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ArsipController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;

// ===== PUBLIC =====
Route::post('/login', [AuthController::class, 'login']);

// ===== PROTECTED =====
Route::middleware('auth:sanctum')->group(function () {

    // Arsip
    Route::get('/arsip/proses-retensi', [ArsipController::class, 'prosesRetensi']);
    Route::apiResource('arsip', ArsipController::class);

    // User Management (khusus admin, dicek di controller)
    Route::get   ('/users',                     [UserController::class, 'index']);
    Route::post  ('/users',                     [UserController::class, 'store']);
    Route::put   ('/users/{id}',                [UserController::class, 'update']);
    Route::delete('/users/{id}',                [UserController::class, 'destroy']);
    Route::put   ('/users/{id}/reset-password', [UserController::class, 'resetPassword']);

});