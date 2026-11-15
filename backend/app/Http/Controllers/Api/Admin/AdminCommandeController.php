<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Commande;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminCommandeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Commande::query()
            ->with('utilisateur:id_utilisateur,nom,prenom,email,telephone')
            ->with('livraison:id_livraison,id_commande,zone_livraison,nom_destinataire,telephone,ville,region,statut')
            ->orderByDesc('date_commande');

        // Recherche par référence ou informations du client
        if ($request->filled('recherche')) {
            $recherche = $request->recherche;

            $query->where(function ($q) use ($recherche) {
                $q->where('reference', 'like', "%{$recherche}%")
                    ->orWhereHas('utilisateur', function ($u) use ($recherche) {
                        $u->where('nom', 'like', "%{$recherche}%")
                            ->orWhere('prenom', 'like', "%{$recherche}%")
                            ->orWhere('email', 'like', "%{$recherche}%")
                            ->orWhere('telephone', 'like', "%{$recherche}%");
                    });
            });
        }

        // Filtrer par statut
        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }

        // Filtrer par mode de réception
        if ($request->filled('mode_reception')) {
            $query->where('mode_reception', $request->mode_reception);
        }

        // Filtrer par date
        if ($request->filled('date_debut')) {
            $query->whereDate('date_commande', '>=', $request->date_debut);
        }

        if ($request->filled('date_fin')) {
            $query->whereDate('date_commande', '<=', $request->date_fin);
        }

        $commandes = $query->paginate(15);

        return response()->json([
            'success' => true,
            'message' => 'Liste des commandes récupérée avec succès.',
            'data' => $commandes->items(),
            'pagination' => [
                'page_actuelle' => $commandes->currentPage(),
                'derniere_page' => $commandes->lastPage(),
                'par_page' => $commandes->perPage(),
                'total' => $commandes->total(),
            ],
        ]);
    }

    public function show(int $idCommande): JsonResponse
    {
        $commande = Commande::query()
            ->with([
                'utilisateur:id_utilisateur,nom,prenom,email,telephone',

                'articles.variante.produit',

                'livraison.adresse',

                'livraison.agence',

                'mouvementsStock.variante.produit',

                'mouvementsStock.utilisateur',
            ])
            ->find($idCommande);

        if (!$commande) {
            return response()->json([
                'success' => false,
                'message' => 'Commande introuvable.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Détails de la commande récupérés avec succès.',
            'data' => $commande,
        ]);
    }

}
