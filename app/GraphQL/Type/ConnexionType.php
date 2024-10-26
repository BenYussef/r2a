<?php

namespace App\GraphQL\Type;

use App\Outil;
use App\RefactoringItems\RefactGraphQLType;

use GraphQL\Type\Definition\Type;
use Rebing\GraphQL\Support\Type as GraphQLType;
use Rebing\GraphQL\Support\Facades\GraphQL;


class ConnexionType extends RefactGraphQLType
{
    protected $attributes = [
        'name' => 'Connexion',
        'description' => ''
    ];

    public function fields(): array
    {

        return
            [
                'id'                        => ['type' => Type::id(), 'description' => ''],
                
                'user_id'                   => ['type' => Type::int()],
                'user'                      => ['type' => GraphQL::type('User')],
                'login'                     => ['type' => Type::string(), 'description' => ''],
                'last_login_ip'             => ['type' => Type::string(), 'description' => ''],
                

                'created_at'                => ['type' => Type::string(), 'description' => ''],
                'created_at_fr'             => ['type' => Type::string(), 'description' => ''],
            ];
    }
    protected function resolveCreatedAtFrField($root, $args)
    {
        return Outil::resolveAllDateCompletFR($root['created_at']);
    }
}
