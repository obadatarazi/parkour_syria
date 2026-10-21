<?php

namespace App\Services;

use App\Models\BlogPost;
use App\Models\DirectoryEntry;
use App\Models\Event;
use App\Models\Lesson;
use App\Models\Page;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Str;

/**
 * What one website url says to a crawler before any JavaScript runs (scope section 7a): its meta,
 * Open Graph and JSON-LD, plus a plain HTML copy of its content that the SPA replaces on load.
 *
 * Paths follow the SPA's own routes (src/components/nav.tsx), `config('site.website_paths')`.
 */
class WebsitePageService
{
    /** Tags kept in prerendered admin HTML. Everything else, scripts included, is stripped. */
    private const ALLOWED_TAGS = '<h1><h2><h3><h4><p><br><strong><b><em><i><u><ul><ol><li><a><blockquote><img><figure><figcaption><table><thead><tbody><tr><th><td>';

    public function __construct(
        protected MultiTypeSettingService $settingService,
        protected BlogPostService $blogPostService,
    ) {
    }

    /**
     * @return array{
     *     status: int,
     *     siteName: string,
     *     title: string,
     *     description: string,
     *     canonical: string,
     *     image: string,
     *     type: string,
     *     noindex: bool,
     *     jsonLd: list<array<string, mixed>>,
     *     body: string,
     * }
     */
    public function render(string $path): array
    {
        // The website is Arabic only until FEATURE_PUBLIC_EN_LOCALE, the same rule as its API.
        App::setLocale('ar');

        $paths = config('site.website_paths');
        $segments = array_values(array_filter(explode('/', trim($path, '/')), 'strlen'));
        $first = '/' . ($segments[0] ?? '');
        $slug = isset($segments[1]) ? rawurldecode($segments[1]) : null;
        $key = array_search($first, $paths, true);

        if ($key === false || count($segments) > 2) {
            return $this->notFound($path);
        }

        if ($slug !== null) {
            return match ($key) {
                'path' => $this->lesson($slug),
                'directory' => $this->directoryEntry($slug),
                'blog' => $this->blogPost($slug),
                default => $this->notFound($path),
            };
        }

        return $this->listPage($key, $paths[$key]);
    }

    private function listPage(string $key, string $path): array
    {
        $page = Page::query()->with('translations')->where('key', $key)->where('publish', true)->first();
        $title = $page?->title ?: $this->siteName();
        $body = '<h1>' . e($title) . '</h1>' . $this->richText($page?->body);
        $jsonLd = [];

        switch ($key) {
            case 'home':
                $jsonLd[] = $this->organization();
                $jsonLd[] = [
                    '@context' => 'https://schema.org',
                    '@type' => 'WebSite',
                    'name' => $this->siteName(),
                    'url' => $this->url('/'),
                    'inLanguage' => 'ar',
                ];
                $body .= $this->linkList(__('website.lessons'), $this->lessons()->take(7), 'path', 'title', 'summary');
                $body .= $this->linkList(__('website.latest_posts'), $this->posts()->take(3), 'blog', 'title', 'excerpt');
                break;
            case 'path':
                $body .= $this->linkList(null, $this->lessons(), 'path', 'title', 'summary', ordered: true);
                break;
            case 'directory':
                $body .= $this->linkList(null, $this->directoryEntries(), 'directory', 'name', 'description');
                break;
            case 'blog':
                $body .= $this->linkList(null, $this->posts(), 'blog', 'title', 'excerpt');
                break;
            case 'events':
                $events = $this->upcomingEvents();
                $body .= $events->isEmpty()
                    ? '<p>' . e(__('website.no_events')) . '</p>'
                    : '<ul>' . $events->map(fn (Event $event) => '<li><h2>' . e($event->title) . '</h2><p>'
                        . e($this->formatDate($event->starts_at)) . ($event->location_label ? ' · ' . e($event->location_label) : '')
                        . '</p>' . $this->richText($event->description) . '</li>')->implode('') . '</ul>';
                foreach ($events as $event) {
                    $jsonLd[] = $this->eventJsonLd($event);
                }
                break;
            case 'about':
                $jsonLd[] = $this->organization();
                break;
        }

        return $this->result(
            title: $this->pageTitle($page?->seo_title ?: $page?->title, $key === 'home'),
            description: $page?->seo_description ?: $this->summary($page?->body) ?: (string) __('website.description'),
            path: $path,
            image: $page?->image_file_url,
            body: $body,
            jsonLd: $jsonLd,
        );
    }

    private function lesson(string $slug): array
    {
        $lesson = Lesson::query()->with('translations')->where('publish', true)->where('slug', $slug)->first();
        if (!$lesson) {
            return $this->notFound($this->path('path', $slug));
        }

        $body = '<h1>' . e($lesson->title) . '</h1>'
            . ($lesson->summary ? '<p>' . e($lesson->summary) . '</p>' : '')
            . $this->richText($lesson->body)
            . ($lesson->safety_note ? '<aside><strong>' . e(__('website.safety')) . '</strong> ' . e($lesson->safety_note) . '</aside>' : '')
            . ($lesson->youtube_url ? '<p><a href="' . e($lesson->youtube_url) . '">' . e(__('website.watch_video')) . '</a></p>' : '');

        return $this->result(
            title: $this->pageTitle($lesson->title),
            description: $lesson->summary ?: $this->summary($lesson->body),
            path: $this->path('path', $lesson->slug),
            image: $lesson->image_file_url,
            body: $body,
            type: 'article',
            jsonLd: [array_filter([
                '@context' => 'https://schema.org',
                '@type' => 'LearningResource',
                'name' => $lesson->title,
                'description' => $lesson->summary ?: $this->summary($lesson->body),
                'url' => $this->url($this->path('path', $lesson->slug)),
                'inLanguage' => 'ar',
                'learningResourceType' => 'Lesson',
                'educationalLevel' => 'Beginner',
                'position' => $lesson->sort_order,
                'image' => $this->absolute($lesson->image_file_url),
                'video' => $lesson->youtube_url ? ['@type' => 'VideoObject', 'name' => $lesson->title, 'embedUrl' => $lesson->youtube_url] : null,
                'provider' => $this->organizationRef(),
            ], fn ($value) => $value !== null)],
        );
    }

    private function directoryEntry(string $slug): array
    {
        $entry = DirectoryEntry::query()->with(['translations', 'area.translations'])
            ->where('publish', true)->where('slug', $slug)->first();
        if (!$entry) {
            return $this->notFound($this->path('directory', $slug));
        }

        $sameAs = array_values(array_filter([$entry->facebook_url, $entry->instagram_url]));
        $body = '<h1>' . e($entry->name) . '</h1>'
            . ($entry->area ? '<p>' . e($entry->area->name) . ' · ' . e(__('website.city')) . '</p>' : '')
            . $this->richText($entry->description)
            . '<ul>'
            . ($entry->whatsapp ? '<li><a href="https://wa.me/' . e($entry->whatsapp) . '">' . e(__('website.whatsapp')) . '</a></li>' : '')
            . implode('', array_map(fn ($link) => '<li><a href="' . e($link) . '">' . e($link) . '</a></li>', $sameAs))
            . ($entry->map_url ? '<li><a href="' . e($entry->map_url) . '">' . e(__('website.map')) . '</a></li>' : '')
            . '</ul>';

        $schemaType = match ($entry->type) {
            'coach' => 'Person',
            'team' => 'SportsTeam',
            default => 'SportsActivityLocation',
        };
        $address = [
            '@type' => 'PostalAddress',
            'addressLocality' => __('website.city'),
            'addressRegion' => $entry->area?->name,
            'addressCountry' => 'SY',
        ];

        return $this->result(
            title: $this->pageTitle($entry->name),
            description: $this->summary($entry->description) ?: (string) __('website.description'),
            path: $this->path('directory', $entry->slug),
            image: $entry->image_file_url,
            body: $body,
            jsonLd: [array_filter([
                '@context' => 'https://schema.org',
                '@type' => $schemaType,
                'name' => $entry->name,
                'description' => $this->summary($entry->description),
                'url' => $this->url($this->path('directory', $entry->slug)),
                'image' => $this->absolute($entry->image_file_url),
                'sameAs' => $sameAs ?: null,
                'telephone' => $entry->whatsapp && $schemaType !== 'Person' ? '+' . $entry->whatsapp : null,
                'hasMap' => $schemaType === 'SportsActivityLocation' ? $entry->map_url : null,
                'address' => $schemaType === 'SportsActivityLocation' ? $address : null,
                'homeLocation' => $schemaType === 'Person' ? ['@type' => 'Place', 'address' => $address] : null,
                'location' => $schemaType === 'SportsTeam' ? ['@type' => 'Place', 'address' => $address] : null,
                'sport' => $schemaType === 'SportsTeam' ? 'Parkour' : null,
                'knowsAbout' => $schemaType === 'Person' ? 'Parkour' : null,
            ], fn ($value) => $value !== null)],
        );
    }

    private function blogPost(string $slug): array
    {
        $post = BlogPost::query()->with(['translations', 'category.translations'])
            ->where('publish', true)->where('slug', $slug)->first();
        if (!$post) {
            return $this->notFound($this->path('blog', $slug));
        }

        $author = $post->author ?: (string) __('website.team');
        $body = '<article><h1>' . e($post->title) . '</h1>'
            . '<p>' . e($this->formatDate($post->published_at)) . ' · ' . e($author) . '</p>'
            . ($post->excerpt ? '<p>' . e($post->excerpt) . '</p>' : '')
            . $this->richText($post->body)
            . '</article>'
            . $this->linkList(__('website.related_posts'), $this->blogPostService->related($post), 'blog', 'title', 'excerpt');

        return $this->result(
            title: $this->pageTitle($post->seo_title ?: $post->title),
            description: $post->seo_description ?: $post->excerpt ?: $this->summary($post->body),
            path: $this->path('blog', $post->slug),
            image: $post->image_file_url,
            body: $body,
            type: 'article',
            jsonLd: [array_filter([
                '@context' => 'https://schema.org',
                '@type' => 'BlogPosting',
                'headline' => $post->title,
                'description' => $post->seo_description ?: $post->excerpt,
                'url' => $this->url($this->path('blog', $post->slug)),
                'mainEntityOfPage' => $this->url($this->path('blog', $post->slug)),
                'image' => $this->absolute($post->image_file_url),
                'datePublished' => $post->published_at ? Carbon::parse($post->published_at)->toIso8601String() : null,
                'dateModified' => $post->updated_at ? Carbon::parse($post->updated_at)->toIso8601String() : null,
                'inLanguage' => 'ar',
                'articleSection' => $post->category?->title,
                // A named writer is a person, the fallback is the organisation itself.
                'author' => $post->author
                    ? ['@type' => 'Person', 'name' => $post->author]
                    : $this->organizationRef(),
                'publisher' => $this->organizationRef(),
            ], fn ($value) => $value !== null)],
        );
    }

    private function eventJsonLd(Event $event): array
    {
        return array_filter([
            '@context' => 'https://schema.org',
            '@type' => 'Event',
            'name' => $event->title,
            'description' => $this->summary($event->description),
            'startDate' => Carbon::parse($event->starts_at)->toIso8601String(),
            'eventStatus' => 'https://schema.org/EventScheduled',
            'eventAttendanceMode' => 'https://schema.org/OfflineEventAttendanceMode',
            'image' => $this->absolute($event->image_file_url),
            'url' => $this->url(config('site.website_paths.events')),
            'location' => [
                '@type' => 'Place',
                'name' => $event->location_label ?: $event->area?->name ?: __('website.city'),
                'address' => [
                    '@type' => 'PostalAddress',
                    'addressLocality' => __('website.city'),
                    'addressRegion' => $event->area?->name,
                    'addressCountry' => 'SY',
                ],
            ],
            'organizer' => $this->organizationRef(),
        ], fn ($value) => $value !== null);
    }

    private function notFound(string $path): array
    {
        return $this->result(
            title: $this->pageTitle((string) __('website.not_found')),
            description: (string) __('website.description'),
            path: $path,
            image: null,
            body: '<h1>' . e(__('website.not_found')) . '</h1>',
            status: 404,
            noindex: true,
        );
    }

    private function result(
        string $title,
        ?string $description,
        string $path,
        ?string $image,
        string $body,
        string $type = 'website',
        array $jsonLd = [],
        int $status = 200,
        bool $noindex = false,
    ): array {
        return [
            'status' => $status,
            'siteName' => $this->siteName(),
            'title' => $title,
            'description' => Str::limit(trim((string) $description), 300),
            'canonical' => $this->url($path),
            'image' => $this->absolute($image) ?: (string) config('site.website.default_image'),
            'type' => $type,
            'noindex' => $noindex,
            'jsonLd' => $jsonLd,
            'body' => $body,
        ];
    }

    private function lessons()
    {
        return Lesson::query()->with('translations')->where('publish', true)
            ->orderBy('sort_order')->orderBy('id')->get();
    }

    private function posts()
    {
        return BlogPost::query()->with('translations')->where('publish', true)
            ->orderByDesc('published_at')->orderByDesc('id')->limit(50)->get();
    }

    private function directoryEntries()
    {
        return DirectoryEntry::query()->with('translations')->where('publish', true)
            ->orderBy('sort_order')->orderBy('id')->get();
    }

    private function upcomingEvents()
    {
        return Event::query()->with(['translations', 'area.translations'])->where('publish', true)
            ->where('starts_at', '>=', now())->orderBy('starts_at')->limit(50)->get();
    }

    private function linkList(?string $heading, $rows, string $list, string $titleField, string $textField, bool $ordered = false): string
    {
        if ($rows->isEmpty()) {
            return '';
        }

        $tag = $ordered ? 'ol' : 'ul';
        $items = $rows->map(fn ($row) => '<li><a href="' . e($this->sitePath($this->path($list, $row->slug))) . '">'
            . e($row->{$titleField}) . '</a>'
            . ($row->{$textField} ? '<p>' . e($this->summary($row->{$textField})) . '</p>' : '')
            . '</li>')->implode('');

        return ($heading ? '<h2>' . e($heading) . '</h2>' : '') . "<{$tag}>{$items}</{$tag}>";
    }

    private function organization(): array
    {
        $settings = $this->settingService->publicSettings();

        return array_filter([
            '@context' => 'https://schema.org',
            '@type' => 'SportsOrganization',
            '@id' => $this->url('/') . '#organization',
            'name' => $this->siteName(),
            'url' => $this->url('/'),
            'sport' => 'Parkour',
            'email' => $settings['email'] ?? null,
            'telephone' => !empty($settings['whatsapp_number']) ? '+' . ltrim((string) $settings['whatsapp_number'], '+') : null,
            'sameAs' => array_values(array_filter([
                $this->realUrl($settings['facebook_url'] ?? null),
                $this->realUrl($settings['instagram_url'] ?? null),
            ])) ?: null,
            'areaServed' => ['@type' => 'City', 'name' => __('website.city')],
        ], fn ($value) => $value !== null);
    }

    private function organizationRef(): array
    {
        return ['@type' => 'Organization', '@id' => $this->url('/') . '#organization', 'name' => $this->siteName()];
    }

    private function siteName(): string
    {
        return (string) ($this->settingService->publicSettings()['site_name'] ?? null ?: config('app.name'));
    }

    private function pageTitle(?string $title, bool $isHome = false): string
    {
        $siteName = $this->siteName();
        if (!$title || $title === $siteName) {
            return $siteName;
        }

        // An admin's SEO title may already carry the brand ("... | باركور سوريا").
        return $isHome || str_contains($title, $siteName) ? $title : "{$title} | {$siteName}";
    }

    /** First ~160 characters of a text or HTML field, for descriptions and list blurbs. */
    private function summary(?string $html): string
    {
        $text = trim(preg_replace('/\s+/u', ' ', html_entity_decode(strip_tags((string) $html), ENT_QUOTES | ENT_HTML5, 'UTF-8')));

        return Str::limit($text, 160);
    }

    /**
     * Admin rich text, trimmed to presentational tags. Admins are trusted, but this HTML is served
     * before any of the SPA's own escaping, so handlers and script urls are removed regardless.
     */
    private function richText(?string $html): string
    {
        $html = trim((string) $html);
        if ($html === '') {
            return '';
        }

        if (!str_contains($html, '<')) {
            return implode('', array_map(fn ($paragraph) => '<p>' . nl2br(e(trim($paragraph))) . '</p>', preg_split('/\n{2,}/', $html)));
        }

        $html = preg_replace('#<(script|style|iframe)\b[^>]*>.*?</\1>#is', '', $html);
        $html = strip_tags($html, self::ALLOWED_TAGS);
        $html = preg_replace('/\s+on[a-z]+\s*=\s*("[^"]*"|\'[^\']*\'|[^\s>]+)/i', '', $html);
        $html = preg_replace('/(href|src)\s*=\s*(["\']?)\s*(javascript|vbscript|data):[^"\'>\s]*\2/i', '$1="#"', $html);

        return $html;
    }

    private function formatDate($value): string
    {
        if (!$value) {
            return '';
        }

        return Carbon::parse($value)->locale('ar')->translatedFormat('j F Y');
    }

    private function path(string $list, string $slug): string
    {
        return config("site.website_paths.{$list}") . '/' . rawurlencode($slug);
    }

    /** A path as the browser sees it, under the site's folder on this host. */
    private function sitePath(string $path): string
    {
        $base = rtrim((string) config('site.website.base_path'), '/');

        return $base . ($path === '/' ? '/' : $path);
    }

    private function url(string $path): string
    {
        return rtrim((string) config('app.website_base_url'), '/') . ($path === '/' ? '/' : $path);
    }

    /** Uploaded files are stored as `/storage/...`, which crawlers need on the API's own host. */
    private function absolute(?string $fileUrl): ?string
    {
        if (empty($fileUrl)) {
            return null;
        }

        return preg_match('#^https?://#i', $fileUrl) ? $fileUrl : rtrim((string) config('app.url'), '/') . $fileUrl;
    }

    /** The seeded social links are "#" placeholders until the client sends the real ones. */
    private function realUrl(?string $url): ?string
    {
        return $url && preg_match('#^https?://#i', $url) ? $url : null;
    }
}
