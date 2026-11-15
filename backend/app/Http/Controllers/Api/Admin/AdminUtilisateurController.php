<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AdminUtilisateurController extends Controller
{
    /**
     * Lister et rechercher les clients.
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'recherche' => ['nullable', 'string', 'max:255'],
            'statut' => ['nullable', 'in:ACTIF,BLOQUE'],
        ]);

        $query = Utilisateur::query()
            ->where('role', 'CLIENT');

        // Recherche par nom, prénom, email ou téléphone.
        if (!empty($validated['recherche'])) {
            $recherche = $validated['recherche'];

            $query->where(function ($q) use ($recherche) {
                $q->where('nom', 'like', "%{$recherche}%")
                    ->orWhere('prenom', 'like', "%{$recherche}%")
                    ->orWhere('email', 'like', "%{$recherche}%")
                    ->orWhere('telephone', 'like', "%{$recherche}%");
            });
        }

        // Filtrage par statut.
        if (!empty($validated['statut'])) {
            $query->where('statut', $validated['statut']);
        }

        $utilisateurs = $query
            ->select([
                'id_utilisateur',
                'nom',
                'prenom',
                'email',
                'telephone',
                'statut',
            ])
            ->orderByDesc('id_utilisateur')
            ->paginate(15)
            ->withQueryString();

        return response()->json([
            'success' => true,
            'message' => 'Liste des clients récupérée avec succès.',
            'data' => $utilisateurs,
        ]);
    }



/**
 * Consulter les détails d'un client.
 */
    public function show(int $idUtilisateur): JsonResponse
    {
        $utilisateur = Utilisateur::query()
            ->where('role', 'CLIENT')
            ->with([
                'commandes' => function ($query) {
                    $query->select([
                        'id_commande',
                        'id_utilisateur',
                        'reference',
                        'mode_reception',
                        'montant_total',
                        'statut',
                        'date_commande',
                    ])->orderByDesc('date_commande');
                },
            ])
            ->select([
                'id_utilisateur',
                'nom',
                'prenom',
                'email',
                'telephone',
                'statut',
            ])
            ->find($idUtilisateur);

        if (!$utilisateur) {
            return response()->json([
                'success' => false,
                'message' => 'Client introuvable.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Détails du client récupérés avec succès.',
            'data' => $utilisateur,
        ]);
    }


/**
 * Bloquer ou débloquer un compte client.
 */
    public function updateStatut(int $idUtilisateur): JsonResponse
    {
        $utilisateur = Utilisateur::query()
            ->where('role', 'CLIENT')
            ->find($idUtilisateur);

        if (!$utilisateur) {
            return response()->json([
                'success' => false,
                'message' => 'Client introuvable.',
            ], 404);
        }

        $nouveauStatut = $utilisateur->statut === 'ACTIF'
            ? 'BLOQUE'
            : 'ACTIF';

        $utilisateur->update([
            'statut' => $nouveauStatut,
        ]);

        // Révoquer les tokens si le compte est bloqué.
        if ($nouveauStatut === 'BLOQUE') {
            $utilisateur->tokens()->delete();
        }

        return response()->json([
            'success' => true,
            'message' => $nouveauStatut === 'BLOQUE'
                ? 'Compte client bloqué avec succès.'
                : 'Compte client débloqué avec succès.',
            'data' => [
                'id_utilisateur' => $utilisateur->id_utilisateur,
                'nom' => $utilisateur->nom,
                'prenom' => $utilisateur->prenom,
                'statut' => $utilisateur->statut,
            ],
        ]);
    }


/**
 * Créer un nouveau compte administrateur.
 */
    public function storeAdmin(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nom' => ['required', 'string', 'max:100'],
            'prenom' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:150', 'unique:utilisateur,email'],
            'telephone' => ['required', 'string', 'max:20'],
            'mot_de_passe' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $administrateur = Utilisateur::create([
            'nom' => $validated['nom'],
            'prenom' => $validated['prenom'],
            'email' => $validated['email'],
            'telephone' => $validated['telephone'],
            'mot_de_passe' => $validated['mot_de_passe'],
            'role' => 'ADMIN',
            'statut' => 'ACTIF',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Compte administrateur créé avec succès.',
            'data' => [
                'id_utilisateur' => $administrateur->id_utilisateur,
                'nom' => $administrateur->nom,
                'prenom' => $administrateur->prenom,
                'email' => $administrateur->email,
                'telephone' => $administrateur->telephone,
                'role' => $administrateur->role,
                'statut' => $administrateur->statut,
            ],
        ], 201);
    }

}