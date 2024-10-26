<?php

namespace App\GraphQL\Query;


use App\QueryModel;
use GraphQL\Type\Definition\Type;
use Rebing\GraphQL\Support\Query;
use Rebing\GraphQL\Support\Facades\GraphQL;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Arr;


class RolePaginatedQuery extends Query
{
    protected $attributes = [
        'name' => 'rolespaginated'
    ];

    public function type(): Type
    {
        return GraphQL::type('rolespaginated');
    }

    public function args(): array
    {
        return
            [
                'id'                    => ['type' => Type::int()],
                'page'                  => ['type' => Type::int()],
                'count'                 => ['type' => Type::int()],
                'name'                  => ['type' => Type::string()],
                'connected_user'        => ['type' => Type::int()],



            ];
    }

    public function resolve($root, $args)
    {
        $query = QueryModel::getQueryRole($args);

        $count = Arr::get($args, 'count', 20);
        $page = Arr::get($args, 'page', 1);

        return $query->paginate($count, ['*'], 'page', $page);

    }


}
