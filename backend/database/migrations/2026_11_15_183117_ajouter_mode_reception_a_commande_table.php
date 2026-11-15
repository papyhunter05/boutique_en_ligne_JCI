
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('commande', function (Blueprint $table) {
            $table->enum('mode_reception', [
                'LIVRAISON_ANTANANARIVO',
                'AGENCE_PROVINCE',
                'RETRAIT_MAGASIN'
            ])->after('id_panier');

            $table->string('lieu_retrait', 500)
                  ->nullable()
                  ->after('mode_reception');
        });
    }

    public function down(): void
    {
        Schema::table('commande', function (Blueprint $table) {
            $table->dropColumn([
                'mode_reception',
                'lieu_retrait'
            ]);
        });
    }
};
