<?php

namespace App\Http\Controllers;


use Illuminate\Http\Request;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use App\Outil;
use App\User;
use App\Rv;
use App\Jobs\ImportUserExcelFileJob;


class UserController extends SaveModelController
{
    //extends BaseController

    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;

    protected $model     = User::class;
    protected $queryName = "users";

    public function save(Request $request)
    {
        try {
            
            return DB::transaction(function () use ($request) {
                $errors = null;
                $item = new $this->model();

                if (isset($request->id))
                {
                    if (is_numeric($request->id) == false)
                    {
                        $errors = "L'id de l'élément n'est pas correct";
                    }
                    else
                    {
                        $item = app($this->model)::find($request->id);
                        if (empty($item))
                        {
                            $errors = "L'élément que vous tentez de modifier n'existe pas";
                        }
                    }
                }


                if (empty($request->nom))
                {
                    $errors = "Veuillez renseigner le nom";
                }
                // else if (empty($request->prenom))
                // {
                //     $errors = "Veuillez renseigner le prénom";
                // }
                // else if (empty($request->numerotel))
                // {
                //     $errors = "Veuillez renseigner le numéro de téléphone";
                // } 
                
                // else if (isset($request->numerotel) && !Outil::isUnique(['numerotel'], [$request->numerotel], $request->id, User::class))
                // {
                //     $errors = "Ce numéro de téléphone existe deja !";
                // }
                else if (isset($request->nom) && !Outil::isUnique(['name'], [$request->nom], $request->id, User::class))
                {
                    $errors = "Cet nom existe deja !";
                }
                else if (isset($request->email) && !Outil::isUnique(['email'], [$request->email], $request->id, User::class))
                {
                    $errors = "Cet email existe deja !";
                }
                else
                {
                    if (empty($request->id))
                    {
                        if (empty($request->password))
                        {
                            $errors = "Veuillez definir le mot de passe";
                        }
                        else if ($request->password != $request->confirmpassword)
                        {
                            $errors = "Les 2 mots de passe ne sont pas identiques";
                        }
                    }
                    else
                    {
                        if ((empty($request->password) && isset($request->confirmpassword)) || (isset($request->password) && empty($request->confirmpassword)))
                        {
                            $errors = "Veuillez definir le mot de passe et le répéter pour le changer";
                        }
                        else if (isset($request->password) && isset($request->confirmpassword) && $request->password != $request->confirmpassword)
                        {
                            $errors = "Les 2 mots de passe ne sont pas identiques";
                        }
                    }
                }

                if (empty($errors))
                {
                    //Mot de passe
                    if (isset($request->password))
                    {
                        $item->password_seen = $request->password;
                        $item->password      = Hash::make($item->password_seen);
                    }
                    //Enregistrement
                    $item->name           = $request->nom;
                    $item->est_evaluateur = Outil::donneValeurCheckbox($request->est_evaluateur);
                   
                    // $item->prenom    = $request->prenom;
                    $item->email          = $request->email;
                    // $item->email2    = $request->email;
                    // $item->numerotel = $request->numerotel;
                    $item->save();

                    //Assignation role
                    //$role = Role::where('name', "admin")->first();
                    //$item->syncRoles($role);

                    //Matricule identifiant
                    //Outil::donneLoginUser($item);

                    return Outil::redirectgraphql($this->queryName, "id:{$item->id}", Outil::$queries[$this->queryName]);
                }

                throw new \Exception($errors);
            });
        }
        catch (\Exception $e)
        {
            return Outil::getResponseError($e);
        }
    }


    public function delete($id)
    {
        try
        {
            return DB::transaction(function () use ($id) {
                $errors = null;
                $data = 0;

                if (empty($id))
                {
                    $errors = "Données manquantes ou incorrectes";
                }
                else
                {
                    $item = User::find($id);
                    if (empty($item))
                    {
                        $data = 0;
                        $errors = "Cet élément n'existe pas";
                    }
                    else
                    {
                        $item = User::find($id);
                        if (empty($item))
                        {
                            $data = 0;
                            $errors = "Cet élément n'existe pas";
                        }
                        else
                        {
                            $item->delete();
                            $item->forceDelete();

                            $data = 1;
                        }
                    }
                }
                   
                if (isset($errors))
                {
                    throw new \Exception($errors);
                }
                else
                {
                    $retour = array(
                        'data' => $data,
                    );
                }
                return response()->json($retour);
            });
        }
        catch (\Exception $e)
        {
            return Outil::getResponseError($e);
        }
    }

    //Import users
    public function importuser(Request $request)
    {
        try
        {
            return DB::transaction(function () use ($request) {
                ini_set('max_execution_time', 10800); //6h

                $errors = null;
                $userId = Auth::user()->id;
                $item = new $this->model();

                if (empty($request->fichier))
                {
                    $errors = 'Un fichier Excel est requis';
                }
                else if($request->fichier)
                {
                    $file = $request->file('fichier');
                    $filename = $file->getClientOriginalName();
                    $extension = $file->getClientOriginalExtension(); //Get extension of uploaded file
                    $tempPath = $file->getRealPath();
                    $fileSize = $file->getSize(); //Get size of uploaded file in bytes
                    if ($extension != "csv")
                    {
                        $errors = "Le fichier choisi n'est pas un fichier CSV";
                    }
                    else
                    {
                        //Ancien import qui prenait trop de temps
                        /* $data = Excel::toArray(null, $filename);
                        $data = $data[0]; // 0 => à la feuille 1
                        */

                        //Nouveau import plus rapide
                        $location = "uploads/{$this->queryName}/{$userId}"; //Created an "uploads" folder for that
                        // Upload file
                        $file->move($location, $filename);
                        // In case the uploaded file path is to be stored in the database 
                        $filepath = public_path($location . "/" . $filename);
                        
                        $data = Outil::csvToArray($filepath);

                        if (count($data) < 2)
                        {
                            $errors = "Le fichier Excel ne doit pas être vide";
                        }
                        else
                        {
                            if (empty($errors))
                            {
                                //importation urls
                                $this->dispatch((new ImportUserExcelFileJob($userId, $filepath)));
                            }
                        }
                    }
                }

                if (!isset($errors))
                {
                    $retourId = 1;
                    return Outil::redirectgraphql($this->queryName, "id:{$retourId}", Outil::$queries[$this->queryName]);
                }

                throw new \Exception($errors);
            });
        }
        catch (\Exception $e)
        {
            //echo $e;
            //dd($e); //Pour voir l'erreur précis
            return Outil::getResponseError($e);
        }
    }
}
