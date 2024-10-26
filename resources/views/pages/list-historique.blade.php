@if(auth()->user()->is_admin == 1)
<div class="row" id="default">
    <div class="col-md-12">
        <div class="item-titre-all "><span class="text-uppercase">EVALFOURNISEUR  |</span> <span class="font-weight-normal">Historiques</span></div>
        <div class="card">
            <div class="card-header">
                <h4 class="card-title text-uppercase">
                    Historiques
                    <a class="btn btn-sm font-weight-bold cursor-default btn-mytheme btn-round" href="" target="_self">
                        @{{paginations['historique'].totalItems}}
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
                                    <select id="searchoption_list_historique" ng-model="searchoption_list_historique" name="searchhistorique" class="form-control">
                                        <option value="">Option de recherche</option>
                                        <option value="" disabled="">Rechercher dans</option>
                                        <option value="type">Type</option>
                                        <option value="designation">Désignation</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <input type="text" class="form-control" id="searchtexte_list_historique" ng-model="searchtexte_list_historique" placeholder="Texte de la recherche" ng-readonly="!searchoption_list_historique">
                                </div>
                            </div>
                            <div class="col-md-6 mb-2">
                                <div class="form-group">
                                    <label for="date_start_list_historique">Date début</label>
                                    <input class="form-control" id="date_start_list_historique" type="date">
                                </div>
                            </div>
                            <div class="col-md-6 mb-2">
                                <div class="form-group">
                                    <label for="date_end_list_historique">Date fin</label>
                                    <input class="form-control" id="date_end_list_historique" type="date">
                                </div>
                            </div>
                            <div class="col-md-12 mt-10 pr-0 row" style="margin-top:10px">
                                <div class="col-md-6">
                                    
                                </div>
                                <div class="col-md-6 pr-0 text-right pull-right">
                                    <button ng-click="pageChanged('historique')" class="btn btn-outline-info mr-1"><span class="psuedo-text">Filtrer</span> <i class="fas fa-filter"></i> </button>
                                    <button  ng-click="emptyform('historique', true)" class="btn btn-outline-danger" >Annuler <i class="fas fa-times"></i> </button>
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
                                 
                                    <th class="">Désignation</th>
                                    <th class="text-center">Nbre Lignes</th>
                                    <th class="text-center">Nbre d'entreprises</th>
                                    <th class="text-center">Effectuée le</th>
                                    <th class="text-center">
                                        <span class="fas fa-cogs"></span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                            <tr ng-repeat="item in dataPage['historiques']">
                                <!-- <td class="font-weight-bold">@{{item.codification.type}}</td> -->
                                <td class="font-weight-bold">@{{item.codification.designation_codification}}</td>
                                <td class="font-weight-bold text-center">@{{item.nbre_lignes}}</td>
                                <td class="font-weight-bold text-center">@{{item.nbre_entreprise}}</td>
                                <td class="font-weight-bold text-center">@{{item.created_at_fr}}</td>
                                <td class="text-center">
                                    <nav class="menu-leftToRight d-flex justify-content-center align-content-center">
                                        <input type="checkbox" href="#" class="menu-open" name="menu-open" id="menu-open_list_historique_@{{item.id}}">
                                        <label class="menu-open-button bg-white" for="menu-open_list_historique_@{{item.id}}">
                                            <span class="hamburger bg-template-1 hamburger-1"></span>
                                            <span class="hamburger bg-template-1 hamburger-2"></span>
                                            <span class="hamburger bg-template-1 hamburger-3"></span>
                                        </label>
                                        {{-- <button class="menu-itembtn btn btn-danger" ng-click="deleteElement('historique',item.id)" title="Supprimer">
                                            <i class="fas fa-trash-alt"></i>
                                        </button>
                                        <button class="menu-itembtn btn btn-success" ng-if="item.vu==0" ng-click="showModalStatut($event,'historique', 0, item, 'Activer')" title="Activer">
                                            <i class="fas fa-thumbs-up"></i>
                                        </button>
                                        <button class="menu-itembtn btn btn-info" title="Voir details" ng-click="showModalUpdate('historique',item.id)">
                                            <i class="fas fa-eye"></i>
                                        </button> --}}
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
                        <select class="wdpx-66 form-control-sm border-rad-12"  ng-model="paginations['historique'].entryLimit" ng-change="pageChanged('historique')">
                            <option value="5" selected>5</option>
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>
                    <div class="col-md-9 text-right">
                        <nav aria-label="Page navigation">
                            <ul class="uk-pagination float-right pagination-curved pagination-separate" uib-pagination total-items="paginations['historique'].totalItems" ng-model="paginations['historique'].currentPage" max-size="paginations['historique'].maxSize" items-per-page="paginations['historique'].entryLimit" ng-change="pageChanged('historique')" previous-text="‹" next-text="›" first-text="«" last-text="»" boundary-link-numbers="true" rotate="false"></ul>
                        </nav>
                    </div>
                </div>
                <!-- /PAGINATION -->
            </div>
        </div>
    </div>
</div>
@endif