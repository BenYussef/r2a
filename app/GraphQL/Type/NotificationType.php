<?php

namespace App\GraphQL\Type;

use App\RefactoringItems\RefactGraphQLType;


use App\Outil;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use GraphQL\Type\Definition\Type;
use Rebing\GraphQL\Support\Facades\GraphQL;
use Rebing\GraphQL\Support\Type as GraphQLType;

class NotificationType extends RefactGraphQLType
{

    protected $attributes = [
        'name' => 'Notification',
        'description' => ''
    ];

    public function fields(): array
    {
        return
            [
                'nbre_erreurs'      => ['type' => Type::int()],
            ];
    }
}
