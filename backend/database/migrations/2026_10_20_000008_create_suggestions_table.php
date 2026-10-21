<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // What a visitor proposes from the "suggest" form. Nothing here is ever shown on the site:
        // an admin reviews it and, on accept, it is promoted into a directory entry or an event.
        Schema::create('suggestions', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['place', 'coach', 'team', 'event'])->index('idx_type');
            $table->string('name')->fulltext('idx_ft_name');
            $table->unsignedBigInteger('area_id')->nullable()->index('idx_area_id');
            $table->text('description')->nullable();
            $table->string('contact')->nullable();
            $table->dateTime('starts_at')->nullable();
            $table->string('proposer_name')->nullable();
            $table->string('proposer_contact')->nullable();
            // Anything the form sends beyond the columns above.
            $table->json('payload')->nullable();
            $table->boolean('safety_accepted')->default(false);
            $table->enum('status', ['pending', 'accepted', 'rejected'])->default('pending')->index('idx_status');
            $table->text('reject_reason')->nullable();
            $table->unsignedBigInteger('reviewed_by')->nullable();
            $table->dateTime('reviewed_at')->nullable();
            // What the accept created: a directory_entries or events row.
            $table->string('promoted_type', 50)->nullable();
            $table->unsignedBigInteger('promoted_id')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();

            $table->foreign('area_id')->references('id')->on('areas')->nullOnDelete();
            $table->foreign('reviewed_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('suggestions');
    }
};
