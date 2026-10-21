<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The dormant shop. The tables exist from day one so switching FEATURE_ECOMMERCE on later is a
 * config change, not a migration. Nothing on the website reads them while the flag is off, and the
 * book stays a WhatsApp order.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('currencies', function (Blueprint $table) {
            $table->id();
            $table->string('symbol');
            $table->string('code')->unique('idx_currency_code');
            $table->boolean('publish')->default(true)->index('idx_active');
            $table->boolean('is_default')->default(false)->index('idx_is_default');
            $table->timestamps();
        });

        Schema::create('currency_translations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('currency_id');
            $table->string('locale')->index();
            $table->string('title')->fulltext('idx_ft_currency_title');
            $table->unique(['currency_id', 'locale']);
            $table->foreign('currency_id')->references('id')->on('currencies')->onDelete('cascade');
        });

        Schema::create('brands', function (Blueprint $table) {
            $table->id();
            $table->boolean('publish')->index('idx_publish')->default(false);
            $table->text('logo_file_url')->nullable();
            $table->timestamps();
        });

        Schema::create('brand_translations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('brand_id');
            $table->string('locale')->index();
            $table->string('title')->fulltext('idx_ft_title');
            $table->string('slug')->nullable()->fulltext('idx_ft_slug');
            $table->text('description')->nullable();
            $table->unique(['brand_id', 'locale']);
            $table->foreign('brand_id')->references('id')->on('brands')->onDelete('cascade');
        });

        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('parent_category_id')->nullable()->index('idx_parent_category_id');
            $table->boolean('publish')->index('idx_publish')->default(false);
            $table->text('image_file_url')->nullable();
            $table->timestamps();

            $table->foreign('parent_category_id')->references('id')->on('categories')->nullOnDelete();
        });

        Schema::create('category_translations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('category_id');
            $table->string('locale')->index();
            $table->string('title')->fulltext('idx_ft_title');
            $table->string('slug')->nullable()->fulltext('idx_ft_slug');
            $table->text('description')->nullable();
            $table->unique(['category_id', 'locale']);
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('cascade');
        });

        Schema::create('tags', function (Blueprint $table) {
            $table->id();
            $table->boolean('publish')->index('idx_publish')->default(false);
            $table->timestamps();
        });

        Schema::create('tag_translations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tag_id');
            $table->string('locale')->index();
            $table->string('title')->fulltext('idx_ft_title');
            $table->string('slug')->nullable()->index('idx_tag_slug');
            $table->unique(['tag_id', 'locale']);
            $table->foreign('tag_id')->references('id')->on('tags')->onDelete('cascade');
        });

        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 150)->unique('idx_unique_product_slug');
            $table->string('sku_code', 100)->nullable()->unique('idx_unique_sku_code');
            $table->unsignedBigInteger('brand_id')->nullable()->index('idx_brand_id');
            $table->unsignedBigInteger('category_id')->nullable()->index('idx_category_id');
            $table->decimal('price', 12, 2)->default(0);
            $table->unsignedInteger('stock')->default(0);
            $table->text('image_file_url')->nullable();
            $table->boolean('publish')->default(false)->index('idx_publish');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('brand_id')->references('id')->on('brands')->nullOnDelete();
            $table->foreign('category_id')->references('id')->on('categories')->nullOnDelete();
        });

        Schema::create('product_translations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('product_id');
            $table->string('locale')->index();
            $table->string('title')->fulltext('idx_ft_title');
            $table->longText('description')->nullable();
            $table->unique(['product_id', 'locale']);
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
        });

        Schema::create('product_tag', function (Blueprint $table) {
            $table->unsignedBigInteger('product_id');
            $table->unsignedBigInteger('tag_id');
            $table->primary(['product_id', 'tag_id']);
            $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();
            $table->foreign('tag_id')->references('id')->on('tags')->cascadeOnDelete();
        });

        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique('idx_unique_coupon_code');
            $table->enum('type', ['PERCENTAGE', 'FIXED'])->default('PERCENTAGE');
            $table->decimal('value', 12, 2)->default(0);
            $table->dateTime('starts_at')->nullable();
            $table->dateTime('ends_at')->nullable();
            $table->unsignedInteger('usage_limit')->nullable();
            $table->boolean('publish')->default(false)->index('idx_publish');
            $table->timestamps();
        });

        Schema::create('carts', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique('idx_unique_cart_uuid');
            $table->unsignedBigInteger('user_id')->nullable()->index('idx_user_id');
            $table->unsignedBigInteger('coupon_id')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('coupon_id')->references('id')->on('coupons')->nullOnDelete();
        });

        Schema::create('cart_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('cart_id');
            $table->unsignedBigInteger('product_id');
            $table->unsignedInteger('quantity')->default(1);
            $table->timestamps();

            $table->unique(['cart_id', 'product_id']);
            $table->foreign('cart_id')->references('id')->on('carts')->cascadeOnDelete();
            $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();
        });

        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_ref_number', 50)->unique('idx_unique_order_ref');
            $table->unsignedBigInteger('user_id')->nullable()->index('idx_user_id');
            $table->unsignedBigInteger('coupon_id')->nullable();
            $table->unsignedBigInteger('currency_id')->nullable();
            $table->enum('status', ['PENDING', 'CONFIRMED', 'SHIPPED', 'COMPLETED', 'CANCELLED'])->default('PENDING')->index('idx_status');
            $table->string('customer_name')->nullable();
            $table->string('customer_phone', 30)->nullable();
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('total', 12, 2)->default(0);
            $table->text('note')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('coupon_id')->references('id')->on('coupons')->nullOnDelete();
            $table->foreign('currency_id')->references('id')->on('currencies')->nullOnDelete();
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('order_id');
            $table->unsignedBigInteger('product_id')->nullable();
            // What the product was called and cost when it was ordered, the catalog may change after.
            $table->string('product_title');
            $table->unsignedInteger('quantity')->default(1);
            $table->decimal('unit_price', 12, 2)->default(0);
            $table->decimal('total', 12, 2)->default(0);
            $table->timestamps();

            $table->foreign('order_id')->references('id')->on('orders')->cascadeOnDelete();
            $table->foreign('product_id')->references('id')->on('products')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('cart_items');
        Schema::dropIfExists('carts');
        Schema::dropIfExists('coupons');
        Schema::dropIfExists('product_tag');
        Schema::dropIfExists('product_translations');
        Schema::dropIfExists('products');
        Schema::dropIfExists('tag_translations');
        Schema::dropIfExists('tags');
        Schema::dropIfExists('category_translations');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('brand_translations');
        Schema::dropIfExists('brands');
        Schema::dropIfExists('currency_translations');
        Schema::dropIfExists('currencies');
    }
};
