<?php

namespace App\GraphQL\Type;

use App\RefactoringItems\RefactGraphQLType;


use App\Outil;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use GraphQL\Type\Definition\Type;
use Rebing\GraphQL\Support\Facades\GraphQL;
use Rebing\GraphQL\Support\Type as GraphQLType;

class CategorieType extends RefactGraphQLType
{

    protected $attributes = [
        'name' => 'Categorie',
        'description' => ''
    ];

    public function fields(): array
    {
        return
            [
                'id'                => ['type' => Type::int()],
                'designation'       => ['type' => Type::string()],
                'ordre'             => ['type' => Type::int()],
                'competences_count' => ['type' => Type::int()],
                'competences'       => ['type' => Type::listOf(GraphQL::type('Competence')), 'description' => ''],

                'created_at'        => ['type' => Type::string(), 'description' => ''],
                'updated_at'        => ['type' => Type::string(), 'description' => ''],
                'created_at_fr'             => ['type' => Type::string(), 'description' => ''],

            ];
    }
    protected function resolveCreatedAtFrField($root, $args)
    {
        return Outil::resolveAllDateCompletFR($root['created_at']);
    }
}
