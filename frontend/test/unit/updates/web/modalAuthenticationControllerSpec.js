/*global afterEach, beforeEach, describe, expect, inject, it, jasmine, module*/
'use strict';

describe('webUpdates: ModalAuthenticationComponent', function () {

    var $componentController, ctrl;
    var $log, WhoisResources, RestService, userInfoService, credentialsService, $httpBackend, properties;
    var mntners, mntnersWithoutPassword;
    var param, bindings;

    beforeEach(function () {
        module('webUpdates');
        inject(function (_$componentController_, _$log_,_WhoisResources_,_RestService_, _$httpBackend_,_UserInfoService_, _Properties_) {
            $log = _$log_;
            WhoisResources = _WhoisResources_;
            RestService = _RestService_;
            $httpBackend = _$httpBackend_;
            userInfoService = _UserInfoService_;
            properties = _Properties_;

            credentialsService = {
                setCredentials: jasmine.createSpy('credentialsService.setCredentials'),
                removeCredentials: jasmine.createSpy('credentialsService.removeCredentials'),
                hasCredentials: jasmine.createSpy('credentialsService.hasCredentials'),
                getCredentials: jasmine.createSpy('credentialsService.getCredentials')
            };

            $componentController = _$componentController_;
            mntners = [ {type:'mntner', key:'a-mnt', auth:['MD5-PW']}, {type:'mntner', name:'b-mnt', auth:['MD5-PW']} ];
            mntnersWithoutPassword = [ {type:'mntner', key:'z-mnt', auth:['SSO']} ];
            param = {
                $log: $log,
                WhoisResources:WhoisResources,
                RestService:RestService,
                UserInfoService:userInfoService,
                CredentialsService:credentialsService,
                properties: properties,
                };
            bindings = {
                close: jasmine.createSpy('modalInstance.close'),
                dismiss: jasmine.createSpy('modalInstance.dismiss'),
                resolve: {
                    method:'PUT', source: source, objectType: 'mntner', objectName: 'someName', mntners: mntners, mntnersWithoutPassword: mntnersWithoutPassword,
                    allowForcedDelete: false,
                    isLirObject: false
                }};

            $httpBackend.whenGET('api/whois-internal/api/user/info').respond({
                user: {
                    'username': 'dummy@ripe.net',
                    'displayName': 'Test User',
                    'uuid': 'aaaa-bbbb-cccc-dddd',
                    'active': 'true'
                }
            });

        });
    });

    it('should detect empty password', function () {
        ctrl = $componentController('modalAuthentication', param, bindings);
        ctrl.$onInit();
        ctrl.selected.item = {type: 'mntner', key: 'b-mnt'};
        ctrl.selected.password = '';
        ctrl.selected.associate = false;
        ctrl.ok();
        expect(ctrl.selected.message).toEqual('Password for mntner: \'b-mnt\' too short');
    });

    it('should detect invalid password', function () {
        ctrl = $componentController('modalAuthentication', param, bindings);
        ctrl.$onInit();
        ctrl.selected.item = { type:'mntner', key:'b-mnt'};
        ctrl.selected.password = 'secret';
        ctrl.selected.associate = false;

        $httpBackend.expectGET('api/whois/RIPE/mntner/b-mnt?password=secret&unfiltered=true').respond({
            objects: {
                object: [
                    {
                        source: { id:'RIPE'},
                        'primary-key': {attribute: [{name: 'mntner', value: 'b-mnt'}]},
                         attributes: {
                            attribute: [
                                {name: 'mntner', value: 'b-mnt'},
                                {name: 'mnt-by', value: 'b-mnt'},
                                {name: 'source', value: 'RIPE', comment:'Filtered'}
                            ]
                        }
                    }
                ]
            }
        });

        ctrl.ok();
        $httpBackend.flush();

        expect(ctrl.selected.message).toEqual('You have not supplied the correct password for mntner: \'b-mnt\'');

    });

    it('should close the modal and return selected item when ok', function () {
        ctrl = $componentController('modalAuthentication', param, bindings);
        ctrl.$onInit();
        ctrl.selected.item = { type:'mntner', key:'b-mnt'};
        ctrl.selected.password = 'secret';
        ctrl.selected.associate = false;

        $httpBackend.expectGET('api/whois/RIPE/mntner/b-mnt?password=secret&unfiltered=true').respond({
            objects: {
                object: [
                    {
                        source: { id:'RIPE'},
                        'primary-key': {attribute: [{name: 'mntner', value: 'b-mnt'}]},
                            attributes: {
                                attribute: [
                                    {name: 'mntner', value: 'b-mnt'},
                                    {name: 'mnt-by', value: 'b-mnt'},
                                    {name: 'source', value: 'RIPE'}
                                ]
                            }
                        }
                ]
            }
        });

        ctrl.ok();
        $httpBackend.flush();

        expect(credentialsService.setCredentials).toHaveBeenCalledWith( 'b-mnt', 'secret');

        expect(ctrl.close).toHaveBeenCalledWith( { $value: {selectedItem:{ type:'mntner', key:'b-mnt'}}} );
    });

    it('should associate and close the modal and return selected item when ok', function () {
        ctrl = $componentController('modalAuthentication', param, bindings);
        ctrl.$onInit();
        ctrl.selected.item = { type:'mntner', key:'b-mnt', auth: []};
        ctrl.selected.password = 'secret';
        ctrl.selected.associate = true;

        $httpBackend.expectGET('api/whois/RIPE/mntner/b-mnt?password=secret&unfiltered=true').respond({
            objects: {
                object: [
                    {
                        source: { id:'RIPE'},
                        'primary-key': {attribute: [{name: 'mntner', value: 'b-mnt'}]},
                        attributes: {
                            attribute: [
                                {name: 'mntner', value: 'b-mnt'},
                                {name: 'mnt-by', value: 'b-mnt'},
                                {name: 'source', value: 'RIPE'}
                            ]
                        }
                    }
                ]
            }
        });

        var resp = {
            objects: {
                object: [
                    {
                        'primary-key': {attribute: [{name: 'mntner', value: 'b-mnt'}]},
                        attributes: {
                            attribute: [
                                {name: 'mntner', value: 'b-mnt'},
                                {name: 'mnt-by', value: 'b-mnt'},
                                {name: 'auth',   value: 'SSO dummy@ripe.net'},
                                {name: 'source', value: 'RIPE'}
                            ]
                        }
                    }
                ]
            }
        };
        $httpBackend.expectPUT('api/whois/RIPE/mntner/b-mnt?password=secret').respond(resp);

        ctrl.ok();
        $httpBackend.flush();

        expect(credentialsService.setCredentials).toHaveBeenCalledWith( 'b-mnt', 'secret');
        expect(credentialsService.removeCredentials).toHaveBeenCalled( );

        expect(ctrl.close).toHaveBeenCalledWith({$value: { selectedItem:{type:'mntner', key:'b-mnt', auth: [ 'SSO' ], mine:true},
                                    response: jasmine.any(Object)}});
    });

    it('should close the modal and return error when canceled', function () {
        ctrl.cancel();
        expect(ctrl.dismiss).toHaveBeenCalled();
    });

    it('should set mntnersWithoutPassword to the scope', function () {
        expect(ctrl.resolve.mntnersWithoutPassword).toEqual(mntnersWithoutPassword);
    });

    xit('should allow force delete if objectType is inetnum', function () {
        ctrl.objectType = 'inetnum';
        expect(ctrl.allowForceDelete()).toBe(true);
    });

    xit('should allow force delete if objectType is inet6num', function () {
        ctrl.objectType = 'inet6num';
        expect(ctrl.allowForceDelete()).toBe(true);
    });

    xit('should allow force delete if objectType is route', function () {
        ctrl.objectType = 'route';
        expect(ctrl.allowForceDelete()).toBe(true);
    });

    xit('should allow force delete if objectType is route6', function () {
        ctrl.objectType = 'route6';
        expect(ctrl.allowForceDelete()).toBe(true);
    });

    xit('should allow force delete if objectType is domain', function () {
        ctrl.objectType = 'domain';
        expect(ctrl.allowForceDelete()).toBe(true);
    });

    it('should not allow force delete if objectType has no name', function () {
        ctrl.objectType = 'inetnum';
        delete ctrl.objectName;
        expect(ctrl.allowForceDelete()).toBe(false);
    });

    it('should not allow force delete if objectType has empty name', function () {
        ctrl.objectType = 'inetnum';
        ctrl.objectName = '';
        expect(ctrl.allowForceDelete()).toBe(false);
    });

    it('should not allow force delete if objectType has RIPE-NCC-END-MNT', function () {
        ctrl.objectType = 'inetnum';
        ctrl.mntners = [ {type:'mntner', key:'RIPE-NCC-END-MNT', auth:['MD5-PW']}, {type:'mntner', name:'b-mnt', auth:['MD5-PW']} ];
        expect(ctrl.allowForceDelete()).toBe(false);
    });
});
