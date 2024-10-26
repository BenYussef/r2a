<?php

namespace App\Exports;

use App\{Outil, Histo, Qualicontact};
use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromView;


class HistoExport implements FromView
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

        //Téléphones dans Histo et appartenant au fichier 23/06
        $ids = Histo::whereNotNull('date_prepa')->where('date_prepa', '2022-06-23')->whereIn('tel_histo', Qualicontact::whereNotNull('tel')->get(['tel']))->get(['id']);
        //Téléphones par appartenant à 23/06
        $data = Histo::whereNotIn('id', $ids)->get();

        $this->data = $data;
        return view('excels.histotelok', [
            'data' => $this->data,
        ]);
    }

    /**
     * @return \Illuminate\Support\Collection
     */
}
