<?php

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class PermissionTableSeeder extends Seeder
{
    /**
     * Run the database seeders.
     *
     * @return void
     */
    public function run()
    {
        /**
         * Permissions des pages
         */
        $permissionItems  = [
            "user",
        ];

        $permissionTypes = [
            ['name' => 'list-',         'display' => 'Voir la liste '],
            ['name' => 'creation-',     'display' => 'Creation '],
            ['name' => 'modification-',  'display' => 'Modification '],
            ['name' => 'suppression-',  'display' => 'Suppression '],
            ['name' => 'detail-',       'display' => 'detail '],
        ];
               
        foreach ($permissionItems as $permissionItem)
        {
            foreach ($permissionTypes as $permissionType)
            {
                Permission::firstOrCreate([
                    'name' => $permissionType['name'] . $permissionItem
                ], [
                    'display_name' => $permissionType['display'] . $permissionItem
                ]);
            }
        }

        //Permissions spéciales
        $permissions = [
            array("name" => "desactiver-user" ,"display" => "Désactiver un utilisateur"),
        ];

        foreach ($permissions as $permission)
        {
            Permission::firstOrCreate([
                'name' => $permission['name']
            ], [
                'display_name' => $permission['display']
            ]);
        }

    }   

}