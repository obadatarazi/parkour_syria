<?php

namespace App\Http\Controllers\Api;

use App\Enum\DirectoryEntryType;
use App\Enum\EventType;
use App\Enum\MultiTypeSettingEnum;
use App\Enum\SuggestionStatus;
use App\Enum\SuggestionType;
use App\Enum\UserGender;
use App\Enum\UserType;
use App\Models\Area;
use App\Models\BlogCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\App;
use OpenApi\Attributes as OA;

/**
 * Label/value lists for dropdowns, labelled in the request locale.
 */
#[OA\Schema(
    schema: 'OptionList',
    properties: [
        new OA\Property(property: 'success', type: 'boolean', example: true),
        new OA\Property(
            property: 'data',
            type: 'array',
            items: new OA\Items(properties: [
                new OA\Property(property: 'label', type: 'string', example: 'مكان'),
                new OA\Property(property: 'value', type: 'string', example: 'place'),
            ])
        ),
    ]
)]
class OptionController extends ApiController
{
    #[OA\Get(path: '/api/options/multi-type-settings/type', summary: 'setting value types', tags: ['Options'], parameters: [new OA\Parameter(ref: '#/components/parameters/x-locale')])]
    #[OA\Response(response: 200, description: 'Options', content: new OA\JsonContent(ref: '#/components/schemas/OptionList'))]
    public function getMultiTypeSettingType(): JsonResponse
    {
        return $this->successResponse(MultiTypeSettingEnum::getOptions(App::getLocale()));
    }

    #[OA\Get(path: '/api/options/users/gender', summary: 'user genders', tags: ['Options'], parameters: [new OA\Parameter(ref: '#/components/parameters/x-locale')])]
    #[OA\Response(response: 200, description: 'Options', content: new OA\JsonContent(ref: '#/components/schemas/OptionList'))]
    public function getGenderType(): JsonResponse
    {
        return $this->successResponse(UserGender::getOptions(App::getLocale()));
    }

    #[OA\Get(path: '/api/options/users/type', summary: 'user types', tags: ['Options'], parameters: [new OA\Parameter(ref: '#/components/parameters/x-locale')])]
    #[OA\Response(response: 200, description: 'Options', content: new OA\JsonContent(ref: '#/components/schemas/OptionList'))]
    public function getUserType(): JsonResponse
    {
        return $this->successResponse(UserType::getOptions(App::getLocale()));
    }

    #[OA\Get(path: '/api/options/directory-entries/type', summary: 'directory entry types', tags: ['Options'], parameters: [new OA\Parameter(ref: '#/components/parameters/x-locale')])]
    #[OA\Response(response: 200, description: 'Options', content: new OA\JsonContent(ref: '#/components/schemas/OptionList'))]
    public function getDirectoryEntryType(): JsonResponse
    {
        return $this->successResponse(DirectoryEntryType::getOptions(App::getLocale()));
    }

    #[OA\Get(path: '/api/options/events/type', summary: 'event types', tags: ['Options'], parameters: [new OA\Parameter(ref: '#/components/parameters/x-locale')])]
    #[OA\Response(response: 200, description: 'Options', content: new OA\JsonContent(ref: '#/components/schemas/OptionList'))]
    public function getEventType(): JsonResponse
    {
        return $this->successResponse(EventType::getOptions(App::getLocale()));
    }

    #[OA\Get(path: '/api/options/suggestions/type', summary: 'suggestion types', tags: ['Options'], parameters: [new OA\Parameter(ref: '#/components/parameters/x-locale')])]
    #[OA\Response(response: 200, description: 'Options', content: new OA\JsonContent(ref: '#/components/schemas/OptionList'))]
    public function getSuggestionType(): JsonResponse
    {
        return $this->successResponse(SuggestionType::getOptions(App::getLocale()));
    }

    #[OA\Get(path: '/api/options/suggestions/status', summary: 'suggestion statuses', tags: ['Options'], parameters: [new OA\Parameter(ref: '#/components/parameters/x-locale')])]
    #[OA\Response(response: 200, description: 'Options', content: new OA\JsonContent(ref: '#/components/schemas/OptionList'))]
    public function getSuggestionStatus(): JsonResponse
    {
        return $this->successResponse(SuggestionStatus::getOptions(App::getLocale()));
    }

    #[OA\Get(path: '/api/options/areas', summary: 'areas', tags: ['Options'], parameters: [new OA\Parameter(ref: '#/components/parameters/x-locale')])]
    #[OA\Response(response: 200, description: 'Options', content: new OA\JsonContent(ref: '#/components/schemas/OptionList'))]
    public function getAreas(): JsonResponse
    {
        return $this->successResponse(Area::getOptions(App::getLocale()));
    }

    #[OA\Get(path: '/api/options/blog-categories', summary: 'blog categories', tags: ['Options'], parameters: [new OA\Parameter(ref: '#/components/parameters/x-locale')])]
    #[OA\Response(response: 200, description: 'Options', content: new OA\JsonContent(ref: '#/components/schemas/OptionList'))]
    public function getBlogCategories(): JsonResponse
    {
        return $this->successResponse(BlogCategory::getOptions(App::getLocale()));
    }
}
