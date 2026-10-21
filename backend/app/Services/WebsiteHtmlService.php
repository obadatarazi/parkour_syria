<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use RuntimeException;

/**
 * The built SPA's index.html with one page's head tags and prerendered body written in. Cached per
 * path, and dropped with the sitemap whenever content changes (SeoService::flushCache).
 */
class WebsiteHtmlService
{
    public function __construct(
        protected WebsitePageService $websitePageService,
    ) {
    }

    /**
     * @return array{0: string, 1: int} the HTML and its status code
     */
    public function html(string $path): array
    {
        $index = $this->indexPath();
        $key = 'seo:html:' . SeoService::generation() . ':' . md5($path . '|' . filemtime($index));

        return Cache::remember($key, (int) config('site.website.cache_seconds', 600), function () use ($path, $index) {
            $page = $this->websitePageService->render($path);

            return [$this->inject((string) file_get_contents($index), $page), $page['status']];
        });
    }

    public function indexPath(): string
    {
        foreach ([config('site.website.index_path'), config('site.website.dev_index_path')] as $candidate) {
            if ($candidate && is_file($candidate)) {
                return $candidate;
            }
        }

        throw new RuntimeException('The website build is missing. Run `npm run build` in the site and `php artisan website:install`.');
    }

    /**
     * @param array<string, mixed> $page WebsitePageService::render()
     */
    public function inject(string $html, array $page): string
    {
        // Drop the build's generic tags; this page's own set goes in their place.
        $html = preg_replace('#\s*<title>.*?</title>#is', '', $html, 1);
        $html = preg_replace('#\s*<meta\s+(name|property)="(description|robots|og:[^"]+|twitter:[^"]+)"[^>]*>#i', '', $html);
        $html = preg_replace('#\s*<link\s+rel="canonical"[^>]*>#i', '', $html);

        $head = $this->headTags($page);
        $html = preg_replace('#</head>#i', $head . "\n  </head>", $html, 1);

        // createRoot() replaces whatever is in #root on its first render, so visitors never see this copy.
        $body = '<div id="root">' . $page['body'] . '</div>';

        return preg_replace('#<div id="root">\s*</div>#i', $this->escapeReplacement($body), $html, 1);
    }

    /**
     * @param array<string, mixed> $page
     */
    private function headTags(array $page): string
    {
        $tags = [
            '<title>' . e($page['title']) . '</title>',
            '<meta name="description" content="' . e($page['description']) . '" />',
            '<link rel="canonical" href="' . e($page['canonical']) . '" />',
            '<meta property="og:type" content="' . e($page['type']) . '" />',
            '<meta property="og:locale" content="ar_SY" />',
            '<meta property="og:site_name" content="' . e($page['siteName']) . '" />',
            '<meta property="og:title" content="' . e($page['title']) . '" />',
            '<meta property="og:description" content="' . e($page['description']) . '" />',
            '<meta property="og:url" content="' . e($page['canonical']) . '" />',
            '<meta property="og:image" content="' . e($page['image']) . '" />',
            '<meta name="twitter:card" content="summary_large_image" />',
            '<meta name="twitter:title" content="' . e($page['title']) . '" />',
            '<meta name="twitter:description" content="' . e($page['description']) . '" />',
            '<meta name="twitter:image" content="' . e($page['image']) . '" />',
        ];

        if ($page['noindex']) {
            $tags[] = '<meta name="robots" content="noindex" />';
        }

        foreach ($page['jsonLd'] as $data) {
            // JSON_HEX_TAG keeps a "</script>" inside content from closing the tag early.
            $tags[] = '<script type="application/ld+json">'
                . json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP)
                . '</script>';
        }

        return "\n    " . implode("\n    ", $tags);
    }

    /** preg_replace reads "$1" and "\1" in the replacement, content may contain either. */
    private function escapeReplacement(string $value): string
    {
        return strtr($value, ['\\' => '\\\\', '$' => '\\$']);
    }
}
