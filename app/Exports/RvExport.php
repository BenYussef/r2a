<?php

namespace App\Exports;

use App\Outil;
use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromView;


class RvExport implements FromView
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

        $data  = Outil::getAllItemsWithGraphQl("rvs", $this->filter);

        $this->data = $data;
        return view('excels.excelrv', [
            'data' => $this->data,
        ]);
    }

    /**
     * @return \Illuminate\Support\Collection
     */
}
