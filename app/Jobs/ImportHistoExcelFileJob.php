<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Barryvdh\DomPDF\Facade as PDF;
use Illuminate\Support\Facades\DB;
use App\{User, Histo, Outil};
use Illuminate\Support\Facades\File;
use Maatwebsite\Excel\Facades\Excel;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;


class ImportHistoExcelFileJob implements ShouldQueue
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
                $itemsToDelete = Histo::where("id", ">", 0);
                $itemsToDelete->delete();
                $itemsToDelete->forceDelete();

                //Parcours des lignes à partir de la 2ème
                for ($i=1; $i < count($data); $i++)
                {
                    //Récupérer toute la ligne
                    $row = $data[$i];

                    $id_lvdc        = utf8_encode(trim($row[0]));
                    $id_histo       = utf8_encode(trim($row[1]));
                    $tel_histo      = utf8_encode(trim($row[2]));
                    $date_prepa     = utf8_encode(trim($row[3]));
                    $autorisation   = utf8_encode(trim($row[4]));
                    $date_t         = utf8_encode(trim($row[5]));

                    $date_prepa = Outil::donneDateFormatEnglish($date_prepa); //date en anglais
                    $date_t = Outil::donneDateFormatEnglish($date_t, true); //date en anglais
 
                    if((!empty($tel_histo)) && is_numeric($tel_histo) && (!empty($date_prepa)))
                    {
                        $item = new Histo();
                        $item->id_lvdc          = !empty($id_lvdc) ? $id_lvdc : null;
                        $item->id_histo         = !empty($id_histo) ? $id_histo : null;
                        $item->tel_histo        = intval($tel_histo);
                        $item->date_prepa       = $date_prepa;
                        $item->autorisation     = !empty($autorisation) ? $autorisation : null;
                        $item->date_t           = !empty($date_t) ? $date_t : null;
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
