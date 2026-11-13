<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('paiement', function (Blueprint $table) {
            $table->increments('id_paiement');
            $table->unsignedInteger('id_commande');
            $table->string('reference_paiement', 100)->unique();
            $table->string('reference_papi', 150)->nullable();
            $table->decimal('montant', 10, 2);
            $table->string('methode', 50)->nullable();
            $table->enum('statut', ['EN_ATTENTE', 'REUSSI', 'ECHOUE', 'EXPIRE'])->default('EN_ATTENTE');
            $table->text('payment_link')->nullable();
            $table->dateTime('date_creation')->useCurrent();
            $table->dateTime('date_confirmation')->nullable();

            $table->index('id_commande', 'idx_paiement_commande');
            $table->index('reference_papi', 'idx_paiement_reference_papi');
            $table->foreign('id_commande', 'fk_paiement_commande')
                  ->references('id_commande')->on('commande')
                  ->onUpdate('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('paiement');
    }
};