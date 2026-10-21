<?php

namespace App\Http\Docs;

use Attribute;
use OpenApi\Attributes as OA;

#[OA\Parameter(
    name: 'direction',
    description: 'Specify sorting order.',
    in: 'query',
    required: false,
    schema: new OA\Schema(type: 'string', enum: ['asc', 'desc']),
    example: 'asc'
)]

#[OA\Parameter(
    name: 'page',
    description: 'Determine page number.',
    in: 'query',
    required: false,
    schema: new OA\Schema(type: 'integer'),
    example: 1
)]
#[OA\Parameter(
    name: 'limit',
    description: 'Determine number of items per page. Any value from 1 to 200 is '
        .'accepted (e.g. 10, 20, 50, 100, 200); a larger page is served at 200 rather than refused. Read the page you actually got back off `pagination.limit`.',
    in: 'query',
    required: false,
    schema: new OA\Schema(type: 'integer', minimum: 1, maximum: 200),
    example: 10
)]
#[OA\Parameter(
    name: 'x-locale',
    in: 'header',
    required: false,
    description: 'Content language. The public website is answered in Arabic while FEATURE_PUBLIC_EN_LOCALE is off, whatever this header says.',
    schema: new OA\Schema(type: 'string', enum: ['ar', 'en']),
    example: 'ar'
)]
#[Attribute(Attribute::TARGET_CLASS)]
class Parameters
{
    public function __construct() {}
}
