<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Produit;
use App\Models\VarianteProduit;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AdminVarianteProduitController extends Controller
{
    /**
     * Ajouter une variante à un produit.
     */
    public function store(Request $request, int $idProduit): JsonResponse
    {
        // 1. Vérifier que le produit existe et qu'il est actif.
        $produit = Produit::query()
            ->where('statut', 'ACTIF')
            ->find($idProduit);

        if (!$produit) {
            return response()->json([
                'success' => false,
                'message' => 'Produit introuvable ou inactif.',
            ], 404);
        }

        // 2. Valider les données reçues.
        $validated = $request->validate([
            'modele' => [
                'nullable',
                'string',
                'max:100',
            ],
            'taille' => [
                'nullable',
                'string',
                'max:50',
            ],
            'sku' => [
                'required',
                'string',
                'max:100',
                'unique:variante_produit,sku',
            ],
            'quantite_stock' => [
                'required',
                'integer',
                'min:0',
            ],
            'image' => [
                'required',
                'image',
                'mimes:jpeg,jpg,png,webp',
                'max:2048',
            ],
        ]);

        // 3. Enregistrer l'image dans storage/app/public/variantes.
        $cheminImage = $request->file('image')
            ->store('variantes', 'public');

        // 4. Créer la variante.
        $variante = VarianteProduit::create([
            'id_produit' => $produit->id_produit,
            'modele' => $validated['modele'] ?? null,
            'taille' => $validated['taille'] ?? null,
            'sku' => $validated['sku'],
            'image' => $cheminImage,
            'quantite_stock' => $validated['quantite_stock'],
            'quantite_reservee' => 0,
            'statut' => 'ACTIF',
        ]);

        // 5. Retourner le résultat.
        return response()->json([
            'success' => true,
            'message' => 'Variante créée avec succès.',
            'data' => [
                'id_variante' => $variante->id_variante,
                'id_produit' => $variante->id_produit,
                'modele' => $variante->modele,
                'taille' => $variante->taille,
                'sku' => $variante->sku,
                'image' => $variante->image,
                'image_url' => Storage::url($variante->image),
                'quantite_stock' => $variante->quantite_stock,
                'quantite_reservee' => $variante->quantite_reservee,
                'statut' => $variante->statut,
            ],
        ], 201);
    }


    /**
     * Consulter toutes les variantes d'un produit.
     */
    public function index(int $idProduit): JsonResponse
    {
        $produit = Produit::find($idProduit);

        if (!$produit) {
            return response()->json([
                'success' => false,
                'message' => 'Produit introuvable.',
            ], 404);
        }

        $variantes = VarianteProduit::query()
            ->where('id_produit', $idProduit)
            ->orderByDesc('date_creation')
            ->get([
                'id_variante',
                'id_produit',
                'modele',
                'taille',
                'image',
                'sku',
                'quantite_stock',
                'quantite_reservee',
                'statut',
                'date_creation',
            ])
            ->map(function ($variante) {
                $variante->stock_disponible = max(
                    0,
                    $variante->quantite_stock - $variante->quantite_reservee
                );

                $variante->image_url = $variante->image
                    ? \Illuminate\Support\Facades\Storage::url($variante->image)
                    : null;

                return $variante;
            });

        return response()->json([
            'success' => true,
            'message' => 'Liste des variantes récupérée avec succès.',
            'data' => [
                'produit' => [
                    'id_produit' => $produit->id_produit,
                    'nom_produit' => $produit->nom_produit,
                    'prix' => $produit->prix,
                ],
                'variantes' => $variantes,
            ],
        ]);
    }

    public function update(Request $request, int $idProduit, int $idVariante): JsonResponse
    {
        $produit = Produit::find($idProduit);

        if (!$produit) {
            return response()->json([
                'success' => false,
                'message' => 'Produit introuvable.',
            ], 404);
        }

        $variante = VarianteProduit::query()
            ->where('id_produit', $idProduit)
            ->find($idVariante);

        if (!$variante) {
            return response()->json([
                'success' => false,
                'message' => 'Variante introuvable pour ce produit.',
            ], 404);
        }

        $validated = $request->validate([
            'modele' => ['sometimes', 'nullable', 'string', 'max:100'],
            'taille' => ['sometimes', 'nullable', 'string', 'max:50'],
            'sku' => [
                'sometimes',
                'required',
                'string',
                'max:100',
                Rule::unique('variante_produit', 'sku')
                    ->ignore($variante->id_variante, 'id_variante'),
            ],
            'quantite_stock' => ['sometimes', 'required', 'integer', 'min:0'],
            'image' => [
                'sometimes',
                'required',
                'image',
                'mimes:jpeg,jpg,png,webp',
                'max:2048',
            ],
        ]);

        // Empêcher de définir un stock inférieur aux quantités déjà réservées.
        if (
            isset($validated['quantite_stock']) &&
            $validated['quantite_stock'] < $variante->quantite_reservee
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Le stock total ne peut pas être inférieur au stock réservé.',
            ], 422);
        }

        // Remplacer l'image si une nouvelle image est envoyée.
        if ($request->hasFile('image')) {
            $nouveauChemin = $request->file('image')
                ->store('variantes', 'public');

            if ($variante->image) {
                Storage::disk('public')->delete($variante->image);
            }

            $validated['image'] = $nouveauChemin;
        }

        $variante->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Variante modifiée avec succès.',
            'data' => $variante,
        ]);
    }


    /**
 * Activer ou désactiver une variante.
 */
    public function toggleStatus(int $idProduit, int $idVariante): JsonResponse
    {
        $variante = VarianteProduit::query()
            ->where('id_produit', $idProduit)
            ->find($idVariante);

        if (!$variante) {
            return response()->json([
                'success' => false,
                'message' => 'Variante introuvable pour ce produit.',
            ], 404);
        }

        $variante->statut = $variante->statut === 'ACTIF'
            ? 'INACTIF'
            : 'ACTIF';

        $variante->save();

        return response()->json([
            'success' => true,
            'message' => $variante->statut === 'ACTIF'
                ? 'Variante activée avec succès.'
                : 'Variante désactivée avec succès.',
            'data' => [
                'id_variante' => $variante->id_variante,
                'id_produit' => $variante->id_produit,
                'sku' => $variante->sku,
                'statut' => $variante->statut,
            ],
        ]);
    }
}