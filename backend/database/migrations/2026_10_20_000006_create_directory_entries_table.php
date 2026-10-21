<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('directory_entries', function (Blueprint $table) {
            $table->id();
            // The url of the entry on the website. One slug for every locale so a shared link keeps
            // working when the visitor's language changes.
            $table->string('slug', 150)->unique('idx_unique_directory_slug');
            $table->enum('type', ['place', 'coach', 'team'])->index('idx_type');
            $table->unsignedBigInteger('area_id')->nullable()->index('idx_area_id');
            $table->string('whatsapp', 30)->nullable();
            $table->string('facebook_url')->nullable();
            $table->string('instagram_url')->nullable();
            $table->text('map_url')->nullable();
            $table->text('image_file_url')->nullable();
            $table->boolean('verified')->default(false)->index('idx_verified');
            $table->boolean('publish')->default(false)->index('idx_publish');
            $table->unsignedInteger('sort_order')->default(0)->index('idx_sort_order');
            $table->timestamps();

            $table->foreign('area_id')->references('id')->on('areas')->nullOnDelete();
        });

        Schema::create('directory_entry_translations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('directory_entry_id');
            $table->string('locale')->index();
            $table->string('name')->fulltext('idx_ft_name');
            $table->text('description')->nullable();
            $table->fullText('description', 'idx_ft_description');
            $table->unique(['directory_entry_id', 'locale'], 'uniq_dir_entry_locale');
            $table->foreign('directory_entry_id', 'fk_dir_entry_translation')->references('id')->on('directory_entries')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('directory_entry_translations');
        Schema::dropIfExists('directory_entries');
    }
};
