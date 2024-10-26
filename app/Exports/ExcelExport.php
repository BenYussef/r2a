<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromView;


class ExcelExport implements FromView
{
    use Exportable;

    private $data;

    public function __construct()
    {

    }

    public function view(): View
    {
        $data = array('id' => '1', 'nom' => 'ndiaye', 'prenom' => 'thierno');
        $this->data = $data;
        return view('excels.testexcel', [
            'data' => $this->data,
        ]);
    }

    /**
     * @return \Illuminate\Support\Collection
     */
}
