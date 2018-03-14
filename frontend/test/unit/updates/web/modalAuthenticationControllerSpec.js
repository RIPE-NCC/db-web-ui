/*global afterEach, beforeEach, describe, expect, inject, it, jasmine, module*/
'use strict';

describe('webUpdates: ModalAuthenticationController', function () {

    var $scope, $log, modalInstance, WhoisResources, RestService, userInfoService, credentialsService, $httpBackend;
    var source = 'RIPE';
    var mntners, mntnersWithoutPassword;

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$controller_, _$rootScope_, _$log_,_WhoisResources_,_RestService_, _$httpBackend_,_UserInfoService_) {

            $scope = _$rootScope_.$new();
            $log = _$log_;
            WhoisResources = _WhoisResources_;
            RestService = _RestService_;
            $httpBackend = _$httpBackend_;
            userInfoService = _UserInfoService_;

            modalInstance = {
                close: jasmine.createSpy('modalInstance.close'),
                dismiss: jasmine.createSpy('modalInstance.dismiss'),
                result: {
                    then: jasmine.createSpy('modalInstance.result.then')
                }
            };

            credentialsService = {
                setCredentials: jasmine.createSpy('credentialsService.setCredentials'),
                removeCredentials: jasmine.createSpy('credentialsService.removeCredentials'),
                hasCredentials: jasmine.createSpy('credentialsService.hasCredentials'),
                getCredentials: jasmine.createSpy('credentialsService.getCredentials')
            };

            mntners = [ {type:'mntner', key:'a-mnt', auth:['MD5-PW']}, {type:'mntner', name:'b-mnt', auth:['MD5-PW']} ];
            mntnersWithoutPassword = [ {type:'mntner', key:'z-mnt', auth:['SSO']} ];

            _$controller_('ModalAuthenticationController', {
                $scope: $scope, $log: $log, $uibModalInstance: modalInstance, WhoisResources:WhoisResources,
                RestService:RestService, UserInfoService:userInfoService, CredentialsService:credentialsService,
                method:'PUT', source: source, objectType: 'mntner', objectName: 'someName', mntners: mntners, mntnersWithoutPassword: mntnersWithoutPassword,
                allowForcedDelete: false,
                isLirObject: false
            });

            $httpBackend.whenGET(/.*.html/).respond(200);

            $httpBackend.whenGET('api/whois-internal/api/user/info').respond({
                user: {
                    'username': 'dummy@ripe.net',
                    'displayName': 'Test User',
                    'uuid': 'aaaa-bbbb-cccc-dddd',
                    'active': 'true'
                }
            });

            $httpBackend.flush();

        });
    });

    it('should detect empty password', function () {
        $scope.selected.item = {type: 'mntner', key: 'b-mnt'};
        $scope.selected.password = '';
        $scope.selected.associate = false;

        $scope.ok();
        expect($scope.selected.message).toEqual('Password for mntner: \'b-mnt\' too short');
    });

    it('should detect invalid password', function () {
        $scope.selected.item = { type:'mntner', key:'b-mnt'};
        $scope.selected.password = 'secret';
        $scope.selected.associate = false;

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

        $scope.ok();
        $httpBackend.flush();

        expect($scope.selected.message).toEqual('You have not supplied the correct password for mntner: \'b-mnt\'');

    });

    it('should close the modal and return selected item when ok', function () {
        $scope.selected.item = { type:'mntner', key:'b-mnt'};
        $scope.selected.password = 'secret';
        $scope.selected.associate = false;

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

        $scope.ok();
        $httpBackend.flush();

        expect(credentialsService.setCredentials).toHaveBeenCalledWith( 'b-mnt', 'secret');

        expect(modalInstance.close).toHaveBeenCalledWith( {selectedItem:{ type:'mntner', key:'b-mnt'}} );
    });

    it('should associate and close the modal and return selected item when ok', function () {
        $scope.selected.item = { type:'mntner', key:'b-mnt', auth: []};
        $scope.selected.password = 'secret';
        $scope.selected.associate = true;

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

        $scope.ok();
        $httpBackend.flush();

        expect(credentialsService.setCredentials).toHaveBeenCalledWith( 'b-mnt', 'secret');
        expect(credentialsService.removeCredentials).toHaveBeenCalled( );

        expect(modalInstance.close).toHaveBeenCalledWith( { selectedItem:{type:'mntner', key:'b-mnt', auth: [ 'SSO' ], mine:true},
                                    response: jasmine.any(Object)} );
    });


    it('should close the modal and return error when canceled', function () {
        $scope.cancel();
        expect(modalInstance.dismiss).toHaveBeenCalledWith('cancel');
    });

    it('should set mntnersWithoutPassword to the scope', function () {
        expect($scope.mntnersWithoutPassword).toEqual(mntnersWithoutPassword);
    });

    xit('should allow force delete if objectType is inetnum', function () {
        $scope.objectType = 'inetnum';
        expect($scope.allowForceDelete()).toBe(true);
    });

    xit('should allow force delete if objectType is inet6num', function () {
        $scope.objectType = 'inet6num';
        expect($scope.allowForceDelete()).toBe(true);
    });

    xit('should allow force delete if objectType is route', function () {
        $scope.objectType = 'route';
        expect($scope.allowForceDelete()).toBe(true);
    });

    xit('should allow force delete if objectType is route6', function () {
        $scope.objectType = 'route6';
        expect($scope.allowForceDelete()).toBe(true);
    });

    xit('should allow force delete if objectType is domain', function () {
        $scope.objectType = 'domain';
        expect($scope.allowForceDelete()).toBe(true);
    });

    it('should not allow force delete if objectType has no name', function () {
        $scope.objectType = 'inetnum';
        delete $scope.objectName;
        expect($scope.allowForceDelete()).toBe(false);
    });

    it('should not allow force delete if objectType has empty name', function () {
        $scope.objectType = 'inetnum';
        $scope.objectName = '';
        expect($scope.allowForceDelete()).toBe(false);
    });

    it('should not allow force delete if objectType has RIPE-NCC-END-MNT', function () {
        $scope.objectType = 'inetnum';
        $scope.mntners = [ {type:'mntner', key:'RIPE-NCC-END-MNT', auth:['MD5-PW']}, {type:'mntner', name:'b-mnt', auth:['MD5-PW']} ];
        expect($scope.allowForceDelete()).toBe(false);
    });

});

