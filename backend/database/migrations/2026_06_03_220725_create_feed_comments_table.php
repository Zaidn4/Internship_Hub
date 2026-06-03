<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Feed comments — tied to a Post, with a polymorphic author.
     *
     * Named `feed_comments` to avoid a naming conflict with the existing
     * `comments` table (used for internship comments).
     */
    public function up(): void
    {
        Schema::create('feed_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained('posts')->cascadeOnDelete();
            $table->text('body');
            $table->string('author_type');
            $table->unsignedBigInteger('author_id');
            $table->index(['author_type', 'author_id'], 'feed_comments_author_index');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('feed_comments');
    }
};
