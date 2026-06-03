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
        Schema::table('student_profiles', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('university');
            $table->string('linkedin_link')->nullable()->after('phone');
            $table->string('github_link')->nullable()->after('linkedin_link');
            $table->string('languages')->nullable()->after('github_link');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('student_profiles', function (Blueprint $table) {
            $table->dropColumn(['phone', 'linkedin_link', 'github_link', 'languages']);
        });
    }
};
