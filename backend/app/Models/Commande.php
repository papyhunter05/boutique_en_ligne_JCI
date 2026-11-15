<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Commande extends Model
{
    protected $table = 'commande';

    protected $primaryKey = 'id_commande';

    public $timestamps = false;

    protected $fillable = [
        'id_utilisateur',
        'id_panier',
        'reference',
        'mode_reception',
        'lieu_retrait',
        'date_commande',
        'montant_articles',
        'frais_livraison',
        'montant_total',
        'statut',     
        'date_expiration_paiement',
    ];

    protected $casts = [
        'date_commande' => 'datetime',
        'date_expiration_paiement' => 'datetime',
        'date_modification' => 'datetime',
        'montant_articles' => 'decimal:2',
        'frais_livraison' => 'decimal:2',
        'montant_total' => 'decimal:2',
    ];

    public function utilisateur(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'id_utilisateur', 'id_utilisateur');
    }

    public function panier(): BelongsTo
    {
        return $this->belongsTo(Panier::class, 'id_panier', 'id_panier');
    }

    public function articles(): HasMany
    {
        return $this->hasMany(CommandeArticle::class, 'id_commande', 'id_commande');
    }

    public function paiements(): HasMany
    {
        return $this->hasMany(Paiement::class, 'id_commande', 'id_commande');
    }

    public function livraison(): HasOne
    {
        return $this->hasOne(Livraison::class, 'id_commande', 'id_commande');
    }

    public function mouvementsStock(): HasMany
    {
        return $this->hasMany(MouvementStock::class, 'id_commande', 'id_commande');
    }
}
