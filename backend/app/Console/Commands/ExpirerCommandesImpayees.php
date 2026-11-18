<?php

namespace App\Console\Commands;

use App\Models\Commande;
use App\Models\MouvementStock;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ExpirerCommandesImpayees extends Command
{
    protected $signature = 'commandes:expirer';

    protected $description = 'Expire les commandes impayées et libère les stocks réservés';

    public function handle(): int
    {
        $commandes = Commande::query()
            ->where('statut', 'EN_ATTENTE_PAIEMENT')
            ->where('date_expiration_paiement', '<=', now())
            ->pluck('id_commande');

        $nombreExpirees = 0;

        foreach ($commandes as $idCommande) {
            DB::transaction(function () use ($idCommande, &$nombreExpirees) {

                $commande = Commande::query()
                    ->where('id_commande', $idCommande)
                    ->lockForUpdate()
                    ->first();

                if (!$commande || $commande->statut !== 'EN_ATTENTE_PAIEMENT') {
                    return;
                }

                // Ne jamais annuler une commande déjà payée.
                if ($commande->paiements()
                    ->where('statut', 'REUSSI')
                    ->exists()) {
                    return;
                }

                $articles = $commande->articles()
                    ->orderBy('id_variante')
                    ->get();

                foreach ($articles as $article) {

                    $variante = $article->variante()
                        ->lockForUpdate()
                        ->first();

                    if (!$variante ||
                        $variante->quantite_reservee < $article->quantite) {
                        throw new \RuntimeException(
                            "Réservation de stock incohérente pour la variante {$article->id_variante}."
                        );
                    }

                    $variante->decrement(
                        'quantite_reservee',
                        $article->quantite
                    );

                    MouvementStock::create([
                        'id_variante' => $variante->id_variante,
                        'id_utilisateur' => $commande->id_utilisateur,
                        'id_commande' => $commande->id_commande,
                        'type_mouvement' => 'LIBERATION',
                        'quantite' => $article->quantite,
                        'motif' => 'Expiration de la commande impayée',
                    ]);
                }

                // Expirer les tentatives de paiement encore en attente.
                $commande->paiements()
                    ->where('statut', 'EN_ATTENTE')
                    ->update([
                        'statut' => 'EXPIRE',
                    ]);

                // Annuler la commande.
                $commande->update([
                    'statut' => 'ANNULEE',
                ]);

                // Annuler la livraison associée, si elle existe.
                $commande->livraison()
                    ->update([
                        'statut' => 'ANNULEE',
                    ]);

                $nombreExpirees++;
            });
        }

        $this->info(
            "{$nombreExpirees} commande(s) expirée(s)."
        );

        return self::SUCCESS;
    }
}