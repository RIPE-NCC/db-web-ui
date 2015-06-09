'use strict';

describe('webUpdates: SelectController', function () {

    var $scope, $state, $stateParams;
    var OBJECT_TYPE = 'as-block';
    var SOURCE = 'RIPE';

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$controller_, _$rootScope_, _$state_, _$stateParams_) {

            var $rootScope = _$rootScope_;
            $scope = $rootScope.$new();

            $state =  _$state_;
            $stateParams = _$stateParams_;

            _$controller_('SelectController', {
                $scope: $scope, $state: $state, $stateParams: $stateParams
            });

        });
    });

    afterEach(function() {
    });

    it('should navigate to create screen', function () {

        $scope.navigateToCreate();

        // TODO fix
        //expect($state.current.name).toBe('create');
        //expect($stateParams.source).toBe(SOURCE);
        //expect($stateParams.objectType).toBe(OBJECT_TYPE);
    });

});

