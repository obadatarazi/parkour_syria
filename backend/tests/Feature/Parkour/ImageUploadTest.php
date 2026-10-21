<?php

use App\Constant\Upload;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

it('shrinks and converts an uploaded photo to webp', function () {
    Storage::fake('public');
    $this->actingAsSupervisor();

    $response = $this->post('/api/admin/lessons', [
        'translations' => ['ar' => ['title' => 'صورة كبيرة']],
        'image' => UploadedFile::fake()->image('big.jpg', 3000, 2000),
    ], ['Accept' => 'application/json'])->assertCreated();

    $path = str($response->json('data.imageFileUrl'))->after('/storage/')->toString();
    expect($path)->toEndWith('.webp');

    [$width, $height] = getimagesizefromstring(Storage::disk('public')->get($path));
    expect([$width, $height])->toBe([1920, 1280]);
});

it('stores an svg as sent', function () {
    Storage::fake('public');
    $this->actingAsSupervisor();

    $svg = UploadedFile::fake()->createWithContent(
        'logo.svg',
        '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10"/></svg>',
    );

    $response = $this->post('/api/admin/lessons', [
        'translations' => ['ar' => ['title' => 'شعار']],
        'image' => $svg,
    ], ['Accept' => 'application/json'])->assertCreated();

    expect($response->json('data.imageFileUrl'))->toEndWith('.svg');
});

it('refuses an image over the upload limit', function () {
    $this->actingAsSupervisor();

    $this->post('/api/admin/lessons', [
        'translations' => ['ar' => ['title' => 'كبيرة جداً']],
        'image' => UploadedFile::fake()->image('huge.jpg')->size(Upload::MAX_IMAGE_KB + 1),
    ], ['Accept' => 'application/json'])->assertUnprocessable();
});
