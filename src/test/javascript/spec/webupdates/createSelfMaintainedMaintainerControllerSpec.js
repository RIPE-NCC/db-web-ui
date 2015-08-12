'use strict';

describe('webUpdates: CreateSelfMaintainedMaintainerController', function () {

    var $scope, $stateParams, WhoisResources, $httpBackend;

    var userInfo = {
        'username':'test@ripe.net',
        'displayName':'Test User',
        'expiryDate':'[2015,7,7,14,58,3,244]',
        'uuid':'aaaa-bbbb-cccc-dddd',
        'active':'true'
    };

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$controller_, _$rootScope_, _$stateParams_, _WhoisResources_, _$httpBackend_) {

            var $rootScope = _$rootScope_;
            $scope = $rootScope.$new();


            $httpBackend = _$httpBackend_;
            WhoisResources = _WhoisResources_;
            $stateParams = _$stateParams_;
            $stateParams.source = 'RIPE';

            var UserInfoService = {
                getUserInfo: function() {
                    return userInfo;
                }
            };

            _$controller_('CreateSelfMaintainedMaintainerController', {
                $scope: $scope, $stateParams: $stateParams, UserInfoService:UserInfoService
            });

            $httpBackend.whenGET(/.*.html/).respond(200);

            $httpBackend.flush();

        });
    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should load the maintainer attributes', function () {

        //I want this to look ugly.
        var attributes = WhoisResources.wrapAttributes(
            WhoisResources.enrichAttributesWithMetaInfo('mntner',
                WhoisResources.getMandatoryAttributesOnObjectType('mntner')
            )
        );

        expect($scope.maintainerAttributes).toEqual(attributes);
    });

    it('should set default upd-to info for the self maintained maintainer when submitting', function () {
        var updTo = WhoisResources.wrapAttributes($scope.maintainerAttributes).getSingleAttributeOnName('upd-to');

        $scope.submit();
        expect(updTo.value).toEqual('test@ripe.net');
    });

    it('should set default auth info for the self maintained maintainer when submitting', function () {
        var updTo = WhoisResources.wrapAttributes($scope.maintainerAttributes).getSingleAttributeOnName('auth');

        $scope.submit();
        expect(updTo.value).toEqual('SSO test@ripe.net');
    });

    it('should set source from the params when submitting', function () {
        var updTo = WhoisResources.wrapAttributes($scope.maintainerAttributes).getSingleAttributeOnName('source');

        $scope.submit();
        expect(updTo.value).toEqual('RIPE');
    });


});

