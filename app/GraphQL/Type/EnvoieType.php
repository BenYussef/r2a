<?php

namespace App\GraphQL\Type;

use App\Code;
use App\RefactoringItems\RefactGraphQLType;


use App\Outil;
use Illuminate\Support\Carbon;
use GraphQL\Type\Definition\Type;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\URL;
use Psy\Util\Str;
use Rebing\GraphQL\Support\Type as GraphQLType;
use Rebing\GraphQL\Support\Facades\GraphQL;

class EnvoieType extends RefactGraphQLType
{
    protected $attributes = [
        'name' => 'Envoie',
        'description' => ''
    ];

    public function fields(): array
    {
        return
            [
                'id'                    => ['type' => Type::id(),     'description' => ''],
                'user_id'               => ['type' => Type::int(),     'description' => ''],
                'r2a_id'              => ['type' => Type::string(), 'description' => ''],
                'user'                  => ['type' => GraphQL::type('User')],
                'r2a'                 => ['type' => GraphQL::type('R2a')],
                'created_at'            => ['type' => Type::string(), 'description' => ''],
                'created_at_fr'         => ['type' => Type::string(), 'description' => ''],
                'updated_at'            => ['type' => Type::string(), 'description' => ''],
                'updated_at_fr'         => ['type' => Type::string(), 'description' => ''],
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



}

