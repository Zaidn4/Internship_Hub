<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Likes for community feed posts.
     *
     * Polymorphic `liker` so both StudentProfile and Company records can like.
     * A unique constraint on (post_id, liker_type, liker_id) prevents duplicate likes
     * at the database level, making toggle logic safe under concurrent requests.
     */
    public function up(): void
    {
        Schema::create('post_likes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained('posts')->cascadeOnDelete();
            $table->string('liker_type');
            $table->unsignedBigInteger('liker_id');
            $table->timestamps();

            // One like per (post, liker) pair — enforced at DB level
            $table->unique(['post_id', 'liker_type', 'liker_id'], 'post_likes_unique');
            $table->index(['liker_type', 'liker_id'], 'post_likes_liker_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('post_likes');
    }
};
