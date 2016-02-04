'use strict';

describe('SsoAddedCtrl', function() {
    var $stateParams, $scope, $controller;

    beforeEach(module('fmp'));

    beforeEach(inject(function (_$rootScope_, _$controller_,_$stateParams_) {
        $scope = _$rootScope_.$new();
        $controller = _$controller_;
        $stateParams =_$stateParams_;

    }));

    it('should extract email from url params', function() {
        $stateParams.user = 'userX';


        $controller('SsoAddedCtrl', {
            $scope:$scope,
            $stateParams: $stateParams
        });

        expect($scope.user).toBe('userX');
    });
});
