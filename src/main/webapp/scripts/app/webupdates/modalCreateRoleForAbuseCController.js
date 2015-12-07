'use strict';

angular.module('webUpdates').controller('ModalCreateRoleForAbuseCController', [ '$scope', '$modalInstance', 'WhoisResources', 'RestService', 'source', 'maintainer',
    function ($scope, $modalInstance, WhoisResources, RestService, source, maintainer, passwords) {
        $scope.create = create;
        $scope.cancel = cancel;

        function create() {
            if(!(angular.isUndefined($scope.email) || $scope.email == '')) {
                var attributes = WhoisResources.wrapAndEnrichAttributes('role', newRoleTemplate);

                attributes.setSingleAttributeOnName('abuse-mailbox', $scope.email);
                attributes.setSingleAttributeOnName('e-mail', $scope.email);
                attributes.setSingleAttributeOnName('mnt-by', maintainer.value);

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
            'value' : 'some role'
        }, {
            'name' : 'address',
            'value' : 'Singel 258'
        }, {
            'name' : 'e-mail',
            'value' : 'fdsd@sdfsd.com'
        }, {
            'name' : 'abuse-mailbox',
            'value' : 'fdsd@sdfsd.com'
        }, {
            'name' : 'nic-hdl',
            'value' : 'AUTO-1'
        }, {
            'link' : {
                'type' : 'locator',
                'href' : 'http://rest-dev.db.ripe.net/ripe/mntner/MNT-THINK'
            },
            'name' : 'mnt-by',
            'value' : 'NINJA-SSO-MNT',
            'referenced-type' : 'mntner'
        }, {
            'name' : 'created',
            'value' : '2015-12-04T14:07:25Z'
        }, {
            'name' : 'last-modified',
            'value' : '2015-12-04T14:07:25Z'
        }, {
            'name' : 'source',
            'value' : 'RIPE'
        } ];

    }]);
