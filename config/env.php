<?php

return [

    /*
    |--------------------------------------------------------------------------
    | FICHIER DE CONFIGURATION DES VARIABLES D'ENVIRONNMENT
    |--------------------------------------------------------------------------
    |
    | Chaque fois qu'une variable est modifiée dans ce fichier, il faudra
    | faire à nouveau php artisan config:cache pour rendre la modification disponible.
    |
    */
    'APP_URL' => env('APP_URL', 'https://www.www.lavoixduclient.fr'),
    'FOLDER' => env('FOLDER', ''),
    'MSG_ERROR' => env('MSG_ERROR', 'Contactez votre administrateur'),
    'PERMISSION_TRANSACTION' => env('PERMISSION_TRANSACTION'),
    'PERMISSION_TRANSACTION2' => env('PERMISSION_TRANSACTION2'),
    'APP_ERROR_API' => env('APP_ERROR_API', false),
];
