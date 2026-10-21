<?php

namespace Database\Seeders;

use App\Constant\RoleCode;
use Spatie\Permission\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * The standard roles. Their permissions are synced by `app:update-admin-roles`, not here, so a
     * new PermissionType reaches them on the next deploy without reseeding.
     */
    public function run(): void
    {
        $roles = [
            // Everything, settings, users and roles included.
            ['name' => 'super-admin', 'code' => RoleCode::SuperAdmin->value],
            // The site's content only: pages, sliders, lessons, areas, directory, events,
            // suggestions and the blog.
            ['name' => 'supervisor', 'code' => RoleCode::Supervisor->value],
            // Kept for the dormant shop.
            ['name' => 'customer', 'code' => RoleCode::Customer->value],
        ];

        foreach ($roles as $role) {
            Role::query()->firstOrCreate(
                ['code' => $role['code']],
                ['name' => $role['name'], 'guard_name' => 'api', 'standard' => true]
            );
        }
    }
}
