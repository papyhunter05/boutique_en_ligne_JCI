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

        // Vérifier si l'utilisateur possède le rôle ADMIN
        if ($request->user()->role !== 'ADMIN') {
            return response()->json([
                'success' => false,
                'message' => 'Accès interdit. Réservé à l’administrateur.',
            ], 403);
        }

        return $next($request);
    }
}
