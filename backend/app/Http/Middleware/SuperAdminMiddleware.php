<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SuperAdminMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $utilisateur = $request->user();

        // Vérifier l'authentification
        if (!$utilisateur) {
            return response()->json([
                'success' => false,
                'message' => 'Authentification requise.',
            ], 401);
        }

        // Vérifier le rôle SUPER_ADMIN
        if ($utilisateur->role !== 'SUPER_ADMIN') {
            return response()->json([
                'success' => false,
                'message' => 'Accès interdit. Réservé au SUPER_ADMIN.',
            ], 403);
        }

        return $next($request);
    }
}