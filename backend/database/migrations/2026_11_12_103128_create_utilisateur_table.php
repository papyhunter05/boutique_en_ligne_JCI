<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('utilisateur', function (Blueprint $table) {
            $table->increments('id_utilisateur');
            $table->string('nom', 100);
            $table->string('prenom', 100);
            $table->string('email', 150)->unique();
            $table->string('telephone', 20);
            $table->string('mot_de_passe', 255);
            $table->enum('role', ['CLIENT', 'ADMIN'])->default('CLIENT');
            $table->enum('statut', ['ACTIF', 'BLOQUE'])->default('ACTIF');
            $table->dateTime('date_creation')->useCurrent();
            $table->dateTime('date_modification')->useCurrent()->useCurrentOnUpdate();
        });

        // Colonne générée + contrainte unique : un seul ADMIN possible
        DB::statement("
            ALTER TABLE utilisateur
            ADD COLUMN admin_unique TINYINT(4)
            GENERATED ALWAYS AS (CASE WHEN role = 'ADMIN' THEN 1 ELSE NULL END) STORED
        ");
        DB::statement("ALTER TABLE utilisateur ADD UNIQUE KEY uq_un_seul_admin (admin_unique)");
    }

    public function down(): void
    {
        Schema::dropIfExists('utilisateur');
    }
};