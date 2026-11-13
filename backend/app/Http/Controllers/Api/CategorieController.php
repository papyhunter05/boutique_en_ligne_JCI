<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Categorie;
use Illuminate\Http\JsonResponse;

class CategorieController extends Controller
{
    /**
     * Afficher toutes les catégories actives.
     */
    public function index(): JsonResponse
    {
        $categories = Categorie::query()
            ->where('statut', 'ACTIF')
            ->withCount([
                'produits' => function ($query) {
                    $query->where('statut', 'ACTIF');
                }
            ])
            ->orderBy('nom_categorie', 'asc')
            ->get([
                'id_categorie',
                'nom_categorie',
                'description',
            ]);

        return response()->json([
            'success' => true,
            'message' => 'Liste des catégories récupérée avec succès.',
            'data' => $categories,
        ]);
    }
}
