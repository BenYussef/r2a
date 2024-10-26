<?php

namespace App\GraphQL\Query;

use App\Outil;
use App\User;
use App\QueryModel;
use Carbon\Carbon;
use GraphQL\Type\Definition\Type;
use Rebing\GraphQL\Support\Query;
use Rebing\GraphQL\Support\Facades\GraphQL;

class UsersQuery extends Query
{
    protected $attributes = [
        'name' => 'users',
        'description' => ''
    ];

    public function type(): Type
    {
        // result of query with pagination laravel
        return Type::listOf(GraphQL::type('User'));
    }

    // arguments to filter query
    public function args(): array
    {
        return
            [
                'id'            => ['type' => Type::int()],
                'name'          => ['type' => Type::string()],
                'search'        => ['type' => Type::string()],
                'role_id'       => ['type' => Type::int()],
                'est_evaluateur'=> ['type' => Type::int()],
                'id_askia'      => ['type' => Type::string()],

                'nom'           => ['type' => Type::string()],
                'prenom'        => ['type' => Type::string()],
                'email'         => ['type' => Type::string()],
                // 'email2'        => ['type' => Type::string()],
                'tel'           => ['type' => Type::string()],

                'connected'     => ['type' => Type::int()],
            ];
    }

    public function resolve($root, $args)
    {
        $query = QueryModel::getQueryUser($args);

        return $query->get();
    }
}
