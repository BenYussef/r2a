<?php

namespace App\GraphQL\Query;

use App\QueryModel;
use GraphQL\Type\Definition\Type;
use Rebing\GraphQL\Support\Query;
use Rebing\GraphQL\Support\Facades\GraphQL;
use App\Outil;

class R2asQuery extends Query
{
    protected $attributes = [
        'name' => 'r2as'
    ];

    public function type(): Type
    {
        return Type::listOf(GraphQL::type('R2a'));
    }

    public function args(): array
    {
        return [
            'id'                => ['type' => Type::int()],
        ];
    }

    public function resolve($root, $args)
    {
        $query = QueryModel::getQueryR2a($args);

        return $query->get();
    }
}
