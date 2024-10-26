<?php

namespace App\Http\Controllers;

use App\Jobs\ImportRoleFileJob;
use Illuminate\Http\Request;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\DB;
use App\Outil;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;


class RoleController extends SaveModelController
{
    //extends BaseController

    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;

    protected $queryName = "roles";
    protected $model = Role::class;
    protected $job = ImportRoleFileJob::class;


    public function save(Request $request)
    {
        try {
            return DB::transaction(function () use ($request) {
                $errors = null;

                $role = new Role();
                if (!empty($request->id)) {
                    $role = Role::with('users')->find($request->id);

                    if ($role->name != $request->name) {
                        if ($role->users > 0) {
                            $errors = "Ce profil est déjà lié à des utilisateurs, vous ne pouvez pas le modifier";
                        }
                    }
                }
                $role->name = $request->name;
                if (!Outil::isUnique(['name'], [$request->name], $request->id, Role::class)) {
                    $errors = "Le nom de ce profil existe déja";
                }

                //$role_permissions = Input::get('permissions');
                $role_permissions = $request->permissions;
                if (isset($role_permissions)) {
                    try {
                        $role_permissions = explode(',', $role_permissions);
                    } catch (\Exception $e) {
                        $role_permissions = (!empty($role_permissions)) ? array($role_permissions) : array();
                    }
                }

                try {
                    if (!isset($errors) && $role->save()) {
                        $id = $role->id;
                        $role->syncPermissions($role_permissions);
                        return Outil::redirectgraphql($this->queryName, "id:{$id}", Outil::$queries[$this->queryName]);
                    }
                    return response()->json(['errors' => $errors]);
                } catch (\Exception $e) {
                    return Outil::getResponseError($e);
                }
            });
        } catch (\Exception $e) {
            return outil::getResponseError($e);
        }
    }


    public function deleteOld($id)
    {
        try {
            return DB::transaction(function () use ($id) {
                $errors = null;
                $data = 0;

                if ($id) {
                    $role = Role::find($id);
                    if ($role != null) {
                        if (count($role->users) > 0) {
                            $data = 0;
                            $errors = "Ce profil est déjà lié à des utilisateurs";
                        } else {
                            $role->delete();
                            $data = 1;
                        }
                    } else {
                        $data = 0;
                        $errors = "Profil inexistant";
                    }
                } else {
                    $errors = "Données manquantes";
                }

                if (isset($errors)) {
                    throw new \Exception($errors);
                } else {
                    $retour = array(
                        'data' => $data,
                    );
                }
                return response()->json($retour);
            });
        } catch (\Exception $e) {
            return Outil::getResponseError($e);
        }
    }
}
