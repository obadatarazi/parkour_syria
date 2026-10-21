<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // The photo strip of the home page.
        Schema::create('gallery_images', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('sort_order')->default(0)->index('idx_sort_order');
            $table->text('image_file_url')->nullable();
            $table->boolean('publish')->default(true)->index('idx_publish');
            $table->timestamps();
        });

        Schema::create('gallery_image_translations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('gallery_image_id');
            $table->string('locale')->index();
            $table->string('caption');
            $table->unique(['gallery_image_id', 'locale'], 'uniq_gallery_image_locale');
            $table->foreign('gallery_image_id', 'fk_gallery_image_translation')->references('id')->on('gallery_images')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gallery_image_translations');
        Schema::dropIfExists('gallery_images');
    }
};
