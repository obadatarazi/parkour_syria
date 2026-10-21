<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lessons', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 150)->unique('idx_unique_lesson_slug');
            $table->unsignedInteger('sort_order')->default(0)->index('idx_sort_order');
            $table->string('youtube_url')->nullable();
            $table->text('image_file_url')->nullable();
            $table->boolean('publish')->default(false)->index('idx_publish');
            $table->timestamps();
        });

        Schema::create('lesson_translations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('lesson_id');
            $table->string('locale')->index();
            $table->string('title')->fulltext('idx_ft_title');
            $table->string('summary', 500)->nullable();
            $table->longText('body')->nullable();
            $table->text('safety_note')->nullable();
            $table->unique(['lesson_id', 'locale']);
            $table->foreign('lesson_id')->references('id')->on('lessons')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lesson_translations');
        Schema::dropIfExists('lessons');
    }
};
