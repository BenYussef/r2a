<?php


namespace App\Http\Middleware;

use Closure;
use JWTAuth;
use Exception;
use Tymon\JWTAuth\Http\Middleware\BaseMiddleware;
use Illuminate\Support\Facades\Auth;

class AuthenticateClient extends BaseMiddleware
{
    public function handle($request, Closure $next)
    {
        Config::set('auth.providers.clients.model', \App\Client::class);
        try {
            $user = JWTAuth::parseToken()->authenticate();
            if (!$user) throw new Exception('User Not Found');
        } catch (Exception $e) {
            if ($e instanceof \Tymon\JWTAuth\Exceptions\TokenInvalidException) {
                return response()->json([
                    'data' => null,
                    'status' => false,
                    'err_' => [
                        'message' => 'Token Invalid',
                        'code' => 1
                    ]
                ]);
            } else if ($e instanceof \Tymon\JWTAuth\Exceptions\TokenExpiredException) {
                return response()->json([
                    'data' => null,
                    'status' => false,
                    'err_' => [
                        'message' => 'Token Expired',
                        'code' => 1
                    ]
                ]);
            } else {
                if ($e->getMessage() === 'User Not Found') {
                    return response()->json([
                        "data" => null,
                        "status" => false,
                        "err_" => [
                            "message" => "User Not Found",
                            "code" => 1
                        ]
                    ]);
                }
                return response()->json([
                    'data' => null,
                    'status' => false,
                    'err_' => [
                        'message' => 'Authorization Token not found',
                        'code' => 1
                    ]
                ]);
            }
        }
        if ($request->header('User-Agent') != auth()->user()->user_agent) {
            return response()->json([

                'err_' => [
                    'message' => 'seul le navigateur qui a genere ce token peut se connecter avec !',
                ]
            ]);
        }
        return $next($request);
    }
}
