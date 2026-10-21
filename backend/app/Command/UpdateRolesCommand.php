<?php

namespace App\Command;

use App\Constant\PermissionType;
use App\Models\Permission;
use App\Services\RoleService;
use Illuminate\Database\QueryException;
use Spatie\Permission\PermissionRegistrar;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:update-admin-roles',
    description: 'Sync PermissionType into the api guard and attach them to the super-admin and supervisor roles',
)]
class UpdateRolesCommand extends Command
{
    public function __construct(protected RoleService $roleService, ?string $name = null)
    {
        parent::__construct($name);
    }

    protected function configure(): void
    {
        $this
            ->addArgument('arg1', InputArgument::OPTIONAL, 'Argument description')
            ->addOption('option1', null, InputOption::VALUE_NONE, 'Option description');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        // Spatie's findOrCreate reads a permission cache. A stale cache can miss a row that
        // already exists in MySQL and then INSERT → duplicate key on deploy.
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = PermissionType::getAllPermissions();

        foreach ($permissions as $permission) {
            $this->ensurePermission($permission);
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $this->roleService->getSuperAdminRoleGroup()?->syncPermissions($permissions);

        // The supervisor edits the site's content and nothing else: no settings, users or roles.
        $this->roleService->getSupervisorRoleGroup()?->syncPermissions(PermissionType::getSupervisorPermissions());

        $io->success('Roles Updated Successfully');

        return Command::SUCCESS;
    }

    private function ensurePermission(string $name): void
    {
        try {
            Permission::query()->firstOrCreate([
                'name' => $name,
                'guard_name' => 'api',
            ]);
        } catch (QueryException $exception) {
            // Parallel deploys can still race firstOrCreate; treat unique as already synced.
            if (! $this->isDuplicatePermissionException($exception)) {
                throw $exception;
            }
        }
    }

    private function isDuplicatePermissionException(QueryException $exception): bool
    {
        return $exception->errorInfo[1] === 1062
            || str_contains($exception->getMessage(), 'permissions_name_guard_name_unique');
    }
}
