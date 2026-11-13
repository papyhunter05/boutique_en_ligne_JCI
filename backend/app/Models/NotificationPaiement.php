<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationPaiement extends Model
{
    protected $table = 'notification_paiement';

    protected $primaryKey = 'id_notification';

    public $timestamps = false;

    protected $fillable = [
        'id_paiement',
        'reference_evenement',
        'type_evenement',
        'statut_traitement',
        'payload',
    ];

    protected $casts = [
        'date_reception' => 'datetime',
        'payload' => 'array',
    ];

    public function paiement(): BelongsTo
    {
        return $this->belongsTo(Paiement::class, 'id_paiement', 'id_paiement');
    }
}
