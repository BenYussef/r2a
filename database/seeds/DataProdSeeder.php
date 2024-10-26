<?php

use Illuminate\Database\Seeder;

use App\Outil;

use League\Flysystem\Util\ContentListingFormatter;

class DataProdSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $values = array();
        array_push($values, array("list_id" => null));

        foreach ($values as $value) 
        {
            $item = \App\Preference::where('id', 1)->first();
            if (empty($item))
            {
                $item                           = new \App\Preference();
                $item->list_id                  = $value['list_id'];
                $item->save();
            }

        }
    }
}
