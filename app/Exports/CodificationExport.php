<?php

namespace App\Exports;

use App\{Codification, Outil, CodificationRelecteur};
use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromView;


class CodificationExport implements FromView
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
        // Recuperation du r2a_id au niveau de la table Codification, pour faire l'export à partir des données relues si existe
        // $r2a_id    = Codification::where('id', $this->filter)->select('r2a_id')->first()->r2a_id ; 
       
        $donneesCodier   = CodificationRelecteur::select('donnees')->where('codification_id', $this->filter)->get();
        $donnees_generer = Outil::generateDonneesCodifier($donneesCodier, $this->filter ); 
        // dd("ICi ARRAY",$donnees_generer);
      
        $this->data      = $donnees_generer; 
        
        
        return view('excels.excelcodification', [
            'data' => $this->data,
        ]);
    }

    /**
     * @return \Illuminate\Support\Collection
     */
}
