<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Adresse;
use App\Models\AgenceTransport;
use App\Models\Commande;
use App\Models\CommandeArticle;
use App\Models\Configuration;
use App\Models\Livraison;
use App\Models\MouvementStock;
use App\Models\Panier;
use App\Models\PanierArticle;
use App\Models\VarianteProduit;
use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CommandeController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        // 1. Validation des informations de réception

        
        $validated = $request->validate([
            'mode_reception' => [
                'required',
                'in:LIVRAISON_ANTANANARIVO,AGENCE_PROVINCE,RETRAIT_MAGASIN'
            ],

            'id_adresse' => [
                'nullable',
                'integer',
                'exists:adresse,id_adresse'
            ],

            // Nouvelle adresse à Antananarivo
            'nom_destinataire' => [
                'required_if:mode_reception,AGENCE_PROVINCE',
                'nullable',
                'string',
                'max:100'
            ],

            'telephone' => [
                'required_if:mode_reception,AGENCE_PROVINCE',
                'nullable',
                'string',
                'max:20'
            ],

            'region' => [
                'required_if:mode_reception,AGENCE_PROVINCE',
                'nullable',
                'string',
                'max:100'
            ],

            'id_agence' => [
                'required_if:mode_reception,AGENCE_PROVINCE',
                'nullable',
                'integer',
                'exists:agence_transport,id_agence'
            ],
        ]);

        // Si le client choisit une livraison à Antananarivo
        // sans adresse déjà enregistrée, il doit saisir une adresse.

        if (
            $validated['mode_reception'] === 'LIVRAISON_ANTANANARIVO'
            && empty($validated['id_adresse'])
        ) {
            $nouvelleAdresse = $request->validate([
                'nom_destinataire' => ['required', 'string', 'max:100'],
                'telephone' => ['required', 'string', 'max:20'],
                'region' => ['required', 'string', 'max:100'],
                'ville' => ['required', 'string', 'max:100'],
                'quartier' => ['nullable', 'string', 'max:100'],
                'adresse_detail' => ['required', 'string'],
                'enregistrer_adresse' => ['sometimes', 'boolean'],
            ]);

            $validated = array_merge($validated, $nouvelleAdresse);
        }


        // 2. Récupération de l'utilisateur connecté

        $idUtilisateur = $request->user()->id_utilisateur;

        // 3. Création de la commande dans une transaction

        $commande = DB::transaction(function () use (
            $validated,
            $idUtilisateur
        ) {

            // Verrouiller l'utilisateur pour éviter les opérations
            // simultanées sur son panier.

            Utilisateur::where('id_utilisateur', $idUtilisateur)
                ->lockForUpdate()
                ->firstOrFail();

            // Récupérer le panier actif

            $panier = Panier::where('id_utilisateur', $idUtilisateur)
                ->where('statut', 'ACTIF')
                ->lockForUpdate()
                ->first();

            if (!$panier) {
                throw ValidationException::withMessages([
                    'panier' => ['Aucun panier actif trouvé.']
                ]);
            }

            // Récupérer les articles du panier

            $articlesPanier = PanierArticle::where(
                'id_panier',
                $panier->id_panier
            )
                ->lockForUpdate()
                ->get();

            if ($articlesPanier->isEmpty()) {
                throw ValidationException::withMessages([
                    'panier' => ['Votre panier est vide.']
                ]);
            }

            // Récupérer les configurations

            $fraisLivraison = (float) Configuration::obtenirValeur(
                'frais_livraison',
                5000
            );

            $dureeReservation = (int) Configuration::obtenirValeur(
                'duree_reservation_stock_minutes',
                15
            );

            // Vérifier le mode de réception

            $modeReception = $validated['mode_reception'];

            $frais = $modeReception === 'RETRAIT_MAGASIN'
                ? 0
                : $fraisLivraison;

            $adresse = null;
            $agence = null;
            $lieuRetraitMagasin = null;
            $donneesAdresse = null;

            // Livraison à Antananarivo


            if ($modeReception === 'LIVRAISON_ANTANANARIVO') {

                // Cas 1 : le client choisit une adresse existante

                if (!empty($validated['id_adresse'])) {

                    $adresse = Adresse::where(
                        'id_adresse',
                        $validated['id_adresse']
                    )
                        ->where('id_utilisateur', $idUtilisateur)
                        ->lockForUpdate()
                        ->first();

                    if (!$adresse) {
                        throw ValidationException::withMessages([
                            'id_adresse' => [
                                'Cette adresse ne vous appartient pas.'
                            ]
                        ]);
                    }

                    $donneesAdresse = [
                        'nom_destinataire' => $adresse->nom_destinataire,
                        'telephone' => $adresse->telephone,
                        'region' => $adresse->region,
                        'ville' => $adresse->ville,
                        'quartier' => $adresse->quartier,
                        'adresse_detail' => $adresse->adresse_detail,
                    ];
                }

                // Cas 2 : le client saisit une nouvelle adresse

                else {

                    $donneesAdresse = [
                        'nom_destinataire' => $validated['nom_destinataire'],
                        'telephone' => $validated['telephone'],
                        'region' => $validated['region'],
                        'ville' => $validated['ville'],
                        'quartier' => $validated['quartier'] ?? null,
                        'adresse_detail' => $validated['adresse_detail'],
                    ];

                    // Enregistrer l'adresse uniquement si le client le souhaite

                    if (
                        filter_var(
                            $validated['enregistrer_adresse'] ?? false,
                            FILTER_VALIDATE_BOOLEAN
                        )
                    ) {
                        $adresse = Adresse::create([
                            'id_utilisateur' => $idUtilisateur,
                            ...$donneesAdresse,
                            'est_principale' => false,
                        ]);
                    }
                }
            }


            // Livraison en province vers une agence

            if ($modeReception === 'AGENCE_PROVINCE') {

                $agence = AgenceTransport::where(
                    'id_agence',
                    $validated['id_agence']
                )
                    ->where('statut', 'ACTIVE')
                    ->lockForUpdate()
                    ->first();

                if (!$agence) {
                    throw ValidationException::withMessages([
                        'id_agence' => [
                            'Cette agence est introuvable ou inactive.'
                        ]
                    ]);
                }
            }

            // Retrait au magasin

            if ($modeReception === 'RETRAIT_MAGASIN') {

                $lieuRetraitMagasin = Configuration::obtenirValeur(
                    'adresse_point_vente'
                );

                if (
                    !$lieuRetraitMagasin ||
                    $lieuRetraitMagasin === 'A_DEFINIR'
                ) {
                    throw ValidationException::withMessages([
                        'mode_reception' => [
                            'L’adresse du point de vente n’est pas encore configurée.'
                        ]
                    ]);
                }
            }

            // 4. Vérification du stock et calcul du montant

            $montantArticles = 0;
            $articlesValides = [];

            foreach ($articlesPanier as $articlePanier) {

                $variante = VarianteProduit::with([
                    'produit.categorie'
                ])
                    ->where('id_variante', $articlePanier->id_variante)
                    ->lockForUpdate()
                    ->first();

                if (
                    !$variante ||
                    $variante->statut !== 'ACTIF' ||
                    !$variante->produit ||
                    $variante->produit->statut !== 'ACTIF' ||
                    !$variante->produit->categorie ||
                    $variante->produit->categorie->statut !== 'ACTIF'
                ) {
                    throw ValidationException::withMessages([
                        'produit' => [
                            'Un produit ou une variante de votre panier n’est plus disponible.'
                        ]
                    ]);
                }

                $stockDisponible =
                    $variante->quantite_stock -
                    $variante->quantite_reservee;

                if ($articlePanier->quantite > $stockDisponible) {
                    throw ValidationException::withMessages([
                        'stock' => [
                            'Stock insuffisant pour le produit : ' .
                            $variante->produit->nom_produit .
                            '. Stock disponible : ' .
                            max(0, $stockDisponible)
                        ]
                    ]);
                }

                $prix = (float) $variante->produit->prix;

                $sousTotal = $prix * $articlePanier->quantite;

                $montantArticles += $sousTotal;

                $articlesValides[] = [
                    'variante' => $variante,
                    'quantite' => $articlePanier->quantite,
                    'prix' => $prix,
                    'sous_total' => $sousTotal,
                ];
            }

            // 5. Création de la commande

            $montantTotal = $montantArticles + $frais;

            $reference = 'CMD-' .
                now()->format('YmdHis') .
                '-' .
                Str::upper(Str::random(6));

            $commande = Commande::create([
                'id_utilisateur' => $idUtilisateur,
                'id_panier' => $panier->id_panier,
                'reference' => $reference,
                'mode_reception' => $modeReception,
                'lieu_retrait' => $lieuRetraitMagasin,
                'date_commande' => now(),
                'montant_articles' => $montantArticles,
                'frais_livraison' => $frais,
                'montant_total' => $montantTotal,
                'statut' => 'EN_ATTENTE_PAIEMENT',
                'date_expiration_paiement' => now()->addMinutes(
                    $dureeReservation
                ),
            ]);

            // 6. Création des articles et réservation du stock

            foreach ($articlesValides as $ligne) {

                $variante = $ligne['variante'];

                $quantite = $ligne['quantite'];

                CommandeArticle::create([
                    'id_commande' => $commande->id_commande,
                    'id_variante' => $variante->id_variante,
                    'nom_produit' => $variante->produit->nom_produit,
                    'modele' => $variante->modele,
                    'taille' => $variante->taille,
                    'image' => $variante->image,
                    'prix_unitaire' => $ligne['prix'],
                    'quantite' => $quantite,
                    'sous_total' => $ligne['sous_total'],
                ]);

                // Réserver le stock sans diminuer le stock physique

                $variante->quantite_reservee += $quantite;

                $variante->save();

                // Enregistrer le mouvement de réservation

                MouvementStock::create([
                    'id_variante' => $variante->id_variante,
                    'id_utilisateur' => $idUtilisateur,
                    'id_commande' => $commande->id_commande,
                    'type_mouvement' => 'RESERVATION',
                    'quantite' => $quantite,
                    'motif' => 'Réservation du stock pour la commande ' .
                        $reference,
                ]);
            }

            // 7. Création de la livraison si nécessaire

            if ($modeReception === 'LIVRAISON_ANTANANARIVO') {

                Livraison::create([
                    'id_commande' => $commande->id_commande,
                    'id_adresse' => $adresse?->id_adresse,
                    'id_agence' => null,
                    'zone_livraison' => 'ANTANANARIVO',

                    'nom_destinataire' => $donneesAdresse['nom_destinataire'],
                    'telephone' => $donneesAdresse['telephone'],
                    'region' => $donneesAdresse['region'],
                    'ville' => $donneesAdresse['ville'],
                    'quartier' => $donneesAdresse['quartier'],
                    'adresse_detail' => $donneesAdresse['adresse_detail'],

                    'lieu_retrait' => null,
                    'frais_livraison' => $frais,
                ]);
            }

            if ($modeReception === 'AGENCE_PROVINCE') {

                Livraison::create([
                    'id_commande' => $commande->id_commande,
                    'id_adresse' => null,
                    'id_agence' => $agence->id_agence,
                    'zone_livraison' => 'PROVINCE',
                    'nom_destinataire' => $validated['nom_destinataire'],
                    'telephone' => $validated['telephone'],
                    'region' => $validated['region'],
                    'ville' => $agence->ville,
                    'quartier' => null,
                    'adresse_detail' => null,
                    'lieu_retrait' => $agence->adresse,
                    'frais_livraison' => $frais,
                ]);
            }

            // Pour RETRAIT_MAGASIN, aucune livraison n'est créée.

            // 8. Clôturer l'ancien panier

            $panier->statut = 'COMMANDE';
            $panier->save();

            // 9. Créer un nouveau panier actif

            Panier::create([
                'id_utilisateur' => $idUtilisateur,
                'statut' => 'ACTIF',
            ]);

            return $commande;
        });

        // 10. Réponse JSON

        $commande->load([
            'articles',
            'livraison.agence'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Commande créée avec succès. Votre stock est réservé pendant 15 minutes.',
            'data' => $commande,
        ], 201);
    }
}