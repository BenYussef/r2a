<?php

namespace App\Exports;

use App\{Outil, Restit, Qualicontact};
use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromView;


class RestitExport implements FromView
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

        $data = Restit::whereNotNull('id_lvdc_restit')->get();

        $this->data = $data;
        return view('excels.excelrestit', [
            'data' => $this->data,
        ]);
    }

    /**
     * @return \Illuminate\Support\Collection
     */
}
