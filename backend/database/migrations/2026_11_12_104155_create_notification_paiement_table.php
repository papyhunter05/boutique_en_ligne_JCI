<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_paiement', function (Blueprint $table) {
            $table->increments('id_notification');
            $table->unsignedInteger('id_paiement');
            $table->string('reference_evenement', 150)->unique();
            $table->string('type_evenement', 100);
            $table->dateTime('date_reception')->useCurrent();
            $table->enum('statut_traitement', ['RECU', 'TRAITE', 'ERREUR'])->default('RECU');
            $table->json('payload')->nullable();

            $table->index('id_paiement', 'idx_notification_paiement');
            $table->index('statut_traitement', 'idx_notification_statut');
            $table->foreign('id_paiement', 'fk_notification_paiement')
                  ->references('id_paiement')->on('paiement')
                  ->onUpdate('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_paiement');
    }
};