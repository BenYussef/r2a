<?php
 namespace App\Traits;

use App\Conditionreglement;
use App\Depot;
use App\DetailDemandeDevisBonCommande;
use App\DetailReassort;
use App\Employe;
use App\Fournisseur;
use App\Models\{DetailR2aDePaie, R2aDePaie, MotifDePrime, Regule, TypeRegule};
use App\TypeContrat;

trait ModelRelationTraites
{
    
    public function motif_de_prime()
    {
        return $this->belongsTo(MotifDePrime::class);
    }
    public function depot_expediteur()
    {
        return $this->belongsTo(depot::class,'depot_expediteur_id');
    }
    public function depot_destinataire()
    {
        return $this->belongsTo(depot::class,'depot_destinataire_id');
    }
    public function fournisseur()
    {
        return $this->belongsTo(Fournisseur::class);
    }
    public function condition_reglement()
    {
        return $this->belongsTo(Conditionreglement::class);
    }
    public function devise()
    {
        return $this->belongsTo(Devise::class);
    }
    public function produits()
    {
        return $this->belongsTo(Produit::class);
    }
    public function depense()
    {
        return $this->belongsTo(Depense::class);
    }
    public function depot()
    {
        return $this->belongsTo(Depot::class);
    }
    public function type_contrat()
    {
        return $this->belongsTo(TypeContrat::class);
    }
    public function employe()
    {
        return $this->belongsTo(Employe::class);
    }
    public function r2a_de_paie()
    {
        return $this->belongsTo(R2aDePaie::class);
    }
    public function type_regule()
    {
        return $this->belongsTo(TypeRegule::class);
    }
    public function regules()
    {
        return $this->hasMany(Regule::class);
    }
    public function detail_r2a_de_paies()
    {
        return $this->hasMany(DetailR2aDePaie::class);
    }

    public function detail_demande_devis_bon_commandes()
    {
        return $this->hasMany(DetailDemandeDevisBonCommande::class);
    }
    public function detail_reassort()
    {
        return $this->hasMany(DetailReassort::class);
    }


}
