<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\{Codification, Outil, Metier, CodificationMetier, Etude};
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use App\Jobs\ImportCodificationExcelFileJob;

use App\CodificationRelecteur;
class BaseController extends SaveModelController
{
    protected $model = Codification::class;
    protected $queryName = "bases";

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
              
                if (empty($request->etude_id))
                {
                    $errors = "Veuillez renseigner le nom de l'étude";
                }
                else if (empty($request->listId_base)){
                    $errors = "Veuillez renseigner le numero de la liste";
                }
                else if (empty($request->designation_base))
                {
                    $errors = "Veuillez entrer la désignation de la base";
                } 
                else if (empty($request->type_entretien_base))
                {
                    $errors = "Veuillez renseigner le type d'entretien à codifier";
                } 
                else if (empty($request->mode_base) ){
                    $errors = "Veuillez renseigner le mode d'entretien";
                }
                else if (empty($request->tabQuestion) ){
                    $errors = "Veuillez renseigner les questions ouvertes et leurs question aides associées";
                }
             
                if (empty($errors))
                {
                    
                    $qo = array(); 
                    $qf = array(); 
                    $tabQuestion = json_decode($request->tabQuestion, true);
                    foreach ($tabQuestion as $value)
                    {
                        
                        array_push($qo, $value["question_codif"] );  
                        // Cas ou la question aide n'est pas renseigner 
                        if(isset($value["question_aide"]))
                        {
                            array_push($qf, $value["question_aide"] );
                        }
                    }

                    if(isset($qf))
                    {
                        $qf = array_unique($qf);
                    }
                    $qo = array_unique($qo); 
                        
                    $shortcut = array_merge($qo, $qf);  
                   
                    $params                     = array();
                    $params['taskid']           = Etude::where('id', $request->etude_id)->first()->id_askia;
                    $params['listeID']          = $request->listId_base;
                    $params['mode']             = $request->mode_base; 
                    $params['liste_shortcut']   = implode(",", $shortcut);
                    $params['type_entretien']   = $request->type_entretien_base;
                    
                    $data    = Outil::getDataRelecturesFromAPIPython($params);
                    $donnees = json_decode($data, true);
                   
                    //Enregistrement
                    $item->etude_id                         = $request->etude_id;
                    $item->listId_codification              = $request->listId_base;
                    $item->mode_codification                = intval($request->mode_base)  ; 
                   
                    $item->designation_codification         = $request->designation_base;
                    $item->date_envoie_codification         = null;
                    $item->date_restrict_codification       = null;
                    $item->type_entretien_codification      = $request->type_entretien_base; 
                    $item->date_facturaction_codification   = null;
                    
                    $item->donnees                          = $data;
                    $item->nbre_ligne                       = $donnees[0]['Nbre_ligne'];
                    $item->nbre_verbatim                    = $donnees[0]['Nbre_verbatim'];
                    $item->questions_aides                  = $request->tabQuestion;  
                    $item->questions_ouvertes               = implode(",", $qo);
                    $item->est_codification                 = 2;
                    
                    $item->save();
                   
                    $retourId         = $item->id;
                    $question_ouverte = $item->questions_ouvertes;
                    $questions_aides  = $item->questions_aides;     
                    $nbre_verbatims   = $item->nbre_verbatim;
                    $nbre_ligne       = $item->nbre_ligne; 
                    // Enregistrement des IDs Liste
                    $etudeRelecteurs = CodificationRelecteur::where('codification_id', $retourId);
                    //dd($etudeRelecteurs);
                    $etudeRelecteurs->delete();
                    $etudeRelecteurs->forceDelete();
                   
                    if(isset($retourId) > 0)
                    {
                        $oneItem = CodificationRelecteur::where('codification_id', $retourId)->where('relecteur_id', null)->first();

                        if(empty($oneItem))
                        {
                            $oneItem = new CodificationRelecteur();
                        }
                      
                        $oneItem->codification_id = $retourId;
                        $oneItem->relecteur_id    = null;    
                        $oneItem->nbre_ligne      = $nbre_ligne;
                        $oneItem->pourcentage     = 100;
                        $donnnes_traite           = Outil::retraiterData($donnees, $question_ouverte, $questions_aides);   
                                         
                        $oneItem->donnees         = json_encode($donnnes_traite); 
                        $oneItem->nbre_verbatim   = $nbre_verbatims;
                        
                        $oneItem->save(); 
                    }

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
                $data   = 0;

                if (empty($id))
                {
                    $errors = "Données manquantes ou incorrectes";
                }
                else
                {
                    $item = Codification::find($id);
                    if (empty($item))
                    {
                        $data = 0;
                        $errors = "Cet élément n'existe pas";
                    }
                    else
                    {
                        $codificationMetier = CodificationRelecteur::where('codification_id', $id);
                        $codificationMetier->delete();
                        $codificationMetier->forceDelete();
                        
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


}
