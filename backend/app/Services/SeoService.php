<?php

namespace App\Services;

use App\Models\BlogPost;
use App\Models\DirectoryEntry;
use App\Models\Lesson;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;

/**
 * What crawlers read: the sitemap of every published url, robots.txt and the llms.txt stub.
 */
class SeoService
{
    public const SITEMAP_CACHE_KEY = 'seo:sitemap:v1';

    public const SITEMAP_TTL_SECONDS = 3600;

    /**
     * @return list<array{loc: string, lastmod: string|null}>
     */
    public function sitemapUrls(): array
    {
        return Cache::remember(self::SITEMAP_CACHE_KEY, self::SITEMAP_TTL_SECONDS, function () {
            $paths = config('site.website_paths');
            $urls = [];

            foreach ($paths as $path) {
                $urls[] = ['loc' => $this->url($path), 'lastmod' => null];
            }

            $details = [
                'path' => Lesson::query(),
                'directory' => DirectoryEntry::query(),
                'blog' => BlogPost::query(),
            ];

            foreach ($details as $list => $query) {
                $query->where('publish', true)
                    ->orderBy('id')
                    ->get(['slug', 'updated_at'])
                    ->each(function ($row) use (&$urls, $paths, $list) {
                        $urls[] = [
                            'loc' => $this->url($paths[$list] . '/' . rawurlencode($row->slug)),
                            'lastmod' => $row->updated_at ? Carbon::parse($row->updated_at)->toDateString() : null,
                        ];
                    });
            }

            return $urls;
        });
    }

    public static function flushCache(): void
    {
        Cache::forget(self::SITEMAP_CACHE_KEY);
    }

    public function sitemapXml(): string
    {
        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

        foreach ($this->sitemapUrls() as $url) {
            $xml .= '  <url><loc>' . htmlspecialchars($url['loc'], ENT_XML1) . '</loc>';
            if ($url['lastmod']) {
                $xml .= '<lastmod>' . $url['lastmod'] . '</lastmod>';
            }
            $xml .= "</url>\n";
        }

        return $xml . "</urlset>\n";
    }

    public function robotsTxt(): string
    {
        return "User-agent: *\nAllow: /\n\nSitemap: " . $this->url('/sitemap.xml') . "\n";
    }

    /**
     * A minimal llms.txt (https://llmstxt.org): what the site is and where its main sections live.
     */
    public function llmsTxt(): string
    {
        $paths = config('site.website_paths');
        $siteName = config('app.name');

        return "# {$siteName}\n\n"
            . "> Arabic-first site helping people in Syria learn parkour safely: a beginner path, a directory of "
            . "verified training places, coaches and teams in Damascus, upcoming events and safety articles. "
            . "Affiliated with Parkour.com.\n\n"
            . "## Sections\n\n"
            . "- [What is parkour](" . $this->url($paths['what']) . ")\n"
            . "- [Beginner path](" . $this->url($paths['path']) . ")\n"
            . "- [Directory](" . $this->url($paths['directory']) . ")\n"
            . "- [Events](" . $this->url($paths['events']) . ")\n"
            . "- [Blog](" . $this->url($paths['blog']) . ")\n"
            . "- [Disclaimer and safety policy](" . $this->url($paths['disclaimer']) . ")\n";
    }

    private function url(string $path): string
    {
        return rtrim((string) config('app.website_base_url'), '/') . ($path === '/' ? '/' : $path);
    }
}
