'use strict';

describe('webUpdates: ModalCreateRoleForAbuseCController', function () {

    var $scope, modalInstance, whoisResources, restService, maintainers, password;
    var source = 'RIPE';
    var maintainers = [{type:'mntner', key:'a-mnt', auth:['MD5-PW']}];

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$controller_, _$rootScope_, _WhoisResources_, _RestService_, $q) {
            $scope = _$rootScope_.$new();
            whoisResources = _WhoisResources_;

            restService = {
                createObject: jasmine.createSpy('restService.createObject').and.returnValue($q.when({
                    getAttributes: function () { return "close" }
                }))
            };

            modalInstance = {
                close: jasmine.createSpy('modalInstance.close'),
                dismiss: jasmine.createSpy('modalInstance.dismiss'),
                result: {
                    then: jasmine.createSpy('modalInstance.result.then')
                }
            };
            _$controller_('ModalCreateRoleForAbuseCController', {
                $scope: $scope, $uibModalInstance: modalInstance, WhoisResources: whoisResources, RestService: restService, source: source, maintainers: maintainers, passwords: password
            });

        });
    });

    afterEach(function() {
    });

    it('should create role with abuse-mailbox and close', function () {
        $scope.email = 'm@ripe.net';
        $scope.create();
        expect(restService.createObject.calls.mostRecent().args[2].objects.object[0].attributes.attribute)
            .toContain(jasmine.objectContaining({
                name: 'abuse-mailbox',
                value: 'm@ripe.net'
        }));
        $scope.$digest();
        expect(modalInstance.close).toHaveBeenCalledWith('close');
    });

    it('should validate as valid email', function () {
        $scope.email = 'm@ripe.net';
        expect($scope.isEmailValid()).toEqual(true);
    });

    it('should validate as invalid email', function () {
        $scope.email = '@ripe.net';
        expect($scope.isEmailValid()).toEqual(false);
        $scope.email = '.@ripe.net';
        expect($scope.isEmailValid()).toEqual(false);
        $scope.email = 'a b@ripe.net';
        expect($scope.isEmailValid()).toEqual(false);
        $scope.email = 'a@b@ripe.net';
        expect($scope.isEmailValid()).toEqual(false);
        $scope.email = 'ab@ripe';
        expect($scope.isEmailValid()).toEqual(false);
        $scope.email = 'a..b@ripe.web';
        expect($scope.isEmailValid()).toEqual(false);
        $scope.email = '.bc@ripe.web';
        expect($scope.isEmailValid()).toEqual(false);
        $scope.email = 'ab.@ripe.web';
        expect($scope.isEmailValid()).toEqual(false);
        $scope.email = 'ab@ripe..web';
        expect($scope.isEmailValid()).toEqual(false);
        $scope.email = 'ab.ripe.web';
        expect($scope.isEmailValid()).toEqual(false);
    });

    it('should cancel', function () {
        $scope.cancel();
        expect(modalInstance.dismiss).toHaveBeenCalledWith('cancel');
    });
});

