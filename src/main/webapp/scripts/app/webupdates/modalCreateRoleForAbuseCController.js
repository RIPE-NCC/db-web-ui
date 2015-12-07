'use strict';

angular.module('webUpdates').controller('ModalCreateRoleForAbuseCController', [ '$scope', '$modalInstance', 'WhoisResources', 'RestService', 'source', 'maintainer', 'passwords',
    function ($scope, $modalInstance, WhoisResources, RestService, source, maintainer, passwords) {
        $scope.create = create;
        $scope.cancel = cancel;

        function create() {
            if(!(angular.isUndefined($scope.email) || $scope.email == '')) {
                var attributes = WhoisResources.wrapAndEnrichAttributes('role', newRoleTemplate);

                attributes.setSingleAttributeOnName('abuse-mailbox', $scope.email);
                attributes.setSingleAttributeOnName('e-mail', $scope.email);
                attributes.setSingleAttributeOnName('mnt-by', maintainer.value);
                attributes.setSingleAttributeOnName('source', source);

                RestService.createObject(source, 'role', WhoisResources.turnAttrsIntoWhoisObject(attributes), passwords)
                    .then(function(response) {
                        var whoisResources = WhoisResources.wrapWhoisResources(response);
                        $modalInstance.close(whoisResources.getAttributes());
                    },
                    function () {
                        alert('uhuuuuu error');
                    });
                console.log(JSON.stringify($scope.attributes));
            }
        };

        function cancel() {
            $modalInstance.dismiss('cancel');
        };

        var newRoleTemplate = [ {
            'name' : 'role',
            'value' : '----'
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
