<?php


namespace App\RefactoringItems;

use App\{ Outil};

use Carbon\Carbon;
use Illuminate\Support\Arr;

class ModelQuery
{

    public static function getQueryOrQueryPaginated($root, $args, &$query,$order=true)
    {
        if (!isset($args['page']) && isset($args['count']))
        {
            $query = $query->limit($args['count']);
        }
        if (isset($args['count']) && isset($args['page']))
        {
            $count = Arr::get($args, 'count', 20);
            $page  = Arr::get($args, 'page', 1);
            if ($order)
            {
                $query->orderBy('id','asc');
            }
            $query = $query->paginate($count, ['*'], 'page', $page);
        }
        else
        {
            if($order)
            {
                $query->orderBy('id','asc');
            }
            $query = $query->get();
        }
        return $query;
    }
    public static function ForManyItmes($root, $args,$model,$column=null,$pour_logistique=false)
    {
        $classe     = app($model)->getTable();
        $query      = app($model)->query();
        if (isset($args['logistique']))
        {
            $pour_logistique=true;
        }
        if(isset($column))
        {
            if($classe=='entre_sortie_stocks')
            {
                $query->where('multiplicateur',$column)->where('pour_logistique',$pour_logistique);
            }
            else if($classe=='demande_devis_bon_commandes')
            {
                $query->where('type',$column);
            }
            else
            {
                $query->whereNotNull($column);
            }
        }
        Outil::addWhereToModel($query, $args,
            [
                ['id',                     '='],
                ['nom',                 'like'],
                ['designation',         'like'],
                ['est_debit',              '='], 
                ['motif_de_prime_id',      '='],
                ['r2a_de_paie_id',       '='],
                ['contrat_id',             '='],
                ['date',                'date'],            
                ['entite_id',              '='],
                ['type_regule_id',         '='],
                ['fournisseur_id',         '='],
                ['client_id',              '='],
                ['motif',               'like'],
                ['type_contrat_id',        '='],
                ['employe_id',             '='],
                ['observation',         'like'],
                ['depot_id',               '='],
                ['motif_id',               '='],
                ['user_id',                '='],
                ['valeur_conversion',      '='],
                ['signe',               'like'],
                ['par_defaut',             '='],
                ['code',                   '='],
                ['condition_reglement_id', '='],
                ['devise_id',              '='],
                ['date_echeance',       'date'],   
                ['depense_id',             '='],
                ['demande_devis_bon_commande_id','='],        
                ['generer_par_systeme',    '='],
                ['etat',                    '='],
                ['depot_expediteur_id',    '='],
                ['depot_destinataire_id',  '='],

            ]);

            if (isset($args['date']))
            {
                $date =Outil::donneValeurDate($args['date']);
              
               $query->whereRaw("date = ? ", [$date]);
            }

            if (isset($args['date_start']) && isset($args['date_end']))
            {
                $from = $args['date_start'];
                $to = $args['date_end'];
    
                $from = (strpos($from, '/') !== false) ? Carbon::createFromFormat('d/m/Y', $from)->format('Y-m-d') : $from;
                $to = (strpos($to, '/') !== false) ? Carbon::createFromFormat('d/m/Y', $to)->format('Y-m-d') : $to;
    
               $query->whereRaw("date >= ?  AND date <= ?", [$from, $to]);
            }
            if (isset($args['date_debut']) && isset($args['date_fin']))
            {
                $from = $args['date_debut'];
                $to = $args['date_fin'];
    
                $from = (strpos($from, '/') !== false) ? Carbon::createFromFormat('d/m/Y', $from)->format('Y-m-d') : $from;
                $to = (strpos($to, '/') !== false) ? Carbon::createFromFormat('d/m/Y', $to)->format('Y-m-d') : $to;
    
               $query->whereRaw("date_debut >= ?  AND date_fin <= ?", [$from, $to]);
            }

            $query->orderBy('id', 'desc');
            
        return self::getQueryOrQueryPaginated($root, $args, $query);
    }   
}
