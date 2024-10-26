<?php

namespace App\GraphQL\Type;

use App\RefactoringItems\RefactGraphQLType;


use App\Outil;
use Illuminate\Support\Carbon;
use GraphQL\Type\Definition\Type;
use Illuminate\Support\Facades\DB;
use Psy\Util\Str;
use Rebing\GraphQL\Support\Type as GraphQLType;
use Rebing\GraphQL\Support\Facades\GraphQL;

class UserType extends RefactGraphQLType
{
    protected $attributes = [
        'name' => 'User',
        'description' => ''
    ];

    public function fields(): array
    {
        return
            [
                'id'                => ['type' => Type::id(), 'description' => ''],
                'name'              => ['type' => Type::string(), 'description' => ''],
                'image'             => ['type' => Type::string(), 'description' => ''],
                
                'nom'               => ['type' => Type::string(), 'description' => ''],
                'prenom'            => ['type' => Type::string(), 'description' => ''],
                'email'             => ['type' => Type::string(), 'description' => ''],
                // 'email2'            => ['type' => Type::string(), 'description' => ''],
                'numerotel'         => ['type' => Type::string(), 'description' => ''],
                'est_evaluateur'    => ['type' => Type::int()],
                'is_admin'          => ['type' => Type::int()],
                'id_askia'          => ['type' => Type::string(), 'description' => ''],
                'password_seen'     => ['type' => Type::string(), 'description' => ''],
                
                'roles'             => ['type' => Type::listOf(GraphQL::type('Role')), 'description' => ''],
                
                'last_login'        => ['type' => Type::string(), 'description' => ''],
                'info1'             => ['type' => Type::string(), 'description' => ''],
                
                'created_at'        => ['type' => Type::string(), 'description' => ''],
                'created_at_fr'     => ['type' => Type::string(), 'description' => ''],
                'updated_at'        => ['type' => Type::string(), 'description' => ''],
                'updated_at_fr'     => ['type' => Type::string(), 'description' => ''],
                'deleted_at'        => ['type' => Type::string(), 'description' => ''],
                'deleted_at_fr'     => ['type' => Type::string(), 'description' => ''],
            ];
        }

    protected function resolveCreatedAtFrField($root, $args)
    {
        if (!isset($root['created_at']))
        {
            $created_at = $root->created_at;
        }
        else
        {
            $created_at = $root['created_at'];
        }
        if (!isset($created_at))
            return null;
        return Carbon::parse($created_at)->format('d/m/Y H:i:s');
    }

    protected function resolveUpdatedAtFrField($root, $args)
    {
        if (!isset($root['created_at']))
        {
            $date_at = $root->created_at;
        }
        else
        {
            $date_at = $root['created_at'];
        }
        if (!isset($date_at))
            return null;
        return Carbon::parse($date_at)->format('d/m/Y H:i:s');
    }

    protected function resolveDeletedAtFrField($root, $args)
    {
        if (isset($root['deleted_at']))
        {
            $date_at = $root->created_at;
        }
        else
        {
            $date_at = $root['deleted_at'];
        }
        if (!isset($date_at))
            return null;
        return Carbon::parse($date_at)->format('d/m/Y H:i:s');
    }
}

