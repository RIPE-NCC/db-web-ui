'use strict';

module.exports = {
    selectForm: element(by.id('selectForm')),
    createForm: element(by.id('createForm')),
    textCreateForm: element(by.id('textCreateForm')),
    heading: element(by.id('createForm')).element(by.css('h1')),
    searchTextInput: element(by.id('searchtext')),
    selectMaintainerDropdown: element(by.id('selectMaintainerDropdown')),

    btnNavigateToCreate: element(by.id('btnNavigateToCreate')),
    btnCreateInTextArea: element(by.id('btnCreateInTextArea')),
    btnSwitchToWebCreate: element(by.id('btnSwitchToWebCreate')),
    //btnSwitchToTextCreate: element(by.id('btnSwitchToTextCreate')),
    //btnSwitchToTextModify: element(by.id('btnSwitchToTextModify')),
    //btnEditInTextArea: element(by.id('btnEditInTextArea')),

    inpOrgName: element(by.id('createForm')).element(by.name('org-name')),
    inpOrganisation: element(by.id('createForm')).element(by.name('organisation')),
    inpOrgType: element(by.id('createForm')).element(by.name('org-type')),
    inpAddress: element(by.id('createForm')).element(by.name('address')),
    inpEmail: element(by.id('createForm')).element(by.name('e-mail')),
    inpAbuseC: element(by.id('createForm')).element(by.name('abuse-c')),
    inpMntRef: element(by.id('createForm')).element(by.name('mnt-ref')),
    inpSource: element(by.id('createForm')).element(by.name('source')),
    btnAbuseCBell: element(by.id('createRoleForAbuseCAttribute')),

    modalEmail: element(by.css('[modal-window]')).element(by.name('email')),
    modalBtnSubmit: element(by.css('[modal-window]')).element(by.css('[value=Submit]')),

    selectObjectType: function(itemValue) {
        return element(by.id('objectTypeSelector')).element(by.css('option[label=' + itemValue + ']'));
    }
};
