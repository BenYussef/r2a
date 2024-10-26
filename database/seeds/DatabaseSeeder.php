<?php

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        $this->call([
             DataTestSeeder::class,
             DataProdSeeder::class,
             PermissionTableSeeder::class,
             RoleSeeder::class,
             UserSeeder::class,
        ]);
    }
}
