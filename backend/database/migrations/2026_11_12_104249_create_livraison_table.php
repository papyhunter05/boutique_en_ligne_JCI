<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('livraison', function (Blueprint $table) {
            $table->increments('id_livraison');
            $table->unsignedInteger('id_commande');
            $table->unsignedInteger('id_adresse')->nullable();
            $table->unsignedInteger('id_agence')->nullable();
            $table->enum('zone_livraison', ['ANTANANARIVO', 'PROVINCE']);
            $table->string('nom_destinataire', 100);
            $table->string('telephone', 20);
            $table->string('region', 100);
            $table->string('ville', 100);
            $table->string('quartier', 100)->nullable();
            $table->text('adresse_detail')->nullable();
            $table->string('lieu_retrait', 255)->nullable();
            $table->decimal('frais_livraison', 10, 2);
            $table->string('numero_suivi', 100)->nullable();
            $table->enum('statut', [
                'EN_ATTENTE', 'EN_PREPARATION', 'EXPEDIEE',
                'ARRIVEE_AGENCE', 'LIVREE', 'ECHEC',
            ])->default('EN_ATTENTE');
            $table->dateTime('date_expedition')->nullable();
            $table->dateTime('date_reception_agence')->nullable();
            $table->dateTime('date_livraison')->nullable();
            $table->dateTime('date_creation')->useCurrent();

            $table->unique('id_commande', 'uq_livraison_commande');
            $table->index('statut', 'idx_livraison_statut');
            $table->index('id_agence', 'idx_livraison_agence');

            $table->foreign('id_adresse', 'fk_livraison_adresse')
                  ->references('id_adresse')->on('adresse')
                  ->onUpdate('cascade');
            $table->foreign('id_agence', 'fk_livraison_agence')
                  ->references('id_agence')->on('agence_transport')
                  ->onUpdate('cascade');
            $table->foreign('id_commande', 'fk_livraison_commande')
                  ->references('id_commande')->on('commande')
                  ->onUpdate('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('livraison');
    }
};