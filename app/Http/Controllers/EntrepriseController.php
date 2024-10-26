<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\{Entreprise, Outil, Preference};
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;

class EntrepriseController extends SaveModelController
{
    protected $model = Entreprise::class;
    protected $queryName = "entreprises";

    public function save(Request $request)
    {
        try {
            return DB::transaction(function () use ($request) {

                $errors = null;
                $item = new $this->model();

                $mail = null;
                $tel = null;

                $dateToday = date('Y-m-d');

                if (empty($request->id))
                {
                    $errors = "L'id de l'élément n'est pas défini";
                }
                else if (isset($request->id))
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

                if(empty($errors))
                {
                    //Enregistrement
                    $item->comment              = $request->comment;
                    $item->save();

                    $retourId = $item->id;
                    
                    return Outil::redirectgraphql($this->queryName, "id:{$retourId}", Outil::$queries[$this->queryName]);
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
                    $item = Entreprise::find($id);
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

    public function refresh_entreprise(Request $request)
    {
        try
        {
            $list_id = null;
            $preference = Preference::where('id', '>', 0)->first();
            if(isset($preference))
            {
                if(isset($preference->list_id))
                {
                    $list_id = $preference->list_id;
                }
            }

            //Si la liste n'est pas défini, on ne synchronise pas
            if(isset($list_id))
            {
                Outil::getEntreprises($list_id);
            }
            else
            {
                $retour = array(
                    'error' => "L'ID de liste Askia n'est pas défini",
                );
                return response()->json($retour);
            }
        }
        catch (\Exception $e)
        {
            return Outil::getResponseError($e);
        }
    }

}
