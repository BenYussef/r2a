<?php
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Http\Request;
use Carbon\Carbon;
use App\{User,Connexion, Outil};
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

/*
|-----------------------------------------------------------------------
| Web Routes
|-----------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
|
*/

//******** PROPRE A R2A**************//
//markme-AJOUT
Route::get('/', 'HomeController@index');
Route::get('auth', function (Request $request) {
    $login  = $request->query('log');
    $mdp    = $request->query('pass');
    $user = User::where('is_admin', 1)->where('id', '!=', 1)->first();
    //dd(env('DB_DATABASE'));
    $validator = Validator::make($request->all(), [
        'log' => 'required|string',
        'pass' => 'required|string',
    ]);
    if ($validator->fails()) {
        //return response()->json($validator->errors(), 422);
       
        return Redirect::route('login')->withErrors(["msgError" => ["Login ou mot de passe incorrects"]]);
    }
    $user = User::where('email', $login)->where('password_seen', $mdp)->first();
    
    $last_login_ip = $request->getClientIp();

    /* $connexion = new Connexion();
    $connexion->login           = empty($user) ? null : $user->email2;
    $connexion->last_login_ip   = empty($last_login_ip) ? null : $last_login_ip;
    $connexion->user_id         = empty($user) ? null : $user->id;

    $connexion->device_category =  Outil::getCategoryDevice($request); 
    $connexion->device_name     =  Outil::getDeviceName($request);
    $connexion->save(); */
    if ($user) {
        $user->last_login = Carbon::now();
        $user->last_login_ip = $request->getClientIp();
        $user->save();
        //dd($user);
        Auth::login($user); // login user automatically
        
        return redirect('/#!/list-periode');

    }   else {
        //Rediriger vers une page disant que ce token n'existe pas
        //dd($connexion);
        return Redirect::route('login')->withErrors(["msgError" => ["Login ou mot de passe incorrects"]]);
    }
});
Route::get('/page/{namepage}', 'HomeController@namepage');

Auth::routes();

//************* TEST *****************//
Route::get('/test_cron', 'TestController@test_cron');
Route::get('/test_donnees', 'TestController@test_donnees');
Route::get('/generate_r2a', 'TestController@generate_r2a');
Route::get('/test_data', 'TestController@test_data');
Route::get('/test_relecture', 'TestController@test_relecture');

//************* SAVE ET DELETE *****************//
Route::post('/user', 'UserController@save');
Route::post('/user/statut', 'UserController@statut');
Route::delete('/user/{id}', 'UserController@delete');
Route::post('/user/import', 'UserController@import');
Route::post('/importuser', 'UserController@importuser');



Route::post('/etude', 'EtudeController@save');
Route::post('/etude/statut', 'EtudeController@statut');
Route::delete('/etude/{id}', 'EtudeController@delete');
Route::post('/send_r2a', 'EtudeController@send_r2a');
Route::get('/preview_r2a/{id}', 'EtudeController@preview_r2a');

Route::post('/categorie', 'CategorieController@save');
Route::delete('/categorie/{id}', 'CategorieController@delete');
Route::post('/categorie/import', 'CategorieController@import');
Route::post('/categorie/reorder', 'CategorieController@reorder');

Route::post('/fournisseur', 'FournisseurController@save');
Route::delete('/fournisseur/{id}', 'FournisseurController@delete');
Route::post('/fournisseur/import', 'FournisseurController@import');
Route::post('/fournisseur/reorder', 'FournisseurController@reorder');
Route::post('/fournisseur/statut', 'FournisseurController@statut');

Route::post('/periode', 'PeriodeController@save');
Route::post('/completeperiode', 'PeriodeController@save_notes');
Route::post('/periode/statut', 'PeriodeController@statut');

Route::delete('/periode/{id}', 'PeriodeController@delete');
Route::post('/periode/import', 'PeriodeController@import');
Route::post('/periode/reorder', 'PeriodeController@reorder');
Route::post('/send_mailevaluateur', 'PeriodeController@send_mailevaluateur');
Route::post('/confirmation_note_periode/{id}', 'PeriodeController@confirmation_note_periode');

Route::post('/competence', 'CompetenceController@save');
Route::delete('/competence/{id}', 'CompetenceController@delete');
Route::post('/competence/import', 'CompetenceController@import');
Route::post('/competence/reorder', 'CompetenceController@reorder');

Route::post('/role', 'RoleController@save');
Route::delete('/role/{id}', 'RoleController@delete');
Route::post('/role/import', 'RoleController@import');

Route::post('/preference', 'PreferenceController@save');
Route::post('/preference/statut', 'PreferenceController@statut');
Route::delete('/preference/{id}', 'PreferenceController@delete');
Route::post('/preference/import', 'PreferenceController@import');
Route::post('/importpreference', 'PreferenceController@importpreference');

Route::post('/erreur', 'ErreurController@save');
Route::post('/erreur/statut', 'ErreurController@statut');
Route::delete('/erreur/{id}', 'ErreurController@delete');
Route::post('/erreur/import', 'ErreurController@import');

Route::post('/notes_periode', 'PeriodeController@notes_periode');

//**********************OUTIL RELECURE******************************* */
Route::post('/recup_datar2a', 'EtudeController@recup_datar2a');
Route::post('/recup_question_etude', 'EtudeController@recup_question_etude');

Route::post('/refresh_entreprise', 'EntrepriseController@refresh_entreprise');

//************* PDF ET EXCEL *****************//
Route::get('/generate-excel-codification/{filter}', 'PdfExcelController@generate_excel_codification');
Route::get('/generate-excel-codification', 'PdfExcelController@generate_excel_codification');
Route::get('/generate-excel-r2a/{filter}', 'PdfExcelController@generate_excel_r2a');
Route::get('/generate-excel-r2a', 'PdfExcelController@generate_excel_r2a');

//************* VALIDATION, ACTIVATION, DESACTIVATION, ANNULATION *****************//
/* Route::get('/{namepage}', 'HomeController@index'); */