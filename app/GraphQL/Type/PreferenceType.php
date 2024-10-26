<?php

namespace App\GraphQL\Type;

use App\RefactoringItems\RefactGraphQLType;


use App\Outil;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use GraphQL\Type\Definition\Type;
use Rebing\GraphQL\Support\Facades\GraphQL;
use Rebing\GraphQL\Support\Type as GraphQLType;

class PreferenceType extends RefactGraphQLType
{

    protected $attributes = [
        'name' => 'Preference',
        'description' => ''
    ];

    public function fields(): array
    {
        return
            [
                'id'                         => ['type' => Type::int()],
                'list_id'                    => ['type' => Type::int()],
                'delais_notification'        => ['type' => Type::int()],
                'nbre_entreprise_par_jour' => ['type' => Type::int()],
                'emails_a_notifier'          => ['type' => Type::string()],
                'couleur_codif'              => ['type' => Type::string()],
                'couleur_relec'              => ['type' => Type::string()],

                'created_at'              => ['type' => Type::string(), 'description' => ''],
                'updated_at'              => ['type' => Type::string(), 'description' => ''],
            ];
    }

}
