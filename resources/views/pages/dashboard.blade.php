<div class="content-body" id="contentbodydashboard">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <div class="row">
                        <div class="col-lg-2 col-md-6 col-sm-6">
                            <div class="form-group mb-1">
                                <label for="date_debut">Date debut</label>
                                <input type="date" id="date_debut" value="@{{ date_debut }}" class="form-control">
                            </div>
                        </div>
                        <div class="col-lg-2 col-md-6 col-sm-6">
                            <div class="form-group mb-1">
                                <label for="date_fin">Date fin</label>
                                <input type="date" id="date_fin" value="@{{ date_fin }}" class="form-control">
                            </div>
                        </div>
                        <div class="col-lg-3 col-md-6 col-sm-6">
                            <label for="etude_id_dashboard" class="required">Etude</label>
                            <select class="form-control select" id="etude_id_dashboard" name="etude_id" style="width: 100% !important;">
                                <option value="">--</option>
                                <option ng-repeat="item in dataPage['etudes']" value="@{{item.id}}">@{{item.nom_etude }}</option>
                            </select>
                        </div>
                        <div class="col-lg-5 col-md-6 col-sm-6 text-right pull-right" style="top:2em">
                            <button ng-click="chargerDonnees('dashboard','dashboardcodifrelec',0)" class="btn btn-outline-info mr-1">
                                <span class="psuedo-text">Filtrer</span><i class="fas fa-filter"></i>
                            </button>
                            <button ng-click="reset_chargerDonnees('dashboard','dashboardcodifrelec')" class="btn btn-outline-danger">Annuler<i class="fas fa-times"></i></button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card">
                <div class="card-content">
                    <div class="card-body">
                        <div class="row">
                            <div class="col-xl-3 col-lg-6 col-md-12 border-right-info-pl border-right-lighten-5">
                                <div class="pb-1">
                                    <div class="clearfix mb-1">
                                        <i class="fas fa-hourglass-start font-large-1 info-pl float-left mt-1"></i>
                                        <span class="font-large-2 text-bold-300 info float-right"><b>@{{ dataPage['dashboards'].total_etudes }}</b></span>
                                    </div>
                                    <div class="clearfix">
                                        <span class="text-muted">
                                            <h4><b class="text-indic">Nombre  d'automatisations</b></h4>
                                        </span>
                                        <span class="float-right" style="color:white">none</span>
                                    </div>
                                </div>
                                <div class="progress mb-0" style="height: 7px;">
                                    <div class="progress-bar bg-info" role="progressbar" style="width: 100%" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"></div>
                                </div>
                            </div>
                           
                            <div class="col-xl-3 col-lg-6 col-md-12 border-right-info-pl border-right-lighten-5">
                                <div class="pb-1">
                                    <div class="clearfix mb-1">
                                        <i class="fas fa-check font-large-1 info-pl float-left mt-1"></i>
                                        <span class="font-large-2 text-bold-300 deep-orange float-right"><b>@{{ dataPage['dashboards'].total_r2as }}</b></span>
                                    </div>
                                    <div class="clearfix">
                                        <span class="text-muted">
                                            <h4><b class="text-indic">Nombre r2as générées</b></h4>
                                        </span>
                                        <span class="float-right" style="color:white">none</span>
                                    </div>
                                </div>
                                <div class="progress mb-0" style="height: 7px;">
                                    <div class="progress-bar deep-orange" role="progressbar" style="width: 100%" aria-valuenow="100" aria-valuemin="0" aria-valuemax="80"></div>
                                </div>
                            </div>
                           
                            <div class="col-xl-3 col-lg-6 col-md-12 border-right-info-pl border-right-lighten-5">
                                <div class="pb-1">
                                    <div class="clearfix mb-1">
                                        <i class="fas fa-check font-large-1 info-pl float-left mt-1"></i>
                                        <span class="font-large-2 text-bold-300 success float-right"><b>@{{ dataPage['dashboards'].r2as_envoyes }}</b></span>
                                    </div>
                                    <div class="clearfix">
                                        <span class="text-muted">
                                            <h4><b class="text-indic">Nombre r2as envoyés</b></h4>
                                        </span>
                                        <span class="float-right" style="color:white">none</span>
                                    </div>
                                </div>
                                <div class="progress mb-0" style="height: 7px;">
                                    <div class="progress-bar bg-success" role="progressbar" style="width: 100%" aria-valuenow="100" aria-valuemin="0" aria-valuemax="80"></div>
                                </div>
                            </div>
                           
                            <div class="col-xl-3 col-lg-6 col-md-12 border-right-info-pl border-right-lighten-5">
                                <div class="pb-1">
                                    <div class="clearfix mb-1">
                                        <i class="fas fa-check font-large-1 info-pl float-left mt-1"></i>
                                        <span class="font-large-2 text-bold-300 warning float-right"><b>@{{ dataPage['dashboards'].r2as_non_envoyes }}</b></span>
                                    </div>
                                    <div class="clearfix">
                                        <span class="text-muted">
                                            <h4><b class="text-indic">Nombre r2as en attente</b></h4>
                                        </span>
                                        <span class="float-right" style="color:white">none</span>
                                    </div>
                                </div>
                                <div class="progress mb-0" style="height: 7px;">
                                    <div class="progress-bar bg-warning" role="progressbar" style="width: 100%" aria-valuenow="100" aria-valuemin="0" aria-valuemax="80"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>