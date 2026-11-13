<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AgenceTransport extends Model
{
    protected $table = 'agence_transport';

    protected $primaryKey = 'id_agence';

    public $timestamps = false;

    protected $fillable = [
        'nom_agence',
        'telephone',
        'adresse',
        'ville',
        'mail',
        'statut',
    ];

    protected $casts = [
        'date_creation' => 'datetime',
    ];

    public function livraisons(): HasMany
    {
        return $this->hasMany(Livraison::class, 'id_agence', 'id_agence');
    }
}
