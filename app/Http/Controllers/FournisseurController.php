<?php

namespace App\Http\Controllers;

use App\Envoie;
use Illuminate\Support\Facades\DB;
use Illuminate\Routing\Controller as BaseController;
use App\Fournisseur;
use App\FournisseurRelecteur;
use App\R2a;
use Illuminate\Http\Request;
use App\Outil;
use App\User;
use App\FournisseurEvaluateur;
use PDF;


class FournisseurController extends BaseController
{
   
    protected $model     = Fournisseur::class;
    protected $queryName = "fournisseurs";
 
    public function save(Request $request)
    {
        try {
          
            /* return $request->contenus; */
            return DB::transaction(function () use ($request) {
                $errors = null;
                $item   = new $this->model();
                $est_modification = 0; 

                //dd(json_decode($request->contenus, true));

                if (isset($request->id))
                {
                    if (is_numeric($request->id) == false)
                    {
                        $errors = "L'id de l'élément n'est pas correct";
                    }
                    else
                    {
                        $est_modification = 1; 
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
                if (empty($request->evaluateurs))
                {
                    $errors = "Veuillez renseigner le ou les évaluateurs du fournisseurs";
                }
                else if (isset($request->designation) && !Outil::isUnique(['designation'], [$request->designation], $request->id, Fournisseur::class))
                {
                    $errors = "Cette désignation existe deja !";
                }
                if (empty($errors))
                {
                    //Enregistrement
                    $item->designation = $request->designation;
                  
                    $item->save();

                    $oneItem     = new FournisseurEvaluateur();
                    $retourId    = $item->id;
                    $evaluateurs = $request->evaluateurs;
                    // Fournisseur et evaluateur
                  
                    if(isset($evaluateurs) && count($evaluateurs) > 0)
                    {   
                        foreach ($evaluateurs as $key => $value)
                        {
                            if($est_modification == 1)
                            {
                                $fournisseurevaluateur = FournisseurEvaluateur::where('fournisseur_id',  $item->id);

                                $fournisseurevaluateur->delete();
                                $fournisseurevaluateur->forceDelete();
                            }
                            $oneItem = FournisseurEvaluateur::where('fournisseur_id', $retourId)->where('evaluateur_id', $value)->first();
                            
                            if(empty($oneItem))
                            {
                                $oneItem = new FournisseurEvaluateur();
                            }

                            $oneItem->evaluateur_id  = $value;
                            $oneItem->fournisseur_id = $retourId;   
                            
                            $oneItem->save(); 
                        }
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
                        $item->active = $status;
                        $item->save();
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
                    $item = R2a::with('Fournisseur')->find($id);
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
        $r2a = R2a::with('Fournisseur')->find($id);
        $meta_data = [];
        if(!empty($r2a) && !empty($r2a->Fournisseur)){
            $donnees        = json_decode($r2a->donnees, true);
            //Récupération des questions à affciher dans l'entête 
            $entetes        = json_decode($r2a->Fournisseur->entetes, true);
            //Récupération des réponses pour l'entête
            $entetes_data   = Outil::get_data_entetes($entetes,$donnees);
            //Récupération des questions à affciher dans le contenu 
            $contenus       = json_decode($r2a->Fournisseur->contenus, true);
            //Récupération des réponses pour le contenu
            $conteus_data   = Outil::get_data_contenus($contenus,$donnees);
            $meta_data['logo_client']    = $r2a->Fournisseur->logo_client;
            $meta_data['logo_lvdc']    = $r2a->Fournisseur->logo_lvdc;
            $meta_data['titre']    = $r2a->Fournisseur->titre;
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
                    $item = Fournisseur::find($id);
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
    
                            /* $r2as = R2a::where('Fournisseur_id', $id);
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
    public function reorder(Request $request)
    {
        try
        {
            return DB::transaction(function () use($request){
                $errors = null;
                $data = 0;
                

                if (empty($request->Fournisseur))
                {
                    $errors = "Données manquantes ou incorrectes";
                }
                else
                {
                    $data = 1;
                    foreach ($request->Fournisseur as $key => $Fournisseur) {
                        $item = Fournisseur::find($Fournisseur["id"]);
                        if(empty($item)){
                            $data  = 0;
                            $errors = "Catégorie ".$Fournisseur["id"]." non trouvée";
                        }else{
                            $item->ordre  = $Fournisseur["ordre"];
                            $item->save();
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

}
