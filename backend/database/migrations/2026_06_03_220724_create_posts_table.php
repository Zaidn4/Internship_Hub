<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Posts for the Community Feed.
     *
     * Uses a polymorphic `author` relationship so both students (via their
     * StudentProfile) and companies (via their Company model) can author posts
     * without any nullable FK columns.
     *
     * author_type — the fully-qualified model class name (morphMap handles aliases)
     * author_id   — the PK of the related author record
     */
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->text('body');
            $table->string('author_type');   // polymorphic type
            $table->unsignedBigInteger('author_id');  // polymorphic id
            $table->index(['author_type', 'author_id'], 'posts_author_index');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
