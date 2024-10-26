@if(auth()->user()->is_admin == 1)
<div class="row" id="default">
    <div class="col-md-12">
        <div class="item-titre-all "><span class="text-uppercase">R2A  |</span> <span class="font-weight-normal">Erreurs</span></div>
        <div class="card">
            <div class="card-header">
                <h4 class="card-title text-uppercase">
                    Erreurs
                    <a class="btn btn-sm font-weight-bold cursor-default btn-mytheme btn-round" href="" target="_self">
                        @{{paginations['erreur'].totalItems}}
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
                                    <select id="searchoption_list_erreur" ng-model="searchoption_list_erreur" name="searcherreur" class="form-control">
                                        <option value="">Option de recherche</option>
                                        <option value="" disabled="">Rechercher dans</option>
                                        <option value="type">Type</option>
                                        <option value="designation">Désignation</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <input type="text" class="form-control" id="searchtexte_list_erreur" ng-model="searchtexte_list_erreur" placeholder="Texte de la recherche" ng-readonly="!searchoption_list_erreur">
                                </div>
                            </div>
                            <div class="col-md-6 mb-2">
                                <div class="form-group">
                                    <label for="date_start_list_erreur">Date début</label>
                                    <input class="form-control" id="date_start_list_erreur" type="date">
                                </div>
                            </div>
                            <div class="col-md-6 mb-2">
                                <div class="form-group">
                                    <label for="date_end_list_erreur">Date fin</label>
                                    <input class="form-control" id="date_end_list_erreur" type="date">
                                </div>
                            </div>
                            <div class="col-md-12 mt-10 pr-0 row" style="margin-top:10px">
                                <div class="col-md-6">
                                    
                                </div>
                                <div class="col-md-6 pr-0 text-right pull-right">
                                    <button ng-click="pageChanged('erreur')" class="btn btn-outline-info mr-1"><span class="psuedo-text">Filtrer</span> <i class="fas fa-filter"></i> </button>
                                    <button  ng-click="emptyform('erreur', true)" class="btn btn-outline-danger" >Annuler <i class="fas fa-times"></i> </button>
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
                                    <th class="">Type</th>
                                    <th class="text-center">Désignation</th>
                                    <th class="text-center">Créé le</th>
                                    <th class="text-center">Vu</th>
                                    <th class="text-center">
                                        <div><span class="fas fa-cog fsize-26"></span></div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                            <tr ng-repeat="item in dataPage['erreurs']">
                                <td class="font-weight-bold">@{{item.type}}</td>
                                <td class="font-weight-bold text-center">@{{item.designation}}</td>
                                <td class="font-weight-bold text-center">@{{item.created_at}}</td>
                                <td class="font-weight-bold text-center"><span class="badge @{{item.vu_badge}}">@{{item.vu_text}}</span></td>
                                <td class="text-center">
                                    <nav class="menu-leftToRight d-flex justify-content-center align-content-center">
                                        <input type="checkbox" href="#" class="menu-open" name="menu-open" id="menu-open_list_erreur_@{{item.id}}">
                                        <label class="menu-open-button bg-white" for="menu-open_list_erreur_@{{item.id}}">
                                            <span class="hamburger bg-template-1 hamburger-1"></span>
                                            <span class="hamburger bg-template-1 hamburger-2"></span>
                                            <span class="hamburger bg-template-1 hamburger-3"></span>
                                        </label>
                                        <button class="menu-itembtn btn btn-danger" ng-click="deleteElement('erreur',item.id)" title="Supprimer">
                                            <i class="fas fa-trash-alt"></i>
                                        </button>
                                        <button class="menu-itembtn btn btn-success" ng-if="item.vu==0" ng-click="showModalStatut($event,'erreur', 0, item, 'Activer')" title="Activer">
                                            <i class="fas fa-thumbs-up"></i>
                                        </button>
                                        <button class="menu-itembtn btn btn-info" title="Voir details" ng-click="showModalUpdate('erreur',item.id)">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                    </nav>
                                </td>
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
                        <select class="wdpx-66 form-control-sm border-rad-12"  ng-model="paginations['erreur'].entryLimit" ng-change="pageChanged('erreur')">
                            <option value="5" selected>5</option>
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>
                    <div class="col-md-9 text-right">
                        <nav aria-label="Page navigation">
                            <ul class="uk-pagination float-right pagination-curved pagination-separate" uib-pagination total-items="paginations['erreur'].totalItems" ng-model="paginations['erreur'].currentPage" max-size="paginations['erreur'].maxSize" items-per-page="paginations['erreur'].entryLimit" ng-change="pageChanged('erreur')" previous-text="‹" next-text="›" first-text="«" last-text="»" boundary-link-numbers="true" rotate="false"></ul>
                        </nav>
                    </div>
                </div>
                <!-- /PAGINATION -->
            </div>
        </div>
    </div>
</div>
@endif