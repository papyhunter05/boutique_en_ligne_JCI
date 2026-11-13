<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('panier', function (Blueprint $table) {
            $table->increments('id_panier');
            $table->unsignedInteger('id_utilisateur');
            $table->enum('statut', ['ACTIF', 'COMMANDE', 'ABANDONNE'])->default('ACTIF');
            $table->dateTime('date_creation')->useCurrent();
            $table->dateTime('date_modification')->useCurrent()->useCurrentOnUpdate();

            $table->index(['id_utilisateur', 'statut'], 'idx_panier_utilisateur_statut');
            $table->foreign('id_utilisateur', 'fk_panier_utilisateur')
                  ->references('id_utilisateur')->on('utilisateur')
                  ->onUpdate('cascade');
        });

        // Colonne générée + contrainte unique : un seul panier ACTIF par utilisateur
        DB::statement("
            ALTER TABLE panier
            ADD COLUMN id_utilisateur_panier_actif INT(10) UNSIGNED
            GENERATED ALWAYS AS (CASE WHEN statut = 'ACTIF' THEN id_utilisateur ELSE NULL END) STORED
        ");
        DB::statement("ALTER TABLE panier ADD UNIQUE KEY uq_un_panier_actif_par_utilisateur (id_utilisateur_panier_actif)");
    }

    public function down(): void
    {
        Schema::dropIfExists('panier');
    }
};