<?php

namespace App\GraphQL\Query;

use App\QueryModel;
use GraphQL\Type\Definition\Type;
use Rebing\GraphQL\Support\Query;
use Rebing\GraphQL\Support\Facades\GraphQL;
use App\Outil;

class RestitcompetencesQuery extends Query
{
    protected $attributes = [
        'name' => 'restitcompetences'
    ];

    public function type(): Type
    {
        return Type::listOf(GraphQL::type('Restitcompetence'));
    }

    public function args(): array
    {
        return [
            'id'             => ['type' => Type::int()],
            'periode_id'     => ['type' => Type::int()],
            'fournisseur_id' => ['type' => Type::int()],
        ];
    }

    public function resolve($root, $args)
    {
        $query = QueryModel::getQueryRestitcompetence($args);

        return $query;
    }
}
