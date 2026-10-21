<?php

use App\Constant\RoleCode;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Laravel\Passport\Passport;

/**
 * A role named after its permissions, for the accounts these tests sign in with.
 *
 * @param list<string> $permissions
 */
function roleWith(string $code, array $permissions): Role
{
    $role = new Role(['name' => strtolower($code), 'standard' => 0]);
    $role->guard_name = 'api';
    $role->code = $code;
    $role->save();
    $role->syncPermissions(Permission::query()->whereIn('name', $permissions)->get());

    return $role;
}

function adminWithRoles(string $email, Role ...$roles): User
{
    $user = User::query()->create(['email' => $email, 'password' => bcrypt('irrelevant'), 'type' => 'ADMIN', 'active' => true]);
    $user->syncRoles($roles);

    return $user->fresh();
}

function systemRoleId(RoleCode $code): int
{
    return (int) Role::query()->where('code', $code->value)->value('id');
}

it('stops a user editor from granting itself super admin', function () {
    $editor = adminWithRoles('editor@example.test', roleWith('USER_EDITOR', ['PERMISSION_UPDATE_USER']));
    Passport::actingAs($editor, [], 'api');

    $this->putJson("/api/admin/users/{$editor->id}", ['roles' => [systemRoleId(RoleCode::SuperAdmin)]])->assertForbidden();

    expect($editor->fresh()->hasRole(Role::query()->where('code', RoleCode::SuperAdmin->value)->first()))->toBeFalse();
});

it('needs role management to change anyone\'s roles', function () {
    $editor = adminWithRoles('editor@example.test', roleWith('USER_EDITOR', ['PERMISSION_UPDATE_USER', 'PERMISSION_CREATE_USER']));
    $plain = adminWithRoles('plain@example.test');
    Passport::actingAs($editor, [], 'api');

    $this->putJson("/api/admin/users/{$plain->id}", ['roles' => [$editor->roles->first()->id]])->assertForbidden();
    $this->postJson('/api/admin/users', [
        'email' => 'new@example.test', 'password' => 'Secret123!', 'password_confirmation' => 'Secret123!',
        'type' => 'ADMIN', 'roles' => [$editor->roles->first()->id],
    ])->assertForbidden();
});

it('lets a user editor edit an account it outranks without touching roles', function () {
    $editor = adminWithRoles('editor@example.test', roleWith('USER_EDITOR', ['PERMISSION_UPDATE_USER']));
    $plain = adminWithRoles('plain@example.test');
    Passport::actingAs($editor, [], 'api');

    $this->putJson("/api/admin/users/{$plain->id}", ['full_name' => 'Renamed', 'roles' => []])->assertOk();

    expect($plain->fresh()->full_name)->toBe('Renamed');
});

it('stops a user editor from resetting a super admin\'s password', function () {
    $editor = adminWithRoles('editor@example.test', roleWith('USER_EDITOR', ['PERMISSION_UPDATE_USER', 'PERMISSION_DELETE_USER']));
    $superAdmin = User::query()->whereHas('roles', fn ($q) => $q->where('code', RoleCode::SuperAdmin->value))->firstOrFail();
    Passport::actingAs($editor, [], 'api');

    $this->putJson("/api/admin/users/{$superAdmin->id}", ['password' => 'Takeover1!', 'password_confirmation' => 'Takeover1!'])->assertForbidden();
    $this->postJson('/api/admin/users/bulk-delete', ['ids' => [$superAdmin->id]])->assertForbidden();

    expect(User::query()->whereKey($superAdmin->id)->exists())->toBeTrue();
});

it('keeps super admin grants to super admins', function () {
    $roleAdmin = adminWithRoles('roles@example.test', roleWith('ROLE_ADMIN', ['MANAGE_ROLE', 'MANAGE_USER']));
    $plain = adminWithRoles('plain@example.test');
    Passport::actingAs($roleAdmin, [], 'api');

    $this->putJson("/api/admin/users/{$plain->id}", ['roles' => [systemRoleId(RoleCode::SuperAdmin)]])->assertForbidden();
});

it('never lets a role carry a permission its author lacks', function () {
    $roleAdmin = adminWithRoles('roles@example.test', roleWith('ROLE_ADMIN', ['MANAGE_ROLE']));
    Passport::actingAs($roleAdmin, [], 'api');
    $foreign = Permission::query()->where('name', 'MANAGE_USER')->value('id');

    $this->postJson('/api/admin/roles', ['name' => 'sneaky', 'standard' => true, 'permissions' => [$foreign]])->assertForbidden();
    $this->putJson('/api/admin/roles/' . $roleAdmin->roles->first()->id, ['permissions' => [$foreign]])->assertForbidden();
});

it('lets the super admin assign roles to others but not to itself', function () {
    $superAdmin = $this->actingAsSuperAdmin();
    $plain = adminWithRoles('plain@example.test');

    $this->putJson("/api/admin/users/{$plain->id}", ['roles' => [systemRoleId(RoleCode::Supervisor)]])->assertOk();
    $this->putJson("/api/admin/users/{$superAdmin->id}", ['roles' => [systemRoleId(RoleCode::Supervisor)]])->assertForbidden();

    expect($superAdmin->fresh()->roles->pluck('code')->all())->toBe([RoleCode::SuperAdmin->value]);
});

it('refuses to delete a system role, one at a time or in bulk', function () {
    $this->actingAsSuperAdmin();
    $id = systemRoleId(RoleCode::SuperAdmin);

    $this->deleteJson("/api/admin/roles/{$id}")->assertStatus(422);
    $this->postJson('/api/admin/roles/bulk-delete', ['ids' => [$id]])->assertStatus(422);

    expect(Role::query()->whereKey($id)->exists())->toBeTrue();
});

it('still bulk deletes custom roles', function () {
    $this->actingAsSuperAdmin();
    $custom = roleWith('THROWAWAY', []);

    $this->postJson('/api/admin/roles/bulk-delete', ['ids' => [$custom->id]])->assertOk();

    expect(Role::query()->whereKey($custom->id)->exists())->toBeFalse();
});

it('keeps a system role\'s code when it is renamed', function () {
    $this->actingAsSuperAdmin();
    $id = systemRoleId(RoleCode::SuperAdmin);

    $this->putJson("/api/admin/roles/{$id}", ['name' => 'Owner'])->assertOk();

    expect(Role::query()->whereKey($id)->value('code'))->toBe(RoleCode::SuperAdmin->value);
});

it('locks the super admin permission set', function () {
    $this->actingAsSuperAdmin();
    $id = systemRoleId(RoleCode::SuperAdmin);
    $one = Permission::query()->where('name', 'MANAGE_LESSON')->value('id');

    $this->putJson("/api/admin/roles/{$id}", ['permissions' => [$one]])->assertStatus(422);
});
