'use strict';

angular.module('webUpdates')
    .config(['$stateProvider', '$urlRouterProvider', '$urlMatcherFactoryProvider',
        function ($stateProvider, $urlRouterProvider, $urlMatcherFactory) {

            /*
             * A dedicated data-type 'WhoisObjectName' is created for passing whois-object-names within urls.
             * This is to prevent that display and modify controller were started twice for objects with slash (route, inet6num).
             * This object-type is used within the configuration of the state-provider.
             */
            $urlMatcherFactory.type('WhoisObjectName', {
                name: 'WhoisObjectName',
                decode: function (val) {
                    return decodeURIComponent(val);
                },
                encode: function (val) {
                    if (val.indexOf('%') === -1) {
                        return encodeURIComponent(val);
                    }
                    return val;
                },
                equals: function (decodedA, decodedB) {
                    if (decodedA.indexOf(':') > -1 || decodedA.indexOf('/') > -1 || decodedA.indexOf(' ') > -1) {
                        decodedA = encodeURIComponent(decodedA);
                    }
                    if (decodedB.indexOf(':') > -1 || decodedB.indexOf('/') > -1 || decodedB.indexOf(' ') > -1) {
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
                .state('myresources', {
                    url: '/myresources/overview?type&sponsored&ipanalyserRedirect',
                    templateUrl: 'scripts/myresources/resources.html',
                    controller: 'ResourcesController',
                    controllerAs: 'resources'
                })
                .state('myresourcesdetail', {
                    url: '/myresources/detail/:objectType/{objectName:WhoisObjectName}/:sponsored',
                    templateUrl: 'scripts/myresources/resource-details.html',
                    controller: 'ResourceDetailsController',
                    controllerAs: 'resourceDetails'
                })
                .state('webupdates.domainobjectwizard', {
                    url: '/wizard/:source/:objectType',
                    templateUrl: 'scripts/wizard/domainobjectwizard.html',
                    controller: 'DomainObjectController',
                    controllerAs: 'domain'
                })
                .state('webupdates.displayDomainObjects', {
                    url: '/wizard/:source/:objectType/success',
                    template: '<display-domain-objects></display-domain-objects>'
                })
                .state('webupdates.select', {
                    url: '/select',
                    template: '<select-component></select-component>'
                })
                .state('webupdates.createPersonMntnerPair', {
                    url: '/create/person/self',
                    template: '<create-person-mntner-pair></create-person-mntner-pair>',
                })
                .state('webupdates.displayPersonMntnerPair', {
                    url: '/display/:source/person/:person/mntner/:mntner',
                    template: '<display-person-mntner-pair-component></display-person-mntner-pair-component>'
                })
                .state('webupdates.createSelfMnt', {
                    url: '/create/:source/mntner/self?admin',
                    template: '<create-self-maintained-maintainer-component></create-self-maintained-maintainer-component>',
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
                    template: '<display-component></display-component>'
                })
                .state('webupdates.delete', {
                    url: '/delete/:source/:objectType/{name:WhoisObjectName}?onCancel',
                    templateUrl: 'scripts/updates/web/delete.html',
                    controller: 'DeleteController'
                })
                .state('webupdates.forceDeleteSelect', {
                    url: '/forceDeleteSelect',
                    template: '<force-delete-select></force-delete-select>',
                })
                .state('webupdates.forceDelete', {
                    url: '/forceDelete/:source/:objectType/{name:WhoisObjectName}',
                    template: '<force-delete></force-delete>',
                })
                .state('lookup', {
                    url: '/lookup?source&key&type',
                    template: '<lookup-single></lookup-single>'
                })
                .state('query', {
                    url: '/query?searchtext&hierarchyFlag&inverse&types&bflag&dflag&rflag&source',
                    template: '<query></query>'
                })
                .state('syncupdates', {
                    url: '/syncupdates',
                    template: '<syncupdates></syncupdates>'
                })
                .state('fulltextsearch', {
                    url: '/fulltextsearch',
                    template: '<full-text-search></full-text-search>'
                });

        }]);
