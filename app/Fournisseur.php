<?php

namespace App;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Fournisseur extends Model
{
    public $table = 'fournisseurs';

    public function fournisseur_evaluateurs()
    {
        return $this->hasMany(FournisseurEvaluateur::class, 'fournisseur_id');
    }
}
