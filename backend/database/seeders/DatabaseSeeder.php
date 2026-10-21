<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Artisan;

class DatabaseSeeder extends Seeder
{
    /**
     * The platform only: the Passport client, the roles and permissions, and the dashboard
     * accounts. The website content is not seeded, it is loaded from
     * database/sql/parkour_content.sql (see the README).
     */
    public function run(): void
    {
        $this->call(PassportClientSeeder::class);
        $this->call(RoleSeeder::class);
        $this->call(PermissionSeeder::class);
        $this->call(AdminUserSeeder::class);

        // Dormant shop: a default currency so switching FEATURE_ECOMMERCE on starts from something.
        $this->call(CurrencySeeder::class);

        // Hands every live permission to SuperAdmin and the content ones to Supervisor.
        Artisan::call('app:update-admin-roles');
    }
}
