<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCommentairesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('commentaires', function (Blueprint $table) {
            $table->id();
            $table->string('commentaire');
            $table->unsignedBigInteger('competence_id')->nullable();
            $table->foreign('competence_id')->references('id')->on('competences')
            ->onDelete('cascade')->onUpdate('cascade');

            $table->unsignedBigInteger('periode_id')->nullable();
            $table->foreign('periode_id')->references('id')->on('periodes')
            ->onDelete('cascade')->onUpdate('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('commentaires');
    }
}
