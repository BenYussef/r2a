<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Connexion extends Model
{
    public $table = 'connexions';

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
