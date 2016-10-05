/*global angular*/

(function () {
    'use strict';
    //Testing **The Amazing deployment**
    angular.module('webUpdates')
        .directive('attributetransformer', ['$log', function ($log) {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function (scope, elem, attrs, ngModel) {

                    function doTransform(viewValue) {
                        var transformed = viewValue;
                        // $log.info('name:' + attrs.name + ' with value ' + viewValue);

                        // TODO we could also uniformize inetnum with slash notation and inet6nums
                        if (attrs.name === 'inetnum' && viewValue) {
                            // Add spaces around inetnum to make sure auto-complete service can find it
                            var addresses = viewValue.split('-');
                            if (addresses.length === 2) {
                                transformed = _.trim(addresses[0]) + ' - ' + _.trim(addresses[1]);
                            }
                        }
                        return transformed;
                    }

                    ngModel.$parsers.push(doTransform);
                }
            };
        }]);
})();
