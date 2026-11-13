<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Produit extends Model
{
    protected $table = 'produit';

    protected $primaryKey = 'id_produit';

    public $timestamps = false;

    protected $fillable = [
        'id_categorie',
        'nom_produit',
        'description',
        'prix',
        'statut',
    ];

    protected $casts = [
        'prix' => 'decimal:2',
        'date_creation' => 'datetime',
        'date_modification' => 'datetime',
    ];

    public function categorie(): BelongsTo
    {
        return $this->belongsTo(Categorie::class, 'id_categorie', 'id_categorie');
    }

    public function variantes(): HasMany
    {
        return $this->hasMany(VarianteProduit::class, 'id_produit', 'id_produit');
    }
}
