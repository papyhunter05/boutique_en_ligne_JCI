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

        if (!$utilisateur || $utilisateur->role !== 'SUPER_ADMIN') {
            return response()->json([
                'success' => false,
                'message' => 'Accès réservé au SUPER_ADMIN.',
            ], 403);
        }

        return $next($request);
    }
}
