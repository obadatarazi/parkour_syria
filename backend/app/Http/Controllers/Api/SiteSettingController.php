<?php

namespace App\Http\Controllers\Api;

use App\Services\MultiTypeSettingService;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class SiteSettingController extends ApiController
{
    public function __construct(protected MultiTypeSettingService $multiTypeSettingService)
    {
    }

    #[OA\Get(
        path: '/api/site-settings',
        description: 'The settings the website reads (WhatsApp number and book message, social links, safety notices, '
            . 'site name), keyed by setting key. Only the keys allowlisted in config/site.php are ever returned, a '
            . 'listed key with no value yet is null.',
        summary: 'public site settings',
        tags: ['Site Settings'],
    )]
    #[OA\Response(
        response: 200,
        description: 'The public settings',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(properties: [
                new OA\Property(property: 'success', type: 'boolean', example: true),
                new OA\Property(
                    property: 'data',
                    properties: [
                        new OA\Property(property: 'site_name', type: 'string', example: 'باركور سوريا'),
                        new OA\Property(property: 'whatsapp_number', type: 'string', example: '963999000000'),
                        new OA\Property(property: 'whatsapp_book_message', type: 'string', example: 'مرحبا، أريد طلب كتاب الباركور'),
                        new OA\Property(property: 'facebook_url', type: 'string', nullable: true),
                        new OA\Property(property: 'instagram_url', type: 'string', nullable: true),
                        new OA\Property(property: 'email', type: 'string', example: 'info@parkoursyria.com'),
                        new OA\Property(property: 'safety_notice_short', type: 'string'),
                        new OA\Property(property: 'safety_notice_directory', type: 'string'),
                        new OA\Property(property: 'default_locale', type: 'string', example: 'ar'),
                    ],
                    type: 'object'
                ),
            ])
        )
    )]
    public function index(): JsonResponse
    {
        return $this->successResponse($this->multiTypeSettingService->publicSettings());
    }
}
