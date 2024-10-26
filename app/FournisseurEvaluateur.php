<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class FournisseurEvaluateur extends Model
{
    public $table = 'fournisseur_evaluateurs';

    // public function fournisseur()
    // {
    //     return $this->belongsTo(Fournisseur::class);
    // }

    public function evaluateur()
    {
        return $this->belongsTo(user::class);
    }

}
