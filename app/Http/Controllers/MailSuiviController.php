<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\{Outil};
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;

class MailSuiviController extends SaveModelController
{
   
    public function recup_dataprod(Request $request)
    {
        ini_set('max_execution_time', 600);
        ini_set('memory_limit', -1);
        
        try
        {

            $params = array(
                'num'   => $request->num,
                'debut' => $request->debut,
                'fin'   => $request->fin,
            );
            $data = Outil::getDataIndicateurFromPython($params, "http://127.0.0.1:5000/api/v1/outilprod/");
           
            return response()->json($data);

        }
        catch (\Exception $e)
        {
            return Outil::getResponseError($e);
        }
    }

    public function envoyer_mail_suivi(Request $request)
    {
        ini_set('max_execution_time', 600);
        ini_set('memory_limit', -1);

        try
        {
            $data = Outil::getInfosForMailSuivi();
           
            return response()->json($data);
        }
        catch (\Exception $e)
        {
            return Outil::getResponseError($e);
        }
    }

}
