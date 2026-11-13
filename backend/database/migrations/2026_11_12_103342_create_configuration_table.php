<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('configuration', function (Blueprint $table) {
            $table->increments('id_configuration');
            $table->string('cle', 100)->unique();
            $table->string('valeur', 255);
            $table->dateTime('date_modification')->useCurrent()->useCurrentOnUpdate();
        });

        // Valeurs par défaut (issues du dump)
        DB::table('configuration')->insert([
            ['cle' => 'frais_livraison', 'valeur' => '5000'],
            ['cle' => 'duree_reservation_stock_minutes', 'valeur' => '15'],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('configuration');
    }
};