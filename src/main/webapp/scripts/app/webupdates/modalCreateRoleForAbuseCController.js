'use strict';

angular.module('webUpdates').controller('ModalCreateRoleForAbuseCController', [ '$scope', '$modalInstance', 'WhoisResources', 'RestService', 'source',
    function ($scope, $modalInstance, WhoisResources, RestService, source) {
        $scope.create = create;
        $scope.cancel = cancel;

        function create() {
            var attributes = WhoisResources.wrapAndEnrichAttributes('role', newRoleTemplate);

            //replace emails

            RestService.createObject(source, 'role', WhoisResources.turnAttrsIntoWhoisObject(attributes), [])
                .then(function(response) {
                    var whoisResources = WhoisResources.wrapWhoisResources(response);
                    $modalInstance.close(whoisResources.getAttributes());
                },
                function () {
                    alert('uhuuuuu error');
                });

            console.log(JSON.stringify($scope.attributes));

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
            'value' : 'MNT-THINK',
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
