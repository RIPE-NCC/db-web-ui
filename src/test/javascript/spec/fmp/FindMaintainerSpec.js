'use strict';

describe('FindMaintainer', function () {
    var $rootScope, $scope, $window, $controller, $state, $httpBackend, Maintainer, Validate, SendMail, AlertService;
    var initialState;
    beforeEach(module('fmp'));

    beforeEach(inject(function (_$rootScope_, _$controller_, _$window_, _$httpBackend_, _$state_, _Maintainer_, _Validate_, _SendMail_, _AlertService_) {
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        $window = _$window_;
        $controller = _$controller_;
        $httpBackend = _$httpBackend_;
        $state = _$state_;
        AlertService = _AlertService_;
        Maintainer = _Maintainer_;
        Validate = _Validate_;
        SendMail = _SendMail_;

        $controller('FindMaintainerCtrl', {
            $scope: $scope,
            $window: $window,
            $state: $state,
            Maintainer: Maintainer,
            Validate: Validate,
            SendMail: SendMail,
            AlertService: AlertService
        });
        initialState = $state.current.name;

        $httpBackend.whenGET(/.*.html/).respond(200);
        $httpBackend.whenGET('api/user/info').respond(200);

        $httpBackend.flush();

    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should login first', function () {
        // TODO
    });

    it('should retrieve maintainer data', function () {
        $scope.maintainerKey = 'I-AM-MNT';
        $scope.selectMaintainer();

        $httpBackend.whenGET('api/whois-internal/api/fmp-pub/mntner/I-AM-MNT').respond({
            objects: {
                object: [{
                    'name': 'world',
                    attributes: {
                        attribute: [{name: 'mntner', value: 'I-AM-MNT'}, {
                            name: 'upd-to',
                            value: 'test@ripe.net'
                        }]
                    }
                }]
            }
        });
        $httpBackend.whenGET('api/whois-internal/api/fmp-pub/mntner/I-AM-MNT/validate').respond();
        $httpBackend.flush();

        expect($scope.mntnerFound).toBe(true);
        expect($scope.selectedMaintainer.name).toBe('world');
        expect($scope.email).toBe('test@ripe.net');

        expect(AlertService.getErrors().length).toBe(0);
        expect(AlertService.getWarnings().length).toBe(0);
        expect(AlertService.getInfos().length).toBe(0);

    });

    it('should not set a maintainer on not found', function () {
        $scope.maintainerKey = 'I-AM-NO-MNT';
        $scope.selectMaintainer();

        $httpBackend.whenGET('api/whois-internal/api/fmp-pub/mntner/I-AM-NO-MNT').respond(404);
        $httpBackend.flush();

        expect($scope.mntnerFound).toBe(false);
        expect($scope.selectedMaintainer).toBeUndefined();
        expect($scope.email).toBeUndefined();

        expect(AlertService.getErrors().length).toBe(1);
        expect(AlertService.getErrors()[0].plainText).toBe('The Maintainer could not be found.');
        expect(AlertService.getWarnings().length).toBe(0);
        expect(AlertService.getInfos().length).toBe(0);
    });

    it('should go to legacy when error validating enail', function () {
        $scope.maintainerKey = 'I-AM-MNT';
        $scope.selectMaintainer();

        $httpBackend.whenGET('api/whois-internal/api/fmp-pub/mntner/I-AM-MNT').respond({
            objects: {
                object: [{
                    'name': 'world',
                    attributes: {
                        attribute: [{name: 'mntner', value: 'I-AM-MNT'}, {
                            name: 'upd-to',
                            value: 'test@ripe.net'
                        }]
                    }
                }]
            }
        });
        $httpBackend.whenGET('api/whois-internal/api/fmp-pub/mntner/I-AM-MNT/validate').respond(400);
        $httpBackend.flush();

        expect($scope.mntnerFound).toBe(false);
        expect($scope.selectedMaintainer).toBeUndefined();
        expect($scope.email).toBeUndefined();

        expect(AlertService.getErrors().length).toBe(0);
        expect(AlertService.getWarnings().length).toBe(0);
        expect(AlertService.getInfos().length).toBe(0);

        expect($state.current.name).toBe('fmp.legacy');

    });


    it('should go to mailSent-page when email is successfully sent', function () {
        $scope.maintainerKey = 'I-AM-MNT';
        $scope.validateEmail();

        $httpBackend.whenPOST('api/whois-internal/api/fmp-pub/mntner/I-AM-MNT/emaillink.json').respond({
            mntner: 'WORLD',
            email: 'a@b.c'
        });
        $httpBackend.flush();

        expect(AlertService.getErrors().length).toBe(0);

        expect($state.current.name).toBe('fmp.mailSent');
    });

    it('should report error validating mail', function () {
        $scope.maintainerKey = 'I-AM-MNT';
        $scope.validateEmail();

        $httpBackend.whenPOST('api/whois-internal/api/fmp-pub/mntner/I-AM-MNT/emaillink.json').respond(500);
        $httpBackend.flush();

        expect(AlertService.getErrors().length).toBe(1);
        expect(AlertService.getErrors()[0].plainText).toBe('Error sending email');

        expect($state.current.name).toBe('fmp.legacy');

    });

});
