<?php

namespace App\GraphQL\Query;

use App\Outil;
use App\QueryModel;
use \Spatie\Permission\Models\Permission;
use GraphQL\Type\Definition\Type;
use Rebing\GraphQL\Support\Query;
use Rebing\GraphQL\Support\Facades\GraphQL;
use Spatie\Permission\Models\Role;

class RolesQuery extends Query
{
    protected $attributes = [
        'name' => 'roles'
    ];

    public function type(): Type
    {
        return Type::listOf(GraphQL::type('Role'));
    }

    public function args(): array
    {
        return
            [
                'id'                    => ['type' => Type::int()],
                'name'                  => ['type' => Type::string()],
                'connected_user'        => ['type' => Type::int()],

            ];
    }

    public function resolve($root, $args)
    {
        $query = QueryModel::getQueryRole($args);

        return $query->get();
//        $query = Role::with('permissions');
//
//        if (isset($args['id'])) {
//            $query = $query->where('id', $args['id']);
//        }
//        if (isset($args['name'])) {
//            $query = $query->where('name', 'like', '%' . $args['name'] . '%');
//        }
//
//        $query = $query->get();

//        return $query->map(function (Role $item) {
//            return
//                [
//                    'id' => $item->id,
//                    'name' => $item->name,
//                    'guard_name' => $item->guard_name,
//                    'permissions' => $item->permissions,
//
//                    'created_at' => $item->created_at->format(Outil::formatdate()),
//                    'updated_at' => $item->updated_at->format(Outil::formatdate()),
//                    'deleted_at' => empty($item->deleted_at) ? $item->deleted_at : $item->deleted_at->format(Outil::formatdate()),
//                ];
//        });
    }
}
