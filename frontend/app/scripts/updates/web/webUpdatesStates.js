'use strict';

angular.module('webUpdates')
    .config(['$stateProvider', '$urlRouterProvider', '$urlMatcherFactoryProvider',
        function ($stateProvider, $urlRouterProvider, $urlMatcherFactory) {

            /*
             * A dedicated data-type 'WhoisObjectName' is created for passing whois-object-names within urls.
             * This is to prevent that display and modify controller were started twice for objects with slash (route, inet6num).
             * This object-type is used within the configuration of the state-provider.
             */
            $urlMatcherFactory.type('WhoisObjectName',
                {
                    name: 'WhoisObjectName',
                    decode: function (val) {
                        return decodeURIComponent(val);
                    },
                    encode: function (val) {
                        return encodeURIComponent(val);
                    },
                    equals: function (decodedA, decodedB) {
                        if (decodedA.indexOf('/') > -1 || decodedA.indexOf(' ') > -1) {
                            decodedA = encodeURIComponent(decodedA);
                        }

                        if (decodedB.indexOf('/') > -1 || decodedB.indexOf(' ') > -1) {
                            decodedB = encodeURIComponent(decodedB);
                        }

                        return decodedA === decodedB;
                    },
                    is: function () {
                        return true;
                    }
                });

            $urlRouterProvider.otherwise('webupdates/select');

            $stateProvider
                .state('webupdates', {
                    abstract: true,
                    url: '/webupdates',
                    template: '<div ui-view></div>'
                })
                .state('webupdates.myresources', {
                    url: '/myresources/overview',
                    templateUrl: 'scripts/myresources/overview.html',
                    controller: 'ResourcesController',
                    controllerAs: 'resources'
                })
                .state('webupdates.domainobjectwizard', {
                    url: '/wizard/:source/:objectType',
                    templateUrl: 'scripts/wizard/domainobjectwizard.html',
                    controller: 'DomainObjectController as domain'
                })
                .state('webupdates.displayDomainObjects', {
                    url: '/wizard/:source/:objectType/success',
                    templateUrl: 'scripts/wizard/displayDomainObjects.html',
                    controller: 'DisplayDomainObjectsController',
                    controllerAs: 'displayDomains'
                })
                .state('webupdates.select', {
                    url: '/select',
                    templateUrl: 'scripts/updates/web/select.html',
                    controller: 'SelectController'
                })
                .state('webupdates.createPersonMntnerPair', {
                    url: '/create/person/self',
                    templateUrl: 'scripts/updates/web/createPersonMntnerPair.html',
                    controller: 'CreatePersonMntnerPairController'
                })
                .state('webupdates.displayPersonMntnerPair', {
                    url: '/display/:source/person/:person/mntner/:mntner',
                    templateUrl: 'scripts/updates/web/displayPersonMntnerPair.html',
                    controller: 'DisplayPersonMntnerPairController'
                })
                .state('webupdates.createSelfMnt', {
                    url: '/create/:source/mntner/self?admin',
                    templateUrl: 'scripts/updates/web/createSelfMaintainedMaintainer.html',
                    controller: 'CreateSelfMaintainedMaintainerController'
                })
                .state('webupdates.create', {
                    url: '/create/:source/:objectType?noRedirect',
                    templateUrl: 'scripts/updates/web/createModify.html',
                    controller: 'CreateModifyController'
                })
                .state('webupdates.modify', {
                    url: '/modify/:source/:objectType/{name:WhoisObjectName}?noRedirect',
                    templateUrl: 'scripts/updates/web/createModify.html',
                    controller: 'CreateModifyController'
                })
                .state('webupdates.display', {
                    url: '/display/:source/:objectType/{name:WhoisObjectName}?method',
                    templateUrl: 'scripts/updates/web/display.html',
                    controller: 'DisplayController'
                })
                .state('webupdates.delete', {
                    url: '/delete/:source/:objectType/{name:WhoisObjectName}?onCancel',
                    templateUrl: 'scripts/updates/web/delete.html',
                    controller: 'DeleteController'
                })
                .state('webupdates.forceDeleteSelect', {
                    url: '/forceDeleteSelect',
                    templateUrl: 'scripts/updates/web/forceDeleteSelect.html',
                    controller: 'ForceDeleteSelectController'
                })
                .state('webupdates.forceDelete', {
                    url: '/forceDelete/:source/:objectType/{name:WhoisObjectName}',
                    templateUrl: 'scripts/updates/web/forceDelete.html',
                    controller: 'ForceDeleteController'
                });

        }]);
