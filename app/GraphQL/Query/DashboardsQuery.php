<?php

namespace App\GraphQL\Query;

use App\QueryModel;
use GraphQL\Type\Definition\Type;
use Rebing\GraphQL\Support\Query;
use Rebing\GraphQL\Support\Facades\GraphQL;
use App\Outil;

class DashboardsQuery extends Query
{
    protected $attributes = [
        'name' => 'dashboards'
    ];

    public function type(): Type
    {
        return Type::listOf(GraphQL::type('Dashboard'));
    }

    public function args(): array
    {
        return [
            'id'                => ['type' => Type::int()],
            'entreprise_id'     => ['type' => Type::int()],
        ];
    }

    public function resolve($root, $args)
    {
        $query = QueryModel::getQueryDashboard($args);

        return $query;
    }
}
