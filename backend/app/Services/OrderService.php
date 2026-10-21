<?php

namespace App\Services;

use App\Models\Order;

class OrderService extends BaseService
{
    public function __construct()
    {
        $this->model = Order::class;
        $this->withRelations = ['items', 'user', 'currency.translations'];
        $this->listRelations = ['user'];
        $this->listCounts = ['items'];
        parent::__construct();
    }
}
