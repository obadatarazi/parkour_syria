<?php

namespace App\Exceptions\Custom;

use Exception;

class NotFoundException extends Exception
{
    protected $details;

    public function __construct($message = 'Resource Not Found', $details = [], $code = 404)
    {
        parent::__construct($message, $code);
        $this->details = $details;
    }

    public function getDetails()
    {
        return $this->details;
    }

}
