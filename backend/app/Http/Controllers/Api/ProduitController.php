<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Produit;
use App\Models\VarianteProduit;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class ProduitController extends Controller
{
    /**
     * Afficher le catalogue public des produits.
     */
    public function index(): JsonResponse
    {
        $produits = Produit::query()

            // Afficher uniquement les produits actifs
            ->where('statut', 'ACTIF')

            // Vérifier que la catégorie du produit est active
            ->whereHas('categorie', function ($query) {
                $query->where('statut', 'ACTIF');
            })

            // Récupérer le nom de la catégorie
            ->with('categorie:id_categorie,nom_categorie')

            // Récupérer une image représentative du produit
            ->addSelect([
                'image_principale' => VarianteProduit::query()
                    ->select('image')
                    ->whereColumn(
                        'variante_produit.id_produit',
                        'produit.id_produit'
                    )
                    ->where('statut', 'ACTIF')
                    ->whereNotNull('image')
                    ->orderBy('id_variante')
                    ->limit(1)
            ])

            

            // Trier les produits du plus récent au plus ancien
            ->orderByDesc('date_creation')

            // Afficher 12 produits par page
            ->paginate(12, [
                'id_produit',
                'id_categorie',
                'nom_produit',
                'description',
                'prix',
                'statut',
            ]);

            $produits->getCollection()->transform(function ($produit) {
                $produit->image_url = $produit->image_principale
                    ? asset('storage/' . $produit->image_principale)
                    : null;

                return $produit;
            });

        return response()->json([
            'success' => true,
            'message' => 'Catalogue des produits récupéré avec succès.',
            'data' => $produits,
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $produit = Produit::query()

            // Vérifier que le produit est actif
            ->where('statut', 'ACTIF')

            // Vérifier que sa catégorie est également active
            ->whereHas('categorie', function ($query) {
                $query->where('statut', 'ACTIF');
            })

            // Récupérer la catégorie
            ->with('categorie:id_categorie,nom_categorie')

            // Récupérer uniquement les variantes actives
            ->with(['variantes' => function ($query) {
                $query->where('statut', 'ACTIF')
                    ->select(
                        'id_variante',
                        'id_produit',
                        'modele',
                        'taille',
                        'image',
                        'quantite_stock',
                        'quantite_reservee'
                    )
                    ->orderBy('id_variante');
            }])

            ->find($id);

        // Vérifier si le produit existe
        if (!$produit) {
            return response()->json([
                'success' => false,
                'message' => 'Produit introuvable ou indisponible.',
            ], 404);
        }

        // Préparer les variantes sans exposer le stock réservé
        $variantes = $produit->variantes->map(function ($variante) {
            return [
                'id_variante' => $variante->id_variante,
                'modele' => $variante->modele,
                'taille' => $variante->taille,
                'image' => $variante->image,
                'image_url' => $variante->image
                    ? Storage::disk('public')->url($variante->image)
                    : null,
                'stock_disponible' => max(
                    0,
                    $variante->quantite_stock - $variante->quantite_reservee
                ),
            ];
        });

        return response()->json([
            'success' => true,
            'message' => 'Détails du produit récupérés avec succès.',
            'data' => [
                'id_produit' => $produit->id_produit,
                'nom_produit' => $produit->nom_produit,
                'description' => $produit->description,
                'prix' => $produit->prix,
                'categorie' => $produit->categorie->nom_categorie,
                'variantes' => $variantes,
            ],
        ]);
    }
}