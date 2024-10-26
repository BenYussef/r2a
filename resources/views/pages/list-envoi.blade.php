<div class="row classe_generale" id="default">
    <div class="col-md-12">
        <div class="item-titre-all "><span class="text-uppercase">R2A  |</span> <span class="font-weight-normal">Historique envois</span></div>
        <div class="card">
            <div class="card-header">
                <h4 class="card-title text-uppercase">
                    Envois
                    <a class="btn btn-sm font-weight-bold cursor-default btn-mytheme btn-round" href="" target="_self">
                        @{{paginations['envoi'].totalItems}}
                    </a>

                </h4>
                <div class="heading-elements">
                    <button  type="button" class="btn btn-mytheme btn-min-width btn-glow mr-1 mb-1" data-toggle="dropdown" title="Envoyer manuellement email" ng-click="requeterSurController($event, 'envoyer_mail_suivi')" aria-haspopup="true" aria-expanded="false">
                        Envoyer manuellement email <i class="fas fa-paper-plane"></i>
                    </button>                 
                </div>
            </div>
            <div class="card-content collapse show">
                <div class="card-body m-2 box-shadow-1 card-script">
                    <div class="row">
                        <div class="col-md-6 align-self-center font-weight-bold">
                            Filtres
                        </div>
                        <div class="col-md-6 text-right">
                            <div class="" data-toggle="collapse" data-target="#collapseExample" aria-expanded="false" aria-controls="collapseExample">
                                <button class="btn btn-social-icon btn-filtre"><span class="fas fa-angle-down"></span></button>
                            </div>
                        </div>
                    </div>
                    <div class="collapse mt-2" id="collapseExample">
                        <div class="row">
                            <div class="col-md-5">
                                <div class="form-group mb-1">
                                    <label for="debut"><span style="color: black; font-weight:bold;">Du</span></label>
                                    <input type="datetime-local" id="debut" name="debut" class="form-control">
                                </div>
                            </div>
                            <div class="col-md-2">
                            </div>
                            <div class="col-md-5">
                                <div class="form-group mb-1">
                                    <label for="fin"><span style="color: black; font-weight:bold;">Au</span></label>
                                    <input type="datetime-local" id="fin" name="fin" class="form-control">
                                </div>
                            </div>
                            <div class="col-md-12 mt-10 pr-0 row" style="margin-top:10px">
                                <div class="col-md-6">
                                </div>
                                <div class="col-md-6 pr-0 text-right pull-right">
                                    <button ng-click="pageChanged('envoi')" class="btn btn-outline-info mr-1"><span class="psuedo-text">Filtrer</span> <i class="fas fa-filter"></i></button>
                                    <button ng-click="emptyform('envoi', true)" class="btn btn-outline-danger" >Annuler <i class="fas fa-times"></i> </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card-body">

                    <div class="table-responsive">
                        <table class="table table-striped">
                            <thead class="bg-mytheme white">
                                <tr>
                                    <th>Date envoi</th>
                                    <th class="text-center">Nombre CDP</th>
                                    
                                </tr>
                            </thead>
                            <tbody>
                            <tr ng-repeat="item in dataPage['envois']">
                                <td class="font-weight-bold">@{{item.created_at_fr}}</td>
                                <td class="font-weight-bold text-center">@{{item.nbre_personnes}}</td> 
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div class="card-footer">
                <!-- PAGINATION -->
                <div class="row">
                    <div class="col-md-3">
                        <span>Affichage par</span>
                        <select class="wdpx-66 form-control-sm border-rad-12"  ng-model="paginations['envoi'].entryLimit" ng-change="pageChanged('envoi')">
                            <option value="5" selected>5</option>
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>
                    <div class="col-md-9 text-right">
                        <nav aria-label="Page navigation">
                            <ul class="uk-pagination float-right pagination-cuenvoied pagination-separate" uib-pagination total-items="paginations['envoi'].totalItems" ng-model="paginations['envoi'].currentPage" max-size="paginations['envoi'].maxSize" items-per-page="paginations['envoi'].entryLimit" ng-change="pageChanged('envoi')" previous-text="‹" next-text="›" first-text="«" last-text="»" boundary-link-numbers="true" rotate="false"></ul>
                        </nav>
                    </div>
                </div>
                <!-- /PAGINATION -->
            </div>
        </div>
    </div>
</div>