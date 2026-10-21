<?php

namespace App\Http\Controllers\Api;

use App\Services\SeoService;
use Illuminate\Http\Response;
use OpenApi\Attributes as OA;

class SeoController extends ApiController
{
    public function __construct(protected SeoService $seoService)
    {
    }

    #[OA\Get(
        path: '/api/seo/sitemap.xml',
        description: 'Every published page of the website: the fixed pages plus each published lesson, directory '
            . 'entry and blog post. The website host serves it as /sitemap.xml.',
        summary: 'sitemap',
        tags: ['SEO'],
    )]
    #[OA\Response(response: 200, description: 'The sitemap', content: new OA\MediaType(mediaType: 'application/xml'))]
    public function sitemap(): Response
    {
        return response($this->seoService->sitemapXml(), 200, ['Content-Type' => 'application/xml; charset=UTF-8']);
    }

    #[OA\Get(path: '/api/seo/robots.txt', description: 'robots.txt for the website host.', summary: 'robots.txt', tags: ['SEO'])]
    #[OA\Response(response: 200, description: 'robots.txt', content: new OA\MediaType(mediaType: 'text/plain'))]
    public function robots(): Response
    {
        return response($this->seoService->robotsTxt(), 200, ['Content-Type' => 'text/plain; charset=UTF-8']);
    }

    #[OA\Get(path: '/api/seo/llms.txt', description: 'Minimal llms.txt stub for the website host.', summary: 'llms.txt', tags: ['SEO'])]
    #[OA\Response(response: 200, description: 'llms.txt', content: new OA\MediaType(mediaType: 'text/plain'))]
    public function llms(): Response
    {
        return response($this->seoService->llmsTxt(), 200, ['Content-Type' => 'text/plain; charset=UTF-8']);
    }
}
