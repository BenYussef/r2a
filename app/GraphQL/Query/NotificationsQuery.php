<?php

namespace App\GraphQL\Query;

use App\QueryModel;
use GraphQL\Type\Definition\Type;
use Rebing\GraphQL\Support\Query;
use Rebing\GraphQL\Support\Facades\GraphQL;
use App\Outil;

class NotificationsQuery extends Query
{
    protected $attributes = [
        'name' => 'notifications'
    ];

    public function type(): Type
    {
        return Type::listOf(GraphQL::type('Notification'));
    }

    public function args(): array
    {
        return [
            'id'                => ['type' => Type::int()],
        ];
    }

    public function resolve($root, $args)
    {
        $query = QueryModel::getQueryNotification($args);

        return $query;
    }
}
