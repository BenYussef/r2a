<?php

namespace App\GraphQL\Query;

use App\Outil;
use App\User;
use App\QueryModel;
use GraphQL\Type\Definition\Type;
use Rebing\GraphQL\Support\Query;
use Rebing\GraphQL\Support\Facades\GraphQL;
use Illuminate\Support\Arr;


class UserPaginatedQuery extends Query
{
    protected $attributes = [
        'name' => 'userspaginated'
    ];

    public function type(): Type
    {
        return GraphQL::type('userspaginated');
    }

    public function args(): array
    {
        return
            [
                'id'            => ['type' => Type::int()],
                'name'          => ['type' => Type::string()],
                'search'        => ['type' => Type::string()],
                'role_id'       => ['type' => Type::int()],
                'id_askia'       => ['type' => Type::string()],

                
                'nom'           => ['type' => Type::string()],
                'prenom'        => ['type' => Type::string()],
                'email'         => ['type' => Type::string()],
                // 'email2'        => ['type' => Type::string()],
                'numerotel'     => ['type' => Type::string()],

                'connected'     => ['type' => Type::int()],

                'page'          => ['type' => Type::int()],
                'count'         => ['type' => Type::int()],
            ];
    }

    public function resolve($root, $args)
    {
        $query = QueryModel::getQueryUser($args);

        $count = Arr::get($args, 'count', 20);
        $page = Arr::get($args, 'page', 1);

        return $query->paginate($count, ['*'], 'page', $page);
    }


}
