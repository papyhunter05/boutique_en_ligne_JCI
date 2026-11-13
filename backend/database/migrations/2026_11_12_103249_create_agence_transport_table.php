<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agence_transport', function (Blueprint $table) {
            $table->increments('id_agence');
            $table->string('nom_agence', 150);
            $table->string('telephone', 20)->nullable();
            $table->text('adresse');
            $table->string('ville', 100);
            $table->string('mail', 250)->nullable();
            $table->enum('statut', ['ACTIVE', 'INACTIVE'])->default('ACTIVE');
            $table->dateTime('date_creation')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agence_transport');
    }
};