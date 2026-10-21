<?php

namespace App\Services;

use App\Models\Coupon;

class CouponService extends BaseService
{
    public function __construct()
    {
        $this->model = Coupon::class;
        parent::__construct();
    }
}
