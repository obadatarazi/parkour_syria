<?php

namespace App\Constant;

use App\Support\Features;

/**
 * Every permission the api guard knows, as `SECTION,PERMISSION_NAME`. Each section carries the same
 * five: MANAGE_X grants everything, the PERMISSION_* ones split it into create / update / delete /
 * show. ApiController::appendGeneralPermissions() reads them by section.
 *
 * Permission names must match the dashboard's `shared/constants/permissions.ts`.
 */
enum PermissionType: string
{
    /**
     * Sections the Supervisor role is given: the site's content, never its settings or accounts.
     */
    public const SUPERVISOR_SECTIONS = ['PAGE', 'SLIDER', 'LESSON', 'AREA', 'DIRECTORY_ENTRY', 'EVENT', 'SUGGESTION', 'BLOG_CATEGORY', 'BLOG_POST', 'GALLERY_IMAGE'];

    /**
     * Sections of the dormant shop. Kept out of every sync while FEATURE_ECOMMERCE is off, so a role
     * cannot be granted access to routes that are not registered.
     */
    public const SHOP_SECTIONS = ['BRAND', 'CATEGORY', 'TAG', 'CURRENCY', 'PRODUCT', 'ORDER', 'CART', 'COUPON'];

    public function getSection(): string
    {
        $slices = explode(',', $this->value);

        return $slices[0];
    }

    public function getName(): string
    {
        $slices = explode(',', $this->value);

        return str_replace('_', ' ', $slices[1]);
    }

    public function getDesc(): string
    {
        $slices = explode(',', $this->value);

        return str_replace('_', ' ', $slices[1]);
    }

    public function getPermission(): string
    {
        $slices = explode(',', $this->value);

        return $slices[1];
    }

    public function isShop(): bool
    {
        return in_array($this->getSection(), self::SHOP_SECTIONS, true);
    }

    /**
     * The cases that are live right now: everything, minus the shop while it is switched off.
     *
     * @return list<self>
     */
    public static function activeCases(): array
    {
        $ecommerce = Features::ecommerce();

        return array_values(array_filter(
            self::cases(),
            static fn (self $case) => $ecommerce || ! $case->isShop()
        ));
    }

    public static function getAllUserPermissions()
    {
        return [];
    }

    /**
     * Every live permission name. This is what `app:update-admin-roles` syncs into the api guard and
     * hands to the SuperAdmin role.
     *
     * @return list<string>
     */
    public static function getAllPermissions(): array
    {
        return array_map(static fn (self $case) => $case->getPermission(), self::activeCases());
    }

    /**
     * @return list<string>
     */
    public static function getSupervisorPermissions(): array
    {
        return array_values(array_map(
            static fn (self $case) => $case->getPermission(),
            array_filter(
                self::cases(),
                static fn (self $case) => in_array($case->getSection(), self::SUPERVISOR_SECTIONS, true)
            )
        ));
    }

    case PermissionManageUser = 'USER,MANAGE_USER';
    case PermissionCreateUser = 'USER,PERMISSION_CREATE_USER';
    case PermissionDeleteUser = 'USER,PERMISSION_DELETE_USER';
    case PermissionUpdateUser = 'USER,PERMISSION_UPDATE_USER';
    case PermissionViewUser = 'USER,PERMISSION_SHOW_USER';

    case PermissionManageRole = 'ROLE,MANAGE_ROLE';
    case PermissionCreateRole = 'ROLE,PERMISSION_CREATE_ROLE';
    case PermissionDeleteRole = 'ROLE,PERMISSION_DELETE_ROLE';
    case PermissionUpdateRole = 'ROLE,PERMISSION_UPDATE_ROLE';
    case PermissionViewRole = 'ROLE,PERMISSION_SHOW_ROLE';

    case PermissionList = 'PERMISSION_LIST,PERMISSION_LIST';

    case PermissionManageMultiTypeSetting = 'MULTI_TYPE_SETTING,MANAGE_MULTI_TYPE_SETTING';
    case PermissionCreateMultiTypeSetting = 'MULTI_TYPE_SETTING,PERMISSION_CREATE_MULTI_TYPE_SETTING';
    case PermissionDeleteMultiTypeSetting = 'MULTI_TYPE_SETTING,PERMISSION_DELETE_MULTI_TYPE_SETTING';
    case PermissionUpdateMultiTypeSetting = 'MULTI_TYPE_SETTING,PERMISSION_UPDATE_MULTI_TYPE_SETTING';
    case PermissionViewMultiTypeSetting = 'MULTI_TYPE_SETTING,PERMISSION_SHOW_MULTI_TYPE_SETTING';

    case PermissionManagePage = 'PAGE,MANAGE_PAGE';
    case PermissionCreatePage = 'PAGE,PERMISSION_CREATE_PAGE';
    case PermissionDeletePage = 'PAGE,PERMISSION_DELETE_PAGE';
    case PermissionUpdatePage = 'PAGE,PERMISSION_UPDATE_PAGE';
    case PermissionViewPage = 'PAGE,PERMISSION_SHOW_PAGE';

    case PermissionManageSlider = 'SLIDER,MANAGE_SLIDER';
    case PermissionCreateSlider = 'SLIDER,PERMISSION_CREATE_SLIDER';
    case PermissionDeleteSlider = 'SLIDER,PERMISSION_DELETE_SLIDER';
    case PermissionUpdateSlider = 'SLIDER,PERMISSION_UPDATE_SLIDER';
    case PermissionViewSlider = 'SLIDER,PERMISSION_SHOW_SLIDER';

    case PermissionManageLesson = 'LESSON,MANAGE_LESSON';
    case PermissionCreateLesson = 'LESSON,PERMISSION_CREATE_LESSON';
    case PermissionDeleteLesson = 'LESSON,PERMISSION_DELETE_LESSON';
    case PermissionUpdateLesson = 'LESSON,PERMISSION_UPDATE_LESSON';
    case PermissionViewLesson = 'LESSON,PERMISSION_SHOW_LESSON';

    case PermissionManageArea = 'AREA,MANAGE_AREA';
    case PermissionCreateArea = 'AREA,PERMISSION_CREATE_AREA';
    case PermissionDeleteArea = 'AREA,PERMISSION_DELETE_AREA';
    case PermissionUpdateArea = 'AREA,PERMISSION_UPDATE_AREA';
    case PermissionViewArea = 'AREA,PERMISSION_SHOW_AREA';

    case PermissionManageDirectoryEntry = 'DIRECTORY_ENTRY,MANAGE_DIRECTORY_ENTRY';
    case PermissionCreateDirectoryEntry = 'DIRECTORY_ENTRY,PERMISSION_CREATE_DIRECTORY_ENTRY';
    case PermissionDeleteDirectoryEntry = 'DIRECTORY_ENTRY,PERMISSION_DELETE_DIRECTORY_ENTRY';
    case PermissionUpdateDirectoryEntry = 'DIRECTORY_ENTRY,PERMISSION_UPDATE_DIRECTORY_ENTRY';
    case PermissionViewDirectoryEntry = 'DIRECTORY_ENTRY,PERMISSION_SHOW_DIRECTORY_ENTRY';

    case PermissionManageEvent = 'EVENT,MANAGE_EVENT';
    case PermissionCreateEvent = 'EVENT,PERMISSION_CREATE_EVENT';
    case PermissionDeleteEvent = 'EVENT,PERMISSION_DELETE_EVENT';
    case PermissionUpdateEvent = 'EVENT,PERMISSION_UPDATE_EVENT';
    case PermissionViewEvent = 'EVENT,PERMISSION_SHOW_EVENT';

    case PermissionManageSuggestion = 'SUGGESTION,MANAGE_SUGGESTION';
    case PermissionCreateSuggestion = 'SUGGESTION,PERMISSION_CREATE_SUGGESTION';
    case PermissionDeleteSuggestion = 'SUGGESTION,PERMISSION_DELETE_SUGGESTION';
    case PermissionUpdateSuggestion = 'SUGGESTION,PERMISSION_UPDATE_SUGGESTION';
    case PermissionViewSuggestion = 'SUGGESTION,PERMISSION_SHOW_SUGGESTION';

    case PermissionManageBlogCategory = 'BLOG_CATEGORY,MANAGE_BLOG_CATEGORY';
    case PermissionCreateBlogCategory = 'BLOG_CATEGORY,PERMISSION_CREATE_BLOG_CATEGORY';
    case PermissionDeleteBlogCategory = 'BLOG_CATEGORY,PERMISSION_DELETE_BLOG_CATEGORY';
    case PermissionUpdateBlogCategory = 'BLOG_CATEGORY,PERMISSION_UPDATE_BLOG_CATEGORY';
    case PermissionViewBlogCategory = 'BLOG_CATEGORY,PERMISSION_SHOW_BLOG_CATEGORY';

    case PermissionManageBlogPost = 'BLOG_POST,MANAGE_BLOG_POST';
    case PermissionCreateBlogPost = 'BLOG_POST,PERMISSION_CREATE_BLOG_POST';
    case PermissionDeleteBlogPost = 'BLOG_POST,PERMISSION_DELETE_BLOG_POST';
    case PermissionUpdateBlogPost = 'BLOG_POST,PERMISSION_UPDATE_BLOG_POST';
    case PermissionViewBlogPost = 'BLOG_POST,PERMISSION_SHOW_BLOG_POST';

    case PermissionManageGalleryImage = 'GALLERY_IMAGE,MANAGE_GALLERY_IMAGE';
    case PermissionCreateGalleryImage = 'GALLERY_IMAGE,PERMISSION_CREATE_GALLERY_IMAGE';
    case PermissionDeleteGalleryImage = 'GALLERY_IMAGE,PERMISSION_DELETE_GALLERY_IMAGE';
    case PermissionUpdateGalleryImage = 'GALLERY_IMAGE,PERMISSION_UPDATE_GALLERY_IMAGE';
    case PermissionViewGalleryImage = 'GALLERY_IMAGE,PERMISSION_SHOW_GALLERY_IMAGE';

    // Dormant shop, live only with FEATURE_ECOMMERCE=true.

    case PermissionManageBrand = 'BRAND,MANAGE_BRAND';
    case PermissionCreateBrand = 'BRAND,PERMISSION_CREATE_BRAND';
    case PermissionDeleteBrand = 'BRAND,PERMISSION_DELETE_BRAND';
    case PermissionUpdateBrand = 'BRAND,PERMISSION_UPDATE_BRAND';
    case PermissionViewBrand = 'BRAND,PERMISSION_SHOW_BRAND';

    case PermissionManageCategory = 'CATEGORY,MANAGE_CATEGORY';
    case PermissionCreateCategory = 'CATEGORY,PERMISSION_CREATE_CATEGORY';
    case PermissionDeleteCategory = 'CATEGORY,PERMISSION_DELETE_CATEGORY';
    case PermissionUpdateCategory = 'CATEGORY,PERMISSION_UPDATE_CATEGORY';
    case PermissionViewCategory = 'CATEGORY,PERMISSION_SHOW_CATEGORY';

    case PermissionManageTag = 'TAG,MANAGE_TAG';
    case PermissionCreateTag = 'TAG,PERMISSION_CREATE_TAG';
    case PermissionDeleteTag = 'TAG,PERMISSION_DELETE_TAG';
    case PermissionUpdateTag = 'TAG,PERMISSION_UPDATE_TAG';
    case PermissionViewTag = 'TAG,PERMISSION_SHOW_TAG';

    case PermissionManageCurrency = 'CURRENCY,MANAGE_CURRENCY';
    case PermissionCreateCurrency = 'CURRENCY,PERMISSION_CREATE_CURRENCY';
    case PermissionDeleteCurrency = 'CURRENCY,PERMISSION_DELETE_CURRENCY';
    case PermissionUpdateCurrency = 'CURRENCY,PERMISSION_UPDATE_CURRENCY';
    case PermissionViewCurrency = 'CURRENCY,PERMISSION_SHOW_CURRENCY';

    case PermissionManageProduct = 'PRODUCT,MANAGE_PRODUCT';
    case PermissionCreateProduct = 'PRODUCT,PERMISSION_CREATE_PRODUCT';
    case PermissionDeleteProduct = 'PRODUCT,PERMISSION_DELETE_PRODUCT';
    case PermissionUpdateProduct = 'PRODUCT,PERMISSION_UPDATE_PRODUCT';
    case PermissionViewProduct = 'PRODUCT,PERMISSION_SHOW_PRODUCT';

    case PermissionManageOrder = 'ORDER,MANAGE_ORDER';
    case PermissionCreateOrder = 'ORDER,PERMISSION_CREATE_ORDER';
    case PermissionDeleteOrder = 'ORDER,PERMISSION_DELETE_ORDER';
    case PermissionUpdateOrder = 'ORDER,PERMISSION_UPDATE_ORDER';
    case PermissionViewOrder = 'ORDER,PERMISSION_SHOW_ORDER';

    case PermissionManageCart = 'CART,MANAGE_CART';
    case PermissionCreateCart = 'CART,PERMISSION_CREATE_CART';
    case PermissionDeleteCart = 'CART,PERMISSION_DELETE_CART';
    case PermissionUpdateCart = 'CART,PERMISSION_UPDATE_CART';
    case PermissionViewCart = 'CART,PERMISSION_SHOW_CART';

    case PermissionManageCoupon = 'COUPON,MANAGE_COUPON';
    case PermissionCreateCoupon = 'COUPON,PERMISSION_CREATE_COUPON';
    case PermissionDeleteCoupon = 'COUPON,PERMISSION_DELETE_COUPON';
    case PermissionUpdateCoupon = 'COUPON,PERMISSION_UPDATE_COUPON';
    case PermissionViewCoupon = 'COUPON,PERMISSION_SHOW_COUPON';
}
