<?php

namespace App\RefactoringItems;

use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\{Devise, Employe, Entite, Events\SendNotifEvent, Http\Controllers\Controller, Notif, NotifPermUser, Outil, TypeContrat, TypeEmballage};
use Carbon\Carbon;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Str;



class SaveModelController extends Controller
{
    protected $queryName;
    protected $model;
    protected $job;

    //*******ENREGISTREMENT DES ELEMENTS DU BACKOFFICE ************************************* */
    public function save(Request $request)
    {
        // dd('ici');
            try
            {
                return DB::transaction(function ()use($request)
                {
                    $errors     = null;
                    $classe     = app($this->model)->getTable();
                    $attributes = app($this->model)->getFillable();
                    $item       = new $this->model();
                    
                    if (isset($request->id))
                    {
                        $item = app($this->model)::find($request->id);
                        if (!isset($item))
                        {
                            $errors = " l'item que vous tentez de modifier n'existe pas dans le système ";
                            throw new \Exception($errors);
                        }
                        else if(isset($this->reglegestions))
                        {
                            foreach($this->reglegestions as $onreglegestion)
                            {
                                foreach($onreglegestion as $key=>$onreglevalue)
                                {
                                    if (strtolower($item->$key) == strtolower($onreglevalue))
                                    {
                                        if($classe=='devises')
                                        {
                                        $errors = "Impossible de modifier une devise de base";
                                        }
                                        else
                                        {
                                        $errors = "Des règles de gestion existe sur cette donnée,<br/><strong>Vous ne pouvez pas la modifier,</strong> <br/>Au besoin, contactez le support technique pour en savoir plus";
                                        }
                                        throw new \Exception($errors);
                                    }
                                }
                            }
                        }
                    }
                    if (Outil::getAttrtibutes($attributes,'nom'))
                    {
                        if (!isset($request->nom))
                        {
                            $errors = "Veuillez definir le  nom";
                        }
                        else
                        {
                            !Outil::isUnique(['nom'], [strtolower($request->nom)], $request->id, $this->model)?
                            $errors = "Ce  nom existe déja": $item->nom = $request->nom;
                        }
                    }
                    if (Outil::getAttrtibutes($attributes,'designation'))
                    {
                        if (!isset($request->designation))
                        {
                            $errors = "Veuillez definir la designation";
                        }
                        else
                        {
                            !Outil::isUnique(['designation'], [strtolower($request->designation)], $request->id, $this->model)?
                            $errors = "Cette designation existe déja": $item->designation = $request->designation;
                        }
                    }
                    if(Outil::getAttrtibutes($attributes,'valeur_conversion') )
                    {
                        if(isset($request->valeur_conversion ) && $request->valeur_conversion  < 0 || !isset($request->valeur_conversion ) )
                        {
                            $errors = "la valeur de conversion doit être supérieur à 0 ";
                        }
                        else
                        {
                            $item->valeur_conversion = $request->valeur_conversion;
                        }
                    }
                    if(Outil::getAttrtibutes($attributes,'signe') )
                    {
                        if(!isset($request->signe ) )
                        {
                            $errors = "Veuillez definir le signe ";
                        }
                        else
                        {
                            $item->signe = $request->signe;
                        }
                    }
                    if(Outil::getAttrtibutes($attributes,'par_defaut') )
                    {
                        $pardefaut =Outil::donneValeurCheckbox($request->par_defaut);
                        if($pardefaut == 1)
                        {
                            !Outil::isUnique(['par_defaut'], [strtolower(Outil::donneValeurCheckbox($request->par_defaut))], $request->id, $this->model)?
                            $errors = "Une devise par defaut est déja definie ": $item->par_defaut = Outil::donneValeurCheckbox($request->par_defaut);
                        }
                        else
                        {
                            $item->par_defaut = Outil::donneValeurCheckbox($request->par_defaut);
                        }
                    }
                    if (Outil::getAttrtibutes($attributes,'date'))
                    {
                        $date = isset($request->date) ? $request->date : date('Y-m-d');
                        $date = (strpos($date, '/') !== false) ? Carbon::createFromFormat('d/m/Y', $date)->format('Y-m-d') : $date;
                        
                        $item->date                   = Outil::donneValeurDate($date);
                    }

                    if (Outil::getAttrtibutes($attributes,'est_collectif'))
                    {
                    $item->est_collectif = Outil::donneValeurCheckbox($request->est_collectif);

                    }

                    if (Outil::getAttrtibutes($attributes,'date_debut'))
                    {
                        if (!isset($request->date_debut))
                        {
                            $errors = "Veuillez definir la date de debut";
                        }
                        else
                        {
                            $item->date_debut = Outil::donneValeurDate($request->date_debut);
                        }
                    }
                    if (Outil::getAttrtibutes($attributes,'date_fin'))
                    {
                        if (!isset($request->date_fin))
                        {
                            $errors = "Veuillez definir la date de fin";
                        }
                        else
                        {
                            $item->date_fin = Outil::donneValeurDate($request->date_fin);
                        }
                    }
                    if(isset($request->date_debut) && isset($request->date_fin) && $request->date_debut > $request->date_fin)
                    {
                        //$errors="La date de fin ne peut pas etre supperieur a la date de debut ";
                    }
                    if (Outil::getAttrtibutes($attributes,'entite_id'))
                    {
                        if (!isset($request->entite_id))
                        {
                            $errors = "Veuillez definir l'entite";
                        }
                        else
                        {
                            $entite         = Entite::find($request->entite_id);
                            if (!isset($entite))
                            {
                                //dd(PointDeVente::all());
                                $errors = "Cette entite n'existe pas dans le système";
                            }
                            else
                            {
                                $item->entite_id = $entite->id;
                            }
                        }
                    }
                    if (Outil::getAttrtibutes($attributes,'type_emballage_id'))
                    {
                        if (!isset($request->type_emballage_id))
                        {
                            $errors = "Veuillez definir le type d'emballage";
                        }
                        else
                        {
                            $typeemballage         = TypeEmballage::find($request->type_emballage_id);
                            if (!isset($typeemballage))
                            {
                                //dd(PointDeVente::all());
                                $errors = "Ce type d'emballage n'existe pas dans le système";
                            }
                            else
                            {
                                $item->type_emballage_id = $typeemballage->id;
                            }
                        }
                    }
                    if (Outil::getAttrtibutes($attributes,'type_contrat_id'))
                    {
                        if (!isset($request->type_contrat_id))
                        {
                            $errors = "Veuillez definir le type de contrat";
                        }
                        else
                        {
                            $typecontrat         = TypeContrat::find($request->type_contrat_id);
                            if (!isset($typecontrat))
                            {
                                $errors = "Ce Type de contrat n'existe pas dans le système";
                            }
                            else
                            {
                                $item->type_contrat_id = $typecontrat->id;
                            }
                        }
                    }
                    if (Outil::getAttrtibutes($attributes,'employe_id'))
                    {
                        if (!isset($request->employe_id))
                        {
                            $errors = "Veuillez definir l'employé";
                        }
                        else
                        {
                            $employe         = Employe::find($request->employe_id);
                            if (!isset($employe))
                            {
                                $errors = "Cet employé n'existe pas dans le système";
                            }
                            else
                            {
                                $item->employe_id = $employe->id;
                            }
                        }
                    }

                    if (Outil::getAttrtibutes($attributes,'montant'))
                    {
                        if ($request->montant  < 1 ||!is_numeric($request->montant) || !isset($request->montant ))
                        {
                            $errors = "Le montant  doit être supérieur à 0 ";
                        }
                        else
                        {
                            $item->montant = $request->montant;
                        }
                    }
                    if (Outil::getAttrtibutes($attributes,'prix'))
                    {
                        if ($request->prix  < 1 ||!is_numeric($request->prix) || !isset($request->prix ))
                        {
                            $errors = "Le prix  doit être supérieur à 0 ";
                        }
                        else
                        {
                            $item->prix = $request->prix;
                        }
                    }
                
                    if (!isset($errors))
                    {
                        //$item->created_at_user_id                 = $item->id ? $item->created_at_user_id : Auth::user()->id;
                        Outil::getAttrtibutes($attributes,'description') ? $item->description = $request->description :null;
                        $item->save(); 
                        Outil::getAttrtibutes($attributes,'est_debit') ?
                        $item->est_debit            = !(array_key_exists('est_debit', $request->all())) ? 0 : 1 :null;
                        if (!empty($request->file('fichier')))
                        {
                            Outil::uploadFileToModel($request, $item, 'fichier');
                        }
                        return Outil::redirectIfModeliSSaved($item, $this->queryName);

                    }

                    throw new \Exception($errors);
                });
            }
            catch (\Exception $e)
            {
                return Outil::getResponseError($e);
            }
    }



/******END SAVE METHODE********************** */

public function statut(Request $request)
{
    $errors = null;
    $data = 0;

    try
    {
        $item = app($this->model)::find($request->id);
        if ($item != null)
        {
            $item->status = $request->status;
        }
        else
        {
            $errors = "Cette donnée n'existe pas";
        }

        if (!isset($errors) && $item->save())
        {
            $data = 1;
        }
    }
    catch (\Exception $e)
    {
        $errors = "Vérifier les données fournies";
    }
    return response('{"data":' . $data . ', "errors": "'. $errors .'" }')->header('Content-Type','application/json');
}

public function delete($id)
{
    try
    {
        return DB::transaction(function () use ($id)
        {
            $errors = null;
            $data = null;
            if ((int) $id)
            {
                if (isset($this->relationships))
                {
                    $item = app($this->model)::with($this->relationships)->find($id);
                }
                else
                {
                    $item = app($this->model)::find($id);
                }

                if (isset($item))
                {
                    if (isset($this->relationships))
                    {
                        foreach($this->relationships as $onrelation)
                        {
                            if ((Str::of($onrelation)->endsWith('s') && count($item->$onrelation) > 0) || (!Str::of($onrelation)->endsWith('s') && isset($item->$onrelation)))
                            {
                                $errors = "Impossible de supprimer une donnée qui a des liaisons du système";
                                throw new \Exception($errors);
                            }
                        }
                    }
                    try
                    {
                        if (isset($this->reglegestions))
                        {
                            foreach($this->reglegestions as $onreglegestion)
                            {
                                foreach($onreglegestion as $key=>$onreglevalue)
                                {
                                    if (strtolower($item->$key) == strtolower($onreglevalue))
                                    {
                                        $errors = "Des règles de gestion existe sur cette donnée,<br/><strong>Vous ne pouvez pas la supprimer,</strong> <br/>Au besoin, contactez le support technique pour en savoir plus";
                                        throw new \Exception($errors);
                                    }
                                }
                            }
                        }
                        $item->delete();
                        $item->forceDelete();
                        $data = 1;
                        // Pour send la notif
                        $queryName = Outil::getQueryNameOfModel($item->getTable());
                        Outil::publishEvent(['type' => substr($queryName, 0, (strlen($queryName) - 1)), 'delete' => true]);
                    }
                    catch (QueryException $e)
                    {
                        if (intval($e->errorInfo[1]) == 7)
                        {
                            $errors = $e->getMessage() . "Impossible de supprimer cette donnée, verifier les liaisons";
                        }
                        else
                        {
                            $errors = "Impossible de supprimer cette donnée, verifier les liaisons" ;
                        }
                        throw new \Exception($errors);
                    }
                }
                else
                {
                    $errors = "Item introuvable";
                }
            }
            else
            {
                $errors = "Données manquantes";
            }
            if ($errors)
            {
                throw new \Exception($errors);
            }
            else
            {
                $retour = array(
                    'data'          => $data,
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

public function sendNotifImport($userId, $filename)
{
    $extension = pathinfo($filename->getClientOriginalName(), PATHINFO_EXTENSION);

    $queryName = Outil::getQueryNameOfModel(app($this->model)->getTable());
    $generateLink = substr($queryName, 0, (strlen($queryName) - 1));
    // ENVOIE DE LA NOTIFICATION DE DEBUT
    $notif = new Notif();
    $notif->message = "<strong>L'import du fichier excel est en cours</strong>,<br>Vous serez notifié une fois le traitement terminé";
    $notif->link = "#!/list-{$generateLink}";
    $notif->save();

    $notifPermUser  = new NotifPermUser();
    $notifPermUser->notif_id = $notif->id;
    $notifPermUser->permission_id = Permission::where('name', "creation-{$generateLink}")->first()->id;
    $notifPermUser->user_id = $userId;
    $notifPermUser->save();

    $eventNotif = new SendNotifEvent($notifPermUser);
    event($eventNotif);

    $from = public_path('uploads')."/{$queryName}/{$userId}/";
    $to = "upload.{$extension}";
    $file = $filename->move($from, $to);

    $this->dispatch((new $this->job($this->model, $generateLink, $file, $userId, $from.$to)));
}

public function import(Request $request)
{
    try
    {
        $errors = null;
        $data = 0;
        if (!isset($this->job))
        {
            $errors = "L'import sur ce type de donnée n'a pas été configuré dans le système";
        }
        else
        {
            if (empty($request->file('file')))
            {
                $errors ='Un fichier Excel est requis';
            }
            if($request->hasFile('file'))
            {
                $filename = request()->file('file');
                $extension = pathinfo($filename->getClientOriginalName(), PATHINFO_EXTENSION);
                if ($extension == "xlsx" || $extension == "xls" || $extension == "csv")
                {
                    $data = Excel::toArray(null, $filename);
                    $data = $data[0]; // 0 => à la feuille 1

                    if (count($data) < 2)
                    {
                        $errors = "Le fichier ne doit pas être vide";
                    }
                    else
                    {
                        $userId = Auth::user()->id;
                        if (file_exists(public_path('uploads')."/" . Outil::getQueryNameOfModel(app($this->model)->getTable()) . "/{$userId}/upload.{$extension}"))
                        {
                            $errors = "Un fichier est déjà en cours d'upload, merci de patienter, la fin de celui-ci";
                        }
                        else
                        {
                            $this->sendNotifImport($userId, $filename);
                        }
                    }
                }
            }
        }

        if (isset($errors))
        {
            throw new \Exception($errors);
        }
        $data = 1;

        return response()->json(
            array(
                "data" => $data,
                "message" => "Le fichier est en cours de traitement..."
            )
        );
    }
    catch (\Exception $e)
    {
        return Outil::getResponseError($e);
    }
}


}

