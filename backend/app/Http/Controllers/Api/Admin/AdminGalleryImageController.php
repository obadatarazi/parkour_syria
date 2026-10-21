<?php

namespace App\Http\Controllers\Api\Admin;

use App\Constant\PermissionType;
use App\Http\Controllers\Api\ApiController;
use App\Http\QueryFilter\GalleryImageFilter;
use App\Http\Requests\Admin\BulkDeleteRequest;
use App\Http\Requests\Admin\GalleryImageRequest;
use App\Http\Resources\GalleryImageResource;
use App\Models\GalleryImage;
use App\Services\GalleryImageService;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminGalleryImageController extends ApiController
{
    public function __construct(protected GalleryImageService $galleryImageService)
    {
        $this->permissionPrefix = PermissionType::PermissionManageGalleryImage->getSection();
        $this->resource = GalleryImageResource::class;
        $this->service = $galleryImageService;
        parent::__construct();
    }

    #[OA\Get(
        path: '/api/admin/gallery-images',
        description: 'get all gallery images, published or not',
        summary: 'get all gallery images',
        security: [['Bearer' => []]],
        tags: ['Admin Gallery Image'],
    )]
    #[OA\Parameter(ref: "#/components/parameters/x-locale")]
    #[OA\Parameter(ref: "#/components/parameters/direction")]
    #[OA\Parameter(
        name: 'sort',
        description: 'Specify sorting order.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string', enum: ['id', 'sort_order', 'created_at']),
        example: 'sort_order'
    )]
    #[OA\Parameter(ref: "#/components/parameters/page")]
    #[OA\Parameter(ref: "#/components/parameters/limit")]
    #[OA\Parameter(
        name: 'search',
        description: 'Free text search on caption.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string')
    )]
    #[OA\Parameter(
        name: 'publish',
        description: 'Filter by publish.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'boolean')
    )]
    #[OA\Response(
        response: 200,
        description: 'Return all gallery images',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                allOf: [
                    new OA\Schema(ref: '#/components/schemas/Pagination'),
                    new OA\Schema(
                        properties: [
                            new OA\Property(
                                property: 'pagination',
                                properties: [
                                    new OA\Property(
                                        property: 'items',
                                        type: 'array',
                                        items: new OA\Items(ref: '#/components/schemas/GalleryImage')
                                    ),
                                ],
                                type: 'object'
                            ),
                        ]
                    ),
                ]
            )
        )
    )]
    public function index(GalleryImageFilter $filter): JsonResponse
    {
        return parent::baseIndex($filter);
    }

    #[OA\Post(
        path: '/api/admin/gallery-images',
        description: 'create a gallery image',
        summary: 'create gallery image',
        security: [['Bearer' => []]],
        tags: ['Admin Gallery Image'],
        parameters: [new OA\Parameter(ref: "#/components/parameters/x-locale")],
    )]
    #[OA\RequestBody(
        content: new OA\MediaType(
            mediaType: 'multipart/form-data',
            schema: new OA\Schema(ref: '#/components/schemas/GalleryImageStoreFormRequest')
        )
    )]
    #[OA\Response(
        response: 201,
        description: 'Returns the created gallery image',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/GalleryImage', type: 'object'),
                ]
            )
        )
    )]
    public function store(GalleryImageRequest $request): JsonResponse
    {
        return parent::baseStore($request);
    }

    #[OA\Get(
        path: '/api/admin/gallery-images/{gallery_image}',
        description: 'Fetches a single gallery image by id',
        summary: 'Get one gallery image',
        security: [['Bearer' => []]],
        tags: ['Admin Gallery Image'],
    )]
    #[OA\Parameter(ref: "#/components/parameters/x-locale")]
    #[OA\Parameter(
        name: 'gallery_image',
        description: 'the gallery image to retrieve',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'integer'),
        example: 1
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns one gallery image',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/GalleryImage', type: 'object'),
                ]
            )
        )
    )]
    public function show(GalleryImage $galleryImage): JsonResponse
    {
        return parent::baseShow($galleryImage->load($this->service->getWithRelations()));
    }

    #[OA\Post(
        path: '/api/admin/gallery-images/{gallery_image}',
        description: 'Update one gallery image. Send it as multipart with _method=PUT when an image is attached.',
        summary: 'Update gallery image',
        security: [['Bearer' => []]],
        tags: ['Admin Gallery Image'],
    )]
    #[OA\Parameter(ref: "#/components/parameters/x-locale")]
    #[OA\Parameter(
        name: 'gallery_image',
        description: 'the gallery image to update',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'integer'),
        example: 1
    )]
    #[OA\RequestBody(
        content: new OA\MediaType(
            mediaType: 'multipart/form-data',
            schema: new OA\Schema(ref: '#/components/schemas/GalleryImageUpdateFormRequest')
        )
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns the updated gallery image',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/GalleryImage', type: 'object'),
                ]
            )
        )
    )]
    public function update(GalleryImageRequest $request, GalleryImage $galleryImage): JsonResponse
    {
        return parent::baseUpdate($request, $galleryImage);
    }

    #[OA\Delete(
        path: '/api/admin/gallery-images/{gallery_image}',
        description: 'delete a single gallery image by id',
        summary: 'delete gallery image',
        security: [['Bearer' => []]],
        tags: ['Admin Gallery Image'],
    )]
    #[OA\Parameter(ref: "#/components/parameters/x-locale")]
    #[OA\Parameter(
        name: 'gallery_image',
        description: 'the gallery image to delete',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'integer'),
        example: 1
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns the deleted gallery image',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/GalleryImage', type: 'object'),
                ]
            )
        )
    )]
    public function destroy(GalleryImage $galleryImage): JsonResponse
    {
        return parent::baseDestroy($galleryImage);
    }

    #[OA\Post(
        path: '/api/admin/gallery-images/bulk-delete',
        description: 'delete many gallery images in one request',
        summary: 'bulk delete gallery images',
        security: [['Bearer' => []]],
        tags: ['Admin Gallery Image'],
    )]
    #[OA\Parameter(ref: "#/components/parameters/x-locale")]
    #[OA\RequestBody(
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(ref: '#/components/schemas/BulkDeleteFormRequest')
        )
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns the outcome of the bulk delete',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(ref: '#/components/schemas/BulkDeleteResult')
        )
    )]
    public function bulkDestroy(BulkDeleteRequest $bulkDeleteRequest): JsonResponse
    {
        return parent::baseBulkDestroy($bulkDeleteRequest);
    }

    #[OA\Get(
        path: '/api/admin/gallery-images/export',
        description: 'download every gallery image the current filters select as a csv file, translated fields in '
            . 'the language the x-locale header asks for. Takes the same filters as index(), without the paging.',
        summary: 'export gallery images as csv',
        security: [['Bearer' => []]],
        tags: ['Admin Gallery Image'],
    )]
    #[OA\Parameter(ref: "#/components/parameters/x-locale")]
    #[OA\Response(
        response: 200,
        description: 'The csv file, as a download',
        content: new OA\MediaType(
            mediaType: 'text/csv',
            schema: new OA\Schema(type: 'string', format: 'binary')
        )
    )]
    public function export(GalleryImageFilter $filter): StreamedResponse
    {
        return parent::baseExport($filter, 'gallery-images');
    }
}
