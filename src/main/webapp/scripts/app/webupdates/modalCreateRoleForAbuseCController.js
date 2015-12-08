'use strict';

angular.module('webUpdates').controller('ModalCreateRoleForAbuseCController', [ '$scope', '$modalInstance', 'WhoisResources', 'RestService', 'source', 'maintainers', 'passwords',
    function ($scope, $modalInstance, WhoisResources, RestService, source, maintainers, passwords) {
        $scope.create = create;
        $scope.cancel = cancel;
        $scope.isEmailValid = isEmailValid;

        var emailRegex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

        function create() {
            var attributes = WhoisResources.wrapAndEnrichAttributes('role', newRoleTemplate);

            attributes.setSingleAttributeOnName('abuse-mailbox', $scope.email);
            attributes.setSingleAttributeOnName('e-mail', $scope.email);
            attributes.setSingleAttributeOnName('source', source);

            attributes = WhoisResources.wrapAttributes(attributes);
            _.forEach(maintainers, function(mnt) {
                attributes = attributes.addAttributeAfterType({name: 'mnt-by', value: mnt.value}, {name: 'mnt-by'});
                attributes = WhoisResources.wrapAttributes(attributes);
            });

            attributes = WhoisResources.wrapAndEnrichAttributes('role', attributes.removeNullAttributes());
            RestService.createObject(source, 'role', WhoisResources.turnAttrsIntoWhoisObject(attributes), passwords).then(
                function(response) {
                    var whoisResources = WhoisResources.wrapWhoisResources(response);
                    $modalInstance.close(whoisResources.getAttributes());
                },
                function () {
                    return $modalInstance.dismiss('cancel');
                });
        }

        function isEmailValid() {
            console.log($scope.email);
            if (!(_.isUndefined($scope.email) || _.isEmpty($scope.email))) {
                return(validateEmail($scope.email));
            }
            else {
                return false;
            }
        }

        function validateEmail(email) {
            return emailRegex.test(email);
        }

        function cancel() {
            $modalInstance.dismiss('cancel');
        }

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
