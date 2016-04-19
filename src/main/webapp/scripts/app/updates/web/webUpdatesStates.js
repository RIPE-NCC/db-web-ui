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
                .state('webupdates.select', {
                    url: '/select',
                    templateUrl: 'scripts/app/updates/web/select.html',
                    controller: 'SelectController'
                })
                .state('webupdates.createPersonMntnerPair', {
                    url: '/create/person/self',
                    templateUrl: 'scripts/app/updates/web/createPersonMntnerPair.html',
                    controller: 'CreatePersonMntnerPairController'
                })
                .state('webupdates.displayPersonMntnerPair', {
                    url: '/display/:source/person/:person/mntner/:mntner',
                    templateUrl: 'scripts/app/updates/web/displayPersonMntnerPair.html',
                    controller: 'DisplayPersonMntnerPairController'
                })
                .state('webupdates.createSelfMnt', {
                    url: '/create/:source/mntner/self?admin',
                    templateUrl: 'scripts/app/updates/web/createSelfMaintainedMaintainer.html',
                    controller: 'CreateSelfMaintainedMaintainerController'
                })
                .state('webupdates.create', {
                    url: '/create/:source/:objectType?noRedirect',
                    templateUrl: 'scripts/app/updates/web/createModify.html',
                    controller: 'CreateModifyController'
                })
                .state('webupdates.modify', {
                    url: '/modify/:source/:objectType/{name:WhoisObjectName}?noRedirect',
                    templateUrl: 'scripts/app/updates/web/createModify.html',
                    controller: 'CreateModifyController'
                })
                .state('webupdates.display', {
                    url: '/display/:source/:objectType/{name:WhoisObjectName}?method',
                    templateUrl: 'scripts/app/updates/web/display.html',
                    controller: 'DisplayController'
                })
                .state('webupdates.delete', {
                    url: '/delete/:source/:objectType/{name:WhoisObjectName}?onCancel',
                    templateUrl: 'scripts/app/updates/web/delete.html',
                    controller: 'DeleteController'
                })
                .state('webupdates.forceDeleteSelect', {
                    url: '/forceDeleteSelect',
                    templateUrl: 'scripts/app/updates/web/forceDeleteSelect.html',
                    controller: 'ForceDeleteSelectController'
                })
                .state('webupdates.forceDelete', {
                    url: '/forceDelete/:source/:objectType/{name:WhoisObjectName}',
                    templateUrl: 'scripts/app/updates/web/forceDelete.html',
                    controller: 'ForceDeleteController'
                });

        }]);
