@if(auth()->user()->is_admin == 1)
<div class="row" id="default">
    <div class="col-md-12">
        <div class="item-titre-all "><span class="text-uppercase">EVALFOURNISEUR  |</span> <span class="font-weight-normal">Préferences</span></div>
        <div class="card">
            <div class="card-header">
                <h4 class="card-title text-uppercase">
                    Préferences
                    <a class="btn btn-sm font-weight-bold cursor-default btn-mytheme btn-round" href="" target="_self">
                        @{{paginations['preference'].totalItems}}
                    </a>

                </h4>
                <div class="heading-elements">              
                </div>
            </div>
            <div class="card-content collapse show">

                <div class="card-body">

                    <div class="table-responsive">
                        <table class="table table-striped">
                            <thead class="bg-mytheme white">
                                <tr>
                                    <th class="text-center">Délais Avertissement</th>
                                    <th class="text-center">Emails à notifier <th>
                                    <th class="text-center">Nbre Entreprise à siretiser/Jour<th>
                                    <!-- <th class="text-center">Couleur r2a<th> -->
                                    <th class="text-center">
                                        <div><span class="fas fa-cog fsize-26"></span></div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                            <tr ng-repeat="item in dataPage['preferences']">
                                <td class="font-weight-bold text-center">@{{item.delais_notification}}</td>
                                <td class="font-weight-bold text-center"><span style="word-break:break-all;">@{{item.emails_a_notifier}}</span></td>
                                <td class="font-weight-bold text-center"></td>
                                <td class="font-weight-bold text-center">@{{item.nbre_entreprise_par_jour}}</td>
                                <td class="font-weight-bold text-center"></td>
                                
                                <td class="text-center">
                                    <nav class="menu-leftToRight d-flex justify-content-center align-content-center">
                                        <input type="checkbox" href="#" class="menu-open" name="menu-open" id="menu-open_preference_@{{item.id}}">
                                        <label class="menu-open-button bg-white" for="menu-open_preference_@{{item.id}}">
                                            <span class="hamburger bg-template-1 hamburger-1"></span>
                                            <span class="hamburger bg-template-1 hamburger-2"></span>
                                            <span class="hamburger bg-template-1 hamburger-3"></span>
                                        </label>
                                        <button class="menu-itembtn btn btn-mytheme" ng-click="showModalUpdate('preference',item.id)" title="Modifier">
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
                        <select class="wdpx-66 form-control-sm border-rad-12"  ng-model="paginations['preference'].entryLimit" ng-change="pageChanged('preference')">
                            <option value="5" selected>5</option>
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>
                    <div class="col-md-9 text-right">
                        <nav aria-label="Page navigation">
                            <ul class="uk-pagination float-right pagination-cupreferenceed pagination-separate" uib-pagination total-items="paginations['preference'].totalItems" ng-model="paginations['preference'].currentPage" max-size="paginations['preference'].maxSize" items-per-page="paginations['preference'].entryLimit" ng-change="pageChanged('preference')" previous-text="‹" next-text="›" first-text="«" last-text="»" boundary-link-numbers="true" rotate="false"></ul>
                        </nav>
                    </div>
                </div>
                <!-- /PAGINATION -->
            </div>
        </div>
    </div>
</div>
@endif