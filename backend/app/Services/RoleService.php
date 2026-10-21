<?php

namespace App\Services;

use App\Constant\PermissionType;
use App\Constant\RoleCode;
use App\Http\QueryFilter\QueryFilter;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

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
                || $rolesArray[count($rolesArray) - 1]['section'] != $section) {
                $rolesArray[] = [
                    'section' => $section,
                    'roles' => [],
                ];
            }
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
        if (isset($data['permissions'])) {
            $this->assertCanGrantPermissions(auth()->user(), $data['permissions']);
        }

        $role = new Role($data);
        // Optional in the request, while the column has no default.
        $role->standard ??= false;
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
        if (isset($data['permissions'])) {
            $this->assertCanChangeRolePermissions(auth()->user(), $role, $data['permissions']);
        }

        // A system role keeps its code whatever it is renamed to, everything that looks it up uses it.
        if (isset($data['name']) && ! $role->isSystemRole()) {
            $role->code = strtoupper(str_replace(' ', '_', $data['name']));
        }

        $role->update($data);
        $role->save();

        if (isset($data['permissions'])) {
            $role->syncPermissions($data['permissions']);
        }

        return $role;
    }

    /**
     * System roles are never deleted. The guard lives here rather than in the controller so a bulk
     * delete, which goes through this method for every row, is held to it too.
     */
    public function delete(Model $object): void
    {
        abort_if($object->isSystemRole(), 422, __('exceptions.can_not_delete_system_role'));

        parent::delete($object);
    }

    public function assignRoleUser(User $user, $roles): void
    {
        $roles = Role::whereIn('id', $roles)->pluck('name')->toArray();

        $user->syncRoles($roles);
    }

    /**
     * Whether `$actor` may give `$target` exactly the roles in `$roleIds`. Resubmitting the roles a
     * user already has is not a change and always passes, so editing a user's other fields does not
     * need role rights.
     *
     * A change needs MANAGE_ROLE, never applies to the actor's own account, needs the Super Admin
     * role to hand out Super Admin, and cannot carry a permission the actor does not hold.
     *
     * @param  array<int, int|string>  $roleIds
     */
    public function assertCanAssignRoles(User $actor, ?User $target, array $roleIds): void
    {
        $requested = $this->normaliseIds($roleIds);
        $current = $target?->exists ? $this->normaliseIds($target->roles()->pluck('roles.id')->all()) : [];

        if ($requested === $current) {
            return;
        }

        $actorPermissions = $this->permissionNamesOf($actor);

        abort_unless(in_array(PermissionType::PermissionManageRole->getPermission(), $actorPermissions, true), 403, __('exceptions.role_change_forbidden'));
        abort_if($target?->exists && (int) $target->getKey() === (int) $actor->getKey(), 403, __('exceptions.own_roles_change_forbidden'));

        $roles = Role::query()->with('permissions')->whereIn('id', $requested)->get();

        $grantsSuperAdmin = $roles->contains(fn (Role $role) => $role->code === RoleCode::SuperAdmin->value);
        abort_if($grantsSuperAdmin && ! $actor->hasRole($this->getSuperAdminRoleGroup()), 403, __('exceptions.super_admin_grant_forbidden'));

        $granted = $roles->flatMap(fn (Role $role) => $role->permissions->pluck('name'))->unique()->all();
        abort_if(array_diff($granted, $actorPermissions) !== [], 403, __('exceptions.permission_escalation_forbidden'));
    }

    /**
     * Whether `$actor` may build a role carrying the permissions in `$permissionIds`: only out of
     * permissions the actor holds.
     *
     * @param  array<int, int|string>  $permissionIds
     */
    public function assertCanGrantPermissions(User $actor, array $permissionIds): void
    {
        $granted = Permission::query()->whereIn('id', $this->normaliseIds($permissionIds))->pluck('name')->all();

        abort_if(array_diff($granted, $this->permissionNamesOf($actor)) !== [], 403, __('exceptions.permission_escalation_forbidden'));
    }

    /**
     * The Super Admin role always carries every permission, so its set is not editable. A role the
     * actor holds is not editable by them either, or they could widen their own access.
     *
     * @param  array<int, int|string>  $permissionIds
     */
    public function assertCanChangeRolePermissions(User $actor, Role $role, array $permissionIds): void
    {
        $current = $this->normaliseIds($role->permissions()->pluck('permissions.id')->all());

        if ($current === $this->normaliseIds($permissionIds)) {
            return;
        }

        abort_if($role->code === RoleCode::SuperAdmin->value, 422, __('exceptions.super_admin_permissions_locked'));
        abort_if($actor->hasRole($role), 403, __('exceptions.own_role_permissions_forbidden'));

        $this->assertCanGrantPermissions($actor, $permissionIds);
    }

    /**
     * @return list<string>
     */
    public function permissionNamesOf(User $user): array
    {
        return $user->getAllPermissions()->pluck('name')->unique()->values()->all();
    }

    /**
     * @param  array<int, int|string>  $ids
     * @return list<int>
     */
    private function normaliseIds(array $ids): array
    {
        $ids = array_values(array_unique(array_map('intval', $ids)));
        sort($ids);

        return $ids;
    }
}
