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

class ImportExtractSfrOldExcelFileJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * @var string
     */
    private $file;


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
    public function __construct(string $file, $userId, $pathFile)
    {
        $this->file = $file;
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


            $filename = $this->file;
            $data = Excel::toArray(null, $filename);
            $data = $data[0]; // 0 => à la feuille 1

            $report = array();

            $totalToUpload = count($data) - 1;
            $totalUpload = 0;

            //******Mes tests ici*******
            DB::transaction(function () use (&$totalToUpload, &$totalUpload, &$data, &$report)
            {
                $rowTitre = $data[0];  //1ère ligne (les titres)
                $nbreTitre = count($rowTitre); // Nbre de titres

                //Parcours des lignes à partir de la 2ème
                for ($i=1; $i < count($data); $i++)
                {
                    $row = $data[$i];
                    //Parcours des clonnes pour l'enregistement
                    $item = new ExtractSfr();
                    for ($j=0; $j < $nbreTitre; $j++)
                    {
                        $nomColonne = $rowTitre[$j];
                        $item->$nomColonne = trim($row[$j]);
                    }
                    $item->save();
                }
            });


            // SUPPRESSION DU FICHIER
            File::delete($this->pathFile);
            //******Mes tests ici*******

           
            DB::transaction(function () use (&$totalToUpload, &$totalUpload, &$data, &$report)
            {
                for ($i=1;$i < count($data);$i++)
                {
                    $errors = null;
                    $is_save = 0;
                    $row = $data[$i];

                    $key = "";
                    $code = "";
                    $designation = "";
                    $caracteristique = "";
                    $image_principale = "";
                    $en_promo = 0;
                    $nouveau = 0;
                    $volume = 0;
                    $poids_brut = 0;
                    $liens_youtube = "";
                    $r2a_technique = "";
                    $description_2 = "";
                    $garantie = "";
                    $qte = 0;
                    $qte_yop = 0;
                    $qte_generale = 0;
                    $activer = 1;

                    $categorie_id = null;
                    $sous_categorie_id = null;
                    $marque_id = null;

                    $categorie = new Categorie();
                    $sous_categorie = new Categorie();
                    $marque = new Marque();

                    try
                    {
                        $code = trim($row[1]);
                        $designation = trim($row[2]);
                        $activer = Outil::enleveEspaces(trim($row[3]));
                        
                        $qte_generale = Outil::enleveEspaces(trim($row[4]));
                        $qte_yop = Outil::enleveEspaces(trim($row[5]));

                        $caracteristique = trim($row[6]);
                        $categorie_id = trim($row[7]);
                        $sous_categorie_id = trim($row[8]);
                        $marque_id = trim($row[9]);
                        $en_promo = Outil::enleveEspaces(trim($row[10]));
                        $nouveau = Outil::enleveEspaces(trim($row[11]));
                        $qte =  Outil::enleveEspaces(trim($row[12]));
                        $poids_brut = Outil::enleveEspaces(trim($row[13]));
                        $volume = Outil::enleveEspaces(trim($row[14]));

                        $lien_youtube_1 = trim($row[15]);
                        $lien_youtube_2 = trim($row[16]);
                        $lien_youtube_3 = trim($row[17]);
                        $lien_youtube_4 = trim($row[18]);
                        $lien_youtube_5 = trim($row[19]);

                        $prix_pv1 = Outil::remplaEspaceBizarre(trim($row[20]));
                        $prix_pv2 = Outil::remplaEspaceBizarre(trim($row[21]));
                        $prix_pv3 = Outil::remplaEspaceBizarre(trim($row[22]));
                        $prix_pv4 = Outil::remplaEspaceBizarre(trim($row[23]));
                        $prix_pv5 = Outil::remplaEspaceBizarre(trim($row[24]));

                        $prix_promo_pv1 = Outil::remplaEspaceBizarre(trim($row[25]));
                        $prix_promo_pv2 = Outil::remplaEspaceBizarre(trim($row[26]));
                        $prix_promo_pv3 = Outil::remplaEspaceBizarre(trim($row[27]));
                        $prix_promo_pv4 = Outil::remplaEspaceBizarre(trim($row[28]));
                        $prix_promo_pv5 = Outil::remplaEspaceBizarre(trim($row[29]));

                        $date_debut_promo_pv1 = trim($row[30]);
                        $date_debut_promo_pv2 = trim($row[31]);
                        $date_debut_promo_pv3 = trim($row[32]);
                        $date_debut_promo_pv4 = trim($row[33]);
                        $date_debut_promo_pv5 = trim($row[34]);

                        $date_fin_promo_pv1 = trim($row[35]);
                        $date_fin_promo_pv2 = trim($row[36]);
                        $date_fin_promo_pv3 = trim($row[37]);
                        $date_fin_promo_pv4 = trim($row[38]);
                        $date_fin_promo_pv5 = trim($row[39]);

                        $date_creation = trim($row[40]);
                        $date_modification = trim($row[41]);
                        $r2a_technique = trim($row[42]);
                        $description_2 = trim($row[43]);
                        $garantie = trim($row[44]);


                    }
                    catch (\Exception $e)
                    {
                        //dd($e);
                        $errors = "Vérifier le format du fichier";
                        array_push($report, [
                            'ligne'             => ($i),
                            'libelle'           => "Articles",
                            'erreur'            => $errors,
                            'is_save'           => $is_save,
                        ]);
                        break;
                    }

                    //Tests
                    if(empty($code))
                    {
                        $errors = "Le code n'est pas défini";
                    }
                    else if(empty($designation))
                    {
                        $errors = "La désignation n'est pas définie pour le produit : ".$code;
                    }
                    else if(empty($prix_pv1) && empty($prix_pv2) && empty($prix_pv3) && empty($prix_pv4) && empty($prix_pv5))
                    {
                        $errors = "Aucun prix n'est défini pour le produit : ".$code;
                    }
                    /*
                    else if(empty($prix_pv1) || empty($prix_pv2) || empty($prix_pv3) || empty($prix_pv4) || empty($prix_pv5))
                    {
                        if(empty($prix_pv1))
                        {
                            $errors = "Le PV1 n'est pas défini pour le produit : ".$code;
                        }
                        else if(empty($prix_pv2))
                        {
                            $errors = "Le PV2 n'est pas défini pour le produit : ".$code;
                        }
                        else if(empty($prix_pv3))
                        {
                            $errors = "Le PV3 n'est pas défini pour le produit : ".$code;
                        }
                        else if(empty($prix_pv4))
                        {
                            $errors = "Le PV4 n'est pas défini pour le produit : ".$code;
                        }
                        else if(empty($prix_pv5))
                        {
                            $errors = "Le PV5 n'est pas défini pour le produit : ".$code;
                        }
                    }
                    */
                    /* else if(empty($poids_brut))
                    {
                        $errors = "Le poids n'est pas défini pour le produit : ".$code;
                    }
                    else if(empty($volume))
                    {
                        $errors = "Le volume n'est pas défini pour le produit : ".$code;
                    } */

                    if(empty($errors))
                    {
                        if (isset($code))
                        {
                            $code = $code;
                            $item = Produit::where('code', $code)->first();
                            if(empty($item))
                            {
                                //Nouvel article
                                $item = new Produit();
                                $item->image_principale = $image_principale;
                                $item->r2a_technique = $r2a_technique;
                                $item->description_2 = $description_2;
                                $item->garantie = $garantie;
                            }
                        }

                        if(isset($code))
                        {
                           $image_principale = "uploads/produits/Image_".$code.".png";
                        }
                        if(isset($designation))
                        {
                           $designation = substr($designation, 0, 190);
                        }

                        if(isset($en_promo))
                        {
                            if(strtolower($en_promo) == 'oui')
                            {
                                $en_promo = 1;
                            }
                            else
                            {
                                $en_promo = 0;
                            }
                        }
                        else
                        {
                            $en_promo = 0;
                        }

                        if(isset($nouveau))
                        {
                            if(strtolower($nouveau) == 'oui')
                            {
                                $nouveau = 1;
                            }
                            else
                            {
                                $nouveau = 0;
                            }
                        }
                        else
                        {
                            $nouveau = 0;
                        }
                        
                        if(isset($volume))
                        {
                            $volume = round($volume, 2);
                        }
                        if(isset($poids_brut))
                        {
                            $poids_brut = round($poids_brut, 2);
                        }
                        if(isset($qte))
                        {
                            $qte = round($qte);
                        }
                        if(isset($qte_yop))
                        {
                            $qte_yop = round($qte_yop);
                        }
                        if(isset($qte_generale))
                        {
                            $qte_generale = round($qte_generale);
                        }
                        if(isset($activer) && $activer != "")
                        {
                            $activer = round($activer);
                        }
                        if(isset($lien_youtube_1))
                        {
                            $liens_youtube = $liens_youtube."".$lien_youtube_1.";";
                        }
                        if(isset($lien_youtube_2))
                        {
                            $liens_youtube = $liens_youtube."".$lien_youtube_2.";";
                        }
                        if(isset($lien_youtube_3))
                        {
                            $liens_youtube = $liens_youtube."".$lien_youtube_3.";";
                        }
                        if(isset($lien_youtube_4))
                        {
                            $liens_youtube = $liens_youtube."".$lien_youtube_4.";";
                        }
                        if(isset($lien_youtube_5))
                        {
                            $liens_youtube = $liens_youtube."".$lien_youtube_5.";";
                        }
                        if(isset($r2a_technique))
                        {
                            $r2a_technique = $r2a_technique;
                        }

                        if(!empty($categorie_id) || !empty($sous_categorie_id))
                        {
                            if(!empty($categorie_id))
                            {
                                $categorie = Categorie::where('code', $categorie_id)->first();
                            }
                            if(!empty($sous_categorie_id))
                            {
                                $sous_categorie = Categorie::where('code', $sous_categorie_id)->first();
                            }

                            if(isset($categorie))
                            {
                                $categorie_id = $categorie->id;
                            }
                            else
                            {
                                $categorie_id = null;
                            }
                            if(isset($sous_categorie))
                            {
                                $sous_categorie_id = $sous_categorie->id;
                            }
                            else
                            {
                                $sous_categorie_id = null;
                            }
                        }
                        else
                        {
                            $categorie_id = null;
                            $sous_categorie_id = null;
                        }

                        if(!empty($marque_id))
                        {
                            $marque = Marque::where('code', $marque_id)->first();
                            if(isset($marque))
                            {
                                $marque_id = $marque->id;
                            }
                            else
                            {
                                $marque_id = null;
                            }
                        }
                        else
                        {
                            $marque_id = null;
                        }

                        if(isset($description_2))
                        {
                            $description_2 = substr($description_2, 0, 190);
                        }
                        if(isset($garantie))
                        {
                            $garantie = substr($garantie, 0, 190);
                        }

                        //Les tests pour désactiver un produit
                        if((empty($prix_pv1) && empty($prix_pv2) && empty($prix_pv3) && empty($prix_pv4) && empty($prix_pv5)) || empty($poids_brut) || empty($volume))
                        {
                            $activer = 0;
                        }

                        $item->code = $code;
                        $item->designation = $designation;
                        $item->caracteristique = $caracteristique;
                        //$item->image_principale = $image_principale;
                        //$item->en_promo = $en_promo;
                        $item->nouveau = $nouveau;
                        $item->volume = $volume;
                        $item->poids_brut = $poids_brut;
                        $item->liens_youtube = $liens_youtube;
                        $item->categorie_id = $categorie_id;
                        $item->sous_categorie_id = $sous_categorie_id;
                        $item->marque_id = $marque_id;
                        //$item->r2a_technique = $r2a_technique;
                        $item->description_2 = $description_2;
                        $item->garantie = $garantie;
                        $item->qte = $qte;
                        //$item->qte2 = $qte_yop;
                        //$item->qte_generale = $qte_generale;
                        //$item->activer = $activer;
                        $item->key = $key;
                        $item->save();

                        $id = $item->id;

                        //Enregistrement des prix du produit
                        if(!empty($prix_pv1) || !empty($prix_promo_pv1))
                        {
                            $type_prix_vente_id = 1;
                            $prix_normal = 0;
                            $prix_promo = 0;
                            if(!empty($prix_pv1))
                            {
                                $prix_normal = $prix_pv1;
                            }
                            if(!empty($prix_promo_pv1))
                            {
                                $prix_promo = $prix_promo_pv1;
                            }
                            
                            $prixVente = PrixVente::where('type_prix_vente_id', $type_prix_vente_id)->where('produit_id', $id)->first();
                            if(empty($prixVente))
                            {
                                $prixVente = new PrixVente();
                            }
                            $prixVente->prix = intval($prix_normal);
                            $prixVente->prix_promo = intval($prix_promo);
                            $prixVente->type_prix_vente_id = $type_prix_vente_id;
                            $prixVente->produit_id = $id;
                            $prixVente->save();
                        }
                        if(!empty($prix_pv2) || !empty($prix_promo_pv2))
                        {
                            $type_prix_vente_id = 2;
                            $prix_normal = 0;
                            $prix_promo = 0;
                            if(!empty($prix_pv2))
                            {
                                $prix_normal = $prix_pv2;
                            }
                            if(!empty($prix_promo_pv2))
                            {
                                $prix_promo = $prix_promo_pv2;
                            }
                            
                            $prixVente = PrixVente::where('type_prix_vente_id', $type_prix_vente_id)->where('produit_id', $id)->first();
                            if(empty($prixVente))
                            {
                                $prixVente = new PrixVente();
                            }
                            $prixVente->prix = intval($prix_normal);
                            $prixVente->prix_promo = intval($prix_promo);
                            $prixVente->type_prix_vente_id = $type_prix_vente_id;
                            $prixVente->produit_id = $id;
                            $prixVente->save();
                        }
                        if(!empty($prix_pv3) || !empty($prix_promo_pv3))
                        {
                            $type_prix_vente_id = 3;
                            $prix_normal = 0;
                            $prix_promo = 0;
                            if(!empty($prix_pv3))
                            {
                                $prix_normal = $prix_pv3;
                            }
                            if(!empty($prix_promo_pv3))
                            {
                                $prix_promo = $prix_promo_pv3;
                            }
                            
                            $prixVente = PrixVente::where('type_prix_vente_id', $type_prix_vente_id )->where('produit_id', $id)->first();
                            if(empty($prixVente))
                            {
                                $prixVente = new PrixVente();
                            }
                            $prixVente->prix = intval($prix_normal);
                            $prixVente->prix_promo = intval($prix_promo);
                            $prixVente->type_prix_vente_id = $type_prix_vente_id;
                            $prixVente->produit_id = $id;
                            $prixVente->save();
                        }
                        if(!empty($prix_pv4) || !empty($prix_promo_pv4))
                        {
                            $type_prix_vente_id = 4;
                            $prix_normal = 0;
                            $prix_promo = 0;
                            if(!empty($prix_pv4))
                            {
                                $prix_normal = $prix_pv4;
                            }
                            if(!empty($prix_promo_pv4))
                            {
                                $prix_promo = $prix_promo_pv4;
                            }
                            
                            $prixVente = PrixVente::where('type_prix_vente_id', $type_prix_vente_id )->where('produit_id', $id)->first();
                            if(empty($prixVente))
                            {
                                $prixVente = new PrixVente();
                            }
                            $prixVente->prix = intval($prix_normal);
                            $prixVente->prix_promo = intval($prix_promo);
                            $prixVente->type_prix_vente_id = $type_prix_vente_id;
                            $prixVente->produit_id = $id;
                            $prixVente->save();
                        }
                        if(!empty($prix_pv5) || !empty($prix_promo_pv5))
                        {
                            $type_prix_vente_id = 5;
                            $prix_normal = 0;
                            $prix_promo = 0;
                            if(!empty($prix_pv5))
                            {
                                $prix_normal = $prix_pv5;
                            }
                            if(!empty($prix_promo_pv5))
                            {
                                $prix_promo = $prix_promo_pv5;
                            }
                            
                            $prixVente = PrixVente::where('type_prix_vente_id', $type_prix_vente_id)->where('produit_id', $id)->first();
                            if(empty($prixVente))
                            {
                                $prixVente = new PrixVente();
                            }
                            $prixVente->prix = intval($prix_normal);
                            $prixVente->prix_promo = intval($prix_promo);
                            $prixVente->type_prix_vente_id = $type_prix_vente_id;
                            $prixVente->produit_id = $id;
                            $prixVente->save();
                        }
                    }

                    /* if($is_save)
                    {
                        $totalUpload ++;
                    } */

                    if (!empty($designation))
                    {
                        array_push($report, [
                            'ligne'             => ($i+1),
                            'libelle'           => $designation." (".$code.") ",
                            'erreur'            => $errors,
                            'is_save'           => $is_save,
                        ]);
                    }
                }

            });

            // SUPPRESSION DU FICHIER
            File::delete($this->pathFile);


            /* 
            // ENVOIE DE LA NOTIFICATION DE FIN
            $notif = new Notif();
            $notif->message = "<strong>Fin de l'import du fichier excel des produits</strong>,<br>Merci de consulter vos mails pour le rapport";
            $notif->link = "#!/list-{$generateLink}";
            $notif->save();

            $notifPermUser  = new NotifPermUser();
            $notifPermUser->notif_id = $notif->id;
            $notifPermUser->permission_id = Permission::where('name', "liste-produit")->first()->id;
            $notifPermUser->user_id = $this->userId;
            $notifPermUser->save();


            $eventNotif = new SendNotifEvent($notifPermUser);
            event($eventNotif);

            // Pour le RealTime
            Outil::publishEvent(['type' => $generateLink, 'add' => true]);


            // ENVOIE DU MAIL CONTENANT LE RAPPORT
            $pdf = PDF::loadView('pdfs.report-uploadfile-item', array(
                'reports'       => $report,
                'user'          => $this->user,
                'title'         => 'Rapport de l\'import du fichier des produits',
                'totals'        => [
                    'toUpload'     => $totalToUpload,
                    'upload'       => $totalUpload,
                ],
                'addToData' => array('entete' => null, 'hidefooter' => true)
            ));

            $this->user->notify(new EndUploadExcelFileNotification($pdf, "des produits"));
             */

        }
        catch (\Exception $e)
        {
            echo($e);
            try
            {
                File::delete($this->pathFile);
            }
            catch (\Exception $eFile) {};
            throw new \Exception($e);
        }
    }
}
