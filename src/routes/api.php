<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\WeddingCategoryController;
use App\Http\Controllers\Api\WeddingMemberController;
use App\Http\Controllers\Api\WeddingTaskController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::group(['middleware' => 'basicauth'], function () {
    Route::apiResource('wedding-categories', WeddingCategoryController::class);
    Route::apiResource('wedding-members', WeddingMemberController::class);
    Route::apiResource('wedding-tasks', WeddingTaskController::class);
});
