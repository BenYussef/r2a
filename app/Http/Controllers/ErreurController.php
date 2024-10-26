<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\{Erreur, Outil};
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;

class ErreurController extends SaveModelController
{
    protected $model = Erreur::class;
    protected $queryName = "erreurs";

    
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
                    $item = app($this->model)::find($id);
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

    public function statut(Request $request)
    {
        try
        {
            return DB::transaction(function () use ($request) {
                $errors = null;
                $data = 0;

                if (empty($request->id) || (!isset($request->status)))
                {
                    $errors = "Données manquantes ou incorrectes";
                }
                else
                {
                    $id         = $request->id;
                    $status     = $request->status;
                    $item       = app($this->model)::find($id);
                    if (empty($item))
                    {
                        $data = 0;
                        $errors = "Cet élément n'existe pas";
                    }
                    else
                    {
                        if($status == 0)
                        {
                            //On veut marquer comme vu
                            $item->vu = 1;
                            $item->save();
                        }
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



}
