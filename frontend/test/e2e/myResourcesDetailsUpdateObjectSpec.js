/*global beforeEach, browser, describe, expect, it, require */

// Local requires
var page = require('./homePageObject');


describe('My Resources, update object', function () {

    'use strict';

    beforeEach(function () {
        browser.get(browser.baseUrl);
        browser.get(browser.baseUrl + '#/myresources/detail/inetnum/192.87.0.0%20-%20192.87.255.255/');
    });

    it('allow editing of the object', function() {

        page.scrollIntoView(page.btnUpdateObjectButton);
        page.btnUpdateObjectButton.click();
        page.modalInpPassword.sendKeys('TPOL888-MNT');
        page.modalInpAssociate.click();
        page.modalBtnSubmit.click();
        expect(page.modal.isPresent()).toBe(false);
        expect(page.inpDescr.isPresent()).toBe(true);
        page.scrollIntoView(page.inpDescr);
        page.inpDescr.sendKeys('Updated test description');

        page.scrollIntoView(page.inpDescr);
        page.btnAddAnAttribute(page.inpDescr).click();
        page.scrollIntoView(page.modal);
        page.modalBtnSubmit.click();

        expect(page.inpDescr2.isPresent()).toBe(true);
        page.btnRemoveAttribute(page.inpDescr2).click();
        expect(page.inpDescr2.isPresent()).toBe(false);

        page.scrollIntoView(page.btnSubmitObject);
        page.btnSubmitObject.click();
        expect(page.successMessage.isPresent()).toBe(true);
    });

    describe('not comaintained by ripe', function () {

        beforeEach(function () {
            browser.get(browser.baseUrl + '#/myresources/detail/inetnum/3.0.103.0%2520-%25203.0.103.255/false');
        });

        it('can edit netname', function () {
            page.scrollIntoView(page.btnUpdateObjectButton);
            page.btnUpdateObjectButton.click();
            page.modalInpPassword.sendKeys('TPOLYCHNIA4-MNT');
            page.modalInpAssociate.click();
            page.modalBtnSubmit.click();
            expect(page.modal.isPresent()).toBe(false);

            // ensure netname is editable and edit it
            expect(page.woeNetname.getAttribute('disabled')).toBeFalsy();
            page.woeNetname.clear();
            page.woeNetname.sendKeys('some netname');

            // and check the value has changed correctly
            expect(page.woeNetname.getAttribute('value')).toBe('some netname');
        });

        it('can add org attribute', function () {
            page.scrollIntoView(page.btnUpdateObjectButton);
            page.btnUpdateObjectButton.click();
            page.modalInpPassword.sendKeys('TPOLYCHNIA4-MNT');
            page.modalInpAssociate.click();
            page.modalBtnSubmit.click();
            expect(page.modal.isPresent()).toBe(false);

            // add org attribute
            page.woeBtnAddAttribute.click();
            page.modalOrg.click();
            page.modalBtnSubmit.click();

            // and check it's there
            expect(page.woeOrg.isPresent()).toBe(true);
        });

    });

    it('should allow the user to add abuse-c', function(){
        page.scrollIntoView(page.btnUpdateObjectButton);
        page.btnUpdateObjectButton.click();
        page.modalInpPassword.sendKeys('TPOL888-MNT');
        page.modalInpAssociate.click();
        page.modalBtnSubmit.click();

        page.scrollIntoView(page.inpDescr);
        page.btnAddAnAttribute(page.inpDescr).click();
        page.scrollIntoView(page.modal);
        expect(page.selectFromList(page.modalAttributeList, 'no-such-attribute').isPresent()).toEqual(false);
        expect(page.selectFromList(page.modalAttributeList, 'abuse-c').isPresent()).toEqual(true);
    });
});
