<?php

namespace App\Http\Controllers;

use App\Envoie;
use Illuminate\Support\Facades\DB;
use Illuminate\Routing\Controller as BaseController;
use App\Competence;
use App\CompetenceRelecteur;
use App\R2a;
use Illuminate\Http\Request;
use App\Outil;
use App\User;
use PDF;


class CompetenceController extends BaseController
{
   
    protected $model     = Competence::class;
    protected $queryName = "competences";
 
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
                // elseif (empty($request->categorie_id))
                // {
                //     $errors = "Veuillez sélectionner la catégorie";
                // }
                else if (isset($request->competence) && !Outil::isUnique(['competence'], [$request->competence], $request->id, Competence::class))
                {
                    $errors = "Cette désignation existe deja !";
                }
                if (empty($errors))
                {
                    //Enregistrement
                    $item->designation              = $request->designation;
                    $item->categorie_id             = $request->categorie_id ?? 0;
                    if(empty($request->id)){
                        $ordre          = Competence::where('categorie_id',$request->categorie_id)->count() + 1;
                        $item->ordre    = $ordre;
                    }
                    
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
                    $item = R2a::with('competence')->find($id);
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
        $r2a = R2a::with('competence')->find($id);
        $meta_data = [];
        if(!empty($r2a) && !empty($r2a->competence)){
            $donnees        = json_decode($r2a->donnees, true);
            //Récupération des questions à affciher dans l'entête 
            $entetes        = json_decode($r2a->competence->entetes, true);
            //Récupération des réponses pour l'entête
            $entetes_data   = Outil::get_data_entetes($entetes,$donnees);
            //Récupération des questions à affciher dans le contenu 
            $contenus       = json_decode($r2a->competence->contenus, true);
            //Récupération des réponses pour le contenu
            $conteus_data   = Outil::get_data_contenus($contenus,$donnees);
            $meta_data['logo_client']    = $r2a->competence->logo_client;
            $meta_data['logo_lvdc']    = $r2a->competence->logo_lvdc;
            $meta_data['titre']    = $r2a->competence->titre;
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
                    $item = Competence::find($id);
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
    
                            /* $r2as = R2a::where('competence_id', $id);
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

                if (empty($request->competence))
                {
                    $errors = "Données manquantes ou incorrectes";
                }
                else
                {
                    $data = 1;
                    foreach ($request->competence as $key => $competence) {
                        $item = Competence::find($competence["id"]);
                        if(empty($item)){
                            $data  = 0;
                            $errors = "Catégorie ".$competence["id"]." non trouvée";
                        }else{
                            $item->ordre  = $competence["ordre"];
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
