<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Api\SuggestionRequest;
use App\Services\SuggestionService;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class SuggestionController extends ApiController
{
    public function __construct(protected SuggestionService $suggestionService)
    {
        $this->service = $suggestionService;
    }

    #[OA\Post(
        path: '/api/suggestions',
        description: 'Send a suggestion from the website. No account needed, rate limited per visitor. It is '
            .'never published as is: an admin reviews it first.',
        summary: 'suggest a place, coach, team or event',
        tags: ['Suggestion'],
    )]
    #[OA\RequestBody(
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(ref: '#/components/schemas/SuggestionStoreFormRequest')
        )
    )]
    #[OA\Response(
        response: 201,
        description: 'The suggestion was received',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(properties: [
                new OA\Property(property: 'success', type: 'boolean', example: true),
                new OA\Property(property: 'message', type: 'string', example: 'شكراً لك! سنراجع اقتراحك قبل النشر.'),
                new OA\Property(property: 'data', properties: [new OA\Property(property: 'id', type: 'integer', example: 12)], type: 'object'),
            ])
        )
    )]
    #[OA\Response(response: 422, description: 'Validation failed')]
    #[OA\Response(response: 429, description: 'Too many suggestions from this visitor')]
    public function store(SuggestionRequest $request): JsonResponse
    {
        $suggestion = $this->suggestionService->submit($request->validated(), $request->ip());

        // Only the id goes back: the visitor has no business reading the review fields.
        return $this->successResponse(['id' => $suggestion->id], 201, __('messages.suggestion_received'));
    }
}
