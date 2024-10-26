<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class Maileur extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    private  $sujet;
    private  $texte;
    private  $page;
    private  $image;
    private  $piecesjointes;
    private  $donnees;

    public function __construct($sujet, $texte, $page, $image, $piecesjointes, $donnees)
    {
        $this->sujet            = $sujet;
        $this->texte            = $texte;
        $this->page             = $page;
        $this->image            = $image;
        $this->piecesjointes    = $piecesjointes;
        $this->donnees          = $donnees;
    }

    /**
     * Build the message.
     *
     * @return $this
     */

    public function build()
    {
        /* return $this->from('monsite@chezmoi.com')
            ->view('emails.maileur'); */
        $sendEmail = $this->from('noreply@survey-lvdc.fr')
        ->subject($this->sujet)
        ->view('emails.'.$this->page ,array(
            'texte'     => $this->texte,
            'image'     => $this->image,
            'donnees'   => $this->donnees,
        ));

        //Test s'il y'a des pièces jointes
        if(!empty($this->piecesjointes))
        {
            foreach($this->piecesjointes as $one)
            {
                if(str_contains($this->sujet, "Nouvelle R2a"))
                {
                    $id_lvdc = $this->donnees['id_lvdc'];
                    $sendEmail->attachData($one->output(),"R2a-".$id_lvdc.".pdf",[
                        'mime' => 'application/pdf']);
                }
                else
                {
                    //one ==> doit contenir le lien absolu
                    $sendEmail->attach($one);
                }                
            }
        }

        return $sendEmail;
    }
}
