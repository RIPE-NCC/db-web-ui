'use strict';

describe('webUpdates: TextCreateController', function () {

    var $scope, $state, $stateParams, $httpBackend;
    var WhoisResources;
    var SOURCE = 'RIPE';
    var OBJECT_TYPE = 'inetnum';
    var doCreateController;

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$controller_, _$rootScope_, _$state_, _$stateParams_, _$httpBackend_, _$window_,_MessageStore_, _WhoisResources_) {

            var $rootScope = _$rootScope_;
            $scope = $rootScope.$new();

            $state =  _$state_;
            $stateParams = _$stateParams_;
            $httpBackend = _$httpBackend_;
            WhoisResources = _WhoisResources_;

            var SOURCE = 'RIPE';

            doCreateController = function() {

                $stateParams.source = SOURCE;
                $stateParams.objectType = OBJECT_TYPE;
                $stateParams.name = undefined;

                _$controller_('TextCreateController', {
                    $scope: $scope, $state: $state, $stateParams: $stateParams
                });
            }

            $httpBackend.whenGET(/.*.html/).respond(200);

            $httpBackend.flush();

        });
    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should get parameters from url', function () {
        doCreateController();

        expect($scope.object.source).toBe(SOURCE);
        expect($scope.object.type).toBe(OBJECT_TYPE);
    });

    it('should populate rpsl based on object-type meta model and source', function () {
        doCreateController();

        expect($scope.object.rpsl).toEqual(
            'inetnum:       \n' +
            'netname:       \n' +
            'descr:         \n' +
            'country:       \n' +
            'admin-c:       \n' +
            'tech-c:        \n' +
            'status:        \n' +
            'mnt-by:        \n' +
            'source:        RIPE\n');

    });


});
