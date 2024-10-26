@if(auth()->user()->is_admin == 1)
<div class="row" id="default">
    <div class="col-md-12">
        <div class="item-titre-all "><span class="text-uppercase">R2A  |</span> <span class="font-weight-normal">Commentaires</span></div>
        <div class="card">
            <div class="card-header">
                <h4 class="card-title text-uppercase">
                    Commentaires
                    <a class="btn btn-sm font-weight-bold cursor-default btn-mytheme btn-round" href="" target="_self">
                        @{{paginations['commentaire'].totalItems}}
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
                                    <select id="searchoption_list_commentaire" ng-model="searchoption_list_commentaire" name="searchcommentaire" class="form-control">
                                        <option value="">Option de recherche</option>
                                        <option value="" disabled="">Rechercher dans</option>
                                        <option value="nom_complet">Nom complet</option>
                                        <option value="nom_etude">Etude</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <input type="text" class="form-control" id="searchtexte_list_commentaire" ng-model="searchtexte_list_commentaire" placeholder="Texte de la recherche" ng-readonly="!searchoption_list_commentaire">
                                </div>
                            </div>
                            <div class="col-md-12 mt-10 pr-0 row" style="margin-top:10px">
                                <div class="col-md-6">
                                </div>
                                <div class="col-md-6 pr-0 text-right pull-right">
                                    <button ng-click="pageChanged('commentaire')" class="btn btn-outline-info mr-1"><span class="psuedo-text">Filtrer</span> <i class="fas fa-filter"></i> </button>
                                    <button  ng-click="emptyform('commentaire', true)" class="btn btn-outline-danger" >Annuler <i class="fas fa-times"></i> </button>
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
                                    <th class="">Code</th>
                                    <th class="text-center">Etude</th>
                                    <th class="text-center">IDLVDC</th>
                                    <th class="text-center">Nom relecteur</th>
                                    <th class="text-center">Libelle court</th>
                                    <th class="text-center">Effectué le</th>
                                    <th class="text-center">Vu</th>
                                    <th class="text-center">
                                        <div><span class="fas fa-cog fsize-26"></span></div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                            <tr ng-repeat="item in dataPage['commentaires']">
                                <td class="font-weight-bold">@{{item.codif_nom}}</td>
                                <td class="font-weight-bold text-center">@{{item.nom_etude}}</td>
                                <td class="font-weight-bold text-center">@{{item.idlvdc}}</td>
                                <td class="font-weight-bold text-center">@{{item.nom_complet}}</td>
                                <td class="font-weight-bold text-center">@{{item.libelle_court}}</td>
                                <td class="font-weight-bold text-center">@{{item.created_at_fr}}</td>
                                <!-- <td class="font-weight-bold text-center">@{{item.created_at}}</td> -->
                                <td class="font-weight-bold text-center"><span class="badge @{{item.vu_badge}}">@{{item.vu_text}}</span></td>
                                <td class="text-center">
                                    <nav class="menu-leftToRight d-flex justify-content-center align-content-center">
                                        <input type="checkbox" href="#" class="menu-open" name="menu-open" id="menu-open_list_commentaire_@{{item.id}}">
                                        <label class="menu-open-button bg-white" for="menu-open_list_commentaire_@{{item.id}}">
                                            <span class="hamburger bg-template-1 hamburger-1"></span>
                                            <span class="hamburger bg-template-1 hamburger-2"></span>
                                            <span class="hamburger bg-template-1 hamburger-3"></span>
                                        </label>
                                        <button class="menu-itembtn btn btn-danger" ng-click="deleteElement('commentaire',item.id)" title="Supprimer">
                                            <i class="fas fa-trash-alt"></i>
                                        </button>
                                        <button class="menu-itembtn btn btn-success" ng-if="item.vu==0" ng-click="showModalStatut($event,'commentaire', 0, item, 'Activer')" title="Activer">
                                            <i class="fas fa-thumbs-up"></i>
                                        </button>
                                        <button class="menu-itembtn btn btn-info" title="Voir details" ng-click="showModalUpdate('commentaire',item.id)">
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
                        <select class="wdpx-66 form-control-sm border-rad-12"  ng-model="paginations['commentaire'].entryLimit" ng-change="pageChanged('commentaire')">
                            <option value="5" selected>5</option>
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>
                    <div class="col-md-9 text-right">
                        <nav aria-label="Page navigation">
                            <ul class="uk-pagination float-right pagination-curved pagination-separate" uib-pagination total-items="paginations['commentaire'].totalItems" ng-model="paginations['commentaire'].currentPage" max-size="paginations['commentaire'].maxSize" items-per-page="paginations['commentaire'].entryLimit" ng-change="pageChanged('commentaire')" previous-text="‹" next-text="›" first-text="«" last-text="»" boundary-link-numbers="true" rotate="false"></ul>
                        </nav>
                    </div>
                </div>
                <!-- /PAGINATION -->
            </div>
        </div>
    </div>
</div>
@endif