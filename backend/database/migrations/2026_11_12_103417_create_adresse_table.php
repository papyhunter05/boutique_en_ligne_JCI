<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('adresse', function (Blueprint $table) {
            $table->increments('id_adresse');
            $table->unsignedInteger('id_utilisateur');
            $table->string('nom_destinataire', 100);
            $table->string('telephone', 20);
            $table->string('region', 100);
            $table->string('ville', 100);
            $table->string('quartier', 100)->nullable();
            $table->text('adresse_detail');
            $table->boolean('est_principale')->default(false);
            $table->dateTime('date_creation')->useCurrent();

            $table->index('id_utilisateur', 'idx_adresse_utilisateur');
            $table->foreign('id_utilisateur', 'fk_adresse_utilisateur')
                  ->references('id_utilisateur')->on('utilisateur')
                  ->onUpdate('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('adresse');
    }
};