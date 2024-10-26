<?php

use App\Outil;
use Illuminate\Database\Seeder;
use App\User;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\DB;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $users = array();
        array_push($users,array("name" => "Administrateur", "email" => "root@root.com", "image" =>  ('assets/images/upload.jpg'), "password" => "rootr2a006", "role" => "admin"));
        array_push($users,array("name" => "Coulibaly", "email" => "amadouldd@gmail.com", "image" =>  ('assets/images/upload.jpg'), "password" => "r2a006", "role" => "admin"));

        foreach ($users as $user)
        {
            $newuser = User::withTrashed()->where('email', $user['email'])->first();
            if (empty($newuser))
            {
                $newuser = new User();
            }
            $newuser->password      = bcrypt($user['password']);
            $newuser->name          = $user['name'];
            $newuser->email         = $user['email'];
            $newuser->image         = $user['image'];
            $newuser->is_admin      = 1;

            if (empty($newuser->id))
            {
                $newuser->password = bcrypt($user['password']);
            }
            $newuser->save();

            if (!isset($newuser->id))
            {
                $newuser->id = DB::select('SELECT id FROM users ORDER BY id DESC LIMIT 1')[0]->id;
            }
            $role = Role::where('name', $user['role'])->first();
            $newuser->syncRoles($role);
        }
    }
}
