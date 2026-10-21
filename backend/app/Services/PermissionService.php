<?php

namespace App\Services;

use App\Models\Permission;
use Illuminate\Database\Eloquent\Collection;

class PermissionService extends BaseService
{
    public function __construct()
    {
        $this->model = Permission::class;
        parent::__construct();
    }

    public function getAllPermissions(): Collection
    {
        return Permission::all();
    }
}
