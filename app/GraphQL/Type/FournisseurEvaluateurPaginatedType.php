<?php

namespace App\GraphQL\Type;

use App\RefactoringItems\RefactGraphQLType;

use GraphQL\Type\Definition\Type;
use Rebing\GraphQL\Support\Type as GraphQLType;
use Rebing\GraphQL\Support\Facades\GraphQL;


class FournisseurEvaluateurPaginatedType extends RefactGraphQLType
{
    protected $attributes = [
        'name' => 'fournisseurevaluateurspaginated'
    ];

    public function fields(): array
    {
        return [
            'metadata' => [
                'type' => GraphQL::type('Metadata'),
                'resolve' => function ($root) {
                    return array_except($root->toArray(), ['data']);
                }
            ],
            'data' => [
                'type' => Type::listOf(GraphQL::type('FournisseurEvaluateur')),
                'resolve' => function ($root) {
                    return $root;
                }
            ]
        ];
    }
}
