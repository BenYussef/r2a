<?php

namespace App\GraphQL\Query;

use App\Outil;
use App\QueryModel;
use GraphQL\Type\Definition\Type;
use Rebing\GraphQL\Support\Query;
use Rebing\GraphQL\Support\Facades\GraphQL;
use Spatie\Permission\Models\Connexion;

class ConnexionQuery extends Query
{
    protected $attributes = [
        'name' => 'connexions'
    ];

    public function type(): Type
    {
        return Type::listOf(GraphQL::type('Connexion'));
    }

    public function args(): array
    {
        return
            [
                'id'                    => ['type' => Type::int()],
                'login'                  => ['type' => Type::string()],
                'user_id'        => ['type' => Type::int()],
                'date_start'        => ['type' => Type::string()],
                'date_end'          => ['type' => Type::string()],
                'name'          => ['type' => Type::string()],


            ];
    }

    public function resolve($root, $args)
    {
        $query = QueryModel::getQueryConnexion($args);

        return $query->get();

    }
}
