<?php

namespace App\GraphQL\Query;

use App\QueryModel;
use GraphQL\Type\Definition\Type;
use Rebing\GraphQL\Support\Query;
use Rebing\GraphQL\Support\Facades\GraphQL;
use App\Outil;

class ErreursQuery extends Query
{
    protected $attributes = [
        'name' => 'erreurs'
    ];

    public function type(): Type
    {
        return Type::listOf(GraphQL::type('Erreur'));
    }

    public function args(): array
    {
        return [
            'id'                => ['type' => Type::int()],
            'vu'                => ['type' => Type::int()],
            'type'              => ['type' => Type::string()],
            'designation'       => ['type' => Type::string()],
            'date_start'        => ['type' => Type::string()],
            'date_end'          => ['type' => Type::string()],
        ];
    }

    public function resolve($root, $args)
    {
        $query = QueryModel::getQueryErreur($args);

        return $query->get();
    }
}
