<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\{Outil};
use App\Codification;
use App\CodificationRelecteur;
use Illuminate\Support\Facades\Auth;

use App\Exports\{UserExport, CodificationExport, R2aExport, UserConnectedExport};

use Excel;

class PdfExcelController extends SaveModelController
{
    // public function generate_excel_user($filters = null)
    // {
    //     ini_set('memory_limit', '-1');
    //     ini_set('max_execution_time', '-1');
        
    //     return Excel::download(new UserExport($filters), 'contacts_opco.xlsx');
    // }

    public function generate_excel_codification($filters = null)
    {
        ini_set('memory_limit', '-1');
        ini_set('max_execution_time', '-1');
  
        $codificaion_id = (int)filter_var($filters, FILTER_SANITIZE_NUMBER_INT);
        $designation    = Codification::where('id', $codificaion_id)->first()->designation_codification ; 
        
        return Excel::download(new CodificationExport($codificaion_id), $designation.'.xlsx');
    }

    public function generate_excel_r2a($filters = null)
    {
        ini_set('memory_limit', '-1');
        ini_set('max_execution_time', '-1');
  
        $r2a_id = (int)filter_var($filters, FILTER_SANITIZE_NUMBER_INT);
        $designation    = Codification::where('id', $r2a_id)->first()->designation_codification ; 
        return Excel::download(new R2aExport($r2a_id), $designation.'.xlsx');
    }


    public function generate_excel_userconnected($filters = null)
    {
        ini_set('memory_limit', '-1');
        ini_set('max_execution_time', '-1');
        
        return Excel::download(new UserConnectedExport($filters), 'contacts_connectes_opcoxlsx');
    }
}
