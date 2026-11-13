<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | INSCRIPTION
    |--------------------------------------------------------------------------
    */

    public function register(Request $request)
    {
        $validated = $request->validate([
            'nom' => ['required', 'string', 'max:100'],
            'prenom' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255', 'unique:utilisateur,email'],
            'telephone' => ['nullable', 'string', 'max:20'],
            'mot_de_passe' => [
                'required',
                'confirmed',
                Password::min(8),
            ],
        ]);

        // Création du compte avec le rôle CLIENT imposé
        $utilisateur = Utilisateur::create([
            'nom' => $validated['nom'],
            'prenom' => $validated['prenom'],
            'email' => $validated['email'],
            'telephone' => $validated['telephone'] ?? null,
            'mot_de_passe' => $validated['mot_de_passe'],
            'role' => 'CLIENT',
            'statut' => 'ACTIF',
        ]);

        // Génération du token Sanctum
        $token = $utilisateur->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Inscription réussie.',
            'utilisateur' => $utilisateur,
            'token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    }

    /*
    |--------------------------------------------------------------------------
    | CONNEXION
    |--------------------------------------------------------------------------
    */

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'mot_de_passe' => ['required', 'string'],
        ]);

        // Recherche de l'utilisateur par son email
        $utilisateur = Utilisateur::where(
            'email',
            $validated['email']
        )->first();

        // Vérification des identifiants
        if (
            !$utilisateur ||
            !Hash::check(
                $validated['mot_de_passe'],
                $utilisateur->mot_de_passe
            )
        ) {
            throw ValidationException::withMessages([
                'email' => ['Adresse email ou mot de passe incorrect.'],
            ]);
        }

        // Vérification du statut du compte
        if ($utilisateur->statut !== 'ACTIF') {
            return response()->json([
                'success' => false,
                'message' => 'Votre compte est bloqué. Contactez l’administration.',
            ], 403);
        }

        // Génération d'un nouveau token
        $token = $utilisateur->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Connexion réussie.',
            'utilisateur' => $utilisateur,
            'token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | DÉCONNEXION
    |--------------------------------------------------------------------------
    */

    public function logout(Request $request)
    {
        // Suppression du token utilisé pour cette requête
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Déconnexion réussie.',
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | UTILISATEUR CONNECTÉ
    |--------------------------------------------------------------------------
    */

    public function me(Request $request)
    {
        return response()->json([
            'success' => true,
            'utilisateur' => $request->user(),
        ]);
    }
}
