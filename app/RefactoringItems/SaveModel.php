<?php

namespace App\RefactoringItems;

use App\Contrat;
use App\DetailR2aDePaie;
use App\Entite;
use App\R2aDePaie;
use App\Fournisseur;
use App\Inventaire;
use App\MotifDePrime;
use App\Traits\ModelRelationTraites;
use App\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SaveModel extends Model
{
    use HasFactory, ModelRelationTraites;

    protected $titre = null;

    protected $headerTablePdf = [];

    protected $bodyTablePdf = [];

    public function getTitrePdf($name = null)
    {
        if(isset($name))
        {
            return $this->titre.' '.$name;  
        }
        return $this->titre;
    }

    public function getheaderTablePdf($name = null)
    {
        if(isset($name))
        {
            if($name =='client')
            {
                return $this->headerTablePdfclient;
            }
            else if($name =='fournisseur')
            {
                return $this->headerTablePdffournisseur;  
            }
        }
        return $this->headerTablePdf;

    }
    public function getbodyTablePdf($name = null)
    {
        if(isset($name))
        {
            if($name =='client')
            {
                return $this->bodyTablePdfclient;
            }
            else if($name =='fournisseur')
            {
                return $this->bodyTablePdffournisseur;  
            }    
        }
        return $this->bodyTablePdf;

    }
    


    public function created_at_user()
    {
        return $this->belongsTo(User::class);
    }

    public function updated_at_user()
    {
        return $this->belongsTo(User::class);
    }
    public function entite()
    {
        return $this->belongsTo(Entite::class);
    }
    public function contrat()
    {
        return $this->belongsTo(Contrat::class);
    }
    public function fournisseurs()
    {
        return $this->hasMany(Fournisseur::class);
    }
    public function inventaires()
    {
        return $this->hasMany(Inventaire::class);
    }
    public function detail_r2a_de_paie()
    {
        return $this->hasMany(DetailR2aDePaie::class);
    }
    public function motif_de_prime()
    {
        return $this->belongsTo(MotifDePrime::class);
    }
    public function r2a_de_paies()
    {
        return $this->hasMany(R2aDePaie::class);
    }

    public function save(array $options = [])
    {

        // Code to listening which user setting data
        if (Auth::user()) {
            if (!isset($this->id)) {
                $this->created_at_user_id = Auth::user()->id;
            } else if (($this->wasChanged() || $this->isDirty())) {
                $this->updated_at_user_id = Auth::user()->id;

                //
                $tableDb = $this->getTable();
                $DataToPopageUpdatedAtUser = DB::select(DB::raw("SELECT distinct confrelid::regclass as parent FROM pg_constraint where contype='f' AND confdeltype = 'c' and conrelid='{$tableDb}'::regclass;"));
                foreach ($DataToPopageUpdatedAtUser as $oneTable) {
                    $foreignKeyTable = substr($oneTable->parent, 0, (strlen($oneTable->parent) - 1)) . '_id';
                    DB::table($oneTable->parent)->where('id', $this->$foreignKeyTable)->update(['updated_at_user_id' => $this->updated_at_user_id]);
                }
            }
        }

        // Code to save item into model
        $this->mergeAttributesFromClassCasts();

        $query = $this->newModelQuery();

        // If the "saving" event returns false we'll bail out of the save and return
        // false, indicating that the save failed. This provides a chance for any
        // listeners to cancel save operations if validations fail or whatever.
        if ($this->fireModelEvent('saving') === false) {
            return false;
        }

        // If the model already exists in the database we can just update our record
        // that is already in this database using the current IDs in this "where"
        // clause to only update this model. Otherwise, we'll just insert them.
        if ($this->exists) {
            $saved = $this->isDirty() ?
                $this->performUpdate($query) : true;
        }

        // If the model is brand new, we'll insert it into our database and set the
        // ID attribute on the model to the value of the newly inserted row's ID
        // which is typically an auto-increment value managed by the database.
        else {
            $saved = $this->performInsert($query);

            if (!$this->getConnectionName() && $connection = $query->getConnection()) {
                $this->setConnection($connection->getName());
            }
        }

        // If the model is successfully saved, we need to do a few more things once
        // that is done. We will call the "saved" method here to run any actions
        // we need to happen after a model gets successfully saved right here.
        if ($saved) {
            $this->finishSave($options);
        }

        return $saved;
    }
}
