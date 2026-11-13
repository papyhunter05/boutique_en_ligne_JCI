<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('commande_article', function (Blueprint $table) {
            $table->increments('id_commande_article');
            $table->unsignedInteger('id_commande');
            $table->unsignedInteger('id_variante');
            $table->string('nom_produit', 150);
            $table->string('modele', 100)->nullable();
            $table->string('taille', 30)->nullable();
            $table->string('image', 500)->nullable();
            $table->decimal('prix_unitaire', 10, 2);
            $table->unsignedInteger('quantite');
            $table->decimal('sous_total', 10, 2);

            $table->index('id_commande', 'idx_commande_article_commande');
            $table->index('id_variante', 'idx_commande_article_variante');
            $table->foreign('id_commande', 'fk_commande_article_commande')
                  ->references('id_commande')->on('commande')
                  ->onUpdate('cascade');
            $table->foreign('id_variante', 'fk_commande_article_variante')
                  ->references('id_variante')->on('variante_produit')
                  ->onUpdate('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('commande_article');
    }
};