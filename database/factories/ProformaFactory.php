<?php

/** @var \Illuminate\Database\Eloquent\Factory $factory */

use App\Proforma;
use App\ProformaProduit;
use Faker\Generator as Faker;

$factory->define(Proforma::class, function (Faker $faker) {
    return [
        'code' => $faker->numerify('DE-###'),
        'designation' => $faker->lexify('Proforma ???????'),
        'date' => date('Y-m-d'),
        'date_echeance' => date("Y-m-d", strtotime( date( 'Y-m-d' )." +15 days")),
        'etat' => $faker->numberBetween($min = 0, $max = 2),
        'from_site' => $faker->numberBetween($min = 0, $max = 1),
        'zone_livraison_prix' => $faker->numberBetween($min = 1000, $max = 15000),
        'client_id' => $faker->numberBetween($min = 1, $max = 4),
        'commercial_id' => $faker->numberBetween($min = 1, $max = 6),
        'zone_livraison_id' => $faker->numberBetween($min = 1, $max = 3),   
        'condition_paiement_id' => $faker->numberBetween($min = 1, $max = 3),
        'mode_reglement_id' => $faker->numberBetween($min = 1, $max = 3),        
    ];
});

$factory->define(ProformaProduit::class, function (Faker $faker) {
    return [
        'prix' => $faker->numberBetween($min = 10, $max = 45000),
        'qte' => $faker->numberBetween($min = 1, $max = 100),
        'produit_id' => $faker->numberBetween($min = 1, $max = 3),
    ];
});
