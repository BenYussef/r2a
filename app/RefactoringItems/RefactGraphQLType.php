<?php

namespace App\RefactoringItems;

use App\BceProduit;
use App\Bci;
use App\Bciproduit;
use App\Carte;
use App\Commande;
use App\Entite;
use App\Outil;
use App\Produit;
use App\TypePrixDeVente;
use Carbon\Carbon;
use GraphQL\Type\Definition\Type;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Rebing\GraphQL\Support\Facades\GraphQL;
use Rebing\GraphQL\Support\Type as GraphQLType;

abstract class RefactGraphQLType extends GraphQLType
{
    protected $model;

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
                'type' => Type::listOf(GraphQL::type($this->model)),
                'resolve' => function ($root) {
                    return $root;
                }
            ]
        ];
    }

    protected function resolveActionBadgeField($root, $args)
    {
        $retour = null;
        if(isset($root["action"])){
            $itemArray = array("etat" => $root['action']);
            $retour = Outil::donneEtatGeneral("commande_produit", $itemArray)['badge'];
            if (empty($retour)) {
                $retour = "";
            }
        }

        return $retour;
    }

    protected function resolveActionTextField($root, $args)
    {
        $retour = null;
        if(isset($root["action"])) {
            $itemArray = array("etat" => $root['action']);
            $retour = Outil::donneEtatGeneral("commande_produit", $itemArray)['texte'];
            if (empty($retour)) {
                $retour = "";
            }
        }
        return $retour;
    }

    protected function resolveDateFrField($root, $args)
    {
        $date_at = $root['date'];
        $date_at = $date_at;
        $date_at = date_create($date_at);
        return date_format($date_at, "d-m-Y");
    }

    protected function resolveDateEnField($root, $args)
    {
        return $this->resolveAllDate($root['date']);
    }

    protected function resolveDateDebutPromoField($root, $args)
    {
        return $this->resolveAllDate($root['date_debut_promo']);
    }

    protected function resolveDateDebutMenuField($root, $args)
    {
        return $this->resolveAllDate($root['date_debut_menu']);
    }

    protected function resolveDateFinPromoField($root, $args)
    {
        return $this->resolveAllDate($root['date_fin_promo']);
    }

    protected function resolveDateFinMenuField($root, $args)
    {
        return $this->resolveAllDate($root['date_fin_menu']);
    }

    protected function resolveDateOperationField($root, $args)
    {
        return $this->resolveAllDateFR($root['date_operation']);
    }
    protected function resolveDateOperationModifField($root, $args)
    {
        return $this->resolveAllDate($root['date_operation']);
    }

    protected function resolveDateDebutField($root, $args)
    {
        return $this->resolveAllDate($root['date_debut']);
    }

    protected function resolveDateFinField($root, $args)
    {
        return $this->resolveAllDate($root['date_fin']);
    }

    protected function resolveDateDebutFrField($root, $args)
    {
        return $this->resolveAllDateFR($root['date_debut']);
    }

    protected function resolveDateDebutMenuFrField($root, $args)
    {
        return $this->resolveAllDateFR($root['date_debut_menu']);
    }

    protected function resolveDateDebutEvenementFrField($root, $args)
    {
        return $this->resolveAllDateCompletFR($root['date_debut_evenement']);
    }

    protected function resolveDateDebutEvenementModifField($root, $args)
    {
        return $this->resolveAllDateCompletModif($root['date_debut_evenement']);
    }

    protected function resolveDateDebutFinFrField($root, $args)
    {
        return $this->resolveAllDateFR($root['date_debut_fin']);
    }

    protected function resolveDateDebutFinModifField($root, $args)
    {
        return $this->resolveAllDate($root['date_debut_fin']);
    }

    protected function resolveDateFinFrField($root, $args)
    {
        return $this->resolveAllDateFR($root['date_fin']);
    }

    protected function resolveDateFinMenuFrField($root, $args)
    {
        return $this->resolveAllDateFR($root['date_fin_menu']);
    }

    protected function resolveAllDate($date)
    {
        $date_at = $date;
        if ($date_at !== null) {
            $date_at = $date_at;
            $date_at = date_create($date_at);
            return date_format($date_at, "Y-m-d");
        } else {
            return null;
        }
    }

    protected function resolveLigneProduitsField($root, $date)
    {
        return count($root['bciproduits']);
    }

    protected function resolveAllDateFR($date)
    {
        $date_at = $date;
        if ($date_at !== null) {
            $date_at = $date_at;
            $date_at = date_create($date_at);
            return date_format($date_at, "d-m-Y");
        } else {
            return null;
        }
    }

    protected function resolveAllDateCompletFR($date, $is_hour = true)
    {
        $date_at = $date;
        if ($date_at !== null) {
            $date_at = $date_at;
            $date_at = date_create($date_at);

            return date_format($date_at, $is_hour ? "d-m-Y H:i:s" :  "d-m-Y" );
        } else {
            return null;
        }
    }


    protected function resolveAllDateCompletModif($date)
    {
        $date_at = $date;
        if ($date_at !== null) {
            $date_init = date_create($date_at);
            $date_at = date_format($date_init, "Y-m-d");
            $date_at2 = date_format($date_init, "H:i:s");
            $date_at .= "T" . $date_at2;
            return $date_at;
        } else {
            return null;
        }
    }

//    protected function resolveCreatedAtFrield($root, $args)
//    {
//        $date_at = $root['created_at'];
//        $date_at = isset($date_at) && is_string($date_at) ? $date_at : $date_at->format(Outil::formatDate());
//        return $date_at;
//    }

    protected function resolveCreatedAtFrField($root, $args)
    {

        return $this->resolveAllDate($root['created_at']);
    }

    protected function resolveUpdatedAtFrield($root, $args)
    {
        $date_at = $root['updated_at'];
        $date_at = isset($date_at) && is_string($date_at) ? $date_at : $date_at->format(Outil::formatDate());
        return $date_at;
    }

    protected function resolveUpdatedAtFrField($root, $args)
    {
        $date_at = $root['updated_at'];
        $date_at = isset($date_at) && is_string($date_at) ? $date_at : $date_at->format(Outil::formatDate(true));
        return $date_at;
    }

    protected function resolveDeletedAtField($root, $args)
    {
        $date_at = $root['deleted_at'];
        $date_at = isset($date_at) && is_string($date_at) ? $date_at : $date_at->format(Outil::formatDate());
        return $date_at;
    }

    protected function resolveDeletedAtFrField($root, $args)
    {
        $date_at = $root['deleted_at'];
        $date_at = isset($date_at) && is_string($date_at) ? $date_at : $date_at->format(Outil::formatDate(true));
        return $date_at;
    }

    protected function resolveEntitesField($root, $args)
    {
        $etat_bci = 1;
        $bce_id = null;
        $groupeBy = 'entites.id';
        if (config('global.etat_bci') != '') {
            $etat_bci = config('global.etat_bci');
        }
        if (config('global.bce_id') != '') {
            $bce_id = config('global.bce_id');
        }

        $query = DB::table('entites')
            ->join('bcis', 'bcis.entite_id', '=', 'entites.id')
            ->join('bci_produits', 'bci_produits.bci_id', '=', 'bcis.id');


        $query = Outil::filterBciToValid('entites', $query, $etat_bci, $root['id']);

        if ($bce_id !== null && $etat_bci > 1) {
            $query->join('bce_produits', 'bce_produits.id', '=', 'bci_produits.bce_produit_id')
                ->join('bces', 'bces.id', '=', 'bce_produits.bce_id')
                ->join('bce_produit_entites', 'bce_produit_entites.id', '=', 'bci_produits.bce_produit_entite_id')
                ->where('bces.id', $bce_id);

            $query = $query
                ->selectRaw('entites.*, bce_produit_entites.quantite_finale as quantite_total_final, bce_produit_entites.quantite as quantite_total_initial');
            $groupeBy = ['entites.id', 'bce_produit_entites.id'];
        }

        $query = $query->groupBy($groupeBy)
            ->get();
        return $query;
    }

    protected function resolveUserEntitesField($root, $args)
    {
        $query = DB::table('entites')
            ->join('user_entites', 'user_entites.entite_id', '=', 'entites.id')
            ->join('users', 'users.id', '=', 'user_entites.user_id')
            ->where('users.id', $root['id'])
            ->get();
        return $query;
    }


    /*protected function resolvePrixdeventeField($root, $args)
    {
        $type_prix_vent = TypePrixDeVente::where('designation', 'PV market')->first();

        $query = DB::table('prix_de_ventes')
                    ->join('produits','produits.id','=','prix_de_ventes.produit_id')
                    ->join('type_prix_de_ventes','type_prix_de_ventes.id','=','prix_de_ventes.type_prix_de_vente_id')

                    ->where('type_prix_de_ventes.id', $type_prix_vent->id)
                    ->where('produits.id', $root['id'])
            ->get();
        return $query;
    }*/

    /*protected function resolveCarteproduitsField($root, $args)
    {

        $query = DB::table('produits')
            ->join('carte_produits', 'carte_produits.produit_id', '=', "produits.id")
            ->join('cartes', 'cartes.id', '=', 'carte_produits.carte_id')
            ->where('cartes.id', $root['id'])
            ->selectRaw('produits.*')
            ->get();

        return $query;
    }*/


    protected function resolveTrancheHorairesField($root, $args)
    {
        $query = DB::table('tranche_horaires')
            ->join('menu_tranche_horaires', 'menu_tranche_horaires.tranche_horaire_id', '=', 'tranche_horaires.id')
            ->join('menus', 'menus.id', '=', 'menu_tranche_horaires.menu_id')
            ->where('menus.id', $root['id'])
            ->selectRaw('tranche_horaires.*, menu_tranche_horaires.montant as montant')
            ->get();
        return $query;
    }

    protected function resolveFamillesField($root, $args)
    {
        $query = DB::table('familles')
            ->join('famille_liaison_produits', 'famille_liaison_produits.famille_id', '=', 'familles.id')
            ->where('famille_liaison_produits.produit_id', $root['id'])
            ->selectRaw('familles.*')
            ->groupBy(['familles.id'])
            ->orderBy('familles.id')
            ->get();
        return $query;
    }

    protected function resolveProduitsField($root, $args)
    {
        $query = DB::table('produits')
            ->join('famille_produits', 'famille_produits.produit_id', '=', 'produits.id')
            ->join('famille_liaison_produits', 'famille_liaison_produits.id', '=', 'famille_produits.famille_liaison_produit_id')
            ->where('famille_liaison_produits.produit_id', $root['id'])
            ->selectRaw('produits.*, famille_produits.quantite as quantite, famille_liaison_produits.famille_id as option_menu')
            ->get();
        return $query;
    }

    protected function resolveQuantiteGratuiteField($root, $args)
    {
        if (isset($fmp['famille_id'])) {

        }
        return 7;
    }

    protected function resolveDetailsProduitsField($root, $args)
    {
        $carte = null;
        $entite = null;
        $famille = null;
        $montant_carte = "";

        if (config('global.is_carte') != '') {
            //$carte = config('global.is_carte');
        }
        if (config('global.entite_id') != '') {
            $entite = config('global.entite_id');
            $carte = Carte::where('entite_id', $entite)->where('activer', 1)->first();
        }
        if (config('global.famille_id') != '') {
            $famille = config('global.famille_id');
        }

        $query = DB::table('produits')
            ->join('familles', 'familles.id', '=', 'produits.famille_id')
            ->where('familles.id', $root['famille_id']);

        if (!isset($carte) || !isset($carte->id)) {

            if (config('global.commande_id') != '') {
               $commande_id = config('global.commande_id');
               $carte = DB::table('cartes')
                   ->join('entites', 'entites.id', '=', 'cartes.entite_id')
                   ->join('commandes', 'commandes.entite_id', '=', 'entites.id')
                   ->where('commandes.id', $commande_id)
                   ->selectRaw('cartes.*')->first();
            }
        }
        $montant_carte = ",prix_de_ventes.montant as montant";
        $query
            ->join('prix_de_ventes', 'prix_de_ventes.produit_id', '=', 'produits.id')
            ->join('type_prix_de_ventes', 'type_prix_de_ventes.id', '=', 'prix_de_ventes.type_prix_de_vente_id');
        if(isset($carte->type_prix_vente_id)){
            $query->where('type_prix_de_ventes.id', $carte->type_prix_vente_id);
        }

        $query->selectRaw('produits.*' . $montant_carte);
        return $query->get();
        /*$produits = null;
        if(isset($root['famille_id'])){
          $produits = Produit::where('famille_id', $root['famille_id'])->get();
        }*/

        // return $produits;
    }


    /*protected function resolveBceProduitsField($root, $args)
    {
        $query = [];
        foreach ($root['bce_produits'] as $key => $bceproduit)
        {
            if($bceproduit['etat'] == true){
                array_push($query, $bceproduit);
            }

        }

        return $query;
    }*/


    public function resolveMontantTotalNumericField($root, $args)
    {
        return $root['montant_total'];

    }

    public function resolveMontantTotalFormatField($root, $args)
    {
        return Outil::formatPrixToMonetaire($root['montant_total'], true);
    }

    public function resolveImageField($root, $args)
    {
        return Outil::resolveImageField($root['image']);
    }

    public function resolveImage1Field($root, $args)
    {
        return Outil::resolveImageField($root['image1']);
    }

    public function resolveImage2Field($root, $args)
    {
        return Outil::resolveImageField($root['image2']);
    }

    public function resolveImage3Field($root, $args)
    {
        return Outil::resolveImageField($root['image3']);
    }

    public function resolveImage4Field($root, $args)
    {
        return Outil::resolveImageField($root['image4']);
    }

    public function resolvePrixFrField($root, $args)
    {
        return Outil::formatWithThousandSeparator($root['prix']);
    }

    public function resolveMontantFrField($root, $args)
    {
        return Outil::formatWithThousandSeparator($root['montant']);
    }

    public function resolveTotalFrField($root, $args)
    {
        return Outil::formatWithThousandSeparator($root['total']);
    }
}
