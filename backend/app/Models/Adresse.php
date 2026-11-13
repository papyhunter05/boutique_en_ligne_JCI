<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Adresse extends Model
{
    protected $table = 'adresse';

    protected $primaryKey = 'id_adresse';

    public $timestamps = false;

    protected $fillable = [
        'id_utilisateur',
        'nom_destinataire',
        'telephone',
        'region',
        'ville',
        'quartier',
        'adresse_detail',
        'est_principale',
    ];

    protected $casts = [
        'est_principale' => 'boolean',
        'date_creation' => 'datetime',
    ];

    public function utilisateur(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'id_utilisateur', 'id_utilisateur');
    }

    public function livraisons(): HasMany
    {
        return $this->hasMany(Livraison::class, 'id_adresse', 'id_adresse');
    }
}
