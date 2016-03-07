<?php

namespace AlcoholDelivery\Http\Controllers\Auth;

use AlcoholDelivery\Http\Controllers\Controller;

//use Illuminate\Foundation\Auth\ResetsPasswords;
use Sarav\Multiauth\Foundation\ResetsPasswords;

class PasswordController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Password Reset Controller
    |--------------------------------------------------------------------------
    |
    | This controller is responsible for handling password reset requests
    | and uses a simple trait to include this behavior. You're free to
    | explore this trait and override any methods you wish to tweak.
    |
    */

    use ResetsPasswords;

    /**
     * Create a new password controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->user = "user";
        $this->middleware('guest');
    }
}
