<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        // Vérifier si l'utilisateur est connecté
        if (!$request->user()) {
            return response()->json([
                'success' => false,
                'message' => 'Authentification requise.',
            ], 401);
        }

        // ADMIN et SUPER_ADMIN peuvent accéder aux fonctionnalités administratives
        if (!in_array($request->user()->role, ['ADMIN', 'SUPER_ADMIN'], true)) {
            return response()->json([
                'success' => false,
                'message' => 'Accès interdit. Réservé aux administrateurs.',
            ], 403);
        }

        return $next($request);
    }
}
