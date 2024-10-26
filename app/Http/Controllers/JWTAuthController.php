<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use App\Http\Controllers\Controller;
use Validator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use Config;
use Closure;
use JWTAuth;
use Exception;

use App\User;
use App\Client;
use App\ClientJwt;


class JWTAuthController extends Controller
{
    /**
     * Create a new AuthController instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth:api', ['except' => ['login', 'register']]);
    }

    /**
     * Register a User.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|between:2,100',
            'email' => 'required|email|unique:users|max:50',
            'password' => 'required|confirmed|string|min:6',
        ]);

        $user = User::create(array_merge(
            $validator->validated(),
            ['password' => bcrypt($request->password),
                'user_agent' => null]
        ));

        return response()->json([
            'message' => 'Successfully registered',
            'user' => $user
        ], 201);
    }

    /**
     * Get a JWT via given credentials.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function loginOld(Request $request)
    {
        Config::set('auth.providers.users.model', \App\ClientJwt::class);

        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }
        if (!$token = auth('api')->attempt($validator->validated())) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        //$item = auth()->user();
        $item = Client::where('email', $request->email)->first();
        $retour_token = $this->createNewToken($token);
        if ($item) {
            $item->token = $token;
            $item->user_agent = $request->header('User-Agent');
            $item->save();
        }

        return $retour_token;
    }

    public function login(Request $request)
	{
        Config::set('auth.providers.users.model', \App\ClientJwt::class);

		try
        {
            return DB::transaction(function () use ($request)
            {
				$item = new Client();
                $errors = null;
                $token = null;

				if(empty($request->email))
				{
					$errors = "Veuillez saisir votre email";
				}
				else if(empty($request->password))
				{
					$errors = "Veuillez saisir votre mot de passe";
				}
				else
				{
                    $item = Client::where('email', $request->email)->first();
                    if(empty($item))
                    {
                        $errors = "Ce mail n'est pas lié à un utilisateur";
                        return $retour = array(
                            "dataone" => null,
                            "error" => $errors,
                        );  
                    }

                    //Affectations
                    $email = $request->email;
                    $password = $request->password;
                    $credentials = ['email' => $email, 'password' => $password];

                    //Test mail et password bons
                    $validator = Validator::make($request->all(), [
                        'email' => 'required|email',
                        'password' => 'required|string|min:6',
                    ]);
                     if ($validator->fails())
                     {
                        //return response()->json($validator->errors(), 422);
                        $errors = "Mettez un email valide et un mot de passe de 6 caractères minimum";
                        return $retour = array(
                            "dataone" => null,
                            "error" => $errors,
                        );
                    }

                    
                    if (!$token = auth('api')->attempt($credentials)) {
                        //return response()->json(['error' => 'Unauthorized'], 401);
                        $errors = "Login ou mot de passe incorrects";
                        return $retour = array(
                            "dataone" => null,
                            "error" => $errors,
                        );
                    }
                    //$item = auth()->user();
                    $item = Client::with('adresses')->where('email', $email)->first();

                    if($item->est_activer == 0)
                    {
                        $errors = "Votre compte n'est pas actif";
                    }
				}

				if (!isset($errors))
				{
                    //SANS erreurs
                    $retour_token = $this->createNewToken($token);
                    if($item)
                    {
                        $item->token = $token;
                        $item->user_agent = $request->header('User-Agent');
                        $item->save();
                    }
                    
                    $itemCustom = array(
						"id" => $item->id,
						"civilite" => $item->civilite,
						"raison_sociale" => $item->raison_sociale,
						"date_naissance" => $item->date_naissance,
						"email" => $item->email,
						"telephone" => $item->telephone,
						"adresses" => $item->adresses,
						"remise" => $item->remise,
                        "token" => $item->token,
					);
					$retour = array(
						"dataone" => $itemCustom,
						"success" => "Connexion réussie",
					);
					return $retour;
				}
				else
				{
					//AVEC erreurs
					$retour = array(
						"dataone" => null,
						"error" => $errors,
					);
					return $retour;
				}
			});
		}
		catch (\Exception $e)
		{ echo $e;
			return response()->json(array(
				'errors'          => config('app.debug') ? $e->getMessage() : Outil::getMsgError(),
				'errors_debug'    => [$e->getMessage()],
			));
		}
	}

    /**
     * Get the authenticated User.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function profile()
    {
        return response()->json(auth('api')->user());
    }

    /**
     * Log the user out (Invalidate the token).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout()
    {
        auth()->logout();

        return response()->json(['message' => 'Successfully logged out']);
    }

    /**
     * Refresh a token.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function refresh()
    {
        return $this->createNewToken(auth()->refresh());
    }


    /**
     * Get the token array structure.
     *
     * @param string $token
     *
     * @return \Illuminate\Http\JsonResponse
     */
    protected function createNewToken($token)
    {
        Config::set('auth.providers.users.model', \App\ClientJwt::class);

        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            //'expires_in' => auth()->factory()->getTTL() * 60
        ]);
    }
}
