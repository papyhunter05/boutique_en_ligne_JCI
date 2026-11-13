<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Livraison extends Model
{
    protected $table = 'livraison';

    protected $primaryKey = 'id_livraison';

    public $timestamps = false;

    protected $fillable = [
        'id_commande',
        'id_adresse',
        'id_agence',
        'zone_livraison',
        'nom_destinataire',
        'telephone',
        'region',
        'ville',
        'quartier',
        'adresse_detail',
        'lieu_retrait',
        'frais_livraison',
        'numero_suivi',
        'statut',
        'date_expedition',
        'date_reception_agence',
        'date_livraison',
    ];

    protected $casts = [
        'frais_livraison' => 'decimal:2',
        'date_expedition' => 'datetime',
        'date_reception_agence' => 'datetime',
        'date_livraison' => 'datetime',
        'date_creation' => 'datetime',
    ];

    public function commande(): BelongsTo
    {
        return $this->belongsTo(Commande::class, 'id_commande', 'id_commande');
    }

    public function adresse(): BelongsTo
    {
        return $this->belongsTo(Adresse::class, 'id_adresse', 'id_adresse');
    }

    public function agence(): BelongsTo
    {
        return $this->belongsTo(AgenceTransport::class, 'id_agence', 'id_agence');
    }
}
