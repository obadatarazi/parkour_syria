<?php

namespace App\Services;

use App\Constant\PermissionType;
use App\Constant\RoleCode;
use App\Http\QueryFilter\QueryFilter;
use App\Models\Role;
use App\Models\User;

class RoleService extends BaseService
{
    public function __construct()
    {
        $this->model = Role::class;
        parent::__construct();
    }

    /**
     * A role row shows a name and how many permissions the role carries. Reading the permissions
     * themselves was a query per row for a number, so the number comes down as a count instead.
     *
     * @see RoleResource for the field it ends up in
     */
    public function findAllPaginated(QueryFilter $modelFilter)
    {
        $filters = $modelFilter->getFiltersFields();
        $page = $this->resolvePage($filters);
        $limit = $this->resolveLimit($filters);

        $query = $this->model::query()
            ->withCount('permissions')
            ->filter($modelFilter);

        return $query->paginate($limit, ['*'], 'page', $page);
    }

    public function getAll(): array
    {
        $permissions = PermissionType::activeCases();

        return array_map(function (PermissionType $permission) {
            return $permission->getPermission();
        }, $permissions);
    }

    public function getUserRoleGroup()
    {
        return Role::query()->where('code', RoleCode::Customer->value)->first();
    }

    public function getBySection(): array
    {
        $roles = PermissionType::activeCases();
        $rolesArray = [];
        foreach ($roles as $role) {
            $section = $role->getSection();
            if (count($rolesArray) == 0
                || $rolesArray[count($rolesArray) - 1]['section'] != $section)
                $rolesArray[] = [
                    'section' => $section,
                    'roles' => []
                ];
            $rolesArray[count($rolesArray) - 1]['roles'][] = [
                'role' => $role->getSection(),
                'name' => $role->getPermission(),
                'description' => $role->getDesc(),
            ];
        }
        return $rolesArray;
    }


    public function getSuperAdminRoleGroup()
    {
        return Role::query()->where('code', RoleCode::SuperAdmin->value)->first();
    }

    public function getSupervisorRoleGroup()
    {
        return Role::query()->where('code', RoleCode::Supervisor->value)->first();
    }

    public function add($data): Role
    {
        $role = new Role($data);
        $role->guard_name = 'api';
        $role->code = strtoupper(str_replace(' ', '_', $data['name']));

        $role->save();

        if (isset($data['permissions'])) {
            $role->syncPermissions($data['permissions']);
        }

        return $role;
    }

    public function update($data, $role)
    {
        if (isset($data['name'])) {
            $role->code = strtoupper(str_replace(' ', '_', $data['name']));
        }

        $role->update($data);
        $role->save();

        if (isset($data['permissions'])) {
            $role->syncPermissions($data['permissions']);
        }

        return $role;
    }

    public function assignRoleUser(User $user, $roles): void
    {
        $roles = Role::whereIn('id', $roles)->pluck('name')->toArray();

        $user->syncRoles($roles);
    }
}
