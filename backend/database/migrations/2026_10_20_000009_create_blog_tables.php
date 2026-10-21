<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('blog_categories', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 100)->unique('idx_unique_blog_category_slug');
            $table->unsignedInteger('sort_order')->default(0)->index('idx_sort_order');
            $table->boolean('publish')->default(true)->index('idx_publish');
            $table->timestamps();
        });

        Schema::create('blog_category_translations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('blog_category_id');
            $table->string('locale')->index();
            $table->string('title')->fulltext('idx_ft_title');
            $table->unique(['blog_category_id', 'locale'], 'uniq_blog_category_locale');
            $table->foreign('blog_category_id', 'fk_blog_category_translation')->references('id')->on('blog_categories')->onDelete('cascade');
        });

        Schema::create('blog_posts', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 150)->unique('idx_unique_blog_post_slug');
            $table->unsignedBigInteger('blog_category_id')->nullable()->index('idx_blog_category_id');
            $table->text('image_file_url')->nullable();
            // publish = false is a draft. published_at is the date the article shows, set on the
            // first publish when the admin leaves it empty.
            $table->boolean('publish')->default(false)->index('idx_publish');
            $table->dateTime('published_at')->nullable()->index('idx_published_at');
            $table->timestamps();

            $table->foreign('blog_category_id')->references('id')->on('blog_categories')->nullOnDelete();
        });

        Schema::create('blog_post_translations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('blog_post_id');
            $table->string('locale')->index();
            $table->string('title')->fulltext('idx_ft_title');
            $table->text('excerpt')->nullable();
            $table->longText('body')->nullable();
            $table->string('seo_title')->nullable();
            $table->string('seo_description', 500)->nullable();
            $table->unique(['blog_post_id', 'locale']);
            $table->foreign('blog_post_id')->references('id')->on('blog_posts')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blog_post_translations');
        Schema::dropIfExists('blog_posts');
        Schema::dropIfExists('blog_category_translations');
        Schema::dropIfExists('blog_categories');
    }
};
