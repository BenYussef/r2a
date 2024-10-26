<div class="row" id="default">
    <div class="col-md-12">
        <div class="item-titre-all "><span class="text-uppercase">R2A  |</span> <span class="font-weight-normal">Emails</span></div>
        <div class="card">
            <div class="card-header">
                <h4 class="card-title text-uppercase">
                    Emails
                    <a class="btn btn-sm font-weight-bold cursor-default btn-mytheme btn-round" href="" target="_self">
                        @{{paginations['email'].totalItems}}
                    </a>

                </h4>
                <div class="heading-elements">
                    <button  type="button" class="btn btn-mytheme btn-min-width btn-glow mr-1 mb-1" data-toggle="dropdown" title="Ajouter" ng-click="showModalAdd('email')" aria-haspopup="true" aria-expanded="false">
                        Ajouter <i class="fas fa-plus-circle"></i>
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
                            <div class="col-md-6 mb-2">
                                <select class="form-control" id="searchoption_list_email" ng-model="searchoption_list_email" name="searchoption">
                                    <option value="">Rechercher par</option>
                                    <option value="type">Type</option>
                                    <option value="designation">Email</option>
                                </select>
                            </div>
                            <div class="col-md-6 mb-2">
                                <input class="form-control" id="searchtexte_list_email" ng-model="searchtexte_list_email" ng-readonly="!searchoption_list_email"  autocomplete="off" type="text" placeholder="Texte ... ">
                            </div>
                            <div class="col-md-12 mt-10 pr-0 row" style="margin-top:10px">
                                <div class="col-md-6">
                                </div>
                                <div class="col-md-6 pr-0 text-right pull-right">
                                    <button ng-click="pageChanged('email')" class="btn btn-outline-info mr-1"><span class="psuedo-text">Filtrer</span> <i class="fas fa-filter"></i> </button>
                                    <button  ng-click="emptyform('email', true)" class="btn btn-outline-danger" >Annuler <i class="fas fa-times"></i> </button>
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
                                    <th>Type</th>
                                    <th class="text-center">Email</th>
                                    <th class="text-center">
                                        <div><span class="fas fa-cog fsize-26"></span></div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                            <tr ng-repeat="item in dataPage['emails']">
                                <td class="font-weight-bold">@{{item.type}}</td>
                                <td class="font-weight-bold text-center">@{{item.designation}}</td>
                                <td class="text-center">
                                    <nav class="menu-leftToRight d-flex justify-content-center align-content-center">
                                        <input type="checkbox" href="#" class="menu-open" name="menu-open" id="menu-open_email_@{{item.id}}">
                                        <label class="menu-open-button bg-white" for="menu-open_email_@{{item.id}}">
                                            <span class="hamburger bg-template-1 hamburger-1"></span>
                                            <span class="hamburger bg-template-1 hamburger-2"></span>
                                            <span class="hamburger bg-template-1 hamburger-3"></span>
                                        </label>
                                        <button class="menu-itembtn btn btn-danger" ng-click="deleteElement('email',item.id)" title="Supprimer">
                                            <i class="fas fa-trash-alt"></i>
                                        </button>
                                        <button class="menu-itembtn btn btn-mytheme" ng-click="showModalUpdate('email',item.id)" title="Modifier">
                                            <i class="fas fa-pencil"></i>
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
                        <select class="wdpx-66 form-control-sm border-rad-12"  ng-model="paginations['email'].entryLimit" ng-change="pageChanged('email')">
                            <option value="5" selected>5</option>
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>
                    <div class="col-md-9 text-right">
                        <nav aria-label="Page navigation">
                            <ul class="uk-pagination float-right pagination-cuemailed pagination-separate" uib-pagination total-items="paginations['email'].totalItems" ng-model="paginations['email'].currentPage" max-size="paginations['email'].maxSize" items-per-page="paginations['email'].entryLimit" ng-change="pageChanged('email')" previous-text="‹" next-text="›" first-text="«" last-text="»" boundary-link-numbers="true" rotate="false"></ul>
                        </nav>
                    </div>
                </div>
                <!-- /PAGINATION -->
            </div>
        </div>
    </div>
</div>