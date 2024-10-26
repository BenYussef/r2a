<?php

namespace App\Http\Controllers;

use App\Envoie;
use Illuminate\Support\Facades\DB;
use Illuminate\Routing\Controller as BaseController;
use App\Etude;
use App\EtudeRelecteur;
use App\R2a;
use Illuminate\Http\Request;
use App\Outil;
use App\User;
use PDF;


class EtudeController extends BaseController
{
   
    protected $model     = Etude::class;
    protected $queryName = "etudes";
    public function recup_datar2a(Request $request)
    {
        try
        {
            $params = array();
            $params['token'] = "dd524d28ea142c631bfe35bae6275af07bf2a884808fe5915a3abd35171f1503";
            $url = "http://localhost:5005/api/v1/relecture/";
            if(isset($request->taskid))
            {
                $params['taskid']  = $request->taskid;
            }
            if(isset($request->liste_shortcut))
            {
                $params['liste_shortcut'] = implode(",",$request->liste_shortcut);
            }
            if(isset($request->listeID))
            {
                $params['listeID'] = $request->listeID;
            }
            if(isset($request->type_entretien))
            {
                $params[$request->type_entretien] = $request->type_entretien;
            }
            if(isset($request->type_question))
            {
                $params['type_question']  = $request->type_question;
                if($request->type_question == ""){
                    $url = "http://localhost:5005/api/v1/r2aAlerte/";
                }

            }  
           
            // if(isset($request->date_filtre_liste)){
            //     $params['debut'] = $request->date_filtre_liste." 00:00:00";
            //     $params['fin']   = $request->date_filtre_liste." 23:59:59";
            // }else{
            //     $params['debut'] = date('Y-m-d')." 00:00:00";
            //     $params['fin'] = date('Y-m-d')." 23:59:59";
            // }
           
            $data = Outil::getDataR2asFromAPIPython($params,$url);
            $data = response()->json($data);

            return $data;

        }
        catch (\Exception $e)
        {
            return Outil::getResponseError($e);
        }
    }

    public function save(Request $request)
    {
        try {
          
            /* return $request->contenus; */
            return DB::transaction(function () use ($request) {
                $errors = null;
                $item = new $this->model();
                //dd(json_decode($request->contenus, true));
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
              
                if (empty($request->designation))
                {
                    $errors = "Veuillez renseigner le nom de l'étude";
                }
                else if (empty($request->task_id))
                {
                    $errors = "Veuillez renseigner l'id Askia";
                } 
                else if (empty($request->list_id))
                {
                    $errors = "Veuillez renseigner l'id de la liste";
                } 
                else if (empty($request->operateur_conditions)){
                    $errors = "Veuillez renseigner l'opérateur condition";
                }
                else if (empty($request->logo_client)){
                    $errors = "Veuillez renseigner le lien du logo du client";
                }
                else if (empty($request->logo_lvdc)){
                    $errors = "Veuillez renseigner le lien du logo LVDC";
                }else if (empty($request->conditions)){
                    $errors = "Veuillez renseigner une condition au moins";
                }else if (empty($request->contenus)){
                    $errors = "Le contenu ne peut pas être vide.";
                }
                
                $logo_client  = $request->logo_client;
                if(str_contains($logo_client, 'https://cutt.ly')){
                    if(isset(get_headers($logo_client,1)["location"])){
                        $logo_client = get_headers($logo_client,1)["location"];
                    }
                }
                $logo_lvdc  = $request->logo_lvdc;
                if(str_contains($logo_lvdc, 'https://cutt.ly')){
                    if(isset(get_headers($logo_lvdc,1)["location"])){
                        $logo_lvdc = get_headers($logo_lvdc,1)["location"];
                    }
                }
                if (empty($errors))
                {
                    //Enregistrement
                    $item->designation              = $request->designation;
                    $item->titre                    = $request->titre_etude;
                    $item->task_id                  = $request->task_id;
                    $item->list_id                  = $request->list_id;
                    $item->conditions               = $request->conditions;
                    $item->operateur_conditions     = $request->operateur_conditions;
                    $item->question_nps             = $request->question_nps;
                    $item->entetes                  = $request->entetes;
                    $item->contenus                 = $request->contenus;
                    $item->destinataires            = $request->destinataires;
                    $item->logo_client              = $logo_client;
                    $item->logo_lvdc                = $logo_lvdc;
                    $item->cc                       = $request->cc;
                    $item->contenu                  = $request->contenu;
                    $item->user_id                  = Outil::donneUserId();
                    $item->save();

                    $retourId   = $item->id;
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

    public function send_r2a(Request $request){
        try
        {
            return DB::transaction(function () use ($request) {
                $errors = null;
                $data = 0;
                $id  = $request->args;
        
                
                if (empty($id))
                {
                    $errors = "Données manquantes ou incorrectes";
                }
                else
                {
                    $item = R2a::with('etude')->find($id);
                    if (empty($item))
                    {
                        $data = 0;
                        $errors = "Cet élément n'existe pas";
                    }
                    else
                    {
                        $retour  = Outil::sendMailR2a($item);
                        if($retour == 1 || $retour == true){
                            $item->etat     = 2;
                            $item->send_by  = Outil::donneUserId();
                            $item->save();
                            $envoie  = new Envoie();
                            $envoie->user_id = Outil::donneUserId();
                            $envoie->r2a_id = $item->id;
                            $envoie->save();
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
    public function preview_r2a($id){
        $start = date('h:i:s');
        $r2a = R2a::with('etude')->find($id);
        $meta_data = [];
        if(!empty($r2a) && !empty($r2a->etude)){
            $donnees        = json_decode($r2a->donnees, true);
            //Récupération des questions à affciher dans l'entête 
            $entetes        = json_decode($r2a->etude->entetes, true);
            //Récupération des réponses pour l'entête
            $entetes_data   = Outil::get_data_entetes($entetes,$donnees);
            //Récupération des questions à affciher dans le contenu 
            $contenus       = json_decode($r2a->etude->contenus, true);
            //Récupération des réponses pour le contenu
            $conteus_data   = Outil::get_data_contenus($contenus,$donnees);
            $meta_data['logo_client']    = $r2a->etude->logo_client;
            $meta_data['logo_lvdc']    = $r2a->etude->logo_lvdc;
            $meta_data['titre']    = $r2a->etude->titre;
            $fileName = $r2a->id_lvdc.'_'.date('Ymd-His').'.pdf';
            $end = date('h:i:s');
            
            $fileName = $r2a->id_lvdc.'_'.date('Ymd-His').'.pdf';
            $pdf = PDF::loadView('pdfs.r2a', compact('entetes_data','conteus_data','meta_data'));
            return $pdf->stream(); 
        }
        return 'Chargement';
        
        
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
                    $item = Etude::find($id);
                    if (empty($item))
                    {
                        $data = 0;
                        $errors = "Cet élément n'existe pas";
                    }
                    else
                    {
                        // if(auth()->user()->niveau <= 1)
                        // {
                        //     $errors = "La suppression d'une étude n'est possible qu'avec un compte admin de niveau 2";
                        // }
                        // else
                        // {
    
                            /* $r2as = R2a::where('etude_id', $id);
                            $r2as->delete(); */
                            
                            $item->delete();
                            $data = 1;
                        // }
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
