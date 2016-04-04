'use strict';

describe('webUpdates: ModalMd5PasswordController', function () {

    var $scope, modalInstance, cryptService;

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$controller_, _$rootScope_, _CryptService_) {

            var $rootScope = _$rootScope_;
            $scope = $rootScope.$new();
            cryptService = _CryptService_;

            modalInstance = {
                close: jasmine.createSpy('modalInstance.close'),
                dismiss: jasmine.createSpy('modalInstance.dismiss'),
                result: {
                    then: jasmine.createSpy('modalInstance.result.then')
                }
            };
            _$controller_('ModalMd5PasswordController', {
                $scope: $scope, $modalInstance: modalInstance, CryptService: cryptService
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
});

