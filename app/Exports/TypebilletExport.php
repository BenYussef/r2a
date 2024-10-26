<?php

namespace App\Exports;

use App\Client;
use App\Commande;
use App\Outil;
use App\Produit;
use App\QueryModel;
use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromView;


class TypebilletExport implements FromView
{
    use Exportable;

    private $data;

    public function __construct($filter = null)
    {
      $this->filter = $filter;
    }

    public function view(): View
    {
        $args = null;

        $data  = Outil::getAllItemsWithGraphQl("typebillets", $this->filter);

        $this->data = $data;
        return view('excels.exceltypebillet', [
            'data' => $this->data,
        ]);
    }

    /**
     * @return \Illuminate\Support\Collection
     */
}
