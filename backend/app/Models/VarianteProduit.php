<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VarianteProduit extends Model
{
    protected $table = 'variante_produit';

    protected $primaryKey = 'id_variante';

    public $timestamps = false;

    protected $fillable = [
        'id_produit',
        'modele',
        'taille',
        'image',
        'sku',
        'quantite_stock',
        'quantite_reservee',
        'statut',
    ];

    protected $casts = [
        'quantite_stock' => 'integer',
        'quantite_reservee' => 'integer',
        'date_creation' => 'datetime',
        'date_modification' => 'datetime',
    ];

    public function produit(): BelongsTo
    {
        return $this->belongsTo(Produit::class, 'id_produit', 'id_produit');
    }

    public function articlesPanier(): HasMany
    {
        return $this->hasMany(PanierArticle::class, 'id_variante', 'id_variante');
    }

    public function articlesCommande(): HasMany
    {
        return $this->hasMany(CommandeArticle::class, 'id_variante', 'id_variante');
    }

    public function mouvementsStock(): HasMany
    {
        return $this->hasMany(MouvementStock::class, 'id_variante', 'id_variante');
    }
}
