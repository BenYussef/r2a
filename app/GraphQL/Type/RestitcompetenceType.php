<?php

namespace App\GraphQL\Type;

use App\RefactoringItems\RefactGraphQLType;


use App\Outil;
use Illuminate\Support\Carbon;
use GraphQL\Type\Definition\Type;
use Illuminate\Support\Facades\DB;
use Psy\Util\Str;
use Rebing\GraphQL\Support\Type as GraphQLType;
use Rebing\GraphQL\Support\Facades\GraphQL;

class RestitcompetenceType extends RefactGraphQLType
{
    protected $attributes = [
        'name' => 'Restitcompetence',
        'description' => ''
    ];

    public function fields(): array
    {
        return
            [
               

                'data'                              => ['type' => Type::string()],
                
            ];
    }

    
}

