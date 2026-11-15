<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $colonneExiste = DB::table('information_schema.COLUMNS')
            ->where('TABLE_SCHEMA', DB::connection()->getDatabaseName())
            ->where('TABLE_NAME', 'utilisateur')
            ->where('COLUMN_NAME', 'admin_unique')
            ->exists();

        if ($colonneExiste) {
            Schema::table('utilisateur', function (Blueprint $table) {
                $table->dropUnique('uq_un_seul_admin');
                $table->dropColumn('admin_unique');
            });
        }
    }

    public function down(): void
    {
        $colonneExiste = DB::table('information_schema.COLUMNS')
            ->where('TABLE_SCHEMA', DB::connection()->getDatabaseName())
            ->where('TABLE_NAME', 'utilisateur')
            ->where('COLUMN_NAME', 'admin_unique')
            ->exists();

        if (!$colonneExiste) {
            Schema::table('utilisateur', function (Blueprint $table) {
                $table->tinyInteger('admin_unique')
                    ->nullable()
                    ->storedAs("CASE WHEN role = 'ADMIN' THEN 1 ELSE NULL END");

                $table->unique('admin_unique', 'uq_un_seul_admin');
            });
        }
    }
};
