<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\DB;

use App\Outil;

use App\ConditionPaiement;
use App\ModeReglement;
use App\MetierProduit;
use App\Proforma;
use App\ProformaProduit;
use App\Commande;
use App\Commandeproduit;


class SuppressionController extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;


    public function conditionpaiement($id)
    {
        try {
            return DB::transaction(function () use ($id) {
                $errors = null;
                $data = 0;
                if (empty($id)) {
                    $errors = "Des données sont manquantes";
                } else {
                    //A modifier
                    $item = ConditionPaiement::with('proformas', 'commandes', 'clients')->find($id);
                    if (empty($item)) {
                        $errors = "L'élément que vous tentez de supprimer n'existe pas";
                    } else {
                        //A modifier
                        if (count($item->proformas) > 0 || count($item->commandes) > 0 || count($item->clients) > 0) {
                            $errors = "Cet élément est lié à des données, donc ne peut être supprimé";
                        } else {
                            $item->delete();
                            $item->forceDelete();
                            $data = 1;
                        }
                    }
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
