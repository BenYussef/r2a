@if(auth()->user()->is_admin == 1)
<div class="content-body classe_generale">
    <div class="row" id="default">
        <div class="col-md-12">
            <div class="item-titre-all "><span class="text-uppercase">EVALUATION FOURNISEUR |</span> <span class="font-weight-normal">DASHBOARD</span></div>
            <div class="card">
                <div class="card-header">
                    <h4 class="card-title text-uppercase">
                        DASHBOARDS FOURNISSEURS
                    </h4>
                    
                </div>
                <div class="card-content">
                    <div class="card-body">
                       
                        <div class="row">
                            <div class="col-lg-4 col-md-4 col-sm-6">
                                <div class="form-group mb-0">
                                    <select id="periode_id_restitcompetences" class="form-control select2">
                                        <option value="">Sélectionner une évaluation</option>
                                        <option value="@{{item.id}}" ng-repeat="item in dataPage['periodes']">@{{item.designation}}</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-lg-5 col-md-4 col-sm-6">
                                <div class="form-group mb-0">
                                    <select id="fournisseur_id_restitcompetences" class="form-control select2">
                                        <option value="">Séléctionner un fournisseur</option>
                                        <option value="@{{item.id}}" ng-repeat="item in dataPage['fournisseurs']">@{{item.designation}}</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-lg-3 col-md-4 col-sm-12 align-items-end" id="filter-box">
                                <button ng-click="getelements('restitcompetences')" class="btn btn-outline-info"><span
                                        class="psuedo-text">Filtrer</span> <i class="fas fa-filter"></i> </button>
                                <button ng-click="emptyform('restitcompetences',true)" class="btn btn-outline-danger">Annuler <i
                                        class="fas fa-times"></i> </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <br>
            <br>
            <div class="card shadow-sm rounded-lg">
           
            <div class="card-content collapse show">
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover text-center">
                            <thead class="thead-light">
                                <tr>
                                    <th class="border-0">Fournisseur</th>
                                    <th class="border-0">NOTE / 10</th>
                                    <th class="border-0">Nb d'évaluations</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr ng-repeat="(key,item) in dataPage['restitcompetences']['data']">
                                    <td class="align-middle text-center">@{{item.fournisseur}}</td>
                                    <td class="align-middle text-center" style="background-color: @{{item.couleur}};">@{{item.note}}</td>
                                    <td class="align-middle text-center">@{{item.nb_evaluation}}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>


        </div>
    </div>
</div>
@endif