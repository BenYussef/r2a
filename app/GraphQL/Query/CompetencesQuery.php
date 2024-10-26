<?php

namespace App\GraphQL\Query;

use App\QueryModel;
use GraphQL\Type\Definition\Type;
use Rebing\GraphQL\Support\Query;
use Rebing\GraphQL\Support\Facades\GraphQL;
use App\Outil;

class CompetencesQuery extends Query
{
    protected $attributes = [
        'name' => 'competences'
    ];

    public function type(): Type
    {
        return Type::listOf(GraphQL::type('Competence'));
    }

    public function args(): array
    {
        return [
            'id'                => ['type' => Type::int()],
            'designation'       => ['type' => Type::string()],
            'categorie'         => ['type' => Type::string()],
        ];
    }

    public function resolve($root, $args)
    {
        $query = QueryModel::getQueryCompetence($args);

        return $query->get();
    }
}
