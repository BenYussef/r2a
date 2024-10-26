@if(auth()->user()->is_admin == 1)
<div class="row" id="default">
    <div class="col-md-12">
        <div class="item-titre-all "><span class="text-uppercase">ENVOIE  |</span> <span class="font-weight-normal">Historique Envoies</span></div>
        <div class="card">
            <div class="card-header">
                <h4 class="card-title text-uppercase">
                    Historique Envoies
                    <a class="btn btn-sm font-weight-bold cursor-default btn-mytheme btn-round" href="" target="_self">
                        @{{paginations['envoie'].totalItems}}
                    </a>

                </h4>
                <div class="heading-elements">
                                     
                </div>
            </div>
            <div class="card-content collapse show">
                <div class="card-body m-2 box-shadow-1 card-dashboard">
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
                            <div class="col-md-6">
                                <div class="form-group">
                                    <select id="searchoption_list_envoie" ng-model="searchoption_list_envoie" name="searchenvoie" class="form-control">
                                        <option value="">Option de recherche</option>
                                        <option value="" disabled="">Rechercher dans</option>
                                        <option value="verbatim">Verbatim initial</option>
                                        <option value="verbatim_relu">Verbatim Relu</option>
                                        <option value="id_lvdc">ID LVDC</option>
                                        <option value="shortcut">Shortcut</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <input type="text" class="form-control" id="searchtexte_list_envoie" ng-model="searchtexte_list_envoie" placeholder="Texte de la recherche" ng-readonly="!searchoption_list_envoie">
                                </div>
                            </div>
                            <div class="col-md-6 mb-2">
                                <div class="form-group">
                                    <label for="date_start_list_envoie">Date début</label>
                                    <input class="form-control" id="date_start_list_envoie" type="date">
                                </div>
                            </div>
                            <div class="col-md-6 mb-2">
                                <div class="form-group">
                                    <label for="date_end_list_envoie">Date fin</label>
                                    <input class="form-control" id="date_end_list_envoie" type="date">
                                </div>
                            </div>
                            <div class="col-md-12 mt-10 pr-0 row" style="margin-top:10px">
                                <div class="col-md-6">
                                    
                                </div>
                                <div class="col-md-6 pr-0 text-right pull-right">
                                    <button ng-click="pageChanged('envoie')" class="btn btn-outline-info mr-1"><span class="psuedo-text">Filtrer</span> <i class="fas fa-filter"></i> </button>
                                    <button  ng-click="emptyform('envoie', true)" class="btn btn-outline-danger" >Annuler <i class="fas fa-times"></i> </button>
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
                                    <th class="">R2a</th>
                                    <th class="text-center">Envoyé Par</th>
                                    <th class="text-center">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                            <tr ng-repeat="item in dataPage['envoies']">
                                <td class="font-weight-bold">@{{item.r2a.designation}}</td>
                                <td class="font-weight-bold text-center">@{{item.user.name}}</td>
                                <td class="font-weight-bold text-center">@{{item.created_at_fr}}</td>
                                
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
                        <select class="wdpx-66 form-control-sm border-rad-12"  ng-model="paginations['envoie'].entryLimit" ng-change="pageChanged('envoie')">
                            <option value="5" selected>5</option>
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>
                    <div class="col-md-9 text-right">
                        <nav aria-label="Page navigation">
                            <ul class="uk-pagination float-right pagination-curved pagination-separate" uib-pagination total-items="paginations['envoie'].totalItems" ng-model="paginations['envoie'].currentPage" max-size="paginations['envoie'].maxSize" items-per-page="paginations['envoie'].entryLimit" ng-change="pageChanged('envoie')" previous-text="‹" next-text="›" first-text="«" last-text="»" boundary-link-numbers="true" rotate="false"></ul>
                        </nav>
                    </div>
                </div>
                <!-- /PAGINATION -->
            </div>
        </div>
    </div>
</div>
@endif