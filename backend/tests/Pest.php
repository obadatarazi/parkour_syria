<?php

use App\Models\Event;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
|
| Feature tests run against the MySQL database named in phpunit.xml (parkour_syria_testing), migrated
| once per run, seeded with the accounts and loaded with database/sql/parkour_content.sql before
| each test, each test wrapped in a transaction.
|
*/

pest()->extend(TestCase::class)
    ->use(RefreshDatabase::class)
    ->beforeEach(function () {
        $this->seed();
        $this->loadContent();

        // The file carries the real event dates, which pass. The tests want them all upcoming.
        Event::query()->update(['starts_at' => now()->addWeek()]);
    })
    ->in('Feature/Parkour');
