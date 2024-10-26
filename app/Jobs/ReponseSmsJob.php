<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Http\Request;
use App\{Outil, Destinataire, ExtractSfr, Test, Question, HistoriqueDmc};

class ReponseSmsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     *
     * @return void
     */

    private $request;


    public function __construct(array $input)
    {
        $this->request = $input;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $retour = "KO";

        try
        {
            $continuer = 0;
            $retour = "KO";
            $dateTimeToday = date('Y-m-d H:i:s');

            //Test si la structure est bonne
            $reponse = $this->request;
            if(isset($reponse))
            {
                if(isset($reponse["status_report"]))
                {
                    if(isset($reponse["status_report"]["sms"]))
                    {
                        $reponse = $reponse["status_report"]["sms"];
                        if(isset($reponse))
                        {
                            if(isset($reponse[0]))
                            {
                                if(isset($reponse[0]["status"]))
                                {
                                    if($reponse[0]["status"] == "ANSWERED")
                                    {
                                        $continuer = 1;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            
            //dd($reponse);
            if(isset($reponse))
            {
                if(isset($reponse[0]))
                {
                    if(isset($reponse[0]["status"]))
                    {
                        if($reponse[0]["status"] == "ANSWERED")
                        {
                            $continuer = 1;
                        }
                    }
                }
            }

            if($continuer == 1)
            {
                //dd("yes");
                //Enregistrement structure
                //$structure = $request->getContent();
                $structure = json_encode($this->request);  
                $historiqueDmc = new HistoriqueDmc();
                $historiqueDmc->designation = "DMC contacte notre API";
                $historiqueDmc->valeur = $structure;
                $historiqueDmc->save();

                if(is_array($reponse))
                {
                    //Le format de la reponse est bonne
                    $errors = null;

                    if(!isset($reponse[0]))
                    {
                        $errors = "La réponse est vide";
                    }
                    else
                    {
                        $reponse = $reponse[0];
                    }

                    if(!isset($errors) && !isset($reponse["ref_externe"]))
                    {
                        $errors = "La balise référence externe non définie";
                    }
                    if(!isset($errors) && !isset($reponse["status"]))
                    {
                        $errors = "La balise status n'est pas définie";
                    }
                    if(!isset($errors) && !isset($reponse["status_list"]))
                    {
                        $errors = "La balise status_list n'est pas définie";
                    }
                    if(!isset($errors) && !isset($reponse["status_list"][0]))
                    {
                        $errors = "La balise status_list est vide";
                    }
                    if(!isset($errors) && !isset($reponse["status_list"][0]["info"]))
                    {
                        $errors = "La balise info n'est pas définie";
                    }
                    if(!isset($errors) && $reponse["status"] == "ERROR")
                    {
                        $errors = "Y'a une erreur envoyée par DMC avec comme code: ".$reponse["status"]["Code"]. " et comme message: ".$reponse["status"]["Info"];
                    }

                    if(isset($errors))
                    {
                        $errorArray = array("type" => "sms_rebond", "designation" => "ReponseSmsJob->Erreur sur les donnéees recues", "erreur" => $errors."\n".json_encode($reponse));
                        Outil::saveError($errorArray);
                    }
                    else
                    {
                        //Y'a pas d'erreurs on peut enregister
                        $parties = array();
                        $externalReference = $reponse["ref_externe"];
                        $status = $reponse["status"];
                        $callResponse = $reponse["status_list"][0]["info"];
                        $repondre = 1;
                        $questionToAnswer = null;
                        $item = null;
                        $colBdRef = null;
                        $colBdRep = null;

                        if($status == "ANSWERED")
                        {
                            //Test si la référence permet une réponse ou pas
                            if (strpos($externalReference, '_') !== false)
                            {
                                //Le code contient sous_tiret
                                $parties = explode("_", $externalReference);
                                if(isset($parties[1]))
                                {
                                    $repondre = $parties[1];
                                }
                                if(isset($parties[3]))
                                {
                                    $questionToAnswer = $parties[3];
                                }
                            }

                            if(isset($questionToAnswer))
                            {
                                //La référence contient la question à laquelle on a répondu
                                $repondre = 1;
                                $colBdRef = "ref_".$questionToAnswer;
                                $item = ExtractSfr::where($colBdRef, $externalReference)->first();
                                if(isset($item))
                                {
                                    $repondre == 1;
                                }
                            }
                            else
                            {
                                $repondre = 0;
                            }

                            
                            if($repondre == 1 && isset($item))
                            {
                                $colBdRep = "rep_".$questionToAnswer;
                                if(!isset($item->$colBdRep)) //Pas encore de réponse
                                {
                                    //On enregistre réponse
                                    $item->$colBdRep = $callResponse;

                                    if (strpos(strtolower($callResponse), "stop") !== false)
                                    {
                                        //La réponse contient stop ==> Arret des SMS
                                        $item->etat = 1;
                                    }

                                    $item->save();

                                    //On réactualise le item
                                    $item = ExtractSfr::where('id', $item->id)->first();

                                    //On appelle la fonction d'envoi
                                    $retourSendSms = Outil::sendNextSms($item);
                                    $retour = "OK";

                                    if($retourSendSms == "OK")
                                    {
                                        //Mettre l'état de l'historique à envoyé
                                        $historiqueDmc->etat = 1;
                                        $historiqueDmc->save();

                                    }
                                }
                            }
                        }
                    }
                }
                return $retour;
            }
        }
        catch (\Exception $e)
        {
            //dd($e); //Pour voir l'erreur précis
			$errorArray = array("type" => "sms_rebond", "designation" => "ReponseSmsJob->reponse_sms_dmc->Erreur lors du traitement", "erreur" => $e."\n".json_encode($reponse));
            Outil::saveError($errorArray);
            return "KO";
        }
        
        return $retour;
    }
}
