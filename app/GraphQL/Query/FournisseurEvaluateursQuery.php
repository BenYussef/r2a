<?php

namespace App\GraphQL\Query;

use App\QueryModel;
use GraphQL\Type\Definition\Type;
use Rebing\GraphQL\Support\Query;
use Rebing\GraphQL\Support\Facades\GraphQL;
use App\Outil;

class FournisseurEvaluateursQuery extends Query
{
    protected $attributes = [
        'name' => 'fournisseurevaluateurs'
    ];

    public function type(): Type
    {
        return Type::listOf(GraphQL::type('FournisseurEvaluateur'));
    }

    public function args(): array
    {
        return [
            'id'              => ['type' => Type::int()],
            
            'fournisseur_id'  => ['type' => Type::int()],
            'evaluateur_id'   => ['type' => Type::int()],
        ];
    }

    public function resolve($root, $args)
    {
        $query = QueryModel::getQueryFournisseurEvaluateur($args);

        return $query->get();
    }
}
