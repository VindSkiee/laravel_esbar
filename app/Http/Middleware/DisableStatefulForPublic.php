<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class DisableStatefulForPublic
{
    /**
     * Handle an incoming request.
     * Bypass stateful API checks for public customer routes
     */
    public function handle(Request $request, Closure $next)
    {
        // Skip Sanctum's stateful check for non-admin routes
        $request->attributes->set('sanctum.stateful', false);
        
        return $next($request);
    }
}
