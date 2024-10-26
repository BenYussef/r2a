<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddIdFournisseurToPeriodesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('periodes', function (Blueprint $table) {
            if (!Schema::hasColumn('periodes', 'fournisseur_id'))
            {
                $table->unsignedBigInteger('fournisseur_id')->nullable();
                $table->foreign('fournisseur_id')->references('id')->on('fournisseurs')
                ->onDelete('cascade')->onUpdate('cascade');
            }
           
        });

    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('periodes', function (Blueprint $table) {
            Schema::dropIfExists('fournisseur_id');
        });
    }
}
