<?php

namespace App\GraphQL\Query;

use App\Activite;

use App\QueryModel;
use GraphQL\Type\Definition\Type;
use Rebing\GraphQL\Support\Query;
use Rebing\GraphQL\Support\Facades\GraphQL;
use App\Outil;
use Illuminate\Support\Arr;


class CompetencePaginatedQuery extends Query
{
    protected $attributes = [
        'name' => 'competencespaginated'
    ];

    public function type(): Type
    {
        return GraphQL::type('competencespaginated');
    }

    public function args(): array
    {
        return
            [
                'id'                => ['type' => Type::int()],
                'designation'       => ['type' => Type::string()],
                'categorie'         => ['type' => Type::string()],
                'page'              => ['type' => Type::int()],
                'count'             => ['type' => Type::int()],

            ];
    }

    public function resolve($root, $args)
    {
        $query = QueryModel::getQueryCompetence($args);

        $count = Arr::get($args, 'count', 20);
        $page = Arr::get($args, 'page', 1);

        return $query->paginate($count, ['*'], 'page', $page);
    }


}
