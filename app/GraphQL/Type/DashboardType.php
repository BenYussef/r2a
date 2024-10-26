<?php

namespace App\GraphQL\Type;

use App\RefactoringItems\RefactGraphQLType;


use App\Outil;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use GraphQL\Type\Definition\Type;
use Rebing\GraphQL\Support\Facades\GraphQL;
use Rebing\GraphQL\Support\Type as GraphQLType;

class DashboardType extends RefactGraphQLType
{

    protected $attributes = [
        'name' => 'Dashboard',
        'description' => ''
    ];

    public function fields(): array
    {
        return
            [               
                'total_etudes'                  => ['type' => Type::int()],
                'total_r2as'                  => ['type' => Type::int()],
                'r2as_envoyes'               => ['type' => Type::int()],                
                'r2as_non_envoyes'           => ['type' => Type::int()],                
            ];
    }

}
