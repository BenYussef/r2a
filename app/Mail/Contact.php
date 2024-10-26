<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class Contact extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    private $codeClient;
    private $nomClient;

    public function __construct(Array $myArray)
    {
        $this->codeClient = 'fes';
        $this->nomClient = 'ddd';
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        /* return $this->from('monsite@chezmoi.com')
            ->view('emails.contact'); */

        return $this->from('noreply@dmd.com')
            ->subject("Demande d'accès")
            ->view('emails.contact', array(
                'codeClient' => $this->codeClient,
                'nomClient' => $this->nomClient,
            ));
    }
}
