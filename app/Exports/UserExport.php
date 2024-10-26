<?php

namespace App\Exports;

use App\Outil;
use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromView;


class UserExport implements FromView
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

        $data  = Outil::getAllItemsWithGraphQl("users", $this->filter);

        $this->data = $data;
        return view('excels.exceluser', [
            'data' => $this->data,
        ]);
    }

    /**
     * @return \Illuminate\Support\Collection
     */
}
