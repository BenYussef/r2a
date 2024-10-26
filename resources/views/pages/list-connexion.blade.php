@if(auth()->user()->is_admin == 1)
<div class="row" id="default" class="classe_generale">
    <div class="col-md-12">
        <div class="item-titre-all "><span class="text-uppercase">RELECTEUR |</span> <span class="font-weight-normal">Connexions</span></div>
        <div class="card">
            <div class="card-header">
                <h4 class="card-title text-uppercase">
                    Connexions
                    <a class="btn btn-sm font-weight-bold cursor-default btn-mytheme btn-round" href="" target="_self">
                        @{{paginations['connexion'].totalItems}}
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
                                    <select id="searchoption_list_connexion" ng-model="searchoption_list_connexion" name="searchconnexion" class="form-control">
                                        <option value="">Option de recherche</option>
                                        <option value="" disabled="">Rechercher dans</option>
                                        <option value="name" selected>Nom d'utilisateur</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <input type="text" class="form-control" id="searchtexte_list_connexion" ng-model="searchtexte_list_connexion" placeholder="Texte de la recherche" ng-readonly="!searchoption_list_connexion">
                                </div>
                            </div>
                            <div class="col-md-6 mb-2">
                                <div class="form-group">
                                    <label for="date_start_list_connexion">Date début</label>
                                    <input class="form-control" id="date_start_list_connexion" type="date">
                                </div>
                            </div>
                            <div class="col-md-6 mb-2">
                                <div class="form-group">
                                    <label for="date_end_list_connexion">Date fin</label>
                                    <input class="form-control" id="date_end_list_connexion" type="date">
                                </div>
                            </div>
                            <div class="col-md-12 mt-10 pr-0 row" style="margin-top:10px">
                                <div class="col-md-6">
                                    
                                </div>
                                <div class="col-md-6 pr-0 text-right pull-right">
                                    <button ng-click="pageChanged('connexion')" class="btn btn-outline-info mr-1"><span class="psuedo-text">Filtrer</span> <i class="fas fa-filter"></i> </button>
                                    <button  ng-click="emptyform('connexion', true)" class="btn btn-outline-danger" >Annuler <i class="fas fa-times"></i> </button>
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
                                    <th>Nom d'utilisateur</th>
                                    <th>Login</th>
                                    <th class="text-center">Date de connexion</th>
                                    
                                </tr>
                            </thead>
                            <tbody>
                            <tr ng-repeat="item in dataPage['connexions']">
                                <td class="font-weight-bold">@{{item.user.name}}</td>
                                <td>@{{item.login}}</td>
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
                        <select class="wdpx-66 form-control-sm border-rad-12"  ng-model="paginations['connexion'].entryLimit" ng-change="pageChanged('connexion')">
                            <option value="5" selected>5</option>
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>
                    <div class="col-md-9 text-right">
                        <nav aria-label="Page navigation">
                            <ul class="uk-pagination float-right pagination-curved pagination-separate" uib-pagination total-items="paginations['connexion'].totalItems" ng-model="paginations['connexion'].currentPage" max-size="paginations['connexion'].maxSize" items-per-page="paginations['connexion'].entryLimit" ng-change="pageChanged('connexion')" previous-text="‹" next-text="›" first-text="«" last-text="»" boundary-link-numbers="true" rotate="false"></ul>
                        </nav>
                    </div>
                </div>
                <!-- /PAGINATION -->
            </div>
        </div>
    </div>
</div>
@endif