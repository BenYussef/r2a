<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddColumnToEvaluationFournisseursTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('evaluation_fournisseurs', function (Blueprint $table) {
            $table->unsignedBigInteger('fournisseur_id')->nullable();
            $table->foreign('fournisseur_id')->references('id')->on('fournisseurs')
            ->onDelete('cascade')->onUpdate('cascade');
            
            $table->unsignedBigInteger('periode_id')->nullable();
            $table->foreign('periode_id')->references('id')->on('periodes')
            ->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('evaluation_fournisseurs', function (Blueprint $table) {
            $table->dropColumn(['periode_id', 'fournisseur_id']);
        });
    }
}
