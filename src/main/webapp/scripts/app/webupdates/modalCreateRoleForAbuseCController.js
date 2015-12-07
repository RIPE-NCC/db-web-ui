'use strict';

angular.module('webUpdates').controller('ModalCreateRoleForAbuseCController', [ '$scope', '$modalInstance', 'WhoisResources', 'RestService', 'AlertService', 'source', 'maintainer', 'passwords',
    function ($scope, $modalInstance, WhoisResources, RestService, AlertService, source, maintainer, passwords) {
        $scope.create = create;
        $scope.cancel = cancel;
        $scope.isEmailValid = isEmailValid;

        function create() {
            var attributes = WhoisResources.wrapAndEnrichAttributes('role', newRoleTemplate);

            attributes.setSingleAttributeOnName('abuse-mailbox', $scope.email);
            attributes.setSingleAttributeOnName('e-mail', $scope.email);
            attributes.setSingleAttributeOnName('mnt-by', maintainer);
            attributes.setSingleAttributeOnName('source', source);

            RestService.createObject(source, 'role', WhoisResources.turnAttrsIntoWhoisObject(attributes), passwords)
                .then(function(response) {
                    var whoisResources = WhoisResources.wrapWhoisResources(response);


                    $modalInstance.close(whoisResources.getAttributes());
                },
                function () {
                    $modalInstance.dismiss('cancel');
                    AlertService.setGlobalError("There was a problem creating the abuse-c attribute");
                });
        };

        function isEmailValid() {
            console.log($scope.email);
            if(!(_.isUndefined($scope.email) || _.isEmpty($scope.email))) {
                // built in validation passes for 'a@a', also check for at least 1 '.' after @. Built in validation then correctly fails for a@a. since we need a char after
                if(_.includes($scope.email, '.')) {
                    return true;
                }
            }
            else {
                return false;
            }

        }
        function cancel() {
            $modalInstance.dismiss('cancel');
        };

        var newRoleTemplate = [ {
            'name' : 'role',
            'value' : 'Abuse contact role object'
        }, {
            'name' : 'address',
            'value' : '----'
        }, {
            'name' : 'e-mail'
        }, {
            'name' : 'abuse-mailbox'
        }, {
            'name' : 'nic-hdl',
            'value' : 'AUTO-1'
        }, {
            'name' : 'mnt-by'

        }, {
            'name' : 'source'
        }];
    }]);
