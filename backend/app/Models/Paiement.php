<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Paiement extends Model
{
    protected $table = 'paiement';

    protected $primaryKey = 'id_paiement';

    public $timestamps = false;

    protected $fillable = [
        'id_commande',
        'reference_paiement',
        'reference_papi',
        'montant',
        'methode',
        'statut',
        'payment_link',
        'date_confirmation',
    ];

    protected $casts = [
        'montant' => 'decimal:2',
        'date_creation' => 'datetime',
        'date_confirmation' => 'datetime',
    ];

    public function commande(): BelongsTo
    {
        return $this->belongsTo(Commande::class, 'id_commande', 'id_commande');
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(NotificationPaiement::class, 'id_paiement', 'id_paiement');
    }
}
