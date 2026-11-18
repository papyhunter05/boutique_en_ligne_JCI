<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            ALTER TABLE utilisateur
            MODIFY role ENUM('CLIENT', 'ADMIN', 'SUPER_ADMIN')
            NOT NULL DEFAULT 'CLIENT'
        ");

        DB::statement("
            ALTER TABLE utilisateur
            ADD COLUMN super_admin_unique TINYINT
            GENERATED ALWAYS AS (
                CASE
                    WHEN role = 'SUPER_ADMIN' THEN 1
                    ELSE NULL
                END
            ) STORED
        ");

        DB::statement("
            CREATE UNIQUE INDEX uq_un_seul_super_admin
            ON utilisateur (super_admin_unique)
        ");
    }

    public function down(): void
    {
        if (DB::table('utilisateur')
            ->where('role', 'SUPER_ADMIN')
            ->exists()) {
            throw new RuntimeException(
                'Rétrograde le SUPER_ADMIN avant de supprimer cette migration.'
            );
        }

        DB::statement("
            DROP INDEX uq_un_seul_super_admin ON utilisateur
        ");

        DB::statement("
            ALTER TABLE utilisateur
            DROP COLUMN super_admin_unique
        ");

        DB::statement("
            ALTER TABLE utilisateur
            MODIFY role ENUM('CLIENT', 'ADMIN')
            NOT NULL DEFAULT 'CLIENT'
        ");
    }
};
