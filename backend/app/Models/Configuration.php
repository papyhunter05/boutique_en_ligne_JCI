<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Configuration extends Model
{
    protected $table = 'configuration';

    protected $primaryKey = 'id_configuration';

    public $timestamps = false;

    protected $fillable = [
        'cle',
        'valeur',
        'date_modification',
    ];

    protected $casts = [
        'date_modification' => 'datetime',
    ];

    public static function obtenirValeur(string $cle, mixed $valeurParDefaut = null): mixed
    {
        return static::where('cle', $cle)->value('valeur') ?? $valeurParDefaut;
    }
}
