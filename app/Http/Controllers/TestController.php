<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\{Categorie, Codification, CodificationRelecteur, Outil, User, Test, Contact, Etude, R2a, Note, Periode};
use App\Exports\{UserExport};
use PDF;

use Excel;
use Illuminate\Support\Facades\Storage;
use Shuchkin\SimpleXLSX;

class TestController extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;

    
    public function test_cron(Request $request)
    {
        Outil::test_cron();
    }
    
    public function test_donnees(Request $request)
    {
        $etudes  = Etude::get();
        foreach ($etudes as $key => $etude) {
            Outil::get_donnees_etudes($etude);
        } 
        $r2a = R2a::latest()->first();
        dd(json_decode($r2a->donnees, true));

        $params = array();
        $params['token'] = "dd524d28ea142c631bfe35bae6275af07bf2a884808fe5915a3abd35171f1503";
        $params['taskid']  = "2242";
        $params['type_question']  = "r2a_alerte";
        $data = Outil::getDataR2asFromAPIPython($params);
        
        dd(json_decode($data));
        $data = response()->json($data);
    }
    public function test_data(){
        $periode_id= 1;
        $data  = [];
        $periodes   = Periode::latest()->limit(4)->get();
        $users      = User::get();
        //dd($users);
        $categories = Categorie::with(['competences'])->get();
        foreach ($categories as $catKey => $categorie) {
            # code...
            $data[$catKey]                     = [];
            $data[$catKey]["designation"]      = $categorie->designation;
            foreach ($periodes as $perKey => $periode) {
                foreach ($categorie->competences as $comptKey => $competence) {
                    $data[$catKey]['competences'][$comptKey]["periodes"][$perKey]["designation"]    = $periode->designation;
                    $data[$catKey]['competences'][$comptKey]["designation"]                         = $competence->designation;
                    foreach ($users as $userKey => $user) {
                        $data[$catKey]['competences'][$comptKey]["periodes"][$perKey]["data"][$userKey]['user_name'] = $user->name;
                        $note  = Note::where('periode_id', $periode->id)->where('user_id', $user->id)->where('competence_id', $competence->id)->first();
                        if(!empty($note)){
                            $data[$catKey]['competences'][$comptKey]["periodes"][$perKey]["data"][$userKey]['note'] = $note->note;
                        }else{
                            $data[$catKey]['competences'][$comptKey]["periodes"][$perKey]["data"][$userKey]['note'] = '-';
                        }
                    }
                }
            }
           
            
            dd($data);
        }
    }
    public function test_relecture(){
        outil::get_complet_evaluation(3); 
        // Outil::notificationRappelPeriode();
        // $notes = Note::where('user_id', '=',2)->where('periode_id',3)->first();
        // dd($notes->previous_note($notes->id));
    }

}
