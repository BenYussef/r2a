<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Barryvdh\DomPDF\Facade as PDF;
use Illuminate\Support\Facades\DB;
use App\{User, Qualicontact, Outil};
use Illuminate\Support\Facades\File;
use Maatwebsite\Excel\Facades\Excel;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;


class ImportQualicontactExcelFileJob implements ShouldQueue
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
                $itemsToDelete = Qualicontact::where("id", ">", 0);
                $itemsToDelete->delete();
                $itemsToDelete->forceDelete();

                //Parcours des lignes à partir de la 2ème
                for ($i=1; $i < count($data); $i++)
                {
                    //Récupérer toute la ligne
                    $row = $data[$i];

                    $date_heure     = utf8_encode(trim($row[0]));
                    $tel            = utf8_encode(trim($row[1]));

                    $date_heure = Outil::donneDateFormatEnglish($date_heure, true); //date en anglais
                    $tel = Outil::formatTelToFr($tel); //Supprimer 0 et Ajouter 33
                   
                    $item = new Qualicontact();
                    $item->date_heure   = $date_heure;
                    $item->tel          = $tel;
                    $item->save();
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
