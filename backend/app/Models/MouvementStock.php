<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MouvementStock extends Model
{
    protected $table = 'mouvement_stock';

    protected $primaryKey = 'id_mouvement';

    public $timestamps = false;

    protected $fillable = [
        'id_variante',
        'id_utilisateur',
        'id_commande',
        'type_mouvement',
        'quantite',
        'motif',
    ];

    protected $casts = [
        'quantite' => 'integer',
        'date_mouvement' => 'datetime',
    ];

    public function variante(): BelongsTo
    {
        return $this->belongsTo(VarianteProduit::class, 'id_variante', 'id_variante');
    }

    public function utilisateur(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'id_utilisateur', 'id_utilisateur');
    }

    public function commande(): BelongsTo
    {
        return $this->belongsTo(Commande::class, 'id_commande', 'id_commande');
    }
}
