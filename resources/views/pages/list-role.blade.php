@if(auth()->user()->can('liste-role') || auth()->user()->can('modification-role') || auth()->user()->can('suppression-role') || auth()->user()->can('creation-role'))

<section id="horizontal-form-layouts">
    <div class="row">
        <div class="col-md-12">
            <div class="item-titre-all "><span class="text-uppercase">EVALFOURNISEUR  |</span> <span class="font-weight-normal">Prrofils & Permissions</span></div>

            <div class="card">
                <div class="card-content collpase show">
                    <div class="card-body backgroundGradientAutresPage">
                        <ul class="nav nav-tabs no-hover-bg nav-justified">
                            <li class="nav-item">
                                <a class="nav-link active" id="active-tab1" data-toggle="tab" href="#active1" target="_self" aria-controls="active1" aria-expanded="true" ng-click="pageChanged('role')">
                                    <i class="fab fa-trello"></i> Les profils
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" id="link-tab1" data-toggle="tab" href="#link1" target="_self" aria-controls="link1" aria-expanded="false" ng-click="pageChanged('permission')">
                                    <i class="fas fa-lock"></i> Les permissions
                                </a>
                            </li>
                        </ul>
                        <div class="tab-content px-1 pt-1">
                            <div role="tabpanel" class="tab-pane active" id="active1" aria-labelledby="active-tab1" aria-expanded="true" style="">
                                <div class="row" id="default">
                                    <div class="col-12">
                                        <div class="card">
                                            <div class="card-header px-0">
                                                <h4 class="card-title text-uppercase">
                                                    Profils
                                                    <a class="btn btn-sm font-weight-bold cursor-default" href="" target="_self">
                                                        @{{paginations['role'].totalItems}}
                                                    </a>
                                                </h4>
                                                <div class="heading-elements right-0">
                                                    @if(auth()->user()->can('creation-role'))
                                                    <button type="button" class="btn bg-template-1 btn-flash box-shadow-2" data-toggle="dropdown" ng-click="showModalAdd('role')" title="Ajouter un profil" aria-haspopup="true" aria-expanded="false">
                                                        Ajouter <i class="fas fa-plus-circle"></i>
                                                    </button>
                                                    @endif
                                                   
                                                </div>
                                            </div>
                                            <div class="card-content collapse show">
                                                <div class="card-body px-0">
                                                    <div class="table-responsive">
                                                        <table class="table mb-0 text-center">
                                                            <thead class="white">
                                                            <tr>
                                                                <th>Nom du profil</th>
                                                                <th>Nbre de permissions</th>
                                                                <th>
                                                                    <div><span class="fas fa-cog fsize-26"></span></div>
                                                                </th>
                                                            </tr>
                                                            </thead>
                                                            <tbody>
                                                            <tr ng-repeat="item in dataPage['roles']">
                                                                <td class="text-capitalize font-weight-bold">@{{item.name}}</td>
                                                                <td class="font-weight-bold">@{{item.permissions.length}}</td>
                                                                <td class="text-center">
                                                                    <nav class="menu-leftToRight d-flex justify-content-center align-content-center">
                                                                        <input type="checkbox" href="#" class="menu-open" name="menu-open" id="menu-open_role_@{{item.id}}">
                                                                        <label class="menu-open-button bg-white" for="menu-open_role_@{{item.id}}">
                                                                            <span class="hamburger bg-template-1 hamburger-1"></span>
                                                                            <span class="hamburger bg-template-1 hamburger-2"></span>
                                                                            <span class="hamburger bg-template-1 hamburger-3"></span>
                                                                        </label>
                                                                        @if(auth()->user()->can('suppression-role'))
                                                                        <button class="menu-itembtn btn btn-secondary " ng-if="item.id>2" ng-click="showModalUpdate('role',item.id)" title="modifer ce profil">
                                                                            <i class="fal fa-edit"></i>
                                                                        </button>
                                                                        @endif
                                                                        @if(auth()->user()->can('modification-role'))
                                                                        <button class="menu-itembtn btn btn-danger " ng-if="item.id>2" ng-click="deleteElement('role',item.id)" title="supprimer ce profil">
                                                                            <i class="fas fa-trash-alt"></i>
                                                                        </button>
                                                                        @endif
                                                                     
                                                                        
                                                                    </nav>
                                                                </td>
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
                            <div class="tab-pane" id="link1" role="tabpanel" aria-labelledby="link-tab1" aria-expanded="false">
                                <div class="row" id="default">
                                    <div class="col-12">
                                        <div class="card">
                                            <div class="card-header px-0">
                                                <h4 class="card-title text-uppercase">
                                                    liste des permissions
                                                    <a class="btn btn-sm font-weight-bold cursor-default" href="" target="_self">
                                                        @{{dataPage['permissions'].length}}
                                                    </a>
                                                </h4>
                                            </div>
                                            <div class="card-content collapse show">
                                                <div class="card-body px-0">
                                                    <div class="table-responsive">
                                                        <table class="table mb-0 text-center">
                                                            <thead class="white">
                                                            <tr>
                                                                <th>Appellation</th>
                                                                <th>
                                                                    Description
                                                                </th>
                                                            </tr>
                                                            </thead>
                                                            <tbody>
                                                            <tr class="animated fadeIn" ng-repeat="item in dataPage['permissions']">
                                                                <td class="text-capitalize font-weight-bold">@{{item.name}}
                                                                    <i class="fas fa-arrow-right"></i>
                                                                </td>
                                                                <td>@{{item.display_name}}</td>
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
                                                        <select class="wdpx-66 form-control-sm border-rad-12"  ng-model="paginations['permission'].entryLimit" ng-change="pageChanged('permission')">
                                                            <option value="5" selected>5</option>
                                                            <option value="10">10</option>
                                                            <option value="25">25</option>
                                                            <option value="50">50</option>
                                                            <option value="100">100</option>
                                                        </select>
                                                    </div>
                                                    <div class="col-md-9 text-right">
                                                        <nav aria-label="Page navigation">
                                                            <ul class="uk-pagination float-right pagination-curved pagination-separate" uib-pagination total-items="paginations['permission'].totalItems" ng-model="paginations['permission'].currentPage" max-size="paginations['permission'].maxSize" items-per-page="paginations['permission'].entryLimit" ng-change="pageChanged('permission')" previous-text="‹" next-text="›" first-text="«" last-text="»" boundary-link-numbers="true" rotate="false"></ul>
                                                        </nav>
                                                    </div>
                                                </div>
                                                <!-- /PAGINATION -->
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
@endif
