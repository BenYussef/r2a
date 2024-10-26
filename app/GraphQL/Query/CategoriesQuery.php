<?php

namespace App\GraphQL\Query;

use App\QueryModel;
use GraphQL\Type\Definition\Type;
use Rebing\GraphQL\Support\Query;
use Rebing\GraphQL\Support\Facades\GraphQL;
use App\Outil;

class CategoriesQuery extends Query
{
    protected $attributes = [
        'name' => 'categories'
    ];

    public function type(): Type
    {
        return Type::listOf(GraphQL::type('Categorie'));
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
        $query = QueryModel::getQueryCategorie($args);

        return $query->get();
    }
}
