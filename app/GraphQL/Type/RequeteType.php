<?php

namespace App\GraphQL\Type;

use App\RefactoringItems\RefactGraphQLType;


use App\Outil;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use GraphQL\Type\Definition\Type;
use Rebing\GraphQL\Support\Facades\GraphQL;
use Rebing\GraphQL\Support\Type as GraphQLType;

class RequeteType extends RefactGraphQLType
{

    protected $attributes = [
        'name' => 'Requete',
        'description' => ''
    ];

    public function fields(): array
    {
        return
            [
                'retour'        => ['type' => Type::string()],
            ];
    }

    protected function resolveRetourField($root, $args)
    {
        return "true";
    }

}
