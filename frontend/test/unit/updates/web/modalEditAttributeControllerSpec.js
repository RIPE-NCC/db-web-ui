/*global beforeEach, describe, expect, inject, it, jasmine, module*/
'use strict';

describe('webUpdates: ModalEditAttributeController', function () {

    var $componentController, bindings, ctrl, $window, properties;

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$componentController_, _$window_, _Properties_) {

            $componentController = _$componentController_;

            bindings = {
                close: jasmine.createSpy('modalInstance.close'),
                dismiss: jasmine.createSpy('modalInstance.dismiss'),
                resolve: {
                    attr: {name:'address'},
                }
            };
            properties = _Properties_;
            $window = _$window_;
        });
    });

    it('should close the modal and open new tab with legal address details page', function () {
        spyOn($window, 'open');
        ctrl = $componentController('modalEditAttribute', {$window: $window}, bindings);
        ctrl.resolve.attr = { name: 'address' };
        ctrl.$onInit();
        expect(ctrl.attr).toEqual({ name: 'address' });
        ctrl.goToOrgaAddressEditor();
        expect(ctrl.$window.open).toHaveBeenCalledWith(properties.PORTAL_URL + '#/org-details-change/organisation-details', '_blank');
        expect(ctrl.close).toHaveBeenCalled();
        ctrl.$onInit();
        expect(ctrl.attr).toEqual({ name: 'address' });
        ctrl.goToAccountAddressEditor();
        expect(ctrl.$window.open).toHaveBeenCalledWith(properties.PORTAL_URL + '#/account-details#postalAddress', '_blank');
        expect(ctrl.close).toHaveBeenCalled();
    });

    it('should close the modal and open new tab with legal organisation details page', function () {
        spyOn($window, 'open');
        ctrl = $componentController('modalEditAttribute', {}, bindings);
        ctrl.resolve.attr = { name: 'org-name' };
        ctrl.$onInit();
        expect(ctrl.attr).toEqual({ name: 'org-name' });
        ctrl.goToOrgNameEditor();
        expect(ctrl.$window.open).toHaveBeenCalledWith(properties.PORTAL_URL + '#/org-details-change/organisation-details', '_blank');
        expect(ctrl.close).toHaveBeenCalled();
        ctrl.$onInit();
        expect(ctrl.attr).toEqual({ name: 'org-name' });
        ctrl.goToAccountOrgNameEditor();
        expect(ctrl.$window.open).toHaveBeenCalledWith(properties.PORTAL_URL + '#/account-details#organisationDetails', '_blank');
        expect(ctrl.close).toHaveBeenCalled();
    });

    it('should close the modal and open new tab with account details page for editing phone', function () {
        spyOn($window, 'open');
        ctrl = $componentController('modalEditAttribute', {}, bindings);
        ctrl.resolve.attr = { name: 'phone' };
        ctrl.$onInit();
        expect(ctrl.attr).toEqual({ name: 'phone' });
        ctrl.goToAccountContactInfoEditor();
        expect(ctrl.$window.open).toHaveBeenCalledWith(properties.PORTAL_URL + '#/account-details#contactInfo', '_blank');
        expect(ctrl.close).toHaveBeenCalled();
    });

    it('should close the modal and open new tab with account details page for editing fax-no', function () {
        spyOn($window, 'open');
        ctrl = $componentController('modalEditAttribute', {}, bindings);
        ctrl.resolve.attr = { name: 'fax-no' };
        ctrl.$onInit();
        expect(ctrl.attr).toEqual({ name: 'fax-no' });
        ctrl.goToAccountContactInfoEditor();
        expect(ctrl.$window.open).toHaveBeenCalledWith(properties.PORTAL_URL + '#/account-details#contactInfo', '_blank');
        expect(ctrl.close).toHaveBeenCalled();
    });

    it('should close the modal and open new tab with account details page for editing email', function () {
        spyOn($window, 'open');
        ctrl = $componentController('modalEditAttribute', {}, bindings);
        ctrl.resolve.attr = { name: 'e-mail' };
        ctrl.$onInit();
        expect(ctrl.attr).toEqual({ name: 'e-mail' });
        ctrl.goToAccountContactInfoEditor();
        expect(ctrl.$window.open).toHaveBeenCalledWith(properties.PORTAL_URL + '#/account-details#contactInfo', '_blank');
        expect(ctrl.close).toHaveBeenCalled();
    });
});
