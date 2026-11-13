<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Categorie;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminCategorieController extends Controller
{
    /**
     * Consulter toutes les catégories (actives et inactives).
     */
    public function index(): JsonResponse
    {
        $categories = Categorie::query()
            ->withCount('produits')
            ->orderByDesc('date_creation')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Liste des catégories récupérée avec succès.',
            'data' => $categories,
        ]);
    }

    /**
     * Créer une catégorie.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nom_categorie' => [
                'required',
                'string',
                'max:100',
                'unique:categorie,nom_categorie',
            ],
            'description' => ['nullable', 'string'],
        ]);

        $categorie = Categorie::create([
            'nom_categorie' => $validated['nom_categorie'],
            'description' => $validated['description'] ?? null,
            'statut' => 'ACTIF',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Catégorie créée avec succès.',
            'data' => $categorie,
        ], 201);
    }

    /**
     * Modifier une catégorie.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $categorie = Categorie::find($id);

        if (!$categorie) {
            return response()->json([
                'success' => false,
                'message' => 'Catégorie introuvable.',
            ], 404);
        }

        $validated = $request->validate([
            'nom_categorie' => [
                'sometimes',
                'required',
                'string',
                'max:100',
                Rule::unique('categorie', 'nom_categorie')
                    ->ignore($categorie->id_categorie, 'id_categorie'),
            ],
            'description' => ['sometimes', 'nullable', 'string'],
        ]);

        $categorie->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Catégorie modifiée avec succès.',
            'data' => $categorie,
        ]);
    }

    /**
     * Désactiver ou réactiver une catégorie.
     */
    public function toggleStatus(int $id): JsonResponse
    {
        $categorie = Categorie::find($id);

        if (!$categorie) {
            return response()->json([
                'success' => false,
                'message' => 'Catégorie introuvable.',
            ], 404);
        }

        $categorie->statut = $categorie->statut === 'ACTIF'
            ? 'INACTIF'
            : 'ACTIF';

        $categorie->save();

        return response()->json([
            'success' => true,
            'message' => 'Statut de la catégorie modifié avec succès.',
            'data' => $categorie,
        ]);
    }
}