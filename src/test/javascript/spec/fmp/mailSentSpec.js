'use strict';

describe('MailSentCtrl', function() {
    var $stateParams, $scope, $controller;

    beforeEach(module('fmp'));

    beforeEach(inject(function (_$rootScope_, _$controller_, _$stateParams_) {
        $scope = _$rootScope_.$new();
        $stateParams = _$stateParams_;
        $controller = _$controller_;
    }));

    it('should extract email from url params', function() {

        $stateParams.email = 'test@work.net';

        $controller('MailSentCtrl', {
            $scope:$scope,
            $stateParams: $stateParams
        });

        expect($scope.email).toBe('test@work.net');

    });
});
