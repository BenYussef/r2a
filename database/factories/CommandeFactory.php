<?php

/** @var \Illuminate\Database\Eloquent\Factory $factory */

use App\Commande;
use App\Commandeproduit;
use Faker\Generator as Faker;

$factory->define(Commande::class, function (Faker $faker) {
    return [
        'code' => $faker->numerify('CM-###'),
        'date' => date('Y-m-d'),
        'date_echeance' => date("Y-m-d", strtotime( date( 'Y-m-d' )." +15 days")),
        'etat' => $faker->numberBetween($min = 0, $max = 2),
        'from_site' => $faker->numberBetween($min = 0, $max = 1),
        'zone_livraison_prix' => $faker->numberBetween($min = 1000, $max = 15000),
        'client_id' => $faker->numberBetween($min = 1, $max = 4),
        'commercial_id' => $faker->numberBetween($min = 1, $max = 6),
        'zone_livraison_id' => $faker->numberBetween($min = 1, $max = 3),        
    ];
});

$factory->define(Commandeproduit::class, function (Faker $faker) {
    return [
        'prix' => $faker->numberBetween($min = 10, $max = 45000),
        'qte' => $faker->numberBetween($min = 1, $max = 100),
        'qte_recue' => 0,
        'produit_id' => $faker->numberBetween($min = 1, $max = 3),
    ];
});
