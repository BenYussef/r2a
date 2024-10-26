<div class="grid grid-cols-12 gap-6 subcontent classe_generale">
    <div class="col-span-12 xxl:col-span-12 grid grid-cols-12 gap-6">
        <div class="col-span-12 mt-6">
            <div class="intro-y block sm:flex items-center h-10">
                <h2 class="text-lg font-medium truncate mr-5 uppercase">
                    404
                    <span class="inline-block bg-white text-theme-106 ml-2 px-3 rounded-full">@{{paginations['be'].totalItems}}</span>
                </h2>

                <div class="flex items-center sm:ml-auto mt-3 sm:mt-0">
                    {{--<button class="button box flex items-center text-gray-700"> <i data-feather="file-text" class="hidden sm:block w-4 h-4 mr-2"></i> <i class="feather-plus"></i> Export to Excel </button>--}}
                    <button class="button box flex items-center text-gray-700" ng-click="showModalAdd('be')" title="Ajouter"> <i class="fas fa-plus mr-2"></i> Ajouter </button>
                </div>
            </div>

            <div class="">

                <div class="intro-y grid grid-cols-12 gap-6 mt-52 sm:mt-5 md:mt-5">
                    <!-- BEGIN: Basic Accordion -->
                    <div class="col-span-12 lg:col-span-12">
                        <div class="intro-y box">
                            <div class="p-3" id="basic-accordion">
                                <div class="preview">
                                    <div class="accordion">
                                        <div class="accordion__pane border-gray-200">
                                            <a href="javascript:;" class="accordion__pane__toggle font-medium block">
                                                <div class="flex flex-wrap">
                                                    <div class="w-full md:w-1/2 px-3 self-center"><span class="fas fa-filter mr-1"></span>LES FILTRES</div>
                                                    <div class="w-full md:w-1/2 px-3 text-right">
                                                        <button class="button bg-theme-101 text-white btn-shadow">
                                                            <span class="w-5 h-5 flex items-center justify-center"> <i class="fas fa-chevron-down"></i> </span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </a>
                                            <div class="accordion__pane__content mt-2 text-gray-700 leading-relaxed">
                                                <form class="bg-white grid p-3 mt-3">
                                                    <div class="flex flex-wrap -mx-3">
                                                        <div class="w-full md:w-1/2 px-3 mb-2">
                                                            <div class="inline-block relative w-full">
                                                                <select class="block appearance-none w-full bg-white text-gray-700 border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
                                                                        id="searchoption_list_be" ng-model="searchoption_list_be" name="searchoption">
                                                                    <option value="">Rechercher par</option>
                                                                    <option value="designation">Désignation</option>
                                                                </select>
                                                                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                                                    <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="w-full md:w-1/2 px-3 mb-2">
                                                            <input class="shadow appearance-none border w-full  rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                                   id="searchtexte_list_be" ng-model="searchtexte_list_be" ng-readonly="!searchoption_list_be"  autocomplete="off" type="text" placeholder="Texte ... ">
                                                        </div>
                                                        <div class="w-full md:w-1/1 px-3 md:mb-0 text-right">
                                                            <button type="button" class="button small border text-gray-700 mr-1 btn-shadow-dark" ng-click="emptyform('be', true)"><span class="fas fa-filter mr-1"></span>Annuler</button>
                                                            <button type="button" class="button bg-theme-101 text-white btn-shadow" ng-click="pageChanged('be')"><span class="fas fa-search mr-1"></span>Filtrer</button>
                                                        </div>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- END: Basic Accordion -->
                </div>

            </div>

            <div class="overflow-table">
                <div class="intro-y overflow-auto lg:overflow-visible">
                    <table class="table table-report">
                        <thead>
                        <tr>
                            <th class="whitespace-no-wrap text-center">Code</th>
                            <th class="whitespace-no-wrap text-center">Date création</th>
                            <th class="whitespace-no-wrap text-center">Fournisseur</th>
                            <th class="whitespace-no-wrap text-center">Dépot</th>
                            <th class="whitespace-no-wrap text-center">Point de vente</th>
                            <th class="whitespace-no-wrap text-center">BCE</th>
                            <th class="whitespace-no-wrap text-center">Date échéance</th>
                            <th class="whitespace-no-wrap text-center" title="Nombre de produits">Nbre. prod.</th>
                            <th class="text-center whitespace-no-wrap">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr class="intro-x" ng-repeat="item in dataPage['bes']">
                            <td>
                                <div class="font-medium whitespace-no-wrap text-center">@{{ item.code }}</div>
                            </td>
                            <td>
                                <div class="font-medium whitespace-no-wrap text-center">@{{ item.created_at_fr }}</div>
                            </td>
                            <td>
                                <div class="font-medium whitespace-no-wrap text-center">@{{ item.fournisseur.designation }}</div>
                            </td>
                            <td>
                                <div class="font-medium whitespace-no-wrap text-center">@{{ item.depot.designation }}</div>
                            </td>
                            <td>
                                <div class="font-medium whitespace-no-wrap text-center">@{{ item.depot.entite.designation }}</div>
                            </td>
                            <td>
                                <div class="font-medium whitespace-no-wrap text-center">@{{ item.bce.code }}</div>
                            </td>
                            <td>
                                <div class="font-medium whitespace-no-wrap text-center">@{{ item.date_echeance_fr }}</div>
                            </td>
                            <td>
                                <div class="font-medium whitespace-no-wrap text-center">@{{ item.nbre_produit }}</div>
                            </td>
                            <td class="table-report__action w-56">
                                <nav class="menu-leftToRight uk-flex text-center">
                                    <input type="checkbox" href="#" class="menu-open" name="menu-open"  id="menu-open1us-@{{ item.id }}">
                                    <label class="menu-open-button bg-white" for="menu-open1us-@{{ item.id }}">
                                        <span class="hamburger bg-template-1 hamburger-1"></span>
                                        <span class="hamburger bg-template-1 hamburger-2"></span>
                                        <span class="hamburger bg-template-1 hamburger-3"></span>
                                    </label>
                                    <button class="menu-itembtn btn border-0 bg-danger text-white fsize-16" ng-click="deleteElement('be',item.id)"  title="Supprimer">
                                        <span class="fas fa-trash-alt"></span>
                                    </button>
                                    <button class="menu-itembtn btn border-0 bg-mytheme text-white fsize-16"  ng-click="showModalUpdate('be',item.id)" title="Modifier les infos">
                                        <span class="fal fa-edit"></span>
                                    </button>
                                    <button class="menu-itembtn btn border-0 bg-dark text-white fsize-16" ng-click="showModalDetail('be',item.id)"  title="Voir les détails">
                                        <span class="fas fa-info"></span>
                                    </button>
                                    <a ng-if="item.facture != null" href="@{{item.facture}}" target="_blank" class="menu-itembtn btn fsize-12 border-0 bg-warning text-white fsize-16" style="padding-top: 6px!important;" title="PDF BC JOINT">
                                        <span class="fas fa-file-pdf"></span>
                                    </a>

                                </nav>
                            </td>
                        </tr>

                        </tbody>
                    </table>
                </div>
                <!-- PAGINATION -->
                <div class="flex flex-wrap mt-3">
                    <div class="w-1/3">
                        <span>Affichage par</span>
                        <select class="w-20 input box mt-1"  ng-model="paginations['be'].entryLimit" ng-change="pageChanged('be')">
                            <option value="5" selected>5</option>
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>
                    <div class="w-2/3" style="float:right">
                        <nav aria-label="Page navigation">
                            <ul class="uk-pagination float-right pagination-curved pagination-separate" uib-pagination total-items="paginations['be'].totalItems" ng-model="paginations['be'].currentPage" max-size="paginations['be'].maxSize" items-per-page="paginations['be'].entryLimit" ng-change="pageChanged('be')" previous-text="‹" next-text="›" first-text="«" last-text="»" boundary-link-numbers="true" rotate="false"></ul>
                        </nav>
                    </div>
                </div>
                <!-- /PAGINATION -->
            </div>
        </div>
    </div>
</div>
