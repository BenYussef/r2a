<?php

namespace App\GraphQL\Type;

use App\RefactoringItems\RefactGraphQLType;


use App\Outil;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use GraphQL\Type\Definition\Type;
use Rebing\GraphQL\Support\Facades\GraphQL;
use Rebing\GraphQL\Support\Type as GraphQLType;

class PeriodeType extends RefactGraphQLType
{

    protected $attributes = [
        'name' => 'Periode',
        'description' => ''
    ];

    public function fields(): array
    {
        return
            [
                'id'                    => ['type' => Type::int()],
                'type'                  => ['type' => Type::string()],
                'designation'           => ['type' => Type::string()],
                'active'                => ['type' => Type::int()],
                'fournisseur_id'        => ['type' => Type::int()],
                'fournisseur'           => ['type' => GraphQL::type('Fournisseur')],
                'total_competences'     => ['type' => Type::int()],
                'competences_remplies'  => ['type' => Type::int()],
                'competences_valides'   => ['type' => Type::int()],
                'date_notification'     => ['type' => Type::string()],
                'active_text'           => ['type' => Type::string()],
                'active_badge'          => ['type' => Type::string()],



                'remplissage_badge'     => ['type' => Type::string()],
                'created_at'            => ['type' => Type::string(), 'description' => ''],
                'updated_at'            => ['type' => Type::string(), 'description' => ''],
                'created_at_fr'         => ['type' => Type::string(), 'description' => ''],
                'date_notification_fr'  => ['type' => Type::string(), 'description' => ''],

            ];
    }
    protected function resolveCreatedAtFrField($root, $args)
    {
        return Outil::resolveAllDateCompletFR($root['created_at']);
    }
    protected function resolveDateNotificationFrField($root, $args)
    {
        return Outil::resolveAllDateCompletFR($root['date_notification'], false);
    }

    protected function resolveCompleteField($root, $args)
    {
        $retour = ""; 
        $periode_id  = $root['id'];

        $retour = Outil::get_complet_evaluation($periode_id); 
        
        return $retour; 

    }

    protected function resolveRemplissageBadgeField($root, $args)
    {
        $retour  = "";
        $competences_remplies  = $root['competences_remplies'];
        $total_competences     = $root['total_competences'];
        if ($competences_remplies == 0) {
            $retour = "badge-danger";
        } else if ($competences_remplies >0 && $competences_remplies<$total_competences) {
            $retour = "badge-warning";
        } else if ($competences_remplies >= $total_competences) {
            $retour = "badge-success";
        }
        return $retour;
    }
    protected function resolveActiveTextField($root, $args)
    {
        $itemArray = array("etat" => $root['active']);
        $retour = Outil::donneEtatGeneral("actif_inactif", $itemArray)["texte"];
        if(empty($retour))
        {
            $retour = "";
        }

        return $retour;
    }

    protected function resolveActiveBadgeField($root, $args)
    {
        $itemArray = array("etat" => $root['active']);
        $retour = Outil::donneEtatGeneral("actif_inactif", $itemArray)["badge"];
        if(empty($retour))
        {
            $retour = "";
        }

        return $retour;
    }
    
}
