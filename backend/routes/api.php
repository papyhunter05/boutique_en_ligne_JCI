<?php

use App\Http\Controllers\Api\Auth\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CategorieController;
use App\Http\Controllers\Api\ProduitController;
use App\Http\Controllers\Api\Admin\AdminCategorieController;
use App\Http\Controllers\Api\Admin\AdminProduitController;
use App\Http\Controllers\Api\Admin\AdminVarianteProduitController;
use App\Http\Controllers\Api\Admin\AdminMouvementStockController;
// Routes publiques
Route::prefix('auth')->group(function () {

    Route::post('/register', [AuthController::class, 'register']);

    Route::post('/login', [AuthController::class, 'login']);

});

// Routes nécessitant une authentification
Route::middleware('auth:sanctum')->group(function () {

     // Authentification
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });

    // Details d'un produit
    Route::get('/produits/{id}', [ProduitController::class, 'show']);


});

// Routes réservées à l'administrateur
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {

    // Gestion des catégories
    Route::get('/categories', [AdminCategorieController::class, 'index']);

    Route::post('/categories', [AdminCategorieController::class, 'store']);

    Route::put('/categories/{id}', [AdminCategorieController::class, 'update']);

    Route::patch('/categories/{id}/statut', [AdminCategorieController::class, 'toggleStatus']);

    // Gestion des produits
    Route::get('/produits', [AdminProduitController::class, 'index']);
    Route::post('/produits', [AdminProduitController::class, 'store']);
    Route::put('/produits/{id}', [AdminProduitController::class, 'update']);
    Route::patch('/produits/{id}/statut', [AdminProduitController::class, 'toggleStatus']);

    // Gestion des variantes de produits
    Route::post('/produits/{id}/variantes', [AdminVarianteProduitController::class, 'store']);
    Route::get('/produits/{idProduit}/variantes', [AdminVarianteProduitController::class, 'index']);
    Route::put('/produits/{idProduit}/variantes/{idVariante}', [AdminVarianteProduitController::class, 'update']);
    Route::patch('/produits/{idProduit}/variantes/{idVariante}/statut', [AdminVarianteProduitController::class, 'toggleStatus']);
    
    // Gestion des mouvements de stock
    Route::post('/mouvements-stock', [AdminMouvementStockController::class, 'store']);
    Route::post('/mouvements-stock/sortie', [AdminMouvementStockController::class, 'sortie']);
    Route::get('/mouvements-stock', [AdminMouvementStockController::class, 'index']);
    Route::get('/variantes/{idVariante}/mouvements-stock', [AdminMouvementStockController::class, 'show']);
    });

// Routes ne nécessitant pas une authentification
Route::get('/categories', [CategorieController::class, 'index']);
Route::get('/produits', [ProduitController::class, 'index']);