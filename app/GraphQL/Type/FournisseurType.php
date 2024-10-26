<?php

namespace App\GraphQL\Type;

use App\RefactoringItems\RefactGraphQLType;


use App\Outil;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use GraphQL\Type\Definition\Type;
use Rebing\GraphQL\Support\Facades\GraphQL;
use Rebing\GraphQL\Support\Type as GraphQLType;

class FournisseurType extends RefactGraphQLType
{

    protected $attributes = [
        'name' => 'Fournisseur',
        'description' => ''
    ];

    public function fields(): array
    {
        return
            [
                'id'                => ['type' => Type::int()],
                'designation'       => ['type' => Type::string()],
                // 'ordre'             => ['type' => Type::int()],
                // 'competences_count' => ['type' => Type::int()],
                // 'competences'       => ['type' => Type::listOf(GraphQL::type('Competence')), 'description' => ''],
                'fournisseur_evaluateurs' => ['type' => Type::listOf(GraphQL::type('FournisseurEvaluateur')), 'description' => ''],
                'liste_evaluateur'  => ['type' => Type::string(),  'description' => ''],
                
                'active'            => ['type' => Type::int()],
                'active_text'       => ['type' => Type::string()],
                'active_badge'      => ['type' => Type::string()],
                
                'created_at'        => ['type' => Type::string(), 'description' => ''],
                'updated_at'        => ['type' => Type::string(), 'description' => ''],
                'created_at_fr'     => ['type' => Type::string(), 'description' => ''],

            ];
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

    
    protected function resolveCreatedAtFrField($root, $args)
    {
        return Outil::resolveAllDateCompletFR($root['created_at']);
    }

    protected function resolveListeEvaluateurField($root, $args)
    {
        if (!isset($root['fournisseur_evaluateurs']))
        {
            $fournisseur_evaluateurs = $root->fournisseur_evaluateurs;
        }
        else
        {
            $fournisseur_evaluateurs = $root['fournisseur_evaluateurs'];
        }

        if (!isset($fournisseur_evaluateurs))
            return null;

        return Outil::donneListeValidateur($fournisseur_evaluateurs); 
    }

}
