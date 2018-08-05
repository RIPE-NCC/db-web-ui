/*global beforeEach, describe, expect, inject, it, jasmine, module*/
'use strict';

describe('webUpdates: ModalAddAttributeComponent', function () {

    var $componentController, bindings, ctrl;

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$componentController_) {

            $componentController = _$componentController_;

            bindings = {
                close: jasmine.createSpy('modalInstance.close'),
                dismiss: jasmine.createSpy('modalInstance.dismiss'),
                resolve: {
                    items: [ {name:'a'}, {name:'b'} ],
                }
            }
        });
    });

    it('should close the modal and return selected item when ok', function () {
        ctrl = $componentController('modalAddAttribute', {}, bindings);
        ctrl.$onInit();
        ctrl.selected.item = {$value:{name:'b'}};
        ctrl.ok();
        expect(ctrl.close).toHaveBeenCalledWith({name:'b'});

    });

    it('should close the modal and return error when canceled', function () {
        ctrl = $componentController('modalAddAttribute', {}, bindings);
        ctrl.$onInit();
        ctrl.selected = 'b';
        ctrl.cancel();
        expect(ctrl.dismiss).toHaveBeenCalled();
    });
});
