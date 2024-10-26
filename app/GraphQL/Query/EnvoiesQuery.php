<?php

namespace App\GraphQL\Query;

use App\Outil;
use App\Envoie;
use App\QueryModel;
use Carbon\Carbon;
use GraphQL\Type\Definition\Type;
use Rebing\GraphQL\Support\Query;
use Rebing\GraphQL\Support\Facades\GraphQL;

class EnvoiesQuery extends Query
{
    protected $attributes = [
        'name' => 'envoies',
        'description' => ''
    ];

    public function type(): Type
    {
        // result of query with pagination laravel
        return Type::listOf(GraphQL::type('Envoie'));
    }

    // arguments to filter query
    public function args(): array
    {
        return
            [
                'id'                => ['type' => Type::id(),   ],
                'r2a'             => ['type' => Type::string()],
                'user'              => ['type' => Type::string()],
               
            ];
    }

    public function resolve($root, $args)
    {
        $query = QueryModel::getQueryEnvoie($args);

        return $query->get();
    }
}
