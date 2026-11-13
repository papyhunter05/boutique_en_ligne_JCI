<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Panier extends Model
{
    protected $table = 'panier';

    protected $primaryKey = 'id_panier';

    public $timestamps = false;

    protected $fillable = [
        'id_utilisateur',
        'statut',
    ];

    protected $casts = [
        'date_creation' => 'datetime',
        'date_modification' => 'datetime',
    ];

    public function utilisateur(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'id_utilisateur', 'id_utilisateur');
    }

    public function articles(): HasMany
    {
        return $this->hasMany(PanierArticle::class, 'id_panier', 'id_panier');
    }

    public function commande(): HasOne
    {
        return $this->hasOne(Commande::class, 'id_panier', 'id_panier');
    }
}
