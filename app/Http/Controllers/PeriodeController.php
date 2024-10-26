<?php

namespace App\Http\Controllers;

use App\Categorie;
use App\Competence;
use App\Envoie;
use Illuminate\Support\Facades\DB;
use Illuminate\Routing\Controller as BaseController;
use App\Periode;
use App\PeriodeRelecteur;
use App\R2a;
use App\EvaluationFournisseur;
use App\Note;
use App\Fournisseur;
use Illuminate\Http\Request;
use App\Outil;
use App\User;
use PDF;


class PeriodeController extends BaseController
{
   
    protected $model     = Periode::class;
    protected $queryName = "periodes";
 
    public function save(Request $request)
    {
        try {
          
            /* return $request->contenus; */
            return DB::transaction(function () use ($request) {
                $errors = null;
                $est_modification = 0; 
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
                        $est_modification = 1; 
                        $item = app($this->model)::find($request->id);
                        if (empty($item))
                        {
                            $errors = "L'élément que vous tentez de modifier n'existe pas";
                        }
                    }
                }
                $dateToday = date('Y-m-d');
                if (empty($request->designation))
                {
                    $errors = "Veuillez renseigner le nom de l'étude";
                }              
                // elseif (empty($request->fournisseur))
                // {
                //     $errors = "Veuillez sélectionner le fournisseur à évaluer";
                // }
                elseif (empty($request->date_notification))
                {
                    $errors = "Veuillez renseiger la date de notification";
                }
                elseif($request->date_notification < $dateToday)
                {
                    $errors = "La date de notification doit être supérieure ou égale à la date d'aujourd'hui !";
                }
              
                if (empty($errors))
                {
                    // Enregistrement
                    $item->designation        = $request->designation;
                    $item->fournisseur_id     = $request->fournisseur ?? null;
                    $item->type               = $request->type        ?? null; 
                    $item->date_notification  = $request->date_notification;
                    $item->total_competences  = Competence::count();

                    $item->save();

                    $retourId = $item->id;
                    // $oneItem  = new EvaluationFournisseur();
                    
                    // // Fournisseur et periode
                    // $fournisseurs_ids = Fournisseur::where('active', 1)->pluck('id')->toArray();
                    
                    // if(isset($fournisseurs_ids) && count($fournisseurs_ids) > 0)
                    // {  
                    //     foreach ($fournisseurs_ids as $key => $value)
                    //     {
                    //         if($est_modification == 1)
                    //         {
                    //             $evaluationfournisseurs = EvaluationFournisseur::where('periode_id', $retourId);
                    //             $evaluationfournisseurs->delete();
                    //             $evaluationfournisseurs->forceDelete();
                    //         }

                    //         $oneItem = EvaluationFournisseur::where('periode_id',   $retourId)
                    //                                         ->where('fournisseur_id', $value)
                    //                                         ->first();
                    //         if(empty($oneItem))
                    //         {
                    //             $oneItem = new EvaluationFournisseur();
                    //         }

                    //         $oneItem->periode_id     = $retourId;
                    //         $oneItem->fournisseur_id = $value;   
                            
                    //         $oneItem->save(); 
                    //     }
                    // }

                    $retourId = $item->id;
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

    public function save_notes(Request $request)
    {
        try {
          
            /* return $request->contenus; */
            return DB::transaction(function () use ($request) {
                $errors = null;
                $item = new $this->model();
                
                
                if (empty($request->periode_id))
                {
                    $errors = "Une erreur est survenue";
                }
               
                if (empty($errors))
                {
                    //Enregistrement
                    $competences  = json_decode($request->notes_periode, true);

                    foreach ($competences as $competence) 
                    {      
                        if(($competence['note'] <0 || $competence['note']>10) && !empty($competence['note']))
                        {
                            $errors = "Veuillez entrer une note entre 0 et 10 pour ".$competence['designation'];
                            throw new \Exception($errors);
                        }
                        else
                        {
                            $note = Note::where('periode_id',$request->periode_id)
                                    ->where('competence_id',$competence['id'])
                                    ->where('fournisseur_id',$competence['fournisseur_id'])
                                    ->where('user_id',Outil::donneUserId())->first();
                            
                            if(empty($note)){
                                $note = new Note();  
                            }
                            
                            $note->periode_id       = $request->periode_id;
                            $note->competence_id    = $competence['id'];
                            $note->note             = $competence['note'];
                            $note->commentaire      = $competence['commentaire'];
                            $note->fournisseur_id   = $competence['fournisseur_id'];
                            $note->user_id          = Outil::donneUserId();
                            $note->save();
                        }
                    }
                    
                    $retourId   = $note->id;
                    return Outil::redirectgraphql($this->queryName,  "id:{$request->periode_id}",  Outil::$queries[$this->queryName]);
                }

                throw new \Exception($errors);
            });
        }
        catch (\Exception $e)
        {
            return Outil::getResponseError($e);
        }
    }

    public function notes_periode(Request $request)
    {
        $notes = [];
       
        $periode_id  = $request->periode_id;
        $user_id     = Outil::donneUserId();
       
        if(isset($request->args) && ($request->args == "detail"))
        {
            // Preload the users related to the notes
            $competences = Competence::leftJoin('notes as n', function ($join) use ($periode_id) {
                $join->on('competences.id', '=', 'n.competence_id')
                     ->where('n.periode_id', '=', $periode_id);
            })
            ->select('competences.*', 'n.*') // Sélectionner toutes les colonnes des compétences et des notes
            ->get();
        }
        else 
        {
            // $competences = Competence::with(['notes' => function ($query) use ($periode_id, $user_id){
            //     $query->where('user_id', $user_id)
            //     ->where('periode_id', $periode_id);
            // }])->get();
            $competences = Competence::leftJoin('notes as n', function ($join) use ($periode_id,$user_id) {
                $join->on('competences.id', '=', 'n.competence_id')
                     ->where('n.periode_id', '=', $periode_id)
                     ->where('user_id', $user_id);
            })
            ->select('competences.*', 'n.*') // Sélectionner toutes les colonnes des compétences et des notes
            ->get();
        }
        
        foreach ($competences as $key => $competence) 
        {
            $notes[$key]['designation']  = $competence->designation;
            $notes[$key]['id']           = $competence->id;
            $notes[$key]['designation']  = $competence->designation;
            $notes[$key]['evaluateur']   = null; 
            $notes[$key]['note']         = null;
            $notes[$key]['commentaire']  = null;
            $notes[$key]['fournisseur_id'] = null;
            $notes[$key]['user_id']      = $user_id ; 

            // if(isset($request->args) && ($request->args == "detail"))
            // {
            //     $notes[$key]['note']        = $competence->note;
            //     $notes[$key]['commentaire'] = $competence->commentaire;
            //     $notes[$key]['user_id']     = $competence->user_id;
            //     $notes[$key]['evaluateur']  = User::where('id', $competence->user_id)->pluck('name')->first();
            // }
                        // {
            $notes[$key]['note']        = $competence->note;
            $notes[$key]['commentaire'] = $competence->commentaire;
            $notes[$key]['user_id']     = $competence->user_id;
            $notes[$key]['evaluateur']  = User::where('id', $competence->user_id)->pluck('name')->first();
          
            // if(isset($competence->notes))
            // {
            //     $notes[$key]['note']        = $competence->notes[0]->note;
            //     $notes[$key]['fournisseur_id'] = $competence->notes[0]->fournisseur_id;
            //     $notes[$key]['commentaire'] = $competence->notes[0]->commentaire;
            //     $notes[$key]['user_id']     = $competence->notes[0]->user_id;
            //     $notes[$key]['evaluateur']  = User::where('id', $competence->notes[0]->user_id)->pluck('name')->first();
            // }
        }  
        
        // Fonction de comparaison pour trier par user_id
        usort($notes, function ($a, $b) {
            return $a['user_id'] <=> $b['user_id'];
        });
        // dd($notes); 
        $fournisseur_ids = Fournisseur::where('active', 1)
                                        ->whereHas('fournisseur_evaluateurs', function ($q) use ($user_id) {
                                            $q->where('evaluateur_id', $user_id);  // Filtrer par evaluateur_id
                                        })
                                        ->pluck('designation', 'id')  // Récupère uniquement les fournisseur_id
                                        ->toArray();   // Convertit la collection en tableau
       
        // Tableau final où les notes seront dupliquées
        $duplicated_notes = [];
        if(!isset($request->args))
        {
            foreach ($fournisseur_ids as $key => $value) 
            {
                foreach ($notes as $note) 
                {
                    // Copier chaque note et y associer le fournisseur_id
                    $new_note = $note;
                    if(empty($new_note['fournisseur_id']))
                    {
                        $new_note['fournisseur_id']  = $key;  // Associer le fournisseur_id
                        $new_note['nom_fournisseur'] = $value;  // Associer le fournisseur_id
                        $duplicated_notes[] = $new_note;  // Ajouter au tableau final
                    }
                   
                }
            }
           
            if(!empty($duplicated_notes))
            {
                $notes = $duplicated_notes; 
            }
         
            usort($notes, function ($a, $b) {
                return $a['user_id'] <=> $b['user_id'];
            });
        }   
      
        return $notes;
    }


    public function send_mailevaluateur(Request $request)
    {
        
        if(isset($request->args))
        {
            $periodes = Periode::where('id', $request->args)->get();

            foreach($periodes as $key => $periode) 
            {   
                $list_evaluateurs = FournisseurEvaluateur::whereIn('fournisseur_id', $periode->fournisseur_id)
                                                           ->pluck('evaluateur_id')->toArray();

                $dateMoinsSept = date('Y-m-d', strtotime('-1 days', strtotime($periode->date_notification)));
                $users         = User::whereIn('id', $list_evaluateurs);
                dd($periode); 
                Outil::sendMailRappelPeriode($periode);
            }
            
        }
        else
        {
            $errors = "Erreur lors de l'envoi du mail !";
            throw new \Exception($errors);
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
                    $item = Periode::find($id);
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
    
                            /* $r2as = R2a::where('periode_id', $id);
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
   
    public function confirmation_note_periode($id)
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
                    $item = Periode::find($id);
                    if (empty($item))
                    {
                        $data = 0;
                        $errors = "Cet élément n'existe pas";
                    }
                    else
                    {
                        Note::where('user_id', Outil::donneUserId())->where('periode_id', $id)->update(['etat' => 1]);
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

}
