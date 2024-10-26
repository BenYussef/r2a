<?php

namespace App;

use App\GraphQL\Query\ActionsQuery;
use App\GraphQL\Query\TypeClientQuery;
use App\GraphQL\Type\AccompagnementType;
use App\GraphQL\Type\FonctionType;
use App\GraphQL\Type\ParametrageBudgetType;
use App\GraphQL\Type\TypeDeConservationType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Mpdf\Tag\Time;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class QueryModel extends Model
{
    public function __construct()
    {
        $this->middleware('auth');
    }
    public static function getQueryRole($args)
    {
        $query = Role::with('permissions');

        if (isset($args['id'])) {
            $query = $query->where('id', $args['id']);
        }
        if (isset($args['name'])) {
            $query = $query->where('name', 'like', '%' . $args['name'] . '%');
        }
        if (isset($args['connected_user'])) {
            $user = Auth::user();
            $roleId = $user->roles->first()->id;
            $query = $query->where('id', $roleId);
        }


        $query = $query->orderBy('id');
        return $query;
    }

    public static function getQueryPermission($args)
    {
        $query = Permission::query();

        if (isset($args['id'])) {
            $query = $query->where('id', $args['id']);
        }

        if (isset($args['name'])) {
            $query = $query = $query->where('name', Outil::getOperateurLikeDB(), '%' . $args['name'] . '%');
        }

        if (isset($args['display_name'])) {
            $query = $query = $query->where('display_name', Outil::getOperateurLikeDB(), '%' . $args['display_name'] . '%');
        }

        if (isset($args['designation'])) {
            $query = $query = $query->where('display_name', Outil::getOperateurLikeDB(), '%' . $args['designation'] . '%');
        }

        if (isset($args['activer'])) {
            $query = $query = $query->where('activer', $args['activer']);
        }
        if (isset($args['search'])) {
            $motRecherche  = $args['search'];
            $query->where(function ($query) use ($motRecherche) {
                return $query->where('name', Outil::getOperateurLikeDB(), '%'.$motRecherche.'%')
                    ->orWhere('display_name', Outil::getOperateurLikeDB(), '%' . $motRecherche . '%');
            });
        }

        $user = Auth::user();

        //$query = $user->roles[0]->permissions;

        $query = $query->orderBy('id');
        return $query;

    }


    public static function getQueryPreference($args)
    {
        $query = Preference::query();

        if (isset($args['id'])) {
            $query = $query->where('id', $args['id']);
        }

        $query->orderBy('id', 'asc');

        return $query;
    }

   

    public static function getQueryConnexion($args)
    {
        $query = Connexion::with('user')->whereIn('user_id', User::where('is_admin', 0)->get(['id']));

        if (isset($args['name'])) {
            $query = $query->whereIn('user_id', User::where('name', 'like', '%' . $args['name'] . '%')->get(['id']));
        }
        
        if (isset($args['date_start']) && isset($args['date_end']))
        {
            $from = $args['date_start'];
            $to = $args['date_end'];

            $from = date($from . ' 00:00:00');
            $to = date($to . ' 23:59:59');

            $query = $query->whereBetween('created_at', array($from, $to));
        }
        
        $query = $query->orderByDesc('id');
        return $query;
    }

    public static function getQueryDashboard($args)
    {
        $queryBase = R2a::query();

        /* //Restriction entreprise pour ne voir que ses contacts
        if(isset(Auth::user()->is_admin))
        {
            if(Auth::user()->is_admin == 0 && Auth::user()->type == 1)
            {
                //C'est une entreprise
                $userEntrepriseCode = Outil::donneUserEntrepriseCode();
                $queryBase = $queryBase->where('entreprise_code', $userEntrepriseCode);
            }
        } */

        $total_etudes = Etude::count();

        $total_r2as = (clone $queryBase)
        ->count();

        $r2as_envoyes = (clone $queryBase)
        ->where('etat',2)->count();

        $r2as_non_envoyes = (clone $queryBase)
        ->where('etat','<',2)->count();

        return
        [
            [                
                'total_etudes'              => $total_etudes,
                'total_r2as'              => $total_r2as,
                'r2as_envoyes'            => $r2as_envoyes,
                'r2as_non_envoyes'        => $r2as_non_envoyes,
            ]
        ];
    }


    
    public static function getQueryEnvoie($args)
    {
        $query = Envoie::with(['user', 'r2a']);

        if (isset($args['id']))
        {
            $query = $query->where('id', $args['id']);
        }
       
        $query->orderBy('id', 'desc');

        return $query;
    }

    public static function getQueryNotification($args)
    {
        $nbre_erreurs = DB::table('erreurs')->where('vu', 0)->count();

        return
            [
                [
                    'nbre_erreurs'       => $nbre_erreurs,
                ]
            ];
    }
    public static function getQueryErreur($args)
    {
        $query = Erreur::query();

        if (isset($args['id']))
        {
            $query = $query->where('id', $args['id']);
        }
        if (isset($args['vu']))
        {
            $query = $query->where('vu', $args['vu']);
        }
        if (isset($args['type']))
        {
            $query = $query->where('type', Outil::getOperateurLikeDB(), '%' . $args['type'] . '%');
        }
        if (isset($args['designation']))
        {
            $query = $query->where('designation', Outil::getOperateurLikeDB(), '%' . $args['designation'] . '%');
        }
        if (isset($args['date_start']) && isset($args['date_end']))
        {
            $from = $args['date_start'];
            $to = $args['date_end'];

            $from = date($from . ' 00:00:00');
            $to = date($to . ' 23:59:59');

            $query = $query->whereBetween('created_at', array($from, $to));
        }

        $query->orderBy('id', 'desc');

        return $query;
    }
    public static function getQueryHistorique($args)
    {
        $query = Historique::with(["codification"]);

        if (isset($args['id']))
        {
            $query = $query->where('id', $args['id']);
        }
        if (isset($args['vu']))
        {
            //$query = $query->where('vu', $args['vu']);
        }
        if (isset($args['type']))
        {
            //$query = $query->where('type', Outil::getOperateurLikeDB(), '%' . $args['type'] . '%');
        }
        if (isset($args['designation']))
        {
            //$query = $query->where('designation', Outil::getOperateurLikeDB(), '%' . $args['designation'] . '%');
        }
        if (isset($args['date_start']) && isset($args['date_end']))
        {
            $from = $args['date_start'];
            $to = $args['date_end'];

            $from = date($from . ' 00:00:00');
            $to = date($to . ' 23:59:59');

            //$query = $query->whereBetween('created_at', array($from, $to));
        }

        $query->orderBy('id', 'desc');

        return $query;
    }

    public static function getQueryUser($args)
    {
        $query = User::with('roles')->where('email','!=', 'root@root.com');

        if (isset($args['id']))
        {
            $query = $query->where('id', $args['id']);
        }
        if (isset($args['role_id']))
        {
            $role_id = $args['role_id'];
            $query = $query->whereHas('roles', function ($query) use ($role_id) {
                $query->where('id', $role_id);
            });
        }
        if (isset($args['name']))
        {
            $query = $query->where('name', Outil::getOperateurLikeDB(), '%' . $args['name'] . '%');
        }
        if (isset($args['search']))
        {
            $query = $query->where('name', Outil::getOperateurLikeDB(), '%' . $args['search'] . '%')
                ->orWhere('email', Outil::getOperateurLikeDB(), '%' . $args['search'] . '%');
        }
        if (isset($args['email']))
        {
            $query = $query->where('email', Outil::getOperateurLikeDB(), '%' . $args['email'] . '%');
        }
        if (isset($args['connected']))
        {
            if($args['connected'] == 1)
            {
                $query = $query->where('email', '!=', 'root@root.com')->where('relecteur_id', '!=', 'null')->where('last_login', '>', '2022-01-12 00:00:00');
            }
        }
        if (isset($args['type_id']))
        {
            $query = $query->where('type', $args['type_id']);
        }

        $query->orderBy('name', 'asc');

        return  $query;
    }

    public static function getQueryRelecture($args)
    {
        $query = Relecture::with('r2a');

        if (isset($args['id'])) {
            $query = $query->where('id', $args['id']);
        }
        if (isset($args['verbatim'])) {
            /* dd($args['verbatim']); */
            $query = $query->where('verbatim', Outil::getOperateurLikeDB(), '%' . $args['verbatim'] . '%');
        }
        if (isset($args['verbatim_relu'])) {
            if(strtolower($args['verbatim_relu']) == 'null'){
                $query = $query->where('verbatim_relu','');
            }else{
                $query = $query->where('verbatim_relu', Outil::getOperateurLikeDB(), '%' . $args['verbatim_relu'] . '%');
            }
        }
        if (isset($args['id_lvdc'])) {
            $query = $query->where('id_lvdc', Outil::getOperateurLikeDB(), '%' . $args['id_lvdc'] . '%');
        }
        if (isset($args['shortcut'])) {
            $query = $query->where('shortcut', Outil::getOperateurLikeDB(), '%' . $args['shortcut'] . '%');
        }

        $query->orderBy('id', 'desc');

        return $query;
    }
    
   

    public static function getQueryR2a($args)
    {
        $query = R2a::query();
        if (isset($args['id']))
        {
            $query = $query->where('id', $args['id']);
        }
        
       return $query;
    }

    public static function getQueryFournisseur($args)
    {
        $query = Fournisseur::query();
        if (isset($args['id']))
        {
            $query = $query->where('id', $args['id']);
        }
       return $query;
    }
    public static function getQueryCategorie($args)
    {
        $query = Categorie::with('competences')->withCount('competences');
        if (isset($args['id']))
        {
            $query = $query->where('id', $args['id']);
        }
        if (isset($args['designation']))
        {
            $query = $query->where('designation', Outil::getOperateurLikeDB(), '%' . $args['designation'] . '%');
        }
        $query->orderBy('ordre');

        return  $query;
    }
    public static function getQueryCompetence($args)
    {
        $query = Competence::with('categorie');
        if (isset($args['id']))
        {
            $query = $query->where('id', $args['id']);
        }
        if (isset($args['designation']))
        {
            $query = $query->where('designation', Outil::getOperateurLikeDB(), '%' . $args['designation'] . '%');
        }
        if (isset($args['categorie']))
        {
            $query = $query->whereRelation('categorie', function($query) use($args){
                return $query->where('designation', Outil::getOperateurLikeDB(), '%' . $args['categorie'] . '%');
            });
        }
        $query->orderByDesc('id');

        return  $query;
    }

    public static function getQueryRestitcompetence($args)
    {
        $notes = DB::table('notes')
        ->join('fournisseurs', 'notes.fournisseur_id', '=', 'fournisseurs.id') // Jointure avec la table fournisseurs
        ->where('notes.etat', 1) // Condition sur l'état
        ->whereNotNull('notes.note'); // Filtrer uniquement les notes non nulles

        // Filtrer par fournisseur_id si le filtre est défini
        if (isset($args['fournisseur_id'])) {
            $notes = $notes->where('notes.fournisseur_id', $args['fournisseur_id']);
        }

        // Filtrer par periode_id si le filtre est défini
        if (isset($args['periode_id'])) {
            $notes = $notes->where('notes.periode_id', $args['periode_id']);
        }

        // Ajouter les sélections et calculs
        $notes = $notes->select(
                    'fournisseurs.designation', // Sélectionner le nom du fournisseur
                    DB::raw('AVG(notes.note) as note_moyenne'), // Calculer la moyenne des notes
                    DB::raw('COUNT(DISTINCT notes.fournisseur_id) as nb_evaluations') // Compter les évaluations distinctes
                )
                ->groupBy('fournisseurs.designation') // Groupement par nom du fournisseur
                ->get();
        
        $data = [];
        foreach ($notes as $key => $stat) 
        {
            $data[$key]['fournisseur'] = $stat->designation;
            // Calcul de la note moyenne et du nombre d'évaluations
            $data[$key]["note"]          = (int) round($stat->note_moyenne ?? 0); // Si note_moyenne est null, on retourne 0
            $data[$key]["couleur"]       = Outil::getColorByNote($data[$key]["note"]);
            $data[$key]["nb_evaluation"] = $stat->nb_evaluations ?? 0; // Si pas d'évaluations, on retourne 0
        }
        // Après le traitement des données dans la boucle foreach
        usort($data, function ($a, $b) {
            return $b['note'] <=> $a['note']; // Trier par 'note' en ordre décroissant
        });        
        
        return [
            [
                'data'      => json_encode($data)
            ]
        ];
    }
    public static function getQueryPeriode($args)
    {
        $query = Periode::withCount(['notes as competences_remplies'=>function ($sub_query) {
            return $sub_query->whereNotNull('note')->where('user_id', Outil::donneUserId());
        }])->withCount(['notes as competences_valides'=>function ($sub_query) {
            return $sub_query->whereNotNull('note')->where('etat', 1)->where('user_id', Outil::donneUserId());
        }]);
        if (isset($args['id']))
        {
            $query = $query->where('id', $args['id']);
        }
        if (isset($args['fournisseur_id']))
        {
            $query = $query->where('fournisseur_id', $args['fournisseur_id']);
        }
        if(isset(Auth::user()->is_admin))
        {
            // if((Auth::user()->is_admin == 0))
            // {
            //     //C'est une entreprise
            //     $query = $query->where('date_notification', '<=', date('Y-m-d'))
            //                     ->whereHas('fournisseur.fournisseur_evaluateurs', function ($q) {
            //                         $q->where('evaluateur_id', Auth::user()->id);
            //                     });   
            // }
        }
        if (isset($args['designation']))
        {
            $query = $query->where('designation', Outil::getOperateurLikeDB(), '%' . $args['designation'] . '%');
        }
        $query->orderBy('id', 'desc');

        return  $query;
    }
}
