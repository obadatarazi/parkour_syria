<?php

use App\Models\Lesson;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

it('creates, updates and deletes a lesson from the dashboard', function () {
    Storage::fake('public');
    $this->actingAsSupervisor();

    $created = $this->post('/api/admin/lessons', [
        'translations' => [
            'ar' => ['title' => 'الدحرجة المتقدمة', 'summary' => 'ملخص'],
            'en' => ['title' => 'Advanced roll'],
        ],
        'sortOrder' => 8,
        'publish' => 'true',
        'image' => UploadedFile::fake()->image('roll.jpg'),
    ], ['Accept' => 'application/json']);

    $created->assertCreated()
        ->assertJsonPath('data.slug', 'advanced-roll')
        ->assertJsonPath('data.translations.ar.title', 'الدحرجة المتقدمة');

    $id = $created->json('data.id');
    $image = $created->json('data.imageFileUrl');
    Storage::disk('public')->assertExists(str($image)->after('/storage/'));

    $this->putJson("/api/admin/lessons/{$id}", [
        'translations' => ['ar' => ['title' => 'الدحرجة']],
    ])->assertOk()
        ->assertJsonPath('data.title', 'الدحرجة')
        // A reworded title never moves the url.
        ->assertJsonPath('data.slug', 'advanced-roll');

    $this->deleteJson("/api/admin/lessons/{$id}")->assertOk();
    expect(Lesson::find($id))->toBeNull();
    Storage::disk('public')->assertMissing(str($image)->after('/storage/'));
});

it('requires the arabic translation', function () {
    $this->actingAsSupervisor();

    $this->postJson('/api/admin/lessons', [
        'translations' => ['en' => ['title' => 'English only']],
    ])->assertUnprocessable();
});

it('never shows an unpublished lesson on the website', function () {
    Lesson::query()->where('slug', '2')->update(['publish' => false]);

    $this->getJson('/api/lessons/2')->assertNotFound();
    $this->getJson('/api/lessons')->assertOk()->assertJsonPath('pagination.totalItems', 6);
});
