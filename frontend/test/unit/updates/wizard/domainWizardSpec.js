/*global afterEach, beforeEach, describe, expect, inject, it*/

'use strict';

describe('The domain wizard', function () {

    var $scope, $state, $stateParams, $httpBackend, $window;
    var AttributeMetadataService;
    var $ctrl;

    beforeEach(module('dbWebApp'));

    beforeEach(inject(function (_$componentController_, _$rootScope_, _$state_, _$stateParams_, _$httpBackend_,
                                _PreferenceService_, _AttributeMetadataService_) {

        $scope = _$rootScope_.$new();
        $state = _$state_;
        $stateParams = _$stateParams_;
        $httpBackend = _$httpBackend_;
        $window = {
            confirm: function () {
                return true;
            }
        };
        AttributeMetadataService = _AttributeMetadataService_;
        $stateParams.objectType = 'prefix';
        _PreferenceService_.isTextMode = function () {
            return false;
        };

        var ModalService = {
            openDomainWizardSplash: function () { }
        };

        $ctrl = _$componentController_('domainObjectWizard', {
            $scope: $scope, $state: $state, $stateParams: $stateParams, $window: $window, AttributeMetadataService: AttributeMetadataService, ModalService: ModalService
        });
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should create the right attributes', function () {
        expect($ctrl.attributes.length).toEqual(9);
        var attrName = [
            'prefix',
            'nserver',
            'nserver',
            'reverse-zone',
            'admin-c',
            'tech-c',
            'zone-c',
            'mnt-by',
            'source'];
        for (var a in $ctrl.attributes) {
            expect($ctrl.attributes[a].name).toEqual(attrName[a]);
        }
    });

});
