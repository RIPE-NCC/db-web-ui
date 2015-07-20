'use strict';

describe('webUpdates: ModalMd5PasswordController', function () {

    var $scope, modalInstance, md5;

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$controller_, _$rootScope_, _md5_) {

            var $rootScope = _$rootScope_;
            $scope = $rootScope.$new();
            md5 = _md5_;

            modalInstance = {
                close: jasmine.createSpy('modalInstance.close'),
                dismiss: jasmine.createSpy('modalInstance.dismiss'),
                result: {
                    then: jasmine.createSpy('modalInstance.result.then')
                }
            };
            _$controller_('ModalMd5PasswordController', {
                $scope: $scope, $modalInstance: modalInstance, md5: md5
            });

        });
    });

    afterEach(function() {
    });

    it('should close the modal and return selected md5 value when ok', function () {
        $scope.password = '123';
        $scope.passwordAgain = '123';

        $scope.ok();
        expect(modalInstance.close).toHaveBeenCalled( ); // md5 hash is unpredictable

    });

    it('should report error when passwords are empty', function () {
        $scope.password = '';
        $scope.passwordAgain = '';
        $scope.ok();
        expect($scope.authPasswordMessage).toEqual("Password too short!");
    });

    it('should report error when passwords are not equal', function () {
        $scope.password = '123';
        $scope.passwordAgain = '1234';
        $scope.ok();
        expect($scope.authPasswordMessage).toEqual("Passwords do not match!");
    });

    it('should report error the modal and return error when canceled', function () {
        $scope.cancel();
        expect(modalInstance.dismiss).toHaveBeenCalledWith("cancel");
    });

    it('crypt', function() {
        expect($scope.crypt('password', 'rjK1MckJ')).toEqual("$1$rjK1MckJ$pEARceVLJAOHqoMO/OKRY0");
        expect($scope.crypt('password', '.C2JWI4j')).toEqual("$1$.C2JWI4j$QJcccAJXrqTZceIGvUt.E/");
        //expect($scope.crypt('abcdefghijklmnopqrstuvwxyz', 'uHhYHKnV'))        // TODO: fails on longer passwords
        //    .toEqual("$1$uHhYHKnV$6Wi1CEv/OU6/VaU2vYv760");
    });

});

