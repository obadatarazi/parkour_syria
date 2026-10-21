<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 150)->unique('idx_unique_event_slug');
            $table->enum('type', ['workshop', 'gathering'])->index('idx_type');
            $table->dateTime('starts_at')->index('idx_starts_at');
            $table->unsignedBigInteger('area_id')->nullable()->index('idx_area_id');
            // How to register, usually a WhatsApp number.
            $table->string('contact')->nullable();
            $table->text('image_file_url')->nullable();
            $table->boolean('publish')->default(false)->index('idx_publish');
            $table->timestamps();

            $table->foreign('area_id')->references('id')->on('areas')->nullOnDelete();
        });

        Schema::create('event_translations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('event_id');
            $table->string('locale')->index();
            $table->string('title')->fulltext('idx_ft_title');
            $table->string('location_label')->nullable();
            $table->text('description')->nullable();
            $table->unique(['event_id', 'locale']);
            $table->foreign('event_id')->references('id')->on('events')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_translations');
        Schema::dropIfExists('events');
    }
};
