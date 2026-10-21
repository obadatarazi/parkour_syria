<?php

it('lets the supervisor edit content', function (string $path) {
    $this->actingAsSupervisor();

    $this->getJson("/api/admin/{$path}")->assertOk();
})->with(['pages', 'sliders', 'lessons', 'areas', 'directory-entries', 'events', 'suggestions', 'blog-categories', 'blog-posts']);

it('keeps the supervisor out of settings, users and roles', function (string $path) {
    $this->actingAsSupervisor();

    $this->getJson("/api/admin/{$path}")->assertForbidden();
})->with(['multi-type-settings', 'users', 'roles']);

it('gives the super admin the settings', function () {
    $this->actingAsSuperAdmin();

    $this->getJson('/api/admin/multi-type-settings')->assertOk();
});

it('does not register the shop while FEATURE_ECOMMERCE is off', function () {
    $this->actingAsSuperAdmin();

    $this->getJson('/api/admin/products')->assertNotFound();
    $this->getJson('/api/products')->assertNotFound();
});
