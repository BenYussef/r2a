<?php

namespace App\GraphQL\Query;

use App\QueryModel;
use GraphQL\Type\Definition\Type;
use Rebing\GraphQL\Support\Query;
use Rebing\GraphQL\Support\Facades\GraphQL;
use App\Outil;

class PreferencesQuery extends Query
{
    protected $attributes = [
        'name' => 'preferences'
    ];

    public function type(): Type
    {
        return Type::listOf(GraphQL::type('Preference'));
    }

    public function args(): array
    {
        return [
            'id'                => ['type' => Type::int()],
        ];
    }

    public function resolve($root, $args)
    {
        $query = QueryModel::getQueryPreference($args);

        return $query->get();
    }
}
