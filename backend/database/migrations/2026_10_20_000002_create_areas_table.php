<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('areas', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 100)->unique('idx_unique_area_slug');
            $table->unsignedInteger('sort_order')->default(0)->index('idx_sort_order');
            $table->boolean('publish')->default(true)->index('idx_publish');
            $table->timestamps();
        });

        Schema::create('area_translations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('area_id');
            $table->string('locale')->index();
            $table->string('name')->fulltext('idx_ft_name');
            $table->unique(['area_id', 'locale']);
            $table->foreign('area_id')->references('id')->on('areas')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('area_translations');
        Schema::dropIfExists('areas');
    }
};
