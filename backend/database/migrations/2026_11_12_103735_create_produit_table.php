<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('produit', function (Blueprint $table) {
            $table->increments('id_produit');
            $table->unsignedInteger('id_categorie');
            $table->string('nom_produit', 150);
            $table->text('description')->nullable();
            $table->decimal('prix', 10, 2);
            $table->enum('statut', ['ACTIF', 'INACTIF'])->default('ACTIF');
            $table->dateTime('date_creation')->useCurrent();
            $table->dateTime('date_modification')->useCurrent()->useCurrentOnUpdate();

            $table->index('id_categorie', 'idx_produit_categorie');
            $table->index('statut', 'idx_produit_statut');
            $table->foreign('id_categorie', 'fk_produit_categorie')
                  ->references('id_categorie')->on('categorie')
                  ->onUpdate('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('produit');
    }
};