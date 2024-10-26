<?php

namespace App\Exports;

use App\{Outil, CodificationRelecteur};
use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromView;


class R2aExport implements FromView
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
       
        $donneesCodier   = CodificationRelecteur::where('codification_id', $this->filter)->get();
        $donnees_generer = Outil::generateDonneesRelues($donneesCodier);
        $this->data      = json_decode($donnees_generer, true); 
        
        return view('excels.excelr2a', [
            'data' => $this->data,
        ]);
    }

    /**
     * @return \Illuminate\Support\Collection
     */
}
