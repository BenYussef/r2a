<?php

namespace App\GraphQL\Type;

use App\RefactoringItems\RefactGraphQLType;


use App\Outil;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use GraphQL\Type\Definition\Type;
use Rebing\GraphQL\Support\Facades\GraphQL;
use Rebing\GraphQL\Support\Type as GraphQLType;

class FournisseurEvaluateurType extends RefactGraphQLType
{

    protected $attributes = [
        'name' => 'FournisseurEvaluateur',
        'description' => ''
    ];

    public function fields(): array
    {
        return
        [
            'id'              => ['type' => Type::int()],
            'fournisseur_id'  => ['type' => Type::int()],
            'fournisseur'     => ['type' => GraphQL::type('Fournisseur')],
            'evaluateur_id'   => ['type' => Type::int()],
            'evaluateur'      => ['type' => GraphQL::type('User')],
            'created_at'      => ['type' => Type::string(), 'description' => ''],
            'updated_at'      => ['type' => Type::string(), 'description' => ''],
        ];
    }

}