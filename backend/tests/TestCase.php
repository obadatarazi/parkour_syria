<?php

namespace Tests;

use App\Constant\RoleCode;
use App\Models\User;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\DB;
use Laravel\Passport\Passport;

abstract class TestCase extends BaseTestCase
{
    /**
     * Signs the request in as one of the seeded dashboard accounts, through the api guard the
     * Spatie permissions are granted under.
     */
    /**
     * Loads the website content from database/sql/parkour_content.sql, the same file a real
     * install imports. Its own transaction statements are dropped: the test already runs inside
     * one, and a COMMIT in the middle would end it.
     */
    protected function loadContent(): void
    {
        $sql = file_get_contents(database_path('sql/parkour_content.sql'));
        $sql = preg_replace('/^\s*(START TRANSACTION|COMMIT);\s*$/mi', '', $sql);

        DB::unprepared($sql);
    }

    protected function actingAsRole(RoleCode $role): User
    {
        $user = User::query()
            ->whereHas('roles', fn ($query) => $query->where('code', $role->value))
            ->firstOrFail();

        Passport::actingAs($user, [], 'api');

        return $user;
    }

    protected function actingAsSuperAdmin(): User
    {
        return $this->actingAsRole(RoleCode::SuperAdmin);
    }

    protected function actingAsSupervisor(): User
    {
        return $this->actingAsRole(RoleCode::Supervisor);
    }
}
