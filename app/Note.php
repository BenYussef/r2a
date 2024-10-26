<?php

namespace App;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Note extends Model
{
    use HasFactory;

    public function fournisseur() 
    {
        return $this->belongsTo(Fournisseur::class);
    }
    
}
