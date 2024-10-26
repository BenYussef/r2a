<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Code extends Model
{
    public $table = 'codes';

    public function plan_code()
    {
        return $this->belongsTo(PlanCode::class);
    }
}
