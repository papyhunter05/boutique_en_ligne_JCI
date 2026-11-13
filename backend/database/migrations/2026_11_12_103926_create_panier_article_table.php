<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('panier_article', function (Blueprint $table) {
            $table->increments('id_panier_article');
            $table->unsignedInteger('id_panier');
            $table->unsignedInteger('id_variante');
            $table->unsignedInteger('quantite');
            $table->dateTime('date_ajout')->useCurrent();

            $table->unique(['id_panier', 'id_variante'], 'uq_panier_variante');
            $table->index('id_variante', 'idx_panier_article_variante');
            $table->foreign('id_panier', 'fk_panier_article_panier')
                  ->references('id_panier')->on('panier')
                  ->onUpdate('cascade');
            $table->foreign('id_variante', 'fk_panier_article_variante')
                  ->references('id_variante')->on('variante_produit')
                  ->onUpdate('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('panier_article');
    }
};