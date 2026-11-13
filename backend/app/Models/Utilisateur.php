<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Sanctum\HasApiTokens;

class Utilisateur extends Authenticatable
{
    use HasApiTokens;

    protected $table = 'utilisateur';

    protected $primaryKey = 'id_utilisateur';

    public $incrementing = true;

    protected $keyType = 'int';

    public $timestamps = false;

    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'telephone',
        'mot_de_passe',
        'role',
        'statut',
    ];

    protected $hidden = [
        'mot_de_passe',
    ];

    protected $casts = [
        // Hachage automatique à l'enregistrement
        'mot_de_passe' => 'hashed',

        'date_creation' => 'datetime',
        'date_modification' => 'datetime',
    ];

    // Indique à Laravel le nom de la colonne du mot de passe
    public function getAuthPasswordName(): string
    {
        return 'mot_de_passe';
    }

    // Récupère le mot de passe haché
    public function getAuthPassword(): string
    {
        return $this->mot_de_passe;
    }

    // Relations

    public function adresses(): HasMany
    {
        return $this->hasMany(
            Adresse::class,
            'id_utilisateur',
            'id_utilisateur'
        );
    }

    public function paniers(): HasMany
    {
        return $this->hasMany(
            Panier::class,
            'id_utilisateur',
            'id_utilisateur'
        );
    }

    public function commandes(): HasMany
    {
        return $this->hasMany(
            Commande::class,
            'id_utilisateur',
            'id_utilisateur'
        );
    }

    public function mouvementsStock(): HasMany
    {
        return $this->hasMany(
            MouvementStock::class,
            'id_utilisateur',
            'id_utilisateur'
        );
    }
}