<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\{Preference, Outil};
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;

class PreferenceController extends SaveModelController
{
    protected $model = Preference::class;
    protected $queryName = "preferences";

    public function save(Request $request)
    {
        try
        {
            return DB::transaction(function () use ($request) {

                $errors = null;
                $dateToday = date('Y-m-d');
                $heureToday = date('H:i');

                $item = new $this->model();

                if (empty($request->id))
                {
                    $errors = "L'id de l'élément n'est pas défini";
                }
                else if (is_numeric($request->id) == false)
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

                if(empty($errors))
                {
                    if (empty($request->delais_notification))
                    {
                        $errors = "Veuillez définir le délai";
                    }
                }

                //Enregistrement
                if(empty($errors))
                {
                    $item->delais_notification      = $request->delais_notification;
                    $item->emails_a_notifier        = $request->emails_a_notifier;
                    $item->nbre_entreprise_par_jour = $request->nombre_entreprise; 
                    $item->couleur_relec            = $request->couleur_relec;
                    $item->couleur_codif            = $request->couleur_codif;

                    $item->save();
                    $retourId = $item->id;

                    return Outil::redirectgraphql($this->queryName, "id:{$retourId}", Outil::$queries[$this->queryName]);
                }

                throw new \Exception($errors);
            });
        }
        catch (\Exception $e)
        {
            $errorArray = array("type" => "save_preference", "designation" => "PreferenceController->save->Erreur lors de l'enregistrement", "erreur" => $e."\n".json_encode($request->all()));
            Outil::saveError($errorArray);
			return Outil::getResponseError($e);
        }
	}



}
