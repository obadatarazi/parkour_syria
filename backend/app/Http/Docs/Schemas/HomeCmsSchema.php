<?php

namespace App\Http\Docs\Schemas;

use Attribute;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'HomeCms',
    description: 'The home page payload',
    properties: [
        new OA\Property(property: 'sliders', type: 'array', items: new OA\Items(ref: '#/components/schemas/Slider')),
        new OA\Property(property: 'latestBlogPosts', type: 'array', items: new OA\Items(ref: '#/components/schemas/BlogPost')),
        new OA\Property(property: 'upcomingEvents', type: 'array', items: new OA\Items(ref: '#/components/schemas/Event')),
        new OA\Property(property: 'featuredDirectoryEntries', type: 'array', items: new OA\Items(ref: '#/components/schemas/DirectoryEntry')),
        new OA\Property(property: 'galleryImages', type: 'array', items: new OA\Items(ref: '#/components/schemas/GalleryImage')),
        new OA\Property(property: 'page', ref: '#/components/schemas/Page', type: 'object', nullable: true),
    ],
    type: 'object'
)]
#[Attribute(Attribute::TARGET_CLASS)]
class HomeCmsSchema
{
    public function __construct() {}
}
