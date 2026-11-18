<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            ALTER TABLE livraison
            MODIFY statut ENUM(
                'EN_ATTENTE',
                'EN_PREPARATION',
                'EXPEDIEE',
                'ARRIVEE_AGENCE',
                'LIVREE',
                'ECHEC',
                'ANNULEE'
            ) NOT NULL DEFAULT 'EN_ATTENTE'
        ");
    }

    public function down(): void
    {
        if (DB::table('livraison')->where('statut', 'ANNULEE')->exists()) {
            throw new RuntimeException(
                'Impossible de supprimer ANNULEE : des livraisons utilisent ce statut.'
            );
        }

        DB::statement("
            ALTER TABLE livraison
            MODIFY statut ENUM(
                'EN_ATTENTE',
                'EN_PREPARATION',
                'EXPEDIEE',
                'ARRIVEE_AGENCE',
                'LIVREE',
                'ECHEC'
            ) NOT NULL DEFAULT 'EN_ATTENTE'
        ");
    }
};