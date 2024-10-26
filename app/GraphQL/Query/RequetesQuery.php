<?php

namespace App\GraphQL\Query;

use App\QueryModel;
use GraphQL\Type\Definition\Type;
use Rebing\GraphQL\Support\Query;
use Rebing\GraphQL\Support\Facades\GraphQL;
use App\Outil;

class RequetesQuery extends Query
{
    protected $attributes = [
        'name' => 'requetes'
    ];

    public function type(): Type
    {
        return Type::listOf(GraphQL::type('Requete'));
    }

    public function args(): array
    {
        return [
            'type'                => ['type' => Type::string()],
        ];
    }

    public function resolve($root, $args)
    {
        if (isset($args['type']))
        {
            $type = $args['type'];
            if ($type == "refresh_etudes")
            {
                Outil::refresh_etudes();
            }
        }
        return true;
    }
}
