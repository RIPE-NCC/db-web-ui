/*global beforeEach, describe, expect, inject, it, jasmine, module*/
'use strict';

describe('webUpdates: ModalAddAttributeController', function () {

    var $scope, modalInstance;
    var items;

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$controller_, _$rootScope_) {

            var $rootScope = _$rootScope_;
            $scope = $rootScope.$new();

            modalInstance = {
                close: jasmine.createSpy('modalInstance.close'),
                dismiss: jasmine.createSpy('modalInstance.dismiss'),
                result: {
                    then: jasmine.createSpy('modalInstance.result.then')
                }
            };
            items = [ {name:'a'}, {name:'b'} ];

            _$controller_('ModalAddAttributeController', {
                $scope: $scope, $uibModalInstance: modalInstance, items: function() { return items; }
            });

        });
    });

    it('should close the modal and return selected item when ok', function () {
        $scope.selected.item = { name:'b'};
        $scope.ok();
        expect(modalInstance.close).toHaveBeenCalledWith( { name:'b'} );

    });

    it('should close the modal and return error when canceled', function () {
        $scope.selected = 'b';
        $scope.cancel();
        expect(modalInstance.dismiss).toHaveBeenCalledWith("cancel");
    });


});

