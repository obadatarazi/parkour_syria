<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // One row per fixed page of the site (home, what, about, contact, disclaimer, book). The
        // key is what the website asks for, the dashboard only edits the content behind it.
        Schema::create('pages', function (Blueprint $table) {
            $table->id();
            $table->string('key', 50)->unique('idx_unique_page_key');
            $table->boolean('publish')->default(true)->index('idx_publish');
            $table->text('image_file_url')->nullable();
            $table->timestamps();
        });

        Schema::create('page_translations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('page_id');
            $table->string('locale')->index();
            $table->string('title')->fulltext('idx_ft_title');
            $table->longText('body')->nullable();
            $table->string('seo_title')->nullable();
            $table->string('seo_description', 500)->nullable();
            $table->unique(['page_id', 'locale']);
            $table->foreign('page_id')->references('id')->on('pages')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('page_translations');
        Schema::dropIfExists('pages');
    }
};
