<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Enum Language Lines
    |--------------------------------------------------------------------------
    |
    | The following language lines are used during Enum for various
    | messages that we need to display to the user. You are free to modify
    | these language lines according to your application's requirements.
    |
     */

    'test_key' => 'Test Key',

    'EMAIL' => 'Email',
    'LINK' => 'Link',
    'NUMBER' => 'Number',
    'PHONE_NUMBER' => 'Phone Number',
    'TEXT' => 'Text',

    'MALE' => 'Male',
    'FEMALE' => 'Female',

    'ADMIN' => 'Admin',
    'CUSTOMER' => 'Customer',
    'REGISTER_CUSTOMER_ACCOUNT' => 'New customer registered',
    'LOW_STOCK_ALERT' => 'Low stock alert',
    'PRODUCT_OUT_OF_STOCK' => 'Product out of stock',
    'ORDER_CREATED' => 'New order received',
    'CREATE_PRODUCT_REVIEW' => 'New product review',
    'PRESCRIPTION_CREATED' => 'New prescription uploaded',
    'CARE_PLAN_CREATED' => 'Care Plan started',
    'CARE_PLAN_AUTO_PAUSED' => 'Care Plan auto-paused',
    'CARE_PLAN_INSUFFICIENT_STOCK' => 'Care Plan insufficient stock',
    'CARE_PLAN_PRODUCT_REMOVED_ADMIN' => 'Product removed from Care Plans',
    'CARE_PLAN_PRODUCT_UNAVAILABLE' => 'Care Plan product unavailable',
    'CREATE_CONTACT_US' => 'New contact request',
    'ORDER_PAYMENT_FAILED' => 'Order payment failed',
    'CARE_PLAN_PAYMENT_FAILED' => 'Care Plan payment failed',
    'CARE_PLAN_CANCELLED' => 'Care Plan cancelled',

    'MOBILE' => 'Mobile',
    'DESKTOP' => 'Desktop',

    'SIMPLE' => 'Simple',
    'VARIABLE_PRODUCT' => 'Variable Product',

    'OUT_OF_STOCK' => 'Out of Stock',
    'LOW_STOCK' => 'Low Stock',
    'IN_STOCK' => 'In Stock',

    'INCREMENT' => 'Increment',
    'DECREMENT' => 'Decrement',
    'SET' => 'Set',

    'PENDING' => 'Pending',
    'APPROVE' => 'Approved',
    'REJECT' => 'Rejected',
    'APPROVED' => 'Approved',
    'REJECTED' => 'Rejected',
    'PERCENTAGE' => 'Percentage',
    'BOOLEAN' => 'Boolean',

    'PENDING_PAYMENT' => 'Pending Payment',
    'PROCESSING' => 'Processing',
    'READY_TO_PREPARE' => 'Ready to prepare',
    'ON_HOLD' => 'On Hold',
    'COMPLETED' => 'Completed',
    'CANCELLED' => 'Cancelled',
    'REFUNDED' => 'Refunded',
    'ON_THE_WAY_TO_DELIVER_TODAY' => 'On the way to deliver today',

    'GUEST' => 'Guest',

    'PAID' => 'Paid',
    'UNPAID' => 'Unpaid',
    'FAILED' => 'Failed',
    'EXPIRED' => 'Expired',

    'WEBSITE' => 'Website',
    'WHATSAPP' => 'WhatsApp',

    'CASH_ON_DELIVERY' => 'Cash on Delivery',
    'MYFATOORAH' => 'MyFatoorah',
    'HESABE' => 'Hesabe',

    // HesabePaymentMethod: the method a Hesabe checkout is pinned to. HOSTED is the absence of a
    // choice, the customer picks on Hesabe's own page, so it is labelled as that rather than as a
    // method of its own.
    'HOSTED' => 'All payment methods',
    'KNET' => 'KNET',
    'VISA_MASTER' => 'Visa / Mastercard',
    'VISA_MASTER_CYBS' => 'Visa / Mastercard',
    'AMEX' => 'American Express',
    'AMEX_MPGS' => 'American Express',
    'APPLE_PAY' => 'Apple Pay',
    'APPLE_PAY_CYBS' => 'Apple Pay',
    'APPLE_PAY_KNET_DEBIT' => 'Apple Pay (KNET Debit)',
    'APPLE_PAY_KNET_CREDIT' => 'Apple Pay (KNET Credit)',
    'APPLE_PAY_KNET_INTERNATIONAL' => 'Apple Pay (KNET International)',
    'APPLE_PAY_AMEX_INTERNATIONAL' => 'Apple Pay (Amex International)',
    'GOOGLE_PAY' => 'Google Pay',
    'DEEMA' => 'Deema',
    'SAMSUNG_PAY' => 'Samsung Pay',

    'ORDER' => 'Order',
    'STOCK' => 'Stock',
    'RX' => 'Prescription',
    // 'CUSTOMER' is already declared above for UserType, it carries the same label here.
    'PAYMENT' => 'Payment',
    'PROMO' => 'Promotion',
    'REVIEW' => 'Review',
    'LOYALTY' => 'Loyalty',
    'CUSTOM' => 'Custom',
    'WARNING' => 'Warning',
    'ERROR' => 'Error',

    // Coupons. 'PERCENTAGE' and 'EXPIRED' are already declared above, they carry the same label here.
    'FIXED' => 'Fixed',
    'FREE_SHIPPING' => 'Free Shipping',

    'PRODUCT' => 'Product',
    'CATEGORY' => 'Category',
    'BRAND' => 'Brand',
    'TAG' => 'Tag',
    'KEYWORD' => 'Keyword',

    'CART' => 'Whole cart',
    'ITEMS' => 'Selected items',
    'SHIPPING' => 'Shipping',

    'ACTIVE' => 'Active',
    'IN_ACTIVE' => 'Inactive',
    'REACH_THE_LIMIT' => 'Reached the limit',
    'DRAFT' => 'Draft',

    'EVERYONE' => 'Everyone',
    'SPECIFIC_USERS' => 'Specific Users',

    // Care Plan
    'PAUSED' => 'Paused',
    'SCHEDULED' => 'Scheduled',
    'AWAITING_PAYMENT' => 'Awaiting Payment',
    'ORDERED' => 'Ordered',
    'SKIPPED' => 'Skipped',
    'WEEKLY' => 'Weekly',
    'BIWEEKLY' => 'Every 2 weeks',
    'MONTHLY' => 'Monthly',
    'CARE_PLAN' => 'Care Plan',
    'SUNDAY' => 'Sunday',
    'MONDAY' => 'Monday',
    'TUESDAY' => 'Tuesday',
    'WEDNESDAY' => 'Wednesday',
    'THURSDAY' => 'Thursday',
    'FRIDAY' => 'Friday',
    'SATURDAY' => 'Saturday',
    'INSUFFICIENT_STOCK' => 'Insufficient stock',
    'PAYMENT_WINDOW_EXPIRED' => 'Payment window expired',
    'ADMIN_OVERRIDE' => 'Admin override',
    'PRODUCT_UNAVAILABLE' => 'Product unavailable',
    'CUSTOMER_CANCELLED' => 'Cancelled by customer',
    'CUSTOMER_SKIPPED' => 'Skipped by customer',
    'AUTO_PAUSED_MISSED_PAYMENTS' => 'Auto-paused after missed payments',
    'CREATED' => 'Created',
    'ITEM_ADDED' => 'Item added',
    'ITEM_REMOVED' => 'Item removed',
    'FREQUENCY_CHANGED' => 'Frequency changed',
    'ADDRESS_CHANGED' => 'Address changed',
    'RESUMED' => 'Resumed',
    'CYCLE_ORDERED' => 'Cycle ordered',
    'CYCLE_FAILED' => 'Cycle failed',
    'PAYMENT_REMINDER' => 'Payment reminder',
    'AUTO_PAUSED' => 'Auto paused',

    'REGISTRATION' => 'Registration',
    'MILESTONE' => 'Milestone',
    'EARN' => 'Earn',
    'REDEEM' => 'Redeem',
    'ADJUST' => 'Adjust',
    'USED' => 'Used',

    // Promotions. 'PERCENTAGE' is already declared above and carries the same label here.
    'BOGO' => 'Buy X get Y free',

    'ABANDONED' => 'Abandoned',
    'CONVERTED' => 'Converted',

    'GENERAL' => 'General',
    'CALL' => 'Call',
    'COMPLAINT' => 'Complaint',
    'DELIVERY' => 'Delivery',

    // Parkour Syria
    'place' => 'Place',
    'coach' => 'Coach',
    'team' => 'Team',
    'event' => 'Event',
    'workshop' => 'Workshop',
    'gathering' => 'Gathering',
    'pending' => 'Pending',
    'accepted' => 'Accepted',
    'rejected' => 'Rejected',
];
