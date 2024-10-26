<?php

namespace App\GraphQL\Query;

use App\QueryModel;
use GraphQL\Type\Definition\Type;
use Rebing\GraphQL\Support\Query;
use Rebing\GraphQL\Support\Facades\GraphQL;
use App\Outil;

class PeriodesQuery extends Query
{
    protected $attributes = [
        'name' => 'periodes'
    ];

    public function type(): Type
    {
        return Type::listOf(GraphQL::type('Periode'));
    }

    public function args(): array
    {
        return [
            'id'                => ['type' => Type::int()],
            'fournisseur_id'    => ['type' => Type::int()],
            'designation'       => ['type' => Type::string()],
        ];
    }

    public function resolve($root, $args)
    {
        $query = QueryModel::getQueryPeriode($args);

        return $query->get();
    }
}
