<?php

namespace App\GraphQL\Query;

use App\Outil;
use App\Envoie;
use App\QueryModel;
use GraphQL\Type\Definition\Type;
use Rebing\GraphQL\Support\Query;
use Rebing\GraphQL\Support\Facades\GraphQL;
use Illuminate\Support\Arr;


class EnvoiePaginatedQuery extends Query
{
    protected $attributes = [
        'name' => 'envoiespaginated'
    ];

    public function type(): Type
    {
        return GraphQL::type('envoiespaginated');
    }

    public function args(): array
    {
        return
            [
                'id'                => ['type' => Type::id(),   ],
                'numero_envoie'      => ['type' => Type::string()],
                'nom_envoie'         => ['type' => Type::string()],
                'id_askia'          => ['type' => Type::string()],
                'id_liste'          => ['type' => Type::string()],

                'page'        => ['type' => Type::int()],
                'count'       => ['type' => Type::int()],
            ];
    }

    public function resolve($root, $args)
    {
        $query = QueryModel::getQueryEnvoie($args);

        $count = Arr::get($args, 'count', 20);
        $page = Arr::get($args, 'page', 1);

        return $query->paginate($count, ['*'], 'page', $page);
    }


}
