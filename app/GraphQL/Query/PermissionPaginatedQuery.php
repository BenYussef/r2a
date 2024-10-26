<?php

namespace App\GraphQL\Query;

use App\Nomenclature;
use App\Outil;
use App\QueryModel;
use App\User;
use GraphQL\Type\Definition\Type;
use Rebing\GraphQL\Support\Query;
use Rebing\GraphQL\Support\Facades\GraphQL;
use Illuminate\Support\Facades\Auth;
use Spatie\Permission\Models\Permission;

use Closure;
use GraphQL\Type\Definition\ResolveInfo;

use Illuminate\Support\Arr;

class PermissionPaginatedQuery extends Query
{


    protected $attributes = [
        'name' => 'permissionspaginated'
    ];

    public function type(): Type
    {
        return GraphQL::type('permissionspaginated');
    }

    public function args(): array
    {
        return
            [
                'id'                => ['type' => Type::int()],
                'name'              => ['type' => Type::string()],
                'display_name'      => ['type' => Type::string()],
                'search'            => ['type' => Type::string()],

                'page'              => ['type' => Type::int()],
                'count'             => ['type' => Type::int()],
                'designation'       => ['type' => Type::string()],

            ];
    }
    public function resolve($root, $args)
    {
        $query = QueryModel::getQueryPermission($args);

        $count = Arr::get($args, 'count', 20);
        $page = Arr::get($args, 'page', 1);

        return $query->paginate($count, ['*'], 'page', $page);
    }



}
