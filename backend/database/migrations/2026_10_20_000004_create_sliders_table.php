<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sliders', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('sort_order')->default(0)->index('idx_sort_order');
            $table->boolean('publish')->index('idx_publish')->default(false);
            $table->text('image_file_url')->nullable();
            // Website route keys (PageId on the SPA: path, directory, events, ...).
            $table->string('primary_page', 50)->nullable();
            $table->string('secondary_page', 50)->nullable();
            $table->timestamps();
        });

        Schema::create('slider_translations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('slider_id');
            $table->string('locale')->index();
            $table->string('badge')->nullable()->fulltext('idx_ft_badge');
            $table->string('title')->fulltext('idx_ft_title');
            $table->text('description')->nullable();
            $table->string('primary_button_text')->nullable();
            $table->string('secondary_button_text')->nullable();
            $table->unique(['slider_id', 'locale']);
            $table->foreign('slider_id')->references('id')->on('sliders')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('slider_translations');
        Schema::dropIfExists('sliders');
    }
};
