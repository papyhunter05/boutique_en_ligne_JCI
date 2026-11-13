<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PanierArticle extends Model
{
    protected $table = 'panier_article';

    protected $primaryKey = 'id_panier_article';

    public $timestamps = false;

    protected $fillable = [
        'id_panier',
        'id_variante',
        'quantite',
    ];

    protected $casts = [
        'quantite' => 'integer',
        'date_ajout' => 'datetime',
    ];

    public function panier(): BelongsTo
    {
        return $this->belongsTo(Panier::class, 'id_panier', 'id_panier');
    }

    public function variante(): BelongsTo
    {
        return $this->belongsTo(VarianteProduit::class, 'id_variante', 'id_variante');
    }
}
