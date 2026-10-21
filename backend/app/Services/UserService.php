<?php

namespace App\Services;

use App\Constant\RoleCode;
use App\Enum\UserType;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class UserService extends BaseService
{
    const UPLOAD_FOLDER = 'users';

    public function __construct(
        UploadFileService $uploadFileService,
        protected RoleService $roleService,
        protected TokenRevocationService $tokenRevocationService,
    ) {
        $this->model = User::class;
        $this->withRelations = ['roles'];
        $this->uploadFileService = $uploadFileService;
        parent::__construct();
    }

    /**
     * @throws \Exception
     */
    public function create($data): User
    {
        if (array_key_exists('roles', $data)) {
            $this->roleService->assertCanAssignRoles(auth()->user(), null, $data['roles'] ?? []);
        }

        // The dashboard shows a new account as active unless the switch is turned off, while the
        // column defaults to inactive. An account created without the field is the active one it showed.
        $data['active'] ??= true;

        $user = new User($data);

        $keyFileMaps = [
            'avatar_file_url' => 'avatar',
        ];

        if (isset($data['password'])) {
            $user->password = bcrypt($data['password']);
        }

        if (isset($data['avatar'])) {
            $this->uploadFileService->uploadFiles(
                $data,
                $keyFileMaps,
                $user,
                $this::UPLOAD_FOLDER
            );
        }

        $user->save();

        if (isset($data['roles'])) {
            $this->roleService->assignRoleUser($user, $data['roles']);
        }

        return $user->load(['roles']);
    }

    public function update($data, User|Model $user): User
    {
        $this->assertCanManageUser(auth()->user(), $user);

        if (array_key_exists('roles', $data)) {
            $this->roleService->assertCanAssignRoles(auth()->user(), $user, $data['roles'] ?? []);
        }

        $wasActive = (bool) $user->active;
        $rolesBefore = $user->roles()->pluck('roles.id')->sort()->values()->all();

        // A blank password field on an edit means "keep the current one", never an empty password.
        if (empty($data['password'])) {
            unset($data['password']);
        } else {
            $data['password'] = bcrypt($data['password']);
        }

        $user->update($data);

        $keyFileMaps = [
            'avatar_file_url' => 'avatar',
        ];

        if (isset($data['avatar'])) {
            $this->uploadFileService->updateFiles(
                $data,
                $keyFileMaps,
                $user,
                $this::UPLOAD_FOLDER
            );
        }

        $user->save();

        if (isset($data['roles'])) {
            $this->roleService->assignRoleUser($user, $data['roles']);
        }

        $rolesAfter = $user->roles()->pluck('roles.id')->sort()->values()->all();

        // A new password, a deactivation or a new set of roles ends every session the account has,
        // so nobody keeps working on what the change was meant to take away.
        if (isset($data['password']) || ($wasActive && ! $user->active) || $rolesBefore !== $rolesAfter) {
            $this->tokenRevocationService->revokeAll($user);
        }

        return $user->load(['roles']);
    }

    public function updateProfile($data, Model|User $user): User
    {
        $user->update($data);

        $keyFileMaps = [
            'avatar_file_url' => 'avatar',
        ];

        if (isset($data['avatar'])) {

            $this->uploadFileService->updateFiles(
                $data,
                $keyFileMaps,
                $user,
                $this::UPLOAD_FOLDER
            );
        }

        $user->save();

        return $user;
    }

    public function findByEmail($email): ?User
    {
        return User::query()->where('email', $email)->firstOrFail();
    }

    public function changePassword($data, $user): string
    {
        if (! Hash::check($data['current_password'], $user->password)) {
            throw new BadRequestHttpException(__('validation.incorrect_password'));
        }

        $user->update([
            'password' => Hash::make($data['new_password']),
        ]);

        // Every other session ends, the one the password was changed from stays signed in.
        $this->tokenRevocationService->revokeAll($user, $user->token()?->getKey());

        return __('validation.success_change_password');
    }

    public function getUserByRoleSuperAdmin()
    {
        return User::whereHas('roles', function ($query) {
            $query->where('code', RoleCode::SuperAdmin->value);
        })->get();
    }

    public function checkUserAccountAndEnsureDelete($user): bool
    {
        if ($user->type === UserType::ADMIN->value) {
            throw ValidationException::withMessages([
                __('exceptions.delete_ensure_account'),
            ]);
        }

        return false;
    }

    /**
     * An admin can delete other accounts but never the one they are signed in with, or the
     * dashboard would lock them out in the middle of the request.
     */
    public function delete(Model $object): void
    {
        abort_if((int) auth()->id() === (int) $object->getKey(), 422, __('exceptions.delete_own_account'));
        $this->assertCanManageUser(auth()->user(), $object);

        parent::delete($object);
    }

    /**
     * An admin only edits or deletes accounts that hold no permission they lack themselves.
     * Otherwise a user editor could reset a Super Admin's password and sign in as them.
     */
    public function assertCanManageUser(User $actor, User $target): void
    {
        $missing = array_diff(
            $this->roleService->permissionNamesOf($target),
            $this->roleService->permissionNamesOf($actor),
        );

        abort_if($missing !== [], 403, __('exceptions.user_outranks_actor'));
    }
}
