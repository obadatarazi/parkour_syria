<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Laravel\Passport\Client;
use Laravel\Passport\ClientRepository;

class PassportClientSeeder extends Seeder
{
    /**
     * The personal access client every dashboard token is minted with (AuthService::createToken).
     * Created once, so `migrate --seed` alone gives a working login. The signing keys still come
     * from `php artisan passport:keys`.
     */
    public function run(): void
    {
        $exists = Client::query()
            ->get()
            ->contains(fn (Client $client) => $client->hasGrantType('personal_access'));

        if (!$exists) {
            app(ClientRepository::class)->createPersonalAccessGrantClient('Parkour Syria Personal Access Client', 'users');
        }
    }
}
