<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('multi_type_settings', function (Blueprint $table) {
            $table->id();
            $table->string('setting_key', 100)->unique('idx_unique_setting_key');
            $table->fullText('setting_key', 'idx_ft_setting_key');
            $table->longText('value');
            $table->enum('type', ['EMAIL', 'LINK', 'NUMBER', 'PHONE_NUMBER', 'TEXT', 'PERCENTAGE', 'BOOLEAN'])->index('idx_type');
            $table->longText('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('multi_type_settings');
    }
};
