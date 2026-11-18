<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Models\Panier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\PanierArticle;
use App\Models\VarianteProduit;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Storage;

class PanierController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $utilisateur = $request->user();

        $panier = DB::transaction(function () use ($utilisateur) {

            // Verrouiller l'utilisateur pour éviter
            // la création simultanée de plusieurs paniers actifs.
            $utilisateur->newQuery()
                ->whereKey($utilisateur->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            // Chercher le panier actif de l'utilisateur.
            $panier = Panier::where(
                'id_utilisateur',
                $utilisateur->id_utilisateur
            )
                ->where('statut', 'ACTIF')
                ->first();

            // Créer un panier s'il n'existe pas.
            if (!$panier) {
                $panier = Panier::create([
                    'id_utilisateur' => $utilisateur->id_utilisateur,
                    'statut' => 'ACTIF',
                ]);
            }

            return $panier;
        });

        // Récupérer les articles et leurs relations.
        $panier->load([
            'articles.variante.produit'
        ]);

        $articles = $panier->articles->map(function ($article) {

            $variante = $article->variante;
            $produit = $variante->produit;

            return [
                'id_panier_article' => $article->id_panier_article,
                'id_variante' => $variante->id_variante,
                'nom_produit' => $produit->nom_produit,
                'modele' => $variante->modele,
                'taille' => $variante->taille,
                'image' => $variante->image
                    ? Storage::disk('public')->url($variante->image)
                    : null,
                'prix_unitaire' => $produit->prix,
                'quantite' => $article->quantite,
                'stock_disponible' => max(
                    0,
                    $variante->quantite_stock - $variante->quantite_reservee
                ),
                'sous_total' => $produit->prix * $article->quantite,
            ];
        });

        return response()->json([
            'success' => true,
            'message' => 'Panier récupéré avec succès.',
            'data' => [
                'id_panier' => $panier->id_panier,
                'statut' => $panier->statut,
                'articles' => $articles,
                'nombre_articles' => $articles->count(),
                'total' => $articles->sum('sous_total'),
            ],
        ]);
    }


    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id_variante' => [
                'required',
                'integer',
                'exists:variante_produit,id_variante'
            ],
            'quantite' => [
                'required',
                'integer',
                'min:1'
            ],
        ]);

        $utilisateur = $request->user();

        $resultat = DB::transaction(function () use (
            $utilisateur,
            $validated
        ) {

            // Verrouiller l'utilisateur.
            $utilisateur->newQuery()
                ->whereKey($utilisateur->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            // Récupérer ou créer son panier actif.
            $panier = Panier::where(
                'id_utilisateur',
                $utilisateur->id_utilisateur
            )
                ->where('statut', 'ACTIF')
                ->lockForUpdate()
                ->first();

            if (!$panier) {
                $panier = Panier::create([
                    'id_utilisateur' => $utilisateur->id_utilisateur,
                    'statut' => 'ACTIF',
                ]);
            }

            // Verrouiller la variante concernée.
            $variante = VarianteProduit::with('produit.categorie')
                ->lockForUpdate()
                ->findOrFail($validated['id_variante']);

            $produit = $variante->produit;

            // Vérifier que la variante et le produit sont actifs.
            if (
                $variante->statut !== 'ACTIF' ||
                !$produit ||
                $produit->statut !== 'ACTIF' ||
                !$produit->categorie ||
                $produit->categorie->statut !== 'ACTIF'
            ) {
                throw ValidationException::withMessages([
                    'id_variante' => [
                        'Ce produit ou cette variante n’est plus disponible.'
                    ],
                ]);
            }

            // Calculer le stock réellement disponible.
            $stockDisponible = max(
                0,
                $variante->quantite_stock - $variante->quantite_reservee
            );

            // Rechercher si cette variante existe déjà dans le panier.
            $article = PanierArticle::where('id_panier', $panier->id_panier)
                ->where('id_variante', $variante->id_variante)
                ->lockForUpdate()
                ->first();

            $ancienneQuantite = $article ? $article->quantite : 0;

            $nouvelleQuantite = $ancienneQuantite + $validated['quantite'];

            // Vérifier que la quantité totale ne dépasse pas le stock.
            if ($nouvelleQuantite > $stockDisponible) {
                throw ValidationException::withMessages([
                    'quantite' => [
                        "Stock insuffisant. Il reste {$stockDisponible} unité(s) disponible(s)."
                    ],
                ]);
            }

            // Mettre à jour ou créer l'article.
            if ($article) {
                $article->quantite = $nouvelleQuantite;
                $article->save();
            } else {
                $article = PanierArticle::create([
                    'id_panier' => $panier->id_panier,
                    'id_variante' => $variante->id_variante,
                    'quantite' => $nouvelleQuantite,
                ]);
            }

            return [
                'panier' => $panier,
                'article' => $article,
                'variante' => $variante,
                'stock_disponible' => $stockDisponible,
            ];
        });

        return response()->json([
            'success' => true,
            'message' => 'Article ajouté au panier avec succès.',
            'data' => [
                'id_panier' => $resultat['panier']->id_panier,
                'article' => [
                    'id_panier_article' => $resultat['article']->id_panier_article,
                    'id_variante' => $resultat['variante']->id_variante,
                    'nom_produit' => $resultat['variante']->produit->nom_produit,
                    'modele' => $resultat['variante']->modele,
                    'taille' => $resultat['variante']->taille,
                    'quantite' => $resultat['article']->quantite,
                    'stock_disponible' => $resultat['stock_disponible'],
                ],
            ],
        ], 201);
    }


    public function update(Request $request, int $idArticle): JsonResponse
    {
        $validated = $request->validate([
            'quantite' => ['required', 'integer', 'min:1'],
        ]);

        $utilisateur = $request->user();

        $article = DB::transaction(function () use (
            $utilisateur,
            $idArticle,
            $validated
        ) {
            $utilisateur->newQuery()
                ->whereKey($utilisateur->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            $panier = Panier::where('id_utilisateur', $utilisateur->id_utilisateur)
                ->where('statut', 'ACTIF')
                ->lockForUpdate()
                ->first();

            if (!$panier) {
                throw ValidationException::withMessages([
                    'panier' => ['Aucun panier actif trouvé.'],
                ]);
            }

            $article = PanierArticle::where('id_panier', $panier->id_panier)
                ->where('id_panier_article', $idArticle)
                ->lockForUpdate()
                ->first();

            if (!$article) {
                throw ValidationException::withMessages([
                    'article' => ['Cet article est introuvable dans votre panier.'],
                ]);
            }

            $variante = VarianteProduit::with('produit.categorie')
                ->lockForUpdate()
                ->findOrFail($article->id_variante);

            if (
                $variante->statut !== 'ACTIF' ||
                !$variante->produit ||
                $variante->produit->statut !== 'ACTIF' ||
                !$variante->produit->categorie ||
                $variante->produit->categorie->statut !== 'ACTIF'
            ) {
                throw ValidationException::withMessages([
                    'article' => ['Ce produit ou cette variante n’est plus disponible.'],
                ]);
            }

            $stockDisponible = max(
                0,
                $variante->quantite_stock - $variante->quantite_reservee
            );

            if ($validated['quantite'] > $stockDisponible) {
                throw ValidationException::withMessages([
                    'quantite' => [
                        "Stock insuffisant. Il reste {$stockDisponible} unité(s) disponible(s)."
                    ],
                ]);
            }

            $article->quantite = $validated['quantite'];
            $article->save();

            return $article;
        });

        return response()->json([
            'success' => true,
            'message' => 'Quantité modifiée avec succès.',
            'data' => [
                'id_panier_article' => $article->id_panier_article,
                'quantite' => $article->quantite,
            ],
        ]);
    }


    public function destroy(Request $request, int $idArticle): JsonResponse
    {
        $utilisateur = $request->user();

        $supprime = DB::transaction(function () use (
            $utilisateur,
            $idArticle
        ) {
            $utilisateur->newQuery()
                ->whereKey($utilisateur->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            $panier = Panier::where('id_utilisateur', $utilisateur->id_utilisateur)
                ->where('statut', 'ACTIF')
                ->lockForUpdate()
                ->first();

            if (!$panier) {
                throw ValidationException::withMessages([
                    'panier' => ['Aucun panier actif trouvé.'],
                ]);
            }

            $article = PanierArticle::where('id_panier', $panier->id_panier)
                ->where('id_panier_article', $idArticle)
                ->lockForUpdate()
                ->first();

            if (!$article) {
                throw ValidationException::withMessages([
                    'article' => ['Cet article est introuvable dans votre panier.'],
                ]);
            }

            $article->delete();

            return true;
        });

        return response()->json([
            'success' => true,
            'message' => 'Article supprimé du panier avec succès.',
        ]);
    }


    public function clear(Request $request): JsonResponse
    {
        $utilisateur = $request->user();

        DB::transaction(function () use ($utilisateur) {

            $utilisateur->newQuery()
                ->whereKey($utilisateur->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            $panier = Panier::where(
                'id_utilisateur',
                $utilisateur->id_utilisateur
            )
                ->where('statut', 'ACTIF')
                ->lockForUpdate()
                ->first();

            if (!$panier) {
                throw ValidationException::withMessages([
                    'panier' => ['Aucun panier actif trouvé.'],
                ]);
            }

            // Supprimer tous les articles du panier.
            PanierArticle::where(
                'id_panier',
                $panier->id_panier
            )->delete();
        });

        return response()->json([
            'success' => true,
            'message' => 'Votre panier a été vidé avec succès.',
        ]);
    }


}