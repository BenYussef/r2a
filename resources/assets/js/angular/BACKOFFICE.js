var app = angular.module('BackEnd', ['ngRoute', 'ngSanitize', 'ngLoadScript', 'ui.bootstrap', 'angular.filter', 'ngCookies']);
//rechercher markme pour touver la LISTE, l'AJOUT, la MODIFICATION et la SUPPRESSION
//var BASE_URL = '//' + location.host+ '// + '/dakysushi/public/';
//var BASE_URL = '//' + location.host + '/script/public/';
var BASE_URL = '//' + location.host + '/script/public/';
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
    $routeProvider
        .when("/:namepage?/:itemId?", {
            templateUrl: function (elem, attrs) {
                return "page/" + (elem["namepage"] ? elem["namepage"] : "script");
            },
        })
});

// TODO: delete
/*app.config(function ($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl         : "page/accueil",
        })
        .when("/", {
            templateUrl         : "page/script",
        })
        .when("/list-assemblage", {
            templateUrl         : "page/list-assemblage",
        })
        .when("/list-moyenreservation", {
            templateUrl         : "page/list-moyenreservation",
        })
        .when("/list-production", {
            templateUrl         : "page/list-production",
        })
        .when("/list-suivimarketingvalide", {
            templateUrl         : "page/list-suivimarketingvalide",
        })
        .when("/list-suivimarketingnonvalide", {
            templateUrl         : "page/list-suivimarketingnonvalide",
        })
        .when("/list-categoriefournisseur", {
            templateUrl         : "page/list-categoriefournisseur",
        })
        .when("/list-lignedecredit", {
            templateUrl         : "page/list-lignedecredit",
        })
        .when("/list-historiqueaction", {
            templateUrl         : "page/list-historiqueaction",
        })
        .when("/list-paiement", {
            templateUrl         : "page/list-paiement",
        })
        .when("/list-traiteur", {
            templateUrl         : "page/list-traiteur",
        })
        .when("/list-suivimarketing", {
            templateUrl         : "page/list-suivimarketing",
        })
        .when("/list-traiteurtermine", {
            templateUrl         : "page/list-traiteurtermine",
        })
        .when("/list-activite", {
            templateUrl         : "page/list-activite",
        })
        .when("/list-societefacturation", {
            templateUrl         : "page/list-societefacturation",
        })
        .when("/list-entite", {
            templateUrl         : "page/list-entite",
        })
        .when("/list-typeevenement", {
            templateUrl         : "page/list-typeevenement",
        })
        .when("/list-evenement", {
            templateUrl         : "page/list-evenement",
        })
        .when("/list-modepaiement", {
            templateUrl         : "page/list-modepaiement",
        })
        .when("/list-typebillet", {
            templateUrl         : "page/list-typebillet",
        })
        .when("/list-detailaction", {
            templateUrl         : "page/list-detailaction",
        })
        .when("/list-typedecaisse", {
            templateUrl         : "page/list-typedecaisse",
        })
        .when("/list-banque", {
            templateUrl         : "page/list-banque",
        })
        .when("/list-approcash", {
            templateUrl         : "page/list-approcash",
        })
        .when("/list-sortiecash", {
            templateUrl         : "page/list-sortiecash",
        })
        .when("/list-transactioncaisse", {
            templateUrl         : "page/list-transactioncaisse",
        })
        .when("/list-versement", {
            templateUrl         : "page/list-versement",
        })
        .when("/list-brigade", {
            templateUrl         : "page/list-brigade",
        })
        .when("/list-planing", {
            templateUrl: "page/list-planing",
        })
        .when("/list-fonction", {
            templateUrl         : "page/list-fonction",
        })
        .when("/list-zone", {
            templateUrl         : "page/list-zone",
        })
        .when("/list-employe", {
            templateUrl         : "page/list-employe",
        })
        .when("/list-conditionreglement", {
            templateUrl         : "page/list-conditionreglement",
        })
        .when("/list-typeprixdevente", {
            templateUrl         : "page/list-typeprixdevente",
        })
        .when("/list-nomenclature", {
            templateUrl         : "page/list-nomenclature",
        })
        .when("/list-unitedemesure", {
            templateUrl         : "page/list-unitedemesure",
        })
        .when("/list-zonedestockage", {
            templateUrl         : "page/list-zonedestockage",
        })
        .when("/list-typedeconservation", {
            templateUrl         : "page/list-typedeconservation",
        })
        .when("/list-produit", {
            templateUrl         : "page/list-produit",
        })
        .when("/list-produitliquide", {
            templateUrl         : "page/list-produitliquide",
        })
        .when("/list-assemblage", {
            templateUrl         : "page/list-assemblage",
        })
        .when("/list-production", {
            templateUrl         : "page/list-production",
        })
        .when("/list-propositionr2atechnique", {
            templateUrl         : "page/list-propositionr2atechnique",
        })
        .when("/list-zonedelivraison", {
            templateUrl         : "page/list-zonedelivraison",
        })
        .when("/list-typeoperateur", {
            templateUrl         : "page/list-typeoperateur",
        })
        .when("/list-typecontrat", {
            templateUrl         : "page/list-typecontrat",
        })
        .when("/list-typedepot", {
            templateUrl         : "page/list-typedepot",
        })
        .when("/list-depot", {
            templateUrl         : "page/list-depot",
        })
        .when("/list-typeclient", {
            templateUrl: "page/list-typeclient",
        })
        .when("/list-client", {
            templateUrl: "page/list-client",
        })
        .when("/list-adresse", {
            templateUrl: "page/list-adresse",
        })
        .when("/list-contact", {
            templateUrl: "page/list-contact",
        })
        .when("/list-tag", {
            templateUrl: "page/list-tag",
        })
        .when("/list-dateclemotif", {
            templateUrl: "page/list-dateclemotif",
        })
        .when("/detail-client/:itemId", {
            templateUrl: "page/detail-client",
        })
        .when("/detail-produit/:itemId", {
            templateUrl: "page/detail-produit",
        })
        .when("/detail-entite/:itemId", {
            templateUrl: "page/detail-entite",
        })
        .when("/detail-societefacturation/:itemId", {
            templateUrl: "page/detail-societefacturation",
        })
        .when("/list-typeproduit", {
            templateUrl: "page/list-typeproduit",
        })
        .when("/list-categorieproduit", {
            templateUrl: "page/list-categorieproduit",
        })
        .when("/list-famille", {
            templateUrl: "page/list-famille",
        })
        .when("/list-departement", {
            templateUrl: "page/list-departement",
        })
        .when("/list-detail-client", {
            templateUrl: "page/list-detail-client",
        })
        .when("/list-commande", {
            templateUrl: "page/list-commande",
        })
        .when("/list-commande-encour", {
            templateUrl: "page/list-commande-encour",
        })
        .when("/list-commande-departement", {
            templateUrl: "page/list-commande-departement",
        })
        .when("/list-typecommande", {
            templateUrl: "page/list-typecommande",
        })
        .when("/list-logistique", {
            templateUrl: "page/list-logistique",
        })
        .when("/new-commande", {
            templateUrl: "page/new-commande",
        })
        .when("/list-bce", {
            templateUrl: "page/list-bce",
        })
        .when("/list-be", {
            templateUrl: "page/list-be",
        })
        .when("/list-bci", {
            templateUrl: "page/list-bci",
        })
        .when("/list-bs", {
            templateUrl: "page/list-bs",
        })
        .when("/list-bt", {
            templateUrl: "page/list-bt",
        })
        .when("/list-devise", {
            templateUrl: "page/list-devise",
        })
        .when("/list-stockactuelproduitdepot", {
            templateUrl: "page/list-stockactuelproduitdepot",
        })
        .when("/list-quantite", {
            templateUrl: "page/list-quantite",
        })
        .when("/list-inventaire", {
            templateUrl: "page/list-inventaire",
        })
        .when("/list-entreestock", {
            templateUrl: "page/list-entreestock",
        })
        .when("/list-sortiestock", {
            templateUrl: "page/list-sortiestock",
        })
        .when("/list-formetable", {
            templateUrl: "page/list-formetable",
        })
        .when("/list-table", {
            templateUrl: "page/list-table",
        })
        .when("/list-tranchehoraire", {
            templateUrl: "page/list-tranchehoraire",
        })
        .when("/list-menu", {
            templateUrl: "page/list-menu",
        })
        .when("/list-carte", {
            templateUrl: "page/list-carte",
        })
        .when("/list-typetier", {
            templateUrl: "page/list-typetier",
        })
        .when("/list-fournisseur", {
            templateUrl: "page/list-fournisseur",
        })
        .when("/list-categoriefournisseur", {
            templateUrl: "page/list-categoriefournisseur",
        })
        .when("/list-reservation", {
            templateUrl: "page/list-reservation",
        })
        .when("/list-cloturecaisse", {
            templateUrl: "page/list-cloturecaisse",
        })
        .when("/list-caisse", {
            templateUrl: "page/list-caisse",
        })
        .when("/list-preference", {
            templateUrl: "page/list-preference",
        })
        .when("/list-user", {
            templateUrl: "page/list-user",
        })
        .when("/list-role", {
            templateUrl: "page/list-role",
        })
        .when("/list-proforma", {
            templateUrl: "page/list-proforma",
        })
        .when("/list-facture", {
            templateUrl: "page/list-facture",
        })
        .when("/list-facturetraiteur", {
            templateUrl: "page/list-facturetraiteur",
        })
        .when("/list-familleaction", {
            templateUrl: "page/list-familleaction",
        })
        .when("/list-operateur", {
            templateUrl: "page/list-operateur",
        })
        .when("/list-intervention", {
            templateUrl: "page/list-intervention",
        })
        .when("/list-action", {
            templateUrl: "page/list-action",
        })
        .when("/list-categoriedepense", {
            templateUrl: "page/list-categoriedepense",
        })
        .when("/list-postedepense", {
            templateUrl: "page/list-postedepense",
        })
        .when("/list-depense", {
            templateUrl: "page/list-depense",
        })
        .when("/list-reglement", {
            templateUrl: "page/list-reglement",
        })
        .when("/list-paiementfacture", {
            templateUrl: "page/list-paiementfacture",
        })
        .when("/list-recouvrement", {
            templateUrl: "page/list-recouvrement",
        })
        .when("/list-clientmarket", {
            templateUrl: "page/list-clientmarket",
        })
        .when("/list-favorie", {
            templateUrl: "page/list-favorie",
        })
        .when("/list-panier", {
            templateUrl: "page/list-panier",
        })
        .when("/list-commandemarket", {
            templateUrl: "page/list-commandemarket",
        })
        .when("/list-proformamarket", {
            templateUrl: "page/list-proformamarket",
        })
        .when("/inbox", {
            templateUrl: "page/inbox",
        })
        .when("/file-manager", {
            templateUrl: "page/file-manager",
        })
        .when("/pos", {
            templateUrl: "page/pos",
        })
        .when("/chat", {
            templateUrl: "page/chat",
        })
        .when("/post", {
            templateUrl: "page/post",
        })
        .when("/crud-data-list", {
            templateUrl: "page/crud-data-list",
        })
        .when("/crud-form", {
            templateUrl: "page/crud-form",
        })
        .when("/users-layout-1", {
            templateUrl: "page/users-layout-1",
        })
        .when("/users-layout-2", {
            templateUrl: "page/users-layout-2",
        })
        .when("/users-layout-3", {
            templateUrl: "page/users-layout-3",
        })
        .when("/profile-overview-1", {
            templateUrl: "page/profile-overview-1",
        })
        .when("/profile-overview-2", {
            templateUrl: "page/profile-overview-2",
        })
        .when("/profile-overview-3", {
            templateUrl: "page/profile-overview-3",
        })
        .when("/wizard-layout-1", {
            templateUrl: "page/wizard-layout-1",
        })
        .when("/wizard-layout-2", {
            templateUrl: "page/wizard-layout-2",
        })
        .when("/wizard-layout-3", {
            templateUrl: "page/wizard-layout-3",
        })
        // blog
        .when("/blog-layout-1", {
            templateUrl: "page/blog-layout-1",
        })
        .when("/wizard-layout-2", {
            templateUrl: "page/blog-layout-2",
        })
        // Invoice
        .when("/invoice-layout-1", {
            templateUrl: "page/invoice-layout-1",
        })
        .when("/invoice-layout-2", {
            templateUrl: "page/invoice-layout-2",
        })
        // Pricing
        .when("/pricing-layout-1", {
            templateUrl: "page/pricing-layout-1",
        })
        .when("/pricing-layout-2", {
            templateUrl: "page/pricing-layout-2",
        })
        // Invoice
        .when("/invoice-layout-1", {
            templateUrl: "page/invoice-layout-1",
        })
        .when("/invoice-layout-2", {
            templateUrl: "page/invoice-layout-2",
        })
        // FAQ
        .when("/faq-layout-1", {
            templateUrl: "page/faq-layout-1",
        })
        .when("/faq-layout-2", {
            templateUrl: "page/faq-layout-2",
        })
        .when("/faq-layout-3", {
            templateUrl: "page/faq-layout-3",
        })

        .when("/login-login", {
            templateUrl: "page/login-login",
        })
        .when("/login-register", {
            templateUrl: "page/login-register",
        })
        .when("/error-page", {
            templateUrl: "page/error-page",
        })
        .when("/update-profile", {
            templateUrl: "page/error-page",
        })
        .when("/change-password", {
            templateUrl: "page/error-page",
        })
        .when("/profile-overview-2", {
            templateUrl: "page/profile-overview-2",
        })
        .when("/profile-overview-3", {
            templateUrl: "page/profile-overview-3",
        })
        // Components
        // Grid
        .when("/regular-table", {
            templateUrl: "page/regular-table",
        })
        .when("/datatable", {
            templateUrl: "page/datatable",
        })
        .when("/accordion", {
            templateUrl: "page/accordion",
        })
        .when("/button", {
            templateUrl: "page/button",
        })
        .when("/modal", {
            templateUrl: "page/modal",
        })
        .when("/alert", {
            templateUrl: "page/alert",
        })
        .when("/progress-bar", {
            templateUrl: "page/progress-bar",
        })
        .when("/tooltip", {
            templateUrl: "page/tooltip",
        })
        .when("/dropdown", {
            templateUrl: "page/dropdown",
        })
        .when("/toast", {
            templateUrl: "page/toast",
        })
        .when("/typography", {
            templateUrl: "page/typography",
        })
        .when("/icon", {
            templateUrl: "page/icon",
        })
        .when("/loading-icon", {
            templateUrl: "page/loading-icon",
        })
        // Forms
        .when("/regular-form", {
            templateUrl: "page/regular-form",
        })
        .when("/datepicker", {
            templateUrl: "page/datepicker",
        })
        .when("/select2", {
            templateUrl: "page/select2",
        })
        .when("/file-upload", {
            templateUrl: "page/file-upload",
        })
        .when("/wysiwyg-editor", {
            templateUrl: "page/file-upload",
        })
        .when("/validation", {
            templateUrl: "page/file-upload",
        })
        // Widgetss
        .when("/chart", {
            templateUrl: "page/chart",
        })
        .when("/slider", {
            templateUrl: "page/slider",
        })
        .when("/image-zoom", {
            templateUrl: "page/image-zoom",
        })


});*/
//--FIN ==> Configuration des routes--//

// Spécification fonctionnelle du controller
app.controller('BackEndCtl', function (Init, theme, $location, $scope, $filter, $log, $q, $route, $routeParams, $timeout, $compile, $http) {

    $scope.imgupload = imgupload;
    $scope.txt_baranne = "bar.";

    $scope.BASE_URL = BASE_URL;
    $scope.param = null;
    $scope.currentTemplateUrl;
    $scope.titlePage;
    $scope.check;
    $scope.caisse_source_list_approcash = null;
    $scope.caisse_destinataire_list_approcash = null;

    $scope.banniere = null;

    var listofrequests_assoc =
    {
        //-------------DEBUT ==> MES REQUETES PERSONNALISEES--------------------//
        //markme-LISTE
        "astuces": [
            "id,designation"
        ],
        "allergenes": [
            "id,designation,image"
        ],
        "parts": [
            "id,designation"
        ],
        "bannieres": [
            "id,designation,valeur,description,lien,activer,activer_text,activer_badge,nbre_image,texte1,texte2,texte3,images{id,image,activer}",
        ],
        "suivis": [
            "id,designation,niveau,selected"
        ],
        "allergeneproduits": [
            "id,allergene_id,produit_id,allergene{id,designation},produit{id,code,designation}"
        ],
        "emballageproduits": [
            "id,emballage_id,produit_id,emballage{id,code,designation},produit{id,code,designation}"
        ],
        "famillemateriels": [
            "id,designation"
        ],
        "preferences": [
            "id,designation,valeur,description"
        ],
        "commentairecommandes": [
            "id,commentaire,diminutif,type_commentaire_id,type_commentaire{id,designation}"
        ],
        "typecommentaires": [
            "id,designation,commentaire_commandes{id,commentaire,diminutif}"
        ],
        "regulefournisseurs": [
            "id,date,date_fr,motif,commentaire,montant,type_regule_id,client_id,fournisseur_id,type_regule{id,designation},fournisseur{id,code,designation},client{id,code,raison_sociale}"
        ],
        "reguleclients": [
            "id,date,date_fr,motif,commentaire,montant,type_regule_id,client_id,fournisseur_id,type_regule{id,designation},fournisseur{id,code,designation},client{id,code,raison_sociale}"
        ],
        "livreurs": [
            "id,code,nom_complet,telephone,numero_cni,numero_permis,image,adresse,activer,activer_text,activer_badge,zone_de_livraison_id,zone_de_livraison{id,designation}"
        ],
        "reservations": [
            "id,etat,designation,code,client_id,client{id,raison_sociale},entite_id,entite{id,designation},date_reservation,date_fin,heure_debut,heure_fin," +
            "commentaire,moyen_de_reservation_id,date_reservation_fr,date_fin_fr," +
            "moyen_de_reservation{id,designation},etat_text,etat_badge,date_reservation_modif,date_fin_modif,table{id,designation,nombre_couverts},interlocuteur,nombre_couverts"
        ],
        "moyenreservations": [
            "id,designation"
        ],
        "productions": [
            "id,description,date,etat,etat_text,etat_badge,depot_id,depot{id,designation},created_at_user{id,name},date_fr,date_modif," +
            "detail_assemblages{id,qte_unitaire,description,utilise_vente,produit_id,produit{id,code,designation},depot_id,depot{id,code,designation},unite_mesure,prix_achat_unitaire,composants{id,produit_id,produit{id,code,designation},depot_id,depot{id,code,designation},unite_mesure,qte_unitaire,description,produit_text,poids,perte,last_prix_revient_unitaire,prix_revient_unitaire}}," +
            ",nombre_produit,depot_sortie{id,designation},created_at_user{id,name,image},updated_at_user{id,name,image},depot_sortie_id,produit{designation,code,id},entre_sortie,brouillon,quantite_traite,quantite_total_sortie,prix_de_revient,perte,prix_de_revient_depart,prix_achat_unitaire"
        ],
        "decoupages": [
            "id,description,date,etat,etat_text,etat_badge,depot_id,depot{id,designation},created_at_user{id,name},date_fr,date_modif," +
            "detail_assemblages{id,qte_unitaire,description,utilise_vente,produit_id,produit{id,code,designation},depot_id,depot{id,code,designation},unite_mesure,prix_achat_unitaire,composants{id,produit_id,produit{id,code,designation},depot_id,depot{id,code,designation},emballage_id,emballage{id,code,designation},unite_mesure,qte_unitaire,description,produit_text,poids,perte,last_prix_revient_unitaire,prix_revient_unitaire}}," +
            ",nombre_produit,depot_sortie{id,designation},created_at_user{id,name,image},updated_at_user{id,name,image},depot_sortie_id,produit{designation,code,id},entre_sortie,brouillon,quantite_traite,quantite_total_sortie,prix_de_revient,perte,prix_de_revient_depart,prix_achat_unitaire"
        ],
        "assemblages": [
            "id,description,date,date_fr,depot_id,depot{id,designation},depot_sortie_id,depot_sortie{id,designation},nombre_produit,created_at_user{id,name,image},updated_at_user{id,name,image}"
        ],
        "inventaires": [
            "id,code,designation,observation,date,date_fr,etat,etat_fr,etat_text,etat_badge,type_inventaire_id,type_inventaire{designation},motif_id,motif{designation}depot_id,depot{id,designation},zone_de_stockage_id,zone_de_stockage{id,designation},nbre_produits"
        ],
        "inventaireproduits": [
            "quantite_reel,quantite_theorique,difference,perte_fr,perte,perte_negligeable,valeur,pa_ht,pa_ttc,produit_id,produit{id,designation}"
        ],
        "categoriefournisseurs": [
            "id,designation"
        ],
        "typelignedecredits": [
            "id,designation,nombre_utilisation,nombre_utilisation_text,id_text"
        ],
        "lignecredits": [
            "id,date,codeboncadeau,montant,montant_restant,description,client_id,client{id,raison_sociale},mode_paiement_id," +
            "mode_paiement{id,designation},type_ligne_de_credit_id,type_ligne_de_credit{id,designation}"
        ],
        "suivimarketings": [
            "id,date,etat,etat_text,etat_badge,client{id,raison_sociale},client_id," +
            "palier_fidelite_id,palier_fidelite{id,designation,nombre_min,nombre_max,ca_min,ca_max}," +
            "tag{id,designation,couleur,ca_alert}, tag_id"
        ],
        "typetiers": [
            "id,designation"
        ],
        "historiqueactions": [
            "id,action,description,etat,heure,action_text,action_badge,commande_id," +
            "commande{id},created_at_user{name}"
        ],
        "stockactuelproduitdepots": [
            "id,quantite,depot_id,depot{id,designation},produit_id,produit{id,designation,unite_de_mesure{id,designation,decimal}}"
        ],
        "traiteurs": [
            "id,designation,code,date,date_debut_evenement,date_debut_fin,forfait,montant_total_traiteur,created_at_user{id,name,image},updated_at_user{id,name,image},sortie_stock_text,sortie_stock_badge,entre_stock_text,entre_stock_badge," +
            "lieu_prevu,nombre_personne,etat,traiteur_cloturer,has_facture," +
            "informations_complementaires,entite_id,entite{id,designation}," +
            "client_id,client{id,code,raison_sociale,civilite,email}," +
            "total_montant,date_debut_evenement_fr,date_debut_fin_fr," +
            "etat_text,etat_badge,date_debut_evenement_modif,date_debut_fin_modif," +
            "proposition_commericales{" +
            "id,designation,titre,proposition,forfait_direct_materiel,exotva,forfait_direct_menu,nombre_personne,remise,montant_par_personne,forfait,proforma_id,activer,est_activer," +
            "famille_menus{id,designation},forfait_option_materiel," +
            "option_materiel{produit_compose_id,quantite,produit_compose_id,produit_compose_text, montant, montant_ht}," +
            "produits_propositioncommerciale{produit_compose_id,produit_compose_text,option_menu}," +
            "familles_propositioncommerciale{famille_id,famille_text,option_menu}}," +
            "cuisine_stock_proformas{id,produit_id,quantite,quantite_relle,produit{id,designation,unite_de_mesure{id,designation,decimal}}}," +
            "logistique_proformas{id,produit_id,quantite,produit{id,designation}}," +
            "programme_rh{date}," +
            "proforma_operateurs{operateur_id,operateur{nom,designation},employe_id,employe{id,nom_complet,designation,telephone,date_embauche,date_embauche_fr,fonction_id,departement_id,user_id,fonction{id,designation},departement{id,designation}},tarif,date},option_materiel"
        ],
        "proformas": [
            "id,code,date_debut_evenement,date_debut_fin,forfait,montant_total_traiteur,created_at_user{id,name,image},updated_at_user{id,name,image}," +
            "lieu_prevu,nombre_personne,etat,traiteur_cloturer," +
            "informations_complementaires,entite_id,entite{id,designation}," +
            "client_id,client{id,code,raison_sociale,civilite,email}," +
            "total_montant,date_debut_evenement_fr,date_debut_fin_fr," +
            "etat_text,etat_badge,date_debut_evenement_modif,date_debut_fin_modif," +
            "proposition_commericales{forfait,forfait_direct_materiel,exotva,forfait_direct_menu,nombre_personne,titre,created_at_fr,updated_at_fr,created_at_user{id,name,image},updated_at_user{id,name,image}," +
            "id,designation,proposition,nombre_persone,remise,montant_par_personne,forfait,proforma_id,activer,est_activer," +
            "famille_menus{id,designation},forfait_option_materiel," +
            "option_materiel{produit_compose_id,quantite,produit_compose_id,produit_compose_text, montant, montant_ht}," +
            "produits_propositioncommerciale{produit_compose_id,produit_compose_text,option_menu}," +
            "familles_propositioncommerciale{famille_id,famille_text,option_menu}}," +
            "cuisine_stock_proformas{id,produit_id,quantite,quantite_relle,produit{id,designation,unite_de_mesure{id,designation,decimal}}}," +
            "logistique_proformas{id,produit_id,quantite,produit{id,designation}}," +
            "programme_rh{date}," +
            "proforma_operateurs{operateur_id,operateur{nom,designation},employe_id,employe{id,nom_complet,telephone,designation,date_embauche,date_embauche_fr,fonction_id,departement_id,user_id,fonction{id,designation},departement{id,designation}},tarif,date},option_materiel,"
        ],
        "commandeproduits": [
            "id,commande_id,produit_id,commande{id,date,created_at_fr,nombre_couvert,code,commentaire}," +
            "produit{id,code,is_menu,image,designation,diminutif,achatTTC,prix_achat_unitaire,prix_transfert_unitaire,departement{id,designation}," +
            "r2atechniques{id}},commande_produit_produits{id,produit{designation,departement{id,designation}},quantite,action,action_text,action_badge}" +
            ",action,action_text, action_badge,index,commentaire,montant_format,direct,departement_id,commentaire_bulles{id,commentaire,type_commentaire_id}" +
            ",emballage_id,emballage{id,code,designation}"
        ],
        "commandeproduitproduits": [
            "id,produit{designation,departement{id,designation}},quantite,action,action_text,action_badge,commande_produit_id,commande_produit{id,commande_id,produit_id,produit{id,code,is_menu,image,designation,diminutif,achatTTC,prix_achat_unitaire,prix_transfert_unitaire,departement{id,designation}},commande{id,date,created_at_fr,nombre_couvert,code,commentaire}}"
        ],
        "paiements": [
            "id,date,entite_id,entite{id,designation},mode_paiement_id,mode_paiement{id,designation},commande_id,commande{id,code,entite{id,designation},entite_id,montant_total_format,restant_payer_format,montant_total_paye,montant_offert},total_periode,caisse_id,caisse{id,designation},created_at_user{id,name},updated_at_user{id,name},montant"
        ],
        "reglements": [
            "id,date,entite_id,entite{id,designation},mode_paiement_id,mode_paiement{id,designation},depense_id,depense{id,code,date,montant,deja_paye,restant_paye,motif,entite{id,designation}},total_periode,caisse_id,caisse{id,designation},created_at_user{id,name},updated_at_user{id,name},montant"
        ],
        "suivibanques": [
            "id,date,date_fr,numerosuivi,banquesuivi,nomsuivi,valider,montant,valider_text,valider_badge,provenance_text,entite_id,entite{id,designation},mode_paiement_id,mode_paiement{id,designation},depense_id,depense{id,code,motif},commande_id,commande{id,code},facture_id,facture{id,code},bce_id,bce{id,code},total_periode,caisse_id,caisse{id,designation},created_at_user{id,name},updated_at_user{id,name}"
        ],
        "paiementfactures": [
            "id,date,date_fr,entite_id,entite{id,designation},mode_paiement_id,mode_paiement{id,designation},facture_id,facture{id,code,date_fr},total_periode,caisse_id,caisse{id,designation},created_at_user{id,name},updated_at_user{id,name},montant"
        ],
        "paiementbcs": [
            "id,date,date_fr,entite_id,entite{id,designation},mode_paiement_id,mode_paiement{id,designation},bce_id,bce{id,code},caisse_id,caisse{id,designation},created_at_user{id,name},updated_at_user{id,name},montant"
        ],
        "commandes": [
            "id,date,created_at_fr,nombre_couvert,compta,code,commentaire,adresse_de_livraison,nom_du_client,telephone_client,type_commande{id,designation},total_periode,has_facture," +
            "montant_total_commande,montant_total_format,restant_payer,montant_total_paye,restant_payer_format,montant_total_paye_format,etat_commande,etat_commande_text," +
            "etat_commande_badge,created_at_user{id,name},updated_at_user{id,name},entite_id,entite{id,designation},table_commandes{id,table_id,table{id,designation,nombre_couverts}},has_facture,suivi_id,suivi{id,designation,niveau}" +
            "client_id,payer,payer_text,payer_badge,from_site,from_site_text,from_site_badge," +
            "produits{" +
            "commentaire_bulles{id,commentaire,type_commentaire_id},id,etat_paiement,paiement_id,offre,commentaire,action,action_text,action_badge,is_menu,montant_format,direct," +
            "designation,index," +
            "famille_liaison_produits{" +
            "id," +
            "quantite," +
            "pour_menu," +
            "famille{id,designation}," +
            "details_produits{" +
            "id,code,designation," +
            "famille_id," +
            "famille{id,designation,direct}," +
            "unite_de_mesure{id,designation,decimal}," +
            "montant" +
            "}," +
            "produit{id,designation}," +
            "famille_id}" +
            ",accompagnement_commande{id,designation,choix},user{name},montant,quantite_gratuite}," +
            "table_commandes{table{designation,id}}," +
            "tables{id,designation},offre," +
            "menus{id,designation,offre,commentaire,action,action_text,action_badge,is_menu," +
            "index," +
            "famille_liaison_produits{" +
            "id," +
            "quantite," +
            "pour_menu," +
            "famille{id,designation}," +
            "details_produits{" +
            "id,code,designation," +
            "famille_id," +
            "famille{id,designation}," +
            "unite_de_mesure{id,designation,decimal}," +
            "montant" +
            "}," +
            "produit{id,designation}," +
            "famille_id},montant,familles{id,designation}," +
            "}," +
            "reservation{id,interlocuteur,commentaire,client_id,client{id,raison_sociale}},montant_offert,created_at_fr_cuisine,departement_tag_text,departement_tag_badge,direct_tag_text,direct_tag_badge"

        ],
        "proformacommandes": [
            "id,date,created_at_fr,nombre_couvert,code,commentaire,adresse_de_livraison,nom_du_client,telephone_client,type_commande{id,designation},total_periode,has_facture," +
            "montant_total_commande,montant_total_format,restant_payer,montant_total_paye,restant_payer_format,montant_total_paye_format,etat_commande,etat_commande_text," +
            "etat_commande_badge,created_at_user{id,name},updated_at_user{id,name},entite_id,entite{id,designation},table_commandes{id,table_id,table{id,designation,nombre_couverts}},has_facture," +
            "client_id," +
            "produits{" +
            "id,etat_paiement,paiement_id,offre,commentaire,action,action_text,action_badge,is_menu,montant_format,direct," +
            "designation,index," +
            "famille_liaison_produits{" +
            "id," +
            "quantite," +
            "pour_menu," +
            "famille{id,designation}," +
            "details_produits{" +
            "id,code,designation," +
            "famille_id," +
            "famille{id,designation,direct}," +
            "unite_de_mesure{id,designation,decimal}," +
            "montant" +
            "}," +
            "produit{id,designation}," +
            "famille_id}" +
            ",accompagnement_commande{id,designation,choix},user{name},montant,quantite_gratuite}," +
            "table_commandes{table{designation,id}}," +
            "tables{id,designation},offre," +
            "menus{id,designation,offre,commentaire,action,action_text,action_badge,is_menu," +
            "index," +
            "famille_liaison_produits{" +
            "id," +
            "quantite," +
            "pour_menu," +
            "famille{id,designation}," +
            "details_produits{" +
            "id,code,designation," +
            "famille_id," +
            "famille{id,designation}," +
            "unite_de_mesure{id,designation,decimal}," +
            "montant" +
            "}," +
            "produit{id,designation}," +
            "famille_id},montant,familles{id,designation}," +
            "}," +
            "reservation{id,interlocuteur,commentaire,client_id,client{id,raison_sociale}},montant_offert"

        ],
        //
        "cartes": [
            "id,designation,activer,activer_text,activer_badge,entite_id,entite{id,designation},type_prix_vente_id,type_prix_vente{id,designation},carteproduits{id,designation,famille_id,famille{id,designation}}"
        ],
        "menus": [
            "id,designation,activer,montant_menu,heure_fin_menu,is_menu," +
            "heure_debut_menu," +
            "date_debut_menu_fr," +
            "date_fin_menu_fr," +
            "date_debut_menu," +
            "date_fin_menu," +
            "entite_id," +
            "entite{id,designation}",
            "produits{id,designation,famille_id,famille{id,designation},unite_de_mesure{id,designation,decimal},quantite,option_menu}",
            "familles{id,designation}"
        ],

        "activites": [
            "id,designation,tva,tva_text"
        ],
        "societefacturations": [
            "id,denominationsociale,telephone,image,email,adresse,rib,ninea,rcm,alias,solde_comptable,nbre_entite,nbre_facture_comm,nbre_facture_traiteur"
        ],
        "entites": [
            "id,code,designation,telephone,ninea,rc,adresse,description,peut_livrer,peut_livrer_text,peut_livrer_badge,image,image,societe_facturation_id,total_cloture_caisse,total_theorique_cloture_caisse,total_reel_cloture_caisse," +
            "total_manquant,societe_facturation{id,denominationsociale}"
        ],
        "typeevenements": [
            "id,designation"
        ],
        "typefaitdivers": [
            "id,designation"
        ],
        "evenements": [
            "id,date,date_fr,date_entier,date_court,designation,etat,etat_text,etat_badge,description,type_evenement_id,type_evenement{id,designation},nbre_intervenants"
        ],
        "participants": [
            "id,date_creation,evenement_id,employe_id,employe{id,nom_complet},prestataire_id"
        ],
        "modepaiements": [
            "id,designation,est_cash,est_cash_text,est_cash_badge,encaissable,encaissable_text,encaissable_badge,readonly,pour_banque,pour_banque_text,pour_banque_badge,pour_ligne_credit,pour_bon_cadeau,description"
        ],
        "typebillets": [
            "id,designation,nombre"
        ],
        "billetages": [
            "id,nombre,type_billet_id,cloture_caisse_id,type_billet{id,designation,nombre}"
        ],
        "encaissements": [
            "id,montant,mode_paiement_id,cloture_caisse_id,mode_paiement_id,mode_paiement{id,designation,est_cash}"
        ],
        "postedepenseentites": [
            "id,montant,poste_depense_id,entite_id,poste_depense{id,designation},entite{id,designation}"
        ],
        "depensepostedepenses": [
            "id,montant,tva,montant_tva,montant_ttc,poste_depense_id,depense_id,poste_depense{id,designation},depense{id,date,date_fr,motif}"
        ],
        "detailfactures": [
            "id,facture_id,commande_id,proforma_id,montant_total,restant_payer,montant_total_paye,commande{id,code},proforma{id,code},facture{id,code,date_fr}"
        ],
        "entitetransactioncaisses": [
            "id,montant,entite_id,sortie_cash_id,versement_id,entite{id,designation}"
        ],
        "detailactions": [
            "id,date,date_fr,designation,document,fichier,observations,commentaire,nbre_intervenants,frequence_qhse_id,famille_action_id,zone_id,sous_zone_id,evenement_id,be_id,created_at_fr,updated_at_fr,frequence_qhse{id,designation},famille_action{id,designation},zone{id,designation},sous_zone{id,designation},proforma{id,code},be{id,code},etat,conformite,action_interne,etat_text,etat_badge,conformite_text,conformite_badge,montant,rapport_conformite,user_rapport_conformite_id,user_rapport_conformite{id,name}"
        ],
        "categoriedepenses": [
            "id,designation"
        ],
        "postedepenses": [
            "id,designation,compte_sage,categorie_depense_id,categorie_depense{id,designation}," +
            "compte_sages{compte_sage,societe_facturation{designation},societe_facturation_id}"
        ],
        "souspostedepenses": [
            "id,designation,compte_sage,categorie_depense_id,poste_depense_id,categorie_depense{id,designation},poste_depense{id,designation}," +
            "compte_sages{compte_sage,societe_facturation{designation},societe_facturation_id}"
        ],
        "depenses": [
            "id,code,date,date_fr,date_court,montant,montant_ht,motif,montant,numero_piece,date_piece,date_echeance,nombre_jour_rappel,etat,fichier,parametrage_budget_id,be_id,type_de_transaction_id,caisse_id,proforma_id,entite_id,poste_depense_id,user_id,user_validation_id,fournisseur_id,activite_id,mode_paiement_id,caisse{id,designation},entite{id,designation},poste_depense{id,designation},mode_paiement{id,designation},fournisseur{id,designation},user{id,name},user_validation{id,name},total_periode,etat_text,etat_badge,comptant,tva,compta,payer,payer_text,payer_badge,deja_paye,restant_paye"
        ],
        "typedecaisses": [
            "id,designation,peut_versement_banque,peut_versement_banque_text,peut_versement_banque_badge"
        ],
        "banques": [
            "id,designation,solde"
        ],
        "motifs": [
            "id,designation"
        ],
        "typeregules": [
            "id,designation,est_debit,est_debit_text,est_debit_badge"
        ],
        "approcashs": [
            "id,date,date_fr,montant,motif,description,caisse_source_id,caisse_source{id,designation},caisse_destinataire_id,caisse_destinataire{id,designation},created_at_fr,updated_at_fr,provenance_cloture_text,provenance_cloture_badge,cloture_caisse_id"
        ],
        "sortiecashs": [
            "id,date,date_fr,montant,motif,commentaire,caisse_id,caisse{id,designation},created_at_fr,updated_at_fr"
        ],
        "transactioncaisses": [
            "id,date,date_fr,montant,motif,description,caisse_source_id,caisse_source{id,designation},caisse_destinataire_id,caisse_destinataire{id,designation},created_at_fr,updated_at_fr,provenance_cloture_text,provenance_cloture_badge"
        ],
        "cloturecaisses": [
            "id,date_debut,date_debut_fr,date_fin,date_fin_fr,date_debut_entier,date_fin_entier,etat_text,etat_badge,manquant,montant_manquant,manquant_text,manquant_badge,fond_caisse,montant_caisse_actuel,etat,tranche_horaire_id,tranche_horaire{id,designation},caisse_id,caisse{id,designation},entite_id,entite{id,designation},fond_de_caisse_id,fond_de_caisse{id,montant,entite{id,designation}},user_id,user{id,name,email},user_etat{id,name,email},created_at_fr,updated_at_fr,total_ecaissement,type,type_text,total_paiement_commande,total_reglement_depense,total_theorique_encaissement,total_reel_encaissement,total_reel_encaissement_cash"
        ],
        "versements": [
            "id,date,date_fr,montant,description,caisse_id,caisse{id,designation},banque_id,banque{id,designation},entite_id,entite{id,designation},created_at_fr,updated_at_fr"
        ],
        "caisses": [
            "id,designation,solde,solde_diez,est_activer,entite_id,societe_facturation_id,type_de_caisse_id,parent_id,type_de_caisse{id,designation},entite{id,designation},societe_facturation{id,denominationsociale},parent{id,designation}"
        ],
        "interventions": [
            "id,date,rapport,commentaire,observation,action_id,operateur_id,created_at_fr,updated_at_fr,action{id,designation},operateur{id,nom}"
        ],
        "frequenceqhses": [
            "id,designation"
        ],
        "typeprixdeventes": [
            "id,designation,par_defaut,par_defaut_text,pour_site,pour_site_text"
        ],
        "nomenclatures": [
            "id,designation"
        ],
        "brigades": [
            "id,designation,diminutif"
        ],
        "planings": [
            "id,designation,date_debut,date_fin,date_debut_fr,date_fin_fr,entite_id,entite{id,designation},tableau,brouillon"
        ],
        "fonctions": [
            "id,designation"
        ],
        "zones": [
            "id,designation,entite_id,entite{designation},nbre_sous_zone"
        ],
        "employes": [
            "id,nom_complet,telephone,date_embauche,date_embauche_fr,fonction_id,departement_id,user_id,fonction{id,designation},departement{id,designation},net_bulletin,categorie,activer,activer_text,activer_badge,duree_travail,temps_travail,type_contrat_id,entite_id,type_contrat{id,designation},entite{id,designation},designation"
        ],
        "familleactions": [
            "id,designation"
        ],
        "operateurs": [
            "id,nom,email,telephone,type_operateur_id,type_operateur{id,designation},matricule"
        ],
        "familleactionsoperateurs": [
            "id,famille_action_id,operateur_id,operateur{id,nom},famille_action{id,designation}"
        ],
        "entreestocks": [
            "id,date,date_fr,etat,provenance,pour_logistique,code,etat_text,etat_badge,observation,inventaire_id,inventaire{code},depot_id,depot{id,code,designation},motif_id,motif{designation},nbre_produits"
        ],
        "sortiestocks": [
            "id,date,date_fr,etat,code,provenance,etat_text,etat_badge,observation,inventaire_id,inventaire{code},depot_id,depot{id,code,designation},,motif_id,motif{designation},nbre_produits"
        ],
        "typecommandes": [
            "id,designation,tag"
        ],
        "tables": [
            "id,designation,nombre_couverts,occupation,forme_table_id,entite_id,forme_table{id,designation},entite{id,designation}",
        ],
        "unitedemesures": [
            "id,designation,decimal,abreviation"
        ],
        "zonedestockages": [
            "id,designation,famille_id,famille{id,designation},entite{id,designation}"
        ],
        "typedeconservations": [
            "id,designation"
        ],
        "actions": [
            "id,code,date,date_fr,evenement_exceptionnel,designation,document,fichier,observations,commentaire,nbre_intervenants,frequence_qhse_id,famille_action_id,zone_id,sous_zone_id,proforma_id,be_id,created_at_fr,updated_at_fr,frequence_qhse{id,designation},famille_action{id,designation},zone{id,designation},sous_zone{id,designation},proforma{id,code},be{id,code},etat,conformite,action_interne,etat_text,etat_badge,conformite_text,conformite_badge,montant,rapport_conformite,user_rapport_conformite_id,user_rapport_conformite{id,name},avec_tva,tva,montant_ttc,montant_tva"
        ],
        "produits": [
            "id,code,image,image1,image2,image3,image4,current_quantity,valorisation_ttc,valorisation_httc,valorisation_bar,code_externe,nbre_bouteille_restante,nbre_dose_restante,nbre_totale_dose,designation,diminutif,achatTTC,prix_achat_unitaire,prix_transfert_unitaire,prix_achat_ttc,prix_achat_fournisseur,prix_par_defaut,prix_par_defaut_ht,taux_marque,pour_production,pour_production_text,pour_production_badge," +
            "pmp_achat,pmp_ttc,cump,cump_off,prix_de_revient_unitaire,prix_achat_unitaire_off,prix_de_revient_unitaire_off,pr_ttc,prix_promo,conditionnement,poids,volume,date_debut_promo,date_fin_promo,typeproduit_id,livraisoncoursier,clickcollect,detail,allergene,ingredient," +
            "categorieproduit_id,unite_de_mesure_id,nomenclature_id,famille_id,sousfamille_id,departement_id,sousdepartement_id,depot_id,depot{id,code,designation}," +
            "type_de_conservation_id,zone_de_stockage_id,typeproduit{id,designation},categorieproduit{id,designation},unite_de_mesure{id,designation,decimal}," +
            "nombre_portion,ft_tva,ft_total_pr,ft_total_pr_off,ft_pv_ttc,ft_pv_ht,ft_taux_marque_ht,ft_taux_marque_ht_off,ft_taux_marque_ttc_off," +
            "nomenclature{id,designation},famille{id,designation,direct},sousfamille{id,designation,direct},departement{id,designation},sousdepartement{id,designation}," +
            "type_de_conservation{id,designation},zone_de_stockage{id,designation},parent{id,designation},part_id,part{id,designation},poids,taille,conservation,dernier_arrivage,coef,coef_off," +
            "prixdeventes{id,montant,type_prix_de_vente{id,designation},type_prix_de_vente_id}" +
            "r2atechniques{id,quantite,produit_compose{id,code,designation,unite_de_mesure{id,designation}},produit_compose_id,pr_off,pr,is_recette}" +
            "fournisseurproduits{id,montant_achat,fournisseur{id,designation},fournisseur_id}" +
            "allergeneproduits{id,allergene{id,designation},allergene_id}" +
            "emballageproduits{id,emballage{id,code,designation},emballage_id}" +
            "images{id,image,activer}" +
            "famille_liaison_produits{id,quantite,pour_menu,famille{id,designation},details_produits{id,code,designation,famille_id,famille{id,designation},unite_de_mesure{id,designation,decimal},montant},produit{id,designation},famille_id}" +
            "entites{id,designation,quantite_total_final,quantite_total_initial,etatbciproduitentite}" +
            "entite_produits{id,quantite_min,quantite_max,entite{id,designation},entite_id,produit{id,designation}},user{name},montant,quantite_gratuite,quantite_theorique,offre,is_menu," +
            "type_commandes{id,designation,nombre_commande},ca_ttc,ca_ttc_barane,ca_total,etat_paiement,paiement_id,montant_format,direct"
        ],
        "logistiques": [
            "id,description,designation,prix_achat_unitaire,typeproduit_id,famille_materiel_id,typeproduit{id,designation},famille_materiel{id,designation},current_quantity,valorisation_ttc,valorisation_httc,"
        ],
        "optionlogistiques": [
            "id,code,image,designation,diminutif,achatTTC,prix_achat_unitaire,prix_transfert_unitaire,prix_achat_ttc,prix_achat_fournisseur," +
            "pmp_achat,pmp_ttc,prix_de_revient_unitaire,poids,volume,typeproduit_id," +
            "categorieproduit_id,unite_de_mesure_id,nomenclature_id,famille_id,sousfamille_id,departement_id,sousdepartement_id," +
            "type_de_conservation_id,zone_de_stockage_id,typeproduit{id,designation},categorieproduit{id,designation},unite_de_mesure{id,designation,decimal}," +
            "nomenclature{id,designation},famille{id,designation},sousfamille{id,designation},departement{id,designation},sousdepartement{id,designation}," +
            "type_de_conservation{id,designation},zone_de_stockage{id,designation},parent{id,designation}" +
            ",frequence_traiteur,logistique_text,logistique_id,quantite_traiteur,prix_vente_unitaire,prix_vente_unitaire_ttc,option_logistique"
        ],
        "bceproduitentites": [
            "id,etat,quantite_finale,produit{id,designation,prix_achat_unitaire,prix_achat_ttc,achatTTC},produit_id,qte_totale_be,prix_achat_ht,prix_achat_fournisseur,tva"
        ],
        "bcis": [
            "id,code,designation,qte_total,depot_id,depot{designation},fournisseur_id,fournisseur{designation},condition_reglement_id,condition_reglement{designation},devise_id,devise{designation},date_echeance,commentaire,date_operation,date_operation_modif,entite_id,entite{id,designation},bce_id,bce{id,code},bciproduits{quantite,produit_id,prix_achat,produit{id,designation,prix_achat_ttc,prix_achat_unitaire},produit_compose_id}"
        ],
        "bces": [
            "id,date_operation,created_at_fr,fichier,bci_id,bci{code},depot_id,depot{designation},fournisseur_id,fournisseur{designation},condition_reglement_id,condition_reglement{designation},devise_id,devise{designation},date_echeance,date_debut,date_fin,date_debut_fr,date_fin_fr,code,motif,etat,user_id,nbre_produit,numero_code,num_fac,reception,reception_text,reception_badge,montant,montant_off,payer,payer_text,payer_badge,deja_paye,restant_paye,payer_off,payer_off_text,payer_off_badge,deja_paye_off,restant_paye_off," +
            "user{id,name,email},entite_id,entite{id,designation},bcis{id,designation,motif," +
            "date_operation,entite_id,entite{id,designation},bce_id,bce{id,code}," +
            "bciproduits{quantite,produit{id,designation}}}," +
            "bce_produits{id,quantite,produit_id,prix_achat,quantite_finale,quantite_be,produit_id,produit{designation,prix_achat_ttc,prix_achat_unitaire}," +
            "etat,bci_produits{id,quantite,quantite_finale,produit_id,produit{designation" +
            "}}" +
            "}"
        ],
        "bes": [
            "id,code,coef,coef_off,date,date_fr,date_echeance,date_echeance_court,date_echeance_fr,created_at_fr,nbre_produit,commentaire,fournisseur_id,depot_id,bce_id,action_id,fournisseur{id,designation},depot{id,designation,entite{id,designation}},bce{id,code},facture,total,payer,payer_text,payer_badge"
        ],
        "bciproduits": [
            "id,quantite,quantite_finale,produit_id,prix_achat,bci_id,etat,produit{id,designation,prix_achat_ttc,prix_achat_unitaire},bci{id},produit_compose_id"
        ],
        "bceproduits": [
            "id,prix_achat_fournisseur,prix_achat,prix_achat_off,quantite,quantite_finale,qte_totale_be,qte_restante,quantite_be,produit_id,bce_id,etat,produit{id,prix_achat_unitaire,designation,prix_achat_unitaire,prix_achat_fournisseur,depot_id,depot{id,code,designation}},bce{id,date_operation},bce_produit_entites{id,quantite,quantite_finale,entite_id,bce_produit_id,entite{id,designation},etat}"
        ],
        "beproduits": [
            "id,quantite,prix_achat,prix_achat_off,pr,pr_off,tva_facture,produit_id,produit{id,designation,prix_achat_unitaire,prix_achat_unitaire,prix_achat_fournisseur},depot_id,depot{id,code,designation},be{id,code},bce_produit_id"
        ],
        "entresortiestockproduits": [
            "id,quantite,produit{id,designation,prix_achat_unitaire,prix_achat_fournisseur}"
        ],
        "conditionreglements": [
            "id,designation,nombrejours"
        ],
        "zonedelivraisons": [
            "id,designation,montant,zone_de_livraison_entites{entite_id,entite{designation},montant}"
        ],
        "typeoperateurs": [
            "id,designation,nbre_operateur"
        ],
        "typecontrats": [
            "id,designation,nbre_employes"
        ],
        "factures": [
            "id,code,designation,date,date_fr,date_echeance,date_echeance_fr,solde,commentaire,exonoration,client_id,activite_id,societe_facturation_id,entite_id,client{id,code,raison_sociale},activite{id,designation},societe_facturation{id,denominationsociale},entite{id,designation},montant,montant_ht,montant_tva,deja_paye,restant_paye,etat,etat_text,etat_badge,payer,payer_text,payer_badge,user{id,name},user_validation{id,name},compta_text,compta_badge,recap_comptant"
        ],
        "facturetraiteurs": [
            "id,code,designation,date,date_fr,date_echeance,date_echeance_fr,solde,commentaire,exonoration,client_id,activite_id,societe_facturation_id,entite_id,client{id,code,raison_sociale},activite{id,designation},societe_facturation{id,denominationsociale},entite{id,designation},montant,deja_paye,restant_paye,etat,etat_text,etat_badge,payer,payer_text,payer_badge,user{id,name},user_validation{id,name},compta_text,compta_badge,recap_comptant"
        ],
        "recouvrements": [
            "id,code,designation,date,date_fr,date_echeance,date_echeance_fr,solde,commentaire,exonoration,client_id,activite_id,societe_facturation_id,entite_id,client{id,code,raison_sociale},activite{id,designation},societe_facturation{id,denominationsociale},entite{id,designation},montant,deja_paye,restant_paye,etat,etat_text,etat_badge,payer,payer_text,payer_badge,user{id,name},user_validation{id,name}"
        ],
        "jours": [
            "id,designation,brigade_id,tranche_horaire_id"
        ],
        "typedepots": [
            "id,designation,peut_vendre,peut_vendre_text,peut_vendre_badge"
        ],
        "depots": [
            "id,code,designation,peut_vendre,activer,entite_id,type_depot_id,entite{id,designation},type_depot{id,designation}"
        ],

        "clients": [
            "id,code,raison_sociale,ses_proforma,ses_vente,designation,civilite,email,ninea,rcc,remise_autorise,dette_client,notes,est_activer,ca,ca_ht," +
            "plafond_credit_autorise,exonorer_tva,activer,type_client{id,designation,option_affiliation," +
            "credit_autorise_non_cumulable},affilier{id,code,raison_sociale,email},entite{id,designation}," +
            "condition_reglement{id,designation,nombrejours},adresse,telephone,entite{id,designation}," +
            "adresses{id,designation,par_defaut,client_id,zonedelivraison_text,zone_de_livraison{id,designation},zone_de_livraison_id}," +
            "contacts{id,telephone,nomcomplet,email,par_defaut}," +
            "remise_value,plafond_value,affilier_id," +
            "compte_sages{compte_sage,societe_facturation{designation},societe_facturation_id},commande,traiteur,reservation," +
            "dateclemotifs{id,motif,date_fr,date_en,date,observation,type_evenement{id,designation},type_evenement_id}"
        ],
        "clientmarkets": [
            "id,code,raison_sociale,designation,civilite,email,ninea,rcc,remise_autorise,dette_client,notes," +
            "plafond_credit_autorise,exonorer_tva,activer,type_client{id,designation,option_affiliation," +
            "credit_autorise_non_cumulable},affilier{id,code,raison_sociale,email},entite{id,designation}," +
            "condition_reglement{id,designation,nombrejours},adresse,telephone,entite{id,designation}," +
            "adresses{id,designation,par_defaut}," +
            "contacts{id,telephone,nomcomplet,email,par_defaut}," +
            "remise_value,plafond_value,affilier_id," +
            "compte_sages{compte_sage,societe_facturation{designation},societe_facturation_id},commande,traiteur,reservation,acces"
        ],
        "adresses": [
            "id,designation,par_defaut,client_id,zonedelivraison_text,zone_de_livraison{id,designation},zone_de_livraison_id"
        ],
        "contacts": [
            "nomcomplet,telephone,email,par_defaut,client_id,fournisseur_id"
        ],
        "tags": [
            "id,designation,couleur,ca_alert"
        ],
        "tagclients": [
            "id,tag_id,etat,etat_text,etat_badge,tag{id,designation,couleur,ca_alert},client_id,client{id,code,raison_sociale,civilite,email,ninea,rcc,remise_autorise,dette_client,notes,plafond_credit_autorise,exonorer_tva,activer}"
        ],
        "dateclemotifs": [
            "id,motif,date_fr,date_en,observation,type_evenement{id,designation}," +
            "client_id,client{id,code,raison_sociale,civilite,email,ninea,rcc,remise_autorise,dette_client,notes,plafond_credit_autorise,exonorer_tva,activer},type_evenement_id"
        ],
        "favoris": [
            "id,motif,date_fr,date_en,observation,type_evenement{id,designation},client_id,client{id,code,raison_sociale,civilite,email,ninea,rcc,remise_autorise,dette_client,notes,plafond_credit_autorise,exonorer_tva,activer},type_evenement_id"
        ],
        "typeproduits": [
            "id,designation,impact_economa,pour_production,pour_logistique,pour_logistique_fr,text_id,famille_id,famille{id,designation},type_produit_type_depots{type_depot_id,type_depot{designation},valorisation,valorisation_fr},details{type_depot_id,type_depot{designation},valorisation,valorisation_fr}"
        ],
        "categorieproduits": [
            "id,designation,show_web_site,image,description,ordre"
        ],
        "souscategorieproduits": [
            "id,designation,show_web_site,image,description,ordre,parent_id,parent{id,designation}"
        ],
        "familles": [
            "id,designation,diminutif,show_web_site,mode_affichage_web,is_traiteur,nombre_produit,diminutif,pour_carte,pour_carte_badge,pour_carte_text,couleur,matiere_premiere,direct,option_carte,option_carte_text,option_carte_badge,readonly,est_emballage"
        ],
        "sousfamilles": [
            "id,designation,diminutif,parent_famille_id,parent_famille{id,designation},show_web_site,mode_affichage_web,is_traiteur,diminutif,pour_carte,pour_carte_badge,pour_carte_text,couleur,matiere_premiere,direct,option_carte,option_carte_text,option_carte_badge"
        ],
        "departements": [
            "id,designation,code,famille_id,famille{id,designation}"
        ],
        "sousdepartements": [
            "id,designation,code,parent_id,parent{id,designation,code},famille_id,famille{id,designation}"
        ],
        "souszones": [
            "id,designation,zone_id,zone{id,designation},entite_id,entite{designation}"
        ],
        "sousdepots": [
            "id,code,designation,peut_vendre,activer,entite_id,type_depot_id,entite{id,designation},type_depot{id,designation},parent_id,parent{id,code,designation}"
        ],
        "typeclients": [
            "id,designation,option_affiliation,credit_autorise_non_cumulable"
        ],
        "categorieclients": [
            "id,nom,nbre_client,description,couleur"
        ],
        "fournisseurs": [
            "id,code,designation,email,adresse,telephone,facture_tva,compta_hors_compta,categorie_fournisseur_id,categorie_fournisseur{id,designation},type_tier_id,type_tier{id,designation},devise_id,devise{id,designation},ca,ca_ht,montant_du," +
            "contacts{id,telephone,nomcomplet,email,par_defaut,fournisseur_id}," +
            "compte_sages{compte_sage,societe_facturation{designation},societe_facturation_id}",
        ],
        "bts": [
            "id,code,observation,qte_total,nbre_produit,btproduits{produit_compose_text,quantite,produit{designation},produit_compose_id,prix_achat_ht,prix_achat_ttc},date,date_fr,observation,genered_by_si,depot_expediteur_id,depot_expediteur{id,code,designation,peut_vendre,activer,entite_id,type_depot_id,entite{id,designation},type_depot{id,designation}},depot_destinataire_id,depot_destinataire{id,code,designation,peut_vendre,activer,entite_id,type_depot_id,entite{id,designation},type_depot{id,designation}},user_id,user{id,name},created_at_user{id,name,email},etat,etat_text,etat_badge",
        ],
        "btproduits": [
            "id,produit_compose_text,quantite,produit_id,produit{id,designation,prix_achat_ttc,prix_achat_unitaire}"
        ],
        "tranchehoraires": [
            "id,designation,heure_debut,heure_fin,heure_debut_fr,heure_fin_fr,duree",
        ],
        "formetables": [
            "id,designation",
        ],
        "permissions": [
            'id,name,display_name,guard_name,designation',
        ],
        "roles": [
            "id,name,guard_name,permissions{id,name,display_name,guard_name}",
            ""
        ],
        "users": [
            "id,name,email,image,entite_id,roles{id,name},entite_id,entite{id,designation},created_at_fr,userdepartements{id,departement{id,designation},etat},user_caisses{id,caisse_id,caisse{id,designation}},user_avec_entites{id,entite_id,entite{id,designation}}",
        ],
        "userdepartements": [
            "id,departement_id,departement{id,designation},user_id,user{id,name,email},etat",
        ],
        "notifpermusers": [
            "id,permission_id,user_id,notif_id,notif{id,message,link,created_at_fr},link"
        ],
        "notifs": [
            "id,message,link,created_at_fr"
        ],

        "devises": [
            "id,designation,valeur_conversion,signe,par_defaut,par_defaut_text,par_defaut_badge"
        ],

        "typeemballages": [
            "id,designation,est_collectif,est_collectif_fr,est_collectif_bool,nbre_emballage"
        ],

        "emballages": [
            //"id,designation,type_emballage_id,type_emballage{designation},prix"
            "id,code,designation"
        ],
        "fonddecaisses": [
            "id,date,date_fr,entite_id,entite{designation},description,montant"
        ],
        "typeinventaires": [
            "id,designation,nbre_inventaire"
        ],
        "motifdeprimes": [
            "id,designation,description"
        ],
        "contrats": [
            "id,date_debut,date_fin,fichier,employe_id,employe{designation},type_contrat_id,type_contrat{designation},montant,description"
        ],
        "r2adepaies": [
            "id,date,date_fr,contrat_id,montant_total,montant_prime,contrat{montant,employe{designation}},montant_total,detail_r2a_de_paie{id,motif_de_prime_id,motif_de_prime{designation},montant},nbre_prime"
        ],
        "commentaires": [
            "id,facture_id,commentaire,created_at_user{name}"
        ],
        "inventairelogistiques": [
            "id,code,designation,observation,date,date_fr,etat,etat_fr,etat_text,etat_badge,type_inventaire_id,type_inventaire{designation},motif_id,motif{designation}depot_id,depot{id,designation},zone_de_stockage_id,zone_de_stockage{id,designation},nbre_produits"
        ],
        "listeenvies": [
            "id,produit_id,produit{id,designation,pourcentage_prormo,image_principale,liste_envie,nouveau,autres_images,prix,prix_visible}"
        ],
        "vusrecemments": [
            "id,client_id,client{id,code,raison_sociale},produit_id,produit{id,designation,pourcentage_prormo,prix,liste_envie,image_principale}"
        ],
        "abonnements": [
            "id,client_id,client{id,code,raison_sociale},choix1,choix2,choix3"
        ],

        //-------------FIN ==> MES REQUETES PERSONNALISEES--------------------//
    };

    /* Mes fonctions a part que je optimiser*/
    $scope.famille_id = 0;
    $scope.inputs = [];
    $scope.inputsbannieres = [];
    $scope.passage = false;
    $scope.directbce = false;
    $scope.commandeOfferte = false;
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
                if (id == 'tva_nombre_personne_propositioncommerciale') {
                    var valHtva = $("#montant_par_personne_propositioncommerciale").val();
                    if (valHtva && valHtva > 0) {
                        var valTva = +valHtva + ((+valHtva * 18) / 100);
                        $("#montanttva_par_personne_propositioncommerciale").val(valTva);

                        var nbPersonne = $("#nombre_personne_propositioncommerciale").val();
                        var forfaitTva = valTva * nbPersonne;
                        $("#forfait_propositioncommerciale").val(forfaitTva);

                    }

                }
                else {
                    $("#valeur_" + id).fadeIn('slow');
                    $("." + classeToHide).fadeIn('slow');
                    $("." + classeToShow).fadeOut('slow');
                }

            } else {
                if (id == 'tva_nombre_personne_propositioncommerciale') {

                    var valHtva = $("#montant_par_personne_propositioncommerciale").val();
                    if (valHtva && valHtva > 0) {
                        //var valTva = +valHtva - ((+valHtva * 18) / 100);
                        $("#montanttva_par_personne_propositioncommerciale").val(0);

                        var nbPersonne = $("#nombre_personne_propositioncommerciale").val();
                        var forfaitTva = valHtva * nbPersonne;
                        $("#forfait_propositioncommerciale").val(forfaitTva);

                    }

                } else {
                    $("." + classeToHide).fadeOut('slow');
                    $("#valeur_" + id).fadeOut('slow');
                    $("." + classeToShow).fadeIn('slow');
                }
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

    /* Mes fonctions a part que je optimiser*/


    //-------------RT ECHO--------------------//
    /*window.Echo.channel('rt')
        .listen('RtEvent', (e) =>
        {
            // Si je détecte que nous sommes sur la page de la liste items concerné, on fait un refresh en passant par le pageChanged

            if(e.data.type == 'commande_reclamation' || e.data.type == 'maj_commande'){
                var send_data = {
                    commande      : e.data.message.commande,
                    departement   : e.data.message.departement,
                    ressource     :    $scope.linknav
                };

                // if ($scope.linknav.indexOf("list-" + e.data.type) == 'list-commande-encour' || $scope.linknav.indexOf("list-" + e.data.type) == 'list-commande')
                // {
                console.log('----------info reclam--------------');
                console.log(send_data)
                Init.userPermission(send_data).then(function (data) {
                    if (data.data && !data.errors) {
                        if(data.data == 1){
                            $scope.pageChanged('commande');
                            $scope.pageChanged('commande-encour');
                            $scope.pageChanged('commande-deprtement');
                            $scope.showToast('', e.data.message.text , 'success');
                            //  $scope.playAudio();
                            if (e.data.message.ressource !== $scope.linknav)
                            {
                                $scope.playAudio();
                            }
                            var permission = $scope.linknav.split('/list-');
                            if(permission && permission.length > 1){
                                permission = permission[1];
                            }
                            var rewriteReq = `historiqueactions(source:"${permission}")`;
                            Init.getElement(rewriteReq, listofrequests_assoc["historiqueactions"]).then(function (data) {
                                if (data && data.length > 0) {
                                    $scope.notification_commande = data;
                                }

                            }, function (msg) {
                                toastr.error(msg);
                            });

                        }else{

                        }

                    } else {
                        // $scope.showToast('', data.errors_debug, 'error');
                    }
                }, function (msg) {
                    $scope.showToast('', msg, 'error');
                });


            }else {
                if ($scope.linknav.indexOf("list-" + e.data.type) !== -1)
                {
                    console.log('on fait un pageChanged', e.data);
                    $scope.pageChanged(e.data.type);
                }
            }

        });*/

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

    $scope.menusearchs = [
        { id: 1, "designation": "R2a", parent_id: null, icon: "fa-home-lg-alt", url: "", permission: "module-script" },
        {
            id: 2, "designation": "Backoffice", icon: "fa-database", url: "javascript:;", permission: "module-backoffice", parent_id: 1,
            parent: [
                { id: 20, "designation": "Modes de paiements", icon: "fa-credit-card", url: "list-modepaiement", permission: "liste-modepaiement" }, { id: 23, "designation": "Conditions de règlements", icon: "fa-credit-card", url: "list-conditionreglement", permission: "liste-conditionreglement" },
                { id: 21, "designation": "Devises", icon: "fa-credit-card", url: "list-devise", permission: "liste-devise" },

                { id: 7, "designation": "Dépôts", icon: "fa-archive", url: "javascript:;", permission: "module-depot", parent_id: 7, parent: [{ id: 8, "designation": "Types de dépôts", icon: "fa-text", url: "list-typedepot", permission: "liste-typedepot" }, { id: 9, "designation": "Depôts", icon: "fa-archive", url: "list-depot", permission: "liste-depot" }] },
                { id: 24, "designation": "Zones de livraisons", icon: "fa-truck", url: "list-zonedelivraison", permission: "liste-zonedelivraison" }, { id: 12, "designation": "Types de régule", icon: "fa-calendar", url: "list-typeregule", permission: "liste-typeregule" },
                { id: 21, "designation": "Astuces", icon: "fa-info-circle", url: "list-astuce", permission: "liste-astuce" }, { id: 22, "designation": "Billetage", icon: "fa-money-bill-alt", url: "list-typebillet", permission: "liste-typebillet" },
                { id: 25, "designation": "Tranches horaires", icon: "fa-clock", url: "list-tranchehoraire", permission: "liste-tranchehoraire" },
                { id: 110, "designation": "Livreurs", icon: "fa-motorcycle", url: "list-livreur", permission: "liste-livreur" },
            ]
        },
        {
            id: 111, "designation": "Points de vente", icon: "fa-store", url: "javascript:;", permission: "module-pointdevente", parent_id: 111,
            parent: [
                { id: 112, "designation": "Points de vente", icon: "fa-tag", url: "list-entite", permission: "liste-entite" }, { id: 54, "designation": "Cartes", icon: "fa-book-open", url: "list-carte", permission: "liste-carte" }
            ]
        },
        {
            id: 13, "designation": "Clients", icon: "fa-users", url: "javascript:;", permission: "module-client", parent_id: 13,
            parent: [
                { id: 14, "designation": "Types de clients", icon: "fa-text", url: "list-typeclient", permission: "liste-typeclient" }, { id: 15, "designation": "Clients", icon: "fa-user-friends", url: "list-client", permission: "liste-client" },
                { id: 16, "designation": "Suivi marketing", icon: "fa-book", url: "javascript:;", permission: "module-suivi-marketing", parent_id: 16, parent: [{ id: 17, "designation": "Alertes Marketing", icon: "fa-text", url: "list-suivimarketing", permission: "liste-suivimarketing" }, { id: 18, "designation": "Validé", icon: "fa-check", url: "list-suivimarketingvalide", permission: "liste-suivimarketingvalide" }, { id: 26, "designation": "Rejeté", icon: "fa-times", url: "list-suivimarketingnonvalide", permission: "liste-suivimarketingnonvalide" }] },
                { id: 114, "designation": "Régules clients", icon: "fa-balance-scale", url: "list-reguleclient", permission: "liste-reguleclient" },
            ]
        },
        {
            id: 27, "designation": "Tiers", icon: "fa-people-carry", url: "javascript:;", permission: "module-tier", parent_id: 27,
            parent: [
                { id: 28, "designation": "Types tiers", icon: "fa-text", url: "list-typetier", permission: "liste-typetier" }, { id: 29, "designation": "Catégories  tiers", icon: "fa-square", url: "list-categoriefournisseur", permission: "liste-fournisseur" }, { id: 30, "designation": "Tiers", icon: "fa-compress-wide", url: "list-fournisseur", permission: "liste-fournisseur" },
                { id: 113, "designation": "Régules tiers", icon: "fa-balance-scale", url: "list-regulefournisseur", permission: "liste-regulefournisseur" },
            ]
        },
        {
            id: 31, "designation": "Produits", icon: "fa-layer-group", url: "javascript:;", permission: "module-produit", parent_id: 31,
            parent: [
                { id: 19, "designation": "Types de produits", icon: "fa-text", url: "list-typeproduit", permission: "liste-typeproduit" }, { id: 33, "designation": "F/SF Produits", icon: "fa-vector-square", url: "list-famille", permission: "liste-famille" },
                { id: 10, "designation": "Départements", icon: "fa-columns", url: "list-departement", permission: "liste-departement" }, { id: 34, "designation": "Types de prix", icon: "fa-text", url: "list-typeprixdevente", permission: "liste-typeprixdevente" },
                { id: 36, "designation": "Unités de mesure", icon: "fa-thermometer-empty", url: "list-unitedemesure", permission: "liste-unitedemesure" }, { id: 11, "designation": "Zones de stockage", icon: "fa-compact-disc", url: "list-zonedestockage", permission: "liste-zonedestockage" },
                { id: 38, "designation": "Produits/Menus", icon: "fa-layer-group", url: "list-produit", permission: "list-produit" },
            ]
        },
        {
            id: 39, "designation": "Economat", icon: "fa-box-alt", url: "javascript:;", permission: "module-economat", parent_id: 39,
            parent: [
                { id: 108, "designation": "Motifs E/S", icon: "fa-tag", url: "list-motif", permission: "liste-motif" },
                { id: 40, "designation": "Bons de commande", icon: "fa-list", url: "javascript:;", permission: "module-boncommande", parent_id: 40, parent: [{ id: 41, "designation": "BC internes", icon: "fa-clipboard", url: "list-bci", permission: "list-bci" }, { id: 42, "designation": "BC Economat", icon: "fa-brackets", url: "list-bce", permission: "list-bce" }] },
                { id: 43, "designation": "Bons d'entrées", icon: "fa-file-download", url: "list-be", permission: "list-be" }, { id: 44, "designation": "Bons de transferts", icon: "fa-hexagon", url: "list-bt", permission: "list-bt" },
                { id: 45, "designation": "Entrées de stock", icon: "fa-file-download", url: "list-entreestock", permission: "list-entreestock" }, { id: 46, "designation": "Sorties de stock", icon: "fa-compact-disc", url: "list-sortiestock", permission: "list-sortiestock" },
                { id: 47, "designation": "Gestion de stocks", icon: "fa-inbox", url: "list-stockactuelproduitdepot", permission: "list-stockactuelproduitdepot" }, { id: 48, "designation": "Inventaires et valorisations", icon: "fa-file-signature", url: "list-inventaire", permission: "list-inventaire" },
                { id: 49, "designation": "Stock liquide", icon: "fa-wine-bottle", url: "list-produitliquide", permission: "liste-produitliquide" }, { id: 50, "designation": "Production PSF", icon: "fa-puzzle-piece", url: "list-decoupage", permission: "list-decoupage" },
            ]
        },
        {
            id: 51, "designation": "Restauration", icon: "fa-utensils", url: "javascript:;", permission: "module-restauration", parent_id: 51,
            parent: [
                { id: 52, "designation": "Formes Tables", icon: "fa-border-inner", url: "list-formetable", permission: "liste-formetable" }, { id: 53, "designation": "Tables", icon: "fa-table", url: "list-table", permission: "liste-table" }, { id: 115, "designation": "Proformas", icon: "fa-file-alt", url: "list-proformacommande", permission: "list-proformacommande" },
                { id: 56, "designation": "Commandes", icon: "fa-list", url: "javascript:;", permission: "list-commande", parent_id: 56, parent: [{ id: 57, "designation": "Serveurs/Caissiers", icon: "fa-clipboard", url: "list-commande", permission: "liste-commande" }, { id: 58, "designation": "Chef executif", icon: "fa-clock", url: "list-commande-encour", permission: "list-commande-encour" }, { id: 59, "designation": "C/Département", icon: "fa-clock", url: "list-commande-departement", permission: "list-commande-departement" }] },
                { id: 60, "designation": "Paiements", icon: "fa-money-bill-wave", url: "list-paiement", permission: "liste-paiement" }, { id: 61, "designation": "Clôture de caisse", icon: "fa-times-square", url: "list-cloturecaisse", permission: "liste-cloturecaisse" },
            ]
        },
        {
            id: 62, "designation": "Gestion Caisse", icon: "fa-wallet", url: "javascript:;", permission: "module-caisse", parent_id: 62,
            parent: [
                { id: 63, "designation": "Type de caisse", icon: "fa-tag", url: "list-typedecaisse", permission: "liste-typedecaisse" }, { id: 64, "designation": "Caisses", icon: "fa-cube", url: "list-caisse", permission: "liste-caisse" },
                { id: 65, "designation": "Appros Cash", icon: "fa-chart-line", url: "list-approcash", permission: "liste-approcash" }, { id: 66, "designation": "Sorties Cash", icon: "fa-chart-line-down", url: "list-sortiecash", permission: "liste-sortiecash" },
                { id: 67, "designation": "Versements banque", icon: "fa-inbox-out", url: "list-versement", permission: "liste-versement" }, { id: 68, "designation": "Clôtures de caisses", icon: "fa-times-circle", url: "list-cloturecaisse", permission: "liste-cloturecaisse" },
                { id: 69, "designation": "Flux caisses", icon: "fa-exchange-alt", url: "list-transactioncaisse", permission: "liste-transactioncaisse" },
            ]
        },
        {
            id: 70, "designation": "Dépenses", icon: "fa-file-invoice-dollar", url: "javascript:;", permission: "module-depense", parent_id: 70,
            parent: [
                { id: 71, "designation": "Catégories de dépenses", icon: "fa-square", url: "list-categoriedepense", permission: "liste-categoriedepense" }, { id: 72, "designation": "Postes de dépenses", icon: "fa-bezier-curve", url: "list-postedepense", permission: "liste-postedepense" },
                { id: 73, "designation": "Dépenses", icon: "fa-file-invoice-dollar", url: "list-depense", permission: "list-depense" }, { id: 74, "designation": "Règlements", icon: "fa-sticky-note", url: "list-reglement", permission: "liste-reglement" },
            ]
        },
        {
            id: 75, "designation": "Traiteur/ Services", icon: "fa-truck", url: "javascript:;", permission: "module-traiteur", parent_id: 75,
            parent: [
                { id: 76, "designation": "Proformas", icon: "fa-box-alt", url: "list-proforma", permission: "list-proforma" }, { id: 77, "designation": "Traiteurs", icon: "fa-clock", url: "list-traiteur", permission: "list-traiteur" },
            ]
        },
        {
            id: 78, "designation": "Matériel logistique", icon: "fa-person-dolly", url: "javascript:;", permission: "module-logistique", parent_id: 78,
            parent: [
                { id: 781, "designation": "Logistique", icon: "fa-layer-group", url: "list-logistique", permission: "liste-logistique" },
                { id: 782, "designation": "Entrées de stock", icon: "fa-file-download", url: "list-entreestocklogistique", permission: "liste-entreestocklogistique" }, { id: 783, "designation": "Sorties de stock", icon: "fa-compact-disc", url: "list-sortiestocklogistique", permission: "liste-sortiestocklogistique" },
                { id: 783, "designation": "Gestion de stocks", icon: "fa-inbox", url: "list-stockactuelproduitdepotlogistique", permission: "list-stockactuelproduitdepotlogistique" }, { id: 784, "designation": "Inventaires et valorisations", icon: "fa-file-signature", url: "list-inventairelogistique", permission: "list-inventairelogistique" },
            ]
        },
        {
            id: 80, "designation": "RH", icon: "fa-user-alt", url: "javascript:;", permission: "module-rh", parent_id: 80,
            parent: [
                { id: 81, "designation": "Types contrats", icon: "fa-file-signature", url: "list-typecontrat", permission: "liste-typecontrat" }, { id: 82, "designation": "Shifts", icon: "fa-poll-people", url: "list-brigade", permission: "liste-brigade" },
                { id: 83, "designation": "Fonctions", icon: "fa-feather", url: "list-fonction", permission: "liste-fonction" }, { id: 84, "designation": "Employés", icon: "fa-user", url: "list-employe", permission: "liste-employe" },
                { id: 85, "designation": "Faits divers", icon: "fa-calendar", url: "list-evenement", permission: "liste-evenement" }, { id: 86, "designation": "Planning", icon: "fa-calendar-alt", url: "list-planing", permission: "list-planing" },
            ]
        },
        {
            id: 87, "designation": "QHSE", icon: "fa-medal", url: "javascript:;", permission: "module-qhse", parent_id: 87,
            parent: [
                { id: 88, "designation": "Familles d'actions", icon: "fa-vector-square", url: "list-familleaction", permission: "liste-familleaction" }, { id: 89, "designation": "Zones", icon: "fa-map-marker-alt", url: "list-zone", permission: "liste-zone" },
                { id: 90, "designation": "Type opérateur", icon: "fa-text", url: "list-typeoperateur", permission: "liste-typeoperateur" }, { id: 91, "designation": "Opérateurs", icon: "fa-bezier-curve", url: "list-operateur", permission: "liste-operateur" },
                { id: 92, "designation": "Actions", icon: "fa-calendar-check", url: "list-action", permission: "liste-action" }, { id: 93, "designation": "Historiques", icon: "fa-history", url: "list-detailaction", permission: "list-detailaction" },
            ]
        },
        {
            id: 94, "designation": "Facturation", icon: "fa-file-alt", url: "javascript:;", permission: "module-facturation", parent_id: 94,
            parent: [
                { id: 95, "designation": "Factures", icon: "fa-file-invoice", url: "list-facture", permission: "list-facture" }, { id: 96, "designation": "Factures traiteur", icon: "fa-file-contract", url: "list-facturetraiteur", permission: "list-facturetraiteur" },
                { id: 97, "designation": "Paiements facture", icon: "fa-money-bill-wave", url: "list-paiementfacture", permission: "list-paiementfacture" }, { id: 98, "designation": "Recrouvrements", icon: "fa-file-prescription", url: "list-recouvrement", permission: "list-recouvrement" },
            ]
        },
        {
            id: 99, "designation": "E-market", icon: "fa-globe", url: "javascript:;", permission: "module-e-market", parent_id: 99,
            parent: [
                { id: 100, "designation": "Clients", icon: "fa-users", url: "list-clientmarket", permission: "liste-clientmarket" }, { id: 101, "designation": "Favories", icon: "fa-heart", url: "list-favorie", permission: "liste-favorie" },
                { id: 102, "designation": "Panier", icon: "fa-shopping-cart", url: "list-panier", permission: "liste-panier" }, { id: 103, "designation": "Commande market", icon: "fa-list", url: "list-commandemarket", permission: "liste-commandemarket" },
                { id: 104, "designation": "Proforma market", icon: "fa-box-alt", url: "list-proformamarket", permission: "liste-proformamarket" },
            ],
        },
        {
            id: 105, "designation": "OUTILS ADMIN", icon: "fa-user-edit", url: "javascript:;", permission: "module-outil-admin", parent_id: 105,
            parent: [
                { id: 106, "designation": "Profils & Permissions", icon: "fa-user-check", url: "list-role", permission: "liste-role" }, { id: 107, "designation": "Utilisateurs", icon: "fa-users", url: "list-user", permission: "liste-user" },
                { id: 109, "designation": "Préferences", icon: "fa-cog", url: "list-preference", permission: "liste-preference" },
            ],
        },
    ];

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

    $scope.emptyform = function (type, fromPage = false) {
        $scope.inputs = [];
        $scope.inputsbannieres = [];
        $scope.radioBtn = null;
        let dfd = $.Deferred();

        $scope.dataInTabPane['entitestransactions_general']['data'] = [];
        $scope.dataInTabPane['employes_planing']['data'] = [];

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
        if (type == 'reclamation_commande' || type == 'reclamation_produit' || type == 'commandeencour') {
            if (statut == 7) {
                id = $('#id_commande').val();
            } else
                if (statut == 4) {
                    id = $('#id_' + type).val();
                    index = indexItem;
                } else {
                    id = obj.id;
                }

            if (type == 'reclamation_produit' || type == 'commandeencour') {
                if (statut == 4 || statut == 7) {
                    if (tab && tab == true) {
                        $scope.chstat.id_secondaire = obj;
                    } else {
                        $scope.chstat.id_secondaire = obj.index;
                    }

                    if (indexItem2) {
                        $scope.chstat.id_detail_produit = indexItem2;
                    }
                }
            }
        }
        else if (obj) {
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
        preferences_client: { data: [], rules: [] },
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
        preferences_client: { data: [], rules: [] },
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
    $scope.chargerDonnees = function (type, typeCourant = "bce", value = null, etat = 1, BceId = null) {
        console.log("chargerDonnees");
        if (type) {
            if (typeCourant == "bce") {
                var dateDebut = $("#date_debut_" + typeCourant).val();
                var dateFin = $("#date_fin_" + typeCourant).val();
                console.log("dateDebut", dateDebut, "dateFin", dateFin);
                if (type == 'produit') {
                    if (dateDebut && dateFin) {
                        if (!$scope.dataInTabPane['produits_bce']['data'] || $scope.dataInTabPane['produits_bce']['data'].length < 0) {
                            $scope.dataInTabPane['produits_bce']['data'] = [];
                        }


                        var typeAvecS = type + 's';
                        rewriteReq = typeAvecS + '(date_start:"' + dateDebut + '",date_end:"' + dateFin;
                        if (BceId) {
                            rewriteReq = rewriteReq + '",etat_bci:' + etat + ',bce_id:' + BceId + ')'
                        } else {
                            rewriteReq = rewriteReq + '")'
                        }

                        var form = $('#form_add' + typeCourant);
                        form.parent().parent().blockUI_start();

                        Init.getElement(rewriteReq, listofrequests_assoc[typeAvecS]).then(function (data) {
                            form.parent().parent().blockUI_stop();
                            console.log(data)
                            $scope.dataInTabPane['produits_bce']['data'] = data;
                        }, function (msg) {
                            toastr.error(msg);
                        });
                    }
                }
            }
            else if (typeCourant == "be") {
                if (type == 'bceproduit') {
                    var bce_id = value;
                    if (!bce_id) {
                        bce_id = $('#bce_id_' + typeCourant).val();
                    }
                    if (bce_id) {
                        $scope.dataInTabPane['produits_be']['data'] = [];
                        var typeParent = 'bce';
                        var typeParentAvecS = typeParent + 's';
                        var rewriteParentReq = typeParentAvecS + '(bce_id:' + bce_id + ')';
                        var form = $('#form_add' + typeCourant);
                        form.parent().parent().blockUI_start();
                        Init.getElement(rewriteParentReq, listofrequests_assoc[typeParentAvecS]).then(function (data) {
                            if (data && data[0]) {
                                $('#fournisseur_id_' + typeCourant).val(data[0].fournisseur_id).trigger('change')
                                $('#depot_id_' + typeCourant).val(data[0].depot_id).trigger('change');

                                var filtres = 'reception:0'
                                    + (bce_id ? (',bce_id:' + bce_id + '') : "")
                                    ;
                                //console.log('Filtres add be ==>',filtres);
                                var typeAvecS = type + 's';
                                var rewriteReq = typeAvecS + '(' + filtres + ')';
                                Init.getElement(rewriteReq, listofrequests_assoc[typeAvecS]).then(function (data) {
                                    form.parent().parent().blockUI_stop();
                                    //console.log(JSON.stringify(data));
                                    $scope.dataInTabPane['produits_be']['data'] = data;
                                    /* setTimeout(function () {
                                        console.log(JSON.stringify($scope.dataInTabPane['produits_be']['data']));
                                    }, 1000); */
                                }, function (msg) {
                                    toastr.error(msg);
                                });
                            }
                        }, function (msg) {
                            toastr.error(msg);
                        });
                    }
                }
            } else if (typeCourant == "cloturecaisse") {
                var dateDebut = $("#date_debut_" + typeCourant).val();
                var caisseId = $("#caisse_id_" + typeCourant).val();
                var dateFin = $("#date_fin_" + typeCourant).val();
                if (!dateFin) {
                    dateFin = new Date().toJSON().slice(0, 16).replace(/-/g, '-');
                }
                console.log("dateDebut", dateDebut, "dateFin", dateFin);
                if (type == 'paiement') {
                    if (!caisseId) {
                        caisseId = 0;
                    }
                    if (dateDebut && dateFin) {
                        var typeAvecS = type + 's';
                        var rewriteReq = typeAvecS + '(date_start:"' + dateDebut + '",date_end:"' + dateFin + '",caisse_id:' + caisseId + ',avec_total_periode:true)'
                        var form = $('#form_add' + typeCourant);
                        form.parent().parent().blockUI_start();
                        Init.getElement(rewriteReq, listofrequests_assoc[typeAvecS]).then(function (data) {
                            form.parent().parent().blockUI_stop();
                            $scope.dataInTabPane['totaux_cloturecaisse']['data'].total_commande = 0;
                            if (data && data[0]) {
                                console.log("data commande sur cloture caisse", data[0]);
                                $scope.dataInTabPane['totaux_cloturecaisse']['data'].total_commande = data[0].total_periode;
                            }
                        }, function (msg) {
                            toastr.error(msg);
                        });
                    }
                }
                if (type == 'commande') {
                    if (dateDebut && dateFin) {
                        if (!caisseId) {
                            caisseId = 0;
                        }
                        var typeAvecS = type + 's';
                        var rewriteReq = typeAvecS + '(date_start:"' + dateDebut + '",date_end:"' + dateFin + '",caisse_id:' + caisseId + ',avec_total_periode:true)'
                        var form = $('#form_add' + typeCourant);
                        form.parent().parent().blockUI_start();
                        Init.getElement(rewriteReq, listofrequests_assoc[typeAvecS]).then(function (data) {
                            form.parent().parent().blockUI_stop();
                            $scope.dataInTabPane['totaux_cloturecaisse']['data'].total_commande = 0;
                            if (data && data[0]) {
                                console.log("data commande sur cloture caisse", data[0]);
                                $scope.dataInTabPane['totaux_cloturecaisse']['data'].total_commande = data[0].total_periode;
                            }
                        }, function (msg) {
                            toastr.error(msg);
                        });
                    }
                }
                if (type == 'depense') {
                    if (dateDebut && dateFin) {
                        if (!caisseId) {
                            caisseId = 0;
                        }
                        type = 'reglement';
                        var typeAvecS = type + 's';
                        var rewriteReq = typeAvecS + '(date_start:"' + dateDebut + '",date_end:"' + dateFin + '",caisse_id:' + caisseId + ',avec_total_periode:true)'
                        var form = $('#form_add' + typeCourant);
                        form.parent().parent().blockUI_start();
                        Init.getElement(rewriteReq, listofrequests_assoc[typeAvecS]).then(function (data) {
                            form.parent().parent().blockUI_stop();
                            $scope.dataInTabPane['totaux_cloturecaisse']['data'].total_depense = 0;
                            if (data && data[0]) {
                                console.log("data commande sur cloture caisse", data[0]);
                                $scope.dataInTabPane['totaux_cloturecaisse']['data'].total_depense = data[0].total_periode;
                            }
                        }, function (msg) {
                            toastr.error(msg);
                        });
                    }
                }
            } else if (typeCourant == "planing") {
                if (type == 'departement') {
                    var tagForm = 'employes_planing';
                    var form = $('#form_add' + typeCourant);
                    form.parent().parent().blockUI_start();
                    $.each($scope.dataPage['departements'], function (keyItem, oneItem) {
                        var employesDepartement = [];
                        $.each($scope.dataPage['employes'], function (keyItem2, oneItem2) {
                            if (oneItem.id == oneItem2.departement_id) {
                                employesDepartement.push({
                                    "departement_id": oneItem.id,
                                    "employe_id": oneItem2.id,
                                    "employe": oneItem2,
                                    "duree": 0,
                                    "jours": $scope.dataPage['jours'],
                                });
                            }
                        });
                        $scope.dataInTabPane[tagForm]['data'].push({
                            "departement_id": oneItem.id,
                            "departement": oneItem,
                            "employes": employesDepartement,
                        });
                    });
                    form.parent().parent().blockUI_stop();
                    console.log("chargerDonnees ==> Tableau formaté ==> " + JSON.stringify($scope.dataInTabPane[tagForm]['data']));
                }
            } else if (typeCourant == "facture" || typeCourant == "facturetraiteur") {
                if (type == 'commande' || type == 'proforma' || type == 'traiteur') {
                    var search_client_id = $("#search_client_id_" + typeCourant).val();
                    var search_societe_facturation_id = $("#search_societe_facturation_id_" + typeCourant).val();
                    var search_entite_id = $("#search_entite_id_" + typeCourant).val();
                    var search_mode_paiement_id = $("#search_mode_paiement_id_" + typeCourant).val();
                    var search_commande_id = $("#search_commande_id_" + typeCourant).val();
                    var search_proforma_id = $("#search_proforma_id_" + typeCourant).val();
                    var search_date_debut = $("#search_date_debut_" + typeCourant).val();
                    var search_date_fin = $("#search_date_fin_" + typeCourant).val();
                    var search_prix_min = $("#search_prix_min_" + typeCourant).val();
                    var search_prix_max = $("#search_prix_max_" + typeCourant).val();
                    var search_montant_preselection_aleatoire = $("#search_montant_preselection_aleatoire_" + typeCourant).val();
                    if ($("#search_preselection_aleatoire_" + typeCourant).prop('checked') == false) {
                        var search_montant_preselection_aleatoire = null;
                    }

                    var filtres = ''
                        + (search_client_id ? (',client_id:' + search_client_id + '') : "")
                        + (search_societe_facturation_id ? (',societe_facturation_id:' + search_societe_facturation_id + '') : "")
                        + (search_entite_id ? (',entite_id:' + search_entite_id + '') : "")
                        + (search_mode_paiement_id ? (',mode_paiement_id:' + search_mode_paiement_id + '') : "")
                        + (search_commande_id ? (',id:' + search_commande_id + '') : "")
                        + (search_proforma_id ? (',id:' + search_proforma_id + '') : "")
                        + (search_date_debut ? (',date_start:"' + search_date_debut + '"') : "")
                        + (search_date_fin ? (',date_end:"' + search_date_fin + '"') : "")
                        + (search_prix_min ? (',prix_min:' + search_prix_min + '') : "")
                        + (search_prix_max ? (',prix_max:' + search_prix_max + '') : "")
                        + (search_montant_preselection_aleatoire ? (',montant_preselection_aleatoire:' + search_montant_preselection_aleatoire + '') : "")
                        ;

                    console.log('Filtres add facture ==>', filtres);
                    if ((!filtres) || filtres == '') {
                        iziToast.error({
                            message: "Aucun filtre n'est défini",
                            position: 'topRight'
                        });
                        return false;
                    }

                    filtres = filtres + ',facture:0';

                    var tagForm = 'itemsfiltres_facture';
                    $scope.dataInTabPane[tagForm]['data'] = [];

                    var form = $('#form_add' + typeCourant);
                    form.parent().parent().blockUI_start();
                    var typeAvecS = type + 's';
                    var rewriteReq = typeAvecS + '(' + filtres + ')';
                    var form = $('#form_add' + typeCourant);
                    form.parent().parent().blockUI_start();
                    Init.getElement(rewriteReq, listofrequests_assoc[typeAvecS]).then(function (data) {
                        form.parent().parent().blockUI_stop();
                        if (data) {
                            $scope.dataInTabPane[tagForm]['data'] = data;
                            var somme = 0;
                            $.each(data, function (keyItem, oneItem) {
                                if (type == 'proforma') {
                                    somme = parseFloat(somme) + parseFloat(oneItem.forfait);
                                }
                                else {
                                    somme = parseFloat(somme) + parseFloat(oneItem.montant_total_commande);
                                }
                            });
                            $scope.dataInTabPane['totaux_facture']['data'].totalFiltre = somme;

                            /* if($scope.estEntier(search_montant_preselection_aleatoire) == true)
                            {
                                //La présélection alatoire est définie
                                var montantApresSomme = 0;
                                $.each(data, function (keyItem, oneItem) {
                                    montantApresSomme = parseFloat(montantApresSomme) + parseFloat(oneItem.montant_total_commande);
                                    if (montantApresSomme <= search_montant_preselection_aleatoire) {
                                        $scope.dataInTabPane[tagForm]['data'].push(oneItem);
                                    }
                                });
                            }
                            else
                            {
                                $scope.dataInTabPane[tagForm]['data'] = data;
                            } */
                        }
                    }, function (msg) {
                        toastr.error(msg);
                    });
                    console.log("chargerDonnees ==> Tableau formaté ==> " + JSON.stringify($scope.dataInTabPane[tagForm]['data']));
                }
            } else if (typeCourant == "action") {
                if (type == 'operateur') {
                    var famille_action_id = $("#famille_action_id_" + typeCourant).val();
                    if (famille_action_id) {
                        var typeAvecS = type + 's';
                        var rewriteReq = typeAvecS + '(famille_action_id:' + famille_action_id + ')'
                        var form = $('#form_add' + typeCourant);
                        $scope.dataInTabPane['interventions_action']['data'] = [];
                        form.parent().parent().blockUI_start();
                        Init.getElement(rewriteReq, listofrequests_assoc[typeAvecS]).then(function (data) {
                            form.parent().parent().blockUI_stop();
                            if (data) {
                                $scope.dataPage[typeAvecS] = data;
                            }
                        }, function (msg) {
                            toastr.error(msg);
                        });
                    }
                }
                if (type == 'souszone') {
                    if (value) {
                        var typeAvecS = type + 's';
                        var rewriteReq = typeAvecS + '(zone_id:' + value + ')';
                        var form = $('#form_add' + typeCourant);
                        form.parent().parent().blockUI_start();
                        Init.getElement(rewriteReq, listofrequests_assoc[typeAvecS]).then(function (data) {
                            form.parent().parent().blockUI_stop();
                            if (data) {
                                $scope.dataPage[typeAvecS] = data;
                            }
                        }, function (msg) {
                            toastr.error(msg);
                        });
                    }
                }
            }
            else if (typeCourant == "depense") {
                if (type == 'souspostedepense') {
                    //chargerDonnees_depense
                    if (value) {
                        var typeAvecS = type + 's';
                        var rewriteReq = typeAvecS + '(poste_depense_id:' + value + ')';
                        var form = $('#form_add' + typeCourant);
                        form.parent().parent().blockUI_start();
                        Init.getElement(rewriteReq, listofrequests_assoc[typeAvecS]).then(function (data) {
                            form.parent().parent().blockUI_stop();
                            if (data) {
                                console.log("data souspostedepense", data);
                                $scope.dataPage[typeAvecS] = data;
                            }
                        }, function (msg) {
                            toastr.error(msg);
                        });
                    }
                }
                else if (type == 'be') {
                    if (value) {
                        var typeAvecS = type + 's';
                        var rewriteReq = typeAvecS + '(id:' + value + ')';
                        var form = $('#form_add' + typeCourant);
                        form.parent().parent().blockUI_start();
                        Init.getElement(rewriteReq, listofrequests_assoc[typeAvecS]).then(function (data) {
                            form.parent().parent().blockUI_stop();
                            if (data && data[0]) {
                                $("#entite_id_" + typeCourant).val(data[0].depot.entite.id).trigger('change');
                                $("#fournisseur_id_" + typeCourant).val(data[0].fournisseur_id).trigger('change');
                                $("#date_echeance_" + typeCourant).val(data[0].date_echeance_court);
                                $("#motif_" + typeCourant).val("Dépense pour le BE (code:" + data[0].code + ")");
                                $scope.dataInTabPane['totaux_depense']['data'].total_be = data[0].total;
                            }
                        }, function (msg) {
                            toastr.error(msg);
                        });
                    }
                }
            }
            else if (typeCourant == "produit") {
                if (type == 'emballage') {
                    if (value) {
                        var typeAvecS = type + 's';
                        var rewriteReq = typeAvecS + '(id:' + value + ')';
                        var form = $('#form_add' + typeCourant);
                        form.parent().parent().blockUI_start();
                        Init.getElement(rewriteReq, listofrequests_assoc[typeAvecS]).then(function (data) {
                            form.parent().parent().blockUI_stop();
                            if (data && data[0]) {

                                $("#prix_emballage_decoupage_" + typeCourant).val(data[0].prix);
                            }
                        }, function (msg) {
                            toastr.error(msg);
                        });
                    }
                }
            }
        }
    };


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

    $scope.testSiUnElementEstDansTableau = function (type, tableau, idElement, idElement2 = null) {
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
                else if (type == "commande") {
                    if (oneItem.produit_id == idElement) {
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
                else if (entity == "commande" || entity == "proforma" || entity == "bci" || entity == "bce") {
                    contentToPush = { id: valueItem.id, text: valueItem.code };
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


    //Fonction pour déclencher des actions de select2
    $scope.cpt = 1;
    function OnChangeSelect2(e) {
        console.log("OnChangeSelect2 / Moi cest la fonctoin select2 event");
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
            //   console.log('La value de selectOFF', getId, getValue,$scope.cpt);

            getValue = null;
        }

        if (getId == 'client_id_proforma') {
            type = 'client';
            info = false;
        }
        if (getId == 'famille_bci_produit') {
            $scope.famille_bci_produit = getValue;
        }
        if (getId.indexOf('typeclient_client') !== -1) {
            type = 'typeclient'
        }
        if (getId == 'traiteur_entreestock') {
            //get traiteur by id
            if (getValue) {
                $scope.chargerLogistiqueTraiteur(getValue, 'entreestock', 'produits_entreestock');
            }
        }
        if (getId == 'traiteur_sortiestock') {
            //get traiteur by id
            if (getValue) {
                $scope.chargerLogistiqueTraiteur(getValue, 'sortiestock', 'produits_sortiestock');
            }
        }

        if (getId.indexOf('departement_rh') !== -1) {
            $scope.departement_rh = getValue;
            $("#tarif_rhs_proforma").val(null);
        }
        if (getId.indexOf('produit') !== -1) {
            type = 'produit';

            if (getId.indexOf('typeproduit_produit') !== -1) {
                type = 'typeproduit';
                if (getValue) {
                    $scope.updateCheckProduit(getValue);
                }
            }
            if (getId.indexOf('produit_commande') !== -1) {
                info = false;
            }
            if (getId.indexOf('bce_produits') !== -1) {
                info = false;
                getId = 'produits_bce';
            }
            if (getId.indexOf('produit_compose') !== -1) {
                getId = getId.split('produit_compose')[1];
            }
            if (getId.indexOf('produit_produits_carte') !== -1) {
                getId = "_produits_carte";
            }

            if (getId.indexOf('option_materiel') !== -1) {
                info = false;
                type = 'logistique';
            }

        }
        //depot_inventaire
        if (getId == 'produitold_produits_inventaire' || getId == 'depot_inventaire' || getId == 'produitproduits_production' || getId == 'produitproduits_decoupage') {

            if (getId == 'produitold_produits_inventaire' || getId == 'produitproduits_production' || getId == 'produitproduits_decoupage') {
                info = true;
                var req = '';
                type = 'produit';
                var depot_ip = null;
                var produit_id = null;

                req = 'depot_id';
                if (getId == 'produitold_produits_inventaire') {
                    depot_ip = $("#depot_inventaire").val();
                }
                else if (getId == 'produitproduits_production') {
                    depot_ip = $("#depot_production").val();
                }
                else if (getId == 'produitproduits_decoupage') {
                    depot_ip = $("#depot_decoupage").val();
                }
                else if (getId == 'produitold_produits_inventairelogistique') {
                    depot_ip = $("#depot_inventairelogistique").val();
                }
                if (depot_ip) {
                    if (!$scope.abscebce_theorique) {
                        filters += `${req}:${depot_ip},`;
                    }

                    if (getId == 'produitold_produits_inventaire') {
                        form = 'inventaire';
                    }
                    else if (getId == 'produitproduits_production') {
                        form = 'production';
                    }
                    else if (getId == 'produitproduits_decoupage') {
                        form = 'decoupage';
                    }
                    else if (getId == 'produitold_produits_inventairelogistique') {
                        form = 'inventairelogistique';
                    }

                } else {
                    if (getValue) {
                        $scope.showToast('', "Veuillez choisir un depot d'abord", 'error');
                        type = '';
                    }
                }
            } else {
                if (getValue) {
                    if ($scope.dataInTabPane['produits_inventaire']['data'] && $scope.dataInTabPane['produits_inventaire']['data'].length > 0) {
                        iziToast.question({
                            timeout: 0,
                            close: false,
                            overlay: true,
                            displayMode: 'once',
                            id: 'question',
                            zindex: 999,
                            title: '',
                            message: 'Il existe des éléments dans le tableau d\'inventaire, si vous changer de dépôt, il sera vidé. Voulez-vous?',
                            position: 'center',
                            buttons: [
                                ['<button class="font-bold btn btn-success" style="color: green!important">Confirmer</button>', function (instance, toast) {

                                    instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
                                    $scope.emptyform('inventaire');
                                    setTimeout(function () {
                                        $("#depot_inventaire").val(depot_id).change();
                                    }, 200);
                                    setTimeout(function () {
                                        $scope.dataInTabPane['produits_inventaire']['data'] = [];
                                    }, 300);

                                    $("#produit_produits_inventaire").val('').trigger('change');
                                    $(".unite-mesure").val(null);
                                    $(".quantite-theorique").val(null);
                                    $("#quantite_reel_produits_inventaire").val(null);
                                    $scope.quantite_reel_produits_inventaire = null;


                                }, true],
                                ['<button class="btn btn-danger" style="color: red!important">Annuler</button>', function (instance, toast) {
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
                    }
                    else if ($scope.dataInTabPane['produits_inventairelogistique']['data'] && $scope.dataInTabPane['produits_inventairelogistique']['data'].length > 0) {
                        iziToast.question({
                            timeout: 0,
                            close: false,
                            overlay: true,
                            displayMode: 'once',
                            id: 'question',
                            zindex: 999,
                            title: '',
                            message: 'Il existe des éléments dans le tableau d\'inventaire logistique, si vous changer de dépôt, il sera vidé. Voulez-vous?',
                            position: 'center',
                            buttons: [
                                ['<button class="font-bold btn btn-success" style="color: green!important">Confirmer</button>', function (instance, toast) {

                                    instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
                                    $scope.emptyform('inventairelogistique');
                                    setTimeout(function () {
                                        $("#depot_inventairelogistique").val(depot_id).change();
                                    }, 200);
                                    setTimeout(function () {
                                        $scope.dataInTabPane['produits_inventairelogistique']['data'] = [];
                                    }, 300);

                                    $("#produit_produits_inventairelogistique").val('').trigger('change');
                                    $(".unite-mesure").val(null);
                                    $(".quantite-theorique").val(null);
                                    $("#quantite_reel_produits_inventairelogistique").val(null);
                                    $scope.quantite_reel_produits_inventairelogistique = null;


                                }, true],
                                ['<button class="btn btn-danger" style="color: red!important">Annuler</button>', function (instance, toast) {
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
                    }
                    else {
                        $("#produit_produits_inventaire").val('').change();
                        $("#produit_produits_inventairelogistique").val('').change();
                        $(".unite-mesure").val(null);
                        $(".quantite-theorique").val(null);
                        $("#quantite_reel_produits_inventairelogistique").val(null);
                        $("#quantite_reel_produits_inventaire").val(null);
                        $scope.quantite_reel_produits_inventaire = 0;
                        $scope.quantite_reel_produits_inventairelogistique = 0;

                    }
                }



                if (produit_id) {
                    type = null;
                } else {
                    if (getValue) {
                        type = null;
                    }
                }
            }
        }
        if (getId.indexOf('depot_id_be') !== -1) {
            if (getValue != undefined && getValue != "" && getValue != null) {
                var item_id = $(this).val();
                console.log('item_id = ', item_id);
                if (item_id) {
                    var typeAvecS = 'depots';
                    rewriteReq = typeAvecS + '(id:' + item_id + ')';
                    Init.getElement(rewriteReq, listofrequests_assoc[typeAvecS]).then(function (data) {
                        $scope.depotSelected = data[0];
                        $scope.chargerDonnees('bceproduitentite', 'be');
                    }, function (msg) {
                        $scope.showToast('', msg, 'error');
                    });
                }
            }
        }
        if (getId == "entite_commande" || getId == "entite_reservation") {
            type = 'table';

            filters = `entite_id:${getValue},count:10,page:1`;
            $scope.restaurant_commande = getId == "entite_commande" ? getValue : null;
            $scope.entite_reservation = getId == "entite_reservation" ? getValue : null;
            $("#restaurant_commande").val($scope.restaurant_commande).trigger('change');
            pagination = true;
            if (getId == "entite_commande") {
                $("#entite_reservation").val(null);
            }
        }
        else if (getId == 'famille_menu_propositioncommerciale') {
            type = 'famille';
            info = false;
        } else if (getId == 'famille_menu') {
            $scope.famille_carte_clicked = getValue;
            type = 'famille';
            info = false;
        }
        else if (getId == 'famille_option_menu') {
            $scope.famille_carte_clicked = getValue;
            type = 'produit';
            info = false;
            filters = `famille_id:${getValue},`;
            filters += 'page:' + $scope.paginations[type].currentPage + ',count:' + $scope.paginations[type].entryLimit + ',';
            pagination = true;
        }
        else if (getId == 'reservation_commande') {
            if (getValue) {
                type = 'reservation';
                info = false;
                filters = `id:${getValue},`;
                $(".client-passage").fadeOut('slow');
                $scope.client = null;
                $scope.client_passage = null;
            }

        }
        else if (getId == 'client_id_commande') {
            type = 'client';
            info = false;

            if (getValue && getValue > -1) {
                $("#client_pasage_commande").prop("checked", null);
            }

        }
        else if (getId == 'r2acomm_proforma') {
            type = 'produit';
            info = false;
            //rewriteReq = `${type}s(id:${getValue})`;
        }
        else if (getId == 'modepaiement_paiement') {
            console.log('---------Voici le mode paiement');
            console.log(getValue)
            type = "modepaiement";
            infos = false;
            // rewriteReq = `${type}s(id:${getValue})`;
            if (getValue != undefined && getValue != "" && getValue != null) {
                $scope.elementsSuiviBanque("paiement", getValue);
            }
        }
        else if (getId == 'mode_paiement_id_reglement') {
            if (getValue != undefined && getValue != "" && getValue != null) {
                $scope.elementsSuiviBanque("reglement", getValue);
            }
        }
        else if (getId == 'mode_paiement_id_paiementbc') {
            if (getValue != undefined && getValue != "" && getValue != null) {
                $scope.elementsSuiviBanque("paiementbc", getValue);
            }
        }
        else if (getId == 'mode_paiement_id_paiementfacture') {
            if (getValue != undefined && getValue != "" && getValue != null) {
                $scope.elementsSuiviBanque("paiementfacture", getValue);
            }
        }
        if (getId.indexOf('produit_carte_commande') !== -1) {

            var entite_id = $scope.restaurant_commande;
            if (!$scope.restaurant_commande) {
                $scope.restaurant_commande = $('#entite_commande').val();
            }
            type = 'produit';
            info = false;
            filters = `id:${getValue},entite_id:${entite_id},`;
            filters += "is_carte:true,";
            filters += 'page:' + $scope.paginations[type].currentPage + ',count:' + $scope.paginations[type].entryLimit + ',';
            pagination = true;

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
        else if (getId.indexOf('fournisseur_') !== -1 && (getId.indexOf('_ordreachat') !== -1 || getId.indexOf('_boncommande') !== -1)) {
            itemSelect = getId.split("_")[0];
            tagform = getId.substr((itemSelect.length + 1), getId.length);

            if ($('#id_' + tagform).length > 0 && !$('#id_' + tagform).val()) {
                rewriteReq = `${itemSelect}s(id:${getValue})`;
                Init.getElement(rewriteReq, listofrequests_assoc[`${itemSelect}s`]).then(function (data) {
                    console.log('for fournisseur***************', tagform, (data && data.length > 0 && data[0].devise_id), !$('#id_' + tagform).val());
                    $("#devise_" + tagform).val("").change();
                    if ((data && data.length > 0 && data[0].devise_id) && !$('#id_' + tagform).val()) {
                        $("#devise_" + tagform).val(data[0].devise_id).change();
                        console.log('là on peut mettre à jour, you know');
                    }
                }, function (msg) {
                    toastr.error(msg);
                });
            }

            //$scope.showdefaultseletedObject($(this).val(),'fournisseur','ordreachat');
        }
        else if (getId == 'bce_id_be') {
            if (getValue != undefined && getValue != "" && getValue != null) {
                $scope.chargerDonnees('bceproduit', 'be', getValue);
                /*
                var afr2arOuCacher = 1; //0 = on cache / 1 = on afr2a
                $scope.dataInTabPane['produits_be']['data'] = [];
                if (getValue != undefined && getValue != "" && getValue != null) {
                    afr2arOuCacher = 0;
                    $scope.chargerDonnees('bceproduitentite', 'be', getValue);
                }
                else
                {

                }
                console.log("afr2arOuCacher", afr2arOuCacher);
                */
            }
        }
        else if (getId.indexOf('produit_be') !== -1) {
            console.log("produit_be ==> YES");
            //Récupérer les infos du produit
            var fournisseur_id = $("#fournisseur_id_be").val();
            var filtres = "fournisseur_id:" + fournisseur_id;
            $scope.donneInfosProduit("be", filtres);
        }
        else if (getId.indexOf('tranche_horaire_id_cloturecaisse') !== -1) {
            if (getValue != undefined && getValue != "" && getValue != null) {
                $scope.donneDateParTrancheHoraire(getValue, 'cloturecaisse', 'date_debut_fin');
            }
        }
        else if (getId == 'caisse_id_cloturecaisse') {
            if (getValue != undefined && getValue != "" && getValue != null) {
                $scope.chargerDonnees('commande', 'cloturecaisse');
                $scope.chargerDonnees('depense', 'cloturecaisse');
            }
        }
        else if (getId.indexOf('depense_id_reglement') !== -1) {
            if (getValue != undefined && getValue != "" && getValue != null) {
                $scope.getItemWithGraphQl('depense', 'id:' + getValue);
            }
        }
        else if (getId.indexOf('famille_action_id_action') !== -1) {
            if (getValue != undefined && getValue != "" && getValue != null) {
                $scope.chargerDonnees('operateur', 'action');
            }
        }
        else if (getId == 'poste_depense_id_depense') {
            if (getValue != undefined && getValue != "" && getValue != null) {
                $scope.chargerDonnees('souspostedepense', 'depense', getValue);
            }
        }
        else if (getId.indexOf('be_id_depense') !== -1) {
            if (getValue != undefined && getValue != "" && getValue != null) {
                $scope.updateCheck('be_id_depense', 'hide-totalbe-depense', 'select', getValue, 'show-totalbe-depense');
                $scope.chargerDonnees('be', 'depense', getValue);
            }
            else {
                $scope.updateCheck('be_id_depense', 'hide-totalbe-depense', 'select', 0, 'show-totalbe-depense');
            }
        }
        else if (getId == 'fournisseur_bci') {
            if (getValue != undefined && getValue != "" && getValue != null) {
                $scope.choisirFournisseurDevise('bci');
            }
        }
        else if (getId == 'fournisseur_bce') {
            if (getValue != undefined && getValue != "" && getValue != null) {
                $scope.choisirFournisseurDevise('bce');
            }
        }
        else if (getId == 'produit_produits_inventaire') {
            if (getValue != undefined && getValue != "" && getValue != null) {
                $scope.SetQteTheorique();
            }
        }
        else if (getId == 'produit_produits_inventairelogistique') {
            if (getValue != undefined && getValue != "" && getValue != null) {
                $scope.SetQteTheorique('inventairelogistique');
            }
        }
        else if (getId == 'zonedestockage_produits_inventaire' || getId == 'famille_produits_inventaire' || getId == 'departement_produits_inventaire') {
            if (getValue != undefined && getValue != "" && getValue != null) {
                $scope.pageChanged('produit');
            }
        }

        else if (getId == 'zonedestockage_produits_inventairelogistique' || getId == 'famille_produits_inventairelogistique' || getId == 'departement_produits_inventairelogistique') {
            if (getValue != undefined && getValue != "" && getValue != null) {
                $scope.pageChanged('produit');
            }
        }
        else if (getId == 'depot_production') {
            if (getValue != undefined && getValue != "" && getValue != null) {
                $scope.SetQteTheorique('production', null, getValue);
            }
        }
        else if (getId == 'produit_produits_production') {
            if (getValue != undefined && getValue != "" && getValue != null) {
                $scope.selectionnerDepot('production', getValue, 'depot_id_produits');
            }
        }
        else if (getId == 'depot_decoupage') {
            if (getValue != undefined && getValue != "" && getValue != null) {
                $scope.SetQteTheorique('decoupage', null, getValue);
            }
        }
        else if (getId == 'produit_produits_decoupage') {
            if (getValue != undefined && getValue != "" && getValue != null) {
                $scope.selectionnerDepot('decoupage', getValue, 'depot_id_produits');
            }
        }
        else if (getId == 'embalage_decoupage_produit') {
            if (getValue != undefined && getValue != "" && getValue != null) {
                $scope.chargerDonnees('emballage', 'produit', getValue);
            }
        }
        else if (getId == 'produit_id_production') {
            if (getValue != undefined && getValue != "" && getValue != null) {
                $scope.selectionnerDepot('production', getValue, 'depot_id');
            }
        }
        else if (getId == 'produit_id_decoupage') {
            if (getValue != undefined && getValue != "" && getValue != null) {
                $scope.selectionnerDepot('decoupage', getValue, 'depot_id');
            }
        }
        else if (getId == 'zone_id_action') {
            if (getValue != undefined && getValue != "" && getValue != null) {
                $scope.chargerDonnees('souszone', 'action', getValue);
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

            //$('.select2-'+type).each(function (key, value) {
            $('.select2').each(function (key, value) {


                var types = [{ "type": type }];

                console.log('apel type in reInit');

                if (type == 'stockactuelproduitdepotlogistique') {
                    types.push({ "type": "stockactuelproduitdepot" });
                }
                if (type == 'entreestocklogistique') {
                    types.push({ "type": "entreestock" });
                }
                if (type == 'sortiestocklogistique') {
                    types.push({ "type": "sortiestock" });
                }
                if (type == 'commande-generale') {
                    types.push({ "type": "commande" });
                    types.push({ "type": "suivicommande" });
                }
                if (type == 'proforma') {
                    types.push({ "type": "propositioncommerciale" });
                    types.push({ "type": "option_materiel" });
                    types.push({ "type": "rhs_proforma" });
                    types.push({ "type": "logistique_proforma" });
                    types.push({ "type": "r2atechniques_proforma" });
                    types.push({ "type": "client" });
                }
                if (type == 'traiteur') {
                    types.push({ "type": "proforma" });
                    types.push({ "type": "propositioncommerciale" });
                    types.push({ "type": "option_materiel" });
                    types.push({ "type": "rhs_proforma" });
                    types.push({ "type": "rh" });
                    types.push({ "type": "logistique_proforma" });
                    types.push({ "type": "r2atechniques_proforma" });
                    types.push({ "type": "client" });
                    types.push({ "type": "depense" });
                }
                if (type == 'departement') {
                    types.push({ "type": "sousdepartement" });
                }
                if (type == 'transactioncaisse') {
                    types.push({ "type": "approcash" });
                }
                if (type == 'commande' || type == 'commande-generale') {
                    types.push({ "type": "facture" });
                }
                if (type == 'facture' || type == 'facturetraiteur') {
                    types.push({ "type": "paiementfacture" });
                }
                if (type == 'bce') {
                    types.push({ "type": "paiementbc" });
                }
                if (type == 'categorieproduit') {
                    types.push({ "type": "souscategorieproduit" });
                }
                if (type == 'famille') {
                    types.push({ "type": "sousfamille" });
                }
                if (type.indexOf('produit') !== -1) {
                    types.push({ "type": "menu" });
                    types.push({ "type": "produit" });
                }
                if (type == 'produitliquide') {
                    types.push({ "type": "produit" });
                }
                if (type.indexOf('client') !== -1) {
                    types.push({ "type": "tagclient" });
                    types.push({ "type": "lignecredit" });
                    types.push({ "type": "dateclemotif" });
                }
                if (type.indexOf('cloturecaisse') !== -1) {
                    types.push({ "type": "validationcloturecaisse" });
                }
                if (type == 'action') {
                    types.push({ "type": "depense" });
                }
                if (type == 'bce') {
                    types.push({ "type": "produits" });
                }
                if (type == 'stock') {
                    types.push({ "type": "produit" });
                }
                if (type.indexOf('produit-recette') !== -1) {
                    types.push({ "type": "carte" });
                    types.push({ "type": "menu" });
                }
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
    $scope.genres = [{ "id": "Homme", "libelle": "Homme" }, { "id": "Femme", "libelle": "Femme" }];
    $scope.civilites = [{ "id": "Mr", "libelle": "Mr" }, { "id": "Mme", "libelle": "Mme" }, {
        "id": "Mlle",
        "libelle": "Mlle"
    }, { "id": "Société", "libelle": "Société" }];
    $scope.users = [];
    $scope.roles = [];
    $scope.permissions = [];
    $scope.scripts = [];

    $scope.produits = [];
    //
    //Contient la date d'aujourd'hui
    $scope.dateToday = new Date().toJSON().slice(0, 10).replace(/-/g, '-');

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

        if (filtres) {
            rewriteType = rewriteType + '(' + filtres + ')';
        }

        Init.getElement(rewriteType, rewriteattr, listeattributs_filter).then(function (data) {
            $scope.dataPage[type] = data;
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

            //filters += ",logistique:"+true;
            console.log('ici dans la page ', $scope.pour_logistique)
            if (currentpageReal == "suivimarketingvalide" || currentpageReal == "suivimarketingnonvalide") {
                typeFilter = currentpageReal;
            }
            if (currentpageReal == "commande-encour" || currentpage == 'commande-departement' || currentpage == 'commande-generale') {
                typeFilter = currentpageReal;
            }
            var filters = $scope.generateAddFiltres(typeFilter);
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
        else if (tagForm == 'famille_carte') {
            rewriteReq = 'famillespaginated(is_carte:true,entite_id:' + $scope.restaurant_commande + 'page:' + $scope.paginations['famille'].currentPage + ',count:' + $scope.paginations['famille'].entryLimit + ')';
            var type = "famille";
            Init.getElementPaginated(rewriteReq, listofrequests_assoc[type + 's']).
                then(function (data) {
                    if (data) {
                        $scope.paginations[type].currentPage = data.metadata.current_page;
                        $scope.paginations[type].totalItems = data.metadata.total;
                        $scope.dataPage[type + "s"] = data.data;
                        if ($scope.dataPage[type + "s"].length > 0) {
                            var famille = $scope.dataPage[type + "s"][0];
                            $scope.getModelsByQueries('commande', famille.id, 'produit');
                        }

                    }

                }, function (msg) {
                    // form.parent().parent().blockUI_stop();
                    toastr.error(msg);
                });
        }
        else if (tagForm == 'produit_carte') {
            if ($scope.famille_carte_clicked) {
                $scope.getModelsByQueries('commande', $scope.famille_carte_clicked, 'produit');
            }
        }
        // else if(tagForm == 'table_commande'){
        //     getValue            =$scope.restaurant_commande;
        //     type                = 'table';
        //     filters             = `entite_id:${getValue},occupation:false,`;
        //     pagination          = true;
        //     filters += 'page:' + $scope.paginations[currentpage].currentPage + ',count:' + $scope.paginations[currentpage].entryLimit;
        //     if (getValue && type && type !== '') {
        //         rewriteelement = rewriteelement + `${type}s`;
        //         if(pagination == true)
        //         {
        //             rewriteelement = rewriteelement + `paginated`;
        //         }
        //         rewriteelement = rewriteelement + `(${filters})`;
        //         $scope.manageAfterSelect2(type, getValue, info, tagForm, null, null, rewriteelement, pagination, form);
        //     }
        //
        // }
        else if (tagForm == 'menu_carte') {
            $scope.dataPage['option_menus_commande'] = [];
            var type = "menu";
            $scope.option = null;
            rewriteReq = type + 'spaginated(entite_id:' + $scope.restaurant_commande + ',activer:true' + ',page:' + $scope.paginations[type].currentPage + ',count:' + $scope.paginations[type].entryLimit + ')';
            $('#modal_add' + 'commande').blockUI_start();
            Init.getElementPaginated(rewriteReq, listofrequests_assoc[type + "s"]).then(function (data) {
                $('#modal_add' + 'commande').blockUI_stop();
                if (data) {
                    $scope.paginations[type].currentPage = data.metadata.current_page;
                    $scope.paginations[type].totalItems = data.metadata.total;
                    $scope.dataPage[type + "s"] = data.data;
                }
            }, function (msg) {
                $('#modal_add' + 'commande').blockUI_stop();
                toastr.error(msg);
            });
        }
        else if (tagForm == 'produit_param_carte') {
            if ($scope.famille_carte_clicked) {
                var queries = 'famille_id:' + $scope.famille_carte_clicked;
                $scope.getModelsByQueries('famille', $scope.famille_carte_clicked, 'produit', queries);
            }
        }
        else if (tagForm == 'produit_menu_traiteur') {
            if ($scope.famille_carte_clicked) {
                var queries = 'famille_id:' + $scope.famille_carte_clicked;
                $scope.getModelsByQueries('famille', $scope.famille_carte_clicked, 'produit', queries);
            }
        }
        else if (tagForm == 'table_reservation' || tagForm == 'table_commande') {
            var query = currentpage;
            if ($scope.restaurant_commande) {
                queries = 'entite_id: ' + $scope.restaurant_commande;
            }
            if ($scope.entite_reservation) {
                queries = 'entite_id: ' + $scope.entite_reservation;
            }

            rewriteReq = query + "spaginated" + '(' + queries + ',page:' + $scope.paginations[query].currentPage + ',count:' + $scope.paginations[query].entryLimit + ')';
            //var rewriteReq = "tablespaginated(entite_id:" + entite.id + "page:1,count:4,occupation:false)";
            $scope.getElementPaginatedUse('table', rewriteReq);
        }
    }


    $scope.cacheFilters = {};
    $canWrite = true;
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
        $scope.currentTemplateUrl = current.params.namepage ? current.params.namepage : "script";
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
            "commentairecommandes": [],
            "typecommentaires": [],
            "commandegenerales": [],
            "accompagementcommandeproduits": [],
            "option_cartes": [],
            "rappels": [],
            "commentaires": [],
            "productions": [],
            "decoupages": [],
            "clientmarkets": [],
            "reservations": [],
            "moyenreservations": [],
            "option_menus_commande": [],
            "inventaires": [],
            "suivimarketingvalides": [],
            "suivimarketingnonvalides": [],
            "typelignedecredits": [],
            "lignecredits": [],
            "suivimarketings": [],
            "commande_departements": [],
            "categoriefournisseurs": [],
            "typetiers": [],
            "historiqueactions": [],
            "stockactuelproduitdepots": [],
            "traiteurs": [],
            "proformas": [],
            "commandeproduitencour": [],
            "commande_encours": [],
            "paiements": [],
            "logistiques": [],
            "adresse_livraison": [],
            "famille_menus": [],
            "menus": [],
            "bes": [],
            "bts": [],
            "tranchehoraires": [],
            "formetables": [],
            "bces": [],
            "bcis": [],
            "activites": [],
            "societefacturations": [],
            "entites": [],
            "typeevenements": [],
            "typefaitdivers": [],
            "detailfactures": [],
            "evenements": [],
            "reglements": [],
            "suivibanques": [],
            "paiementfactures": [],
            "paiementbcs": [],
            "recouvrements": [],
            "modepaiements": [],
            "typebillets": [],
            "detailactions": [],
            "categoriedepenses": [],
            "postedepenses": [],
            "depenses": [],
            "typedecaisses": [],
            "banques": [],
            "astuces": [],
            "allergenes": [],
            "parts": [],
            "suivis": [],
            "allergeneproduits": [],
            "emballageproduits": [],
            "famillemateriels": [],
            "preferences": [],
            "proformacommandes": [],
            "regulefournisseurs": [],
            "reguleclients": [],
            "motifs": [],
            "typeregules": [],
            "approcashs": [],
            "sortiecashs": [],
            "transactioncaisses": [],
            "cloturecaisses": [],
            "versements": [],
            "frequenceqhses": [],

            "brigades": [],
            "planing": [],
            "fonctions": [],
            "zones": [],
            "employes": [],
            "familleactions": [],
            "operateurs": [],
            "entreestocks": [],
            "sortiestocks": [],

            "typeprixdeventes": [],
            "nomenclatures": [],
            "typecommandes": [],
            "tables": [],
            "unitedemesures": [],
            "zonedestockages": [],
            "typedeconservations": [],
            "produits": [],
            "conditionreglements": [],
            "zonedelivraisons": [],
            "typeoperateurs": [],
            "typecontrats": [],
            "factures": [],
            "facturetraiteurs": [],
            "jours": [],
            "typedepots": [],
            "depots": [],
            "pointventes": [],
            "cartes": [],
            "detailcartes": [],
            "devises": [],
            "unitemesures": [],
            "marques": [],
            "ordreachats": [],
            "boncommandes": [],
            "receptions": [],
            "detailreceptions": [],
            "assemblages": [],
            "detailassemblages": [],
            "detaildetailassemblages": [],
            "motifs": [],
            "typeclients": [],
            "categorieclients": [],
            "clients": [],
            "tags": [],
            "tagclients": [],
            "adresses": [],
            "contacts": [],
            "dateclemotifs": [],
            "typeproduits": [],
            "categorieproduits": [],
            "souscategorieproduits": [],
            "familles": [],
            "sousfamilles": [],
            "departements": [],
            "sousdepartements": [],
            "souszones": [],
            "sousdepots": [],
            "souspostedepenses": [],
            "propositionr2atechniques": [],
            "categoriedecaissements": [],
            "typedecaissements": [],
            "decaissements": [],
            "caisses": [],
            "typefournisseurs": [],
            "fournisseurs": [],
            "livreurs": [],
            "pays": [],
            "familleproduits": [],
            "sousfamilleproduits": [],
            "categoriecommandes": [],
            "commandes": [],
            "prixventes": [],
            "permissions": [],
            "roles": [],
            "users": [],
            "actions": [],
            "beproduits": [],
            "bceproduits": [],
            "bciproduits": [],
            "entresortiestockproduits": [],
            "caisseparents": [],

            "typeemballages": [],
            "emballages": [],
            "fonddecaisses": [],
            "motifdeprimes": [],
            "contrats": [],
            "r2adepaies": [],
            "inventairelogistiques": [],
            "listeenvies": [],
            "vusrecemments": [],

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
            "inventairelogistique": myobject,

            "commentaire_commande": myobject,
            "typecommentaire": myobject,
            "commandegenerale": myobject,
            "commande_encours": myobject,
            "rappel": myobject,
            "commentaire": myobject,
            "production": myobject,
            "decoupage": myobject,
            "clientmarket": myobject,
            "fonddecaisse": myobject,
            "contrat": myobject,
            "r2adepaie": myobject,
            "motifdeprime": myobject,
            "devise": myobject,
            "typeemballage": myobject,
            "emballage": myobject,
            "clientmarket": myobject,
            "reservation": myobject,
            "moyenreservation": myobject,
            "assemblage": myobject,
            "inventaire": myobject,
            "suivimarketingvalide": myobject,
            "typelignedecredit": myobject,
            "lignecredit": myobject,
            "suivimarketing": myobject,
            "commande_departement": myobject,
            "categoriefournisseur": myobject,
            "typetier": myobject,
            "historiqueactions": myobject,
            "stockactuelproduitdepot": myobject,
            "traiteur": myobject,
            "proforma": myobject,
            "commandeproduits": myobject,
            "commande_encour": myobject,
            "paiement": myobject,
            "logistique": myobject,
            "adresse_livraison": myobject
            , "commande": myobject,
            "carte": myobject,
            "menu": myobject,
            "categoriefournisseurs": myobject,
            "typetiers": myobject
            , "bt": myobject,
            "be": myobject,
            "bce": myobject,
            "bci": myobject,
            "activite": myobject,
            "societefacturation": myobject,
            "entite": myobject,
            "typeevenement": myobject,
            "typefaitdiver": myobject,
            "detailfacture": myobject,
            "evenement": myobject,
            "reglement": myobject,
            "paiementfacture": myobject,
            "paiementbc": myobject,
            "recouvrement": myobject,
            "modepaiement": myobject,
            "typebillet": myobject,
            "detailaction": myobject,
            "categoriedepense": myobject,
            "postedepense": myobject,
            "depense": myobject,
            "typedecaisse": myobject,
            "approcash": myobject,
            "sortiecash": myobject,
            "transactioncaisse": myobject,
            "cloturecaisse": myobject,
            "versement": myobject,
            "caisse": myobject,
            "frequenceqhse": myobject,
            "brigade": myobject,
            "planing": myobject,
            "fonction": myobject,
            "zone": myobject,
            "employe": myobject,
            "familleaction": myobject,
            "operateur": myobject,
            "action": myobject,
            "entreestock": myobject,
            "sortiestock": myobject,
            "typeprixdevente": myobject,
            "nomenclature": myobject,
            "typecommande": myobject,
            "table": myobject,
            "tranchehoraire": myobject,
            "formetable": myobject,
            "unitedemesure": myobject,
            "zonedestockage": myobject,
            "typedeconservation": myobject,
            "produit": myobject,
            "propositionr2atechnique": myobject,
            "conditionreglement": myobject,
            "zonedelivraison": myobject,
            "typeoperateur": myobject,
            "typecontrat": myobject,
            "facture": myobject,
            "facturetraiteur": myobject,
            "jour": myobject,
            "typedepot": myobject,
            "typefournisseur": myobject,
            "fournisseur": myobject,
            "depot": myobject,

            "banque": myobject,
            "astuce": myobject,
            "suivi": myobject,
            "suivibanque": myobject,
            "allergene": myobject,
            "part": myobject,
            "allergeneproduit": myobject,
            "emballageproduit": myobject,
            "famillemateriel": myobject,
            "preference": myobject,
            "proformacommande": myobject,
            "regulefournisseur": myobject,
            "reguleclient": myobject,
            "motif": myobject,
            "typeregule": myobject,
            "unitemesure": myobject,
            "prixvente": myobject,
            "prixachat": myobject,
            "prixproduit": myobject,

            "typeclient": myobject,
            "categorieclient": myobject,
            "client": myobject,
            "tag": myobject,
            "tagclient": myobject,
            "adresse": myobject,
            "contact": myobject,
            "dateclemotif": myobject,
            "typeproduit": myobject,
            "categorieproduit": myobject,
            "souscategorieproduit": myobject,
            "famille": myobject,
            "sousfamille": myobject,
            "departement": myobject,
            "sousdepartement": myobject,
            "souszone": myobject,
            "sousdepot": myobject,
            "souspostedepense": myobject,
            "livreur": myobject,
            "role": myobject,
            "user": myobject,
            "permission": myobject,
            "listeenvie": myobject,
            "vusrecemment": myobject
        };

        //markme-LISTE

        if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-') !== -1) {
            // TODO: delete
            // $scope.currentTemplateurl = current.templateUrl;
            var getNameItemOld = $scope.currentTemplateUrl.toLowerCase();
            var getNameItem = getNameItemOld.substring(5, getNameItemOld.length);
            console.log('On est sur quel Page ?', getNameItem, "getNameItemOld", getNameItemOld);

            if (getNameItem == "transactioncaisse") {
                $scope.pageChanged("approcash");
            }
            else {
                $scope.pageChanged(getNameItem);
            }
            console.log('------------_je cherche la page:--------------');

            console.log($scope.currentTemplateUrl.toLowerCase());

            if ($scope.currentTemplateUrl.toLowerCase() == 'list-livreur') {
                $scope.titlePage = 'Livreur';
                //$scope.getelements('zonedelivraisons');
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-commentairecommande') !== -1) {
                $scope.titlePage = 'Commentaire';
                $scope.getelements('typecommentaires');
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-typecommentaire') !== -1) {
                $scope.titlePage = 'Type commentaire';
            }
            if ($scope.currentTemplateUrl.toLowerCase() == 'list-clientmarket') {
                $scope.titlePage = 'Client E-market';
            }
            if ($scope.currentTemplateUrl.toLowerCase() == 'list-proformamarket') {
                $scope.titlePage = 'Proformas E-market';
            }
            if ($scope.currentTemplateUrl.toLowerCase() == 'list-favorie') {
                $scope.titlePage = 'Favories';
            }
            if ($scope.currentTemplateUrl.toLowerCase() == 'list-panier') {
                $scope.titlePage = 'Paniers';
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-moyenreservation') !== -1) {
                $scope.titlePage = 'Moyen de reservation';
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-reservation') !== -1) {
                $scope.titlePage = 'Reservations';
                $scope.getelements('entites');
                $scope.getelements('moyenreservations');
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-production') !== -1) {
                $scope.titlePage = 'Productions';
                $scope.getelements('depots');
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-decoupage') !== -1) {
                $scope.titlePage = 'Découpages';
                $scope.getelements('depots');
                $scope.getelements('emballages');
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-assemblage') !== -1) {
                $scope.titlePage = 'Assemblages';
                $scope.getelements('depots');
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-fonddecaisse') !== -1) {
                $scope.titlePage = 'Fond de Caisse';
                $scope.getelements('entites');
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-inventaire') !== -1) {
                $scope.produitlogistique = null
                if ($scope.currentTemplateUrl == 'list-inventairelogistique') {
                    $scope.produitlogistique = true;
                }
                $scope.titlePage = 'Inventaires';
                $scope.getelements('depots');
                $scope.getelements('produits');
                $scope.getelements('motifs');
                $scope.getelements('typeinventaires');
                $scope.getelements('familles');
                $scope.getelements('sousfamilles');
                $scope.getelements('zonedestockages');
                $scope.getelements('departements');
                $scope.getelements('sousdepartements');

                //$scope.chargeQueriesByType('PRODUIT', 'zonedestockages');
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-typelignedecredit') !== -1) {
                $scope.titlePage = 'Type ligne de crédit';
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-lignecredit') !== -1) {
                $scope.titlePage = 'Ligne de crédit';
                $scope.getelements('typelignedecredits');
                $scope.getelements('modepaiements');
                $scope.getelements('clients');
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-suivimarketing') !== -1) {
                $scope.titlePage = 'Alerts marketing';
                $scope.getelements('tags');
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-suivimarketingvalide') !== -1) {
                $scope.titlePage = 'Alertes validées';
                $scope.getelements('tags');
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-suivimarketingnonvalide') !== -1) {
                $scope.titlePage = 'Alertes marketing rejetées';
                $scope.getelements('tags');
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-fournisseur') !== -1) {
                $scope.titlePage = 'Fournisseur';
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-regulefournisseur') !== -1) {
                $scope.titlePage = 'Régules tiers';
                $scope.getelements('typeregules');
                $scope.getelements('fournisseurs');
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-reguleclient') !== -1) {
                $scope.titlePage = 'Régules clients';
                $scope.getelements('typeregules');
                $scope.getelements('clients');
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-client') !== -1) {
                $scope.titlePage = 'Clients';
                $scope.getelements('societefacturations');
                $scope.getelements('typeclients');
                $scope.getelements('entites');
                $scope.getelements('conditionreglements');
                $scope.getelements('zonedelivraisons');
                $scope.getelements('typeevenements');
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-typeclient') !== -1) {
                $scope.titlePage = 'Types de client';
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-categoriefournisseur') !== -1) {
                $scope.titlePage = 'Categories fournisseur';
            } if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-typetier') !== -1) {
                $scope.titlePage = 'Types tiers';
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-paiement') !== -1) {
                $scope.titlePage = 'Paiements';
                $scope.getelements('modepaiements');
                $scope.getelements('entites');
                $scope.donneCaissesUser();
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-emballage') !== -1) {
                $scope.titlePage = 'Emballage';
                $scope.getelements('typeemballages');
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-modepaiement') !== -1) {
                $scope.titlePage = 'Modes paiements';

            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-devise') !== -1) {
                $scope.titlePage = 'Devises';

            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-reglement') !== -1) {
                $scope.titlePage = 'Reglements';
                $scope.getelements('modepaiements');
                $scope.getelements('entites');
                $scope.getelements('depenses', null, 'totalement_paye:0');
                $scope.donneCaissesUser();
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-suivibanque') !== -1) {
                $scope.titlePage = 'Suivi banque';
                $scope.getelements('modepaiements');
                $scope.getelements('entites');
                $scope.getelements('caisses');
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-paiementfacture') !== -1) {
                $scope.titlePage = 'Paiements factures';
                $scope.getelements('modepaiements');
                $scope.donneCaissesUser();
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-paiementbc') !== -1) {
                $scope.titlePage = 'Paiements BC';
                $scope.getelements('modepaiements');
                $scope.donneCaissesUser();
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-logistique') !== -1) {
                $scope.titlePage = 'Produits logistique';
                $scope.chargeQueriesByType('Logistique', 'typeproduits');
                $scope.getelements('famillemateriels');
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-traiteur') !== -1) {
                $scope.titlePage = 'Traiteurs';
                $scope.getelements('entites');
                //$scope.getelements('operateurs');
                $scope.getelements('typeprixdeventes');
                $scope.chargeQueriesByType('Employe', 'departements');
                // $scope.getelements('familles');
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-proforma') !== -1) {
                $scope.titlePage = 'Proformas';
                $scope.getelements('entites');
                $scope.getelements('operateurs');
                $scope.getelements('typeprixdeventes');
                //  $scope.getelements('familles');
            }
            if ($scope.currentTemplateUrl.toLowerCase() == 'list-commande' || $scope.currentTemplateUrl.toLowerCase() == 'list-commande-generale') {
                $scope.passage = true;
                $scope.directbce = false;
                $scope.titlePage = 'Commande';
                $scope.getelements('entites');
                $scope.getelements('typecommandes');
                $scope.getelements('modepaiements');
                $scope.getelements('emballages');
                $scope.getelements('suivis');
                $scope.donneCaissesUser();
                var permission = 'commande';
                var rewriteReq = `historiqueactions(source:"${permission}")`;
                var rewriteReq = "familles(option_carte:1)";
                Init.getElement(rewriteReq, listofrequests_assoc["familles"]).then(function (data) {
                    if (data) {
                        $scope.dataPage["option_cartes"] = data;
                    }

                }, function (msg) {
                    toastr.error(msg);
                });
                $scope.getelements('typecommentaires');
            }
            if ($scope.currentTemplateUrl.toLowerCase() == 'list-commande-encour') {
                $scope.titlePage = 'Commandes en cours';
                var permission = 'commande-chef';
                var rewriteReq = `historiqueactions(source:"${permission}")`;
                Init.getElement(rewriteReq, listofrequests_assoc["historiqueactions"]).then(function (data) {
                    if (data && data.length > 0) {
                        $scope.notification_commande = data;
                    }

                }, function (msg) {
                    toastr.error(msg);
                });

            }
            if ($scope.currentTemplateUrl.toLowerCase() == 'list-commande-departement') {
                $scope.titlePage = 'Commandes departement';
                var permission = 'commande-departement';
                var rewriteReq = `historiqueactions(source:"${permission}")`;
                Init.getElement(rewriteReq, listofrequests_assoc["historiqueactions"]).then(function (data) {
                    if (data && data.length > 0) {
                        $scope.notification_commande = data;
                    }

                }, function (msg) {
                    toastr.error(msg);
                });

            }
            if ($scope.currentTemplateUrl.toLowerCase() == 'list-proformacommande') {
                $scope.titlePage = 'Proformas';
                $scope.getelements('entites');
                $scope.getelements('typecommandes');
                $scope.getelements('modepaiements');
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-carte') !== -1) {
                $scope.titlePage = 'Cartes';
                $scope.getelements('entites');
                $scope.getelements('typeprixdeventes');
                $scope.getelements('familles');
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-menu') !== -1) {
                $scope.getelements('tranchehoraires');
                $scope.getelements('entites');
                $scope.getelements('familles');
                $scope.titlePage = 'Menu';
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-devise') !== -1) {
                $scope.titlePage = 'Devise';

            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-typetier') !== -1) {
                $scope.titlePage = 'Type tiers';

            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-categoriefournisseur') !== -1) {
                $scope.titlePage = 'Categorie tiers';

            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-caisse') !== -1) {
                $scope.titlePage = 'Caisses';
                $scope.getelements('typedecaisses');
                $scope.donneCaissesParents();
                $scope.getelements('entites');
                $scope.getelements('societefacturations');
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-typedecaisse') !== -1) {
                $scope.titlePage = 'Types de caisse';
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-approcash') !== -1) {
                $scope.titlePage = 'Appro cash';
                $scope.getelements('caisses');
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-sortiecash') !== -1) {
                $scope.titlePage = 'Sortie cash';
                $scope.getelements('caisses');
                $scope.getelements('entites');
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-transactioncaisse') !== -1) {
                $scope.titlePage = 'Transaction caisse';
                $scope.getelements('caisses');
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-cloturecaisse') !== -1) {
                $scope.titlePage = 'Cloture caisse';
                //var queries = 'user:true';
                //$scope.getelements('caisses', {queries});
                $scope.getelements('caisses');
                $scope.getelements('typebillets');
                $scope.getelements('tranchehoraires');
                $scope.getelements('modepaiements');
                $scope.getelements('fonddecaisses');
                $scope.dataInTabPane['totaux_cloturecaisse']['data'].total_encaissement = 0;
                $scope.dataInTabPane['totaux_cloturecaisse']['data'].total_billetage = 0;
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-versement') !== -1) {
                $scope.titlePage = 'Versement';
                $scope.donneCaissesPouvantVersementsBanques();
                $scope.getelements('banques');
                $scope.getelements('entites');
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-bt') !== -1) {
                $scope.titlePage = 'Bons de transferts';
                $scope.getelements('depots');
                $scope.getelements('produits');

            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-bce') !== -1) {
                $scope.titlePage = 'Bons de commandes economats';
                $scope.directbce = true;
                $scope.passage = false;
                $scope.getelements('depots');
                $scope.getelements('fournisseurs');
                $scope.getelements('conditionreglements');
                $scope.getelements('devises');
                $scope.getelements('produits');
                $scope.getelements('bcis');
                $scope.getelements('caisses');
                $scope.getelements('modepaiements');
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-bci') !== -1) {
                $scope.titlePage = 'Bons de commandes internes';
                $scope.getelements('depots');
                $scope.getelements('fournisseurs');
                $scope.getelements('conditionreglements');
                $scope.getelements('devises');
                $scope.getelements('produits');

                // $scope.getelements('activites');
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-activite') !== -1) {
                $scope.titlePage = 'Activité'
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-societefacturation') !== -1) {
                $scope.titlePage = 'Société de facturation'
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-entite') !== -1) {
                $scope.titlePage = 'Point de vente'
            } else if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-user') !== -1) {
                $scope.titlePage = 'Utilisateurs';
                $scope.getelements('roles');
                $scope.getelements('entites');
                $scope.getelements('caisses');
                $scope.getelements('departements');
                $scope.chargeQueriesByType('Produit', 'departements');

            } else if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-preference') !== -1) {
                $scope.titlePage = 'Préferences';

            } else if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-produit') !== -1) {
                $scope.titlePage = 'Produit';

                $scope.getelements('categorieproduits');
                $scope.getelements('souscategorieproduits');
                $scope.chargeQueriesByType('Produit', 'departements');
                $scope.chargeQueriesByType('Produit', 'sousdepartements');
                $scope.chargeQueriesByType('Produit', 'zonedestockages');
                $scope.chargeQueriesByType('Produit', 'typeproduits');
                $scope.getelements('unitedemesures');
                $scope.getelements('nomenclatures');
                $scope.getelements('typedeconservations');
                $scope.getelements('depenses');
                $scope.getelements('emballages');
                $scope.getelements('typeprixdeventes');
                $scope.getelements('entites');
                $scope.getelements('familles');
                $scope.getelements('typeproduits');
                $scope.getelements('zonedestockages');
                $scope.getelements('depots');
                $scope.getelements('allergenes');
                $scope.getelements('parts');


                $scope.getelements('depenses');
                $scope.getelements('tranchehoraires');
                $scope.dataInTabPane['valeursft_produit']['data'].loss = 10;
                $scope.dataInTabPane['valeursft_produit']['data'].spice = 5;
                $scope.dataInTabPane['valeursft_produit']['data'].pourcentage_vente = 30;
                $scope.dataInTabPane['valeursft_produit']['data'].nombre_portion = 1;
            } else if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-categorieproduit') !== -1) {
                $scope.titlePage = "Catégories produit";
            } else if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-typeprixdevente') !== -1) {
                $scope.titlePage = "Types prix de vente";
            } else if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-nomenclature') !== -1) {
                $scope.titlePage = "Nomenclatures";
            } else if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-unitedemesure') !== -1) {
                $scope.titlePage = "Unités de mesure";
            } else if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-typedeconservation') !== -1) {
                $scope.titlePage = "Types de conservation";
            } else if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-be') !== -1) {
                $scope.titlePage = "Bons d'entrées";
                //$scope.getelements('bces',{},'reception:1');
                $scope.getelements('actions');
                //$scope.getelements('depots');
                // $scope.getelements('fournisseurs');
                //$scope.getelements('depots', null, 'type_depot_to_show:1');

                $scope.getelements('depots');
                $scope.getelements('fournisseurs');
                $scope.getelements('conditionreglements');
                $scope.getelements('devises');
                $scope.getelements('produits');
                $scope.getelements('bces', {}, 'reception:0');
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-tag') !== -1) {
                $scope.titlePage = 'Tags';
                $scope.getelements('tags');
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-typeevenement') !== -1) {
                $scope.titlePage = 'Type evenement';
                // $scope.titlePage = 'Role';
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-typefaitdiver') !== -1) {
                $scope.titlePage = 'Type fait divers';
                // $scope.titlePage = 'Role';
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-evenement') !== -1) {
                $scope.titlePage = 'Evenement';
                $scope.getelements('typefaitdivers');
                $scope.getelements('employes');
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-planing') !== -1) {
                $scope.titlePage = 'Plannings';
                $scope.getelements('entites');
                //$scope.getelements('departements');
                $scope.chargeQueriesByType('Employe', 'departements');
                $scope.getelements('brigades');
                $scope.getelements('employes', {}, 'activer:1');
                $scope.getelements('tranchehoraires');
                $scope.getelements('jours');
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-operateur') !== -1) {
                $scope.titlePage = 'Opérateurs';
                $scope.getelements('typeoperateurs');
                $scope.getelements('familleactions');
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-typeoperateur') !== -1) {
                $scope.titlePage = 'Types opérateurs';
            }
            if ($scope.currentTemplateUrl.toLowerCase() == 'list-zone') {
                $scope.titlePage = 'Zones';
                $scope.getelements('zones');
                $scope.getelements('entites');
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-action') !== -1) {
                $scope.titlePage = 'Actions';
                $scope.getelements('familleactions');
                $scope.getelements('zones');
                //$scope.getelements('souszones');
                $scope.getelements('frequenceqhses');
                $scope.getelements('bes');
                $scope.getelements('operateurs');
                $scope.getelements('traiteurs');

                //Pour Dépenses
                $scope.getelements('caisses');
                $scope.getelements('postedepenses');
                $scope.getelements('modepaiements');
                $scope.getelements('fournisseurs');
                $scope.getelements('entites');
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-detailaction') !== -1) {
                $scope.titlePage = 'Historiques actions';
                $scope.getelements('familleactions');
                $scope.getelements('zones');
                $scope.getelements('souszones');
                $scope.getelements('frequenceqhses');
                $scope.getelements('bes');
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-categoriedepense') !== -1) {
                $scope.titlePage = 'Categorie depenses';

            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-postedepense') !== -1) {
                $scope.titlePage = 'Postes de dépenses';
                $scope.getelements('entites');
                $scope.getelements('categoriedepenses');
                $scope.getelements('societefacturations');
                $scope.getelements('souspostedepenses');
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-depense') !== -1) {
                $scope.titlePage = 'Depenses';
                $scope.dataInTabPane['depense_action']['data'].id = null;
                //$scope.donneCaissesUser();
                $scope.getelements('caisses');
                $scope.getelements('postedepenses');
                //$scope.getelements('souspostedepenses');
                $scope.getelements('modepaiements');
                $scope.getelements('fournisseurs');
                $scope.getelements('entites');
                //$scope.getelements('bes',{},'payer:2');
                $scope.getelements('bes', {}, 'has_depense:0');
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-facture') !== -1) {
                $scope.titlePage = 'Factures';
                $scope.getelements('societefacturations');
                $scope.getelements('entites');
                $scope.getelements('activites');
                $scope.getelements('modepaiements');
                //$scope.donneCaissesUser();
                $scope.getelements('caisses');
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-facturetraiteur') !== -1) {
                $scope.titlePage = 'Factures traiteurs';
                $scope.getelements('societefacturations');
                $scope.getelements('entites');
                $scope.getelements('activites');
                $scope.getelements('modepaiements');
                //$scope.donneCaissesUser();
                $scope.getelements('caisses');
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-recouvrement') !== -1) {
                $scope.titlePage = 'Recouvrements';
                $scope.getelements('societefacturations');
                $scope.getelements('entites');
                $scope.getelements('activites');
                $scope.getelements('modepaiements');
                $scope.donneCaissesUser();
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-entreestock') !== -1) {
                $scope.titlePage = 'Entrees stock';
                $scope.ressource = 'entreestock';
                $scope.pour_logistique = null;
                $scope.produitlogistique = null;
                if ($scope.currentTemplateUrl == 'list-entreestocklogistique') {
                    $scope.titlePage = 'Entree stock logistique';
                    $scope.ressource = 'entreestocklogistique';
                    $scope.pour_logistique = 1;
                    $scope.produitlogistique = true;

                }
                $scope.getelements('depots');
                $scope.getelements('motifs');
                //$scope.getelements('produits');


            }

            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-sortiestock') !== -1) {

                $scope.titlePage = 'Sortie stock';
                $scope.ressource = 'sortiestock';
                $scope.pour_logistique = null;
                $scope.produitlogistique = null;

                if ($scope.currentTemplateUrl == 'list-sortiestocklogistique') {
                    $scope.pour_logistique = 1;
                    $scope.produitlogistique = true;
                    $scope.titlePage = 'Sorties stock logistique';
                    $scope.ressource = 'sortiestocklogistique';
                }
                $scope.getelements('depots');
                $scope.getelements('motifs');
                $scope.getelements('produits');
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-stockactuelproduitdepotlogistique') !== -1) {
                $scope.titlePage = 'valorisation';
                $scope.pageChanged('logistique');
                $scope.getelements('entites');
                $scope.getelements('depots');
                $scope.getelements('typeproduits');
            }
            else if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-stock') !== -1) {
                $scope.titlePage = 'valorisation';
                $scope.pageChanged('produit');
                $scope.getelements('entites');
                $scope.getelements('depots');
                $scope.getelements('familles');
                $scope.chargeQueriesByType('Produit', 'typeproduits');
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-stockactuelproduitdepot') !== -1) {
                $scope.titlePage = 'Stocks';
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-brigade') !== -1) {
                $scope.titlePage = 'Shifts';
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-typecontrat') !== -1) {
                $scope.titlePage = 'Types contrats';
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-contrat') !== -1) {
                $scope.titlePage = ' contrats';
                $scope.getelements('typecontrats');
                $scope.getelements('employes');
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-r2adepaie') !== -1) {
                $scope.titlePage = ' r2a de paie ';
                $scope.getelements('contrats');
                $scope.getelements('motifdeprimes');
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-fonction') !== -1) {
                $scope.titlePage = 'Fonctions';
            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-employe') !== -1) {
                $scope.titlePage = 'Employés';
                $scope.getelements('fonctions');
                //$scope.getelements('departements');
                $scope.getelements('typecontrats');
                $scope.getelements('entites');

                $scope.chargeQueriesByType('Employe', 'departements');
                //$scope.chargeQueriesByType('Employe', 'sousdepartements');

            }
            if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-conditionreglement') !== -1) {
                $scope.titlePage = 'Condition de règlement';
            } else if ($scope.currentTemplateUrl.toLowerCase().indexOf('-depot') !== -1) {
                $scope.titlePage = 'Depôt';
                $scope.getelements('typedepots');
                $scope.getelements('entites');
            } else if ($scope.currentTemplateUrl.toLowerCase().indexOf('-banque') !== -1) {
                $scope.titlePage = 'Banques';
            } else if ($scope.currentTemplateUrl.toLowerCase().indexOf('-astuce') !== -1) {
                $scope.titlePage = 'Astuces';
            } else if ($scope.currentTemplateUrl.toLowerCase().indexOf('-suivi') !== -1) {
                $scope.titlePage = 'Suivis';
            } else if ($scope.currentTemplateUrl.toLowerCase().indexOf('-allergene') !== -1) {
                $scope.titlePage = 'Allergenes';
            } else if ($scope.currentTemplateUrl.toLowerCase().indexOf('-part') !== -1) {
                $scope.titlePage = 'Parts';
            } else if ($scope.currentTemplateUrl.toLowerCase().indexOf('-famillemateriel') !== -1) {
                $scope.titlePage = 'Familles Matériel';
            } else if ($scope.currentTemplateUrl.toLowerCase().indexOf('-proformacommande') !== -1) {
                $scope.titlePage = 'Proformas';
            } else if ($scope.currentTemplateUrl.toLowerCase().indexOf('-motif') !== -1) {
                $scope.titlePage = 'Motifs';
            } else if ($scope.currentTemplateUrl.toLowerCase().indexOf('-typeregule') !== -1) {
                $scope.titlePage = 'Type régules';
            } else if ($scope.currentTemplateUrl.toLowerCase().indexOf('-typebillet') !== -1) {
                $scope.titlePage = 'Types billets';
            } else if ($scope.currentTemplateUrl.toLowerCase().indexOf('-typedepot') !== -1) {
                $scope.titlePage = 'Types de dépôts';
            } else if ($scope.currentTemplateUrl.toLowerCase().indexOf('-fournisseur') !== -1) {
                $scope.titlePage = 'Fournisseur';
                $scope.getelements('typetiers');
                $scope.getelements('categoriefournisseurs');
                $scope.getelements('devises');
                $scope.getelements('banques');
            } else if ($scope.currentTemplateUrl.toLowerCase().indexOf('-prixproduit') !== -1) {
                $scope.titlePage = 'Prix produit';
                $scope.pageChanged('prixachat');
                $scope.pageChanged('produit');
                $scope.getelements('fournisseurs');
                $scope.getelements('typeprixdeventes');
            } else if ($scope.currentTemplateUrl.toLowerCase().indexOf('-adresse') !== -1) {
                $scope.titlePage = 'Adresse';
            } else if ($scope.currentTemplateUrl.toLowerCase().indexOf('-contact') !== -1) {
                $scope.titlePage = 'Contact';
                $scope.getelements('typetiers');
            } else if ($scope.currentTemplateUrl.toLowerCase().indexOf('-dateclemotif') !== -1) {
                $scope.titlePage = 'Date clé motif';
                $scope.getelements('typetiers');

            } else if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-famille') !== -1) {
                $scope.titlePage = 'Famille';
                // $scope.pageChanged('sousfamille');

            } else if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-departement') !== -1) {
                $scope.titlePage = 'Departement';
                var rewriteReq = "familles(typage:2)";
                Init.getElement(rewriteReq, listofrequests_assoc["familles"]).then(function (data) {
                    if (data) {
                        $scope.dataPage["familles"] = data;
                    }

                }, function (msg) {
                    toastr.error(msg);
                });
                // $scope.getelements('familles');
                $scope.pageChanged('sousdepartement');
            }
            else if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-typeproduit') !== -1) {
                $scope.getelements('typedepots');
                $scope.titlePage = 'Type produit';
                var rewriteReq = "familles(typage:2)";
                Init.getElement(rewriteReq, listofrequests_assoc["familles"]).then(function (data) {
                    if (data) {
                        $scope.dataPage["familles"] = data;
                    }

                }, function (msg) {
                    toastr.error(msg);
                });
            }
            else if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-zonedestockage') !== -1) {
                $scope.titlePage = 'Zone stockage';
                $scope.getelements('entites');
                var rewriteReq = "familles(typage:2)";
                Init.getElement(rewriteReq, listofrequests_assoc["familles"]).then(function (data) {
                    if (data) {
                        $scope.dataPage["familles"] = data;
                    }

                }, function (msg) {
                    toastr.error(msg);
                });
            } else if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-zonedelivraison') !== -1) {
                $scope.titlePage = 'Zones de livraisons';
                $scope.getelements('entites');

            } else if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-tranchehoraire') !== -1) {
                $scope.titlePage = 'Tranches horaires';
            } else if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-propositionr2atechnique') !== -1) {
                $scope.titlePage = 'Propositon r2a technique';
                $scope.getelements('entites');
                $scope.getelements('bcis');
                $scope.getelements('proformas');
            } else if ($scope.currentTemplateUrl.toLowerCase().indexOf('-table') !== -1) {
                $scope.titlePage = 'Tables';
                $scope.getelements('entites');
                $scope.getelements('formetables');
            } else if ($scope.currentTemplateUrl.toLowerCase().indexOf('-formetable') !== -1) {
                $scope.titlePage = 'Formes tables';
            } else if ($scope.currentTemplateUrl.toLowerCase().indexOf('-decaissement') !== -1) {
                $scope.titlePage = 'Decaissement';
                $scope.getelements('typedecaissements');
                $scope.getelements('categoriedecaissements');
                $scope.getelements('caisses');
            } else if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-role') !== -1) {
                $scope.titlePage = 'Profils-permissions';

                var type = 'permission';
                var rewriteReq = "permissionspaginated";

                // Init.getElementPaginated(rewriteReq, listofrequests_assoc[type+"s"]).then(function (data) {
                //     if (data) {
                //         $scope.paginations[type].currentPage = data.metadata.current_page;
                //         $scope.paginations[type].totalItems = data.metadata.total;
                //         $scope.dataPage[type+"s"] = data.data;
                //     }
                // }, function (msg) {
                //     toastr.error(msg);
                // });
            } else if ($scope.currentTemplateUrl.toLowerCase().indexOf('list-utilisateur') !== -1) {
                $scope.titlePage = 'Utilisateurs';
                $scope.getelements('roles');
            }
        }
        else if ($scope.currentTemplateUrl.toLowerCase().indexOf('detail-client') !== -1) {
            $scope.titlePage = 'Detail client';
            var url = $location.path().split('/');
            $scope.param = url[2];
            // TODO: delete
            // $scope.currentTemplateurl = current.templateUrl;
            console.log($scope.currentTemplateUrl);
            $scope.pageChanged('client');
            $scope.getelements('modepaiements');
            $scope.getelements('typelignedecredits');

        }
        else if ($scope.currentTemplateUrl.toLowerCase().indexOf('detail-produit') !== -1) {
            $scope.titlePage = 'Detail produit';
            var url = $location.path().split('/');
            $scope.param = url[2];
            // TODO: delete
            // $scope.currentTemplateurl = current.templateUrl;
            console.log($scope.currentTemplateUrl);
            $scope.pageChanged('produit');
        }
        else if ($scope.currentTemplateUrl.toLowerCase().indexOf('detail-entite') !== -1) {
            $scope.titlePage = 'Detail entite';
            var url = $location.path().split('/');
            $scope.param = url[2];
            // TODO: delete
            // $scope.currentTemplateurl = current.templateUrl;
            console.log($scope.currentTemplateUrl);
            $scope.pageChanged('entite');
        }
        else if ($scope.currentTemplateUrl.toLowerCase().indexOf('detail-societefacturation') !== -1) {
            $scope.titlePage = 'Detail société facturation';
            var url = $location.path().split('/');
            $scope.param = url[2];
            // TODO: delete
            // $scope.currentTemplateurl = current.templateUrl;
            console.log($scope.currentTemplateUrl);
            $scope.pageChanged('societefacturation');
            $scope.getelements('entites', {}, 'societe_facturation_id:' + $scope.param);
            $scope.getelements('modepaiements');
        }
        else if ($scope.currentTemplateUrl.toLowerCase().indexOf('new-commande') !== -1) {
            $scope.titlePage = 'Nouveau commande';
            $scope.getelements('entites');
            //$scope.getelements('clients');
        }
        else if ($scope.currentTemplateUrl.toLowerCase().indexOf('script') !== -1) {
            $scope.titlePage = 'R2a';
        }


        $('.select2').on('select2:opening', function (e) {
            var data = e.params.data;
            console.log('New test');
            $scope.cpt = 1;
        });
    });

    $scope.chargeQueriesByType = function (type, tag) {

        var rewriteReq = `${tag}(typage:"${type}")`;
        Init.getElement(rewriteReq, listofrequests_assoc[tag]).then(function (data) {
            if (data) {
                $scope.dataPage[tag] = data;
            }
        }, function (msg) {
            toastr.error(msg);
        });
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
        $scope.getelements('roles');
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

    $scope.reconstruireMenu = function () {
        console.log("reconstruireMenu");

        if ($scope.menusearchs.length > 0) {
            $.each($scope.menusearchs, function (keyItem, oneItem) {
                console.log("reconstruireMenu:oneItem", oneItem);
                $afr2ar = $scope.checkPermision(oneItem.permission ? oneItem.permission : undefined);
                if ($afr2ar == false) {
                    console.log("reconstruireMenu/Ne pas afr2ar", oneItem.permission);
                    $scope.menusearchs.splice(keyItem, 1);
                }
                else {
                    if (oneItem.parent) {
                        $.each(oneItem.parent, function (keyItem2, oneItem2) {
                            $afr2ar = $scope.checkPermision(oneItem2.permission ? oneItem2.permission : undefined);
                            if ($afr2ar == false) {
                                $scope.menusearchs[keyItem].parent.splice(keyItem2, 1);
                            }
                            else {
                                if (oneItem2.parent) {
                                    $.each(oneItem2.parent, function (keyItem3, oneItem3) {
                                        $afr2ar = $scope.checkPermision(oneItem3.permission ? oneItem3.permission : undefined);
                                        if ($afr2ar == false) {
                                            $scope.menusearchs[keyItem].parent[keyItem2].parent.splice(keyItem3, 1);
                                        }
                                    });
                                }
                            }
                        });
                    }
                }

            });
        }
        return true;
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



    $scope.showModalUpdate = function (type, itemId, optionals = {
        forceChangeForm: false,
        isClone: false,
        transformToType: null,
        itemIdForeign: null
    }, isClonned = false, item = null) {

        console.log("showModalUpdate", type);
        if (itemId == null && type == 'client') {
            if ($scope.client) {
                itemId = $scope.client.id

            } else {
                itemId = $scope.client_traiteur;
            }
        }
        // $("#modal_add" + (optionals.is_file_excel ? 'list' : type)).modal('show');
        // return false;

        if (type === "ajout_rapport_conformite") {
            type = "action";
            $scope.ajout_rapport_conformite_action = true;
        } else {
            $scope.ajout_rapport_conformite_action = false;
        }


        var formatId = "id";
        var listeattributs_filter = [];
        var listeattributs = listofrequests_assoc[type + "s"];
        var modal = type;

        reqwrite = type + "s" + "(" + formatId + ":" + itemId + ")";

        //Pour les modals des validation
        if (type == "validationcloturecaisse") {
            var typeTmp = "cloturecaisse";
            reqwrite = typeTmp + "s" + "(" + formatId + ":" + itemId + ")";
            listeattributs = listofrequests_assoc[typeTmp + "s"];
        }

        if (optionals.transformToType) {
            tmpType = type;
            type = optionals.transformToType;
        }
        var type_modaladd;

        if (type == "commande-encour" || type == "commande-departement") {

            reqwrite = "commandeproduits(commande_id:" + itemId + ",seconde_phase:true, permission:" + `"list-${type}"` + ")";
            listeattributs = listofrequests_assoc["commandeproduits"];
            $scope.dataPage["commandeproduitencour"] = [];
            var permission = type;
            type = "commandeencour";//Pour afr2ar le modal qui se nomme commandeencour


            //Afr2ar les accompagenement
            reqwriteAccompagnement = "commandeproduitproduits(commande_id:" + itemId + ",permission:" + `"list-${permission}"` + ")";
            listeattributsAccompagnement = listofrequests_assoc["commandeproduitproduits"];
            Init.getElement(reqwriteAccompagnement, listeattributsAccompagnement, listeattributs_filter).then(function (data) {
                console.log('----------Accompagnement commande-----------------');
                console.log(data);
                $scope.dataPage['accompagementcommandeproduits'] = data;
                $('#id_' + type).val(itemId);
            })
        }
        if (type == 'traiteur') {
            type = 'proforma';
        }
        if (isClonned) {
            $scope.showModalAdd('bce', { fromUpdate: true });
        }
        else {
            $scope.showModalAdd(type, { fromUpdate: true }, item);
        }
        $scope.update = true;
        Init.getElement(reqwrite, listeattributs, listeattributs_filter).then(function (data) {
            var item = data[0];
            if (!optionals.isClone && !optionals.transformToType) {
                if (type == 'commandeencour') {
                    //Pour recuperer l id de la commande en cours
                    if (item.commande_id) {
                        $('#id_' + type).val(item.commande_id);
                    }
                }
                else {
                    if (isClonned) {
                        $scope.clonange = true
                        $scope.BciIdClonned = item.id
                    }
                    else {
                        $scope.clonange = false
                        $scope.BciIdClonned = null
                        $('#id_' + type).val(item.id);
                    }
                }
            }

            $('#modal_add' + type).blockUI_start();
            if (type == 'commentairecommande') {
                //update_livreur
                $('#commentaire_' + type).val(item.commentaire);
                $('#diminutif_' + type).val(item.diminutif);
                $('#type_commentaire_' + type).val(item.type_commentaire_id).trigger('change');
            }
            if (type == 'typecommentaire') {
                //update_typecommentaire
                $('#designation_' + type).val(item.designation);
            }
            if (type == 'reservation') {
                //update_reservation
                $('#commentaire_' + type).val(item.commentaire);
                $('#interlocuteur_' + type).val(item.interlocuteur);
                $('#nombre_couverts_' + type).val(item.nombre_couverts);
                $scope.nombre_couverts_reservation = item.nombre_couverts;
                $('#heure_debut_' + type).val(item.heure_debut).trigger('change');
                $('#heure_fin_' + type).val(item.heure_fin).trigger('change');
                $('#date_reservation_' + type).val(item.date_reservation_modif).trigger('change')
                $('#date_fin_' + type).val(item.date_fin_modif).trigger('change')
                if (item.entite_id) {
                    $scope.entite_reservation = item.entite_id;
                    $("#entite_" + type).val(item.entite_id).trigger('change');
                    $("#entite__" + type).val(item.entite_id).trigger('change');
                }
                $("#moyenreservation_id_" + type).val(item.moyen_de_reservation_id).trigger('change');
                if (item.client_id) {
                    $scope.editInSelect2('client', item.client_id, type);
                }
                if (item.table) {
                    $scope.currentTable = item.table
                    $("#table_reservation").val(item.table.id);
                    $scope.num_table_reservation = item.table.designation;
                    // $scope.nombre_couverts_reservation = item.table.nombre_couverts;
                    $("#num_table_reservation").val(item.table.designation);
                    $("#nombre_couvert_reservation").val(item.table.nombre_couverts);
                }
            }
            if (type == 'livreur') {
                //update_livreur
                $('#nom_complet_' + type).val(item.nom_complet);
                $('#telephone_' + type).val(item.telephone);
                $('#numero_cni_' + type).val(item.numero_cni);
                $('#numero_permis_' + type).val(item.numero_permis);
                $('#adresse_' + type).val(item.adresse);
                //$('#zone_de_livraison_' + type).val(item.zone_de_livraison_id).trigger('change');
            }


            if (type == 'devise') {
                console.log('ici le resultat a modifier =>', item)
                $('#designation_' + type).val(item.designation);
                $('#signe_' + type).val(item.signe);
                $('#valeurconversion_' + type).val(item.valeur_conversion);
                $('#est_devise_' + type).prop('checked', item.par_defaut);

                //$('#est_devise_' + type).val(item.par_defaut);
                //$('#zone_de_livraison_' + type).val(item.zone_de_livraison_id).trigger('change');
            }
            if (type == 'moyenreservation') {
                $('#designation_' + type).val(item.designation);
            }
            if (type == 'assemblage' || type == 'production' || type == 'decoupage') {
                //update_assemblage  //update_production  //update_decoupage
                console.log(item)
                $('#date_' + type).val(item.date_modif).trigger('change');
                $('#description_' + type).val(item.description);
                $('#depot_' + type).val(item.depot_id).trigger('change');
                $('#depot_sortie_' + type).val(item.depot_sortie_id).trigger('change');

                if (item.detail_assemblages.length > 0) {
                    if (type == 'assemblage') {
                        $scope.dataInTabPane['produits_assemblage']['data'] = item.detail_assemblages;
                    }
                    if (type == 'production') {
                        $scope.dataInTabPane['produits_production']['data'] = item.detail_assemblages;
                    }
                    if (type == 'decoupage') {
                        $scope.dataInTabPane['produits_decoupage']['data'] = item.detail_assemblages;
                    }

                }

            }
            if (type == 'typeinventaire') {
                //update_typeinventaire
                $('#designation_' + type).val(item.designation);
            }
            if (type == 'inventaire') {
                //update_inventaire
                $('#date_' + type).val(item.date_fr);
                $('#observation_' + type).val(item.observation);
                $('#designation_' + type).val(item.designaion);
                $('#depot_' + type).val(item.depot_id).trigger('change');
                $('#motif_' + type).val(item.motif_id).trigger('change');
                $('#typeinventaire_' + type).val(item.type_inventaire_id).trigger('change');

                $('#etat_' + type).prop('checked', item.etat_fr);
                if (item.etat_fr == true) {
                    $('#etat_' + type).hide();
                }
                //$('#zonedestockage_' + type).val(item.zone_de_stockage_id).trigger('change');
                $('#zonedestockage_' + type).val(item.zone_de_stockage_id).trigger('change');

                //Détails inventaire
                var tagForm = "produits_inventaire";
                $scope.dataInTabPane[tagForm]['data'] = [];
                typeAvecS = "inventaireproduits";
                rewriteReq = typeAvecS + "(inventaire_id:" + item.id + ")";
                Init.getElement(rewriteReq, listofrequests_assoc[typeAvecS]).then(function (data) {
                    if (data) {
                        $scope.dataInTabPane[tagForm]['data'] = data;
                    }
                }, function (msg) {
                    iziToast.error({
                        message: msg,
                        position: 'topRight'
                    });
                });
            }


            if (type == 'inventairelogistique') {
                //update_inventairelogistique
                $('#date_' + type).val(item.date_fr);
                $('#observation_' + type).val(item.observation);
                $('#designation_' + type).val(item.designaion);
                $('#depot_' + type).val(item.depot_id).trigger('change');
                $('#motif_' + type).val(item.motif_id).trigger('change');
                $('#typeinventaire_id_' + type).val(item.type_inventaire_id).trigger('change');

                $('#etat_' + type).prop('checked', item.etat_fr);
                if (item.etat_fr == true) {
                    $('#etat_' + type).hide();
                }
                //$('#zonedestockage_' + type).val(item.zone_de_stockage_id).trigger('change');
                $('#zonedestockage_' + type).val(item.zone_de_stockage_id).trigger('change');

                //Détails inventaire
                var tagForm = "produits_inventairelogistique";
                $scope.dataInTabPane[tagForm]['data'] = [];
                typeAvecS = "inventaireproduits";
                rewriteReq = typeAvecS + "(inventaire_id:" + item.id + ")";
                Init.getElement(rewriteReq, listofrequests_assoc[typeAvecS]).then(function (data) {
                    if (data) {
                        $scope.dataInTabPane[tagForm]['data'] = data;
                    }
                }, function (msg) {
                    iziToast.error({
                        message: msg,
                        position: 'topRight'
                    });
                });
            }
            if (type == 'lignecredit') {
                //update_lignecredit
                $('#date_' + type).val(item.date).trigger('change');
                $('#montant_' + type).val(item.montant);
                $('#description_' + type).val(item.description);
                if (item.client_id) {
                    $scope.editInSelect2('client', item.client_id, type);
                }
                $('#mode_paiement_' + type).val(item.mode_paiement_id).trigger('change');
                $('#typelignedecredit_' + type).val(item.type_ligne_de_credit_id).trigger('change');
            }
            if (type == 'categoriefournisseur') {
                //update_categoriefournisseur
                $('#designation_' + type).val(item.designation);
            }
            if (type == 'typetier') {
                //update_typetier
                $('#designation_' + type).val(item.designation);
            }
            if (type == 'typeemballage') {
                //update_typetier
                $('#designation_' + type).val(item.designation);
                $('#est_collectif_' + type).prop('checked', item.est_collectif_bool);
            }
            if (type == 'emballage') {
                //update_typetier
                $('#designation_' + type).val(item.designation);
                $('#typeemballage_' + type).val(item.type_emballage_id).trigger('change');
                $('#prix_' + type).val(item.prix);

            }
            if (type == 'commandeencour') {
                //update_commandeencour
                $scope.dataPage["commandeproduitencour"] = [];
                $scope.dataPage["commandeproduitencour"] = data;
            }
            if (type.indexOf('proforma') !== -1) {
                //update_proforma
                $scope.item_id = item.id;
                $('#entite_' + type).val(item.entite_id).trigger('change')
                $('#date_heure_' + type).val(item.date_debut_evenement_modif).trigger('change');
                $('#date_fin_' + type).val(item.date_debut_fin_modif).trigger('change')
                $('#lieu_' + type).val(item.lieu_prevu);
                // $('#client_' + type).val(item.client_id).trigger('change');
                if (item.client_id) {
                    $scope.editInSelect2('client', item.client_id, type);
                }
                $('#nombre_personne_' + type).val(item.nombre_personne);

                if (item.etat == 2) {
                    $("#r2aproforma").fadeIn('slow');
                    $("#log").fadeIn('slow');
                    $("#rh").fadeIn('slow');
                    $("#depense").fadeIn('slow');
                    $("#doc").fadeIn('slow');
                }

                var tagMp = 'r2atechniques_proforma';

                var tagCom = 'r2acomm_proforma';

                var tagLog = 'logistique_proforma';

                $scope.dataInTabPane['r2acomm_proforma']['data'] = item.proposition_commericales;

                var tableauArticle = [];

                var nombreCouvert = $("#nombre_personne_proforma").val();

                var nombre_portion;

                $scope.activeProposition(null, 'r2acomm_proforma', 1);
                if ($scope.titlePage == 'Traiteurs') {
                    console.log('----------Onjet Traiteur---------');
                    console.log(item);
                    $scope.chargeLogistiqueFrequenceForte('logistique', 'logistique_proforma');
                    if ($scope.dataInTabPane[tagCom]['data'] && $scope.dataInTabPane[tagCom]['data'].length > 0) {

                        var tabComValider = $filter('filter')($scope.dataInTabPane[tagCom]['data'], { activer: 1 });

                        if (tabComValider && tabComValider.length > 0) {

                            tabComValider.forEach(item1 => {

                                if (item1.familles_propositioncommerciale && item1.familles_propositioncommerciale.length >= 0) {

                                    if (item1.produits_propositioncommerciale && item1.produits_propositioncommerciale.length >= 0) {

                                        let index = item.proposition_commericales.indexOf(item1);

                                        if (index > -1) {


                                            let indexProp = $scope.dataInTabPane[tagCom]['data'].indexOf(item1);

                                            var tabProduit = item1.familles_propositioncommerciale.concat(item1.produits_propositioncommerciale);


                                            if (!item.cuisine_stock_proformas || item.cuisine_stock_proformas.length <= 0) {
                                                $scope.getProduitMP(tabProduit, tagMp, item1.proposition);
                                            }

                                        }
                                    }
                                }
                            });

                            $scope.dataInTabPane[tagMp]['data']['nombre_portion'] = nombre_portion;
                        }
                    }

                    $scope.dataInTabPane['option_materiel']['data'] = item.option_materiel;

                    if (item.cuisine_stock_proformas && item.cuisine_stock_proformas.length > 0) {
                        console.log('--------Avant cuisine stock------------');
                        console.log(item.cuisine_stock_proformas);
                        item.cuisine_stock_proformas.forEach(cstk => {
                            var search_prod = $filter('filter')($scope.dataInTabPane[tagMp]['data'], { produit_compose_id: cstk.produit_id });
                            let index = -1;
                            var prod;
                            if (search_prod && search_prod.length == 1) {
                                index = $scope.dataInTabPane[tagMp]['data'].indexOf(index);

                                if (index > -1) {
                                    search_prod[index].quantite_relle = cstk.quantite_relle;
                                    prod = search_prod[index];
                                }

                            } else {
                                prod = {
                                    produit_compose_id: cstk.produit_id,
                                    produit_compose: { designation: cstk.produit.designation },
                                    produit_compose_text: cstk.produit.designation,
                                    portion_unitaire: cstk.quantite,
                                    quantite_relle: cstk.quantite_relle,
                                    unite_de_mesure: cstk.produit.unite_de_mesure ? cstk.produit.unite_de_mesure.designation : '',
                                    nombre_couvert: nombreCouvert,
                                }
                            }

                            $scope.dataInTabPane[tagMp]['data'].push(prod);
                        });

                    }

                    if (item.logistique_proformas && item.logistique_proformas.length > 0) {
                        item.logistique_proformas.forEach(log => {
                            var search_prod = $filter('filter')($scope.dataInTabPane[tagLog]['data'], { produit_compose_id: log.produit_id });
                            let index = -1;
                            var prod;
                            if (search_prod && search_prod.length == 1) {
                                index = $scope.dataInTabPane[tagLog]['data'].indexOf(index);

                                if (index > -1) {
                                    search_prod[index].quantite = log.quantite;
                                    prod = search_prod[index];

                                }

                            } else {
                                prod = {
                                    produit_compose_id: log.produit_id,
                                    produit_compose: { designation: log.produit.designation },
                                    produit_compose_text: { designation: log.produit.designation },
                                    quantite: log.quantite,
                                }
                            }

                            $scope.dataInTabPane[tagLog]['data'].push(prod);
                        });
                    }

                    if (item.programme_rh && item.programme_rh.length > 0) {
                        $scope.dataInTabPane['item_tab_panes_rh_proforma']['data'] = item.programme_rh;
                        var date = $scope.dataInTabPane['item_tab_panes_rh_proforma']['data'][0];
                        $scope.reInit();
                        if (item.proforma_operateurs && item.proforma_operateurs.length > 0) {
                            $scope.dataInTabPane['rhs_proforma']['data'] = item.proforma_operateurs;
                        }
                        console.log('----------J ai active l onglet RH---------');
                        $scope.goToActiveOnglet('item_tab_panes_rh_proforma', date, 'active');

                    }

                }


            }
            if (type == 'commande' || type == 'proformacommande') {

                //update_commande

                console.log('Vois ci la commande================>');
                console.log(item);
                $scope.offre_commande = item.offre;
                $scope.commande_update = item;
                if (item.entite_id) {
                    $scope.restaurant_commande = item.entite_id;
                    $("#entite_" + type).val(item.entite_id).trigger('change');
                    $("#entite_commande").val(item.entite_id).trigger('change');
                }

                if (item.reservation) {
                    $scope.reservationToCommande(item.reservation);
                } else {
                    if (item.client_id !== null) {
                        $("#client_pasage_" + type).prop("checked", false);
                        $scope.client_passage = false;
                        $scope.editInSelect2('client', item.client_id, type);
                    }
                    else {
                        $scope.client_passage = true;
                        $scope.client = null;
                        $scope.reservation_commande = null;
                    }
                }
                $scope.dataInTabPane['produits_commande']['data'] = [];
                if (item.produits && item.produits.length > 0) {
                    $scope.dataInTabPane['produits_commande']['data'] = $scope.dataInTabPane['produits_commande']['data'].concat(item.produits);
                }
                if (item.menus && item.menus.length > 0) {
                    $scope.dataInTabPane['produits_commande']['data'] = $scope.dataInTabPane['produits_commande']['data'].concat(item.menus);
                }

                if (item.type_commande) {
                    $("#type_commande_" + type).val(item.type_commande.id).trigger('change');

                    if (item.type_commande.designation == 'sur place') {

                        if (item.table_commandes && item.table_commandes.length > 0) {
                            var table_commande = item.table_commandes[0];
                            var table = table_commande.table;

                            $('#table_commande').text(table.designation);
                            $scope.table_commande = table.designation;

                            $('#nombre_couvert_commande').val(table.nombre_couverts);
                            $scope.nbrpresonne_commande = table.nombre_couverts;

                            $('#id_table_commande').val(table.id);

                            //  $scope.selectItem('info_commande', table_commande.table_id, table_commande.table, false, false, 'sur place', true);
                        } else {
                            //  $scope.selectItem('list_table', null, null, false, false, null, true);
                        }

                    } else if (item.type_commande.designation == 'à emporter') {
                        // console.log('----------_Type commande----inside');
                        //console.log(item.type_commande.designation);
                        //  $scope.selectItem('info_commande', 1, null, false, false, item.type_commande.designation, true)
                    } else if (item.type_commande.designation == 'à livrer') {
                        //  $scope.selectItem('info_commande', 1, null, true, false, item.type_commande.designation, true);
                        $('#adresse_de_livraison' + type).val(item.adresse_de_livraison);
                        $scope.adresse_de_livraison_commande = item.adresse_de_livraison;
                        $scope.adresse_livraison = { "designation": item.adresse_de_livraison };
                    }
                }


            }
            if (type == 'paiement') {
                //update_paiement
                $('#caisse_' + type).val(item.caisse_id).trigger('change')
                $('#modepaiement_' + type).val(item.mode_paiement_id).trigger('change')
                $('#montant_' + type).val(item.montant)

                $("#montant_total_offert_paiement").val(item.commande.montant_offert);
                $("#id_commande_paiement").val(item.commande.id);
                $("#montant_a_payer_paiement").val(item.commande.restant_payer_format);
                $("#montant_total_payé_paiement").val(item.commande.montant_total_paye);
            }
            if (type.indexOf('carte') !== -1) {
                //update_carte
                if (!optionals.isClone || optionals.isClone == false) {
                    $('#designation_' + type).val(item.designation);
                }
                $('#entite_' + type).val(item.entite_id).trigger('change')
                $('#type_prix_de_vente_' + type).val(item.type_prix_vente_id).trigger('change')
                $scope.dataInTabPane["produits_carte"]["data"] = item.carteproduits;
            }
            if (type.indexOf('menu') !== -1) {
                console.log('--------_Le menu-----');
                console.log(item)
                //update_menu
                if (!optionals.isClone || optionals.isClone == false) {
                    $('#designation_' + type).val(item.designation);
                }

                $('#montant_' + type).val(item.montant_menu);
                $('#date_debut_' + type).val(item.date_debut_menu).trigger('change');
                $('#date_fin_' + type).val(item.date_fin_menu).trigger('change');
                $('#heure_debut_' + type).val(item.heure_debut_menu).trigger('change');
                $('#heure_fin_' + type).val(item.heure_fin_menu).trigger('change');
                $('#entite_' + type).val(item.entite_id).trigger('change');
                if (item.tranche_horaires) {
                    $scope.dataPage['tranchehoraires'] = item.tranche_horaires;
                }
                if (item.familles) {
                    $scope.dataPage['famille_menus'] = item.familles;
                }
                $scope.dataInTabPane['produits_menu']['data'] = item.produits && item.produits.length > 0 ? item.produits : [];
                if ($scope.dataPage['famille_menus'] && $scope.dataPage['famille_menus'].length > 0) {
                    $scope.reInit();
                    $scope.goToActiveOnglet('famille_menus', $scope.dataPage['famille_menus'][0].id, 'active', 'onglet_');
                }

            }
            if (type.indexOf('typeprixdevente') !== -1) {
                //update_typeprixdevente
                $('#designation_' + type).val(item.designation);
                $('#par_defaut_' + type).prop('checked', item.par_defaut);
                $('#pour_site_' + type).prop('checked', item.pour_site);
            }
            if (type.indexOf('categoriefournisseur') !== -1) {
                //update_categoriefournisseur
                $('#designation_' + type).val(item.designation);
            }
            if (type.indexOf('typetier') !== -1) {
                //update_typetier
                $('#id_' + type).val(item.id);
                $('#designation_' + type).val(item.designation);

            }
            if (type.indexOf('bt') !== -1) {
                //update_bt
                $('#date_' + type).val(item.date_fr);
                $('#observation_' + type).val(item.observation);
                $('#depot_expediteur_' + type).val(item.depot_expediteur_id).trigger('change');
                $('#depot_destinataire_' + type).val(item.depot_destinataire_id).trigger('change');
                $scope.dataInTabPane['produit_bt']['data'] = item.btproduits;
                $scope.calculMontantGlobalSurTabPaneData('produit_bt', $scope.dataInTabPane['produit_bt']['data']);

            }
            if (type.indexOf('tranchehoraire') !== -1) {
                //update_tranchehoraire
                $('#designation_' + type).val(item.designation);
                $('#heure_debut_' + type).val(item.heure_debut_fr);
                $('#heure_fin_' + type).val(item.heure_fin_fr);
                $('#duree_' + type).val(item.duree);
            }
            if (type.indexOf('bce') !== -1) {
                //update_bce
                $('#designation_' + type).val(item.designation);

                $('#devise_' + type).val(item.devise_id).trigger('change');
                $('#depot_' + type).val(item.depot_id).trigger('change');
                $('#fournisseur_' + type).val(item.fournisseur_id).trigger('change');
                $('#date_echeance_' + type).val(item.date_echeance).trigger('change');
                $('#conditionreglement_' + type).val(item.condition_reglement_id).trigger('change');
                $('#bci_' + type).val(item.bci_id).trigger('change');

                $('#motif_' + type).val(item.motif);
                $('#user_' + type).val(item.user_id).trigger('change');
                $('#date_operation_' + type).val(item.date_operation).trigger('change');
                $('#date_fin_' + type).val(item.date_fin).trigger('change');

                $scope.dataInTabPane['produits_bce']['data'] = item.bce_produits;

                $scope.chargerDonnees('produit', "bce", null, etat = 2, item.id);
                $scope.calculerMontant('produits_bce');

            }

            if (isClonned) {
                if (type.indexOf('bci') !== -1) {
                    var clone = 'bce'
                    $('#designation_' + clone).val(item.designation);
                    $('#commentaire_' + clone).val(item.commentaire);
                    $('#entite_' + clone).val(item.entite_id).trigger('change');
                    $('#date_operation_' + clone).val(item.date_operation_modif).trigger('change');
                    $('#bci_' + clone).val(item.id).trigger('change');

                    $('#devise_' + clone).val(item.devise_id).trigger('change');
                    $('#depot_' + clone).val(item.depot_id).trigger('change');
                    $('#fournisseur_' + clone).val(item.fournisseur_id).trigger('change');
                    $('#date_echeance_' + clone).val(item.date_echeance).trigger('change');
                    $('#conditionreglement_' + clone).val(item.condition_reglement_id).trigger('change');
                    $scope.dataInTabPane['produits_bce']['data'] = item.bciproduits;
                    $scope.calculerMontant('produits_bci');

                }
            }
            else {
                if (type.indexOf('bci') !== -1) {
                    //update_bci
                    console.log(item);
                    $('#designation_' + type).val(item.designation);
                    $('#commentaire_' + type).val(item.commentaire);
                    $('#entite_' + type).val(item.entite_id).trigger('change');
                    $('#date_operation_' + type).val(item.date_operation_modif).trigger('change');

                    $('#devise_' + type).val(item.devise_id).trigger('change');
                    $('#depot_' + type).val(item.depot_id).trigger('change');
                    $('#fournisseur_' + type).val(item.fournisseur_id).trigger('change');
                    $('#date_echeance_' + type).val(item.date_echeance).trigger('change');
                    $('#conditionreglement_' + type).val(item.condition_reglement_id).trigger('change');
                    $scope.dataInTabPane['produits_bci']['data'] = item.bciproduits;
                    $scope.calculerMontant('produits_bci');

                }
            }

            if (type.indexOf('activite') !== -1) {
                //update_activite
                $('#designation_' + type).val(item.designation);
                $('#tva_' + type).prop('checked', item.tva);
            }
            if (type.indexOf('societefacturation') !== -1) {
                //update_societefacturation
                $('#denominationsociale_' + type).val(item.denominationsociale);
                $('#telephone_' + type).val(item.telephone);
                $('#email_' + type).val(item.email);
                $('#adresse_' + type).val(item.adresse);
                $('#rib_' + type).val(item.rib);
                $('#ninea_' + type).val(item.ninea);
                $('#rcm_' + type).val(item.rcm);
                $('#alias_' + type).val(item.alias);
            }
            if (type.indexOf('typeevenement') !== -1) {
                //update_typeevenement
                $('#designation_' + type).val(item.designation);
            }
            if (type.indexOf('typefaitdiver') !== -1) {
                //update_typefaitdiver
                $('#designation_' + type).val(item.designation);
            }

            if (type.indexOf('fonddecaisse') !== -1) {
                $('#date_' + type).val(item.date).trigger('change');
                $('#entite_' + type).val(item.entite_id).trigger('change');
                $('#montant_' + type).val(item.montant);
                $('#description_' + type).val(item.description);

            }
            if (type.indexOf('modepaiement') !== -1) {
                //update_modepaiement
                $('#designation_' + type).val(item.designation);
                $('#description_' + type).val(item.description);

                if (item.est_cash == 0) {
                    $('#est_cash_' + type).prop('checked', false);

                } else if (item.est_cash == 1) {
                    $('#est_cash_' + type).prop('checked', true);
                }
                if (item.encaissable == 0) {
                    $('#est_encaissable_' + type).prop('checked', false);
                }
                else if (item.encaissable == 1) {
                    $('#est_encaissable_' + type).prop('checked', true);
                }
            }
            if (type.indexOf('typebillet') !== -1) {
                //update_typebillet
                $('#designation_' + type).val(item.designation);
                $('#nombre_' + type).val(item.nombre);
            }
            if (type.indexOf('typedecaisse') !== -1) {
                //update_typedecaisse
                console.log(item);
                $('#designation_' + type).val(item.designation);
                $('#peut_versement_banque_' + type).prop('checked', item.peut_versement_banque == 1 ? true : false);
            }
            if (type.indexOf('banque') !== -1) {
                //update_banque
                $('#designation_' + type).val(item.designation);
            }
            if (type.indexOf('astuce') !== -1) {
                //update_astuce
                $('#designation_' + type).val(item.designation);
            }
            if (type.indexOf('suivi') !== -1) {
                //update_suivi
                $('#designation_' + type).val(item.designation);
                $('#niveau_' + type).val(item.niveau);
            }
            if (type.indexOf('allergene') !== -1) {
                //update_allergene
                $('#designation_' + type).val(item.designation);
            }
            if (type.indexOf('part') !== -1) {
                //update_part
                $('#designation_' + type).val(item.designation);
            }
            if (type.indexOf('banniere') !== -1) {
                //update_banniere
                $('#designation_' + type).val(item.designation);
                $('#description_' + type).val(item.description);
                $('#nbre_image_' + type).val(item.nbre_image);
                $('#lien_' + type).val(item.lien);
                // $('#activer_' + type).prop('checked', item.activer);
                $('#texte1_' + type).val(item.texte1);
                $('#texte2_' + type).val(item.texte2);
                $('#texte3_' + type).val(item.texte3);
                $scope.banniere = item;
                //Pour les images
                for (var i = 1; i <= item.images.length; i++) {
                    var valeur = undefined;
                    var suffixe = 'img' + i + type;
                    if (i == 1 && item.images[0]) {
                        valeur = item.images[0].image;
                    }
                    if (i == 2 && item.images[1]) {
                        valeur = item.images[1].image;
                    }
                    if (i == 3 && item.images[2]) {
                        valeur = item.images[2].image;
                    }
                    if (i == 4 && item.images[3]) {
                        valeur = item.images[3].image;
                    }

                    if (valeur) {
                        $scope.addfield('banniere', valeur);
                        $('#' + suffixe)
                            .val("")
                            .attr('required', false).removeClass('required');
                        //$('#affimg1' + type).attr('src', (item.image1 ? item.image1 : imgupload));
                        //$('#aff' + suffixe).attr('src', (valeur ? valeur : imgupload));
                    }
                }
            }
            if (type.indexOf('famillemateriel') !== -1) {
                //update_famillemateriel
                $('#designation_' + type).val(item.designation);
            }
            if (type.indexOf('preference') !== -1) {
                //update_preference
                $('#designation_' + type).val(item.designation);
                $('#description_' + type).val(item.description);
                $('#valeur_' + type).val(item.valeur);
            }
            if (type.indexOf('typeregule') !== -1) {
                //update_typeregule
                $('#designation_' + type).val(item.designation);
            }
            if (type.indexOf('regulefournisseur') !== -1) {
                //update_regulefournisseur
                $('#date_' + type).val(item.date);
                $('#motif_' + type).val(item.motif);
                $('#commentaire_' + type).val(item.commentaire);
                $('#montant_' + type).val(item.montant);
                $('#type_regule_id_' + type).val(item.type_regule_id).trigger('change');
                $('#fournisseur_id_' + type).val(item.fournisseur_id).trigger('change');
            }
            if (type.indexOf('reguleclient') !== -1) {
                //update_reguleclient
                $('#date_' + type).val(item.date);
                $('#motif_' + type).val(item.motif);
                $('#commentaire_' + type).val(item.commentaire);
                $('#montant_' + type).val(item.montant);
                $('#type_regule_id_' + type).val(item.type_regule_id).trigger('change');
                $('#client_id_' + type).val(item.client_id).trigger('change');
            }
            if (type.indexOf('motif') !== -1) {
                //update_motif
                $('#designation_' + type).val(item.designation);
            }
            if (type.indexOf('approcash') !== -1) {
                //update_approcash
                $('#date_' + type).val(item.date);
                $('#montant_' + type).val(item.montant);
                $('#motif_' + type).val(item.motif);
                $('#caisse_source_id_' + type).val(item.caisse_source_id).trigger('change');
                $('#caisse_destinataire_id_' + type).val(item.caisse_destinataire_id).trigger('change');
            }
            if (type.indexOf('sortiecash') !== -1) {
                //update_sortiecash
                $('#date_' + type).val(item.date);
                $('#montant_' + type).val(item.montant);
                $('#motif_' + type).val(item.motif);
                $('#caisse_id_' + type).val(item.caisse_id).trigger('change');

                //Dispatching par entites
                var tagForm = "entitestransactions_general";
                $scope.dataInTabPane[tagForm]['data'] = [];
                typeAvecS = "entitetransactioncaisses";
                rewriteReq = typeAvecS + "(sortie_cash_id:" + item.id + ")";
                Init.getElement(rewriteReq, listofrequests_assoc[typeAvecS]).then(function (data) {
                    if (data) {
                        //console.log("data", data);
                        $.each(data, function (keyItem, oneItem) {
                            $scope.dataInTabPane[tagForm]['data'].push({
                                "entite_id": oneItem.entite.id,
                                "entite": oneItem.entite,
                                "montant": oneItem.montant,
                            });
                        });
                    }
                }, function (msg) {
                    iziToast.error({
                        message: msg,
                        position: 'topRight'
                    });
                });
            }
            if (type.indexOf('cloturecaisse') !== -1) {
                //update_cloturecaisse
                $('#date_debut_' + type).val(item.date_debut_entier).trigger('change');
                $('#date_fin_' + type).val(item.date_fin_entier);
                $('#fond_caisse_' + type).val(item.fond_caisse);
                $('#montant_caisse_actuel_' + type).val(item.montant_caisse_actuel);
                $('#tranche_horaire_id_' + type).val(item.tranche_horaire_id).trigger('change');
                $('#caisse_id_' + type).val(item.caisse_id).trigger('change');
                $('#entite_id_' + type).val(item.entite_id);
                $('#hebdomadaire_' + type).prop('checked', item.type);
                $scope.updateCheck('hebdomadaire_' + type, 'show-hebdomdaire', 'checkbox', 0, 'hide-hebdomdaire');
                $scope.donneMontantClotureParEntite();

                //Billetage
                var tagForm = "typebillets_cloturecaisse";
                $scope.dataInTabPane[tagForm]['data'] = [];
                typeAvecS = "billetages";
                rewriteReq = typeAvecS + "(cloture_caisse_id:" + item.id + ")";
                Init.getElement(rewriteReq, listofrequests_assoc[typeAvecS]).then(function (data) {
                    if (data) {
                        //console.log("data", data);
                        $.each(data, function (keyItem, oneItem) {
                            $scope.dataInTabPane[tagForm]['data'].push({
                                "typebillet_id": oneItem.type_billet.id,
                                "typebillet": oneItem.type_billet,
                                "nombre": oneItem.nombre,
                                "total": oneItem.nombre * oneItem.type_billet.nombre,
                            });
                        });
                        $scope.donneTotauxClotureCaisse(tagForm);
                    }
                }, function (msg) {
                    iziToast.error({
                        message: msg,
                        position: 'topRight'
                    });
                });

                //Encaissement
                var tagForm2 = "encaissements_cloturecaisse";
                $scope.dataInTabPane[tagForm2]['data'] = [];
                typeAvecS2 = "encaissements";
                rewriteReq2 = typeAvecS2 + "(cloture_caisse_id:" + item.id + ")";
                Init.getElement(rewriteReq2, listofrequests_assoc[typeAvecS2]).then(function (data) {
                    if (data) {
                        //console.log("data", data);
                        $.each(data, function (keyItem, oneItem) {
                            $scope.dataInTabPane[tagForm2]['data'].push({
                                "mode_paiement_id": oneItem.mode_paiement_id.id,
                                "mode_paiement": oneItem.mode_paiement,
                                "montant": oneItem.montant,
                            });
                        });
                        $scope.donneTotauxClotureCaisse(tagForm2);
                    }
                }, function (msg) {
                    iziToast.error({
                        message: msg,
                        position: 'topRight'
                    });
                });
            }
            if (type.indexOf('versement') !== -1) {
                //update_versement
                $('#date_' + type).val(item.date);
                $('#montant_' + type).val(item.montant);
                $('#caisse_id_' + type).val(item.caisse_id).trigger('change');
                $('#banque_id_' + type).val(item.banque_id).trigger('change');
                $('#entite_id_' + type).val(item.entite_id).trigger('change');
                $('#description_' + type).val(item.description);

                //Dispatching par entites
                var tagForm = "entitestransactions_general";
                $scope.dataInTabPane[tagForm]['data'] = [];
                typeAvecS = "entitetransactioncaisses";
                rewriteReq = typeAvecS + "(versement_id:" + item.id + ")";
                Init.getElement(rewriteReq, listofrequests_assoc[typeAvecS]).then(function (data) {
                    if (data) {
                        //console.log("data", data);
                        $.each(data, function (keyItem, oneItem) {
                            $scope.dataInTabPane[tagForm]['data'].push({
                                "entite_id": oneItem.entite.id,
                                "entite": oneItem.entite,
                                "montant": oneItem.montant,
                            });
                        });
                    }
                }, function (msg) {
                    iziToast.error({
                        message: msg,
                        position: 'topRight'
                    });
                });
            }
            if (type.indexOf('caisse') !== -1) {
                //update_caisse
                $('#designation_' + type).val(item.designation);
                $('#solde_' + type).val(item.solde);
                $('#solde_diez_' + type).val(item.solde_diez);
                $('#entite_id_' + type).val(item.entite_id).trigger('change');
                $('#parent_id_' + type).val(item.parent_id).trigger('change');
                $('#societe_facturation_id_' + type).val(item.societe_facturation_id).trigger('change');
                $('#type_de_caisse_id_' + type).val(item.type_de_caisse_id).trigger('change');
                $('#est_activer_' + type).val(item.est_activer);
            }
            if (type.indexOf('brigade') !== -1) {
                //update_brigade
                $('#designation_' + type).val(item.designation);
                $('#diminutif_' + type).val(item.diminutif);
            }
            if (type.indexOf('planing') !== -1) {
                //update_planing
                if (!optionals || optionals.isClone == false) {
                    $('#designation_' + type).val(item.designation);
                    $('#date_debut_' + type).val(item.date_debut);
                }
                $('#entite_id_' + type).val(item.entite_id).trigger('change');
                $scope.dataInTabPane['employes_planing']['data'] = JSON.parse(item.tableau);
                //console.log("edit planing ==> "+JSON.stringify($scope.dataInTabPane['employes_planing']['data']));
            }
            if (type.indexOf('fonction') !== -1) {
                //update_fonction
                $('#designation_' + type).val(item.designation);
            }
            if (type == 'zone' || type == 'zones') {
                $('#designation_' + type).val(item.designation);
            }
            if (type.indexOf('employe') !== -1) {
                //update_employe
                $('#nom_complet_' + type).val(item.nom_complet);
                $('#telephone_' + type).val(item.telephone);
                $('#date_embauche_' + type).val(item.date_embauche);
                $('#fonction_id_' + type).val(item.fonction_id).trigger('change');
                $('#departement_id_' + type).val(item.departement_id).trigger('change');
                $('#type_contrat_id_' + type).val(item.type_contrat_id).trigger('change');
                $('#entite_id_' + type).val(item.entite_id).trigger('change');
                $('#net_bulletin_' + type).val(item.net_bulletin);
                $('#categorie_' + type).val(item.categorie);
                $('#duree_travail_' + type).val(item.duree_travail);
            }
            if (type == "familleaction" || type == "familleactions") {
                //update_familleaction
                $('#designation_' + type).val(item.designation);
            }
            if (type.indexOf('operateur') !== -1) {
                //update_operateur
                $('#nom_' + type).val(item.nom);
                $('#email_' + type).val(item.email);
                $('#telephone_' + type).val(item.telephone);
                $('#type_operateur_id_' + type).val(item.type_operateur_id).trigger('change');

                //Famille actions
                var tagForm1 = "familleactions_operateur";
                $scope.dataInTabPane[tagForm1]['data'] = [];
                typeAvecS1 = "familleactionsoperateurs";
                rewriteReq1 = typeAvecS1 + "(operateur_id:" + item.id + ")";
                Init.getElement(rewriteReq1, listofrequests_assoc[typeAvecS1]).then(function (data) {
                    if (data) {
                        //console.log("data", data);
                        $scope.dataInTabPane[tagForm1]['data'] = data;
                    }
                }, function (msg) {
                    iziToast.error({
                        message: msg,
                        position: 'topRight'
                    });
                });
            }
            if (type == 'action' || type == 'actions') {
                //update_action
                $('#designation_' + type).val(item.designation);
                $('#date_' + type).val(item.date);
                $('#document_' + type).val(item.document);
                $('#famille_action_id_' + type).val(item.famille_action_id).trigger('change');
                $('#zone_id_' + type).val(item.zone_id).trigger('change');
                if (item.sous_zone_id) {
                    $scope.editInSelect2('souszone', item.sous_zone_id, type);
                }
                $('#frequence_qhse_id_' + type).val(item.frequence_qhse_id).trigger('change');
                $('#evenement_id_' + type).val(item.evenement_id_).trigger('change');
                $('#be_id_' + type).val(item.be_id).trigger('change');
                $('#observations_' + type).val(item.observations);
                $('#montant_' + type).val(item.montant);
                $('#avec_tva_' + type).prop('checked', item.avec_tva);
                $('#rapport_conformite_' + type).val(item.rapport_conformite);
                $('#evenementexceptionnel_' + type).val(item.evenement_exceptionnel);

                /*  $scope.dataInTabPane['depense_action']['data'].id = item.id;
                 $scope.pageChanged('depense'); */

                if (item.conformite == 0) {
                    $('.conformite_1_' + type).prop('checked', false);
                    $('.conformite_0_' + type).prop('checked', true);
                } else if (item.conformite == 1) {
                    $('.conformite_1_' + type).prop('checked', true);
                    $('.conformite_0_' + type).prop('checked', false);
                }

                var tagForm = "interventions_action";
                $scope.dataInTabPane[tagForm]['data'] = [];
                typeAvecS = "interventions";
                rewriteReq = typeAvecS + "(action_id:" + item.id + ")";
                Init.getElement(rewriteReq, listofrequests_assoc[typeAvecS]).then(function (data) {
                    if (data) {
                        //console.log("data", data);
                        $.each(data, function (keyItem, oneItem) {
                            $scope.dataInTabPane[tagForm]['data'].push({
                                "operateur_id": oneItem.operateur.id,
                                "operateur": oneItem.operateur,
                                "date_heure": oneItem.date,
                                "rapport": oneItem.rapport,
                            });
                        });
                    }
                }, function (msg) {
                    iziToast.error({
                        message: msg,
                        position: 'topRight'
                    });
                });
            }
            if (type == 'evenement' || type == 'evenements') {
                //update_evenement
                $('#designation_' + type).val(item.designation);
                $('#date_' + type).val(item.date_court);
                $('#type_evenement_id_' + type).val(item.type_evenement_id).trigger('change');
                $('#description_' + type).val(item.description);

                var tagForm = "intervenants_evenement";
                $scope.dataInTabPane[tagForm]['data'] = [];
                typeAvecS = "participants";
                rewriteReq = typeAvecS + "(evenement_id:" + item.id + ")";
                Init.getElement(rewriteReq, listofrequests_assoc[typeAvecS]).then(function (data) {
                    if (data) {
                        //console.log("data", data);
                        $.each(data, function (keyItem, oneItem) {
                            $scope.dataInTabPane[tagForm]['data'].push({
                                "employe_id": oneItem.employe_id,
                                "employe": oneItem.employe,
                            });
                        });
                    }
                }, function (msg) {
                    iziToast.error({
                        message: msg,
                        position: 'topRight'
                    });
                });
            }
            if (type == 'detailaction' || type == 'detailactions') {
                //update_detailaction
                $('#rapport_conformite_' + type).val(item.rapport_conformite);
                if (item.conformite == 0) {
                    $('.conformite_1_' + type).prop('checked', false);
                    $('.conformite_0_' + type).prop('checked', true);
                } else if (item.conformite == 1) {
                    $('.conformite_1_' + type).prop('checked', true);
                    $('.conformite_0_' + type).prop('checked', false);
                }
            }
            if (type.indexOf('typeprixdevente') !== -1) {
                //update_typeprixdevente
                $('#designation_' + type).val(item.designation);
            }
            if (type.indexOf('categoriedepense') !== -1) {
                //update_categoriedepense
                $('#designation_' + type).val(item.designation);
            }
            if (type == 'postedepense' || type == 'souspostedepense') {
                //update_postedepense
                if (type == 'souspostedepense') {
                    type = 'postedepense';
                }
                $('#designation_' + type).val(item.designation);
                $('#compte_sage_' + type).val(item.compte_sage);
                $('#categorie_depense_id_' + type).val(item.categorie_depense_id).trigger('change');
                $('#poste_depense_id_' + type).val(item.poste_depense_id).trigger('change');

                //Dispatching par entites
                var tagForm = "entites_postedepense";
                $scope.dataInTabPane[tagForm]['data'] = [];
                typeAvecS = "postedepenseentites";
                rewriteReq = typeAvecS + "(poste_depense_id:" + item.id + ")";
                Init.getElement(rewriteReq, listofrequests_assoc[typeAvecS]).then(function (data) {
                    if (data) {
                        //console.log("data", data);
                        $.each(data, function (keyItem, oneItem) {
                            $scope.dataInTabPane[tagForm]['data'].push({
                                "entite_id": oneItem.entite.id,
                                "entite": oneItem.entite,
                                "montant": oneItem.montant,
                            });
                        });
                    }
                }, function (msg) {
                    iziToast.error({
                        message: msg,
                        position: 'topRight'
                    });
                });

                if (item.compte_sages && item.compte_sages.length > 0) {

                    $scope.dataInTabPane['compte_sages_postedepense']['data'] = item.compte_sages;
                }

                if (item.poste_depense_entites && item.poste_depense_entites.length > 0) {
                    console.log('--------Voici poste depense-------------');
                    console.log(item);
                    $scope.dataInTabPane['entites_postedepense']['data'] = item.compte_sages;
                }
            }
            if (type == 'reglement') {
                //update_reglement
                $('#mode_paiement_id_' + type).val(item.mode_paiement_id).trigger('change');
                $('#montant_' + type).val(item.montant)
            }
            if (type == 'depense') {
                //update_depense
                $('#entite_id_' + type).val(item.entite_id).trigger('change');
                $('#caisse_id_' + type).val(item.caisse_id).trigger('change');
                $('#numero_piece_' + type).val(item.numero_piece);
                $('#date_piece_' + type).val(item.date_piece);
                $('#date_echeance_' + type).val(item.date_echeance);
                $('#date_paiement_' + type).val(item.date_paiement);
                $('#mode_paiement_id_' + type).val(item.mode_paiement_id).trigger('change');
                $('#fournisseur_id_' + type).val(item.fournisseur_id).trigger('change');
                $('#be_id_' + type).val(item.be_id).trigger('change');
                $('#motif_' + type).val(item.motif);
                $('#comptant_' + type).prop('checked', item.comptant);
                $('#compta_' + type).prop('checked', item.compta);
                $scope.dataInTabPane['totaux_depense']['data'].total_depense = item.montant;

                //Postes de dépenses
                var tagForm1 = "postedepenses_depense";
                $scope.dataInTabPane[tagForm1]['data'] = [];
                typeAvecS1 = "depensepostedepenses";
                rewriteReq1 = typeAvecS1 + "(depense_id:" + item.id + ")";
                Init.getElement(rewriteReq1, listofrequests_assoc[typeAvecS1]).then(function (data) {
                    if (data) {
                        //console.log("data", data);
                        $.each(data, function (keyItem, oneItem) {
                            $scope.dataInTabPane[tagForm1]['data'].push({
                                "poste_depense_id": oneItem.poste_depense_id,
                                "poste_depense": oneItem.poste_depense,
                                "montant": oneItem.montant,
                                "tva": oneItem.tva,
                                "montant_tva": oneItem.montant_tva,
                                "montant_ttc": oneItem.montant_ttc,
                                "depense_id": oneItem.depense_id,
                            });
                        });
                    }
                }, function (msg) {
                    iziToast.error({
                        message: msg,
                        position: 'topRight'
                    });
                });

                //Dispatching par entites
                var tagForm2 = "entitestransactions_general";
                $scope.dataInTabPane[tagForm2]['data'] = [];
                typeAvecS2 = "entitetransactioncaisses";
                rewriteReq2 = typeAvecS2 + "(depense_id:" + item.id + ")";
                Init.getElement(rewriteReq2, listofrequests_assoc[typeAvecS2]).then(function (data) {
                    if (data) {
                        //console.log("data", data);
                        $.each(data, function (keyItem, oneItem) {
                            $scope.dataInTabPane[tagForm2]['data'].push({
                                "entite_id": oneItem.entite.id,
                                "entite": oneItem.entite,
                                "montant": oneItem.montant,
                            });
                        });
                    }
                }, function (msg) {
                    iziToast.error({
                        message: msg,
                        position: 'topRight'
                    });
                });
            }
            if (type.indexOf('nomenclature') !== -1) {
                //update_nomenclature
                $('#designation_' + type).val(item.designation);
            }
            if (type.indexOf('typecommande') !== -1) {
                //update_typecommande
                $('#designation_' + type).val(item.designation);
            }
            if (type == 'formetable' || type == 'formetables') {
                //update_formetable
                $('#designation_' + type).val(item.designation);
            }
            if (type == 'table' || type == 'tables') {
                //update_table
                $('#designation_' + type).val(item.designation);
                $('#nombre_couverts_' + type).val(item.nombre_couverts);
                $('#occupation_' + type).val(item.occupation);
                $('#forme_table_id_' + type).val(item.forme_table_id).trigger('change');
                $('#entite_id_' + type).val(item.entite_id).trigger('change');
            }
            if (type.indexOf('unitedemesure') !== -1) {
                //update_unitedemesure
                $('#designation_' + type).val(item.designation);
                $('#abreviation_' + type).val(item.abreviation);

            }
            if (type.indexOf('zonedestockage') !== -1) {
                //update_zonedestockage
                $('#designation_' + type).val(item.designation);
                $('#entite_id_' + type).val(item.entite_id).trigger('change');
                $('#famille_' + type).prop('checked', item.famille_id);
            }
            if (type.indexOf('typedeconservation') !== -1) {
                //update_typedeconservation
                $('#designation_' + type).val(item.designation);
            }
            if (type.indexOf('conditionreglement') !== -1) {
                //update_conditionreglement
                $('#designation_' + type).val(item.designation);
                $('#nombrejours_' + type).val(item.nombrejours);
            }
            if (type.indexOf('zonedelivraison') !== -1) {
                //update_zonedelivraison
                $('#designation_' + type).val(item.designation);
                $('#montant_' + type).val(item.montant);
                $scope.dataInTabPane['zonedelivraison_entite']['data'] = item.zone_de_livraison_entites
            }
            if (type.indexOf('typeoperateur') !== -1) {
                //update_typeoperateur
                $('#designation_' + type).val(item.designation);
            }
            if (type.indexOf('r2adepaie') !== -1) {
                //update_typeoperateur
                $('#date_' + type).val(item.date).trigger('change');
                $('#contrat_' + type).val(item.contrat_id).trigger('change');
                $scope.dataInTabPane['r2adepaie_motif']['data'] = item.detail_r2a_de_paie
                $scope.ChoisireCalculerMontantR2aDePaie()
            }
            if (type.indexOf('typecontrat') !== -1) {
                //update_typecontrat
                $('#designation_' + type).val(item.designation);
            }
            if (type.indexOf('contrat') !== -1) {
                //update_typecontrat
                $('#montant_' + type).val(item.montant);
                $('#typecontrat_' + type).val(item.type_contrat_id).trigger('change');
                $('#employe_' + type).val(item.employe_id).trigger('change');
                $('#datedebut_' + type).val(item.date_debut).trigger('change');
                $('#datefin_' + type).val(item.date_fin).trigger('change');
                $('#description_' + type).val(item.description);

            }
            if (type == 'facture' || type == 'factures') {
                //update_facture
                $('#designation_' + type).val(item.designation);
            }
            if (type == 'facturetraiteur' || type == 'facturetraiteurs') {
                //update_facture
                $('#designation_' + type).val(item.designation);
            }
            if (type.indexOf('typedepot') !== -1) {
                //update_typedepot
                $('#designation_' + type).val(item.designation);
                $('#peut_vendre_' + type).prop('checked', item.peut_vendre);
            }
            else if (type.indexOf('depot') !== -1) {
                //update_depot
                $('#designation_' + type).val(item.designation);
                $('#type_depot_id_' + type).val(item.type_depot_id).trigger('change');
                $('#entite_id_' + type).val(item.entite_id).trigger('change');
                $('#peut_vendre_' + type).prop('checked', item.peut_vendre).change();
            }
            if (type.indexOf('user') !== -1) {
                //update_user
                $('#name_' + type).val(item.name);
                $('#email_' + type).val(item.email);
                $('#role_' + type).val(item.roles && item.roles.length > 0 ? item.roles[0].id : null).trigger('change');
                //$('#entite_id_' + type).val(item.entite_id).trigger('change');

                var selectedValuesEntite = new Array();
                if (item.user_avec_entites) {
                    item.user_avec_entites.forEach((item) => {
                        selectedValuesEntite.push(item.entite_id);
                    });
                }
                var selectedValuesCaisse = new Array();
                if (item.user_caisses) {
                    item.user_caisses.forEach((item) => {
                        selectedValuesCaisse.push(item.caisse_id);
                    });
                }
                $('#entite_' + type).val(selectedValuesEntite).trigger('change');
                $('#caisse_' + type).val(selectedValuesCaisse).trigger('change');

                var rewriteReq = "userdepartements(user_id:" + item.id + ")";
                Init.getElement(rewriteReq, listofrequests_assoc["userdepartements"]).then(function (data) {
                    if (data && data.length > 0) {
                        $scope.dataInTabPane['user_departement_user']['data'] = data;
                    }

                }, function (msg) {
                    toastr.error(msg);
                });


            }
            if (type.indexOf('pointvente') !== -1) {
                //update_pointvente
                $('#raison_sociale' + type).val(item.nom);
                $('#adresse_' + type).val(item.adresse);
                $('#email_' + type).val(item.email);
                $('#telephone_' + type).val(item.telephone);
                $('#ninea_' + type).val(item.ninea);
                $('#rcm_' + type).val(item.rcm);
                // $('#affimg' + type).attr('src', (item.image ? item.image : imgupload));

            }
            else if (type.indexOf('entite') !== -1) {
                //update_entite
                $('#designation_' + type).val(item.designation);
                $('#telephone_' + type).val(item.telephone);
                $('#ninea_' + type).val(item.ninea);
                $('#rc_' + type).val(item.rc);
                $('#adresse_' + type).val(item.adresse);
                $('#description_' + type).val(item.description);
                $('#peut_livrer_' + type).prop('checked', item.peut_livrer);
            }
            else if (type.indexOf('typeclient') !== -1) {
                //update_typeclient
                $('#designation_' + type).val(item.designation);
                $('#option_affiliation_' + type).prop('checked', item.option_affiliation);
                $('#credit_autorise_non_cumulable_' + type).prop('checked', item.credit_autorise_non_cumulable);
                $('#rccm_' + type).val(item.rccm);
            }
            else if (type.indexOf('devise') !== -1) {
                //update_devise
                $('#nom_' + type).val(item.nom);
                $('#tauxchange_' + type).val(item.taux_change);
            }
            else if (type.indexOf('unitemesure') !== -1) {
                //update_unitemesure
                $('#nom_' + type).val(item.nom);
                $('#abreviation_' + type).val(item.abreviation);
            }
            else if (type == 'fournisseur') {
                //update_fournisseur
                $scope.ligneinformationbanquaires = item.information_bancaires;
                $scope.lignecontacts = item.contacts;
                $('#designation_' + type).val(item.designation);
                $('#adresse_' + type).val(item.adresse);
                $('#email_' + type).val(item.email);
                $('#telephone_' + type).val(item.email);
                $('#devise_' + type).val(item.devise_id).change();
                $('#type_' + type).val(item.type_tier_id).change();
                $('#categorie_' + type).val(item.categorie_fournisseur_id).change();
                $('#facturetva_' + type).prop('checked', item.facture_tva);
                $('#compta_hors_compta_' + type).prop('checked', item.compta_hors_compta);
                $scope.dataInTabPane['adrlivs_fournisseur']['data'] = item.contacts;
                $scope.dataInTabPane['compte_sage_fournisseur']['data'] = item.compte_sages;

            }
            else if (type.indexOf('ordreachat') !== -1 || type.indexOf('boncommande') !== -1 || type.indexOf('reception') !== -1 || type.indexOf('reception') !== -1 || type.indexOf('assemblage') !== -1) {
                var forceChangeForm = optionals.forceChangeForm;

                if (type.indexOf('ordreachat') !== -1 || (optionals.transformToType && optionals.transformToType == 'boncommande')) {
                    details = item.detail_ordre_achats;
                    if ((optionals.transformToType && optionals.transformToType == 'boncommande')) {
                        $.each(details, function (keyItem, valueItem) {
                            details[keyItem].impact_po = false;
                        });
                    }
                } else if (type.indexOf('boncommande') !== -1 || (optionals.transformToType && optionals.transformToType == 'reception')) {
                    details = item.detail_bon_commandes;
                } else if (type.indexOf('assemblage') !== -1) {
                    details = item.detail_assemblages;
                }

                // Dans le cas d'une transformation PO => BC
                if (optionals.transformToType) {
                    $(`#${tmpType}_${type}`).val(item.id);
                }

                $scope.dataInTabPane['details_' + type]['data'] = details;
                console.log('details*******************', $scope.dataInTabPane['details_' + type]['data']);

                if (item.fournisseur) {
                    $scope.dataPage['fournisseurs'] = [];
                    $scope.dataPage['fournisseurs'].push(item.fournisseur);
                    $('#fournisseur_' + type).val(item.fournisseur_id).attr('disabled', forceChangeForm).change();

                    setTimeout(function () {
                        $('#devise_' + type).val(item.devise_id).attr('disabled', forceChangeForm).change();
                    }, 1500);
                }

                $('#date_' + type).val(item.date_fr);
                $('#code_' + type).val(item.code);
                $('#description_' + type).val(item.description);
                $('#depot_' + type).val(item.depot_id).attr('disabled', forceChangeForm).change();
            }
            else if (type.indexOf('motif') !== -1) {
                //update_motif
                $('#nom_' + type).val(item.nom);
                $('#description_' + type).val(item.description);
                $('#compte_debit_' + type).val(item.compte_debit);
                $('#compte_credit_' + type).val(item.compte_credit);
            }
            else if (type.indexOf('typeclient') !== -1) {
                //update_typeclient
                $('#nom_' + type).val(item.nom);
                $('#compte_' + type).val(item.compte);
            }
            else if (type.indexOf('categorieclient') !== -1) {
                //update_categorieclient
                $('#nom_' + type).val(item.nom);
                $('#couleur_' + type).val(item.couleur);
                $('#description_' + type).val(item.description);
            }
            else if (type === 'clientmarket') {
                //update_clientmarket
                console.log('---------Client-----------');
                console.log(item);
                $scope.dataInTabPane['adrlivs_client']['data'] = item.adresses;
                $scope.dataInTabPane['contacts_client']['data'] = item.contacts;
                $('#id_' + type).val(item.id);
                if ($scope.client && $scope.client.id) {
                    $('#client_id_commande').val($scope.client.id);
                }
                $('#nom_' + type).val(item.raison_sociale);
                $('#adresse_' + type).val(item.adresse);
                $('#telephone_' + type).val(item.telephone);
                var value;
                if (item.civilite == 'Mr') {
                    value = '2';
                } else if (item.civilite == 'Mme') {
                    value = '1';
                } else if (item.civilite == 'Mlle') {
                    value = '3';
                }
                $("input[name=civilite][value=" + value + "]").prop('checked', true).change();
                $('#dette_client_' + type).val(item.dette_client);
                $('#ninea_' + type).val(item.ninea);
                $('#rcc_' + type).val(item.rcc);
                $('#email_' + type).val(item.email);
                if (item.type_client) {
                    $('#typeclient_' + type).val(item.type_client.id).change();
                }
                if (item.entite) {
                    $('#entite_' + type).val(item.entite.id).change();
                }
                $('#remise_autorise_' + type).prop('checked', item.remise_autorise).change();
                $('#plafond_credit_autorise_' + type).prop('checked', item.plafond_credit_autorise).change();
                $('#exonorer_tva_' + type).prop('checked', item.exonorer_tva).change();
                $('#dette_' + type).val(item.dette_client);
                $('#note_' + type).val(item.notes);
                $('#remise_value_' + type).val(item.remise_value);
                $('#plafond_value_' + type).val(item.plafond_value);
                $scope.updateCheck('remise_autorise_client', 'clientmarket');
                $scope.updateCheck('plafond_credit_autorise_client', 'clientmarket');
                if (item.affilier_id) {
                    $scope.editInSelect2('client', item.affilier_id, type);
                }
                $scope.dataInTabPane['compte_sage_client']['data'] = item.compte_sages;
            }
            else if (type === 'client') {
                //update_client
                console.log('---------Client-----------');
                console.log(item);
                $scope.dataInTabPane['adrlivs_client']['data'] = item.adresses;
                $scope.dataInTabPane['contacts_client']['data'] = item.contacts;
                $('#id_' + type).val(item.id);
                if ($scope.client && $scope.client.id) {
                    $('#client_id_commande').val($scope.client.id);
                }
                $('#nom_' + type).val(item.raison_sociale);
                $('#adresse_' + type).val(item.adresse);
                $('#telephone_' + type).val(item.telephone);
                var value;
                if (item.civilite == 'Mr') {
                    value = '2';
                } else if (item.civilite == 'Mme') {
                    value = '1';
                } else if (item.civilite == 'Mlle') {
                    value = '3';
                }
                $("input[name=civilite][value=" + value + "]").prop('checked', true).change();
                $('#dette_client_' + type).val(item.dette_client);
                $('#ninea_' + type).val(item.ninea);
                $('#rcc_' + type).val(item.rcc);
                $('#email_' + type).val(item.email);
                if (item.type_client) {
                    $('#typeclient_' + type).val(item.type_client.id).change();
                }
                if (item.entite) {
                    $('#entite_' + type).val(item.entite.id).change();
                }
                $('#remise_autorise_' + type).prop('checked', item.remise_autorise).change();
                $('#plafond_credit_autorise_' + type).prop('checked', item.plafond_credit_autorise).change();
                $('#exonorer_tva_' + type).prop('checked', item.exonorer_tva).change();
                $('#dette_' + type).val(item.dette_client);
                $('#note_' + type).val(item.notes);
                $('#remise_value_' + type).val(item.remise_value);
                $('#plafond_value_' + type).val(item.plafond_value);
                $scope.updateCheck('remise_autorise_client', 'client');
                $scope.updateCheck('plafond_credit_autorise_client', 'client');
                if (item.affilier_id) {
                    $scope.editInSelect2('client', item.affilier_id, type);
                }
                $scope.dataInTabPane['compte_sage_client']['data'] = item.compte_sages;
                $scope.dataInTabPane['datecles_client']['data'] = item.dateclemotifs;
            }
            else if (type.indexOf('adresse') !== -1) {
                //update_adresse
                $('#designation_' + type).val(item.designation);
                $('#par_defaut_' + type).prop('checked', item.par_defaut);
                $('#client_' + type).val(item.client_id);
            }
            else if (type.indexOf('contact') !== -1) {
                //update_contact
                $('#nomcomplet_' + type).val(item.nomcomplet);
                $('#telephone_' + type).val(item.telephone);
                $('#email_' + type).val(item.email);
                $('#par_defaut_' + type).prop('checked', item.par_defaut);
                $('#client_' + type).val(item.client_id);
                $('#fournisseur_' + type).val(item.fournisseur_id);
            }
            if (type.indexOf('tag') !== -1) {
                //update_tag
                $('#id_' + type).val(item.id);
                $('#designation_' + type).val(item.designation);
                $('#couleur_' + type).val(item.couleur);
                $('#ca_alert_' + type).val(item.ca_alert);

            }
            if (type.indexOf('tagclient') !== -1) {
                //update_tagclient
                console.log('----------Je suis tagclient--------');
                console.log(type);
                console.log(type.indexOf('tag'));
                console.log(item);
                $('#id_' + type).val(item.id);
                $('#tag_id_' + type).val(item.tag_id).change();
                $scope.editInSelect2('client', item.client_id, type);
            }
            else if (type.indexOf('dateclemotif') !== -1) {
                //update_dateclemotif
                console.log(item);
                $('#id_' + type).val(item.id);
                $('#motif_' + type).val(item.motif).change();
                $('#observation_' + type).val(item.observation);
                $('#date_' + type).val(item.date_en).trigger('change');
                $('#type_evenement_id_' + type).val(item.type_evenement_id).change();
                $scope.editInSelect2('client', item.client_id, type);
                // $('#client_id_' + type).val(item.client_id).trigger('change');

            }
            else if (type.indexOf('typeproduit') !== -1) {
                //update_typeproduit
                $('#id_' + type).val(item.id);
                $('#designation_' + type).val(item.designation).change();
                $('#impact_economa_' + type).prop('checked', item.impact_economa);
                $('#pour_production_' + type).prop('checked', item.pour_production);
                $('#pour_logistique_' + type).prop('checked', item.pour_production);

                $scope.dataInTabPane['typedepot_typeproduit']['data'] = item.type_produit_type_depots
                //$('#famille_' + type).prop('checked', item.famille_id);
            }
            else if (type == 'categorieproduit') {
                //update_categorieproduit
                $('#id_' + type).val(item.id);
                $('#designation_' + type).val(item.designation);
                $('#description_' + type).val(item.description);
                $('#ordre_' + type).val(item.ordre);
                $('#show_web_site_' + type).prop('checked', item.show_web_site);
            }
            else if (type == 'souscategorieproduit') {
                //update_souscategorieproduit
                $('#id_' + type).val(item.id);
                $('#designation_' + type).val(item.designation);
                $('#description_' + type).val(item.description);
                $('#ordre_' + type).val(item.ordre);
                $('#show_web_site_' + type).prop('checked', item.show_web_site);
                //$scope.editInSelect2('categorieproduit', item.parent_id, type);
                $('#parent_id_' + type).val(item.parent_id).trigger('change');
            }
            else if (type.indexOf('famille') !== -1 && type.indexOf('sous') === -1) {
                //update_famille
                $('#id_' + type).val(item.id);
                $('#diminutif_' + type).val(item.diminutif);
                $('#designation_' + type).val(item.designation);
                $('#mode_affichage_web_' + type).val(item.mode_affichage_web).change();
                $('#show_web_site_' + type).prop('checked', item.show_web_site);
                $('#option_carte_' + type).prop('checked', item.option_carte);
                $('#matiere_premiere_' + type).prop('checked', item.matiere_premiere);
                $('#couleur_' + type).val(item.couleur);
            }
            else if (type.indexOf('sousfamille') !== -1) {
                //update_sousfamille
                console.log(item);
                console.log(type);
                $('#id_' + type).val(item.id);
                $('#designation_' + type).val(item.designation).change();
                $('#mode_affichage_web_' + type).val(item.mode_affichage_web).change();
                $('#show_web_site_' + type).prop('checked', item.show_web_site);
                $('#option_carte_' + type).prop('checked', item.option_carte);
                $scope.editInSelect2('famille', item.parent_famille_id, type);

                //$('#famille_id_' + type).val(item.parent_famille_id ? item.parent_famille_id : null).change();
            }
            else if (type.indexOf('departement') !== -1 && type.indexOf('sous') === -1) {
                //update_departement
                $('#id_' + type).val(item.id);
                $('#designation_' + type).val(item.designation).change();
                $('#code_' + type).val(item.code).change();
                $('#famille_' + type).prop('checked', item.famille_id);
            }
            else if (type.indexOf('sousdepartement') !== -1) {
                //update_sousdepartement
                $('#id_' + type).val(item.id);
                $('#designation_' + type).val(item.designation).change();
                $('#code_' + type).val(item.code).change();
                $('#departement_id_' + type).val(item.parent.id).change();
                $('#famille_' + type).prop('checked', item.famille_id);
            }
            else if (type.indexOf('souszone') !== -1) {
                $('#id_' + type).val(item.id);
                $('#designation_' + type).val(item.designation);
                $('#zone_id_' + type).val(item.zone_id).trigger('change');
                $('#entite_' + type).val(item.entite_id).trigger('change');

            }
            else if (type.indexOf('zone') !== -1) {
                $('#id_' + type).val(item.id);
                $('#designation_' + type).val(item.designation);
                $('#entite_' + type).val(item.entite_id).trigger('change');

            }
            else if (type.indexOf('propositionr2atechnique') !== -1) {
                //update_propositionr2atechnique
                $('#id_' + type).val(item.id);
                $('#designation_' + type).val(item.designation).change();
                $('#entite_id_' + type).val(item.entite_id).change();
                $('#bci_id_' + type).val(item.bci_id).change();
                $('#proforma_id_' + type).val(item.proforma_id).change();
            }
            else if (type.indexOf('produit') !== -1) {
                //update_produit
                console.log(item);
                $('#id_' + type).val(item.id);
                $('#code_' + type).val(item.code);
                $('#code_externe_' + type).val(item.code_externe).change();
                $('#designation_' + type).val(item.designation).change();
                $('#diminutif_' + type).val(item.diminutif).change();
                $('#achatTTC_' + type).prop('checked', item.achatTTC);
                $('#prix_achat_unitaire_' + type).val(item.prix_achat_unitaire).change();
                $('#prix_transfert_unitaire_' + type).val(item.prix_transfert_unitaire).change();
                $('#prix_achat_ttc_' + type).val(item.prix_achat_ttc).change();
                $('#pmp_achat_' + type).val(item.pmp_achat).change();
                $('#pmp_ttc_' + type).val(item.pmp_ttc).change();
                $('#prix_achat_unitaire_off_' + type).val(item.prix_achat_unitaire_off);
                $('#prix_de_revient_unitaire_' + type).val(item.prix_de_revient_unitaire);
                $('#prix_de_revient_unitaire_off_' + type).val(item.prix_de_revient_unitaire_off);
                $('#prix_de_revient_unitaire_total_produit').val(item.prix_de_revient_unitaire);
                $('#prix_promo_' + type).val(item.prix_promo).change();
                $('#conditionnement_' + type).val(item.conditionnement).change();
                $('#poids_' + type).val(item.poids).change();
                $('#volume_' + type).val(item.volume).change();
                $('#date_debut_promo_' + type).val(item.date_debut_promo).trigger('change');
                $('#date_fin_promo_' + type).val(item.date_fin_promo).trigger('change');
                $('#pour_production_' + type).prop('checked', item.pour_production);
                $('#livraisoncoursier_' + type).prop('checked', item.livraisoncoursier);
                $('#clickcollect_' + type).prop('checked', item.clickcollect);
                $('#detail_' + type).val(item.detail);
                $('#allergene_' + type).val(item.allergene);
                $('#ingredient_' + type).val(item.ingredient);

                $('#ft_pv_ttc_' + type).val(item.ft_pv_ttc);

                $('#typeproduit_' + type).val(item.typeproduit_id).change();
                $('#categorieproduit_' + type).val(item.categorieproduit_id).change();
                $('#unite_de_mesure_' + type).val(item.unite_de_mesure_id).change();
                $('#nomenclature_' + type).val(item.nomenclature_id).change();
                if (item.famille_id) {
                    $scope.editInSelect2Costum('famille', item.famille_id, type);
                }
                if (item.sousfamille_id) {
                    $scope.editInSelect2Costum('famille', item.sousfamille_id, type);
                }
                //  $('#famille_' + type).val(item.famille_id).change();
                //$('#sousfamille_' + type).val(item.sousfamille_id).change();
                $('#departement_' + type).val(item.departement_id).trigger('change');
                $('#sousdepartement_' + type).val(item.sousdepartement_id).trigger('change');
                $('#type_de_conservation_' + type).val(item.type_de_conservation_id).trigger('change');
                $('#zone_de_stockage_' + type).val(item.zone_de_stockage_id).trigger('change');
                $('#depot_' + type).val(item.depot_id).trigger('change');
                $('#part_' + type).val(item.part_id).trigger('change');
                $('#poids_' + type).val(item.poids);
                $('#taille_' + type).val(item.taille);
                $('#conservation_' + type).val(item.conservation);
                $('#dernier_arrivage_' + type).val(item.dernier_arrivage);
                $('#coef_' + type).val(item.coef);
                $('#coef_off_' + type).val(item.coef_off);
                $('#current_quantity_' + type).val(item.current_quantity);
                $('#cump_off_' + type).val(item.cump_off);
                $('#valorisation_bar_' + type).val(item.valorisation_bar);
                $('#cump_' + type).val(item.cump);
                $('#valorisation_ttc_' + type).val(item.valorisation_ttc);
                // $('#parent_' + type).val(item.parent_id).change();
                if (item.parent_id) {
                    $scope.editInSelect2('produit', item.parent_id, type);
                }

                //Pour les images
                for (var i = 1; i <= 4; i++) {
                    var valeur = undefined;
                    var suffixe = 'img' + i + type;
                    if (i == 1 && item.image1) {
                        valeur = item.image1;
                    }
                    if (i == 2 && item.image2) {
                        valeur = item.image2;
                    }
                    if (i == 3 && item.image3) {
                        valeur = item.image3;
                    }
                    if (i == 4 && item.image4) {
                        valeur = item.image4;
                    }

                    if (valeur) {
                        $scope.addfield('produit', valeur);
                        $('#' + suffixe)
                            .val("")
                            .attr('required', false).removeClass('required');
                        //$('#affimg1' + type).attr('src', (item.image1 ? item.image1 : imgupload));
                        //$('#aff' + suffixe).attr('src', (valeur ? valeur : imgupload));
                    }
                }

                if (item.prixdeventes && item.prixdeventes.length > 0) {

                    $.each(item.prixdeventes, function (keyItem, oneItem) {
                        console.log(oneItem);
                        var search = $filter('filter')($scope.dataInTabPane['prixventes_produit']['data'], { type_prix_de_vente_id: oneItem.type_prix_de_vente_id });
                        console.log(search);

                        if (search && search.length > 0) {
                            let index = $scope.dataInTabPane['prixventes_produit']['data'].indexOf(search[0]);
                            if (index > -1) {
                                $scope.dataInTabPane['prixventes_produit']['data'][index] = {
                                    "type_prix_de_vente_id": oneItem.type_prix_de_vente_id,
                                    "type_prix_de_vente": oneItem.type_prix_de_vente,
                                    "montant": oneItem.montant
                                }
                            }

                        }
                    });

                    // $scope.dataInTabPane['prixventes_produit']['data'] = $scope.dataInTabPane['prixventes_produit']['data'].concat(item.prixdeventes);
                }

                //R2a technique produit
                $scope.dataInTabPane['r2atechniques_produit']['data'] = item.r2atechniques;
                $scope.dataInTabPane['valeursft_produit']['data'].produit_id = item.id;
                $scope.dataInTabPane['valeursft_produit']['data'].nombre_portion = item.nombre_portion;
                $scope.dataInTabPane['valeursft_produit']['data'].ft_tva = item.ft_tva;
                $scope.dataInTabPane['valeursft_produit']['data'].ft_total_pr = item.ft_total_pr;
                $scope.dataInTabPane['valeursft_produit']['data'].ft_total_pr_off = item.ft_total_pr_off;
                $scope.dataInTabPane['valeursft_produit']['data'].ft_pv_ttc = item.ft_pv_ttc;
                $scope.dataInTabPane['valeursft_produit']['data'].ft_pv_ht = item.ft_pv_ht;
                $scope.dataInTabPane['valeursft_produit']['data'].ft_taux_marque_ht = item.ft_taux_marque_ht;
                $scope.dataInTabPane['valeursft_produit']['data'].ft_taux_marque_ht_off = item.ft_taux_marque_ht_off;
                $scope.dataInTabPane['valeursft_produit']['data'].ft_taux_marque_ttc_off = item.ft_taux_marque_ttc_off;
                $scope.donneTotalR2aTechnique();

                //Founisseur & prix d'achat
                $scope.dataInTabPane['prixachats_produit']['data'] = item.fournisseurproduits;

                //Allergenes
                $scope.dataInTabPane['allergenes_produit']['data'] = item.allergeneproduits;

                //Emballages
                $scope.dataInTabPane['emballages_produit']['data'] = item.emballageproduits;

                //Emballages
                $scope.dataInTabPane['emballages_produit']['data'] = item.emballageproduits

                //Famille liaison
                $scope.dataInTabPane['familleliaisons_produit']['data'] = item.famille_liaison_produits;

                //Seuil
                $scope.dataInTabPane['entiteproduits_produit']['data'] = item.entite_produits && item.entite_produits;


            }
            else if (type == "logistique") {
                //update_logistique
                console.log(item);
                $('#id_' + type).val(item.id);
                $('#designation_' + type).val(item.designation)
                $('#prix_' + type).val(item.prix_achat_unitaire)
                $('#description_' + type).val(item.description)
                $('#typelogistique_' + type).val(item.typeproduit_id).change();
                $('#famille_materiel_id_' + type).val(item.famille_materiel_id).change();

            }
            else if (type.indexOf("role") !== -1) {
                //update_role
                $('#name_' + type).val(item.name);
                $scope.roleview = item;
                $scope.role_permissions = [];
                $.each($scope.roleview.permissions, function (key, value) {
                    $scope.role_permissions.push(value.id);
                });
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
    $scope.showModalAdd = function (type, optionals = { is_file_excel: false, title: null, fromUpdate: false }, item = null) {
        $scope.update = false;
        $scope.famille_carte_clicked = null;
        $scope.famille_bci_produit = null;
        $scope.traiteur = null;
        $scope.is_checked = false;
        $scope.clonange = false
        $scope.BciIdClonned = null
        $scope.montantbci = 0
        $scope.montantbce = 0
        $scope.montantR2a = 0
        $('.unite-mesure').val('');
        $('#toutcocher').prop('checked', false);
        $('#difference_produits_inventaire').prop('readonly', true);
        $('#difference_produits_inventaire').prop('disabled', true);
        $('#difference_produits_inventaire').attr('disabled', true);
        $('#difference_produits_inventaire').attr('readonly', true);


        $('.quantite-theorique').val('');
        $scope.currentTitleModal = optionals.title;
        if ($('#pane-sousfamilleproduits').hasClass('active')) {
            type = "sousfamilleproduit";
            $scope.currentTitleModal = "Sous famille de produit";
        }
        $scope.dataInTabPane['zonedelivraison_entite']['data'] = []
        $scope.dataInTabPane['r2adepaie_motif']['data'] = []
        $scope.currentTypeModal = type;
        $scope.emptyform((optionals.is_file_excel ? 'liste' : type));
        $scope.emptyform('zonedelivraison_entite');
        if (!optionals.is_file_excel) {
            if (type == 'paiement' && item != null) {
                $scope.pageChanged('paiement');
                $scope.getelements('modepaiements');
                rewriteReq = 'commandes(id:' + item.id + ')';
                $('#modal_add' + 'paiement').blockUI_start();
                Init.getElement(rewriteReq, listofrequests_assoc['commandes']).then(function (data) {
                    $("#montant_total_offert_paiement").val(data[0].montant_offert ? data[0].montant_offert : 0);
                    $("#id_commande_paiement").val(data[0].id);
                    $("#montant_a_payer_paiement").val(data[0].restant_payer_format ? data[0].restant_payer_format : 0);
                    $("#montant_total_payé_paiement").val(data[0].montant_total_paye ? data[0].montant_total_paye : 0);
                    //   $("#restaurant_paiement").val(data[0].entite ? data[0].entite.designation : '');
                    $scope.restaurant_paiement = data[0].entite ? data[0].entite.designation : '';
                    $scope.dataInTabPane['produits_commande_paiement']['data'] = data[0].produits ? data[0].produits : [];
                    $('#modal_add' + 'paiement').blockUI_stop();
                },
                    err => {
                        $('#modal_add' + 'paiement').blockUI_stop();
                    })

            }
            if (type.indexOf('user') !== -1) {
                $scope.getelements('departements');
            }
            if (type == 'client') {
                if ($scope.currentTemplateUrl == 'list-commande' || $scope.currentTemplateUrl == 'list-proforma') {
                    $scope.getelements('societefacturations');
                    $scope.getelements('typeclients');
                    $scope.getelements('entites');
                    $scope.getelements('conditionreglements');
                    $scope.getelements('zonedelivraisons');
                    $scope.getelements('typeevenements');
                    $scope.getelements('emballages');
                }


            }
            if ($scope.currentTemplateUrl == 'list-produit-ingredient' || $scope.urlCourantContient('produit-ingredient') == true) {
                var typeProduit = $scope.getTypeProduitByTextId($scope.dataPage['typeproduits'], 'matieres_premieres');
                if (typeProduit && typeProduit.id) {
                    $('#typeproduit_produit').val(typeProduit.id).trigger('change');
                    $scope.updateCheckProduit();
                }
            }
            if ($scope.currentTemplateUrl == 'list-produit-recette' || $scope.urlCourantContient('produit-recette') == true) {
                var typeProduit = $scope.getTypeProduitByTextId($scope.dataPage['typeproduits'], 'produits_de_vente');
                if (typeProduit && typeProduit.id) {
                    $('#typeproduit_produit').val(typeProduit.id).trigger('change');
                    $scope.updateCheckProduit();
                }
            }
            if (type == 'proforma') {
                $scope.client_traiteur = null;

                if ($scope.dataInTabPane['item_tab_panes_r2a_proforma']['data'].length <= 0) {

                    $(".item_tab_panes_r2a_proforma").fadeOut('slow');
                }

                if ($scope.dataInTabPane['item_tab_panes_rh_proforma']['data'].length <= 0) {
                    $(".item_tab_panes_rh_proforma").fadeOut('slow');
                }
                $("#r2aproforma").fadeOut('slow');
                $("#log").fadeOut('slow');
                $("#rh").fadeOut('slow');
                $("#depense").fadeOut('slow');
                $("#doc").fadeOut('slow');
            }
            if (type.indexOf('bci') !== -1) {
                $('#date_operation_' + type).val($scope.getDatePlus(true)).trigger('change');
            }
            if (type == "inventaire") {
                var date = $scope.getDatePlus(false);
                console.log('--------la date----------');
                console.log(date);
                $('#date_' + type).val(date).trigger('change');
                $("#quantite_theorique_produits_" + type).attr("disabled", true);
            }
            if (type.indexOf('carte') !== -1) {
                $scope.paginations['produit'].currentPage = 1;

            }
            if (type.indexOf('menu') !== -1) {
                $scope.reInit();
                $scope.dataPage['famille_menus'] = [];
                $scope.dataPage['produits'] = [];
                $scope.paginations =
                {
                    "produit": {
                        currentPage: 1,
                        maxSize: 3,
                        entryLimit: 3,
                        totalItems: 0
                    },
                }

            }
            else if (type.indexOf('produit') !== -1) {
                $scope.dataInTabPane['valeursft_produit']['data'] = [];
                $scope.dataInTabPane['prixventes_produit']['data'] = [];
                $scope.dataInTabPane['prixachats_produit']['data'] = [];
                $scope.dataInTabPane['allergenes_produit']['data'] = [];
                $scope.dataInTabPane['emballages_produit']['data'] = [];
                $scope.dataInTabPane['compositions_produit']['data'] = [];
                $scope.dataInTabPane['familleliaisons_produit']['data'] = [];
                $scope.dataInTabPane['r2atechniques_produit']['data'] = [];
                $scope.dataInTabPane['entiteproduits_produit']['data'] = [];
                $scope.dataInTabPane['produits_commande']['data'] = [];

                $.each($scope.dataPage['typeprixdeventes'], function (keyItem, oneItem) {
                    $scope.dataInTabPane['prixventes_produit']['data'].push({
                        "type_prix_de_vente_id": oneItem.id,
                        "type_prix_de_vente": { designation: oneItem.designation },
                        "montant": 0
                    });
                });

                if (optionals && !optionals.fromUpdate) {

                }
            }
            else if (type == 'commande') {

                $scope.reInit();
                $scope.reservation = null;
                $scope.reservation_commande = null;
                $scope.client = null;
                $scope.client_reservation = null;

                $scope.client_reservation = null;
                $scope.client_id_commande = null;
                $scope.client_passage = null;
                //Produit paginatioon
                $scope.paginations["produit"].maxSize = 6;
                $scope.paginations["produit"].entryLimit = 6;

                // papa thiam
                $scope.paginations["menu"].maxSize = 6;
                $scope.paginations["menu"].entryLimit = 6;

                //Famille pagination
                $scope.paginations["famille"].maxSize = 12;
                $scope.paginations["famille"].entryLimit = 12;

                //Table pagination
                $scope.paginations["table"].maxSize = 10;
                $scope.paginations["table"].entryLimit = 10;
                $scope.restaurant_commande = null;
                if (optionals.fromUpdate == false) {

                    if ($scope.dataPage['entites'] && $scope.dataPage['entites'].length == 1) {
                        var entite = $scope.dataPage['entites'][0];
                        $("#entite_" + type).val(entite.id).trigger('change');
                        $scope.restaurant_commande = entite.id;
                        $scope.entite = entite.id;
                        $scope.getTableEntite(entite.id);
                    }
                    $scope.itemSelected = 'type_commande';
                    $scope.image = '';
                    $scope.dataPage['adresse_livraison'] = [];
                    $scope.adresse_de_livraison_commande = null;
                } else {
                    $scope.type_commande = 'info_commande';
                    $scope.itemSelected = 'info_commande';
                }


            }
            else if (type.indexOf('reservation') !== -1) {
                $scope.entite_reservation = null;
                $scope.currentTable = null;
                $scope.dataPage['tables'] = [];
                $scope.nombre_couverts_reservation = null;
                var entite = $scope.dataPage['entites'][0];
                $("#entite_" + type).val(entite.id).trigger('change');
                $scope.paginations["table"].maxSize = 10;
                $scope.paginations["table"].entryLimit = 10;
                $scope.getTableEntite(entite.id);
            }
            else if (type.indexOf('role') !== -1) {
                $scope.roleview = null;
                $scope.role_permissions = [];
                $scope.getelements('permissions');
                //     $scope.emptyform('permission', true);
            }
            else if (type.indexOf('entite') !== -1) {

            }
            else if (type.indexOf('client') !== -1) {
                $scope.getelements('typeclients');
                //$scope.getelements('entites');
            }
            else if (type.indexOf('planing') !== -1) {
                if (optionals.fromUpdate == false) {
                    $scope.chargerDonnees('departement', 'planing');
                }
            }
            if (type.indexOf('tagclient') !== -1) {
            }
            if (type.indexOf('dateclemotif') !== -1) {
                $scope.getelements('typeevenements');
                console.log('--------je suis date cle dans client -----------');
                console.log($scope.param);
                $("#client_" + type).val($scope.param).trigger('change');

            }
            if (type == 'modepaiement') {
                $scope.modepaiement = null;
            }
            if (type == 'paiement') {
                setTimeout(function () {
                    $("#montant_a_payer_paiement").attr("disabled", true);
                    $("#montant_total_paiement").attr("disabled", true);
                    $("#montant_total_payé_paiement").attr("disabled", true);
                }, 700)
                $scope.modepaiement = null;
            }
            if (type == 'paiementfacture') {

                if (item) {
                    //$("facture_id_"+type).val(item.id);
                    $scope.dataInTabPane['facture_paiementfacture']['data'].id = item.id;
                    $scope.dataInTabPane['facture_paiementfacture']['data'].montant = item.montant;
                    $scope.dataInTabPane['facture_paiementfacture']['data'].deja_paye = item.deja_paye;
                    $scope.dataInTabPane['facture_paiementfacture']['data'].restant_paye = item.restant_paye;
                }
            }
            if (type == 'reglement') {
                if (item) {
                    var itemDepense = item;
                    if (optionals && optionals.fromUpdate == true) {
                        itemDepense = item.depense;
                    }
                    //$("facture_id_"+type).val(item.id);
                    $scope.dataInTabPane['depense_reglement']['data'].id = itemDepense.id;
                    $scope.dataInTabPane['depense_reglement']['data'].montant = itemDepense.montant;
                    $scope.dataInTabPane['depense_reglement']['data'].deja_paye = itemDepense.deja_paye;
                    $scope.dataInTabPane['depense_reglement']['data'].restant_paye = itemDepense.restant_paye;
                }
            }
            if (type == 'suivicommande') {
                if (item) {
                    var itemCommande = item;
                    if (optionals && optionals.fromUpdate == true) {
                        itemCommande = item.commande;
                    }
                    //$("facture_id_"+type).val(item.id);
                    $scope.dataInTabPane['commande_suivicommande']['data'].id = itemCommande.id;
                    $scope.dataInTabPane['commande_suivicommande']['data'].montant = itemCommande.suivi_id;
                }
            }
            if (type == 'paiementbc') {

                if (item) {
                    $scope.dataInTabPane['bce_paiementbc']['data'].id = item.id;
                    $scope.dataInTabPane['bce_paiementbc']['data'].montant = item.montant;
                    $scope.dataInTabPane['bce_paiementbc']['data'].deja_paye = item.deja_paye;
                    $scope.dataInTabPane['bce_paiementbc']['data'].restant_paye = item.restant_paye;
                    $scope.dataInTabPane['bce_paiementbc']['data'].montant_off = item.montant_off;
                    $scope.dataInTabPane['bce_paiementbc']['data'].deja_paye_off = item.deja_paye_off;
                    $scope.dataInTabPane['bce_paiementbc']['data'].restant_paye_off = item.restant_paye_off;
                }
            }
            if (type == 'souspostedepense') {
                $scope.modepaiement = null;
                type = "postedepense";
            }
            if (type == 'depense' && item) {
                $scope.donneCaissesUser();
                $scope.getelements('postedepenses');
                $scope.getelements('modepaiements');
                $scope.getelements('fournisseurs');
                $scope.getelements('entites');
                $("#proforma_id_depense").val(item);
            }
            if (type == 'cloturecaisse') {
                $scope.updateCheck('hebdomadaire_cloturecaisse', 'show-hebdomdaire', 'checkbox', 0, 'hide-hebdomdaire');
            }
            if (type == 'be') {
                $scope.getelements('bces', {}, 'reception:0');
            }
            if (type == 'commande') {
                $scope.dataInTabPane['donnees_commande']['data'].est_proforma = 0;
            }
            if (type == 'proformacommande') {
                $scope.dataInTabPane['donnees_commande']['data'].est_proforma = 1;
                type = 'commande';
            }
        }

        $("#modal_add" + (optionals.is_file_excel ? 'list' : type)).modal('show', {
            backdrop: 'static'
        });
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

    $scope.closeModal = function (idmodal) {
        if ($(idmodal).hasClass('modal') && $(idmodal).hasClass('show')) {

            setTimeout(() => {
                $(idmodal).removeClass('show')

                $(idmodal).removeAttr('style')
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
                // $('[data-modal-replacer="' + $(idmodal).attr('id') + '"]').replaceWith(idmodal)
            }, 200)
        }
    }

    // hide modal link
    $('body').on('click', '[data-dismiss="modal"]', function () {
        let idmodal = $(this).closest('.modal')[0].id

        console.log("ici le modal", idmodal)
        if ($("#" + idmodal).hasClass('modal') && $("#" + idmodal).hasClass('show')) {

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

    $scope.addElement = function (e, type, optionals = { from: 'modal', is_file_excel: false }) {
        if (e != null) {
            e.preventDefault();
        }

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

        if (type.indexOf('zonedelivraison') !== -1) {
            $.each($scope.dataInTabPane['zonedelivraison_entite']['data'], function (keyItem, valueItem) {
                send_data.append('details', JSON.stringify($scope.dataInTabPane['zonedelivraison_entite']['data']));
            });
        }
        if (type.indexOf('r2adepaie') !== -1) {
            $.each($scope.dataInTabPane['r2adepaie_motif']['data'], function (keyItem, valueItem) {
                send_data.append('details', JSON.stringify($scope.dataInTabPane['r2adepaie_motif']['data']));
            });
        }
        if ($scope.clonange == true) {
            send_data.append('bci_id', JSON.stringify($scope.BciIdClonned));
            type = 'bce'
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
                        $scope.getelements('roles');
                    } else if (type == 'validationcloturecaisse') {
                        $scope.pageChanged('cloturecaisse');
                    } else if (type == 'paiement') {

                        $scope.pageChanged('commande');

                        $scope.pageChanged('paiement');

                    } else if (type == 'proforma') {

                        if ($scope.titlePage == 'Traiteurs') {
                            $scope.pageChanged('traiteur');
                        } else {
                            $scope.pageChanged(type);
                        }

                    } else if (type == "lignecredit") {
                        console.log('----------Ligne credit-----------');
                        $scope.pageChanged('lignecredit');
                    }
                    else if (type == "paiementfacture") {
                        $scope.pageChanged('facturetraiteur');
                        $scope.pageChanged('facture');
                    }
                    else if (type == "reglement") {
                        $scope.pageChanged('depense');
                        $scope.pageChanged('reglement');
                    }
                    else if (type == "suivicommande") {
                        $scope.pageChanged('commande');
                    }
                    else if (type == "paiementbc") {
                        $scope.pageChanged('bce');
                    }
                    else if (type == "carte" && optionals.is_file_excel == true) {
                        if (data.data && data.data.length) {
                            data.data.forEach(item => {
                                searchProd = $filter('filter')($scope.dataInTabPane['produits_carte']['data'], { designation: item.designation })
                                if (!searchProd || searchProd.length == 0) {
                                    $scope.dataInTabPane['produits_carte']['data'].push(item);
                                }
                            })
                        }
                    }
                    else if (type == "entreestock") {
                        if ($scope.currentTemplateUrl == 'list-entreestocklogistique') {
                            $scope.pageChanged('entreestocklogistique');
                        } else {
                            $scope.pageChanged('entreestock');
                        }
                    }
                    else if (type == "sortiestock") {
                        console.log('je passe*******', $scope.currentTemplateUrl);
                        if ($scope.currentTemplateUrl == 'list-sortiestocklogistique') {

                            $scope.pageChanged('sortiestocklogistique');
                        } else {
                            $scope.pageChanged('sortiestock');
                        }
                    }
                    else {
                        $scope.pageChanged(type);
                    }

                    $scope.showToast((!data.message ? (!send_dataObj.id ? 'AJOUT' : 'MODIFICATION') : ""), (!data.message ? "" : data.message), "success");

                    $("#modal_add" + (optionals.is_file_excel ? "list" : type)).modal('hide');
                    $scope.closeModal("#modal_add" + type)
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

        if (type == 'reclamation_commande' || type == 'reclamation_produit') {
            typeQuery = 'commande';
        }
        if (type == "commandeencour") {
            typeQuery = "commande";
            if ($scope.chstat.statut == 2) {
                msg = 'Voulez-vous vraiment réceptionné cette commande ?';
                title = 'Réception';

            } else if ($scope.chstat.statut == 1) {
                msg = 'Voulez-vous vraiment annuler la réceptionné?';
                title = 'Annulation';
            } else if ($scope.chstat.statut == 3) {
                msg = 'Voulez-vous commencer la prépration de la commande?';
                title = 'Préparation';
            } else if ($scope.chstat.statut == 4) {
                confirmation = false;
                msg = 'Préparation terminée?';
                title = 'Terminer';
            }
        }
        else if (type == 'reclamation_commande') {
            confirmation = false;
            msg = 'Reclamation de la commande';
            title = 'RECLAMATION';
        }
        else if (type == 'reclamation_produit') {
            confirmation = false;
            msg = 'Reclamation de produit';
            title = 'RECLAMATION';
        }
        else if (type.indexOf('creation_facture') !== -1) {
            msg = 'Voulez-vous créer la facture';
            title = 'FACTURE';
        }
        else if (type.indexOf('passer_barrane') !== -1) {
            msg = 'Voulez-vous le faire passer en barrane';
            title = 'COMMANDE';
        }
        else if (type == 'cloture_bce') {
            msg = 'Voulez-vous clôturer ce BCE';
            title = 'BCE';
        }
        else if (type == 'traiteur') {
            msg = $scope.chstat.statut == 2 ? 'Voulez-vous cloturer ce traiteur?' : 'Voulez-vous annuler la cloture? ';
            title = 'TRAITEUR';
        }
        else if (type == 'bt') {
            msg = $scope.chstat.statut == 0 ? 'Voulez-vous valider ce bon de transfert?' : 'Voulez-vous annuler la validation? ';
            title = 'Bon de transfert';
        }
        else if (type == 'commande') {
            if ($scope.chstat.title == 'Cloturé') {
                msg = 'Voulez-vous vraiment effectuer cette clôture ?';
                title = 'Clôture';
                title = $scope.chstat.title;
            }
        }
        else if (type == 'evenement') {
            msg = 'Voulez-vous terminer ce fait divers';
            title = 'Terminer';
        }
        else if (type == 'suivibanque') {
            if ($scope.chstat.statut == 0) {
                msg = 'Voulez-vous mettre en attente cette ligne';
                title = 'En attente';
            }
            else if ($scope.chstat.statut == 1) {
                msg = 'Voulez-vous valider cette ligne';
                title = 'Validation';
            }
            else if ($scope.chstat.statut == 2) {
                msg = 'Voulez-vous invalider cette ligne';
                title = 'Invalidation';
            }
        }
        else {
            msg = $scope.chstat.statut == 1 ? 'Voulez-vous vraiment effectuer cette désactivation ?' : 'Voulez-vous vraiment effectuer cette activation ?';
            title = $scope.chstat.statut == 1 ? 'DESACTIVATION' : 'ACTIVATION';
        }
        var send_data = {
            id: $scope.chstat.id,
            status: $scope.chstat.statut,
            substatut: $scope.chstat.substatut,
            commentaire: $('#commentaire_chstat').val(),
            objet: itemId,
            type: type
        };

        if (type == 'reclamation_produit' || type == 'commandeencour') {
            if ($scope.chstat.statut == 4 || $scope.chstat.statut == 7) {
                send_data.produit_id = $scope.chstat.id_secondaire;
                send_data.commande_produit_produit = false;
                if ($scope.chstat.id_detail_produit) {
                    send_data.id_detail_produit = $scope.chstat.id_detail_produit;
                    send_data.commande_produit_produit = true;
                }
                send_data.ressource = $scope.linknav;
            }
        }

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
                                if (type == "commandeencour") {
                                    console.log('Je suis un autre type 1: ', type);
                                    if (send_data.status == 4) {

                                        var reqwrite = "commandeproduits(commande_id:" + send_data.id + ",seconde_phase:true," + `,permission:"${$scope.permissionResources}"` + ")";
                                        var listeattributs = listofrequests_assoc["commandeproduits"];
                                        var listeattributs_filter = [];
                                        // console.log('------------Query commabde produit lance-------------');
                                        // console.log(reqwrite);
                                        // console.log(listeattributs);
                                        Init.getElement(reqwrite, listeattributs, listeattributs_filter).then(function (data) {
                                            if (data) {
                                                $scope.dataPage['commandeproduitencour'] = data;
                                            }
                                        })
                                    }
                                    $scope.pageChanged('commande-encour');
                                    $scope.pageChanged('commande-departement');
                                }
                                else if (type == "suivimarketing") {
                                    $scope.pageChanged("suivimarketing");
                                    $scope.pageChanged("suivimarketingvalide");
                                    $scope.pageChanged("suivimarketingnonvalide");
                                }
                                else if (type !== 'reclamation_commande' || type !== 'reclamation_produit') {
                                    $scope.pageChanged(type);
                                }

                                $scope.showToast(title, 'Réussie', 'success');

                            } else {
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

                        if (type == "commandeencour") {

                            if (send_data.status == 4) {

                                var reqwrite = "commandeproduits(commande_id:" + send_data.id + ",seconde_phase:true," + `,permission:"${$scope.permissionResources}"` + ")";
                                var listeattributs = listofrequests_assoc["commandeproduits"];
                                var listeattributs_filter = [];

                                Init.getElement(reqwrite, listeattributs, listeattributs_filter).then(function (data) {
                                    if (data) {
                                        $scope.dataPage['commandeproduitencour'] = [];
                                        $scope.dataPage['commandeproduitencour'] = data;
                                    }
                                })
                            }
                            $scope.pageChanged('commande-encour');
                            $scope.pageChanged('commande-departement');
                        }
                        else if (type == "suivimarketing") {
                            $scope.pageChanged("suivimarketing");
                            $scope.pageChanged("suivimarketingvalide");
                            $scope.pageChanged("suivimarketingnonvalide");
                        }
                        else if (type !== 'reclamation_commande' || type !== 'reclamation_produit') {
                            $scope.pageChanged(type);
                        }

                        $scope.showToast(title, 'Réussie', 'success');
                    }


                } else {
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
