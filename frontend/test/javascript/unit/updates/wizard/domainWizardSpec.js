/*global afterEach, beforeEach, describe, inject, it*/

'use strict';

describe('The domain wizard', function () {

    var $scope, $state, $stateParams, $httpBackend, $window;
    var MessageStore;
    var WhoisResources;
    var CredentialsService;
    var MntnerService;
    var ModalService;
    var $q;

    beforeEach(module('dbWebApp'));

    beforeEach(inject(function (_$controller_, _$rootScope_, _$state_, _$stateParams_, _$httpBackend_, _$window_, _MessageStore_,
                                _WhoisResources_, _CredentialsService_, _MntnerService_, _ModalService_, _$q_, _PreferenceService_) {

        $scope = _$rootScope_.$new();
        $state = _$state_;
        $stateParams = _$stateParams_;
        $httpBackend = _$httpBackend_;
        $window = {
            confirm: function () {
                return true;
            }
        };
        MessageStore = _MessageStore_;
        WhoisResources = _WhoisResources_;
        CredentialsService = _CredentialsService_;
        MntnerService = _MntnerService_;
        ModalService = _ModalService_;
        $stateParams.objectType = 'domain';
        _PreferenceService_.isTextMode = function () {
            return false;
        };
        $q = _$q_;

        _$controller_('DomainObjectController', {
            $scope: $scope, $state: $state, $stateParams: $stateParams, $window: $window
        });
        $httpBackend.whenGET(/.*\.html/).respond(200);
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should not crash', function () {
        $httpBackend.flush();
    });

});
