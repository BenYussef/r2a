<?php

namespace App;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Periode extends Model
{
    use HasFactory;

    public function fournisseur() 
    {
        return $this->belongsTo(Fournisseur::class);
    }

    public function notes(){
        return $this->hasMany(Note::class);
    }
    public function envoies(){
        return $this->hasMany(Envoie::class);
    }
}
