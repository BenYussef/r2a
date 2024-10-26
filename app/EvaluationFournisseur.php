<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class EvaluationFournisseur extends Model
{
    public $table = 'evaluation_fournisseurs';

    public function fournisseur()
    {
        return $this->belongsTo(Fournisseur::class,'fournisseur_id');
    }

    public function periode()
    {
        return $this->belongsTo(Periode::class,'periode_id');
    }

    // public function evaluateur()
    // {
    //     return $this->belongsTo(user::class);
    // }

}
