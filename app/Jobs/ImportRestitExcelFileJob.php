<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Barryvdh\DomPDF\Facade as PDF;
use Illuminate\Support\Facades\DB;
use App\{User, Restit, Outil};
use Illuminate\Support\Facades\File;
use Maatwebsite\Excel\Facades\Excel;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;


class ImportRestitExcelFileJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * @var string
     */


    /**
     * @var string
     */
    private $pathFile;

    /**
     * @var User
     */
    private $userId;
    private $user;
    

       /**
     * The number of seconds the job can run before timing out.
     *
     * @var int
     */
    public $timeout = 3600; //Pour une heure

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($userId, $pathFile)
    {
        $this->userId = $userId;
        $this->pathFile = $pathFile;
    }

    /**
     * Execute the job.
     *
     * @return void
     */

    public function handle()
    {
        ini_set('memory_limit', '-1');
        ini_set('max_execution_time', '-1');

        try
        {
            $generateLink = "url";

            $this->user = User::find($this->userId);

            //$filename = $this->file;
            //$data = Excel::toArray(null, $filename);
            //$data = $data[0]; // 0 => à la feuille 1

            $data = Outil::csvToArray($this->pathFile);

            $report = array();

            $totalToUpload = count($data) - 1;
            $totalUpload = 0;

            DB::transaction(function () use (&$totalToUpload, &$totalUpload, &$data, &$report)
            {
                $itemsToDelete = Restit::where("id", ">", 0);
                $itemsToDelete->delete();
                $itemsToDelete->forceDelete();

                //Parcours des lignes à partir de la 2ème
                for ($i=1; $i < count($data); $i++)
                {
                    //Récupérer toute la ligne
                    $row = $data[$i];

                    $contact_id                 = utf8_encode(trim($row[0]));
                    $tel_restit                 = utf8_encode(trim($row[1]));
                    $autorisation               = utf8_encode(trim($row[2]));
                    $date_evenement             = utf8_encode(trim($row[3]));
                    $id_restit                  = utf8_encode(trim($row[4]));
                    $id_lvdc_restit             = utf8_encode(trim($row[5]));
                    $semaine_prepa              = utf8_encode(trim($row[6]));
                    $traitement                 = utf8_encode(trim($row[7]));
                    $activite                   = utf8_encode(trim($row[8]));
                    $choix_client               = utf8_encode(trim($row[9]));
                    $choix_client_rec           = utf8_encode(trim($row[10]));
                    $nom_service                = utf8_encode(trim($row[11]));
                    $typologie_client           = utf8_encode(trim($row[12]));
                    $codification_appel         = utf8_encode(trim($row[13]));

 
                    if((!empty($id_lvdc_restit)))
                    {
                        $item = new Restit();
                        $item->contact_id               = $contact_id;
                        $item->autorisation             = $autorisation;
                        $item->date_evenement           = $date_evenement;
                        $item->id_restit                = $id_restit;
                        $item->id_lvdc_restit           = $id_lvdc_restit;
                        $item->semaine_prepa            = $semaine_prepa;
                        $item->traitement               = $traitement;
                        $item->activite                 = $activite;
                        $item->choix_client             = $choix_client;
                        $item->choix_client_rec         = $choix_client_rec;
                        $item->nom_service              = $nom_service;
                        $item->typologie_client         = $typologie_client;
                        $item->codification_appel       = $codification_appel;

                        $item->save();
                    }
                }
            });


            // SUPPRESSION DU FICHIER
            File::delete($this->pathFile);
            //******Mes tests ici*******

        }
        catch (\Exception $e)
        {
            //Commenté pour sauter les erreurs
           //dd($e);
            try
            {
                File::delete($this->pathFile);
            }
            catch (\Exception $eFile) {};
            //Commenté pour sauter les erreurs
            throw new \Exception($e);
        }
    }
}
