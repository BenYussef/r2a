var app = angular.module('BackEnd', ['ngRoute', 'ngSanitize', 'ngLoadScript', 'ui.bootstrap', 'angular.filter', 'ngCookies']);
//rechercher markme pour touver la LISTE, l'AJOUT, la MODIFICATION et la SUPPRESSION
//var BASE_URL = '//' + location.host + '/r2a/public/';
var BASE_URL = '//' + location.host + '/r2a/public/';
var imgupload = BASE_URL + '/assets/images/upload.jpg';
var msg_erreur = 'Une Erreur est survenue sur le serveur, veuillez contacter le support technique';

function unauthenticated(error) {
    if (error.status === 401) {
        $scope.showToast("", "Votre session utilisateur a expiré...", 'error');
        setTimeout(function () {
            window.location.reload();
        }, 2000);
    }
}

app.filter('range', function () {
    return function (input, total) {
        total = parseInt(total);
        for (var i = 0; i < total; i++)
            input.push(i);
        return input;
    };
});

app.filter('formatTime', function ($filter) {
    return function (time, format) {
        var parts = time.split(' ');
        var hours;
        if (parts[1]) {
            hours = parts[1].split(':');
        } else {
            hours = parts[0].split(':');
        }

        return hours[0] + ':' + hours[1];
    };
});

app.filter('formatTimeslash', function ($filter) {
    return function (time, format) {
        var parts = time.split(' ');
        if (parts && parts.length > 0) {
            parts = parts[0];
        }
        parts = parts.split('-');
        return parts[2] + '/' + parts[1] + '/' + parts[0];

    };
});
// Quand on veut filtrer un nombre
app.filter('roundToInt', function ($filter) {
    return function (number) {
        if(number>0){
            return Math.round(number);
        }
        return 0;

    };

})

app.filter('formatTimeHours', [
    function () { // should be altered to suit your needs
        return function (input) {
            var timeStart = input.indexOf(' ');
            var time = input.substring(timeStart + 1, input.length - 3)
            return time;
        };
    }]);

// Pour mettre les espaces sur les montants
app.filter('convertMontant', [
    function () { // should be altered to suit your needs
        return function (input) {
            input = input ? input + "" : 0 + "";
            return input.replace(/,/g, " ");
        };
    }]);

app.directive('stringToNumber', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel) {
            ngModel.$parsers.push(function (value) {
                return '' + value;
            });
            ngModel.$formatters.push(function (value) {
                return parseFloat(value);
            });
        }
    };
});

app.factory('theme', function ($cookies) {

    var factory =
    {
        pathCookie: { path: '/' },
        nameCookie: 'theme',
        data: false,
        setCurrent: function (theme) {
            $cookies.putObject(factory.nameCookie, theme, factory.pathCookie);
        },
        getCurrent: function () {
            return (!$cookies.getObject(factory.nameCookie) ? 'theme-Groupe' : $cookies.getObject(factory.nameCookie));
        },
        removeCurrent: function ($scope) {
            $cookies.remove(factory.nameCookie, factory.pathCookie);
        },
    };
    return factory;

});

app.factory('Init', function ($http, $q) {
    var factory =
    {
        data: false,
        getElement: function (element, listeattributs, listeattributs_filter = null, is_graphQL = true, dataget) {
            var deferred = $q.defer();

            add_text_filter = '';

            if (listeattributs_filter != null && element.indexOf('(') !== -1) {

                args_filter = element.substr(element.indexOf('('), element.length + 1);
                // console.log('args_filter', args_filter);
                $.each(listeattributs_filter, function (key, attr) {
                    add_text_filter = ((key === 0) ? ',' : '') + attr + args_filter + (listeattributs_filter.length - key > 1 ? ',' : '') + add_text_filter;
                });
                add_text_filter = ',' + add_text_filter.substr(0, add_text_filter.length)
                //console.log("args_filter" , args_filter, add_text_filter   )
            }

            // console.log('ici add_text_filter', listeattributs, listeattributs_filter, add_text_filter);

            // console.log(BASE_URL + (is_graphQL ? 'graphql?query= {' + element + ' {' + listeattributs + (add_text_filter ? ',' : '') + add_text_filter + '} }' : element));
            var params = encodeURIComponent(element);
            $http({
                method: 'GET',
                url: BASE_URL + (is_graphQL ? 'graphql?query= {' + params + ' {' + listeattributs + (add_text_filter ? ',' : '') + add_text_filter + '} }' : element),
                headers: {
                    'Content-Type': 'application/json'
                },
                data: dataget
            }).then(function successCallback(response) {
                /*lorsque la requete contient des paramètres, il faut decouper pour recupérer le tableau*/
                if (is_graphQL) {
                    factory.data = response['data']['data'][!element.indexOf('(') != -1 ? element.split('(')[0] : element];
                } else {
                    factory.data = response['data'];
                }
                deferred.resolve(factory.data);
            }, function errorCallback(error) {
                unauthenticated(error);
                deferred.reject(msg_erreur);
            });
            return deferred.promise;
        },
        getElementPaginated: function (element, listeattributs, listeattributs_filter) {

            // POUR METTRE LES FILTRES AU NIVEAU DES ATTRIBUTS

            add_text_filter = '';
            // console.log('--------Attr ---------');
            // console.log(listeattributs);
            // console.log('--------_Filter ---------');
            // console.log(element);

            if (listeattributs_filter != null) {

                args_filter = element.substr(element.indexOf('('), element.length + 1);
                // console.log('args_filter', args_filter);
                $.each(listeattributs_filter, function (key, attr) {

                    $getAttr = attr;
                    $reste = "";
                    if (attr.indexOf('{') !== -1) {
                        $getAttr = attr.substr(0, attr.indexOf('{'));
                        $reste = attr.substr(attr.indexOf('{'), attr.length + 1);
                    }
                    add_text_filter = ((key === 0) ? ',' : '') + $getAttr + args_filter + $reste + (listeattributs_filter.length - key > 1 ? ',' : '') + add_text_filter;
                    // console.log('add_text_filter ===>', add_text_filter);
                });
                add_text_filter = ',' + add_text_filter.substr(0, add_text_filter.length)
                //console.log("args_filter" , args_filter, add_text_filter   )
            }

            // console.log('ici add_text_filter', listeattributs_filter, add_text_filter);
            var params = encodeURIComponent(element);
            var deferred = $q.defer();
            $http({
                method: 'GET',
                url: BASE_URL + 'graphql?query={' + params + '{metadata{total,per_page,current_page,last_page},data{' + listeattributs + (add_text_filter ? ',' : '') + add_text_filter + '}}}'
            }).then(function successCallback(response) {
                // console.log(response, 'bonjour response !!!')
                factory.data = response['data']['data'][!element.indexOf('(') != -1 ? element.split('(')[0] : element];
                deferred.resolve(factory.data);
            }, function errorCallback(error) {
                unauthenticated(error);
                deferred.reject(error);
            });
            return deferred.promise;
        },
        saveElement: function (element, data) {
            console.log('------_Data-----');
            console.log(data)
            var deferred = $q.defer();
            $http({
                method: 'POST',
                url: BASE_URL + '/' + element,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: data
            }).then(function successCallback(response) {
                factory.data = response['data'];
                deferred.resolve(factory.data);
            }, function errorCallback(error) {
                unauthenticated(error);
                deferred.reject(msg_erreur);
            });
            return deferred.promise;
        },
        generatePdf: function (element, data) {
            var deferred = $q.defer();
            $http({
                method: 'POST',
                url: BASE_URL + '' + element,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: data
            }).then(function successCallback(response) {
                factory.data = response['data'];
                deferred.resolve(factory.data);
            }, function errorCallback(error) {
                unauthenticated(error);
                deferred.reject(msg_erreur);
            });
            return deferred.promise;
        },
        changeStatut: function (element, data) {
            var deferred = $q.defer();
            $http({
                method: 'POST',
                url: BASE_URL + element + '/statut',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: data
            }).then(function successCallback(response) {
                factory.data = response['data'];
                deferred.resolve(factory.data);
            }, function errorCallback(error) {
                unauthenticated(error);
                deferred.reject(msg_erreur);
            });
            return deferred.promise;
        },
        
        terminerTouteLaCommande: function (element, data) {

            var deferred = $q.defer();
            $http({
                method: 'POST',
                url: BASE_URL + element + '/terminerTouteLaCommande',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: data
            }).then(function successCallback(response) {
                factory.data = response['data'];
                deferred.resolve(factory.data);
            }, function errorCallback(error) {
                unauthenticated(error);
                deferred.reject(msg_erreur);
            });
            return deferred.promise;
        },
        
        saveElementReorder: function (element,data) {

            
            var deferred = $q.defer();
           

            console.log(data);
            $http({
                method: 'POST',
                url: BASE_URL + element + '/reorder',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: data
            }).then(function successCallback(response) {
                factory.data = response['data'];
                deferred.resolve(factory.data);
                
            }, function errorCallback(error) {
                unauthenticated(error);
                deferred.reject(msg_erreur);
            });
            return deferred.promise;
        },
        saveElementAjax: function (element, data, is_file_excel = false) {
            var deferred = $q.defer();
            $.ajax
                (
                    {
                        url: BASE_URL + element + (is_file_excel ? '/import' : ''),
                        type: 'POST',
                        contentType: false,
                        processData: false,
                        DataType: 'text',
                        data: data,
                        headers: {
                            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
                        },
                        beforeSend: function () {
                            $('#modal_add' + element).blockUI_start();
                        }, success: function (response) {
                            $('#modal_add' + element).blockUI_stop();
                            factory.data = response;
                            deferred.resolve(factory.data);
                        },
                        error: function (error) {
                            unauthenticated(error);
                            $('#modal_add' + element).blockUI_stop();
                            deferred.reject(msg_erreur);
                        }
                    }
                );
            return deferred.promise;
        },
        cloturerCodif: function (element, id) {
            var deferred = $q.defer();
            $http({
                method: 'POST',
                url: BASE_URL +element + '/statut/' + id,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(function successCallback(response) {
                factory.data = response['data'];
                deferred.resolve(factory.data);
            }, function errorCallback(error) {
                unauthenticated(error);
                deferred.reject(msg_erreur);
            });
            return deferred.promise;
        },
        
        synchroniserDonnees: function (element, id) {
            var deferred = $q.defer();
            $http({
                method: 'POST',
                url: BASE_URL  + 'synchroniser_donnees/' + id,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(function successCallback(response) {
                factory.data = response['data'];
                deferred.resolve(factory.data);
            }, function errorCallback(error) {
                unauthenticated(error);
                deferred.reject(msg_erreur);
            });
            return deferred.promise;
        },
        requeteConfirmerNotes: function (element, id) {
            var deferred = $q.defer();
            $http({
                method: 'POST',
                url: BASE_URL  + 'confirmation_note_periode/' + id,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(function successCallback(response) {
                factory.data = response['data'];
                deferred.resolve(factory.data);
            }, function errorCallback(error) {
                unauthenticated(error);
                deferred.reject(msg_erreur);
            });
            return deferred.promise;
        },
        changeStatutCodifRelecteur: function (element, codification_id, relecteur_id) {
            var deferred = $q.defer();
            $http({
                method: 'POST',
                url: BASE_URL + 'codification-relecteur/statut/' + codification_id+ '/' + relecteur_id,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(function successCallback(response) {
                factory.data = response['data'];
                deferred.resolve(factory.data);
            }, function errorCallback(error) {
                unauthenticated(error);
                deferred.reject(msg_erreur);
            });
            return deferred.promise;
        },
        removeElement: function (element, id) {
            var deferred = $q.defer();
            $http({
                method: 'DELETE',
                url: BASE_URL + element + '/' + id,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(function successCallback(response) {
                factory.data = response['data'];
                deferred.resolve(factory.data);
            }, function errorCallback(error) {
                unauthenticated(error);
                deferred.reject(msg_erreur);
            });
            return deferred.promise;
        },
        userPermission: function (object) {
            var deferred = $q.defer();
            $http({
                method: 'POST',
                url: BASE_URL + 'notifuser',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: object
            }).then(function successCallback(response) {
                factory.data = response['data'];
                deferred.resolve(factory.data);
            }, function errorCallback(error) {
                unauthenticated(error);
                deferred.reject(msg_erreur);
            });
            return deferred.promise;
        },
        generateExcel: function (element, data) {
            var deferred = $q.defer();
            $http({
                method: 'GET',
                url: BASE_URL + element + '/' + data,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(function successCallback(response) {
                factory.data = response['data'];
                deferred.resolve(factory.data);
            }, function errorCallback(error) {
                unauthenticated(error);
                deferred.reject(msg_erreur);
            });
            return deferred.promise;
        },
    };

    return factory;
});

//--DEBUT ==> Configuration des routes--//
//markme-LISTE
app.config(function ($routeProvider) {
    
    // don't forget to set HTM5 mode true
    let currentPath = window.location.href;

    
    $routeProvider
    .when("/:namepage?/:itemId?", {
        templateUrl: function (elem, attrs) {
            
            return "page/" + (elem["namepage"] ? elem["namepage"] : "list-periode"); //Pour la page ou route par défaut

        },
    });
    
    
    
});


// Spécification fonctionnelle du controller
app.controller('BackEndCtl', function (Init, theme, $location, $scope, $filter, $log, $q, $route, $routeParams, $timeout, $compile, $http) {

    $scope.imgupload = imgupload;
    $scope.txt_baranne = "bar.";

    $scope.BASE_URL = BASE_URL;
    $scope.param = null;
    $scope.currentTemplateUrl;
    $scope.titlePage;
    $scope.check;
    $scope.current_month;
    $scope.est_active_panel; 
    $scope.current_year;
    $scope.start_week;
    $scope.end_week; 

    $scope.start_week_print;
    $scope.end_week_print; 
    $scope.est_active_week; 
    $scope.current_week;  
    $scope.caisse_source_list_approcash = null;
    $scope.caisse_destinataire_list_approcash = null;
    $scope.operateur_conditions = "&&";

    $scope.banniere = null;
    $scope.array_reordered = [];
    $scope.current_pagination_page = 1;
    $scope.taskid_codification = null;
    $scope.notes_periode = [];
    $scope.disable_form = false;
    var listofrequests_assoc =
    {
        //-------------DEBUT ==> MES REQUETES PERSONNALISEES--------------------//
        //markme-LISTE
        "erreurs": [
            "id,type,designation,erreur,vu,vu_text,vu_badge,created_at,updated_at"
        ],
        "notifications": [
            "nbre_erreurs"
        ],
        "preferences": [
            "id,list_id,delais_notification,emails_a_notifier,nbre_entreprise_par_jour,couleur_codif,couleur_relec"
        ],      
        "permissions": [
            'id,name,display_name,guard_name,designation',
        ],
        "roles": [
            "id,name,guard_name,permissions{id,name,display_name,guard_name}",
        ],
        "users": [
            "id,image,name,nom,prenom,est_evaluateur,is_admin,email,numerotel,id_askia,password_seen,roles{id,name},created_at_fr,updated_at_fr,last_login",
        ],
       
        "categories": [
            "id,designation,ordre,competences_count,competences{id,designation},created_at,created_at_fr,updated_at",
        ],
        "fournisseurs": [
            "id,designation,created_at,created_at_fr,active_badge,active,active_text,updated_at,liste_evaluateur,fournisseur_evaluateurs{id,evaluateur_id,fournisseur_id,evaluateur{id,name}}",
        ],
        "competences" : [
            "id,designation,ordre,categorie_id,categorie{id,designation},created_at,updated_at,created_at_fr"
        ],
        "restitcompetences" : [
            "data"
        ],
        "periodes" : [
            "id,designation,type,date_notification,active,active_text,fournisseur_id,fournisseur{id,designation,liste_evaluateur,fournisseur_evaluateurs{id,evaluateur_id,fournisseur_id,evaluateur{id,name}}},active_badge,competences_remplies,competences_valides,total_competences,remplissage_badge,created_at,updated_at,created_at_fr,date_notification_fr"
        ],
        "periodeusers" : [
            "id,designation,type,date_notification,created_at,updated_at,created_at_fr,date_notification_fr"
        ],
        "connexions": [
            "id,login,last_login_ip,user_id,user{id,name,email},created_at_fr"
        ],
        "envoies": [
            "id,user_id,r2a_id,user{name},r2a{designation},created_at,created_at_fr,updated_at,updated_at_fr"
        ],
        "dashboards": [
            "total_etudes,total_r2as,r2as_envoyes,r2as_non_envoyes",
        ],
        //dashboardcodifrelecs
        //codifications,nbre_verbatim_Acodifier,nbre_verbatim_codifier,nbre_verbatim_Arelir,nbre_verbatim_relus,nbre_codif,nbre_r2a,nbre_codif_finie,nbre_r2a_finie,taux_relu,taux_codif,codif_mois_passe,r2a_mois_passe,codif_du_mois,r2a_du_mois
        //
        //-------------FIN ==> MES REQUETES PERSONNALISEES--------------------//
    };

    /* Mes fonctions a part que je optimiser*/
    $scope.famille_id = 0;
    $scope.inputs = [];
    $scope.months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Décembre"];
    $scope.inputsbannieres = [];
    $scope.passage = false;
    $scope.directbce = false;
    $scope.commandeOfferte = false;
    $scope.items_to_order = [];
    $scope.groupedCompetences = [];
    $scope.toutTerminerCommande = function () {
        if ($scope.dataPage['commandeproduitencour'] && $scope.dataPage['commandeproduitencour'].length > 0) {
            $scope.showModalStatut(null, 'commandeencour', 4, $scope.dataPage['commandeproduitencour'], 'Préparation terminée', null, null, list)
            // for (var i=0;i<$scope.dataPage['commandeproduitencour'].length;i++){
            //     var item = $scope.dataPage['commandeproduitencour'][i];
            //     var index = $scope.dataPage['commandeproduitencour'].indexOf(item);
            //     var list = true;
            //     if(index == $scope.dataPage['commandeproduitencour'].length - 1){
            //         list = false;
            //     }
            //     $scope.showModalStatut(null,'commandeencour', 4, item, 'Préparation terminée', index, null,list)
            // }
        }
    }

    $scope.addfield = function (type = null, src = null) {

        var objet = null;
        if (type == 'produit' || type == 'banniere') {
            var index = 0;
            if (type == 'produit') {
                index = $scope.inputs.length + 1;
            }
            else if (type == 'banniere') {
                index = $scope.inputsbannieres.length + 1;
            }

            if (!src) {
                src = 'assets/images/upload.jpg';
            }
            objet = {
                'id': index,
                'name': 'img' + index,
                'fullname': 'img' + index + type,
                'id_image': 'affimg' + index + type,
                'erase_id': 'erase_img' + index + type,
                'value': 'image' + index,
                'src': src
            };
            if (type == 'produit') {
                $scope.inputs.push(objet);
            }
            else if (type == 'banniere') {
                $scope.inputsbannieres.push(objet);
            }
        } else if (type == 'r2a_proforma' || type == 'rh_proforma') {
            var index = $scope.dataInTabPane['item_tab_panes_' + type]['data'].length + 1;
            objet = {
                'id': index,
                'name': $('#titre_' + type).val() + "-" + $('#date_' + type).val()
            }
            $('#titre_' + type).val('');
            $('#date_' + type).val('');

            $scope.dataInTabPane['item_tab_panes_' + type]['data'].push(objet);

            console.log('---------Active select 2---')
            $(".item_tab_panes_" + type).fadeIn('slow');
            // $(".select2").fadeIn('slow');

        }
    }
    $scope.saveReorder =  function (e,element) {
        if (e != null) {
            e.preventDefault();
        }
        let data = [];
        if($scope.array_reordered[element]){
            
            data    = '{"'+element+'": '+JSON.stringify($scope.array_reordered[element])+'}' 
            data    = JSON.parse(data)
            console.log(data);
        }
        Init.saveElementReorder(element,data)
            .then(()=>{
                $scope.pageChanged(element);
                $scope.closeModal("#modal_order"+element)
                $("#modal_order"+element).modal('hide');
            });
        
    },
    $scope.ChangeCLientCOmmande = function () {
        var client_passage = $("#client_passage_commande").prop("checked");

        if (client_passage == true) {
            $scope.client = null;
            $scope.client_id_commande = null;
            $("#client_id_commande").val(null);
            $('.client-entite').fadeOut('slow');
            $('.client-entite').val(null);
            $scope.client_passage = client_passage;
            $scope.reservation_commande = null;
        } else {
            $scope.reInit();
            $('.client-entite').fadeIn('slow');
            //  $scope.client = null;
            $scope.client_passage = null;
        }
    }

    $scope.initMenuCarteTab = function (id = null) {
        $scope.accompagnements = [];
        $scope.produit = null;
        $scope.famille_accompagnement = null;
        $scope.dataInTabPane['accompagnement_commande']['data'] = [];
        $scope.option = null;
        $scope.paginations['produit'].currentPage = 1;
        $scope.paginations['menu'].currentPage = 1;
        $scope.getFamilleCarte(id);

    }
    $scope.getCarteByFamilleAndEntite = function (famille_id) {


        var tagForm = 'restaurant_commande';

        $("input[id$=" + tagForm + "], textarea[id$=" + tagForm + "], select[id$=" + tagForm + "]").each(function () {
            console.log('-------id restau--------');
            console.log($(this).find("option:selected").val());
            //rewriteReq = 'cartes';
            rewriteReq = 'cartes(famille_id:' + famille_id + ',restaurant:' + $(this).find("option:selected").val() + ')';
            $('#modal_add' + 'commande').blockUI_start();
            if ($(this).find("option:selected").val()) {
                Init.getElement(rewriteReq, listofrequests_assoc['cartes']).then(function (data) {
                    if (data) {
                        console.log('---------Voici la carte---------');
                        console.log(data);
                        $scope.dataPage['cartes'] = data;
                        $('#modal_add' + 'commande').blockUI_stop();
                        setTimeout(function () {
                            // $('#'+type+'_id_'+typeForeign).val(id).trigger('change');
                        }, 1000);
                    }

                }, function (msg) {
                    $('#modal_add' + 'commande').blockUI_stop();
                    toastr.error(msg);
                });
            } else {
                $('#modal_add' + 'commande').blockUI_stop();
            }
        });

    }
    $scope.getProduitByFamille = function (item) {
        $scope.accompagnements = [];
        if (item) {
            $scope.famille_accompagnement = item;
            console.log('----------le montant des accompagnement--------------');
            console.log(item.details_produits);
            $scope.accompagnements = item.details_produits;
        }
        /*rewriteReq = 'produits(famille_id:'+famille_id+')';
        $('#modal_add'+type).blockUI_start();

            Init.getElement(rewriteReq, listofrequests_assoc['produits']).then(function (data)
            {
                if(data)
                {
                    console.log('---------Voici la carte---------');
                    console.log(data);
                    $scope.accompagnements = [];
                    $scope.accompagnements = data;
                    $('#modal_add'+type).blockUI_stop();
                    setTimeout(function ()
                    {
                        // $('#'+type+'_id_'+typeForeign).val(id).trigger('change');
                    },1000);
                }

            },function (msg)
            {
                $('#modal_add'+type).blockUI_stop();
                toastr.error(msg);
            });*/
    }
    // $scope.addProduitCommandeModif = function (action, item, type = null, $event = null) {
    //     var timer = 0;
    //     var delay = 200;
    //     var prevent = false;
    //     $("#produit_commande"+item.id)
    //         .on("click", function() {
    //             timer = setTimeout(function() {
    //                 if (!prevent) {
    //
    //                         $scope.addProduitCommande(action, item);
    //                 }
    //                 prevent = false;
    //             }, delay);
    //         })
    //         .on("dblclick", function() {
    //             clearTimeout(timer);
    //             prevent = true;
    //             $scope.showDetailproduitcommande('detailproduitcommande', item)
    //         });
    //
    //
    //
    // }

    $scope.addProduitCommande = function (action, item, type = null, $event = null) {

        console.log($event);

        var typecommande = 'carte';
        var produit = item;


        if (item == null) {
            typecommande = 'menu';
            produit = $scope.produit;
        }
        if (produit) {
            $scope.actionSurTabPaneTagDataCommande(action, 'produits_commande', 0, 'produit', produit, typecommande)
        }

    }
    $scope.actionDirect = function (item, type = null, action = null, tabPane = null, form = null) {
        if (tabPane == 'tab') {
            action = action ? action : 'add';
            console.log(item);
            if (item == null) {
                var tagForm = type;
                var findError = false;
                var currentPosition = $scope.dataInTabPane[tagForm]['data'].length;
                var message_duplicatevalue = null;
                $("input[id$=" + tagForm + "], textarea[id$=" + tagForm + "], select[id$=" + tagForm + "]").each(function () {
                    if ($(this).hasClass('required') && !$(this).val()) {
                        findError = true;
                        $scope.dataInTabPane[tagForm]['data'].splice((currentPosition), 1);
                        message_duplicatevalue = 'Veuillez remplir tous les champs obligatoires';
                    }
                    if (findError == false) {
                        console.log($(this).find("option:selected").text());
                        console.log($(this).find("option:selected").val());
                        var rewriteReq = "produits(id:" + $(this).find("option:selected").val() + ")";
                        // form_addmenu
                        if (form) {
                            $('#form_add' + type).blockUI_start();
                        }
                        Init.getElement(rewriteReq, listofrequests_assoc['produits']).then(function (data) {
                            if (form) {
                                $('#form_add' + type).blockUI_stop();
                            }
                            if (data && data.length == 1) {
                                item = data[0];
                                $scope.actionSurTabPaneDirect(action, type, 0, 'produit', item, item.famille_id)
                                $(this).find("option:selected").val(null).change();
                            }
                        }, function (msg) {
                            if (form) {
                                $('#form_add' + type).blockUI_stop();
                            }
                            toastr.error(msg);
                        });
                    } else {
                        $scope.showToast('', message_duplicatevalue, 'error');
                    }
                });

            } else {
                $scope.actionSurTabPaneDirect(action, type, 0, 'produit', item, item.famille_id)
            }
        } else if (tabPane == 'class') {
            $('#adresse_de_livraison_commande').val(item.designation);
            $scope.adresse_de_livraison_commande = item.designation;
            $scope.zone_de_livraison_commande = item.zone_de_livraison.designation;
            $scope.adresse_livraison = item;

        }
    }

    $scope.getProduitByFamilleMenu = function (item) {
        console.log('-------Produit menu--------------');
        console.log($scope.produit);
        $scope.option = item;
        $scope.option['produits'] = $filter('filter')($scope.produit.produits, { option_menu: item.id });
    }

    $scope.choisirFournisseurDevise = function (type) {
        console.log('choisirFournisseurDevise');
        var founisseurid = $("#fournisseur_" + type).val();
        if (founisseurid != '') {
            rewriteReq = 'fournisseurs(id:' + founisseurid + ')';
            Init.getElement(rewriteReq, listofrequests_assoc['fournisseurs']).then(function (data) {
                if (data && data[0]) {
                    $("#devise_" + type).val(data[0].devise_id).trigger('change');

                }
            });
        }
        else {
            $("#devise_" + type).val('')

            // $scope.getelements('typeedevisemballages');

        }
    }

    $scope.montantR2a = 0
    $scope.ChoisireCalculerMontantR2aDePaie = function () {
        var contrat = $("#contrat_r2adepaie").val();
        var somme = 0;
        if (contrat != '') {
            rewriteReq = 'contrats(id:' + contrat + ')';
            Init.getElement(rewriteReq, listofrequests_assoc['contrats']).then(function (data) {
                if (data && data[0]) {

                    $scope.dataInTabPane['r2adepaie_motif']['data'].map(function (item, key) {
                        somme += parseInt(item.montant)

                    });
                    $scope.montantR2a = parseInt(data[0].montant) + parseInt(somme);

                    /*  setTimeout(function ()
                     {
                         $scope.montantR2a = parseInt(data[0].montant) + parseInt(somme);
                         console.log(  'ici la somme du r2a ',$scope.montantR2a)
                     },200); */
                }


            });

        }
        else {
            $("#pr_decoupage_produit").val('')

        }
        //r2adepaie_motif
        console.log('ici le calcule du prix')
    }

    //Calcule prix de revient pour le decoupage
    $scope.calculerPrixDecoupage = function () {
        console.log("calculerPrixDecoupage");

        var nbrePart = $("#nbpart_decoupage_produit").val();
        var prixEmballage = $("#prix_emballage_decoupage_produit").val();
        var paPart = $("#prix_decoupage_produit").val();
        var charge = $("#charge_decoupage_produit").val();

        if ($scope.estEntier(nbrePart) == false) {
            nbrePart = 0;
        }
        if ($scope.estFloat(prixEmballage) == false) {
            prixEmballage = 0;
        }
        if ($scope.estFloat(paPart) == false) {
            paPart = 0;
        }
        if ($scope.estFloat(charge) == false) {
            charge = 0;
        }

        var prPart = parseFloat(paPart) + parseFloat(prixEmballage) - parseFloat(charge);
        $("#pr_decoupage_produit").val(prPart);
        return prPart;
    }

    $scope.montantbci = 0
    $scope.montantbce = 0

    $scope.calculerMontant = function (tagForm) {
        var somme = 0;
        $scope.dataInTabPane[tagForm]['data'].map(function (item, key) {
            somme += parseInt(item.quantite) * parseInt(item.prix_achat)
            if (tagForm == 'produits_bci') {
                console.log()
                $scope.montantbci = somme
            }
            else {
                $scope.montantbce = somme
            }
        });
    }

    //Donne le stock théorique par rapport à un produit et ou un dépot
    $scope.SetQteTheorique = function (typeCourant = 'inventaire', produit_id = null, depot_id = null) {
        console.log("SetQteTheorique");
        if ($scope.estEntier(produit_id) == false) {
            if (typeCourant == 'inventaire') {
                produit_id = $("#produit_produits_" + typeCourant).val();
            }
            else if (typeCourant == 'production' || typeCourant == 'decoupage') {
                produit_id = $("#produit_produits_" + typeCourant).val();
            }
            else if (typeCourant == 'inventairelogistique') {
                produit_id = $("#produit_produits_" + typeCourant).val();
            }
        }

        if ($scope.estEntier(depot_id) == false) {
            if (typeCourant == 'production' || typeCourant == 'decoupage') {
                depot_id = $("#depot_" + typeCourant).val();
            }
            else if (typeCourant == 'inventaire') {
                depot_id = $("#depot_" + typeCourant).val();
            }
            else if (typeCourant == 'inventairelogistique') {
                depot_id = $("#depot_" + typeCourant).val();
            }
        }

        if ($scope.estEntier(produit_id) == true) {
            if ($scope.estEntier(depot_id) == false) {
                iziToast.error({
                    message: "Veuillez choisir un dépôt",
                    position: 'topRight'
                });
                return false;
            }

            var filtres = 'id:' + produit_id + ''
                + ($scope.estEntier(depot_id) == true ? (',depot_id:' + depot_id + '') : "")
                ;

            console.log('FiltresSetQteTheorique ==>', filtres);
            /* var tagForm = 'itemsfiltres_facture';
            $scope.dataInTabPane[tagForm]['data'] = []; */

            var form = $('#form_add' + typeCourant);
            form.parent().parent().blockUI_start();
            var type = 'produit';
            if (typeCourant == 'inventairelogistique') {
                var type = 'logistique';
            }
            var typeAvecS = type + 's';
            var rewriteReq = typeAvecS + '(' + filtres + ')';
            var form = $('#form_add' + typeCourant);
            form.parent().parent().blockUI_start();
            Init.getElement(rewriteReq, listofrequests_assoc[typeAvecS]).then(function (data) {
                form.parent().parent().blockUI_stop();
                if (data && data[0]) {
                    //console.log('ici la quantite ==>',data);
                    console.log('je suis dans affectation qte inventairelogistique', typeCourant);
                    var qte = 0;
                    if (data[0].current_quantity) {
                        qte = data[0].current_quantity;
                    }

                    if (typeCourant == 'inventaire') {
                        $("#quantite_theorique_produits_" + typeCourant).val(parseInt(qte));
                    }
                    else if (typeCourant == 'production' || typeCourant == 'decoupage') {
                        //$("#qte_theorique_produits_"+typeCourant).val(parseInt(qte));
                        $(".qte-courante").val(parseInt(qte));
                    }
                    else if (typeCourant == 'inventairelogistique') {
                        $("#quantite_theorique_produits_" + typeCourant).val(parseInt(qte));
                        //$(".qte-courante").val(parseInt(qte));

                    }
                }
            });
        }
    }

    $scope.CalculerDifference = function () {
        var qteteorique = $("#quantite_theorique_produits_inventaire").val();
        var qtetreel = $("#quantite_reel_produits_inventaire").val();

        if (qteteorique != '' && qtetreel != '') {
            var somme = parseInt(qteteorique) - parseInt(qtetreel)
            $("#difference_produits_inventaire").val(parseInt(somme));
            $(".unite-mesure").val(somme);
        }
        else {
            $("#difference_produits_inventaire").val('');
        }
    }

    //Action sur tab pane Aoudy BCI OU BCE
    $scope.actionSurTableauBceBci = function (action, tagForm, currentIndex = 0, parentIndex = 0, obj = null) {
        if (action == 'add') {
            if (tagForm == 'decoupage_produit') {
                var nbrepart = $("#nbpart_" + tagForm).val();
                var emballage = $("#embalage_" + tagForm).val();
                var prix = $("#prix_" + tagForm).val();
                var pr = $("#pr_" + tagForm).val();
                var prix_emballage = $("#prix_emballage_" + tagForm).val();
                var charge = $("#charge_" + tagForm).val();
                var foundit = false;

                if ($scope.estFloat(prix_emballage) == false) {
                    prix_emballage = 0;
                }
                if ($scope.estFloat(charge) == false) {
                    charge = 0;
                }

                if (nbrepart != '' && emballage != '' && prix != '') {
                    $scope.dataInTabPane[tagForm]['data'].map(function (item, key) {
                        if (item.emballage_id == emballage && item.nombre_parts == nbrepart) {
                            $scope.showToast('', 'Ce découpage exite déja dans le tableau', 'error');
                            foundit = true;
                        }
                    });
                    if (foundit == false) {
                        rewriteReq = 'emballages(id:' + emballage + ')';
                        var typeCourant = 'produit';
                        var form = $('#form_add' + typeCourant);
                        form.parent().parent().blockUI_start();
                        Init.getElement(rewriteReq, listofrequests_assoc['emballages']).then(function (data) {
                            form.parent().parent().blockUI_stop();
                            if (data && data[0]) {
                                $scope.dataInTabPane[tagForm]['data'].unshift({
                                    "emballage_id": data[0].id,
                                    "emballage": { designation: data[0].designation },
                                    "nombre_parts": nbrepart,
                                    "prix": prix,
                                    "pr": pr,
                                    "prix_emballage": prix_emballage,
                                    "charge": charge,
                                });
                                setTimeout(function () {
                                    $("#nbpart_" + tagForm).val("");
                                    $("#prix_" + tagForm).val("");
                                    $("#pr_" + tagForm).val("");
                                    $("#prix_emballage_" + tagForm).val("");
                                    $("#charge_" + tagForm).val("");
                                    $("#embalage_" + tagForm).val("").trigger('change');
                                }, 500);
                            }
                        });
                    }

                }
                else {
                    if (nbrepart == '') {
                        $scope.showToast('', 'Veuillez definir le nombre de part', 'error');
                    }
                    else if (emballage == '') {
                        $scope.showToast('', "Veuillez definir  l'emballage", 'error');
                    }
                    else {
                        $scope.showToast('', "Veuillez definir  le prix ", 'error');
                    }
                }
            }
            else if (tagForm == 'produits_inventaire') {
                var produit = $("#produit_" + tagForm).val();
                var quantite = $("#diiference_" + tagForm).val();
                var quantitetherique = $("#quantite_theorique_" + tagForm).val();
                var quantitereel = $("#quantite_reel_" + tagForm).val();
                var difference = $("#difference_" + tagForm).val();

                var foundit = false;
                if (produit != '' && quantitetherique != '' && quantitereel != '') {
                    $scope.dataInTabPane[tagForm]['data'].map(function (item, key) {
                        if (item.produit_compose_id == produit) {
                            $scope.showToast('', 'Ce Produit existe deja dans le tableau', 'error');
                            foundit = true;
                        }

                    });
                    if (foundit == false) {
                        rewriteReq = 'produits(id:' + produit + ')';
                        var typeCourant = 'inventaire';
                        var form = $('#form_add' + typeCourant);
                        form.parent().parent().blockUI_start();
                        Init.getElement(rewriteReq, listofrequests_assoc['produits']).then(function (data) {
                            form.parent().parent().blockUI_stop();
                            if (data && data[0]) {
                                console.log('ici dans ma fonction inventaire');
                                $scope.dataInTabPane[tagForm]['data'].unshift({
                                    "produit_id": data[0].id,
                                    "produit": { designation: data[0].designation },
                                    "quantite_theorique": quantitetherique,
                                    "quantite_reel": quantitereel,
                                    "difference": parseInt(quantitetherique) - parseInt(quantitereel),
                                });
                                setTimeout(function () {
                                    $("#produit_" + tagForm).val("").trigger('change');
                                    $("#quantite_theorique_" + tagForm).val("");
                                    $("#diiference_" + tagForm).val("");
                                    $("#quantite_theorique_" + tagForm).val("");
                                    $("#quantite_reel_" + tagForm).val("");
                                }, 500);
                            }
                        });
                    }

                }
                else {
                    if (produit == '') {
                        $scope.showToast('', 'Veuillez definir le produit', 'error');
                    }
                    else if (quantite == '') {
                        $scope.showToast('', "Veuillez definir  la quantite", 'error');
                    }

                }
            }
            else if (tagForm == 'produits_inventairelogistique') {
                var produit = $("#produit_" + tagForm).val()
                var quantite = $("#diference_" + tagForm).val();
                var quantitetherique = $("#quantite_theorique_" + tagForm).val();
                var quantitereel = $("#quantite_reel_" + tagForm).val();
                var difference = $("#difference_" + tagForm).val();
                if ($("#perte_produits_inventairelogistique").is(":checked")) {
                    var perte_fr = 'Oui';
                    var perte = 1;

                }
                else {
                    var perte_fr = 'Non';
                    var perte = 0;

                }
                var foundit = false;
                if (produit != '' && quantitetherique != '' && quantitereel != '') {
                    $scope.dataInTabPane[tagForm]['data'].map(function (item, key) {
                        if (item.produit_compose_id == produit) {
                            $scope.showToast('', 'Ce Produit existe deja dans le tableau', 'error');
                            foundit = true;
                        }

                    });
                    if (foundit == false) {
                        rewriteReq = 'logistiques(id:' + produit + ')';
                        var typeCourant = 'inventairelogistique';
                        var form = $('#form_add' + typeCourant);
                        form.parent().parent().blockUI_start();
                        Init.getElement(rewriteReq, listofrequests_assoc['logistiques']).then(function (data) {
                            form.parent().parent().blockUI_stop();
                            if (data && data[0]) {
                                console.log('ici dans ma fonction inventaire ')
                                $scope.dataInTabPane[tagForm]['data'].unshift({
                                    "produit_id": data[0].id,
                                    "produit": { designation: data[0].designation },
                                    "quantite_theorique": quantitetherique,
                                    "quantite_reel": quantitereel,
                                    "difference": parseInt(quantitetherique) - parseInt(quantitereel),
                                    "perte_fr": perte_fr,
                                    "perte": perte,
                                });
                                $("#perte_produits_inventairelogistique").prop("checked", false);
                                setTimeout(function () {
                                    $("#produit_" + tagForm).val("").trigger('change');
                                    $("#quantite_theorique_" + tagForm).val('');
                                    $("#quantite_reel_" + tagForm).val('');
                                    $("#perte_produits_" + tagForm).prop("checked", false);
                                }, 500);
                            }
                        });
                    }

                }
                else {
                    if (produit == '') {
                        $scope.showToast('', 'Veuillez definir le produit', 'error');
                    }
                    else if (quantite == '') {
                        $scope.showToast('', "Veuillez definir  la quantite", 'error');
                    }

                }
            }
            else if (tagForm == 'r2adepaie_motif') {
                var motifprime = $("#motifdeprime_" + tagForm).val();
                var montant = $("#montant_" + tagForm).val();
                foundit = false;
                if (motifprime != '' && montant != '') {
                    $scope.dataInTabPane[tagForm]['data'].map(function (item, key) {
                        if (item.motif_prime_id == motifprime) {
                            $scope.showToast('', 'Ce Motif de prime existe deja dans le tableau', 'error');
                            foundit = true;
                        }

                    });
                    if (foundit == false) {
                        rewriteReq = 'motifdeprimes(id:' + motifprime + ')';
                        Init.getElement(rewriteReq, listofrequests_assoc['motifdeprimes']).then(function (data) {
                            if (data && data[0]) {
                                $scope.dataInTabPane[tagForm]['data'].unshift({
                                    "motif_de_prime_id": data[0].id,
                                    "motif_de_prime": { designation: data[0].designation },
                                    "montant": montant,

                                });

                                $scope.ChoisireCalculerMontantR2aDePaie()
                                setTimeout(function () {
                                    $("#motifdeprime_" + tagForm).val("").trigger('change');
                                    $("#montant_" + tagForm).val('');
                                }, 500);
                            }
                        });
                    }

                }
            }
            else if (tagForm == 'zonedelivraison_entite') {
                var entite = $("#entite_" + tagForm).val();
                var montant = $("#montant_" + tagForm).val();
                foundit = false;
                if (entite != '' && montant != '') {
                    $scope.dataInTabPane[tagForm]['data'].map(function (item, key) {
                        if (item.entite_id == entite) {
                            $scope.showToast('', 'Ce Point de vente existe deja dans le tableau', 'error');
                            foundit = true;
                        }

                    });
                    if (foundit == false) {
                        rewriteReq = 'entites(id:' + entite + ')';
                        Init.getElement(rewriteReq, listofrequests_assoc['entites']).then(function (data) {
                            if (data && data[0]) {
                                $scope.dataInTabPane[tagForm]['data'].unshift({
                                    "entite_id": data[0].id,
                                    "entite": { designation: data[0].designation },
                                    "montant": montant,
                                    //"valorisation": valoriser,
                                });
                                setTimeout(function () {
                                    $("#entite_" + tagForm).val("").trigger('change');
                                    $("#montant_" + tagForm).val('');
                                }, 500);
                            }
                        });
                    }

                }
            }
            else if (tagForm == 'produit_bt') {
                var produit = $("#produit_" + tagForm).val();
                var quantite = $("#quantite_" + tagForm).val();
                var foundit = false;
                if (produit != '' && quantite != '') {
                    $scope.dataInTabPane[tagForm]['data'].map(function (item, key) {
                        if (item.produit_compose_id == produit) {
                            $scope.showToast('', 'Ce Produit existe deja dans le tableau', 'error');
                            foundit = true;
                        }

                    });
                    if (foundit == false) {
                        rewriteReq = 'produits(id:' + produit + ')';
                        Init.getElement(rewriteReq, listofrequests_assoc['produits']).then(function (data) {
                            if (data && data[0]) {
                                $scope.dataInTabPane[tagForm]['data'].unshift({
                                    "produit_compose_id": data[0].id,
                                    "produit": { designation: data[0].designation },
                                    "quantite": quantite,
                                    //"valorisation": valoriser,
                                });
                                setTimeout(function () {
                                    $("#produit_" + tagForm).val("").trigger('change');
                                    $("#quantite_" + tagForm).val('');
                                }, 500);
                            }
                        });
                    }

                }
                else {
                    if (produit == '') {
                        $scope.showToast('', 'Veuillez definir le produit', 'error');
                    }
                    else if (quantite == '') {
                        $scope.showToast('', "Veuillez definir  la quantite", 'error');
                    }

                }
            }
            else if (tagForm == 'typedepot_typeproduit') {
                var depot = $("#typedepot_" + tagForm).val();
                foundit = false;

                if ($("#valoriser_" + tagForm).is(":checked")) {
                    var valoriser_fr = 'Oui';
                    var valoriser = 1;

                }
                else {
                    var valoriser_fr = 'Non';
                    var valoriser = 0;

                }
                if (depot != '') {

                    $scope.dataInTabPane[tagForm]['data'].map(function (item, key) {
                        if (item.type_depot_id == depot) {
                            $scope.showToast('', 'Ce type de depot existe deja dans le tableau', 'error');
                            foundit = true;
                        }

                    });
                    if (foundit == false) {
                        rewriteReq = 'typedepots(id:' + depot + ')';
                        Init.getElement(rewriteReq, listofrequests_assoc['typedepots']).then(function (data) {
                            if (data && data[0]) {
                                $scope.dataInTabPane[tagForm]['data'].unshift({
                                    "type_depot_id": data[0].id,
                                    "type_depot": { designation: data[0].designation },
                                    "valorisation_fr": valoriser_fr,
                                    "valorisation": valoriser,
                                });
                                setTimeout(function () {
                                    $("#depot_" + tagForm).val("").trigger('change');
                                    $("#valoriser_" + tagForm).prop('checked', false);
                                }, 500);
                            }
                        });
                    }
                }
                else {
                    if (depot == '') {
                        $scope.showToast('', 'Veuillez definir le  type de depot', 'error');
                    }
                }
            }
            else {
                var produit = $("#produit_" + tagForm).val();
                var quantite = $("#quantite_" + tagForm).val();
                var prix_achat = $("#prix_achat_" + tagForm).val();
                var prix_achat_off = $("#prix_achat_off_" + tagForm).val();
                foundit = false;


                if (produit != '' && quantite != '') {
                    $scope.dataInTabPane[tagForm]['data'].map(function (item, key) {
                        if (item.produit_id == produit) {
                            $scope.showToast('', 'Ce produit exite deja dans le tableau', 'error');
                            foundit = true;
                        }
                    });
                    if (foundit == false) {
                        var querytype = 'produits'
                        var is_logistique = $scope.produitlogistique;
                        console.log('ici pour les entre et sortie de stocks', is_logistique)
                        if (is_logistique == null) {
                            var querytype = 'produits'
                        }
                        else {
                            querytype = 'logistiques'
                        }
                        console.log('ici pour les entre et sortie de stocks', querytype)
                        rewriteReq = querytype + '(id:' + produit + ')';
                        Init.getElement(rewriteReq, listofrequests_assoc[querytype]).then(function (data) {
                            if (data && data[0]) {
                                if (prix_achat == '') {
                                    prix_achat = data[0].prix_achat_unitaire
                                }
                                $scope.dataInTabPane[tagForm]['data'].unshift({
                                    "produit_id": data[0].id,
                                    "produit": { designation: data[0].designation },
                                    "quantite": quantite,
                                    "prix_achat": prix_achat,
                                    "prix_achat_off": prix_achat_off,
                                });
                                console.log('prods BCE', $scope.dataInTabPane[tagForm]['data']);
                                $scope.calculerMontant(tagForm);

                                setTimeout(function () {
                                    $("#produit_" + tagForm).val("").trigger('change');
                                    $("#quantite_" + tagForm).val("");
                                    $("#prix_achat_" + tagForm).val("");
                                    $("#prix_achat_off_" + tagForm).val("");
                                }, 500);
                            }
                        });
                    }
                }
                else {
                    if (produit == '') {
                        $scope.showToast('', 'Veuillez definir le produit', 'error');
                    }
                    else if (quantite == '') {
                        $scope.showToast('', 'Veuillez definir  la quantite ', 'error');

                    }

                }
            }
        }
        else if (action == 'delete') {
            $scope.dataInTabPane[tagForm]['data'].splice(currentIndex, 1);
            if (tagForm == 'r2adepaie_motif') {
                $scope.ChoisireCalculerMontantR2aDePaie()
            }
        }
    };
    $scope.showModalSecondaire = function (type, item, action = 'add') {
        $scope.dataPage['famille_menus'] = [];
        $scope.emptyform(type);
        $scope.dataInTabPane['accompagnement_commande']['data'] = [];
        $scope.accompagnements = [];

        $scope.dataPage['produits'] = [];

        if (type == 'accompagnement') {
            $scope.produit = item;
            $scope.dataInTabPane['accompagnement_commande']['data'] = [];

            if (item.accompagnement_commande && item.accompagnement_commande.length > 0) {
                $scope.dataInTabPane['accompagnement_commande']['data'] = item.accompagnement_commande;
            }

            var famille_laison_produits = item.famille_liaison_produits;

            if (famille_laison_produits && famille_laison_produits.length > 0) {
                $scope.getProduitByFamille(famille_laison_produits[0]);
            }
        }
        else if (type == 'Comment') {
            $scope.produit = item;
            $('#commentaire_produit_commande').val(item.commentaire ? item.commentaire : '');
            var rewriteReq = 'typecommentaires';
            Init.getElement(rewriteReq, listofrequests_assoc['typecommentaires']).then(function (data) {
                if (data && data.length > 0) {
                    $scope.dataPage['typecommentaires'] = data;
                    var commentaire_bulles = $scope.produit.commentaire_bulles;
                    if (commentaire_bulles && commentaire_bulles.length > 0) {
                        for (var l = 0; l < commentaire_bulles.length; l++) {
                            if ($scope.dataPage['typecommentaires'] && $scope.dataPage['typecommentaires'].length > 0) {
                                for (var i = 0; i < $scope.dataPage['typecommentaires'].length; i++) {
                                    var commentaire_commandes = $scope.dataPage['typecommentaires'][i]['commentaire_commandes'];
                                    if (commentaire_commandes) {

                                        for (var j = 0; j < commentaire_commandes.length; j++) {

                                            if (commentaire_bulles[l]['id'] == commentaire_commandes[j]['id']) {
                                                $scope.dataPage['typecommentaires'][i]['commentaire_commandes'][j]['etat'] = 1;
                                            }

                                        }
                                    }

                                }
                            }

                        }
                    }
                }

            }, function (msg) {
                // form.parent().parent().blockUI_stop();
                toastr.error(msg);
            });

        }
        else if (type == "optionmenu") {
            console.log('-------Produit menu--------------');
            console.log($scope.produit);
            $scope.option = item;
            $scope.option['produits'] = $filter('filter')($scope.produit.produits, { option_menu: item.id });
        }
        else if (type == "menuproduit") {
            $scope.produit = item;
        }
        else if (type == "propositioncommerciale") {

            $scope.dataPage['famille_menus'] = [];
            $scope.dataInTabPane['familles_' + type]['data'] = [];
            $('#designation_' + type).val('');
            $('#titre_' + type).val('');
            $scope.dataInTabPane['option_materiel']['data'] = [];
            $('#forfait_option_materiel').val('');
            $("#nombre_personne_" + type).val(+$("#nombre_personne_proforma").val()).trigger('change');
            $scope.nombre_personne = +$("#nombre_personne_proforma").val();
            $scope.actionSurProposition = action;

            $("#forfait_direct_menu_propositioncommerciale").prop('checked', false);
            $scope.forfait_direct_menu_propositioncommerciale = false;
            $("#forfait_direct_materiel_propositioncommerciale").prop('checked', false);
            $scope.forfait_direct_materiel_propositioncommerciale = false;
            $scope.remise = null;

            if (action == 'add') {
                $scope.emptyform(type);
                $("#designation_" + type).val($("#designation_r2acomm_proforma").val());
                $scope.exotva_propositioncommerciale = $scope.client_traiteur ? $scope.client_traiteur.exonorer_tva : false;
                $scope.updateCheckExoTva();
            } else {

                $("#designation_" + type).val(null);
                $("#titre_" + type).val(null);

                var searchProp = $filter('filter')($scope.dataInTabPane['r2acomm_proforma']['data'], { proposition: item.proposition });
                if (searchProp && searchProp.length == 1) {
                    console.log('---------Proposition com------------');
                    console.log(searchProp[0]);
                    //Chargement des donnees infos complementaire
                    if (action == 'edit' || action == 'cloner') {
                        $("#designation_" + type).val(searchProp[0].proposition);
                        $("#titre_" + type).val(searchProp[0].titre);
                        $scope.exotva_propositioncommerciale = searchProp[0].exotva ? searchProp[0].exotva : false;
                        $scope.updateCheckExoTva();
                        if (searchProp[0].forfait_direct_menu && searchProp[0].forfait_direct_menu == true) {
                            $scope.forfait_direct_menu_propositioncommerciale = true
                            $("forfait_direct_menu_propositioncommerciale").prop('checked', true);
                        }
                    }
                    //Fin chargement des donnees infos complementaires

                    //Debut chargement Forfait de la proposition commerciale
                    $("#commentaires_" + type).val(searchProp[0].commentaires);

                    if (searchProp[0].montant_par_personne) {
                        $scope.montant_par_personne = +searchProp[0].montant_par_personne;
                        $('#montant_par_personne_' + type).val(+searchProp[0].montant_par_personne).trigger('change');
                        $scope.calculeForfait(action);
                    }

                    if (searchProp[0].forfait) {
                        $('#forfait_propositioncommerciale').val(+searchProp[0].forfait).trigger('change');
                        $scope.disableOnkeyUp(+searchProp[0].forfait, 'forfait_', 'propositioncommerciale', action);
                    }

                    if (searchProp[0].remise) {
                        $('#remise_' + type).val(+searchProp[0].remise).trigger('change');
                        $scope.remise = searchProp[0].remise;
                        $scope.calculeRemise('montant_par_personne', 'montant_ht_remise', +searchProp[0].remise, type)
                    }
                    //Fin du chargement des forfait

                    //Debut chargement des donnees options menu de la proposition
                    $scope.dataPage['famille_menus'] = searchProp[0].famille_menus;
                    if ($scope.dataPage['famille_menus'] && $scope.dataPage['famille_menus'].length > 0) {
                        $scope.goToActiveOnglet('famille_menus', $scope.dataPage['famille_menus'][0].id, 'active', null, 'onglet_prop_')
                    }
                    $scope.dataInTabPane['familles_' + type]['data'] = searchProp[0].familles_propositioncommerciale;
                    if ($scope.dataInTabPane['familles_' + type]['data'] && $scope.dataInTabPane['familles_' + type]['data'].length >= 0) {

                        if (searchProp[0].produits_propositioncommerciale && searchProp[0].produits_propositioncommerciale.length >= 0) {
                            $scope.dataInTabPane['familles_' + type]['data'] = $scope.dataInTabPane['familles_' + type]['data'].concat(searchProp[0].produits_propositioncommerciale);
                        }
                    }
                    //Fin du chargement option menu

                    //Debut chargement des donnees options materiels
                    $scope.dataInTabPane['option_materiel']['data'] = searchProp[0].option_materiel;
                    var montant_forfait_option = searchProp[0].forfait_option_materiel;
                    if (searchProp[0].forfait_direct_materiel && searchProp[0].forfait_direct_materiel == true) {
                        $("#forfait_direct_materiel_propositioncommerciale").prop('checked', searchProp[0].forfait_direct_materiel)
                        $scope.forfait_direct_materiel_propositioncommerciale = searchProp[0].forfait_direct_materiel;
                    }
                    $scope.calculForfaitTotalOptionMateriel($scope.dataInTabPane['option_materiel']['data'], montant_forfait_option);
                    //Fin chargement options materiel


                    $scope.reInit();

                }


            }

        }
        $('#modal_add' + type).modal('show');
    }
    $scope.calculeMontantRH = function (item, index) {
        console.log(item);
        console.log(item.tarif);
        console.log('------Voici l element dans le tableau----------');
        console.log($scope.dataInTabPane['rhs_proforma']['data'][index]);
        if (item.tarif) {

        }
    }
    $scope.calculForfaitTotalOptionMateriel = function (tab, montant_option) {
        var montantHT = 0;
        var montantTTC = 0;
        if (!$scope.forfait_direct_materiel_propositioncommerciale || $scope.forfait_direct_materiel_propositioncommerciale == false) {
            if (tab) {

                for (var i = 0; i < tab.length; i++) {
                    var montant_total_ht = parseInt(tab[i]['montant_ht']) * parseInt(tab[i]['quantite']);
                    var montant_total_ttc = parseInt(tab[i]['montant']) * parseInt(tab[i]['quantite']);
                    montantHT += montant_total_ht;
                    montantTTC += montant_total_ttc;
                }


            }
        } else if ($scope.forfait_direct_materiel_propositioncommerciale == true) {
            if (montant_option) {
                montantHT = parseInt(montant_option);
                montantTTC = (montantHT * 18) / 100 + montantHT;
            }

        }
        $("#forfait_option_materiel_ht").val(montantHT);
        $("#forfait_option_materiel").val(montantTTC);
        $scope.dataInTabPane['option_materiel']['data'].forfait_ht = montantHT;
        $scope.dataInTabPane['option_materiel']['data'].forfait = montantTTC;

    }

    $scope.switchTheme = function (newTheme) {
        console.log(newTheme);
        /*if (newTheme == "K")
        {
            newTheme = 'G';
        }*/
        newTheme = "theme-" + newTheme;
        var begin = 'theme';
        $("body").removeClass(function (index, className) {
            return (className.match(new RegExp("\\b" + begin + "\\S+", "g")) || []).join(' ');
        }).addClass(newTheme);
        theme.setCurrent(newTheme);
        $scope.getLogoApp();
    };

    $scope.initProduitCarteMenu = function () {
        $scope.dataPage['produits'] = [];
        $scope.dataPage['familles'] = [];
        $scope.dataPage['option_menus_commande'] = [];
        $scope.produits = null;

    }
    $scope.getModelsByQueries = function (type, famille_id = null, query = null, queries = null, currentpage = null) {

        var error = '';
        if (!$scope.restaurant_commande && type == 'commande') {
            error = 'Veuillez choisir un point de vente';
        }
        if (error == '') {

            var famille = '';
            var carte = type == 'commande' ? 'is_carte:true' : '';
            var entie = type == 'commande' ? 'entite_id:' + $scope.restaurant_commande : '';
            if (famille_id) {
                famille = type == 'famille' ? 'parent_id:' + famille_id : 'famille_id:' + famille_id;
            }
            var req = '';
            // console.log('---------Type------------')
            // console.log(type)
            // console.log('---------Type------------')
            // console.log(carte,entie,famille)
            if (type == 'commande') {
                req = type == 'commande' ? carte + ',' + entie + ',' + famille : req;
            }
            // console.log('---------Req------------')
            // console.log(req)
            req = type == 'commande' ? carte + ',' + entie + ',' + famille : req;
            req = type == 'famille' ? famille : req;
            req = type == 'sousfamille' ? famille : req;

            if (!queries) {
                queries = req;
            }

            $scope.famille_carte_clicked = famille_id;
            if (currentpage) {
                $scope.paginations[query].currentPage = currentpage;
            }
            rewriteReq = query + "spaginated" + '(' + queries + 'page:' + $scope.paginations[query].currentPage + ',count:' + $scope.paginations[query].entryLimit + ')';
            // console.log('---------Req------------')
            // console.log(rewriteReq)
            $('#modal_add' + type).blockUI_start();
            if (type !== 'menu') {
                Init.getElementPaginated(rewriteReq, listofrequests_assoc[query + "s"]).then(function (data) {
                    $('#modal_add' + type).blockUI_stop();
                    if (data) {
                        $scope.paginations[query].currentPage = data.metadata.current_page;
                        $scope.paginations[query].totalItems = data.metadata.total;
                        $scope.dataPage[query + "s"] = data.data;
                        setTimeout(function () {
                        }, 1000);
                    }
                }, function (msg) {
                    $('#modal_add' + type).blockUI_stop();
                    toastr.error(msg);
                });
            }
            else {
                $scope.dataPage['option_menus_commande'] = [];
                var type = "menu";
                $scope.option = null;
                var menu = $filter('filter')($scope.dataPage['menus'], { "id": famille_id });
                $scope.produit = menu[0];
                $scope.dataPage['option_menus_commande'] = menu[0].familles;
                $('#modal_add' + type).blockUI_stop();
            }
        } else {
            $scope.showToast('', error, 'error');
        }

    }
    $scope.anullerChoixMenu = function (item) {
        if (item && $scope.dataPage['option_menus_commande'] && $scope.dataPage['option_menus_commande'].length > 0) {
            var search = $filter('filter')($scope.dataPage['option_menus_commande'], { id: item.id });
            if (search && search.length == 1) {
                let index = $scope.dataPage['option_menus_commande'].indexOf(search[0]);
                $scope.dataPage['option_menus_commande'][index]['produit'] = null;
                $scope.showToast('', 'Choix annulé', 'success');
            }
        }
    }
    $scope.getFamilleCarte = function (parent_id = null) {
        $scope.dataPage['produits'] = [];
        $scope.dataPage['familles'] = [];
        $scope.paginations['produit'].currentPage = 1;

        var error = '';
        if (!$scope.restaurant_commande) {
            error = 'Veuillez choisir un point de vente';
        }
        if (error == '') {
            rewriteReq = 'familles(is_carte:true,entite_id:' + $scope.restaurant_commande;
            if (!parent_id) {
                if ($scope.dataPage['option_cartes'] && $scope.dataPage['option_cartes'].length > 0) {
                    parent_id = $scope.dataPage['option_cartes'][0].id;
                }
            }
            if (parent_id) {
                rewriteReq += ',parent_id:' + parent_id
            }
            rewriteReq += ')';

            var form = $('#form_addcommande');
            var type = "famille";
            Init.getElement(rewriteReq, listofrequests_assoc[type + 's']).then(function (data) {
                if (data && data.length > 0) {
                    $scope.dataPage[type + "s"] = data;
                    var famille = $scope.dataPage[type + "s"][0];
                    $scope.getModelsByQueries('commande', famille.id, 'produit', null, 1);
                }

            }, function (msg) {
                // form.parent().parent().blockUI_stop();
                toastr.error(msg);
            });
            // rewriteReq = 'famillespaginated(is_carte:true,page:1,count:12,entite_id:' + $scope.restaurant_commande + ')';
            // var form = $('#form_addcommande');
            // var type = "famille";
            // Init.getElementPaginated(rewriteReq, listofrequests_assoc[type+'s']).then(function (data) {
            //     if (data) {
            //         $scope.paginations[type].currentPage = data.metadata.current_page;
            //         $scope.paginations[type].totalItems = data.metadata.total;
            //         $scope.dataPage[type+"s"] = data.data;
            //         var famille = $scope.dataPage[type+"s"][0];
            //         $scope.getModelsByQueries('commande',famille.id,'produit',null,1);
            //     }
            //
            // }, function (msg) {
            //     // form.parent().parent().blockUI_stop();
            //     toastr.error(msg);
            // });
        } else {
            $scope.showToast('', error, 'error');
        }

    }
    $scope.MenuEntite = function () {
        $scope.dataPage['produits'] = [];
        $scope.dataPage['familles'] = [];
        var error = '';
        if (!$scope.restaurant_commande) {
            error = 'Impossible d\'avoir des menus sans point de vente';
        }
        if (error == '') {
            var type = "menu";
            rewriteReq = type + 'spaginated(entite_id:' + $scope.restaurant_commande + ',activer:true' + ',page:' + $scope.paginations[type].currentPage + ',count:' + $scope.paginations[type].entryLimit + ')';
            Init.getElementPaginated(rewriteReq, listofrequests_assoc[type + "s"]).then(function (data) {
                if (data) {
                    $scope.paginations[type].currentPage = data.metadata.current_page;
                    $scope.paginations[type].totalItems = data.metadata.total;
                    $scope.dataPage[type + "s"] = data.data;
                    $scope.startSlick();

                }
            }, function (msg) {
                toastr.error(msg);
            });
        } else {
            $scope.showToast('', error, 'error');
        }

    }
    $scope.selectTable = function (item, tagForm) {
        if ($scope.dataPage[tagForm] && $scope.dataPage[tagForm].length > 0) {
            let index = $scope.dataPage[tagForm].indexOf(item);
            if (index > -1) {
                $scope.dataPage[tagForm][index].etat = true;
                item.etat = true;
                if ($scope.currentTable) {
                    index = $scope.dataPage[tagForm].indexOf($scope.currentTable);
                }
                if (index > -1) {
                    $scope.dataPage[tagForm][index].etat = false;
                }
                $scope.currentTable = item;
                $("#table_reservation").val(item.id);
                $scope.num_table_reservation = item.designation;
                $("#num_table_reservation").val(item.designation);
            }
        }
    }
    $scope.getProduitMenu = function () {

        var error = '';
        if (!$scope.restaurant_commande) {
            error = 'Veuillez choisir un point de vente';
        }
        if (error == '') {
            rewriteReq = 'menus(entite_id:' + $scope.restaurant_commande + ')';
            var form = $('#form_addcommande');
            Init.getElement(rewriteReq, listofrequests_assoc['familles']).then(function (data) {
                if (data) {
                    console.log('---------Voici la carte---------');
                    console.log(data);
                    $scope.dataPage['familles'] = data;
                }

            }, function (msg) {
                // form.parent().parent().blockUI_stop();
                toastr.error(msg);
            });
        } else {
            $scope.showToast('', error, 'error');
        }

    }
    $scope.deletElemetForm = function (type, tag = null, value, action = null, tagSecondaire = null) {
        console.log(type, tag, value);
        var tab = null;
        // if(type == 'tab'){

        if ($scope.dataPage[tag] && $scope.dataPage[tag].length > 0) {
            tab = $scope.dataPage[tag];

        } else if ($scope.dataInTabPane[tag]) {
            if ($scope.dataInTabPane[tag]['data'] && $scope.dataInTabPane[tag]['data'].length > 0) {
                tab = $scope.dataInTabPane[tag]['data'];
            }
        }
        // }
        let index = tab.indexOf(value);

        if (index > -1) {
            if (action == 'valide') {
                tab[index]['etat'] = true;
            } else if (action == 'invalide') {
                tab[index]['etat'] = false;
            } else {
                var error = null;
                if (value.etat && !value.item) {
                    error = 'Impossible de supprimer une proposition validée avec des produit';
                }
                if (!error) {
                    tab.splice(index, 1);
                    if (tagSecondaire) {
                        if ($scope.dataInTabPane[tagSecondaire]['data'] && $scope.dataInTabPane[tagSecondaire]['data'].length > 0) {
                            var listTodelet = $filter('filter')($scope.dataInTabPane[tagSecondaire]['data'], { proposition: value });
                            listTodelet.forEach(item => {
                                $scope.dataInTabPane[tagSecondaire]['data'].splice($scope.dataInTabPane[tagSecondaire]['data'].indexOf(item), 1)
                            })
                        }
                        if (!tab || tab.length <= 0) {

                            $scope.reInitTabPane(tagSecondaire);
                        }
                    }


                } else {
                    $scope.showToast('', error, 'error');
                }


            }
        }

        if (tab.length <= 0) {

            $(tag
            ).fadeOut('slow');
        }
    }

    $scope.filterProduitInventaire = function (tagForm) {
        var depot_id = null;
        var zone_de_stockage_id = null;
        var famille_id = null;
        var typeForm = '';

        if (tagForm == 'produits_inventaire') {
            typeForm = 'form_addinventaire';
            depot_id = $("#depot_inventaire").val();
            zone_de_stockage_id = $("#zonedestockage_inventaire").val();
            famille_id = $("#famille_inventaire").val();
        }
        else if (tagForm == 'produits_inventairelogistique') {
            typeForm = 'form_addinventairelogistique';
            depot_id = $("#depot_inventairelogistique").val();
            zone_de_stockage_id = $("#zonedestockage_inventairelogistique").val();
            famille_id = $("#famille_inventairelogistique").val();
        }
        else if (tagForm == 'production' || tagForm == 'decoupage') {
            typeForm = 'form_add' + tagForm;
            depot_id = $("#depot_" + tagForm).val();
        }

        var queries = '';
        if (depot_id) {
            queries += 'depot_id:' + depot_id;
            if (zone_de_stockage_id) {
                queries += ',zone_de_stockage_id:' + zone_de_stockage_id;
            }
            if (famille_id) {
                queries += ',famille_id:' + famille_id;
            }

            if (queries && queries !== '') {
                var type = 'produit';

                rewriteReq = 'produits(' + queries + ')';

                $('#' + typeForm).blockUI_start();
                Init.getElement(rewriteReq, listofrequests_assoc['produits']).then(function (data) {
                    $('#' + typeForm).blockUI_stop();
                    if (data) {
                        // $scope.dataInTabPane[tagForm]['data'] = [];
                        var produit_famillles = [];
                        if (data && data.length > 0) {

                            if (tagForm == 'produits_inventaire') {
                                for (var i = 0; i < data.length; i++) {
                                    if (data[i].quantite_theorique && data[i].quantite_theorique > 0) {
                                        var item = {
                                            'produit': { "designation": data[i].designation, "unite_de_mesure": data[i].unite_de_mesure, "id": data[i].id, 'prix_achat_unitaire': data[i].prix_achat_unitaire, 'prix_achat_ttc': data[i].prix_achat_ttc },
                                            'pa_ht': data[i].quantite_theorique ? data[i].quantite_theorique : 0,
                                            'pa_ttc': data[i].prix_achat_unitaire ? data[i].prix_achat_unitaire : 0,
                                            'quantite_theorique': data[i].quantite_theorique,
                                            'quantite_reel': data[i].quantite_theorique,
                                            'produit_id': data[i].id,

                                        };
                                        produit_famillles.push(item);
                                    }

                                }

                                if (produit_famillles && produit_famillles.length > 0) {
                                    $scope.dataInTabPane[tagForm]['data'] = $scope.dataInTabPane[tagForm]['data'].concat(produit_famillles);
                                }
                            } else if (tagForm == 'production' || tagForm == 'decoupage') {
                                // var i = 0;
                                // var item = {
                                //     'produit'            :{"designation" : data[i].designation, "unite_de_mesure": data[i].unite_de_mesure, "id": data[i].id,'prix_achat_unitaire': data[i].prix_achat_unitaire,'prix_achat_ttc' : data[i].prix_achat_ttc},
                                //     '"qte_unitaire'      :data[i].quantite_theorique ,
                                //     'produit_id'         :data[i].id
                                // };
                                // $scope.dataInTabPane[tagForm]['data'].push(item);
                            }

                        }

                    }
                }, function (msg) {
                    $('#' + typeForm).blockUI_stop();
                    toastr.error(msg);
                });

            } else {
                var error = 'Veuillez choisir les critère de recherche';
                $scope.showToast('', error, 'error');
            }

        } else {
            var error = 'Veuillez choisir le depot';
            $scope.showToast('', error, 'error');
        }

    }

    //--DE
    // BUT => Formater le prix avec des espaces--//
    $scope.arrondir = function (num) {
        var retour = Math.round(num);
        return retour;
    }

    $scope.arrondirFloat = function (num, toFixed = 2) {
        if (!num) {
            num = 0;
        }
        var numParsei = parseFloat(num).toFixed(toFixed);
        return numParsei;
    }

    $scope.formatPrixToMonetaire = function (num, toFixed = 2, round = undefined) {
        //console.log('vente au cash start', num);

        //#tags: monétaire, formataire, prix, montant
        if (!num) {
            num = 0;
        }
        var numParsei = parseFloat(num).toFixed(toFixed); // always 0 decimal digit
        numParsei = parseFloat(numParsei);
        //console.log("RESTE DIVISION ==>"+(numParsei % 1));
        if (round !== undefined) {
            numParsei = round ? Math.round(numParsei) : Math.round(numParsei - numParsei % 1);
            /*  if(round == true){
                    numParsei = Math.round(numParsei);
                }else{
                    if(parseFloat(numParsei % 1) != 0.5){
                        numParsei = numParsei - numParsei % 1;
                    }
                    numParsei = Math.round(numParsei);
                } */
        }
        return (
            numParsei
                .toString().replace('.', ',') // replace decimal point character with ,
                .toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ') + ''
        ) //
    };
    //--FIN => Formater le prix avec des espaces--//


    //Permet de cacher ou faire apparaitre certains champs sur choix d'un checkbox ou d'un select
    $scope.updateCheck = function (id, classeToHide, elementTypeName = "checkbox", value = 0, classeToShow) {
        console.log("updateCheck");
        var valeur = value;
        if (elementTypeName == "select") {
            if (valeur) {
                $("." + classeToHide).fadeIn('slow');
            } else {
                $("." + classeToHide).fadeOut('slow');
            }
        }
        else {
            if ($("#" + id).prop("checked") == true) {
                $("." + classeToShow).fadeIn('slow');
                $("." + classeToHide).fadeOut('slow');

            }
            else {
                $("." + classeToShow).fadeOut('slow');
                $("." + classeToHide).fadeIn('slow');
            }
        }
    }


    //Permet de cacher ou faire apparaitre certains champs sur choix du type de produit
    $scope.updateCheckProduit = function (valeur = null) {
        console.log("updateCheckProduit");
        var classe1 = "matieres_premieres";
        var classe2 = "matieres_transformees";
        var classe3 = "produits_de_vente";

        var text_id = $("#typeproduit_produit option:selected").attr("text_id");
        if (text_id) {
            //Cacher tout
            $("." + classe1).fadeOut('2');
            $("." + classe2).fadeOut('2');
            $("." + classe3).fadeOut('2');

            //Faire apparaitre ce qu'on a besoin
            $("." + text_id).fadeIn('2');
        }
    }

    $scope.testupdateCheck = function (id, classeToHide, elementTypeName = "checkbox", value = 0, classeToShow, btn = false) {
        //$scope.dataPage['adresse_livraison'] = [];
        console.log(id, classeToHide, elementTypeName, value, classeToShow, btn);
        if ($("#" + id).prop("checked") == true) {
            if (classeToHide && classeToShow) {
                $("." + classeToHide).fadeOut('slow');
                $("." + classeToShow).fadeIn('slow');
            }
            /*if(id=='offert_commande'){
                $scope.showToast('', 'Commande offerte', 'success');
            }*/
        } else {
            if (classeToHide && classeToShow) {
                //$scope.dataPage['adresse_livraison'] = [];
                $("." + classeToHide).val('');
                $("." + classeToHide).fadeIn('slow');
                $("." + classeToShow).fadeOut('slow');
            }

        }

    }

    $scope.addAccompagnementToDataInTabPane = function (action, type, item) {

        var searchProduit = $filter('filter')($scope.dataInTabPane[type]['data'], { id: item.id });
        let index = -1;
        index = searchProduit && searchProduit.length == 1 ? $scope.dataInTabPane[type]['data'].indexOf(searchProduit[0]) : index;
        console.log('-------Item-----------');
        console.log(item);
        console.log('-------Tableau-----------');
        console.log($scope.dataInTabPane[type]['data']);
        console.log('-------index-----------');
        console.log(index);
        if (action == 'add') {

            if (index > -1) {
                index = $scope.dataInTabPane[type]['data'].indexOf($scope.dataInTabPane[type]['data'][index]);
                if ($scope.dataInTabPane[type]['data'][index].choix) {
                    $scope.dataInTabPane[type]['data'][index].choix = parseInt($scope.dataInTabPane[type]['data'][index].choix) + 1;
                } else {
                    $scope.dataInTabPane[type]['data'][index].choix = 1;
                }
                item = $scope.dataInTabPane[type]['data'][index];
            } else {
                item.choix = 1;
            }
            item.quantite = $scope.famille_accompagnement.quantite;
            item.supplement = $scope.CheckSuplement('add', type, item, $scope.famille_accompagnement.quantite);
            if (index > -1) {
                $scope.dataInTabPane[type]['data'][index] = item;
            } else {
                $scope.dataInTabPane[type]['data'].push(item);
            }

        }
        else if (action == 'delete') {

            if (index > -1) {

                if ($scope.dataInTabPane[type]['data'][index].choix > 0) {
                    $scope.dataInTabPane[type]['data'][index].choix = parseInt($scope.dataInTabPane[type]['data'][index].choix) - 1;
                    item = $scope.dataInTabPane[type]['data'][index];
                    if (parseInt($scope.dataInTabPane[type]['data'][index].choix) == 0) {

                        $scope.dataInTabPane[type]['data'].splice(index, 1);
                    } else {
                        item.supplement = $scope.CheckSuplement('delete', type, item, $scope.famille_accompagnement.quantite);
                        $scope.dataInTabPane[type]['data'][index] = item;
                    }
                }

            }
        }

    }
    $scope.CheckSuplement = function (action, type, item, quantite) {
        var searchProduitsByFamille = $filter('filter')($scope.dataInTabPane[type]['data'], { famille_id: item.famille_id });
        var quantite_total_choix_produit = 0;
        var quantite_total_choix_autre = 0;
        var supplement = 0;

        searchProduitsByFamille.forEach((prod) => {
            if (prod.id == item.id) {
                quantite_total_choix_produit = quantite_total_choix_produit + prod.choix;
            } else {
                quantite_total_choix_autre = quantite_total_choix_autre + prod.choix;
            }
        });
        var total_choix_famille = quantite_total_choix_produit + quantite_total_choix_autre;

        if (quantite_total_choix_produit > quantite) {
            console.log('quantite_total_choix > quantite', quantite_total_choix_produit, '>', quantite);

            if (quantite_total_choix_autre >= quantite) {
                console.log('quantite_total_choix == 0, quantite_total_choix_autre >= quantite');
                supplement = item.supplement;
                supplement++;
                console.log(supplement);
            } else if (total_choix_famille > quantite) {
                supplement = item.supplement;
                supplement++;
            }
        } else if (quantite_total_choix_produit == 0) {
            if (quantite_total_choix_autre >= quantite) {
                console.log('quantite_total_choix == 0, quantite_total_choix_autre >= quantite');
                supplement++;
            } else if (total_choix_famille > quantite) {
                supplement++;
            }
        } else if (quantite_total_choix_produit == quantite) {
            supplement = item.supplement;
            if (quantite_total_choix_autre >= quantite) {
                console.log('quantite_total_choix == quantite, quantite_total_choix_autre >= quantite');
                console.log('---------------Supplement------------');
                console.log(supplement);
                supplement++;
                console.log(supplement);
                console.log(item);
            } else if (total_choix_famille > quantite) {
                console.log('quantite_total_choix == quantite, total_choix_famille > quantite');
                supplement++;
            }
        } else if (quantite_total_choix_produit < quantite) {
            console.log('quantite_total_choix > quantite', quantite_total_choix_produit, '<', quantite);
            console.log('total_choix_famille:  ', total_choix_famille);
            if (total_choix_famille > quantite) {
                supplement++;
            }
        }
        return supplement;
    }
    $scope.getDatePlus = function (plus) {
        var d = new Date();
        var month;
        if (plus) {
            d.setDate(d.getDate() + 1);
            month = '' + (d.getMonth() + 1);
        } else {
            d.setDate(d.getDate());
            month = '' + (d.getMonth() + 1);
        }

        day = '' + d.getDate();
        year = d.getFullYear();

        if (month.length < 2)
            month = '0' + month;
        if (day.length < 2)
            day = '0' + day;

        return [year, month, day].join('-');
    }
    $scope.check = function () {
        console.log('--------_Mancha allah ----------');
        console.log($scope.direct);
    }

    $scope.natureProduit = function (nature) {
        $("#id_natureproduit").val(nature)
        console.log('------------Nature--------');
        console.log(nature);
    }

    $scope.chooseComment = function (item, item1) {
        console.log("chooseComment");
        var index = $scope.dataPage['typecommentaires'].indexOf(item);
        var index1 = $scope.dataPage['typecommentaires'][index]['commentaire_commandes'].indexOf(item1);
        console.log(index)
        console.log(index1)
        if (!$scope.dataPage['typecommentaires'][index]['commentaire_commandes'][index1]['etat'] || $scope.dataPage['typecommentaires'][index]['commentaire_commandes'][index1]['etat'] == 0) {
            $scope.dataPage['typecommentaires'][index]['commentaire_commandes'][index1]['etat'] = 1;
        } else {
            $scope.dataPage['typecommentaires'][index]['commentaire_commandes'][index1]['etat'] = 0;
        }
    }


    //-------------UTILITAIRES--------------------//
    $scope.playAudio = function () {
        var audio = new Audio(BASE_URL + 'sounds/newnotif.mp3');
        audio.play();
    };

    $scope.datatoggle = function (href, addclass) {
        $(href).attr('class').match(addclass) ? $(href).removeClass(addclass) : $(href).addClass(addclass);
    };

    // Cocher tous les checkbox / Décocher tous les checkbox
    $scope.checkAllOruncheckAll = function (type) {
        var cocherOuNon = $scope.cocherTout;
        if (cocherOuNon == true) {
            //Tout doit etre coché
            $("#labelCocherTout").html('Tout décocher');
        } else {
            //Tout doit etre décoché
            $("#labelCocherTout").html('Tout cocher');
        }
        $('.mycheckbox').prop('checked', cocherOuNon);

        if (type == 'role') {
            $scope.addToRole();
        } else if (type == 'be') {
            $scope.addToBe();
        }


    };

    $scope.eraseFile = function (idInput) {
        $('#' + idInput).val("");
        $('#erase_' + idInput).val("yes");
        $('#aff' + idInput).attr('src', imgupload);
    };

    $scope.openMenuSearch = function (index, second = false, ismobile = false, item) {
        $("#open_menu_pc_" + index).attr('class').match("side-menu__sub-open") ? $('#open_menu_pc_' + index).removeClass("side-menu__sub-open") : $('#open_menu_pc_' + index).addClass("side-menu__sub-open side-menu--active animated fadeInRight");
        if (ismobile) {
            $("#open_menu_" + index).attr('class').match("menu__sub-open") ? $('#open_menu_' + index).removeClass("menu__sub-open").css("display", "none") : $('#open_menu_' + index).addClass("menu__sub-open menu--active animated fadeInRight").css("display", "block");
        }
        if (item && item.parent) {
            $("html, body").animate({ scrollTop: 2060 }, 500);
        }
    }

    $scope.openMenu = function () {
        document.getElementById("openmenu").style.marginLeft = "0px";
        document.getElementById("openmenu0").style.display = "none";
        document.getElementById("menuopenshow").style.display = "none";
        document.getElementById("menuopenhide").style.display = "block";
    }

    $scope.closeMenu = function () {
        document.getElementById("openmenu").style.marginLeft = "240px";
        document.getElementById("openmenu0").style.display = "block";
        document.getElementById("menuopenshow").style.display = "block";
        document.getElementById("menuopenhide").style.display = "none";
    }

    $scope.isActiveMenu = false;
    $scope.toggleTabMenu = function () {
        $scope.isActiveMenu = !$scope.isActiveMenu;
    }

    $scope.toggleWindows = function () {
        $scope.isActiveTab = !$scope.isActiveTab;
    }

    $scope.startSlick = function () {

        console.log("ici pour voir le hasClass", $("#slick-carousel").hasClass('slick-initialized'))
        $(".slider").not('.slick-initialized').slick();
        // $(".slick-carousel").not('.slick-initialized').slick();
        if ($("#slick-carousel").hasClass('slick-initialized') == false) {
            if ($('.slick-carousel').length) {
                $('.slick-carousel').each(function () {
                    setTimeout(function () {
                        $('.slick-carousel').slick({
                            arrows: false,
                            infinite: true,
                            autoplay: false,
                            autoplaySpeed: 3000,
                            slidesToShow: 3,
                            slidesToScroll: 3,
                        })
                    }, 2500);

                })
            }
        }

    }
    // Pour vider le scope 
    $scope.emptyform = function (type, fromPage = false, forcer = false) {
        console.log("emptyform");
        $scope.inputs = [];
        $scope.inputsbannieres = [];
        $scope.horairesdispos = [];
        $scope.planCodeInTable = [];
        $scope.question_ouverte = [];
        $scope.donneesQuestionnaire = []; 
        $scope.shortcut        = "";
        $scope.questionInTable = [];
        $scope.dataListeQuestions = [];
        $scope.radioBtn = null;
        let dfd = $.Deferred();

        if (type == "contact" && forcer == false) {
            $('#mail_' + type).val("");
            $('#tel_' + type).val("");
            $('#comment_' + type).val("");
            return true;
        }
        if (type == "restitcompetences" && forcer == false) {
            console.log(type);
            $('#periode_id_' + type).val("");
            $('#fournisseur_id_' + type).val("");
            $scope.getelements(type)
            $scope.reInitSelect2()
            return true;
        }

        $('.ws-number').val("");
        $("input[id$=" + type + "], textarea[id$=" + type + "], select[id$=" + type + "], button[id$=" + type + "]").each(function () {
            if ($(this).is("select")) {
                currentSelect = $(this);
                if (currentSelect.val()) {

                    currentSelect.val("").change();

                }

                $('#prix_de_revient_unitaire_produit_total').val("").change();
            } else if ($(this).is(":checkbox")) {
                $(this).prop('checked', false);

                if ($(this).is("[data-toggle]")) {
                    $(this)
                        .bootstrapToggle('destroy')
                        .bootstrapToggle();
                }
            } else if ($(this).is(":radio")) {
                $(this).prop('checked', false);
            }
            else if ($(this).is(":file")) {
                if ($(this).hasClass('filestyle')) {
                    setTimeout(function () {
                        $(this).filestyle('clear');
                    }, 200)
                } else {
                    getId = $(this).attr('id').substring(0, ($(this).attr('id').length - type.length));
                    $('#' + getId + type).val("");
                    $('#aff' + getId + type).attr('src', imgupload);
                }
            } else if ($(this).hasClass('datedropper')) {
                $(this).val(null).trigger('change');
            } else {
                $(this).val("");
            }

            if (!$(this).hasClass('datedropper')) {
                $(this).attr('disabled', false).attr('readonly', false);
            }

        });


        /* if (type.indexOf('user') !== -1) {
            if (!$('#password_' + type).hasClass('required')) {
                $('#password_' + type).addClass('required');
                $('#confirmpassword_' + type).addClass('required');
            }
        } */

        if (type == 'client') {
            $scope.updateCheck('remise_autorise_client', 'client');
            $scope.updateCheck('plafond_credit_autorise_client', 'client');
        }

        // On vide le tableau des items ici
        $.each($scope.dataInTabPane, function (keyItem, valueItem) {
            tagType = '_' + type;
            if (keyItem.indexOf(tagType) !== -1) {
                $scope.dataInTabPane[keyItem]['data'] = []
            }
        });

        $('.checkbox-all').prop("checked", true);

        // Si on clique sur le bouton annuler
        if (fromPage) {
            if ($scope.currentTemplateUrl == 'list-stockactuelproduitdepotlogistique') {
                type = 'logistique';
            }
            if ($scope.currentTemplateUrl == 'list-sortiestocklogistique') {
                type = 'sortiestocklogistique';
            }
            $scope.pageChanged(type);
        }

        return dfd.promise();
    };

    $scope.itemSelected = 'type_commande';
    $scope.getUrlImgByTypeCommande = function (type) {
        switch (type) {
            case 'sur place':
                return 'assets/images/imgs/image-chaise.svg'
                break;
            case 'à emporter':
                return 'assets/images/imgs/image-a-emporter.svg'
                break;
            case 'à livrer':
                return 'assets/images/imgs/image-a-livrer.svg'
                break;
        }
    }
    $scope.selectItem = function (item, stepp, table = null, livrer = false, ajout = false, type_commande = null, update = false) {
        var error = '';
        if (!$scope.restaurant_commande && !$scope.reservation_commande) {
            if ($("#entite_commande").val()) {
                $scope.restaurant_commande = $("#entite_commande").val();
            }
            if ($("#reservation_commande").val()) {
                $scope.reservation_commande = $("#reservation_commande").val();
            }
            if (!$scope.restaurant_commande) {
                $scope.restaurant_commande = $scope.entite;
                if (!$scope.restaurant_commande) {
                    error = 'Veuillez choisir un point de vente';
                }

            }
        }

        if (error == '') {
            $scope.type_commande = type_commande;
            if (update == false) {
                $scope.dataInTabPane['accompagnement_commande']['data'] = [];
                $scope.dataInTabPane['produits_commande']['data'] = [];
                $('#client_id_commande').val(null).trigger('change');
            }
            $('#type_commande_commande').val($scope.type_commande).trigger('change');
            //Initialiser les donnees de la commandes
            $scope.accompagnements = [];
            $scope.produit = null;
            $scope.famille_accompagnement = null;

            $scope.dataPage['option_menus_commande'] = [];
            $scope.option = null;
            $scope.dataPage['produits'] = [];

            $scope.famille_carte_clicked = null;
            $scope.itemSelected = item;
            $scope.livrer = livrer;
            $scope.stepp = stepp;

            if (item == 'type_commande') {
                if (update == false) {
                    $('#client_id_commande').val(null).trigger('change');
                    $scope.client_reservation = null;
                    $scope.reservation_commande = null;
                    $scope.restaurant_commande = null;
                    $scope.client_id_commande = null;
                    $('#reservation_commande').val(null).trigger('change');
                    $('#entite_commande').val(null).trigger('change');
                    $('#client_id_commande').val(null).trigger('change');
                    $('#reservation_id_commande').val(null).trigger('change');
                    $scope.client = null;

                }
                $scope.reInit();

            }
            if (item == 'info_commande') {
                if (update == false) {
                    $scope.client_passage = null;

                }
                $scope.reInit();
            }
            if ($scope.type_commande == 'à livrer') {
                console.log('-------------type commande------------');
                $scope.reservation_commande = null;
                $('.client-passage').fadeOut('slow');
            }
            if (table) {

                $('#table_commande').text(table.designation);
                $scope.table_commande = table.designation;

                $('#nombre_couvert_commande').val(table.nombre_couverts);
                $scope.nbrpresonne_commande = table.nombre_couverts;

                $('#id_table_commande').val(table.id);
            } else {
                $scope.table_commande = null;
                $scope.nbrpresonne_commande = null;
            }
        } else {
            if (!ajout) {
                $scope.showToast('', error, 'error');
            }

        }


    };

    $scope.activeOnglet = function (type) {
        setTimeout(function () {
            $("#" + type).addClass("active");
        }, 2000)
    }

    /*$scope.loadSlide = function () {
        if ($('.slick-carousel')) {
            if ($('.slick-carousel').length) {
                $('.slick-carousel').each(function () {
                    $(this).slick({
                        arrows: false,
                        infinite: true,
                        autoplay: true,
                        slidesToShow: 3,
                        slidesToScroll: 3,
                        autoplaySpeed: 5000
                    })
                })
            }
        }

        if ($('.slick-navigator')) {
            if ($('.slick-navigator').length) {
                $('.slick-navigator').each(function () {
                    $(this).on('click', function () {
                        if ($(this).data('target') == 'prev') {
                            $('#' + $(this).data('carousel')).slick('slickPrev')
                        } else {
                            $('#' + $(this).data('carousel')).slick('slickNext')
                        }
                    })
                })
            }
        }

    }*/

    $scope.goToActiveOnglet = function (type, itemId, sens, tag1 = null, tag2 = null) {
        var cle_tab_pane = type + itemId + "_menu";
        var is_query = true;

        if (sens == 'active') {

            if (type == 'tranchehoraire_produit') {
                var tranche_horaire = $filter('filter')($scope.dataPage['tranchehoraires'], { id: $scope.activeOnglet });
                var tranche_horaire_click = $filter('filter')($scope.dataPage['tranchehoraires'], { id: itemId });

                if (tranche_horaire && tranche_horaire.length == 1) {

                    let index = $scope.dataPage['tranchehoraires'].indexOf(tranche_horaire[0]);
                    tranche_horaire[0]['montant'] = $('#montant_menu').val();
                    $scope.dataPage['tranchehoraires'][index] = tranche_horaire[0];

                }

                if (tranche_horaire_click && tranche_horaire_click.length == 1) {
                    $('#montant_menu').val(parseInt(tranche_horaire_click[0].montant));
                }

                $scope.tranchehoraire_id = itemId;
                $scope.activeOnglet = itemId;
            }

            if (type == 'famille_menus') {
                $scope.reInit();
                if ($scope.dataInTabPane[[cle_tab_pane]] == null || !$scope.dataInTabPane[[cle_tab_pane]]) {
                    $scope.dataInTabPane[cle_tab_pane] = { data: [], rules: [] }

                }
                $scope.dataInTabPane[type + "_menu"] = $scope.dataInTabPane[cle_tab_pane];

                var queries = 'famille_id:' + itemId;
                $scope.famille_id = itemId;
                if ($scope.dataPage['famille_menus'] && $scope.dataPage['famille_menus'].length > 0) {
                    $scope.dataPage['famille_menus'].forEach(item => {
                        if (item.id !== itemId) {
                            if (tag1) {
                                $("#" + tag1 + item.id).css({ "border": "1px solid white" });
                            }
                            if (tag2) {
                                $("#" + tag2 + item.id).css({ "border": "1px solid white" });
                            }
                        }
                    });
                }

                setTimeout(function () {
                    if (tag1) {
                        $("#" + tag1 + itemId).css({ "border": "1px solid #0999BF" });
                    }
                    if (tag2) {
                        $("#" + tag2 + itemId).css({ "border": "1px solid #0999BF" });
                    }

                }, 1000);


            }
            else if (type.indexOf('item_tab_panes' !== -1)) {

                if (type == 'item_tab_panes_rh_proforma') {
                    is_query = false;
                    $scope.dateRH = itemId;
                    if ($scope.dataInTabPane['item_tab_panes_rh_proforma']['data'] && $scope.dataInTabPane['item_tab_panes_rh_proforma']['data'].length > 0) {

                        $scope.dataInTabPane['item_tab_panes_rh_proforma']['data'].forEach(item => {
                            if (item.date !== itemId.date) {
                                $("#" + type + "_" + item.date).css({ "border": "1px solid white" });
                            }
                        });
                        //calcul_montant_rh_journalier_total
                        var montantTotalJour = 0;
                        if ($scope.dataInTabPane['rhs_proforma']['data']) {
                            var searchRh = $filter('filter')($scope.dataInTabPane['rhs_proforma']['data'], { date: $scope.dateRH.date });
                            if (searchRh && searchRh.length > 0) {
                                console.log('Jai calcule le journalier')
                                for (var i = 0; i < searchRh.length; i++) {
                                    montantTotalJour += parseFloat(searchRh[i].tarif);
                                }

                            }

                            $scope.montant_rh_journalier = montantTotalJour;
                            var montantTotalRh = 0;

                            for (var i = 0; i < $scope.dataInTabPane['rhs_proforma']['data'].length; i++) {
                                console.log('Jai calcule le total')
                                if ($scope.dataInTabPane['rhs_proforma']['data'][i].tarif) {
                                    montantTotalRh += parseFloat($scope.dataInTabPane['rhs_proforma']['data'][i].tarif);
                                }
                            }
                            $scope.dataInTabPane['rhs_proforma']['data']['montant_rh'] = montantTotalRh;

                        }

                    }

                    setTimeout(function () {
                        $("#" + type + "_" + itemId.date).css({ "border": "1px solid #0999BF" });
                    }, 1000);
                } else {
                    $scope.proposition = itemId;
                    $('#id_r2atechniques_proforma_produit').val(itemId);
                }
            }

            if (is_query) {
                var queries = 'famille_id:' + itemId;
                $scope.famille_carte_clicked = itemId;
                var getValue = itemId;
                if (queries) {
                    $scope.getModelsByQueries('famille', getValue, 'produit', queries);
                }
            }



            $("#famille_menu_propositioncommerciale").val(null);
        }
    };
    $scope.calculMontantRhJournalierTotal = function () {
        var montantTotalJour = 0;
        if ($scope.dataInTabPane['rhs_proforma']['data']) {
            var searchRh = $filter('filter')($scope.dataInTabPane['rhs_proforma']['data'], { date: $scope.dateRH.date });
            if (searchRh && searchRh.length > 0) {
                console.log('Jai calcule le journalier')
                for (var i = 0; i < searchRh.length; i++) {
                    montantTotalJour += parseFloat(searchRh[i].tarif);
                }

            }

            $scope.montant_rh_journalier = montantTotalJour;
            var montantTotalRh = 0;

            for (var i = 0; i < $scope.dataInTabPane['rhs_proforma']['data'].length; i++) {
                console.log('Jai calcule le total')
                if ($scope.dataInTabPane['rhs_proforma']['data'][i].tarif) {
                    montantTotalRh += parseFloat($scope.dataInTabPane['rhs_proforma']['data'][i].tarif);
                }
            }
            $scope.dataInTabPane['rhs_proforma']['data']['montant_rh'] = montantTotalRh;

        }
    }

    // Permet d'ajouter une permission à la liste des permissions d'un role
    $scope.role_permissions = [];
    $scope.addToBe = function (event, itemId) {
        var all_checked = true;
        $scope.role_permissions = [];
        $("[id^=permission_role]").each(function (key, value) {
            if ($(this).prop('checked')) {
                var permission_id = $(this).attr('data-permission-id');
                $scope.role_permissions.push(permission_id);
            } else {
                all_checked = false;
            }
        });
        $('#permission_all_role').prop('checked', all_checked);
        $scope.checkIfShowButtonDel();
    };

    $scope.addToRole = function (event, itemId) {
        var all_checked = true;
        $scope.role_permissions = [];
        $("[id^=permission_role]").each(function (key, value) {
            if ($(this).prop('checked')) {
                var permission_id = $(this).attr('data-permission-id');
                $scope.role_permissions.push(permission_id);
            } else {
                all_checked = false;
            }
        });
        $('#permission_all_role').prop('checked', all_checked);
        console.log('arrive', all_checked, $scope.role_permissions);
    };
    $scope.addToBe = function (event, itemId) {
        var all_checked = true;
        $scope.be_ocher = [];
        $("[id^=coche]").each(function (key, value) {
            if ($(this).prop('checked')) {
                var permission_id = $(this).attr('data-permission-id');
                $scope.be_ocher.push(permission_id);
            } else {
                all_checked = false;
            }
        });
        $('#toutcocher').prop('checked', all_checked);
    };

    $scope.deletAllLineBe = function () {
        if ($scope.dataInTabPane['produits_be']['data'] && $scope.dataInTabPane['produits_be']['data'].length > 0) {
            $scope.dataInTabPane['produits_be']['data'];
            // console.log($("#coche_"+));
            var count = $scope.dataInTabPane['produits_be']['data'].length;
            for (var i = 0; i < count; i++) {
                console.log('------------------Checked-------------------------');
                console.log($("#coche_" + i).prop('checked'));
                var checked = $("#coche_" + i).prop('checked');
                if (checked) {
                    var item = $scope.dataInTabPane['produits_be']['data'][i];
                    var index = $scope.dataInTabPane['produits_be']['data'].indexOf(item);
                    // if(item.coche == true){
                    $scope.dataInTabPane['produits_be']['data'].splice(index, 1);
                    // }
                }
            }
            if ($scope.dataInTabPane['produits_be']['data'] && $scope.dataInTabPane['produits_be']['data'].length > 0) {
                count = $scope.dataInTabPane['produits_be']['data'].length;
                for (var i = 0; i < count; i++) {

                    $("#coche_" + i).prop('checked', false);

                }
            }

        }
    }

    //--DEBUT => Permet de vérifier si un id est dans un tableau--//
    $scope.isInArrayData = function (e, idItem, data, typeItem = "menu") {
        response = false;
        $.each(data, function (key, value) {
            if (typeItem.indexOf('menu') !== -1) {
                if (value.consommation_id == idItem) {
                    response = true;
                }
            } else if (typeItem.indexOf('role') !== -1) {
                if (value.id == idItem) {
                    response = true;
                }
            }
            else if (typeItem.indexOf('be') !== -1) {
                $scope.checkIfShowButtonDel();
            }
            //return response;
        });
        //console.log('ici', response);\

        return response;
    };

    $scope.checkIfShowButtonDel = function () {
        var checked = false;
        if ($scope.dataInTabPane['produits_be']['data'] && $scope.dataInTabPane['produits_be']['data'].length > 0) {
            var count = $scope.dataInTabPane['produits_be']['data'].length;

            for (var i = 0; i < count; i++) {

                if ($("#coche_" + i).prop('checked') == true) {
                    checked = true;
                }
            }

            // $scope.cocherTout  = false;
        }
        $scope.is_checked = checked;
    }
    //--FIN => Permet de vérifier si un id est dans un tableau--//


    $scope.chstat = { 'id': '', 'statut': '', 'type': '', 'title': '' };
    $scope.showModalStatut = function (event, type, statut, obj = null, title = null, indexItem = null, indexItem2, list = false, tab = false) {
        var id = null;
        var index = null;
        $scope.chstat.id_detail_produit = null;
        if (obj) {
            id = obj.id;
        }
        $scope.chstat.id = id;
        $scope.chstat.statut = statut;
        $scope.chstat.type = type;
        $scope.chstat.title = title;
        $scope.desactivElement(type, obj, null, index, list, tab);

    };

    $scope.generateAddFiltres = function (currentpage) {
        // console.log('generateAddFiltres =>', currentpage);
        currentpage = `_list_${currentpage}`;
        var addfiltres = "";
        var title = "";
        var currentvalue = "";
        var can_add = true;
        // console.log("after =====>", currentpage);
        $("input[id$=" + currentpage + "], textarea[id$=" + currentpage + "], select[id$=" + currentpage + "]").each(function () {
            title = $(this).attr("id");
            title = title.substring(0, title.length - currentpage.length);
            currentvalue = $(this).val();
            // console.log('here =>', currentpage, 'titre filtre', $(this).attr("id"), title);

            if (currentvalue && title.indexOf('searchtexte') === -1) {
                can_add = true;

                if ($(this).is("select")) {
                    title = `${title}_id`;
                } else if ($(this).is("input") || $(this).is("textarea")) {
                    if ($(this).attr('type') === 'radio') {
                        // console.log('select222*********');
                        title = $(this).attr('name');
                        currentvalue = $("#" + $(this).attr("id") + "[name='" + title + "']:checked").attr("data-value");
                        if (addfiltres.indexOf(title) !== -1 || !currentvalue) {
                            can_add = false;
                        }
                        // console.log('title =>', title, 'currentvalue =>', currentvalue);
                    }
                    if ($(this).attr('type') === 'checkbox') {
                        // rien pour le moment
                    }
                    if ($(this).attr('type') === 'number') {

                    }
                    if ($(this).attr('type') === 'date' || $(this).attr('type') === 'text' || $(this).is("textarea")) {
                        currentvalue = `"${currentvalue}"`;
                    }
                    if ($(this).attr('type') === 'color') {
                        title = $(this).attr('name');
                        // console.log('-----------Color----------');
                        // console.log(title);
                        /*currentvalue = $("#" + $(this).attr("id") + "[name='" + title + "']:checked").attr("data-value");
                        if (addfiltres.indexOf(title)!==-1 || !currentvalue)
                        {
                            can_add = false;
                        }
                        console.log('title =>', title, 'currentvalue =>', currentvalue);*/
                    }
                }

                if (title.indexOf('searchoption') !== -1) {
                    // console.log('filtres');
                    title = currentvalue;
                    currentvalue = $('#searchtexte' + currentpage).val();
                    currentvalue = `"${currentvalue}"`;
                    // console.log('---------Value in-------------');
                    // console.log(currentvalue);
                    if (!$('#searchtexte' + currentpage).val()) {
                        can_add = false;
                    }
                }

                // console.log('------_Can add_-------');
                // console.log(can_add);


                if (can_add) {


                    if (title === 'couleur') {
                        currentvalue = currentvalue.replace('#', '');
                        // console.log(title);
                        // console.log(currentvalue);
                    }
                    addfiltres = `${addfiltres},${title}:${currentvalue}`;
                }
                // console.log('----------_here the filter----------');
                // console.log(addfiltres);
            }

        });
        $scope.filters = addfiltres;
        return addfiltres;
    };


    $scope.radioBtnStatus = null;
    $scope.onRadioClickStatus = function ($event, param) {

        // console.log('onRadioClickStatus =>', $event, $($event.target).attr('name'));

        $scope.radioBtnStatus = param;

        // console.log('onRadioClickStatus =>', param);
    };

    // Pour générer les formulaires d'ajout dans les sections TabPane du modal
    $scope.dataInTabPane = {
        list_commentaire_commentaire: { data: [], rules: [] },
        produits_sortie_production: { data: [], rules: [] },
        produits_production: { data: [], rules: [] },
        produits_sortie_decoupage: { data: [], rules: [] },
        produits_decoupage: { data: [], rules: [] },
        produits_commande_paiement: { data: [], rules: [] },
        datecles_client: { data: [], rules: [] },
        prixachats_logistique: { data: [], rules: [] },
        produits_sortie_assemblage: { data: [], rules: [] },
        produits_assemblage: { data: [], rules: [] },
        compte_sages_postedepense: { data: [], rules: [] },
        compte_sage_client: { data: [], rules: [] },
        compte_sage_fournisseur: { data: [], rules: [] },
        adrlivs_fournisseur: { data: [], rules: [] },
        produit_bt: { data: [], rules: [] },
        user_departement_user: { data: [], rules: [] },
        option_materiel: { data: [], rules: [] },
        familles_propositioncommerciale: { data: [], rules: [] },
        produits_propositioncommerciale: { data: [], rules: [] },
        r2acomm_proforma: { data: [], rules: [] },
        logistique_proforma: { data: [], rules: [] },
        item_tab_panes_r2a_proforma: { data: [], rules: [] },
        item_tab_panes_rh_proforma: { data: [], rules: [] },
        produits_famille_carte: { data: [], rules: [] },
        famille_option_menus: { data: [], rules: [] },
        tranche_horaires_menu: { data: [], rules: [] },
        produits_menu: { data: [], rules: [] },
        accompagnement_commande: { data: [], rules: [] },
        menus_produit: { data: [], rules: [] },
        produits_carte: { data: [], rules: [] },
        produits_bci: { data: [], rules: [] },
        contacts_fournisseur: { data: [], rules: [] },
        informationbancaires_fournisseur: { data: [], rules: [] },
        contacts_client: { data: [], rules: [] },
        adrlivs_client: { data: [], rules: [] },
        r2atechniques_produit: { data: [], rules: [] },
        r2atechniques_proforma: { data: [], rules: [] },
        cuisine_stock_proforma: { data: [], rules: [] },
        rhs_proforma: { data: [], rules: [] },
        interventions_action: { data: [], rules: [] },
        intervenants_evenement: { data: [], rules: [] },
        typebillets_cloturecaisse: { data: [], rules: [] },
        encaissements_cloturecaisse: { data: [], rules: [] },
        entites_cloturecaisse: { data: [], rules: [] },
        produits_entreestock: { data: [], rules: [] },
        produits_inventaire: { data: [], rules: [] },
        produits_sortiestock: { data: [], rules: [] },
        prixventes_produit: { data: [], rules: [] },
        familleliaisons_produit: { data: [], rules: [] },
        entiteproduits_produit: { data: [], rules: [] },
        prixachats_produit: { data: [], rules: [] },
        allergenes_produit: { data: [], rules: [] },
        emballages_produit: { data: [], rules: [] },
        prixventes_produit: { data: [], rules: [] },
        compositions_produit: { data: [], rules: [] },
        seuils_produit: { data: [], rules: [] },
        familleliaisons_produit: { data: [], rules: [] },
        produits_bce: { data: [], rules: [] },
        produits_be: { data: [], rules: [] },
        produits_commande: { data: [], rules: [] },
        valeursft_produit: { data: [], rules: [] },
        totaux_cloturecaisse: { data: [], rules: [] },
        entitestransactions_general: { data: [], rules: [] },
        totaux_entites_transaction_caisse: { data: [], rules: [] },
        entites_postedepense: { data: [], rules: [] },
        postedepenses_depense: { data: [], rules: [] },
        totaux_depense: { data: [], rules: [] },
        depense_reglement: { data: [], rules: [] },
        commande_suivicommande: { data: [], rules: [] },
        bce_paiementbc: { data: [], rules: [] },
        donnees_commande: { data: [], rules: [] },
        employes_planing: { data: [], rules: [] },
        familleactions_operateur: { data: [], rules: [] },
        itemsfiltres_facture: { data: [], rules: [] },
        items_facture: { data: [], rules: [] },
        totaux_facture: { data: [], rules: [] },
        facture_paiementfacture: { data: [], rules: [] },
        depense_action: { data: [], rules: [] },

        /**N'appartient pas à l'application**/
        detailordreahat_ordreachat: { data: [], rules: [] },
        detailboncommande_boncommande: { data: [], rules: [] },
        detailassemblage_assemblage: { data: [], rules: [] },
        informationbancaires_fournisseur: { data: [], rules: [] },
        details_carte: { data: [], rules: [] },
        details_ordreachat: { data: [], rules: [] },
        details_boncommande: { data: [], rules: [] },
        details_reception: { data: [], rules: [] },
        details_assemblage: { data: [], rules: [] },
        typedepot_typeproduit: { data: [], rules: [] },
        decoupage_produit: { data: [], rules: [] },
        zonedelivraison_entite: { data: [], rules: [] },
        r2adepaie_motif: { data: [], rules: [] },
        produits_inventairelogistique: { data: [], rules: [] },


    };

    //Pour des utilisations spécifiques
    $scope.depotSelected = [];
    $scope.ajout_rapport_conformite_action = false;
    $scope.firstime = true;
    $scope.clonange = false
    $scope.BciIdClonned = null
    $scope.pour_banque = 0;
    $scope.pour_bon_cadeau = 0;

    $scope.addBceProduitDirect = function (action, tagForm) {
        var speciale = true;
        var currentPosition = 0;
        var search = $filter('filter')($scope.dataInTabPane[tagForm]['data'], { "id": $("#bce_produits").val() });

        if (search && search.length == 1) {
            currentPosition = $scope.dataInTabPane[tagForm]['data'].indexOf(search[0]);
        } else {
            console.log('--------------Index dynamic---------')
            console.log($scope.dataInTabPane[tagForm]['data'].length);

            if ($scope.dataInTabPane[tagForm]['data'].length > 0) {
                $scope.dataInTabPane[tagForm]['data'].push({});
                currentPosition = $scope.dataInTabPane[tagForm]['data'].length - 1;
            } else {
                $scope.dataInTabPane[tagForm]['data'].push({});
                currentPosition = 0;
            }
        }

        $scope.dataInTabPane[tagForm]['data'][currentPosition]['id'] = $("#bce_produits").val();

        if (!$scope.dataInTabPane[tagForm]['data'][currentPosition]['entites']) {
            $scope.dataInTabPane[tagForm]['data'][currentPosition]['entites'] = [];
        }
        $scope.dataInTabPane[tagForm]['data'][currentPosition]['designation'] = $scope.item_select.designation;
        $scope.dataInTabPane[tagForm]['data'][currentPosition]['produit'] = $scope.item_select ? { designation: $scope.item_select.designation, prix_achat_unitaire: $scope.item_select.prix_achat_unitaire, prix_achat_ttc: $scope.item_select.prix_achat_ttc } : null;
        $("select[id$=" + tagForm + "]").each(function () {
            if ($(this).is("select")) {
                var getValue = $(this).val();
                $scope.dataInTabPane[tagForm]['data'][currentPosition]['entites'].push(
                    {
                        designation: $(this).find("option:selected").text(),
                        quantite_total_initial: parseInt($('#quantite_' + tagForm).val()),
                        quantite_total_final: parseInt($('#quantite_' + tagForm).val()),
                        id: getValue,
                        etatbciproduitentite: 1,
                        direct: 1
                    });

                $(this).find("option:selected").val(null);
            }
        })
        $('#quantite_' + tagForm).val(null);
        console.log($scope.dataInTabPane[tagForm]['data']);
    }


    $scope.getPoidsSotrie = function (tagForm) {
        $scope.poids_sortie = 0;
        $scope.poids_dechet = 0;
        console.log("check");
        if ($scope.dataInTabPane[tagForm]['data']) {
            for (var i = 0; i < $scope.dataInTabPane[tagForm]['data'].length; i++) {
                if ($scope.dataInTabPane[tagForm]['data'][i]['poids'] && ($scope.dataInTabPane[tagForm]['data'][i]['perte'] == false || !$scope.dataInTabPane[tagForm]['data'][i]['perte'])) {
                    $scope.poids_sortie += parseFloat($scope.dataInTabPane[tagForm]['data'][i]['poids']);
                } else if ($scope.dataInTabPane[tagForm]['data'][i]['poids'] && ($scope.dataInTabPane[tagForm]['data'][i]['perte'] == true)) {
                    $scope.poids_dechet += parseFloat($scope.dataInTabPane[tagForm]['data'][i]['poids']);
                }
            }
        }
    }

    $scope.actionSurTabPaneTagData = function (action, tagForm, currentIndex = 0, type = '', indextab, keyUpdate = null, valueUpdate = null) {
        // console.log(action, tagForm);

        if (action == 'add') {
            var speciale = false;
            var currentPosition = $scope.dataInTabPane[tagForm]['data'].length;
            if (tagForm == 'tranchehoraire_produit') {
                tagForm = tagForm + indextab + "_menu";
            }
            /*if (tagForm === "user_departement_user")
            {
                if($scope.dataInTabPane[tagForm]['data'].length > 0)
                {
                    iziToast.error({
                        message: "On ne peut qu'àvoir un seul département pour un utilisateur",
                        position: 'topRight'
                    });
                    return false;
                }
            }*/
            if (tagForm == 'r2atechniques_produit' || tagForm == 'produits_bci' || tagForm == 'produits_carte' || tagForm == 'cuisine_stock_proforma' || tagForm == 'r2acomm_proforma' || tagForm == 'produits_propositioncommerciale') {
                speciale = true;
                if (tagForm == 'produits_propositioncommerciale') {
                    currentPosition = $scope.dataInTabPane['familles_propositioncommerciale']['data'].length;
                }
            } else {
                $scope.dataInTabPane[tagForm]['data'].push({});
            }

            var message_duplicatevalue = '';

            var findError = false;
            $("input[id$=" + tagForm + "], textarea[id$=" + tagForm + "], select[id$=" + tagForm + "]").each(function () {

                getValue = $(this).val();

                var indexNameInTab = $(this).attr('id').substring(0, ($(this).attr('id').length - tagForm.length - 1));
                if ($(this).hasClass('required') && !$(this).val()) {
                    findError = true;
                    $scope.dataInTabPane[tagForm]['data'].splice((currentPosition), 1);
                    message_duplicatevalue = 'Veuillez remplir tous les champs obligatoires';
                    return !findError;
                }
                if ($scope.dataInTabPane[tagForm]['data'] && $scope.dataInTabPane[tagForm]['data'].length > 0) {
                    var trouve = false;
                    var index = null;
                    for (var i = 0; i < $scope.dataInTabPane[tagForm]['data'].length; i++) {
                        if ($scope.dataInTabPane[tagForm]['data'][i][indexNameInTab + '_text'] == $(this).find("option:selected").text()) {
                            trouve = true;
                            index = i;
                        }
                    }

                    if (trouve == true) {
                        findError = true;
                        $scope.dataInTabPane[tagForm]['data'].splice((currentPosition), 1);
                        message_duplicatevalue = 'Erreur: ' + $(this).find("option:selected").text() + ' existe déjà.';
                        return !findError;
                    }
                }

                if ($(this).is("select")) {

                    if (!findError) {

                        if (tagForm == 'produits_bce') {
                            speciale = true;
                            var search = $filter('filter')($scope.dataInTabPane[tagForm]['data'], { "id": $("#bce_produits").val() });

                            if (search && search.length == 1) {
                                currentPosition = $scope.dataInTabPane[tagForm]['data'].indexOf(search[0]);
                            } else {
                                console.log('--------------Index dynamic---------')
                                console.log($scope.dataInTabPane[tagForm]['data'].length);
                                if ($scope.dataInTabPane[tagForm]['data'].length > 0) {
                                    currentPosition = $scope.dataInTabPane[tagForm]['data'].length - 1;
                                } else {
                                    currentPosition = 0;
                                }

                                $scope.dataInTabPane[tagForm]['data'][currentPosition]['id'] = $("#bce_produits").val();
                            }

                            if (!$scope.dataInTabPane[tagForm]['data'][currentPosition]['entites']) {
                                $scope.dataInTabPane[tagForm]['data'][currentPosition]['entites'] = [];
                            }
                            $scope.dataInTabPane[tagForm]['data'][currentPosition]['designation'] = $("#bce_produits").text();
                            $scope.dataInTabPane[tagForm]['data'][currentPosition]['produit'] = $scope.item_select ? { designation: $scope.item_select.designation, prix_achat_unitaire: $scope.item_select.prix_achat_unitaire, prix_achat_ttc: $scope.item_select.prix_achat_ttc } : null;
                            $scope.dataInTabPane[tagForm]['data'][currentPosition]['entites'].push(
                                {
                                    designation: $(this).find("option:selected").text(),
                                    quantite_total_initial: parseInt($('#quantite_' + tagForm).val()),
                                    quantite_total_final: parseInt($('#quantite_' + tagForm).val()),
                                    id: parseInt($(this).find("option:selected").val()),
                                    etatbciproduitentite: 4
                                });
                        } else {

                            if (!speciale) {
                                if (tagForm === "rhs_proforma") {
                                    $scope.dataInTabPane[tagForm]['data'][currentPosition][indexNameInTab + '_text'] = $(this).find("option:selected").text() + "_" + $scope.dateRH;
                                    $scope.dataInTabPane[tagForm]['data'][currentPosition]['tarif'] = parseInt($("#tarif_rh").val());
                                } else {
                                    $scope.dataInTabPane[tagForm]['data'][currentPosition][indexNameInTab + '_text'] = $(this).find("option:selected").text();

                                }
                                $scope.dataInTabPane[tagForm]['data'][currentPosition][indexNameInTab] = {
                                    designation: $(this).find("option:selected").text(),
                                    unite_de_mesure: { designation: $('#info_unitedemesure_produit_' + tagForm).val() }
                                };
                                $scope.dataInTabPane[tagForm]['data']['montant'] = +($('#montant_menu').val());
                                indexNameInTab = indexNameInTab + '_id';
                                if (tagForm == 'familles_propositioncommerciale') {
                                    $scope.dataInTabPane[tagForm]['data'][currentPosition]['option_menu'] = $scope.famille_id
                                }
                                if (tagForm == 'option_materiel') {
                                    var forfait = $scope.dataInTabPane[tagForm]['data']['forfait'];
                                    var forfait_ht = $scope.dataInTabPane[tagForm]['data']['forfait_ht'];
                                    var montant_prod = +$("#montant_" + tagForm).val();
                                    var montant_ht_prod = +$("#montant_ht_" + tagForm).val();
                                    var quantite_prod = +$("#quantite_" + tagForm).val();
                                    if (montant_prod && montant_prod > 0 && montant_ht_prod && montant_ht_prod > 0 && quantite_prod && quantite_prod > 0) {
                                        forfait = forfait ? forfait : 0;
                                        forfait_ht = forfait_ht ? forfait_ht : 0;
                                        forfait += montant_prod * quantite_prod;
                                        forfait_ht += montant_ht_prod * quantite_prod;

                                        $scope.dataInTabPane[tagForm]['data']['forfait'] = forfait;
                                        $scope.dataInTabPane[tagForm]['data']['forfait_ht'] = forfait_ht;
                                        $("#forfait_option_materiel_ht").val(parseFloat(forfait_ht));
                                        $("#forfait_option_materiel").val(parseFloat(forfait));
                                    }

                                }
                                if (tagForm == 'produit_bt') {
                                }
                                if (tagForm === "user_departement_user") {
                                    $scope.dataInTabPane[tagForm]['data'][currentPosition]['etat'] = 0;
                                }
                                if (tagForm === "rhs_proforma") {
                                    $scope.dataInTabPane[tagForm]['data'][currentPosition]['date'] = $scope.dateRH.date;
                                }

                            }
                            if (tagForm == 'tranchehoraire_produit') {
                                $scope.dataInTabPane[tagForm]['data']['tranchehoraire'] = indextab;
                            }
                        }

                        if (speciale) {
                            var typeAvecS = type + 's';
                            rewriteReq = `${type}s(id:${$(this).find("option:selected").val()})`;
                            $scope.manageAfterSelect2(type, $(this).find("option:selected").val(), false, tagForm, currentPosition, indexNameInTab, rewriteReq);
                        }

                    } else {
                        $scope.showToast('', message_duplicatevalue, 'error');
                    }

                }
                else if ($(this).is(":checkbox")) {
                    getValue = $(this).prop('checked');
                }

                if (!speciale) {
                    $scope.dataInTabPane[tagForm]['data'][currentPosition][indexNameInTab] = getValue;
                }
            });


            if (!findError) {
                if (!speciale) {

                    console.log($scope.dataInTabPane[tagForm]['data'])
                    $scope.calculMontantGlobalSurTabPaneData(tagForm, $scope.dataInTabPane[tagForm]['data']);
                    $('.unite-mesure').val('');
                    $('.quantite-theorique').val('');
                    $scope.emptyform(tagForm);
                    $scope.reInit();
                    if (tagForm == "produits_inventaire") {
                        $(".quantite-theorique").val(null);
                    }
                    if (tagForm == "produits_inventairelogistique") {
                        $(".quantite-theorique").val(null);
                    }
                    if (tagForm == 'item_tab_panes_rh_proforma') {
                        $scope.dateRH = $scope.dataInTabPane[tagForm]['data'][$scope.dataInTabPane[tagForm]['data'].length - 1];
                        $scope.dateRH['montant'] = 0;
                        setTimeout(function () {
                            for (var i = 0; i < $scope.dataInTabPane[tagForm]['data'].length - 1; i++) {
                                $("#" + tagForm + "_" + $scope.dataInTabPane[tagForm]['data'][i].date).css({ "border": "1px solid white" });
                            }
                            $("#" + tagForm + "_" + $scope.dateRH.date).css({ "border": "1px solid #0999BF" });

                        }, 1000);

                    }
                    if (tagForm == 'rhs_proforma') {

                        var date = $filter('filter')($scope.dataInTabPane['item_tab_panes_rh_proforma']['data'], { date: $scope.dateRH.date });
                        console.log('la date RH', date)
                        if (date && date.length == 1) {
                            let index = $scope.dataInTabPane['item_tab_panes_rh_proforma']['data'].indexOf(date[0]);
                            var montant = +date[0].montant;
                            var montant_operateur = +$scope.dataInTabPane['rhs_proforma']['data'][$scope.dataInTabPane['rhs_proforma']['data'].length - 1].tarif;

                            if (!$scope.dataInTabPane[tagForm]['data']['montant_rh']) {
                                $scope.dataInTabPane[tagForm]['data']['montant_rh'] = 0;
                            }
                            if (index > -1) {
                                $scope.dataInTabPane['item_tab_panes_rh_proforma']['data'][index].montant = montant + montant_operateur;
                                $scope.dateRH.montant = $scope.dataInTabPane['item_tab_panes_rh_proforma']['data'][index].montant;
                                $scope.dataInTabPane[tagForm]['data']['montant_rh'] = $scope.dataInTabPane[tagForm]['data']['montant_rh'] + montant_operateur;

                            }
                            $scope.calculeRhJournalier($scope.dataInTabPane[tagForm]['data'], $scope.dateRH.date);
                        }

                    }
                }
            } else {
                $scope.showToast('', message_duplicatevalue, 'error');
            }
        } else if (action == 'delete') {
            if (tagForm == 'r2atechniques_produit') {
                console.log($scope.dataInTabPane[tagForm]['data'][currentIndex].pru);

                var prt = $('#prix_de_revient_unitaire_total_produit').val();

                if (!prt) {
                    prt = 0;
                }

                if (prt > 0) {
                    //   prt = prt - parseFloat($scope.dataInTabPane[tagForm]['data'][currentIndex].produit_compose_id_pru.pru);
                    prt = prt - parseFloat($scope.dataInTabPane[tagForm]['data'][currentIndex].pru);
                }
                console.log('--------PRT-----');
                console.log(prt);
                $('#prix_de_revient_unitaire_total_produit').val(prt).change();
                $('#prix_de_revient_unitaire_produit').val(prt).change();

            }
            if (tagForm == 'r2acomm_proforma') {
                mntIndex = $scope.exonorer_tva && $scope.exonorer_tva == true ? $scope.dataInTabPane[tagForm]['data'][currentIndex].prix_unitaire_ttc
                    : $scope.dataInTabPane[tagForm]['data'][currentIndex].prix_unitaire_ht;
                $scope.dataInTabPane[tagForm]['data'].total_unitaire = $scope.dataInTabPane[tagForm]['data'].total_unitaire - mntIndex;
            }
            if (tagForm == 'option_materiel') {
                var montant_prod = parseFloat($scope.dataInTabPane[tagForm]['data'][currentIndex].montant);
                var montant_ht_prod = parseFloat($scope.dataInTabPane[tagForm]['data'][currentIndex].montant_ht);
                var quantite_prod = parseInt($scope.dataInTabPane[tagForm]['data'][currentIndex].quantite);
                if (montant_prod && montant_prod > 0 && quantite_prod && quantite_prod > 0 && montant_ht_prod && montant_ht_prod > 0) {
                    var forfait = $scope.dataInTabPane[tagForm]['data']['forfait'];
                    var forfait_ht = $scope.dataInTabPane[tagForm]['data']['forfait_ht'];

                    forfait = forfait - (montant_prod * quantite_prod);
                    forfait_ht = forfait_ht - (montant_ht_prod * quantite_prod);

                    $scope.dataInTabPane[tagForm]['data']['forfait'] = forfait;
                    $scope.dataInTabPane[tagForm]['data']['forfait_ht'] = forfait_ht;
                    $("#forfait_option_materiel_ht").val(forfait_ht);
                    $("#forfait_option_materiel").val(forfait);
                }

            }
            if (tagForm == 'produit_bt') {
                var montant_total_ht = $scope.dataInTabPane[tagForm]['data']['montant_total_ht'];
                var montant_total_ttc = $scope.dataInTabPane[tagForm]['data']['montant_total_ttc'];

                montant_total_ht = montant_total_ht - ($scope.dataInTabPane[tagForm]['data'][currentIndex].prix_achat_ht * $scope.dataInTabPane[tagForm]['data'][currentIndex].quantite);
                montant_total_ttc = montant_total_ttc - ($scope.dataInTabPane[tagForm]['data'][currentIndex].prix_achat_ttc * $scope.dataInTabPane[tagForm]['data'][currentIndex].quantite);

                $scope.dataInTabPane[tagForm]['data']['montant_total_ht'] = montant_total_ht;
                $scope.dataInTabPane[tagForm]['data']['montant_total_ttc'] = montant_total_ttc;
            }
            if (tagForm == 'rhs_proforma') {
                var montant_operateur = $scope.dataInTabPane['rhs_proforma']['data'][currentIndex].tarif;
                var currentMontantJournalier = $scope.dateRH.montant - montant_operateur;
                var montant_total_rh = $scope.dataInTabPane[tagForm]['data']['montant_rh']
                $scope.dateRH.montant = currentMontantJournalier;
                $scope.dataInTabPane[tagForm]['data']['montant_rh'] = montant_total_rh - montant_operateur;

            }
            $scope.dataInTabPane[tagForm]['data'].splice(currentIndex, 1);
            $scope.calculeRhJournalier($scope.dataInTabPane[tagForm]['data'], $scope.dateRH.date);


        } else if (action == "update") {
            $scope.dataInTabPane[tagForm]['data'][currentIndex][keyUpdate] = valueUpdate;
        }
    };
    $scope.calculeRhJournalier = function (tab, date) {
        if (tab && tab.length > 0 && date) {
            var montant = 0;
            for (var i = 0; i < tab.length; i++) {
                if (tab[i].date == date) {
                    montant += parseInt(tab[i].tarif);
                }
            }
            $scope.montant_rh_journalier = montant;
        }
    }
    $scope.actionSurTabPaneTagDataCuisineStockTraiteur = function (action, tagForm, currentIndex = 0, type = '', indextab, keyUpdate = null, valueUpdate = null) {
        console.log(action, tagForm);

        if (action == 'add') {
            var idProd = $('#produit_compose_' + tagForm).val();
            var qunatite = $('#quantite_' + tagForm).val();
            if (idProd && qunatite) {
                if ($scope.dataInTabPane[tagForm]['data'] && $scope.dataInTabPane[tagForm]['data'].length > 0) {
                    var searchProd = $filter('filter')($scope.dataInTabPane[tagForm]['data'], { produit_compose_id, idProd });
                    var prod;
                    if (searchProd && searchProd.length == 1) {
                        let index = $scope.dataInTabPane[tagForm]['data'].indexOf(searchProd[0]);
                        searchProd[0]['quantite'] = parseInt(searchProd[0]['quantite']) + qunatite;
                        prod = searchProd[0];
                        if (index > -1) {
                            $scope.dataInTabPane[tagForm]['data'][index] = prod;
                        }
                    }
                } else {
                    prod = {
                        produit_compose_id: $('#produit_compose_' + tagForm).val(),
                        produit_compose: { designation: $('#produit_compose_' + tagForm).text() },
                        produit_compose_text: $('#produit_compose_' + tagForm).text(),
                        unite_de_mesure: $('.unite-mesure').val(),
                        quantite: qunatite
                    }
                    $scope.dataInTabPane[tagForm]['data'].push(prod);
                }

            } else {
                $scope.showToast('', 'Veuillez renseigner un produit et une quantité', 'error');
            }


        } else if (action == 'delete') {

            $scope.dataInTabPane[tagForm]['data'].splice(currentIndex, 1);

        } else if (action == "update") {
            $scope.dataInTabPane[tagForm]['data'][currentIndex][keyUpdate] = valueUpdate;
        }
    };

    $scope.calculMontantGlobalSurTabPaneData = function (tagForm, tab) {

        if ($scope.dataInTabPane[tagForm]['data']) {
            if (tagForm == 'produit_bt') {

                var montant_total_ht = $scope.dataInTabPane[tagForm]['data']['montant_total_ht'];
                var montant_total_ttc = $scope.dataInTabPane[tagForm]['data']['montant_total_ttc'];
                montant_total_ht = montant_total_ht ? montant_total_ht : 0;
                montant_total_ttc = montant_total_ttc ? montant_total_ttc : 0;
                if (tab && tab.length > 0) {
                    tab.forEach(item => {
                        montant_total_ht += item.prix_achat_ht * item.quantite;
                        montant_total_ttc += item.prix_achat_ttc * item.quantite;
                    });
                }
                $scope.dataInTabPane[tagForm]['data']['montant_total_ht'] = montant_total_ht;
                $scope.dataInTabPane[tagForm]['data']['montant_total_ttc'] = montant_total_ttc;
            }
        }
    }
    $scope.savePropositionTraiteur = function () {
        var type = "propositioncommerciale";
        var currentIndex = $scope.dataInTabPane['r2acomm_proforma']['data'].length;
        var propostion = $('#designation_' + type).val();
        if (propostion && propostion !== '') {
            var searchProp = $filter('filter')($scope.dataInTabPane['r2acomm_proforma']['data'], { proposition: propostion });
            var objet = {
                proposition: $('#designation_' + type).val(),
                titre: $('#titre_' + type).val(),
                famille_menus: $scope.dataPage['famille_menus'],
                familles_propositioncommerciale: $scope.dataInTabPane['familles_' + type]['data'],
                activer: 0,
                option_materiel: $scope.dataInTabPane['option_materiel']['data'],
                forfait_option_materiel: $scope.dataInTabPane['option_materiel']['data'].forfait_ht,
                montant_par_personne: $("#montant_par_personne_" + type).val(),
                forfait: $("#forfait_" + type).val(),
                remise: $("#remise_" + type).val(),
                commentaires: $("commentaires_" + type).val(),
                nombre_personne: $('#nombre_personne_propositioncommerciale').val(),
                forfait_direct_menu: $("#forfait_direct_menu_propositioncommerciale").prop('checked'),
                exotva: $("#exotva_propositioncommerciale").prop('checked'),
                forfait_direct_materiel: $("#forfait_direct_materiel_propositioncommerciale").prop('checked'),

            }
            // if($scope.actionSurProposition !== 'clone'){
            if (!searchProp || searchProp.length <= 0) {
                $scope.dataInTabPane['r2acomm_proforma']['data'][currentIndex] = objet;
            } else if (searchProp && searchProp.length == 1) {
                let index = $scope.dataInTabPane['r2acomm_proforma']['data'].indexOf(searchProp[0]);
                if ($scope.actionSurProposition == 'edit') {
                    objet['activer'] = searchProp[0].activer;
                    objet['id'] = searchProp[0].id;
                }

                $scope.dataInTabPane['r2acomm_proforma']['data'][index] = objet;
            }
            $("#designation_r2acomm_proforma").val('');
            $("#modal_add" + type).modal('hide');
            this.closeModal("#modal_add" + type);
            $scope.showToast('Proposition commerciale', 'Reussi.', 'success');
            console.log($scope.dataInTabPane['r2acomm_proforma']['data'])

            /*}else {
                $scope.showToast('Proposition commerciale', 'La designation de cette proposition existe dèjà.', 'error');
            }*/

        } else {
            $scope.showToast('Proposition commerciale', 'Veuillez ajouter une designation à cette proposition', 'error');
        }

    }


    $scope.activeProposition = function (item = null, tag, etat) {
        // var prop = $filter('filter')($scope.dataInTabPane['tag']['data'], {proposition: item.proposition});
        if (item) {
            let index = $scope.dataInTabPane[tag]['data'].indexOf(item);
            if (index > -1) {
                $scope.dataInTabPane[tag]['data'][index].activer = etat;
                for (var i = 0; i < $scope.dataInTabPane[tag]['data'].length; i++) {
                    if ($scope.dataInTabPane[tag]['data'][i].proposition !== item.proposition) {
                        $scope.dataInTabPane[tag]['data'][i].activer = 0;
                    }
                }

            }
        }

        var propValider = $filter('filter')($scope.dataInTabPane[tag]['data'], { activer: 1 });
        if (propValider && propValider.length > 0) {
            $("#r2aproforma").fadeIn('slow');
            $("#log").fadeIn('slow');
            $("#rh").fadeIn('slow');
            $("#depense").fadeIn('slow');
            $("#doc").fadeIn('slow');
        }

    }
    $scope.chargeBesoinMP = function (tagCom, tagMp) {
        var tableauArticle = [];
        var nombre_portion;

        if ($scope.dataInTabPane[tagCom]['data'] && $scope.dataInTabPane[tagCom]['data'].length > 0) {
            var tabComValider = $filter('filter')($scope.dataInTabPane[tagCom]['data'], { activer: 1 });
            if (tabComValider && tabComValider.length > 0) {

                tabComValider.forEach(item1 => {
                    let indexProp = $scope.dataInTabPane[tagCom]['data'].indexOf(item1);
                    var tabProduit = item1.familles_propositioncommerciale;

                    var nombreCouvert = $("#nombre_personne_proforma").val();

                    $scope.getProduitMP(tabProduit, tagMp, item1.proposition);

                });

                $scope.dataInTabPane[tagMp]['data']['nombre_portion'] = nombre_portion;
            }

        }


    }
    $scope.getProduitMP = function (tabProduit, tagMp, proposition) {

        var nombreCouvert = $("#nombre_personne_proforma").val();
        if (tabProduit && tabProduit.length > 0) {
            tabProduit.forEach(item2 => {
                if (item2.produit_compose_id) {
                    var req = "produits";
                    var rewriteReq = req + "(id:" + item2.produit_compose_id + ")";
                    Init.getElement(rewriteReq, listofrequests_assoc[req]).then(function (data) {
                        if (data) {
                            item2['r2atechniques'] = data[0].r2atechniques;
                            if (item2.r2atechniques && item2.r2atechniques.length > 0) {
                                var r2atechniques = item2.r2atechniques;

                                r2atechniques.forEach(item3 => {
                                    console.log('r2a technique 1: ');
                                    console.log(item3);

                                    var searchProd = $filter('filter')($scope.dataInTabPane[tagMp]['data'], { produit_compose_id: item3.produit_compose_id });

                                    console.log('-------search prod----------');
                                    console.log(searchProd);

                                    if (searchProd && searchProd.length == 1) {

                                        let index = $scope.dataInTabPane[tagMp]['data'].indexOf(searchProd[0]);
                                        var quantite = item3.portion_unitaire * nombreCouvert;
                                        var quantiteInit = $scope.dataInTabPane[tagMp]['data'][index].portion_unitaire;

                                        $scope.dataInTabPane[tagMp]['data'][index].portion_unitaire = quantiteInit + quantite;
                                        var cout = $scope.dataInTabPane[tagMp]['data'][index].portion_unitaire * $scope.dataInTabPane[tagMp]['data'][index].pru;
                                        $scope.dataInTabPane[tagMp]['data'][index].cost = cout;
                                        $scope.dataInTabPane[tagMp]['data'][index].nombre_couvert = nombreCouvert;
                                        $scope.dataInTabPane[tagMp]['data'][index].proposition = proposition;

                                    } else if (!searchProd || searchProd.length == 0) {

                                        var quantite = item3.portion_unitaire * nombreCouvert;
                                        var cout = item3.pru * quantite;
                                        var prod = {
                                            produit_compose_id: item3.produit_compose_id,
                                            produit_compose: item3.produit_compose,
                                            produit_compose_text: item3.produit_compose.designation,
                                            portion_unitaire: quantite,
                                            unite_de_mesure: item3.unite_de_mesure,
                                            cost: cout,
                                            pru: item3.pru,
                                            nombre_couvert: nombreCouvert,
                                            proposition: proposition
                                        }
                                        console.log('non trouve: ')
                                        console.log(searchProd[0]);
                                        $scope.dataInTabPane[tagMp]['data'].push(prod);
                                    }


                                });

                            }
                        }

                    }, function (msg) {

                    });
                }


            });
            //  $scope.dataInTabPane[tagCom]['data'][indexProp].activer = 2;
        }
    }
    $scope.generatePdf = function () {
        var dataObjet = {
            test: "test"
        }
        Init.generatePdf('generate-pdf-r2atechnique-prop', dataObjet).then(function (data) {
            console.log(data);
        })
    }
    $scope.addNewProduitFromAccompagnement = function (accomapgnement, tagForm, item) {

        var search_prod = $filter('filter')($scope.dataInTabPane[tagForm]['data'], { id: accomapgnement.id, produit_commande: item.id });
        var nb_accompagenement = 0;
        if (search_prod && search_prod.length >= 0) {
            console.log('-------_Regule supplement------');
            console.log(accomapgnement.supplement);
            console.log(search_prod.length);
            if (accomapgnement.supplement >= search_prod.length) {
                nb_accompagenement = accomapgnement.supplement = accomapgnement.supplement - search_prod.length;
            }
        }
        for (var i = 0; i < accomapgnement.supplement; i++) {
            var new_prod = {
                id: accomapgnement.id,
                accompagnement_commande: null,
                designation: accomapgnement.designation,
                famille: accomapgnement.famille,
                famille_id: accomapgnement.famille_id,
                famille_liaison_produits: null,
                index: $scope.dataInTabPane[tagForm]['data'].length + 1,
                montant: accomapgnement.montant,
                produit_commande: item.id,
                supplement: accomapgnement.supplement
            };
            // var search_prod = $filter('filter')($scope.dataInTabPane[tagForm]['data'], {index : accomapgnement.index});

            // if(!search_prod || search_prod.length <= 0){
            $scope.dataInTabPane[tagForm]['data'].push(new_prod);
            // }
        }
    }

    $scope.trieParOrdreCroissant = function (tableau) {
        if (tableau && tableau.length > 0) {
            for (i = 0; i < tableau.length - 1; i++) {
                for (j = i; j < tableau.length; j++) {
                    var tempon = tableau[i];
                    if (tableau[i].supplement < tableau[j].supplement) {
                        tableau[i] = tableau[j];
                        tableau[j] = tempon;
                    }
                }
            }
        }
        return tableau;
    }

    $scope.valideCommentaire = function (tagForm) {
        // $('#commentaire_produit_commande').val('');
        var item = $scope.produit;
        var index = -1;
        var prod = $filter('filter')($scope.dataInTabPane[tagForm]['data'], { index: item.index });
        index = prod && prod.length > 0 ? $scope.dataInTabPane[tagForm]['data'].indexOf(prod[0]) : index;
        var commentaire_bulles = [];
        if (index > -1) {
            item.commentaire = $('#commentaire_produit_commande').val();
            if ($scope.dataPage['typecommentaires'] && $scope.dataPage['typecommentaires'].length > 0) {
                for (var i = 0; i < $scope.dataPage['typecommentaires'].length; i++) {
                    var commentaire_commandes = $scope.dataPage['typecommentaires'][i]['commentaire_commandes'];
                    if (commentaire_commandes) {

                        for (var j = 0; j < commentaire_commandes.length; j++) {
                            if (commentaire_commandes[j].etat && commentaire_commandes[j].etat == 1) {
                                commentaire_bulles.push(commentaire_commandes[j]);
                            }
                        }
                    }

                }
            }
            item['commentaire_bulles'] = commentaire_bulles;
            $scope.dataInTabPane[tagForm]['data'][index] = item;
            console.log(item);

        }
    }

    $scope.valideAccompagnement = function (item, type, tagForm) {
        let index = -1;
        var produit_supplement = [];
        console
        console.log($scope.dataInTabPane[tagForm]['data'])
        //Ici on va chercher le produit de la commande sur le quel on parametre l accompagenement
        var searchProduit = $filter('filter')($scope.dataInTabPane[tagForm]['data'], { index: item.index })
        index = searchProduit && searchProduit.length == 1 ? $scope.dataInTabPane[tagForm]['data'].indexOf(searchProduit[0]) : index;
        //Des qu on trouve
        var accomapgnement_commande_produits = [];
        if (index > -1) {
            //Ici on recupere les accompagnement du produit de la commande
            accomapgnement_commande_produits = $scope.dataInTabPane['accompagnement_commande']['data'];

            if (accomapgnement_commande_produits && accomapgnement_commande_produits.length) {
                var accompagnement_produit = [];
                accomapgnement_commande_produits
                    .forEach((accomapgnement) => {
                        if (accomapgnement.supplement && accomapgnement.supplement > 0) {
                            let indexfamille_liaison = -1;
                            var famille_accompagnement = $filter('filter')(item.famille_liaison_produits, { famille_id: accomapgnement.famille_id })
                            indexfamille_liaison = famille_accompagnement && famille_accompagnement.length > 0 ? item.famille_liaison_produits.indexOf(famille_accompagnement[0]) : indexfamille_liaison;

                            if ($scope.dataInTabPane[tagForm]['data'] && $scope.dataInTabPane[tagForm]['data'].length > 0) {
                                accompagnement_produit = $filter('filter')($scope.dataInTabPane[tagForm]['data'], {
                                    produit_commande: item.id,
                                    id: accomapgnement.id
                                });
                            }

                            if (accompagnement_produit && accompagnement_produit.length > 0) {
                                console.log('--------Nouveau supplement-----------');
                                console.log(accomapgnement.supplement);

                                console.log('--------Nouveau supplement-----------');
                                if (accomapgnement.supplement > accompagnement_produit[0].supplement) {
                                    $scope.addNewProduitFromAccompagnement(accomapgnement, tagForm, item);
                                } else if (accomapgnement.supplement < accompagnement_produit[0].supplement) {

                                }

                            } else {
                                $scope.addNewProduitFromAccompagnement(accomapgnement, tagForm, item);
                            }

                            if (indexfamille_liaison > -1) {
                                if (!item.famille_liaison_produits[indexfamille_liaison].supplement) {
                                    item.famille_liaison_produits[indexfamille_liaison].supplement = 0
                                }
                                item.famille_liaison_produits[indexfamille_liaison].supplement = item.famille_liaison_produits[indexfamille_liaison].supplement + accomapgnement.supplement;
                            }

                        } else {

                        }
                    });

            }
            //   }

            item.accompagnement_commande = $scope.dataInTabPane[type]['data'];

            $scope.dataInTabPane[tagForm]['data'][index] = item;

            if (produit_supplement && produit_supplement.length > 0) {
                $scope.dataInTabPane[tagForm]['data'] = $scope.dataInTabPane[tagForm]['data'].concat(produit_supplement)
            }
        }

        console.log('----Produit commande-----------');
        console.log($scope.dataInTabPane[tagForm]['data']);

    }
    $scope.valideProduitOptionMenu = function (item) {

        if ($scope.dataPage['option_menus_commande'] && $scope.dataPage['option_menus_commande'].length > 0) {
            var searchOption = $filter('filter')($scope.dataPage['option_menus_commande'], { id: item.option_menu });
            if (searchOption && searchOption.length == 1) {
                let index = $scope.dataPage['option_menus_commande'].indexOf(searchOption[0]);
                if (index > -1) {
                    $scope.dataPage['option_menus_commande'][index]["produit"] = item;
                    $scope.showToast('', 'Ajouté', 'success');
                }

            }
        }
    }
    $scope.actionSurTabPaneTagDataCommande = function (action, tagForm, currentIndex = 0, type = '', item = null, typecommande) {
        if (action == 'add') {

            var findError = false;
            var currentPosition = $scope.dataInTabPane[tagForm]['data'].length;
            var index = currentPosition + 1;
            var searchIndex = $filter('filter')($scope.dataInTabPane[tagForm]['data'], { index: index });

            if (searchIndex && searchIndex.length == 1) {
                index = currentPosition + 1;
                index++;
            }
            item.index = index;

            if (typecommande == 'carte') {

                var direct = 0;
                // if(item.direct && item.direct == true){
                //     direct = 1;
                // }
                if (item.famille && item.famille.direct == 1) {
                    direct = true;
                    item.direct = true;
                }

                item = {
                    index: index,
                    famille_liaison_produits: item.famille_liaison_produits,
                    famille_id: item.famille_id,
                    famille: item.famille,
                    designation: item.designation,
                    montant: item.montant,
                    montant_format: item.montant_format,
                    id: item.id,
                    direct: direct
                }


            } else if (typecommande == 'menu') {
                console.log('--------menu add------------');
                console.log(item);
                item = {
                    index: index,
                    familles: item.familles,
                    produits: item.produits,
                    designation: item.designation,
                    montant: item.montant_menu ? item.montant_menu : item.montant,
                    is_menu: item.is_menu,
                    id: item.id
                }
            }

            $scope.dataInTabPane[tagForm]['data'].push(item);
            console.log($scope.dataInTabPane[tagForm]['data']);
            $scope.showToast('Ajout panier', 'Reussi', 'success');


            if (!findError) {
                $scope.emptyform(tagForm);
            } else {
                $scope.showToast('', message_duplicatevalue, 'error');
            }
        } else if (action == 'delete') {
            if (tagForm == 'r2atechniques_produit') {
                console.log($scope.dataInTabPane[tagForm]['data'][currentIndex].produit_compose_id_pru.pru);

                var prt = $('#prix_de_revient_unitaire_produit_total').text();

                if (!prt) {
                    prt = 0;
                }

                if (prt > 0) {
                    prt = prt - parseFloat($scope.dataInTabPane[tagForm]['data'][currentIndex].produit_compose_id_pru.pru);
                }
                console.log('--------PRT-----');
                console.log(prt);
                $('#prix_de_revient_unitaire_produit_total').text(prt);
                $('#prix_de_revient_unitaire_produit').val(prt).change();

            }
            currentIndex = $scope.dataInTabPane[tagForm]['data'].indexOf(item);
            if (currentIndex > -1) {
                $scope.dataInTabPane[tagForm]['data'].splice(currentIndex, 1);
            }


        }
    };

    $scope.actionSurTabPaneDirectAllNew = function (action, tab, tagForm = null) {
        console.log(tab);
        console.log(tagForm);
        if (!tagForm) {
            tagForm = 'produits_carte';
        }
        if (action == 'add') {

            if (tab && tab.length > 0) {
                tab.forEach(t => {
                    $scope.actionDirect(t, tagForm, 'add', 'tab');
                })
            }

        } else {

            if (tab && tab.length > 0) {
                tab.forEach(t => {
                    console.log('delete item')
                    console.log(t);
                    $scope.actionDirect(t, tagForm, 'delete', 'tab');
                })
            }
        }


    };

    $scope.actionSurTabPaneDirect = function (action, tagForm, currentIndex = 0, type = '', item = null, itemId) {
        console.log(action, tagForm, currentIndex, type, item, itemId)
        console.log($scope.dataInTabPane[tagForm]);
        var search = [];
        var error = '';

        var currentIndex = $scope.dataInTabPane[tagForm]['data'].indexOf(item);

        if (action == 'add') {


            if (tagForm == 'produits_menu') {
                if ($scope.famille_id) {
                    $scope.dataInTabPane[tagForm]['data'].forEach(prod => {
                        if (prod.id == item.id && prod.option_menu == $scope.famille_id) {
                            search.push(prod);
                        }
                    });
                } else {
                    error = 'veuillez choisir une option menu';
                }

            } else {
                search = $filter('filter')($scope.dataInTabPane[tagForm]['data'], { designation: item.designation })
            }
            if (search && search.length > 0) {
                error = tagForm == 'produits_menu' ? 'Ce produit a été dèjà choisi pour cet option menu' : 'Ce produit a été dèjà choisi';
            }

            if (error == '') {
                var produit_tranche_horaire = {
                    designation: item.designation,
                    id: item.id,
                    famille: item.famille,
                    famille_id: item.famille_id

                };
                if (tagForm == 'produits_menu') {
                    produit_tranche_horaire.code = item.id + "" + $scope.famille_id;
                    produit_tranche_horaire.option_menu = $scope.famille_id;
                    produit_tranche_horaire.quantite = 1;
                }
                if (tagForm == 'familles_propositioncommerciale') {
                    search = $filter('filter')($scope.dataInTabPane[tagForm]['data'], { produit_compose_id: item.id, option_menu: $scope.famille_carte_clicked });
                    if (!search || search.length <= 0) {
                        produit_tranche_horaire = {};
                        produit_tranche_horaire['produit_compose_id'] = item.id;
                        produit_tranche_horaire['produit_compose'] = { designation: item.designation };
                        produit_tranche_horaire['produit_compose_text'] = item.designation;
                        produit_tranche_horaire['option_menu'] = $scope.famille_id;
                        produit_tranche_horaire['r2atechniques'] = item.r2atechniques;
                    } else {
                        error = 'Ce produit a été dèjà choisi pour cet option menu';
                    }

                }
                if (error == '') {
                    $scope.dataInTabPane[tagForm]['data'].push(produit_tranche_horaire);
                    $scope.showToast('', 'Ajouté', 'success');
                } else {
                    $scope.showToast('', error, 'error');
                }

            } else {
                $scope.showToast('', error, 'error');
            }

        } else if (action == 'delete') {
            console.log('delete');
            $scope.dataInTabPane[tagForm]['data'].splice(currentIndex, 1);
        }
    };

    $scope.getPropositionProforma = function () {
        if ($scope.dataInTabPane['r2atechniques_proforma']['data'].length > 0) {
            $scope.dataInTabPane['r2atechniques_proforma']['data'].forEach(item => {
                if (item.proposition.etat == true) {
                    var search = $filter('filter')($scope.dataInTabPane['cuisine_stock_proforma']['data'], { produit_compose_id: item.produit_compose_id });
                    if (search && search.length == 1) {

                        let index = $scope.dataInTabPane['cuisine_stock_proforma']['data'].indexOf(search[0]);

                        var proposition = $filter('filter')($scope.dataInTabPane['cuisine_stock_proforma']['data'][index].proposition, { name: item.proposition.name });

                        if (proposition && proposition.length == 1) {
                            console.log('------------------------------Proposition------------------------------');
                            console.log(proposition[0]);
                            let index1 = $scope.dataInTabPane['cuisine_stock_proforma']['data'][index].proposition.indexOf(proposition[0]);

                            /* var quantite = $scope.dataInTabPane['cuisine_stock_proforma']['data'][index].proposition[index1].quantite;

                            $scope.dataInTabPane['cuisine_stock_proforma']['data'][index].quantite =  parseInt($scope.dataInTabPane['cuisine_stock_proforma']['data'][index].quantite) - parseInt(quantite);
 */
                            // $scope.dataInTabPane['cuisine_stock_proforma']['data'][index].quantite =  parseInt($scope.dataInTabPane['cuisine_stock_proforma']['data'][index].quantite) + parseInt(item.quantite);

                            $scope.dataInTabPane['cuisine_stock_proforma']['data'][index].proposition[index1].quantite = item.quantite;

                        } else {
                            $scope.dataInTabPane['cuisine_stock_proforma']['data'][index].quantite = parseInt($scope.dataInTabPane['cuisine_stock_proforma']['data'][index].quantite) + parseInt(item.quantite);
                            item.proposition['quantite'] = item.quantite;
                            $scope.dataInTabPane['cuisine_stock_proforma']['data'][index].proposition.push(item.proposition);
                        }

                    } else {

                        item.proposition['quantite'] = item.quantite;

                        var obj = {
                            produit_compose_id: item.produit_compose_id,
                            produit_compose: item.produit_compose,
                            quantite: item.quantite,
                            unite_de_mesure: item.unite_de_mesure,
                            proposition: [item.proposition]
                        }
                        $scope.dataInTabPane['cuisine_stock_proforma']['data'].push(obj);

                    }
                }
            })
        }
        //$scope.dataInTabPane['cuisine_stock_proforma']['data'] = $scope.dataInTabPane['r2atechniques_proforma']['data'];
        console.log($scope.dataInTabPane['r2atechniques_proforma']['data'])
    }
    $scope.testttt = function () {
        console.log('------------___________------------');
    }


    $scope.initNotif = {
        progressBar: true,
        close: true,
        closeOnClick: true,
        timeout: false,
        title: "",
        message: "",
        position: 'topRight',
        linkUrl: null,
        onClose: function (instance, toast, closedBy) {
            //$scope.openNotif(instance.linkUrl);
        }
    };
    $scope.showToast = function (title, msg, type = "success", withTimeout = 5000, linkUrl = null) {
        console.log('!!!!!!!!!! arrive dans la fonction', type);
        $scope.initNotif.timeout = withTimeout;
        if (!(withTimeout > 0)) {
            $scope.initNotif.progressBar = false;
        }
        $scope.initNotif.title = title;
        $scope.initNotif.message = msg;
        $scope.initNotif.linkUrl = linkUrl;

        if (type.indexOf("success") !== -1) {
            iziToast.success($scope.initNotif);
        } else if (type.indexOf("warning") !== -1) {
            iziToast.warning($scope.initNotif);
        } else if (type.indexOf("error") !== -1) {
            iziToast.error($scope.initNotif);
        } else if (type.indexOf("info") !== -1) {
            iziToast.info($scope.initNotif);
        }

        if (!withTimeout) {
            $scope.playAudio();
        }
    };

    $scope.showToastReclamationCommande = function (title, msg, type = "success", withTimeout = 5000, linkUrl = null) {
        // $scope.initNotif.timeout = withTimeout;
        if (!(withTimeout > 0)) {
            $scope.initNotif.progressBar = false;
        }
        $scope.initNotif.title = title;
        $scope.initNotif.message = msg;
        $scope.initNotif.linkUrl = linkUrl;

        $scope.initNotif.progressBar = false;
        $scope.initNotif.close = false;
        $scope.initNotif.closeOnClick = true;
        //    timeout: false,
        // title: "",
        // message: "",
        // position: 'topRight',
        //  linkUrl: null,

        iziToast.info($scope.initNotif);

        if (!withTimeout) {
            $scope.playAudio();
        }
    };


    $scope.commandeview = null;
    $scope.actionInTabData = function (event, from = 'carte', item, action = 1, parentKey = null) {
        if ($scope.commandeview && !$scope.commandeview.can_updated) {
            iziToast.info({
                message: "Cette vente n'est plus modifiable",
                position: 'topRight'
            });
            return;
        } else {
            var add = true;

            var tagForm = 'details_' + from;

            if (parentKey == null) {
                $.each($scope.dataInTabPane[tagForm]['data'], function (key, value) {
                    if (Number(value.produit_id) === Number(item.produit_id)) {
                        console.log('value', value);
                        if (action == 0) {
                            $scope.dataInTabPane[tagForm]['data'].splice(key, 1);
                        } else {
                            if ($scope.dataInTabPane[tagForm]['data'][key].qte_unitaire !== undefined) {
                                $scope.dataInTabPane[tagForm]['data'][key].qte_unitaire += action;
                                if ($scope.dataInTabPane[tagForm]['data'][key].qte_unitaire === 0) {
                                    $scope.dataInTabPane[tagForm]['data'].splice(key, 1);
                                }
                            }
                        }
                        add = false;
                    }
                    return add;
                });
            } else {
                console.log("current=>", $scope.dataInTabPane[tagForm]['data'][parentKey], '+1=>', $scope.dataInTabPane[tagForm]['data'][parentKey + 1])
                $.each($scope.dataInTabPane[tagForm]['data'][parentKey]['details'], function (key, value) {
                    if (Number(value.produit_id) === Number(item.produit_id)) {
                        console.log('value subdetail', value);
                        if (action == 0) {
                            $scope.dataInTabPane[tagForm]['data'][parentKey]['details'].splice(key, 1);
                        } else {
                            if ($scope.dataInTabPane[tagForm]['data'][parentKey]['details'][key].qte_unitaire !== undefined) {
                                $scope.dataInTabPane[tagForm]['data'][parentKey]['details'][key].qte_unitaire += action;
                                if ($scope.dataInTabPane[tagForm]['data'][parentKey]['details'][key].qte_unitaire === 0) {
                                    $scope.dataInTabPane[tagForm]['data'][parentKey]['details'].splice(key, 1);
                                }
                            }
                        }
                        add = false;
                    }
                    return add;
                });
            }

            if (add) {
                obj = {
                    "id": item.id,
                    "produit_id": item.id,
                    "produit": { nom: item.nom },
                };

                if (from.indexOf('ordreachat') !== -1 || from.indexOf('boncommande') !== -1 || from.indexOf('reception') !== -1 || from.indexOf('assemblage') !== -1) {
                    obj.qte_unitaire = 0;
                    obj.impact_po = false;
                    obj.prix = null;
                    if (from.indexOf('boncommande') !== -1 || from.indexOf('reception') !== -1) {
                        obj.prix = 0;
                    }
                    if (from.indexOf('assemblage') !== -1 && parentKey == null) {
                        obj.details = [];
                    }
                    obj.description = null;
                    if (item.currentPrixAchat) {
                        obj.prix = item.currentPrixAchat;
                    }
                }

                if (parentKey == null) {
                    console.log('from', from, parentKey, 'obj =>', obj);
                    $scope.dataInTabPane[tagForm]['data'].unshift(obj);
                } else {
                    console.log('arrrai', $scope.dataInTabPane[tagForm]['data'][parentKey]);
                    $scope.dataInTabPane[tagForm]['data'][parentKey]['details'].unshift(obj);
                }
            }
        }
        if (from.indexOf('livraison') !== -1) {
            $scope.calculateTotal('bonlivraison');
        } else if (from.indexOf('vente') !== -1) {
            $scope.calculateTotal('vente');
        } else if (from.indexOf('retour') !== -1) {
            $scope.calculateTotal('retour');
        }
    };


    //Fonction pour modification données provenant d'un select2 dynamique
    $scope.editInSelect2 = function (type, id, typeForeign) {
        //  console.log("type", type, "id", id, "typeForeign", typeForeign, '#' + type + '_id_' + typeForeign);
        var prefixe = type;
        if (type == 'souszone') {
            prefixe = 'sous_zone';
        }
        var req = type + "s";
        rewriteReq = req + "(id:" + id + ")";
        Init.getElement(rewriteReq, listofrequests_assoc[req]).then(function (data) {
            if (data) {
                $scope.dataPage[req] = data;
                setTimeout(function () {
                    $('#' + prefixe + '_id_' + typeForeign).val(id).trigger('change');
                }, 1000);
            }

        }, function (msg) {
            toastr.error(msg);
        });
    };

    //Fonction pour modification données provenant d'un select2 dynamique
    $scope.editInSelect2Costum = function (type, id, typeForeign) {
        // console.log("type", type, "id", id, "typeForeign", typeForeign, '#' + type + '_id_' + typeForeign);
        var req = type + "s";
        rewriteReq = req + "(id:" + id + ")";
        Init.getElement(rewriteReq, listofrequests_assoc[req]).then(function (data) {
            if (data) {
                $scope.dataPage[req] = data;
                setTimeout(function () {
                    $('#' + type + '_' + typeForeign).val(id).trigger('change');
                }, 1000);
            }

        }, function (msg) {
            toastr.error(msg);
        });
    };


    /*** FONCTIONS PERSONNALISEES POUR LE FONCTIONNEMENT ***/

    //---DEBUT => Tester si la valeur est un entier ou pas---//
    $scope.estEntier = function (val, superieur = true, peutEtreEgaleAzero = false) {
        //tags: isInt, tester entier
        var retour = false;
        if (val == undefined || val == null) {
            retour = false;
        } else if (val === '') {
            retour = false;
        } else if (isNaN(val) == true) {
            retour = false;
        } else if (parseInt(val) != parseFloat(val)) {
            retour = false;
        } else {
            if (superieur == false) {
                //entier inférieur
                if (parseInt(val) <= 0 && peutEtreEgaleAzero == true) {
                    //]-inf; 0]
                    retour = true;
                } else if (parseInt(val) < 0 && peutEtreEgaleAzero == false) {
                    //]-inf; 0[
                    retour = true;
                } else {
                    retour = false;
                }
            } else {
                //entier supérieur
                if (parseInt(val) >= 0 && peutEtreEgaleAzero == true) {
                    //[0; +inf[
                    retour = true;
                } else if (parseInt(val) > 0 && peutEtreEgaleAzero == false) {
                    //]0; +inf[
                    retour = true;
                } else {
                    retour = false;
                }
            }
        }
        return retour;
    };
    //---FIN => Tester si la valeur est un entier ou pas---//


    //---DEBUT => Tester si la valeur est un réel ou pas---//
    $scope.estFloat = function (val, superieur = true, peutEtreEgaleAzero = false) {
        //tags: isFloat, tester réel
        var retour = false;
        if (val == undefined || val == null) {
            retour = false;
        } else if (val === '') {
            retour = false;
        } else if (isNaN(val) == true) {
            retour = false;
        } else {
            if (superieur == false) {
                //entier inférieur
                if (parseFloat(val) <= 0 && peutEtreEgaleAzero == true) {
                    //]-inf; 0]
                    retour = true;
                } else if (parseFloat(val) < 0 && peutEtreEgaleAzero == false) {
                    //]-inf; 0[
                    retour = true;
                } else {
                    retour = false;
                }
            } else {
                //entier supérieur
                if (parseFloat(val) >= 0 && peutEtreEgaleAzero == true) {
                    //[0; +inf[
                    retour = true;
                } else if (parseFloat(val) > 0 && peutEtreEgaleAzero == false) {
                    //]0; +inf[
                    retour = true;
                } else {
                    retour = false;
                }
            }
        }
        return retour;
    };
    //---FIN => Tester si la valeur est un réel ou pas---//

    //Avoir une valeur aleatoire
    $scope.getRandomValue = function () {
        return Math.floor((Math.random() * 6) + 1);
    }

    //Pour les boutons hamburger car si on avait 2 tableaux ca posait problème
    $scope.getIdForButtonBurger = function (type, index) {
        var retour = type + '' + index;
        return retour;
    }

    // Permet de synchroniser les données de NML pour le stock liquide
    $scope.synchroniser = function (e, type = null) {
        e.preventDefault();
        console.log("synchroniser");

        //Classe tout en haut, général pour toutes les pages
        var classe_generale = $('.classe_generale');
        classe_generale.parent().blockUI_start()
        console.log("Synchronisation en cours, veuillez patienter SVP !!!");
        iziToast.info({
            title: "",
            message: "Synchronisation en cours, veuillez patienter SVP !!!",
            position: 'topRight'
        });
        classe_generale.parent().blockUI_start();
        $http({
            url: BASE_URL + "produitnml",
            method: "POST",
            data: { "type": type }
        }).then(function successCallback(data) {
            //classe_generale.parent().blockUI_stop();
            // this callback will be called asynchronously
            // when the response is available
            console.log("dataToSee", data.data, data.data.error);
            if (data.data != null && !data.data.error) {
                console.log("Synchronisation terminée");
                classe_generale.parent().blockUI_stop();
                iziToast.success({
                    title: "",
                    message: "Synchronisation terminée",
                    position: 'topRight'
                });

            } else if (data.data.error) {
                console.log("Synchronisation errors");
                classe_generale.parent().blockUI_stop();
                //moimeme-Ajouté récemment
                iziToast.error({
                    title: "",
                    message: '<span class="h4">' + data.data.error + '</span>',
                    position: 'topRight'
                });
            } else {
                console.log("Synchronisation errors");
                classe_generale.parent().blockUI_stop();
                //moimeme-Ajouté récemment
                iziToast.error({
                    title: "",
                    message: "Une erreur s'est produite, réessayez plus tard !!!",
                    position: 'topRight'
                });
            }
            //Rafraichir la page
            $scope.pageChanged(type);
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            $scope.error = response.statusText;
            iziToast.error({
                title: "",
                message: '<span class="h4">Une erreur est survenue depuis le serveur réessayez plus tard</span>',
                position: 'topRight'
            });
        });
    };


    //Charger les donnes par rapport à une action
    $scope.urlCourantContient = function (aRechercher) {
        console.log("urlCourantContient");
        var url = window.location.href;
        var retour = false;
        if (url.indexOf(aRechercher) !== -1) {
            retour = true;
        }

        return retour;
    };

    //viderDonnes
    $scope.viderDonnees = function (type) {
        console.log('viderDonnees');
        if (type == "preselection_aleatoire") {
            if ($("#search_preselection_aleatoire_facture").prop('checked') === false) {
                $("#search_montant_preselection_aleatoire_facture").val("");
            }
        }
    };

    //Charger les donnes par rapport à une action
    $scope.chargerDonnees = function (type, typeCourant = "statimport", value = null, other = null) {
        console.log("chargerDonnees");
        if (type) {
            if (typeCourant == "dashboard") {
                if (type == 'dashboard') {
                    //pour les filtres
                    var entreprise_id = $("#entreprise_" + typeCourant).val();
                    var baseFiltres = ''
                        + ($scope.estEntier(entreprise_id) == true ? (',entreprise_id:' + entreprise_id + '') : "")
                        ;

                    console.log('chargerDonnees, baseFiltres ==>', baseFiltres);

                    var typeAvecS  = typeCourant + 's';
                    var filtres    = baseFiltres;
                    var rewriteReq = typeAvecS;
                    if (filtres) {
                        rewriteReq = typeAvecS + '(' + filtres + ')';
                    }
                    Init.getElement(rewriteReq,listofrequests_assoc[typeAvecS]).then(function (data) {
                        if (data && data[0]) {
                            $scope.dataPage[typeAvecS] = data[0];
                        }
                    }, function (msg) {
                        toastr.error(msg);
                    });
                }
            }
            else if(typeCourant == "dashboardcodifrelec")
            {
                if (typeCourant == "dashboardcodifrelec") 
                {
                    if (type == 'dashboard') {
                        //pour les filtres
                        var date_debut    = $("#date_debut").val();
                        var date_fin      = $("#date_fin").val();
                        
                        var etude_id      = $("#etude_id_dashboard").val();
                        var relecteur_id  = $("#codId_dashboard").val();
                        
                        var baseFiltres = ''+ ($scope.estEntier(etude_id)     == true ?(',etude_id:'     + etude_id + '') : "")
                                            + ($scope.estEntier(relecteur_id) == true ?(',relecteur_id:' + relecteur_id + '') : "")
                                            + (date_debut ? (',date_debut:' +'"'+date_debut+'"' + '') : "")
                                            + (date_fin   ? (',date_fin:'   +'"'+date_fin+'"'   + '') : "");

                        console.log('ChargerDonnees, baseFiltres ==>', baseFiltres);
                        console.log("Filtre date ==>", typeof date_debut, date_fin); 

                        var typeAvecS  = typeCourant + 's';
                        var filtres    = baseFiltres  ; 
                        var rewriteReq = typeAvecS ;

                        if(filtres)
                        {
                            rewriteReq = typeAvecS + '(' + filtres + ')';
                        }
                        Init.getElement(rewriteReq, listofrequests_assoc[typeAvecS]).then(function (data) {
                            if (data && data[0]) {
                                for (let [key, value] of Object.entries(data[0])) {
                                    data[0][key] = JSON.parse(value);
                                }
                                $scope.dataPage[typeAvecS] = data[0];   
                                console.log( $scope.dataPage[typeAvecS]); 
                            }
                        }, function (msg) {
                            toastr.error(msg);
                        });
                    }
                }
            }
            else if (typeCourant == "planning") {
                    //var entreprise_id = $("#entreprise_" + typeCourant).val();
        
                    // Pour la vu semaine 
                    var etude_id_week     = $("#etude_id_week_planning").val();
                    var relecteur_id_week = $("#codId_week_planning").val(); 
                    var etude_id          = $("#etude_id_planning").val();
                    var relecteur_id      = $("#codId_planning").val();

                    if((etude_id_week != "" ) || (relecteur_id_week != "" ))
                    {
                        etude_id     = etude_id_week;
                        relecteur_id = relecteur_id_week;
                    }
                  
                    console.log("Planning ici", etude_id_week,etude_id, relecteur_id_week, $scope.current_month); 
                    let month = parseInt($scope.current_month)+1;
                     

                    // var baseFiltres = 'month:' + month +',year:' + $scope.current_year + '' ;
                    console.log("START WEEK", typeof $scope.start_week, $scope.start_week,  $scope.est_active_week ); 
                    // month  = $scope.getMonthWithSemaineNumberYear( $scope.current_year ,$scope.current_week);

                    var baseFiltres = ''+ ($scope.estEntier(etude_id) == true ?(',etude_id:' + etude_id + '') : "")
                                        + ($scope.estEntier(relecteur_id) == true ?(',relecteur_id:' + relecteur_id + '') : "")
                                        + (month ? (',month:' +month+  '') : "")
                                        + ($scope.current_year? (', year:' +$scope.current_year + '') : "")
                                        + ($scope.current_week? (', current_week:' + $scope.current_week + '') : "")
                                        + ($scope.est_active_week? (', week:' + $scope.est_active_week + '') : ""); 

                    console.log("baseFiltres xxx", baseFiltres); 
                   
                    var typeAvecS  = typeCourant + 's';
                    var filtres    = baseFiltres;
                    var rewriteReq = typeAvecS;
                    if (filtres) {
                        rewriteReq = typeAvecS + '(' + filtres + ')';
                    }
                    Init.getElement(rewriteReq,listofrequests_assoc[typeAvecS]).then(function (data) {
                        if (data && data[0]) {
                            
                            for (let [key, value] of Object.entries(data[0])) 
                            {
                                data[0][key] = JSON.parse(value);
                            }
                            $scope.dataPage[typeAvecS] = data[0];
                            console.log("planning", data[0].all);
                            console.log("planning", data[0].week);
                        }
                    }, function (msg) {
                        toastr.error(msg);
                    });
            }
        }
    };
    $scope.change_month = function (value){
        if(value == -1 && $scope.current_month == 0){
            $scope.current_month = 11;
            $scope.current_year -= 1;
        }else if(value == +1 && $scope.current_month == 11){
            $scope.current_month = 0;
            $scope.current_year += 1;
        }else{
            $scope.current_month += value
        }

        $scope.chargerDonnees('planning', 'planning', 0);
        console.log($scope.current_month, $scope.current_year );
    }

    $scope.change_week = function (value)
    {
        console.log("change_week", value); 
        if(value == -1 && $scope.current_month == 0){
            $scope.current_month = 11;
            $scope.current_year -= 1;
            $scope.current_week -= 1;
        }else if(value == +1 && $scope.current_month == 11){
            $scope.current_month = 0;
            $scope.current_year += 1;
            $scope.current_week += 1;
        }else{
            // $scope.current_month += value
            $scope.current_week  += value
            $valeur = $scope.datesSemaine( $scope.current_week, $scope.current_year); 
            $scope.start_week_print = $valeur[0];
            $scope.end_week_print   = $valeur[1];
            console.log("Value===>", $valeur); 
            
            let nombre = $scope.getMonthWithSemaineNumberYear(  $scope.current_year ,$scope.current_week)
            console.log("change month", $scope.current_week, $scope.current_month, nombre); 
            
        }
        console.log($scope.current_week, $scope.current_year,$valeur)
        $scope.chargerDonnees('planning', 'planning', 0);
    }

    $scope.getMonthWithSemaineNumberYear = function(year, week)
    {
        var date = new Date(year, 0, 1);
        var day  = date.getDay() || 7;
        date.setDate(1 + ((week - 1) * 7) - (day - 1));
        var month = date.getMonth() + 1;
        return month < 10 ? '0' + month : month;
    }

    $scope.reset_chargerDonnees = function(type, typecourant) {
        $("#date_debut").val("");
        $("#date_fin").val("");
        
        $("#etude_id_dashboard").val("").trigger("change");
        $("#codId_dashboard").val("").trigger("change");

        $("#etude_id_planning").val("").trigger("change");
        $("#codId_planning").val("").trigger("change");

        $("#etude_id_week_planning").val("").trigger("change");
        $("#codId_week_planning").val("").trigger("change");
                    
        $scope.chargerDonnees(type, typecourant); 

    }

    //Pour le suivi banque
    $scope.elementsSuiviBanque = function (typeCourant = "paiement", mode_paiement_id = null) {
        console.log("elementsSuiviBanque");
        if (mode_paiement_id) {
            var type = "modepaiement"
            var typeAvecS = type + 's';
            var rewriteReq = typeAvecS + '(id:' + mode_paiement_id + ')';
            //var form = $('#form_add' + typeCourant);
            //form.parent().parent().blockUI_start();
            Init.getElement(rewriteReq, listofrequests_assoc[typeAvecS]).then(function (data) {
                //form.parent().parent().blockUI_stop();
                if (data && data[0]) {
                    $scope.pour_banque = data[0].pour_banque;
                    $scope.pour_bon_cadeau = data[0].pour_bon_cadeau;
                    $scope.reInit("paiement");
                    $scope.reInit("paiementfacture");
                }
            }, function (msg) {
                toastr.error(msg);
            });
        }
    }

    //Récupérer un élement et faire des actions
    $scope.getItemWithGraphQl = function (type, filtres = null) {
        var elementsFiltres = "";
        if (filtres) {
            elementsFiltres = '(' + filtres + ')';
        }
        var typeAvecS = type + 's';
        var rewriteReq = typeAvecS + elementsFiltres;
        Init.getElement(rewriteReq, listofrequests_assoc[typeAvecS]).then(function (data) {
            if (data) {
                if (type == 'depense') {
                    $scope.dataInTabPane['depense_reglement']['data'] = data[0];
                }
                else if (type == 'bce') {
                    $scope.dataInTabPane['bce_paiementbc']['data'] = data[0];
                }
                else {
                    $scope.dataPage[typeAvecS] = data;
                }
            }
        }, function (msg) {
            toastr.error(msg);
        });
    };

    $scope.donneCaissesPouvantVersementsBanques = function () {
        var typeAvecS = 'caisses';
        var rewriteReq = typeAvecS + '(peut_versement_banque:1)'
        Init.getElement(rewriteReq, listofrequests_assoc[typeAvecS]).then(function (data) {
            if (data) {
                $scope.dataPage['caisses'] = data;
            }
        }, function (msg) {
            toastr.error(msg);
        });
    };


    $scope.donneCaissesUser = function () {
        var typeAvecS = 'caisses';
        var rewriteReq = typeAvecS + '(propres_caisses:1)'
        Init.getElement(rewriteReq, listofrequests_assoc[typeAvecS]).then(function (data) {
            if (data) {
                $scope.dataPage['caisses'] = data;
            }
        }, function (msg) {
            toastr.error(msg);
        });
    };

    $scope.donneCaissesParents = function () {
        var typeAvecS = 'caisses';
        var rewriteReq = typeAvecS
        Init.getElement(rewriteReq, listofrequests_assoc[typeAvecS]).then(function (data) {
            if (data) {
                $scope.dataPage['caisseparents'] = data;
            }
        }, function (msg) {
            toastr.error(msg);
        });
    };

    $scope.donneMontantClotureParEntite = function (type = "cloturecaisse") {
        console.log("donneMontantClotureParEntite ");
        var typeAvecS = 'entites';
        var date_start = $("#date_debut_" + type).val();
        var date_end = $("#date_fin_" + type).val();
        if (date_start && date_end) {
            var rewriteReq = typeAvecS + '(montants_clotures_journaliers:1,date_start:"' + date_start + '",date_end:"' + date_end + '")'
            Init.getElement(rewriteReq, listofrequests_assoc[typeAvecS]).then(function (data) {
                if (data) {
                    console.log("data donneMontantClotureParEntite", data);
                    var tagForm = "entites_cloturecaisse";
                    $scope.dataInTabPane[tagForm]['data'] = data;
                }
            }, function (msg) {
                toastr.error(msg);
            });
        }

    };

    $scope.mettreDonneesInputs = function (tagForm, type, valeur, index, indexParent = 0, indexParentParent = 0) {
        console.log("indexParentParent", indexParentParent, "indexParent", indexParent, "index", index);
        //valeur = valeur.id;
        if (type == 'brigade') {
            var typeAvecS = "brigades";
            var rewriteReq = typeAvecS + '(id:' + valeur + ')'
            Init.getElement(rewriteReq, listofrequests_assoc[typeAvecS]).then(function (data) {
                if (data && data[0]) {
                    $scope.dataInTabPane[tagForm]['data'][indexParentParent].employes[indexParent].jours[index].brigade_id = valeur;
                    $scope.dataInTabPane[tagForm]['data'][indexParentParent].employes[indexParent].jours[index].brigade = data[0];
                    if (index == 0) {
                        //C'est le lundi ==> on sélectionne la meme brigade pour les autres
                        $.each($scope.dataInTabPane[tagForm]['data'][indexParentParent].employes[indexParent].jours, function (keyItem, oneItem) {
                            console.log("Brigade / Lundi", keyItem);
                            $scope.dataInTabPane[tagForm]['data'][indexParentParent].employes[indexParent].jours[keyItem].brigade_id = valeur;
                        });
                    }
                    console.log("mettreDonneesInputs ==> DONNEES ==> " + JSON.stringify($scope.dataInTabPane[tagForm]['data']));
                }
            }, function (msg) {
                toastr.error(msg);
            });
        }
        else if (type == 'tranche_horaire') {
            var typeAvecS = "tranchehoraires";
            var rewriteReq = typeAvecS + '(id:' + valeur + ')'
            Init.getElement(rewriteReq, listofrequests_assoc[typeAvecS]).then(function (data) {
                if (data && data[0]) {
                    $scope.dataInTabPane[tagForm]['data'][indexParentParent].employes[indexParent].jours[index].tranche_horaire_id = valeur;
                    $scope.dataInTabPane[tagForm]['data'][indexParentParent].employes[indexParent].jours[index].tranche_horaire = data[0];
                    if (index == 0) {
                        //C'est le lundi ==> on sélectionne la meme tranche horaire pour les autres
                        $.each($scope.dataInTabPane[tagForm]['data'][indexParentParent].employes[indexParent].jours, function (keyItem, oneItem) {
                            console.log("Tranche horaire / Lundi", keyItem);
                            $scope.dataInTabPane[tagForm]['data'][indexParentParent].employes[indexParent].jours[keyItem].tranche_horaire_id = valeur;
                        });
                    }
                    $scope.calculerDureeTotaleEmploye(tagForm, indexParent, indexParentParent);
                    console.log("mettreDonneesInputs ==> DONNEES ==> " + JSON.stringify($scope.dataInTabPane[tagForm]['data']));
                }
            }, function (msg) {
                toastr.error(msg);
            });
        }
        if (type == 'pr_be' || type == 'pr_off_be') {
            $.each($scope.dataInTabPane[tagForm]['data'], function (keyItem, oneItem) {
                var prixAchat = 0;
                if (type == 'pr_be') {
                    prixAchat = $scope.dataInTabPane[tagForm]['data'][keyItem].prix_achat;
                }
                else if (type == 'pr_off_be') {
                    prixAchat = $scope.dataInTabPane[tagForm]['data'][keyItem].prix_achat_off;
                }

                if (!prixAchat) {
                    prixAchat = 0;
                }

                if (type == 'pr_be') {
                    $scope.dataInTabPane[tagForm]['data'][keyItem].pr = prixAchat * valeur;
                }
                else if (type == 'pr_off_be') {
                    $scope.dataInTabPane[tagForm]['data'][keyItem].pr_off = prixAchat * valeur;
                }
            });
        }
    };

    $scope.calculerDureeTotaleEmploye = function (tagForm, index, indexParent) {
        var duree = 0;
        $.each($scope.dataInTabPane[tagForm]['data'][indexParent].employes[index].jours, function (keyItem, oneItem) {
            if (oneItem.tranche_horaire_id && oneItem.tranche_horaire) {
                if (oneItem.tranche_horaire.duree) {
                    duree = parseFloat(duree) + parseFloat(oneItem.tranche_horaire.duree);
                }
            }
        });
        $scope.dataInTabPane[tagForm]['data'][indexParent].employes[index].duree = duree;
        return duree;
    };

    $scope.supprimerDepartementPlanning = function (tagForm, index) {
        console.log('supprimerDepartementPlanning');
        $scope.dataInTabPane[tagForm]['data'].splice(index, 1);
    };

    $scope.chargeLogistiqueFrequenceForte = function (type, tagForm) {

        var typeAvecS = type + 's';
        rewriteReq = typeAvecS + "(frequence_traiteur:1)";

        Init.getElement(rewriteReq, listofrequests_assoc[typeAvecS]).then(function (data) {
            console.log(data);
            if ($scope.dataInTabPane[tagForm]['data'] && $scope.dataInTabPane[tagForm]['data'].length == 0)
                if (data && data.length > 0) {
                    data.forEach(item => {
                        var log = null;
                        var searchProd = $filter('filter')($scope.dataInTabPane[tagForm]['data'], { produit_compose_id: item.id });
                        if (!searchProd || searchProd.length <= 0) {
                            log = {
                                produit_compose: { designation: item.logistique_text },
                                produit_compose_id: item.id,
                                produit_compose_text: item.logistique_text,
                                quantite: item.quantite_traiteur
                            }
                        }
                        $scope.dataInTabPane[tagForm]['data'].push(log);
                    })
                }
            //$scope.dataInTabPane[tagForm]['data'] = data;
        }, function (msg) {
            console.log(msg)
        });
    }

    //Donne la date début ou la date fin pour une tranche horaire donnée
    $scope.donneDateParTrancheHoraire = function (itemId, type = 'cloturecaisse', typeDate = 'date_debut') {
        var dateToday = new Date().toJSON().slice(0, 10).replace(/-/g, '-');
        var dateRetour = new Date().toJSON().slice(0, 10).replace(/-/g, '-');
        if ($scope.update == true) {
            //Mis ici car la modification initialisait la date de debut et de fin de la cloture caisse à la data du jour meme si c'est une cloture passée
            var dateDebutCloture = $("#date_debut_" + type).val();
            dateToday = dateDebutCloture.substring(0, 10);
            dateRetour = dateDebutCloture.substring(0, 10);
        }
        //Utilisation du parcours car la requete avec Init.getelement ne permettait pas d'affecter la date et l'heure
        $.each($scope.dataPage['tranchehoraires'], function (keyItem, oneItem) {
            if (oneItem.id == itemId) {
                if (typeDate == "date_debut" || typeDate == "date_debut_fin") {
                    dateRetour = dateToday + "T" + oneItem.heure_debut_fr;
                    $("#date_debut_" + type).val(dateRetour);
                    retour = true;
                    return retour;
                } else if (typeDate == "date_fin" || typeDate == "date_debut_fin") {
                    dateRetour = dateToday + "T" + oneItem.heure_fin_fr;
                    $("#date_fin_" + type).val(dateRetour);
                    retour = true;
                    return retour;
                }
            }
        });
        //Pour requeter au changement de la date début
        $scope.chargerDonnees('commande', 'cloturecaisse');
        $scope.chargerDonnees('depense', 'cloturecaisse');
        console.log("donneDateParTrancheHoraire", dateRetour, itemId);
    };

    //Donne le tableau sur les tableaux de cloture caisse
    $scope.donneTotauxClotureCaisse = function (tagForm) {
        console.log("donneTotauxClotureCaisse");
        if (tagForm == 'encaissements_cloturecaisse') {
            $scope.dataInTabPane['totaux_cloturecaisse']['data'].total_encaissement = 0;
        }
        if (tagForm == 'typebillets_cloturecaisse') {
            $scope.dataInTabPane['totaux_cloturecaisse']['data'].total_billetage = 0;
        }
        $.each($scope.dataInTabPane[tagForm]['data'], function (keyItem, oneItem) {
            if (tagForm == 'encaissements_cloturecaisse') {
                $scope.dataInTabPane['totaux_cloturecaisse']['data'].total_encaissement += parseFloat(oneItem.montant);
            }
            if (tagForm == 'typebillets_cloturecaisse') {
                $scope.dataInTabPane['totaux_cloturecaisse']['data'].total_billetage += (oneItem.nombre * oneItem.typebillet.nombre);
            }
        });
    };

    $scope.donneTotauxDepense = function (tagForm) {
        console.log("donneTotauxDepense");
        if (tagForm == 'postedepenses_depense') {
            $scope.dataInTabPane['totaux_depense']['data'].total_depense = 0;
        }
        $.each($scope.dataInTabPane[tagForm]['data'], function (keyItem, oneItem) {
            if (tagForm == 'postedepenses_depense') {
                $scope.dataInTabPane['totaux_depense']['data'].total_depense += parseFloat(oneItem.montant_ttc);
            }
        });
    };

    $scope.donneTotauxFacture = function (tagForm, type = 1) {
        console.log("donneTotauxFacture");
        var totalTtc = 0;
        var totalHt = 0;
        var totalTva = 0;
        var tva = 18;

        if (tagForm == 'items_facture') {
            $scope.dataInTabPane['totaux_facture']['data'].total = 0;
        }
        $.each($scope.dataInTabPane[tagForm]['data'], function (keyItem, oneItem) {
            if (tagForm == 'items_facture') {
                if (type == 2) {
                    totalTtc += parseFloat(oneItem.forfait);
                }
                else {
                    totalTtc += parseFloat(oneItem.montant_total_commande);
                }
            }
        });

        var diviseur = 1 + parseFloat(tva / 100);
        if (diviseur > 0) {
            totalHt = totalTtc / diviseur;
        }

        if (($('#sans_tva_facture').prop('checked') === true && type == 1) || ($('#sans_tva_facturetraiteur').prop('checked') === true && type == 2)) {
            //Exonoré de TVA
            totalTtc = totalHt;
        }

        totalTva = totalTtc - totalHt;

        $scope.dataInTabPane['totaux_facture']['data'].total = totalTtc;
        $scope.dataInTabPane['totaux_facture']['data'].totalHt = totalHt;
        $scope.dataInTabPane['totaux_facture']['data'].totalTva = totalTva;
    };

    //Donne le mode de paiement cash
    $scope.donneModePaiementCash = function () {
        var retour = null;
        console.log("donneModePaiementCash");
        $.each($scope.dataPage['modepaiements'], function (keyItem, oneItem) {
            if (oneItem.est_cash == 1) {
                retour = oneItem;
            }
        });
        return retour;
    };

    //Changer le montant de l'encaissement cash sur le billetage
    $scope.changeEncaissementSurBilletage = function (action = 'add', tagFormEncaissement, objBillet) {
        console.log("changeEncaissementSurBilletage");
        var modeCashExiste = false;
        $.each($scope.dataInTabPane[tagFormEncaissement]['data'], function (keyItem, oneItem) {
            if (oneItem.mode_paiement.est_cash == 1) {
                if (action == 'add') {
                    $scope.dataInTabPane[tagFormEncaissement]['data'][keyItem].montant += parseFloat(objBillet.total);
                } else if (action == 'delete') {
                    $scope.dataInTabPane[tagFormEncaissement]['data'][keyItem].montant -= parseFloat(objBillet.total);
                    if ($scope.dataInTabPane[tagFormEncaissement]['data'][keyItem].montant <= 0) {
                        //Supprimer si l'encaissement cash revient à 0
                        $scope.dataInTabPane[tagFormEncaissement]['data'].splice(keyItem, 1);
                    }
                }
                modeCashExiste = true;
                return modeCashExiste;
            }
        });
        if (modeCashExiste == false && action == 'add') {
            //Créer le mode de paiement dans le tableau
            $scope.actionSurTableauClotureCaisse('add', tagFormEncaissement, 0, 0, objBillet);
        }

    };

    //Donnes les infos de la clôture hebdomadaire
    $scope.donneClotureHebdomadaire = function () {
        etat_cloture_hebdomadaire = $("#hebdomadaire_cloturecaisse").prop('checked');
        console.log("donneClotureHebdomadaire", etat_cloture_hebdomadaire);
        if (etat_cloture_hebdomadaire == true) {

        } else {

        }
        $scope.updateCheck('hebdomadaire_cloturecaisse', 'show-hebdomdaire', 'checkbox', 0, 'hide-hebdomdaire');
    };

    //Donnes les infos de la clôture hebdomadaire
    $scope.donnePreselectionAleatoire = function () {
        $scope.viderDonnees('preselection_aleatoire')
        $scope.updateCheck('search_preselection_aleatoire_facture', 'show-preselection-aleatoire', 'checkbox', 0, 'hide-preselection-aleatoire');
    };

    $scope.actionSurCodification = function (action, selectedItem = null) {
        if (action == 'add') {
            //Ajouter un élément dans le tableau
            var metier_id_codification = $("#metier_id_codification").val();

            if ($scope.estEntier(metier_id_codification) == false) {
                iziToast.error({
                    message: "Veuillez sélectionner un métier",
                    position: 'topRight'
                });
                return false;
            }
            if ($scope.testSiUnElementEstDansTableau('metier', $scope.produitsInTable, metier_id_codification) == true) {
                iziToast.error({
                    message: "Le métier est déja dans le tableau",
                    position: 'topRight'
                });
                return false;
            }

            typeAvecS = "metiers";
            rewriteReq = typeAvecS + "(id:" + metier_id_codification + ")";
            var form = $('#form_addcodification');
            form.parent().parent().blockUI_start();
            Init.getElement(rewriteReq, listofrequests_assoc[typeAvecS]).then(function (data) {
                form.parent().parent().blockUI_stop();
                if (data && data[0]) {
                    //plan_code
                    $scope.produitsInTable.unshift({
                        "metier_id": metier_id_codification,
                        "id": data[0].id,
                        "code_rome": data[0].code_rome,
                        "designation": data[0].designation,
                    });
                }
                else {
                    iziToast.error({
                        message: "Une erreur est survenue lors de la récupération des données, réessayez plus tard",
                        position: 'topRight'
                    });
                    return false;
                }

                //Vider les données
                $("#metier_id_codification").val("").trigger("change");

            }, function (msg) {
                iziToast.error({
                    message: msg,
                    position: 'topRight'
                });
            });
        }
        else if (action == 'delete') {
            //Supprimer un élément du tableau
            $.each($scope.produitsInTable, function (keyItem, oneItem) {
                if (oneItem.id == selectedItem.id) {
                    $scope.produitsInTable.splice(keyItem, 1);
                    return false;
                }
            });
        }
        else {
            //Vider le tableau
            $scope.produitsInTable = [];
        }
    };
    $scope.actionSurEtudeContenu = function (action, key = null) {
        console.log(key)
        if (action == 'add') {
            $scope.contenus_r2a.push(
                { 
                    theme: "", 
                    questions : [],
                    shortcuts : []
                }
            );            
        }else if (action == 'remove') 
        {
            if($scope.contenus_r2a.length <=1){
                alert('Veillez mettre au moins un contenu');
                return 
            }
            //Supprimer un élément du tableau
            if($scope.contenus_r2a[key]){
                $scope.contenus_r2a.splice(key, 1);
            }
        }
        $scope.reInitSelect2()
    };
    $scope.actionSurEtudeCondition = function (action, key = null) {
        console.log(key)
        if (action == 'add') {
            $scope.conditions_r2a.push(
                { question: "", operateur : '', valeur : ''}
            );
        }else if (action == 'remove') 
        {
            if($scope.conditions_r2a.length <=1){
                alert('Veillez mettre au moins une condition');
                return 
            }
            //Supprimer un élément du tableau
            if($scope.conditions_r2a[key]){
                $scope.conditions_r2a.splice(key, 1);
            }
        }
        $scope.reInitSelect2()
    };
    $scope.actionSurEtudeEntete = function (action, key = null) {
        
        if (action == 'add') {
            $scope.entetes_r2a.push({ 
                titre: "", 
                question : ''
            });
        }else if (action == 'remove') 
        {
            if($scope.entetes_r2a.length <=1){
                alert('Veillez mettre au moins un entête');
                return 
            }
            //Supprimer un élément du tableau
            if($scope.entetes_r2a[key]){
                $scope.entetes_r2a.splice(key, 1);
            }
        }
        $scope.reInitSelect2()
    };

    $scope.actionSurCodificationQuestionAide = function (action, selectedItem = null, type="codification") 
    {
        console.log("actionSurCodificationQuestionAide");
        if (action == 'add') {
            //Ajouter un élément dans le tableau
            var question_aide     = $("#qf_"+type).val();
            var question_codifier = $("#qo_"+type).val();
          
            // if(question_aide == '')
            // {
            //     iziToast.error({
            //         message: "Veuillez entrer la question à codifier",
            //         position: 'topRight'
            //     });
            //     return false;
            // }
            if(question_codifier == '')
            {
                iziToast.error({
                    message: "Veuillez renseigner le thème de la codification !!",
                    position: 'topRight'
                });
                return false;
            }
            if ($scope.testSiUnElementEstDansTableau('question_codification', $scope.questionInTable, null, question_codifier, question_aide) == true) {
                iziToast.error({
                    message: "La question" + question_codifier + "et la question aide "+ +" "+question_aide + "sont déja présent dans le tableau",
                    position: 'topRight'
                });
                return false;
            }

            $scope.questionInTable.unshift({
                "question_codif" : question_codifier.join(',') ,
            });
            console.log( $scope.questionInTable);
            //Vider les données
            
            $("#qf_"+type).val("").trigger("change");
            $("#qo_"+type).val("").trigger("change");
        }
        else if (action == 'delete') 
        {
            //Supprimer un élément du tableau
            $.each($scope.questionInTable, function (keyItem, oneItem) {
                if (oneItem.question_aide == selectedItem.question_aide) {
                    $scope.questionInTable.splice(keyItem, 1);
                    return false;
                }
            });
        }
        else if( action == 'update')
        {           
            // $("#qf_"+type).val(selectedItem.question_aide).trigger("change");
            tab_question_siret = selectedItem.question_codif.split(','); 
            $("#qo_"+type).val(tab_question_siret).trigger("change");
           
            $.each($scope.questionInTable, function (keyItem, oneItem)
            {
                if (oneItem.question_aide == selectedItem.question_aide) 
                {
                    $scope.questionInTable.splice(keyItem, 1);
                    return false;
                }
            });
           
        }
        else {
            //Vider le tableau
            $scope.questionInTable = [];
        }
    };

    

    $scope.actionSurPlanCode = function (action, selectedItem = null) 
    {
        console.log("actionSurPlanCode");
        if (action == 'add') {
            //Ajouter un élément dans le tableau
            var code_plancode     = $("#code_plancode").val();
            var libelle_plancode  = $("#libelle_plancode").val();
            var question_plancode = $("#question_plancode").val();
            var theme             = $("#theme_plancode").val();
            var sousTheme         = $("#sousTheme_plancode").val();

            if(question_plancode == '')
            {
                iziToast.error({
                    message: "Veuillez entrer la question à codifier",
                    position: 'topRight'
                });
                return false;
            }
            // if(theme == '')
            // {
            //     iziToast.error({
            //         message: "Veuillez renseigner le thème de la codification !!",
            //         position: 'topRight'
            //     });
            //     return false;
            // }
           
            if (code_plancode == '' || code_plancode.length > 8) {
                iziToast.error({
                    message: "Veuillez entrer un code",
                    position: 'topRight'
                });
                return false;
            }
            if (libelle_plancode == '') {
                iziToast.error({
                    message: "Veuillez entrer le libellé du code",
                    position: 'topRight'
                });
                return false;
            }

            if ($scope.testSiUnElementEstDansTableau('plan_code', $scope.planCodeInTable, null, code_plancode, question_plancode) == true) {
                iziToast.error({
                    message: "Le code " + code_plancode + " pour la question "+ +" "+question_plancode + "est déja présent dans le tableau",
                    position: 'topRight'
                });
                return false;
            }

            $scope.planCodeInTable.unshift({
                "theme"      : theme,
                "sous_theme" : sousTheme,
                "question"   : question_plancode,
                "code"       : code_plancode,
                "designation": libelle_plancode,
            });

            //Vider les données
            
            $("#code_plancode").val("").trigger("change");
            $("#libelle_plancode").val("").trigger("change");
        }
        else if (action == 'delete') {
            //Supprimer un élément du tableau
            $.each($scope.planCodeInTable, function (keyItem, oneItem) {
                if (oneItem.code == selectedItem.code) {
                    $scope.planCodeInTable.splice(keyItem, 1);
                    return false;
                }
            });
        }
        else if( action == 'update')
        {
            $("#code_plancode").val(selectedItem.code);
            $("#libelle_plancode").val(selectedItem.designation);
            $("#question_plancode").val(selectedItem.question);
            $("#theme_plancode").val(selectedItem.theme);
            $("#sousTheme_plancode").val(selectedItem.sous_theme);

            $.each($scope.planCodeInTable, function (keyItem, oneItem) {
                if (oneItem.code == selectedItem.code) {
                    $scope.planCodeInTable.splice(keyItem, 1);
                    return false;
                }
            });
           
        }
        else {
            //Vider le tableau
            $scope.planCodeInTable = [];
        }
    };
    $(function () {
        $('#modalToggle').click(function() {
          $('#modal').modal({
            backdrop: 'static'
          });
        });
      
        $('#infoContinue').click(function (e) {
          e.preventDefault();
          $('.progress-bar').css('width', '40%');
          $('.progress-bar').html('Step 2 of 5');
          $('#myTab a[href="#ads"]').tab('show');
        });
      
        $('#adsContinue').click(function (e) {
          e.preventDefault();
          $('.progress-bar').css('width', '60%');
          $('.progress-bar').html('Step 3 of 5');
          $('#myTab a[href="#placementPanel"]').tab('show');
        });
      
        $('#placementContinue').click(function (e) {
          e.preventDefault();
          $('.progress-bar').css('width', '80%');
          $('.progress-bar').html('Step 4 of 5');
          $('#myTab a[href="#schedulePanel"]').tab('show');
        });
      
        $('#scheduleContinue').click(function (e) {
          e.preventDefault();
          $('.progress-bar').css('width', '100%');
          $('.progress-bar').html('Step 5 of 5');
          $('#myTab a[href="#reviewPanel"]').tab('show');
        });
        
        $('#activate').click(function (e) {
          e.preventDefault();
          var formData = {
            campaign_name: $('#campaignName').val(),
            start_date: $('#start-date').val(),
            end_date: $('#end-date').val(),
            days: {
              sunday: $('#sunday').prop('checked'),
              monday: $('#monday').prop('checked'),
              tuesday: $('#tuesday').prop('checked'),
              wednesday: $('#wednesday').prop('checked'),
              thurday: $('#thursday').prop('checked'),
              friday: $('#friday').prop('checked'),
              saturday: $('#saturday').prop('checked'),
            },
            start_time: $('#start-time').val(),
            end_time: $('#end-time').val()
          }
          alert(JSON.stringify(formData));
        })
      })
    // Afichier les dataTables
    $scope.afr2arDataTable = function (classe = "dataex-fixh-basic") {
        console.log("afr2arDataTable");
        setTimeout(function () { //Mis ici car sans ca le DataTable ne fonctionnera pas

            if (classe == "dataex-fixh-basic") {
                var dataexFixhBasic = $('.dataex-fixh-basic').DataTable({
                    fixedHeader: {
                        header: true,
                        headerOffset: $('.header-navbar').outerHeight()
                    }
                });

                if ($('body').hasClass('vertical-layout')) {
                    var menuWidth = $('.main-menu').outerWidth();
                    $('.fixedHeader-floating').css('margin-left', menuWidth + 'px');
                }

                /********************************************
                 *       Enable / disable FixedHeader        *
                 ********************************************/

                var tableEnablDeisable = $('.dataex-fixh-enabledisable').DataTable({
                    fixedHeader: {
                        header: true,
                        headerOffset: $('.header-navbar').outerHeight()
                    }
                });

                $('#enable').on('click', function () {
                    tableEnablDeisable.fixedHeader.enable();
                });

                $('#disable').on('click', function () {
                    tableEnablDeisable.fixedHeader.disable();
                });

                /***************************************
                 *       Show / hide FixedHeader        *
                 ***************************************/

                var tableHideHeader = $('.dataex-fixh-hideheader').DataTable({
                    fixedHeader: {
                        header: true,
                        headerOffset: $('.header-navbar').outerHeight()
                    }
                });

                var visible = true;
                var tableContainer = $(tableHideHeader.table().container());

                $('#toggle').on('click', function () {
                    tableContainer.css('display', visible ? 'none' : 'block');
                    tableHideHeader.fixedHeader.adjust();

                    visible = !visible;
                });

                /********************************************
                 *       Enable / disable FixedHeader        *
                 ********************************************/

                var tableResponsive = $('.dataex-fixh-responsive').DataTable({
                    responsive: true
                });

                /*     new $.fn.dataTable.FixedHeader(tableResponsive,{
                            header: true,
                            headerOffset: $('.header-navbar').outerHeight()
                        }); */

                /**************************************************
                 *       Responsive integration (Bootstrap)        *
                 **************************************************/

                /*     var tableResponsiveBootstrap = $('.dataex-fixh-responsive-bootstrap').DataTable({
                        responsive: true
                    });
                
                    new $.fn.dataTable.FixedHeader(tableResponsiveBootstrap,{
                            header: true,
                            headerOffset: $('.header-navbar').outerHeight()
                    });
                 */
                /**************************************
                 *       ColReorder integration        *
                 **************************************/

                var tableColReorder = $('.dataex-fixh-reorder').DataTable({
                    fixedHeader: {
                        header: true,
                        headerOffset: $('.header-navbar').outerHeight()
                    },
                    colReorder: true
                });

                // Resize datatable on menu width change and window resize
                $(function () {

                    $(".menu-toggle").on('click', resize);

                    // Resize function
                    function resize() {
                        setTimeout(function () {

                            // ReDraw DataTable
                            dataexFixhBasic.draw();
                            tableEnablDeisable.draw();
                            tableHideHeader.draw();
                            tableResponsive.draw();
                            tableResponsiveBootstrap.draw();
                            tableColReorder.draw();
                        }, 400);
                    }
                });
            }



        }, 1500);

    };

    //Fonction pour fixer les colonnes en-têtes du tableau
    $scope.buildTable = function ($el, cells, rows) {
        console.log("buildTable");

        var columns = [];
        var data = [];


        var classes = $('.toolbar input:checked').next().text();

        /*Libasse DIOP ==> Fixer décalage scroll horizontale*/
        document.addEventListener('scroll', (e) => {
            let parent_width = document.getElementById('tabdata').getBoundingClientRect().width;

            const sticky = document.querySelectorAll('.sticky-header-container');
            sticky.forEach(element => {
                element.style.maxWidth = Math.round(parent_width) + "px";
            });
        });
        /*Libasse DIOP ==> Fixer décalage scroll horizontale*/

        $el.bootstrapTable('destroy').bootstrapTable({
            showFullscreen: false,
            search: false,
            stickyHeader: true,
            stickyHeaderOffsetLeft: parseInt($('body').css('padding-left'), 10),
            stickyHeaderOffsetRight: parseInt($('body').css('padding-right'), 10),
            stickyHeaderOffsetY: parseInt($('.navbar').css('height')),
            theadClasses: classes
        })
    };


    //A adapter pour la fonction du tableau général
    $scope.actionSurTableauClotureCaisse = function (action, tagForm, currentIndex = 0, parentIndex = 0, obj = null) {
        var typeCourant = 'cloturecaisse';
        var form = $('#form_add' + typeCourant);

        if (action == 'add') {
            if (tagForm == "typebillets_cloturecaisse") {
                var typebillet_id_cloturecaisse = $("#typebillet_id_cloturecaisse").val();
                var nombre_cloturecaisse = $("#nombre_cloturecaisse").val();
                if ($scope.estEntier(typebillet_id_cloturecaisse) == false) {
                    iziToast.error({
                        message: "Sélectionnez un type de billet",
                        position: 'topRight'
                    });
                    return false;
                }
                if ($scope.estEntier(nombre_cloturecaisse) == false) {
                    iziToast.error({
                        message: "Mettez un nombre valide",
                        position: 'topRight'
                    });
                    return false;
                }
                if ($scope.testSiUnElementEstDansTableau(tagForm, $scope.dataInTabPane[tagForm]['data'], typebillet_id_cloturecaisse) == true) {
                    iziToast.error({
                        message: "Ce type de billet est déja dans le tableau",
                        position: 'topRight'
                    });
                    return false;
                }

                var type = 'typebillet';
                var typeAvecS = type + 's';
                rewriteReq = typeAvecS + '(id:' + typebillet_id_cloturecaisse + ')';
                form.parent().parent().blockUI_start();

                Init.getElement(rewriteReq, listofrequests_assoc[typeAvecS]).then(function (data) {
                    form.parent().parent().blockUI_stop();
                    if (data && data[0]) {
                        //console.log(data[0]);//okei
                        var objBillet = {
                            "typebillet_id": typebillet_id_cloturecaisse,
                            "typebillet": data[0],
                            "nombre": nombre_cloturecaisse,
                            "total": nombre_cloturecaisse * data[0].nombre
                        }
                        $scope.dataInTabPane[tagForm]['data'].unshift(objBillet);
                        $scope.changeEncaissementSurBilletage(action, 'encaissements_cloturecaisse', objBillet);
                        $scope.donneTotauxClotureCaisse(tagForm);
                    }
                }, function (msg) {
                    toastr.error(msg);
                });
            } else if (tagForm == "encaissements_cloturecaisse") {
                var mode_paiement_id_cloturecaisse = $("#mode_paiement_id_cloturecaisse").val();
                var montant_cloturecaisse = $("#montant_cloturecaisse").val();
                if (obj) {
                    var modePaiementCashObj = $scope.donneModePaiementCash();
                    mode_paiement_id_cloturecaisse = modePaiementCashObj ? modePaiementCashObj.id : null;
                    montant_cloturecaisse = obj.total;
                }
                if ($scope.estEntier(mode_paiement_id_cloturecaisse) == false) {
                    if (obj) {
                        iziToast.error({
                            message: "Un mode de paiement cash n'est pas encore défini",
                            position: 'topRight'
                        });
                        return false;
                    } else {
                        iziToast.error({
                            message: "Sélectionnez un mode de paiement",
                            position: 'topRight'
                        });
                        return false;
                    }
                }
                if ($scope.estEntier(montant_cloturecaisse) == false) {
                    iziToast.error({
                        message: "Mettez un montant valide",
                        position: 'topRight'
                    });
                    return false;
                }
                if ($scope.testSiUnElementEstDansTableau(tagForm, $scope.dataInTabPane[tagForm]['data'], mode_paiement_id_cloturecaisse) == true) {
                    iziToast.error({
                        message: "Ce mode de paiement est déja dans le tableau",
                        position: 'topRight'
                    });
                    return false;
                }

                var type = 'modepaiement';
                var typeAvecS = type + 's';
                rewriteReq = typeAvecS + '(id:' + mode_paiement_id_cloturecaisse + ')';
                form.parent().parent().blockUI_start();

                Init.getElement(rewriteReq, listofrequests_assoc[typeAvecS]).then(function (data) {
                    form.parent().parent().blockUI_stop();
                    if (data && data[0]) {
                        //console.log(data[0]);
                        $scope.dataInTabPane[tagForm]['data'].unshift({
                            "mode_paiement_id": mode_paiement_id_cloturecaisse,
                            "mode_paiement": data[0],
                            "montant": montant_cloturecaisse,
                        });
                        $scope.donneTotauxClotureCaisse(tagForm);
                    }
                }, function (msg) {
                    toastr.error(msg);
                });
            }
        } else if (action == 'delete') {
            $scope.dataInTabPane[tagForm]['data'].splice(currentIndex, 1);
            if (tagForm == 'typebillets_cloturecaisse') {
                $scope.changeEncaissementSurBilletage(action, 'encaissements_cloturecaisse', obj);
            }
            $scope.donneTotauxClotureCaisse(tagForm);
        } else {
            $scope.dataInTabPane[tagForm]['data'] = [];
        }
    };

    //A adapter pour la fonction du tableau général
    $scope.actionSurTableauEntiteTransactionCaisse = function (action, type, currentIndex = 0, parentIndex = 0) {
        var tagForm = "entitestransactions_general";
        if (action == 'add') {
            var entite_id = $("#entite_id_" + type).val();
            var montant_entite = $("#montant_entite_" + type).val();

            if (type == "depense") {
                entite_id = $("#entite_id_entite_" + type).val();
            }
            console.log("entite_id", entite_id);

            if ($scope.estEntier(entite_id) == false) {
                iziToast.error({
                    message: "Sélectionnez un point de vente",
                    position: 'topRight'
                });
                return false;
            }
            if ($scope.estEntier(montant_entite) == false) {
                iziToast.error({
                    message: "Mettez une valeur valide",
                    position: 'topRight'
                });
                return false;
            }
            if ($scope.testSiUnElementEstDansTableau(tagForm, $scope.dataInTabPane[tagForm]['data'], entite_id) == true) {
                iziToast.error({
                    message: "Ce point de vente est déja dans le tableau",
                    position: 'topRight'
                });
                return false;
            }

            var type = 'entite';
            var typeAvecS = type + 's';
            rewriteReq = typeAvecS + '(id:' + entite_id + ')';

            Init.getElement(rewriteReq, listofrequests_assoc[typeAvecS]).then(function (data) {
                if (data && data[0]) {
                    //console.log(data[0]);
                    $scope.dataInTabPane[tagForm]['data'].unshift({
                        "entite_id": entite_id,
                        "entite": data[0],
                        "montant": montant_entite,
                    });
                }
            }, function (msg) {
                toastr.error(msg);
            });
        } else if (action == 'delete') {
            $scope.dataInTabPane[tagForm]['data'].splice(currentIndex, 1);
        } else {
            $scope.dataInTabPane[tagForm]['data'] = [];
        }
    };

    //A adapter pour la fonction du tableau général
    $scope.actionSurTableauPosteDepense = function (action, tagForm, currentIndex = 0, parentIndex = 0) {
        if (action == 'add') {
            var entite_id = $("#entite_id_postedepense").val();
            var montant_entite = $("#montant_entite_postedepense").val();
            if ($scope.estEntier(entite_id) == false) {
                iziToast.error({
                    message: "Sélectionnez un point de vente",
                    position: 'topRight'
                });
                return false;
            }
            if ($scope.estEntier(montant_entite) == false) {
                iziToast.error({
                    message: "Mettez un montant valide",
                    position: 'topRight'
                });
                return false;
            }
            if ($scope.testSiUnElementEstDansTableau(tagForm, $scope.dataInTabPane[tagForm]['data'], entite_id) == true) {
                iziToast.error({
                    message: "Ce point de vente est déja dans le tableau",
                    position: 'topRight'
                });
                return false;
            }

            var type = 'entite';
            var typeAvecS = type + 's';
            rewriteReq = typeAvecS + '(id:' + entite_id + ')';

            Init.getElement(rewriteReq, listofrequests_assoc[typeAvecS]).then(function (data) {
                if (data && data[0]) {
                    //console.log(data[0]);
                    $scope.dataInTabPane[tagForm]['data'].unshift({
                        "entite_id": entite_id,
                        "entite": data[0],
                        "montant": montant_entite,
                    });
                }
            }, function (msg) {
                toastr.error(msg);
            });
        } else if (action == 'delete') {
            $scope.dataInTabPane[tagForm]['data'].splice(currentIndex, 1);
        } else {
            $scope.dataInTabPane[tagForm]['data'] = [];
        }
    };

    //A adapter pour la fonction du tableau général
    $scope.actionSurTableauDepense = function (action, tagForm, currentIndex = 0, parentIndex = 0) {
        if (action == 'add') {
            var poste_depense_id = $("#poste_depense_id_depense").val();
            var sous_poste_depense_id = $("#sous_poste_depense_id_depense").val();
            var montant_poste_depense = $("#montant_poste_depense_depense").val();
            var tva_poste_depense = $("#tva_poste_depense_depense").prop("checked");
            if ($scope.estEntier(poste_depense_id) == false && $scope.estEntier(sous_poste_depense_id) == false) {
                iziToast.error({
                    message: "Sélectionnez un poste de dépense ou un sous-poste de dépense",
                    position: 'topRight'
                });
                return false;
            }
            if ($scope.estEntier(montant_poste_depense) == false) {
                iziToast.error({
                    message: "Mettez un montant valide",
                    position: 'topRight'
                });
                return false;
            }
            if ($scope.testSiUnElementEstDansTableau(tagForm, $scope.dataInTabPane[tagForm]['data'], poste_depense_id, tva_poste_depense) == true) {
                iziToast.error({
                    message: "Ce poste de dépense avec avec ou sans la TVA est déja dans le tableau",
                    position: 'topRight'
                });
                return false;
            }

            //Calcul tva et ttc
            tva = 0;
            montant_tva = 0;
            montant_ttc = montant_poste_depense;
            if (tva_poste_depense == true) {
                tva = 18;
                montant_tva = (montant_poste_depense * 18) / 100;
                montant_ttc = parseFloat(montant_ttc) + parseFloat(montant_tva);
            }
            var type = 'postedepense';
            var selected_id = poste_depense_id;
            if ($scope.estEntier(sous_poste_depense_id) == true) {
                type = 'souspostedepense';
                selected_id = sous_poste_depense_id;
            }
            var typeAvecS = type + 's';
            rewriteReq = typeAvecS + '(id:' + selected_id + ')';

            Init.getElement(rewriteReq, listofrequests_assoc[typeAvecS]).then(function (data) {
                if (data && data[0]) {
                    //console.log(data[0]);
                    $scope.dataInTabPane[tagForm]['data'].unshift({
                        "poste_depense_id": selected_id,
                        "poste_depense": data[0],
                        "tva_checkbox": tva_poste_depense,
                        "montant": montant_poste_depense,
                        "tva": tva,
                        "montant_tva": montant_tva,
                        "montant_ttc": montant_ttc,
                    });
                    $scope.donneTotauxDepense(tagForm);
                    $("#montant_poste_depense_depense").val("");
                }
            }, function (msg) {
                toastr.error(msg);
            });
        } else if (action == 'delete') {
            $scope.dataInTabPane[tagForm]['data'].splice(currentIndex, 1);
            $scope.donneTotauxDepense(tagForm);
        } else {
            $scope.dataInTabPane[tagForm]['data'] = [];
        }
    };

    //A adapter pour la fonction du tableau général
    $scope.actionSurTableauProduction = function (action, tagForm, currentIndex = 0, parentIndex = 0) {
        console.log("actionSurTableauProduction");
        if (action == 'add') {
            var typeCourant = "production";
            var produit_id = $("#produit_id_production").val();
            var qte_unitaire = $("#qte_unitaire_production").val();
            var depot_id = $("#depot_id_production").val();
            var produit_produits = $("#produit_produits_production").val();
            var qte_unitaire_produits = $("#qte_unitaire_produits_production").val();
            var depot_id_produits = $("#depot_id_produits_production").val();

            if ($scope.estEntier(produit_id) == false) {
                iziToast.error({
                    message: "Sélectionnez un produit de production",
                    position: 'topRight'
                });
                return false;
            }
            if ($scope.estEntier(depot_id) == false) {
                iziToast.error({
                    message: "Sélectionnez un dépôt pour ce produit de production",
                    position: 'topRight'
                });
                return false;
            }
            if ($scope.estEntier(qte_unitaire) == false) {
                iziToast.error({
                    message: "Mettez une quantité de production valide",
                    position: 'topRight'
                });
                return false;
            }
            if ($scope.estEntier(produit_produits) == false) {
                iziToast.error({
                    message: "Sélectionnez un produit en guise de composant",
                    position: 'topRight'
                });
                return false;
            }
            if ($scope.estEntier(depot_id_produits) == false) {
                iziToast.error({
                    message: "Sélectionnez un dépôt pour ce composant",
                    position: 'topRight'
                });
                return false;
            }
            if ($scope.estEntier(qte_unitaire_produits) == false) {
                iziToast.error({
                    message: "Mettez une quantité de composant valide",
                    position: 'topRight'
                });
                return false;
            }
            if ($scope.testSiUnElementEstDansTableau(tagForm, $scope.dataInTabPane[tagForm]['data'], produit_id, produit_produits) == true) {
                iziToast.error({
                    message: "Ce composant pour ce produit de production est déja dans le tableau",
                    position: 'topRight'
                });
                return false;
            }

            var type = 'produit';
            var typeAvecS = type + 's';

            var indexProduitProduction = -1;
            $.each($scope.dataInTabPane[tagForm]['data'], function (keyItem, oneItem) {
                if (oneItem.produit_id == produit_id) {
                    indexProduitProduction = keyItem;
                }
            });

            if (indexProduitProduction == -1) {
                console.log("indexProduitProduction", indexProduitProduction);
                //Le produit de production n'existe pas encore
                rewriteReq = typeAvecS + '(id:' + produit_id + ')';
                var form = $('#form_add' + typeCourant);
                form.parent().parent().blockUI_start();
                Init.getElement(rewriteReq, listofrequests_assoc[typeAvecS]).then(function (data) {
                    if (data && data[0]) {
                        //console.log(data[0]);
                        Init.getElement('depots(id:' + depot_id + ')', listofrequests_assoc["depots"]).then(function (dataDepot) {
                            form.parent().parent().blockUI_stop();
                            if (dataDepot && dataDepot[0]) {
                                $scope.dataInTabPane[tagForm]['data'].unshift({
                                    "produit_id": produit_id,
                                    "produit": data[0],
                                    "qte_unitaire": qte_unitaire,
                                    "depot_id": depot_id,
                                    "depot": dataDepot[0],
                                    "composants": []
                                });
                                indexProduitProduction = 0;

                                //Récuprération du produit composant
                                $scope.mettreProduitDansTableau(tagForm, indexProduitProduction, produit_produits, qte_unitaire_produits, depot_id_produits);
                            }
                        }, function (msg) {
                            toastr.error(msg);
                        });
                    }
                }, function (msg) {
                    toastr.error(msg);
                });
            }
            else {
                console.log("indexProduitProduction", indexProduitProduction);
                //Récuprération du produit composant
                $scope.mettreProduitDansTableau(tagForm, indexProduitProduction, produit_produits, qte_unitaire_produits, depot_id_produits);
            }

            //Vider les champs
            $("#produit_produits_production").val("").trigger("change");
            $("#depot_id_produits_production").val("").trigger("change");
            $("#qte_unitaire_produits_production").val("");
        }
        else if (action == 'delete') {
            var produit_id = parentIndex;
            var composant_id = currentIndex;
            $.each($scope.dataInTabPane[tagForm]['data'], function (keyItem, oneItem) {
                if (oneItem.produit_id == produit_id) {
                    $.each($scope.dataInTabPane[tagForm]['data'][keyItem].composants, function (keyItem2, oneItem2) {
                        if (oneItem2.produit_id == composant_id) {
                            $scope.dataInTabPane[tagForm]['data'][keyItem].composants.splice(keyItem2, 1);
                            return false;
                        }
                    });
                }
            });
        }
        else {
            $scope.dataInTabPane[tagForm]['data'] = [];
        }
    };

    //A adapter pour la fonction du tableau général
    $scope.actionSurTableauDecoupage = function (action, tagForm, currentIndex = 0, parentIndex = 0) {
        console.log("actionSurTableauDecoupage");
        if (action == 'add') {
            var typeCourant = "decoupage";
            var produit_id = $("#produit_id_decoupage").val();
            var qte_unitaire = $("#qte_unitaire_decoupage").val();
            var depot_id = $("#depot_id_decoupage").val();
            var produit_produits = $("#produit_produits_decoupage").val();
            var qte_unitaire_produits = $("#qte_unitaire_produits_decoupage").val();
            var depot_id_produits = $("#depot_id_produits_decoupage").val();
            var emballage_id_produits = $("#emballage_id_produits_decoupage").val();

            if ($scope.estEntier(produit_id) == false) {
                iziToast.error({
                    message: "Sélectionnez un produit principal",
                    position: 'topRight'
                });
                return false;
            }
            if ($scope.estEntier(depot_id) == false) {
                iziToast.error({
                    message: "Sélectionnez un dépôt pour ce produit principal",
                    position: 'topRight'
                });
                return false;
            }
            if ($scope.estEntier(qte_unitaire) == false) {
                iziToast.error({
                    message: "Mettez une quantité valide",
                    position: 'topRight'
                });
                return false;
            }
            if ($scope.estEntier(produit_produits) == false) {
                iziToast.error({
                    message: "Sélectionnez un produit en guise de découpaje",
                    position: 'topRight'
                });
                return false;
            }
            if ($scope.estEntier(depot_id_produits) == false) {
                iziToast.error({
                    message: "Sélectionnez un dépôt pour ce découpage",
                    position: 'topRight'
                });
                return false;
            }
            if ($scope.estEntier(qte_unitaire_produits) == false) {
                iziToast.error({
                    message: "Mettez une quantité de découpage valide",
                    position: 'topRight'
                });
                return false;
            }
            if ($scope.testSiUnElementEstDansTableau(tagForm, $scope.dataInTabPane[tagForm]['data'], produit_id, produit_produits) == true) {
                iziToast.error({
                    message: "Ce composant pour ce produit de decoupage est déja dans le tableau",
                    position: 'topRight'
                });
                return false;
            }

            var type = 'produit';
            var typeAvecS = type + 's';

            var indexProduitDecoupage = -1;
            $.each($scope.dataInTabPane[tagForm]['data'], function (keyItem, oneItem) {
                if (oneItem.produit_id == produit_id) {
                    indexProduitDecoupage = keyItem;
                }
            });

            if (indexProduitDecoupage == -1) {
                console.log("indexProduitDecoupage", indexProduitDecoupage);
                //Le produit de decoupage n'existe pas encore
                rewriteReq = typeAvecS + '(id:' + produit_id + ')';
                var form = $('#form_add' + typeCourant);
                form.parent().parent().blockUI_start();
                Init.getElement(rewriteReq, listofrequests_assoc[typeAvecS]).then(function (data) {
                    if (data && data[0]) {
                        //console.log(data[0]);
                        Init.getElement('depots(id:' + depot_id + ')', listofrequests_assoc["depots"]).then(function (dataDepot) {
                            form.parent().parent().blockUI_stop();
                            if (dataDepot && dataDepot[0]) {
                                $scope.dataInTabPane[tagForm]['data'].unshift({
                                    "produit_id": produit_id,
                                    "produit": data[0],
                                    "qte_unitaire": qte_unitaire,
                                    "depot_id": depot_id,
                                    "depot": dataDepot[0],
                                    "composants": []
                                });
                                indexProduitDecoupage = 0;

                                //Récuprération du produit composant
                                $scope.mettreProduitDansTableau(tagForm, indexProduitDecoupage, produit_produits, qte_unitaire_produits, depot_id_produits, emballage_id_produits);
                            }
                        }, function (msg) {
                            toastr.error(msg);
                        });
                    }
                }, function (msg) {
                    toastr.error(msg);
                });
            }
            else {
                console.log("indexProduitDecoupage", indexProduitDecoupage);
                //Récuprération du produit composant
                $scope.mettreProduitDansTableau(tagForm, indexProduitDecoupage, produit_produits, qte_unitaire_produits, depot_id_produits, emballage_id_produits);
            }

            //Vider les champs
            $("#produit_produits_decoupage").val("").trigger("change");
            $("#depot_id_produits_decoupage").val("").trigger("change");
            $("#emballage_id_produits_decoupage").val("").trigger("change");
            $("#qte_unitaire_produits_decoupage").val("");
        }
        else if (action == 'delete') {
            var produit_id = parentIndex;
            var composant_id = currentIndex;
            $.each($scope.dataInTabPane[tagForm]['data'], function (keyItem, oneItem) {
                if (oneItem.produit_id == produit_id) {
                    $.each($scope.dataInTabPane[tagForm]['data'][keyItem].composants, function (keyItem2, oneItem2) {
                        if (oneItem2.produit_id == composant_id) {
                            $scope.dataInTabPane[tagForm]['data'][keyItem].composants.splice(keyItem2, 1);
                            return false;
                        }
                    });
                }
            });
        }
        else {
            $scope.dataInTabPane[tagForm]['data'] = [];
        }
    };

    //A adapter pour la fonction du tableau général
    $scope.actionSurTableauR2aTechnique = function (action, tagForm, currentIndex = 0, parentIndex = 0, is_recette = 1) {
        if (action == 'add') {
            var produit_id = $("#produit_compose_r2atechniques_produit").val();
            var qte = $("#portion_r2atechniques_produit").val();

            if ($scope.estEntier(produit_id) == false) {
                iziToast.error({
                    message: "Sélectionnez un produit",
                    position: 'topRight'
                });
                return false;
            }
            if ($scope.estFloat(qte) == false) {
                iziToast.error({
                    message: "Mettez un quantité valide",
                    position: 'topRight'
                });
                return false;
            }
            if ($scope.testSiUnElementEstDansTableau('produit_id', $scope.dataInTabPane[tagForm]['data'], produit_id) == true) {
                iziToast.error({
                    message: "Ce produit est déja dans le tableau",
                    position: 'topRight'
                });
                return false;
            }

            var type = 'produit';
            var typeAvecS = type + 's';
            rewriteReq = typeAvecS + '(id:' + produit_id + ')';

            var typeCourant = 'produit';
            var form = $('#form_add' + typeCourant);
            form.parent().parent().blockUI_start();
            Init.getElement(rewriteReq, listofrequests_assoc[typeAvecS]).then(function (data) {
                form.parent().parent().blockUI_stop();
                if (data && data[0]) {
                    //console.log(data[0]);
                    $scope.dataInTabPane[tagForm]['data'].push({
                        "produit_compose_id": produit_id,
                        "produit_compose": data[0],
                        "quantite": qte,
                        "pr_off": data[0].cump_off * qte,
                        "pr": data[0].cump * qte,
                        "is_recette": is_recette,
                    });
                    $scope.donneTotalR2aTechnique()
                }
            }, function (msg) {
                toastr.error(msg);
            });
        } else if (action == 'delete') {
            $scope.dataInTabPane[tagForm]['data'].splice(currentIndex, 1);
        } else {
            $scope.dataInTabPane[tagForm]['data'] = [];
        }
    };

    //A adapter pour la fonction du tableau général
    $scope.actionSurTableauAction = function (action, tagForm, currentIndex = 0, parentIndex = 0) {
        if (action == 'add') {
            var operateur_id_action = $("#operateur_id_action").val();
            var date_heure_action = $("#date_heure_action").val();
            var rapport_action = $("#rapport_action").val();
            if ($scope.estEntier(operateur_id_action) == false) {
                iziToast.error({
                    message: "Sélectionnez un opérateur/intervenant",
                    position: 'topRight'
                });
                return false;
            }
            if (!date_heure_action) {
                iziToast.error({
                    message: "Mettez la date et l'heure",
                    position: 'topRight'
                });
                return false;
            }
            if (!rapport_action) {
                iziToast.error({
                    message: "Mettez la tâche",
                    position: 'topRight'
                });
                return false;
            }
            /* if ($scope.testSiUnElementEstDansTableau(tagForm, $scope.dataInTabPane[tagForm]['data'], operateur_id_action) == true) {
                iziToast.error({
                    message: "L'opérateur/intervenant est déja dans le tableau",
                    position: 'topRight'
                });
                return false;
            } */

            var type = 'operateur';
            var typeAvecS = type + 's';
            rewriteReq = typeAvecS + '(id:' + operateur_id_action + ')';
            var typeCourant = 'action';
            var form = $('#form_add' + typeCourant);
            form.parent().parent().blockUI_start();

            Init.getElement(rewriteReq, listofrequests_assoc[typeAvecS]).then(function (data) {
                form.parent().parent().blockUI_stop();
                if (data && data[0]) {
                    //console.log(data[0]);
                    $scope.dataInTabPane[tagForm]['data'].unshift({
                        "operateur_id": operateur_id_action,
                        "operateur": data[0],
                        "date_heure": date_heure_action,
                        "rapport": rapport_action,
                    });
                }
            }, function (msg) {
                toastr.error(msg);
            });
        } else if (action == 'delete') {
            $scope.dataInTabPane[tagForm]['data'].splice(currentIndex, 1);
        } else {
            $scope.dataInTabPane[tagForm]['data'] = [];
        }
    };

    //A adapter pour la fonction du tableau général
    $scope.actionSurTableauEvenement = function (action, tagForm, currentIndex = 0, parentIndex = 0) {
        if (action == 'add') {
            var employe_id_evenement = $("#employe_id_evenement").val();
            if ($scope.estEntier(employe_id_evenement) == false) {
                iziToast.error({
                    message: "Sélectionnez un employé",
                    position: 'topRight'
                });
                return false;
            }
            if ($scope.testSiUnElementEstDansTableau(tagForm, $scope.dataInTabPane[tagForm]['data'], employe_id_evenement) == true) {
                iziToast.error({
                    message: "L'employé est déja dans le tableau",
                    position: 'topRight'
                });
                return false;
            }

            var type = 'employe';
            var typeAvecS = type + 's';
            rewriteReq = typeAvecS + '(id:' + employe_id_evenement + ')';
            var typeCourant = 'evenement';
            var form = $('#form_add' + typeCourant);
            form.parent().parent().blockUI_start();

            Init.getElement(rewriteReq, listofrequests_assoc[typeAvecS]).then(function (data) {
                form.parent().parent().blockUI_stop();
                if (data && data[0]) {
                    //console.log(data[0]);
                    $scope.dataInTabPane[tagForm]['data'].unshift({
                        "employe_id": employe_id_evenement,
                        "employe": data[0],
                    });
                }
            }, function (msg) {
                toastr.error(msg);
            });
        } else if (action == 'delete') {
            $scope.dataInTabPane[tagForm]['data'].splice(currentIndex, 1);
        } else {
            $scope.dataInTabPane[tagForm]['data'] = [];
        }
    };

    //A adapter pour la fonction du tableau général
    $scope.actionSurTableauOperateur = function (action, tagForm, currentIndex = 0, parentIndex = 0) {
        if (action == 'add') {
            var famille_action_id_operateur = $("#famille_action_id_operateur").val();
            if ($scope.estEntier(famille_action_id_operateur) == false) {
                iziToast.error({
                    message: "Sélectionnez une famille d'action",
                    position: 'topRight'
                });
                return false;
            }
            if ($scope.testSiUnElementEstDansTableau(tagForm, $scope.dataInTabPane[tagForm]['data'], famille_action_id_operateur) == true) {
                iziToast.error({
                    message: "La famille d'action est déja dans le tableau",
                    position: 'topRight'
                });
                return false;
            }

            var type = 'familleaction';
            var typeAvecS = type + 's';
            rewriteReq = typeAvecS + '(id:' + famille_action_id_operateur + ')';
            var typeCourant = 'operateur';
            var form = $('#form_add' + typeCourant);
            form.parent().parent().blockUI_start();

            Init.getElement(rewriteReq, listofrequests_assoc[typeAvecS]).then(function (data) {
                form.parent().parent().blockUI_stop();
                if (data && data[0]) {
                    //console.log(data[0]);
                    $scope.dataInTabPane[tagForm]['data'].unshift({
                        "famille_action_id": famille_action_id_operateur,
                        "famille_action": data[0],
                    });
                }
            }, function (msg) {
                toastr.error(msg);
            });
        } else if (action == 'delete') {
            $scope.dataInTabPane[tagForm]['data'].splice(currentIndex, 1);
        } else {
            $scope.dataInTabPane[tagForm]['data'] = [];
        }
    };


    //A adapter pour la fonction du tableau général
    $scope.actionSurTableauFacture = function (action, tagForm, currentIndex = 0, parentIndex = 0, TagFormFiltre = null, type = 1) {
        if (action == 'add') {
            var id = $scope.dataInTabPane[TagFormFiltre]['data'][currentIndex].id;
            if ($scope.testSiUnElementEstDansTableau(tagForm, $scope.dataInTabPane[tagForm]['data'], id) == true) {
                iziToast.error({
                    message: "L'élément sélectionné est déja dans le tableau",
                    position: 'topRight'
                });
                return false;
            }

            $scope.dataInTabPane[tagForm]['data'].unshift(
                $scope.dataInTabPane[TagFormFiltre]['data'][currentIndex]
            );
            $scope.donneTotauxFacture(tagForm, type);
        }
        else if (action == 'addall') {
            $.each($scope.dataInTabPane[TagFormFiltre]['data'], function (keyItem, oneItem) {
                var id = oneItem.id;
                if ($scope.testSiUnElementEstDansTableau(tagForm, $scope.dataInTabPane[tagForm]['data'], id) == false) {
                    $scope.dataInTabPane[tagForm]['data'].unshift(
                        oneItem
                    );
                }
            });
            $scope.donneTotauxFacture(tagForm, type);
        }
        else if (action == 'delete') {
            $scope.dataInTabPane[tagForm]['data'].splice(currentIndex, 1);
            $scope.donneTotauxFacture(tagForm, type);
        }
        else if (action == 'deleteall') {
            $scope.dataInTabPane[tagForm]['data'] = [];
            $scope.donneTotauxFacture(tagForm, type);
        }
        else {
            $scope.dataInTabPane[tagForm]['data'] = [];
        }
    };


    //A adapter pour la fonction du tableau général
    $scope.actionSurTableauEntreeStock = function (action, tagForm, currentIndex = 0, parentIndex = 0) {
        if (action == 'add') {
            var produit_id_entreestock = $("#produit_id_entreestock").val();
            var quantite_entreestock = $("#quantite_entreestock").val();
            if ($scope.estEntier(produit_id_entreestock) == false) {
                iziToast.error({
                    message: "Sélectionnez un produit",
                    position: 'topRight'
                });
                return false;
            }
            if ($scope.estEntier(quantite_entreestock) == false) {
                iziToast.error({
                    message: "Mettez une quantité valide",
                    position: 'topRight'
                });
                return false;
            }
            if ($scope.testSiUnElementEstDansTableau(tagForm, $scope.dataInTabPane[tagForm]['data'], produit_id_entreestock) == true) {
                iziToast.error({
                    message: "Le produit est déja dans le tableau",
                    position: 'topRight'
                });
                return false;
            }

            var type = 'produit';
            if ($scope.currentTemplateUrl == 'list-entreestocklogistique') {
                type = 'logistique'
            }
            var typeAvecS = type + 's';
            rewriteReq = typeAvecS + '(id:' + produit_id_entreestock + ')';
            var typeCourant = 'entreestock';
            var form = $('#form_add' + typeCourant);
            form.parent().parent().blockUI_start();

            Init.getElement(rewriteReq, listofrequests_assoc[typeAvecS]).then(function (data) {
                form.parent().parent().blockUI_stop();
                if (data && data[0]) {
                    //console.log(data[0]);
                    $scope.dataInTabPane[tagForm]['data'].unshift({
                        "produit_id": produit_id_entreestock,
                        "produit": data[0],
                        "quantite": quantite_entreestock,
                    });
                }
            }, function (msg) {
                toastr.error(msg);
            });
        } else if (action == 'delete') {
            $scope.dataInTabPane[tagForm]['data'].splice(currentIndex, 1);
        } else {
            $scope.dataInTabPane[tagForm]['data'] = [];
        }
    };

    //A adapter pour la fonction du tableau général
    $scope.actionSurTableauSortieStock = function (action, tagForm, currentIndex = 0, parentIndex = 0) {
        if (action == 'add') {
            var produit_id_sortiestock = $("#produit_id_sortiestock").val();
            var quantite_sortiestock = $("#quantite_sortiestock").val();
            if ($scope.estEntier(produit_id_sortiestock) == false) {
                iziToast.error({
                    message: "Sélectionnez un produit",
                    position: 'topRight'
                });
                return false;
            }
            if ($scope.estEntier(quantite_sortiestock) == false) {
                iziToast.error({
                    message: "Mettez une quantité valide",
                    position: 'topRight'
                });
                return false;
            }
            if ($scope.testSiUnElementEstDansTableau(tagForm, $scope.dataInTabPane[tagForm]['data'], produit_id_sortiestock) == true) {
                iziToast.error({
                    message: "Le produit est déja dans le tableau",
                    position: 'topRight'
                });
                return false;
            }

            var type = 'produit';
            if ($scope.currentTemplateUrl == 'list-sortiestocklogistique') {
                type = 'logistique'
            }
            var typeAvecS = type + 's';
            rewriteReq = typeAvecS + '(id:' + produit_id_sortiestock + ')';
            var typeCourant = 'sortiestock';
            var form = $('#form_add' + typeCourant);
            form.parent().parent().blockUI_start();

            Init.getElement(rewriteReq, listofrequests_assoc[typeAvecS]).then(function (data) {
                form.parent().parent().blockUI_stop();
                if (data && data[0]) {
                    //console.log(data[0]);
                    $scope.dataInTabPane[tagForm]['data'].unshift({
                        "produit_id": produit_id_sortiestock,
                        "produit": data[0],
                        "quantite": quantite_sortiestock,
                    });
                }
            }, function (msg) {
                toastr.error(msg);
            });
        } else if (action == 'delete') {
            $scope.dataInTabPane[tagForm]['data'].splice(currentIndex, 1);
        } else {
            $scope.dataInTabPane[tagForm]['data'] = [];
        }
    };

    //Les actions liées aux tableaux des données
    $scope.actionSurTableau = function (action, tagForm, currentIndex = 0, parentIndex = 0) {
        if (action == 'add') {
            if (tagForm == 'produits_be') {
                var produitId = $("#produit_be").val();
                if ($scope.estEntier(produitId) == false) {
                    iziToast.error({
                        message: "Sélectionnez un produit",
                        position: 'topRight'
                    });
                    return false;
                }
                if ($scope.testSiUnElementEstDansTableau(tagForm, $scope.dataInTabPane['produits_be']['data'], produitId) == true) {
                    iziToast.error({
                        message: "Le produit est déja dans le tableau",
                        position: 'topRight'
                    });
                    return false;
                }

                $scope.dataInTabPane['produits_be']['data'].unshift({
                    "etat": 0,
                    "produit_id": produitId,
                    "prix_achat_fournisseur": $scope.produitSelected[0].prix_achat_fournisseur,
                    "produit": $scope.produitSelected[0],
                    "quantite_be": 0,
                    "quantite_finale": 0,
                });
            } else {
                $scope.dataInTabPane['produits_bce']['data'] = [];
                var typeAvecS = type + 's';
                rewriteReq = typeAvecS + '(date_start:"' + dateDebut + '",date_end:"' + dateFin + '")';

                var form = $('#form_add' + typeCourant);
                form.parent().parent().blockUI_start();

                Init.getElement(rewriteReq, listofrequests_assoc[typeAvecS]).then(function (data) {
                    form.parent().parent().blockUI_stop();
                    console.log(JSON.stringify(data))
                    $scope.dataInTabPane['produits_bce']['data'] = data;
                }, function (msg) {
                    toastr.error(msg);
                });
            }
        } else if (action == 'delete') {
            if (tagForm == 'produits_be') {
                $scope.dataInTabPane[tagForm]['data'].splice(currentIndex, 1);
            } else {
                //$scope.dataInTabPane[tagForm]['data'][parentIndex].entites.splice(currentIndex, 1);
                $scope.mettreAjourInputsTableau('etatbciproduitentite', 0, currentIndex, parentIndex);
                /* if($scope.dataInTabPane[tagForm]['data'][parentIndex].entites.length == 0)
                {
                    $scope.dataInTabPane[tagForm]['data'].splice(parentIndex, 1);
                } */
            }
        } else if (action == 'hide') {
            //$scope.dataInTabPane[tagForm]['data'][parentIndex].entites.splice(currentIndex, 1);
            $scope.mettreAjourInputsTableau('etatbciproduitentite', 2, currentIndex, parentIndex);
            /* if($scope.dataInTabPane[tagForm]['data'][parentIndex].entites.length == 0)
            {
                $scope.dataInTabPane[tagForm]['data'].splice(parentIndex, 1);
            } */
        }
    };

    $scope.selectionnerDepot = function (typeCourant, produit_id, depotIdPrefixe) {
        console.log("selectionnerDepot");
        var type = 'produit';
        var typeAvecS = type + 's';
        var rewriteReq = typeAvecS + '(id:' + produit_id + ')';
        var form = $('#form_add' + typeCourant);
        form.parent().parent().blockUI_start();
        Init.getElement(rewriteReq, listofrequests_assoc[typeAvecS]).then(function (data) {
            form.parent().parent().blockUI_stop();
            if (data && data[0]) {
                $("#" + depotIdPrefixe + "_" + typeCourant).val(data[0].id).trigger('change');
            }
        }, function (msg) {
            toastr.error(msg);
        });
    };

    //Mettre produit dans tableau pour la production / decoupage
    $scope.mettreProduitDansTableau = function (tagForm, index, id, qte, depot_id, emballage_id = null) {
        var emballage = [];
        if ($scope.estEntier(emballage_id) == true) {
            emballage = $scope.getOneItem($scope.dataPage['emballages'], emballage_id);
        }

        var type = 'produit';
        var typeAvecS = type + 's';
        rewriteReq = typeAvecS + '(id:' + id + ')';
        Init.getElement(rewriteReq, listofrequests_assoc[typeAvecS]).then(function (data) {
            if (data && data[0]) {
                //console.log(data[0]);
                Init.getElement('depots(id:' + depot_id + ')', listofrequests_assoc["depots"]).then(function (dataDepot) {
                    if (dataDepot && dataDepot[0]) {
                        $scope.dataInTabPane[tagForm]['data'][index].composants.unshift({
                            "produit_id": id,
                            "produit": data[0],
                            "depot_id": depot_id,
                            "depot": dataDepot[0],
                            "emballage_id": emballage_id,
                            "emballage": emballage,
                            "qte_unitaire": qte
                        });
                    }
                }, function (msg) {
                    toastr.error(msg);
                });
            }
        }, function (msg) {
            toastr.error(msg);
        });
    };

    //Récupérer un élément du scope
    $scope.getOneItem = function (taleau, idElement) {
        console.log("getOneItem");
        var retour = [];
        $.each(taleau, function (keyItem, oneItem) {
            if (oneItem.id == idElement) {
                retour = oneItem;
                //console.log(retour);
                return retour;
            }
        });
        return retour;
    };


    //Récupérer le type de produit par son text id
    $scope.getTypeProduitByTextId = function (taleau, idElement) {
        console.log("getTypeProduitByTextId");
        var retour = [];
        $.each(taleau, function (keyItem, oneItem) {
            if (oneItem.text_id == idElement) {
                retour = oneItem;
                //console.log(retour);
                return retour;
            }
        });
        return retour;
    };

    //--DEBUT => mettre à jour input sur tableau--//
    $scope.mettreAjourInputsTableau = function (type, valeur, index, indexParent = null) {
        console.log("mettreAjourInputsTableau", "index", index, "indexParent", indexParent);
        //#tags: mettre a jour n'importe quel input dans le tableau
        if (type == 'quantite_total_final') {
            if (indexParent >= 0) {
                $scope.dataInTabPane['produits_bce']['data'][indexParent].entites[index].quantite_total_final = valeur;
            }
            console.log(JSON.stringify($scope.dataInTabPane['produits_bce']['data']));
        }
        else if (type == 'etatbciproduitentite') {
            if (indexParent >= 0) {
                if (valeur == 1) {
                    var quantite_total_final = $scope.dataInTabPane['produits_bce']['data'][indexParent].entites[index].quantite_total_final;
                    if (quantite_total_final > 0) {

                    } else {
                        valeur = 0;
                    }
                }
                $scope.dataInTabPane['produits_bce']['data'][indexParent].entites[index].etatbciproduitentite = valeur;
            }
            console.log(JSON.stringify($scope.dataInTabPane['produits_bce']['data']));
        }
        else if (type == 'prix_achat_ht_produit_be' || type == 'tva_produit_be') {
            var prixTtc = $scope.dataInTabPane['produits_be']['data'][index].prix_achat_ht;
            if ($scope.dataInTabPane['produits_be']['data'][index].tva) {
                prixTtc = prixTtc * 1.18;
            }
            prixTtc = $scope.arrondir(prixTtc);
            $scope.dataInTabPane['produits_be']['data'][index].prix_achat_fournisseur = prixTtc;
        }
    };
    //--FIN => mettre à jour input sur tableau--//

    $scope.showModalDetail = function (type, itemId, modal = null) {
        //console.log('showModalDetail');
        var mytype = type
        if (type == "bce" || type == "inventairelogistique" || type == "bci" || type == "be" || type == "bt" || type == "inventaire" || type == "entreestock" || type == "sortiestock") {
            if (type == "entreestock" || type == "sortiestock") {
                type = "entresortiestock";
                var typeAvecS = type + 'produits';
                rewriteReq = typeAvecS + '(entre_sortie_stock_id:' + itemId + ')';
            }
            else if (type == "inventaire" || type == "inventairelogistique") {
                type = "inventaire";
                var typeAvecS = type + 'produits';
                rewriteReq = typeAvecS + '(inventaire_id:' + itemId + ')';
            }
            /*    else if (type == "inventairelogistique" )
               {
                   type = "inventairelogistique";
                   var typeAvecS = type + 'produits';
                   rewriteReq = typeAvecS + '(inventaire_id:' + itemId + ')';
               } */
            else {
                var typeAvecS = type + 'produits';
                rewriteReq = typeAvecS + '(' + type + '_id:' + itemId + ')';
            }

            $scope.dataPage[typeAvecS] = [];

            Init.getElement(rewriteReq, listofrequests_assoc[typeAvecS]).then(function (data) {
                console.log(JSON.stringify(data))
                $scope.dataPage[typeAvecS] = data;
            }, function (msg) {
                toastr.error(msg);
            });

        }
        else if (type == 'facture' || type == 'facturetraiteur') {
            var type2 = 'detailfacture';
            var typeAvecS = type2 + 's';
            rewriteReq = typeAvecS + '(facture_id:' + itemId + ')';
            //$scope.emptyform(type2, true);
            //$scope.pageChanged(type2);

            $scope.dataPage[typeAvecS] = [];

            Init.getElement(rewriteReq, listofrequests_assoc[typeAvecS]).then(function (data) {
                console.log(JSON.stringify(data))
                $scope.dataPage[typeAvecS] = data;
            }, function (msg) {
                toastr.error(msg);
            });
        }
        else if (type == 'paiementfacture') {
            var typeAvecS = type + 's';
            rewriteReq = typeAvecS + '(facture_id:' + itemId + ')';
            //$scope.emptyform(type, true);
            //$scope.pageChanged(type);

            $scope.dataPage[typeAvecS] = [];

            Init.getElement(rewriteReq, listofrequests_assoc[typeAvecS]).then(function (data) {
                console.log(JSON.stringify(data))
                $scope.dataPage[typeAvecS] = data;
            }, function (msg) {
                toastr.error(msg);
            });
        }
        else {
            $scope.detailParentId = itemId;
            $scope.emptyform('detail' + type, true);
            $scope.pageChanged('detail' + type);
        }
        if (mytype == 'inventairelogistique') {
            type = 'inventairelogistique'
        }
        $("#modal_details" + type).modal('show');
    };

    $scope.calculTotalSansTva = function (totalTtc) {
        var tva = 18;
        var totalHt = 0;
        var diviseur = 1 + (parseFloat(tva / 100));
        if (diviseur > 0) {
            totalHt = totalTtc / diviseur;
        }
        var retour = Math.round(totalHt);
        return retour;
    };

    $scope.donneTotalR2aTechnique = function () {
        console.log("donneTotalR2aTechnique");
        var tva = 18;
        var total_pr = 0;
        var total_pr_off = 0;
        var nombre_portion = 1;
        var pv_ttc = 0;
        var pv_ht = 0;
        var taux_marque_ht = 0;
        var taux_marque_ht_off = 0;
        var taux_marque_ttc_off = 0;

        $.each($scope.dataInTabPane['r2atechniques_produit']['data'], function (keyItem, oneItem) {
            var pr = oneItem.pr; //cout
            var pr_off = oneItem.pr_off; //cout off
            total_pr = parseFloat(total_pr) + parseFloat(pr);
            total_pr_off = parseFloat(total_pr_off) + parseFloat(pr_off);
        });

        if ($scope.dataInTabPane['valeursft_produit']['data'].nombre_portion) {
            nombre_portion = $scope.dataInTabPane['valeursft_produit']['data'].nombre_portion;
        }

        if ($('#ft_pv_ttc_produit').val()) {
            pv_ttc = $('#ft_pv_ttc_produit').val();
        }

        if (pv_ttc > 0) {
            pv_ht = $scope.calculTotalSansTva(pv_ttc);
        }
        if (pv_ht > 0) {
            taux_marque_ht = ((pv_ht - total_pr) / pv_ht) * 100;
            taux_marque_ht_off = ((pv_ht - total_pr_off) / pv_ht) * 100;
            taux_marque_ttc_off = ((pv_ttc - total_pr_off) / pv_ttc) * 100;
        }

        //Affectations
        $scope.dataInTabPane['valeursft_produit']['data'].nombre_portion = nombre_portion;
        $scope.dataInTabPane['valeursft_produit']['data'].ft_tva = tva;
        $scope.dataInTabPane['valeursft_produit']['data'].ft_total_pr = parseFloat(total_pr).toFixed(2);
        $scope.dataInTabPane['valeursft_produit']['data'].ft_total_pr_off = parseFloat(total_pr_off).toFixed(2);
        $scope.dataInTabPane['valeursft_produit']['data'].ft_pv_ttc = parseFloat(pv_ttc).toFixed(2);
        $scope.dataInTabPane['valeursft_produit']['data'].ft_pv_ht = parseFloat(pv_ht).toFixed(2);
        $scope.dataInTabPane['valeursft_produit']['data'].ft_taux_marque_ht = parseFloat(taux_marque_ht).toFixed(2);
        $scope.dataInTabPane['valeursft_produit']['data'].ft_taux_marque_ht_off = parseFloat(taux_marque_ht_off).toFixed(2);
        $scope.dataInTabPane['valeursft_produit']['data'].ft_taux_marque_ttc_off = parseFloat(taux_marque_ttc_off).toFixed(2);
    };


    $scope.donneInfosProduit = function (type = "transfert", filtres = null) {
        var retour = 0;
        var idProduit = $("#produit_" + type).val();
        console.log("donneInfosProduit", idProduit);

        if (idProduit) {
            console.log("ID PRODUIT ==> " + idProduit);
            var typeAvecS = "produits";
            var rewriteReq = "";
            if (filtres) {
                rewriteReq = typeAvecS + "(id:" + idProduit + "," + filtres + ")";
            } else {
                rewriteReq = typeAvecS + "(id:" + idProduit + ")";
            }

            Init.getElement(rewriteReq, listofrequests_assoc[typeAvecS]).then(function (data) {
                if (data) {
                    console.log(data);
                    //Rajouté ici quand on a changé le select2 en dynamique
                    $scope.produitSelected = [];
                    $scope.produitSelected.push(data[0]);
                    console.log("PROD SELECTED ==> " + JSON.stringify($scope.produitSelected));
                }

            }, function (msg) {
                toastr.error(msg);
            });
        }
        return retour;
    };

    $scope.testSiUnElementEstDansTableau = function (type, tableau, idElement = null, idElement2 = null, element3 = null) {
        console.log('testSiUnElementEstDansTableau');
        var retour = false;
        try {
            idElement = parseInt(idElement);
            $.each(tableau, function (keyItem, oneItem) {
                if (type == "produit") {
                    if (oneItem.produit_id == idElement) {
                        retour = true;
                        return retour;
                    }
                }
                else if (type == "metier") {
                    if (oneItem.metier_id == idElement) {
                        retour = true;
                        return retour;
                    }
                }
                else if (type == "plan_code") {
                    if (oneItem.code == idElement2 && oneItem.question ==  element3)  {
                        retour = true;
                        return retour;
                    }
                }
                else if (type == "question_codification") {
                    if (oneItem.question_codif == idElement2 && oneItem.question_aide ==  element3)  {
                        retour = true;
                        return retour;
                    }
                }
               
                else if (type == "interventions_action") {
                    if (oneItem.operateur_id == idElement) {
                        retour = true;
                        return retour;
                    }
                }
                else if (type == "intervenants_evenement") {
                    if (oneItem.employe_id == idElement) {
                        retour = true;
                        return retour;
                    }
                }
                else if (type == "typebillets_cloturecaisse") {
                    if (oneItem.typebillet_id == idElement) {
                        retour = true;
                        return retour;
                    }
                }
                else if (type == "encaissements_cloturecaisse") {
                    if (oneItem.mode_paiement_id == idElement) {
                        retour = true;
                        return retour;
                    }
                }
                else if (type == "entitestransactions_general" || type == "entites_postedepense") {
                    if (oneItem.entite_id == idElement) {
                        retour = true;
                        return retour;
                    }
                }
                else if (type == "postedepenses_depense") {
                    if (oneItem.poste_depense_id == idElement && oneItem.tva_checkbox == idElement2) {
                        retour = true;
                        return retour;
                    }
                }
                else if (type == "familleactions_operateur") {
                    if (oneItem.famille_action_id == idElement) {
                        retour = true;
                        return retour;
                    }
                }
                else if (type == "items_facture") {
                    if (oneItem.id == idElement) {
                        retour = true;
                        return retour;
                    }
                }
                else if (type == "produits_production" || type == "produits_decoupage") {
                    if (oneItem.produit_id == idElement) {
                        $.each($scope.dataInTabPane[type]['data'][keyItem].composants, function (keyItem2, oneItem2) {
                            if (oneItem2.produit_id == idElement2) {
                                retour = true;
                                return retour;
                            }
                        });
                    }
                }
                else {
                    if (oneItem.produit_id == idElement) {
                        retour = true;
                        return retour;
                    }
                }
            });
        } catch (error) {
            console.log('testSiUnElementEstDansTableau error =', error);
        }

        return retour;
    };


    /*** FONCTIONS PERSONNALISEES POUR LE FONCTIONNEMENT ***/



    // to rewrite url of select2 search
    function dataUrlEntity(query, entity) {
        console.log("dataUrlEntity");

        rewriteelement = entity + 's('
            + ((query.term) ? ',search:' + '"' + query.term + '"' : "")
            + (($("#modal_addcommande").data('bs.modal') || {})._isShown && $('#entite_commande').val() ? ',restaurant_id:' + $('#entite_commande').val() : "");

        if ($scope.currentTemplateUrl && $scope.currentTemplateUrl.indexOf('list-production') !== -1 || $scope.currentTemplateUrl && $scope.currentTemplateUrl.indexOf('list-assemblage') !== -1) {
            if (entity == 'famille') {
                if ($scope.currentTemplateUrl && $scope.currentTemplateUrl.indexOf('list-production') !== -1) {
                    //rewriteelement += ',matiere_premiere:1';
                }

                if ($scope.currentTemplateUrl && $scope.currentTemplateUrl.indexOf('list-assemblage') !== -1) {
                    rewriteelement += ',pour_carte:1';
                }
            }
            if (entity == 'produit') {
                var famille_id = null;
                var famille_list = null;
                if ($scope.currentTemplateUrl && $scope.currentTemplateUrl.indexOf('list-production') !== -1) {

                    famille_id = $("#famille_production").val();
                    var depot_id = $("#depot_production").val();
                    var famille_list = $("#famille_list_production").val();


                    if ($('#modal_addproduction').hasClass('modal') && $('#modal_addproduction').hasClass('show')) {
                        if ($('#entreproduction').hasClass('active')) {
                            //rewriteelement += ',production:1';
                            /*  if(depot_id){
                                 rewriteelement += ',depot_id:'+depot_id;
                             }else {
                                 rewriteelement = null;
                             } */
                        }

                        if ($('#sortieproduction').hasClass('active')) {
                            rewriteelement += ',sortie_production:1';
                        }
                    } else {
                        var is_filter_prod = $("#enabled_status_list_production").prop('checked');
                        console.log('----------------------production ou pas-----------------------');
                        console.log(is_filter_prod);
                        is_filter_prod = !is_filter_prod;
                        if (is_filter_prod == false) {
                            rewriteelement += ',production:1';
                        } else {
                            rewriteelement += ',sortie_production:1';
                        }
                        //sortie_production


                    }

                }
                if ($scope.currentTemplateUrl && $scope.currentTemplateUrl.indexOf('list-assemblage') !== -1) {
                    famille_id = $("#famille_assemblage").val();
                    rewriteelement += ',assemblage:1';
                }

                if (famille_id) {
                    if (rewriteelement) {
                        rewriteelement += ',famille_id:' + famille_id;
                    }
                } else {
                    if (famille_list) {
                        rewriteelement += ',famille_id:' + famille_list;
                    }

                }
            }

        }
        if ($scope.currentTemplateUrl && $scope.currentTemplateUrl.indexOf('list-inventaire') !== -1) {
            rewriteelement += ',context:"inventaire"'
        }
        if ($scope.currentTemplateUrl && $scope.currentTemplateUrl.indexOf('list-commande') !== -1) {
            var entite_id = $scope.restaurant_commande;
            if (!$scope.restaurant_commande) {
                $scope.restaurant_commande = $('#entite_commande').val();
            }

            if ($scope.restaurant_commande) {
                rewriteelement += ',entite_id:' + entite_id;
            }
            if (entity == 'produit') {
                rewriteelement += ',is_carte:true';
            }
            if (entity == 'reservation') {
                rewriteelement += ',reservation_du_jour:true';
            }
        }

        if ($scope.currentTemplateUrl && ($scope.currentTemplateUrl.indexOf('list-proforma') !== -1 || $scope.currentTemplateUrl.indexOf('list-traiteur') !== -1)) {
            if (entity == 'famille') {
                rewriteelement += ',is_traiteur:1';
            }

            if (entity == 'produit') {
                if ($('#r2aproforma').hasClass('active')) {
                    $scope.famille_carte_clicked = null;
                    rewriteelement += ',is_traiteur:1';
                }
            }
            if (entity == 'employe') {
                if ($scope.departement_rh) {
                    rewriteelement += ',departement_id:' + $scope.departement_rh;
                }
            }
        }

        if ($scope.currentTemplateUrl && ($scope.currentTemplateUrl.indexOf('list-carte') !== -1)) {
            if (entity == 'famille') {
                rewriteelement += ',nature:1';
                rewriteelement += ',pour_carte:1';
            }
        }
        if ($scope.currentTemplateUrl && $scope.currentTemplateUrl.indexOf('list-bci') !== -1) {
            if (entity == 'produit') {
                if ($scope.famille_bci_produit) {
                    rewriteelement += ',famille_id:' + $scope.famille_bci_produit;
                }
                rewriteelement += ',source:"bci"';

            }

        }
        if (entity == 'produit') {
            if ($scope.famille_carte_clicked) {
                rewriteelement += ',famille_id:' + $scope.famille_carte_clicked;
            }
        }
        rewriteelement += ')';
        rewriteelement = encodeURIComponent(rewriteelement);
        rewriteelement = BASE_URL + 'graphql?query={' + rewriteelement + "{" + listofrequests_assoc[entity + 's'] + "}}";
        // console.log('url', rewriteelement);
        return rewriteelement;
    }

    // To get Data of search select2
    function processResultsForSearchEntity(getData, entity) {
        console.log("processResultsForSearchEntity");
        if (entity) {
            getData = getData.data[entity + 's'];
            //$scope.dataPage[entity + 's'] = getData;
        } else {
            getData = [];
        }

        var resultsData = [];
        $.each(getData, function (keyItem, valueItem) {
            if (entity) {
                // console.log('valueItem=>', resultsData, $.isNumeric(valueItem.id));

                var value = valueItem.nom;

                // console.log('valueItem=>', resultsData, value);
                if (value) {

                } else {
                    // console.log('----vide----');
                    // console.log(valueItem.designation);
                    value = valueItem.designation;
                }

                if (entity == "client") {
                    contentToPush = { id: valueItem.id, text: valueItem.raison_sociale };
                }
                else if (entity == "metier") {
                    contentToPush = { id: valueItem.id, text: valueItem.designation + ' (' + valueItem.code_rome + ')' };
                }
                else {
                    contentToPush = { id: valueItem.id, text: valueItem.designation };
                }

            } else contentToPush = null;

            if (contentToPush) {
                resultsData.push(contentToPush);
            }
            if (entity == 'produit') {

                if (valueItem) {
                    $scope.item_select = valueItem;
                }
            }
        });

        if (entity == 'produit') {

            if (getData != null && getData.length == 1) {
                $scope.produit_compose = getData[0];
            }
        }

        console.log('getData => ', getData, '/ dataPage => ', $scope.dataPage[entity + 's'], 'results =>', resultsData);

        return {
            results: resultsData
        };
    }

    $scope.montantHtAndTTC = function (mnt, ttc) {

        return ttc ? (mnt * 18) / 100 : (mnt * 18) / 100;
    }

    $scope.activeHtOrTtcInTab = function (tab, keyht, keyttc, ttc) {
        var mntTotal = 0;

        if (ttc) {
            for (var i = 0; i < tab.length; i++) {
                tab[i][keyttc] = !tab[i][keyttc] ? tab[i][keyht] + $scope.montantHtAndTTC(tab[i][keyht], ttc) : tab[i][keyttc];
                mntTotal = mntTotal + (tab[i][keyttc] * tab[i].quantite);
            }
        } else {
            for (var i = 0; i < tab.length; i++) {
                tab[i][keyttc] = undefined;
                mntTotal = mntTotal + (tab[i][keyht] * tab[i].quantite);
            }
        }

        $scope.dataInTabPane['r2acomm_proforma']['data'].total_unitaire = mntTotal;

    }
    $scope.remiseMontant = function (mnt, remise) {
        return (mnt * remise) / 100;
    }
    $scope.calculeRemise = function (source, cible, operateur, tag) {
        var montantInitial = $("#" + source + "_" + tag).val();

        if (montantInitial && operateur) {
            var remise = operateur;
            var montant_remise = parseFloat($scope.remiseMontant(montantInitial, remise));
            var montantHtRemise = montantInitial - montant_remise;
            $("#" + cible + "_" + tag).val(montantHtRemise);
            $("#montant_remise_propositioncommerciale").val(Math.round(montant_remise));

            $scope.montantHTtoTTC('direct', montantHtRemise, 'montant_tva_remise_' + tag, 'montant_ttc_remise_' + tag);

        } else {
            $("#" + cible + "_" + tag).val('');
            $("#montant_tva_remise_propositioncommerciale").val('');
            $("#montant_ttc_remise_propositioncommerciale").val('');
            $("#montant_remise_propositioncommerciale").val('');
            $scope.montantHTtoTTC('direct', montantInitial, 'montanttva_par_personne_propositioncommerciale', 'montanttc_par_personne_propositioncommerciale');
        }

    }

    $scope.montantHTtoTTC = function (format, montant, tagFormTVA, tagFormTTC) {
        var montantHT = parseFloat(montant);
        var nbpersonne = $("#nombre_personne_propositioncommerciale").val();

        var montantTVA = !$scope.exotva_propositioncommerciale || $scope.exotva_propositioncommerciale == false ? (montantHT * 18) / 100 : 0;
        var montantTTC = !$scope.exotva_propositioncommerciale || $scope.exotva_propositioncommerciale == false ? montantHT + montantTVA : 0;

        var forfaitHT = montantHT * nbpersonne;
        var forfaitTTC = !$scope.exotva_propositioncommerciale || $scope.exotva_propositioncommerciale == false ? montantTTC * nbpersonne : 0;
        var forfaitTVA = !$scope.exotva_propositioncommerciale || $scope.exotva_propositioncommerciale == false ? montantTVA * nbpersonne : 0;

        $("#" + tagFormTTC).val(Math.round(montantTTC));
        $("#" + tagFormTVA).val(Math.round(montantTVA));

        $("#forfait_propositioncommerciale").val(Math.round(forfaitHT));
        $("#forfait_ttc_propositioncommerciale").val(Math.round(forfaitTTC));
        $("#forfait_tva_propositioncommerciale").val(Math.round(forfaitTVA));
    }

    //Calcule la durée pour les tranches horaires
    $scope.calculDureeHeure = function () {
        console.log("calculDureeHeure");
        var heure_debut = $("#heure_debut_tranchehoraire").val();
        var heure_fin = $("#heure_fin_tranchehoraire").val();
        var date1 = new Date("06/30/2019 " + heure_debut).getHours();
        var date2 = new Date("06/30/2019 " + heure_fin).getHours();

        if (heure_debut && heure_fin) {
            var Difference_In_Time = date2 - date1;
            if (Difference_In_Time < 0) {
                Difference_In_Time = 24 + Difference_In_Time;
            }
            console.log(Difference_In_Time);
            $("#duree_tranchehoraire").val(parseInt("" + Difference_In_Time));
        }
    }

    $scope.calculeForfait = function (action = null) {
        var type = 'propositioncommerciale';
        var nbpersonne = $scope.nombre_personne;
        var mntpersonne = $scope.montant_par_personne;
        var forfaitHT;
        var forfaitTTC;
        var forfaitTVA;

        if (nbpersonne && mntpersonne) {

            $("#montanttc_par_personne_" + type).on("change paste keyup", function () {
                var montantTTC = parseFloat($(this).val());
                var montantHT = montantTTC / 1.18;
                var montantTVA = montantTTC - montantHT;

                forfaitHT = nbpersonne * montantHT;
                forfaitTTC = !$scope.exotva_propositioncommerciale || $scope.exotva_propositioncommerciale == false ? montantTTC * nbpersonne : 0;
                forfaitTVA = !$scope.exotva_propositioncommerciale || $scope.exotva_propositioncommerciale == false ? montantTVA * nbpersonne : 0;


                $("#montant_par_personne_" + type).val(!$scope.exotva_propositioncommerciale || $scope.exotva_propositioncommerciale == false ? Math.round(montantHT) : 0);
                $("#montanttva_par_personne_" + type).val(!$scope.exotva_propositioncommerciale || $scope.exotva_propositioncommerciale == false ? Math.round(montantTVA) : 0);

                if ($("#remise_propositioncommerciale").val()) {
                    var remise = $("#remise_propositioncommerciale").val();
                    $scope.calculeRemise('montant_par_personne', 'montant_ht_remise', remise, 'propositioncommerciale');
                } else {
                    $("#forfait_propositioncommerciale").val(Math.round(forfaitHT));
                    $("#forfait_ttc_propositioncommerciale").val(Math.round(forfaitTTC));
                    $("#forfait_tva_propositioncommerciale").val(Math.round(forfaitTVA));
                }


            });

            $("#montant_par_personne_propositioncommerciale").on("change paste keyup", function () {
                $scope.calculTTTbyHT(mntpersonne, nbpersonne);
            });
            if (!$scope.montanttc_par_personne) {
                $scope.calculTTTbyHT(mntpersonne, nbpersonne);
            }

            $scope.calculFofaitRestaurationTotal();

        } else {
            $("#forfait_propositioncommerciale").val('');
            $("#montanttva_par_personne_propositioncommerciale").val('');
            $("#forfait_tva_propositioncommerciale").val('');
        }

        $('#forfait_propositioncommerciale').on("change paste keyup", function () {
            $scope.disableOnkeyUp($(this).val(), 'forfait_', 'propositioncommerciale', action);
        });

        $('#forfait_ttc_propositioncommerciale').on("change paste keyup", function () {
            $scope.disableOnkeyUp($(this).val(), 'forfait_ttc_', 'propositioncommerciale', action);
        });

    }
    $scope.calculFofaitRestaurationTotal = function () {

        $("#nombre_personne_propositioncommerciale").on("change paste keyup", function () {
            var nbpersonne = $scope.nombre_personne;
            var mntpersonne = $scope.montant_par_personne;
            var nombrePersonne = $(this).val();
            var montantTTC = $("#montanttc_par_personne_propositioncommerciale").val();
            var montantHT = $("#montant_par_personne_propositioncommerciale").val();
            var montantTVA = $("#montanttva_par_personne_propositioncommerciale").val();

            forfaitHT = nbpersonne * montantHT;

            forfaitTTC = $scope.exotva_propositioncommerciale && $scope.exotva_propositioncommerciale == true ? montantTTC * nbpersonne : 0;
            forfaitTVA = $scope.exotva_propositioncommerciale && $scope.exotva_propositioncommerciale == true ? montantTVA * nbpersonne : 0;



            if ($("#remise_propositioncommerciale").val()) {
                var remise = $("#remise_propositioncommerciale").val();
                $scope.calculeRemise('montant_par_personne', 'montant_ht_remise', remise, 'propositioncommerciale');
            } else {
                $("#forfait_propositioncommerciale").val(Math.round(forfaitHT));
                $("#forfait_ttc_propositioncommerciale").val(Math.round(forfaitTTC));
                $("#forfait_tva_propositioncommerciale").val(Math.round(forfaitTVA));
            }

        });
    }


    $scope.calculTTTbyHT = function (mntpersonne, nbpersonne) {

        if (mntpersonne && nbpersonne) {
            var montantHT = mntpersonne;

            var montantTTC = !$scope.exotva_propositioncommerciale || $scope.exotva_propositioncommerciale == false ? parseFloat(montantHT) + (montantHT * 18) / 100 : 0;
            var montantTVA = !$scope.exotva_propositioncommerciale || $scope.exotva_propositioncommerciale == false ? (montantHT * 18) / 100 : 0;
            forfaitHT = nbpersonne * mntpersonne;
            forfaitTTC = !$scope.exotva_propositioncommerciale || $scope.exotva_propositioncommerciale == false ? montantTTC * nbpersonne : 0;
            forfaitTVA = !$scope.exotva_propositioncommerciale || $scope.exotva_propositioncommerciale == false ? montantTVA * nbpersonne : 0;

            $("#montanttc_par_personne_propositioncommerciale").val(Math.round(montantTTC));
            $scope.montanttc_par_personne = Math.round(montantTTC);
            $("#montanttva_par_personne_propositioncommerciale").val(Math.round(montantTVA));
            $scope.montanttva_par_personne = Math.round(montantTVA);

            if ($("#remise_propositioncommerciale").val()) {
                var remise = $("#remise_propositioncommerciale").val();
                $scope.calculeRemise('montant_par_personne', 'montant_ht_remise', remise, 'propositioncommerciale');
            } else {
                $("#forfait_propositioncommerciale").val(Math.round(forfaitHT));
                $("#forfait_ttc_propositioncommerciale").val(Math.round(forfaitTTC));
                $("#forfait_tva_propositioncommerciale").val(Math.round(forfaitTVA));
            }
        }


    }
    $scope.calculeForfaitOptionMateriel = function (type = 'details') {
        if (type == 'details') {
            $("#montant_ht_option_materiel").on("change  keyup", function () {
                var montantHT = parseFloat($("#montant_ht_option_materiel").val())
                if (!montantHT) {
                    montantHT = 0;
                }
                var montantTTC = montantHT + ((montantHT * 18) / 100)
                $("#montant_option_materiel").val(montantTTC);
            });
            $("#montant_option_materiel").on("change paste keyup", function () {


            });
        } else {
            $("#forfait_direct_materiel_propositioncommerciale").prop('checked', true);
            $scope.forfait_direct_materiel_propositioncommerciale = true;
            $("#forfait_option_materiel_ht").on("change paste keyup", function () {
                var montantHT = parseFloat($("#forfait_option_materiel_ht").val())
                if (!montantHT) {
                    montantHT = 0;
                    $("#forfait_direct_materiel_propositioncommerciale").prop('checked', false);
                    $scope.forfait_direct_materiel_propositioncommerciale = false;
                }
                var montantTTC = montantHT + ((montantHT * 18) / 100)
                $("#forfait_option_materiel").val(montantTTC);
            });

        }


    }

    $scope.disableOnkeyUp = function (val, tagForm, type, action = null) {
        if ($("#" + tagForm + type).val()) {

            if (tagForm == 'forfait_ttc_') {
                $("#forfait_" + type).val('');
                $("#forfait_tva_" + type).val('');

                if (val) {
                    var montantTTC = parseFloat(val);
                    var montantHT = !$scope.exotva_propositioncommerciale || $scope.exotva_propositioncommerciale == false ? montantTTC / 1.18 : 0;
                    var montantTVA = !$scope.exotva_propositioncommerciale || $scope.exotva_propositioncommerciale == false ? montantTTC - montantHT : 0;

                    $("#forfait_tva_" + type).val(Math.round(montantTVA));
                    $("#forfait_" + type).val(Math.round(montantHT));
                }

            } else if (tagForm == 'forfait_') {
                if (val) {
                    $("#forfait_ttc_" + type).val('');
                    $("#forfait_tva_" + type).val('');
                    var montantHT = val;
                    var montantTVA = !$scope.exotva_propositioncommerciale || $scope.exotva_propositioncommerciale == false ? (parseFloat(montantHT) * 18) / 100 : 0;
                    var montantTTC = !$scope.exotva_propositioncommerciale || $scope.exotva_propositioncommerciale == false ? parseFloat(montantHT) + montantTVA : 0;

                    $("#forfait_ttc_" + type).val(Math.round(montantTTC));
                    $("#forfait_tva_" + type).val(Math.round(montantTVA));
                }

            }

            if (tagForm == 'forfait_ttc_' || tagForm == 'forfait_') {
                $scope.ondisableInput(true, action);
            }

        } else {
            if (tagForm == 'forfait_ttc_' || tagForm == 'forfait_') {
                $scope.ondisableInput(false);
            }
        }
    }

    $scope.remiseHt = function () {

        var remise = $scope.dataInTabPane['r2acomm_proforma']['data'].remiseHt;
        var montantTotal = $scope.dataInTabPane['r2acomm_proforma']['data'].total_unitaire;
        var montantRemise = 0;
        montantRemise = montantTotal > 0 ? montantTotal - $scope.remiseMontant(montantTotal, remise) : 0;
        $scope.dataInTabPane['r2acomm_proforma']['data'].total_unitaire = montantRemise;

        $("#cout_total_r2acomm_proforma").val(montantRemise);

    }
    $scope.updateCheckForfait = function () {
        var disable = $scope.forfait_direct_menu_propositioncommerciale;
        $scope.ondisableInput(disable, 'edit');
    }
    $scope.updateCheckpaiementProduit = function (item, index) {
        var montant_paiement = $("#montant_paiement").val();
        var is_paiement = item.etat_paiement;//$("#paiement_produit"+index).prop("checked");
        console.log('---------Paiement-------');
        console.log(montant_paiement, is_paiement, index)
        if (!montant_paiement) {
            montant_paiement = 0;
        }
        montant_paiement = parseInt(montant_paiement);
        if (is_paiement) {
            montant_paiement += parseInt(item.montant);
        } else {

            montant_paiement -= parseInt(item.montant);
        }

        $scope.showToast('Paiement commande', is_paiement ? 'Ajouté' : 'Enlevé', is_paiement ? 'success' : 'warning');

        $("#montant_paiement").val(montant_paiement);
        $scope.montant_paiement = montant_paiement;
    }

    $scope.updateCheckExoTva = function () {
        var disable = $scope.exotva_propositioncommerciale;
        var type = 'propositioncommerciale';
        $("#exotva_propositioncommerciale").prop("checked", disable);
        if (disable) {
            $("#montanttva_par_personne_" + type).attr("disabled", true);
            $("#montanttc_par_personne_" + type).attr("disabled", true);

            $("#forfait_tva_" + type).attr("disabled", true);
            $("#forfait_ttc_" + type).attr("disabled", true);

            $("#montant_tva_remise_" + type).attr("disabled", true);
            $("#montant_ttc_remise_" + type).attr("disabled", true);

            $("#montanttc_par_personne_" + type).val('');
            $("#montanttva_par_personne_" + type).val('');

            $("#forfait_tva_" + type).val('');
            $("#forfait_ttc_" + type).val('');

            $("#montant_tva_remise_" + type).val('');
            $("#montant_ttc_remise_" + type).val('');
        }
        else {
            $("#forfait_tva_" + type).attr("disabled", false);
            $("#forfait_ttc_" + type).attr("disabled", false);
            $("#montanttc_par_personne_" + type).val('');
            $("#montanttva_par_personne_" + type).val('');
            $("#forfait_tva_" + type).val('');
            $("#forfait_ttc_" + type).val('');
            $("#montant_tva_remise_" + type).val('');
            $("#montant_ttc_remise_" + type).val('');
            var nbpersonne = $scope.nombre_personne;
            var mntpersonne = $scope.montant_par_personne;
            if (!$scope.forfait_direct_menu_propositioncommerciale || $scope.forfait_direct_menu_propositioncommerciale == false) {
                $("#montanttva_par_personne_" + type).attr("disabled", false);
                $("#montanttc_par_personne_" + type).attr("disabled", false);

                $("#montant_tva_remise_" + type).attr("disabled", false);
                $("#montant_ttc_remise_" + type).attr("disabled", false);

                $scope.calculTTTbyHT(mntpersonne, nbpersonne);
            }

            var forfaitHT = $("#forfait_propositioncommerciale").val();
            var forfaitTTC = !$scope.exotva_propositioncommerciale || $scope.exotva_propositioncommerciale == false ? parseInt(forfaitHT) + ((parseInt(forfaitHT) * 18) / 100) : 0;
            var forfaitTVA = !$scope.exotva_propositioncommerciale || $scope.exotva_propositioncommerciale == false ? (parseInt(forfaitHT) * 18) / 100 : 0;

            if ($("#remise_propositioncommerciale").val()) {
                var remise = $("#remise_propositioncommerciale").val();
                $scope.calculeRemise('montant_par_personne', 'montant_ht_remise', remise, 'propositioncommerciale');
            } else {
                $("#forfait_ttc_propositioncommerciale").val(Math.round(forfaitTTC));
                $("#forfait_tva_propositioncommerciale").val(Math.round(forfaitTVA));
            }
        }

    }
    $scope.ondisableInput = function (disable, action = null) {
        var type = 'propositioncommerciale';
        if (disable) {
            // $scope.forfait_direct_menu_propositioncommerciale = true;
            // $("#forfait_direct_menu_propositioncommerciale").prop('checked', true);
            console.log('************************************************************************')
            console.log($scope.forfait_direct_menu_propositioncommerciale, action);

            if ((($scope.forfait_direct_menu_propositioncommerciale == true && action == 'edit'))) {
                $("#forfait_direct_menu_propositioncommerciale").prop('checked', true);
                $("#montant_par_personne_" + type).attr("disabled", true);
                $("#montanttva_par_personne_" + type).attr("disabled", true);
                $("#remise_" + type).attr("disabled", true);
                $("#montant_remise_" + type).attr("disabled", true);
                $("#montanttc_par_personne_" + type).attr("disabled", true);
                $("#montant_ht_remise_" + type).attr("disabled", true);
                $("#montant_tva_remise_" + type).attr("disabled", true);
                $("#montant_ttc_remise_" + type).attr("disabled", true);

                $("#montant_par_personne_" + type).val('');
                $("#montanttva_par_personne_" + type).val('');
                $("#remise_" + type).val('');
                $("#montant_remise_" + type).val('');
                $("#montanttc_par_personne_" + type).val('');
                $("#montant_tva_remise_" + type).val('');
                $("#montant_ttc_remise_" + type).val('');
                $("#montant_ht_remise_" + type).val('');
            }

        } else {
            //  $scope.forfait_direct_menu_propositioncommerciale = false;
            // $("#forfait_direct_menu_propositioncommerciale").prop('checked', false);

            $("#montant_par_personne_" + type).attr("disabled", false);
            $("#montanttva_par_personne_" + type).attr("disabled", false);
            $("#remise_" + type).attr("disabled", false);
            $("#montant_remise_" + type).attr("disabled", false);
            $("#montanttva_par_" + type).attr("disabled", false);
            $("#montanttc_par_personne_" + type).attr("disabled", false);
            $("#montant_ht_remise_" + type).attr("disabled", false);
            $("#montant_tva_remise_" + type).attr("disabled", false);
            $("#montant_ttc_remise_" + type).attr("disabled", false);

            $("#forfait_" + type).val('');
            $("#forfait_ttc_" + type).val('');
            $("#forfait_tva_" + type).val('');
        }
    }


    $scope.manageAfterSelect2 = function (type, idType, info = true, tagForm = '', currentPosition = null, indexNameInTab = null, rewriteReqnew, pagination = false, form = null) {

        if (pagination == false) {
            rewriteReq = `${type}s(id:${idType})`;
            console.log("------------Le form -------------")
            console.log(form);
            if (form) {
                $('#modal_add' + form).blockUI_start();
            }
            Init.getElement(rewriteReqnew, listofrequests_assoc[`${type}s`]).then(function (data) {
                if (form) {
                    $('#modal_add' + form).blockUI_stop();
                }
                if (data && data.length > 0) {

                    if (type == 'typeclient') {
                        //Regle de gestion pour type client
                        console.log('Regle de gestion pour type client');
                        if (data[0].designation == 'B2B') {
                            $("#civilite_" + type).fadeOut('slow');
                            $("#rcc_" + type).fadeIn('slow');
                        } else {
                            $("#rcc_" + type).fadeOut('slow');
                            $("#civilite_" + type).fadeIn('slow');
                        }
                    }
                    else if (type == 'typeproduit') {
                        //Regle de gestion pour type produit
                        console.log('Regle de gestion pour type produit');
                        if (data[0].designation == 'Matières premières') {
                            $("#pa").fadeIn('slow');
                            $("#seuil").fadeIn('slow');
                            //  $("#r2a").fadeOut('slow');
                            $("#ac").fadeOut('slow');
                            $("#promo").fadeOut('slow');
                        } else if (data[0].designation == "Matières transformées") {
                            //$("#r2a").fadeIn('slow');
                            $("#ac").fadeIn('slow');
                            $("#promo").fadeIn('slow');
                            //  $("#pv").fadeIn('slow');
                            $("#pa").fadeOut('slow');

                        } else if (data[0].designation == "Produits finis") {
                            $("#seuil").fadeOut('slow');
                        }
                        /*if(data[0].designation !== 'Matières premières') {
                            $("#prix_achat_unitaire_produit").prop('required',false);
                        }*/
                    }
                    else if (type == 'produit') {
                        // console.log('------------------Le produit du depot-------------');
                        // console.log(data);
                        $scope.item_select = data[0];

                        //Affichage unitedemesure du produit choisi par select 2 search
                        console.log('------------tagForm---------')
                        console.log(tagForm);
                        $(".unite-mesure").val(data[0].unite_de_mesure ? data[0].unite_de_mesure.designation : 'Ce produit n\a pas une unité de mesure');
                        $(".prix-achat").val(data[0].prix_achat_unitaire ? data[0].prix_achat_unitaire : 0);
                        $(".prix-achat-ttc").val(data[0].prix_achat_ttc ? data[0].prix_achat_ttc : 0);

                        //  $("#puttc_produits_bci").val(data[0].prix_achat_unitaire ? data[0].prix_achat_unitaire : 0);

                        if (tagForm == 'produitold_produits_inventaire') {
                            $(".qte-courante").val(data[0].current_quantity ? data[0].current_quantity : null);
                            $("#quantite_theorique_produits_inventaire").val(data[0].quantite_theorique);
                            $("#nomenclature_produits_inventaire").val(data[0].nomenclature ? data[0].nomenclature.designation : null);
                            $("#pa_ht_produits_inventaire").val(data[0].prix_achat_unitaire ? data[0].prix_achat_unitaire : null);
                            $("#pa_ttc_produits_inventaire").val(data[0].prix_achat_ttc ? data[0].prix_achat_ttc : null);
                            $("#quantite_reel_produits_inventaire").val(null);
                        }

                        if (tagForm == 'produitold_produits_inventairelogistique') {
                            $(".quantite-theorique").val(data[0].current_quantity ? data[0].current_quantity : null);
                            $("#quantite_theorique_produits_inventairelogisitique").val(data[0].current_quantity);
                            $("#nomenclature_produits_inventairelogisitique").val(data[0].nomenclature ? data[0].nomenclature.designation : null);
                            $("#pa_ht_produits_inventairelogisitique").val(data[0].prix_achat_unitaire ? data[0].prix_achat_unitaire : null);
                            $("#pa_ttc_produits_inventairelogisitique").val(data[0].prix_achat_ttc ? data[0].prix_achat_ttc : null);
                            $("#quantite_reel_produits_inventairelogisitique").val(null);
                        }
                        if (tagForm == 'produitproduits_production') {
                            $("#qte_unitaire_produits_production").val(data[0].current_quantity);
                        }
                        if (tagForm == 'produitproduits_decoupage') {
                            $("#qte_unitaire_produits_decoupage").val(data[0].current_quantity);
                        }

                        if (info == true) {
                        } else {

                            if (tagForm == 'r2atechniques_produit' || tagForm == 'r2atechniques_proforma' ||
                                tagForm == 'r2acomm_proforma' || tagForm == 'produits_propositioncommerciale' ||
                                tagForm == 'produits_bci') {

                                var id_r2a = $('#id_r2atechniques_proforma_produit').val();

                                var error = null;
                                //  error = tagForm == 'r2atechniques_proforma' && !$scope.proposition ? 'Veuillez choisir ou renseigner un titre et une date d\'abord' : error
                                error = tagForm == 'r2acomm_proforma' && !$("#typeprixvente_proforma").val() ? 'Veuillez choisir un type de prix d\'abord' : error

                                if (error == null) {

                                    if (tagForm == 'r2atechniques_proforma') {

                                        var item2 = data[0];
                                        var tagMp = 'r2atechniques_proforma';
                                        var tagCom = 'r2acomm_proforma';

                                        error = $scope.dataInTabPane['r2acomm_proforma']['data'].length <= 0 ? 'Veuillez ajouter une proposition commericiale d\'abord' : error
                                        if (error == null) {
                                            var nombreCouvert = $scope.dataInTabPane['r2acomm_proforma']['data'][0].nombre_personne;
                                            if (item2.r2atechniques && item2.r2atechniques.length > 0) {
                                                var r2atechniques = item2.r2atechniques;

                                                r2atechniques.forEach(item3 => {
                                                    console.log('r2a technique 1: ')
                                                    console.log(item3)

                                                    var searchProd = $filter('filter')($scope.dataInTabPane[tagMp]['data'], { produit_compose_id: item3.produit_compose_id });

                                                    console.log('-------search prod----------');
                                                    console.log(searchProd);

                                                    if (searchProd && searchProd.length == 1) {
                                                        console.log('trouve: ');
                                                        console.log(searchProd[0]);

                                                        let index = $scope.dataInTabPane[tagMp]['data'].indexOf(searchProd[0]);
                                                        var quantite = item3.portion_unitaire * nombreCouvert;
                                                        var quantiteInit = $scope.dataInTabPane[tagMp]['data'][index].portion_unitaire;

                                                        $scope.dataInTabPane[tagMp]['data'][index].portion_unitaire = quantiteInit + quantite;
                                                        var cout = $scope.dataInTabPane[tagMp]['data'][index].portion_unitaire * $scope.dataInTabPane[tagMp]['data'][index].pru;
                                                        $scope.dataInTabPane[tagMp]['data'][index].cost = cout;
                                                        //$scope.dataInTabPane[tagMp]['data'][index].nombre_couvert = item1.nombre_personne;
                                                        //$scope.dataInTabPane[tagMp]['data'][index].proposition = item1.proposition;

                                                    } else if (!searchProd || searchProd.length == 0) {


                                                        var quantite = item3.portion_unitaire * nombreCouvert;
                                                        var cout = item3.pru * quantite;
                                                        var prod = {
                                                            produit_compose_id: item3.produit_compose_id,
                                                            produit_compose: item3.produit_compose,
                                                            portion_unitaire: quantite,
                                                            unite_de_mesure: item3.unite_de_mesure,
                                                            cost: cout,
                                                            pru: item3.pru,
                                                        }
                                                        console.log('non trouve: ')
                                                        console.log(searchProd[0]);
                                                        $scope.dataInTabPane[tagMp]['data'].push(prod);
                                                    }

                                                });

                                            }
                                        } else {
                                            $scope.showToast('', error, 'error');
                                        }

                                    }
                                    else {
                                        tagForm = tagForm == 'produits_propositioncommerciale' ? 'familles_propositioncommerciale' : tagForm;

                                        $scope.dataInTabPane[tagForm]['data'].push({});

                                        currentPosition = tagForm == 'produits_propositioncommerciale' ? $scope.dataInTabPane[tagForm]['data'].length : currentPosition;

                                        $scope.dataInTabPane[tagForm]['data'][currentPosition]['pru'] = data[0].prix_achat_unitaire;
                                        $scope.dataInTabPane[tagForm]['data'][currentPosition]['produit_compose_id'] = data[0].id;
                                        $scope.dataInTabPane[tagForm]['data'][currentPosition]['produit_compose'] = { 'designation': data[0].designation };
                                        $scope.dataInTabPane[tagForm]['data'][currentPosition]['produit'] = { 'designation': data[0].designation, 'prix_achat_unitaire': data[0].prix_achat_unitaire ? data[0].prix_achat_unitaire : 0, 'prix_achat_ttc': data[0].prix_achat_ttc ? data[0].prix_achat_ttc : 0, "unite_de_mesure": data[0].unite_de_mesure };
                                        $scope.dataInTabPane[tagForm]['data'][currentPosition]['produit_compose_text'] = data[0].designation;
                                        $scope.dataInTabPane[tagForm]['data'][currentPosition]['unite_de_mesure'] = data[0].unite_de_mesure.designation;
                                        $scope.dataInTabPane[tagForm]['data'][currentPosition]['proposition'] = $scope.proposition;
                                        $scope.dataInTabPane[tagForm]['data'][currentPosition]['quantite'] = $('#quantite_' + tagForm).val();
                                        $scope.dataInTabPane[tagForm]['data'][currentPosition]['portion'] = $('#portion_' + tagForm).val();
                                        if (tagForm == 'familles_propositioncommerciale') {
                                            $scope.dataInTabPane[tagForm]['data'][currentPosition]['option_menu'] = $scope.famille_id;
                                            $scope.dataInTabPane[tagForm]['data'][currentPosition]['r2atechniques'] = data[0].r2atechniques;
                                        }
                                    }
                                    //r2acomm_proforma
                                    if (tagForm == "r2acomm_proforma") {
                                        if (data[0].prixdeventes && data[0].prixdeventes.length > 0) {
                                            var searchPV = $filter('filter')(data[0].prixdeventes, { type_prix_de_vente_id: $("#typeprixvente_proforma").val() })
                                            if (searchPV && searchPV.length == 1) {
                                                $scope.dataInTabPane[tagForm]['data'][currentPosition]['prix_unitaire_ht'] = searchPV[0].montant;
                                                if ($scope.exonorer_tva && $scope.exonorer_tva == true) {
                                                    $scope.activeHtOrTtcInTab($scope.dataInTabPane[tagForm]['data'], 'prix_unitaire_ht', 'prix_unitaire_ttc', true);
                                                    //  $scope.dataInTabPane[tagForm]['data'][currentPosition]['prix_unitaire_ttc'] = searchPV[0].montant + $scope.montantHtAndTTC(searchPV[0].montant, true);
                                                } else {
                                                    $scope.activeHtOrTtcInTab($scope.dataInTabPane[tagForm]['data'], 'prix_unitaire_ht', 'prix_unitaire_ttc', false);

                                                }
                                                console.log('-----------------EXO -----------');
                                                console.log($scope.exonorer_tva);
                                                //   $scope.dataInTabPane[tagForm]['data'][currentPosition]['prix_achat_ttc'] = data[0].prix_achat_ttc;
                                            }
                                        }

                                    }
                                    //$scope.dataInTabPane[tagForm]['data'][currentPosition]['quantite_reelle'] = null;


                                } else {
                                    $scope.showToast('', error, 'error');
                                }


                                if (tagForm == 'r2atechniques_produit') {

                                    var prt = $("#prix_de_revient_unitaire_produit").val();

                                    if (!prt) {
                                        prt = 0;
                                    }
                                    console.log('----------------------------------------Donne r2a technique-------------------------');
                                    console.log($scope.dataInTabPane[tagForm]['data'][currentPosition]['portion'], parseFloat(data[0].prix_achat_unitaire));
                                    var cout = $scope.dataInTabPane[tagForm]['data'][currentPosition]['portion'] * parseFloat(data[0].prix_achat_unitaire);
                                    $scope.dataInTabPane[tagForm]['data'][currentPosition]['cost'] = cout;
                                    if ($scope.dataInTabPane['valeursft_produit']['data'].nombre_portion) {
                                        var nombre_portion = $scope.dataInTabPane['valeursft_produit']['data'].nombre_portion;
                                        $scope.dataInTabPane[tagForm]['data'][currentPosition]['portion_unitaire'] = $scope.dataInTabPane[tagForm]['data'][currentPosition].portion / nombre_portion;
                                    } else {
                                        $scope.dataInTabPane[tagForm]['data'][currentPosition]['portion_unitaire'] = $scope.dataInTabPane[tagForm]['data'][currentPosition].portion;
                                    }

                                    prt = parseFloat(prt) + cout;
                                    console.log(prt);

                                    $('#prix_de_revient_unitaire_total_produit').val(prt).change();
                                    $('#prix_de_revient_unitaire_produit').val(prt).change();
                                    $("#info_unitedemesure_" + type).val('');

                                    //$scope.donneTotalR2aTechnique();
                                }
                                $scope.emptyform(tagForm);
                                if (tagForm == 'familles_propositioncommerciale') {
                                    $scope.emptyform('produits_propositioncommerciale');
                                }
                                $('.unite-mesure').val('');
                                $('.quantite-theorique').val('');


                            } else if (tagForm == "produits_bci") {

                                if (data && data.length == 1) {
                                    if (data[0].typeproduit) {
                                        if (data[0].typeproduit.designation !== "Matières premières") {
                                            $scope.dataInTabPane[tagForm]['data'].splice(currentPosition, 1);
                                            $scope.showToast('', 'Ce produit n\'est pas une matière première', 'error');
                                        }
                                    }
                                }
                            }
                            else if (tagForm == "produit_commande_produits_commande") {

                                if (data && data.length == 1) {

                                    $scope.dataPage[type + 's'] = data;

                                } else {

                                }
                            }
                            else if (tagForm == "famille_option_menu") {

                                if (data && data.length) {
                                    $scope.dataInTabPane[tagForm + 's']['data'] = data;

                                } else {
                                    $scope.dataInTabPane[tagForm + 's']['data'] = [];
                                }
                            }

                        }
                    }
                    else if (type == "table") {
                        $scope.dataPage['tables'] = data;
                    }
                    else if (type == "famille") {
                        if (!$scope.dataPage['famille_menus']) {
                            $scope.dataPage['famille_menus'] = [];
                        }
                        var searchFamille = $filter('filter')($scope.dataPage['famille_menus'], { designation: data[0].designation });
                        if (!searchFamille || searchFamille.length <= 0) {
                            $scope.dataPage['famille_menus'].push(data[0]);
                            $scope.goToActiveOnglet('famille_menus', data[0].id, 'active');
                        }
                    }
                    else if (type == "client") {

                        $scope.client = data[0];
                        $scope.client_traiteur = data[0];
                        $scope.exotva_propositioncommerciale = false;
                        if ($scope.client_traiteur.exonorer_tva && $scope.client_traiteur.exonorer_tva == true) {
                            $scope.exotva_propositioncommerciale = true;
                        }

                        type = 'adresse';
                        info = false;
                        rewriteReq = `${type}s(client_id:${data[0].id})`;
                        $scope.manageAfterSelect2(type, data[0].id, info, 'adresse_livraison', null, null, rewriteReq);
                    }
                    else if (type == "adresse") {
                        $scope.dataPage[tagForm] = [];
                        console.log('-----l adresse est la--------');
                        console.log(data);
                        console.log(tagForm);
                        data.forEach(item => {
                            $scope.dataPage[tagForm].push(item);
                        })
                    }
                    else if (type == "operateur") {
                        $scope.dataInTabPane[tagForm]['data'].push(data[0]);
                    }
                    else if (type == "logistique") {
                        console.log('-----------Logistique--------');
                        console.log(data[0]);
                        $("#montant_option_materiel").val(+data[0].prix_vente_unitaire_ttc);
                        $("#montant_ht_option_materiel").val(+data[0].prix_vente_unitaire);
                    }
                    else if (type == "modepaiement") {
                        //$scope.modepaiement = data[0];
                        console.log(data[0])
                        if (data[0] && data[0].encaissable == 1) {
                            $(".encaissable").fadeIn('slow');
                        } else {
                            $(".encaissable").fadeOut('slow');
                        }
                    }
                    else if (type == "depot") {
                        if (tagForm == "depot_inventaire") {
                            // var type_depot = data[0].type_depot.designation;
                            //  $("#type_depot_produits_inventaire").val(type_depot);
                        }

                    }
                    else if (type == "reservation") {
                        $scope.reservationToCommande(data[0]);
                    }
                }
                else {

                    if ($scope.dataPage[tagForm]) {
                        $scope.dataPage[tagForm] = [];
                    }

                    if ($scope.dataInTabPane[tagForm + 's']) {
                        $scope.dataInTabPane[tagForm + 's']['data'] = [];
                    }
                    if ($scope.dataInTabPane[tagForm]) {
                        $scope.dataInTabPane[tagForm]['data'] = [];
                    }

                    if (tagForm == 'produit_produits_inventaire') {
                        $(".quantite-theorique").val(null);
                        $(".qte-courante").val(null);
                        $("#quantite_theorique_produits_inventaire").val(null);
                        $("#nomenclature_produits_inventaire").val(null);
                        $("#pa_ht_produits_inventaire").val(null);
                        $("#pa_ttc_produits_inventaire").val(null);
                        $scope.showToast('', "Ce produit n\'a pas de quantité ou n\'existe pas dans ce dépôt", 'error');
                    }
                }
            }, function (msg) {
                if (form) {
                    $('#modal_add' + form).blockUI_stop();
                }
                $scope.showToast('', msg, 'error');
            });

        }
        else {
            rewriteReq = `${type}spaginated(id:${idType})`;
            Init.getElementPaginated(rewriteReqnew, listofrequests_assoc[`${type}s`]).then(function (data) {

                if (data) {
                    if (type == 'produit') {
                        $scope.paginations[type].currentPage = data.metadata.current_page;
                        $scope.paginations[type].totalItems = data.metadata.total;
                        $scope.dataPage[type + "s"] = data.data;
                    }
                    if (type == "table") {
                        $scope.paginations[type].currentPage = data.metadata.current_page;
                        $scope.paginations[type].totalItems = data.metadata.total;
                        $scope.dataPage[type + "s"] = data.data;
                    }

                }
                else {

                    if ($scope.dataPage[tagForm]) {
                        $scope.dataPage[tagForm] = [];
                    }

                    if ($scope.dataInTabPane[tagForm + 's']) {
                        $scope.dataInTabPane[tagForm + 's']['data'] = [];
                    }
                    if ($scope.dataInTabPane[tagForm]) {
                        $scope.dataInTabPane[tagForm]['data'] = [];
                    }

                }
            }, function (msg) {
                toastr.error(msg);
            });
        }

    }
    $scope.reservationToCommande = function (reservation) {

        if (reservation.client_id) {
            $scope.reservation = reservation;
            $scope.reservation_commande = reservation.id;
            $("#reservation_id_commande").val($scope.reservation_commande);
            $scope.client = reservation.client;
            $scope.client_reservation = reservation.client;
            $scope.editInSelect2('client', $scope.client.id, 'commande');
        }
        if (reservation.entite_id) {
            $scope.restaurant_commande = reservation.entite_id;
            $("#entite_commande").val(reservation.entite_id).trigger('change');
        }
        if (reservation.table) {
            var table = reservation.table;
            $scope.selectItem('info_commande', table.id, table, false, false, 'sur place');
        }
        $(".client-passage").fadeOut('slow');
    }
    $scope.chargerLogistiqueTraiteur = function (id, form, tagForm) {
        var type = 'traiteur';
        var rewriteReqnew = 'traiteurs(id:' + id + ')';
        var form = form;
        $('#modal_add' + form).blockUI_start();
        Init.getElement(rewriteReqnew, listofrequests_assoc[`${type}s`]).then(function (data) {
            $('#modal_add' + form).blockUI_stop();
            if (data && data.length == 1) {
                $scope.traiteur = data[0];
                if (data[0].logistique_proformas && data[0].logistique_proformas.length > 0) {
                    var logistique_traiteur = data[0].logistique_proformas;
                    $('#date_' + form).val($scope.traiteur.date).trigger('change');
                    $scope.dataInTabPane[tagForm]['data'] = [];

                    for (var i = 0; i < logistique_traiteur.length; i++) {
                        var item = {
                            produit_id: logistique_traiteur[i].produit_id,
                            produit: { "designation": logistique_traiteur[i].produit.designation },
                            quantite: logistique_traiteur[i].quantite
                        }
                        $scope.dataInTabPane[tagForm]['data'].push(item);
                    }
                }
            }
        }, function (msg) {
            $('#modal_add' + form).blockUI_stop();

        })
    }

    $scope.cleanSelect = function (id) {
        $("#" + id).val(null).trigger('change');
    }
    $scope.save_r2a = function (key,new_value){
        
       /*  console.log("value :" + new_value);
        console.log("key :" + key);
        let index = $scope.donneesTabQuestionnaire[key].QuestionnairesComplet.findIndex(x => x.libelle_court == $scope.shortcut_r2a)
        $scope.donneesTabQuestionnaire[key].QuestionnairesComplet[index]['reponse_relue'] = new_value;
        console.log($scope.donneesTabQuestionnaire[key]);
             */
    }
    $scope.getLibelleLong = function (shortcut){
        let libelle_long = null;
        if($scope.dataListeQuestions){
            console.log($scope.dataListeQuestions);
            Object.entries($scope.dataListeQuestions).forEach(element => {
                if(shortcut == element[1].Libelle_court ){
                    libelle_long = element[1].Libelle_long
                }
            });
        }
        return libelle_long
    }
    //Fonction pour déclencher des actions de select2
    $scope.cpt = 1;
    function OnChangeSelect2(e) {
        console.log("OnChangeSelect2 / Moi cest la fonctoin select2 event");
        $scope.cpt = 1;

        var getId = $(this).attr("id");
        var getValue = $(this).val();
        var type = '';
        var info = true;
        var pagination = false;
        var form = null;
        rewriteReq = '';
        var filters = `id:${getValue},`;
        
        $scope.cpt = $scope.cpt * 1;

        if ($scope.cpt > 0 && getValue !== undefined && getValue !== "" && getValue !== null) {
            $scope.cpt = 0;
            // console.log('La value de selectIn', getId, getValue,$scope.cpt);
        } else {
            // console.log('La value de selectOFF', getId, getValue,$scope.cpt);
            getValue = null;
        }

        //console.log("OnChangeSelect2 / getId, getValue", getId, getValue);

        if (getId == 'entreprise_dashboard') {
            $scope.chargerDonnees('dashboard', 'dashboard', 0);
        }
        // pour codifrelecteur
        getName = $(this).attr("name");
        console.log(getName)
        if (getName && getId) {
            if (getName == 'quest_condition_etude' || getName == 'oper_condition_etude' || getName == 'quest_contenu_etude' || getName == 'quest_entete_etude') {
                const mots = getId.split('-');
                console.log("quest_condition_etude", mots); 
                var index = mots[1];
                if (getValue != undefined && getValue != "" && getValue != null) {
                    if (isNaN(index) == false) {
                        if(getName == 'quest_condition_etude'){
                            $scope.$apply(function () {
                                $scope.conditions_r2a[index].question = getValue;
                            });
                        }
                        if(getName == 'oper_condition_etude'){
                            $scope.$apply(function () {
                                $scope.conditions_r2a[index].operateur = getValue;
                            });
                        }
                        if(getName == 'quest_contenu_etude'){
                            $scope.contenus_r2a[index].questions = []
                            $scope.contenus_r2a[index].shortcuts = []
                            getValue.forEach(element => {
                                let shortcut = element;
                                console.log(element);
                                let libelle = $scope.getLibelleLong(element);
                                $scope.$apply(function () {
                                    $scope.contenus_r2a[index].questions.push({"shortcut":shortcut, "libelle":libelle})
                                    $scope.contenus_r2a[index].shortcuts.push(shortcut)
                                });
                            });
                        }
                        if(getName == 'quest_entete_etude'){
                            $scope.$apply(function () {
                                $scope.entetes_r2a[index].question = getValue;
                            });
                          
                        }
                    }
                }
            }
        }
      
        if (getValue && type && type !== '') {
            rewriteReq = rewriteReq + `${type}s`;
            if (pagination == true) {
                rewriteReq = rewriteReq + `paginated`;
            }
            rewriteReq = rewriteReq + `(${filters})`;
            $scope.manageAfterSelect2(type, getValue, info, getId, null, null, rewriteReq, pagination, form);
            type = null;
        }
        if (getId.indexOf('famille_carte_commande') !== -1 || getId.indexOf('famille_carte') !== -1
            || getId.indexOf('famille_familles_propositioncommerciale') !== -1
        ) {
            info = false;
            queries = 'famille_id:' + getValue;
            $scope.famille_carte_clicked = getValue;
            if ($scope.currentTemplateUrl && $scope.currentTemplateUrl.indexOf('list-commande') !== -1) {
                console.log('----------------Je passe par la----------');
                $scope.getModelsByQueries('commande', getValue, 'produit', null, 1);
            } else {
                if (getValue) {
                    $scope.getModelsByQueries('famille', getValue, 'produit', queries, 1);
                }
            }

        }
        
        
    }

    //Fonction pour déclencher des actions du timedropper
    function OnChangeTimeDropper(e) {
        console.log('-------------Moi cest la fonctoin timedropper event event----------');
        var getId = $(this).attr("id");
        var getValue = $(this).val();

        if (getId.indexOf('heure_debut_tranchehoraire') !== -1 || getId.indexOf('heure_fin_tranchehoraire') !== -1) {
            if (getValue != undefined && getValue != "" && getValue != null) {
                $scope.calculDureeHeure();
            }
        }

    }
    $scope.testNg_model = function () {
        console.log("Je suis ici !!!", $scope.donneesTabQuestionnaire);
    }
    // To configure ajax options of select2
    function setAjaxToSelect2OptionsForSearch(getEntity) {
        console.log("setAjaxToSelect2OptionsForSearch ==>", getEntity);
        console.log(getEntity)
        return {
            url: query => dataUrlEntity(query, getEntity),
            data: null,
            dataType: 'json',
            processResults: function (getData) {
                return processResultsForSearchEntity(getData, getEntity);
            },
            cache: true
        };
    };

    $scope.reInitTabPane = function (tagForm) {
        $scope.dataInTabPane[tagForm]['data'] = [];
    }
    $scope.reInitSelect2 = function () {
        console.log("reInitSelect2");
        setTimeout(function () {
            // select2
            $('.select2').each(function (key, value) {
                if ($(this).data('select2')) {
                    $(this).select2('destroy');
                }
                var select2Options = {
                    //width: 'resolve',
                };
                if ($(this).attr('class').indexOf('select2') !== -1) {
                    select2Options.dropdownParent = $(this).parent().parent();
                    $(this).css("width", "100%");
                }

                // Pour le initSearchEntity
                var tagSearch = 'search_';
                if ($(this).attr('class').indexOf(tagSearch) !== -1) {
                    allClassEntity = $(this).attr('class').split(' ').filter(function (cn) {
                        return cn.indexOf(tagSearch) === 0;
                    });
                    if (allClassEntity.length > 0) {
                        getEntity = allClassEntity[0].substring(tagSearch.length, allClassEntity[0].length);
                        if (getEntity == 'famille_carte_commande') {
                            getEntity = 'famille';
                        }
                        if (getEntity == 'produit_carte_commande') {
                            getEntity = 'produit';
                        }
                        //console.log('getEntity********************', allClassEntity, getEntity);
                        select2Options.minimumInputLength = 2;
                        select2Options.placeholder = getEntity.toUpperCase();
                        select2Options.ajax = setAjaxToSelect2OptionsForSearch(getEntity);
                    }
                }
                // console.log('select2', select2Options);
                $(this).select2(select2Options);
            }).on('change', OnChangeSelect2);
        }, 1)
    }
    $scope.reInitCkeditor = function (type) {
        console.log("reInitCkeditor");
        let fields = ["contenu_etude"];
        document.querySelectorAll('.ck-editor').forEach(e => e.remove())
        for (const field of fields) {
            if (field.indexOf(type) !== -1) {
                
                ClassicEditor.create(document.querySelector("#"+field))
                    .then((editor) => {
                        $scope.ckeditor.push(editor);
                        editor.model.document.on('change:data', (evt, data) => {
                            document.querySelector('#'+field).value = editor.getData();
                        });
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            }
            
        }
        
    };
    //important_select2
    $scope.reInit = function (typePass = null) {
        $scope.cpt = 1;
        setTimeout(function () {

            $('.datedropper').pickadate({
                format: 'dd/mm/yyyy',
                formatSubmit: 'dd/mm/yyyy',
                monthsFull: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
                monthsShort: ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'],
                weekdaysShort: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
                today: 'aujourd\'hui',
                clear: 'clair',
                close: 'Fermer'
            });

            $('.timedropper').pickatime({
                format: 'H:i A',
                //format: 'h:i A',
                formatSubmit: 'H:i',
                //  formatLabel: undefined,
                //  hiddenPrefix: undefined,
                //  hiddenSuffix: '_submit',
                clear: 'clair',
                close: 'Fermer',
            }).on('change', OnChangeTimeDropper);

            // select2
            var url = window.location.href;
            var aRechercher = 'list-';
            if (url.indexOf(aRechercher) < 0) {
                aRechercher = 'detail-';
            }
            var positionSuffixe = null;
            var type = typePass;
            if (!type) {
                if (url.indexOf("dashboard") >= 0) {
                    type = 'dashboard';
                }
                else {
                    positionSuffixe = url.indexOf(aRechercher) + aRechercher.length;
                    type = url.substring(positionSuffixe, url.length);
                    if (type == 'produit') {
                        if ($('#list-menu').hasClass('active')) {
                            type = 'menu';
                        }
                        if ($('#list-produit').hasClass('active')) {
                            type = 'produit';
                        }
                    }
                }
            }

            //$('.select2-'+type).each(function (key, value) {
            $('.select2').each(function (key, value) {

                var types = [{ "type": type }];

                //console.log('appel type in reInit', type, types);

                if (type.indexOf('restit-competence') !== -1) {
                    types.push({ "type": "restitcompetences" });
                }
                console.log("sleect2"+type);
                for (var i = 0; i < types.length; i++) {
                    if (value.id.indexOf('_' + types[i].type) !== -1) {
                        //Pour initialiser seulement les select2 de la page concernée
                        //   console.log('init select2','key',key,'value',value.id);
                        if ($(this).data('select2')) {
                            $(this).select2('destroy');
                        }
                        var select2Options = {
                            //width: 'resolve',
                        };
                        if ($(this).attr('class').indexOf('select2') !== -1) {
                            //console.log('select2 modal *********************');
                            select2Options.dropdownParent = $(this).parent().parent();
                            $(this).css("width", "100%");
                        }

                        var tagSearch = 'search_';

                        if ($(this).attr('class').indexOf(tagSearch) !== -1) {
                            allClassEntity = $(this).attr('class').split(' ').filter(function (cn) {
                                return cn.indexOf(tagSearch) === 0;
                            });
                            if (allClassEntity.length > 0) {
                                getEntity = allClassEntity[0].substring(tagSearch.length, allClassEntity[0].length);
                                console.log('getEntity********************', allClassEntity, getEntity);
                                select2Options.minimumInputLength = 2;
                                select2Options.placeholder = getEntity.toUpperCase();
                                select2Options.ajax = setAjaxToSelect2OptionsForSearch(getEntity);
                            }
                        }
                        $(this).select2(select2Options);
                    }
                }


            }).on('change', OnChangeSelect2);


            // mobile-app-menu-btn
            $('.mobile-app-menu-btn').click(function () {
                $('.hamburger', this).toggleClass('is-active');
                $('.app-inner-layout').toggleClass('open-mobile-menu');
            });

            // bootstrapToggle
            if ($(this).is("[data-toggle]")) {
                $(this)
                    .bootstrapToggle('destroy')
                    .bootstrapToggle();
                // Format options
                $('[data-toggle="popover"]').popover()
            }

        }, 100);

    };

    //------------- /UTILITAIRES--------------------//


    // Permet de changer le statut du formulaire a editable ou non
    function changeStatusForm(type, status, disabled = false) {
        var doIt = false;
        // Pour mettre tous les chamnps en lecture seule
        $("input[id$=_" + type + "], textarea[id$=_" + type + "], select[id$=_" + type + "], button[id$=_" + type + "]").each(function () {
            doIt = ($(this).attr('id').indexOf('detailnumCH') === -1);
            if (doIt) {
                console.log($(this).hasClass('btn'));
                $(this).attr($(this).hasClass('btn') || disabled ? 'disabled' : 'readonly', status);
            } else {

            }
        });
    }

    //---DEBUT ==> Les tableaux de données---//
    $scope.typeemails = [{ "id": "Destinataire", "designation": "Destinataire" }, { "id": "Cc", "designation": "Cc" }];
    $scope.typefichiers = [{ "id": "plan_charge", "designation": "Plan de charge" }];
    $scope.genres = [{ "id": "Homme", "libelle": "Homme" }, { "id": "Femme", "libelle": "Femme" }];
    $scope.civilites = [{ "id": "Mr", "libelle": "Mr" }, { "id": "Mme", "libelle": "Mme" }, {
        "id": "Mlle",
        "libelle": "Mlle"
    }, { "id": "Société", "libelle": "Société" }];
    $scope.typeimports = [{ "id": "import_recherche", "designation": "Import des recherches" }, { "id": "import_qualicontact", "designation": "Imports QualiContact" }, { "id": "import_histo", "designation": "Import fichier Histo" }, { "id": "import_crc", "designation": "Import fichier CRC" }, { "id": "import_restit", "designation": "Import fichier Restit" }];
    $scope.typeenvois = [{ "id": 0, "designation": "Immédiat" }, { "id": 1, "designation": "Plannifié" }];
    $scope.questionnaires = [{ "id": 0, "designation": "Non" }, { "id": 1, "designation": "Oui" }];
    $scope.nettoyages = [{ "id": 0, "designation": "Non" }, { "id": 1, "designation": "Oui" }];
    // $scope.typeusers = [];
    $scope.users = [];

    $scope.roles = [];
    $scope.permissions = [];
    $scope.dashboards = [];
 // Pour stocker les plan de code dans le tableau de recap 
    $scope.questionInTable = []; 
    $scope.r2as = [];
    $scope.bases = [];
    $scope.etudes = [];
  
    $scope.taux_a_relir = [];
    $scope.sum_remis  = 0;
    $scope.sum_entreprise = 0; 
    $scope.scrollTop  = 0; 
    $scope.est_r2a = false; 
    $scope.ckeditor = [];

    $scope.dataListeQuestions = [];
    $scope.datar2as = [];
    $scope.listeShortcut = [];
    $scope.produits = [];
    //
    //Contient la date d'aujourd'hui
    $scope.dateToday = new Date().toJSON().slice(0, 10).replace(/-/g, '-');

    $scope.tapPaneContact   = 0;
    $scope.est_active_panel = "";

    //---FIN ==> Les tableaux de données---//


    $scope.getelements = function (type, optionals = { queries: null, typeIds: null, otherFilters: null }, filtres = null) {
        var listeattributs_filter = [];
        rewriteType = type;
        var rewriteattr = listofrequests_assoc[type];

        if (optionals && optionals.queries) {
            console.log("optionals.queries", optionals.queries);
            rewriteType = rewriteType + "(";

            $.each(optionals.queries, function (KeyItem, queryItem) {
                rewriteType = rewriteType + queryItem;
            });

            rewriteType = rewriteType + ")";
        }
        if(type == "restitcompetences"){
            $scope.periode_id = $("#periode_id_" + type).val();
            $scope.fournisseur_id = $("#fournisseur_id_" + type).val();
            console.log($scope.periode_id);
            var filtres = '' 
            + ($scope.periode_id ? (',periode_id:' + $scope.periode_id ) : "")
            + ($scope.fournisseur_id ? (',fournisseur_id:' + $scope.fournisseur_id) : "")

        }
        console.log(filtres);
        if (filtres) {
            rewriteType = rewriteType + '(' + filtres + ')';
        }

        Init.getElement(rewriteType, rewriteattr, listeattributs_filter).then(function (data) {
            if(type == 'restitcompetences'){
                if(data[0] && data[0].data){
                    data[0].data = JSON.parse(data[0].data);
                }
                $scope.dataPage[type] = data[0];
                console.log($scope.dataPage[type])
            }else{

                $scope.dataPage[type] = data;
            }
            console.log('------------Data query' + type + '----------');
            //console.log(data);
            console.log('getelements ****************** optionals => ', optionals, 'rewriteType = ', rewriteType, ' listofrequests_assoc = ', listofrequests_assoc[type], "getElements ****************** data=>");
        }, function (msg) {
            $scope.showToast("ERREUR", msg, 'error');
        });
    };

    $scope.filterInDetailById = function (currentpage, foreign) {

        var rewriteelement = currentpage + 'spaginated(page:' + $scope.paginations[currentpage].currentPage + ',count:' + $scope.paginations[currentpage].entryLimit
            + ',' + foreign + ':' + $scope.param;
        if (currentpage == 'produit' || currentpage == 'entite') {
            rewriteelement += ',detail:true';
        }
        return rewriteelement += ')';
    }
    $scope.activeTab = function (type, tagTarget) {
        if (type == 'commande') {
            var val = '';
            if (tagTarget == 'emp') {
                val = 'à emporter';
            } else if (tagTarget == 'surplace') {
                val = 'sur place';
            } else if (tagTarget == 'liv') {
                val = 'à livrer';
            }
            $("#type_commande_text_list_" + type).val(val);
            $scope.pageChanged('commande');
        }
    }

    //---FIN ==> Pour récupérer les données---//
    //Utilisation du factory getelementPaginated
    //use_getelementpaginated
    $scope.getElementPaginatedUse = function (type, rewriteReq) {

        Init.getElementPaginated(rewriteReq, listofrequests_assoc[type + 's']).
            then(function (data) {
                if (data) {
                    $scope.paginations[type].currentPage = data.metadata.current_page;
                    $scope.paginations[type].totalItems = data.metadata.total;
                    $scope.dataPage[type + "s"] = data.data;
                }

            }, function (msg) {
                // form.parent().parent().blockUI_stop();
                toastr.error(msg);
            });

    }

    $scope.writeUrl = null;
    $scope.searchtexte_client = "";
    $scope.pageChanged = function (currentpage, optionals = {
        justWriteUrl: null,
        option: null,
        saveStateOfFilters: false
    }, autreArgument = null) {
        $scope.filters = '';
        $scope.permissionResources = $scope.currentTemplateUrl;
        // console.log("pageChanged ==> currentpage", currentpage);
        var typeFilter = currentpage;
        var currentpageReal = currentpage;
        // console.log("currentpageReal",currentpageReal);
        //To delete
        if (rewriteelement && rewriteattr) {
            Init.getElementPaginated(rewriteelement, rewriteattr, addrewriteattr).then(function (data) {
                $scope.paginations[currentpage].currentPage = data.metadata.current_page;
                $scope.paginations[currentpage].totalItems = data.metadata.total;
                // console.log('-------------Data------------', $scope.permissionResources);
                //console.log(data.data);
                if (currentpage == 'table') {
                    if (data.data) {
                        if ($scope.currentTable) {
                            let searchTable = $filter('filter')(data.data, { id: $scope.currentTable.id })
                            if (searchTable && searchTable.length == 1) {
                                let index = data.data.indexOf(searchTable[0]);
                                if (index > -1) {
                                    data.data[index] = $scope.currentTable;
                                }
                            }
                        }
                    }

                }

                if ($scope.permissionResources == 'list-commande-encour') {
                    currentpage = 'commande_encour';

                } else if ($scope.permissionResources == 'list-commande-departement') {
                    currentpage = 'commande_departement';
                }
                if (currentpageReal == "suivimarketingvalide" || currentpageReal == "suivimarketingnonvalide") {
                    currentpage = currentpageReal;
                }

                $scope.dataPage[currentpage + 's'] = data.data;
                console.log('pageChanged ****************** rewriteelement =', rewriteelement, " rewriteattr =>", rewriteattr, " addrewriteattr =>", addrewriteattr, 'pageChanged ****************** data =>', currentpage);

            }, function (msg) {
                $('.item-back').blockUI_stop();
                $scope.showToast("ERREUR", msg, 'error');
                // blockUI_stop_all('#section_listeavoirdepots');
            });
        }

        if (currentpage == 'commande-encour' || currentpage == 'commande-departement' || currentpage == 'commande-generale') {
            currentpage = 'commande';
        }

        if (currentpage == 'produit-ingredient' || currentpage == 'produit-recette') {
            currentpage = 'produit';
        }

        if (currentpage == "produitliquide") {
            currentpage = "produit";
        }
        if (currentpage == "entreestocklogistique") {
            currentpage = "entreestock";
            typeFilter = "entreestock";
        }
        if (currentpage == "stockactuelproduitdepotlogistique") {
            currentpage = "stockactuelproduitdepot";
            typeFilter = "stockactuelproduitdepot";
        }
        if (currentpage == "sortiestocklogistique") {
            currentpage = "sortiestock";
            typeFilter = "sortiestock";
        }
        if (currentpage == "suivimarketingvalide" || currentpage == "suivimarketingnonvalide") {
            currentpage = 'suivimarketing';

        }

        addrewriteattr = null;
        var rewriteelement = "";
        var rewriteattr = listofrequests_assoc[currentpage + "s"] ? listofrequests_assoc[currentpage + "s"][0] : null;
        // console.log('rewriteattr', rewriteattr);
        if (rewriteattr) {

            var filters = $scope.generateAddFiltres(typeFilter);
            if (currentpageReal == "contact") {
                filters += ",show:" + $scope.tapPaneContact;
            }
            if ($scope.pour_logistique != 1) {
                if (currentpageReal == "entreestocklogistique" || currentpageReal == "sortiestocklogistique") {
                    filters += ",logistique:1";
                }
            }
            else {
                filters += ",logistique:1";
            }

            if (currentpageReal == "stockactuelproduitdepotlogistique") {
                filters += ",logistique:1";
                //scope.pour_logistique
            }

            if (currentpageReal == "suivimarketingvalide") {
                filters += ",etat:1";
            }
            if (currentpageReal == "depense" && $scope.item_id) {
                filters += ",proforma_id:" + $scope.item_id;
            }
            if (currentpageReal == "suivimarketingnonvalide") {
                filters += ",etat:-1";
            }
            if (currentpageReal == "produitliquide") {
                filters += ",produitliquide:1";
            }
            if (currentpageReal == "proforma") {
                filters += ",etat:0";

            }
            if (currentpageReal == "traiteur") {
                filters += ",etat:1";
            }
            if (currentpageReal == "suivibanque") {
                if (autreArgument) {
                    $scope.suiviBanqueType = autreArgument;
                }
                if ($scope.suiviBanqueType) {
                    filters += ',selection:"' + $scope.suiviBanqueType + '"';
                }
                else {
                    $scope.suiviBanqueType = 'cheque_encaisses';
                }
            }
            if (currentpageReal == "famille" && $scope.currentTemplateUrl == 'list-famille') {
                var filter_permission = "ressource";
                filters += `,${filter_permission}:"${$scope.currentTemplateUrl}"`
            }
            if (currentpage == 'commande') {
                //filters      += `,etat_commande:`;
                var filter_permission = "permission";
                filters += `,${filter_permission}:"${$scope.permissionResources}"`
            }
            if ($scope.linknav.indexOf('-prixproduit') !== -1) {
                rewriteattr = listofrequests_assoc[currentpage + "s"];
            }

            if (currentpage == "produit") {
                var famille = $("#famille_produits_inventaire").val();
                var zonestockages = $("#zonedestockage_produits_inventaire").val();
                var departement = $("#departement_produits_inventaire").val();

                var famillelogistique = $("#famille_produits_inventairelogistique").val();
                var zonestockageslogistique = $("#zonedestockage_produits_inventairelogistique").val();
                var departementlogistique = $("#departement_produits_inventairelogistique").val();
                if (famille != '') {
                    filters += ",famille_id:" + famille;
                }
                if (zonestockages != '') {
                    filters += ",zone_de_stockage_id:" + zonestockages;
                }
                if (departement != '') {
                    filters += ",departement_id:" + departement;
                }

                if (famillelogistique != '') {
                    filters += ",famille_id:" + famillelogistique;
                }
                if (zonestockageslogistique != '') {
                    filters += ",zone_de_stockage_id:" + zonestockageslogistique;
                }
                if (departementlogistique != '') {
                    filters += ",departement_id:" + departementlogistique;
                }
                if (currentpageReal == 'produit-ingredient' || $scope.urlCourantContient("produit-ingredient") == true) {
                    filters += ',affichage:"ingredient"';
                }
                if (currentpageReal == 'produit-recette' || $scope.urlCourantContient("produit-recette") == true) {
                    filters += ',affichage:"recette"';
                }
                if ($scope.urlCourantContient("stocksemifini") == true) {
                    filters += ',affichage:"semifini"';
                }

                /*   if($scope.pour_logistique ==1)
                  {
                      filters += ",logistique:"+true;
                  } */
                //$scope.pour_logistique

            }
            if (currentpage == "approcash") {
                $scope.caisse_source_list_approcash = $("#caisse_source_list_approcash").val();
                $scope.caisse_destinataire_list_approcash = $("#caisse_destinataire_list_approcash").val();
            }
            if (currentpage == "depense") {
                if ($scope.dataInTabPane['depense_action']['data'].id) {
                    if ($scope.linknav.indexOf('-action') !== -1) {
                        filters += ",action_id:" + $scope.dataInTabPane['depense_action']['data'].id;
                    }
                }
            }
            //
            // console.log('Current page============>', currentpage);
            // console.log('Pagine Current page============>', $scope.paginations[currentpage]);
            if (!$scope.paginations[currentpage]) {
                $scope.paginations[currentpage] = {
                    currentPage: 1,
                    maxSize: 10,
                    entryLimit: 10,
                    totalItems: 0
                }
            }
            rewriteelement = currentpage + 'spaginated(page:' + $scope.paginations[currentpage].currentPage + ',count:' + $scope.paginations[currentpage].entryLimit
                + filters
                + ')';
            //console.log("rewriteelement", rewriteelement);
            // console.log('---------------This is the url----------------------');
            // console.log($scope.currentTemplateUrl);
            if (angular.lowercase($scope.currentTemplateUrl).indexOf('detail-client') !== -1) {
                rewriteelement = $scope.filterInDetailById(currentpage, 'client_id');
                console.log('L id du client ', $scope.param);
                $("#client_detail_id").val($scope.param);
            }
            if (angular.lowercase($scope.currentTemplateUrl).indexOf('detail-produit') !== -1) {
                rewriteelement = $scope.filterInDetailById(currentpage, $scope.currentTemplateUrl.split('detail-')[1]);
            }
            if (angular.lowercase($scope.currentTemplateUrl).indexOf('detail-entite') !== -1) {
                rewriteelement = $scope.filterInDetailById(currentpage, 'entite');
            }
            if (angular.lowercase($scope.currentTemplateUrl).indexOf('detail-societefacturation') !== -1) {
                rewriteelement = $scope.filterInDetailById(currentpage, 'id');
            }

            if (rewriteelement && rewriteattr) {

                Init.getElementPaginated(rewriteelement, rewriteattr, addrewriteattr).then(function (data) {
                    $scope.paginations[currentpage].currentPage = data.metadata.current_page;
                    $scope.paginations[currentpage].totalItems = data.metadata.total;
                    console.log('-------------Data------------', $scope.permissionResources);
                    //console.log(data.data);
                    if (currentpage == 'table') {
                        if (data.data) {
                            if ($scope.currentTable) {
                                let searchTable = $filter('filter')(data.data, { id: $scope.currentTable.id })
                                if (searchTable && searchTable.length == 1) {
                                    let index = data.data.indexOf(searchTable[0]);
                                    if (index > -1) {
                                        data.data[index] = $scope.currentTable;
                                    }
                                }
                            }
                        }

                    }

                    if ($scope.permissionResources == 'list-commande-encour') {
                        currentpage = 'commande_encour';

                    }
                    else if ($scope.permissionResources == 'list-commande-departement') {
                        currentpage = 'commande_departement';
                    }
                    else if (angular.lowercase($scope.currentTemplateUrl).indexOf('list-commande-generale') !== -1) {
                        currentpage = 'commandegenerale';
                    }
                    if (currentpageReal == "suivimarketingvalide" || currentpageReal == "suivimarketingnonvalide") {
                        currentpage = currentpageReal;
                    }

                    $scope.dataPage[currentpage + 's'] = data.data;
                    console.log('pageChanged ****************** rewriteelement =', rewriteelement, " rewriteattr =>", rewriteattr, " addrewriteattr =>", addrewriteattr, 'pageChanged ****************** data =>', currentpage);

                }, function (msg) {
                    $('.item-back').blockUI_stop();
                    $scope.showToast("ERREUR", msg, 'error');
                    // blockUI_stop_all('#section_listeavoirdepots');
                });
            }
        }

        if ($("#prix_achat_unitaire_" + currentpage)) {
            $("#prix_achat_unitaire_" + currentpage).on("change paste keyup", function () {
                var montantTTC = parseFloat($(this).val()) + ($(this).val() * 18) / 100;
                var montantTVA = ($(this).val() * 18) / 100;
                $("#prix_achat_ttc_" + currentpage).val(montantTTC.toFixed(2));
                $("#prix_achat_ttc_tva_" + currentpage).val(montantTVA.toFixed(2));
            });
        }

        if ($("#prix_achat_ttc_" + currentpage)) {
            $("#prix_achat_ttc_" + currentpage).on("change paste keyup", function () {
                var montantHT = parseFloat($(this).val()) / 1.18;
                var montantTTC = parseFloat($(this).val());

                $("#prix_achat_unitaire_" + currentpage).val(montantHT.toFixed(2));
                var montantTVA = montantTTC - montantHT;
                $("#prix_achat_ttc_tva_" + currentpage).val(montantTVA.toFixed(2));
            });
        }

        if ($("#prix_vente_unitaire_" + currentpage)) {
            $("#prix_vente_unitaire_" + currentpage).on("change paste keyup", function () {
                var montantTVA = ($(this).val() * 18) / 100;
                var montantTTC = parseFloat($(this).val()) + montantTVA;
                $("#prix_vente_ttc_tva_" + currentpage).val(montantTVA.toFixed(2));
                $("#prix_vente_ttc_" + currentpage).val(montantTTC.toFixed(2));
            });
        }

        if ($("#prix_vente_ttc_" + currentpage)) {
            $("#prix_vente_ttc_" + currentpage).on("change paste keyup", function () {
                var montantHT = parseFloat($(this).val()) / 1.18;
                $("#prix_vente_unitaire_" + currentpage).val(montantHT.toFixed(2));
                var montantTVA = parseFloat($(this).val()) - montantHT;
                $("#prix_vente_ttc_tva_" + currentpage).val(montantTVA.toFixed(2));
            });
        }
    };


    $scope.modalPageChaged = function (currentpage, tagForm, optionals = {
        justWriteUrl: null,
        option: null,
        saveStateOfFilters: false
    }) {
        var getValue = null;
        var type = '';
        var info = false;
        var filters = '';
        var form = '';
        var rewriteelement = '';
        var pagination = false;
        if (tagForm == 'famille_option_menu') {

            type = 'produit';
            getValue = $scope.famille_carte_clicked;
            filters += `famille_id:${getValue},`;
            form = 'addmenu';
            pagination = true;
            filters += 'page:' + $scope.paginations[currentpage].currentPage + ',count:' + $scope.paginations[currentpage].entryLimit;

            // console.log('------=ma requette-------');
            // console.log(filters);
            if (getValue && type && type !== '') {
                rewriteelement = rewriteelement + `${type}s`;
                if (pagination == true) {
                    rewriteelement = rewriteelement + `paginated`;
                }
                rewriteelement = rewriteelement + `(${filters})`;
                $scope.manageAfterSelect2(type, getValue, info, tagForm, null, null, rewriteelement, pagination, form);
            }

        }
    }


    $scope.cacheFilters = {};
    $canWrite = true;

     $(function() {
         console.log("JE SUIS ICI ..."); 
         //$("#liste_questions").DataTable(); 
         // document.getElementById("#liste_questions").DataTable();
    });
   
     // DataTable for Data Question 
     $scope.$watch("donneesTabQuestionnaire", function (newValue, oldValue, scope) {
        $scope.reInitDatatables();
     }); 
    
     $scope.reInitDatatables = function () {
        

            let datatables = document.querySelectorAll('.datatable');
            datatables.forEach(element => {
                if ($.fn.DataTable.isDataTable("#"+element.id)) {
                    $('#'+element.id).DataTable().clear().destroy();
                }
            });
            setTimeout(() => {
                
                datatables.forEach(element => {
                    if(element.id == "liste_questions_relecture"){
                        table =  $('#liste_questions_relecture')
                        /* .on('order.dt', function () { })
                        .on('search.dt', function () { }) */
                        .on('page.dt', function () {
                            //table = $('#liste_questions_r2a').DataTable()
                            $scope.current_pagination_page = table.page.info().page + 1;
                        })
                        .DataTable({
                            "columnDefs": [
                                { "width": "5%", "targets": 0 },
                              ]
                        }); 
                        return
                    }else{
                        $('#'+element.id).DataTable({
                            //"searching": false
                        });
                    }
                    
                });
                
            }, 5000);

            //$scope.currentTemplateUrl
            
     }

    
    //  // DataTable plancode Table 
    //  $scope.$watch("planCodeInTable", function (newValue, oldValue, scope) {
    //     if($scope.planCodeInTable){
    //        console.log("plan codes");
    //        if ($.fn.DataTable.isDataTable("#plancodesTable_id")) {
    //            $('#plancodesTable_id').DataTable().clear().destroy();
    //        }
    //        setTimeout(() => {
    //            $('#plancodesTable_id').DataTable({
    //                dom: 'Bfrtip',
    //                buttons: [
    //               ]
    //            });
    //        }, 1000);
    //     }
    // }); 

    $scope.bootstrapTab = function () {
        console.log("table paginated en cours d'éxecution !!!");

        setTimeout(function () { //Mis ici car sans ca rien ne fonctionnera

            $(function () {
                //$('#liste_questions_id').bootstrapTable()
            })

        }, 1500);

    };
    $scope.$watch("writeUrl", function (newValue, oldValue, scope) {
        if (!newValue) {
            console.log("writeUrl la nouvelle valeur est vide", $scope.linknav);
        } else {
            console.log('writeUrl old = ', oldValue, 'new = ', newValue);
        }

        $assocName = $scope.linknav.substr(1, $scope.linknav.length);

        if ($canWrite && $scope.linknavOld.indexOf('detail') !== -1 && $assocName in $scope.cacheFilters) {
            $canWrite = false;
            $scope.linknavOld = $scope.linknav;
        } else
            $canWrite = true;

        if ($assocName && $canWrite && $scope.linknav.indexOf('detail') === -1) {
            $scope.cacheFilters[$assocName] = newValue;
        }

        console.log("writeUrl $assocName", $assocName, "cacheFilters", $scope.cacheFilters, "$canWrite", $canWrite);

    });


    //$scope.getelements("notifpermusers");
    // Pour detecter le changement des routes avec Angular
    $scope.linknav = "/";
    $scope.linknavOld = "/";
    $scope.currentTemplateUrl = "";
    $scope.client = null;
    $scope.$on('$routeChangeStart', function (next, current) {
        $('.modal[role="dialog"]').on('hide.bs.modal', function (e) {
            console.log('--modal close-----');
        })
        $("#modal").on('hide.bs.modal', function (e) {
            console.log('--modal close-----');
        })

        console.log('-------------Url:', current);
        $scope.linknav = $location.path();
        console.log('-------------linknav:', $scope.linknav);
        $scope.currentTemplateUrl = null;
        $scope.currentTemplateUrl = current.params.namepage ? current.params.namepage : "list-periode";
        let currentPath = window.location.href;
        if(currentPath.toLowerCase().indexOf('list-r2a') !== -1){
            $scope.currentTemplateUrl = "list-r2a";
        }
        if(currentPath.toLowerCase().indexOf('list-base') !== -1){
            $scope.currentTemplateUrl = "list-base";
        }
        console.log("$scope.currentTemplateUrl", $scope.currentTemplateUrl); //Pour la page ou route par défaut
        $scope.notification_commande = [];
        var originalPath = $scope.currentTemplateUrl.split('/');
        if (originalPath && originalPath.length > 0) {
            $scope.permissionResources = originalPath[1];
        }

        // Pour afr2ar le modal des infos details
        $scope.detailParentId = null;
        $scope.pour_logistique = null;
        $scope.produitlogistique = null;
        //Pour le detail d'un produit donné
        $scope.produitSelected = [];

        //Pour le type de suivi banque à afr2ar (chèque, CB ou Virement)
        $scope.suiviBanqueType = null;

        console.log('/******* Réintialisation de certaines valeurs *******/');
        $('.force-disabled').attr('disabled', 'disabled');
        $scope.linknav = $location.path();

        //markme-LISTE
        $scope.dataDetailPage = {
            "detailproduit": {}
        };
        $scope.dataPage = {
            "erreurs": [],
            "preferences": [],
            "historiques": [],
            "envoies": [],
            "notifications": [],
            "dashboards": [],
            "permissions": [],
            "roles": [],
            "users": [],
            "etudes": [],
            "connexions": [],
            "categories": [],
            "fournisseurs": [],
            "competences": [],
            "periodes": [],
            "restitcompetences": [],
        };

        //markme-LISTE
        var myobject = {
            currentPage: 1,
            maxSize: 10,
            entryLimit: 10,
            totalItems: 0
        }

        $scope.paginations =
        {
            "preference": myobject,
            "historique": myobject,
            "entreprise": myobject,
            "envoie": myobject,
            "erreur": myobject,
            "commentaire": myobject,
            "dashboard": myobject,
            "role": myobject,
            "user": myobject,
            "connexion": myobject,
            "permission": myobject,
            "categories": myobject,
            "fournisseur": myobject,
            "competences": myobject,
            "periodes": myobject,
            "restitcompetences": myobject,
        };

        //markme-LISTE
        if ($scope.currentTemplateUrl.toLowerCase().indexOf('dashboard') !== -1) {
            $scope.titlePage = 'Dashboard';
            // $scope.chargerDonnees('dashboard', 'dashboard', 0);
            $scope.chargerDonnees('dashboard', 'dashboard', 0);
            /* //$scope.getelements('dashboardcodifrelecs');
            $scope.getelements('etudes');
            $scope.getelements('relecteurs'); */
        }
        if ($scope.currentTemplateUrl.toLowerCase().indexOf('accueil') !== -1) {
            $scope.titlePage = 'Accueil';
            $scope.chargerDonnees('dashboard', 'dashboard', 0);
        }
        if ($scope.currentTemplateUrl.toLowerCase().indexOf('planning') !== -1) {
            $scope.getelements('etudes');
            $scope.getelements('relecteurs');

            $scope.titlePage = 'Planning';
            const d = new Date();
            $scope.current_month = d.getMonth();
            $scope.current_year  = d.getFullYear();
            $scope.start_week    = $scope.getMondayToFridayOfWeek(d)[0];
            $scope.end_week      = $scope.getMondayToFridayOfWeek(d)[1]; 
            $scope.start_week_print = $scope.getMondayToFridayOfWeek(d)[2] ;
            $scope.end_week_print = $scope.getMondayToFridayOfWeek(d)[3];
            $scope.current_week  = $scope.getMondayToFridayOfWeek(d)[4];
            // 
            $scope.est_active_panel = "month";
            $scope.est_active_week  = 0; 
            $scope.chargerDonnees('planning', 'planning', 0);

        }
        if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-') !== -1) {
            var getNameItemOld = $scope.currentTemplateUrl.toLowerCase();
            var getNameItem = getNameItemOld.substring(5, getNameItemOld.length);
            console.log('On est sur quel Page ?', getNameItem, "getNameItemOld", getNameItemOld);
            $scope.pageChanged(getNameItem);
            console.log($scope.currentTemplateUrl.toLowerCase());

            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-erreur') !== -1) {
                $scope.titlePage = 'Erreur';
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-preference') !== -1) {
                $scope.titlePage = 'Préference';
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-envoie') !== -1) {
                $scope.titlePage = 'Envoies';
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-categorie') !== -1) {
                $scope.titlePage = 'Catégories';
                //$scope.showModalOrder('categorie');
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-competence') !== -1) {
                $scope.titlePage = 'Compétences';
                $scope.getelements('categories');
                //$scope.showModalOrder('competence',1);
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-periode') !== -1) {
                $scope.titlePage = 'Périodes';
                $scope.getelements('fournisseurs');
                //$scope.completePeriode('',1);
            }
            
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-commentaire') !== -1) {
                $scope.titlePage = 'Commentaire';
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-historique') !== -1) {
                $scope.titlePage = 'Historiques';
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-entreprise') !== -1) {
                $scope.titlePage = 'Entreprises';
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-etude') !== -1) {
                $scope.titlePage = 'Etudes';
                /* $scope.showModalAdd('etude'); */
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-trancheeffectif') !== -1) {
                $scope.titlePage = "Tranche d'effectif";
                $scope.getelements('trancheeffectifs');
               
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-r2a') !== -1) {
                $scope.titlePage = 'Codification';
                $scope.getelements('relecteurs');
                $scope.getelements('etudes');
                $scope.getelements('codifications');
            }
            // if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-r2a') !== -1) {
            //     $scope.titlePage = 'Codification';
            //     $scope.getelements('relecteurs');
            //     $scope.getelements('etudes');
            //     $scope.pageChanged('r2a');
            // }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-base') !== -1) {
                $scope.titlePage = 'Base';
                $scope.getelements('relecteurs');
                $scope.getelements('etudes');
                $scope.pageChanged('r2a');
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-user') !== -1) {
                $scope.titlePage = 'Utilisateurs';
                //$scope.getelements('roles');
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-fournisseur') !== -1) {
                $scope.titlePage = 'Fournisseurs';
                $scope.getelements('users');
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-role') !== -1) {
                $scope.titlePage = 'Role';
            }

            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-r2a') !== -1) {
                $scope.titlePage = 'Codification';
                $scope.pageChanged('codification');
            }
        }
        if ($scope.currentTemplateUrl.toLowerCase().indexOf('restit-competence') !== -1) {
            $scope.titlePage = 'Restitution des compétences';
            $scope.getelements('restitcompetences');
            $scope.getelements('users');
            $scope.getelements('fournisseurs');
            $scope.getelements('periodes');
        }
        $('.select2').on('select2:opening', function (e) {
            var data = e.params.data;
            console.log('New test');
            $scope.cpt = 1;
        });
    });

    $scope.chargeQueriesByType = function (type, tag) 
    {
        var rewriteReq = `${tag}(typage:"${type}")`;
        Init.getElement(rewriteReq, listofrequests_assoc[tag]).then(function (data) {
            if (data) {
                $scope.dataPage[tag] = data;
            }
        }, function (msg) {
            toastr.error(msg);
        });
    }

    $scope.getMondayToFridayOfWeek = function() 
    {
        console.log('getMondayToFridayOfWeek');
        let date_today = new Date();
      
        let first_day_of_the_week = new Date(date_today.setDate(date_today.getDate() - date_today.getDay() + 1));
        let last_day_of_the_week = new Date(date_today.setDate(date_today.getDate() - date_today.getDay() + 5));
      
        let first_day = `${first_day_of_the_week.getFullYear()}-${('0' + (first_day_of_the_week.getMonth() + 1)).slice(-2)}-${('0' + first_day_of_the_week.getDate()).slice(-2)}`;
        let last_day = `${last_day_of_the_week.getFullYear()}-${('0' + (last_day_of_the_week.getMonth() + 1)).slice(-2)}-${('0' + last_day_of_the_week.getDate()).slice(-2)}`;
      
        let first_day_format = `${('0' + first_day_of_the_week.getDate()).slice(-2)}-${('0' + (first_day_of_the_week.getMonth() + 1)).slice(-2)}`;
        let last_day_format = `${('0' + last_day_of_the_week.getDate()).slice(-2)}-${('0' + (last_day_of_the_week.getMonth() + 1)).slice(-2)}`;
      
        let numero_week = $scope.getWeekNumber(date_today);
      
        return [first_day, last_day, first_day_format, last_day_format, numero_week];
    };
      

      
    $scope.getWeekNumber = function(date)
    {
        // Copie la date passée en paramètre
        const d = new Date(date.valueOf());
        
        // Définis le premier janvier comme premier jour de l'année
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + 4 - (d.getDay() || 7));
        const yearStart = new Date(d.getFullYear(), 0, 1);
        // Calcule le numéro de la semaine
        const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        
        return weekNo;
    }

    $scope.datesSemaine = function(numero_semaine, annee) {
        // Date de début de la semaine (lundi)
        var date_debut = moment().year(annee).week(numero_semaine).day(1).format('D-M');
        // Date de fin de la semaine (vendredi)
        var date_fin   = moment().year(annee).week(numero_semaine).day(5).format('D-M');
        
        return [date_debut, date_fin];
    }
      



    $scope.getLogoApp = function () {
        let logoApp;
        if (theme.getCurrent() == 'theme-Groupe') {
            logoApp = "assets/images/logo/Logoglf-2.svg"
        }
        else if (theme.getCurrent() == 'theme-K') {
            logoApp = "assets/images/logo/kings-white.svg"
        }
        else if (theme.getCurrent() == 'theme-A') {
            logoApp = "assets/images/logo/alkimia.svg"
        }
        else if (theme.getCurrent() == 'theme-F') {
            logoApp = "assets/images/logo/lafourchette-2.svg"
        }
        else if (theme.getCurrent() == 'theme-C') {
            logoApp = "assets/images/logo/comptoir.svg"
        }
        else if (theme.getCurrent() == 'theme-T') {
            logoApp = "assets/images/logo/traiteur.svg"
        }
        return logoApp;
    }

    $scope.$on('$routeChangeSuccess', function (next, current, prev) {

        $scope.isActiveTab = false;
        $scope.filters = '';
        // menu_search get all permissions.
        if ($scope.firstime == true) {
            $scope.firstime = false;
        }
        //$scope.getelements('roles');
        $scope.getelements('notifications');
        $scope.currentTheme = theme.getCurrent() ? theme.getCurrent() : 'theme-Groupe';
        $scope.reInit();

    });

    $scope.checkPermision = function (perm) {
        //perm = 'list-entite';
        var trouve = false;
        if (perm && $scope.dataPage && $scope.dataPage['roles'] && $scope.dataPage['roles'][0] && $scope.dataPage['roles'][0].permissions.length > 0) {
            var search = $filter('filter')($scope.dataPage['roles'][0].permissions, { name: perm });
            if (search && search.length >= 1) {
                trouve = true;
                console.log('permission trouvee', perm);
            }
        }
        return trouve;
    };

    $('#modal_addactivite').on('hidden.bs.modal', function () {
        console.log('Alhamdou lillah');
    });

    $scope.showdefaultseletedObject = function (id, type, tag) {
        if (id) {
            console.log('data to add ', id, type, tag)
            var typeAvecS = type + "s";
            var rewriteReq = "";
            if (type.indexOf('fournisseur') !== -1) {
                var rewriteReq = typeAvecS + "(id:" + id + ")";
            } else if (type.indexOf('sousfamilleproduit') !== -1) {
                var rewriteReq = typeAvecS + "(famille_produit_id:" + id + ")";
            }
            Init.getElement(rewriteReq, listofrequests_assoc[typeAvecS]).then(function (data) {
                if (type.indexOf('fournisseur') !== -1) {
                    $('#devise_' + tag).val(data[0].devise_id)
                } else {
                    $scope.dataPage[typeAvecS] = data;
                }

            }, function (msg) {
                toastr.error(msg);
            });

        }
        return true;
    };

    $scope.generateExcel = function () {
        var getNameItemOld = $scope.currentTemplateUrl.toLowerCase();
        var getNameItem = getNameItemOld.substring(5, getNameItemOld.length);
        if (!$scope.filters) {
            return false;
            /* Init.
             generateExcel('generate-excel-'+getNameItem, $scope.filters)
                 .then(function (data) {
                     if (data) {
    
                     }
                 }, function (msg) {
                     iziToast.error({
                         message: msg,
                         position: 'topRight'
                     });
                 });*/
        }


    }

    $scope.addTablecommande = function (table) {
        $('#table_commande').text(table.designation);
        $scope.table_commande = table.designation;

        $('#nombre_couvert_commande').val(table.nombre_couverts);
        $scope.nbrpresonne_commande = table.nombre_couverts;

        $('#id_table_commande').val(table.id);
    }


    $scope.showDetailproduitcommande = function (type, item) {

        $scope.produitSelectedCommande = item;
        $("#modal_add" + type).modal('show', {
            backdrop: 'static'
        });
        // $scope.showModalAdd(type);
    }
    $scope.showModalOrder = function (type, parent_type = null, item=null) {
        let type_avec_s = type+'s'
        $scope.dataPage[type_avec_s] = null
        $scope.getelements(type_avec_s);
        let inters = 0;
        //Attendre que les données catégories soient chargées relancer chaque 200 milisecondes pendant 10 foix max 
        var getDataInterval = setInterval(() => {
            if($scope.dataPage[type_avec_s] /* || inters >10 */){
                console.log($scope.dataPage[type_avec_s]);
                $scope.$apply(function () {
                    $scope.items_to_order = $scope.dataPage[type_avec_s]
                    if(type == 'competence' && parent_type =="categorie" && item){ 
                        $scope.items_to_order = $scope.dataPage[type_avec_s].filter(function(value){
                            return value.categorie_id == item.categorie_id;
                        });
                    }
                });
                
                
                $("#modal_order" + type).modal('show', {
                    backdrop: 'static'
                });
                clearInterval(getDataInterval);
                $scope.addListenersDragList()
            }
            inters++;
        }, 200);
        
        // $scope.showModalAdd(type);
    }
    $scope.completePeriode = function (type,periode_id, disable_form=false) {
        
        $scope.notes_periode = [];
        $scope.disable_form = disable_form
        
        // $scope.getelements("categories");
        $scope.requeterNotesPeriode(periode_id);
        let inters = 0;
        $('#id_completeperiode').val(periode_id);
        //Attendre que les données catégories soient chargées relancer chaque 200 milisecondes pendant 10 foix max 
        var getDataInterval = setInterval(() => {
            if($scope.notes_periode.length > 0){
                
                $("#modal_addcompleteperiode").modal('show', {
                    backdrop: 'static'
                });
                clearInterval(getDataInterval);
                $scope.addListeners()
            }
            inters++;
        }, 200);
        
        // $scope.showModalAdd(type);
    }

    $scope.detailPeriode = function (type,periode_id, disable_form=false) {
        
        $scope.notes_periode = [];
        $scope.disable_form = disable_form
        
        // $scope.getelements("categories");
        $scope.requeterNotesPeriode(periode_id, "detail");
        let inters = 0;
        $('#id_detailperiode').val(periode_id);
        //Attendre que les données catégories soient chargées relancer chaque 200 milisecondes pendant 10 foix max 
        var getDataInterval = setInterval(() => {
            console.log("notes_periode =>", $scope.notes_periode);
            if($scope.notes_periode.length > 0){
                
                $("#modal_adddetailperiode").modal('show', {
                    backdrop: 'static'
                });
                clearInterval(getDataInterval);
                $scope.addListeners()
            }
            inters++;
        }, 200);
        
        // $scope.showModalAdd(type);
    }


    $scope.envoyer_mail = function (route,periode_id) {
        console.log('icii',route,periode_id);
        // $scope.getelements("categories");
        $scope.requeterSurController(route, periode_id); 
    
        // $scope.showModalAdd(type);
    }

    
    $scope.addListenersDragList = function () {
        let types = ["sortable-categorie","sortable-competence"];
        types.forEach(type => {
            const sortableList = document.querySelector("#"+type);
            const items = sortableList.querySelectorAll(".sortable-item");
            items.forEach(item => {
                item.addEventListener("dragstart", () => {
                    // Adding dragging class to item after a delay
                    setTimeout(() => item.classList.add("dragging"), 0);
                });
                // Removing dragging class from item on dragend event
                item.addEventListener("dragend", () => {
                    item.classList.remove("dragging")
                    $scope.reorderArray(type)
                });
            });

            sortableList.addEventListener("dragover", e =>{
                $scope.initSortableList(e, type)
            });
            sortableList.addEventListener("dragenter", e => e.preventDefault());
        });
        
    }
    $scope.initSortableList = function(e,type) {
        e.preventDefault();
        const sortableList = document.querySelector("#"+type);
        const draggingItem = document.querySelector(".dragging");
        // Getting all items except currently dragging and making array of them
        let siblings = [...sortableList.querySelectorAll(".sortable-item:not(.dragging)")];
        
        // Finding the sibling after which the dragging item should be placed
        let nextSibling = siblings.find(sibling => {
            return e.clientY <= sibling.offsetTop + sibling.offsetHeight ;
        });
        if(nextSibling){
            console.log(nextSibling.getAttribute("data-id"));
        }
        // Inserting the dragging item before the found sibling
        sortableList.insertBefore(draggingItem, nextSibling);
        
    }
    $scope.reorderArray = function (type) {
        let type_name = type.split("-").pop()
        $scope.array_reordered[type_name] = [];
        const sortableList = document.querySelector("#"+type);
        
        sortableList.querySelectorAll(".sortable-item").forEach(function (item,index){
            item.setAttribute("data-index", index)
            $scope.array_reordered[type_name].push({
                ordre: index+1,
                id: item.getAttribute("data-id")
            });
        });
    }
    
    $scope.dragStart = function () {
        dragStartIndex = +this.closest("li").getAttribute("data-index");
      }
      
    $scope.dragEnter = function () {
        this.classList.add("over");
    }
    
    $scope.dragLeave = function () {
        this.classList.remove("over");
    }
    
    $scope.dragOver = function (e) {
        e.preventDefault(); // dragDrop is not executed otherwise
    }
    
    $scope.dragDrop = function () {
        const dragEndIndex = +this.getAttribute("data-index");
        $scope.swapItems(dragStartIndex, dragEndIndex);
        this.classList.remove("over");
    }
    $scope.swapItems = function (fromIndex, toIndex) {
        // Get Items
        let listItems  = document.querySelectorAll('.draggable-list-item')

        const itemOne = listItems[fromIndex].querySelector(".draggable");
        const itemTwo = listItems[toIndex].querySelector(".draggable");
        // Swap Items
        listItems[fromIndex].appendChild(itemTwo);
        listItems[toIndex].appendChild(itemOne);
        let my_array = []
        listItems.forEach(element => {
            
            let id              = element.getAttribute("data-id")
            let indexOrder      = element.getAttribute("data-index")

            my_array.push({
                'id':id,
                'index':indexOrder
            })
            console.log(my_array);
        });
    }
    var interval = null;
    $scope.bill = {
        quantity: 0
    };
    $scope.add = function (newVal) {
        console.log("Add");
        initInterval(newVal);
    }

    function initInterval(newVal) {
        if (!interval) {
            console.log("Interval start");
            interval = setInterval(function () {
                $scope.$apply(function () {
                    $scope.bill.quantity += newVal;
                    if ($scope.bill.quantity >= 0) {
                        $("#nombre_couvert_commande").val($scope.bill.quantity);
                    }

                });
            }, 100);
        }
    }

    $scope.clearInterval = function () {
        console.log("Interval cleared");
        if (interval) {
            window.clearInterval(interval);
            interval = null;
        }
    }

    $scope.incrementerNumber = function (tagForm, signe) {
        var number = $("#" + tagForm).val();
        if (!number) {
            number = 0;
        }
        number = +number;
        if (signe > 0) {
            number++;
        } else {
            if (number > 0) {
                number--;
            }
        }
        console.log('-----Je suis---------');
        console.log(number);
        $("#" + tagForm).val(number);
    }

    //--DEBUT => Fonction mise à jour--//
    //markme-MODIFICATION



    $scope.showModalDuplicate = function (type, itemId) {

        console.log("showModalDuplicate", type);
        $scope.is_duplication = true;
        $scope.showModalUpdate(type, itemId);
        
        
    };

    $scope.showModalUpdate = function (type, itemId, optionals = {
        forceChangeForm: false,
        isClone: false,
        transformToType: null,
        itemIdForeign: null
    }, isClonned = false, item = null) {

        console.log("showModalUpdate", type);

        var formatId = "id";
        var listeattributs_filter = [];
        var listeattributs = listofrequests_assoc[type + "s"];
        var modal = type;

        reqwrite = type + "s" + "(" + formatId + ":" + itemId + ")";

        //Pour les modals avec changement d'attributs
        if (type == "importurl") {
            var typeTmp = "import";
            reqwrite = typeTmp + "s" + "(" + formatId + ":" + itemId + ")";
            listeattributs = listofrequests_assoc[typeTmp + "s"];
        }

        if (optionals.transformToType) {
            tmpType = type;
            type = optionals.transformToType;
        }

        $scope.showModalAdd(type, { fromUpdate: true }, item);

        $scope.update = true;
        Init.getElement(reqwrite, listeattributs, listeattributs_filter).then(function (data) {
            var item = data[0];
            if (!optionals.isClone && !optionals.transformToType) {
               
                if (isClonned) {
                    $scope.clonange = true
                }
                else {
                    $scope.clonange = false
                    $('#id_' + type).val(item.id);
                }
                
            }

            $('#modal_add' + type).blockUI_start();

            if (type == 'erreur') {
                //update_erreur
                $('#designation_' + type).val(item.designation);
                $('#erreur_' + type).val(item.erreur);
            }
            
            if (type == 'preference') {
                //update_preference
                $('#list_id_' + type).val(item.list_id);
                $('#delais_notification_' + type).val(item.delais_notification);
                $('#emails_a_notifier_' + type).val(item.emails_a_notifier);
                    $('#nombre_entreprise_' + type).val(item.nbre_entreprise_par_jour);
                // $('#couleur_codif_' + type).val(item.couleur_codif);
            }
            if (type == 'categorie') {
                //update_categorie
                $('#designation_' + type).val(item.designation);
             
            }
            if (type == 'fournisseur') {
                console.log(item);
                //update_fourniseeur
                $('#designation_' + type).val(item.designation);

                var selectedValues = new Array();

                item.fournisseur_evaluateurs.forEach((item) => {
                    selectedValues.push(item.evaluateur_id);
                });
                $('#evaluateur_' + type).val(selectedValues).trigger('change');
             
            }
            if (type == 'competence') {
                //update_competence
                $('#designation_' + type).val(item.designation);
                $('#categorie_id_' + type).val(item.categorie_id);
             
            }
            if (type == 'periode') {
                //update_periode
                $('#fournisseur_' + type).val(item.fournisseur_id).trigger('change');
                $('#designation_' + type).val(item.designation);
                $('#date_notification_' + type).val(item.date_notification);
             
            }
            if (type == 'entreprise') {
                //update_entreprise
                $('#code_' + type).val(item.code);
                $('#comment_' + type).val(item.comment);
            }
            
            if (type == 'user') {
                let checked = false;
                
                //update_user
                $('#nom_' + type).val(item.name);
                // $('#prenom_' + type).val(item.prenom);
                $('#email_' + type).val(item.email);
                $('#password_seen_' + type).val(item.password_seen);

                // $('#numerotel_' + type).val(item.numerotel);

            }
            
            // Si le model contient une image dans son formulaire
            if (item.image !== undefined) {
                $('#img' + type)
                    .val("")
                    .attr('required', false).removeClass('required');
                $('#affimg' + type).attr('src', (item.image ? item.image : imgupload));
            }
            // $("#modal_add"+type).modal('show');
            setTimeout(function () {
                $('#modal_add' + type).blockUI_stop();
                $scope.reInitSelect2();

            }, 1000);
        }, function (msg) {
            $scope.showToast("", msg, 'error');
        });
    };
    //--FIN => Fonction mise à jour--//


    // implémenter toutes les variations du formulaire
    $scope.changeStatut = function (e, type) {
        var form = $('#form_addchstat');
        var send_data = {
            id: $scope.chstat.id,
            status: $scope.chstat.statut,
            commentaire: $('#commentaire_chstat').val()
        };
        form.parent().parent().blockUI_start();
        Init.changeStatut(type, send_data).then(function (data) {
            form.parent().parent().blockUI_stop();
            if (data.data != null && !data.errors) {
                $scope.pageChanged(type);

                title = 'ACTIVATION';
                typeToast = 'success';
                if ($scope.chstat.statut == 0) {
                    title = 'DÉSACTIVATION';
                    typeToast = 'warning';
                }

                $scope.showToast(title, 'succès', typeToast);

                $("#modal_addchstat").modal('hide');
                $scope.closeModal("#modal_addchstat")
            } else {
                $scope.showToast("", '<span class="h4">' + data.errors + '</span>', 'error');
            }
        }, function (msg) {
            form.parent().parent().blockUI_stop();
            $scope.showToast("", '<span class="h4">' + msg + '</span>', 'error');
        });
    };


    // Permet d'afr2ar le formulaire
    $scope.sousfamille = { 'reponse': false };
    $scope.souscategorieproduit = { 'reponse': false };
    $scope.currentTypeModal = null;
    $scope.currentTitleModal = null;
    $scope.resetDataEtude = function(){
        

        $scope.conditions_r2a = [
            { question: "", operateur : '', valeur : ''}
        ];
        $scope.contenus_r2a = [
            { 
                theme: "", 
                questions : [],
                shortcuts : []
    
            }
        ];
        $scope.entetes_r2a = [
            { 
                titre: "", 
                question : ''
            }
        ];
        $('#operateur_conditions_etude').val('&&')
        //$scope.operateur_conditions = "&&";
        $scope.reInit();
    }
    $scope.showModalAdd = function (type, optionals = { is_file_excel: false, title: null, fromUpdate: false }, item = null) {
        $scope.update = false;
        $scope.is_checked = false;
        $scope.clonange = false
        $scope.BciIdClonned = null



        $scope.currentTitleModal = optionals.title;
        $scope.currentTypeModal = type;
        $scope.emptyform((optionals.is_file_excel ? 'liste' : type));
        if (!optionals.is_file_excel) {
            if (type.indexOf('role') !== -1) {
                $scope.roleview = null;
                $scope.role_permissions = [];
                $scope.getelements('permissions');
                //     $scope.emptyform('permission', true);
            }
        }

        $("#modal_add" + (optionals.is_file_excel ? 'list' : type)).modal('show', {
            backdrop: 'static',
        
        });
        if (type == "codificationRelecteur") {
            $scope.closeModal("#modal_addrecapCodif");
        }
        if (type == "etude") {
            $scope.resetDataEtude();
            setTimeout(() => {
                $scope.reInitCkeditor("etude");
            }, 500);
        }

        if (type == "codifrelecteur") {
            //Fermer modal
            //$scope.closeModal("#modal_addrecapCodif");
        }

        if (type == "VisueltableauDeQuestion") {
            $scope.closeModal("#modal_addcodification");
            $scope.getDataQuestion();
        }
        if (type == "plancode") {
            $scope.planCodeInTable;
        }
        if (type == "codification" || type == "r2a") {
            $scope.questionInTable;
        }
        if (type == "detailCodifRelecteurs") {
            $scope.taux_a_relir[0] = 0;
            $scope.detailCodifications;
            $scope.getelements('relecteurs');
            $scope.pageChanged('relecteurs');
            $scope.reInitDatatables();
        }
        if (type == "recapCodif") {
            $scope.detailCodifications;
            $scope.donneesQuestionnaire;
        }

        if (type == "codifrelecteur") {
            $scope.donneesTabQuestionnaire;
            $scope.code_trancheEffectifs;
            $scope.shortcut;
        }
        if (type == "relectrelecteur") {
            $scope.donneesTabQuestionnaire;
            $scope.shortcut;
        }
        if (type == "commentaire") {
            $scope.closeModal("#modal_addcodification");
       }
    };


    // Hide modal
    $('body').on('click', function (event) {
        var type = $scope.currentTemplateUrl.split('list-');
        if (type[1] == 'traiteur') {
            type[1] = 'proforma';
        }
        else if (type[1]) {
            if ($('#sousdepartement').hasClass('active')) {
                type[1] = "sousdepartement";
            }
            if ($('#sousfamille').hasClass('active')) {
                type[1] = "sousfamille";
            }
            if ($('#souscategorieproduit').hasClass('active')) {
                type[1] = "souscategorieproduit";
            }
            if ($('#list-menu').hasClass('active')) {
                type[1] = "menu";
            }
        }
        // console.log("ici les details => ", event.target.id, type[1])
        if ($('#modal_add' + type[1]).hasClass('modal') && $('#modal_add' + type[1]).hasClass('show')) {
            return
            var idmodal = 'modal_add' + type[1];

            // $scope.dataInTabPane['produits_commande']['data'];
            if (idmodal === event.target.id) {
                currentModal = $(this);
                title = "Fermeture du modal";
                msg = "Voulez-vous vraiment quitter le modal ... ?";

                swalWithBootstrapButtons.fire({
                    title: title,
                    text: msg,
                    icon: 'question',
                    showCancelButton: true,
                    reverseButtons: true
                }).then((result) => {
                    if (result.isConfirmed) {
                        if ($("#" + event.target.id).hasClass('modal') && $("#" + event.target.id).hasClass('show')) {

                            setTimeout(() => {
                                $("#" + event.target.id).removeClass('show')

                                $("#" + event.target.id).removeAttr('style')
                                    .removeClass('modal__overlap')
                                    .removeClass('overflow-y-auto')

                                // Add scroll to highest z-index modal if exist
                                $('.modal').each(function () {
                                    if (parseInt($(this).css('z-index')) === getHighestZindex()) {
                                        $(this).addClass('overflow-y-auto')
                                    }
                                })

                                if (getHighestZindex() == 50) {
                                    $('body').removeClass('overflow-y-hidden')
                                        .css('padding-right', '')
                                }

                                // Return back modal element to it's first place
                                // $('[data-modal-replacer="' + $("#"+event.target.id).attr('id') + '"]').replaceWith("#"+event.target.id)
                            }, 200)
                        }
                    } else if (result.dismiss === Swal.DismissReason.cancel) {
                    }
                });



                console.log('modal**************', currentModal.data);
                event.preventDefault();
            }
            /*else if (idmodal === event.target.id ){
                $scope.closeModal("#"+event.target.id)
            }*/
        }
        else if (event.target.id == "modal_addlist") {
            console.log("ici les details => ", event.target.id, type[1])
            $scope.closeModal("#modal_addlist")
        }

    })

    const swalWithBootstrapButtons = Swal.mixin({
        confirmButtonText: '<i class="fas fa-thumbs-up"></i> OUI',
        cancelButtonText: '<i class="fas fa-thumbs-down"></i> NON',
        customClass: {
            confirmButton: 'button bg-success text-white',
            cancelButton: 'button bg-danger text-white mr-2'
        },
        buttonsStyling: false
    });
    $scope.getClassInput = function (type, index ){
        let classe = "";
        let data = $scope.donneesTabQuestionnaire[index][type];
        
        if(data){
            data = data.replace(/\s/g, '');
            if(type == 'siret' ){
                if((data.length > 0 && data.length != 14) || /^\d+$/.test(data) == false ){
                    classe = "border-danger";
                }else if(data.length == 14){
                    classe = "border-success";
                }
            }
            else if(type == 'telephone' ){
                if((data.length > 0 && data.length != 10 && data.length != 11) || /^\d+$/.test(data) == false ){
                    classe = "border-danger";
                }else if(data.length == 10 || data.length == 11){
                    classe = "border-success";
                }
            }
            else if(type == 'code_naf' ){
                if((data.length > 0 && data.length != 4 && data.length != 5) || (/^\d+$/.test(data) &&  /[a-zA-Z]/.test(data) == false)){
                    classe = "border-danger";
                }else if(data.length == 4 || data.length == 5){
                    classe = "border-success";
                }
            }
        }
        return classe+" r2a"
    }
    $scope.getClassTextarea = function (data){
        if(data.reponse_relue == "PARCE QUE J'EN SUIS SATISFAIT MAIS C'EST PAS EXCLLENT."){
            console.log(data);
        }
        if(data.reponse_relue != data.reponse_codif || data.relue == 1){

            return "border-success r2a"
        }
    }
    $scope.requeterNotesPeriode = function (periode_id, args = null) {
        route = "notes_periode";
        //Pour le blockUI
        var component = $('.classe_generale');
        var messageDebut = "Action en cours, veuillez patienter SVP !!!";
        var messageFin = "Action terminée";

        //component.parent().blockUI_start();
        iziToast.info({
            title: "",
            message: messageDebut,
            position: 'topRight'
        });

        $http({
            url: BASE_URL + "" + route,
            method: "POST",
            data: { "periode_id": periode_id, "args" : args }
        }).then(function successCallback(data) {
            if (data.data != null && !data.data.error) {
                console.log("Pas d'erreurs", data.data);

                
                $scope.notes_periode = data.data ; 
               
            
                component.parent().blockUI_stop();
                iziToast.success({
                    title: "",
                    message: messageFin,
                    position: 'topRight'
                });

            }
            else if (data.data.error) {
                console.log("Avec erreurs");
                component.parent().blockUI_stop();
                //moimeme-Ajouté récemment
                iziToast.error({
                    title: "",
                    message: '<span class="h4">' + data.data.error + '</span>',
                    position: 'topRight'
                });
            }
            else {
                console.log("Avec erreurs");
                component.parent().blockUI_stop();
                //moimeme-Ajouté récemment
                iziToast.error({
                    title: "",
                    message: "Une erreur s'est produite, réessayez plus tard !!!",
                    position: 'topRight'
                });
            }
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            $scope.error = response.statusText;
            iziToast.error({
                title: "",
                message: '<span class="h4">Une erreur est survenue depuis le serveur réessayez plus tard</span>',
                position: 'topRight'
            });
        });
    }

    $scope.showModalAddCodifrelecteur = function (shortcut, id_askia, etude_id, codification_id, type_modal ="codifrelecteur", id) {
        if(type_modal == "codifrelecteur" || type_modal == "relecrelecteur"){
            $scope.autosave = setInterval(() => {
               // $scope.addElement(null, type_modal,  {is_automatic : true});
            }, 300000);
            $('#modal_add'+type_modal).on('hidden.bs.modal', function () {
                clearInterval($scope.autosave);
                setTimeout(() => {
                    $scope.requeterSurController("recap_codification", $scope.codification_id_to_reload);
                }, 1000);
            });
        }
       
        $scope.shortcut_r2a = shortcut;
        
        
        var type = 'trancheeffectif';
        // var filtres = 'etude_id:' + etude_id + ',question:"' + shortcut + '"';
        var typeAvecS = type + 's';
        var rewriteReq = typeAvecS ;
        var form = $('#modal_add' +type_modal)

        form.parent().parent().blockUI_start();
        Init.getElement(rewriteReq, listofrequests_assoc[typeAvecS]).then(function (data) {
            form.parent().parent().blockUI_stop();
            $scope.code_trancheEffectifs = data;
        });
        $scope.requeterRecapDonneeCodifier(shortcut, id_askia, codification_id, type_modal,id);


    }
    $scope.terminerRelecShortcut = function (shortcut,codification_id) {
            var title = 'Clôture';
            var form = $('#modal_addrecapRelec')

            form.parent().parent().blockUI_start();
            
            var deferred = $q.defer();
            $http({
                method: 'POST',
                url: BASE_URL +'terminer_r2a_shortcut/' + shortcut +'/'+ codification_id,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(function successCallback(response) {
                $scope.requeterSurController("recap_codification", codification_id);
                $scope.showToast(title, 'Succès', 'success');
                form.parent().parent().blockUI_stop();
            }, function errorCallback(error) {
                $scope.showToast(title, msg, 'error');
            });
            return deferred.promise;
        
    };
    // requete au niveau de la base de données
    $scope.showModalAddCodification = function (id, type = null) {
        console.log("showModalAddCodification",id, type);
        $scope.showModalAdd(type);

        var typeCourant = 'codification';
        if(type == 'detailRelecRelecteurs'){
            typeCourant = "r2a";
        }
        
        var filtres = 'id:' + id + '';

        $scope.getDetailCodificationData(type,typeCourant, filtres)
    };


    $scope.getDetailCodificationData = function (type, typeCourant, filtres) {
        
        var form = $('#form_add' + typeCourant);
        form.parent().parent().blockUI_start();
        var rewriteReq = typeCourant+"s" + '(' + filtres + ')';

        Init.getElement(rewriteReq, listofrequests_assoc[typeCourant+"s"]).then(function (data) {
            if (data && data[0]) {
                form.parent().parent().blockUI_stop();
                //update_detail_codifications
                $("#nombre_entreprise_affecter_"+typeCourant).val("")
                setTimeout(() => {
                    codificattion_relecteurs = data[0].codification_relecteurs; 
                    console.log("codificattion_relecteurs",
                    data[0]); 
                    let i = 0; 
                    codificattion_relecteurs.forEach(element => {
                        val = "#valeur_"+i+"_detailCodifRelecteurs";
                        console.log(val);   
                        $scope.taux_a_relir[i] = element.nbre_ligne;
                        $(val).val(element.pourcentage).trigger('change');
                        
                        i++; 
                    });
                },10);
                // console.log(codificattion_relecteurs); 
                $scope.detailCodifications   = data[0] ;
                console.log("detailCodifications ==>",   $scope.detailCodifications )
                // $scope.getRelecteursDisponibles();
            }
        });
    }
    // modal commentaire_verbatims
    $scope.showModalCommentaire = function(data, type_modal="commentaire"){
        console.log("showModalCommentaire",type_modal);
        var idmodal = "#modal_add" + type_modal; 
        var form = $(idmodal)
        $(idmodal).modal('hide');
        setTimeout(() => {
            $(idmodal).addClass('show');
        }, 500);
        form.parent().parent().blockUI_start();
      
        setTimeout(() => {
            console.log("showModalCommentaire ==> setTimeout");
            if ($(idmodal).hasClass('modal') && $(idmodal).hasClass('show')) {
                  form.parent().parent().blockUI_stop();
                console.log("showModalCommentaire ==> IF");
                $(idmodal).modal('show');
                
                $("#commentaire_commentaire").val(''); 
                $("#IDLVDC_commentaire").val(data.IDLVDC); // #data_commentaire
                $("#shortcut_commentaire").val(data.shortcut_codif); // #data_commentaire
    
                data.QuestionnairesComplet.forEach(array => {
                    if(array.libelle_court == data.shortcut_codif)
                    {
                        $("#libelleLong_"+type_modal).val(array.libelle_long); // #data_commentaire
                    }
                });
                
                $("#varbatim_commentaire").val(data.reponse_codif); // #data_commentaire
                $("#codif_commentaire").val($("#codif_relecrelecteur").val());
            }  
        }, 800);
        
    }

    $scope.showModalAddRecapcodif = function (id, type = null) {
        $scope.showModalAdd(type);
        $scope.codification_id_to_reload = id;
        $scope.requeterSurController("recap_codification", id);
    }

    $scope.showFormRemplace = function () {
        $scope.addNewRelecteur = true;
        
        //$scope.showModalAdd(type);
        //$scope.requeterSurController("recap_codification", id);
    }

    $scope.getRelecteursDisponibles = function () {
        $scope.relecteurs_disponibles = $scope.dataPage["relecteurs"];

        $scope.detailCodifications.codification_relecteurs.forEach(element => {
            let index = $scope.relecteurs_disponibles.findIndex(row => row.id == element.relecteur_id)
            $scope.relecteurs_disponibles.splice(index, 1)
        });
        console.log($scope.relecteurs_disponibles)
    }

    $scope.addRelecteurtoCodification = function (id, type) {
        
        let typeCourant = type;
        
        relecteurs        = $("#new_relecteur_"+typeCourant).val(); 
        nombre_entreprise = $("#nombre_entreprise_affecter_"+typeCourant).val(); 

        if(relecteurs == '')
        {
            iziToast.error({
                message: "Veuillez choisir un siretiseur",
                position: 'topRight'
            });
            return false;  
        }
        if(nombre_entreprise == '')
        {
            iziToast.error({
                message: "Veuillez renseinger le nombre d'entrepises à siretiser",
                position: 'topRight'
            });
            return false;  
        }
        // Si le nombre entreprise et les relecteurs sont renseignés : 
        if(nombre_entreprise && relecteurs )
        {
            let data = {
                "relecteurs" : relecteurs,
                "nombre_entreprise" : nombre_entreprise,
                "codification_id" : id
            }

            $scope.requeterSurController("new_relecteur", data);
            var filtres = 'id:' + id + '';
    
            setTimeout(() => {
                $scope.getDetailCodificationData(type,typeCourant, filtres)
            }, 2000);
        }
        
    }

    
    $scope.reassignRelecteurSelectChanged = function name(e) {
        
    }
    $scope.reassignerCodificationRelecteur = function (type) {
        let relecteurs_reass = [];
        $scope.relecteurs_to_reassign.forEach(element => {
            let val = $("#reass_"+type+element.id).val();
            console.log("#reass_"+type+element.id);
            console.log(val);

            if (val >0) {
                relecteurs_reass.push({
                    "relecteur_id" : element.id,
                    "pourcentage" : val
                })
            }
        });

        let data = {
            "relecteurs" : relecteurs_reass,
            "codification_relecteur_id" : $scope.reassigned_for
        }
        let typeCourant = "codification";
        if(type == "detailRelecRelecteurs"){
            typeCourant = "r2a";
        }
        $scope.requeterSurController("reassigner_relecteur", data);
        var filtres = 'id:' + $scope.reassigned_codification_id + '';
        console.log(filtres);
        setTimeout(() => {
            $scope.getDetailCodificationData(type,typeCourant, filtres)
        }, 2000);
        

    }
    
    //Permet de cacher ou faire apparaitre certains champs sur choix d'un checkbox ou d'un select
    $scope.updateCheck = function (id, classeToHide, elementTypeName = "checkbox", value = 0, classeToShow) {
        console.log("updateCheck");
        var valeur = value;
        if (elementTypeName == "select") {
            if (valeur) {
                $scope.est_r2a = true ; 

                $("." + classeToShow).fadeIn('slow');
            } else {
               
                $("." + classeToShow).fadeOut('slow');
            }
        }
        else {
            if ($("#" + id).prop("checked") == true) {
                $scope.questionInTable = [];
                $scope.est_r2a = true ; 

                $('#dataId_relue_codification').val("").trigger('change');
                $("#btn_deleted_codification").css("display", "none");


                $("." + classeToShow).fadeIn('slow');
                $("." + classeToHide).fadeOut('slow');

            }
            else {
                $scope.questionInTable = [];
                $("." + classeToShow).fadeOut('slow');
                $("." + classeToHide).fadeIn('slow');
            }
        }
    }

    $scope.closeModal = function (idmodal) {
        console.log('closeModal', idmodal);
        if ($(idmodal).hasClass('modal') && $(idmodal).hasClass('show')) {
            setTimeout(() => {
                $(idmodal).removeClass('show')
                console.log("je suis à l'interieur")
                $(idmodal).removeAttr('style')
                    .removeClass('modal__overlap')
                    .removeClass('overflow-y-auto')
             
                // Add scroll to highest z-index modal if exist
                $('.modal').each(function () {
                    if (parseInt($(this).css('z-index')) === getHighestZindex()) {
                        $(this).addClass('overflow-y-auto')
                    }
                })

                // // Restaurer la position de défilement d'origine du premier modal
                // $(window).scrollTop($scope.scrollTop);

                if (getHighestZindex() == 50) {
                    $('body').removeClass('overflow-y-hidden')
                        .css('padding-right', '')
                }

                // Return back modal element to it's first place
                // $('[data-modal-replacer="' + $(idmodal).attr('id') + '"]').replaceWith(idmodal)
            }, 200)
        }
    }

    //Forcer la fermeture du modal
    $scope.closeModalFast = function (idmodal) {
        console.log("closeModalFast", idmodal)
        $(idmodal).modal('hide');
    }

    // hide modal link
    $('body').on('click', '[data-dismiss="modal"]', function () {
        let idmodal = $(this).closest('.modal')[0].id
        console.log("ici le modal", idmodal); 
        // if(idmodal == "modal_addcommentaire"){
        //     $("#modal_addrelecrelecteur").addClass("modal-ouvert");

        // }
        
        if ($("#" + idmodal).hasClass('modal') && $("#" + idmodal).hasClass('show')) {
            console.log("ici le modal ici", idmodal)
            setTimeout(() => {
                $("#" + idmodal).removeClass('show')
                $("#" + idmodal).removeAttr('style')
                    .removeClass('modal__overlap')
                    .removeClass('overflow-y-auto')

                // Add scroll to highest z-index modal if exist
                $('.modal').each(function () {
                    if (parseInt($(this).css('z-index')) === getHighestZindex()) {
                        $(this).addClass('overflow-y-auto')
                    }
                })

                if (getHighestZindex() == 50) {
                    $('body').removeClass('overflow-y-hidden')
                        .css('padding-right', '')
                }

                // Return back modal element to it's first place
                // $('[data-modal-replacer="' + $("#"+idmodal).attr('id') + '"]').replaceWith("#"+idmodal)
            }, 200)
        }
        // $route.reload();
    })

    $scope.getTableEntite = function (entite_id, occupation = null) {
        if ($scope.dataPage['entites'] && $scope.dataPage['entites'].length == 1) {
            $scope.entite_reservation = entite_id;

            var rewriteReq = "tablespaginated(entite_id:" + entite_id + "page:1,count:10";
            var occupation = '';
            if (occupation) {
                occupation = ',occupation:false'
            }
            rewriteReq += occupation + ")";
            $scope.getElementPaginatedUse('table', rewriteReq);
        }
    }

    $scope.brouillon = function (type, e) {
        $("#brouillon_" + type).val(1);
        $scope.addElement(e, 'planing');
    }


    // Add element in database and in scope

    

    $scope.addElement = function (e, type, optionals = { from: 'modal', is_file_excel: false , is_automatic: false}) {
        if (e != null) {
            e.preventDefault();
        }
        console.log(optionals.is_automatic);
        var form = $('#form_add' + (optionals.is_file_excel ? 'liste' : type));
        var formdata = (window.FormData) ? (new FormData(form[0])) : null;
        var send_data = (formdata !== null) ? formdata : form.serialize();

        // A ne pas supprimer
        send_dataObj = form.serializeObject();
        continuer = true;
        $.each($scope.dataInTabPane, function (keyItem, valueItem) {
            tagType = '_' + type;
            if (keyItem.indexOf(tagType) !== -1) {
                send_data.append(keyItem.substring(0, keyItem.length - (tagType.length)), JSON.stringify($scope.dataInTabPane[keyItem]['data']));
                console.log('********************', keyItem.substring(0, keyItem.length - (tagType.length)), JSON.stringify($scope.dataInTabPane[keyItem]['data']));
            }
        });
        if (type === "menu") {
            $scope.dataInTabPane['tranche_horaires_menu']['data'] = $scope.dataPage['tranchehoraires'];
        }

        $.each($scope.dataInTabPane, function (keyItem, valueItem) {
            tagType = '_' + type;
            if (keyItem.indexOf(tagType) !== -1) {

                send_data.append(keyItem.substring(0, keyItem.length - (tagType.length)), JSON.stringify($scope.dataInTabPane[keyItem]['data']));
                console.log('Type---->' + type);

            }
        });

        if (type.indexOf('role') !== -1) {
            send_data.append("permissions", $scope.role_permissions);
            console.log('role_permissions', $scope.role_permissions, '...', send_data.get('role_permissions'));
            if ($scope.role_permissions.length == 0 && optionals.is_file_excel == false) {
                $scope.showToast("", "Vous devez ajouter au moins une permission au présent role", 'error');
                continuer = false;
            }
        }

        
        console.log(form);
        //continuer = false
        if (form.validate() && continuer) {
            console.log("validate & continuer");
            form.parent().parent().blockUI_start();
            Init.saveElementAjax(type, send_data, optionals.is_file_excel).then(function (data) {
                console.log('Valeur de data = ', type, data);
                form.parent().parent().blockUI_stop();
                if (type == "completeperiode") {
                    $scope.pageChanged('periode');
                }
                if (data.data != null && !data.errors) {
                   
                    if (type == "importrecherche") {
                        $scope.pageChanged('recherche');
                    }
                    else {
                        $scope.pageChanged(type);
                    }

                    $isTest = false;
                    if (send_dataObj.type) {
                        if (send_dataObj.type == "test_fichier") {
                            $isTest = true;
                        }
                    }
                    if ($isTest === true) {
                        $scope.showToast((!data.message ? "TEST" : ""), "Le test est OK", "success");
                    }else if(optionals.is_automatic == true){
                        $scope.showToast("Enregistrement Automatique", 'Succès', 'success')

                    }
                    else {
                        $scope.closeModal()
                        $scope.showToast((!data.message ? (!send_dataObj.id ? 'AJOUT' : 'MODIFICATION') : ""), (!data.message ? "" : data.message), "success");
                    }
                    if(optionals.is_automatic == false){
                    
                        if(type == 'commentaire'){
                            $scope.closeModal("#modal_add" + type)
                        }else{
                            $("#modal_add" + (optionals.is_file_excel ? "list" : type)).modal('hide');
                            $scope.closeModal("#modal_add" + type); 
                        }
                    }
                    
                } else {
                    let errs = null;
                    if (typeof data.errors == "object") {
                        errs = Object.keys(data.errors);

                        errs.forEach((elmt) => {
                            $scope.showToast('', ('<span class="h4 text-dark">' + (data.errors)[elmt] + '</span>'), 'error');
                        });
                    } else {
                        $scope.showToast(('<span class="h4">' + data.errors + '</span>'), 'error', '');
                    }
                }
            }, function (msg) {
                if (typeof data === 'undefined') {
                    form.parent().parent().blockUI_stop();

                    $scope.showToast((!send_data.id ? 'AJOUT' : 'MODIFICATION'), ('<span class="h4">Erreur depuis le serveur, veuillez contactez l\'administrateur</span>'), 'error')
                }
            });
        }
        if(type.indexOf('relecteur') != -1 && $scope.codification_id_to_reload && optionals.is_automatic == false){
            
            setTimeout(() => {
                //$scope.requeterSurController("recap_codification", $scope.codification_id_to_reload);
            }, 10000);
        }
        if(optionals.is_automatic==true){
            $scope.showToast(('<span class="h4">Enregistrement automatique avec succès</span>'), 'success', '');
        }
        console.log("Après validation", type)
        // 
    };
    

    $scope.orderElements = function (e, type, optionals = { from: 'modal', is_file_excel: false , is_automatic: false}) {
        if (e != null) {
            e.preventDefault();
        }
        $('#form_order'+type).val(JSON.strin)
        console.log(optionals.is_automatic);
        var form = $('#form_order'+type);
        var formdata = (window.FormData) ? (new FormData(form[0])) : null;
        var send_data = (formdata !== null) ? formdata : form.serialize();

        console.log(send_data);
        // A ne pas supprimer
        send_dataObj = form.serializeObject();
        continuer = true;
       
        if (type === "menu") {
            $scope.dataInTabPane['tranche_horaires_menu']['data'] = $scope.dataPage['tranchehoraires'];
        }

        

        
        console.log(form);
        //continuer = false
        if (form.validate() && continuer) {
            console.log("validate & continuer");
            form.parent().parent().blockUI_start();
            Init.saveElementAjax(type, send_data, optionals.is_file_excel).then(function (data) {
                console.log('Valeur de data = ', type, data);
                form.parent().parent().blockUI_stop();
                if (data.data != null && !data.errors) {
                    if (type.indexOf('role') !== -1) {
                        //$scope.getelements('roles');
                    }
                    else if (type == "importcontact") {
                        $scope.pageChanged('contact');
                    }
                    else if (type == "importrecherche") {
                        $scope.pageChanged('recherche');
                    }
                    else {
                        $scope.pageChanged(type);
                    }

                    $isTest = false;
                    if (send_dataObj.type) {
                        if (send_dataObj.type == "test_fichier") {
                            $isTest = true;
                        }
                    }
                    if ($isTest === true) {
                        $scope.showToast((!data.message ? "TEST" : ""), "Le test est OK", "success");
                    }else if(optionals.is_automatic == true){
                        $scope.showToast("Enregistrement Automatique", 'Succès', 'success')

                    }
                    else {
                        $scope.closeModal()
                        $scope.showToast((!data.message ? (!send_dataObj.id ? 'AJOUT' : 'MODIFICATION') : ""), (!data.message ? "" : data.message), "success");
                    }
                    if(optionals.is_automatic == false){
                    
                        if(type == 'commentaire'){
                            $scope.closeModal("#modal_add" + type)
                        }else{
                            $("#modal_add" + (optionals.is_file_excel ? "list" : type)).modal('hide');
                            $scope.closeModal("#modal_add" + type); 
                        }
                    }
                    
                } else {
                    let errs = null;
                    if (typeof data.errors == "object") {
                        errs = Object.keys(data.errors);

                        errs.forEach((elmt) => {
                            $scope.showToast('', ('<span class="h4 text-dark">' + (data.errors)[elmt] + '</span>'), 'error');
                        });
                    } else {
                        $scope.showToast(('<span class="h4">' + data.errors + '</span>'), 'error', '');
                    }
                }
            }, function (msg) {
                if (typeof data === 'undefined') {
                    form.parent().parent().blockUI_stop();

                    $scope.showToast((!send_data.id ? 'AJOUT' : 'MODIFICATION'), ('<span class="h4">Erreur depuis le serveur, veuillez contactez l\'administrateur</span>'), 'error')
                }
            });
        }
        if(type.indexOf('relecteur') != -1 && $scope.codification_id_to_reload && optionals.is_automatic == false){
            
            setTimeout(() => {
                //$scope.requeterSurController("recap_codification", $scope.codification_id_to_reload);
            }, 10000);
        }
        if(optionals.is_automatic==true){
            $scope.showToast(('<span class="h4">Enregistrement automatique avec succès</span>'), 'success', '');
        }
        console.log("Après validation", type)
        // 
    };

    //Charger les données du TabPane
    $scope.chargerDonnesTapPane = function (type, val, panel="month") 
    {
        if (type == "contact") 
        {
            //$('#show_list_' + type).val(val);
            $scope.tapPaneContact = val;
            $scope.pageChanged(type);
        }
        if (type == "planning")
        {
            //$('#show_list_' + type).val(val);
            $scope.tapPaneContact = val;
            if(panel == "week"){
                $scope.est_active_week = 1;
            }else{
                $scope.est_active_week = 0;
            }
            $scope.chargerDonnees("planning", "planning", 0); 
            $scope.est_active_panel = panel;
            
            $scope.pageChanged(type);    
        }
      
    };
    // get liste des question et leurs types 
    $scope.getListeQuestion = function (task_id) {

        let route = "recup_datar2a"
        console.log("Fonction getListQUestion")
        // var taskid   = $("#codification_etude").val();
        //Pour le blockUI

        // console.log( $scope.getelements('etudes')); 
        var component = $('.classe_generale');
        var messageDebut = "Récupération des données en cours, veuillez patienter SVP !!!";
        var messageFin = "Récupération des données terminée";

        // blockUI.start(messageDebut);
        iziToast.success({
            title: "",
            message: messageDebut,
            position: 'topRight'
        });

        $http({
            url: BASE_URL + "" + route,
            method: "POST",
            data: { "taskid": task_id, "type_question" : "r2a_alerte"}
        }).then(function successCallback(data) {

            if (data.data != null && !data.data.error) {
                console.log("Pas d'erreurs");
                $scope.dataListeQuestions = JSON.parse(JSON.parse(data.data));
                console.log($scope.dataListeQuestions[0].Libelle_court)
                // component.parent().blockUI_stop();
                // blockUI.stop();
                $scope.reInitSelect2()
                iziToast.success({
                    title: "",
                    message: messageFin,
                    position: 'topRight'
                });

            }
            else if (data.data.error) {
                console.log("Avec erreurs");
                classe_generale.parent().blockUI_stop();
                iziToast.error({
                    title: "",
                    message: '<span class="h4">' + data.data.error + '</span>',
                    position: 'topRight'
                });
            }
            else {
                console.log("Avec erreurs");
                classe_generale.parent().blockUI_stop();
                iziToast.error({
                    title: "",
                    message: "Une erreur s'est produite, réessayez plus tard !!!",
                    position: 'topRight'
                });
            }
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            $scope.error = response.statusText;
            iziToast.error({
                title: "",
                message: '<span class="h4">Une erreur est survenue depuis le serveur réessayez plus tard</span>',
                position: 'topRight'
            });
        });
    };

    $scope.get_data_r2a = function(index, value, type)
    {
       
        console.log("get_data_r2a", index, value,type); 
        if(type == "siret")
        {
            $scope.donneesTabQuestionnaire[index].siret = value; 
        }
        else if(type == "telephone")
        {
            $scope.donneesTabQuestionnaire[index].telephone = value; 
        }
        else if(type == "code_naf")
        {
            $scope.donneesTabQuestionnaire[index].code_naf = value; 
        }
        if(type == "checkebox")
        {
            id        = "vu_"+index+"_codifrelecteur"; 
            isChecked = $("#" + id).prop('checked'); 

            if(isChecked)
            {
                $scope.donneesTabQuestionnaire[index].vu_entreprise = true; 
            }
            else
            {
                $scope.donneesTabQuestionnaire[index].vu_entreprise = false;
            }
        }
    }

    $scope.calculerTauxRelir = function (taux, index, item, nbre_ligne, nbre_entreprise , nombre_relecteurs, type) 
    {
        console.log("Valeur du taux remplit !!!");
        $scope.detailCodifRelecteurs = item; 
        console.log("nombre_relecteurs",item); 
        $scope.sum_remis = 0; 
        $scope.sum_entreprise = 0; 

        taux_remain = taux; 
        if(index == nombre_relecteurs - 1)
        {
            for (let i = 0; i < nombre_relecteurs-1; i++) {
                $scope.sum_remis += $scope.detailCodifRelecteurs.codification_relecteurs[i].nbre_ligne ;
                $scope.sum_entreprise += $scope.detailCodifRelecteurs.codification_relecteurs[i].nbre_entreprise ;
            }
            $scope.detailCodifRelecteurs.codification_relecteurs[index].nbre_ligne = nbre_ligne - $scope.sum_remis;
            $scope.detailCodifRelecteurs.codification_relecteurs[index].nbre_entreprise = nbre_entreprise - $scope.sum_entreprise;

        }
        else{
            $scope.detailCodifRelecteurs.codification_relecteurs[index].nbre_ligne = Math.round((taux/100)*nbre_ligne ); 
            $scope.detailCodifRelecteurs.codification_relecteurs[index].nbre_entreprise = Math.round((taux/100)*nbre_entreprise ); 

        if(nombre_relecteurs == 1){
            id = "#valeur_"+index+"_"+type;  
            $scope.detailCodifRelecteurs.codification_relecteurs[index].nbre_ligne = Math.round((taux/100)*nbre_ligne ); 
            $scope.detailCodifRelecteurs.codification_relecteurs[index].nbre_entreprise = Math.round((taux/100)*nbre_entreprise ); 

            $(id).val(taux).trigger('change');
            return 
        }
        else if(nombre_relecteurs > 2)
        {
            id = "#valeur_"+index+"_"+type;  
            $scope.detailCodifRelecteurs.codification_relecteurs[index].nbre_ligne = Math.round((taux/100)*nbre_ligne ); 
            $scope.detailCodifRelecteurs.codification_relecteurs[index].nbre_entreprise = Math.round((taux/100)*nbre_entreprise ); 

            $(id).val(taux).trigger('change');
        }
        else
        {
            for (let i = 0; i < nombre_relecteurs; i++) {
                
                if(i == nombre_relecteurs - 1)
                {
                    $scope.detailCodifRelecteurs.codification_relecteurs[i].nbre_ligne = nbre_ligne - $scope.sum_remis; 
                    $scope.detailCodifRelecteurs.codification_relecteurs[i].nbre_entreprise = nbre_entreprise - $scope.sum_entreprise; 

                    id = "#valeur_"+i+"_"+type;  
                    if(nombre_relecteurs == 2)
                    {
                        taux = 100 - taux_remain; 
                        $(id).val(taux).trigger('change');
                    }     
                }   
                else
                {
                    $scope.detailCodifRelecteurs.codification_relecteurs[i].nbre_ligne = Math.round((taux/100)*nbre_ligne ); 
                    $scope.detailCodifRelecteurs.codification_relecteurs[i].nbre_entreprise = Math.round((taux/100)*nbre_entreprise ); 

                }
                $scope.sum_remis += $scope.detailCodifRelecteurs.codification_relecteurs[i].nbre_ligne ;
                $scope.sum_entreprise += $scope.detailCodifRelecteurs.codification_relecteurs[i].nbre_entreprise ;   
            }
        }
    }

    }
    $scope.reassigner_quota = function (item) {
        $scope.reassigned_for = item.id;
        $scope.reassigned_codification_id = item.codification_id;
        console.log(item);
        $scope.relecteurs_to_reassign = [];
        
        $scope.detailCodifications.codification_relecteurs.forEach(element => {
            if (element.relecteur_id != item.relecteur_id) {
                 $scope.relecteurs_to_reassign.push(element.relecteur)
            }
        });
        console.log();
        /* //$("#reassign_relecteur_codification").val("").trigger("change");
        document.getElementById("reassign_relecteur_codification").addEventListener("click", () =>{
            let elem = document.getElementById("reassign_relecteur_codification");
            console.log(elem);
        }) */
       

    }
    $scope.remplirQuestionPlanCode = function(etude_id = null){
        console.log("Remplir question à codifier !!!");
        
        $scope.requeterSurController("recup_question", etude_id )
    }
    $scope.remplirQuestionR2a = function(task_id = null, type='r2a'){
        console.log("Remplir question à codifier !!!");
        if(task_id>1000){

            $scope.getListeQuestion(task_id)
        }
    }

    // remplir list id dans codificationModal
    $scope.remplirDataCodification = function (etude_id, typeCourant="codification" ) {

        console.log("remplir champs codification encours....");
        console.log(etude_id);
        var type = 'etude';
        var rewriteReq = typeAvecS;
        var filtres = 'id:' + etude_id + '';

        var typeAvecS = type + 's';
        var rewriteReq = typeAvecS + '(' + filtres + ')';
        var form = $('#form_add' + typeCourant);
        form.parent().parent().blockUI_start();

        Init.getElement(rewriteReq, listofrequests_assoc[typeAvecS]).then(function (data) {
            if (data && data[0]) {
                form.parent().parent().blockUI_stop();
                
                $scope.taskid_codification = data[0].id_askia;
                
                $scope.getListeQuestion(data[0].id_askia);
                var selectedValues = new Array();
                // console.log('#listId_'+typeCourant);
                $('#listId_'+typeCourant).val(data[0].id_liste);

                if (data[0].etude_relecteurs) {
                    data[0].etude_relecteurs.forEach((el) => {
                        selectedValues.push(el.relecteur_id);
                    });
                }
                // console.log(typeAvecS);
                $('#relecteurs_'+typeCourant).val(selectedValues).trigger('change');
                $('#type_entretien_'+typeCourant).val("complet").trigger('change');
                $('#mode_'+typeCourant).val("3").trigger('change');

                $('#shortcut_nom_entreprise_'+typeCourant).val(data[0].shortcut_nom_entreprise);
                $('#shortcut_adresse_entreprise_'+typeCourant).val(data[0].shortcut_adresse_entreprise);
                $('#shortcut_code_postal_entreprise_'+typeCourant).val(data[0].shortcut_code_postal_entreprise);
               
            }
        }, function (msg) {
            console.log(msg)
        });
    }
    // FOnction pour calculer le nombre de mot en fonction de la durée et visversa 
    $scope.calculerDureeNombreMot = function(value, nom_value, type)
    {
        console.log("calculerDureeNombreMot"); 
        
        base_calcul = 2000; 
        if(type == 'r2a'){
            base_calcul = 1000; 
        }
        value = parseInt(value); 
        if(nom_value == 'mot')
        {
            $('#duree_moyenne_'+type).val(value/base_calcul);
            return true 
        }
        else if( nom_value == 'duree') 
        {
            $('#nombre_mot_'+type).val(value*base_calcul);
            return true
        }
    }

    $scope.remplirDataRelueCodification = function(id)
    { 
        $scope.requeterSurController("recup_listQuestion", id) 
    }

    $scope.remplirTabQuestion = function (id, typeCourant="codification" ) {
        console.log("remplirTabQuestion"); 

        var type = 'codification';
        var filtres = 'id:' + id + '';

        var typeAvecS = type + 's';
        var rewriteReq = typeAvecS + '(' + filtres + ')';
        var form = $('#form_add' + typeCourant);
        form.parent().parent().blockUI_start();

        Init.getElement(rewriteReq, listofrequests_assoc[typeAvecS]).then(function (data) {
            if (data && data[0])
            {
                form.parent().parent().blockUI_stop();
                console.log(data[0])

            }
        }); 

    }
    // récuperation des données du questionnaire
    function removeDuplicates(arr) {
        return arr.filter((item, index) => arr.indexOf(item) === index);
    }


    $scope.getDataQuestion = function () {
        
        let route           = "recup_datar2a"
        //console.log("Fonction getDataQuestion")
        var listeID         = $("#listId_codification").val();
        var taskid          = $scope.taskid_codification;
        console.log(listeID);
        var qo_codification = [];
        var qf_codification = [];
        var type_entretien  = $("#type_entretien_codification").val();
        
        $scope.questionInTable.forEach(element => {
            qo_codification.push(element["question_codif"]);
            qf_codification.push(element["question_aide"])
        }); 

        console.log("Type de entretien :", type_entretien);

        var liste_shortcut = removeDuplicates(qf_codification.concat(qo_codification));
        $scope.listeShortcut = liste_shortcut;
        console.log(liste_shortcut);
        //Pour le blockUI
        var component = $('.classe_generale');
        var messageDebut = "Récupération des données en cours, veuillez patienter SVP !!!";
        var messageFin = "Récupération des données terminée";

        // blockUI.start(messageDebut);
        iziToast.success({
            title: "",
            message: messageDebut,
            position: 'topRight'
        });

        $http({
            url: BASE_URL + "" + route,
            method: "POST",
            data: { "taskid": taskid, "liste_shortcut": liste_shortcut, "listeID": listeID, "type_entretien": "complet" }
        }).then(function successCallback(data) {

            if (data.data != null && !data.data.error) {
                console.log("Pas d'erreurs");
                console.log(data.data);

                $scope.datar2as = JSON.parse(data.data);

                //$scope.bootstrapTab(); 
                // component.parent().blockUI_stop();
                // blockUI.stop();
                iziToast.success({
                    title: "",
                    message: messageFin,
                    position: 'topRight'
                });

            }
            else if (data.data.error) {
                console.log("Avec erreurs");
                classe_generale.parent().blockUI_stop();
                iziToast.error({
                    title: "",
                    message: '<span class="h4">' + data.data.error + '</span>',
                    position: 'topRight'
                });
            }
            else {
                console.log("Avec erreurs");
                classe_generale.parent().blockUI_stop();
                iziToast.error({
                    title: "",
                    message: "Une erreur s'est produite, réessayez plus tard !!!",
                    position: 'topRight'
                });
            }
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            $scope.error = response.statusText;
            iziToast.error({
                title: "",
                message: '<span class="h4">Une erreur est survenue depuis le serveur réessayez plus tard</span>',
                position: 'topRight'
            });
        });
    };

    // Permet de faire des actions sur le controller
    $scope.requeterSurController = function (route, args = null) {
        console.log("requeterSurController YOUSSOU ICI", "route", route, "args", args);
        //e.preventDefault();
    
        //Pour le blockUI
        var component = $('.classe_generale');
        var messageDebut = "Action en cours, veuillez patienter SVP !!!";
        var messageFin = "Action terminée";

        if (route == "refresh_entreprise") {
            messageDebut = "Synchronisation des entreprises en cours, veuillez patienter SVP !!!"
        }
        else if (route == "refresh_contact") {
            messageDebut = "Synchronisation des contacts en cours, veuillez patienter SVP !!!"
        }
        else if (route == "send_r2a") {
            messageDebut = "Envoie  en cours, veuillez patienter SVP !!!"
        }
        else if (route == "send_mailevaluateur") {
            messageDebut = "Envoie  en cours, veuillez patienter SVP !!!"
        }
        console.log(args);
        //component.parent().blockUI_start()
        iziToast.info({
            title: "",
            message: messageDebut,
            position: 'topRight'
        });

        $http({
            url: BASE_URL + "" + route,
            method: "POST",
            data: { "args": args }
        }).then(function successCallback(data) {
            //classe_generale.parent().blockUI_stop();
            // this callback will be called asynchronously
            // when the response is available
            //console.log("dataToSee", data.data, data.data.error);

            if (data.data != null && !data.data.error) {
                console.log("Pas d'erreurs");
                if (route == "send_r2a") {
                    $("#modal_viewr2a").modal('hide');
                    $scope.pageChanged('r2a');

                }
                //component.parent().blockUI_stop();
                iziToast.success({
                    title: "",
                    message: messageFin,
                    position: 'topRight'
                });

            }
            else if (data.data.error) {
                console.log("Avec erreurs");
                component.parent().blockUI_stop();
                //moimeme-Ajouté récemment
                iziToast.error({
                    title: "",
                    message: '<span class="h4">' + data.data.error + '</span>',
                    position: 'topRight'
                });
            }
            else {
                console.log("Avec erreurs");
                component.parent().blockUI_stop();
                //moimeme-Ajouté récemment
                iziToast.error({
                    title: "",
                    message: "Une erreur s'est produite, réessayez plus tard !!!",
                    position: 'topRight'
                });
            }
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            $scope.error = response.statusText;
            iziToast.error({
                title: "",
                message: '<span class="h4">Une erreur est survenue depuis le serveur réessayez plus tard</span>',
                position: 'topRight'
            });
        });
    };
    //--Pour Synchroniser les données--//
    $scope.confirmerNotes = function (type, itemId, action = null) {
        $scope.refreshing = itemId;
        var msg = 'En cliquant sur ce bouton vous confirmez les notes entrées';
        var title = 'CONFIRMATION';

        iziToast.question({
            timeout: 0,
            close: false,
            overlay: true,
            displayMode: 'once',
            id: 'question',
            zindex: 999,
            title: title,
            message: msg,
            position: 'center',
            buttons: [
                ['<button class="font-bold btn btn-success" style="color: white!important">Confirmer</button>', function (instance, toast) {

                    instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');

                    Init.requeteConfirmerNotes(type, itemId).then(function (data) {
                        
                        $scope.refreshing = false;
                        if (data.data && !data.errors) 
                        {
                                $scope.pageChanged(type);
                                $scope.showToast(title, 'Succès', 'success');
                        } else {
                                $scope.showToast(title, data.errors_debug, 'error');
                        }

                    }, function (msg) {
                        $scope.showToast(title, msg, 'error');
                    });

                }, true],
                ['<button class="btn btn-danger" style="color: white!important">Annuler</button>', function (instance, toast) {
                    instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
                }],
            ],
            onClosing: function (instance, toast, closedBy) {
                console.log('Closing | closedBy: ' + closedBy);
            },
            onClosed: function (instance, toast, closedBy) {
                console.log('Closed | closedBy: ' + closedBy);
            }
        });
    };
    //--Pour terminer une codification--//
    $scope.terminerCodif = function (type, itemId, action = null) {
        var msg = 'Voulez-vous marquer cette tâche comme terminée ?';
        var title = 'CLÔTURE';

        iziToast.question({
            timeout: 0,
            close: false,
            overlay: true,
            displayMode: 'once',
            id: 'question',
            zindex: 999,
            title: title,
            message: msg,
            position: 'center',
            buttons: [
                ['<button class="font-bold btn btn-success" style="color: white!important">Confirmer</button>', function (instance, toast) {

                    instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');

                    Init.cloturerCodif(type, itemId).then(function (data) {
                        console.log('cloturé', data, type);
                        if (data.data && !data.errors) {

                            
                                $scope.pageChanged(type);
                            $scope.showToast(title, 'Succès', 'success');
                        } else {
                            $scope.showToast(title, data.errors_debug, 'error');
                        }

                    }, function (msg) {
                        $scope.showToast(title, msg, 'error');
                    });

                }, true],
                ['<button class="btn btn-danger" style="color: white!important">Annuler</button>', function (instance, toast) {
                    instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
                }],
            ],
            onClosing: function (instance, toast, closedBy) {
                console.log('Closing | closedBy: ' + closedBy);
            },
            onClosed: function (instance, toast, closedBy) {
                console.log('Closed | closedBy: ' + closedBy);
            }
        });
    };
    //--Pour terminer un codif relec--//
    $scope.terminerCodifRelecteur = function (type) {
        var msg                 = 'Voulez-vous marquer cette tâche comme terminée ?';
        var title               = 'CLÔTURE';
        let codification_id     = $scope.donneesQuestionnaire.codification_id;
        let relecteur_id        = $scope.donneesQuestionnaire.relecteur_id;
        iziToast.question({
            timeout: 0,
            close: false,
            overlay: true,
            displayMode: 'once',
            id: 'question',
            zindex: 999,
            title: title,
            message: msg,
            position: 'center',
            buttons: [
                ['<button class="font-bold btn btn-success" style="color: white!important">Confirmer</button>', function (instance, toast) {

                    instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');

                    Init.changeStatutCodifRelecteur(type, codification_id,relecteur_id).then(function (data) {
                        console.log('cloturé', data, type);
                        if (data.data && !data.errors) {

                            
                                $scope.pageChanged(type);
                            $scope.showToast(title, 'Succès', 'success');
                        } else {
                            $scope.showToast(title, data.errors_debug, 'error');
                        }

                    }, function (msg) {
                        $scope.showToast(title, msg, 'error');
                    });

                }, true],
                ['<button class="btn btn-danger" style="color: white!important">Annuler</button>', function (instance, toast) {
                    instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
                }],
            ],
            onClosing: function (instance, toast, closedBy) {
                console.log('Closing | closedBy: ' + closedBy);
            },
            onClosed: function (instance, toast, closedBy) {
                console.log('Closed | closedBy: ' + closedBy);
            }
        });
    };
    // Permet de faire des actions sur le controller
    $scope.terminerCodifRelecteur = function (type) {
        var title               = 'CLÔTURE';
        let codification_id     = $scope.donneesQuestionnaire.codification_id;
        let relecteur_id        = $scope.donneesQuestionnaire.relecteur_id;

        //Pour le blockUI
        var component = $('.classe_generale');
        var messageDebut = "Action en cours, veuillez patienter SVP !!!";
        var messageFin = "Action terminée";

        
        //component.parent().blockUI_start()
        iziToast.info({
            title: "",
            message: messageDebut,
            position: 'topRight'
        });

        $http({
            url: BASE_URL + 'codification-relecteur/statut/' + codification_id+ '/' + relecteur_id,
            method: "POST",
        }).then(function successCallback(response) {
           
            $scope.requeterSurController("recap_codification", codification_id);
            $scope.showToast(title, 'Succès', 'success');
        }, function errorCallback(error) {
           
            $scope.showToast(title, data.errors_debug, 'error');
        });
    };
    //--Pour supprimer un élément--//
    $scope.deleteElement = function (type, itemId, action = null) {
        var msg = 'Voulez-vous vraiment effectuer cette suppression ?';
        var title = 'SUPPRESSION';

        iziToast.question({
            timeout: 0,
            close: false,
            overlay: true,
            displayMode: 'once',
            id: 'question',
            zindex: 999,
            title: title,
            message: msg,
            position: 'center',
            buttons: [
                ['<button class="font-bold btn btn-success" style="color: white!important">Confirmer</button>', function (instance, toast) {

                    instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');

                    Init.removeElement(type, itemId).then(function (data) {
                        console.log('deleted', data, type);
                        if (data.data && !data.errors) {

                            if (type == 'r2acomm_proforma') {
                                var searchProd = $filter('filter')($scope.dataInTabPane['r2acomm_proforma']['data'], { id: itemId });
                                if (searchProd && searchProd.length == 1) {
                                    let index = $scope.dataInTabPane['r2acomm_proforma']['data'].indexOf(searchProd[0]);
                                    if (index > -1) {
                                        $scope.dataInTabPane['r2acomm_proforma']['data'].splice(index, 1);
                                    }
                                }
                            } else {
                                $scope.pageChanged(type);
                            }
                            $scope.showToast(title, 'Succès', 'success');
                        } else {
                            $scope.showToast(title, data.errors_debug, 'error');
                        }

                    }, function (msg) {
                        $scope.showToast(title, msg, 'error');
                    });

                }, true],
                ['<button class="btn btn-danger" style="color: white!important">Annuler</button>', function (instance, toast) {
                    instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
                }],
            ],
            onClosing: function (instance, toast, closedBy) {
                console.log('Closing | closedBy: ' + closedBy);
            },
            onClosed: function (instance, toast, closedBy) {
                console.log('Closed | closedBy: ' + closedBy);
            }
        });
    };
    

    $scope.desactivElement = function (type, itemId, action = null, index = null, list = false) {
        console.log('Etat=======>', $scope.chstat.statut, type);
        var msg = '';
        var title = '';
        var typeQuery = type;
        var confirmation = true;

        msg = $scope.chstat.statut == 1 ? 'Voulez-vous vraiment effectuer cette désactivation ?' : 'Voulez-vous vraiment effectuer cette activation ?';
        title = $scope.chstat.statut == 1 ? 'DESACTIVATION' : 'ACTIVATION';

        var send_data = {
            id: $scope.chstat.id,
            status: $scope.chstat.statut,
            substatut: $scope.chstat.substatut,
            commentaire: "",
            objet: itemId,
            type: type
        };


        if (confirmation) {
            iziToast.question({
                timeout: 0,
                close: false,
                overlay: true,
                displayMode: 'once',
                id: 'question',
                zindex: 999,
                title: title,
                message: msg,
                position: 'center',
                buttons: [
                    ['<button class="font-bold btn btn-success" style="color: white!important">Confirmer</button>', function (instance, toast) {


                        Init.changeStatut(typeQuery, send_data).then(function (data) {

                            if (data.data && !data.errors) {
                                instance.hide({ transitionOt: 'fadeOut' }, toast, 'button');
                                $scope.pageChanged(type);
                                $scope.showToast(title, 'Réussie', 'success');
                            }
                            else {
                                $scope.showToast(title, data.errors_debug, 'error');
                            }

                        }, function (msg) {
                            $scope.showToast(title, msg, 'error');
                        });

                    }, true],
                    ['<button class="btn btn-danger" style="color: white!important">Annuler</button>', function (instance, toast) {
                        instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
                    }, false],
                ],
                onClosing: function (instance, toast, closedBy) {
                    console.log('Closing | closedBy: ' + closedBy);
                },
                onClosed: function (instance, toast, closedBy) {
                    console.log('Closed | closedBy: ' + closedBy);
                }
            });
        } else {
            console.log('------list-------')
            console.log(list);

            Init.changeStatut(typeQuery, send_data).then(function (data) {

                if (data.data && !data.errors) {
                    if (list == false) {
                        $scope.showToast(title, 'Réussie', 'success');
                    }
                }
                else {
                    $scope.showToast(title, data.errors_debug, 'error');
                }

            }, function (msg) {
                $scope.showToast(title, msg, 'error');
            });
        }

    };

    $scope.terminerTouteLaCommande = function (e, type, etat, item) {
        console.log('Etat=======>', $scope.chstat.statut, type);
        var msg = '';
        var typeQuery = type;
        var title = '';

        var send_data = {
            id: item.id,
            status: etat,
        };

        Init.terminerTouteLaCommande(typeQuery, send_data).then(function (data) {

            if (data.data && !data.errors) {

                $scope.pageChanged(type);
                $scope.showToast(title, etat == 4 ? 'Préparation terminée' : 'Préparation en cours', 'success');

            } else {
                $scope.showToast(title, data.errors_debug, 'error');
            }

        }, function (msg) {
            $scope.showToast(title, msg, 'error');
        });


    };

    $scope.ckeckRadio = function (tag) {
        var value = $("#" + tag).val();
        console.log(value);
    }

});
function getHighestZindex() {
    let zIndex = 50
    $('.modal').each(function () {
        if ($(this).css('z-index') !== 'auto' && $(this).css('z-index') > zIndex) {
            zIndex = parseInt($(this).css('z-index'))
        }
    })

    return zIndex
}

// Vérification de l'extension des elements uploadés
function isValide(fichier) {
    var Allowedextensionsimg = new Array("jpg", "JPG", "jpeg", "JPEG", "gif", "GIF", "png", "PNG", "svg", "SVG");
    var Allowedextensionsvideo = new Array("mp4");
    for (var i = 0; i < Allowedextensionsimg.length; i++)
        if ((fichier.lastIndexOf(Allowedextensionsimg[i])) != -1) {
            return 1;
        }
    for (var j = 0; j < Allowedextensionsvideo.length; j++)
        if ((fichier.lastIndexOf(Allowedextensionsvideo[j])) != -1) {
            return 2;
        }
    return 0;
}

//$scope.testt  = 1;
// FileReader pour la photo //
function Chargerphoto(idform, tag = null) {
    var tagBalise = "img";
    var rechercheTag = '';
    if (tag) {
        tagBalise = tag;

        rechercheTag = tag.split(idform);

        if (rechercheTag.length > 1) {
            tagBalise = rechercheTag[0];
        }
    }

    var fichier = document.getElementById(tagBalise + "" + idform);
    console.log("Chargerphoto", fichier);
    (isValide(fichier.value) != 0) ?
        (
            fileReader = new FileReader(),
            (isValide(fichier.value) == 1) ?
                (
                    fileReader.onload = function (event) {
                        $("#aff" + tagBalise + idform).attr("src", event.target.result);
                    },
                    fileReader.readAsDataURL(fichier.files[0]),
                    (idform == 'produit') ? $("#" + tagBalise + "produit_recup").val("") : ""
                ) : null
        ) : (
            alert("L'extension du fichier choisi ne correspond pas aux règles sur les fichiers pouvant être uploader"),
            $('#' + tagBalise + '' + idform).val(""),
            $('#aff' + tagBalise + '' + idform).attr("src", ""),
            $('.input-modal').val("")
        );


}

function Chargerimage(idform, tag = null) {
    console.log("Chargerimage ");
    var tagBalise = "img";
    var rechercheTag = '';
    if (tag) {
        tagBalise = tag;

        rechercheTag = tag.split(idform);

        if (rechercheTag.length > 1) {
            tagBalise = rechercheTag[0];
        }
    }

    var fichier = document.getElementById(tagBalise + "" + idform);
    (isValide(fichier.value) != 0) ?
        (
            fileReader = new FileReader(),
            (isValide(fichier.value) == 1) ?
                (
                    fileReader.onload = function (event) {
                        $("#aff" + tagBalise + idform).attr("src", event.target.result);
                    },
                    fileReader.readAsDataURL(fichier.files[0]),
                    (idform) ? $("#" + tagBalise + idform + "_recup").val("") : ""
                ) : null
        ) : (
            alert("L'extension du fichier choisi ne correspond pas aux règles sur les fichiers pouvant être uploader"),
            $('#' + tagBalise + '' + idform).val(""),
            $('#aff' + tagBalise + '' + idform).attr("src", ""),
            $('.input-modal').val("")
        );


}

