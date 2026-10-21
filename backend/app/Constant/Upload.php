<?php

namespace App\Constant;

class Upload
{
    /**
     * Largest image accepted on upload, in kilobytes (Laravel's `max` rule counts files in KB).
     * Uploads are resized and re-encoded afterwards, see FileSystemService.
     */
    public const MAX_IMAGE_KB = 2048;
}
