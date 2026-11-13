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
    ];

    protected $casts = [
        'date_modification' => 'datetime',
    ];
}
