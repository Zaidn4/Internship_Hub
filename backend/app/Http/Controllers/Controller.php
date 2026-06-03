<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

abstract class Controller
{
    // AuthorizesRequests provides $this->authorize() and $this->authorizeResource()
    // which delegate to the Gate and registered Policies.
    use AuthorizesRequests;
}
