'use strict';

angular.module('dbWebApp')
.service('BackendService', ['$resource', function($resource) {
        var service = this;
        service.getUserMaintainers = getUserMaintainers;

        function getUserMaintainers() {

            //$resource('api/user/maintainers').get(function (resp) {
            //    $scope.maintainersOptions =  resp;
            //    var whoisResources = WhoisResources.wrapWhoisResources(resp);
            //    wrapAndEnrichAttributes(
            //        $scope.attributes.mergeSortAttributes('mnt-by', whoisResources.objectNamesAsAttributes('mnt-by'))
            //    );
            //})


            return [{name:'AAAA-MNT', extras:{'md5':true}}, {name:'BBBB-MNT', extras:{'pgp':true}}];
        }

}]);
