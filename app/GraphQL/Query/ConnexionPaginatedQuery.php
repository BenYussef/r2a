<?php

namespace App\GraphQL\Query;


use App\QueryModel;
use GraphQL\Type\Definition\Type;
use Rebing\GraphQL\Support\Query;
use Rebing\GraphQL\Support\Facades\GraphQL;
use Spatie\Permission\Models\Connexion;
use Illuminate\Support\Arr;


class ConnexionPaginatedQuery extends Query
{
    protected $attributes = [
        'name' => 'connexionspaginated'
    ];

    public function type(): Type
    {
        return GraphQL::type('connexionspaginated');
    }

    public function args(): array
    {
        return
            [
                'id'                    => ['type' => Type::int()],
                'page'                  => ['type' => Type::int()],
                'count'                 => ['type' => Type::int()],
                'date_start'        => ['type' => Type::string()],
                'date_end'          => ['type' => Type::string()],
                'name'          => ['type' => Type::string()],

            ];
    }

    public function resolve($root, $args)
    {
        $query = QueryModel::getQueryConnexion($args);

        $count = Arr::get($args, 'count', 20);
        $page = Arr::get($args, 'page', 1);

        return $query->paginate($count, ['*'], 'page', $page);

    }


}
