<?php

use App\Models\BlogPost;
use App\Models\Lesson;
use App\Models\Page;

// A stand-in for the SPA build, so the tests never depend on `npm run build` having run.
beforeEach(function () {
    $index = storage_path('framework/testing/website-index.html');
    @mkdir(dirname($index), 0777, true);
    file_put_contents($index, <<<'HTML'
        <!doctype html>
        <html lang="ar" dir="rtl">
          <head>
            <title>generic</title>
            <meta name="description" content="generic" />
            <meta property="og:title" content="generic" />
            <script type="module" src="/assets/app.js"></script>
          </head>
          <body>
            <div id="root"></div>
          </body>
        </html>
        HTML);
    config(['site.website.index_path' => $index, 'site.website.base_path' => '', 'app.website_base_url' => 'https://parkoursyria.com']);
});

it('serves a blog post with its own meta, open graph, json-ld and content', function () {
    $post = BlogPost::query()->where('publish', true)->firstOrFail();
    $post->translateOrNew('ar')->author = 'سامر الحلبي';
    $post->save();

    $html = $this->get('/blog/'.rawurlencode($post->slug))->assertOk()->getContent();

    expect($html)
        ->toContain('<title>'.e($post->translate('ar')->seo_title ?: $post->translate('ar')->title))
        ->toContain('<link rel="canonical" href="https://parkoursyria.com/blog/'.rawurlencode($post->slug).'" />')
        ->toContain('<meta property="og:type" content="article" />')
        ->toContain('"@type":"BlogPosting"')
        ->toContain('"author":{"@type":"Person","name":"سامر الحلبي"}')
        ->toContain('<div id="root"><article><h1>')
        ->not->toContain('content="generic"')
        ->not->toContain('<title>generic</title>');
});

it('prerenders the beginner path with every published lesson', function () {
    $html = $this->get('/path')->assertOk()->getContent();

    Lesson::query()->where('publish', true)->get()->each(
        fn (Lesson $lesson) => expect($html)->toContain('href="/path/'.rawurlencode($lesson->slug).'"')
    );
});

it('prerenders the key pages from the scope', function (string $path) {
    $html = $this->get($path)->assertOk()->getContent();

    expect($html)->toMatch('#<div id="root"><h1>[^<]+</h1>#u');
})->with(['/', '/what-is-parkour', '/book', '/about']);

it('describes upcoming events as schema.org events', function () {
    $this->get('/events')->assertOk()->assertSee('"@type":"Event"', false);
});

it('answers an unknown or unpublished page with a 404 that is not indexed', function () {
    Lesson::query()->where('slug', '2')->update(['publish' => false]);

    $this->get('/path/2')->assertNotFound()->assertSee('<meta name="robots" content="noindex" />', false);
    $this->get('/no-such-page')->assertNotFound();
});

it('strips scripts and handlers from admin html before serving it', function () {
    $post = BlogPost::query()->where('publish', true)->firstOrFail();
    $post->translateOrNew('ar')->body = '<p onclick="steal()">نص</p><script>alert(1)</script><a href="javascript:alert(1)">x</a>';
    $post->save();

    $html = $this->get('/blog/'.rawurlencode($post->slug))->assertOk()->getContent();

    expect($html)->not->toContain('steal()')->not->toContain('alert(1)')->toContain('<p>نص</p>');
});

it('keeps the editor colors and alignment but drops other inline styles', function () {
    $post = BlogPost::query()->where('publish', true)->firstOrFail();
    $post->translateOrNew('ar')->body = '<h2 style="text-align: center">عنوان</h2>'
        .'<p><span style="color: #dc2626">أحمر</span> <mark data-color="#fef08a" style="background-color: #fef08a; color: inherit">مظلل</mark></p>'
        .'<p style="position: fixed; background-image: url(https://evil.test/x.png)">نص</p>';
    $post->save();

    $html = $this->get('/blog/'.rawurlencode($post->slug))->assertOk()->getContent();

    expect($html)
        ->toContain('<h2 style="text-align: center">عنوان</h2>')
        ->toContain('<span style="color: #dc2626">أحمر</span>')
        ->toContain('style="background-color: #fef08a; color: inherit"')
        ->toContain('<p>نص</p>')
        ->not->toContain('position: fixed')
        ->not->toContain('evil.test');
});

it('shows a content edit on the next request', function () {
    $this->get('/about')->assertOk();

    $page = Page::query()->where('key', 'about')->firstOrFail();
    $page->translateOrNew('ar')->seo_title = 'عنوان جديد للصفحة';
    $page->save();

    $this->get('/about')->assertSee('<title>عنوان جديد للصفحة | ', false);
});

it('keeps the api and the seo files out of the website route', function () {
    $this->getJson('/api/lessons')->assertOk()->assertJsonPath('success', true);
    $this->get('/robots.txt')->assertOk()->assertSee('Sitemap: https://parkoursyria.com/sitemap.xml', false);
    $this->get('/sitemap.xml')->assertOk()->assertHeader('Content-Type', 'application/xml; charset=UTF-8');
});
