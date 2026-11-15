<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AgenceTransport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminAgenceTransportController extends Controller
{
    /**
     * Liste toutes les agences de transport.
     */
    public function index(): JsonResponse
    {
        $agences = AgenceTransport::query()
            ->orderByDesc('date_creation')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Liste des agences récupérée avec succès.',
            'data' => $agences,
        ]);
    }

    /**
 * Ajouter une nouvelle agence de transport.
 */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nom_agence' => ['required', 'string', 'max:150'],
            'telephone' => ['nullable', 'string', 'max:20'],
            'adresse' => ['required', 'string'],
            'ville' => ['required', 'string', 'max:100'],
            'mail' => ['nullable', 'email', 'max:250'],
        ]);

        $agence = AgenceTransport::create([
            ...$validated,
            'statut' => 'ACTIVE',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Agence de transport créée avec succès.',
            'data' => $agence,
        ], 201);
    }


/**
 * Modifier les informations d'une agence.
 */
    public function update(Request $request, int $idAgence): JsonResponse
    {
        $agence = AgenceTransport::find($idAgence);

        if (!$agence) {
            return response()->json([
                'success' => false,
                'message' => 'Agence de transport introuvable.',
            ], 404);
        }

        $validated = $request->validate([
            'nom_agence' => ['sometimes', 'required', 'string', 'max:150'],
            'telephone' => ['sometimes', 'nullable', 'string', 'max:20'],
            'adresse' => ['sometimes', 'required', 'string'],
            'ville' => ['sometimes', 'required', 'string', 'max:100'],
            'mail' => ['sometimes', 'nullable', 'email', 'max:250'],
        ]);

        if (empty($validated)) {
            return response()->json([
                'success' => false,
                'message' => 'Aucune information à modifier.',
            ], 422);
        }

        $agence->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Agence de transport modifiée avec succès.',
            'data' => $agence->fresh(),
        ]);
    }


/**
 * Désactiver ou réactiver une agence.
 */
    public function updateStatut(int $idAgence): JsonResponse
    {
        $agence = AgenceTransport::find($idAgence);

        if (!$agence) {
            return response()->json([
                'success' => false,
                'message' => 'Agence de transport introuvable.',
            ], 404);
        }

        $nouveauStatut = $agence->statut === 'ACTIVE'
            ? 'INACTIVE'
            : 'ACTIVE';

        $agence->update([
            'statut' => $nouveauStatut,
        ]);

        return response()->json([
            'success' => true,
            'message' => $nouveauStatut === 'ACTIVE'
                ? 'Agence réactivée avec succès.'
                : 'Agence désactivée avec succès.',
            'data' => $agence->fresh(),
        ]);
    }


}