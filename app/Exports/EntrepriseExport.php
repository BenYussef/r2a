<?php

namespace App\Exports;

use App\Outil;
use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromView;


class EntrepriseExport implements FromView
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

        //dd($this->filter);

        $data  = Outil::getAllItemsWithGraphQl("entreprises", $this->filter);

        $this->data = $data;
        return view('excels.excelentreprise', [
            'data' => $this->data,
        ]);
    }

    /**
     * @return \Illuminate\Support\Collection
     */
}
