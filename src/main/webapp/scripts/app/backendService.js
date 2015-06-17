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


            return [
                {"value":"GROL2-MNT",   "extras":{"mine":true,"pgp":false,"sso":true,"md5":false}},
                {"value":"GROLSSO-MNT", "extras":{"mine":true,"pgp":false,"sso":true,"md5":true }},
                {"value":"GROLLO-MNT",  "extras":{"mine":true,"pgp":false,"sso":true,"md5":false}}
            ];
        }

}]);
