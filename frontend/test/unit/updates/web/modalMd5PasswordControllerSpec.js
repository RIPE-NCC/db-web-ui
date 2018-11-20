/*global afterEach, beforeEach, describe, expect, inject, it, jasmine, module*/
'use strict';

describe('webUpdates: ModalMd5PasswordComponent', function () {

    var $componentController, cryptService, bindings, ctrl;

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$componentController_, _CryptService_) {

            cryptService = _CryptService_;

            $componentController = _$componentController_;
            bindings = {
                close: jasmine.createSpy('modalInstance.close'),
                dismiss: jasmine.createSpy('modalInstance.dismiss')};
        });
    });

    afterEach(function() {
    });

    it('should close the modal and return selected md5 value when ok', function () {
        ctrl = $componentController('modalMd5Password', cryptService, bindings);
        ctrl.password = '123';
        ctrl.passwordAgain = '123';
        ctrl.ok();
        expect(ctrl.close).toHaveBeenCalled( ); // md5 hash is unpredictable
    });

    it('should report error when passwords are empty', function () {
        ctrl = $componentController('modalMd5Password', cryptService, bindings);
        ctrl.password = '';
        ctrl.passwordAgain = '';
        ctrl.ok();
        expect(ctrl.authPasswordMessage).toEqual('Password too short!');
    });

    it('should report error when passwords are not equal', function () {
        ctrl = $componentController('modalMd5Password', cryptService, bindings);
        ctrl.password = '123';
        ctrl.passwordAgain = '1234';
        ctrl.ok();
        expect(ctrl.authPasswordMessage).toEqual('Passwords do not match!');
    });

    it('should report error the modal and return error when cancelled', function () {
        ctrl = $componentController('modalMd5Password', cryptService, bindings);
        ctrl.cancel();
        expect(ctrl.dismiss).toHaveBeenCalled();
    });
});

