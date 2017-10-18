'use strict';

describe('webUpdates: ModalCreateRoleForAbuseCController', function () {

    var modalInstance, whoisResources, restService, password;
    var source = 'RIPE';
    var maintainers = [{type:'mntner', key:'a-mnt', auth:['MD5-PW']}, ({type:'mntner', key:'RIPE-NCC-HM-MNT'})];
    var controller;
    var $rootScope;
    var $httpBackend;

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$controller_, _$rootScope_, _WhoisResources_, _RestService_, $q, _$httpBackend_) {
            $rootScope = _$rootScope_;
            whoisResources = _WhoisResources_;
            $httpBackend = _$httpBackend_;

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
            controller = _$controller_('ModalCreateRoleForAbuseCController', {
                $scope: _$rootScope_.$new(), $uibModalInstance: modalInstance, WhoisResources: whoisResources, RestService: restService, source: source, maintainers: maintainers, passwords: password
            });

        });
    });

    afterEach(function() {
    });

    it('should create role with abuse-mailbox and close', function () {
        $httpBackend.expectGET('scripts/updates/web/select.html').respond({});
        $httpBackend.flush();

        controller.email = 'm@ripe.net';
        controller.create();
        $rootScope.$digest();

        expect(restService.createObject.calls.mostRecent().args[2].objects.object[0].attributes.attribute)
            .toContain(jasmine.objectContaining({
                name: 'abuse-mailbox',
                value: 'm@ripe.net'
        }));
        expect(modalInstance.close).toHaveBeenCalledWith('close');
    });

    it('should remove mnt-by: RIPE-NCC-HM-MNT from creating role', function () {
        $httpBackend.expectGET('scripts/updates/web/select.html').respond({});
        $httpBackend.flush();

        controller.email = 'm@ripe.net';
        controller.create();
        $rootScope.$digest();

        expect(restService.createObject.calls.mostRecent().args[2].objects.object[0].attributes.attribute)
            .not.toContain(jasmine.objectContaining({
                name: 'mnt-by',
                value: 'RIPE-NCC-HM-MNT'
        }));
        expect(modalInstance.close).toHaveBeenCalledWith('close');
    });

    it('should validate as valid email', function () {
        controller.email = 'm@ripe.net';
        expect(controller.isEmailValid()).toEqual(true);
    });

    it('should validate as invalid email', function () {
        controller.email = '@ripe.net';
        expect(controller.isEmailValid()).toEqual(false);
        controller.email = '.@ripe.net';
        expect(controller.isEmailValid()).toEqual(false);
        controller.email = 'a b@ripe.net';
        expect(controller.isEmailValid()).toEqual(false);
        controller.email = 'a@b@ripe.net';
        expect(controller.isEmailValid()).toEqual(false);
        controller.email = 'ab@ripe';
        expect(controller.isEmailValid()).toEqual(false);
        controller.email = 'a..b@ripe.web';
        expect(controller.isEmailValid()).toEqual(false);
        controller.email = '.bc@ripe.web';
        expect(controller.isEmailValid()).toEqual(false);
        controller.email = 'ab.@ripe.web';
        expect(controller.isEmailValid()).toEqual(false);
        controller.email = 'ab@ripe..web';
        expect(controller.isEmailValid()).toEqual(false);
        controller.email = 'ab.ripe.web';
        expect(controller.isEmailValid()).toEqual(false);
        controller.email = '';
        expect(controller.isEmailValid()).toEqual(false);
    });

    it('should cancel', function () {
        controller.cancel();
        expect(modalInstance.dismiss).toHaveBeenCalledWith('cancel');
    });
});

