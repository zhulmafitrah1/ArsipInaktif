<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ArsipController;

Route::get('/arsip', [ArsipController::class, 'index']);
Route::post('/arsip', [ArsipController::class, 'store']);
Route::get('/arsip/{id}', [ArsipController::class, 'show']);
Route::put('/arsip/{id}', [ArsipController::class, 'update']);
Route::delete('/arsip/{id}', [ArsipController::class, 'destroy']);
