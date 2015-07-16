'use strict';

describe('webUpdates: ModalAuthenticationController', function () {

    var $scope, $log, modalInstance, WhoisResources, RestService, userInfoService, credentialsService, $httpBackend ;
    var source = 'RIPE'
    var mntners;

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$controller_, _$rootScope_, _$log_,_WhoisResources_,_RestService_, _$httpBackend_) {

            var $rootScope = _$rootScope_;
            $scope = $rootScope.$new();
            $log = _$log_;
            WhoisResources = _WhoisResources_;
            RestService = _RestService_;
            $httpBackend = _$httpBackend_;

            modalInstance = {
                close: jasmine.createSpy('modalInstance.close'),
                dismiss: jasmine.createSpy('modalInstance.dismiss'),
                result: {
                    then: jasmine.createSpy('modalInstance.result.then')
                }
            };
            userInfoService = {
                getUsername: function() {
                    return 'dummy@ripe.net';
                }
            };
            credentialsService = {
                setCredentials: jasmine.createSpy('credentialsService.setCredentials'),
                removeCredentials: jasmine.createSpy('credentialsService.removeCredentials'),
                hasCredentials: jasmine.createSpy('credentialsService.hasCredentials'),
                getCredentials: jasmine.createSpy('credentialsService.getCredentials')
            };

            mntners = [ {type:'mntner', key:'a-mnt', auth:['MD5-PW']}, {type:'mntner', name:'b-mnt', auth:['MD5-PW']} ];

            _$controller_('ModalAuthenticationController', {
                $scope: $scope, $log: $log, $modalInstance: modalInstance, WhoisResources:WhoisResources,
                RestService:RestService, UserInfoService:userInfoService, CredentialsService:credentialsService,
                source: source, mntners: function() { return mntners; }
            });

            $httpBackend.whenGET(/.*.html/).respond(200);

            $httpBackend.flush();

        });
    });

    afterEach(function() {
    });

    it('should detect empty password', function () {
        $scope.selected.item = {type: 'mntner', key: 'b-mnt'};
        $scope.selected.password = '';
        $scope.selected.associate = false;

        $scope.ok();
        expect($scope.selected.message).toEqual("Password for mntner: 'b-mnt' too short");
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

        expect($scope.selected.message).toEqual("You have not supplied the correct password for mntner: 'b-mnt'");

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

        expect(modalInstance.close).toHaveBeenCalledWith( { type:'mntner', key:'b-mnt'} );
    });

    it('should associate and close the modal and return selected item when ok', function () {
        $scope.selected.item = { type:'mntner', key:'b-mnt'};
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

        $httpBackend.expectPUT('api/whois/RIPE/mntner/b-mnt?password=secret').respond({
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
        });

        $scope.ok();
        $httpBackend.flush();

        expect(credentialsService.setCredentials).toHaveBeenCalledWith( 'b-mnt', 'secret');
        expect(credentialsService.removeCredentials).toHaveBeenCalled( );

        expect(modalInstance.close).toHaveBeenCalledWith( { type:'mntner', key:'b-mnt', mine:true} );
    });


    it('should close the modal and return error when canceled', function () {
        $scope.cancel();
        expect(modalInstance.dismiss).toHaveBeenCalledWith("cancel");
    });


});

