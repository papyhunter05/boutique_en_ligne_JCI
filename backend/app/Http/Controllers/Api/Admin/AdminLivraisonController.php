<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Livraison;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\Commande;
use Illuminate\Support\Facades\DB;

class AdminLivraisonController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'recherche' => ['nullable', 'string', 'max:255'],
            'statut' => [
                'nullable',
                'in:EN_ATTENTE,EN_PREPARATION,EXPEDIEE,ARRIVEE_AGENCE,LIVREE,ECHEC'
            ],
            'zone_livraison' => [
                'nullable',
                'in:ANTANANARIVO,PROVINCE'
            ],
            'date_debut' => ['nullable', 'date'],
            'date_fin' => [
                'nullable',
                'date',
                'after_or_equal:date_debut'
            ],
        ]);

        $query = Livraison::query()
            ->with([
                'commande:id_commande,id_utilisateur,reference,mode_reception,montant_total,statut,date_commande',
                'commande.utilisateur:id_utilisateur,nom,prenom,email,telephone',
                'adresse:id_adresse,nom_destinataire,telephone,region,ville,quartier,adresse_detail',
                'agence:id_agence,nom_agence,telephone,adresse,ville',
            ])
            ->orderByDesc('id_livraison');

        // Recherche
        if (!empty($validated['recherche'])) {
            $recherche = $validated['recherche'];

            $query->where(function ($q) use ($recherche) {
                $q->where('numero_suivi', 'like', "%{$recherche}%")
                    ->orWhere('nom_destinataire', 'like', "%{$recherche}%")
                    ->orWhere('telephone', 'like', "%{$recherche}%")
                    ->orWhere('ville', 'like', "%{$recherche}%")
                    ->orWhereHas('commande', function ($commande) use ($recherche) {
                        $commande->where('reference', 'like', "%{$recherche}%")
                            ->orWhereHas('utilisateur', function ($utilisateur) use ($recherche) {
                                $utilisateur->where('nom', 'like', "%{$recherche}%")
                                    ->orWhere('prenom', 'like', "%{$recherche}%")
                                    ->orWhere('email', 'like', "%{$recherche}%");
                            });
                    })
                    ->orWhereHas('agence', function ($agence) use ($recherche) {
                        $agence->where('nom_agence', 'like', "%{$recherche}%");
                    });
            });
        }

        // Filtrer par statut
        if (!empty($validated['statut'])) {
            $query->where('statut', $validated['statut']);
        }

        // Filtrer par zone
        if (!empty($validated['zone_livraison'])) {
            $query->where('zone_livraison', $validated['zone_livraison']);
        }

        // Filtrer par période
        if (!empty($validated['date_debut'])) {
            $query->whereHas('commande', function ($commande) use ($validated) {
                $commande->whereDate('date_commande', '>=', $validated['date_debut']);
            });
        }

        if (!empty($validated['date_fin'])) {
            $query->whereHas('commande', function ($commande) use ($validated) {
                $commande->whereDate('date_commande', '<=', $validated['date_fin']);
            });
        }

        $livraisons = $query->paginate(15);

        return response()->json([
            'success' => true,
            'message' => 'Liste des livraisons récupérée avec succès.',
            'data' => $livraisons->items(),
            'pagination' => [
                'page_actuelle' => $livraisons->currentPage(),
                'derniere_page' => $livraisons->lastPage(),
                'par_page' => $livraisons->perPage(),
                'total' => $livraisons->total(),
            ],
        ]);
    }


    public function show(int $idLivraison): JsonResponse
    {
        $livraison = Livraison::query()
            ->with([
                'commande.utilisateur',
                'commande.articles.variante.produit',
                'commande.mouvementsStock.variante.produit',
                'adresse',
                'agence',
            ])
            ->find($idLivraison);

        if (!$livraison) {
            return response()->json([
                'success' => false,
                'message' => 'Livraison introuvable.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Détails de la livraison récupérés avec succès.',
            'data' => $livraison,
        ]);
    }


    public function updateStatut(Request $request, int $idLivraison): JsonResponse
    {
        $validated = $request->validate([
            'statut' => [
                'required',
                'in:EN_ATTENTE,EN_PREPARATION,EXPEDIEE,ARRIVEE_AGENCE,LIVREE,ECHEC'
            ],
        ]);

        return DB::transaction(function () use ($validated, $idLivraison) {

            $livraison = Livraison::query()
                ->where('id_livraison', $idLivraison)
                ->lockForUpdate()
                ->first();

            if (!$livraison) {
                return response()->json([
                    'success' => false,
                    'message' => 'Livraison introuvable.',
                ], 404);
            }

            $commande = Commande::query()
                ->where('id_commande', $livraison->id_commande)
                ->lockForUpdate()
                ->first();

            if (!$commande) {
                return response()->json([
                    'success' => false,
                    'message' => 'Commande associée introuvable.',
                ], 404);
            }

            $ancienStatut = $livraison->statut;
            $nouveauStatut = $validated['statut'];

            // Définir les transitions autorisées selon la zone
            if ($livraison->zone_livraison === 'ANTANANARIVO') {
                $transitions = [
                    'EN_ATTENTE' => ['EN_PREPARATION', 'ECHEC'],
                    'EN_PREPARATION' => ['EXPEDIEE', 'ECHEC'],
                    'EXPEDIEE' => ['LIVREE', 'ECHEC'],
                    'ARRIVEE_AGENCE' => [],
                    'LIVREE' => [],
                    'ECHEC' => [],
                ];
            } else {
                $transitions = [
                    'EN_ATTENTE' => ['EN_PREPARATION', 'ECHEC'],
                    'EN_PREPARATION' => ['EXPEDIEE', 'ECHEC'],
                    'EXPEDIEE' => ['ARRIVEE_AGENCE', 'ECHEC'],
                    'ARRIVEE_AGENCE' => ['LIVREE', 'ECHEC'],
                    'LIVREE' => [],
                    'ECHEC' => [],
                ];
            }

            if (!in_array(
                $nouveauStatut,
                $transitions[$ancienStatut] ?? [],
                true
            )) {
                return response()->json([
                    'success' => false,
                    'message' => "Transition impossible de {$ancienStatut} vers {$nouveauStatut}.",
                ], 422);
            }

            // Une commande doit être payée avant sa préparation
            if (
                $ancienStatut === 'EN_ATTENTE' &&
                $nouveauStatut === 'EN_PREPARATION' &&
                $commande->statut !== 'CONFIRMEE'
            ) {
                return response()->json([
                    'success' => false,
                    'message' => 'Impossible de préparer une commande dont le paiement n’est pas confirmé.',
                ], 422);
            }

            // Modifier le statut de la livraison
            $livraison->update([
                'statut' => $nouveauStatut,
            ]);

            // Synchroniser automatiquement le statut de la commande
            if (in_array($nouveauStatut, [
                'EN_PREPARATION',
                'EXPEDIEE',
                'LIVREE',
            ], true)) {
                $commande->update([
                    'statut' => $nouveauStatut,
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Statut de livraison modifié avec succès.',
                'data' => [
                    'id_livraison' => $livraison->id_livraison,
                    'ancien_statut' => $ancienStatut,
                    'nouveau_statut' => $livraison->statut,
                    'reference_commande' => $commande->reference,
                    'statut_commande' => $commande->statut,
                ],
            ]);
        });
    }


}
