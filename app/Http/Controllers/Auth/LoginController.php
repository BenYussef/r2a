<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\AuthenticatesUsers;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use App\{Connexion, Outil};

class LoginController extends Controller
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
        $this->middleware('guest')->except('logout');
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

         // Enregistrement des connexions
        $connexion = new Connexion();
        $connexion->login =  $user->email; 
        $connexion->last_login_ip =  $user->last_login_ip; 
        $connexion->user_id =  $user->id; 
        $connexion->save();
        redirect('#!/profile');
    }

    public function logout(Request $request)
    {
        Auth::logout();
        return redirect('/login');
    }
}
