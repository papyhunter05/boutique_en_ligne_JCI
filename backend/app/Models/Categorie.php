<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Categorie extends Model
{
    protected $table = 'categorie';

    protected $primaryKey = 'id_categorie';

    public $timestamps = false;

    protected $fillable = [
        'nom_categorie',
        'description',
        'statut',
    ];

    protected $casts = [
        'date_creation' => 'datetime',
    ];

    public function produits(): HasMany
    {
        return $this->hasMany(Produit::class, 'id_categorie', 'id_categorie');
    }
}
