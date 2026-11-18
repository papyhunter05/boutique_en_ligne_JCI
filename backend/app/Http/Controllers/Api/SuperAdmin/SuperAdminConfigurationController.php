<?php

namespace App\Http\Controllers\Api\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Configuration;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SuperAdminConfigurationController extends Controller
{
    /**
     * Afficher toutes les configurations.
     */
    public function index(): JsonResponse
    {
        $configurations = Configuration::query()
            ->orderBy('cle')
            ->get([
                'id_configuration',
                'cle',
                'valeur',
                'date_modification',
            ]);

        return response()->json([
            'success' => true,
            'message' => 'Configurations récupérées avec succès.',
            'data' => $configurations,
        ]);
    }


/**
 * Ajouter une nouvelle configuration.
 */
    public function store(Request $request): JsonResponse
    {
        $validation = Validator::make($request->all(), [
            'cle' => [
                'required',
                'string',
                'max:100',
                'regex:/^[a-z][a-z0-9_]*$/',
                'unique:configuration,cle',
            ],
            'valeur' => [
                'required',
                'string',
                'max:5000',
            ],
        ], [
            'cle.required' => 'La clé est obligatoire.',
            'cle.regex' => 'La clé doit commencer par une lettre minuscule et contenir uniquement des lettres minuscules, des chiffres et des underscores.',
            'cle.unique' => 'Cette clé de configuration existe déjà.',
            'valeur.required' => 'La valeur est obligatoire.',
        ]);

        if ($validation->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides.',
                'errors' => $validation->errors(),
            ], 422);
        }

        $cle = $request->input('cle');
        $valeur = $request->input('valeur');

        // Validation spécifique des configurations connues.
        if ($cle === 'frais_livraison' &&
            (!is_numeric($valeur) || (float) $valeur < 0)) {
            return response()->json([
                'success' => false,
                'message' => 'Les frais de livraison doivent être un nombre positif ou nul.',
            ], 422);
        }

        if ($cle === 'duree_reservation_stock_minutes' &&
            (!ctype_digit($valeur) || (int) $valeur < 1)) {
            return response()->json([
                'success' => false,
                'message' => 'La durée de réservation doit être un entier supérieur ou égal à 1.',
            ], 422);
        }

        if ($cle === 'adresse_point_vente' &&
            trim($valeur) === '') {
            return response()->json([
                'success' => false,
                'message' => 'L’adresse du point de vente ne peut pas être vide.',
            ], 422);
        }

        $configuration = Configuration::create([
            'cle' => $cle,
            'valeur' => $valeur,
            'date_modification' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Configuration ajoutée avec succès.',
            'data' => $configuration,
        ], 201);
    }


/**
 * Modifier la valeur d'une configuration existante.
 */
    public function update(Request $request, int $id): JsonResponse
    {
        $configuration = Configuration::find($id);

        if (!$configuration) {
            return response()->json([
                'success' => false,
                'message' => 'Configuration introuvable.',
            ], 404);
        }

        $validation = Validator::make($request->all(), [
            'valeur' => [
                'required',
                'string',
                'max:5000',
            ],
        ], [
            'valeur.required' => 'La valeur est obligatoire.',
        ]);

        if ($validation->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides.',
                'errors' => $validation->errors(),
            ], 422);
        }

        $valeur = $request->input('valeur');

        // Validation selon le type de configuration.
        if ($configuration->cle === 'frais_livraison' &&
            (!is_numeric($valeur) || (float) $valeur < 0)) {
            return response()->json([
                'success' => false,
                'message' => 'Les frais de livraison doivent être un nombre positif ou nul.',
            ], 422);
        }

        if ($configuration->cle === 'duree_reservation_stock_minutes' &&
            (!ctype_digit($valeur) || (int) $valeur < 1)) {
            return response()->json([
                'success' => false,
                'message' => 'La durée de réservation doit être un entier supérieur ou égal à 1.',
            ], 422);
        }

        if ($configuration->cle === 'adresse_point_vente' &&
            trim($valeur) === '') {
            return response()->json([
                'success' => false,
                'message' => 'L’adresse du point de vente ne peut pas être vide.',
            ], 422);
        }

        $configuration->update([
            'valeur' => $valeur,
            'date_modification' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Configuration modifiée avec succès.',
            'data' => $configuration->fresh(),
        ]);
    }


}
