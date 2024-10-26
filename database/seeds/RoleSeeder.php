<?php

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\User;
class RoleSeeder extends Seeder
{


    /**
     * Run the database seeds.
     *
     * @return void
     */

    public function run()
    {
        //Role admin
        $roleSuperAdmin = Role::where('name','admin')->first();
        if ($roleSuperAdmin==null)
        {
            $roleSuperAdmin = Role::create(['name' => 'admin']);
            $roleSuperAdmin->save();
        }

        $roleSuperAdmin->syncPermissions(Permission::all());
    }
}

