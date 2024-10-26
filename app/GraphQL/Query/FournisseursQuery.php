<?php

namespace App\GraphQL\Query;

use App\QueryModel;
use GraphQL\Type\Definition\Type;
use Rebing\GraphQL\Support\Query;
use Rebing\GraphQL\Support\Facades\GraphQL;
use App\Outil;

class FournisseursQuery extends Query
{
    protected $attributes = [
        'name' => 'fournisseurs'
    ];

    public function type(): Type
    {
        return Type::listOf(GraphQL::type('Fournisseur'));
    }

    public function args(): array
    {
        return [
            'id'                => ['type' => Type::int()],
            'designation'       => ['type' => Type::string()],
        ];
    }

    public function resolve($root, $args)
    {
        $query = QueryModel::getQueryFournisseur($args);

        return $query->get();
    }
}
