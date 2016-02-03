'use strict';

describe('FindMaintainer', function () {
    var $rootScope, $scope, Maintainer, Validate, SendMail, $window, $controller, $httpBackend;

    beforeEach(module('fmp'));

    beforeEach(inject(function (_$rootScope_, _$controller_, _$window_, _Maintainer_, _Validate_, _SendMail_, _$httpBackend_) {
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        Maintainer = _Maintainer_;
        Validate = _Validate_;
        SendMail = _SendMail_;
        $window = _$window_;
        $controller = _$controller_;
        $httpBackend = _$httpBackend_;

        $controller('FindMaintainerCtrl', {
            $scope: $scope,
            $window: $window,
            Maintainer: Maintainer,
            Validate: Validate,
            SendMail: SendMail
        });
        $httpBackend.whenGET(/.*.html/).respond(200);
        $httpBackend.flush();

    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should have a findMaintainer function', function () {
            expect($scope.selectMaintainer).toBeDefined();
        }
    );

    it('should have a validateEmail function', function () {
        expect($scope.validateEmail).toBeDefined();
    });

    it('should have a switchToManualResetProcess function', function () {
        expect($scope.switchToManualResetProcess).toBeDefined();
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

        expect($scope.selectedMaintainer.name).toBe('world');
        expect($scope.errorMessage).toBe(null);
    });

    it('should not set a maintainer on no result', function () {
        $scope.maintainerKey = 'I-AM-NO-MNT';
        $scope.selectMaintainer();

        $httpBackend.whenGET('api/whois-internal/api/fmp-pub/mntner/I-AM-NO-MNT').respond(404);
        $httpBackend.flush();

        expect($scope.selectedMaintainer).toBe(null);
        expect($scope.errorMessage).not.toBe(null);
    });

    it('should set email on send', function () {
        $scope.maintainerKey = 'I-AM-MNT';
        $scope.validateEmail();

        $httpBackend.whenPOST('api/whois-internal/api/fmp-pub/mntner/I-AM-MNT/emaillink.json').respond({
            mntner: 'WORLD',
            email: 'a@b.c'
        });
        $httpBackend.flush();

        expect($scope.infoMessage).toBe('a@b.c');
    });

    it('should set maintainer and email on validation', function () {
        $httpBackend.whenGET('api/whois-internal/fmp-pub/mntner/I-AM-MNT/validate').respond(200);
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

        expect($scope.infoMessage).toBe(null);
        expect($scope.errorMessage).toBe(null);
        expect($scope.selectedMaintainer.name).toBe('world');
    });

});
