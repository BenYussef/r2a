<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

//--DEBUT ==> Mes imports
use Barryvdh\DomPDF\Facade as PDF;
use Illuminate\Support\Facades\DB;
use App\{User, ExtractSfr, Outil};


use Illuminate\Support\Facades\File;
use Maatwebsite\Excel\Facades\Excel;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\Schema;
//--FIN ==> Mes imports

class ImportExtractSfrExcelFileJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * @var string
     */


    /**
     * @var string
     */
    private $pathFile;
    private $parent;

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
    public function __construct($parent, $userId, $pathFile)
    {
        $this->parent = $parent;
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
            $generateLink = "extractsfr";

            $this->user = User::find($this->userId);

            //$filename = $this->file;
            //$data = Excel::toArray(null, $filename);
            //$data = $data[0]; // 0 => à la feuille 1

            $data = Outil::csvToArray($this->pathFile);

            $report = array();

            $totalToUpload = count($data) - 1;
            $totalUpload = 0;

            $theParent = $this->parent;

            DB::transaction(function () use (&$totalToUpload, &$totalUpload, &$data, &$report, &$theParent)
            {
                $table = "extract_sfrs";
                $rowTitre = $data[0];  //1ère ligne (les titres)
                $nbreTitre = count($rowTitre); // Nbre de titres

                //Récupérer toutes les colonnes et les types de la BD
                $colEtTypes = Outil::donneColonnesEtTypes($table);

                //Parcours des lignes à partir de la 2ème
                for ($i=1; $i < count($data); $i++)
                {
                    $row = $data[$i];
                    //dd($row);
                    //Parcours des colonnes pour l'enregistement
                    $item = new ExtractSfr();
                    for ($j=0; $j < $nbreTitre; $j++)
                    {
                        $nomColonne = $rowTitre[$j];
                        $valeur = trim($row[$j]);
                        //Pour l'encodage du CSV en UTF8
                        $valeur = utf8_encode($valeur);
                        if($valeur == "")
                        {
                            $valeur = null;
                        }
                        
                        $typeColonne = Outil::donneTypeColonne($colEtTypes, $nomColonne);
                        if($typeColonne == "date" || $typeColonne == "datetime")
                        {
                            if(!empty($valeur))
                            {
                                if(is_numeric($valeur) == true)
                                {
                                    $valeur = Outil::dateExcelToNormalDate($valeur);
                                }
                                else
                                {
                                    $valeur = Outil::convertir_date_anglais($valeur);
                                }
                            }
                            if(Outil::isValideDate($valeur) == false)
                            {
                                $valeur = null;
                            }
                            
                        }
                        if($nomColonne == "MONTANT_TTC")
                        {
                            if(empty($valeur))
                            {
                                $valeur = 0;
                            }
                            $valeur = str_replace(",", ".", $valeur);
                        }
                        
                        $item->$nomColonne = $valeur;
                    }
                    //dd($item);
                    //Enregistrement dans la BD
                    $parent_id = $theParent->id;
                    $item->import_id = $parent_id;
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
            //echo($e);
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