<?php

use App\Models\BlogPost;
use App\Models\Event;
use App\Models\Page;
use App\Models\Slider;

it('answers the home page in one payload', function () {
    $this->getJson('/api/home')
        ->assertOk()
        ->assertJsonCount(3, 'data.sliders')
        ->assertJsonCount(3, 'data.latestBlogPosts')
        ->assertJsonCount(3, 'data.upcomingEvents')
        ->assertJsonCount(8, 'data.galleryImages')
        ->assertJsonPath('data.page.key', 'home');
});

it('drops the home cache when a slider changes', function () {
    $this->getJson('/api/home')->assertJsonCount(3, 'data.sliders');

    Slider::query()->first()->update(['publish' => false]);

    $this->getJson('/api/home')->assertJsonCount(2, 'data.sliders');
});

it('returns only the allowlisted site settings', function () {
    $data = $this->getJson('/api/site-settings')->assertOk()->json('data');

    expect(array_keys($data))->toEqualCanonicalizing(config('site.public_settings'))
        ->and($data['whatsapp_number'])->toBe('963999000000');
});

it('hides past events', function () {
    Event::query()->where('slug', 'friday-gathering')->update(['starts_at' => now()->subDay()]);

    $slugs = collect($this->getJson('/api/events')->json('pagination.items'))->pluck('slug');

    expect($slugs)->not->toContain('friday-gathering')->toHaveCount(2);
    $this->getJson('/api/events/friday-gathering')->assertNotFound();
});

it('filters the directory by type and area slug, and searches arabic', function () {
    $this->getJson('/api/directory-entries?type=coach&area=mazzeh')
        ->assertOk()
        ->assertJsonPath('pagination.totalItems', 1)
        ->assertJsonPath('pagination.items.0.slug', 'sara-dimashqi');

    $slugs = collect($this->getJson('/api/directory-entries?search='.urlencode('حديقة'))->json('pagination.items'))->pluck('slug');
    expect($slugs)->toContain('tishreen-park', 'jalaa-park');
});

it('answers in arabic whatever X-Locale says while english is off', function () {
    $this->getJson('/api/pages/about', ['X-Locale' => 'en'])
        ->assertOk()
        ->assertJsonPath('data.title', 'من نحن');
});

it('answers in english once FEATURE_PUBLIC_EN_LOCALE is on', function () {
    config(['features.public_en_locale' => true]);

    $this->getJson('/api/pages/about', ['X-Locale' => 'en'])
        ->assertOk()
        ->assertJsonPath('data.title', 'About us');
});

it('lists every published detail page in the sitemap', function () {
    $xml = $this->get('/api/seo/sitemap.xml')->assertOk()->getContent();

    expect($xml)->toContain('/directory/tishreen-park', '/blog/safety-rules', '/path/1');
});

it('loads every piece of the current website content', function () {
    expect(Page::query()->pluck('key')->all())
        ->toEqualCanonicalizing(['home', 'what', 'path', 'directory', 'events', 'blog', 'suggest', 'book', 'about', 'contact', 'disclaimer']);

    $this->getJson('/api/lessons')->assertJsonPath('pagination.totalItems', 7);
    $this->getJson('/api/directory-entries')->assertJsonPath('pagination.totalItems', 6);
    $this->getJson('/api/blog-posts')->assertJsonPath('pagination.totalItems', 3);
    $this->getJson('/api/gallery-images')->assertJsonPath('pagination.totalItems', 8);
    $this->getJson('/api/site-settings')->assertJsonPath('data.instagram_handle', '@parkoursyria');
});

it('lists related posts from the same category without the post itself', function () {
    $post = BlogPost::query()->where('publish', true)->whereNotNull('blog_category_id')->firstOrFail();

    $related = $this->getJson('/api/blog-posts/'.rawurlencode($post->slug).'/related')->assertOk()->json('data');

    expect($related)->not->toBeEmpty()->toHaveCount(min(3, BlogPost::query()->where('publish', true)->count() - 1))
        ->and(array_column($related, 'slug'))->not->toContain($post->slug);
});
