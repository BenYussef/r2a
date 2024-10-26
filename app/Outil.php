<?php

namespace App;

use App\Events\SendNotifEvent;
use App\GraphQL\Type\DetailDetailAssemblagePaginatedType;
use App\Mail\DemoEmail;
use App\Notifications\EndUploadExcelFileNotification;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Events\RtEvent;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Mpdf\Tag\Details;
use PDF;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use NumberToWords\NumberToWords;
use Illuminate\Support\Facades\Mail;
use App\Mail\Maileur;
use DateTime;
use Exception;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\HtmlString;
use Illuminate\Support\Facades\Redirect;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use PDO;
use Shuchkin\SimpleXLSX;
use Illuminate\Support\Facades\Hash;
use Mockery\Generator\StringManipulation\Pass\Pass;
use Illuminate\Support\Facades\Storage;

class Outil extends Model
{

    public static function getTotalMontant($root, $args)
    {

        return 0;
    }

    // Add automatically common attr to table
    public static function listenerUsers(&$table)
    {
        $table->integer('created_at_user_id')->nullable();
        $table->integer('updated_at_user_id')->nullable();
        $table->foreign('created_at_user_id')->references('id')->on('users');
        $table->foreign('updated_at_user_id')->references('id')->on('users');
    }

    // Add automatically common attr to table
    public static function stringToTimeInCel($celTime)
    {
        $celTime .= ":00";
        $time_cel = explode(':', $celTime);
        $time_exact = '';
        if (isset($time_cel) && count($time_cel) > 0) {
            if (isset($time_cel[0])) {
                if (is_numeric($time_cel[0])) {
                    $time_exact .= $time_cel[0];
                    if (isset($time_cel[1])) {
                        if (is_numeric($time_cel[1])) {
                            $time_exact .= ":" . $time_cel[1];
                        }
                    } else {
                        $time_exact .= ":00";
                    }
                }
            }
        }
        return $time_exact;
    }

    public static function getAttrtibutes($attributes, $column)
    {
        foreach ($attributes as $attribute) {
            if ($column == $attribute) {
                return true;
            }
        }
        return  false;
    }

    public static function differenceEntreTime()
    {
        $duree = null;
        $strStart = '06/19/13 18:25';
        $strEnd = '06/19/13 21:47';

        $dteStart = new DateTime($strStart);
        $dteEnd = new DateTime($strEnd);

        $duree = $dteStart->diff($dteEnd);
        return $duree;
    }

    public static function sortieAssemblage($assmeblage)
    {
        $result = "Erreur lors du traitement de la productiom";
        if (isset($assmeblage) && isset($assmeblage->id)) {
            $detail_assemblage = DetailAssemblage::query()->where('assemblage_id', $assmeblage->id)->get();
            if (isset($detail_assemblage) && count($detail_assemblage) > 0) {
                foreach ($detail_assemblage as $key => $ligne) {
                    if (isset($ligne) && isset($ligne->produit_id)) {
                        $produit_assemblage     = Produit::find($ligne->produit_id);
                        $qt_unitaire_assemblage = $ligne->qte_unitaire;
                        if (isset($produit_assemblage) && isset($produit_assemblage->id)) {
                            $composition_produit = $produit_assemblage->r2atechniques;
                            if (isset($composition_produit) && count($composition_produit) > 0) {
                                //Ici on commence la prodution
                                // $alldetailproduits = DetailDetailAssemblage::query()->where('detail_assemblage_id', $ligne->id)
                                //                                               ->get();
                                // Outil::Checkdetail($alldetailproduits, array($composition_produit), DetailDetailAssemblage::class, 'produit_compose_id');
                                foreach ($composition_produit as $key => $ligne_composition) {

                                    $detail_detail_assemblage    = DetailDetailAssemblage::query()->where('produit_id', $ligne_composition->produit_compose_id)
                                        ->where('detail_assemblage_id', $ligne->id)
                                        ->first();
                                    if (!isset($detail_detail_assemblage) || !isset($detail_detail_assemblage->id)) {
                                        $detail_detail_assemblage = new DetailDetailAssemblage();
                                    }
                                    $qt = $ligne_composition->portion_unitaire * $qt_unitaire_assemblage;
                                    $detail_detail_assemblage->produit_id                = $ligne_composition->produit_compose_id;
                                    $detail_detail_assemblage->detail_assemblage_id      = $ligne->id;
                                    $detail_detail_assemblage->qte_unitaire              = $qt;
                                    $detail_detail_assemblage->description               = $assmeblage->description;
                                    $detail_detail_assemblage->save();
                                }
                                $result = null;
                            }
                        }
                    }
                }
            }
        }
        return $result;
    }

    public static function getLigneCreditAutoriseClient($client, $mode_paiement)
    {
        $ligne_credit = null;
        if (isset($client)) {
            $client        = Client::find($client);
            $mode_paiement = Modepaiement::find($mode_paiement);
            if (isset($client) && isset($client->id) && isset($mode_paiement) && isset($mode_paiement->id)) {
                $ligne_credit = Lignecredit::query()
                    ->where('client_id', $client->id)
                    ->where('mode_paiement_id', $mode_paiement->id)
                    ->where('montant_restant', '>', 0)
                    ->get();
            }
        }
        return $ligne_credit;
    }
    public static function checkPaiementClientWithLigneCredit($client, $mode_paiement, $montant_a_payer)
    {
        $autorise = null;
        $ligne_credits = self::getLigneCreditAutoriseClient($client, $mode_paiement);
        $ligne_credit_autroise = array();
        if (isset($ligne_credits) && count($ligne_credits) > 0) {
            $montant_ligne = 0;

            foreach ($ligne_credits as $key => $ligne) {
                $montant_ligne = $montant_ligne + $ligne->montant_restant;

                if ($montant_ligne >= $montant_a_payer) {
                    $restant_ligne          = $montant_ligne - $montant_a_payer;
                    $ligne->montant_restant = $restant_ligne;
                    $autorise = true;
                    //Metrre jour la ligne
                    array_push($ligne_credit_autroise, $ligne);
                    break;
                } else {
                    $ligne->montant_restant                     = 0;
                    array_push($ligne_credit_autroise, $ligne);
                }
            }
        } else {
            $autorise = false; //"Ce client n'a aucune ligne de crédit pour payer.";
        }

        if ($autorise == true) {
            if (isset($ligne_credit_autroise) && count($ligne_credit_autroise)) {
                $autorise = $ligne_credit_autroise;
                //$autorise = "Ce client est autorise a payer avec les ligne ".json_encode($ligne_credit_autroise);
            }
        } else {
            $autorise = null;
            //$autorise = "Ce client n'a aucune ligne de crédit pour payer.";
        }
        return $autorise;
    }

    public static function checkIfCreateSuiviClient($ca_client, $tag_client, $client)
    {
        $user = Auth::user();
        if (isset($tag_client) && isset($ca_client) && isset($client)) {
            $tag = Tag::find($tag_client->tag_id);
            if (isset($tag) && isset($tag->id)) {
                if ($ca_client > $tag->ca_alert) {
                    $suivi_marketing                 = Suivimarketing::query()
                        ->where('client_id', $client->id)
                        ->where('tag_id', $tag->id)->first();
                    if (!isset($suivi_marketing) && !isset($suivi_marketing->id)) {
                        $suivi_marketing             = new Suivimarketing();
                    }
                    $suivi_marketing->client_id     = $client->id;
                    $suivi_marketing->tag_id        = $tag->id;
                    $suivi_marketing->user_id       = $user->id;
                    $suivi_marketing->date          = now();
                    $suivi_marketing->etat          = 0;
                    $suivi_marketing->save();
                    var_dump('On peut creerr un suivi marketing ' . $client->raison_sociale . " " . $ca_client . "VS" . $tag->ca_alert);
                } else {
                    var_dump('Pas la peine de creer un suivi marketing ' . $client->raison_sociale . " " . $ca_client . "VS" . $tag->ca_alert);
                }
            }
        }
    }

    public static function checkIfCreateSuiviClientByPalierMarketing($ca_client, $nb_commande, $suivi_client, $client)
    {
        $user = Auth::user();
        $palier = PalierFidelite::query();
        if (isset($suivi_client) && isset($suivi_client->id) && isset($suivi_client->palier_fidelite_id)) {
            $palier->whereIn('id', PalierFidelite::query()->where('id', '>', $suivi_client->palier_fidelite_id)->get());
        }

        // $palier = $palier->get();
        if (isset($palier)) {
            $palier = $palier->where('nombre_min', '<=', $nb_commande)
                ->where('nombre_max', '>=', $nb_commande)
                ->orderBy('nombre_min', 'asc')
                ->first();

            if (isset($palier)) {
                if ($palier->ca_min <= $ca_client) {
                    /*if($palier->ca_max >= $ca_client){

                      }*/
                    $suivi_marketing                 = Suivimarketing::query()
                        ->where('client_id', $client->id)
                        ->where('palier_fidelite_id', $palier->id)->first();
                    if (!isset($suivi_marketing) && !isset($suivi_marketing->id)) {
                        $suivi_marketing             = new Suivimarketing();
                    }
                    $suivi_marketing->client_id                 = $client->id;
                    $suivi_marketing->palier_fidelite_id        = $palier->id;
                    $suivi_marketing->user_id                   = $user->id;
                    $suivi_marketing->date                      = now();
                    $suivi_marketing->etat                      = 0;
                    $suivi_marketing->suivi_marketing_id        = isset($suivi_client) ? $suivi_client->id : null;
                    $suivi_marketing->save();
                    //var_dump('On peut creer un suivi marketing');

                } else {
                    // var_dump('On peut pas creerr un suivi marketing CAC'.$ca_client);
                }
            } else {
                //var_dump( 'On peut pas creerr un suivi marketing palier NBC:'.$nb_commande);
            }
        } else {
            //var_dump( 'On peut pas creerr un suivi marketing 0 palier');
        }
    }

    //Controle marketing tag client
    public static function controleMarketingTagClient()
    {
        $dateFin = now();
        $client_avec_tag = DB::table('clients')
            ->join('commandes', 'commandes.client_id', '=', 'clients.id')
            // ->join('tags', 'tags.id', '=', 'tagclients.tag_id')
            // ->where('tags.ca_alert','>', 0)
            ->where('commandes.etat_commande', 8)
            ->groupBy('clients.id')
            ->selectRaw('clients.*');
        $list_client_a_suivre = $client_avec_tag->get();
        // $ca_client = 0;
        if (isset($list_client_a_suivre) && count($list_client_a_suivre) > 0) {
            foreach ($list_client_a_suivre as $key => $client) {
                $suivi_client = self::getSuiviMarketingClientEncours($client);
                // var_dump($suivi_client);
                $date_debut   = null;
                $ca_global = 0;
                $nb_commande_global = 0;
                $ca_client = DB::table('paiements')
                    ->join('commandes', 'commandes.id', '=', 'paiements.commande_id')
                    ->join('clients', 'clients.id', '=', 'commandes.client_id')
                    ->where('clients.id', $client->id);
                if (isset($suivi_client) && isset($suivi_client->id)) {
                    $date_debut = $suivi_client->date;
                    $ca_client->whereBetween('commandes.date', [$date_debut, $dateFin]);
                }
                $ca_client->selectRaw('SUM(paiements.montant) as montant');


                $nb_commande_client = DB::table('commandes')
                    //  ->join('commandes', 'commandes.id', '=', 'paiements.commande_id')
                    ->join('clients', 'clients.id', '=', 'commandes.client_id')
                    ->where('clients.id', $client->id)
                    ->where('commandes.etat_commande', 8);
                //->groupBy(['commandes.id']);

                if (isset($suivi_client) && isset($suivi_client->id)) {
                    $date_debut = $suivi_client->date;
                    $nb_commande_client->whereBetween('commandes.date', [$date_debut, $dateFin]);
                }

                $nb_commande_client->selectRaw('COUNT(commandes.id) nb_commande');

                if (isset($ca_client)) {
                    $ca_client = $ca_client->first();
                    //var_dump($ca_client->montant);
                    $ca_global = $ca_client->montant;
                }

                if (isset($nb_commande_client)) {
                    $nb_commande_client  = $nb_commande_client->first();
                    // var_dump($nb_commande_client->nb_commande);
                    $nb_commande_global = $nb_commande_client->nb_commande;
                }
                //  var_dump($nb_commande_global);
                if (isset($ca_global) && $ca_global > 0 && isset($nb_commande_global) && $nb_commande_global > 0) {
                    self::checkIfCreateSuiviClientByPalierMarketing($ca_global, $nb_commande_global, $suivi_client, $client);
                }
            }
        }


        return $client_avec_tag;
    }
    //get  tag client en cours
    public static function getTagClientEncours($client)
    {
        $tag_client     = TagClient::query();
        $tag_client     = $tag_client
            ->join('clients', 'clients.id', '=', 'tagclients.client_id')
            ->join('tags', 'tags.id', '=', 'tagclients.tag_id')
            ->where('clients.id', $client->id)
            ->where('tags.ca_alert', '>', 0)
            ->where('tagclients.etat', 1)
            ->selectRaw('tagclients.*');

        return $tag_client->first();
    }

    //get  suivi marketing client en cours
    public static function getSuiviMarketingClientEncours($client)
    {
        $suivi_client     = Suivimarketing::query();
        $suivi_client     = $suivi_client
            ->join('clients', 'clients.id', '=', 'suivi_marketings.client_id')
            ->where('clients.id', $client->id)
            ->where('suivi_marketings.etat', 1)
            ->selectRaw('suivi_marketings.*');

        return $suivi_client->first();
    }
    // function dateDifference($date_1 , $date_2 , $differenceFormat = '%a' )
    public static function dateDifference($timeDebut, $timeFin)
    {
        // $datetime1 = date_create($date_1);
        // $datetime2 = date_create($date_2);
        //dd($timeDebut . $timeFin);
        $strStart = date_create('06/19/13 ' . $timeDebut);
        $strEnd = date_create('06/19/13 ' . $timeFin);

        $interval = date_diff($strStart, $strEnd);
        $differenceFormat = '%h';
        return $interval->format($differenceFormat);
        //return $interval;

    }


    //add nature in some entities
    public static function natureEntity(&$table)
    {
        $table->integer('famille_id')->nullable(true);
        $table->foreign('famille_id')->references('id')->on('familles');
    }

    // Add automatically common attr to table specific
    public static function statusOfObject(&$table)
    {
        $table->integer('est_activer')->default(1);
    }


    // Add show_web_site to table specifique
    public static function showWebSiteOfObject(&$table)
    {
        $table->boolean('show_web_site')->default(true);
    }

    // Control nom negatif
    public static function isNegatifOrNotInt($prix)
    {
        if ($prix < 0 || !is_numeric($prix))
            return true;
        else
            return false;
    }

    // Test si c'est une date ou pas
    public static function isValideDate($val)
    {

        try {
            $retour = false;
            if (strtotime($val)) {
                $retour = true;
            }
            return $retour;
        } catch (\Exception $e) {
            //dd($e); //Pour voir l'erreur précis
            $errorArray = array("type" => "mail_suivi", "designation" => "Outil->isValideDate->Erreur lors du traitement", "erreur" => $e);
            Outil::saveError($errorArray);
        }
    }

    public static function isObject($val)
    {
        try {
            $retour = false;
            if (gettype($val) == "object") {
                $retour = true;
            }
            return $retour;
        } catch (\Exception $e) {
            //dd($e); //Pour voir l'erreur précis
            $errorArray = array("type" => "mail_suivi", "designation" => "Outil->isObject->Erreur lors du traitement", "erreur" => $e);
            Outil::saveError($errorArray);
        }
    }

    public static function isJson($string)
    {
        json_decode($string);
        return json_last_error() === JSON_ERROR_NONE;
    }

    public static function dateExcelToNormalDate($val)
    {
        $val = ($val - 25569) * 86400;
        $retour = date("Y-m-d", intval($val));
        return $retour;
    }

    public static function convertir_date_anglais($val)
    {
        $jour = substr($val, 0, 2);
        $mois = substr($val, 3, 2);
        $an = substr($val, 6, 4);

        $retour = $an . '-' . $mois . '-' . $jour;
        return $retour;
    }

    //Convertir les econdes en heure, minutes et secondes
    public static function convertir_secondes($seconds)
    {
        $t = round($seconds);
        return sprintf('%02d:%02d:%02d', ($t / 3600), ($t / 60 % 60), $t % 60);
    }

    public static function file_get_contents_curl($url)
    {
        $ch = curl_init();

        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); //Set curl to return the data instead of printing it to the browser.
        curl_setopt($ch, CURLOPT_URL, $url);

        $data = curl_exec($ch);
        curl_close($ch);

        return $data;
    }

    public static function donneColonnesEtTypes($table)
    {
        $retour = array();
        $columns = Schema::getColumnListing($table);
        foreach ($columns as $value) {
            $typeColonne = Schema::getColumnType($table, $value);
            array_push($retour,  array(
                "colonne"   => $value,
                "type"      => $typeColonne,
            ));
        }
        return $retour;
    }

    public static function donneTypeColonne($types, $colonne)
    {
        $retour = null;
        foreach ($types as $value) {
            $colonneSelect = $value["colonne"];
            if ($colonneSelect == $colonne) {
                $retour = $value["type"];
                return $retour;
            }
        }

        return $retour;
    }

    //Donne la valeur se trouvant dans la balise
    public static function donneValueInBalise($text, $balise = "id")
    {
        $retour = "";
        preg_match_all("~\<" . $balise . "\>(.*?)\<\/" . $balise . "\>~", $text, $values);
        if (isset($values)) {
            if (isset($values[0])) {
                if (isset($values[0][0])) {
                    $retour = $values[0][0];
                }
            }
        }

        $debut = strlen("<" . $balise . ">");
        $fin = strlen($retour) - strlen("</" . $balise . ">");
        $fin = $fin - $debut;
        if (is_numeric($debut) == true && is_numeric($fin) == true) {
            $retour = substr($retour, $debut, $fin);
        }

        return $retour;
    }

    //Change la valeur se trouvant dans la balise
    public static function changeValueInBalise($text, $balise = "id", $valueBalise, $toReplace)
    {
        $retour = $text;
        if (strtolower($toReplace) == "carre" || strtolower($toReplace) == "abo_hv") //Remplacer CARRE (cas mobile) ou ABO_HV (cas fixe) par SFR
        {
            $toReplace = strtoupper("sfr");
        }

        $toRemove = "<" . $balise . ">" . $valueBalise . "</" . $balise . ">";
        $retour = str_replace($toRemove, $toReplace, $text);

        return $retour;
    }

    public static function dateDiffToTime($dateStart, $dateEnd)
    {
        $dateStart = date_create($dateStart);
        $dateEnd = date_create($dateEnd);
        $diff = date_diff($dateStart, $dateEnd);
        $retour = $diff->format('%i minute(s) %s seconde(s)');
        return $retour;
    }

    public static function donneTypeImportText($typeId)
    {
        $types = array();
        array_push($types, array("id" => "test_fichier", "designation" => "Test du fichier"));
        array_push($types, array("id" => "import_mobile", "designation" => "Imports des mobiles"));
        array_push($types, array("id" => "import_fixe", "designation" => "Import des fixes"));

        $retour = "";
        foreach ($types as $value) {
            if ($value["id"] == $typeId) {
                $retour = $value["designation"];
                return $retour;
            }
        }

        return $retour;
    }

    public static function donneTypeEnvoiText($typeId)
    {
        $types = array();
        array_push($types, array("id" => 0, "designation" => "Immédiat"));
        array_push($types, array("id" => 1, "designation" => "Plannifié"));

        $retour = "";
        foreach ($types as $value) {
            if ($value["id"] == $typeId) {
                $retour = $value["designation"];
                return $retour;
            }
        }

        return $retour;
    }

    public static function test_cron()
    {
        $item = Test::find(1);
        if (isset($item)) {
            $item->valeur1 = "TestCron " . date('Y-m-d H:i:s');
            $item->save();
        }
    }

    //Enlève 0 et ajoute 33
    public static function formatTelToFr($val)
    {
        $retour = 0;
        if (!empty($val)) {
            $retour = intval($val); // Enlève 0 devant
            $firstCharacter = substr($val, 0, 1);
            if ($firstCharacter == 6 || $firstCharacter == 7) {
                //Numéro mobile (pas utilisé pour le moment)
                //$retour = "33".$retour;
            }

            $retour = "33" . $retour;
        }

        return $retour;
    }

    public static function donneDateFormatEnglish($val = null, $avecHeure = false)
    {
        $retour = null;
        if (!empty($val)) {
            $retour = $val;
            $posTiret = strpos($val, "-");
            $posSlash = strpos($val, "/");

            if ($posSlash !== false) //Contient slash
            {
                if ($avecHeure == true) {
                    $jour = substr($val, 0, 2);
                    $mois = substr($val, 3, 2);
                    $annee = substr($val, 6, 4);
                    $heure = substr($val, 11, 8);
                    $retour = $annee . "-" . $mois . "-" . $jour . " " . $heure;
                } else {
                    $jour = substr($val, 0, 2);
                    $mois = substr($val, 3, 2);
                    $annee = substr($val, 6, 4);
                    $retour = $annee . "-" . $mois . "-" . $jour;
                }
            }

            if (Outil::isValideDate($retour) == false) {
                $retour = null;
            }
        }

        return $retour;
    }

    //Donne le numéro de téléphone car y'a type mobile et type fixe
    public static function donneNumTel($num1, $num2)
    {
        $retour = "";
        if (!empty($num1)) {
            $retour = $num1;
        } else if (!empty($num2)) {
            $retour = $num2;
        }

        return $retour;
    }

    //Donne sous forme de Array un CSV
    public static function csvToArray($filepath)
    {
        $data = array(); // Read through the file and store the contents as an array

        //Pour l'encodage duCSV en UTF8
        header('Content-Type: text/html; charset=utf-8');

        // Reading file
        $file = fopen($filepath, "r");
        $data = array(); // Read through the file and store the contents as an array
        $i = 0;
        //Read the contents of the uploaded file 
        while (($filedata = fgetcsv($file, 1000, ";")) !== FALSE) {
            $num = count($filedata);
            // Skip first row (Remove below comment if you want to skip the first row)
            /*  if ($i == 0) {
                $i++;
                continue;
            } */
            for ($c = 0; $c < $num; $c++) {
                $data[$i][] = $filedata[$c];
            }
            $i++;
        }
        fclose($file); //Close after reading

        return $data;
    }

    public static function enleveAccents($str)
    {
        $url = $str;
        $url = preg_replace('#Ç#', 'C', $url);
        $url = preg_replace('#ç#', 'c', $url);
        $url = preg_replace('#è|é|ê|ë#', 'e', $url);
        $url = preg_replace('#È|É|Ê|Ë#', 'E', $url);
        $url = preg_replace('#à|á|â|ã|ä|å#', 'a', $url);
        $url = preg_replace('#@|À|Á|Â|Ã|Ä|Å#', 'A', $url);
        $url = preg_replace('#ì|í|î|ï#', 'i', $url);
        $url = preg_replace('#Ì|Í|Î|Ï#', 'I', $url);
        $url = preg_replace('#ð|ò|ó|ô|õ|ö#', 'o', $url);
        $url = preg_replace('#Ò|Ó|Ô|Õ|Ö#', 'O', $url);
        $url = preg_replace('#ù|ú|û|ü#', 'u', $url);
        $url = preg_replace('#Ù|Ú|Û|Ü#', 'U', $url);
        $url = preg_replace('#ý|ÿ#', 'y', $url);
        $url = preg_replace('#Ý#', 'Y', $url);

        return ($url);
    }

    //Encode comme les navigateurs
    public static function encoderCommeNavigateur($txt)
    {
        try {
            // Skip all URL reserved characters plus dot, dash, underscore and tilde..
            $result = preg_replace_callback(
                "/[^-\._~:\/\?#\\[\\]@!\$&'\(\)\*\+,;=]+/",
                function ($match) {
                    // ..and encode the rest!
                    return rawurlencode($match[0]);
                },
                $txt
            );
            return ($result);
        } catch (\Exception $e) {
            dd($e);
        }
    }

    public static function echapperCaractere($val)
    {
        $retour = str_replace("'", "''", $val);
        return $retour;
    }


    //Enregistrer une erreur
    public static function saveError($array)
    {
        $item = new Erreur();
        $item->type         = $array["type"];
        $item->designation  = $array["designation"];
        $item->erreur       = $array["erreur"];
        $item->save();
        return true;
    }

    public static function getCodeItem($model, $indicatif)
    {
        $allcode = app($model)::where('code', self::getOperateurLikeDB(), '%' . $indicatif . '%')->orderBy('id', 'desc')->get();
        $count = count($allcode);
        $codenumber = 1;
        if ($count > 0) {
            $count -= 1;
            $getlast = $allcode[$count];
            $codenumber =  explode('-00', $getlast->code)[1];
            $codenumber =  explode('-', $codenumber)[0];
            $codenumber += 1;
        }
        $code  =  $indicatif . "-00" . $codenumber . '-' . date('y');
        return $code;
    }
    public static function getCodeCodif($type, $id)
    {

        if ($id < 10) {
            return $type . '-000' . $id;
        } elseif ($id >= 10 && $id < 100) {
            return $type . '-00' . $id;
        } elseif ($id >= 100 && $id < 1000) {
            return $type . '-0' . $id;
        } else {
            return $type . '-' . $id;
        }
    }
    public static function getCode($item, $date = null, $indicatif = null)
    {
        $model = self::getQueryNameOfModel($item->getTable());
        $dateCode = '';

        if ($date) {
            $dateCode = self::getDateEng($date);
        } else {
            $dateCode = self::getDateEng(now());
        }
        $dateCode = str_replace('-', '', $dateCode);

        if (strtolower(class_basename($model)) == 'factures') {
            $code = self::getCodeFacture($item);
        } else if (strtolower(class_basename($model)) == 'commandes') {
            $code = self::getCodeCommande($item);
        } else if (strtolower(class_basename($model)) == 'reservations') {
            $code = self::getCodeReservation($item);
        } else if (strtolower(class_basename($model)) == 'proformas') {

            $code = 'P' . self::getSiglleEntite($item) . '-' . $dateCode . '' . self::generateCode($item->id);
        } else {
            $code = self::generateIndicatif($model, $indicatif) . '-' . $dateCode . '' . self::generateCode($item->id);
        }

        $item->code = $code;
        $item->save();
        return $code;
    }
    public static function getSiglleEntite($item)
    {
        $siggle = '';
        if (isset($item->entite_id)) {
            $entite = Entite::find($item->entite_id);
            if (isset($entite)) {
                $siggle = mb_substr($entite->designation, 0, 1);
            }
        }
        return $siggle;
    }

    public static function getCodeFacture($item)
    {
        $alias = 'F';
        $aliasSocFac = '';
        $dateCode = date('Ymd');
        if ($item->compta >= 1) {
            $alias = 'N';
        }

        if (isset($item->societe_facturation_id)) {
            $societefacturation = Societefacturation::find($item->societe_facturation_id);
            if (isset($societefacturation)) {
                $aliasSocFac = $societefacturation->alias;
            }
        }

        $code = $alias . $aliasSocFac . $dateCode . '-' . self::generateCode($item->codification);
        return $code;
    }

    public static function getCodeCommande($item)
    {
        $alias = '';
        if ($item->est_proforma == 0) {
            $alias = 'C';
        } elseif ($item->est_proforma == 1) {
            $alias = 'P';
        }

        $dateCode = date('Ymd');
        if (isset($item)) {

            if ($item->type_commande->designation == 'sur place') {
                $alias .= 'SP';
            } else if ($item->type_commande->designation == 'à emporter') {
                $alias .= 'EM';
            } else if ($item->type_commande->designation == 'à livrer') {
                $alias .= 'LV';
            }
            if (isset($item->client)) {
                $alias .= mb_strtoupper(substr(trim($item->client->raison_sociale), 0, 3));
            }
            $dateCode = self::getDateEng($item->date, 'Y-m-d');
            $dates = str_replace('-', '', $dateCode);
            $dates = substr($dates, 2);
        }
        $code = $alias . $dates . '-' . self::generateCode($item->id);
        return $code;
    }

    public static function getCodeReservation($item)
    {
        $alias = 'RSV';
        $dateCode = date('Ymd');
        if (isset($item)) {
            if (isset($item->client)) {
                $alias .= mb_strtoupper(substr(trim($item->client->raison_sociale), 0, 3));
            }
            $dateCode = self::getDateEng($item->date, 'Y-m-d');
            $dates = str_replace('-', '', $dateCode);
            $dates = substr($dates, 2);
        }
        $code = $alias . $dates . '-' . self::generateCode($item->id);
        return $code;
    }

    public static function donneCodification($type = 'facture', $item)
    {
        $retour = 0;
        if ($type == 'facture') {
            if ($item->compta == 0) {
                $retour = Facture::where('date', $item->date)->where('compta', $item->compta)->where('societe_facturation_id', $item->societe_facturation_id)->max('codification');
            } else {
                $retour = Facture::where('date', $item->date)->where('compta', '>=', 1)->where('societe_facturation_id', $item->societe_facturation_id)->max('codification');
            }
        }

        if (empty($retour)) {
            $retour = 0;
        }
        $retour += 1;
        return $retour;
    }

    //Donne le client selon les paramètres passés
    public static function donneClient($from = "id", $item_id)
    {
        $retour = null;
        $item = null;
        if (isset($item_id)) {
            if ($from == "id" || $from == "produit") {
                $item = Client::find($item_id);
            } else if ($from == "panier") {
                $itemFrom = Panier::find($item_id);
                if (isset($itemFrom)) {
                    $item = Client::find($itemFrom->client_id);
                }
            } else if ($from == "proforma") {
                $itemFrom = Proforma::find($item_id);
                if (isset($itemFrom)) {
                    $item = Client::find($itemFrom->client_id);
                }
            } else if ($from == "commande") {
                $itemFrom = Commande::find($item_id);
                if (isset($itemFrom)) {
                    $item = Client::find($itemFrom->client_id);
                }
            }
        }

        if (isset($item)) {
            $retour = $item;
        }

        return $retour;
    }

    public static function getDateEng($date, $format = null)
    {
        $date_at = $date;
        if (!isset($format)) {
            $format = 'Y-m-d';
        }

        if ($date_at !== null) {
            $date_at = $date_at;
            $date_at = date_create($date_at);
            return date_format($date_at, $format);
        } else {
            return '';
        }
    }

    public static function getWeeekendsDayNumber($start, $end)
    {
        $start  = strtotime($start);
        $end    = strtotime($end);
        $days   = 0;
        while ($start <= $end) {
            if (date('D', $start) == 'Sat' || date('D', $start) == 'Sun') {
                $days++;
            }
            $start += strtotime('+1 day', 0);
        }
        return $days;
    }

    public static function addDays($startdate, $numberofdays)
    {
        $d = new DateTime($startdate);
        $t = $d->getTimestamp();
        $addDay = null;
        // Boucle pour X jours
        for ($i = 0; $i < $numberofdays; $i++) {
            // Ajouter 1 jour au timestamp
            $addDay = 86400;

            // Obtenir le jour suivant
            $nextDay = date('w', ($t + $addDay));

            // Si c'est samedi ou dimanche, décrémenter $i
            if ($nextDay == 0 || $nextDay == 6) {
                $i--;
            }
            // Modifier le timestamp, ajouter 1 jour
            $t = $t + $addDay;
        }

        $t = $t - $addDay;

        $d->setTimestamp($t);

        return $d->format('Y-m-d');
    }


    public static function create_tache_relecteurs($date, $agrs)
    {
        // Les codifs qui sont entre la date_envoie_codification et date_restrict_codification 
        $codifs_query = Codification::whereDate('date_envoie_codification',   '<=', $date)
            ->whereDate('date_restrict_codification', '>=', $date);
        // Si on filtre par etude_id
        if (isset($args['etude_id'])) {
            $codifs_query->where('etude_id', $args['etude_id']);
        }
        // Si on filtre par relecteur_id
        if (isset($args['relecteur_id'])) {
            $codifs_query->whereHas('codification_relecteurs', function ($query) use ($args) {
                return $query->where('relecteur_id', '=', $args['relecteur_id']);
            });
        }
        // Si un relecteur se connecte 
        if (Auth::user()->relecteur_id) {
            $codifs_query->whereHas('codification_relecteurs', function ($query) {
                return $query->where('relecteur_id', '=', Auth::user()->relecteur_id);
            });
        }

        $taches_relecteur = [];
        $duree = 0;
        $nombre_jour_travail = 0;

        $codifs = $codifs_query->get();

        if (count($codifs) > 0) {
            foreach ($codifs as $codif) {
                // codification/R2a => nombre de mot ou duree_moyenne
                // La duree => nombre de jour fixe à travailler/
                $duree = $codif->duree_codification;
                $type = "SIR";
                $color = Preference::find(1);
                $code_color = $color->couleur_codif;


                $nombre_jour_travail = 0;

                foreach ($codif->codification_relecteurs as $key =>  $codif_relect) {
                    $heure_moyenne  = $codif_relect->relecteur->heure_moyenne;
                    if ($duree > 0 && $heure_moyenne > 0) {
                        $nombre_jour_travail = ceil($duree / $heure_moyenne);
                    }
                    // A tester si les donnees s'afr2a
                    $end_travail   = date("Y-m-d", strtotime(date($codif->date_envoie_codification) . " +$nombre_jour_travail days"));
                    $weekends_days = Outil::getWeeekendsDayNumber($date, $end_travail);

                    if ($weekends_days > 0) {
                        $end_travail_codif = date("Y-m-d", strtotime(date($end_travail) . " +$weekends_days  days"));
                    }

                    if (isset($end_travail_codif) && ($date < $end_travail_codif)) {
                        if (Auth::user()->relecteur_id || isset($args['relecteur_id'])) {
                            if (Auth::user()->relecteur_id == $codif_relect->relecteur_id || $codif_relect->relecteur_id == $args['relecteur_id']) {
                                $taches_relecteur[$key]["nom"]      = strtok($codif_relect->relecteur->nom_complet, " ");
                                if (!empty($codif_relect->relecteur->alias)) {
                                    $taches_relecteur[$key]["nom"]  = $codif_relect->relecteur->alias;
                                }
                                $taches_relecteur[$key]["etude"]    = $codif->etude->numero_etude;
                                $taches_relecteur[$key]["couleur"]  = $code_color;
                                $taches_relecteur[$key]["charge"]   = $duree;
                            }
                        } else {
                            $taches_relecteur[$key]["nom"]        = strtok($codif_relect->relecteur->nom_complet, " ");

                            if (!empty($codif_relect->relecteur->alias)) {
                                $taches_relecteur[$key]["nom"]   = $codif_relect->relecteur->alias;
                            }
                            $taches_relecteur[$key]["etude"]     = $codif->etude->numero_etude;
                            $taches_relecteur[$key]["couleur"]   = $code_color;
                            $taches_relecteur[$key]["charge"]    = $duree;
                        }
                    }
                }
            }
            // dd($counter1* $counter2); 
        }
        return $taches_relecteur;
    }


    public static function get_liste_date_fin($codifs, $relecteur_id = null)
    {
        $tab = [];
        $k   = 0;

        foreach ($codifs as $codif) {

            $duree = 1;
            $date_debut_codif = date($codif->date_envoie_codification);

            $type       = "SIRET";
            $nbre_entreprise_moyenne =  Preference::find(1)->nbre_entreprise_par_jour;

            foreach ($codif->codification_relecteurs as $codif_relect) {
                $nbre_entreprise = $codif_relect->nbre_entreprise;
                $nombre_jour_travail  = 0;
                if ($nbre_entreprise > 0) {
                    $nombre_jour_travail = ceil($nbre_entreprise / $nbre_entreprise_moyenne);
                }
                // A tester si les donnees s'afr2a
                $end_travail_codif = Outil::addDays($date_debut_codif, $nombre_jour_travail);

                if (!empty($relecteur_id)) {
                    if (($relecteur_id == $codif_relect->relecteur_id)) {
                        $tab[$k]["date_debut"]    =  $date_debut_codif;
                        $tab[$k]["date_fin"]      =  $end_travail_codif;
                        $tab[$k]["relecteur_id"]  =  $codif_relect->relecteur->id;
                        $tab[$k]["etude"]         =  $codif->etude->numero_etude;
                        $tab[$k]["nom"]           =  $codif_relect->relecteur->nom_complet;
                        $tab[$k]["couleur"]       =  $codif_relect->relecteur->couleur;
                        $tab[$k]["type"]          =  $type;
                        $tab[$k]["charge"]        =  $duree . "h";
                    }
                } else {
                    $tab[$k]["date_debut"]    =  $date_debut_codif;
                    $tab[$k]["date_fin"]      =  $end_travail_codif;
                    $tab[$k]["relecteur_id"]  =  $codif_relect->relecteur->id;
                    $tab[$k]["etude"]         =  $codif->etude->numero_etude;
                    $tab[$k]["nom"]           =  $codif_relect->relecteur->nom_complet;
                    $tab[$k]["couleur"]       =  $codif_relect->relecteur->couleur;
                    $tab[$k]["type"]          =  $type;
                    $tab[$k]["charge"]        =  $duree;
                }
                $k++;
            }
        }
        $key_values = array_column($tab, 'etude');
        array_multisort($key_values, SORT_ASC, $tab);

        return $tab;
    }

    public static function trierParEtude(&$tableau)
    {
        for ($i = 0; $i < count($tableau) - 1; $i++) {
            for ($j = $i + 1; $j < count($tableau); $j++) {
                if ($tableau[$i]['etude'] > $tableau[$j]['etude']) {
                    // Échange des éléments
                    $temp = $tableau[$i];
                    $tableau[$i] = $tableau[$j];
                    $tableau[$j] = $temp;
                }
            }
        }
    }


    public static function weeks_of_month($date)
    {
        $mois = date('m', $date); // mois de la date
        $annee = date('Y', $date); // année de la date
        $nb_jours = cal_days_in_month(CAL_GREGORIAN, $mois, $annee); // nombre de jours dans le mois

        $semaines = array(); // tableau pour stocker les numéros de semaine

        for ($jour = 1; $jour <= $nb_jours; $jour++) {
            $date_jour = "$annee-$mois-$jour";
            $semaine = date('W', strtotime($date_jour));

            if (!in_array($semaine, array_column($semaines, 'numero'))) {
                $date_debut = date('Y-m-d', strtotime("{$annee}-W{$semaine}-1")); // date de début de la semaine
                $date_fin   = date('Y-m-d', strtotime("{$annee}-W{$semaine}-5")); // date de fin de la semaine
                $semaines[] = array('numero' => $semaine, 'date_debut' => $date_debut, 'date_fin' => $date_fin);
            }
        }

        $now = date('W'); // numéro de semaine actuel

        foreach ($semaines as &$semaine) {
            if ($semaine['numero'] == $now) {
                $semaine['est_semaine_courante'] = 1;
            } else {
                $semaine['est_semaine_courante'] = 0;
            }
        }

        return $semaines;
    }

    public static function semaine_lundi_vendredi($semaine, $annee)
    {
        $date = new DateTime();
        $date->setISODate($annee, $semaine);
        $date_lundi = $date->format('Y-m-d');
        $date_vendredi = $date->modify('+4 days')->format('Y-m-d');
        return array($date_lundi, $date_vendredi);
    }
    // Recuperation de la semainen à partir du numero de la semaine et de l'annee 
    public static function getMonthWithSemaineNumberYear($annee, $semaine)
    {
        $date = date("Y-m-d", strtotime("{$annee}-W{$semaine}-1")); // premier jour de la semaine
        $mois = date("m", strtotime($date)); // mois en format numérique

        return sprintf("%02d", $mois); // formatage avec 2 chiffres
    }

    public static function array_diff_recursive($array1, $array2)
    {
        $diff = array();
        foreach ($array1 as $value1) {
            $found = false;
            foreach ($array2 as $value2) {
                if ($value1 === $value2) {
                    $found = true;
                    break;
                }
            }

            if (!$found) {
                $diff[] = $value1;
            }
        }

        return $diff;
    }


    public static function filterBciToValid($entite, $query, $etat, $id = null)
    {
        $entite = $entite . '.*';
        $sumfinal = ',SUM(';
        $suminitial = ',SUM(';

        if (isset($id)) {
            $query = $query->where('bci_produits.produit_id', $id);
        }
        if (isset($etat)) {
            $query = $query
                ->where('bci_produits.etat', $etat);
            if ($etat == 1) {
                $sumfinal = $sumfinal . 'bci_produits.quantite) as quantite_total_final';
                $suminitial = $suminitial . 'bci_produits.quantite) as quantite_total_initial';
            }
            if ($etat == 2) {
                //$sumfinal = $sumfinal . 'bce_produit_entites.quantite_finale) as quantite_total_final' ;
                $sumfinal = '';
                $suminitial = '';
            }
        }


        $query = $query
            ->selectRaw($entite . $suminitial . $sumfinal);
        return $query;
    }

    public static function filterBciValidByBce($entite, $query, $id, $etat)
    {
        $entite = $entite . '.*';
        $query = $query->where('bci_produits.produit_id', $id)
            ->where('bci_produits.etat', $etat)
            ->selectRaw($entite . ', SUM(bci_produits.quantite)
                                      as quantite_total_initial, SUM(bci_produits.quantite)
                                      as quantite_total_final');
        return $query;
    }

    //Créer le dossier s'il n'existe pas encore
    public static function creerDossier($lien)
    {
        try {
            $fichierExiste = file_exists($lien);
            if ($fichierExiste == false) {
                mkdir($lien, 0755, true);
            }
            return true;
        } catch (\Exception $e) {
            //dd($e);
            Outil::textePourErreur("Erreur dans creerDossier ==> " . $e);
        }
    }

    public static function generateCode($id)
    {
        $count = "";
        $id = intval($id);
        if ($id <= 9) {
            $count = "000" . $id;
        } else if ($id >= 10 && $id <= 99) {
            $count = "00" . $id;
        } else if ($id >= 100 && $id <= 999) {
            $count = "0" . $id;
        } else if ($id > 999) {
            $count = $id;
        } else {
            $count = $id;
        }

        return $count;
    }

    public static function generateIndicatif($model, $indicatif = null)
    {
        $alias = '';
        if (isset($indicatif)) {
            $alias = $indicatif;
        } else {
            $modelName = class_basename($model);
            if (strtolower($modelName) == 'produits') {
                $alias = 'PRD';
            }
            if (strtolower($modelName) == 'clients') {
                $alias = 'CLI';
            }
            if (strtolower($modelName) == 'depots') {
                $alias = 'DPO';
            }
            if (strtolower($modelName) == 'commandes') {
                $alias = 'CMD';
            }
            if (strtolower($modelName) == 'departements') {
                $alias = 'DPT';
            }
            if (strtolower($modelName) == 'fournisseurs') {
                $alias = 'FRS';
            }
            if (strtolower($modelName) == 'bcis') {
                $alias = 'DD';
            }
            if (strtolower($modelName) == 'bces') {
                $alias = 'BC';
            }
            if (strtolower($modelName) == 'bes') {
                $alias = 'RCP';
            }
            if (strtolower($modelName) == 'actions') {
                $alias = 'ACT';
            }
            if (strtolower($modelName) == 'proformas') {
                $alias = 'PRF';
            }
            if (strtolower($modelName) == 'bts') {
                $alias = 'BTS';
            }
            if (strtolower($modelName) == 'depenses') {
                $alias = 'DEP';
            }
            if (strtolower($modelName) == 'factures') {
                $alias = 'FAC';
            }
            if (strtolower($modelName) == 'assemblages') {
                $alias = 'ASS';
            }
            if (strtolower($modelName) == 'livreurs') {
                $alias = 'LIV';
            }
            if (strtolower($modelName) == 'entites') {
                $alias = 'POS';
            }
            if (strtolower($modelName) == 'assemblages') {
                $alias = 'ASS';
            }
        }

        return $alias;
    }

    public static function getNumeroCodeEntite($model, $date)
    {
        $code = Bce::where('date_operation', $date)->max('numero_code');
        if (!isset($code)) {
            $model->numero_code = 1;
        } else {
            $model->numero_code = $code + 1;
        }
        $model->save();

        return $code;
    }

    public static function getCodeMenu($model, $entite)
    {
        $count = count(app($model)::where('is_menu', true)->get());
        $count = $count == 0 ?: 1;
        return 'Menu-' . $entite . '-' . $count;
    }

    public static function getCodeDaky($model, $indicatif)
    {
        $count = count(app($model)::all());
        $count = $count + 1;
        $code = $indicatif . "-00" . rand(0, 1000) . '-' . $count . '-' . date('y');
        return $code;
    }

    public static function Checkdetail($olddata, array $newdata, $model, $columns)
    {
        if (!is_array($columns)) {
            $columns = array($columns);
        }
        foreach ($olddata as $onedetail) {
            $retour = false;
            foreach ($newdata as $value) {
                $retour = true;
                foreach ($columns as $keyColumn => $onecolumn) {
                    if (isset($value[$onecolumn]))
                        if ($onedetail->$onecolumn != $value[$onecolumn]) {
                            $retour = false;
                            break;
                        }
                }
                if ($retour)
                    break;
            }
            if ($retour == false) {
                $iem = app($model)::find($onedetail->id);
                if ($iem) {
                    $iem->delete();
                    $iem->forceDelete();
                }
            }
        }
    }

    public static function redirectIfModeliSSaved($item, $queryName = null)
    {
        $item->save();
        // self::setUpdatedAtUserId($item);
        $id = $item->id;
        if (!isset($queryName)) {
            $queryName = self::getQueryNameOfModel($item->getTable());
        }

        Outil::publishEvent(['type' => substr($queryName, 0, (strlen($queryName) - 1)), 'add' => true]);

        return self::redirectGraphql($queryName, "id:{$id}", self::$queries[$queryName]);
    }

    // Upload any file
    public static function uploadFileToModel(&$request, &$item, $file = "image")
    {
        $tableNameCollei = null;
        if (!empty($request->file($file))) {
            $fichier = $_FILES[$file]['name'];
            $fichier_tmp = $_FILES[$file]['tmp_name'];
            $ext = explode('.', $fichier);
            $tableNameCollei = self::getQueryNameOfModel($item->getTable());
            $dossier = "uploads/" . $tableNameCollei;
            Outil::creerDossier($dossier);
            $rename = $dossier . "/{$file}_" . $item->id . "." . end($ext);
            //$rename = config('view.uploads')[$tableNameCollei] . "/{$file}_" . $item->id . "." . end($ext);
            //$rename = config('view.uploads')['actualites']."/{$file}_".$item->id.".".end($ext);
            move_uploaded_file($fichier_tmp, $rename);
            if ($tableNameCollei == 'bannieres') {
                $position = 0;
                $image = Image::where('banniere_id', $item->id);
                if ($file == "image1") {
                    $position = 0;
                } else if ($file == "image2") {
                    $position = 1;
                } else if ($file == "image3") {
                    $position = 2;
                } else if ($file == "image4") {
                    $position = 3;
                }
                $image = $image->skip($position)->first();
                if (empty($image)) {
                    $image = new Image();
                }
                $image->image = $rename;
                $image->banniere_id = $item->id;
                $image->save();
            } else {
                $item->$file = $rename;
            }
        } else if ($request->$file . "_erase") // Allows you to delete the user's image
        {
            $item->$file = null;
        }
        $item->save();
    }


    public static function setUpdatedAtUserId(Model &$item)
    {
        if ($item->wasChanged() || $item->isDirty()) {
            $item->updated_at_user_id = Auth::user()->id;
            $item->save();
        }
    }

    public static function importCarte($data, $path)
    {
        $report = array();
        $totalToUpload = count($data) - 1;
        $totalUpload = 0;
        $lastItem = null;
        $array_produit = array();
        $path = $path;
        DB::transaction(function () use (&$totalUpload, &$data, &$report, &$lastItem, &$array_produit) {
            for ($i = 1; $i < count($data); $i++) {
                $errors = null;
                $is_save = 0;
                $row = $data[$i];

                try {
                    $get_designation             = trim($row[0]);
                } catch (\Exception $e) {
                    $errors = "Vérifier le format du fichier";
                    array_push($report, [
                        'ligne'             => ($i),
                        'libelle'           => "Produits carte script",
                        'erreur'            => $errors,
                        'is_save'           => $is_save,
                    ]);
                    break;
                }

                $get_designation                        ?: $errors = "Veuillez definir la désignation";
                $newproduit                             = Produit::whereRaw('TRIM(lower(designation)) = TRIM(lower(?))', ["$get_designation"])->first();

                if (!isset($newproduit)) {
                    $errors = 'Le produit n\'existe pas';
                }
                if (!$errors) {
                    array_push($array_produit, [
                        'id'             => $newproduit->id,
                        'designation'    => $newproduit->designation,
                        'code'           => $newproduit->code,
                        'famille'        => $newproduit->famille
                    ]);
                    $lastItem = $newproduit;
                }
                if ($is_save) {
                    $totalUpload++;
                }

                if (!empty($get_designation) && !$is_save) {
                    array_push($report, [
                        'ligne'             => ($i + 1),
                        'libelle'           => $get_designation,
                        'erreur'            => $errors,
                        'is_save'           => $is_save,
                    ]);
                }
            }
        });
        File::delete($path);
        return $array_produit;
    }

    // Used to send the report after importing an Excel file
    public static function atEndUploadDataCarte($pathFile, $generateLink, $report, $user, $totalToUpload, $totalUpload, $importOf, $type = null)
    {
        // After import, we can delete the file

        File::delete($pathFile);
        //dd($pathFile);
        // dd($report);
        // Sending notification
        /*$notif = new Notif();
        $notif->message = "<strong>Fin de l'import du fichier excel {$importOf}</strong>,<br>Merci de consulter vos mails pour le rapport";
        $notif->link = "#!/list-{$generateLink}";
        $notif->save();
        $notifPermUser  = new NotifPermUser();
        $notifPermUser->notif_id = $notif->id;
        $notifPermUser->permission_id = Permission::where('name', "creation-{$generateLink}")->first()->id;
        $notifPermUser->user_id = $user->id;
        $notifPermUser->save();*/

        //  $eventNotif = new SendNotifEvent($notifPermUser);
        // event($eventNotif);

        // Outil::publishEvent(['type' => $generateLink, 'add' => true]);

        // Sending the email conaining the report

        // Send data to the view using loadView function of PDF facade
        $pdf = \PDF::loadView('pdfs.report-uploadfile-item', array(
            'reports'       => $report,
            'user'          => $user,
            'title'         => 'Rapport de l\'import du fichier ' . $importOf,
            'totals'        => [
                'toUpload'     => $totalToUpload,
                'upload'       => $totalUpload,
            ],
            'addToData' => array('entete' => null, 'hidefooter' => true)
        ));
        $objDemo = new \stdClass();
        $objDemo->demo_one = $importOf;
        $objDemo->demo_two = 'Demo Two Value';
        $objDemo->sender = 'ERP script';
        $objDemo->receiver = isset($user) ? $user->name : 'Non reconnu';
        //Envoi mail
        //Mail::to(isset($user->email) ?$user->email :  "skilah10@gmail.com")->send(new DemoEmail($objDemo,$pdf));
        //Mail::to("skilah10@gmail.com")->send(new DemoEmail($objDemo,$pdf));
        //$user->notify(new EndUploadExcelFileNotification($pdf, $importOf));
        // Outil::publishEvent(['type' => substr($type, 0, (strlen($type) - 1)), 'add' => true]);
        //return self::redirectGraphql($type, null, self::$queries[$type]);

        $array = array();
        if (isset($type) && count($type) > 0) {
            foreach ($type as $key => $value) {
                $array = array_merge($array, $value);
            }
        }
        // dd($type);
        // dd($array);
        // $produits = Produit::query()->whereIn('id', $type)->get();
        return response()->json(
            array(
                "data" => $type,
                //"message" => "Le fichier est en cours de traitement..."
                "message" => "Liste produit"
            )
        );
    }

    // Used to send the report after importing an Excel file
    public static function atEndUploadData($pathFile, $generateLink, $report, $user, $totalToUpload, $totalUpload, $importOf, $type = null)
    {
        // After import, we can delete the file
        File::delete($pathFile);
        // dd($report);
        // Sending notification
        /*$notif = new Notif();
        $notif->message = "<strong>Fin de l'import du fichier excel {$importOf}</strong>,<br>Merci de consulter vos mails pour le rapport";
        $notif->link = "#!/list-{$generateLink}";
        $notif->save();
        $notifPermUser  = new NotifPermUser();
        $notifPermUser->notif_id = $notif->id;
        $notifPermUser->permission_id = Permission::where('name', "creation-{$generateLink}")->first()->id;
        $notifPermUser->user_id = $user->id;
        $notifPermUser->save();*/

        //  $eventNotif = new SendNotifEvent($notifPermUser);
        // event($eventNotif);

        // Outil::publishEvent(['type' => $generateLink, 'add' => true]);

        // Sending the email conaining the report

        // Send data to the view using loadView function of PDF facade
        $pdf = \PDF::loadView('pdfs.report-uploadfile-item', array(
            'reports'       => $report,
            'user'          => $user,
            'title'         => 'Rapport de l\'import du fichier ' . $importOf,
            'totals'        => [
                'toUpload'     => $totalToUpload,
                'upload'       => $totalUpload,
            ],
            'addToData' => array('entete' => null, 'hidefooter' => true)
        ));
        $objDemo = new \stdClass();
        $objDemo->demo_one = $importOf;
        $objDemo->demo_two = 'Demo Two Value';
        $objDemo->sender = 'ERP script';
        $objDemo->receiver = isset($user) ? $user->name : 'Non reconnu';

        //Envoi mail
        $piecesjointes = array();
        array_push($piecesjointes, $pdf);
        $envoiEmail = Outil::envoiEmail("birahime.10@gmail.com", "Erreurs import", "Voici les erreurs de l'import", "maileur", null, null, $piecesjointes);
        // Mail::to(isset($user->email) ?$user->email :  "abou050793@gmail.com")->send(new DemoEmail($objDemo,$pdf));
        // Mail::to("abou050793@gmail.com")->send(new DemoEmail($objDemo,$pdf));
        //$user->notify(new EndUploadExcelFileNotification($pdf, $importOf));
        // Outil::publishEvent(['type' => substr($type, 0, (strlen($type) - 1)), 'add' => true]);
        //return self::redirectGraphql($type, null, self::$queries[$type]);
        return isset($type) ? Outil::redirectIfModeliSSaved($type) : null;
    }
    //Elle formate les dates au format anglais en format français
    public static function transforme_date_fr($date)
    {
        if (!isset($date))
            return null;
        return Carbon::parse($date)->format('d-m-Y H:i:s');
    }

    //Elle change le type plan_charge en plan de charge
    public static function changeType($type)
    {
        if ($type == "plan_charge") {
            $type = "Plan de charge";
            return $type;
        }
    }


    //Elle formate les dates au format anglais en format français
    public static function getCreatedDateFr($root, $args)
    {

        $created_at = !(isset($root['created_at'])) ? $root->created_at : $root['created_at'];

        if (!isset($created_at))
            return null;
        return Carbon::parse($created_at)->format('d/m/Y H:i:s');
    }

    //Elle formate les dates au format anglais en format français
    public static function getUpdatedDateFr($root, $args)
    {

        $updated_at = !(isset($root['updated_at'])) ? $root->updated_at : $root['updated_at'];

        if (!isset($updated_at))
            return null;
        return Carbon::parse($updated_at)->format('d/m/Y H:i:s');
    }

    public static function getPermissionTypeTransaction()
    {
        return config('env.PERMISSION_TRANSACTION');
    }

    public static function getPermissionTypeTransaction2()
    {
        return config('env.PERMISSION_TRANSACTION2');
    }

    public static function isAuthorize($currentUser = true, $userId = null)
    {
        //Récupration utilisateur
        if ($currentUser) {
            $user = Auth::user();
            if (empty($user)) {
                $user = User::where('email', 'script@gmail.com')->first();
            }
        } else {
            $user = User::find($userId);
        }

        //Test
        if ($user->can(self::getPermissionTypeTransaction2())) {
            $retour = 2;
        } else if ($user->can(self::getPermissionTypeTransaction())) {
            $retour = 1;
        } else {
            $retour = 0;
        }

        return $retour;
    }


    public static function canCreateWithSelfValidation($for)
    {
        $permission = "creation-" . (substr($for, 0, strlen($for) - 1)) . "-auto-validation";
        return (Auth::user() && auth()->user()->can($permission));
    }

    public static function getNameRoleOfOthersDepots()
    {
        return 'autre-depot';
    }

    public static function getNamePermissionMagasinier($getPermission = true)
    {
        return $getPermission ? "preparation-sortie" : "responsable-magasin";
    }

    public static function getAPI()
    {
        return config('env.APP_URL');
    }

    public static function getResponseError(\Exception $e)
    {
        return response()->json(array(
            'errors' => [$e->getMessage()],
            'errors_debug' => [$e->getMessage()],
            'errors_line' => [$e->getLine()],
        ));
    }

    public static function getOperateurLikeDB()
    {
        return config('database.default') == "mysql" ? "like" : "ilike";
    }


    // Gives the normalized name of the query according to the name of the database
    public static function getQueryNameOfModel($nameTable)
    {
        $retour = "";
        if ($nameTable == "ligne_de_credits") {
            $retour = "lignecredits";
        } else {
            $retour = str_replace("_", "", $nameTable);
        }
        return $retour;
    }

    public static function getClientPassage($isSociety = false)
    {
        return Client::where('nom_complet', self::getOperateurLikeDB(), 'Client de passage ' . ($isSociety ? 'societe' : 'particulier'))->first();
    }

    public static function getTypeDecimalDB()
    {
        return config('database.default') == "mysql" ? "" : "::decimal";
    }
    public static function regulePaiement($id)
    {
        $commande = Commande::find($id);
        $query = DB::table('paiements')
            ->join('commandes', 'commandes.id', '=', 'paiements.commande_id')
            ->selectRaw('sum(paiements.montant) as montant_total_paye')
            ->where('commandes.id', $commande->id);


        $offerts = DB::table('commande_produits')
            ->join('commandes', 'commandes.id', '=', 'commande_produits.commande_id')
            ->selectRaw('sum(commande_produits.montant) as montant_total_offert')
            ->where('commandes.id', $commande->id)
            ->where('commande_produits.offre', true)
            ->first();

        if (isset($query->first()->montant_total_paye)) {
            $montant_init = $commande->montant_total_commande - $query->first()->montant_total_paye;
            if (isset($offerts) && isset($offerts->montant_total_offert)) {
                $montant_init = $montant_init - $offerts->montant_total_offert;
            }
            $commande->restant_payer      = $montant_init;
            $commande->montant_total_paye = $query->first()->montant_total_paye;
        } else {
            $montant_init = $commande->montant_total_commande;
            if (isset($offerts) && isset($offerts->montant_total_offert)) {
                $montant_init = $montant_init - $offerts->montant_total_offert;
            }
            $commande->restant_payer      = $montant_init;
            $commande->montant_total_paye = 0;
        }
        $commande->save();
        return $commande;
    }

    public static function getPrixProduitByTypePrix($produit_id, $carte_id)
    {
        $carte = Carte::find($carte_id);
        $produit = Produit::find($produit_id);
        $prix_vente = null;
        if (isset($carte) && isset($produit)) {
            $type_prix_vente = $carte->type_prix_vente;

            if (isset($type_prix_vente) && isset($type_prix_vente->id)) {
                $prix_vente = Prixdevente::where('produit_id', $produit->id)->where('type_prix_de_vente_id', $type_prix_vente->id)->first();
            }
        }

        return $prix_vente;
    }

    public static function getProduitCarteFamille($query = null, $is_carte = null, $entite_id = null, $famille_id = null, $carte_id = null, $commande_id = null, $type_produit = null)
    {
        $entite = null;
        $entite = $entite_id;
        $active_carte = false;
        $carte = null;
        $montant_carte = "";
        $commande = isset($commande_id) ? Commande::find($commande_id) : null;

        $query = $query ? $query->selectRaw("produits.*") : Produit::query()->selectRaw("produits.*");

        if (isset($entite_id)) {
            $carte = Carte::where('entite_id', $entite_id)->where('activer', $is_carte)->first();
        } else if (isset($carte_id)) {
            $carte = Carte::where('id', $carte_id)->first();
        }

        if (isset($commande) && isset($commande->id) && $type_produit == 'commande_produits') {
            $query = $query
                ->join('commande_produits', 'commande_produits.produit_id', '=', 'produits.id')
                ->join('commandes', 'commandes.id', '=', 'commande_produits.commande_id')
                // ->join('paiements', 'paiements.id', '=', 'commande_produits.paiement_id')
                ->where('commandes.id', $commande->id)
                ->where('produits.is_menu', false);
            $montant_carte = ",commande_produits.paiement_id as paiement_id, commande_produits.etat_paiement as etat_paiement,commande_produits.montant as montant, commande_produits.index as index, commande_produits.offre as offre, commande_produits.action as action, commande_produits.commentaire as commentaire,commande_produits.direct as direct,commande_produits.menu_commande_id as menu_commande_id,commande_produits.index_menu as index_menu";
        }


        if (isset($carte) && isset($carte->id)) {
            //  var_dump($carte->designation);
            if (isset($carte)) {
                $active_carte = true;
            }
            $query = $query->join('carte_produits', 'carte_produits.produit_id', '=', "produits.id")
                ->join('cartes', 'cartes.id', '=', 'carte_produits.carte_id')
                ->where('cartes.entite_id', $carte->entite_id)
                ->where('cartes.activer', true)
                ->where('cartes.id', $carte->id);

            if ($active_carte == true) {
                $montant_carte = ",prix_de_ventes.montant";
                $query = $query
                    ->join('prix_de_ventes', 'prix_de_ventes.produit_id', '=', 'produits.id')
                    ->join('type_prix_de_ventes', 'type_prix_de_ventes.id', '=', 'prix_de_ventes.type_prix_de_vente_id')
                    ->where('type_prix_de_ventes.id', $carte->type_prix_vente_id);
            }
        }
        if (isset($famille_id)) {
            $query = $query
                ->join('familles', 'familles.id', '=', 'produits.famille_id')
                ->where('familles.id', $famille_id);
        }

        if (!isset($famille_id) && !isset($carte->id) && !isset($commande->id)) {
            $query = Produit::query()->whereNull('id');
        }

        $query->selectRaw("produits.*" . $montant_carte);

        return $query;
    }

    public static function getFamilleInCarte($query, $is_carte, $entite_id, $carte_id = null)
    {
        $carte = null;
        //        if(isset($entite_id)){
        //            $carte = Carte::where('entite_id',$entite_id)->where('activer',$is_carte)->first();
        //        }else{
        //            $carte = Carte::where('id',$carte_id)->first();
        //        }
        $carte = isset($entite_id) ? Carte::where('entite_id', $entite_id)->where('activer', $is_carte)->first() : Carte::where('id', $carte_id)->first();
        // var_dump($carte->entite_id, $is_carte);
        if (isset($carte) && isset($carte->id)) {

            $query = $query->join('produits', 'produits.famille_id', '=', "familles.id")
                ->join('carte_produits', 'carte_produits.produit_id', '=', "produits.id")
                ->join('cartes', 'cartes.id', '=', 'carte_produits.carte_id')
                ->where('cartes.entite_id', $carte->entite_id);
            //->where('cartes.activer', 1)
            //  ->groupBy('familles.id');
            $query =  $query->selectRaw("familles.*");
        } else {
            $query = Famille::query()->whereNull('id');
        }

        return $query;
    }

    public static function getMsgError()
    {
        return config('env.MSG_ERROR');
    }

    // Like name, resolve image with correct base_url
    public static function resolveImageField($image)
    {
        if (!isset($image)) {
            $image = "/assets/images/upload.jpg";
        } else {
            // In the event that an image exists in the database, in versioning
            $image = $image . '?date=' . (date('Y-m-d H:i'));
        }

        if (isset($image))
            return Outil::getAPI() . $image;
        return $image;
    }

    public static function getCodeChange($model, $indicatif)
    {
        $count = count(app($model)::all());
        $count = $count + 1;
        $code  =  $indicatif . "-00" . rand(0, 1000) . '-' . $count . '-' . date('y');
        return $code;
    }
    // Publish the event on the channel for RealTime
    public static function publishEvent($data)
    {
        $eventRT = new RtEvent($data);
        event($eventRT);
    }

    public static function makecontroller($table_name)
    {
        $mycontroller = self::makeModel($table_name) . 'Controller';
        $app = app();
        $controller = $app->make('\App\Http\Controllers\\' . $mycontroller);
        return $controller;
    }

    public static function makeModel($classe)
    {
        $myclasse = ucfirst($classe);
        if (strpos($classe, '_') !== false) {
            $namethree = '';
            $namefour = '';
            $namefive = '';
            $nameone =  explode('_', $classe)[0];
            $nametwo =  explode('_', $classe)[1];
            if (count(explode('_', $classe)) > 2) {
                $namethree =  explode('_', $classe)[2];
            }
            if (count(explode('_', $classe)) > 3) {
                $namefour =  explode('_', $classe)[3];
            }
            if (count(explode('_', $classe)) > 4) {
                $namefive =  explode('_', $classe)[4];
            }
            $nameone = ucfirst($nameone);
            $nametwo = ucfirst($nametwo);
            $namethree = ucfirst($namethree);
            $namefour = ucfirst($namefour);
            $namefive = ucfirst($namefive);
            $myclasse = $nameone . $nametwo . $namethree . $namefour . $namefive;
        }

        return $myclasse;
    }
    public static function generateFilePdfOrExcel(Request $request, $queryName, $type, $id = null)
    {
        //$user        = Auth::user()->name;
        $user        = 'Aoudy';
        $myname = null;
        if (strpos($queryName, 'regule') !== false && $queryName != 'type_regules') {
            $Model       = self::makeModel('regule');
            $myname =  substr(explode('regule_', $queryName)[1], 0, -1);
        } else {
            $Model       = self::makeModel(substr($queryName, 0, -1));
        }
        $queryName   = $queryName = self::getQueryNameOfModel($queryName);
        $object      = array_keys($request->all());
        $folder      = config('env.FOLDER');
        $filtre      = isset($id) ? "id:{$id}" : (count($object) > 0 && (!isset($folder) || strpos(end($object), $folder) == false) ? end($object) : "");

        $data        = self::getOneItemWithFilterGraphQl($queryName, $filtre);
        $details     = null;
        if (isset($id)) {
            $filtre_detail         = "parent_id:$id";
            $queryName_detail      = "detail{$queryName}";
            $details               = self::getOneItemWithFilterGraphQl($queryName_detail, $filtre_detail);
        }
        if (count($data)) {
            $mymodel           = app('App\\' . $Model);
            $titre             = $mymodel->getTitrePdf($myname);
            $headerTable       = $mymodel->getHeaderTablePdf($myname);
            $bodyTablePdf      = $mymodel->getBodyTablePdf($myname);
            $permission = substr($queryName, 0, -1);
            $permission = isset($id) ? "detail-" . $permission : "liste-" . $permission;
            $addToLink            = (isset($id) ? "detail-" : "");
            $data                 = array('user' => $user, 'titre' => $titre, 'header' => $headerTable, 'body' => $bodyTablePdf,  'permission' => $permission, 'data' => $data, 'is_excel' => false, 'details' => $details);
            if ($type == "pdf") {
                if (isset($id)) {
                    $pdf          = PDF::loadView("pdfs.{$addToLink}{$queryName}", $data);
                } else {
                    $queryName   = 'downloadPdfOrExcel';
                    $pdf         = PDF::loadView("pdfs.{$addToLink}{$queryName}", $data);
                }
                return $pdf->stream("{$addToLink}{$queryName}");
            } else {
                if (!isset($id)) {
                    $queryName   = 'downloadPdfOrExcel';
                }
                return Excel::download(new DatasExport($data, $queryName, $id), "{$addToLink}{$queryName}.xlsx");
            }
        } else {
            return redirect()->back();
        }
    }




    public static function getEtat($etat)
    {
        switch ($etat) {
            case 1:
                return 2;
                break;
            case 2:
                return 3;
                break;
            case 4:
                return 4;
                break;
            case 0 || null:
                return 2;
                break;
            default;
        }
    }

    public static $queries = array(
        //-------------DEBUT ==> MES REQUETES PERSONNALISEES--------------------//
        //markme-AJOUT
        "preferences"       => "id,list_id,delais_notification,emails_a_notifier",
        "entreprises"       => "id,code,designation,tel,comment,login,password",
        "contacts"          => "id,id_lvdc,nom_complet,date_naissance,cqp,civilite,annee_obtention,lien,entreprise_code,entreprise_designation,genre,expert_metier,objectif_operation,siret,type_contrat,ville,tel,mail,updated_user_id,comment,etat_text,etat_badge",
        "users"             => "id,image,name,nom,prenom,email,est_evaluateur,numerotel,id_askia,password_seen,roles{id,name},created_at_fr,updated_at_fr,last_login",
        "categories"        => "id,designation,ordre,competences_count,competences{id,designation},created_at,created_at_fr,updated_at",
        "fournisseurs"      => "id,designation,created_at,created_at_fr,updated_at",
        "competences"       => "id,designation,ordre,categorie_id,categorie{id,designation},created_at,updated_at,created_at_fr",
        "periodes"          => "id,designation,type,date_notification,active,active_text,fournisseur{id,designation,liste_evaluateur,fournisseur_evaluateurs{id,evaluateur_id,fournisseur_id,evaluateur{id,name}}},active_badge,competences_remplies,competences_valides,total_competences,remplissage_badge,created_at,updated_at,created_at_fr,date_notification_fr",
        "connexions"        => "id,login,last_login_ip,user_id,user{id,name,email},created_at_fr",
        "r2as"  => "id,etude_id,listId_codification,code,mode,mode_codification,nbre_ligne,nbre_traite,etat,avancement,questions_aides,questions_ouvertes,etude{id,numero_etude,nom_etude,id_askia},nombre_relecteurs,designation_codification,type_entretien_codification,date_envoie_codification,date_restrict_codification,date_facturaction_codification,codification_relecteurs{id,codification_id,relecteur_id,pourcentage,nbre_traite,taux_traiter,nbre_ligne,notifie,termine,desactive,relecteur{id,nom_complet,email,tel}}",
        "bases"             => "id,etude_id,listId_codification,code,mode,mode_codification,nbre_ligne,nbre_traite,etat,avancement,questions_aides,questions_ouvertes,etude{id,numero_etude,nom_etude,id_askia},nombre_relecteurs,designation_codification,type_entretien_codification,codification_relecteurs{id,codification_id,relecteur_id,pourcentage,nbre_traite,nbre_ligne,notifie,termine,desactive,relecteur{id,nom_complet,email,tel}}",
        "requetes"          => "retour",

        "relectures"        => "id,r2a_id,debut,debut_fr,fin,fin_fr,duree,r2a{designation},verbatim,verbatim_relu,id_lvdc,shortcut",
        "envoies"           => "id,user_id,r2a_id,user{name},r2a{designation},created_at,created_at_fr,updated_at,updated_at_fr",
        "codificationrelecteures" => "id,codification_id,relecteur_id,nbre_ligne,nbre_entreprise,nbre_traite,etat,pourcentage",
        //-------------FIN ==> MES REQUETES PERSONNALISEES--------------------//
    );


    public static $guzzleOptions = ['auth' => ['script@gmail.com', 'R2a']];

    // Permet de créer les elements default du systeme
    public static function FirstLaunch()
    {
    }

    public static function filterQueryByEntityUser($type, $query, $id)
    {

        $user = Auth::user();
        if (isset($user)) {
            $user_id = $user->id;
        }

        if (!isset($user_id)) {
            $user_id = $id;
        }


        if (isset($user_id) && isset($user_id)) {
            $get_entites = UserEntite::where('user_id', $user_id)->get('entite_id');
            if (isset($get_entites) && count($get_entites) > 0) {
                if ($type == 'commande') {
                    $query = $query->whereIn('commandes.entite_id', $get_entites);
                } else if ($type == 'reservation') {
                    $query = $query->whereIn('reservations.entite_id', $get_entites);
                }
            }
        }
        return $query;
    }
    public static function addWhereToModel(&$query, $args, $filtres)
    {
        foreach ($filtres as $key => $value) {
            if (isset($args[$value[0]])) {
                $operator = $value[1];
                $valueColumn = $args[$value[0]];
                if ($operator == 'join') {
                    $second = $value[2];
                    $query->whereRaw("{$second}_id in (select id from {$second}s where {$value[0]}=?)", [$valueColumn]);
                } else if ($operator == 'date') {
                    if (isset($args['date_start']) && isset($args['date_end'])) {
                        // Si la colonne est précisée, on utilise la colonne, sinon, on match avec la colonne date
                        $column = isset($value[2]) ? $value[2] : "date";

                        $from = $args['date_start'];
                        $to = $args['date_end'];

                        // Eventuellement la date fr
                        $from = (strpos($from, '/') !== false) ? Carbon::createFromFormat('d/m/Y', $from)->format('Y-m-d') : $from;
                        $to = (strpos($to, '/') !== false) ? Carbon::createFromFormat('d/m/Y', $to)->format('Y-m-d') : $to;

                        //$from = date($from.' 00:00:00');
                        //$to = date($to.' 23:59:59');
                        $query->whereBetween($column, array($from, $to));
                    }
                } else {
                    if ($operator == 'like') {
                        $operator = self::getOperateurLikeDB();
                        $valueColumn = '%' . $valueColumn . '%';
                    }
                    $query->where($value[0], $operator, $valueColumn);
                }
            }
        }
    }
    public static function redirectgraphql($itemName, $critere, $liste_attributs)
    {
        $path = '{' . $itemName;
        if (isset($critere)) {
            $path .= '(' . $critere . ')';
        }
        $path .= '{' . $liste_attributs . '}}';
        return redirect('graphql?query=' . urlencode($path));
    }

    public static function isUnique(array $columnNme, $value, $id = null, $model, $columnIdName = null)
    {
        $exist = true;
        if ($id != null) {
            if ($columnIdName != null) {
                $query = app($model)->where($columnIdName, '!=', $id);
            } else {
                $query = app($model)->where('id', '!=', $id);
            }
        } else {
            $query = app($model);
        }
        for ($i = 0; $i < count($columnNme); $i++) {
            $query = $query->where($columnNme[$i], $value[$i]);
        }
        return $query->first() == null;
    }

    public static function formatdate($for_edit = false, $getSeparator = false)
    {
        if (!$getSeparator)
            return $for_edit ? "d/m/Y H:i:s" : "Y-m-d H:i:s";
        else
            return "/";
    }

    public static function formatdateShort($for_edit = false, $getSeparator = false)
    {
        if (!$getSeparator)
            return $for_edit ? "d/m/Y" : "Y-m-d H:i:s";
        else
            return "/";
    }

    protected static function resolveDateFr($date)
    {
        try {
            $date_at = $date;
            $date_at = date_create($date_at);
            return date_format($date_at, "d-m-Y");
        } catch (\Exception $e) {
            //dd($e); //Pour voir l'erreur précis
            $errorArray = array("type" => "mail_suivi", "designation" => "Outil->resolveDateFr->Erreur lors du traitement", "erreur" => $e);
            Outil::saveError($errorArray);
        }
    }

    public static function getOneItemWithGraphQl($queryName, $id_critere, $justone = true)
    {
        $guzzleClient = new \GuzzleHttp\Client();

        $critere = (is_numeric($id_critere)) ? "id:{$id_critere}" : $id_critere;

        $queryAttr = Outil::$queries[$queryName];

        $url = self::getAPI() . "graphql?query={{$queryName}({$critere}){{$queryAttr}}}";

        $response = $guzzleClient->request('GET', $url, self::$guzzleOptions);

        $data = json_decode($response->getBody(), true);
        //dd($data);

        return ($justone) ? count($data['data'][$queryName]) > 0 ? $data['data'][$queryName][0] : null : $data;
    }

    public static function getAllItemsWithGraphQl($queryName, $filter = null)
    {
        try {
            $critere = isset($filter) ? '(' . $filter . ')' : "";
            $guzzleClient = new \GuzzleHttp\Client();
            $queryAttr = Outil::$queries[$queryName];
            $queries = $queryName . $critere;

            $url = self::getAPI() . "graphql?query={{$queries}{{$queryAttr}}}";
            $response = $guzzleClient->request('GET', $url, self::$guzzleOptions);

            $data = json_decode($response->getBody(), true);
            /* dd($data); */
            return $data['data'][$queryName];
        } catch (\Exception $e) {
            dd($e); //Pour voir l'erreur précis
        }
    }

    public static function getOneItemWithFilterGraphQl($queryName, $filter, array $listeattributs_filter = null)
    {


        $guzzleClient = new \GuzzleHttp\Client();

        $critere = !empty($filter) ? '(' . $filter . ')' : "";
        if ($queryName == "pdffactures") {
            $queryName = "factures";
            $queryAttr = "id,code,date_facture,date_facture_fr,etat_livraison,remise,prix_ttc,total_net,id_devise,libelle_devise,taux_devise,signe_devise,numfac,date_depart,date_arrivee,observations,id_fournisseur,fournisseur{id,code,nom_fournisseur,civilite,adresse,pays,telephone,email,devise{id,libelle,taux_echange,signe}},user{id,name,image},detailFactures{id,quantite_colis,quantite_unitaire,colisage,etat_livraison,present_dans_reception,remise,prix_achat_ttc,prix_achat_hors_ttc,prix_achat_off,id_facture,id_det_comm,detComm{id,id_commande,id_produit,quantite_colis,quantite_unitaire,colisage,prix_achat_hors_ttc,prix_achat_off,remise,produit{id,code,code_current_fournisseur,etat,designation_fr,designation_en,uniteMesure{id,libelle},image,codeFournisseurs{id,code,id_produit,id_fournisseur,fournisseur{id,code,nom_fournisseur}}}},detailReceptions{id,quantite_colis,quantite_unitaire,est_ok,prix_revient,prix_revient_off,observations,id_reception,id_detail_facture}},created_at,created_at_fr,updated_at,updated_at_fr";
        } else if ($queryName == "pdfcommandes") {
            $queryName = "commandes";
            $queryAttr = "id,code,date_commande,date_commande_fr,remise,prix_ttc,total_net,total,totaloff,qte_en_cmde,nbre_prod,etat_livraison,id_devise,libelle_devise,taux_devise,signe_devise,numproforma,id_fournisseur,id_dp,etat,fournisseur{id,nom_fournisseur,civilite,adresse,pays,telephone,email,devise{id,libelle,taux_echange,signe}},user{id,name,image},detailCommandes{id,quantite_colis,quantite_unitaire,qte_restante,colisage,etat_livraison,present_dans_facture,remise,prix_achat_ttc,prix_achat_hors_ttc,prix_achat_off,id_commande,id_produit,produit{id,code,code_current_fournisseur,designation_fr,designation_en,uniteMesure{id,libelle},image,codeFournisseurs{id,code,id_produit,id_fournisseur,fournisseur{id,nom_fournisseur}}},detailFactures{id,id_facture,id_det_comm,quantite_colis,quantite_unitaire,colisage,remise,prix_achat_ttc,prix_achat_hors_ttc,prix_achat_off,detailReceptions{id,quantite_colis,quantite_unitaire,est_ok,observations,id_reception,id_detail_facture}}},detailVersements{id_commande,id_versement,montant,versement{id,id_user,date_versement,montant,created_at,created_at_fr,updated_at,updated_at_fr,user{id,name,email}}},created_at,created_at_fr,updated_at,updated_at_fr";
        } else if ($queryName == "pdfdemandeprix") {
            $queryName = "demandeprix";
            $queryAttr = "id,code,date,id_devise,libelle_devise,taux_devise,signe_devise,id_fournisseur,etat,fournisseur{id,code,nom_fournisseur,civilite,adresse,pays,telephone,email,devise{id,libelle,taux_echange,signe}},user{id,name,image},detailDemandePrix{id,quantite_colis,quantite_unitaire,colisage,id_dp,id_produit,produit{id,code,code_current_fournisseur,etat,designation_fr,designation_en,image,prix_achat,prix_achat_off,uniteMesure{id,libelle},codeFournisseurs{id,code,id_produit,id_fournisseur,fournisseur{id,code,nom_fournisseur}}}},created_at,created_at_fr,updated_at,updated_at_fr";
        } else if ($queryName == "pdfinventaires") {
            $queryName = "inventaires";
            $queryAttr = 'id,date_inventaire,date_inventaire_fr,code,motif,id_depot,depot{id,code,libelle}, motif, date_regulation,id_user,detail_inventaires{id,quantite_colis_stock,quantite_unitaire_stock,quantite_colis_inv,quantite_unitaire_inv,produit{designation_fr,code,uniteMesure{id,libelle}}}';
        } else {
            $queryAttr = Outil::$queries[$queryName];
        }


        $add_text_filter = "";
        if (isset($listeattributs_filter)) {
            foreach ($listeattributs_filter as $key => $one) {

                $queryAttr = str_replace($one . ",", "", $queryAttr); // Si le paramètre existe, on le remplace dans la chaine de caractère

                $getAttr = $one;
                $reste = "";
                if (strpos($one, "{") !== false) {
                    $getAttr = substr($one, 0, strpos($one, "{"));
                    $reste = substr($one, strpos($one, "{"));
                }

                $add_text_filter .= (($key === 0) ? ',' : '') . $getAttr . $critere . $reste . (count($listeattributs_filter) - $key > 1 ? ',' : '');
            }
        }


        $url = self::getAPI() . "graphql?query={{$queryName}{$critere}{{$queryAttr}{$add_text_filter}}}";

        $response = $guzzleClient->request('GET', $url, self::$guzzleOptions);

        $data = json_decode($response->getBody(), true);


        return $data['data'][$queryName];
    }

    public static function getPdf($queryName, $id_critere, $justone = true, $addToData = null)
    {
        $data = Outil::getOneItemWithGraphQl($queryName, $id_critere, $justone);

        $data['addToData'] = $addToData;

        $pdf = PDF::loadView("pdfs.{$queryName}", $data);
        return $pdf->setPaper('a4', 'orientation')->stream();
    }

    public static function createValidation($object, $rules, $messages)
    {
        // Create validation using Validation facade and pass in the Inputs, the rules andd the error messages
        $validator = Validator::make($object, $rules, $messages);

        $obj = null;

        // If Validation fails 8
        if ($validator->fails()) {

            // Get all validations errors
            $errors = $validator->errors();

            // Create array and cast it to object
            $obj = (object)array('data' => null, 'errors' => $errors);
        }

        return $obj;
    }

    public static function updateValidation($object, $rules, $messages, $model, $unique = [])
    {

        // Add id validation rule to the general rules
        $rules['id'] = 'required|exists:' . $model;

        if (count($unique) != 0) {
            foreach ($unique as $x) {
                $rules[$x] = $rules[$x] . ',' . $object['id'];
            }
        }

        // Add id validation message to the general rules
        $messages['id.required'] = 'L\'id de ' . $model . ' est requis';
        $messages['id.exists'] = 'Cet id n\'existe pas';

        $validator = Validator::make($object, $rules, $messages);

        $obj = null;

        // If Validation fails 8
        if ($validator->fails()) {

            // Get all validations errors
            $errors = $validator->errors();

            // Create array and cast it to object
            $obj = (object)array('data' => null, 'errors' => $errors);
        }

        return $obj;
    }


    //Vérifier présence objet dans un array (Demande Prix)
    public static function verifierPresence($array, $unElement)
    {
        $retour = false;
        foreach ($array as $key => $value) {
            if (isset($value["id"])) {
                if ($value['id'] == $unElement) {
                    $retour = true;
                    return true;
                }
            }
        }
        return $retour;
    }

    //Pour 2 colonnes
    public static function verifierPresenceDeuxColonnes($array, $unElement, $autreElement)
    {
        $retour = false;
        foreach ($array as $key => $value) {
            if (isset($value["id"]) && isset($value["idDepot"])) {
                if ($value['id'] == $unElement && $value["idDepot"] == $autreElement) {
                    $retour = true;
                    return true;
                }
            }
        }
        return $retour;
    }


    public static function getWithSousFamille($id_sous_famille, $column)
    {
        $id_sous_famille = !empty(trim($id_sous_famille)) ? $id_sous_famille : null;
        return (isset($id_sous_famille) ? "AND " . $column . " in (select id from produits where id_sous_famille IN ($id_sous_famille) OR id_sous_famille in (select id from familles where parent_id IN ($id_sous_famille) ))" : "");
    }

    public static function getPrixDeVenteProduitEntite($id_produit, $entite)
    {
        return null;
    }


    public static function numberToLetter($nbr)
    {
        $numberToWords = new NumberToWords();

        $numberTransformer = $numberToWords->getNumberTransformer('fr');

        return $numberTransformer->toWords($nbr);
    }

    public static function getCount($array, $ct, $max)
    {

        $modulo = count($array) % $ct;
        $quotient = floor(count($array) / $ct);

        $count = 0;

        if ($modulo == 0 && $quotient == 1) {
            $count = $max;
        } else if ($modulo == 0 && $quotient > 1) {
            $count = $max - (($ct + $quotient) * 10);
        } else if ($modulo > 0 && $quotient > 1) {
            $count = $max - (($ct + $modulo) * 10);
        } else {
            $count = $max;
        }

        return $count;
    }
    public static function majCommandeProduitProduit($item)
    {
        $commande_produit_produits = CommandeProduitProduit::query()
            ->where('commande_produit_id', $item->id)->get();
        if (isset($commande_produit_produits) && count($commande_produit_produits) > 0) {
            foreach ($commande_produit_produits as $keyc => $cpp) {
                if (isset($cpp)) {
                    $cpp->action = $item->action;
                    $cpp->save();
                }
            }
        }
    }
    public static function checkRatioPreparationProduitCommande($item)
    {
        $etat_commande_produit = null;
        if (isset($item)) {
            //Tous les produits termines de la commande
            $allProduitTermine = CommandeProduitProduit::query()->where('commande_produit_id', $item->id)
                ->where('action', 4)
                ->get();
            //Tous les produits non termines de la commande
            //Tous les produits de la commande
            $allProduit = CommandeProduitProduit::query()->where('commande_produit_id', $item->id)
                ->get();
            // if(isset($allProduitEnpreparation) && count($allProduitEnpreparation) >= 0){
            if (isset($allProduitTermine) && count($allProduitTermine) >= 0) {
                if (isset($allProduit) && count($allProduit) > 0) {
                    if (count($allProduit) == count($allProduitTermine)) {
                        $etat_commande_produit = 4;
                    } else {
                        $etat_commande_produit = null;
                    }
                }
            }
            // if(isset($etat_commande_produit)){
            $item->action = $etat_commande_produit;
            $item->save();
            $commande = Commande::query()->where('id', $item->commande_id)->first();
            if (isset($commande)) {
                $etat = self::checkRatioPreparationCommande($commande);
                if (isset($etat)) {
                    $commande->etat_commande = $etat;
                    $commande->save();
                }
            }
            //  }

        }
    }
    // Chercher les produit de la commande terminees er non terminees
    public static function checkRatioPreparationCommande($item)
    {
        $etat_commande = null;
        if (isset($item)) {
            //Tous les produits termines de la commande
            $allProduitTermine = Commandeproduit::query()->where('commande_id', $item->id)
                ->where('action', 4)
                ->get();
            //Tous les produits non termines de la commande
            //Tous les produits de la commande
            $allProduit = Commandeproduit::query()->where('commande_id', $item->id)
                ->get();
            // if(isset($allProduitEnpreparation) && count($allProduitEnpreparation) >= 0){
            if (isset($allProduitTermine) && count($allProduitTermine) >= 0) {
                if (isset($allProduit) && count($allProduit) > 0) {
                    if (count($allProduit) == count($allProduitTermine)) {
                        $etat_commande = 4;
                    } else {
                        $etat_commande = 3;
                    }
                }
            }
        }
        return $etat_commande;
    }


    // initialisation des parameters init
    public static function setParametersExecution()
    {
        ini_set('max_execution_time', -1);
        ini_set('max_input_time', -1);
        ini_set('pcre.backtrack_limit', 50000000000);
        ini_set('memory_limit', -1);
    }

    //Donne l'identifiant que le contact va utiliser
    public static function donneLoginUser($item)
    {
        $retour = null;
        if (isset($item)) {
            $retour = Outil::faireMatricule("user", $item->id);
            $item->email = $retour;
            $item->save();
        }
        return $retour;
    }

    //Donne l'état et la couleur du badge au niveau de la liste
    public static function donneEtatGeneral($type, $itemArray = null)
    {
        $retour = null;
        if ($type == "etat_general") {
            if (isset($itemArray)) {
                $etat = $itemArray["etat"];
                if ($etat == 0) {
                    $retour = array("texte" => "non", "badge" => "badge-danger");
                } else if ($etat == 1) {
                    $retour = array("texte" => "oui", "badge" => "badge-success");
                }
            }
        }elseif ($type == "actif_inactif") {
            if (isset($itemArray)) {
                $etat = $itemArray["etat"];
                if ($etat == 0) {
                    $retour = array("texte" => "Désactivé", "badge" => "badge-danger");
                } else if ($etat == 1) {
                    $retour = array("texte" => "Activé", "badge" => "badge-success");
                }
            }
        }
        elseif ($type == "r2a") {
            if (isset($itemArray)) {
                $etat = $itemArray["etat"];
                if ($etat == 0) {
                    $retour = array("texte" => "En attente Relecture", "badge" => "badge-danger");
                } else if ($etat == 1) {
                    $retour = array("texte" => "Relu, Non envoyé", "badge" => "badge-warning");
                } else if ($etat == 2) {
                    $retour = array("texte" => "Envoyé", "badge" => "badge-success");
                }
            }
        }
        elseif ($type == "etat_contact") {
            if (isset($itemArray)) {
                $etat = $itemArray["etat"];
                if ($etat == 0) {
                    $retour = array("texte" => "Non", "badge" => "badge-danger");
                } else if ($etat == 1) {
                    $retour = array("texte" => "Oui", "badge" => "badge-success");
                }
            }
        }
        elseif ($type == "etat_envoi") {
            if (isset($itemArray)) {
                $etat = $itemArray["etat"];
                if ($etat == 0) {
                    $retour = array("texte" => "aucun", "badge" => "bg-danger");
                } else if ($etat == 1) {
                    $retour = array("texte" => "total", "badge" => "bg-success");
                } else if ($etat == 2) {
                    $retour = array("texte" => "partiel", "badge" => "bg-warning");
                }
            }
        }
        elseif ($type == "envoi_import") {
            if (isset($itemArray)) {
                $etat = $itemArray["etat"];
                if ($etat == 0) {
                    $retour = array("texte" => "non", "badge" => "bg-danger");
                } else if ($etat == 1) {
                    $retour = array("texte" => "oui", "badge" => "bg-success");
                }
            }
        } else if ($type == "etat_action") {
            if (isset($itemArray)) {
                $dateAujourd8 = date('Y-m-d');
                $dateAction = $itemArray["dateAction"];
                $etat = $itemArray["etat"];

                if ($etat == 0) {
                    if ($dateAction > $dateAujourd8) {
                        $retour = array("texte" => "A VENIR", "badge" => "bg-success");
                    } else if ($dateAction < $dateAujourd8) {
                        $retour = array("texte" => "MANQUE", "badge" => "bg-danger");
                    } else if ($dateAction == $dateAujourd8) {
                        $retour = array("texte" => "JOUR-J", "badge" => "bg-info");
                    }
                } else if ($etat == 1) {
                    $retour = array("texte" => "EFFECTUE", "badge" => "bg-dark");
                }
            }
        } else if ($type == "conformite_action") {
            if (isset($itemArray)) {
                $conformite = $itemArray["conformite"];
                if ($conformite == 0) {
                    $retour = array("texte" => "NON", "badge" => "bg-danger");
                } else if ($conformite == 1) {
                    $retour = array("texte" => "OUI", "badge" => "bg-success");
                } else if ($conformite == 2) {
                    $retour = array("texte" => "EN ATTENTE", "badge" => "bg-info");
                }
            }
        } else if ($type == "etat_entreesortiestock") {
            if (isset($itemArray)) {
                $etat = $itemArray["etat"];
                if ($etat == 0) {
                    $retour = array("texte" => "EN ATTENTE", "badge" => "bg-danger");
                } else if ($etat == 1) {
                    $retour = array("texte" => "VALIDE", "badge" => "bg-success");
                }
            }
        } else if ($type == "etat_inventaire") {
            if (isset($itemArray)) {
                $etat = $itemArray["etat"];
                if ($etat == 0) {
                    $retour = array("texte" => "EN ATTENTE", "badge" => "bg-danger");
                } else if ($etat == 1) {
                    $retour = array("texte" => "VALIDE", "badge" => "bg-success");
                }
            }
        } else if ($type == "etat_cloturecaisse") {
            if (isset($itemArray)) {
                $etat = $itemArray["etat"];
                if ($etat == 0) {
                    $retour = array("texte" => "EN ATTENTE", "badge" => "bg-info");
                } else if ($etat == 1) {
                    $retour = array("texte" => "CLOTURE", "badge" => "bg-success");
                }
            }
        } else if ($type == "manquant_cloturecaisse") {
            if (isset($itemArray)) {
                $manquant = $itemArray["manquant"];
                if ($manquant == 0) {
                    $retour = array("texte" => "NON", "badge" => "bg-success");
                } else if ($manquant == 1) {
                    $retour = array("texte" => "OUI", "badge" => "bg-danger");
                }
            }
        } else if ($type == "est_cash_modepaiement") {
            if (isset($itemArray)) {
                $est_cash = $itemArray["est_cash"];
                if ($est_cash == 0) {
                    $retour = array("texte" => "NON", "badge" => "bg-dark");
                } else if ($est_cash == 1) {
                    $retour = array("texte" => "OUI", "badge" => "bg-info");
                }
            }
        } else if ($type == "creation_from_cloture_approcash") {
            if (isset($itemArray)) {
                $cloture_caisse_id = $itemArray["cloture_caisse_id"];
                if (empty($cloture_caisse_id)) {
                    $retour = array("texte" => "NON", "badge" => "bg-dark");
                } else {
                    $retour = array("texte" => "OUI", "badge" => "bg-info");
                }
            }
        } else if ($type == "peut_versement_banque_typecaisse") {
            if (isset($itemArray)) {
                $peut_versement_banque = $itemArray["peut_versement_banque"];
                if ($peut_versement_banque == 0) {
                    $retour = array("texte" => "NON", "badge" => "bg-danger");
                } else if ($peut_versement_banque == 1) {
                    $retour = array("texte" => "OUI", "badge" => "bg-success");
                }
            }
        } else if ($type == "commande" || $type == "historique_action_commande" || $type == "commande_produit") {
            if (isset($itemArray)) {
                $status = $itemArray["etat"];
                if ($status == 1) {
                    $retour = array("texte" => "COMMANDE INITIEE", "badge" => "bg-info");
                } else if ($status == 2) {
                    $retour = array("texte" => "COMMANDE VALIDEE", "badge" => "bg-success");
                } else if ($status == 3) {
                    $retour = array("texte" => "EN PREPARATION", "badge" => "bg-warning");
                } else if ($status == 4) {
                    $retour = array("texte" => "TERMINEE", "badge" => "bg-success");
                } else if ($status == 5) {
                    $retour = array("texte" => "LIVREE", "badge" => "bg-success");
                } else if ($status == 6) {
                    $retour = array("texte" => "ANNULEE", "badge" => "bg-danger");
                } else if ($status == 8) {
                    $retour = array("texte" => "CLOTUREE", "badge" => "bg-danger");
                }
            }
        } else if ($type == "bt") {
            if (isset($itemArray)) {
                $status = $itemArray["etat"];

                if (!isset($status) || $status == 0) {
                    $retour = array("texte" => "EN ATTENTE", "badge" => "bg-danger");
                } else if ($status == 1) {
                    $retour = array("texte" => "VALIDE", "badge" => "bg-success");
                }
            }
        } else if ($type == "proforma") {
            if (isset($itemArray)) {
                $status = $itemArray["etat"];
                if ($status == 0) {
                    $retour = array("texte" => "En attente de validation", "badge" => "bg-info");
                }
                if ($status == -1) {
                    $retour = array("texte" => "En attente de proposition", "badge" => "bg-warning");
                }
                if ($status == 1) {
                    $date = now();

                    if ($itemArray["date"] >  $date) {
                        $retour = array("texte" => "Traiteur A VENIR", "badge" => "bg-primary");
                    } else {
                        $retour = array("texte" => "Traiteur en cours", "badge" => "bg-success");
                    }
                }
                if ($status == 2) {
                    $retour = array("texte" => "Traiteur cloturé", "badge" => "bg-danger");
                }
            }
        } else if ($type == "etat_depense") {
            if (isset($itemArray)) {
                $etat = $itemArray["etat"];
                if ($etat == 0) {
                    $retour = array("texte" => "ATTENTE", "badge" => "bg-info");
                } else if ($etat == 1) {
                    $retour = array("texte" => "VALIDE", "badge" => "bg-success");
                } else if ($etat == 2) {
                    $retour = array("texte" => "NON VALIDE", "badge" => "bg-danger");
                }
            }
        } else if ($type == "payer_depense") {
            if (isset($itemArray)) {
                $payer = $itemArray["payer"];
                if ($payer == 0) {
                    $retour = array("texte" => "NON", "badge" => "bg-danger");
                } else if ($payer == 1) {
                    $retour = array("texte" => "OUI", "badge" => "bg-success");
                } else if ($payer == 2) {
                    $retour = array("texte" => "PARTIEL", "badge" => "bg-warning");
                }
            }
        } else if ($type == "payer_bce") {
            if (isset($itemArray)) {
                $payer = $itemArray["payer"];
                if ($payer == 0) {
                    $retour = array("texte" => "NON", "badge" => "bg-danger");
                } else if ($payer == 1) {
                    $retour = array("texte" => "OUI", "badge" => "bg-success");
                } else if ($payer == 2) {
                    $retour = array("texte" => "PARTIEL", "badge" => "bg-warning");
                }
            }
        } else if ($type == "reception_bce") {
            if (isset($itemArray)) {
                $reception = $itemArray["reception"];
                if ($reception == 0) {
                    $retour = array("texte" => "AUCUNE", "badge" => "bg-danger");
                } else if ($reception == 1) {
                    $retour = array("texte" => "TOTALE", "badge" => "bg-success");
                } else if ($reception == 2) {
                    $retour = array("texte" => "PARTIELLE", "badge" => "bg-warning");
                }
            }
        } else if ($type == "payer_be") {
            if (isset($itemArray)) {
                $payer = $itemArray["payer"];
                if ($payer == 0) {
                    $retour = array("texte" => "NON", "badge" => "bg-danger");
                } else if ($payer == 1) {
                    $retour = array("texte" => "OUI", "badge" => "bg-success");
                } else if ($payer == 2) {
                    $retour = array("texte" => "PARTIEL", "badge" => "bg-warning");
                }
            }
        } else if ($type == "etat_facture") {
            if (isset($itemArray)) {
                $etat = $itemArray["etat"];
                if ($etat == 0) {
                    $retour = array("texte" => "EN ATTENTE", "badge" => "bg-info");
                } else if ($etat == 1) {
                    $retour = array("texte" => "VALIDE", "badge" => "bg-success");
                } else if ($etat == -1) {
                    $retour = array("texte" => "NON VALIDE", "badge" => "bg-danger");
                }
            }
        } else if ($type == "payer_facture") {
            if (isset($itemArray)) {
                $payer = $itemArray["payer"];
                if ($payer == 0) {
                    $retour = array("texte" => "NON", "badge" => "bg-danger");
                } else if ($payer == 1) {
                    $retour = array("texte" => "OUI", "badge" => "bg-success");
                } else if ($payer == 2) {
                    $retour = array("texte" => "PARTIEL", "badge" => "bg-warning");
                }
            }
        } else if ($type == "suivimarketing") {
            if (isset($itemArray)) {
                $etat = $itemArray["etat"];
                if ($etat == 0) {
                    $retour = array("texte" => "NON VALIDE", "badge" => "bg-info");
                } else if ($etat == -1) {
                    $retour = array("texte" => "REJETE", "badge" => "bg-danger");
                } else if ($etat == 1) {
                    $retour = array("texte" => "VALIDE", "badge" => "bg-success");
                } else if ($etat == 2) {
                    $retour = array("texte" => "ARCHIVEE", "badge" => "bg-warning");
                } else {
                    $retour = array("texte" => "NON VALIDE", "badge" => "bg-info");
                }
            } else {
                $retour = array("texte" => "NON VALIDE", "badge" => "bg-info");
            }
        } else if ($type == "tagclient") {
            if (isset($itemArray)) {
                $etat = $itemArray["etat"];
                if ($etat == 1) {
                    $retour = array("texte" => "EN COURS", "badge" => "bg-success");
                } else if ($etat == 2) {
                    $retour = array("texte" => "archivé", "badge" => "bg-danger");
                } else {
                    $retour = array("texte" => "", "badge" => "");
                }
            }
        } else if ($type == "compta_general") {
            if (isset($itemArray)) {
                $compta = $itemArray["compta"];
                if ($compta == 0) {
                    $retour = array("texte" => "NON", "badge" => "bg-success");
                } else if ($compta == 1) {
                    $retour = array("texte" => "OUI #1", "badge" => "bg-danger");
                } else if ($compta == 2) {
                    $retour = array("texte" => "OUI #2", "badge" => "bg-danger");
                }
            }
        } else if ($type == "activer_employe") {
            if (isset($itemArray)) {
                $activer = $itemArray["activer"];
                if ($activer == 0) {
                    $retour = array("texte" => "NON", "badge" => "bg-danger");
                } else if ($activer == 1) {
                    $retour = array("texte" => "OUI", "badge" => "bg-success");
                }
            }
        } else if ($type == "reservation") {
            if (isset($itemArray)) {
                $activer = $itemArray["etat"];
                if (!$activer || $activer == 0) {
                    $retour = array("texte" => "INITIEE", "badge" => "bg-danger");
                } else if ($activer == 1) {
                    $retour = array("texte" => "EN COURS", "badge" => "bg-success");
                } else if ($activer == 2) {
                    $retour = array("texte" => "TERMINEE", "badge" => "bg-success");
                }
            }
        } else if ($type == "etat_production") {
            if (isset($itemArray)) {
                $etat = $itemArray["etat"];
                if ($etat == 0) {
                    $retour = array("texte" => "NON", "badge" => "bg-danger");
                } else if ($etat == 1) {
                    $retour = array("texte" => "OUI", "badge" => "bg-success");
                }
            }
        } else if ($type == "etat_decoupage") {
            if (isset($itemArray)) {
                $etat = $itemArray["etat"];
                if ($etat == 0) {
                    $retour = array("texte" => "NON", "badge" => "bg-danger");
                } else if ($etat == 1) {
                    $retour = array("texte" => "OUI", "badge" => "bg-success");
                }
            }
        } else if ($type == "etat_evenement") {
            if (isset($itemArray)) {
                $etat = $itemArray["etat"];
                if ($etat == 0) {
                    $retour = array("texte" => "EN ATTENTE", "badge" => "bg-dark");
                } else if ($etat == 1) {
                    $retour = array("texte" => "EN COURS", "badge" => "bg-info");
                } else if ($etat == 2) {
                    $retour = array("texte" => "TERMINE", "badge" => "bg-success");
                }
            }
        } else if ($type == "valider_suivibanque") {
            if (isset($itemArray)) {
                $valider = $itemArray["valider"];
                if ($valider == 0) {
                    $retour = array("texte" => "ATTENTE", "badge" => "bg-info");
                } else if ($valider == 1) {
                    $retour = array("texte" => "VALIDE", "badge" => "bg-success");
                } else if ($valider == 2) {
                    $retour = array("texte" => "NON VALIDE", "badge" => "bg-danger");
                }
            }
        }

        return $retour;
    }

    //Donne la valeur de retour du checkbox
    public static function donneValeurCheckbox($valeur = null)
    {
        $retour = 0;
        if (!empty($valeur)) {
            if ($valeur == 1 || $valeur === true || $valeur == 'on') {
                $retour = 1;
            } else if ($valeur == 2) {
                $retour = 2;
            }
        }

        return $retour;
    }

    //Donne le bon format de la date selon que ca soit de type date ou de type datedropper
    public static function donneValeurDate($dateVal)
    {
        $retour = date('Y-m-d');
        if (isset($dateVal)) {
            $retour = (strpos($dateVal, Outil::formatdateShort(true, true)) !== false) ? Carbon::createFromFormat(Outil::formatdateShort(true), $dateVal)->format('Y-m-d') : $dateVal;
        }

        return $retour;
    }

    //Change la date de début des rendez-vous
    public static function changeDateDebut()
    {
        $retour = 0;
        $dateToday = date('Y-m-d');
        $dateTodayPlus2 = Outil::donneDateParRapportNombreJour($dateToday, 2, "+");
        $item = Preference::find(1);
        if (isset($item)) {
            if (isset($item->date_debut) && isset($item->date_fin)) {
                if ($dateTodayPlus2 >= $item->date_debut && $dateToday < $item->date_fin) {
                    $demain = Outil::donneDateParRapportNombreJour($dateToday, 2, "+");
                    $item->date_debut = $demain;
                    $item->save();

                    $retour = 1;
                }
            }
        }
        return $retour;
    }

    //Envoi emails au terrain
    public static function envoiEmailAuTerrain()
    {
        try {
            $destinataire = null;
            $cc = array();
            $dateToday = date('Y-m-d');
            $heureToday = date('H:i');
            $dateTodayPlus2 = Outil::donneDateParRapportNombreJour($dateToday, 2, "+");

            $preference = Preference::where('id', 1)->first();
            if (isset($preference)) {
                // Verifier si les attributs de préférence sont renseignés
                if (isset($preference->date_debut) && isset($preference->date_fin) && isset($preference->heure_envoi_email) && isset($preference->destinataire_email)) {
                    $date_debut_moins_un = Outil::donneDateParRapportNombreJour($preference->date_debut, 1, "-");
                    //if($dateToday >= $date_debut_moins_un && $dateToday <= $preference->date_fin && $heureToday >= $preference->heure_envoi_email)
                    if ($dateTodayPlus2 >= $preference->date_debut && $dateToday <= $preference->date_fin && $heureToday >= $preference->heure_envoi_email) {
                        //Vérifier si l'envoi a déja été fait ou pas
                        $envoi = Envoi::where('type', 'email_rv_demain')->where('date', $dateToday)->first();
                        if (empty($envoi)) {
                            //pas encore d'envoi pour ce jour
                            $emails = explode(";", $preference->destinataire_email);
                            $cpt = 1;
                            foreach ($emails as $one) {
                                if ($cpt == 1) {
                                    if (!empty($one)) {
                                        $destinataire = $one;
                                    }
                                } else {
                                    if (!empty($one)) {
                                        array_push($cc, $one);
                                    }
                                }
                                $cpt++;
                            }

                            $demain = Outil::donneDateParRapportNombreJour($dateToday, 1, "+");
                            $demain_fr = Outil::resolveDateFr($demain);

                            $rvs = \DB::select('SELECT nom, prenom, info1, rvs.tel as tel, users.id_lvdc as id_lvdc, date, heure_debut, heure_fin FROM rvs, users WHERE rvs.user_id = users.id AND date = ? ORDER BY heure_debut', [$demain]);
                            $nbre = count($rvs);
                            $donnees = array('date_fr' => $demain_fr, 'nbre' => $nbre, 'details' => $rvs);

                            $texte = new HtmlString("");
                            $sujet = "Rendez-vous script du " . $demain_fr;
                            $envoiEmail = Outil::envoiEmail($destinataire, $sujet, $texte, 'resume-rv', $cc, null, null, $donnees);

                            //Marquer que c'est envoyé
                            $envoi = new Envoi();
                            $envoi->type = 'email_rv_demain';
                            $envoi->date = $dateToday;
                            $envoi->etat = 1;
                            $envoi->save();
                        }
                    }
                }
            }
        } catch (\Exception $e) {
            dd($e);
        }
    }

    public static function reguleForfaitTraiteur($id_traiteur)
    {

        $query = null;

        $forfait_traiteur = 0;
        $forfait_mat = 0;
        $forfait_commerciale = 0;
        $query = DB::table('proposition_commericales')
            ->join('proformas', 'proformas.id', 'proposition_commericales.proforma_id')
            ->where('proformas.id', $id_traiteur)
            ->where('proposition_commericales.est_activer', 1)
            ->selectRaw('SUM(proposition_commericales.forfait) as forfait');

        $query = $query->first();
        if (isset($query)) {
            $forfait_commerciale = $query->forfait;
        }

        $forfait_materiel = DB::table('proposition_commericale_familles')
            ->join('familles', 'familles.id', 'proposition_commericale_familles.famille_id')
            ->join('proposition_commericales', 'proposition_commericales.id', 'proposition_commericale_familles.proposition_commericale_id')
            ->join('proformas', 'proformas.id', 'proposition_commericales.proforma_id')
            ->where('familles.designation', Outil::getOperateurLikeDB(), 'Traiteur matriel')
            ->where('proformas.id', $id_traiteur)
            ->where('proposition_commericales.est_activer', 1)
            ->selectRaw('SUM(proposition_commericale_familles.forfait) as forfait');
        $forfait_materiel = $forfait_materiel->first();
        if (isset($forfait_materiel)) {
            $forfait_mat = $forfait_materiel->forfait;
        }

        return $forfait_commerciale + $forfait_mat;
    }

    //Donne le prix de vente par défaut
    public static function donnePrixValorisation($produit_id, $typeprix_id, $qte)
    {
        $retour = 0;
        $prix = 0;
        if (isset($produit_id) && isset($typeprix_id) && isset($qte)) {
            $produit = Produit::find($produit_id);
            if (isset($produit)) {
                if ($typeprix_id == 1) {
                    $prix = $produit->prix_achat_unitaire;
                } else if ($typeprix_id == 2) {
                    $prix = $produit->prix_achat_ttc;
                } else if ($typeprix_id == 3) {
                    $prix = $produit->prix_achat_unitaire_off;
                } else if ($typeprix_id == 4) {
                    $prix = $produit->prix_de_revient_unitaire;
                } else if ($typeprix_id == 5) {
                    $prix = $produit->pr_ttc;
                } else if ($typeprix_id == 6) {
                    $prix = $produit->prix_de_revient_unitaire_off;
                } else if ($typeprix_id == 7) {
                    //$prix = Outil::donneCump($produit_id, "on");
                    $prix = $produit->cump;
                } else if ($typeprix_id == 8) {
                    //$prix = Outil::donneCump($produit_id, "off");
                    $prix = $produit->cump_off;
                }

                $retour = $prix * $qte;
            }
        }

        return $retour;
    }

    //Donne le prix par défaut
    public static function donnePrixParDefaut($type = "vente", $item_id)
    {
        $retour = 0;
        if (isset($item_id)) {
            if ($type == "vente" || $type == "site") {
                $typePrixDeVente = new TypePrixDeVente();
                if ($type == "vente") {
                    $typePrixDeVente = TypePrixDeVente::where('par_defaut', 1)->first();
                } else if ($type == "site") {
                    $typePrixDeVente = TypePrixDeVente::where('pour_site', 1)->first();
                }
                if (isset($typePrixDeVente)) {
                    $prixdevente = Prixdevente::where('type_prix_de_vente_id', $typePrixDeVente->id)->where('produit_id', $item_id)->first();
                    if (isset($prixdevente)) {
                        if (isset($prixdevente->montant)) {
                            $retour = $prixdevente->montant;
                        }
                    }
                }
            } else if ($type == "achat") {
            }
        }

        return $retour;
    }

    public static function donnePrixAchat($type = "produit", $soustype = "prix_achat_unitaire", $item_id)
    {
        $retour = 0;
        if (isset($item_id)) {
            if ($type == "produit") {
                $item = Produit::find($item_id);
                if (isset($item)) {
                    if ($soustype == "prix_achat_unitaire") {
                        $retour = $item->$soustype;
                    } else if ($soustype == "prix_achat_ttc") {
                        $retour = $item->$soustype;
                    }
                }
            }
        }

        return round($retour);
    }


    public static function reguleStock($depot_id, $produit_quantite, $signe)
    {
        if (isset($depot_id)) {
            $depot = Depot::find($depot_id);
            if (isset($depot) && isset($depot->id)) {
                if (isset($produit_quantite)) {
                    foreach ($produit_quantite as $key => $value) {
                        if ($value['produit_id']) {
                            $produit = Produit::find($value['produit_id']);
                            if (isset($produit) && isset($produit->id)) {
                                $stock_actuel_depot_produit = Stockactuelproduitdepot::query()->where('produit_id', $produit->id)
                                    ->where('depot_id', $depot->id)
                                    ->first();
                                if (!isset($stock_actuel_depot_produit) || !isset($stock_actuel_depot_produit->id)) {
                                    $stock_actuel_depot_produit = new Stockactuelproduitdepot();
                                    $stock_actuel_depot_produit->depot_id = $depot->id;
                                    $stock_actuel_depot_produit->produit_id = $produit->id;
                                    $stock_actuel_depot_produit->quantite = $value['quantite'];
                                } else {
                                    $quantite_actuelle = $stock_actuel_depot_produit->quantite;
                                    $quantite_actuelle = ($signe == 0 || $signe == -1) ? $quantite_actuelle - $value['quantite'] : $quantite_actuelle + $value['quantite'];
                                    $stock_actuel_depot_produit->quantite = $quantite_actuelle;
                                }
                                $stock_actuel_depot_produit->save();
                            }
                        }
                    }
                    return null;
                } else {
                    return "Pas de regule de stock sans liste de produit";
                }
            } else {
                return "Ce dépot n'existe pas dans la base";
            }
        } else {
            return "Ce dépot n'existe pas dans la base";
        }
    }

    public static function getStockCommanderProduitComposer($entite, $etat)
    {
        $query = DB::table('r2a_techniques')
            ->join('produits', 'produits.id', '=', 'r2a_techniques.produit_id')
            ->join('commande_produits', 'commande_produits.produit_id', '=', 'produits.id')
            ->join('commandes', 'commandes.id', '=', 'commande_produits.commande_id')
            ->where('commandes.etat_commande', $etat)
            ->groupBy('r2a_techniques.produit_compose_id')
            ->selectRaw('r2a_techniques.produit_compose_id as produit_id, SUM(r2a_techniques.portion) as quantite');

        return $query->get();
    }

    public static function getStockCommanderProduitNonComposer($etat)
    {
        $query = DB::table('produits')
            ->join('commande_produits', 'commande_produits.produit_id', '=', 'produits.id')
            ->join('commandes', 'commandes.id', '=', 'commande_produits.commande_id')
            ->where('commandes.etat_commande', $etat)
            ->whereNotIn('produits.id', function ($q) {
                $q->select('produit_id')->from('r2a_techniques');
            })
            ->groupBy('produits.id')
            ->selectRaw('produits.id as produit_id, COUNT(produits.id) as quantite');

        return $query->get();
    }

    public static function getStockCommanderAccompagnementNonComposer($etat)
    {
        $query = DB::table('produits')
            ->join('commande_produit_produit', 'commande_produit_produit.produit_id', '=', 'produits.id')
            ->join('commande_produits', 'commande_produits.id', '=', 'commande_produit_produit.commande_produit_id')
            ->join('commandes', 'commandes.id', '=', 'commande_produits.commande_id')
            ->where('commandes.etat_commande', $etat)
            ->whereNotIn('produits.id', function ($q) {
                $q->select('produit_id')->from('r2a_techniques');
            })
            ->groupBy('produits.id')
            ->selectRaw('produits.id as produit_id, COUNT(produits.id) as quantite');

        return $query->get();
    }

    public static function getStockCommanderAccompagnementComposer($etat)
    {
        $query = DB::table('r2a_techniques')
            ->join('produits', 'produits.id', '=', 'r2a_techniques.produit_id')
            ->join('commande_produit_produit', 'commande_produit_produit.produit_id', '=', 'produits.id')
            ->join('commande_produits', 'commande_produits.id', '=', 'commande_produit_produit.commande_produit_id')
            ->join('commandes', 'commandes.id', '=', 'commande_produits.commande_id')
            ->where('commandes.etat_commande', $etat)
            ->groupBy('r2a_techniques.produit_compose_id')
            ->selectRaw('r2a_techniques.produit_compose_id, SUM(r2a_techniques.portion * commande_produit_produit.quantite) as quantite');

        return $query->get();
    }


    //Avoir la qté en cours
    public static function getQte($idDepot = null, $idProduitClient = null, $dateDebut = null, $dateFin = null, $idFamille = null)
    {
        //Qté totale entree stock (+)
        $queryEs = DB::table("detail_entre_stocks")
            ->select(DB::raw("COALESCE(SUM(qte_totale_dose),0) as total"));
        if (isset($idDepot) || (isset($dateDebut) && isset($dateFin))) {
            $queryEs = $queryEs->join('entre_stocks', 'entre_stocks.id', '=', 'detail_entre_stocks.entre_stock_id');
            if (isset($idDepot)) {
                $queryEs = $queryEs->where('depot_id', $idDepot);
            }
            if (isset($dateDebut) && isset($dateFin)) {
                $queryEs->whereBetween('entre_stocks.created_at', array($dateDebut, $dateFin));
            }
        }
        if (isset($idProduitClient)) {
            $queryEs = $queryEs->where('produit_client_id', $idProduitClient);
        }
        if (isset($idFamille)) {
            $queryEs = $queryEs->whereIn(
                'produit_client_id',
                ProduitClient::whereIn(
                    'produit_id',
                    Produit::where('famille_id', $idFamille)->get(['id'])
                )->get(['id'])
            );
        }
        //Qté totale appro ==> depot = recepteur (+)
        $queryAr = DB::table("detail_transferts")
            ->select(DB::raw("COALESCE(SUM(qte_totale_dose),0) as total"));
        if (isset($idDepot) || (isset($dateDebut) && isset($dateFin))) {
            $queryAr = $queryAr->join('transferts', 'transferts.id', '=', 'detail_transferts.id_transfert');
            if (isset($idDepot)) {
                $queryAr = $queryAr->where('transferts.id_recepteur', $idDepot);
            }
            if (isset($dateDebut) && isset($dateFin)) {
                $queryAr->whereBetween('transferts.created_at', array($dateDebut, $dateFin));
            }
        }
        if (isset($idProduitClient) && isset($idDepot)) {
            $queryAr = $queryAr->join('produit_clients', 'produit_clients.id', '=', 'detail_transferts.id_produit_client')
                ->where('produit_clients.id', $idProduitClient);
        }
        if (isset($idFamille)) {
            $queryAr = $queryAr->whereIn(
                'id_produit_client',
                ProduitClient::whereIn(
                    'produit_id',
                    Produit::where('famille_id', $idFamille)->get(['id'])
                )->get(['id'])
            );
        }
        //Qté totale sortie stock (-)
        $querySs = DB::table("detail_sortie_stocks")
            ->select(DB::raw("COALESCE(SUM(qte_totale_dose),0) as total"));
        if (isset($idDepot) || (isset($dateDebut) && isset($dateFin))) {
            $querySs = $querySs->join('sortie_stocks', 'sortie_stocks.id', '=', 'detail_sortie_stocks.sortie_stock_id');
            if (isset($idDepot)) {
                $querySs = $querySs->where('depot_id', $idDepot);
            }
            if (isset($dateDebut) && isset($dateFin)) {
                $querySs->whereBetween('sortie_stocks.created_at', array($dateDebut, $dateFin));
            }
        }
        if (isset($idProduitClient)) {
            $querySs = $querySs->where('produit_client_id', $idProduitClient);
        }
        if (isset($idFamille)) {
            $querySs = $querySs->whereIn(
                'produit_client_id',
                ProduitClient::whereIn(
                    'produit_id',
                    Produit::where('famille_id', $idFamille)->get(['id'])
                )->get(['id'])
            );
        }
        //Qté totale appro ==> depot = emetteur (-)
        $queryAe = DB::table("detail_transferts")
            ->select(DB::raw("COALESCE(SUM(qte_totale_dose),0) as total"));
        if (isset($idDepot) || (isset($dateDebut) && isset($dateFin))) {
            $queryAe = $queryAe->join('transferts', 'transferts.id', '=', 'detail_transferts.id_transfert');
            if (isset($idDepot)) {
                $queryAe = $queryAe->where('transferts.id_emetteur', $idDepot);
            }
            if (isset($dateDebut) && isset($dateFin)) {
                $queryAe->whereBetween('transferts.created_at', array($dateDebut, $dateFin));
            }
        }
        if (isset($idProduitClient) && isset($idDepot)) {
            $queryAe = $queryAe->join('produit_clients', 'produit_clients.id', '=', 'detail_transferts.id_produit_client')
                ->where('produit_clients.id', $idProduitClient);
        }
        if (isset($idFamille)) {
            $queryAe = $queryAe->whereIn(
                'id_produit_client',
                ProduitClient::whereIn(
                    'produit_id',
                    Produit::where('famille_id', $idFamille)->get(['id'])
                )->get(['id'])
            );
        }
        $queryEs = $queryEs->first();
        $queryAr = $queryAr->first();
        $querySs = $querySs->first();
        $queryAe = $queryAe->first();
        $retour = $queryEs->total + $queryAr->total - $querySs->total - $queryAe->total;
        return $retour;
    }

    public static function getStockMouvement($idDepot = null, $idProduit = null, $idEntite, $etat_commande = null)
    {
        $retour = null;
        $type_entre_sortie_stock = Typeentresortie::query()->get();

        $queryMouvementStock = DB::table("entre_sortie_stock_produits")
            ->select(DB::raw("COALESCE(SUM(quantite),0) as total"))
            ->join('entre_sortie_stocks', 'entre_sortie_stocks.id', '=', 'entre_sortie_stock_produits.entre_sortie_stock_id')
            ->join('type_entree_sorties', 'type_entree_sorties.id', '=', 'type_entree_sorties.type_entree_sortie_id');

        $queryEs = $queryMouvementStock->where('type_entree_sorties.id', 'type_entree_sorties');


        return $retour;
    }

    public static function createInOutStockBT($model)
    {
        //$item = new Entresortiestock();
        $retour = null;

        $modelTable = self::getQueryNameOfModel($model->getTable());
        $modelName = class_basename($modelTable);

        if (strtolower($modelName) == 'bts') {
            $itemSortie = new Entresortiestock();
            $itemEntre = new Entresortiestock();

            $itemEntre->bt_id = $itemEntre->bt_id = $model->id;
            $itemSortie->date = $itemEntre->date  = now();
            $itemSortie->observation = $itemEntre->observation = $model->observation;

            $itemSortie->multiplicateur  = -1;
            $itemEntre->multiplicateur  = 1;

            $itemSortie->type = 'sortie';
            $itemEntre->type = 'entree';

            $itemSortie->etat = 1;
            $itemEntre->etat = 1;

            if ($model->etat == 1) {

                $itemSortie->depot_id = $model->depot_expediteur_id;
                $itemEntre->depot_id = $model->depot_destinataire_id;
            } else {
                $itemSortie->depot_id = $model->depot_destinataire_id;
                $itemEntre->depot_id = $model->depot_expediteur_id;
                // $itemEntre->multiplicateur  = 1;

            }
            $motif = Motif::where('designation', 'transfert')->first();
            if (!isset($motif)) {
                $motif = new Motif();
                $motif->designation = 'transfert';
                $motif->save();
            }

            $itemEntre->motif_id = $motif->id;
            $itemSortie->motif_id = $motif->id;
            $itemSortie->save();
            $itemEntre->save();

            Outil::getCode($itemEntre, null, 'ES');
            Outil::getCode($itemSortie, null, 'SS');

            $bt_produits = Btproduit::query()->where('bt_id', $model->id)->get();

            foreach ($bt_produits as $key => $value) {

                $itemSelectedSortie = new Entresortiestockproduit();
                $itemSelectedEntree = new Entresortiestockproduit();


                $itemSelectedSortie->quantite = $itemSelectedEntree->quantite = $value->quantite;
                $itemSelectedSortie->produit_id = $itemSelectedEntree->produit_id = $value->produit_id;

                $itemSelectedSortie->entre_sortie_stock_id = $itemSortie->id;
                $itemSelectedEntree->entre_sortie_stock_id = $itemEntre->id;

                $itemSelectedSortie->multiplicateur = -1;
                $itemSelectedEntree->multiplicateur = 1;

                $itemSelectedSortie->etat = 1;
                $itemSelectedEntree->etat = 1;

                $itemSelectedSortie->depot_id = $itemSortie->depot_id;
                $itemSelectedEntree->depot_id = $itemEntre->depot_id;

                $itemSelectedSortie->save();
                $itemSelectedEntree->save();
            }
        }


        return $retour;
    }

    public static function createInOutStockInventaire($model)
    {
        $retour = null;

        $modelTable = self::getQueryNameOfModel($model->getTable());
        $modelName = class_basename($modelTable);
        $detailsEntree = array();
        $detailsSortie = array();
        //dd('ici entre sortie',$model['id']);
        if (strtolower($modelName) == 'inventaires') {
            $inentaire_produits     = Inventaireproduit::query()->where('inventaire_id', $model['id'])->get();
            if (isset($inentaire_produits) && count($inentaire_produits) > 0) {

                foreach ($inentaire_produits as $key => $value) {
                    dd($value);
                    if (isset($value->quantite_theorique) && isset($value->quantite_reel)) {

                        $is_in_out = 0;
                        $quantite  = 0;
                        if ($value->quantite_theorique < $value->quantite_reel) {
                            //On fait une entree stock
                            $is_in_out = 1;
                            $quantite  = $value->quantite_reel - $value->quantite_theorique;
                            $type =  'entree';
                            //dd('ici');
                            array_push($detailsEntree,  array(
                                "produit_id"      => $value->produit_id,
                                "quantite"         => $quantite,
                                "id"               => $value->id,
                                "etat"             => 1,
                                "multiplicateur"   => 1,
                                "depot_id"         => $model['depot_id'],
                            ));
                        } else {
                            //On fait une sortie stock: c'est une perte , on doit valoriser
                            $is_in_out = -1;
                            $quantite  = $value->quantite_theorique - $value->quantite_reel;
                            $type =  'sortie';
                            array_push($detailsSortie,  array(
                                "produit_id" => $value->produit_id,
                                "quantite"   => $quantite,
                                "etat"             => 1,
                                "multiplicateur"   => -1,
                                "depot_id"         => $model['depot_id'],

                                "id"                => $value->id
                            ));
                        }
                    }
                }
                if (isset($detailsEntree) && count($detailsEntree) > 0) {
                    self::saveEntreStortie($detailsEntree, 1, 'inventaire_id', $model, $model->observation, $model->depot_id);
                }
                if (isset($detailsSortie) && count($detailsSortie) > 0) {
                    self::saveEntreStortie($detailsSortie, -1, 'inventaire_id', $model, $model->observation, $model->depot_id);
                }
            }
        } else if (strtolower($modelName) == 'assemblages') {
            //On fait une sortie de la production
            $produit_production = DetailAssemblage::query()->where('assemblage_id', $model['id'])->first();
            if ($model->depot_id) {
                $depot_sortie       = Depot::find($model->depot_id);
            }

            if (isset($produit_production) && isset($produit_production->id) && isset($depot_sortie)) {
                if (isset($produit_production->produit_id)) {
                    $produit = Produit::find($produit_production->produit_id);
                    if (isset($produit->id)) {
                        $type =  'sortie';
                        array_push($detailsSortie,  array(
                            "produit_id" => $produit->id,
                            "quantite"   => $produit_production->qte_unitaire,
                            "id"         => $produit_production->id
                        ));

                        if (isset($detailsSortie) && count($detailsSortie) > 0) {
                            $errors =  self::saveEntreStortie($detailsSortie, -1, 'assemblage_id', $model, $model->description, $model->depot_id);

                            if (isset($errors)) {
                                //On a fait la sortie de la production
                                //On entame les entrees de la production
                                $produit_entrees = DetailDetailAssemblage::query()->where('detail_assemblage_id', $produit_production->id)->where('perte', '!=', 1)->get();
                                if (isset($produit_entrees) && count($produit_entrees) > 0) {
                                    foreach ($produit_entrees as $key => $value) {
                                        if (isset($value->qte_unitaire)) {
                                            $is_in_out = 0;
                                            //On fait une entree stock
                                            $is_in_out = 1;
                                            $type =  'entree';
                                            array_push($detailsEntree,  array(
                                                "produit_id" => $value->produit_id,
                                                "quantite"   => $value->qte_unitaire,
                                                "id"         => $value->id
                                            ));
                                        }
                                    }

                                    if (isset($detailsEntree) && count($detailsEntree) > 0) {
                                        self::saveEntreStortie($detailsEntree, 1, 'assemblage_id', $model, $model->description, $model->depot_sortie_id);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        return $retour;
    }


    public static function saveEntreStortie($details, $type, $foreignkey, $model)
    {
        $user  = Auth::user();
        $inout = new Entresortiestock();
        //dd($value);
        $inout->$foreignkey              = $model->id;
        $inout->date                     = now();
        $inout->observation              = $model->observation;
        $inout->user_id                  = $user->id;
        if (isset($model->depot_id)) {
            $inout->depot_id             = $model->depot_id;
        }
        if ($type > 0) {
            $inout->type = 'entree';
        } else {
            $inout->type = 'sortie';
        }
        $inout->multiplicateur = $type;
        $inout->etat = 1;

        $motif = Motif::where('designation', 'assamblage')->first();
        if (!isset($motif)) {
            $motif              = new Motif();
            $motif->designation = 'assamblage';
            $motif->save();
        }
        $inout->motif_id = $motif->id;
        $inout->assemblage_id = $model->id;
        $inout->save();
        Outil::getCode($inout);
        foreach ($details as $key => $value) {
            //dd($value);
            $detail_inout                        = new Entresortiestockproduit();
            $detail_inout->quantite              = $value['quantite'];
            $detail_inout->produit_id            = $value['produit_id'];
            $detail_inout->entre_sortie_stock_id = $inout->id;
            $detail_inout->multiplicateur        = $inout->multiplicateur;
            $detail_inout->etat                  = $inout->etat;
            $detail_inout->depot_id              = $inout->depot_id;

            $detail_inout->save();
        }
    }


    public static function saveDetailEntreeOuStortie($item, $values, $multiplicateur)
    {
        $id = $item->id;
        foreach ($values as $value) {
            $detail = Entresortiestockproduit::where('entre_sortie_stock_id', $item->id)->where('produit_id', $value['produit_id'])->where('depot_id', $value['depot_id'])->first();
            if (empty($detail)) {
                $detail = new Entresortiestockproduit();
            }
            $detail->depot_id               = $value["depot_id"];
            $detail->produit_id             = $value["produit_id"];
            $detail->quantite               = $value["quantite"];
            $detail->multiplicateur         = $multiplicateur;
            $detail->etat                   = 1;
            $detail->entre_sortie_stock_id  = $id;
            $detail->save();
        }
        return true;
    }

    public static function createInOutStockCommande($model)
    {
        $retour = null;

        $modelTable = self::getQueryNameOfModel($model->getTable());
        $modelName = class_basename($modelTable);

        if (strtolower($modelName) == 'commandes') {
            $itemSortie = new Entresortiestock();
            $itemEntre = new Entresortiestock();

            $itemSortie->date = $itemEntre->date = now();
            $itemSortie->observation = $itemEntre->observation = $model->observation;
            $itemSortie->type_entree_sortie_id = $itemEntre->type_entree_sortie_id = 1;
            $itemSortie->type = 'sortie';
            $itemEntre->type = 'entree';

            if ($model->etat == 1) {

                $itemSortie->depot_id = $model->depot_expediteur_id;
                $itemEntre->depot_id = $model->depot_destinataire_id;
            } else {
                $itemSortie->depot_id = $model->depot_destinataire_id;
                $itemEntre->depot_id = $model->depot_expediteur_id;
            }

            $motif = Motif::firstOrCreate(['designation' => 'assamblage']);
            $itemSortie->motif_id = $motif->id;
            $itemEntre->motif_id = $motif->id;
            $itemSortie->assemblage_id = $model->id;
            $itemEntre->assemblage_id = $model->id;
            $itemSortie->save();
            $itemEntre->save();

            outil::getCode($itemEntre);
            outil::getCode($itemSortie);

            $bt_produits = Btproduit::query()->where('bt_id', $model->id)->get();

            foreach ($bt_produits as $key => $value) {

                $itemSelectedSortie = new Entresortiestockproduit();
                $itemSelectedEntree = new Entresortiestockproduit();


                $itemSelectedSortie->quantite = $itemSelectedEntree->quantite = $value->quantite;
                $itemSelectedSortie->produit_id = $itemSelectedEntree->produit_id = $value->produit_id;

                $itemSelectedSortie->entre_sortie_stock_id = $itemSortie->id;
                $itemSelectedEntree->entre_sortie_stock_id = $itemEntre->id;
                $itemSelectedSortie->depot_id = $itemSortie->depot_id;
                $itemSelectedEntree->depot_id = $itemEntre->depot_id;

                $itemSelectedSortie->save();
                $itemSelectedEntree->save();
            }
        }

        /*$item->type = 'sortie';
        $item->depot_id                     = $request->depot_id;
        $item->date                         = now();
        $item->observation                  = isset($request->observation) ? $request->observation : "";
        $item->type_entree_sortie_id        = 2;
        $item->save();
        $id = $item->id;

        $items = json_decode($request->produits, true);
        foreach ($items as $key => $value)
        {
            if(!isset($value["produit_id"]))
            {
                $value["produit_id"] = $value["produit_compose_id"];
            }

            $itemSelected = new Entresortiestockproduit();
            if(isset($value["id"]))
            {
                $itemSelectedId = $value["id"];
                $itemSelected = Entresortiestockproduit::find($itemSelectedId);
            }

            if(empty($itemSelected->id))
            {
                $itemSelected = new Entresortiestockproduit();
            }

            $itemSelected->quantite = $value["quantite"];
            $itemSelected->produit_id = $value["produit_id"];
            $itemSelected->entre_sortie_stock_id = $id;
            $itemSelected->save();
        }*/
        return $retour;
    }

    public static function testMontant($valeur, $texte = "un montant", $peutEgalAzero = false)
    {
        $errors = null;
        $type = "caisse";
        if ((!isset($valeur)) || is_numeric($valeur) == false) {
            $errors = "Mettez " . $texte . " valide";
        } else if ($peutEgalAzero == false) {
            if ($valeur <= 0) {
                $errors = "Mettez " . $texte . " supérieur à 0";
            }
        } else if ($peutEgalAzero == true) {
            if ($valeur < 0) {
                $errors = "Mettez " . $texte . " supérieur ou égal à 0";
            }
        }

        return $errors;
    }

    public static function testSolde($caisse_id, $montant)
    {
        $errors = null;
        $type = "caisse";
        if (empty($caisse_id)) {
            $errors = "La caisse n'est pas définie";
        } else if (!isset($montant)) {
            $errors = "Le montant n'est pas défini";
        } else {
            $item = Caisse::find($caisse_id);
            if (empty($item)) {
                $errors = "Cette caisse n'existe pas";
            } else {
                $solde = Outil::donneSoldeCalculei($item->id);
                if ($montant > $solde) {
                    $errors = "Le montant demandé n'est pas disponible pour la caisse";
                }
            }
        }

        return $errors;
    }

    public static function getDescriptionTableCommande($item, $description)
    {
        if (isset($item->type_commande_id)) {
            $type_commande = Typecommande::find($item->type_commande_id);
            if (isset($type_commande) && isset($type_commande->id)) {
                if ($type_commande->designation == 'sur place') {
                    $table_commande = DB::table('tables')
                        ->join('table_commandes', 'table_commandes.table_id', '=', 'tables.id')
                        ->join('commandes', 'commandes.id', '=', 'table_commandes.commande_id')
                        ->where('commande_id', $item->id)
                        ->selectRaw('tables.*')
                        ->get();
                    if (isset($table_commande) && count($table_commande) > 0) {
                        $description .= '';
                        $tables = '';
                        foreach ($table_commande as $key => $value) {
                            if ($tables == '') {
                                $tables .= '' . $value->designation;
                            } else {
                                $tables .= ', ' . $value->designation;
                            }
                        }
                    }
                    $description .= 'TABLE N° ' . $tables;
                }
            }
        }
        return $description;
    }

    public static function testPaiement($from = "depense", $itemId, $montantPaiement, $compta = null, $paiement_id = null)
    {
        $errors = null;
        if (empty($itemId)) {
            $errors = "L'id de l'élément n'est pas défini";
        } else if (empty($montantPaiement)) {
            $errors = "Le montant n'est pas défini";
        } else {
            $item = new Depense();
            if ($from == "paiement") {
                $item = new Paiement();
            } else if ($from == "facture") {
                $item = new Facture();
            } else if ($from == "bce") {
                $item = new Bce();
            }
            $item = $item::find($itemId);
            if (empty($item)) {
                $errors = "L'élément que vous tentez de payer n'existe pas";
            } else {
                $totalPaiement = Outil::donneTotalPaiement($from, $item->id, $compta);
                $resteApayer = $item->montant - $totalPaiement;
                if (isset($paiement_id)) {
                    $paiement = Paiement::find($paiement_id);
                    if (isset($paiement)) {
                        $montantPaiement = $montantPaiement - $paiement->montant;
                    }
                }
                if ($montantPaiement > $resteApayer) {
                    $errors = "Le montant à payer est supérieur au restant qui est de : " . $resteApayer;
                }
            }
        }

        return $errors;
    }

    public static function testSuiviBanque($request, $mode_paiement_id)
    {
        $errors = null;
        if (empty($mode_paiement_id)) {
            $errors = "Le mode de paiement n'est pas défini";
        } else {
            $modepaiement = Modepaiement::find($mode_paiement_id);
            if (empty($modepaiement)) {
                $errors = "Ce mode de paiement n'existe pas";
            } else if ($modepaiement->pour_banque == 1) {
                if (empty($request)) {
                    $errors = "veuillez définir le numéro, la banque et le nom complet du client pour le suivi banque";
                } else if (empty($request->numerosuivi)) {
                    $errors = "veuillez définir le numéro pour le suivi banque";
                } else if (empty($request->banquesuivi)) {
                    $errors = "veuillez définir la banque pour le suivi banque";
                } else if (empty($request->nomsuivi)) {
                    $errors = "veuillez définir le nom complet du client pour le suivi banque";
                }
            }
        }

        return $errors;
    }

    public static function testLigneCredit($from = "paiement", $request, $mode_paiement_id)
    {
        $errors = null;
        if (empty($mode_paiement_id)) {
            $errors = "Le mode de paiement n'est pas défini";
        } else {
            $modepaiement = Modepaiement::find($mode_paiement_id);
            if (empty($modepaiement)) {
                $errors = "Ce mode de paiement n'existe pas";
            } else if ($modepaiement->pour_ligne_credit == 1) {
                //Test client existe sur commande
                if ($from == "paiement") {
                    if (empty($request->commande)) {
                        $errors = "L'id de la commande n'est pas définie";
                    } else {
                        $item = Commande::find($request->commande);
                        if (empty($item)) {
                            $errors = "Cette commande n'existe pas";
                        } else if (empty($item->client_id)) {
                            $errors = "Cette commande n'a pas de client donc ne peut faire l'objet de paiement par ligne de crédit";
                        } else {
                            $restantLigneCredit = outil::donneRestantLigneCredit("client", $item->client_id);
                            if ($request->montant > $restantLigneCredit) {
                                $errors = "Il ne reste que " . $restantLigneCredit . " en ligne de crédit pour ce client";
                            }
                        }
                    }
                } else if ($from == "paiementfacture") {
                    $item = Facture::find($request->facture_id);
                    if (empty($item)) {
                        $errors = "Cette facture n'existe pas";
                    } else if (empty($item->client_id)) {
                        $errors = "Cette facture n'a pas de client donc ne peut faire l'objet de paiement par ligne de crédit";
                    } else {
                        $restantLigneCredit = outil::donneRestantLigneCredit("client", $item->client_id);
                        if ($request->montant > $restantLigneCredit) {
                            $errors = "Il ne reste que " . $restantLigneCredit . " en ligne de crédit pour ce client";
                        }
                    }
                }
            } else if ($modepaiement->pour_bon_cadeau == 1) {
                if (empty($request)) {
                    $errors = "Veuillez définir le code du bon cadeau et le client";
                } else if (empty($request->codeboncadeau)) {
                    $errors = "Veuillez définir le code du bon cadeau";
                } else if (empty($request->clientboncadeau)) {
                    $errors = "Veuillez définir le client";
                } else {
                    $ligneCredit = Lignecredit::where('codeboncadeau', $request->codeboncadeau)->first();
                    if (empty($ligneCredit)) {
                        $errors = "Ce bon cadeau n'existe pas";
                    } else if ($ligneCredit->client_id != $request->clientboncadeau) {
                        $errors = "Ce bon cadeau n'est pas lié au client choisi";
                    } else {
                        $paiementDejaFait = Paiement::where('codeboncadeau', $request->codeboncadeau)->first();
                        if (isset($paiementDejaFait)) {
                            $errors = "Ce bon cadeau est déja utilisé";
                        } else {
                            $restantLigneCredit = $ligneCredit->montant;
                            if ($request->montant > $restantLigneCredit) {
                                $errors = "Le montant du bon cadeau n'est pas suffisant pour faire ce paiement car il est de " . $restantLigneCredit . "";
                            }
                        }
                    }
                }
            }
        }

        return $errors;
    }

    public static function testMontantParEntite($items, $montant)
    {
        $errors = null;
        $totalDesEntites = 0;
        foreach ($items as $key => $value) {
            $totalDesEntites += $value["montant"];
        }
        if ($montant != $totalDesEntites) {
            $errors = "Le montant défini et le total des montants par point de vente n'est pas le même";
        }

        return $errors;
    }

    public static function testDispatchingAnalytique($items)
    {
        $errors = null;
        $totalDesEntites = 0;
        foreach ($items as $key => $value) {
            $totalDesEntites += $value["montant"]; //Pourcentage mais variable montant utilisée
        }
        if ($totalDesEntites != 100) {
            $errors = "Le total du dispatching doit être égale à 100% au lieu de " . $totalDesEntites . "%";
        }

        return $errors;
    }

    public static function testPlanning($items)
    {
        $errors = null;
        if (empty($items)) {
            $errors = "Veuillez remplir tout le tableau";
        } else {
            $items = json_decode($items, true);
            $cptDept = 0;
            foreach ($items as $key => $value) {
                $cptDept++;
                if (empty($value['departement_id'])) {
                    $errors = "L'id du département n°: " . $cptDept . " n'est pas défini";
                    break;
                }

                $employes = $value['employes'];
                $cptEmp = 0;
                foreach ($employes as $value2) {
                    $cptEmp++;
                    if (empty($value2['employe_id'])) {
                        $errors = "L'id de l'employé n°: " . $cptEmp . " n'est pas défini";
                        break;
                    }

                    $jours = $value2['jours'];
                    $cptJour = 0;
                    foreach ($jours as $value3) {
                        $cptJour++;
                        if (empty($value3['id'])) {
                            $errors = "L'id du jour n°: " . $cptJour . " n'est pas défini";
                            break;
                        }
                        if (empty($value3['brigade_id'])) {
                            $errors = "La brigade n'est pas défini (référence: département n°: " . $cptDept . " / employé n°: " . $cptEmp . " / jour n°: " . $cptJour . ")";
                            break;
                        }
                        if (empty($value3['tranche_horaire_id'])) {
                            $errors = "La tranche horaire n'est pas définie (référence: département n°: " . $cptDept . " / employé n°: " . $cptEmp . " / jour n°: " . $cptJour . ")";
                            break;
                        }
                    }
                }
            }
        }
        return $errors;
    }

    //Donne date par rapport à l'ajout ou la soustraction de nombre de jours
    public static function donneDateParRapportNombreJour($madate, $nbre, $operation = "+")
    {
        try {
            if ($operation == "-") {
                $retour = date("Y-m-d", strtotime(date($madate) . " -$nbre days"));
            } else {
                $retour = date("Y-m-d", strtotime(date($madate) . " +$nbre days"));
            }

            return $retour;
        } catch (\Exception $e) {
            //dd($e); //Pour voir l'erreur précis
            $errorArray = array("type" => "mail_suivi", "designation" => "Outil->donneDateParRapportNombreJour->Erreur lors du traitement", "erreur" => $e);
            Outil::saveError($errorArray);
        }
    }

    public static function donneDateParRapportNombreAnnee($madate, $nbre, $operation = "+")
    {
        try {
            if ($operation == "-") {
                $retour = date("Y-m-d", strtotime(date($madate) . " -$nbre years"));
            } else {
                $retour = date("Y-m-d", strtotime(date($madate) . " +$nbre years"));
            }
            return $retour;
        } catch (\Exception $e) {
            //dd($e); //Pour voir l'erreur précis
            $errorArray = array("type" => "mail_suivi", "designation" => "Outil->donneDateParRapportNombreAnnee->Erreur lors du traitement", "erreur" => $e);
            Outil::saveError($errorArray);
        }
    }

    //Nomnre de jours entre 2 dates
    public static function nombreJoursEntreDeuxDates($date_debut, $date_fin)
    {

        $date_debut = strtotime($date_debut);
        $date_fin = strtotime($date_fin);
        $retour = round(($date_fin - $date_debut) / 60 / 60 / 24, 0);
        return $retour;
    }

    //Connexion to BD
    public static function requeteInBd($databaseName = "Surveys", $query, $type = "nombre", $data = null)
    {
        try {
            $retour = null;

            $host_sqlserv = Outil::donneInfosAppli()['host_sqlserv'];
            $username_sqlserv = Outil::donneInfosAppli()['username_sqlserv'];
            $password_sqlserv = Outil::donneInfosAppli()['password_sqlserv'];

            $db = new PDO('odbc:Driver={SQL Server};Server=' . $host_sqlserv . ';Database=' . $databaseName . '; Uid=' . $username_sqlserv . ';Pwd=' . $password_sqlserv . '');
            //$db->exec("SET NAMES 'utf8';");
            $query = $db->prepare($query);
            if (isset($data)) {
                $query->execute($data);
            } else {
                $query->execute();
            }

            if ($type == "nombre") {
                $retour = $query->fetch();
                $retour = $retour['total'];
            } else if ($type == "liste") {
                $retour = $query->fetchAll(PDO::FETCH_ASSOC);
            } else if ($type == "update") {
                $retour = true;
            }

            return $retour;
        } catch (\Exception $e) {
            //dd($e); //Pour voir l'erreur précis
            $errorArray = array("type" => "mail_suivi", "designation" => "Outil->requeteInBd->Erreur lors du traitement", "erreur" => $e);
            Outil::saveError($errorArray);
        }
    }

    public static function updateContactAskia($params)
    {
        try {
            $retour = false;

            $preference = Preference::where('id', 1)->first();
            if (isset($preference)) {
                if (isset($preference->list_id)) {
                    $tableList = "AskList" . $preference->list_id;

                    $req_update = "UPDATE " . $tableList . " SET AskEmail = '" . $params["mail"] . "', AskTelephone = '" . $params["tel"] . "' WHERE IDLVDC = '" . $params["id_lvdc"] . "'";
                    if (isset($params["date_naissance"])) {
                        $req_update = "UPDATE " . $tableList . " SET AskEmail = '" . $params["mail"] . "', AskTelephone = '" . $params["tel"] . "', DATE_NAISSANCE = '" . $params["date_naissance"] . "' WHERE IDLVDC = '" . $params["id_lvdc"] . "'";
                    }
                    //dd($req_update);
                    $req_update = Outil::requeteInBd("Lists", $req_update, "update");
                    $retour = $req_update;
                }
            }

            return $retour;
        } catch (\Exception $e) {
            //dd($e);
            $errorArray = array("type" => "upadate_sql", "designation" => "Outil->updateContactAskia->Erreur lors du traitement", "erreur" => $e);
            Outil::saveError($errorArray);
        }
    }

    public static function donneTypeUser($type = null, $pointeur = "id")
    {
        $types = array();
        array_push($types, array("id" => 0, "designation" => "Admin"));
        array_push($types, array("id" => 1, "designation" => "Entreprise"));
        array_push($types, array("id" => 2, "designation" => "Enquêteur"));

        $retourPointeur = "id";
        if ($pointeur == "id") {
            $retourPointeur = "designation";
        }

        $retour = $types[0][$retourPointeur];
        if (!empty($type)) {
            foreach ($types as $value) {
                if (strtolower($value[$pointeur]) == strtolower($type)) {
                    $retour = $value[$retourPointeur];
                    return $retour;
                }
            }
        }

        return $retour;
    }
    // Codification des données 
    public static function siretiserDonnees($donneesCodifier)
    {
        $donnees_codifier = array();

        foreach ($donneesCodifier as $values) {
            if (isset($values["siret"])) {
                array_push($donnees_codifier, $values);
                if (isset($values["telephone"])) {
                    $values["telephone"] =  preg_replace('/\s+/', '', $values["telephone"]);
                }
                if (isset($values["code_naf"])) {
                    $values["code_naf"] =  preg_replace('/\s+/', '', $values["code_naf"]);
                }
            } elseif (isset($values["vu_entreprise"])) {
                array_push($donnees_codifier, $values);
            }
        }

        return $donnees_codifier;
    }
    public static function check_valid_siret($siret)
    {
        // Supprime les espaces de la chaîne
        $siret = preg_replace('/\s+/', '', $siret);
        // Vérifie si la chaîne contient exactement 14 chiffres
        return preg_match('/^\d{14}$/', $siret);
    }
    public static function check_valid_phone_sitisation($phone)
    {
        // Supprime les espaces de la chaîne
        $phone = preg_replace('/\s+/', '', $phone);
        // Vérifie si la chaîne contient 13 ou 14 chiffres
        return preg_match('/^\d{10,11}$/', $phone);
    }
    public static function check_valid_code_naf($code)
    {
        // Supprime les espaces de la chaîne
        $code = preg_replace('/\s+/', '', $code);
        // Vérifie la présence d'au moins un chiffre
        $contientChiffre = preg_match('/\d/', $code);

        // Vérifie la présence d'au moins une lettre
        $contientLettre = preg_match('/[a-zA-Z]/', $code);

        // Retourne true si la chaîne contient à la fois un chiffre et une lettre, sinon false
        return $contientChiffre && $contientLettre;
    }
    public static function checkErrorR2a($donneesCodifier)
    {
        $donnees_codifier = array();
        $error = "";
        foreach ($donneesCodifier as $values) {
            if (isset($values["siret"]) && !empty($values["siret"])) {
                $valid = Outil::check_valid_siret($values["siret"]);
                if ($valid == false) {
                    $error = "Veuillez revoir les sirets en rouge. NB c'est un numéro de 14 chiffres.";
                    return $error;
                }
            }
            if (isset($values["telephone"]) && !empty($values["telephone"])) {
                $valid = Outil::check_valid_phone_sitisation($values["telephone"]);
                if ($valid == false) {
                    $error = "Veuillez revoir les numéros de télphone en rouge. NB c'est un numéro de 10 ou  11 chiffres.";
                    return $error;
                }
            }
            if (isset($values["code_naf"]) && !empty($values["code_naf"])) {
                $valid = Outil::check_valid_code_naf($values["code_naf"]);
                if ($valid == false) {
                    $error = "Veuillez revoir les codes NAF en rouge. NB :  Entre 4 ou 5 caractères alphanumérique contenant au moins un chiffre et une lettre.";
                    return $error;
                }
            }
        }

        return $error;
    }
    public static function getNombreSiretiser($data)
    {
        try {
            $total = 0;
            foreach ($data as $value) {
                if (isset($value["siret"])  || isset($value["vu_entreprise"])) {
                    $total++;
                }
            }

            return $total;
        } catch (\Exception $e) {
            dd($e); //Pour voir l'erreur précis
            $errorArray = array("type" => "Codification_relecteurs", "designation" => "Outil->getNombreSiretiser->Erreur lors du traitement", "erreur" => $e);
            Outil::saveError($errorArray);
        }
    }

    public static function getNombreEntreprise($data)
    {
        try {

            $total_verbatim = 0;
            if (!empty($data) && count($data) > 0) {
                foreach ($data as $value) {
                    if (isset($value["siret"])) {
                        $total_verbatim++;
                    }
                }
            }

            return $total_verbatim;
        } catch (\Exception $e) {
            dd($e); //Pour voir l'erreur précis
            $errorArray = array("type" => "Codification_relecteurs", "designation" => "Outil->getNombreEntreprise->Erreur lors du traitement", "erreur" => $e);
            Outil::saveError($errorArray);
        }
    }

    public static function getNombreMots($data)
    {
        try {
            $total_mot = 0;
            if (!empty($data) && count($data) > 0) {
                foreach ($data as $value) {

                    if (isset($value["reponse_codif"]) && ($value["reponse_codif"] != "")) {
                        $total_mot += count(explode(" ", $value["reponse_codif"]));
                    }
                }
            }

            return $total_mot;
        } catch (\Exception $e) {
            dd($e); //Pour voir l'erreur précis
            $errorArray = array("type" => "Codification_relecteurs", "designation" => "Outil->getNombreMots->Erreur lors du traitement", "erreur" => $e);
            Outil::saveError($errorArray);
        }
    }


    public static function getNombreLigne($data)
    {
        try {
            $data_by_idlvdc = [];
            $nbre = 0;
            if (!empty($data) && count($data) > 0) {
                foreach ($data as $value) {
                    if (isset($value["reponse_codif"]) && ($value["reponse_codif"] != "")) {
                        $data_by_idlvdc[$value["IDLVDC"]] = $value;
                    }
                }
                $nbre = count($data_by_idlvdc);
            }
            return $nbre;
        } catch (\Exception $e) {
            dd($e); //Pour voir l'erreur précis
            $errorArray = array("type" => "Codification_relecteurs", "designation" => "Outil->getNombreLigne->Erreur lors du traitement", "erreur" => $e);
            Outil::saveError($errorArray);
        }
    }
    function cmp($a, $b)
    {
        return strcmp($a->name, $b->name);
    }

    public static function getPartDataForRelecteurs($codification_id, $start = 0, $end = 0)
    {
        try {
            $codification_query = Codification::where('id', $codification_id)->first();
            $partOfRelecteur    = array();
            $dataSorted         = array();
            $data               = json_decode($codification_query->donnees, true);

            $nom_entreprise     = $codification_query->shortcut_nom_entreprise;
            $code_postal        = $codification_query->shortcut_code_postal_entreprise;
            $adresse_entreprise = $codification_query->shortcut_adresse_entreprise;

            ksort($data);
            $k = 0;

            foreach ($data as $value) {
                $dataSorted[$k++] = $value;
            }

            foreach ($dataSorted as $key => $value) {
                if ($key >= $start && $key < $end) {
                    $partOfRelecteur[$key] = $value;
                }
            }

            return Outil::getDataSiretisable($partOfRelecteur, $nom_entreprise, $code_postal, $adresse_entreprise);
        } catch (\Exception $e) {
            dd($e); //Pour voir l'erreur précis
            $errorArray = array("type" => "getPartDataForRelecteurs", "designation" => "Outil->getPartDataForRelecteurs->Erreur lors du traitement", "erreur" => $e);
            Outil::saveError($errorArray);
        }
    }

    public static function getPartDataForSiretiseurs($codification_id, $nombre_mot)
    {
        try {
            $codification_query = Codification::where('id', $codification_id)->first();

            $partOfRelecteur    = array();
            $dataSorted         = array();
            $data               = json_decode($codification_query->donnees, true);

            $nom_entreprise     = $codification_query->shortcut_nom_entreprise;
            $code_postal        = $codification_query->shortcut_code_postal_entreprise;
            $adresse_entreprise = $codification_query->shortcut_adresse_entreprise;
            $last_index         = $codification_query->last_index;

            ksort($data);
            $k = 0;

            foreach ($data as $value) {
                $dataSorted[$k++] = $value;
            }
            $data_sorted = Outil::getDataSiretisable($dataSorted, $nom_entreprise, $code_postal, $adresse_entreprise);

            $start = $last_index;
            $end   = $start + $nombre_mot;

            foreach ($data_sorted as $key => $value) {
                if ($key >= $start && $key < $end) {
                    $partOfRelecteur[$key] = $value;
                }
            }
            // Reindexation des données 

            $partOfRelecteur = array_values($partOfRelecteur);
            $data_indexer = [];
            foreach ($partOfRelecteur as $key => $value) {
                $value['index'] = $key;
                array_push($data_indexer, $value);
            }

            $codification_query->last_index = $end;
            $codification_query->save();

            return $data_indexer;
        } catch (\Exception $e) {
            dd($e); //Pour voir l'erreur précis
            $errorArray = array("type" => "getPartDataForRelecteurs", "designation" => "Outil->getPartDataForRelecteurs->Erreur lors du traitement", "erreur" => $e);
            Outil::saveError($errorArray);
        }
    }

    public static function getPartDataForRelecteursAuFil($codification, $data, $start, $end)
    {
        try {


            $partOfRelecteur    = array();
            $dataSorted         = array();

            $oneItem            = $data[0];
            $est_relue          = false;
            $multiplicateur     = 0;

            $nom_entreprise     = $codification->shortcut_nom_entreprise;
            $code_postal        = $codification->shortcut_code_postal_entreprise;
            $adresse_entreprise = $codification->shortcut_adresse_entreprise;






            ksort($data);
            $k = 0;

            foreach ($data as $value) {
                $dataSorted[$k++] = $value;
            }

            foreach ($dataSorted as $key => $value) {
                if ($key >= $start && $key < $end) {
                    $partOfRelecteur[$key] = $value;
                }
            }
            return Outil::getDataSiretisable($partOfRelecteur, $nom_entreprise, $code_postal, $adresse_entreprise);
        } catch (\Exception $e) {
            dd($e); //Pour voir l'erreur précis
            $errorArray = array("type" => "getPartDataForRelecteursAuFil", "designation" => "Outil->getPartDataForRelecteursAuFil->Erreur lors du traitement", "erreur" => $e);
            Outil::saveError($errorArray);
        }
    }
    public static function getAllDataReformated($codification_id)
    {
        try {
            $codification_query = Codification::where('id', $codification_id)->first();
            $partOfRelecteur    = array();
            $dataSorted         = array();
            $data               = json_decode($codification_query->donnees, true);


            $oneItem            = $data[0];
            $est_relue          = false;
            $multiplicateur     = 0;

            $question_ouverte   = $codification_query->questions_ouvertes;
            $question_aides     = $codification_query->questions_aides;

            if (isset($oneItem["index"])) {
                $est_relue      = true;
                $multiplicateur = count(explode(",", $question_ouverte));
            }

            ksort($data);
            $k = 0;

            foreach ($data as $value) {
                $dataSorted[$k++] = $value;
            }

            foreach ($dataSorted as $key => $value) {
                $partOfRelecteur[$key] = $value;
            }

            if ($est_relue) {
                return $partOfRelecteur;
            } else {
                $partOfRelecteur  = Outil::retraiterData($partOfRelecteur, $question_ouverte, $question_aides);

                return $partOfRelecteur;
            }
        } catch (\Exception $e) {
            dd($e); //Pour voir l'erreur précis
            $errorArray = array("type" => "getAllDataReformated", "designation" => "Outil->getAllDataReformated->Erreur lors du traitement", "erreur" => $e);
            Outil::saveError($errorArray);
        }
    }

    public static  function checkIfExistInUserDone($current_user_data)
    {
        $retour = [];
        if (!empty($current_user_data)) {
            foreach ($current_user_data as $i => $oneCurrent_user_data) {
                if (isset($oneCurrent_user_data["siret"])  || isset($oneCurrent_user_data["vu_entreprise"])) {
                    $retour =  $oneCurrent_user_data;
                }
            }
        }

        return $retour;
    }
    public static function getDataSiretisable($donnees, $nom_entreprise = "", $code_postal = "",  $adresse_entreprise = "")
    {
        try {
            $data = [];
            $i    = 0;

            foreach ($donnees as $value) {
                $data[$i]["index"]  = $i;
                $data[$i]["IDLVDC"] = $value["IDLVDC"];
                foreach ($value["QuestionnairesComplet"] as $valeur) {
                    // On afr2ara uniquement les réponses où :
                    // ID non vide
                    // Et Nom entreprise non vide
                    // Et (Adresse ou Code postal est non vide)

                    // Le jour ou le shortcut de l'id est different de CLEF_DEV y'aura probleme ????
                    // Si l'une des conditions n'est pas vérifiée, on sort du boucle complètement !!! 
                    if (($valeur["libelle_court"] == "CLEF_DEV") && ($valeur["reponse"] === "")) {
                        break;
                    }

                    if (($valeur["libelle_court"] === $nom_entreprise) && ($valeur["reponse"] == "")) {
                        break;
                    }
                    if (($valeur["libelle_court"] === $code_postal && $valeur["reponse"] === "") && ($valeur["libelle_court"] === $adresse_entreprise && $valeur["reponse"] === "")) {
                        break;
                    }
                    // Arrivez ici les conditions sont satisfaites, on continue 
                    if (($valeur["libelle_court"] === "CLEF_DEV")) {
                        $data[$i]["ID"] = $valeur["reponse"];
                    } else {
                        //dd($valeur);
                    }
                    if ($valeur["libelle_court"] === $nom_entreprise) {
                        $data[$i]["nom_entreprise"] = $valeur["reponse"];
                    }

                    if (($valeur["libelle_court"] === $code_postal) || ($valeur["libelle_court"] === $adresse_entreprise)) {
                        if ($valeur["libelle_court"] === $code_postal) {
                            $data[$i]["code_postal"] = $valeur["reponse"];
                        } elseif ($valeur["libelle_court"] === $adresse_entreprise) {
                            $data[$i]["adresse"] = $valeur["reponse"];
                        }
                    }
                }

                $data[$i]["QuestionnairesComplet"] = $value["QuestionnairesComplet"];
                $i++;
            }
            $tab_incorrect = array();
            $data_propres  = array();
            foreach ($data as $key => $value) {
                if (!isset($value["nom_entreprise"]) || !isset($value["ID"])) {
                    array_push($tab_incorrect, $value);
                } elseif (($value["adresse"] === "") && isset($value["code_postal"]) && ($value["code_postal"] === "")) {
                    array_push($tab_incorrect, $value);
                } else {
                    if ((count($value) < 7) && ($value["adresse"] == "") && !isset($value["code_postal"])) {
                        array_push($tab_incorrect, $value);
                    } elseif ((count($value) < 7) && isset($value["code_postal"])  && ($value["code_postal"] == "") && !isset($value["adresse"])) {
                        array_push($tab_incorrect, $value);
                    } else {
                        if (!isset($value['adresse'])) {
                            $value['adresse'] = "";
                        }
                        if (!isset($value['code_postal'])) {
                            $value['code_postal'] = "";
                        }
                        array_push($data_propres, $value);
                    }
                }
            }
            //dd($tab_incorrect);
            // recréation de l'index de la table 
            $data_propres = array_values($data_propres); // Pour preuve de prudence
            $data_indexer = [];
            foreach ($data_propres as $key => $value) {
                $value['index'] = $key;
                array_push($data_indexer, $value);
            }

            return $data_indexer;
        } catch (\Exception $e) {
            dd($e); //Pour voir l'erreur précis
            $errorArray = array("type" => "retraiterData", "designation" => "Outil->getDataSiretisable()->Erreur lors du traitement", "erreur" => $e);
            Outil::saveError($errorArray);
        }
    }
    public static function retraiterData($donnees, $question_ouverte, $question_aides)
    {
        try {
            $data = [];
            $liste_question = explode(",", $question_ouverte);
            $question_aides = json_decode($question_aides, true);
            $i = 0;
            foreach ($donnees as $value) {
                foreach ($value["QuestionnairesComplet"] as $valeur) {

                    if (in_array($valeur["libelle_court"], $liste_question)) {
                        $data[$i]["index"]              = $i;
                        $data[$i]["IDLVDC"]             = $value["IDLVDC"];
                        $data[$i]["shortcut_codif"]     = $valeur["libelle_court"];
                        $data[$i]["libelle_long_codif"] = $valeur["libelle_long"];
                        $data[$i]["reponse_codif"]      = $valeur["reponse"];

                        if (!isset($data[$i]["new"]) && !empty($data[$i]["reponse_codif"])) {
                            $data[$i]["new"] = 1;
                        }

                        foreach ($question_aides as $aide) {
                            if ($aide['question_codif'] == $valeur["libelle_court"]) {
                                foreach ($value["QuestionnairesComplet"] as $ques_aide) {
                                    if (isset($aide["question_aide"]) && ($aide["question_aide"] == $ques_aide["libelle_court"])) {
                                        $data[$i]["shortcut_aide"]     = $ques_aide["libelle_court"];
                                        $data[$i]["libelle_long_aide"] = $ques_aide["libelle_long"];
                                        $data[$i]["reponse_aide"]      = $ques_aide["reponse"];
                                    }
                                }
                            }
                        }

                        $data[$i]["QuestionnairesComplet"] = $value["QuestionnairesComplet"];
                        $i++;
                    }
                }
            }

            return $data;
        } catch (\Exception $e) {
            dd($e); //Pour voir l'erreur précis
            $errorArray = array("type" => "retraiterData", "designation" => "Outil->retraiterData->Erreur lors du traitement", "erreur" => $e);
            Outil::saveError($errorArray);
        }
    }

    public static function getNomComplet($args)
    {
        try {
            return  Relecteur::where('id', $args)->first()->nom_complet;
        } catch (\Exception $e) {
            dd($e); //Pour voir l'erreur précis
            $errorArray = array("type" => "getNomComplet", "designation" => "Outil->getNomComplet->Erreur lors du traitement", "erreur" => $e);
            Outil::saveError($errorArray);
        }
    }

    public static function getEtudeNumeroByCodifID($args)
    {
        try {
            $etude =  $etude = Etude::whereIn('id', Codification::where('id', $args)
                ->selectRaw("etude_id"))
                ->selectRaw("numero_etude")
                ->selectRaw('nom_etude')->first();

            return  $etude->nom_etude . " " . $etude->numero_etude;
        } catch (\Exception $e) {
            dd($e); //Pour voir l'erreur précis
            $errorArray = array("type" => "getEtudeNumeroByCodifID", "designation" => "Outil->getEtudeNumeroByCodifID->Erreur lors du traitement", "erreur" => $e);
            Outil::saveError($errorArray);
        }
    }

    public static function getDataCodif($donnee_codification, $args)
    {
        try {
            $tab_data                    = array();
            $relecteur_id                = User::where('id', auth()->user()->id)->first()->relecteur_id;
            $codifRelecteurs              = CodificationRelecteur::where('codification_id', $args)->where('relecteur_id', $relecteur_id)->get();


            $tab_data["Id_askia"]        = $donnee_codification->etude->id_askia;
            $tab_data["etude_id"]        = $donnee_codification->etude_id;
            $tab_data["codification_id"] = $args;
            $tab_data["relecteur_id"]    = $relecteur_id;

            $codification = [];
            foreach ($codifRelecteurs as $key => $codifRelecteur) {
                $data_codifier                    = array_values(json_decode($codifRelecteur->donnees, true));
                $nombre_sireter                   = count($data_codifier);
                $nombre_fait                      = Outil::getNombreSiretiser($data_codifier);
                $numero_assignation               = $key + 1;
                $codification[$key]["ID"]         = $codifRelecteur->id;
                $codification[$key]["nom"]        = "Assignat. " . $numero_assignation;
                $codification[$key]["total"]      = $nombre_sireter;
                $codification[$key]["faits"]      = $nombre_fait;
                $codification[$key]["restant"]    = $nombre_sireter - $nombre_fait;
                $codification[$key]["avancement"] = 0;

                if ($nombre_sireter > 0 &&  $nombre_fait > 0) {
                    $codification[$key]["avancement"] = round(($nombre_fait  / $nombre_sireter) * 100, 2);
                }
            }
            $tab_data["donnees"] = $codification;

            return $tab_data;
        } catch (\Exception $e) {
            dd($e); //Pour voir l'erreur précis
            $errorArray = array("type" => "recap_data_codif", "designation" => "Outil->getDataCodif->Erreur lors du traitement", "erreur" => $e);
            Outil::saveError($errorArray);
        }
    }

    public static function getNombreTraiter($id)
    {
        $oneItem = CodificationRelecteur::where('codification_id', $id)->get();
        $total   = 0;

        foreach ($oneItem as $item) {
            $total += $item->nbre_traite;
        }

        return $total;
    }

    public static function getNombreMot($id)
    {
        $oneItem = CodificationRelecteur::where('codification_id', $id)->get();
        $total   = 0;

        foreach ($oneItem as $item) {
            $total += $item->nbre_mot;
        }

        return $total;
    }

    public static function placer_code_codification($questionnaire, $key, $values)
    {
        $questionnaire = [];

        foreach ($values["QuestionnairesComplet"] as $value) {
            if (($values["shortcut_codif"] == $value["libelle_court"]) || ($values["shortcut_aide"] == $value["libelle_court"])) {
                $entete = $value["libelle_court"] . ' - ' . $value["libelle_long"];
                $questionnaire[$key][$entete] = $value["reponse"];
            }
        }
        $tmp = "code_" . $values["shortcut_codif"];
        if (isset($values[$tmp])) {
            $questionnaire[$key][$tmp] = implode(";", $values[$tmp]);
        } else {
            $questionnaire[$key][$tmp] = "";
        }
        return $questionnaire;
    }

    public static function generateDonneesCodifier($donnees, $id = null)
    {
        try {
            $merged = [];

            foreach ($donnees as $value) {
                $merged = array_merge($merged, json_decode($value->donnees, true));
            }
            $data = [];

            // Cas ou l'netreprise n'est trouver 
            foreach ($merged as $key => $values) {

                if (isset($values['siret'])) {

                    $data[$key]["IDLVDC"]                  = $values['IDLVDC'];
                    $data[$key]["ID"]                      = $values['ID'];
                    $data[$key]["DenominationUnite"]       = $values['nom_entreprise'];
                    $data[$key]["Adresse"]                 = $values['adresse'];
                    $data[$key]["CodePostalETablissement"] = $values['code_postal'];
                    $data[$key]["SIRET RESTITUTION"]       = isset($values['siret']) ?  preg_replace('/\s+/', '', $values['siret']) : "";
                    $data[$key]["Téléphone"]               = isset($values['telephone']) ?  preg_replace('/\s+/', '', $values['telephone']) : "";
                    $data[$key]["Code Naf"]                = isset($values['code_naf']) ?  preg_replace('/\s+/', '', $values['code_naf']) : "";
                    $data[$key]["Tranche d'effectif"]      = $values['tranche_effectif'] ?? "";
                    $data[$key]["Non trouvé"]              = False;
                } else if (isset($values['vu_entreprise'])) {

                    $data[$key]["IDLVDC"]                  = $values['IDLVDC'];
                    $data[$key]["ID"]                      = $values['ID'];
                    $data[$key]["DenominationUnite"]       = $values['nom_entreprise'];
                    $data[$key]["Adresse"]                 = $values['adresse'];
                    $data[$key]["CodePostalETablissement"] = $values['code_postal'];
                    $data[$key]["SIRET RESTITUTION"]       = isset($values['siret']) ?  preg_replace('/\s+/', '', $values['siret']) : "";
                    $data[$key]["Téléphone"]               = isset($values['telephone']) ?  preg_replace('/\s+/', '', $values['telephone']) : "";
                    $data[$key]["Code Naf"]                = isset($values['code_naf']) ?  preg_replace('/\s+/', '', $values['code_naf']) : "";
                    $data[$key]["Tranche d'effectif"]      = $values['tranche_effectif'] ?? "";
                    $data[$key]["Non trouvé"]              = True;
                }
            }
            $data = array_values($data);
            ksort($data);

            // dd("json_encode", $data);
            return  $data;
        } catch (\Exception $e) {
            dd($e); //Pour voir l'erreur précis
            $errorArray = array("type" => "generer donnees codifier", "designation" => "Outil->generateDonneesCodifier->Erreur lors du traitement", "erreur" => $e);
            Outil::saveError($errorArray);
        }
    }

    public static function getArraySiretRecap($id)
    {
        $merged  = [];
        $donnees = CodificationRelecteur::where('codification_id', $id)->selectRaw("donnees")->get();

        foreach ($donnees as $value) {
            $merged = array_merge($merged, json_decode($value->donnees, true));
        }
        // On a les donnees... 
        // Nb d'entreprises SIRET QUALIFIEES
        $nb_entreprise_siret_quelifier = 0;
        // Nb d'entreprises TELEPHONE QUALIFIEES
        $nb_entreprise_tel_qualifier = 0;
        // Nb d'entreprises NAF QUALIFIEES
        $nb_entreprise_naf = 0;
        // Nb d'entrepr ises EFFECTIFS QUALIFIEES
        $nb_entreprise_tranche_effectif = 0;
        // Nb d'entreprise QUALIFIEES (SIRET+TEL+NAF+EFFECTIF)
        $nb_entreprise_qualifiees = 0;
        //nb_entreprise_recherchee
        $nb_entreprise_recherchee = 0;

        foreach ($merged as $key => $value) {
            if (isset($value["siret"])) {
                $nb_entreprise_siret_quelifier++;
            }
            if (isset($value["telephone"])) {
                $nb_entreprise_tel_qualifier++;
            }
            if (isset($value["code_naf"])) {
                $nb_entreprise_naf++;
            }
            if (isset($value['tranche_effectif'])) {

                $nb_entreprise_tranche_effectif++;
            }
            if (isset($value["siret"]) && isset($value["telephone"]) && isset($value["code_naf"]) && isset($value['tranche_effectif'])) {
                $nb_entreprise_qualifiees++;
            }
            if (isset($value["siret"]) || isset($value["vu_entreprise"])) {
                $nb_entreprise_recherchee++;
            }
            # code...
        }


        $result = [];
        $result["nb_entreprise_siret_quelifier"]  = $nb_entreprise_siret_quelifier;
        $result["nb_entreprise_tel_qualifier"]    = $nb_entreprise_tel_qualifier;
        $result["nb_entreprise_tranche_effectif"] = $nb_entreprise_tranche_effectif;
        $result["nb_entreprise_qualifiees"]       = $nb_entreprise_qualifiees;
        $result["nb_entreprise_naf"]              = $nb_entreprise_naf;
        $result["nb_entreprise_recherchee"]       = $nb_entreprise_recherchee;

        return  $result;
    }

    public static function getArraySumSiretRecap($list)
    {
        $data = [];

        foreach ($list as $key => $value) {
            $data[$key] = Outil::getArraySiretRecap($value);
        }

        $keySum = [];
        $keys = array_keys($data[0]); // Supposons que tous les sous-tableaux ont les mêmes clés

        foreach ($keys as $key) {
            $column = array_column($data, $key);
            $keySum[$key] = array_sum($column);
        }
        return  $keySum;
    }
    public static function getDonneesRelues($donnees)
    {
        $merged = [];
        //Fusionner les données 
        foreach ($donnees as $value) {
            $merged = array_merge($merged, json_decode($value->donnees, true));
        }

        $data = [];
        foreach ($merged as $key => $value) {
            if (
                (isset($value["reponse_relue"]) && $value["reponse_relue"] != $value["reponse_codif"])
                ||
                (isset($value["relue"]) && $value["relue"] == 1)
                ||
                (empty($value["reponse_codif"]))
            ) {
                if (isset($value["reponse_relue"])) {
                    $tmp = $value["reponse_relue"];
                    unset($value["reponse_relue"]);
                    $value["reponse_codif"] =  $tmp;
                    $value["index"] =  $key;
                }


                array_push($data, $value);
            }
        }

        return $data;
    }


    public static function generateDonneesRelues($donnees)
    {
        try {
            $merged = [];
            foreach ($donnees as $value) {
                $merged = array_merge($merged, json_decode($value->donnees, true));
            }
            $questionnaire = [];

            foreach ($merged as $key => $values) {
                $questionnaire[$key]["IDLVDC"] = $values["IDLVDC"];
                foreach ($values["QuestionnairesComplet"] as $value) {
                    if (($values["shortcut_codif"] == $value["libelle_court"])  ||  (isset($values["shortcut_aide"]) && ($values["shortcut_aide"] == $value["libelle_court"]))) {
                        $entete = $value["libelle_court"] . ' - ' . $value["libelle_long"];
                        $questionnaire[$key][$entete] = $value["reponse"];
                        if ($values["shortcut_codif"] == $value["libelle_court"]) {
                            $questionnaire[$key][$entete] = (isset($values["reponse_relue"]) ? $values["reponse_relue"] : $value["reponse"]);
                        }
                    }
                }
            }
            $donnees_final = array();
            $donnees       = array();
            //dd($questionnaire);
            foreach ($questionnaire as $key => $item) {
                $donnees[$item['IDLVDC']][$key] = $item;
            }

            $i = 0;
            foreach ($donnees as $values) {
                $array = array();
                foreach ($values as $value) {
                    $array = array_merge($array, $value);
                }
                $donnees_final[$i++] = $array;
            }

            // Reordonner les données avant export 
            $data = [];

            foreach ($donnees_final as $values) {
                ksort($values);
                array_push($data, $values);
            }

            return  json_encode($data);
        } catch (\Exception $e) {
            dd($e); //Pour voir l'erreur précis
            $errorArray = array("type" => "generer donnees codifier", "designation" => "Outil->generateDonneesCodifier->Erreur lors du traitement", "erreur" => $e);
            Outil::saveError($errorArray);
        }
    }
    //récuépérer les entreprises
    public static function getEntreprises($list_id)
    {
        try {
            $retour = false;

            $tableList = "AskList" . $list_id;
            $requete = "SELECT ID_ENTREPRISE, ENTREPRISE, TELEPHONE FROM " . $tableList . " GROUP BY ID_ENTREPRISE, ENTREPRISE, TELEPHONE";
            $items = Outil::requeteInBd("Lists", $requete, "liste");
            //dd($items);
            foreach ($items as $key => $value) {
                $code = trim($value["ID_ENTREPRISE"]);
                $item = Entreprise::where("code", $code)->first();
                if (empty($item)) //Si ca existe on crée, sinon on met à jour seulement les informations
                {
                    $item                   = new Entreprise();
                }
                $item->code                 = $code;
                $item->designation          = Outil::donneBonFormatString($value["ENTREPRISE"]);
                $item->tel                  = Outil::donneBonFormatString($value["TELEPHONE"]);
                $item->save();

                //Enregistrement utilisateur
                $user = User::where('entreprise_id', $item->id)->first();
                if (empty($user)) {
                    $user = new User();
                    $user->password_seen        = Outil::generer_password();
                    $user->password             = Hash::make($user->password_seen);
                }
                $user->name                     = $item->designation;
                $user->type                     = 1; // Car type = 1 ==> Entreprise
                $user->entreprise_id            = $item->id;
                $user->entreprise_code          = $item->code;
                $user->entreprise_designation   = $item->designation;

                $user->save();

                //Assignation role
                $role = Role::where('name', "admin")->first();
                $user->syncRoles($role);

                //Matricule identifiant
                Outil::donneLoginUser($user);
            }

            $retour = true;
            return $retour;
        } catch (\Exception $e) {
            dd($e); //Pour voir l'erreur précis
            $errorArray = array("type" => "synchronisation", "designation" => "Outil->getEntreprises->Erreur lors du traitement", "erreur" => $e);
            Outil::saveError($errorArray);
        }
    }

    //récuépérer les relecteurs
    public static function saveRelecteurOnUser($request)
    {
        try {

            $item = Relecteur::where("email", $request->email)->first();

            if (!empty($item)) //Si ca n'existe pas, on crée, sinon on met à jour seulement les informations
            {
                //Enregistrement utilisateur
                $user = User::where('relecteur_id', $item->id)->first();
                if (empty($user)) {
                    $user = new User();
                    $user->password_seen = Outil::generer_password();
                    $user->password      = Hash::make($user->password_seen);

                    $user->name         = $item->nom_complet;
                    $user->email        = $item->email;
                    $user->relecteur_id = $item->id;

                    $user->save();
                    //Assignation role
                    $role = Role::where('name', "relecteur")->first();
                    $user->syncRoles($role);
                }
            }

            $retour = true;
            return $retour;
        } catch (\Exception $e) {
            dd($e); //Pour voir l'erreur précis
            $errorArray = array("type" => "synchronisation", "designation" => "Outil->getEntreprises->Erreur lors du traitement", "erreur" => $e);
            Outil::saveError($errorArray);
        }
    }

    //récuépérer les contacts
    public static function getContacts($list_id)
    {
        try {
            $retour = false;

            $tableList = "AskList" . $list_id;
            $requete = "SELECT * FROM " . $tableList . "";
            $items = Outil::requeteInBd("Lists", $requete, "liste");
            //dd($items);
            foreach ($items as $key => $value) {
                $code = trim($value["IDLVDC"]);
                $item = Contact::where("id_lvdc", $code)->first();
                if (empty($item)) //Si ca existe on crée, sinon on met à jour seulement les informations
                {
                    $item                   = new Contact();
                }

                $item->id_lvdc                      = $code;
                $item->nom_complet                  = Outil::donneBonFormatString($value["NOM_PARTICIPANT"]);
                $item->date_naissance               = Outil::donneValueSynchro($value["DATE_NAISSANCE"]);
                $item->entreprise_code              = $value["ID_ENTREPRISE"];
                $item->entreprise_designation       = Outil::donneValueSynchro($value["ENTREPRISE"]);
                $item->genre                        = $value["GENRE"];
                $item->expert_metier                = Outil::donneValueSynchro($value["EXPERT_METIER"]);
                $item->objectif_operation           = Outil::donneValueSynchro($value["OBJECTIF_DE_LOPERATION"]);
                $item->siret                        = Outil::donneValueSynchro($value["SIRET"]);
                $item->type_contrat                 = Outil::donneValueSynchro($value["TYPE__DE_CONTRAT"]);
                $item->ville                        = Outil::donneValueSynchro($value["VILLE"]);
                $item->tel                          = Outil::donneValueSynchro($value["TEL_APPRENANT"]);
                $item->mail                         = Outil::donneValueSynchro($value["MAIL_APPRENANT"]);

                $item->cqp                          = Outil::donneValueSynchro($value["CQP"]);
                $item->civilite                     = Outil::donneValueSynchro($value["CIVILITE"]);
                $item->annee_obtention              = Outil::donneValueSynchro($value["ANNEE_OBTENTION"]);
                $item->save();
            }

            $retour = true;
            return $retour;
        } catch (\Exception $e) {
            dd($e); //Pour voir l'erreur précis
            $errorArray = array("type" => "synchronisation", "designation" => "Outil->getContacts->Erreur lors du traitement", "erreur" => $e);
            Outil::saveError($errorArray);
        }
    }

    //Vérifie le numéro de téléphone
    public static function donneBonNumeroTel($tel = null)
    {
        /*Un bon numéro doit:
        - Commencer par 01 à 09
        - Avoir 10 chiffres
        */
        try {
            $retour = null; //Retourne null si le nuémro n'est pas bon
            if (isset($tel)) {
                //on ne garde que les chiffres (on supprime les +, les tirets, les espaces,  etc)
                $tel = preg_replace('/[^0-9.]+/', '', $tel);
                if (isset($tel)) {
                    $tel = intval($tel); //Enlever tous les 0 devant s'il y'en a

                    $deux_caractere = substr($tel, 0, 2);
                    if ($deux_caractere == "33") //Si numéro commence par 33 ==> Enlever le 33
                    {
                        //Enlever le 33
                        $tel = substr($tel, 2);
                    }

                    $premier_caractere = substr($tel, 0, 1);
                    if ($premier_caractere >= 1 && $premier_caractere <= 9) //Si numéro commence de 1 à 9
                    {
                        $tel = "0" . $tel;  //On ajoute 0 devant
                        if (strlen($tel) == 10) //Si lonhgeureur numero = 10
                        {
                            $retour = $tel;
                        }
                    }
                }
            }

            return $retour;
        } catch (\Exception $e) {
            //dd($e);
            $errorArray = array("type" => "check_validite", "designation" => "Outil->donneBonNumeroTel->Erreur lors du traitement", "erreur" => $e);
            Outil::saveError($errorArray);
        }
    }

    //Vérifie le numéro de téléphone
    public static function donneBonEmail($email = null)
    {
        try {
            $retour = null; //Retourne null si le nuémro n'est pas bon
            if (isset($email)) {
                $retour = strtolower($email);
                if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                    // invalid email
                    $retour = null;
                }
            }

            return $retour;
        } catch (\Exception $e) {
            //dd($e);
            $errorArray = array("type" => "check_validite", "designation" => "Outil->donneBonEmail->Erreur lors du traitement", "erreur" => $e);
            Outil::saveError($errorArray);
        }
    }

    //Sans ca les requêtes avec accent ne passent pas
    public static function encodeForSqlServer($val)
    {
        $retour = iconv('utf-8', 'latin1', $val);
        return $retour;
    }

    //Test si un string (chaine de caractères) est un binaire c'est à dire précédé de la lettre b
    public static function isBinary($value)
    {
        return false === mb_detect_encoding((string)$value, null, true);
    }

    //Fonction importante qui formate la chaines de caractères pour ne garder que les valeurs alpha numériques et les ponctuations
    public static function donneBonFormatString($val)
    {
        $retour = null;

        $valEncoded = iconv("CP1256", 'UTF-8', trim($val));

        $valueToTransform = $valEncoded;
        $valueToTransform = trim(preg_replace('/\s+/', ' ', $valueToTransform)); //Remplace /n /r par vide
        $valueToTransform = utf8_encode($valueToTransform);
        $valueToTransform = iconv('utf-8', 'latin1', $valueToTransform);

        $estBinary = Outil::isBinary($valueToTransform);
        if ($estBinary == true) {
            $retour = preg_replace('/[^\p{Latin}\d\s\p{P}]/u', '', $valEncoded);
        } else {
            $retour = preg_replace('/[^\p{Latin}\d\s\p{P}]/u', '', $valueToTransform);
        }

        return $retour;
    }

    //Sans ca les requêtes avec accent ne passent pas
    public static function donneValueSynchro($val = null)
    {
        $retour = null;

        if (!empty($val)) {
            $retour = Outil::donneBonFormatString($val);
        }

        return $retour;
    }


    public static function donneElementsPreselectionAleatoire($argumentsArray, $query)
    {
        $cpt = 0; //Nombre de parcours au grand total
        $offset = -1;
        $somme = 0;
        $montant_preselection_aleatoire = $argumentsArray['montant_preselection_aleatoire'];
        $date_fin = $argumentsArray['date_end'];
        $idsArray = array();
        while ($somme <= $montant_preselection_aleatoire && $offset <= 30)  //Limite à 30 parcours de commande pour un jour
        {
            $date_debut = $argumentsArray['date_start'];
            $offset++;
            $cpt++;
            while ($somme <= $montant_preselection_aleatoire && $date_debut <= $date_fin) {
                $cpt++;
                $date_debut = Outil::donneDateParRapportNombreJour($date_debut, 1);
                $date_debut_filtre = $date_debut . ' 00:00:00';
                $date_fin_filtre = $date_debut . ' 23:59:59';

                $item = new Commande();
                $item = $item->whereBetween('date', [$date_debut_filtre, $date_fin_filtre]);
                $item = $item->whereNotNull('montant_total_commande');
                $item = $item->whereNotIn('id', DetailFacture::whereNotNull('commande_id')->get(['commande_id']));
                $item = $item->orderBy('date', 'asc');
                $item = $item->offset($offset)->first();
                if (isset($item)) {
                    $sommeTmp = $somme + $item->montant_total_commande;
                    if ($sommeTmp > $montant_preselection_aleatoire) {
                        break;
                    } else {
                        $somme = $sommeTmp;
                        array_push($idsArray, $item->id);
                    }
                }
            }
        }
        //dd($somme);
        //dd($cpt);

        $query = $query->whereIn('id', $idsArray);
        return $query;
    }
    public static function regulePaiementCommande()
    {

        $commandes = Commande::query();
        if (isset($commandes)) {
            foreach ($commandes as $key => $commande) {
                if (isset($commande)) {
                    $query = DB::table('paiements')
                        ->join('commandes', 'commandes.id', '=', 'paiements.commande_id')
                        ->selectRaw('sum(paiements.montant) as montant_total_paye')
                        ->where('commandes.id', $commande->id);

                    if (isset($query->first()->montant_total_paye)) {
                        $commande->restant_payer      = $commande->montant_total_commande - $query->first()->montant_total_paye;
                        $commande->montant_total_paye = $query->first()->montant_total_paye;
                        $commande->save();
                    }
                }
            }
        }
    }
    public static function getTrancheByHoure($houre)
    {
        $tranche = Tranchehoraire::query()->where('heure_debut', '<=', $houre)->where('heure_fin', '>=', $houre)->first();

        return $tranche;
    }

    public static function enregistrerBci($myItem, $myArray)
    {
        $pdf = null;
        if (isset($myArray)) {
            $item = $myItem;
            $item->save();

            if ($item->code == null || $item->code == '') {
                self::getCode($item);
            }

            $allbciproduits = Bciproduit::where('bci_id', $item->id)->get();
            $details = $myArray;
            if ($allbciproduits) {
                self::Checkdetail($allbciproduits, $details, Bciproduit::class, 'produit_id');
            }

            if (isset($details)) {
                $montant = 0;
                foreach ($details as $key => $value) {

                    if (empty($value['produit_compose_id'])) {
                        $errors = "Veuillez choisir un produit à la ligne " . ($key + 1);
                    } else {
                        $ligneproduit = Bciproduit::where('bci_id', $item->id)->where('produit_id', $value['produit_compose_id'])->first();

                        if ($ligneproduit && !isset($request->id)) {
                            //$errors = "le produit à la ligne " . ($key + 1) . " existe déja";
                        } else {
                            $produit = Produit::find($value['produit_compose_id']);
                            if (!isset($produit)) {
                                $errors = "le produit à la ligne " . ($key + 1) . " n'existe plus";
                            }
                        }
                    }

                    if (!isset($value['quantite']) || !is_numeric($value['quantite'])) {
                        $errors = "Veuillez definir la quantite à la ligne" . ($key + 1);
                    }

                    if (!isset($errors)) {
                        if (!isset($ligneproduit)) {
                            $ligneproduit = new Bciproduit();
                            $ligneproduit->bci_id = $item->id;
                        }

                        if (!isset($errors)) {
                            if ($value['quantite'] > 0) {

                                $ligneproduit->produit_id = $value['produit_compose_id'];
                                $ligneproduit->quantite = $value['quantite'];
                                $ligneproduit->save();

                                $montant += ((int)$value['quantite'] * $value["pa"]);
                            } else if (isset($ligneproduit)) {
                                $ligneproduit->delete();
                            }
                        }
                    }
                }
                //   dd($errors);
                $data = array('item' => ["code" => $item->code, "montant" => $montant], 'details' => $details,);

                $pdf = \PDF::loadView('pdfs.bci', $data);
            }
        }
        return $pdf;
    }

    public static function enregistrerPaimentsDejaFaitsSurFacture($myItem, $myArray)
    {
        if (!empty($myArray)) {
            //Au cas ou c'est un element on redéfinit le tableau
            if (empty($myArray[0])) {
                if (isset($myArray)) {
                    //Cas une seule ligne qui ne passait pas
                    $arrayTmp = array();
                    array_push($arrayTmp, $myArray);
                    $myArray = $arrayTmp;
                }
            }
            foreach ($myArray as $value) {
                $itemId = $value["id"];
                $itemGeneralId = $myItem->id;
                $filtres = "commande_id:" . $itemId;
                $paiements = Outil::getOneItemWithFilterGraphQl("paiements", $filtres);
                if (!empty($paiements)) {
                    foreach ($paiements as $value2) {
                        $itemArrayPaiement = array("mode_paiement_id" => $value2["mode_paiement_id"], "montant" => $value2["montant"], "facture_id" => $itemGeneralId, "compta" => $myItem->compta);
                        $retourSavePaiement = Outil::enregistrerPaiement('facture', $itemArrayPaiement);
                    }
                }
            }
        }
    }

    public static function enregistrerFamilleLiaisonProduit($familleliaisonproduits, $item)
    {
        /* if (isset($allfamilleliaisonproduits)) {
            Outil::Checkdetail($allfamilleliaisonproduits, $familleliaisonproduits, FamilleLiaisonProduit::class, ['famille_id', 'pour_menu']);
        }*/
        $errors = null;
        if (isset($familleliaisonproduits)) {
            foreach ($familleliaisonproduits as $key => $value) {
                $pour_menu = (isset($value['pour_menu']) && $value['pour_menu'] == true) ? true : false;
                if (empty($value['famille_id'])) {
                    $errors = "Veuillez choisir une famille à la ligne " . ($key + 1);
                } else {
                    if (is_numeric($value['famille_id']) == true) {
                        $value['famille_id'] = (int)$value['famille_id'];
                    } else {
                        $designation = $value['famille_id'];
                        $famille = Famille::whereRaw('TRIM(lower(designation)) = TRIM(lower(?))', ["$designation"])->first();
                        if (isset($famille->id)) {
                            $value['famille_id'] = $famille->id;
                            $lignefamilleliaison = FamilleLiaisonProduit::where('produit_id', $item->id)
                                ->where('famille_id', $value['famille_id'])
                                ->where('pour_menu', $pour_menu)->first();
                        } else {
                            $errors = "Veuillez choisir une famille à la ligne " . ($key + 1);
                        }
                    }
                }
                if (!isset($value['quantite']) || !is_numeric($value['quantite'])) {
                    $errors = "Veuillez définir la quantité à la ligne" . ($key + 1) . '==>' . $value['quantite'];
                }
                // dd($errors);

                if (!isset($errors)) {
                    if (!isset($lignefamilleliaison)) {
                        $lignefamilleliaison = new FamilleLiaisonProduit();
                    }

                    if ($value['quantite'] > 0) {
                        $lignefamilleliaison->famille_id = $value['famille_id'];
                        $lignefamilleliaison->produit_id = $item->id;
                        $lignefamilleliaison->quantite = intval($value['quantite']);
                        $lignefamilleliaison->pour_menu = $pour_menu;
                        $lignefamilleliaison->save();
                    } else {
                        $errors = 'Le montant doit être positif';
                    }
                }
            }
        }
    }
    public static function enregistrerPaProduit($prixachats, $item)
    {
        $errors = null;
        /*if (isset($allprixachats)) {
            Outil::Checkdetail($allprixachats, $prixachats, FournisseurProduit::class, 'fournisseur_id');
        }*/
        if (isset($prixachats)) {
            //   dd($prixachats);
            foreach ($prixachats as $key => $value) {
                $prix = $value['montant_achat'];
                if (empty($value['fournisseur_id'])) {
                    $errors = "Veuillez choisir un fournisseur à la ligne " . ($key + 1);
                } else {
                    if (is_numeric($value['fournisseur_id']) == true) {
                        $value['fournisseur_id'] = (int)$value['fournisseur_id'];
                    } else {
                        $designation = $value['fournisseur_id'];
                        $fournisseur = Fournisseur::whereRaw('TRIM(lower(designation)) = TRIM(lower(?))', ["$designation"])->first();
                        if (isset($fournisseur->id)) {
                            $value['fournisseur_id'] = $fournisseur->id;
                            $ligneprixachat = FournisseurProduit::where('produit_id', $item->id)->where('fournisseur_id', $value['fournisseur_id'])->first();
                        } else {
                            $errors = "Veuillez choisir un fournisseur à la ligne " . ($key + 1);
                        }
                    }
                    if ($ligneprixachat && !isset($request->id)) {
                        $errors = "Un prix pour le fournisseur à la ligne " . ($key + 1) . " est déjà défini";
                    }
                }
                if (!isset($prix) || !is_numeric($prix)) {
                    $errors = "Veuillez définir le prix d'achat à la ligne " . ($key + 1);
                }


                if (!isset($errors)) {
                    if (!isset($ligneprixachat)) {
                        $ligneprixachat = new FournisseurProduit();
                        $ligneprixachat->produit_id = $item->id;
                        $ligneprixachat->fournisseur_id = $value['fournisseur_id'];
                    }

                    if ($prix > 0) {
                        $ligneprixachat->montant_achat = $prix;
                        $ligneprixachat->save();
                    } else if (isset($ligneprixachat)) {
                        $ligneprixachat->delete();
                    }
                }
            }
        }
        return $errors;
    }
    public static function enregistrerPrixventeProduit($prixventes, $item)
    {
        /*if (isset($allprixventes)) {
            Outil::Checkdetail($allprixventes, $prixventes, Prixdevente::class, 'type_prix_de_vente_id');
        }*/
        $errors = null;
        if (isset($prixventes)) {

            foreach ($prixventes as $key => $value) {
                //  dd($value['type_prix_de_vente_id']);
                if (empty($value['type_prix_de_vente_id'])) {
                    $errors = "Veuillez choisir un le type de prix de vente à la ligne " . ($key + 1);
                } else {

                    if (is_numeric($value['type_prix_de_vente_id']) == true) {
                        $value['type_prix_de_vente_id'] = (int)$value['type_prix_de_vente_id'];
                    } else {
                        $designation = $value['type_prix_de_vente_id'];
                        $type_prix_vente = TypePrixDeVente::whereRaw('TRIM(lower(designation)) = TRIM(lower(?))', ["$designation"])->first();
                        //  dd($type_prix_vente->designation);
                        if (isset($type_prix_vente->id)) {
                            $value['type_prix_de_vente_id'] = $type_prix_vente->id;
                            $ligneprixvente = Prixdevente::where('produit_id', $item->id)->where('type_prix_de_vente_id', $value['type_prix_de_vente_id'])->first();
                        } else {
                            $errors = "Veuillez choisir un le type de prix de vente à la ligne " . ($key + 1);
                        }
                    }
                }
                if (!isset($value['montant']) || !is_numeric($value['montant'])) {
                    $errors = "Veuillez definir le prix de vente à la ligne " . ($key + 1);
                }

                if (!isset($errors)) {
                    if (!isset($ligneprixvente)) {
                        $ligneprixvente = new Prixdevente();
                    }
                    $ligneprixvente->produit_id = $item->id;
                    if (is_numeric($value['montant'])) {
                        if ((int)$value['montant'] > 0) {
                            $ligneprixvente->type_prix_de_vente_id = $value['type_prix_de_vente_id'];
                            $ligneprixvente->montant = (int)$value['montant'];
                            $ligneprixvente->save();
                        } else {
                            $errors = 'Le montant doit etre positif';
                        }
                    } else {
                        $errors = 'Le montant doit etre positif';
                    }
                } else {
                    // dd($errors);
                }
            }
        } else {
            //  dd('error');
        }
        return $errors;
    }

    public static function mettreEnComptaElements($compta, $myArray)
    {
        if (!empty($myArray)) {
            foreach ($myArray as $value) {
                $itemId = $value["id"];
                $item = Commande::find($itemId);
                if (isset($item)) {
                    $item->compta = $compta;
                    $item->save();
                }
            }
        }
    }

    public static function enregistrerDispatchingParEntite($item, $items)
    {
        $tableName = strtolower($item->getTable());

        $id = $item->id;

        $detailsToDelete = new EntiteTransactionCaisse();
        if ($tableName == "sortie_cashs") {
            $detailsToDelete = $detailsToDelete->where("sortie_cash_id", $id);
        } else if ($tableName == "versements") {
            $detailsToDelete = $detailsToDelete->where("versement_id", $id);
        } else if ($tableName == "depenses") {
            $detailsToDelete = $detailsToDelete->where("depense_id", $id);
        }
        $detailsToDelete->delete();
        $detailsToDelete->forceDelete();
        foreach ($items as $key => $value) {
            $itemDetail = new EntiteTransactionCaisse();
            if (isset($value["id"])) {
                $itemDetailId = $value["id"];
                $itemDetail = EntiteTransactionCaisse::find($itemDetailId);
            }

            if (empty($itemDetail->id)) {
                $itemDetail = new EntiteTransactionCaisse();
            }

            $itemDetail->entite_id = $value["entite_id"];
            $itemDetail->montant = $value["montant"];
            if ($tableName == "sortie_cashs") {
                $itemDetail->sortie_cash_id = $id;
            } else if ($tableName == "versements") {
                $itemDetail->versement_id = $id;
            } else if ($tableName == "depenses") {
                $itemDetail->depense_id = $id;
            }
            $itemDetail->save();
        }
    }

    //Calcul du prix de revient des produits de sortie production
    public static function calculPrixRevientApresProduction($item)
    {
        $retour  =  null;
        if ($item->entre_sortie !== 1) {
            $produit_production   = DetailAssemblage::query()->where('assemblage_id', $item->id)->first();

            if (isset($produit_production)) {
                $produit                            = Produit::find($produit_production->produit_id);
                $produits_sortie                    = DetailDetailAssemblage::query()->where('detail_assemblage_id', $produit_production->id)->where('perte', '!=', 1)->get();
                $quntite_total_produits_sortie      = DB::table('detail_detail_assemblages')
                    ->join('produits', 'produits.id', 'detail_detail_assemblages.produit_id')
                    ->join('detail_assemblages', 'detail_assemblages.id', 'detail_detail_assemblages.detail_assemblage_id')
                    ->join('assemblages', 'assemblages.id', 'detail_assemblages.assemblage_id')
                    ->where('assemblages.id', $item->id)
                    ->where('detail_detail_assemblages.perte', '!=', 1)
                    ->selectRaw("SUM(detail_detail_assemblages.poids) as quantite_total_sortie")
                    ->first();

                $prix_achat_unitaire_production   = $produit->prix_achat_unitaire;
                $quantite_production              = $produit_production->qte_unitaire;
                if (isset($quntite_total_produits_sortie) && $quntite_total_produits_sortie->quantite_total_sortie) {
                    $quntite_total_produits_sortie    =  $quntite_total_produits_sortie->quantite_total_sortie;

                    //Calcul du nouveau prix d'achat après production
                    $nouveaux_prix_achat_production   = ($quantite_production / $quntite_total_produits_sortie)  * $prix_achat_unitaire_production;

                    //Calcul de prix de revient de chaque produit de sortie
                    if (isset($produits_sortie) && count($produits_sortie) > 0) {
                        foreach ($produits_sortie as $key => $value) {
                            $produit_sortie              = Produit::find($value->produit_id);
                            if (isset($produit_sortie) && isset($produit_sortie->unite_de_mesure)) {
                                //On reajuste le poids net du produit en sortie
                                if ($produit_sortie->unite_de_mesure->designation  == 'KG') {
                                    $poids_net_production   =  $value->qte_unitaire  = $value->poids;
                                } else if ($produit_sortie->unite_de_mesure->designation  == 'U') {
                                    $poids_net_production  = $value->poids / $value->qte_unitaire;
                                }

                                //Apres on applique la formule pour calcul son prix de revient unitaire
                                if (isset($poids_net_production)) {
                                    $nouveaux_prix_revient_unitaire_sortie       =  $nouveaux_prix_achat_production   *  $poids_net_production;

                                    $produit_sortie->prix_de_revient_unitaire    = $nouveaux_prix_revient_unitaire_sortie;
                                    $produit_sortie->save();
                                }
                            }
                        }
                    } else {
                        $retour   =  'Cette production n\'a pas de produit en sortie.';
                    }
                }
            } else {
                $retour   =  'Cette production n\'a pas de produit en entrée.';
            }
        }

        return $retour;
    }

    //Donne l'id de l'utilisateur actuellement connecté
    public static function donneUserId()
    {
        $user = Auth::user();
        $retour = isset($user) ? Auth::user()->id : null;
        return $retour;
    }

    //Donne l'id de l'utilisateur actuellement connecté
    public static function donneUserEntrepriseCode()
    {
        $user = Auth::user();
        $retour = isset($user) ? Auth::user()->entreprise_code : null;
        return $retour;
    }

    //Donne le solde qui se basait sur un champs de la base de données
    public static function donneSolde($type = "caisse", $item_id, $typeDeCalcul = 0, $montant = 0)
    {
        /*
        - $typeDeCalcul == 0 //Pas de calcul juste le solde
        - $typeDeCalcul == 1 //Additionner avec le solde
        - $typeDeCalcul == 2 //Soustraire du solde
        */
        $retour = 0;
        if (isset($item_id)) {
            if ($type == "banque") {
                $item = Banque::find($item_id);
            } else {
                $item = Caisse::find($item_id);
            }
            if (isset($item)) {
                $retour = $item->solde;
            }

            if (isset($typeDeCalcul) && isset($montant)) {
                if ($typeDeCalcul == 1) {
                    $retour = $retour + $montant;
                } else if ($typeDeCalcul == 2) {
                    $retour = $retour - $montant;
                }

                if ($retour < 0) {
                    $retour = 0;
                }
            }
        }

        return $retour;
    }

    //Donne le solde calculé
    public static function donneSoldeCalculei($item_id, $soldeComptable = false, $from = "societefacturation")
    {
        //Solde  = appros[receveur] - (appros[emetteur] + sorties cash + versements banques)
        $retour = 0;

        if (isset($item_id)) {
            if ($soldeComptable == true) {
                if ($from == "societefacturation") {
                    $caissesToSearch = Caisse::whereNotNull('entite_id')->whereIn('entite_id', Entite::where('societe_facturation_id', $item_id)->get(['id']))->get(['id']);
                } else if ($from == "caisse") {
                    $caissesToSearch = Caisse::whereNotNull('entite_id')->where('entite_id', $item_id)->get(['id']);
                }
            }

            //****Total entrée****
            //Total appros receveur
            $queryApprosReceveurs = DB::table("approcashs")->select(DB::raw("COALESCE(SUM(montant),0) as total"));
            if ($soldeComptable == true) {
                $queryApprosReceveurs = $queryApprosReceveurs->whereIn('caisse_destinataire_id', $caissesToSearch);
                $queryApprosReceveurs = $queryApprosReceveurs->whereNull('caisse_source_id');
            } else {
                $queryApprosReceveurs = $queryApprosReceveurs->where('caisse_destinataire_id', $item_id);
            }
            $queryApprosReceveurs = $queryApprosReceveurs->first();

            //Total paiements commande
            $queryPaiementsComms = DB::table("paiements")->select(DB::raw("COALESCE(SUM(montant),0) as total"))->whereNotNull('commande_id');
            if ($soldeComptable == true) {
                $queryPaiementsComms = $queryPaiementsComms->whereIn('caisse_id', $caissesToSearch);
            } else {
                $queryPaiementsComms = $queryPaiementsComms->where('caisse_id', $item_id);
            }
            $queryPaiementsComms = $queryPaiementsComms->whereIn('mode_paiement_id', Modepaiement::where('est_cash', 1)->get(['id']));
            $queryPaiementsComms = $queryPaiementsComms->whereIn('commande_id', Commande::where('compta', 0)->get(['id']));
            $queryPaiementsComms = $queryPaiementsComms->first();

            //Total paiements facture
            $queryPaiementsFacs = DB::table("paiements")->select(DB::raw("COALESCE(SUM(montant),0) as total"))->whereNotNull('facture_id');
            if ($soldeComptable == true) {
                $queryPaiementsFacs = $queryPaiementsFacs->whereIn('caisse_id', $caissesToSearch);
            } else {
                $queryPaiementsFacs = $queryPaiementsFacs->where('caisse_id', $item_id);
            }
            $queryPaiementsFacs = $queryPaiementsFacs->whereIn('mode_paiement_id', Modepaiement::where('est_cash', 1)->get(['id']));
            $queryPaiementsFacs = $queryPaiementsFacs->whereIn('facture_id', Facture::where('compta', 0)->get(['id']));
            $queryPaiementsFacs = $queryPaiementsFacs->first();


            //****Total sortie****
            //Total appros emetteur
            $queryApprosEmetteurs = DB::table("approcashs")->select(DB::raw("COALESCE(SUM(montant),0) as total"));
            if ($soldeComptable == true) {
                $queryApprosEmetteurs = $queryApprosEmetteurs->whereIn('caisse_source_id', $caissesToSearch);
                $queryApprosEmetteurs = $queryApprosEmetteurs->whereNull('caisse_source_id');
            } else {
                $queryApprosEmetteurs = $queryApprosEmetteurs->where('caisse_source_id', $item_id);
            }
            $queryApprosEmetteurs = $queryApprosEmetteurs->first();

            //Total sorties cash
            $querySortieCashs = DB::table("sortie_cashs")->select(DB::raw("COALESCE(SUM(montant),0) as total"));
            if ($soldeComptable == true) {
                $querySortieCashs = $querySortieCashs->whereIn('caisse_id', $caissesToSearch);
            } else {
                $querySortieCashs = $querySortieCashs->where('caisse_id', $item_id);
            }
            $querySortieCashs = $querySortieCashs->first();

            //Total versements
            $queryVersements = DB::table("versements")->select(DB::raw("COALESCE(SUM(montant),0) as total"));
            if ($soldeComptable == true) {
                $queryVersements = $queryVersements->whereIn('caisse_id', $caissesToSearch);
            } else {
                $queryVersements = $queryVersements->where('caisse_id', $item_id);
            }
            $queryVersements = $queryVersements->first();

            //Total dépenses
            $queryDepenses = DB::table("paiements")->select(DB::raw("COALESCE(SUM(montant),0) as total"))->whereNotNull('depense_id');
            if ($soldeComptable == true) {
                $entitesToSearch = Entite::where('societe_facturation_id', $item_id)->get(['id']);
                $depensesToSearch = Depense::whereIn('entite_id', $entitesToSearch)->get(['id']);
                $queryDepenses = $queryDepenses->whereIn('depense_id', $depensesToSearch);
            } else {
                $queryDepenses = $queryDepenses->where('caisse_id', $item_id);
            }
            $queryDepenses = $queryDepenses->whereIn('mode_paiement_id', Modepaiement::where('est_cash', 1)->get(['id']));
            $queryDepenses = $queryDepenses->whereIn('depense_id', Depense::where('compta', 0)->get(['id']));
            $queryDepenses = $queryDepenses->first();

            $retour = ($queryPaiementsFacs->total + $queryPaiementsComms->total + $queryApprosReceveurs->total) - ($queryApprosEmetteurs->total + $querySortieCashs->total + $queryVersements->total + $queryDepenses->total);
        }

        return $retour;
    }

    /*
    public static function donneTotalPaiement($from = "depense", $itemId)
    {}
     $test = UserCaisse::where('user_id', $userId);

        if ($test->count() > 0) {
              $query = $query->whereIn('id', $test->get(['caisse_id']));
        }

       $test = UserEntite::where('user_id', $userId)->count();
       if ($test > 0) {
          $query = $query->whereIn('entite_id', UserEntite::where('user_id', $userId)->get(['entite_id']));
       }
    */

    //Donne le total des paiements
    public static function donneTotalPaiement($from = "depense", $itemId, $compta = null)
    {
        $retour = 0;

        if (isset($itemId)) {
            $query = DB::table("paiements")->select(DB::raw("COALESCE(SUM(montant),0) as total"));
            if (isset($compta)) {
                $query = $query->where('compta', $compta);
            }
            if ($from == "depense") {
                $query = $query->where('depense_id', $itemId);
            } else if ($from == "paiement") {
                $query = $query->where('commande_id', $itemId);
            } else if ($from == "facture") {
                $query = $query->where('facture_id', $itemId);
            } else if ($from == "be") {
                $query = $query->whereIn('depense_id', Depense::where('be_id', $itemId)->get(['id']));
            } else if ($from == "bce") {
                $query = $query->where('bce_id', $itemId);
            }

            $retour = $query->first()->total;
        }

        return $retour;
    }

    public static function donneTotalGeneral($from = "be", $itemId = null)
    {
        $retour = 0;

        if ($from == "be") {
            $query = DB::table("be_produits")->select(DB::raw("COALESCE(SUM(prix_achat * quantite),0) as total"));
            if (isset($itemId)) {
                $query = $query->where('be_id', $itemId);
            }
            $retour = $query->first()->total;
        }

        return $retour;
    }

    public static function donneTotalCommande($parametres)
    {
        $dateStart = $parametres["dateStart"];
        $dateEnd = $parametres["dateEnd"];
        $caisseId = $parametres["caisseId"];

        if (empty($dateStart) || empty($dateEnd)) {
            $trancheHoraireEnCours = Outil::donneTrancheHoraire();
            if (isset($trancheHoraireEnCours)) {
                $dateToday = date('Y-m-d');
                $heureStart = substr($trancheHoraireEnCours->heure_debut, 11, 5);
                $heureEnd = substr($trancheHoraireEnCours->heure_fin, 11, 5);
                $dateStart = $dateToday . " " . $heureStart;
                $dateEnd = $dateToday . " " . $heureEnd;
            }
        }

        if (empty($caisseId)) {
            $caisseUserConnected = Outil::donneCaisseUser();
            $caisseId = isset($caisseUserConnected) ? $caisseUserConnected : null;
        }

        $query = null;
        // if(config('global.id_commande') !==''){
        $query = DB::table('commandes')
            ->selectRaw('sum(commandes.montant_total_commande) as total_periode');
        //var_dump(config('global.caisse_id'));
        if ((!empty($dateStart)) && (!empty($dateEnd))) {
            $query->whereBetween('commandes.date', [$dateStart . ":00", $dateEnd . ":00"]);

            if ((!empty($caisseId))) {
                $caisse = Caisse::find($caisseId);
                if (isset($caisse->entite_id) && isset($caisse->entite_id)) {
                    $query->where('entite_id', $caisse->entite_id);
                } else {
                    $query->where('entite_id', null);
                }
            }
        }
        $query =  $query->first()->total_periode;
        //   }

        $retour = isset($query) ? $query : 0;

        return $retour;
    }

    public static function donneTotalPourLesEntites($items)
    {
        $retour = 0;

        if (isset($items)) {
            foreach ($items as $key => $value) {
                $retour += $value["total_cloture_caisse"];
            }
        }

        return $retour;
    }


    //Calcul voulu par Mehdi
    public static function donneCumpNew($produit_id, $beproduit, $from = "on")
    {
        $retour = 0;
        $produit = Produit::find($produit_id);
        if (isset($produit)) {
            $produit = Produit::find($produit_id);
            $qteCourante = Produit::getCurrentQte($produit_id);
            $dernierCump = $produit->cump;

            $pr = 0;
            $dernierCump = 0;
            if ($from == "on") {
                $pr = $beproduit->pr;
                $dernierCump = $produit->cump;
            } else if ($from == "off") {
                $pr = $beproduit->pr_off;
                $dernierCump = $produit->cump_off;
            }

            //Nouvelle CUMP = (dernier CUMP * qté courante + PR actuel * qté BE) / qté courante + qté BE
            $diviseur = $qteCourante + $beproduit->quantite;
            if ($diviseur > 0) {
                $retour = (($dernierCump * $qteCourante) + ($pr * $beproduit->quantite)) / $diviseur;
            }
        }

        return $retour;
    }

    //Calcul du CUMP de facon automatique avec formule universelle mais pas voulu par Mehdi donc utilisé que pour retourner le cump enrengistré sur le produit
    public static function donneCump($produit_id, $from = "on")
    {
        $retour = 0;

        $produit = Produit::find($produit_id);
        if (isset($produit)) {
            //Code adapté avec l'arrivée de la fonction donneCumpNew
            if ($from == "on") {
                return $produit->cump;
            } else if ($from == "off") {
                return $produit->cump_off;
            } else {
                return 0;
            }

            $typeproduit = Typeproduit::find($produit->typeproduit_id);
            if (isset($typeproduit)) {
                $text_id = $typeproduit->text_id;
                if ($text_id == "matieres_premieres") {
                    $coutTotal = 0;
                    $qteTotal = 0;

                    $items = Beproduit::where('produit_id', $produit_id)->get();
                    if (isset($items)) {
                        foreach ($items as $key => $value) {
                            if ($from == "on") {
                                $coutTotal += ($value->pr * $value->quantite);
                                $qteTotal += $value->quantite;
                            } else if ($from == "off") {
                                $coutTotal += ($value->pr_off * $value->quantite);
                                $qteTotal += $value->quantite;
                            }
                        }
                    }

                    if (!empty($qteTotal)) {
                        $retour = $coutTotal / $qteTotal;
                    }
                } else if ($text_id == "matieres_transformees") {
                    $totalCump = 0;
                    $detailAssemblage = DetailAssemblage::where('produit_id', $produit_id)->orderBy('id', 'desc')->first();
                    if (isset($detailAssemblage)) {
                        $items = DetailDetailAssemblage::where('detail_assemblage_id', $detailAssemblage->id)->get();
                        if (isset($items)) {
                            $totalCump = 0;
                            foreach ($items as $key => $value) {
                                $cumpOneProduit = Outil::donneCump($value->produit_id, $from);
                                $totalCump += ($cumpOneProduit * $value->qte_unitaire);
                            }

                            if ($detailAssemblage->qte_unitaire > 0) {
                                $totalCump = $totalCump / $detailAssemblage->qte_unitaire;
                            }
                        }
                    }

                    $retour = $totalCump;
                } else if ($text_id == "produits_de_vente") {
                } else if ($text_id == "logistique") {
                }
            }
        }

        $retour = round($retour, 2);

        return $retour;
    }

    public static function donneCoef($produit_id, $from = "on")
    {

        $retour = 0;
        $produit = Produit::find($produit_id);
        if (isset($produit)) {
            $be = Be::whereIn('id', Beproduit::where('produit_id', $produit_id)->get(['be_id']))->orderBy('id', 'desc')->first();
            if (isset($be)) {
                if ($from == "on") {
                    $retour = $be->coef;
                } else if ($from == "off") {
                    $retour = $be->coef_off;
                }
            }
        }

        return $retour;
    }

    public static function donneTrancheHoraire($heure = null)
    {
        if (empty($heure)) {
            $heure = date('H:i');
        }
        $retour = Tranchehoraire::where('heure_debut', '<=', $heure)->where('heure_fin', '>=', $heure)->first();
        if (empty($retour)) {
            $retour = null;
        }
        return $retour;
    }

    public static function donneCaisse($user_id = null)
    {
        $retour = null;
        $entite_id = null;
        if (empty($user_id)) {
            $user_id = Auth::user()->id;
        }

        $user = User::find($user_id);
        if (isset($user)) {
            $entite_id = $user->entite_id;
        }

        $retour = Caisse::where('entite_id', $entite_id)->first();
        return $retour;
    }

    //Test si le mode de paiement contient au moins un mode de paiement cash
    public static function contientModePaiementCash($items)
    {
        $retour = false;
        if (count($items) > 0) {
            foreach ($items as $key => $value) {
                $mode_paiement_id = $value["mode_paiement_id"];
                $test = Modepaiement::where("id", $mode_paiement_id)->where("est_cash", 1)->first();
                if (isset($test)) {
                    $retour = true;
                    return $retour;
                }
            }
        }
        return $retour;
    }

    //Test si le billetage correspond aux encaissements
    public static function testBilletage($billetages, $encaissements)
    {
        $retour = true;
        if (count($billetages) > 0 && count($encaissements) > 0) {
            $sommeBilletages = 0;
            $sommeEncaissements = 0;

            foreach ($billetages as $key => $value) {
                $typebillet_id = $value["typebillet_id"];
                $test = Typebillet::find($typebillet_id);
                if (isset($test)) {
                    $sommeBilletages += $value["nombre"] * $test->nombre;
                }
            }

            foreach ($encaissements as $key2 => $value2) {
                $mode_paiement_id = $value2["mode_paiement_id"];
                $test = Modepaiement::where("id", $mode_paiement_id)->where("est_cash", 1)->first();
                if (isset($test)) {
                    $sommeEncaissements += $value2["montant"];
                }
            }

            if ($sommeBilletages != $sommeEncaissements) {
                $retour = false;
            }
            //dd("sommeBilletages".$sommeBilletages." / sommeEncaissements".$sommeEncaissements);
        }
        return $retour;
    }

    //Donne la devise à utiliser
    public static function donneDevise($devise_id = null)
    {
        //Pour le moment on ne renvoit que la devise par defaut (fcfa)
        $retour = null;
        $devise = Devise::where("par_defaut", true)->first();
        if (isset($devise)) {
            $retour = $devise->id;
        }

        return $retour;
    }

    //Donne la première caisse de l'utilisateur
    public static function donneCaisseUser($user_id = null)
    {
        if (empty($user_id)) {
            $user_id = Outil::donneUserId();
        }

        $retour = null;
        $user_caisse = UserCaisse::where('user_id', $user_id)->first();
        if (isset($user_caisse)) {
            $retour = $user_caisse->caisse_id;
        }
        return $retour;
    }

    //Donne les caisses accessibles par l'utilisateur
    public static function donneAllCaissesUser($user_id = null)
    {
        if (empty($user_id)) {
            $user_id = Outil::donneUserId();
        }

        $retour = UserCaisse::where('user_id', $user_id)->get(['caisse_id']);
        if (count($retour) == 0) {
            $retour = Caisse::where('id', '>', 0)->get(['id']);
        }
        return $retour;
    }

    //Test si l'utilisateur doit voir l'élément ou pas
    public static function canSeeItemUser($type = "entite")
    {
        $retour = true;
        $nbre = 0;
        $user_id = Outil::donneUserId();

        if ($type == "entite") {
            $nbre = UserEntite::where('user_id', $user_id)->count();
        } else if ($type == "caisse") {
            $nbre = UserCaisse::where('user_id', $user_id)->count();
        }
        if ($nbre == 1) {
            $retour = false;
        }

        return $retour;
    }

    //Donne l' item  de l'utilisateur
    public static function giveItemUser($type = "entite", $item_id, $etat = null)
    {
        $test = Outil::canSeeItemUser($type);
        $user_id = Outil::donneUserId();

        if ($test == false) {
            //il n'a qu'un élément
            if ($type == "entite") {
                $item_id = UserEntite::where('user_id', $user_id)->first()->entite_id;
            } else if ($type == "caisse") {
                $item_id = UserCaisse::where('user_id', $user_id)->first()->caisse_id;
            }
        }
        if ($type == "departement") {
            $item_id = isset($etat) && $etat == true ? UserDepartement::where('user_id', $user_id)
                ->where('etat', $etat)
                ->where('departement_id', $item_id)
                ->first()
                : UserDepartement::where('user_id', $user_id)->first();
        }

        return $item_id;
    }
    public static function giveDepartementByUser()
    {
        $user_id = Outil::donneUserId();
        $allDepartement = Departement::query();
        $query = null;
        if (isset($user_id)) {
        }
        $query = $allDepartement
            ->join('user_departements', 'user_departements.departement_id', '=', 'departements.id')
            ->join('users', 'users.id', '=', 'user_departements.user_id')
            ->where('users.id', $user_id);

        if (!isset($query)) {
            $query = $allDepartement;
        }

        return $query;
    }



    //Restriction user-entite-caisse
    public static function checkIfIntervalleDate($dateDebut, $dateFin)
    {
        $startdate = $dateDebut;
        $enddate = $dateFin;
        $test = 'Erreur sur le controle de date';
        if (isset($startdate) && isset($enddate)) {
            if ($startdate <= $enddate) {
                $test = null;
            } else {
                $test = "Cet interval de date n'est pas correct";
            }
        }

        return $test;
    }
    public static function checkIfIntervalleHeure($dateDebut, $dateFin)
    {
        $startdate = $dateDebut;
        $enddate = $dateFin;
        $test = 'Erreur sur le controle d\'horaire';
        if (isset($startdate) && isset($enddate)) {
            if ($startdate <= $enddate) {
                $test = null;
            } else {
                $test = "Cet horaire n'est pas correct";
            }
        }

        return $test;
    }
    public static function restrictItemUser($type = "entite", $query, $user = null)
    {
        $user_id = Outil::donneUserId();
        if (!isset($user_id)) {
            $user_id = $user;
        }
        if (isset($user_id)) {
            if ($type == 'entite') {
                $test = UserEntite::where('user_id', $user_id)->count();
                if ($test > 0) {
                    $query = $query->whereIn('id', UserEntite::where('user_id', $user_id)->get(['entite_id']));
                }
            } else if ($type == 'caisse') {
                $test = UserCaisse::where('user_id', $user_id);
                if ($test->count() > 0) {
                    $query = $query->whereIn('id', UserCaisse::where('user_id', $user_id)->get(['caisse_id']));
                }
            } else if ($type == 'depot') {
                $test = UserEntite::where('user_id', $user_id)->get();

                if (isset($test) && count($test) > 0) {
                    $query = $query->whereIn('entite_id', UserEntite::where('user_id', $user_id)->get(['entite_id']));
                }
            }
        }

        return $query;
    }



    public static function enregistrerDetailAction($itemAction)
    {
        $item = new DetailAction();

        $item->designation          = $itemAction->designation;
        $item->date                 = $itemAction->date;
        $item->observations         = $itemAction->observations;
        $item->commentaire          = $itemAction->commentaire;
        $item->fichier              = $itemAction->fichier;
        $item->frequence_qhse_id    = $itemAction->frequence_qhse_id;
        $item->famille_action_id    = $itemAction->famille_action_id;
        $item->zone_id              = $itemAction->zone_id;
        $item->sous_zone_id         = $itemAction->sous_zone_id;
        $item->be_id                = $itemAction->be_id;
        $item->proforma_id          = $itemAction->proforma_id;
        $item->montant              = $itemAction->montant;
        $item->action_id            = $itemAction->id;

        $item->save();
        $id = $item->id;

        return $id;
    }

    //Enregistrer une appro au cas ou on fait appel à lui
    public static function enregistrerApproCash($from = 'cloturecaisse', $itemGraphQl, $request = null)
    {
        $item = new Approcash();
        $id = null;

        $user_id = Outil::donneUserId();

        if ($from == 'cloturecaisse') {
            if (isset($request)) {
                if ($itemGraphQl["total_reel_encaissement_cash"] > 0) {
                    $item->date = date('Y-m-d');
                    $item->montant = $itemGraphQl["total_reel_encaissement_cash"];
                    $item->motif = $request->motif;
                    $item->caisse_source_id = $itemGraphQl["caisse_id"];;
                    $item->caisse_destinataire_id = $request->caisse_destinataire_id;
                    $item->cloture_caisse_id = $itemGraphQl["id"];

                    $item->save();
                    $id = $item->id;

                    if (isset($item->caisse_destinataire_id)) {
                        $itemDestinataire = Caisse::find($item->caisse_destinataire_id);
                        if (isset($itemDestinataire)) {
                            $itemDestinataire->solde = Outil::donneSolde("caisse", $itemDestinataire->id, 1, $item->montant);
                            $itemDestinataire->save();
                        }
                    }

                    if (isset($item->caisse_source_id)) {
                        $itemSource = Caisse::find($item->caisse_source_id);
                        if (isset($itemSource)) {
                            $itemSource->solde = Outil::donneSolde("caisse", $itemSource->id, 2, $item->montant);
                            $itemSource->save();
                        }
                    }
                }
            }
        }

        return $id;
    }

    //Enregistrer une dépense
    public static function enregistrerDepense($from = 'traiteur', $itemArray)
    {
        $item = new Depense();
        $user_id = Outil::donneUserId();
        $retour = null;

        if (isset($itemArray)) {
            if ($from == 'traiteur') {
                $item->date = date('Y-m-d H:i:s');
                $item->montant = $itemArray["montant"];
                $item->traiteur_id = $itemArray["traiteur_id"];
                $item->motif = 'Dépense traiteur';
                $item->nombre_jour_rappel = 0;

                $retour = $item->save();
            }
        }

        return $retour;
    }

    //Enregistrer une paiement
    public static function enregistrerPaiement($from = 'commande', $itemArray)
    {
        $item = new Paiement();
        $retour = null;

        if (!empty($itemArray['paiement_id'])) {
            $item = Paiement::find($itemArray['paiement_id']);
            if (empty($item)) {
                $item = new Paiement();
            }
        }

        if (isset($itemArray)) {
            $item->code = '';
            $item->date = now();
            $item->mode_paiement_id = $itemArray['mode_paiement_id'];
            $item->montant = $itemArray['montant'];
            $item->caisse_id = isset($itemArray['caisse_id']) ? $itemArray['caisse_id'] : null;
            $item->created_at_user_id = Outil::donneUserId();
            $item->compta = isset($itemArray['compta']) ? $itemArray['compta'] : 0;

            //Pour le suivi banque
            $item->numerosuivi = isset($itemArray['numerosuivi']) ? $itemArray['numerosuivi'] : null;
            $item->banquesuivi = isset($itemArray['banquesuivi']) ? $itemArray['banquesuivi'] : null;
            $item->nomsuivi = isset($itemArray['nomsuivi']) ? $itemArray['nomsuivi'] : null;

            //Pour le bon cadeau 
            $item->codeboncadeau = isset($itemArray['codeboncadeau']) ? $itemArray['codeboncadeau'] : null;

            if ($from == 'commande') {
                $item->commande_id = $itemArray['commande_id'];
            }
            if ($from == 'depense') {
                $item->depense_id = $itemArray['depense_id'];
            }
            if ($from == 'facture') {
                $item->facture_id = $itemArray['facture_id'];
            }
            if ($from == 'bce') {
                $item->bce_id = $itemArray['bce_id'];
            }

            $item->save();
            $retour = $item;

            if (isset($item->id)) {
                Outil::getCode($item);
            }
        }

        return $retour;
    }

    public static function xCode($separateur, $itemArray)
    {
        $array = null;
        if (isset($itemArray)) {
            $array = explode($separateur, $itemArray);
        }
        return $array;
    }

    public static function donneListeValidateur($item)
    {
        $retour = null;
        
        if (isset($item)) 
        {
            $nomsComplets = [];
    
            foreach ($item as $key => $value) 
            {
                // Pas de validation 
                if(isset($value)) 
                {
                    $validateur     = User::select('name')->where('id', $value->evaluateur_id)->first();
                   
                    $nomcomplet     = $validateur->name; 
                    $nomsComplets[] = $nomcomplet;
                }
            }
            
            $retour = implode('/', $nomsComplets);
        }
        
        return $retour;
    }

    public static function zCode($separateur1, $itemArray, $columns, $separateur2 = null)
    {
        $result = array();
        //  dd($itemArray);
        $array = self::xCode($separateur1, $itemArray);
        if (isset($columns)) {
            if (!is_array($columns)) {
                $columns = array($columns);
            }
        }

        if (isset($array) && count($array) > 0) {
            foreach ($array as $key => $value) {
                $cel = self::xCode($separateur2, $value);
                if (isset($cel) && count($cel) > 0) {
                    $object = array();
                    foreach ($cel as $keyCel => $valueCel) {
                        array_push(
                            $object,
                            [$columns[$keyCel] => $valueCel]
                        );
                    }
                    $object_merge = array();
                    foreach ($object as $keyCelMerge => $valueCelMerge) {
                        $object_merge = array_merge($object_merge, $valueCelMerge);
                    }
                    array_push($result, array($object_merge));
                }
            }
        }

        return $result;
    }
    public static function getInitial($string)
    {
        $string_separe = explode(' ', $string);
        $initiale = '';
        if (isset($string_separe) && count($string_separe) > 0) {
            foreach ($string_separe as $key => $value) {
                $initiale .= substr($value, 0, strlen($value) >= 2 ? 3 : 1);
            }
        }
        return $initiale;
    }
    public static function saveMatriculeUser($item)
    {
        if (isset($item) && isset($item->id)) {
            if (!isset($item->matricule) || $item->matricule == '') {
                if (isset($item->roles)) {
                    $roles = $item->roles;
                    if (count($roles) >= 1) {
                        $getFirstRole   = $roles[0];
                        if (isset($getFirstRole["id"])) {
                            $get_role = Role::findById($getFirstRole["id"]);
                            if (isset($get_role) && isset($get_role->id)) {
                                $laste_user = null;
                                if (isset($get_role->last_user)) {
                                    $laste_user = $get_role->last_user + 1;
                                } else {
                                    $laste_user  = 1;
                                }
                                $get_role->last_user = $laste_user;
                                $get_role->save();
                                $item->matricule = mb_strtoupper(self::getInitial($get_role->name)) . '-' . $get_role->last_user;
                                $item->save();
                            }
                        }
                    }
                }
            }
        }

        return $item;
    }

    public static function enregistrerPosteDepense($item, $itemAray, $compte_sages = null)
    {
        $item->designation          = $itemAray["designation"];
        $item->categorie_depense_id = $itemAray["categorie_depense_id"];
        $item->poste_depense_id     = isset($itemAray["poste_depense_id"]) ? $itemAray["poste_depense_id"] : null;
        $item->save();

        if (isset($compte_sages)) {
            foreach ($compte_sages as $key => $cs) {
                if (isset($cs) && count($cs) > 0) {
                    Outil::enregistrerCompteSage('postedepense', $cs, $item->id, true);
                }
            }
        }
        return $item;
    }
    public static function enregistrerBudgetPosteDepense($from = '', $itemArray, $idFrom, $fromExcel = false)
    {
        $item = null;
        $foreignKey = 'poste_depense_id';
        $last_item = null;

        if (isset($itemArray)) {
            /* if ($from == 'fournisseur') {
                $foreignKey = 'fournisseur_id';
            }
            if ($from == 'entite') {
                $foreignKey = 'entite_id';
            }

            if ($from == 'client') {
                $foreignKey = 'client_id';
            }

            if ($from == 'postedepense') {
                $foreignKey = 'poste_depense_id';
            }
            if(!isset($idFrom)){
                dd($itemArray);
            }*/

            $allbudget_poste_depense                         = PosteDepenseEntite::where($foreignKey,  $idFrom)->get();

            if (!$fromExcel) {
                if (isset($allcompte_sage_entity) && count($allcompte_sage_entity) > 0) {
                    Outil::Checkdetail($allbudget_poste_depense, $itemArray, PosteDepenseEntite::class, [$foreignKey, 'entite_id']);
                }
            }

            if (isset($itemArray) && count($itemArray) > 0) {
                foreach ($itemArray as $key => $value) {
                    $column_entite          = 'entite_id';
                    if (is_numeric($value['entite_id']) == false) {

                        $entite     = Entite::query()->where('designation', $value['entite_id'])->first();
                        if (isset($entite) && isset($entite->id)) {
                            $value['entite_id'] = $entite->id;
                        } else {
                            $value['entite_id'] = null;
                        }
                    }
                    if (isset($value['montant']) && $value['entite_id']) {
                        $poste_depense_entite                         =  PosteDepenseEntite::query()->where($foreignKey, $idFrom)
                            ->where($column_entite, $value['entite_id'])->first();
                        if (!isset($poste_depense_entite) || !isset($poste_depense_entite->id)) {
                            $poste_depense_entite = new PosteDepenseEntite();
                        }

                        $poste_depense_entite->montant                = $value['compte_sage'];
                        $poste_depense_entite->entite_id              = $value['societe_facturation_id'];
                        $poste_depense_entite->$foreignKey            = $idFrom;
                        $last_item                                    = $poste_depense_entite->save();
                    }
                }
            }
        }
        return $last_item;
    }

    //Enregistrer une compte sage
    public static function enregistrerCompteSage($from = '', $itemArray, $idFrom, $fromExcel = false)
    {
        $item = null;
        $foreignKey = '';
        $last_item = null;

        if (isset($itemArray)) {
            if ($from == 'fournisseur') {
                $foreignKey = 'fournisseur_id';
            }
            if ($from == 'entite') {
                $foreignKey = 'entite_id';
            }

            if ($from == 'client') {
                $foreignKey = 'client_id';
            }

            if ($from == 'postedepense') {
                $foreignKey = 'poste_depense_id';
            }
            if (!isset($idFrom)) {
                //dd($itemArray);
            }

            $allcompte_sage_entity                         = CompteSage::where($foreignKey,  $idFrom)->get();

            if (!$fromExcel) {
                if (isset($allcompte_sage_entity) && count($allcompte_sage_entity) > 0) {
                    Outil::Checkdetail($allcompte_sage_entity, $itemArray, CompteSage::class, [$foreignKey, 'societe_facturation_id', 'compte_sage']);
                }
            }

            if (isset($itemArray) && count($itemArray) > 0) {
                foreach ($itemArray as $key => $value) {
                    $column_fact = 'societe_facturation_id';
                    if (is_numeric($value['societe_facturation_id']) == false) {

                        $societe_fact     = Societefacturation::query()->where('denominationsociale', $value['societe_facturation_id'])->first();
                        if (isset($societe_fact) && isset($societe_fact->id)) {
                            $value['societe_facturation_id'] = $societe_fact->id;
                        } else {
                            $value['societe_facturation_id'] = null;
                        }
                    }
                    if (isset($value['compte_sage']) && $value['societe_facturation_id']) {
                        $compte     =  CompteSage::query()->where($foreignKey, $idFrom)
                            ->where($column_fact, $value['societe_facturation_id'])->first();
                        if (!isset($compte) || !isset($compte->id)) {
                            $compte = new CompteSage();
                        }
                        $compte->compte_sage            = $value['compte_sage'];
                        $compte->societe_facturation_id = $value['societe_facturation_id'];
                        $compte->$foreignKey            = $idFrom;
                        $last_item                      = $compte->save();
                    }
                }
            }
        }

        return $last_item;
    }
    //Get code bon cadeau
    public static function codeBonCadeau($item)
    {
        $code = '';
        $increment           = self::generateCode($item->id);
        $code               .= 'BONCADEAU-' . $increment;
        $item->codeboncadeau = $code;
        $item->save();
        return $item;
    }

    //Get code Client
    public static function codeClient($type_client, $key = 'designation', $client = null)
    {
        $code = null;

        if (isset($type_client)) {

            if ($key == 'designation') {
                $type_client = TypeClient::query()
                    ->where("designation", $type_client)
                    ->first();
            } else {
                $type_client = TypeClient::find($type_client);
            }
            $genere_code = true;
            $last_client = null;


            if (isset($client)) {
                if (
                    isset($client->code) && $client->code !== ''
                    && str_contains($client->code, $type_client->designation) == true
                ) {
                    $genere_code = false;
                    $code = $client->code;
                }
            }
            if ($genere_code == true) {
                if (isset($type_client) && isset($type_client->id)) {
                    $last_client = $type_client->last_client ? $type_client->last_client : null;
                    $last_client = (int)$last_client;
                    if (!isset($last_client) || $last_client == 0) {
                        $last_client = 1;
                    } else {
                        $last_client = $last_client + 1;
                    }
                    $get_nb_client_by_type_client = $last_client;

                    if (isset($get_nb_client_by_type_client) && is_numeric($get_nb_client_by_type_client)) {
                        $increment = self::generateCode($get_nb_client_by_type_client);
                        $code = $type_client->designation . '-' . $increment;
                    }
                }
            }
        }
        $client->code             = $code;
        $client->save();
        $type_client->last_client = $last_client;
        $type_client->save();
        return $client->code;
    }

    //Get code Operateur
    public static function codeOperateur($type_operateur, $key = 'designation', $operateur = null)
    {
        $code = null;
        if (isset($type_operateur)) {

            if ($key == 'designation') {
                $type_operateur = TypeOperateur::query()
                    ->where("designation", $type_operateur)
                    ->first();
            } else {
                $type_operateur = TypeOperateur::find($type_operateur);
            }
            $genere_code = true;

            if (isset($operateur)) {
                if (
                    isset($operateur->matricule) && $operateur->matricule !== ''
                    && str_contains($operateur->matricule, $type_operateur->designation) == true
                ) {
                    $genere_code = false;
                    $code = $operateur->matricule;
                }
            }
            if ($genere_code == true) {
                if (isset($type_operateur) && isset($type_operateur->id)) {
                    $last_operateur = $type_operateur->last_operateur;
                    $last_operateur = (int)$last_operateur;
                    if (!isset($last_operateur) || $last_operateur == 0) {
                        $last_operateur = 1;
                    } else {
                        $last_operateur = $last_operateur + 1;
                    }
                    $get_nb_operateur_by_type_operateur = $last_operateur;

                    if (isset($get_nb_operateur_by_type_operateur) && is_numeric($get_nb_operateur_by_type_operateur)) {
                        $increment = self::generateCode($get_nb_operateur_by_type_operateur);
                        $code = $type_operateur->designation . '-' . $increment;
                    }
                }
            }
        }
        $operateur->matricule           = $code;
        $operateur->save();
        $type_operateur->last_operateur = $last_operateur;
        $type_operateur->save();
        return $code;
    }

    //Get code Operateur
    public static function codeEmploye($departement, $key = 'designation', $employe = null)
    {
        $code = null;
        if (isset($departement)) {

            if ($key == 'designation') {
                $departement = Departement::query()
                    ->where("designation", $departement)
                    ->first();
            } else {
                $departement = Departement::find($departement);
            }
            $genere_code = true;

            if (isset($employe)) {
                if (
                    isset($employe->matricule) && $employe->matricule !== ''
                    && str_contains($employe->matricule, $departement->designation) == true
                ) {
                    $genere_code = false;
                    $code = $employe->matricule;
                }
            }
            if ($genere_code == true) {
                if (isset($departement) && isset($departement->id)) {
                    $last_employe = $departement->last_employe;
                    $last_employe = (int)$last_employe;
                    if (!isset($last_employe) || $last_employe == 0) {
                        $last_employe = 1;
                    } else {
                        $last_employe = $last_employe + 1;
                    }
                    $get_nb_operateur_by_type_operateur = $last_employe;

                    if (isset($get_nb_operateur_by_type_operateur) && is_numeric($get_nb_operateur_by_type_operateur)) {
                        $increment = self::generateCode($get_nb_operateur_by_type_operateur);
                        $code = substr($departement->designation, 0, 2) . '-' . $increment;
                    }
                }
            }
        }
        $employe->matricule           = $code;
        $employe->save();
        $departement->last_employe    = $last_employe;
        $departement->save();
        return $code;
    }

    public static function codeProduit($produit)
    {
        $code = '';
        $genere_code = true;

        if (isset($produit) && isset($produit->id)) {

            if (isset($produit->famille_id)) {
                $famille = Famille::find($produit->famille_id);
                if (isset($famille)) {
                    $dim_famille = '';
                    $dim_famille = mb_substr($famille->designation, 0, 3);
                    if (isset($famille->parent_famille_id)) {
                        $famille_parent = Famille::find($famille->parent_famille_id);
                        if (isset($famille_parent)) {
                            $dim_famille_parent = '';
                            $dim_famille_parent = mb_substr($famille_parent->designation, 0, 3);
                            $code = mb_strtoupper($dim_famille_parent);
                        }
                    }
                    $code .= mb_strtoupper($dim_famille);
                    if (
                        isset($produit->code) && $produit->code !== ''
                        && str_contains($produit->code, $code)
                    ) {
                        $genere_code = false;
                    }

                    if ($genere_code) {
                        $increment = self::generateCode($produit->id);
                        $code .= $increment;
                    }
                }
            }
        }

        return $code;
    }


    //Enregistrer une caisse
    public static function enregistrerCaisse($from = 'societefacturation', $itemFrom)
    {
        $item = new Caisse();
        $retour = null;

        if (isset($itemFrom)) {
            if ($from == 'societefacturation') {
                $designation = "caisse " . $itemFrom->denominationsociale;
                $item->designation = $designation;
                $item->societe_facturation_id = $itemFrom->id;
                $retour = $item->save();
            }
        }

        return $retour;
    }

    //Fonction générale pour supprimer un élément
    public static function supprimerElement($model, $id)
    {
        // dd('----------------Delet outil client----');
        try {
            return DB::transaction(function () use ($model, $id) {
                $errors = null;

                if ((int) $id) {
                    $item = app($model)::find($id);
                    if (isset($item)) {
                        $item->delete();
                        $item->forceDelete();
                        $data = 1;

                        $queryName = self::getQueryNameOfModel($item->getTable());
                        Outil::publishEvent(['type' => substr($queryName, 0, (strlen($queryName) - 1)), 'add' => true]);
                    } else {
                        $errors = "Cet élément n'existe pas";
                    }
                } else {
                    $errors = "Données manquantes";
                }
                if ($errors) {
                    throw new \Exception($errors);
                } else {
                    $retour = array(
                        'data' => $data,
                    );
                }
                return response()->json($retour);
            });
        } catch (\Exception $e) {
            if (isset($e->errorInfo)) {
                if (strpos($e->errorInfo[0], '23503') !== false || strpos($e->errorInfo[1], '23503') !== false) {
                    //23503 = code erreur liasions clès étrangères (Postgres ca se trouve dans l'index 0 et MySQL ca se trouve dans l'index 1)
                    $errors = 'Impossible de supprimer cet élément car il est lié à des données';
                    return response()->json(array(
                        'errors' => [$errors],
                        'errors_debug' => [$errors],
                        'errors_line' => [$e->getLine()],
                    ));
                } else {
                    return Outil::getResponseError($e);
                }
            } else {
                return Outil::getResponseError($e);
            }
        }
    }


    //Donne la date avec heure, minute, seconde en anglais
    public static function donneDateCompletEn($date, $avecSeconde = true)
    {
        $date_at = $date;
        if ($date_at !== null) {
            $date_at = str_replace("T", " ", $date_at);
            $date_at = date_create($date_at);
            if ($avecSeconde == false) {
                $date_at = date_format($date_at, "Y-m-d H:i");
            } else {
                $date_at = date_format($date_at, "Y-m-d H:i:s");
            }
            return $date_at;
        } else {
            return null;
        }
    }

    //Vérifier l'etat du commande via l'id transaction et renvoies toutes les infos
    public static function getProduitFromNml()
    {
        $params = array(
            'client_id' => 4
        );

        $url = 'https://nml-soft.com/api/getproduitclient';
        $method = 'GET';

        if (function_exists('curl_version')) {
            try {
                $curl = curl_init();
                if ($method == 'POST') {
                    $postfield = '';
                    foreach ($params as $index => $value) {
                        $postfield .= $index . '=' . $value . "&";
                    }
                    $postfield = substr($postfield, 0, -1);
                } else {
                    $postfield = null;
                }
                curl_setopt_array($curl, array(
                    CURLOPT_URL => $url,
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_ENCODING       => "",
                    CURLOPT_MAXREDIRS      => 10,
                    CURLOPT_TIMEOUT        => 45,
                    CURLOPT_HTTP_VERSION   => CURL_HTTP_VERSION_1_1,
                    CURLOPT_CUSTOMREQUEST  => $method,
                    CURLOPT_POSTFIELDS     => $postfield,
                    CURLOPT_HTTPHEADER     => array(
                        "cache-control: no-cache",
                        "content-type: application/x-www-form-urlencoded",
                    ),
                ));
                $response = curl_exec($curl);
                $err = curl_error($curl);
                curl_close($curl);

                if ($err) {
                    throw new \Exception("Error :" . $err);
                } else {
                    return $response;
                }
            } catch (Exception $e) {
                throw new \Exception($e);
            }
        } else if (ini_get('allow_url_fopen')) {
            try {
                // Build Http query using params
                $query = http_build_query($params);
                // Create Http context details
                $options = array(
                    'http' => array(
                        'header' => "Content-Type: application/x-www-form-urlencoded\r\n" .
                            "Content-Length: " . strlen($query) . "\r\n" .
                            "User-Agent:MyAgent/1.0\r\n",
                        'method' => "POST",
                        'content' => $query,
                    ),
                );
                // Create context resource for our request
                $context = stream_context_create($options);
                // Read page rendered as result of your POST request
                $result = file_get_contents(
                    $url, // page url
                    false,
                    $context
                );
                return trim($result);
            } catch (Exception $e) {
                throw new \Exception($e);
            }
        } else {
            throw new \Exception("Vous devez activer curl ou allow_url_fopen pour utiliser ce lien");
        }
    }

    //Récupéper les données d'indicateurs de Python
    public static function getDataIndicateurFromPython($params, $url = "http://localhost:5000/api/v1/indicateur/")
    {
        // $url = 'http://localhost:5000/api/v1/indicateur/';
        $method = 'POST';

        if (function_exists('curl_version')) {
            try {
                $curl = curl_init();
                if ($method == 'POST') {
                    $postfield = '';
                    foreach ($params as $index => $value) {
                        $postfield .= $index . '=' . $value . "&";
                    }
                    $postfield = substr($postfield, 0, -1);
                } else {
                    $postfield = null;
                }
                curl_setopt_array($curl, array(
                    CURLOPT_URL => $url,
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_ENCODING => "",
                    CURLOPT_MAXREDIRS => 10,
                    CURLOPT_TIMEOUT => 45,
                    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                    CURLOPT_CUSTOMREQUEST => $method,
                    CURLOPT_POSTFIELDS => $postfield,
                    CURLOPT_HTTPHEADER => array(
                        "cache-control: no-cache",
                        "content-type: application/x-www-form-urlencoded",
                    ),
                ));
                $response = curl_exec($curl);
                $err = curl_error($curl);
                curl_close($curl);

                if ($err) {
                    throw new \Exception("Error :" . $err);
                } else {
                    return $response;
                }
            } catch (Exception $e) {
                throw new \Exception($e);
            }
        } else if (ini_get('allow_url_fopen')) {
            try {
                // Build Http query using params
                $query = http_build_query($params);
                // Create Http context details
                $options = array(
                    'http' => array(
                        'header' => "Content-Type: application/x-www-form-urlencoded\r\n" .
                            "Content-Length: " . strlen($query) . "\r\n" .
                            "User-Agent:MyAgent/1.0\r\n",
                        'method' => "POST",
                        'content' => $query,
                    ),
                );
                // Create context resource for our request
                $context = stream_context_create($options);
                // Read page rendered as result of your POST request
                $result = file_get_contents(
                    $url, // page url
                    false,
                    $context
                );
                return trim($result);
            } catch (Exception $e) {
                throw new \Exception($e);
            }
        } else {
            throw new \Exception("Vous devez activer curl ou allow_url_fopen pour utiliser ce lien");
        }
    }

    //Récupéper les données outils prod
    public static function getDataOutilProd($params, $url)
    {
        // $url = 'http://localhost:5000/api/v1/indicateur/';
        $method = 'POST';

        if (function_exists('curl_version')) {
            try {
                $curl = curl_init();
                if ($method == 'POST') {
                    $postfield = '';
                    foreach ($params as $index => $value) {
                        $postfield .= $index . '=' . $value . "&";
                    }
                    $postfield = substr($postfield, 0, -1);
                } else {
                    $postfield = null;
                }
                curl_setopt_array($curl, array(
                    CURLOPT_URL => $url,
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_ENCODING => "",
                    CURLOPT_MAXREDIRS => 10,
                    CURLOPT_TIMEOUT => 45,
                    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                    CURLOPT_CUSTOMREQUEST => $method,
                    CURLOPT_POSTFIELDS => $postfield,
                    CURLOPT_SSL_VERIFYHOST => 0,
                    CURLOPT_SSL_VERIFYPEER => 0,
                    CURLOPT_HTTPHEADER => array(
                        "cache-control: no-cache",
                        "content-type: application/x-www-form-urlencoded",
                    ),
                ));
                $response = curl_exec($curl);
                $err = curl_error($curl);
                curl_close($curl);

                if ($err) {
                    throw new \Exception("Error :" . $err);
                } else {
                    return $response;
                }
            } catch (Exception $e) {
                throw new \Exception($e);
            }
        } else if (ini_get('allow_url_fopen')) {
            try {
                // Build Http query using params
                $query = http_build_query($params);
                // Create Http context details
                $options = array(
                    'http' => array(
                        'header' => "Content-Type: application/x-www-form-urlencoded\r\n" .
                            "Content-Length: " . strlen($query) . "\r\n" .
                            "User-Agent:MyAgent/1.0\r\n",
                        'method' => "POST",
                        'content' => $query,
                    ),
                );
                // Create context resource for our request
                $context = stream_context_create($options);
                // Read page rendered as result of your POST request
                $result = file_get_contents(
                    $url, // page url
                    false,
                    $context
                );
                return trim($result);
            } catch (Exception $e) {
                throw new \Exception($e);
            }
        } else {
            throw new \Exception("Vous devez activer curl ou allow_url_fopen pour utiliser ce lien");
        }
    }

    public static function downloadFichierPlanCharge()
    {
        ini_set('memory_limit', '-1');
        ini_set('max_execution_time', '300');

        try {
            $completed = false;

            $fichier = "Plan de charge Activité 2022.xlsm";

            //$source_dossier = "C:/Users/thierno/la voix du client/LVDC-TERRAIN - 1002 PRODUIRE COLLECTER/Manuel Qualité LVDC TELEPHONE/02 PRODUIRE/01 PREPARER/Planification/Planification de l'activité/03 TERRAIN/";
            //$source_chemin =  $source_dossier."".$fichier;
            $lienPlanCharge = Fichier::where('type', 'plan_charge')->first();
            if (isset($lienPlanCharge)) {
                if (isset($lienPlanCharge->designation)) {
                    $source_chemin = $lienPlanCharge->designation;

                    $destination_dossier = "C:/wamp64/www/script/public/uploads/mailsuiviterrains/";
                    $destination_chemin =  $destination_dossier . "" . $fichier;

                    //Copier le fichier puis copier le fichier avec la data et l'heure pour avoir l'historique
                    $rsltCopy = copy($source_chemin, $destination_chemin);
                    if ($rsltCopy == true) {
                        $dateHeure = date('Y-m-d-H-i-s');
                        $destination_chemin_histo =  $destination_dossier . "" . $dateHeure . "_" . $fichier;
                        $rsltCopy2 = copy($source_chemin, $destination_chemin_histo);
                        if ($rsltCopy2 == true) {
                            $completed = true;
                        }
                    }

                    return $completed;
                }
            }
        } catch (\Exception $e) {
            //dd($e); //Pour voir l'erreur précis
            $errorArray = array("type" => "mail_suivi", "designation" => "Outil->downloadFichierPlanCharge->Erreur lors du traitement", "erreur" => $e);
            Outil::saveError($errorArray);
        }
    }

    //Lire Excel ou Macro
    public static function readExcelMacro($filtePath, $sheet = 1)
    {
        ini_set('memory_limit', '-1');
        ini_set('max_execution_time', '300'); //5min

        $retour = null;
        try {
            if ($content = SimpleXLSX::parse($filtePath)) {
                $retour = $content->rows($sheet);
            } else {
                dd("Erreur : " . SimpleXLSX::parseError());
            }

            return $retour;
        } catch (\Exception $e) {
            //dd($e); //Pour voir l'erreur précis
            $errorArray = array("type" => "mail_suivi", "designation" => "Outil->readExcelMacro->Erreur lors du traitement", "erreur" => $e);
            Outil::saveError($errorArray);
        }
    }

    //récupérer les données propres à l'étude (Periode = au global et NomComplet = Tous les agents)
    public static function getusedDataOutilProd($datas)
    {
        try {
            $retour = null;
            foreach ($datas as $one) {
                if ($one->Periode = "Au global" && $one->NomComplet = "Tous les Agents") {
                    $retour = array(
                        'tps_occupation_globale' => $one->TpsOccupation,
                        'dmc_moy_globale' => $one->DureeMoyEntretien,
                        'prod_heure_avec_pause_brief' => $one->ProdHeureAVECPauseDeb,
                        'entretiens_realises' => $one->NbEntretienRealise,
                    );
                }
                break;
            }

            return $retour;
        } catch (\Exception $e) {
            //dd($e); //Pour voir l'erreur précis
            $errorArray = array("type" => "mail_suivi", "designation" => "Outil->getusedDataOutilProd->Erreur lors du traitement", "erreur" => $e);
            Outil::saveError($errorArray);
        }
    }

    // Multiple explode 
    public static function multiexplode($delimiters, $string)
    {
        try {
            $ready = str_replace($delimiters, $delimiters[0], $string);
            $launch = explode($delimiters[0], $ready);
            return  $launch;
        } catch (\Exception $e) {
            //dd($e); //Pour voir l'erreur précis
            $errorArray = array("type" => "mail_suivi", "designation" => "Outil->multiexplode->Erreur lors du traitement", "erreur" => $e);
            Outil::saveError($errorArray);
        }
    }

    //Traitements pour le mail de suivi
    public static function getInfosForMailSuivi()
    {
        ini_set('max_execution_time', 600); //10min
        ini_set('memory_limit', -1);

        try {
            $retour = false;

            //Téléchargement plan de charge
            $downloadPdc = Outil::downloadFichierPlanCharge();

            //Téléchargement FSE
            //$downloadFse = Outil::downloadFichierPlanCharge();
            $downloadFse = true;

            if ($downloadPdc == true && $downloadFse == true) {
                $filtePath = "C:/wamp64/www/script/public/uploads/mailsuiviterrains/Plan de charge Activité 2022.xlsm";
                $feuille_journee_soiree = Outil::readExcelMacro($filtePath, 5); //Feuille N°5 = Journée et Soirée
                //dd($feuille_journee_soiree[12]);

                $etudes = array();
                for ($i = 13; $i < count($feuille_journee_soiree); $i++) //13 = index début des études
                {
                    //Récupérer toute la ligne
                    $row = $feuille_journee_soiree[$i];

                    $num_etude                      = trim($row[0]);
                    $id_askia                       = trim($row[1]);
                    $chef_projet                    = trim($row[3]);
                    $localisation                   = trim($row[5]);
                    $in_tst                         = trim($row[7]);
                    $nom_etude                      = trim($row[9]);
                    $objectif_prod                  = trim($row[14]);
                    $objectif_prod_reactualise      = trim($row[15]);
                    $debut                          = trim($row[18]); //En continu ou date
                    $fin                            = trim($row[19]); //En continu ou date
                    $nbre_jours                     = trim($row[20]); //=0 si en contininu


                    if ((!empty($nom_etude)) && (!empty($chef_projet)) && (!empty($id_askia)) && (!empty($debut)) && (!empty($fin))) {
                        $en_cours = false;
                        $is_date_debut = Outil::isValideDate($debut);
                        $is_date_fin = Outil::isValideDate($fin);
                        if ($is_date_debut == true && $is_date_fin == true) {
                            $dateToday = date('Y-m-d');
                            $dateToday .= ' 00:00:00';
                            if ($dateToday >= $debut && $dateToday <= $fin) {
                                $en_cours = true;
                            }
                        } else if (strpos(strtolower($debut), "continu") !== false || strpos(strtolower($fin), "continu") !== false) {
                            $en_cours = true;
                        }

                        if ($en_cours == true) //Récupérer que les études en cours
                        {
                            //Récupération des données de l'outil prod
                            $tps_occupation_globale = null;
                            $dmc_moy_globale = null;
                            $prod_heure_avec_pause_brief = null;
                            $entretiens_realises = null;

                            $params = array(
                                'num' => $id_askia
                            );
                            $dataOutilProd = Outil::getDataOutilProd($params, "https://lvdc-survey.fr/script/public/recup_dataprod");
                            if (gettype($dataOutilProd) == "string") //On décode une 1ère fois
                            {
                                $dataOutilProd = json_decode($dataOutilProd);
                            }
                            if (gettype($dataOutilProd) == "string") //On décode une 2ème fois si possible
                            {
                                $dataOutilProd = json_decode($dataOutilProd);
                            }
                            $dataOutilProdGood = Outil::isObject($dataOutilProd);
                            if ($dataOutilProdGood == true) {
                                $usedDataOutilProd = Outil::getusedDataOutilProd($dataOutilProd);
                                if (isset($usedDataOutilProd)) {
                                    $tps_occupation_globale = $usedDataOutilProd["tps_occupation_globale"];
                                    $dmc_moy_globale = $usedDataOutilProd["dmc_moy_globale"];
                                    $prod_heure_avec_pause_brief = $usedDataOutilProd["prod_heure_avec_pause_brief"];
                                    $entretiens_realises = $usedDataOutilProd["entretiens_realises"];
                                }
                            }

                            //Récupération de l'objextif global
                            $objectif_global = "SELECT SurveyWantedSampleSize as total FROM Surveys WHERE SurveyId = " . $id_askia . " ";
                            $objectif_global = Outil::requeteInBd("Cca", $objectif_global);

                            //Calcul du taux d'avancement
                            $taux_avancement = 0;
                            if (isset($objectif_global)) {
                                if ($objectif_global > 0 && $objectif_global > 0) {
                                    $taux_avancement = ($entretiens_realises / $objectif_global) * 100;
                                    $taux_avancement = round($taux_avancement, 2);
                                }
                            }

                            //Définition de l'alerte
                            $alerte = "non";
                            $back_color = "transparent";
                            if ($prod_heure_avec_pause_brief < $objectif_prod_reactualise) {
                                $alerte = "oui";
                                $back_color = "DC143C";
                            }

                            array_push($etudes,  array(
                                "num_etude"                     => $num_etude,
                                "id_askia"                      => $id_askia,
                                "chef_projet"                   => $chef_projet,
                                "localisation"                  => $localisation,
                                "in_tst"                        => $in_tst,
                                "nom_etude"                     => $nom_etude,
                                "debut"                         => $debut,
                                "fin"                           => $fin,
                                "nbre_jours"                    => $nbre_jours,
                                "tps_occupation_globale"        => $tps_occupation_globale,
                                "dmc_moy_globale"               => $dmc_moy_globale,
                                "prod_heure_avec_pause_brief"   => $prod_heure_avec_pause_brief,
                                "entretiens_realises"           => $entretiens_realises,
                                "objectif_prod"                 => $objectif_prod,
                                "objectif_prod_reactualise"     => $objectif_prod_reactualise,
                                "taux_avancement"               => $taux_avancement,
                                "objectif_global"               => $objectif_global,
                                "alerte"                        => $alerte,
                                "back_color"                    => $back_color,
                            ));
                        }
                    }
                }
                // Trier les etudes en fonction du numéro de l'etude
                array_multisort(array_column($etudes, 'num_etude'), SORT_ASC, SORT_NATURAL | SORT_FLAG_CASE, $etudes);

                $chef_project =  array();
                //Traitements pour les chefs de projets
                foreach ($etudes as $etude) {
                    foreach ($etude as $key => $value) {
                        if ($key == "chef_projet") {
                            $temp = Outil::multiexplode(array("/", "-", ","), $value);
                            foreach ($temp as $tmp) {
                                array_push($chef_project, trim($tmp));
                            }
                        }
                    }
                }
                asort($chef_project);

                $chef_project = array_unique($chef_project);

                //Traitements pour joindre les études aux chefs de projets correspondants
                $chefProjet_etudes =  array();

                foreach ($etudes as $etude) {
                    foreach ($etude as $key => $value) {
                        if ($key == "chef_projet") {
                            foreach ($chef_project as  $val) {
                                if (str_contains($value, $val)) {
                                    array_push($chefProjet_etudes,  array(
                                        'chef_projet' => $val,
                                        'etudes'      => $etude,
                                    ));
                                }
                            }
                        }
                    }
                }
                // regroupper chef de projets et ses etudes 
                $nom_chef_projet_etudes = array();
                $projet_etudes = array();
                foreach ($chefProjet_etudes as $element) {
                    $projet_etudes[$element['chef_projet']][] = $element['etudes'];
                }
                ksort($projet_etudes);

                foreach ($projet_etudes as $key => $value) {
                    array_push($nom_chef_projet_etudes,  array(
                        "chef_projet" => $key,
                        "etudes"      => $value,
                    ));
                }

                //dd($nom_chef_projet_etudes);


                //Envoi email
                if (isset($nom_chef_projet_etudes)) {
                    $destinataire = array();
                    $cc = array();
                    $emails = Email::where('id', '>', 0)->get();
                    if (isset($emails)) {
                        foreach ($emails as $email) {
                            if ($email->type == "Destinataire") {
                                array_push($destinataire, $email->designation);
                            } else {
                                array_push($cc, $email->designation);
                            }
                        }
                        $dateToday = date('Y-m-d');
                        $hier = Outil::donneDateParRapportNombreJour($dateToday, 1, "-");
                        $hier = Outil::resolveDateFr($hier);
                        $donnees = array('date_fr' => $hier, 'details' => $nom_chef_projet_etudes);
                        $texte = new HtmlString("");
                        $sujet = "Point des terrains au " . $hier;
                        $envoiEmail = Outil::envoiEmail($destinataire, $sujet, $texte, 'mail-suivi', $cc, null, null, $donnees);
                        if ($envoiEmail == true) {
                            //Marquer que c'est envoyé
                            $envoi = new Envoi();
                            $envoi->nbre_personnes = count($nom_chef_projet_etudes);
                            $envoi->contenu = json_encode($nom_chef_projet_etudes);
                            $envoi->save();

                            $retour = true;
                        }
                    }
                }
            }

            return $retour;
        } catch (\Exception $e) {
            //dd($e); //Pour voir l'erreur précis
            $errorArray = array("type" => "mail_suivi", "designation" => "Outil->getInfosForMailSuivi->Erreur lors du traitement", "erreur" => $e);
            Outil::saveError($errorArray);
        }
    }
    public function getTimeDiffAufil($last_au_fil)
    {
        $last  = strtotime($last_au_fil);
        $now   = strtotime(date('d-m-Y H:i:s'));
        $diff  = (int) round(($now - $last) / 3600);
        return $diff;
    }
    public static function update_codification_donnees()
    {
        try {
            $item = Test::find(1);
            if (isset($item)) {
                $item->valeur2 = "AuFilDeLeau " . date('Y-m-d H:i:s');
                $item->save();
            }
            $codifications = Codification::where('etat', 0)->get();
            foreach ($codifications as $key => $codification) {
                $last_au_fil = $codification->last_au_fil;
                if (empty($last_au_fil)) {
                    $last_au_fil = $codification->created_at;
                }
                $diff = Outil::getTimeDiffAufil($last_au_fil);
                $interval = $codification->intervalle_au_fil;

                if (!empty($interval) && $diff >= $interval) {
                    Outil::update_data_one_codif($codification);
                }
            }
        } catch (\Exception $e) {
            //dd($e); //Pour voir l'erreur précis
            $errorArray = array("type" => "update_codification_donnees", "designation" => "Outil->update_codification_donnees->Erreur lors du traitement", "erreur" => $e);
            Outil::saveError($errorArray);
        }
    }
    public static function avertissament_retard()
    {

        try {
            $today                  = date('Y-m-d');
            $preference             = Preference::first();
            $date_to_notif          = date('Y-m-d', strtotime($today . ' + ' . $preference->delais_notification . ' days'));
            $codifs                 = Codification::with(["retard_codif_relect"])
                ->where('etat', 0)
                ->whereDate('date_restrict_codification', $date_to_notif)
                ->get();
            foreach ($codifs as $key => $codif) {
                foreach ($codif->retard_codif_relect as $i => $codif_relec) {
                    Outil::sendAvertissmentRelecteur($codif, $codif_relec, $preference->delais_notification);
                }
            }
            Outil::sendAvertissmentSuperseur($codifs, $preference->delais_notification);
        } catch (\Exception $e) {
            //dd($e); //Pour voir l'erreur précis
            $errorArray = array("type" => "avertissament_retard", "designation" => "Outil->avertissament_retard->Erreur lors du traitement", "erreur" => $e);
            Outil::saveError($errorArray);
        }
    }
    public static function sendAvertissmentRelecteur($codif, $codif_relec, $delais)
    {

        //dd($codif_relecteur->codification_id);
        try {

            $relecteur = Relecteur::find($codif_relec->relecteur_id);
            $etude = Etude::find($codif->etude_id);
            $type = "R2a";

            $cc = null;
            $restant = $codif_relec->nbre_ligne - $codif_relec->nbre_traite;
            $donnees = array(
                "nom"               => $relecteur->nom_complet,
                "type"              => $type,
                "etude"             => $etude->nom_etude . " " . $etude->numero_etude,
                "designation"       => $codif->designation_codification,
                "delais"            => $delais,
                "traites"           => $codif_relec->nbre_traite,
                "nombre_lignes"  => $codif_relec->nbre_ligne,
                "restant"           => $restant,
                "date_restitution"  => date("d - m - Y", strtotime($codif->date_restrict_codification)),
            );
            $objet =  "Important !!! La tâche   " . $codif->designation_codification . ' tire à sa fin';
            $texte = new HtmlString("");
            $template = 'avertissement-relecteur';

            $envoiEmail = Outil::envoiEmail($relecteur->email, $objet, $texte, $template, $cc, null, null, $donnees);
            /* if($envoiEmail == true){
                    $codif_relecteur->notifie = 1;
                    $codif_relecteur->save();
                } */
        } catch (Exception $e) {
            // En cas d'erreur, on afr2a un message et on arrête tout
            $errorArray = array("type" => "sendAvertissmentRelecteur", "designation" => "Outil->sendAvertissmentRelecteur->Erreur lors du traitement", "erreur" => $e);
            Outil::saveError($errorArray);
        }
    }

    public static function get_donnees_siretiser($data, $code_postal = null)
    {
        $donnees         = json_decode($data, true);
        $donnees         = array_values($donnees);
        $donnees_propres = [];

        foreach ($donnees as $key => $values) {
            $tmp = array();
            $donnees_propres[$key]["IDLVDC"]      = $values["IDLVDC"];
            $donnees_propres[$key]["InterviewId"] = $values["InterviewId"];
            // dd($values, $tmp); 
            $donnees_propres[$key]["QuestionnairesComplet"] = array();
            $filteredData = [];

            foreach ($values['QuestionnairesComplet'] as $subarray) {
                if ($subarray['libelle_court'] != $code_postal) {
                    array_push($donnees_propres[$key]["QuestionnairesComplet"], $subarray);
                } elseif (preg_match("/^\d+\s*\w+.*\s+\w+$/", $subarray['reponse']) && $subarray['libelle_court'] == $code_postal) {
                    array_push($donnees_propres[$key]["QuestionnairesComplet"], $subarray);
                }
            }
        }
        $donnees_propres  = array_values($donnees_propres);

        return $donnees_propres;
    }



    public static function sendAvertissmentSuperseur($codifs, $delais)
    {

        //dd($codif_relecteur->codification_id);
        try {

            $cc = array();
            $preference = Preference::first();
            $emails = explode(";", $preference->emails_a_notifier);
            $cpt = 1;
            foreach ($emails as $one) {
                if ($cpt == 1) {
                    if (!empty($one)) {
                        $destinataire = trim($one);
                    }
                } else {
                    if (!empty($one)) {
                        array_push($cc, trim($one));
                    }
                }
                $cpt++;
            }
            $donnees = array(
                "codifs"  => $codifs,
                "delais"  => $delais,

            );
            $objet =  "Rappel échéance date de restitution";
            $texte = new HtmlString("");
            $template = 'avertissement-superviseur';

            $envoiEmail = Outil::envoiEmail($destinataire, $objet, $texte, $template, $cc, null, null, $donnees);
        } catch (Exception $e) {
            // En cas d'erreur, on afr2a un message et on arrête tout
            $errorArray = array("type" => "sendAvertissmentSuperseur", "designation" => "Outil->sendAvertissmentSuperseur->Erreur lors du traitement", "erreur" => $e);
            Outil::saveError($errorArray);
        }
    }
    public function getDataJustPassed($codification_id)
    {
        $data = [];
        $codif_relects = CodificationRelecteur::where('codification_id', $codification_id)->get();

        foreach ($codif_relects as $key => $codif_relect) {

            if (!empty($codif_relect->donnees)) {
                $relect_data = json_decode($codif_relect->donnees, true);
                $data = array_merge($relect_data, $data);
            }
        }
        return array_values($data);
    }
    public static function getDestinataireAndCC($emails, $type = 'destinataire')
    {
        $array = [
            'destinataire' => '',
            'cc' => []
        ];
        $cpt = 1;
        foreach ($emails as $one) {
            if ($cpt == 1) {
                if (!empty($one)) {
                    $array['destinataire'] = trim($one);
                }
            } else {
                if (!empty($one)) {
                    array_push($$array['cc'], trim($one));
                }
            }
            $cpt++;
        }
        return $array[$type];
    }
    public static function sendMailR2a($item)
    {

        $meta_data = [];
        if (!empty($item) && !empty($item->etude)) {
            $donnees        = json_decode($item->donnees, true);
            //Récupération des questions à affciher dans l'entête 
            $entetes        = json_decode($item->etude->entetes, true);
            //Récupération des réponses pour l'entête
            $entetes_data   = Outil::get_data_entetes($entetes, $donnees);
            //Récupération des questions à affciher dans le contenu 
            $contenus       = json_decode($item->etude->contenus, true);
            //Récupération des réponses pour le contenu
            $conteus_data   = Outil::get_data_contenus($contenus, $donnees);
            $meta_data['logo_client']    = $item->etude->logo_client;
            $meta_data['logo_lvdc']    = $item->etude->logo_lvdc;
            $meta_data['titre']    = $item->etude->titre;

            $pdf = PDF::loadView('pdfs.r2a', compact('entetes_data', 'conteus_data', 'meta_data'));

            $emails = explode(";", $item->etude->destinataires);
            $cc = explode(";", $item->etude->cc);

            $contenu_mail = $item->etude->contenu;
            $pieces_jointes = [];
            array_push($pieces_jointes, $pdf);
            /* dd($pieces_jointes); */
            $destinataire = $emails;

            $objet =  "Nouvelle R2a pour " . $item->id_lvdc;
            $donnees = array(
                "objet"  => $objet,
                "contenu"  => $contenu_mail,
                "id_lvdc" => $item->id_lvdc
            );
            $texte = new HtmlString("");
            $template = 'mail-r2a';

            $envoiEmail = Outil::envoiEmail($destinataire, $objet, $texte, $template, $cc, null, $pieces_jointes, $donnees);
            return $envoiEmail;
        }
    }
    public static function generate_pdf_r2as()
    {
        $r2as  = R2a::whereNull('lien_pdf')->orderByDesc('id')->limit(20)->get();
        foreach ($r2as as $key => $r2a) {
            $meta_data = [];
            /*$r2a = R2a::with('etude')->latest()->first();*/
            if (!empty($r2a) && !empty($r2a->etude)) {
                $donnees = json_decode($r2a->donnees, true);
                //Récupération des questions à affciher dans l'entête 
                $entetes = json_decode($r2a->etude->entetes, true);
                //Récupération des réponses pour l'entête
                $entetes_data = Outil::get_data_entetes($entetes, $donnees);
                //Récupération des questions à affciher dans le contenu 
                $contenus = json_decode($r2a->etude->contenus, true);
                //Récupération des réponses pour le contenu
                $conteus_data = Outil::get_data_contenus($contenus, $donnees);

                //Meta Data
                $meta_data['logo_client']    = $r2a->etude->logo_client;
                $meta_data['logo_lvdc']    = $r2a->etude->logo_lvdc;
                $meta_data['titre']    = $r2a->etude->titre;
            }

            /* $fileName = $r2a->id_lvdc.'_'.date('Ymd-His').'.pdf';
            $pdf = PDF::loadView('pdfs.r2a', compact('entetes_data','conteus_data','meta_data'));
            Storage::put('public/pdf/r2as/'.$fileName, $pdf->output());
            $r2a->lien_pdf    ='pdf/r2as/'.$fileName; */
            $r2a->etat        = 1;
            $r2a->save();
        }
    }

    public static function refresh_etudes()
    {
        ini_set('max_execution_time', '3000'); //50min
        $etudes = Etude::latest()->limit(100)->get();
        foreach ($etudes as $key => $etude) {
            Outil::get_donnees_etudes($etude);
            /* Outil::generate_pdf_r2as(); */
        }
    }
    public static function get_donnees_etudes($etude)
    {
        ini_set('max_execution_time', '3000'); //50min
        $all_shortcuts          = [];
        //Récupération des shortcuts des différents conditions
        $conditions             = json_decode($etude->conditions, true);
        $shortcut_conditions    = Outil::get_shortcut($conditions, 'question');
        //Récupération des shortcuts des différents contenus
        $contenus             = json_decode($etude->contenus, true);
        $shortcut_contenus    = Outil::get_shortcut($contenus, 'questions', 'shortcut');
        //Récupération des shortcuts des différents conditions
        $entetes             = json_decode($etude->entetes, true);
        $shortcut_entetes    = Outil::get_shortcut($entetes, 'question');

        $all_shortcuts = array_merge($shortcut_conditions, $shortcut_contenus, $shortcut_entetes);

        $params    = array(
            "taskid"         => $etude->task_id,
            "listeID"        => $etude->list_id,
            "liste_shortcut" => implode(",", array_unique($all_shortcuts)),
            "type_entretien" => 'complet',
            "mode"           => '1',
            "token"          => "dd524d28ea142c631bfe35bae6275af07bf2a884808fe5915a3abd35171f1503",
        );

        $data       = Outil::getDataR2asFromAPIPython($params);
        $data       = json_decode($data, true);

        $id_lvdc = [];
        foreach ($data as $key => $row) {
            $is_ok = Outil::verify_condition($etude, $row);

            if ($is_ok == true && isset($row["IDLVDC"])) {

                $id_lvdc  = $row["IDLVDC"];
                $r2a = R2a::where('id_lvdc', $id_lvdc)->where('etude_id', $etude->id)->first();
                if (empty($r2a)) {
                    $r2a = new R2a();
                    $r2a->id_lvdc         = $id_lvdc;
                    $r2a->etude_id         = $etude->id;
                    $r2a->designation     = $etude->titre . '-' . $id_lvdc;
                    $r2a->donnees         = json_encode($row);
                    $r2a->save();
                }
                /* dd($r2a); */
            }
        }
    }

    public static function get_data_entetes($entetes_questions, $data)
    {

        $entetes_data  = [];
        foreach ($entetes_questions as $key => $entete) {
            foreach ($data["QuestionnairesComplet"] as $item) {
                if ($entete["question"] == $item["libelle_court"]) {
                    array_push($entetes_data, [
                        "label" => $entete['titre'],
                        "value" => empty($item["reponse"]) ? 'NR' : $item["reponse"]
                    ]);
                }
            }
        }
        return $entetes_data;
    }
    public static function get_data_contenus($themes, $data)
    {

        //$contenus_data  = [];
        $types  = [];
        foreach ($themes as $key => $theme) {

            foreach ($theme["questions"] as $i => $question) {
                foreach ($data["QuestionnairesComplet"] as $item) {
                    //array_push($types, $item["type"]);
                    if ($question["shortcut"] == $item["libelle_court"]) {
                        $valeur         =  $item["reponse"];
                        $color = 'black';

                        if ($item["type"] == 'numeric' && !empty($valeur)) {
                            if ($valeur <= 6) {
                                $color = 'red';
                            } elseif ($valeur >= 8) {

                                $color = 'green';
                            } else {
                                $color = 'grey';
                            }
                            $valeur = Outil::donneValeurNps($valeur);
                        }
                        $themes[$key]["questions"][$i]["valeur"]    = $valeur;
                        $themes[$key]["questions"][$i]["color"]     = $color;
                        $themes[$key]["questions"][$i]["type"]      = $item["type"];
                        if (empty($themes[$key]["questions"][$i]["valeur"])) {
                            $themes[$key]["questions"][$i]["valeur"] = 'NR';
                        }
                    }
                }
            }
        }
        //dd($types);
        return $themes;
    }
    public static function donneValeurNps($valeur)
    {
        $retour  = $valeur;
        if (is_numeric($valeur)) {
            $retour = (strlen($valeur) == 1) ? '0' . $valeur : $valeur;
            $retour .= "/10";
        }

        return $retour;
    }
    public static function relireVerbatim($verbatim)
    {
        try {
            $retour     = $verbatim;
            $url        =  'https://lvdc-survey.fr/relecture/public/relire_verbatim';
            // Create a new cURL resource
            $ch = curl_init($url);

            // Setup request to send json via POST
            $data       = ['verbatim' => $verbatim];

            $payload = json_encode($data);

            // Attach encoded JSON string to the POST fields
            curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);

            // Set the content type to application/json
            curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type:application/json'));

            // Return response instead of outputting
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

            // Execute the POST request
            $result = curl_exec($ch);

            // Close cURL resource
            curl_close($ch);
            if (!empty($result)) {
                $retour = $result;
            }
            return $retour;
        } catch (\Exception $e) {
            $errorArray = array("type" => "relecture_r2as", "designation" => "Outil->relecture_r2as->Erreur lors du traitement", "erreur" => $e);
            Outil::saveError($errorArray);
            return false;
        }
    }

    public static function notificationNewPeriode()
    {
        $dateToday = date('Y-m-d');
        $periodes = Periode::where('date_notification', $dateToday)->get();
        
        foreach ($periodes as $key => $periode) {
            Outil::sendMailNewPeriode($periode);
        }
    }
    public static function sendMailNewPeriode($periode)
    {
        $users  = User::where('is_admin', 0)->get();
        foreach ($users as $key => $user) {
            Outil::sendMailNewPeriodeToUser($user, $periode);
           
        }
    }
    public static function sendMailNewPeriodeToUser($user, $periode)
    {
        //$cc = array();
        // $destinataire = $user->email;
        $destinataire = $user->email;

        $cc = "yousoupha.thiandoum@lavoixduclient.fr";
        $donnees = array(
            "designation_periode" => $periode->designation,
            "login"               => $user->email,
            "password"            => $user->password_seen,
        );

        if (empty($objet)) {
            $objet =  "Nouvelles compétences à remplirpour la période ".$periode->designation;
        }
        $texte = new HtmlString("");
        if (empty($template)) {
            $template = 'new-periode';
        }

        $envoiEmail = Outil::envoiEmail($destinataire, $objet, $texte, $template, $cc, null, null, $donnees);
        if($envoiEmail == true){
            $envoie             = new Envoie();
            $envoie->user_id    = $user->id;
            $envoie->periode_id = $periode->id;
            $envoie->save();
        }
    }

    public static function getColorByNote($note) 
    {
        if ($note == 10) 
        {
            return '#70b391'; // R 112, V 179, B 145
        } 
        elseif ($note >= 8 && $note <= 9) 
        {
            return '#bedc91'; // R 190, V 220, B 145
        }
        elseif ($note == 7) 
        {
            return '#ffd8b9'; // R 255, V 216, B 185
        } 
        elseif ($note >= 5 && $note <= 6) 
        {
            return '#f58383'; // R 245, V 131, B 131
        } 
        else {
            return '#c80000'; // R 200, V 0, B 0
        }
    }

    public static function notificationRappelPeriode()
    {
        $dateToday     = date('Y-m-d');
        $dateMoinsDeux = date('Y-m-d', strtotime('-2 days'));

        $periodes   = Periode::where('date_notification', '<', $dateToday)
                            ->whereHas('envoies', function ($query) use ($dateMoinsDeux) {
                                $query->whereDate('created_at', $dateMoinsDeux);
                            })->get();

        // $periodes = Periode::where('date_notification', '<', $dateToday)->where('active', '1')->get();
        foreach ($periodes as $key => $periode) 
        {   
            Outil::sendMailRappelPeriode($periode);
        }
    }

    public static function sendMailRappelPeriode($periode)
    {
        $list_evaluateurs = []; 
        $list_evaluateurs = FournisseurEvaluateur::where('fournisseur_id', $periode->fournisseur_id)
                                                ->pluck('evaluateur_id')->toArray();
        
        $dateMoinsSept = date('Y-m-d', strtotime('-1 days', strtotime($periode->date_notification)));
        $users  = User::whereIn('id', $list_evaluateurs)
                        ->whereDoesntHave('notes', function ($query) use ($periode) {
                        $query->where('etat', 1)->where('periode_id', $periode->id);
                })->get();
        // dd($users);
        foreach ($users as $key => $user) 
        {
            Outil::sendMailRappelPeriodeToUser($user, $periode);
        }
    }
    public static function sendMailRappelPeriodeToUser($user, $periode)
    {
        
        $cc           = "youssoupha.thiandoum@lavoixduclient.fr";
        $destinataire = $user->email;
        //$destinataire = "libasse.diop@lavoixduclient.fr";
        //$destinataire = "libasse.diop@lavoixduclient.fr";
        
        $donnees = array(
            "designation_periode" => $periode->designation,
            "login"               => $user->email,
            "password"            => $user->password_seen,
        );

        if (empty($objet)) {
            $objet ="Rappel compétences à remplir pour la période ".$periode->designation;
        }
        $texte = new HtmlString("");
        if (empty($template)) {
            $template = 'rappel-periode';
        }



        $envoiEmail = Outil::envoiEmail($destinataire, $objet, $texte, $template, $cc, null, null, $donnees);
        if($envoiEmail == true){
            $envoie             = new Envoie();
            $envoie->user_id    = $user->id;
            $envoie->periode_id = $periode->id;
            $envoie->save();
        }
    }
    


    public static function get_complet_evaluation($id)
    {
        $retour = "";

        if (isset($id)) 
        {
            // Compte le nombre d'évaluations faites (état = 1) pour chaque user_id distinct
            $evaluations = Note::where('periode_id', $id)
                                ->where('etat', 1)
                                ->select('user_id', DB::raw('count(DISTINCT user_id) as count'))
                                ->groupBy('user_id')
                                ->get();
           
            // Compte le nombre total de user_id distinct dans la période
            $totalUserIds = Note::where('periode_id', $id)
                                ->distinct('user_id')
                                ->count('user_id');
            
            // Compte le nombre total d'évaluations faites
            $totalEvaluations = $evaluations->sum('count');
    
            // Formatage de la réponse
            $retour =  "$totalEvaluations/$totalUserIds";
        }
       
        return $retour; // Si aucun ID n'est fourni
    }
    
    public static function verify_condition($etude, $row)
    {
        $conditions         = json_decode($etude->conditions, true);

        $operateur_cond     = $etude->operateur_conditions;
        $nbre_conditions    = count($conditions);
        $conditions_ok      = 0;
        if (isset($row["QuestionnairesComplet"])) {
            foreach ($row["QuestionnairesComplet"] as $key => $value) {
                foreach ($conditions as $i => $condition) {
                    $question           = $condition['question'];
                    $libelle_court      = $value["libelle_court"];

                    if (strtolower($question) == strtolower($libelle_court)) {
                        $operateur          = $condition['operateur'];
                        $valeur             = $condition['valeur'];
                        $reponse            = $value["reponse"];
                        $string_condition   = '$valeur ' . $operateur . ' $reponse';

                        $result = Outil::compare_values($reponse, $valeur, $operateur);
                        // dd($result);
                        if ($result) {
                            $conditions_ok++;
                        }
                    }
                }
            }
        }
        if ($operateur_cond == '&&' && $conditions_ok == $nbre_conditions) {
            return true;
        } else {
            return false;
        }
    }

    public static function compare_values($valeur1, $valeur2, $operateur = '==')
    {
        switch ($operateur) {
            case '==':
                return  strtolower($valeur1) == strtolower($valeur2);
                break;

            case '!=':
                return  strtolower($valeur1) == strtolower($valeur2);
                break;

            case '>':
                return  $valeur1 > $valeur2;
                break;

            case '<':
                return  $valeur1 < $valeur2;
                break;

            case '>=':
                return  $valeur1 >= $valeur2;
                break;

            case '<=':
                return  $valeur1 <= $valeur2;
                break;

            default:
                return false;
                break;
        }
    }
    public static function get_shortcut($items, $colonne, $colonne2 = 'shortcut')
    {
        $shortcuts = [];

        foreach ($items as $key => $item) {
            if (isset($item[$colonne]) && !is_array($item[$colonne])) {
                array_push($shortcuts, $item[$colonne]);
            } elseif (isset($item[$colonne]) && is_array($item[$colonne])) {
                foreach ($item[$colonne] as $key => $subItem) {
                    //dd($subItem);
                    if (isset($subItem) && !is_array($subItem)) {
                        array_push($shortcuts, $subItem);
                    } elseif (isset($subItem[$colonne2])) {
                        //dd($subItem[$colonne2]);
                        array_push($shortcuts, $subItem[$colonne2]);
                    }
                }
            }
        }
        return $shortcuts;
    }
    public static function update_data_one_codif($codification)
    {

        try {
            // $old_data = Outil::getDataJustPassed($codification->id);
            $old_data  = json_decode($codification->donnees, true);

            $questions = json_decode($codification->questions_aides, true);

            $liste_shortcut = [];
            foreach ($questions as $key => $question) {
                if (isset($question['question_aide']) && !empty($question['question_aide'])) {
                    array_push($liste_shortcut, $question['question_aide']);
                }
                if (isset($question['question_codif']) && !empty($question['question_codif'])) {
                    array_push($liste_shortcut, $question['question_codif']);
                }
            }

            $params    = array(
                "taskid"         => $codification->etude->id_askia,
                "listeID"        => $codification->etude->id_liste,
                "liste_shortcut" => implode(",", array_unique($liste_shortcut)),
                "type_entretien" => $codification->type_entretien_codification,
                "mode"           => $codification->mode_codification,
                "token"          => "dd524d28ea142c631bfe35bae6275af07bf2a884808fe5915a3abd35171f1503",
            );

            $data       = Outil::getDataR2asFromAPIPython($params);
            $new_datas  = json_decode($data, true);

            if (isset($new_datas)) {
                $new_donnees = Outil::get_donnees_siretiser($data, $codification->shortcut_code_postal_entreprise);
            }

            //Pour merger l'ensemble des données passées aux enqueteurs pour eviter une redondance quand une tache au fil n'a pas bien fonctionné
            // $old_data = Outil::getDataJustPassed($codification->id);
            // if(empty($old_data) ){
            //     $old_data = [];
            // }
            $arrdiff = array();

            if (isset($new_donnees)) {
                $arrdiff = array_udiff($new_donnees, $old_data, function ($a, $b) {
                    return strcmp($a['IDLVDC'], $b['IDLVDC']);
                });
            }
            //Outil::getArrayDiffShortCutAndIdLvdc($new_datas, $old_data);

            $data_to_pass = array_values($arrdiff);
            $new_data_codif = array_merge($old_data, $data_to_pass);

            // reindexer les données 
            $new_data_codif = Outil::reindexData($new_data_codif);

            if (count($data_to_pass) > 0) {
                $new_lines = count($data_to_pass);

                //dd($donnees_traiter);
                $nbre_entreprise_siretisable  =  count(
                    Outil::getDataSiretisable(
                        $data_to_pass,
                        $codification->shortcut_nom_entreprise,
                        $codification->shortcut_code_postal_entreprise,
                        $codification->shortcut_adresse_entreprise
                    )
                );

                $codification->nbre_ligne       = $codification->nbre_ligne + $new_lines;
                $codification->nbre_entreprise  = $codification->nbre_entreprise +  $nbre_entreprise_siretisable;
                $codification->donnees          = json_encode($new_data_codif);
                $codification->last_au_fil      = new DateTime();

                $codification->save();
                $historique                     = new Historique();
                $historique->codification_id    = $codification->id;
                $historique->nbre_lignes        = $new_lines;
                $historique->nbre_entreprise    = $nbre_entreprise_siretisable;

                $historique->save();
                Outil::sendNotificationNewDataSuperviseurs($codification, $new_lines, $nbre_entreprise_siretisable);
            }
            return true;
        } catch (\Exception $e) {
            dd($e); //Pour voir l'erreur précis
            $errorArray = array("type" => "update_data_one_codif", "designation" => "Outil->update_data_one_codif->Erreur lors du traitement", "erreur" => $e);
            Outil::saveError($errorArray);
            return false;
        }
    }
    public function getArrayDiffShortCutAndIdLvdc($new_data, $old_data)
    {
        $to_pass = [];

        foreach ($new_data as $index => $element) {
            /**
             * @var string $key
             * @var string $value
             */
            foreach ($element as $key => $value) {
                if ($arr2[$index][$key] !== $value) {
                    $notMatched["arr1"] = $arr1[$index];
                    $notMatched["arr2"] = $arr2[$index];
                }
            }
        }
    }
    public static function sendNotificationNewDataSuperviseurs($codif, $new_lines, $nbre_entreprise)
    {
        $infos = [
            "new_lines" => $new_lines,
            "nbre_entreprise" => $nbre_entreprise
        ];
        $type = "R2a";

        $objet = $new_lines . " lignes supplémentaires vous ont été ajoutés à la  " . strtolower($type) . " " . $codif->desiganation;
        Outil::sendNotificationSupervisuers($codif, $objet, 'new-data-superviseurs', $infos);
    }
    public static  function reindexData($data)
    {
        foreach ($data as $key => $row) {
            $data[$key]["index"] = $key;
        }
        return $data;
    }
    public static function pass_new_data_relecteurs($codification, $data_to_pass)
    {
        if (!empty($codification->r2a_id)) {
            $data_to_pass = Outil::reindexData($data_to_pass);
        }
        try {
            $codif_relecteurs   = CodificationRelecteur::where('codification_id', $codification->id)->get();
            $nbre_relecteurs    = count($codif_relecteurs);
            $total_lignes       = count($data_to_pass);
            $total_remis        = 0;
            $start              = 0;
            $end                = 0;
            foreach ($codif_relecteurs as $key => $codif_relecteur) {
                $valeur                 = 0;
                $relecteur_data = json_decode($codif_relecteur->donnees, true);
                $part_relecteur_donnnes = [];
                if (empty($relecteur_data)) {
                    $relecteur_data = [];
                }
                if ($key == $nbre_relecteurs - 1) {
                    $valeur = $total_lignes - $total_remis;
                } else {
                    $valeur = round($total_lignes * $codif_relecteur->pourcentage * 0.01);
                }
                $codif_relecteur->nbre_ligne +=  $valeur;
                $total_remis += $valeur;
                if ($key == 0) {
                    $start = $key;
                    $end   = $valeur;
                } else {
                    $start += $end;
                    $end    = $start + $valeur;
                }
                $part_relecteur_donnnes             = Outil::getPartDataForRelecteursAuFil($codification, $data_to_pass, $start, $end);
                $part_relecteur_donnnes_merges      = array_merge($relecteur_data, array_values($part_relecteur_donnnes));

                $nbre_lignes_ajoutes                = count($part_relecteur_donnnes);
                $nbre_lignes_total_user             = count($part_relecteur_donnnes_merges);
                $codif_relecteur->donnees           = $part_relecteur_donnnes_merges;
                $codif_relecteur->nbre_ligne        = $nbre_lignes_total_user;
                $codif_relecteur->nbre_entreprise   = $nbre_lignes_total_user;
                $codif_relecteur->save();

                Outil::sendNotificationNewData($codification, $codif_relecteur, $nbre_lignes_ajoutes);
            }

            return true;
        } catch (\Exception $e) {
            //dd($e); //Pour voir l'erreur précis
            $errorArray = array("type" => "pass_new_data_relecteurs", "designation" => "Outil->pass_new_data_relecteurs->Erreur lors du traitement", "erreur" => $e);
            Outil::saveError($errorArray);
        }
    }
    public static function getPatchData($old_data, $donnee_relu)
    {
        try {

            if (empty($old_data)) {
                $old_data = [];
            }
            if (empty($donnee_relu)) {
                $donnee_relu = [];
            }
            $arrdiff = array_udiff($old_data, $donnee_relu, function ($a, $b) {
                return strcmp($a['IDLVDC'], $b['IDLVDC']);
            });

            $unread_data = array_values($arrdiff);
            $new_data_codif = array_merge($donnee_relu, $unread_data);
            return $new_data_codif;
        } catch (\Exception $e) {
            //dd($e); //Pour voir l'erreur précis
            $errorArray = array("type" => "getPatchData", "designation" => "Outil->getPatchData->Erreur lors du traitement", "erreur" => $e);
            Outil::saveError($errorArray);
        }
    }

    //**************************************************************************************** */
    //Récupérer les montants totaux
    public static function donneMontantTotal($type = "paiement", $itemArray)
    {
        $filtres = "";
        $typeAvecS = $type . "s";
        $data = null;
        if (isset($itemArray)) {
            if ($type == "paiement") {
                $date_debut = Outil::donneDateCompletEn($itemArray["date_debut"], false);
                $date_fin = Outil::donneDateCompletEn($itemArray["date_fin"], false);
                $caisse_id = $itemArray["caisse_id"];
                $filtres = 'date_start:"' . $date_debut . '",date_end:"' . $date_fin . '",caisse_id:' . $caisse_id . ',avec_total_periode:true';
            } else if ($type == "reglement") {
                $date_debut = Outil::donneDateCompletEn($itemArray["date_debut"], false);
                $date_fin = Outil::donneDateCompletEn($itemArray["date_fin"], false);
                $caisse_id = $itemArray["caisse_id"];
                $filtres = 'date_start:"' . $date_debut . '",date_end:"' . $date_fin . '",caisse_id:' . $caisse_id . ',avec_total_periode:true';
            } else if ($type == "commande") {
                $date_debut = Outil::donneDateCompletEn($itemArray["date_debut"], false);
                $date_fin = Outil::donneDateCompletEn($itemArray["date_fin"], false);
                $caisse_id = $itemArray["caisse_id"];
                $filtres = 'date_start:"' . $date_debut . '",date_end:"' . $date_fin . '",caisse_id:' . $caisse_id . ',avec_total_periode:true';
            }
        }
        $data = Outil::getOneItemWithGraphQl($typeAvecS, $filtres);
        return $data;
    }

    public static function viderPanier($panier)
    {
        $testIfSelectedExist = PanierProduit::where('panier_id', $panier->id)->where('selected', 1)->count();
        if ($testIfSelectedExist > 0) {
            //Des produits sont cochés
            PanierProduit::where('panier_id', $panier->id)->where('selected', 1)->delete();
            PanierProduit::where('panier_id', $panier->id)->where('selected', 1)->forceDelete();
            return true;
        }
        PanierProduit::where('panier_id', $panier->id)->delete();
        PanierProduit::where('panier_id', $panier->id)->forceDelete();
        $panier->delete();
        $panier->forceDelete();
        return true;
    }

    public static function testerPanier($panier, $proforma = false, $fromSite = false)
    {
        //Si errors vaut null le panier est bon
        $errors = null;
        $cpt = 0;
        if (empty($panier)) {
            $errors = "Aucun produit trouvé";
        } else {
            foreach ($panier as $key => $value) {
                if ($fromSite == true) {
                    $produit_id = $value["produit_id"];
                    $prix = $value["prix"];
                    $qte = $value["qte"];
                } else {
                    $produit_id = $value->produit_id;
                    $prix = $value->prix;
                    $qte = $value->qte;
                }

                $cpt++;
                $produitTest = new Produit();
                $produitTest = Produit::find($produit_id);
                if (empty($produitTest)) {
                    $errors = "Le produit N°: " . $cpt . " n'existe plus dans la base de données";
                    break;
                } else if ($qte >  Produit::getCurrentQte($produitTest->id)) {
                    // $errors = "La qté demandée pour le produit <strong>" . $produitTest->designation . "</strong> n'est pas disponible";
                    //break;
                } else if (!isset($prix) || is_numeric($prix) == false || $prix < 0) {
                    $errors = "Le prix n'est pas valide pour le produit <strong>" . $produitTest->designation . "</strong>";
                    break;
                } else if ($proforma == false) {
                    if ($prix <= 0) {
                        $errors = "Le prix pour le produit <strong>" . $produitTest->designation . "</strong> doit être défini";
                        break;
                    }
                }
            }
        }
        return $errors;
    }

    //Remise à 0 selected pour tous les panier_produit du panier
    public static function remiseZeroSelectedPanierProduit($panier)
    {
        $retour = false;
        if (isset($panier)) {
            DB::table('panier_produits')->where('panier_id', $panier->id)->update(['selected' => 0]);
            $retour = true;
        }
        return $retour;
    }

    //Remise à 0 les adresses par defaut du client
    public static function remiseZeroAdresseParDefautClient($client)
    {
        $retour = false;
        if (isset($client)) {
            DB::table('adresses')->where('client_id', $client->id)->update(['par_defaut' => 0]);
            $retour = true;
        }
        return $retour;
    }

    //Marquer les selected sur les produits séléctionnés de panier_produit
    public static function marquerSelectedPanierProduit($panier, $produitSelectionnes)
    {
        $retour = false;
        if (isset($panier) && isset($produitSelectionnes)) {
            $retour = true;
            Outil::remiseZeroSelectedPanierProduit($panier);
            foreach ($produitSelectionnes as $value) {
                $panierProduit = new PanierProduit();
                $panierProduit = panierProduit::where('panier_id', $panier->id)->where('produit_id', $value)->first();
                if (isset($panierProduit)) {
                    $panierProduit->selected = 1;
                    $panierProduit->save();
                }
            }
        }
        return $retour;
    }

    public static function donneSelectedProduitArray($produitSelectionnes)
    {
        $produits = $produitSelectionnes;
        //$produits = json_decode($produitSelectionnes, true);
        $retour = array();
        foreach ($produits as $value) {
            array_push($retour, $value);
            //  array_push($retour, $value["id"]);
        }
        return $retour;
    }

    public static function getConnectedClient($valeurIdClient = null)
    {
        if (isset($valeurIdClient)) {
            $client_id = $valeurIdClient;
        } else {
            $client_id = 1;
        }

        return $client_id;
    }

    public static function getUser()
    {
        $user = auth()->user();
        $user1 = Auth::user();

        return $user1;
    }

    //Test la connection du client par token
    public static function getConnectedClientToken(Request $request)
    {
        $retour = 0;
        if (empty($request->token)) {
            return $retour;
        }

        $item = Client::where("token", $request->token)->first();
        if (isset($item)) {
            $retour = $item->id;
        }
        return $retour;

        //A tester pourqoi sur les querys ca ne marchait pas (avant de faire sauter le return)
        $item = new ClientJwt();
        $valeurObjet = $item->handle($request);
        //dd($valeurObjet);
        $valeurObjetParsei = $valeurObjet->getData();
        $status = $valeurObjetParsei->status;
        if (isset($status)) {
            //dd($valeurObjetParsei->err_);
            if ($status == true || $status == 1) {
                //Le token est bon
                //$retour = true;
                $item = Client::where("token", $request->token)->first();
                if ($item) {
                    $retour = $item->id;
                }
            }
        }

        return $retour;
    }

    //Donner les mois antérieurs par rapport à un chiffres
    public static function moisAnterieurs($nbre)
    {
        for ($i = 0; $i <= $nbre; $i++) {
            $moisAnnees[] = date("Y-m", strtotime(date('Y-m-01') . " -$i months"));
        }
        return $moisAnnees;
    }

    //Donner les mois antérieurs par rapport à un intervalle de mois
    public static function moisAnterieursParDates($debut, $fin)
    {
        $debut = $debut . '-01';
        $fin = $fin . '-01';
        $date_start = date_create($debut . '-01');
        $date_end = date_create($fin . '-01');
        $nbre = date_diff($date_start, $date_end);
        //Diffrérence en mois
        $nbre = $nbre->format('%m');
        for ($i = 0; $i <= $nbre; $i++) {
            $moisAnnees[] = date("Y-m", strtotime($fin . " -$i months"));
        }
        return $moisAnnees;
    }

    //Donner les ids users des dépots sélectionnés
    public static function donneIdUserDepotsParIdDepot($idDepots)
    {
        $id_user_depots = array();
        if ($idDepots) {
            $depotUsers = DB::select(DB::raw("SELECT user_id FROM depot_users WHERE depot_id IN ($idDepots)"));
            foreach ($depotUsers as $value) {
                array_push($id_user_depots, $value->user_id);
            }
        }
        return $id_user_depots;
    }

    //Donner le mois en lettres
    public static function donneMoisEnLettres($mydate, $nomMoisComplet = false)
    {
        //#tags: mois, lettres, changer mois, formater mois
        //Janvier = 0, Février = 1, etc
        $nomMois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jui', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
        if ($nomMoisComplet) {
            $nomMois = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        }
        $mois = substr($mydate, 5, 2);
        $mois = intval($mois);
        $mois = $mois - 1;
        $retour = $nomMois[$mois];
        return $retour;
    }

    //Remplace les espaces par vide
    public static function enleveEspaces($val)
    {
        $retour = str_replace(" ", "", $val); //Espace normal
        $retour = str_replace(' ', '', $retour); //Espace bizarre sur le fichier Excel d'import (les 2 espaces ne sont pas pareils)
        return $retour;
    }

    public static function mettreEnMiniscule($val)
    {
        $retour = strtolower($val);
        return $retour;
    }

    public static function minisculeSansEspaces($val)
    {
        $retour = trim($val);
        $retour = Outil::enleveEspaces($retour);
        $retour = Outil::mettreEnMiniscule($retour);
        return $retour;
    }

    public static function remplaEspaceBizarre($val)
    {
        $retour = str_replace(' ', '', $val);
        return $retour;
    }

    //Générer un mot de passe aléatoire
    public static function generer_password($length = 6)
    {
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $charactersLength = strlen($characters);
        $randomString = '';
        for ($i = 0; $i < $length; $i++) {
            $randomString .= $characters[rand(0, $charactersLength - 1)];
        }
        return $randomString;
    }

    //Donne le format de la devise TTC
    public static function donneFormatDevise()
    {
        $retour = ' F TTC';
        return $retour;
    }

    //Donne le format de la devise Ht
    public static function donneFormatDeviseHt()
    {
        $retour = ' F HT';
        return $retour;
    }

    //Donne le format de la devise simple
    public static function donneFormatDeviseSimple()
    {
        $retour = ' F';
        return $retour;
    }

    //Formater le prix
    public static function formatPrixToMonetaire($nbre, $arrondir = false, $avecDevise = false)
    {
        //Ajouté pour arrondir le montant
        if ($arrondir == true) {
            $nbre = Outil::enleveEspaces($nbre);
            $nbre = round($nbre);
        }
        $rslt = "";
        $position = strpos($nbre, '.');
        if ($position === false) {
            //---C'est un entier---//
            //Cas 1 000 000 000 Ã  9 999 000
            if (strlen($nbre) >= 9) {
                $c = substr($nbre, -3, 3);
                $b = substr($nbre, -6, 3);
                $d = substr($nbre, -9, 3);
                $a = substr($nbre, 0, strlen($nbre) - 9);
                $rslt = $a . ' ' . $d . ' ' . $b . ' ' . $c;
            } //Cas 100 000 000 Ã  9 999 000
            elseif (strlen($nbre) >= 7 && strlen($nbre) < 9) {
                $c = substr($nbre, -3, 3);
                $b = substr($nbre, -6, 3);
                $a = substr($nbre, 0, strlen($nbre) - 6);
                $rslt = $a . ' ' . $b . ' ' . $c;
            } //Cas 100 000 Ã  999 000
            elseif (strlen($nbre) >= 6 && strlen($nbre) < 7) {
                $a = substr($nbre, 0, 3);
                $b = substr($nbre, 3);
                $rslt = $a . ' ' . $b;
                //Cas 0 Ã  99 000
            } elseif (strlen($nbre) < 6) {
                if (strlen($nbre) > 3) {
                    $a = substr($nbre, 0, strlen($nbre) - 3);
                    $b = substr($nbre, -3, 3);
                    $rslt = $a . ' ' . $b;
                } else {
                    $rslt = $nbre;
                }
            }
        } else {
            //---C'est un décimal---//
            $partieEntiere = substr($nbre, 0, $position);
            $partieDecimale = substr($nbre, $position, strlen($nbre));
            //Cas 1 000 000 000 Ã  9 999 000
            if (strlen($partieEntiere) >= 9) {
                $c = substr($partieEntiere, -3, 3);
                $b = substr($partieEntiere, -6, 3);
                $d = substr($partieEntiere, -9, 3);
                $a = substr($partieEntiere, 0, strlen($partieEntiere) - 9);
                $rslt = $a . ' ' . $d . ' ' . $b . ' ' . $c;
            } //Cas 100 000 000 Ã  9 999 000
            elseif (strlen($partieEntiere) >= 7 && strlen($partieEntiere) < 9) {
                $c = substr($partieEntiere, -3, 3);
                $b = substr($partieEntiere, -6, 3);
                $a = substr($partieEntiere, 0, strlen($partieEntiere) - 6);
                $rslt = $a . ' ' . $b . ' ' . $c;
            } //Cas 100 000 Ã  999 000
            elseif (strlen($partieEntiere) >= 6 && strlen($partieEntiere) < 7) {
                $a = substr($partieEntiere, 0, 3);
                $b = substr($partieEntiere, 3);
                $rslt = $a . ' ' . $b;
                //Cas 0 Ã  99 000
            } elseif (strlen($partieEntiere) < 6) {
                if (strlen($partieEntiere) > 3) {
                    $a = substr($partieEntiere, 0, strlen($partieEntiere) - 3);
                    $b = substr($partieEntiere, -3, 3);
                    $rslt = $a . ' ' . $b;
                } else {
                    $rslt = $partieEntiere;
                }
            }
            if ($partieDecimale == '.0' || $partieDecimale == '.00' || $partieDecimale == '.000') {
                $partieDecimale = '';
            }
            $rslt = $rslt . '' . $partieDecimale;
        }
        if ($avecDevise == true) {
            $formatDevise = Outil::donneFormatDevise();
            $rslt = $rslt . '' . $formatDevise;
        }
        return $rslt;
    }

    public static function montantEnLettres($montant)
    {
        $retour = '';
        $partieEntiere = $montant;
        $partieDecimale = 0;
        $position = strpos($montant, '.');

        $formatter = \NumberFormatter::create('fr_FR', \NumberFormatter::SPELLOUT);
        $formatter->setAttribute(\NumberFormatter::FRACTION_DIGITS, 0);
        $formatter->setAttribute(\NumberFormatter::ROUNDING_MODE, \NumberFormatter::ROUND_HALFUP);

        if ($position == false) {
            //---C'est un entier---//
            $retour = $formatter->format($partieEntiere);
        } else {
            //---C'est un décimal---//
            $partieEntiere = (int)substr($montant, 0, $position);
            $partieDecimale = (int)substr($montant, $position + 1, strlen($montant));
            //Mis ici pour ne pas qu'il prenne les point 0 (.0)
            $partieDecimaleParsei = (int)$partieDecimale;
            if ($partieDecimaleParsei > 0) {
                $retour = $formatter->format($partieEntiere) . ' point ' . $formatter->format($partieDecimale);
            } else {
                $retour = $formatter->format($partieEntiere);
            }
        }

        return $retour;
    }

    //Formater la date avec tiret (tags: formatDate, convertirDate, dateFr)
    public static function resolveAllDateCompletFR($date, $getHour = true)
    {
        $date_at = $date;
        if ($date_at !== null) {
            $date_at = $date_at;
            $date_at = date_create($date_at);

            return $getHour ? date_format($date_at, "d-m-Y H:i:s") : date_format($date_at, "d-m-Y");
        } else {
            return null;
        }
    }

    //Formater la date avec slash (tags: formatDate, convertirDate, dateFr)
    public static function resolveAllDateCompletFRSlash($date, $getHour = true)
    {
        $date_at = $date;
        if ($date_at !== null) {
            $date_at = $date_at;
            $date_at = date_create($date_at);

            return $getHour ? date_format($date_at, "d/m/Y H:i:s") : date_format($date_at, "d-m-Y");
        } else {
            return null;
        }
    }

    public static function donnePrixVente($produit_id, $clientOrTypePrixVente = null, $retourNombre = false, $avecDevise = false, $formater = false, $typePrix = 0, $prixBrut = false)
    {
        /*
        typePrix = 0 ==> le prix par défaut qui doit etre retourné
        typePrix = 1 ==> forcer le retour du prix sans promo
        typePrix = 2 ==> forcer le retour du prix avec promo
        */
        $mess_par_defaut = Outil::textPourSansPrix();
        $retour = $mess_par_defaut;
        if (isset($produit_id)) {
            $produit = Produit::find($produit_id);
            if (isset($produit)) {
                if ($produit->prix_visible == 1) {
                    //Le prix est affichable
                    if (isset($clientOrTypePrixVente)) {
                        if (is_numeric($clientOrTypePrixVente)) {
                            //C'est le type prix de vente qui est passé en paramètre PAS le client
                            $type_prix_vente_id = $clientOrTypePrixVente;
                        } else {
                            //C'est le client qui est passé en paramètre PAS le type prix de vente
                            if (isset($clientOrTypePrixVente->type_prix_vente_id)) {
                                $type_prix_vente_id = $clientOrTypePrixVente->type_prix_vente_id;
                            }
                            if (isset($clientOrTypePrixVente->remise)) {
                                $remise = $clientOrTypePrixVente->remise;
                            }
                            if (isset($clientOrTypePrixVente->avec_tva)) {
                                $avec_tva = $clientOrTypePrixVente->avec_tva;
                            }
                        }
                    } else {
                        //Remise par défaut
                        $remiseParDefaut = Preference::where('designation', 'remise-par-defaut')->first();
                        if (isset($remiseParDefaut)) {
                            if (is_numeric($remiseParDefaut->valeur)) {
                                $remise = $remiseParDefaut->valeur;
                            }
                        }
                    }

                    if (empty($type_prix_vente_id)) {
                        //Pas de PV ==> On prend par défaut le PV du site
                        $pvSite = Preference::where('designation', 'pv-site')->first();
                        if (isset($pvSite)) {
                            $type_prix_vente_id = $pvSite->valeur;
                        }
                    }

                    $typePrixDeVente = TypePrixDeVente::find($type_prix_vente_id);
                    if (isset($typePrixDeVente)) {
                        //Le PV existe
                        $prixVente = PrixVente::where('type_prix_vente_id', $typePrixDeVente->id)->where('produit_id', $produit->id)->first();
                        if (isset($prixVente)) {
                            //Le prix est défini
                            if ($typePrix == 1) {
                                $retour = $prixVente->prix;
                            } else if ($typePrix == 2) {
                                $retour = $prixVente->prix_promo;
                            } else {
                                if ($produit->en_promo == 1) {
                                    //C'est en promo
                                    if ($prixVente->prix_promo > 0) {
                                        $retour = $prixVente->prix_promo;
                                    }
                                } else {
                                    //C'est pas en promo
                                    if ($prixVente->prix > 0) {
                                        $retour = $prixVente->prix;
                                    }
                                }
                            }

                            //Positionné ici au cas ou prix promo = 0
                            if ($retour <= 0 && $typePrix != 2) {
                                if ($prixVente->prix > 0) {
                                    $retour = $prixVente->prix;
                                } else {
                                    $retour = 0;
                                }
                            }
                        }
                    }
                }
            }
        }
        if ($retourNombre == true) {
            if ($retour == $mess_par_defaut) {
                $retour = 0;
            }
        }
        if ($formater == true && is_numeric($retour)) {
            $retour = Outil::formatPrixToMonetaire($retour);
        }
        if ($avecDevise == true && $retour != $mess_par_defaut) {
            $formatDevise = Outil::donneFormatDevise();
            $retour = $retour . '' . $formatDevise;
        }

        return $retour;
    }

    //Donne le texte de la TVA du client
    public static function donneTextTvaClient($client_id = null)
    {
        $retour = "ASSUJETTI";
        if (isset($client_id)) {
            $client = Client::find($client_id);
            if (isset($client)) {
                if ($client->avec_tva == 0) {
                    $retour = "EXO";
                }
            }
        }

        return $retour;
    }

    //Texte à afr2ar s'il n'y a pas de prix
    public static function textPourSansPrix()
    {
        $retour = "Consultez-nous";
        $preference = Preference::where('designation', 'text-sans-prix')->first();
        if (isset($preference)) {
            $retour = $preference->valeur;
        }
        return $retour;
    }

    //Controller si le client est bloqué ou pas
    public static function checkBlocageClient($bloque, $plafond, $dette)
    {
        $retour = 0;
        if (isset($bloque) && isset($plafond) && isset($dette)) {
            if ($bloque == 1) {
                //le client est bloqué manuellement
                $retour = 1;
            } else {
                if ($dette > $plafond) {
                    //Blocage automatique du client
                    $retour = 1;
                }
            }
        }

        return $retour;
    }

    //Fonction qui créée le matricule
    public static function faireMatricule($alias, $maxi, $inclureSeparation = null)
    {
        $separation = "";
        if (isset($inclureSeparation)) {
            $separation = "-";
        }
        $alias = $alias . '' . $separation;
        if ($maxi < 10) {
            $matri = $alias . '000' . $maxi;
        } elseif ($maxi < 100) {
            $matri = $alias . '00' . $maxi;
        } elseif ($maxi < 1000) {
            $matri = $alias . '0' . $maxi;
        } else {
            $matri = $alias . '' . $maxi;
        }
        return $matri;
    }

    //A remplacer dans toute l'apllication au fur à mesure
    public static function donneInfosAppli()
    {
        $retour = array(
            "host_sqlserv"              => "192.168.36.50",
            "username_sqlserv"          => "askiafield",
            "password_sqlserv"          => "DTUMzvYR",
        );

        return $retour;
    }

    public static function formaterHeure($heure)
    {
        $retour = intval($heure);
        if ($heure < 10) {
            $retour = '0' . $heure;
        }

        $retour = $retour . ':00';
        return $retour;
    }

    //Envoi les emails
    public static function envoiEmail($destinataire, $sujet, $texte, $page = 'maileur', $cc = null, $image = null, $piecesjointes = null, $donnees = null)
    {

        //return true;
        try {
            if (isset($cc)) {
                Mail::to($destinataire)
                    ->cc($cc)
                    ->send(new Maileur($sujet, $texte, $page, $image, $piecesjointes, $donnees));
                return true;
            } else {
                Mail::to($destinataire)
                    ->send(new Maileur($sujet, $texte, $page, $image, $piecesjointes, $donnees));
                return true;
            }
        } catch (\Exception $e) {
            //dd($e); //Pour voir l'erreur précis
            $errorArray = array("type" => "notification", "designation" => "Outil->envoiEmail->Erreur lors du traitement", "erreur" => $e);
            Outil::saveError($errorArray);
        }
    }

    public static function sendNotificationSiretiseur($codif_relecteur, $objet = null, $template, $force_send = false)
    {

        //==dd($codif_relecteur->codification_id);
        try {
            if ($codif_relecteur->notifie != 0 || $force_send == true) {

                $codif = Codification::find($codif_relecteur->codification_id);
                $relecteur = Relecteur::find($codif_relecteur->relecteur_id);
                $etude = Etude::find($codif->etude_id);
                $type = "R2a";

                $cc = ["libasse.diop@lavoixduclient.fr"];
                $donnees = array(
                    "nom" => $relecteur->nom_complet,
                    "type" => $type,
                    "etude" => $etude->nom_etude . " " . $etude->numero_etude,
                    "designation" => $codif->designation_codification,
                    "traites" => $codif_relecteur->nbre_traite,
                    "nombre_lignes" => $codif_relecteur->nbre_entreprise,
                    "date_restitution" => date("d - m - Y", strtotime($codif->date_restrict_codification)),
                );
                if (empty($objet)) {
                    $objet =  "Nouvelle plannification de " . $type;
                }
                $texte = new HtmlString("");
                if (empty($template)) {
                    $template = 'notification-relecteur';
                }

                $envoiEmail = Outil::envoiEmail($relecteur->email, $objet, $texte, $template, $cc, null, null, $donnees);
                if ($template == "tache-terminee-relecteur") {
                    $codif_relecteur->notif_termine = 1;
                    $codif_relecteur->save();
                }
                if ($envoiEmail == true) {
                    $codif_relecteur->notifie = 1;
                    $codif_relecteur->save();
                }
            }
        } catch (Exception $e) {
            // En cas d'erreur, on afr2a un message et on arrête tout
            die('Erreur : ' . $e->getMessage());
        }
    }
    public static function sendNotificationSupervisuers($codif, $objet = null, $template, $infos)
    {

        //dd($codif_relecteur->codification_id);
        try {


            $etude = Etude::find($codif->etude_id);
            $type = "R2a";

            $cc = array();

            $donnees = array(
                "type"               => $type,
                "etude"              => $etude->nom_etude . " " . $etude->numero_etude,
                "designation"        => $codif->designation_codification,
                "nombre_lignes"      => $codif->nbre_ligne,
                "nombre_entreprises" => $codif->nbre_entreprise,
                "new_lines"          => $infos["new_lines"],
                "nbre_entreprise"    => $infos["nbre_entreprise"],
                "date_restitution"   => date("d - m - Y", strtotime($codif->date_restrict_codification)),
            );

            if (empty($objet)) {
                $objet =  "Nouvelle plannification de " . $type;
            }
            $texte = new HtmlString("");
            if (empty($template)) {
                $template = 'notification-relecteur';
            }
            $preference = Preference::first();
            $emails = explode(";", $preference->emails_a_notifier);
            $cpt = 1;
            foreach ($emails as $one) {
                if ($cpt == 1) {
                    if (!empty($one)) {
                        $destinataire = trim($one);
                    }
                } else {
                    if (!empty($one)) {
                        array_push($cc, trim($one));
                    }
                }
                $cpt++;
            }

            $envoiEmail = Outil::envoiEmail($destinataire, $objet, $texte, $template, $cc, null, null, $donnees);
        } catch (Exception $e) {
            // En cas d'erreur, on afr2a un message et on arrête tout
            die('Erreur : ' . $e->getMessage());
        }
    }
    public static function sendNotificationPlanDeCode($plan_code, $est_modification)
    {

        try {



            $objet =   "Un nouveau plan de code vient d'être rajouté ";
            $template = 'notification-plancode';

            if ($est_modification == true) {
                $objet =  "Le plan de code " . $plan_code->designation . " a été mis à jour.";
            }
            $texte = new HtmlString("");
            $cc = array();
            $donnees = array(
                "plan_code"         => $plan_code,
                "current_user"      => Auth::user(),
                "est_modification"  => $est_modification,
                "objet"             => $objet
            );
            $preference = Preference::first();
            $emails = explode(";", $preference->emails_a_notifier);
            $cpt = 1;
            foreach ($emails as $one) {
                if ($cpt == 1) {
                    if (!empty($one)) {
                        $destinataire = trim($one);
                    }
                } else {
                    if (!empty($one)) {
                        array_push($cc, trim($one));
                    }
                }
                $cpt++;
            }
            $relecteurs = Relecteur::get();
            foreach ($relecteurs as $key => $item) {
                //array_push($cc, trim($item->email));
            }


            $envoiEmail = Outil::envoiEmail($destinataire, $objet, $texte, $template, $cc, null, null, $donnees);
        } catch (Exception $e) {
            // En cas d'erreur, on afr2a un message et on arrête tout
            die('Erreur : ' . $e->getMessage());
        }
    }
    public static function sendNotificationReassigner($codif, $notifications)
    {
        $codif_relecteurs = CodificationRelecteur::where('codification_id', $codif->id)->get();
        $type = "R2a";
        $objet = "Un nouveau dispatching a été fait sur la " . strtolower($type) . " " . $codif->desiganation;
        foreach ($codif_relecteurs as $codif_relecteur) {
            if (in_array($codif_relecteur->id, $notifications)) {
                Outil::sendNotificationSiretiseur($codif_relecteur, $objet, 'reassign-relecteur', true);
            }
        }
    }
    public static function dispatch_when_creating($codification_id, $data)
    {
        $codif_relecteurs = CodificationRelecteur::where('codification_id', $codification_id)->get();
        if (isset($data[0]['Nbre_ligne'])) {
            $total_lignes = $data[0]['Nbre_ligne'];
        }
        $taux = 100;
        $nbre_relect = count($codif_relecteurs);
        $start           = 0;
        $end             = 0;
        if (!empty($total_lignes)) {
            foreach ($codif_relecteurs as $key => $oneItem) {
                if ($key == $nbre_relect + 1) {
                    $pourcentage = $taux;
                    $valeur = $total_lignes;
                    $oneItem->nbre_ligne = $valeur;
                    $start = $key;
                    $end   = $oneItem->nbre_ligne;
                } else {
                    $pourcentage = (int) (100 / $nbre_relect);

                    $valeur = round($total_lignes * $pourcentage * 0.01);
                    $oneItem->nbre_ligne =  $valeur;
                    $start += $end;
                    $end    = $start + $oneItem->nbre_ligne;
                }

                $taux           -= $pourcentage;
                $total_lignes    -= $oneItem->nbre_ligne;



                $oneItem->pourcentage               = $pourcentage;
                $oneItem->pourcentage_verbatims     = $pourcentage;
                $part_relecteur_donnnes             = Outil::getPartDataForRelecteurs($codification_id, $start, $end);
                $nbre_lignes                     = Outil::getNombreSiretiser($part_relecteur_donnnes);

                $oneItem->donnees                   = array_values($part_relecteur_donnnes);
                $oneItem->nbre_ligne             =  $nbre_lignes;
                $oneItem->save();
            }
        }
        return true;
    }
    public static function sendNotificationTaskDone($codif_relecteur)
    {
        $codif      = $codif_relecteur->codification;
        $releteur   = $codif_relecteur->relecteur;
        $type = "R2a";
        $objet = "Good !!! Tache de " . strtolower($type) . " terminée";
        //Outil::sendNotificationSiretiseur($codif_relecteur, $objet, 'tache-terminee-relecteur', true);
        $objet_sup = $releteur->nom_complet . " a terminé sa tâche de " . strtolower($type);

        Outil::sendNotificationSupervisuersTaskDone($codif_relecteur, $objet_sup, 'tache-terminee-superviseur');
    }
    public static function sendNotificationSupervisuersTaskDone($codif_relecteur, $objet = null, $template)
    {

        //dd($codif_relecteur->codification_id);
        try {

            $codif      = $codif_relecteur->codification;
            $relecteur  = $codif_relecteur->relecteur;
            $etude      = Etude::find($codif->etude_id);
            $type       = "R2a";

            $cc = array();
            $donnees = array(
                "nom"               => $relecteur->nom_complet,
                "type"              => $type,
                "etude"             => $etude->nom_etude . " " . $etude->numero_etude,
                "designation"       => $codif->designation_codification,
                "traites"           => $codif_relecteur->nbre_traite,
                "nombre_lignes"  => $codif_relecteur->nbre_ligne,
                "date_restitution"  => date("d - m - Y", strtotime($codif->date_restrict_codification)),
            );

            $texte = new HtmlString("");

            $preference = Preference::first();
            $emails = explode(";", $preference->emails_a_notifier);
            $cpt = 1;
            foreach ($emails as $one) {
                if ($cpt == 1) {
                    if (!empty($one)) {
                        $destinataire = trim($one);
                    }
                } else {
                    if (!empty($one)) {
                        array_push($cc, trim($one));
                    }
                }
                $cpt++;
            }

            $envoiEmail = Outil::envoiEmail($destinataire, $objet, $texte, $template, $cc, null, null, $donnees);
        } catch (Exception $e) {
            // En cas d'erreur, on afr2a un message et on arrête tout
            die('Erreur : ' . $e->getMessage());
        }
    }
    public static function sendNotificationNewData($codif, $codif_relecteur, $nbre_lignes_ajoutes)
    {

        if ($nbre_lignes_ajoutes > 0) {
            try {
                $type = "R2a";

                $objet = $nbre_lignes_ajoutes . " lignes supplémentaires vous ont été attribué pour la  " . strtolower($type) . " " . $codif->desiganation;
                Outil::sendNotificationSiretiseur($codif_relecteur, $objet, 'new-data-relecteur', true);
            } catch (Exception $e) {
                // En cas d'erreur, on afr2a un message et on arrête tout
                dd($e);
                die('Erreur : ' . $e->getMessage());
            }
        }
    }

    public static function sendNotificationSupervisuersCommentaires($donnees)
    {

        try {

            // $codif      = $codif_relecteur->codification;
            // $relecteur  = $codif_relecteur->relecteur;
            // $etude      = Etude::find($codif->etude_id);
            // $type       = "Codification";
            // if($codif->est_codification == 0){
            //     $type = "R2a";
            // }
            $cc = array();
            // $donnees = array(
            //     "nom"               => $relecteur->nom_complet,
            //     "type"              => $type, 
            //     "etude"             => $etude->nom_etude." ".$etude->numero_etude,
            //     "designation"       => $codif->designation_codification, 
            //     "traites"           => $codif_relecteur->nbre_traite, 
            //     "nombre_verbatims"  => $codif_relecteur->nbre_verbatim, 
            //     "date_restitution"  => date("d - m - Y", strtotime($codif->date_restrict_codification)), 
            // );

            $texte = new HtmlString("");

            $preference = Preference::first();
            $emails = explode(";", $preference->emails_a_notifier);
            $cpt = 1;

            foreach ($emails as $one) {
                if ($cpt == 1) {
                    if (!empty($one)) {
                        $destinataire = trim($one);
                    }
                } else {
                    if (!empty($one)) {
                        array_push($cc, trim($one));
                    }
                }
                $cpt++;
            }

            $objet    = "Commentaire verbatim";
            $template = "notification-commentaire";

            $envoiEmail = Outil::envoiEmail($destinataire, $objet, $texte, $template, $cc, null, null, $donnees);
        } catch (Exception $e) {
            // En cas d'erreur, on afr2a un message et on arrête tout
            die('Erreur : ' . $e->getMessage());
        }
    }

    public static function bdd()
    {
        try {
            $bdd = new PDO('mysql:host=151.80.174.132;dbname=indicateur', 'apipython', 'hrkyt*98572', array(PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION));
            $bdd->exec("set names utf8");
            return $bdd;
        } catch (Exception $e) {
            // En cas d'erreur, on afr2a un message et on arrête tout
            dd($e);
            die('Erreur : ' . $e->getMessage());
        }
    }

    //Donne les horaires disponibles pour le rendez-vous
    public static function donneHorairesDispos($date)
    {
        $retour = array();

        $preference = Preference::where('id', 1)->first();
        if (isset($preference)) {
            $nbre_rdv_horaire = $preference->nbre_rdv_horaire;

            $heure_debut = current(explode(":", $preference->heure_debut)); //Pour récupérer juste l'heure pas les minutes
            $heure_fin = current(explode(":", $preference->heure_fin)); //Pour récupérer l'heure pas les minutes
            $heure_debut = intval($heure_debut);
            $heure_fin = intval($heure_fin);

            $heure_debut_pause = current(explode(":", $preference->heure_debut_pause)); //Pour récupérer juste l'heure pas les minutes
            $heure_fin_pause = current(explode(":", $preference->heure_fin_pause)); //Pour récupérer l'heure pas les minutes
            $heure_debut_pause = intval($heure_debut_pause);
            $heure_fin_pause = intval($heure_fin_pause);

            for ($i = $heure_debut; $i < $heure_fin; $i++) {
                $debut = $i;
                $fin = $i + 1;
                $id_horaire = $debut . '' . $fin;
                if ($fin > $heure_debut_pause && $fin <= $heure_fin_pause) {
                    //On est dans la pause (on fait rien)
                } else {
                    $debut = Outil::formaterHeure($debut);
                    $fin = Outil::formaterHeure($fin);
                    $nbreTrouve = Rv::where('date', $date)->where('heure_debut', $debut)->where('heure_fin', $fin)->count();
                    if ($nbreTrouve < $nbre_rdv_horaire) {
                        //Cette plage horaire est disponible
                        $plage_horaire = $debut . " - " . $fin;
                        array_push($retour, array("heure_debut" => $debut, "heure_fin" => $fin, "plage_horaire" => $plage_horaire, "id_horaire" => $id_horaire));
                    }
                }
            }
        }

        return $retour;
    }

    //Inregistre les notifications
    public static function saveNotification($type, $codeElement = null)
    {
        $designation = "";
        $description = "";
        $date_notif = date('Y-m-d');
        $image = "assets/images/notif.png";
        $lien = "";
        $deja_vu = 0;

        $codeElementRetour = "";
        if (isset($codeElement)) {
            $codeElementRetour = $codeElement;
        }

        if ($type == "inscription") {
            $designation = "Nouvelle inscription  d'un client " . $codeElementRetour;
            $lien = "list-client";
        } else if ($type == "proforma") {
            $designation = "Une nouvelle proforma " . $codeElementRetour . " a été créée";
            $lien = "list-proforma";
        } else if ($type == "commande") {
            $designation = "Une nouvelle commande " . $codeElementRetour . " a été créée";
            $lien = "list-commande";
        }

        $item = new Notification();
        $item->designation = $designation;
        $item->description = $description;
        $item->date_notif = $date_notif;
        $item->image = $image;
        $item->lien = $lien;
        $item->deja_vu = $deja_vu;
        $item->save();

        $id = $item->id;
        return $id;
    }

    //Message synchronisation terminée
    public static function msgSyncTerminee()
    {
        $retour = "Synchronisation terminée";
        return $retour;
    }

    //Convertir base 64 en image
    public static function base64ToImage($b64, $queryName, $code = null)
    {
        // Obtain the original content (usually binary data)
        $bin = base64_decode($b64);

        // Load GD resource from binary data
        $im = imageCreateFromString($bin);

        if (!$im) {
            die('Base64 value is not a valid image');
        }

        // Specify the location where you want to save the image
        $dateHeure = date('Y_m_d_H_i_s');
        if (empty($code)) {
            $code = "";
        }
        $img_file = config('view.uploads')[$queryName] . "/produit_" . $code . "_" . $dateHeure . ".png";
        $img_file = strtolower($img_file);

        // Save the GD resource as PNG in the best possible quality (no compression)
        // This will strip any metadata or invalid contents (including, the PHP backdoor)
        // To block any possible exploits, consider increasing the compression level
        $retour = imagepng($im, $img_file, 0);
        if ($retour == 1 || $retour == true) {
            $retour = $img_file;
        } else {
            $retour = 'assets/images/default.png';
        }

        return $retour;
    }

    //ENvoir sur le front pour déconnecter le client
    public static function retourPourDeconnecterClient()
    {
        $retour = array(
            "dataone" => null,
            "deconnect" => "Votre session n'est plus valide",
        );
        return $retour;
    }

    public static function donneTypeTvaClient($client_id = null)
    {
        $avec_tva = 1;
        if (isset($client_id)) {
            $item = Client::find($client_id);
            if (isset($item)) {
                $avec_tva = $item->avec_tva;
            }
        }
        return $avec_tva;
    }

    public static function calculTotalTtc($totalHt)
    {
        $tva = 18;
        $retour = $totalHt * (1 + ($tva / 100));
        $retour = round($retour);
        return $retour;
    }

    public static function calculTotalSansTva($totalTtc)
    {
        $tva = 18;
        $totalHt = 0;
        $diviseur = 1 + ($tva / 100);
        if ($diviseur > 0) {
            $totalHt = $totalTtc / $diviseur;
        }
        $retour = round($totalHt);
        return $retour;
    }

    //Donne le prix HT avec vérification si le client est exonoré de TVA ou pas
    public static function calculTotalHt($from = "produit", $totalTtc, $itemId, $avecFromatageEtDevise = true)
    {
        //$avec_tva = Outil::donneTypeTvaClientNew($from, $itemId);
        $avec_tva = 1;

        if ($avec_tva == 0) {
            $retour = $totalTtc;
        } else {
            $retour = Outil::calculTotalSansTva($totalTtc);
        }

        if ($avecFromatageEtDevise == true) {
            $retour = Outil::formatPrixToMonetaire($retour, false, false);
            $formatDevise = Outil::donneFormatDeviseHt();
            $retour = $retour . '' . $formatDevise;
        }

        return $retour;
    }

    public static function calculTotalTva($totalTtc, $totalHt)
    {
        $totalTva = $totalTtc - $totalHt;
        $retour = round($totalTva);
        return $retour;
    }

    //Total avec montant livraison
    public static function calculTotalGlobal($totalTtc, $zone_livraison_prix)
    {
        $retour = $totalTtc + $zone_livraison_prix;
        return $retour;
    }

    public static function calculTauxDeMarque($produit_id)
    {
        $retour = 0;
        $produit = Produit::find($produit_id);
        if (isset($produit)) {
            $pv = Outil::donnePrixParDefaut("vente", $produit->id);
            $pr = $produit->prix_de_revient_unitaire_off;
            if ($pv > 0) {
                $retour = (($pv - $pr) / $pv) * 100;
            }
        }
        $retour = round($retour);
        return $retour;
    }

    public static function verifierEmail($val)
    {
        //Mettre d'abord en miniscule pour tester     
        $val = strtolower($val);
        $the_regex = "^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,3})$^";
        $retourTest = preg_match($the_regex, $val);
        if (!$retourTest) {
            $retour = false;
        } else {
            $retour = true;
        }
        return $retour;
    }

    public static function verifierTelephone($val, $testFormat = false)
    {
        $retour = true;
        if (strlen($val) > 20) {
            $retour = false;
        }
        if ($testFormat == true) {
            $the_regex = "/^[0-9]{2}-[0-9]{2}-[0-9]{2}-[0-9]{2}$/";
            $retourTest = preg_match($the_regex, $val);
            if (!$retourTest) {
                $retour = false;
            } else {
                $retour = true;
            }
        }

        return $retour;
    }

    //Générer un mot de passe aléatoire ou un token
    public static function generer_password_token($length = 6)
    {
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $charactersLength = strlen($characters);
        $randomString = '';
        for ($i = 0; $i < $length; $i++) {
            $randomString .= $characters[rand(0, $charactersLength - 1)];
        }
        return $randomString;
    }

    //Exécution des taches planifiées
    public static function executerCron($type)
    {
        //Important = Le cron prend l'heure de Paris
        try {
            $retour = false;
            $dateToday = date('Y-m-d');
            $debut = date('Y-m-d H:i:s');

            $retourData = Outil::getAllItemsWithGraphQl("requetes", 'type:"' . $type . '"');
            $cron = new Cron();
            $cron->date = $dateToday;
            $cron->type = $type;
            $cron->debut = $debut;
            $cron->fin = date('Y-m-d H:i:s');
            $cron->save();

            return $retour;
        } catch (\Exception $e) {
            //dd($e); //Pour voir l'erreur précis
            $errorArray = array("type" => "fonction", "designation" => "Outil->executerCron->Erreur lors du chargement", "erreur" => $e);
            Outil::saveError($errorArray);
        }
    }

    //Récupéper les données d'exportreponses de Oython
    public static function getDataR2asFromAPIPython($params, $url = "http://localhost:5005/api/v1/relecture/")
    {
        // $url = 'http://localhost:5000/api/v1/espaceptd/';
        $method = 'POST';

        if (function_exists('curl_version')) {
            try {
                $curl = curl_init();
                if ($method == 'POST') {
                    $postfield = '';
                    foreach ($params as $index => $value) {
                        $postfield .= $index . '=' . $value . "&";
                    }
                    $postfield = substr($postfield, 0, -1);
                } else {
                    $postfield = null;
                }
                curl_setopt_array($curl, array(
                    CURLOPT_URL => $url,
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_ENCODING => "",
                    CURLOPT_MAXREDIRS => 10,
                    CURLOPT_TIMEOUT => 45,
                    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                    CURLOPT_CUSTOMREQUEST => $method,
                    CURLOPT_POSTFIELDS => $postfield,
                    CURLOPT_HTTPHEADER => array(
                        "cache-control: no-cache",
                        "content-type: application/x-www-form-urlencoded",
                    ),
                ));
                $response = curl_exec($curl);
                $err = curl_error($curl);
                curl_close($curl);

                if ($err) {
                    throw new \Exception("Error :" . $err);
                } else {
                    return $response;
                }
            } catch (\Exception $e) {
                throw new \Exception($e);
            }
        } else if (ini_get('allow_url_fopen')) {
            try {
                // Build Http query using params
                $query = http_build_query($params);
                // Create Http context details
                $options = array(
                    'http' => array(
                        'header' => "Content-Type: application/x-www-form-urlencoded\r\n" .
                            "Content-Length: " . strlen($query) . "\r\n" .
                            "User-Agent:MyAgent/1.0\r\n",
                        'method' => "POST",
                        'content' => $query,
                    ),
                );
                // Create context resource for our request
                $context = stream_context_create($options);
                // Read page rendered as result of your POST request
                $result = file_get_contents(
                    $url, // page url
                    false,
                    $context
                );
                return trim($result);
            } catch (\Exception $e) {
                throw new \Exception($e);
            }
        } else {
            throw new \Exception("Vous devez activer curl ou allow_url_fopen pour utiliser ce lien");
        }
    }
}
