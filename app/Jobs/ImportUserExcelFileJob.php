<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Barryvdh\DomPDF\Facade as PDF;
use Illuminate\Support\Facades\DB;
use App\{User, Outil};
use Illuminate\Support\Facades\File;
use Maatwebsite\Excel\Facades\Excel;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;


class ImportUserExcelFileJob implements ShouldQueue
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
                //Parcours des lignes à partir de la 2ème
                for ($i=1; $i < count($data); $i++)
                {
                    //Récupérer toute la ligne
                    $row = $data[$i];

                    $id_lvdc = utf8_encode(trim($row[0]));
                    $nom = utf8_encode(trim($row[1]));
                    $prenom = utf8_encode(trim($row[2]));
                    $email2 = utf8_encode(trim($row[3]));
                    $tel = utf8_encode(trim($row[4]));
                    $info1 = utf8_encode(trim($row[5]));
                   
                    if(!empty($id_lvdc) && !empty($nom) && !empty($prenom))
                    {
                        $item = User::where('id_lvdc', $id_lvdc)->first();

                        if(empty($item))
                        {
                            $item = new User();
                            $item->password_seen    = Outil::generer_password();
                            $item->password         = Hash::make($item->password_seen);
                        }

                        $item->id_lvdc              = $id_lvdc;
                        $item->nom                  = $nom;
                        $item->prenom               = $prenom;
                        $item->email2               = !empty($email2) ? $email2 : null;
                        $item->tel                  = !empty($tel) ? $tel : null;
                        $item->info1                = !empty($info1) ? $info1 : null;
                        
                        $item->save();

                        //Assignation role
                        $role = Role::where('name', "admin")->first();
                        $item->syncRoles($role);

                        //Matricule identifiant
                        Outil::donneLoginUser($item);
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