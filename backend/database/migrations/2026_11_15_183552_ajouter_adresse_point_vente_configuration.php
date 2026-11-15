
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('configuration')->updateOrInsert(
            ['cle' => 'adresse_point_vente'],
            ['valeur' => 'A_DEFINIR']
        );
    }

    public function down(): void
    {
        DB::table('configuration')
            ->where('cle', 'adresse_point_vente')
            ->delete();
    }
};
