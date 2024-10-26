<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\AuthenticatesUsers;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;

use Illuminate\Support\Facades\Session;
use Validator;
use App\User;
use App\UserClient;

class LoginClientController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Login Controller
    |--------------------------------------------------------------------------
    |
    | This controller handles authenticating users for the application and
    | redirecting them to your home screen. The controller uses a trait
    | to conveniently provide its functionality to your applications.
    |
    */

    use AuthenticatesUsers;

    /**
     * Where to redirect users after login.
     *
     * @var string
     */
    protected $redirectTo = '/';

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        //$this->middleware('guest')->except('logout');
        $this->middleware('auth:client', ['except' => ['login', 'register']]);
        $this->guard = "client";
    }


    function authenticated(Request $request, $user)
    {
        $errors = "";

        if ($user->active == false) {
            $errors = "Votre compte est désactivé";
            Auth::logout();
            return Redirect::back()->withErrors(["msgError" => [$errors]]);
        }

        // Si tout est OK
        $user->last_login = Carbon::now();
        $user->last_login_ip = $request->getClientIp();
        $user->save();
        redirect('#!/profile');
    }

    public function logout(Request $request)
    {
        Auth::logout();
        return redirect('/login');
    }

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

    public function login(Request $request)
    {
        //echo $this->profile();
        //echo UserClient::getJWTIdentifier();
        //return 'ddd';
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            //return response()->json($validator->errors(), 422);
            return Redirect::back()->withErrors(["msgError" => ["Mettez un email valide et un mot de passe de 6 caractères minimum"]]);
        }
        if (!$token = Auth::guard('client')->attempt(['email' => 'ddd', 'password' => 'ddd'])) {
            //echo $token;
            $details = Auth::guard('client')->user();
            $user = $details['original'];
            //dd($details);

            return $user;
            //return response()->json(['error' => 'Unauthorized'], 401);
            return Redirect::back()->withErrors(["msgError" => ["Login ou mot de passe incorrects"]]);

        } else {
            dd("ssss");
        }
        $items = auth()->user();
        $items->user_agent = $request->header('User-Agent');
        $items->save();
        $token = $this->createNewToken($token);
        //dd(auth()->user()->name);
        //return redirect('/');
        return $token;
        //return $this->createNewToken($token);
    }

    public function profile()
    {
        return response()->json(auth()->user());
    }

    public function refresh()
    {
        return $this->createNewToken(auth()->refresh());
    }

    protected function createNewToken($token)
    {
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth($this->guard)->factory()->getTTL() * 60
        ]);
    }
}
