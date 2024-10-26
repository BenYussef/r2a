<?php

namespace App\GraphQL\Type;

use App\RefactoringItems\RefactGraphQLType;


use App\Outil;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use GraphQL\Type\Definition\Type;
use Rebing\GraphQL\Support\Facades\GraphQL;
use Rebing\GraphQL\Support\Type as GraphQLType;

class R2aType extends RefactGraphQLType
{

    protected $attributes = [
        'name' => 'R2a',
        'description' => ''
    ];

    public function fields(): array
    {
        return
            [
                'id'                => ['type' => Type::int()],
                'designation'       => ['type' => Type::string()],
                'ordre'             => ['type' => Type::int()],

                'created_at'        => ['type' => Type::string(), 'description' => ''],
                'updated_at'        => ['type' => Type::string(), 'description' => ''],
            ];
    }

}
