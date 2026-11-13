<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('commande', function (Blueprint $table) {
            $table->increments('id_commande');
            $table->unsignedInteger('id_utilisateur');
            $table->unsignedInteger('id_panier')->nullable();
            $table->string('reference', 50)->unique();
            $table->dateTime('date_commande')->useCurrent();
            $table->decimal('montant_articles', 10, 2);
            $table->decimal('frais_livraison', 10, 2);
            $table->decimal('montant_total', 10, 2);
            $table->enum('statut', [
                'EN_ATTENTE_PAIEMENT', 'CONFIRMEE', 'EN_PREPARATION',
                'EXPEDIEE', 'LIVREE', 'ANNULEE',
            ])->default('EN_ATTENTE_PAIEMENT');
            $table->dateTime('date_expiration_paiement')->nullable();
            $table->dateTime('date_modification')->useCurrent()->useCurrentOnUpdate();

            $table->unique('id_panier', 'uq_commande_panier');
            $table->index('id_utilisateur', 'idx_commande_utilisateur');
            $table->index(['statut', 'date_expiration_paiement'], 'idx_commande_statut_expiration');
            $table->foreign('id_panier', 'fk_commande_panier')
                  ->references('id_panier')->on('panier')
                  ->onUpdate('cascade');
            $table->foreign('id_utilisateur', 'fk_commande_utilisateur')
                  ->references('id_utilisateur')->on('utilisateur')
                  ->onUpdate('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('commande');
    }
};