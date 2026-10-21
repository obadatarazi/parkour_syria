<?php

namespace App\Constant;

enum RoleCode: string
{
    case SuperAdmin = 'SUPER_ADMIN';
    case Supervisor = 'SUPERVISOR';
    case Customer = 'CUSTOMER';
}
