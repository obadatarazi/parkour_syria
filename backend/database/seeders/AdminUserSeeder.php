<?php

namespace Database\Seeders;

use App\Constant\RoleCode;
use App\Enum\UserType;
use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class AdminUserSeeder extends Seeder
{
    /**
     * One SuperAdmin and one Supervisor account. Credentials come from SEED_* in .env, see
     * .env.example, and fall back to local-only defaults.
     */
    public function run(): void
    {
        $accounts = [
            [
                'full_name' => 'Parkour Syria Admin',
                'email' => env('SEED_SUPER_ADMIN_EMAIL', 'admin@parkoursyria.com'),
                'password' => env('SEED_SUPER_ADMIN_PASSWORD', 'password'),
                'role' => RoleCode::SuperAdmin,
            ],
            [
                'full_name' => 'Parkour Syria Supervisor',
                'email' => env('SEED_SUPERVISOR_EMAIL', 'supervisor@parkoursyria.com'),
                'password' => env('SEED_SUPERVISOR_PASSWORD', 'password'),
                'role' => RoleCode::Supervisor,
            ],
        ];

        foreach ($accounts as $account) {
            // The fallback is a known word. Anywhere but a developer machine the env has to set a real one.
            if (!app()->environment(['local', 'testing']) && (blank($account['password']) || $account['password'] === 'password')) {
                throw new \RuntimeException("Set the seeded account passwords (SEED_*_PASSWORD) before seeding {$account['email']}.");
            }

            $user = User::query()->firstOrNew(['email' => $account['email']]);
            $user->full_name = $account['full_name'];
            $user->password = bcrypt($account['password']);
            $user->type = UserType::ADMIN->value;
            $user->active = true;
            $user->verified_at = now();
            $user->save();

            $user->syncRoles([Role::query()->where('code', $account['role']->value)->firstOrFail()]);
        }
    }
}
