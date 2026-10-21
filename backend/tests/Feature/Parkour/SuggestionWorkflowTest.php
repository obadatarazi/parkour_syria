<?php

use App\Models\Area;
use App\Models\DirectoryEntry;
use App\Models\Event;
use App\Models\Suggestion;
use Illuminate\Http\UploadedFile;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Support\Facades\Storage;

// The public form is limited to a few posts a minute, more than these tests send together.
beforeEach(fn () => $this->withoutMiddleware(ThrottleRequests::class));

function suggestPlace(array $overrides = []): int
{
    return test()->postJson('/api/suggestions', array_merge([
        'type' => 'place',
        'name' => 'حديقة السبكي',
        'areaId' => Area::query()->where('slug', 'abu-rummaneh')->value('id'),
        'description' => 'مساحة واسعة',
        'contact' => '+963 999 000 777',
        'safetyAccepted' => true,
    ], $overrides))->assertCreated()->json('data.id');
}

it('takes a suggestion from a visitor and never publishes it on its own', function () {
    $id = suggestPlace();

    expect(Suggestion::find($id)->status)->toBe('pending');
    $this->getJson('/api/directory-entries?search='.urlencode('السبكي'))->assertJsonPath('pagination.totalItems', 0);
});

it('refuses a suggestion without the safety consent, in arabic', function () {
    $this->postJson('/api/suggestions', ['type' => 'place', 'name' => 'x'])
        ->assertUnprocessable()
        ->assertJsonPath('error', 'يجب الموافقة على إقرار الأمان.');
});

it('promotes an accepted place into the directory', function () {
    $id = suggestPlace();
    $this->actingAsSupervisor();

    $this->postJson("/api/admin/suggestions/{$id}/accept", ['verified' => true, 'slug' => 'sabki-park'])
        ->assertOk()
        ->assertJsonPath('data.status', 'accepted')
        ->assertJsonPath('data.promotedType', 'directory_entries');

    $entry = DirectoryEntry::query()->where('slug', 'sabki-park')->firstOrFail();
    expect($entry->whatsapp)->toBe('963999000777')
        ->and($entry->verified)->toBeTrue()
        ->and($entry->translate('ar')->name)->toBe('حديقة السبكي');

    // A reviewed suggestion can't be reviewed or edited again.
    $this->postJson("/api/admin/suggestions/{$id}/accept")->assertUnprocessable();
    $this->putJson("/api/admin/suggestions/{$id}", ['name' => 'x'])->assertUnprocessable();
});

it('promotes an accepted event into the events', function () {
    $id = suggestPlace(['type' => 'event', 'name' => 'قفز ليلي', 'startsAt' => now()->addWeek()->toDateTimeString()]);
    $this->actingAsSupervisor();

    $this->postJson("/api/admin/suggestions/{$id}/accept", ['eventType' => 'workshop'])
        ->assertOk()
        ->assertJsonPath('data.promotedType', 'events');

    expect(Event::query()->whereTranslation('title', 'قفز ليلي')->first()?->type)->toBe('workshop');
});

it('needs a reason to reject', function () {
    $id = suggestPlace();
    $this->actingAsSupervisor();

    $this->postJson("/api/admin/suggestions/{$id}/reject", [])->assertUnprocessable();
    $this->postJson("/api/admin/suggestions/{$id}/reject", ['rejectReason' => 'مكان غير آمن'])
        ->assertOk()
        ->assertJsonPath('data.status', 'rejected')
        ->assertJsonPath('data.rejectReason', 'مكان غير آمن');
});

it('keeps the visitor photo and gives the accepted entry its own copy', function () {
    Storage::fake('public');

    $id = $this->post('/api/suggestions', [
        'type' => 'place',
        'name' => 'ساحة الأمويين',
        'safetyAccepted' => '1',
        'image' => UploadedFile::fake()->image('spot.jpg', 800, 600),
    ], ['Accept' => 'application/json'])->assertCreated()->json('data.id');

    $suggestionImage = Suggestion::find($id)->image_file_url;
    expect($suggestionImage)->not->toBeNull();

    $this->actingAsSupervisor();
    $this->postJson("/api/admin/suggestions/{$id}/accept", ['slug' => 'umayyad-square'])->assertOk();

    $entryImage = DirectoryEntry::query()->where('slug', 'umayyad-square')->value('image_file_url');
    expect($entryImage)->not->toBeNull()->not->toBe($suggestionImage)->toContain('/directory-entries/');
    Storage::disk('public')->assertExists(str($entryImage)->after('/storage/'));
});

it('refuses an svg from the public form', function () {
    $this->post('/api/suggestions', [
        'type' => 'place',
        'name' => 'x',
        'safetyAccepted' => '1',
        'image' => UploadedFile::fake()->createWithContent('x.svg', '<svg xmlns="http://www.w3.org/2000/svg"/>'),
    ], ['Accept' => 'application/json'])->assertUnprocessable();
});
