<?php

namespace App\GraphQL\Type;

use App\RefactoringItems\RefactGraphQLType;


use App\Outil;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use GraphQL\Type\Definition\Type;
use Rebing\GraphQL\Support\Facades\GraphQL;
use Rebing\GraphQL\Support\Type as GraphQLType;

class ErreurType extends RefactGraphQLType
{

    protected $attributes = [
        'name' => 'Erreur',
        'description' => ''
    ];

    public function fields(): array
    {
        return
            [
                'id'                => ['type' => Type::int()],
                'type'              => ['type' => Type::string()],
                'designation'       => ['type' => Type::string()],
                'erreur'            => ['type' => Type::string()],
                'vu'                => ['type' => Type::int()],
                'vu_text'           => ['type' => Type::string()],
                'vu_badge'          => ['type' => Type::string()],

                'created_at'        => ['type' => Type::string(), 'description' => ''],
                'updated_at'        => ['type' => Type::string(), 'description' => ''],
            ];
    }

    protected function resolveVuTextField($root, $args)
    {
        $itemArray = array("etat" => $root['vu']);
        $retour = Outil::donneEtatGeneral("etat_general", $itemArray)["texte"];
        if(empty($retour))
        {
            $retour = "";
        }

        return $retour;
    }

    protected function resolveVuBadgeField($root, $args)
    {
        $itemArray = array("etat" => $root['vu']);
        $retour = Outil::donneEtatGeneral("etat_general", $itemArray)["badge"];
        if(empty($retour))
        {
            $retour = "";
        }

        return $retour;
    }
}
