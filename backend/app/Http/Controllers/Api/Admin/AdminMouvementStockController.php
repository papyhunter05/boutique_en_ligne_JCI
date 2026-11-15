<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\MouvementStock;
use App\Models\VarianteProduit;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;


class AdminMouvementStockController extends Controller
{
    
    /**
     * Enregistrer une entrée de stock (réapprovisionnement).
     */
    public function store(Request $request): JsonResponse
    {
        // 1. Validation des données reçues
        $validated = $request->validate([
            'id_variante' => [
                'required',
                'integer',
                'exists:variante_produit,id_variante',
            ],
            'quantite' => [
                'required',
                'integer',
                'min:1',
            ],
            'motif' => [
                'required',
                'string',
                'max:255',
            ],
        ]);

        // 2. Transaction pour garantir la cohérence des données
        $mouvement = DB::transaction(function () use ($request, $validated) {

            // Verrouiller la variante pendant l'opération
            $variante = VarianteProduit::query()
                ->lockForUpdate()
                ->findOrFail($validated['id_variante']);

            // Vérifier que la variante est active
            if ($variante->statut !== 'ACTIF') {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'id_variante' => [
                        'Impossible de réapprovisionner une variante inactive.',
                    ],
                ]);
            }

            // 3. Ajouter la quantité au stock
            $variante->quantite_stock += $validated['quantite'];
            $variante->save();

            // 4. Enregistrer le mouvement de stock
            return MouvementStock::create([
                'id_variante' => $variante->id_variante,
                'id_utilisateur' => $request->user()->id_utilisateur,
                'id_commande' => null,
                'type_mouvement' => 'ENTREE',
                'quantite' => $validated['quantite'],
                'motif' => $validated['motif'],
            ]);
        });

        // 5. Retourner le résultat
        return response()->json([
            'success' => true,
            'message' => 'Réapprovisionnement effectué avec succès.',
            'data' => [
                'mouvement' => $mouvement,
                'stock_total' => $mouvement->variante
                    ? $mouvement->variante->quantite_stock
                    : VarianteProduit::find($mouvement->id_variante)->quantite_stock,
            ],
        ], 201);
    }


/**
 * Enregistrer une sortie manuelle de stock.
 */
    public function sortie(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id_variante' => [
                'required',
                'integer',
                'exists:variante_produit,id_variante',
            ],
            'quantite' => [
                'required',
                'integer',
                'min:1',
            ],
            'motif' => [
                'required',
                'string',
                'max:255',
            ],
        ]);

        $mouvement = DB::transaction(function () use ($request, $validated) {

            $variante = VarianteProduit::query()
                ->lockForUpdate()
                ->findOrFail($validated['id_variante']);

            if ($variante->statut !== 'ACTIF') {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'id_variante' => [
                        'Impossible de retirer le stock d’une variante inactive.',
                    ],
                ]);
            }

            $stockDisponible = $variante->quantite_stock
                - $variante->quantite_reservee;

            if ($validated['quantite'] > $stockDisponible) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'quantite' => [
                        'La quantité demandée dépasse le stock disponible.',
                    ],
                ]);
            }

            $variante->quantite_stock -= $validated['quantite'];
            $variante->save();

            return MouvementStock::create([
                'id_variante' => $variante->id_variante,
                'id_utilisateur' => $request->user()->id_utilisateur,
                'id_commande' => null,
                'type_mouvement' => 'SORTIE',
                'quantite' => $validated['quantite'],
                'motif' => $validated['motif'],
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Sortie de stock effectuée avec succès.',
            'data' => [
                'mouvement' => $mouvement,
                'quantite_stock' => VarianteProduit::find(
                    $mouvement->id_variante
                )->quantite_stock,
            ],
        ], 201);
    }


/**
 * Consulter l'historique de tous les mouvements de stock.
 */
    public function index(): JsonResponse
    {
        $mouvements = MouvementStock::with([
            'variante.produit',
            'utilisateur',
        ])
            ->orderByDesc('id_mouvement')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'message' => 'Historique des mouvements récupéré avec succès.',
            'data' => $mouvements->through(function ($mouvement) {

                return [
                    'id_mouvement' => $mouvement->id_mouvement,

                    'date_mouvement' => $mouvement->date_mouvement,

                    'produit' => $mouvement->variante?->produit?->nom_produit,

                    'variante' => $mouvement->variante ? [
                        'id_variante' => $mouvement->variante->id_variante,
                        'modele' => $mouvement->variante->modele,
                        'taille' => $mouvement->variante->taille,
                        'sku' => $mouvement->variante->sku,
                    ] : null,

                    'administrateur' => $mouvement->utilisateur ? [
                        'id_utilisateur' => $mouvement->utilisateur->id_utilisateur,
                        'nom' => $mouvement->utilisateur->nom,
                        'prenom' => $mouvement->utilisateur->prenom,
                    ] : null,

                    'id_commande' => $mouvement->id_commande,
                    'type_mouvement' => $mouvement->type_mouvement,
                    'quantite' => $mouvement->quantite,
                    'motif' => $mouvement->motif,
                ];
            }),
        ]);
    }


/**
 * Consulter l'historique des mouvements d'une variante.
 */
    public function show(int $idVariante): JsonResponse
    {
        $variante = VarianteProduit::with('produit')
            ->find($idVariante);

        if (!$variante) {
            return response()->json([
                'success' => false,
                'message' => 'Variante introuvable.',
            ], 404);
        }

        $mouvements = MouvementStock::with('utilisateur')
            ->where('id_variante', $idVariante)
            ->orderByDesc('id_mouvement')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'message' => 'Historique de la variante récupéré avec succès.',
            'produit' => $variante->produit->nom_produit,
            'variante' => [
                'id_variante' => $variante->id_variante,
                'modele' => $variante->modele,
                'taille' => $variante->taille,
                'sku' => $variante->sku,
                'quantite_stock' => $variante->quantite_stock,
                'quantite_reservee' => $variante->quantite_reservee,
                'stock_disponible' => max(
                    0,
                    $variante->quantite_stock - $variante->quantite_reservee
                ),
            ],
            'mouvements' => $mouvements,
        ]);
    }


}
