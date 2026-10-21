<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Validation Language Lines
    |--------------------------------------------------------------------------
    |
    | The following language lines contain the default error messages used by
    | the validator class. Some of these rules have multiple versions such
    | as the size rules. Feel free to tweak each of these messages here.
    |
    */

    'accepted' => 'يجب الموافقة على :attribute.',
    'accepted_if' => 'The :attribute field must be accepted when :other is :value.',
    'active_url' => 'The :attribute field must be a valid URL.',
    'after' => 'يجب أن يكون :attribute تاريخاً بعد :date.',
    'after_or_equal' => 'يجب أن يكون :attribute تاريخاً بعد أو يساوي :date.',
    'alpha' => 'The :attribute field must only contain letters.',
    'alpha_dash' => 'The :attribute field must only contain letters, numbers, dashes, and underscores.',
    'alpha_num' => 'The :attribute field must only contain letters and numbers.',
    'array' => 'يجب أن يكون :attribute مصفوفة.',
    'ascii' => 'The :attribute field must only contain single-byte alphanumeric characters and symbols.',
    'before' => 'The :attribute field must be a date before :date.',
    'before_or_equal' => 'The :attribute field must be a date before or equal to :date.',
    'between' => [
        'array' => 'The :attribute field must have between :min and :max items.',
        'file' => 'The :attribute field must be between :min and :max kilobytes.',
        'numeric' => 'The :attribute field must be between :min and :max.',
        'string' => 'The :attribute field must be between :min and :max characters.',
    ],
    'boolean' => 'يجب أن تكون قيمة :attribute صحيحة أو خاطئة.',
    'can' => 'The :attribute field contains an unauthorized value.',
    'confirmed' => 'تأكيد :attribute غير مطابق.',
    'contains' => 'The :attribute field is missing a required value.',
    'current_password' => 'The password is incorrect.',
    'date' => 'يجب أن يكون :attribute تاريخاً صالحاً.',
    'date_equals' => 'The :attribute field must be a date equal to :date.',
    'date_format' => 'The :attribute field must match the format :format.',
    'decimal' => 'The :attribute field must have :decimal decimal places.',
    'declined' => 'The :attribute field must be declined.',
    'declined_if' => 'The :attribute field must be declined when :other is :value.',
    'different' => 'The :attribute field and :other must be different.',
    'digits' => 'The :attribute field must be :digits digits.',
    'digits_between' => 'The :attribute field must be between :min and :max digits.',
    'dimensions' => 'The :attribute field has invalid image dimensions.',
    'distinct' => 'The :attribute field has a duplicate value.',
    'doesnt_end_with' => 'The :attribute field must not end with one of the following: :values.',
    'doesnt_start_with' => 'The :attribute field must not start with one of the following: :values.',
    'email' => 'يجب أن يكون :attribute بريداً إلكترونياً صالحاً.',
    'ends_with' => 'The :attribute field must end with one of the following: :values.',
    'enum' => 'The selected :attribute is invalid.',
    'exists' => ':attribute المحدد غير موجود.',
    'extensions' => 'The :attribute field must have one of the following extensions: :values.',
    'file' => 'يجب أن يكون :attribute ملفاً.',
    'filled' => 'The :attribute field must have a value.',
    'gt' => [
        'array' => 'The :attribute field must have more than :value items.',
        'file' => 'The :attribute field must be greater than :value kilobytes.',
        'numeric' => 'The :attribute field must be greater than :value.',
        'string' => 'The :attribute field must be greater than :value characters.',
    ],
    'gte' => [
        'array' => 'The :attribute field must have :value items or more.',
        'file' => 'The :attribute field must be greater than or equal to :value kilobytes.',
        'numeric' => 'The :attribute field must be greater than or equal to :value.',
        'string' => 'The :attribute field must be greater than or equal to :value characters.',
    ],
    'hex_color' => 'The :attribute field must be a valid hexadecimal color.',
    'image' => 'The :attribute field must be an image.',
    'in' => ':attribute المحدد غير صالح.',
    'in_array' => 'The :attribute field must exist in :other.',
    'integer' => 'يجب أن يكون :attribute عدداً صحيحاً.',
    'ip' => 'The :attribute field must be a valid IP address.',
    'ipv4' => 'The :attribute field must be a valid IPv4 address.',
    'ipv6' => 'The :attribute field must be a valid IPv6 address.',
    'json' => 'The :attribute field must be a valid JSON string.',
    'list' => 'The :attribute field must be a list.',
    'lowercase' => 'The :attribute field must be lowercase.',
    'lt' => [
        'array' => 'The :attribute field must have less than :value items.',
        'file' => 'The :attribute field must be less than :value kilobytes.',
        'numeric' => 'The :attribute field must be less than :value.',
        'string' => 'The :attribute field must be less than :value characters.',
    ],
    'lte' => [
        'array' => 'The :attribute field must not have more than :value items.',
        'file' => 'The :attribute field must be less than or equal to :value kilobytes.',
        'numeric' => 'The :attribute field must be less than or equal to :value.',
        'string' => 'The :attribute field must be less than or equal to :value characters.',
    ],
    'mac_address' => 'The :attribute field must be a valid MAC address.',
    'max' => [
        'array' => 'يجب ألا يحتوي :attribute على أكثر من :max عناصر.',
        'file' => 'يجب ألا يتجاوز حجم :attribute :max كيلوبايت.',
        'numeric' => 'يجب ألا يكون :attribute أكبر من :max.',
        'string' => 'يجب ألا يتجاوز :attribute :max حرفاً.',
    ],
    'max_digits' => 'The :attribute field must not have more than :max digits.',
    'mimes' => 'يجب أن يكون :attribute ملفاً من نوع: :values.',
    'mimetypes' => 'The :attribute field must be a file of type: :values.',
    'min' => [
        'array' => 'يجب أن يحتوي :attribute على :min عناصر على الأقل.',
        'file' => 'يجب ألا يقل حجم :attribute عن :min كيلوبايت.',
        'numeric' => 'يجب ألا يكون :attribute أقل من :min.',
        'string' => 'يجب ألا يقل :attribute عن :min أحرف.',
    ],
    'min_digits' => 'The :attribute field must have at least :min digits.',
    'missing' => 'The :attribute field must be missing.',
    'missing_if' => 'The :attribute field must be missing when :other is :value.',
    'missing_unless' => 'The :attribute field must be missing unless :other is :value.',
    'missing_with' => 'The :attribute field must be missing when :values is present.',
    'missing_with_all' => 'The :attribute field must be missing when :values are present.',
    'multiple_of' => 'The :attribute field must be a multiple of :value.',
    'not_in' => ':attribute المحدد غير صالح.',
    'not_regex' => 'The :attribute field format is invalid.',
    'numeric' => 'يجب أن يكون :attribute رقماً.',
    'password' => [
        'letters' => 'The :attribute field must contain at least one letter.',
        'mixed' => 'The :attribute field must contain at least one uppercase and one lowercase letter.',
        'numbers' => 'The :attribute field must contain at least one number.',
        'symbols' => 'The :attribute field must contain at least one symbol.',
        'uncompromised' => 'The given :attribute has appeared in a data leak. Please choose a different :attribute.',
    ],
    'present' => 'The :attribute field must be present.',
    'present_if' => 'The :attribute field must be present when :other is :value.',
    'present_unless' => 'The :attribute field must be present unless :other is :value.',
    'present_with' => 'The :attribute field must be present when :values is present.',
    'present_with_all' => 'The :attribute field must be present when :values are present.',
    'prohibited' => 'الحقل :attribute غير مسموح.',
    'prohibited_if' => 'The :attribute field is prohibited when :other is :value.',
    'prohibited_unless' => 'The :attribute field is prohibited unless :other is in :values.',
    'prohibits' => 'The :attribute field prohibits :other from being present.',
    'regex' => 'صيغة :attribute غير صالحة.',
    'required' => 'الحقل :attribute مطلوب.',
    'required_array_keys' => 'The :attribute field must contain entries for: :values.',
    'required_if' => 'الحقل :attribute مطلوب عندما يكون :other هو :value.',
    'required_if_accepted' => 'The :attribute field is required when :other is accepted.',
    'required_if_declined' => 'The :attribute field is required when :other is declined.',
    'required_unless' => 'The :attribute field is required unless :other is in :values.',
    'required_with' => 'الحقل :attribute مطلوب عند وجود :values.',
    'required_with_all' => 'The :attribute field is required when :values are present.',
    'required_without' => 'The :attribute field is required when :values is not present.',
    'required_without_all' => 'The :attribute field is required when none of :values are present.',
    'same' => 'The :attribute field must match :other.',
    'size' => [
        'array' => 'The :attribute field must contain :size items.',
        'file' => 'The :attribute field must be :size kilobytes.',
        'numeric' => 'The :attribute field must be :size.',
        'string' => 'The :attribute field must be :size characters.',
    ],
    'starts_with' => 'The :attribute field must start with one of the following: :values.',
    'string' => 'يجب أن يكون :attribute نصاً.',
    'timezone' => 'The :attribute field must be a valid timezone.',
    'unique' => ':attribute مستخدم من قبل.',
    'safe_svg' => 'ملف SVG يحتوي على سكربتات أو محتوى غير آمن ولا يمكن رفعه.',
    'uploaded' => 'The :attribute failed to upload.',
    'uppercase' => 'The :attribute field must be uppercase.',
    'url' => 'يجب أن يكون :attribute رابطاً صالحاً.',
    'ulid' => 'The :attribute field must be a valid ULID.',
    'uuid' => 'The :attribute field must be a valid UUID.',
    'send_otp_forgot_password' => 'تم إرسال رمز التحقق لمرة واحدة (OTP) بنجاح إلى رقم هاتفك. استخدمه لإعادة تعيين كلمة مرورك، ولا تشاركه مع أي شخص. سينتهي صلاحيته خلال 30 دقيقة.',
    'success_reset_password' => 'تمت إعادة تعيين كلمة المرور بنجاح.',
    'send_otp_code' => 'تم إرسال رمز التحقق لمرة واحدة بنجاح إلى رقم هاتفك. سينتهي صلاحيته خلال 30 دقيقة.',
    'phone_number_exists' => 'رقم الهاتف مستخدم بالفعل، يرجى التحقق من رقم الهاتف أو اختيار رقم آخر.',
    'change_phone_number' => 'تم تغيير رقم الهاتف بنجاح، وتم إرسال رمز التحقق لمرة واحدة (OTP) إلى رقم هاتفك. سينتهي مفعوله خلال 30 دقيقة.',
    'whatsapp_phone_number_required' => 'يرجى إضافة رقم واتساب قبل تفعيل إشعارات الواتساب.',
    'active_account' => 'حسابك نشط.',
    'check_active_account' => 'حسابك غير نشط. يرجى الاتصال بالدعم للحصول على المساعدة.',
    'product_inventory_updated' => 'تم تحديث مخزون المنتج بنجاح.',
    'logout' => 'تم تسجيل خروجك بنجاح.',
    'ean_code_exisit' => 'تم استخدام رمز EAN بالفعل، يرجى التحقق واختيار رمز آخر.',
    'sku_code_exisit' => 'رمز المنتج مستخدم بالفعل، يرجى التحقق واختيار رمز آخر.',
    'check_cart_product' => 'يجب أن يكون المنتج المحدد منتجًا موجودًا من النوع البسيط، استخدم productVariantId للمنتجات المتغيرة',
    'check_items_cart' => 'يقبل كل عنصر إما معرف المنتج (productId) أو معرف متغير المنتج (productVariantId)، وليس كليهما.',
    'delivery_zone_state_exits' => 'تم تحديد سعر التوصيل إلى هذه المنطقة. يرجى التحقق من المنطقة أو اختيار منطقة أخرى.',
    'product_must_be_simple' => 'يجب أن يكون المنتج المحدد من النوع البسيط (SIMPLE)، استخدم productVariants للمنتجات المتغيرة.',
    'product_must_be_out_of_stock' => 'يمكن الاشتراك بالتنبيه فقط عندما يكون المنتج غير متوفر (المخزون = 0).',
    'user_product_avaliable_created' => 'تمت الإضافة بنجاح، سيتم إعلامك عند توفر المنتج.',
    'currency_code_exists' => 'رمز العملة مستخدم بالفعل، يرجى التحقق واختيار رمز آخر.',
    'can_not_unset_default_currency' => 'يجب أن يكون هناك دائمًا عملة افتراضية واحدة في النظام. يرجى تعيين عملة أخرى كافتراضية بدلًا من ذلك.',
    'can_not_unset_standard_payment_provider' => 'يجب أن يكون هناك دائمًا مزود دفع أساسي واحد في النظام. يرجى تعيين مزود دفع آخر كأساسي بدلًا من ذلك.',
    'category_leaf_flag' => 'لا يمكن تفعيل خاصية :field إلا على التصنيفات التي تحتوي على تصنيفات فرعية.',
    /*
    |--------------------------------------------------------------------------
    | Custom Validation Language Lines
    |--------------------------------------------------------------------------
    |
    | Here you may specify custom validation messages for attributes using the
    | convention "attribute.rule" to name the lines. This makes it quick to
    | specify a specific custom language line for a given attribute rule.
    |
    */

    'promotion_item_target_required' => 'اختر إمّا منتجاً أو متغيّر منتج لهذا السطر.',
    'promotion_item_target_conflict' => 'السطر يشير إمّا إلى منتج أو إلى متغيّر منتج، وليس إلى الاثنين معاً.',
    'promotion_product_must_be_simple' => 'المنتج ":title" من نوع منتج متعدد الخيارات، لذا اختر أحد متغيّراته بدلاً من المنتج نفسه.',
    'promotion_variant_must_be_variable' => 'المنتج ":title" من نوع منتج بسيط، لذا اختر المنتج نفسه بدلاً من أحد متغيّراته.',
    'promotion_item_already_in_promotion' => 'العنصر ":title" مرتبط مسبقاً بالعرض ":promotion" (:code). لا يمكن للمنتج أن يشارك في أكثر من عرض واحد، لذا أزِله من ذلك العرض أولاً.',
    'promotion_rule_move_conflict' => 'لا يمكن نقل هذه القاعدة: أحد عناصرها مرتبط مسبقاً بالعرض ":promotion" (:code)، ولا يمكن للمنتج أن يشارك في أكثر من عرض واحد.',
    'invalid_delivery_date' => 'يجب أن يكون تاريخ التوصيل من الغد وحتى 3 أيام من الآن وليس في يوم عطلة.',

    'custom' => [
        'attribute-name' => [
            'rule-name' => 'custom-message',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Custom Validation Attributes
    |--------------------------------------------------------------------------
    |
    | The following language lines are used to swap our attribute placeholder
    | with something more reader friendly such as "E-Mail Address" instead
    | of "email". This simply helps us make our message more expressive.
    |
    */

    'attributes' => [
        'type' => 'النوع',
        'name' => 'الاسم',
        'area_id' => 'الحي',
        'description' => 'الوصف',
        'contact' => 'رابط التواصل',
        'starts_at' => 'تاريخ البدء',
        'proposer_name' => 'اسمك',
        'proposer_contact' => 'وسيلة التواصل معك',
        'safety_accepted' => 'إقرار الأمان',
        'reject_reason' => 'سبب الرفض',
        'email' => 'البريد الإلكتروني',
        'password' => 'كلمة المرور',
        'slug' => 'الرابط',
        'image' => 'الصورة',
    ],

];
