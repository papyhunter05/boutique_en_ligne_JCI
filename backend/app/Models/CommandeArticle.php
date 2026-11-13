<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommandeArticle extends Model
{
    protected $table = 'commande_article';

    protected $primaryKey = 'id_commande_article';

    public $timestamps = false;

    protected $fillable = [
        'id_commande',
        'id_variante',
        'nom_produit',
        'modele',
        'taille',
        'image',
        'prix_unitaire',
        'quantite',
        'sous_total',
    ];

    protected $casts = [
        'prix_unitaire' => 'decimal:2',
        'quantite' => 'integer',
        'sous_total' => 'decimal:2',
    ];

    public function commande(): BelongsTo
    {
        return $this->belongsTo(Commande::class, 'id_commande', 'id_commande');
    }

    public function variante(): BelongsTo
    {
        return $this->belongsTo(VarianteProduit::class, 'id_variante', 'id_variante');
    }
}
