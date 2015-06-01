'use strict';

describe('webUpdates: CreateController', function() {

    var $scope, $state, $httpBackend, whoisRestService;
    var OBJECT_TYPE = 'someType';
    var SOURCE = 'source';

    beforeEach(function() {
        module('webUpdates');

        inject(function ($controller, $rootScope, _$httpBackend_, _$state_, _$stateParams_) {
            $httpBackend = _$httpBackend_;
            $state = _$state_;
            $scope = $rootScope.$new();

            _$stateParams_.objectType = OBJECT_TYPE;
            _$stateParams_.source = SOURCE;

            var whoisMetaService = {};
            whoisMetaService.getMandatoryAttributesOnObjectType = function() {
                return [
                    { "name":"someName", "mandatory":true, "multiple":false, "description":"Just an Attr"}
                ];
            };

            $controller('CreateController', {$scope: $scope, $state: $state, $stateParams:_$stateParams_, WhoisMetaService:whoisMetaService});

            $httpBackend.whenGET('scripts/app/webupdates/select.html').respond(200);
            $httpBackend.flush();
        });
    });

    it('should get objectType from url', function() {
        expect($scope.objectType).toBe(OBJECT_TYPE);
    });

    it('should get source from url', function() {
        expect($scope.source).toBe(SOURCE);
    });

    //it('should get roas and store a copy as originalRoas', function() {
    //    $scope.validateForm = function(){ return true; }
    //    spyOn(whoisRestService, 'createObject');
    //    $scope.submit();
    //    expect(whoisRestService.createObject).toHaveBeenCalled();
    //});

});
