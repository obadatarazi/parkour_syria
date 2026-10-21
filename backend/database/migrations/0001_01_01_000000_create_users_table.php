<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('full_name', 255)->nullable()->fulltext('ft_idx_fu_name');
            $table->string('email')->unique('idx_email');
            // CUSTOMER is kept for the dormant shop, Phase 1 only has dashboard accounts.
            $table->enum('type', ['ADMIN', 'CUSTOMER'])->index('idx_type');
            $table->string('password');
            $table->string('phone_number', 30)->nullable()->unique('idx_phone_number');
            $table->enum('gender', ['MALE', 'FEMALE'])->nullable()->index('idx_gender');
            $table->text('avatar_file_url')->nullable();
            $table->boolean('active')->default(false)->index('idx_active');
            $table->dateTime('verified_at')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
    }
};
