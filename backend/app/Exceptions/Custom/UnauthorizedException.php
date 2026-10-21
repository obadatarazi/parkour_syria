<?php

namespace App\Exceptions\Custom;

use Exception;

class UnauthorizedException extends Exception
{
    protected $details;

    public function __construct($message = 'JWT Token not found', $details = [], $code = 401)
    {
        parent::__construct($message, $code);
        $this->details = $details;
    }

    public function getDetails()
    {
        return $this->details;
    }

}
