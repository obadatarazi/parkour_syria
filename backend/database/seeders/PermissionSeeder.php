<?php

namespace Database\Seeders;

use App\Constant\PermissionType;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(): void
    {
        foreach (PermissionType::getAllPermissions() as $permission)
            Permission::findOrCreate($permission, 'api');
    }
}
