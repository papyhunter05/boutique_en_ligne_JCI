<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categorie', function (Blueprint $table) {
            $table->increments('id_categorie');
            $table->string('nom_categorie', 100)->unique();
            $table->text('description')->nullable();
            $table->enum('statut', ['ACTIF', 'INACTIF'])->default('ACTIF');
            $table->dateTime('date_creation')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categorie');
    }
};