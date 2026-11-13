<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('variante_produit', function (Blueprint $table) {
            $table->increments('id_variante');
            $table->unsignedInteger('id_produit');
            $table->string('modele', 100)->nullable();
            $table->string('taille', 30)->nullable();
            $table->string('image', 500)->nullable();
            $table->string('sku', 100)->unique();
            $table->unsignedInteger('quantite_stock')->default(0);
            $table->unsignedInteger('quantite_reservee')->default(0);
            $table->enum('statut', ['ACTIF', 'INACTIF'])->default('ACTIF');
            $table->dateTime('date_creation')->useCurrent();
            $table->dateTime('date_modification')->useCurrent()->useCurrentOnUpdate();

            $table->index('id_produit', 'idx_variante_produit');
            $table->index('statut', 'idx_variante_statut');
            $table->foreign('id_produit', 'fk_variante_produit')
                  ->references('id_produit')->on('produit')
                  ->onUpdate('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('variante_produit');
    }
};