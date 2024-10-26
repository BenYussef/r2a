<?php

namespace App\Http\Controllers;

use App\Outil;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HomeController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Show the application script.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return view('home');
    }

    public function namepage($namepage)
    {
        return view('pages.' . $namepage);
    }
    public function page_libasse()
    {
        return view('pages.list-r2a');
    }
}
