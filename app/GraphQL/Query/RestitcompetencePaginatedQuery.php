<?php

namespace App\GraphQL\Query;

use App\Activite;

use App\QueryModel;
use GraphQL\Type\Definition\Type;
use Rebing\GraphQL\Support\Query;
use Rebing\GraphQL\Support\Facades\GraphQL;
use App\Outil;
use Illuminate\Support\Arr;


class RestitcompetencePaginatedQuery extends Query
{
    protected $attributes = [
        'name' => 'restitcompetencespaginated'
    ];

    public function type(): Type
    {
        return GraphQL::type('restitcompetencespaginated');
    }

    public function args(): array
    {
        return
            [
                'id'                => ['type' => Type::int()],

                'page'              => ['type' => Type::int()],
                'count'             => ['type' => Type::int()],

            ];
    }

    public function resolve($root, $args)
    {
        $query = QueryModel::getQueryRestitcompetence($args);

        $count = Arr::get($args, 'count', 20);
        $page = Arr::get($args, 'page', 1);

        return $query->paginate($count, ['*'], 'page', $page);
    }


}
