@extends('layouts.app')

@section('content')

    <body ng-controller="BackEndCtl"
        class="vertical-layout vertical-menu 2-columns fixed-navbar menu-expanded pace-done classe_generale-2"
        data-open="click" data-menu="vertical-menu" data-col="2-columns" ng-app="maisonBack" cz-shortcut-listen="true"
        id="body-app" style="all: none;">
        <div class="pace  pace-inactive">
            <div class="pace-progress" data-progress-text="100%" data-progress="99"
                style="transform: translate3d(100%, 0px, 0px); font-size: 1.1rem;">
                <div class="pace-progress-inner"></div>
            </div>
            <div class="pace-activity"></div>
        </div>

        @include('layouts.partials.nav_bar')

        @include('layouts.partials.menu_bar')

        <div class="app-content content " id="openmenu">

            <div class="content-wrapper">
                <div class="content-header row">
                </div>

                <div class="content-body" ng-view>
                </div>
            </div>
        </div>
    </body>
    <!--debut modal-->
    <!-- etudes r2as -->
    <div class="modal fade text-left" id="modal_addetude" tabindex="-1" role="dialog" aria-labelledby="myModalLabel2"
        aria-hidden="true" data-keyboard="false" data-backdrop="static">
        <div class="modal-dialog modal-lg" role="document">

            <div class="modal-content">
                <div class="modal-header ">
                    <h4 class="modal-title text-dark" id="myModalLabel2">
                        <span class="fas fa-folder-open mr-1"></span> Etude
                    </h4>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">×</span>
                    </button>
                </div>
                <form id="form_addetude" class="form form-modal" accept-charset="UTF-8"
                    ng-submit="addElement($event,'etude')">
                    @csrf
                    <input type="hidden" id="id_etude" name="id">
                    <input type="hidden" id="conditions_etude" name="conditions" value="@{{ conditions_r2a }}">
                    <input type="hidden" id="contenus_etude" name="contenus" value="@{{ contenus_r2a }}">
                    <input type="hidden" id="entetes_etude" name="entetes" value="@{{ entetes_r2a }}">
                    <div class="modal-body">
                        <ul class="nav nav-tabs nav-tabs-etude row" id="myTab" role="tablist">
                            <li class="nav-item col-2-5">
                                <a class="nav-link active" data-toggle="tab" href="#infoGen" target="_self" role="tab">
                                    <i class="icon-number-tabs">1</i> Infos Générales</a>
                            <li>
                            <li class="nav-item col-2-5">
                                <a class="nav-link" data-toggle="tab" href="#conditions" target="_self" role="tab"><i
                                        class="icon-number-tabs">2</i>Conditions</a>
                            <li>
                            <li class="nav-item col-2-5">
                                <a class="nav-link" data-toggle="tab" href="#entetes" target="_self" role="tab"><i
                                        class="icon-number-tabs">3</i>Entêtes</a>
                            <li>
                            <li class="nav-item col-2-5">
                                <a class="nav-link" data-toggle="tab" href="#contenu" target="_self" role="tab"><i
                                        class="icon-number-tabs">4</i>Contenus</a>
                            <li>
                            <li class="nav-item col-2-5">
                                <a class="nav-link" data-toggle="tab" href="#libelles" target="_self" role="tab"><i
                                        class="icon-number-tabs">5</i>Libellés</a>
                            <li>
                        </ul>


                        <div>
                            <div class="tab-content mt-2">

                                <div class="tab-pane fade show active" id="infoGen" role="tabpanel">
                                    <div class="col-md-12 etude-left-block">
                                        <div class="col-md-12 row mb-1">
                                            <div class="col-md-6">
                                                <div class="form-group mb-1">
                                                    <label for="designation_etude" class="required">Désignation</label>
                                                    <input type="text" id="designation_etude"
                                                        placeholder="Ex: FA-3424 Dalkia " name="designation"
                                                        class="form-control">
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <div class="form-group mb-1">
                                                    <label for="titre_etude" class="required">Titre de la r2a à mettre
                                                        dans l'entête du PDF</label>
                                                    <input type="text" id="titre_etude"
                                                        placeholder="Ex: Baromètre de satisfaction SAFRAN - 2023"
                                                        name="titre_etude" class="form-control">
                                                </div>
                                            </div>

                                        </div>
                                        <div class="col-md-12 row mb-1">
                                            <div class="col-md-6">
                                                <div class="form-group mb-1">
                                                    <label for="task_id_etude" class="required"> Survey ID (ID
                                                        ASKIA)</label>
                                                    <input type="number" id="task_id_etude" name="task_id"
                                                        class="form-control" ng-model="task_id_etude"
                                                        ng-change="remplirQuestionR2a(task_id_etude, 'r2a')">
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <div class="form-group mb-1">
                                                    <label for="list_id_etude" class="required">List ID </label>
                                                    <input type="number" id="list_id_etude" name="list_id"
                                                        class="form-control">
                                                </div>
                                            </div>

                                        </div>
                                        <div class="col-md-12 row mb-1">
                                            <div class="col-md-6">
                                                <div class="form-group mb-1">
                                                    <label for="logo_lvdc_etude" class="required">Logo Lvdc </label>
                                                    <input type="text" id="logo_lvdc_etude" name="logo_lvdc"
                                                        class="form-control">
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <div class="form-group mb-1">
                                                    <label for="logo_client_etude" class="required">Logo Client </label>
                                                    <input type="text" id="logo_client_etude" name="logo_client"
                                                        class="form-control">
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-md-12 row mb-1">
                                            <div class="col-md-12">
                                                <div class="form-group mb-1">
                                                    <label for="destinataires_etude" class="required">Adresse Email des
                                                        Clients (séparés par point virgule) </label>
                                                    <textarea id="destinataires_etude" name="destinataires" class="form-control">
                                                    </textarea>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-md-12 row mb-1">
                                            <div class="col-md-12">
                                                <div class="form-group mb-1">
                                                    <label for="cc_etude" class="required">Liste des emails en interne à
                                                        mettre en CC (séparés par point virgule) </label>
                                                    <textarea id="cc_etude" name="cc" class="form-control">
                                                    </textarea>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-md-12 row mb-1">
                                            <div class="col-md-12">
                                                <div class="form-group mb-1">
                                                    <label for="contenu_etude" class="required"> Contenu du mail
                                                        Envoyé</label>
                                                    <textarea id="contenu_etude" rows="4" name="contenu" class="form-control ckeditor">
                                                    </textarea>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="tab-pane fade" id="conditions" role="tabpanel">
                                    <ul class="treeview-block col-md-12 ">
                                        <li class="treeview-item">
                                            <label for="operateur_conditions_etude" class="required">Une r2a sera généré
                                                si</label>
                                            <select name="operateur_conditions" ng-model="operateur_conditions"
                                                id="operateur_conditions_etude" class="form-control">
                                                <option value="&&">Toutes les conditions sont respectées</option>
                                                <option value="OR">Au moins une des conditions est respectée</option>
                                            </select>
                                            <ul>
                                                <li class="treeview-subitem" ng-repeat="condition in conditions_r2a">
                                                    <div class="col-md-12 row mb-1">
                                                        <div class="col-md-4 question_off pl-0">
                                                            <div class="form-group mb-0">
                                                                <select class="form-control select2"
                                                                    ng-model="conditions_r2a[$index]['question']"
                                                                    id="quest_condition_etude-@{{ $index }}"
                                                                    name="quest_condition_etude"
                                                                    style="width: 100% !important;">
                                                                    <option value="">Questions</option>
                                                                    <option ng-repeat="item in dataListeQuestions"
                                                                        value="@{{ item.Libelle_court }}">
                                                                        @{{ item.Libelle_court }}</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div class="col-md-3 question_off">
                                                            <div class="form-group mb-0">
                                                                <select class="form-control select2"
                                                                    ng-model="conditions_r2a[$index]['operateur']"
                                                                    name="oper_condition_etude"
                                                                    id="oper_condition_etude-@{{ $index }}"
                                                                    style="width: 100% !important;">
                                                                    <option value="">Operateur</option>
                                                                    <option ng-repeat="item in operateurs"
                                                                        value="@{{ item.value }}">
                                                                        @{{ item.text }}</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div class="col-md-4 question_off">
                                                            <div class="form-group mb-0">
                                                                <input type="text"
                                                                    ng-model="conditions_r2a[$index]['valeur']"
                                                                    id="valeur_condition_etude-@{{ $index }}"
                                                                    placeholder="Valeur de comparaison"
                                                                    class="form-control">
                                                            </div>
                                                        </div>
                                                        <div
                                                            class="col-md-1 question_off d-flex justify-content-between align-items-center">
                                                            <button type="button" class="btn btn-xs mr-1 btn-plus"
                                                                style="margin-top: 16%;" data-toggle="dropdown"
                                                                title="Ajouter"
                                                                ng-click="actionSurEtudeCondition('add', $index)"
                                                                aria-haspopup="true" aria-expanded="false">
                                                                <i class="fas fa-plus-circle"></i>
                                                            </button>
                                                            <button type="button" class="btn btn-xs mr-1 btn-minus"
                                                                style="margin-top: 16%;" data-toggle="dropdown"
                                                                title="Supprimer"
                                                                ng-click="actionSurEtudeCondition('remove', $index)"
                                                                aria-haspopup="true" aria-expanded="false">
                                                                <i class="fas fa-minus-circle"></i>
                                                            </button>
                                                        </div>

                                                    </div>
                                                </li>
                                            </ul>
                                        </li>
                                    </ul>
                                </div>
                                <div class="tab-pane fade" id="entetes" role="tabpanel">
                                    <div class="col-md-12 row contenu-block">
                                        <div class="row col-12 contenu-etude">
                                            <h5 class="pl-1"> Question NPS Globale</h5>
                                            <div class="col-12">
                                                <div class="col-md-12 question_off pl-0">
                                                    <div class="form-group mb-1">
                                                        <select class="form-control select2" id="question_nps_etude"
                                                            name="question_nps" style="width: 100% !important;">
                                                            <option value="">Sélectionner une question</option>
                                                            <option ng-repeat="item in dataListeQuestions"
                                                                value="@{{ item.Libelle_court }}">@{{ item.Libelle_court }}
                                                            </option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                            <h5 class="pl-1">Elements de l'entête</h5>

                                            <div class="col-12">
                                                <table class="table table-striped">
                                                    <tr class="bg-mytheme">
                                                        <th class="col-md-5 text-center">Libellé</th>
                                                        <th class="col-md-6 text-center">Valeur</th>
                                                        <th class="col-md-1 text-center">Action</th>
                                                    </tr>
                                                    <tr ng-repeat="entete in entetes_r2a">
                                                        <td class="p-15">
                                                            <div class="question_off pl-0">
                                                                
                                                            </div>
                                                        </td>
                                                        <td class="p-15">
                                                            <div class="question_off">
                                                                <div class="form-group mb-0">
                                                                    {{-- <label for="titre_etude">Info Fichier / Question</label> --}}
                                                                    <select class="form-control select2"
                                                                        id="quest_entete_etude-@{{ $index }}"
                                                                        ng-model="entetes_r2a[$index]['question']"
                                                                        name="quest_entete_etude"
                                                                        style="width: 100% !important;">
                                                                        <option value="">Sélectionner une
                                                                            question/Info Fichier</option>
                                                                        <option ng-repeat="item in dataListeQuestions"
                                                                            value="@{{ item.Libelle_court }}">
                                                                            @{{ item.Libelle_court }}</option>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td class="p-15">
                                                            <div
                                                                class="question_off d-flex justify-content-between align-items-center">
                                                                <button type="button"
                                                                    class="btn btn-xs mr-1 p-1 btn-plus"
                                                                    data-toggle="dropdown" title="Ajouter"
                                                                    ng-click="actionSurEtudeEntete('add', $index)"
                                                                    aria-haspopup="true" aria-expanded="false">
                                                                    <i class="fas fa-plus-circle"></i>
                                                                </button>
                                                                <button type="button"
                                                                    class="btn btn-xs mr-1 p-1 btn-minus"
                                                                    data-toggle="dropdown" title="Supprimer"
                                                                    ng-click="actionSurEtudeEntete('remove', $index)"
                                                                    aria-haspopup="true" aria-expanded="false">
                                                                    <i class="fas fa-minus-circle"></i>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="tab-pane fade" id="contenu" role="tabpanel">
                                    <div class="col-md-12 row contenu-block">
                                        <div class="row col-12 contenu-etude">
                                            <div ng-repeat="contenu in contenus_r2a" class="col-12">
                                                <div class="col-md-12 row mb-1">
                                                    <div class="col-md-5 question_off pl-0">
                                                        <div class="form-group mb-1">
                                                            <label for="theme_etude" class="required">Theme du bloc
                                                            </label>
                                                            <textarea type="text" id="theme_etude" ng-model="contenus_r2a[$index]['theme']"
                                                                placeholder="Ex: Satisfaction globale" name="theme" class="form-control"></textarea>
                                                        </div>
                                                    </div>
                                                    <div class="col-md-6 question_off">
                                                        <div class="form-group mb-1">
                                                            <label for="quest_contenu-@{{ $index }}"
                                                                class="required">Questions par ordre</label>

                                                            <select class="form-control select2 "
                                                                ng-model="contenus_r2a[$index]['shortcuts']" multiple
                                                                id="quest_contenu_etude-@{{ $index }}"
                                                                name="quest_contenu_etude"
                                                                style="width: 100% !important;">
                                                                <option value="">Sélectionner une question</option>
                                                                <option ng-repeat="item in dataListeQuestions"
                                                                    value="@{{ item.Libelle_court }}">@{{ item.Libelle_court }}
                                                                </option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div
                                                        class="col-md-1 question_off d-flex justify-content-between align-items-center">
                                                        <button type="button" class="btn btn-xs mr-1 btn-plus"
                                                            style="margin-top: 16%;" data-toggle="dropdown"
                                                            title="Ajouter"
                                                            ng-click="actionSurEtudeContenu('add', $index)"
                                                            aria-haspopup="true" aria-expanded="false">
                                                            <i class="fas fa-plus-circle"></i>
                                                        </button>
                                                        <button type="button" class="btn btn-xs mr-1 btn-minus"
                                                            style="margin-top: 16%;" data-toggle="dropdown"
                                                            title="Supprimer"
                                                            ng-click="actionSurEtudeContenu('remove', $index)"
                                                            aria-haspopup="true" aria-expanded="false">
                                                            <i class="fas fa-minus-circle"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="tab-pane fade" id="libelles" role="tabpanel">
                                    <div class="col-md-12 row contenu-block">
                                        <div class=" col-12 contenu-etude">
                                            <table class="table table-striped">
                                                <thead>
                                                    <tr>
                                                        <th>Shortcut</th>
                                                        <th>Libellé</th>
                                                    </tr>
                                                </thead>
                                                <tbody ng-repeat="(IndexItem, item) in contenus_r2a">
                                                    <tr ng-repeat="(IndexQuestion, question) in item.questions">
                                                        <td class="p-5 col-2">@{{ question.shortcut }}</td>
                                                        <td class="p-5 col-10">
                                                            <textarea class="form-control" ng-model="contenus_r2a[IndexItem]['questions'][IndexQuestion]['libelle']"></textarea>

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
                    <div class="col-md-12 modal-footer p-1 text-right border-top">
                        <div class="pull-right ">
                            <button type="reset" data-dismiss="modal" class="btn btn-outline-danger mr-1">
                                <i class="fas fa-times"></i> Annuler
                            </button>
                            <button type="submit" class="btn btn-outline-info">
                                <i class="fas fa-check"></i> Valider
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- modal user -->

    <div class="modal fade text-left" id="modal_adduser" tabindex="-1" role="dialog" aria-labelledby="myModalLabel2"
        aria-hidden="true">
        <div class="modal-dialog modal-md" role="document">
            <div class="modal-content">
                <div class="modal-header ">
                    <h4 class="modal-title text-dark" id="myModalLabel2">
                        <span class="fas fa-users mr-1"></span> Utilisateurs
                    </h4>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">×</span>
                    </button>
                </div>
                <form id="form_adduser" class="form form-modal" accept-charset="UTF-8" ng-submit="addElement($event,'user')">
                    @csrf
                    <input type="hidden" id="id_user" name="id">
                    <div class="modal-body">
                        <div class="row">

                            <div class="col-md-12">
                                <div class="form-group">
                                    <label for="nom_user" class="required">Nom </label>
                                    <input type="text" id="nom_user" name="nom" class="form-control required"
                                        placeholder="Nom ...">
                                </div>
                            </div>


                            <div class="col-md-12">
                                <div class="form-group">
                                    <label for="email_user" class="">Email</label>
                                    <input type="email" id="email_user" name="email" class="form-control "
                                        placeholder="Email ...">
                                </div>
                            </div>
                            <div class="col-md-12 mb-2">
                                <label for="password_user" class="required">Mot de passe</label>
                                <input type="password" id="password_user" name="password"
                                    class="form-control genererPassword" placeholder="Mot de passe ...">
                            </div>
                            <div class="col-md-12 mb-2">
                                <label for="confirmpassword_user" class="required">Confirmation mot de passe</label>
                                <input type="password" id="confirmpassword_user" name="confirmpassword"
                                    class="form-control genererPassword" placeholder="Confirmation mot de passe ...">
                            </div>
                            <!-- <div class="col-md-12">
                                <span>Est évaluateur</span>
                                <label class="switch">
                                    <input type="checkbox" id="est_evaluateur_relecture" name="est_evaluateur" ng-model="est_evaluateur_on">
                                    <span class="slider round"></span>
                                </label>
                            </div> -->
                        </div>
                    </div>
                    <div class="text-right modal-footer 2">
                        <div class="pull-right ">
                            <button type="reset" data-dismiss="modal" class="btn btn-outline-danger mr-1">
                                <i class="fas fa-times"></i> Annuler
                            </button>
                            <button type="submit" class="btn btn-outline-info">
                                <i class="fas fa-check"></i> Enregistrer
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- modal categorie -->
    <div class="modal fade text-left" id="modal_addcategorie" tabindex="-1" role="dialog" aria-labelledby="myModalLabel2"
        aria-hidden="true"  data-backdrop="static">
        <div class="modal-dialog modal-md" role="document">
            <div class="modal-content">
                <div class="modal-header ">
                    <h4 class="modal-title text-dark" id="myModalLabel2">
                        <span class="fas fa-object-group mr-1"></span> Catégories de compétences
                    </h4>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">×</span>
                    </button>
                </div>
                <form id="form_addcategorie" class="form form-modal" accept-charset="UTF-8" ng-submit="addElement($event,'categorie')">
                    @csrf
                    <input type="hidden" id="id_categorie" name="id">
                    <div class="modal-body">
                        <div class="row">

                            <div class="col-md-12">
                                <div class="form-group mt-1">
                                    <label for="designation_categorie" class="required">Désignation </label>
                                    <input type="text" id="designation_categorie" name="designation" class="form-control required"
                                        placeholder="Désignation ...">
                                </div>
                            </div>


                        </div>
                    </div>
                    <div class="text-right modal-footer border-top mt-2">
                        <div class="pull-right pt-1">
                            <button type="reset" data-dismiss="modal" class="btn btn-outline-danger mr-1">
                                <i class="fas fa-times"></i> Annuler
                            </button>
                            <button type="submit" class="btn btn-outline-info">
                                <i class="fas fa-check"></i> Enregistrer
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>

     <!-- modal fournisseur -->
     <div class="modal fade text-left" id="modal_addfournisseur" tabindex="-1" role="dialog" aria-labelledby="myModalLabel2"
        aria-hidden="true"  data-backdrop="static">
        <div class="modal-dialog modal-md" role="document">
            <div class="modal-content">
                <div class="modal-header ">
                    <h4 class="modal-title text-dark" id="myModalLabel2">
                        <span class="fas fa-object-group mr-1"></span> Fournisseur
                    </h4>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">×</span>
                    </button>
                </div>
                <form id="form_addfournisseur" class="form form-modal" accept-charset="UTF-8" ng-submit="addElement($event,'fournisseur')">
                    @csrf
                    <input type="hidden" id="id_fournisseur" name="id">
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-12">
                                <div class="form-group mt-1">
                                    <label for="designation_fournisseur" class="required">Désignation </label>
                                    <input type="text" id="designation_fournisseur" name="designation" class="form-control required"
                                        placeholder="Désignation ...">
                                </div>
                            </div>
                            <div class="col-md-12">
                                <div class="form-group mb-2 ">
                                    <label for="evaluateur_fournisseur" class="required">Evaluateurs </label>
                                    <select class="form-control select2" id="evaluateur_fournisseur" name="evaluateurs[]" style="width: 100% !important;" multiple="multiple">
                                        <option ng-repeat="item in dataPage['users']" ng-if="item.is_admin == 0" value="@{{item.id}}">@{{item.name}}</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="text-right modal-footer border-top mt-2">
                        <div class="pull-right pt-1">
                            <button type="reset" data-dismiss="modal" class="btn btn-outline-danger mr-1">
                                <i class="fas fa-times"></i> Annuler
                            </button>
                            <button type="submit" class="btn btn-outline-info">
                                <i class="fas fa-check"></i> Enregistrer
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- modal competence -->
    <div class="modal fade text-left" id="modal_addcompetence" tabindex="-1" role="dialog" aria-labelledby="myModalLabel2"
        aria-hidden="true"  data-backdrop="static">
        <div class="modal-dialog modal-md" role="document">
            <div class="modal-content">
                <div class="modal-header ">
                    <h4 class="modal-title text-dark" id="myModalLabel2">
                        <span class="fas fa-tools mr-1"></span> Compétences
                    </h4>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">×</span>
                    </button>
                </div>
                <form id="form_addcompetence" class="form form-modal" accept-charset="UTF-8" ng-submit="addElement($event,'competence')">
                    @csrf
                    <input type="hidden" id="id_competence" name="id">
                    <div class="modal-body">
                        <div class="row">

                            <div class="col-md-12">
                                <div class="form-group mb-1">
                                    <label for="designation_competence" class="required">Désignation </label>
                                    <input type="text" id="designation_competence" name="designation" class="form-control required"
                                        placeholder="Désignation ...">
                                </div>
                            </div>
                            <!-- <div class="col-md-12">
                                <div class="form-group mb-1">
                                    <label for="categorie_id_competence" class="required">Catégorie </label>
                                    <select id="categorie_id_competence" name="categorie_id" class="form-control required">
                                        <option value="">Sélectionner une catégorie</option>
                                        <option ng-repeat="item in dataPage['categories']" value="@{{item.id}}">@{{item.designation }}</option>
                                    </select>
                                </div>
                            </div> -->


                        </div>
                    </div>
                    <div class="text-right modal-footer border-top mt-2">
                        <div class="pull-right pt-1">
                            <button type="reset" data-dismiss="modal" class="btn btn-outline-danger mr-1">
                                <i class="fas fa-times"></i> Annuler
                            </button>
                            <button type="submit" class="btn btn-outline-info">
                                <i class="fas fa-check"></i> Enregistrer
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
    <!-- modal periode -->
    <div class="modal fade text-left" id="modal_addperiode" tabindex="-1" role="dialog" aria-labelledby="myModalLabel2"
        aria-hidden="true"  data-backdrop="static">
        <div class="modal-dialog modal-md" role="document">
            <div class="modal-content">
                <div class="modal-header ">
                    <h4 class="modal-title text-dark" id="myModalLabel2">
                        <span class="fas fa-hourglass mr-1"></span>
                    </h4>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">×</span>
                    </button>
                </div>
                <form id="form_addperiode" class="form form-modal" accept-charset="UTF-8" ng-submit="addElement($event,'periode')">
                    @csrf
                    <input type="hidden" id="id_periode" name="id">
                    <div class="modal-body">
                        <div class="row">
                            <!-- <div class="col-md-12">
                                <div class="form-group mb-1">
                                    <label for="type_periode" class="required">Type </label>
                                    <select id="type_periode" name="type" class="form-control required">
                                        <option value="">Sélectionner une catégorie</option>
                                        <option>Hebdomadaire</option>
                                        <option>Mensuel</option>
                                        <option>Bimestriel</option>
                                        <option>Trimestriel</option>
                                        <option>Quadrimestriel</option>
                                        <option>Semestriel</option>
                                        <option>Annuel</option>
                                    </select>
                                </div>
                            </div> -->
                            <!-- <div class="col-md-12">
                                <div class="form-group mb-2 ">
                                    <label for="fournisseur_periode" class="required">Fournisseur</label>
                                    <select class="form-control select2" id="fournisseur_periode" name="fournisseur" style="width: 100% !important;">
                                        <option ng-repeat="item in dataPage['fournisseurs']"  value="@{{item.id}}">@{{item.designation}}</option>
                                    </select>
                                </div>
                            </div> -->
                            <div class="col-md-12">
                                <div class="form-group mb-1">
                                    <label for="designation_periode" class="required">Désignation </label>
                                    <input type="text" id="designation_periode" name="designation" class="form-control required"
                                        placeholder="Désignation ...">
                                </div>
                            </div>
                            <div class="col-md-12">
                                <div class="form-group mb-1">
                                    <label for="date_notification_periode" class="required">Date de l'envoi de la notification </label>
                                    <input type="date" id="date_notification_periode" name="date_notification" class="form-control required"
                                        placeholder="Désignation ...">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="text-right modal-footer border-top mt-2">
                        <div class="pull-right pt-1">
                            <button type="reset" data-dismiss="modal" class="btn btn-outline-danger mr-1">
                                <i class="fas fa-times"></i> Annuler
                            </button>
                            <button type="submit" class="btn btn-outline-info">
                                <i class="fas fa-check"></i> Enregistrer
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>

    
    <!-- modal ordercategorie -->
    <div class="modal fade text-left" id="modal_ordercategorie" tabindex="-1" role="dialog" aria-labelledby="myModalLabel2"
        aria-hidden="true"  data-backdrop="static">
        <div class="modal-dialog modal-md" role="document">
            <div class="modal-content">
                <div class="modal-header ">
                    <h4 class="modal-title text-dark" id="myModalLabel2">
                        <span class="fas fa-object-group mr-1"></span> Catégories de compétences
                    </h4>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">×</span>
                    </button>
                </div>
                <form id="form_ordercategorie" class="form form-modal" accept-charset="UTF-8" ng-submit="saveReorder($event,'categorie')">
                    @csrf
                    <input type="hidden" id="id_categorie" name="id">
                    <div class="modal-body">
                        <div class="sortable-container">

                           
                            <ul class="sortable-list-order col-12" id="sortable-categorie" >
                                <li class="sortable-item" data-index="@{{$index}}"  draggable="true"  data-id="@{{item.id}}"  ng-repeat="item in items_to_order">
                                  <div class="details">
                                    <span>@{{item.designation}} </span>

                                  </div>
                                  <i class="fas fa-braille"></i>
                                </li>
                            </ul>
                           

                        </div>
                    </div>
                    <div class="text-right modal-footer border-top mt-2">
                        <div class="pull-right pt-1">
                            <button type="reset" data-dismiss="modal" class="btn btn-outline-danger mr-1">
                                <i class="fas fa-times"></i> Annuler
                            </button>
                            <button type="submit" class="btn btn-outline-info">
                                <i class="fas fa-check"></i> Enregistrer
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
    <!-- modal ordercompetence -->
    <div class="modal fade text-left" id="modal_ordercompetence" tabindex="-1" role="dialog" aria-labelledby="myModalLabel2"
        aria-hidden="true"  data-backdrop="static">
        <div class="modal-dialog modal-md" role="document">
            <div class="modal-content">
                <div class="modal-header ">
                    <h4 class="modal-title text-dark" id="myModalLabel2">
                        <span class="fas fa-sort mr-1"></span> Ordonner les compétences
                    </h4>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">×</span>
                    </button>
                </div>
                <form id="form_ordercompetence" class="form form-modal" accept-charset="UTF-8" ng-submit="saveReorder($event,'competence')">
                    @csrf
                    <input type="hidden" id="id_competence" name="id">
                    <div class="modal-body">
                        <div class="sortable-container">

                           
                            <ul class="sortable-list-order col-12" id="sortable-competence" >
                                <li class="sortable-item" data-index="@{{$index}}"  draggable="true"  data-id="@{{item.id}}"  ng-repeat="item in items_to_order">
                                  <div class="details">
                                    <span>@{{item.designation}} </span>

                                  </div>
                                  <i class="fas fa-braille"></i>
                                </li>
                            </ul>
                           

                        </div>
                    </div>
                    <div class="text-right modal-footer border-top mt-2">
                        <div class="pull-right pt-1">
                            <button type="reset" data-dismiss="modal" class="btn btn-outline-danger mr-1">
                                <i class="fas fa-times"></i> Annuler
                            </button>
                            <button type="submit" class="btn btn-outline-info">
                                <i class="fas fa-check"></i> Enregistrer
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
    <!-- modal completeperiode -->
    <div class="modal fade text-left" id="modal_addcompleteperiode" tabindex="-1" role="dialog" aria-labelledby="myModalLabel2"
        aria-hidden="true"  data-backdrop="static">
        <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header ">
                    <h4 class="modal-title text-dark" id="myModalLabel2">
                        <span class="fas fa-tools mr-1"></span>Remplissage Critère
                    </h4>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">×</span>
                    </button>
                </div>
                <form id="form_addcompleteperiode" class="form form-modal" accept-charset="UTF-8" ng-submit="addElement($event,'completeperiode')">
                    @csrf
                    <input type="hidden" id="id_completeperiode" name="periode_id">

                    <input type="hidden" id="notes_completeperiode" name="notes_periode" value="@{{ notes_periode }}">

                    <div class="sortable-container">
                        <table class="table table-striped-parent" id="complete-periode">
                            <thead>
                                <tr>
                                    <th class="alert alert-warning text-center mt-1">
                                        CRITERE
                                    </th>
                                </tr>
                            </thead>
                            <tr>
                                <td>
                                    <div class="modal-body">
                                        <div class="alert alert-warning text-center mt-1">
                                            N'oubliez pas de mettre la note de zéro pour les compétences qui ne vous concernent pas.
                                        </div>
                                        <div ng-repeat="(index, competence) in notes_periode">
                                            <!-- Si l'user_id change, afficher un nouvel en-tête pour chaque utilisateur -->
                                            <div ng-if="index === 0 || notes_periode[index - 1].fournisseur_id !== competence.fournisseur_id">
                                                <div class="alert alert-info mt-3">
                                                    Fournisseur @{{competence.nom_fournisseur}}
                                                </div>
                                                <!-- Tableau contenant les critères de chaque utilisateur (un seul tableau par évaluateur) -->
                                                <table class="table table-striped">
                                                    <thead>
                                                        <tr>
                                                            <th class="w-50" style="padding: 10px; text-align: left;">Critère</th>
                                                            <th class="w-40 text-center" style="padding: 10px;">Note / 10</th>
                                                            <th class="w-75 text-center" style="padding: 10px;">Commentaire</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <!-- Afficher toutes les compétences du même évaluateur -->
                                                        <tr ng-repeat="(i, comp) in notes_periode" ng-if="comp.fournisseur_id === competence.fournisseur_id" style="vertical-align: top;">
                                                            <td class="bordered-top w-50" style="padding: 10px;">
                                                                @{{comp.designation}}
                                                            </td>
                                                            <td class="bordered-top w-40" style="padding: 10px;">
                                                                <div class="note-block">
                                                                    <input type="text" ng-model="notes_periode[i]['note']" placeholder="Note /10"
                                                                        class="form-control input-sm"
                                                                        style="width: 80px; text-align: center;"
                                                                        ng-if="!disable_form">
                                                                    <span ng-if="disable_form" class="text-bold">@{{comp.note}}/10</span>
                                                                </div>
                                                            </td>
                                                            <td class="bordered-top w-75" style="padding: 10px;">
                                                                <textarea ng-model="notes_periode[i]['commentaire']" 
                                                                    placeholder="Entrez votre commentaire ici..."
                                                                    class="form-control"
                                                                    style="resize: vertical; width: 100%; min-height: 50px; max-height: 200px; border-radius: 8px; padding: 5px; font-size: 14px;"
                                                                    ng-if="!disable_form"></textarea>
                                                                <span ng-if="disable_form" class="text-bold">@{{comp.commentaire}}</span>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </div>
                    <div class="text-right modal-footer ">
                        <div class="pull-right" ng-if="!disable_form">
                            <button type="reset" data-dismiss="modal" class="btn btn-outline-danger mr-1">
                                <i class="fas fa-times"></i> Annuler
                            </button>
                            <button type="submit" class="btn btn-outline-info">
                                <i class="fas fa-check"></i> Enregistrer
                            </button>
                        </div>
                        <div class="pull-right" ng-if="disable_form">
                            <button type="reset" data-dismiss="modal" class="btn btn-outline-danger mr-1">
                                <i class="fas fa-times"></i> Fermer
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- modal detailperiode -->
    <div class="modal fade text-left" id="modal_adddetailperiode" tabindex="-1" role="dialog" aria-labelledby="myModalLabel2"
        aria-hidden="true"  data-backdrop="static">
        <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header ">
                    <h4 class="modal-title text-dark" id="myModalLabel2">
                        <span class="fas fa-tools mr-1"></span>Détails Critères
                    </h4>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">×</span>
                    </button>
                </div>
               
                <div class="modal-body">
                    <div class="sortable-container">
                        <table class="table table-striped-parent" id="complete-periode">
                            <thead>
                                <tr>
                                    <th class="alert alert-warning text-center mt-1">
                                        CRITERE
                                    </th>
                                </tr>
                            </thead>
                            <tr>
                                <td>
                                    <div class="modal-body" style="max-height: 400px; overflow-y: auto;">
                                        <div class="sortable-container">
                                            <!-- Boucle principale pour les compétences et vérification du changement de user_id -->
                                            <div ng-repeat="(index, competence) in notes_periode">
                                                <!-- Si l'user_id change, afficher un nouvel en-tête pour chaque utilisateur -->
                                                <div ng-if="index === 0 || notes_periode[index - 1].user_id !== competence.user_id">
                                                    <div class="alert alert-info mt-3">
                                                        Évaluations par @{{competence.evaluateur}}
                                                    </div>
                                                    <!-- Tableau contenant les critères de chaque utilisateur (un seul tableau par évaluateur) -->
                                                    <table class="table table-striped">
                                                        <thead>
                                                            <tr>
                                                                <th class="w-50" style="padding: 5px;">Critère</th>
                                                                <th class="w-40 text-center" style="padding: 5px;">Note / 10</th>
                                                                <th class="w-75 text-center" style="padding: 5px;">Commentaire</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <!-- Afficher toutes les compétences du même évaluateur -->
                                                            <tr ng-repeat="comp in notes_periode" ng-if="comp.user_id === competence.user_id" style="vertical-align: top;">
                                                                <td class="bordered-top w-50" style="padding: 5px;">
                                                                    @{{comp.designation}}
                                                                </td>
                                                                <td class="bordered-top w-40" style="padding: 5px;">
                                                                    <div class="note-block">
                                                                        <input type="text" ng-model="comp.note" placeholder="Note /10"
                                                                            class="form-control input-sm"
                                                                            style="width: 80px; text-align: center;"
                                                                            ng-if="!disable_form">
                                                                        <span ng-if="disable_form" class="text-bold">@{{comp.note}}/10</span>
                                                                    </div>
                                                                </td>
                                                                <td class="bordered-top w-75" style="padding: 5px;">
                                                                    <textarea ng-model="comp.commentaire"
                                                                        placeholder="Entrez votre commentaire ici..."
                                                                        class="form-control"
                                                                        style="resize: vertical; width: 100%; min-height: 50px; max-height: 200px; border-radius: 8px; padding: 5px; font-size: 14px;"
                                                                        ng-if="!disable_form"></textarea>
                                                                    <span ng-if="disable_form" class="text-bold">@{{comp.commentaire}}</span>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
                <div class="text-right modal-footer ">
                    <div class="pull-right" ng-if="!disable_form">
                    </div>
                    <div class="pull-right" ng-if="disable_form">
                        <button type="reset" data-dismiss="modal" class="btn btn-outline-danger mr-1">
                            <i class="fas fa-times"></i> Fermer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade text-left" id="modal_adderreur" tabindex="-1" role="dialog"
        aria-labelledby="myModalLabel2" aria-hidden="true">
        <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header bg-info">
                    <h4 class="modal-title text-dark" id="myModalLabel2">
                        <span class="fas fa-window-maximize mr-1"></span> Erreur
                    </h4>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">×</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="form_adderreur" class="form" accept-charset="UTF-8"
                        ng-submit="addElement($event,'erreur')">
                        @csrf
                        <input type="hidden" id="id_erreur" name="id">
                        <div class="row">
                            <div class="col-md-12">
                                <div class="form-group mb-1">
                                    <label for="designation_erreur" class="required">Désignation</label>
                                    <input type="text" id="designation_erreur" name="designation"
                                        class="form-control" placeholder="...">
                                </div>
                            </div>
                            <div class="col-md-12">
                                <div class="form-group mb-2">
                                    <label for="erreur_erreur" class="required">Texte</label>
                                    <textarea rows="15" type="text" id="erreur_erreur" name="erreur" class="form-control" placeholder="..."></textarea>
                                </div>
                            </div>
                            <div class="col-md-12 modal-footer text-right border-top">
                                <div class="pull-right pt-1">
                                    <button type="reset" data-dismiss="modal" class="btn btn-outline-danger mr-1">
                                        <i class="fas fa-times"></i> Fermer
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
    <!-- fin modal -->
@endsection
