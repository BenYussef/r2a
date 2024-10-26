<?php

namespace App\GraphQL\Query;

use App\Activite;

use App\QueryModel;
use GraphQL\Type\Definition\Type;
use Rebing\GraphQL\Support\Query;
use Rebing\GraphQL\Support\Facades\GraphQL;
use App\Outil;
use Illuminate\Support\Arr;


class ErreurPaginatedQuery extends Query
{
    protected $attributes = [
        'name' => 'erreurspaginated'
    ];

    public function type(): Type
    {
        return GraphQL::type('erreurspaginated');
    }

    public function args(): array
    {
        return
            [
                'id'                => ['type' => Type::int()],
                'vu'                => ['type' => Type::int()],
                'type'              => ['type' => Type::string()],
                'designation'       => ['type' => Type::string()],
                'date_start'        => ['type' => Type::string()],
                'date_end'          => ['type' => Type::string()],

                'page'              => ['type' => Type::int()],
                'count'             => ['type' => Type::int()],

            ];
    }

    public function resolve($root, $args)
    {
        $query = QueryModel::getQueryErreur($args);

        $count = Arr::get($args, 'count', 20);
        $page = Arr::get($args, 'page', 1);

        return $query->paginate($count, ['*'], 'page', $page);
    }


}
