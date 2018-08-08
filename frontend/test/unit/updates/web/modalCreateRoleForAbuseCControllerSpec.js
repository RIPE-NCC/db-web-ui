/*global afterEach, beforeEach, describe, expect, inject, it, jasmine, module*/
'use strict';

describe('webUpdates: ModalCreateRoleForAbuseCComponent', function () {

    var whoisResources, restService, password;
    var source = 'RIPE';
    var maintainers = [{type:'mntner', key:'a-mnt', auth:['MD5-PW']}, ({type:'mntner', key:'RIPE-NCC-HM-MNT'})];
    var $componentController, param, bindings, ctrl;
    var $rootScope;
    var $httpBackend;

    beforeEach(function () {
        module('webUpdates');
        inject(function (_$componentController_, _WhoisResources_, $q, _$rootScope_, _$httpBackend_) {
            $componentController = _$componentController_;
            whoisResources = _WhoisResources_;
            $rootScope = _$rootScope_;
            $httpBackend = _$httpBackend_;

            restService = {
                createObject: jasmine.createSpy('restService.createObject').and.returnValue($q.when({
                    getAttributes: function () { return "close" }
                }))
            };

            param = {
                WhoisResources: whoisResources,
                RestService: restService,
            };
            bindings = {
                close: jasmine.createSpy('modalInstance.close'),
                dismiss: jasmine.createSpy('modalInstance.dismiss'),
                resolve: {
                    maintainers: maintainers,
                    passwords: password,
                    source: source,
                }};
        });
    });

    afterEach(function() {
    });

    it('should create role with abuse-mailbox and close', function () {

        $httpBackend.expectGET('scripts/updates/web/select.html').respond({});
        $httpBackend.flush();

        ctrl = $componentController('modalCreateRoleForAbuseC', param, bindings);

        ctrl.email = 'm@ripe.net';
        ctrl.create();
        $rootScope.$digest();

        expect(restService.createObject.calls.mostRecent().args[2].objects.object[0].attributes.attribute)
            .toContain(jasmine.objectContaining({
                name: 'abuse-mailbox',
                value: 'm@ripe.net'
        }));
        expect(ctrl.close).toHaveBeenCalled();
    });

    it('should remove mnt-by: RIPE-NCC-HM-MNT from creating role', function () {
        $httpBackend.expectGET('scripts/updates/web/select.html').respond({});
        $httpBackend.flush();

        ctrl = $componentController('modalCreateRoleForAbuseC', param, bindings);

        ctrl.email = 'm@ripe.net';
        ctrl.create();
        $rootScope.$digest();

        expect(restService.createObject.calls.mostRecent().args[2].objects.object[0].attributes.attribute)
            .not.toContain(jasmine.objectContaining({
                name: 'mnt-by',
                value: 'RIPE-NCC-HM-MNT'
        }));
        expect(ctrl.close).toHaveBeenCalled();
    });

    it('should validate as valid email', function () {
        ctrl.email = 'm@ripe.net';
        expect(ctrl.isEmailValid()).toEqual(true);
    });

    it('should validate as invalid email', function () {
        ctrl.email = '@ripe.net';
        expect(ctrl.isEmailValid()).toEqual(false);
        ctrl.email = '.@ripe.net';
        expect(ctrl.isEmailValid()).toEqual(false);
        ctrl.email = 'a b@ripe.net';
        expect(ctrl.isEmailValid()).toEqual(false);
        ctrl.email = 'a@b@ripe.net';
        expect(ctrl.isEmailValid()).toEqual(false);
        ctrl.email = 'ab@ripe';
        expect(ctrl.isEmailValid()).toEqual(false);
        ctrl.email = 'a..b@ripe.web';
        expect(ctrl.isEmailValid()).toEqual(false);
        ctrl.email = '.bc@ripe.web';
        expect(ctrl.isEmailValid()).toEqual(false);
        ctrl.email = 'ab.@ripe.web';
        expect(ctrl.isEmailValid()).toEqual(false);
        ctrl.email = 'ab@ripe..web';
        expect(ctrl.isEmailValid()).toEqual(false);
        ctrl.email = 'ab.ripe.web';
        expect(ctrl.isEmailValid()).toEqual(false);
        ctrl.email = '';
        expect(ctrl.isEmailValid()).toEqual(false);
    });

    it('should cancel', function () {
        ctrl.cancel();
        expect(ctrl.dismiss).toHaveBeenCalled();
    });
});

