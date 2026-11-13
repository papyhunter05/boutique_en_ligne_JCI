<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mouvement_stock', function (Blueprint $table) {
            $table->increments('id_mouvement');
            $table->unsignedInteger('id_variante');
            $table->unsignedInteger('id_utilisateur')->nullable();
            $table->unsignedInteger('id_commande')->nullable();
            $table->enum('type_mouvement', [
                'ENTREE', 'RESERVATION', 'LIBERATION', 'SORTIE', 'AJUSTEMENT',
            ]);
            $table->unsignedInteger('quantite');
            $table->string('motif', 255)->nullable();
            $table->dateTime('date_mouvement')->useCurrent();

            $table->index(['id_variante', 'date_mouvement'], 'idx_mouvement_variante_date');
            $table->index('id_commande', 'idx_mouvement_commande');

            $table->foreign('id_commande', 'fk_mouvement_commande')
                  ->references('id_commande')->on('commande')
                  ->onUpdate('cascade');
            $table->foreign('id_utilisateur', 'fk_mouvement_utilisateur')
                  ->references('id_utilisateur')->on('utilisateur')
                  ->onUpdate('cascade');
            $table->foreign('id_variante', 'fk_mouvement_variante')
                  ->references('id_variante')->on('variante_produit')
                  ->onUpdate('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mouvement_stock');
    }
};