<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('blog_post_translations', function (Blueprint $table) {
            // The writer's name as shown under the article and in its JSON-LD (scope part 8, section 7b).
            // Per locale because an Arabic name is spelled differently in English.
            $table->string('author', 120)->nullable()->after('body');
        });
    }

    public function down(): void
    {
        Schema::table('blog_post_translations', function (Blueprint $table) {
            $table->dropColumn('author');
        });
    }
};
