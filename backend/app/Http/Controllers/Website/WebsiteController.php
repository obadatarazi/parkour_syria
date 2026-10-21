<?php

namespace App\Http\Controllers\Website;

use App\Services\SeoService;
use App\Services\WebsiteHtmlService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Routing\Controller;

/**
 * Serves the website (the React SPA) with each page's SEO data and prerendered content already in
 * the HTML, so search engines and link previews read them without running JavaScript.
 */
class WebsiteController extends Controller
{
    public function __construct(
        protected WebsiteHtmlService $websiteHtmlService,
        protected SeoService $seoService,
    ) {}

    public function show(Request $request, ?string $path = null): Response
    {
        [$html, $status] = $this->websiteHtmlService->html('/'.ltrim((string) $path, '/'));

        return response($html, $status, [
            'Content-Type' => 'text/html; charset=UTF-8',
            // The HTML changes whenever an admin edits content; the hashed assets are what browsers keep.
            'Cache-Control' => 'public, max-age=0, must-revalidate',
        ]);
    }

    public function sitemap(): Response
    {
        return response($this->seoService->sitemapXml(), 200, ['Content-Type' => 'application/xml; charset=UTF-8']);
    }

    public function robots(): Response
    {
        return response($this->seoService->robotsTxt(), 200, ['Content-Type' => 'text/plain; charset=UTF-8']);
    }

    public function llms(): Response
    {
        return response($this->seoService->llmsTxt(), 200, ['Content-Type' => 'text/plain; charset=UTF-8']);
    }
}
