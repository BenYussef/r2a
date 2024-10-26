<?php

use Illuminate\Database\Seeder;

use App\Outil;

class DataTestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
       //*******Tests
       $values = array();
       array_push($values, array("code" => "T001"));
       foreach ($values as $value) 
       {
           $item = \App\Test::where('code', $value['code'])->first();
           if (empty($item))
           {
               $item                    = new \App\Test();
           }
           $item->code            = $value['code'];
           $item->save();
       }
        
    }
}
