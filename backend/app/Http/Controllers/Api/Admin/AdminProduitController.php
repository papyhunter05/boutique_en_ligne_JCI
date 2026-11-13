<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Produit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminProduitController extends Controller
{
    /**
     * Consulter tous les produits (actifs et inactifs).
     */
    public function index(): JsonResponse
    {
        $produits = Produit::query()
            ->with('categorie:id_categorie,nom_categorie')
            ->withCount('variantes')
            ->orderByDesc('date_creation')
            ->paginate(15, [
                'id_produit',
                'id_categorie',
                'nom_produit',
                'description',
                'prix',
                'statut',
                'date_creation',
            ]);

        return response()->json([
            'success' => true,
            'message' => 'Liste des produits récupérée avec succès.',
            'data' => $produits,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id_categorie' => [
                'required',
                'integer',
                Rule::exists('categorie', 'id_categorie')
                    ->where('statut', 'ACTIF'),
            ],
            'nom_produit' => [
                'required',
                'string',
                'max:150',
            ],
            'description' => [
                'nullable',
                'string',
            ],
            'prix' => [
                'required',
                'numeric',
                'min:0',
            ],
        ]);

        $produit = Produit::create([
            'id_categorie' => $validated['id_categorie'],
            'nom_produit' => $validated['nom_produit'],
            'description' => $validated['description'] ?? null,
            'prix' => $validated['prix'],
            'statut' => 'ACTIF',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Produit créé avec succès.',
            'data' => $produit,
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $produit = Produit::find($id);

        if (!$produit) {
            return response()->json([
                'success' => false,
                'message' => 'Produit introuvable.',
            ], 404);
        }

        $validated = $request->validate([
            'id_categorie' => [
                'sometimes',
                'required',
                'integer',
                Rule::exists('categorie', 'id_categorie')
                    ->where('statut', 'ACTIF'),
            ],
            'nom_produit' => [
                'sometimes',
                'required',
                'string',
                'max:150',
            ],
            'description' => [
                'sometimes',
                'nullable',
                'string',
            ],
            'prix' => [
                'sometimes',
                'required',
                'numeric',
                'min:0',
            ],
        ]);

        $produit->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Produit modifié avec succès.',
            'data' => $produit,
        ]);
    }


/**
 * Désactiver ou réactiver un produit.
 */
    public function toggleStatus(int $id): JsonResponse
    {
        $produit = Produit::find($id);

        if (!$produit) {
            return response()->json([
                'success' => false,
                'message' => 'Produit introuvable.',
            ], 404);
        }

        $produit->statut = $produit->statut === 'ACTIF'
            ? 'INACTIF'
            : 'ACTIF';

        $produit->save();

        return response()->json([
            'success' => true,
            'message' => 'Statut du produit modifié avec succès.',
            'data' => $produit,
        ]);
    }

}
