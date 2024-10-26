<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use Illuminate\Routing\Controller as BaseController;
use App\Http\Requests\MaileurRequest;
use Illuminate\Support\Facades\Mail;
use App\Mail\Maileur;

class MaileurController extends BaseController
{
    public function create()
    {
        return view('maileur');
    }

    public function store(Request $request)
    {
        Mail::to('skilah10@gmail.com')
            ->send(new Maileur($request->except('_token')));

        /* Mail::to('skilah10@gmail.com')
        ->queue(new Maileur($request->except('_token'))); */

        return view('confirm');
    }
}
