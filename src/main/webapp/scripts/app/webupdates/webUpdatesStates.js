'use strict';

angular.module('webUpdates')
    .config(['$stateProvider', '$urlRouterProvider', '$urlMatcherFactoryProvider', '$locationProvider',
        function ($stateProvider, $urlRouterProvider, $urlMatcherFactory, $locationProvider) {

        /*
         * A dedicated data-type 'WhoisObjectName' is created for passing whois-object-names within urls.
         * This is to prevent that display and modify controller were started twice for objects with slash (route, inet6num).
         * This object-type is used within the configuration of the state-provider.
         */
        $urlMatcherFactory.type('WhoisObjectName',
            {
                name : 'WhoisObjectName',
                decode: function(val, key) {
                    return decodeURIComponent(val);
                },
                encode: function(val, key) {
                    return encodeURIComponent(val);
                },
                equals: function(decodedA, decodedB) {
                    if( decodedA.indexOf('/') > -1 ) {
                        decodedA = encodeURIComponent(decodedA);
                    }
                    if( decodedB.indexOf('/') > -1 ) {
                        decodedB = encodeURIComponent(decodedB);
                    }
                    return decodedA === decodedB;
                },
                is: function(decodedVal, key) {
                    return true;
                }
            });

        $urlRouterProvider.otherwise('webupdates/select');

        $stateProvider
            .state('createPersonMntnerPair', {
                url: '/webupdates/create/person/self',
                templateUrl: 'scripts/app/webupdates/createPersonMntnerPair.html',
                controller: 'CreatePersonMntnerPairController'
            })
            .state('displayPersonMntnerPair', {
                url: '/webupdates/display/:source/person/:person/mntner/:mntner',
                templateUrl: 'scripts/app/webupdates/displayPersonMntnerPair.html',
                controller: 'DisplayPersonMntnerPairController'
            })
            .state('createSelfMnt', {
                url: '/webupdates/create/:source/mntner/self?admin',
                templateUrl: 'scripts/app/webupdates/createSelfMaintainedMaintainer.html',
                controller: 'CreateSelfMaintainedMaintainerController'
            })
            .state('select', {
                url: '/webupdates/select',
                templateUrl: 'scripts/app/webupdates/select.html',
                controller: 'SelectController'
            })
            .state('create', {
                url: '/webupdates/create/:source/:objectType',
                templateUrl: 'scripts/app/webupdates/create.html',
                controller: 'CreateController'
            }).state('modify', {
                url: '/webupdates/modify/:source/:objectType/{name:WhoisObjectName}',
                templateUrl: 'scripts/app/webupdates/create.html',
                controller: 'CreateController'
            })
            .state('display', {
                url: '/webupdates/display/:source/:objectType/{name:WhoisObjectName}?method',
                templateUrl: 'scripts/app/webupdates/display.html',
                controller: 'DisplayController'
            })
            .state('delete', {
                url: '/webupdates/delete/:source/:objectType/{name:WhoisObjectName}?onCancel',
                templateUrl: 'scripts/app/webupdates/delete.html',
                controller: 'DeleteController'
            })
            .state('reclaimSelect', {
                url: '/webupdates/reclaimSelect',
                templateUrl: 'scripts/app/webupdates/reclaimSelect.html',
                controller: 'ReclaimSelectController'
            })
            .state('reclaim', {
                url: '/webupdates/reclaim/:source/:objectType/{name:WhoisObjectName}',
                templateUrl: 'scripts/app/webupdates/reclaim.html',
                controller: 'ReclaimController'
            });

            //$locationProvider.html5Mode(true);

    }]);
